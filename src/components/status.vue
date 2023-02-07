<template>
  <div>
  <a-card :title="status.name" :bordered="false" style="background:#ECECEC;margin:10px;">
    <a-collapse> 
        <a-collapse-panel header="详情">
                <div v-for="(value, index) in status.values" :key="value._id">
                    <a-row>
                        <a-col :span="20">
                            <a-input
                            :defaultValue="value.value"
                            @change="e=>onValueChange(e.target.value, index)"
                            addonBefore="状态名"
                            >
                            </a-input>
                        </a-col>
                        <a-col :span="4">
                            <a-button 
                            type="danger" 
                            shape="circle"
                            size="small"
                            icon="close"
                            @click="e=>removeStatus(index)"
                            ghost
                            >
                            </a-button>
                        </a-col>
                    </a-row>
                    <a-divider dashed/>
                    <statusCondition 
                    :conditionOptions="conditionOptions"
                    :docOptions="docOptions"
                    :elementOptions="elementOptions"
                    :docCascader="docCascader"
                    :sourceMapObj="sourceMapObj"
                    :extraMapObj="extraMapObj"
                    :condition="value.condition"
                    :apiNames="apiNames"
                    >
                    </statusCondition>
                </div>
        </a-collapse-panel>
    </a-collapse>
  <template slot="actions" class="ant-card-actions">
        <a-icon key="add" type="plus-circle" @click="addStatus"/>
        <a-icon key="setting" type="save" @click="saveStatus"/>
        <a-icon key="delete" type="delete" @click="deleteStatus"/>
  </template>
  </a-card>
  </div>
</template>
<script>
    //import { EventBus } from '../lib/event-bus.js'; //全局事件总线
    import StatusCondition from './statusCondition'

  export default {
    data() {
      return {
          status: {},
          showDetail: false,
          tempData: '',
          statusOptions: [
              {
                  value: "none",
                  label: "无需判断"
              },
              {
                  value: "hasDoc",
                  label: "通过是否有数据判断"
              },
              {
                  value: "keyEval",
                  label: "通过数据特征判断"
              },
              {
                  value: "apiValidate",
                  label: "通过接口返回判断"
              }
          ]
      };
    },
    props: ['appId', 'statusObj', 'conditionOptions', 'docOptions', 'elementOptions', 'docCascader', 'sourceMapObj','extraMapObj','apiNames'],
    components:{
        statusCondition: StatusCondition
    },
    methods:{
        onValueChange(value, index){
            if(!this.status.values.map(item=>item.value).includes(value)){
                this.status.values[index].value = value;
            }else{
                this.$message.error('状态名不能重复')
            }
        },
        removeStatus(index){
            this.status.values.splice(index,1);
            this.$forceUpdate();
        },
        deleteTag(){
        },
        onStatusNameChange(e, value){
            value.value = e.target.value;
        },
        onConditionTypeChange(selected, value){
            value.condition.conditionType = selected;
        },
        onDataFocus(target){
            this.tempData = target.value;
        },
        onDataConfirm(target, index){
            if(!target.value){
                this.status.values.splice(index,1);
                return;
            }
            try{
                this.status.values[index] = JSON.parse(target.value)
            }catch(e){
                target.value = this.tempData;
            }
        },
        addStatus(){
            if(!this.status.values.map(item=>item.value).includes("新状态")){
                this.status.values.push({
                    value: "新状态",
                    isDefault: true,
                    condition: {
                        conditionType: "none"
                    }
                });
            }
        },
        deleteStatus(){
            
        },
        async saveStatus(){
            console.log(this.status);
            delete this.status.updated;
            if(!this.status.app_oid){
                this.status.app_oid = this.appId;
            }
            return this.instance
            .post(
            `/private/consultModulation/statusConfig/update`,
            {
                status_id: this.status._id,
                status: this.status
            }
            )
            .then(response => {
                let result = response.data;
                if(result.result){
                    if(result.data){
                        this.$message.info(`更新状态 ${result.data.name} 成功`);
                    }else{
                        this.$message.info(`新建状态 ${this.status.name} 成功`);
                    }
                }
            })
            .catch(function (error) { // 请求失败处理
                console.log(error);
            });
        }
    },
    mounted(){
        //注册事件监听
        this.status = this.statusObj;
    }
  };
</script>