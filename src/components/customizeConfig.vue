<template>
  <div>
    <a-modal title="添加参数" v-model="showModal" @ok="addParam" okText="添加" cancelText="取消">
        <a-input-group>
            <a-input
            @change="e=>judgeKeyExistence(e.target.value)"
            addonBefore="key"
            style="width:25%"
            ></a-input>
            <a-input
            @change="e=>onNameChange(e.target.value)"
            addonBefore="设置名称"
            style="width:40%"
            ></a-input>
            <a-textarea
            @change="e=>onDefaultChange(e.target.value)"
            :auto-size="{ minRows: 3, maxRows: 5 }"
            style="width:35%;text-align:left"
            ></a-textarea>
        </a-input-group>
    </a-modal>
    <a-card>
        <div>
            <div v-for="(config, key) in data.config" :key="config.key">
                <a-input-group>
                    <a-icon  
                    type="minus-circle" 
                    @click="e=>deleteParam(key)"
                    style="color:red;font-size:20px;margin:5px">
                    </a-icon>
                    <a-input 
                    :defaultValue="key"
                    addonBefore="key"
                    style="width:25%"
                    disabled
                    >
                    </a-input>
                    <a-input 
                    :defaultValue="config.name"
                    addonBefore="设置名称"
                    style="width:40%"
                    @change="e=>changeConfigName(e.target.value, key)"
                    >
                    </a-input>
                    <a-textarea 
                    :defaultValue="config.default"
                    :auto-size="{ minRows: 3, maxRows: 5 }"
                    style="width:30%;text-align:left"
                    @change="e=>changeConfigDefault(e.target.value, key)"
                    >
                    </a-textarea>
                </a-input-group>
            </div>
        </div>
        <template slot="actions" class="ant-card-actions">
            <a-icon key="add" type="plus-circle" @click="addParamInfo"/>
            <a-icon key="setting" type="save" @click="saveConfig"/>
        </template>
    </a-card>
  </div>
</template>

<script>
    //import { EventBus } from '../lib/event-bus.js'; //全局事件总线

  export default {
    data() {
      return {
          showModal: false,
          tempKey: '',
          tempName: '',
          tempDefault: '',
          data: {
              config:{}
          }
      };
    },
    components:{
    },
    computed:{
    },
    props: ['appId'],
    methods:{
        addParamInfo(){
            this.showModal = true;
        },
        judgeKeyExistence(value){
            if(Object.keys(this.data.config).includes(value)){
                this.$message.error(`该key值已存在！`);
            }else{
                this.tempKey = value;
            }
        },
        onNameChange(value){
            this.tempName = value;
        },
        onDefaultChange(value){
            this.tempDefault = value;
        },
        addParam() {
            this.showModal = false;
            if(Object.keys(this.data.config).includes(this.tempKey)){
                this.$message.error(`该key值已存在！`);
            }else{
                this.data.config[this.tempKey] = {
                    name: this.tempName,
                    key: this.tempKey,
                    default: this.tempDefault
                }
            }
        },
        deleteParam(key){
            delete this.data.config[key];
            this.$forceUpdate();
        },
        saveConfig() {
            let data = {
                app_id: this.appId,
                config: this.data
            }
            if(!data.config.app_oid){
                data.config.app_oid = this.appId
            }
            this.instance
            .post(
            `/private/consultModulation/customizeConfig/update`,
            data
            )
            .then(response => {
                let customizeConfig = response.data.data;
                console.log(customizeConfig);
                this.$message.info('更新成功!')
            })
            .catch(function (error) { // 请求失败处理
            console.log(error);
            });
        },
        changeConfigName(value, key){
            this.data.config[key].name = value;
        },
        changeConfigDefault(value, key){
            this.data.config[key].default = value;
        },
        fetch(){
            this.instance
            .get(
            `/private/consultModulation/customizeConfig?app_id=${this.appId}`,
            )
            .then(response => {
                let customizeConfig = response.data.data;
                if(customizeConfig){
                    this.data = customizeConfig;
                    if(!this.data.config){
                        this.data.config = {};
                    }
                } 
            })
            .catch(function (error) { // 请求失败处理
            console.log(error);
            });
        }
    },
    created(){
    },
    mounted(){
      //注册事件监听
      this.fetch()
    }
  };
</script>