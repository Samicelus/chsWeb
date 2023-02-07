<template>
  <div>
    <a-divider orientation="left">模块配置</a-divider>
    <a-row type="flex" align="top">
        <a-col :span="6" v-for="(item, index) in modules" :key="index">
            <module 
            :moduleObj="item" 
            :dependencyOptions="dependencyOptions" 
            :moduleIndex="index"></module>
        </a-col>
    </a-row>
    <a-divider orientation="left">状态配置</a-divider>
    <a-row>
        <a-col :span="12" v-for="state in status" :key="state._id">
            <status 
            :appId="appId" 
            :statusObj="state"
            :conditionOptions="conditionOptions"
            :docOptions="docOptions"
            :elementOptions="elementOptions"
            :docCascader="docCascader"
            :sourceMapObj="sourceMapObj"
            :extraMapObj="extraMapObj"
            :apiNames="apiNames"
            >
            </status>
        </a-col>
        <a-col :span="8">
            <a-input
            v-if="inputVisible"
            ref="input"
            type="text"
            size="small"
            :style="{ width: '78px' }"
            :value="inputValue"
            @change="handleInputChange"
            @blur="handleInputConfirm"
            @keyup.enter="handleInputConfirm"
            />
            <a-tag v-else @click="showInput" style="background: #fff; borderStyle: dashed;
            margin-top: 100px">
                <a-icon type="plus" /> 新增状态
            </a-tag>
        </a-col>
    </a-row>
    <a-row>
      <a-col :span="8">
      </a-col>
      <a-col :span="8">
      </a-col>
      <a-col :span="8">
            <a-button @click="showData">显示数据</a-button>
      </a-col>
    </a-row>
  </div>
</template>
<script>
    //import { EventBus } from '../lib/event-bus.js'; //全局事件总线
    import Module from './module'
    import Status from './status'
    import lodash from 'lodash'

    const failStrMap = {
        "ErrorNotOngoingConsult": "咨询不在进行状态",
        "ErrorConsultClosed": "咨询已关闭",
        "ErrorConsultCanceled": "咨询已取消",
        "ErrorNotValidConsult": "咨询无效",
        "ErrorRecordAlreadyAuthed": "病历已经审核",
        "ErrorNoAdvicePower": "没有开处方的权限",
        "ErrorRecordNotAuthed": "没有已审核的就诊记录",
        "ErrorNotEnoughStorage": "药品库存不足",
        "ErrorNoAdmId": "尚未挂号",
        "ErrorConsultTotalAdvicesPrice": "总处方金额达到上限"
    }

  export default {
    data() {
      return {
        modules: [],
        status:[],
        dependencyOptions:[],
        inputVisible: false,
        inputValue: '',
        conditionType: {},
        docMap:{},
        elementMap:{},
        sourceMapObj:{},
        elementOptions: [],
        conditionOptions:[],
        docOptions:[],
        extraMapObj:{},
        docCascader:{},
        lodash,
        apiNames:[],
      };
    },
    components:{
      module: Module,
      status: Status
    },
    computed:{
    },
    props: ['appId'],
    methods:{
        fetchModules(params = {}) {
            console.log('params:', params);
            this.loading = true;
            this.instance
            .get(
            '/private/consultModulation/moduleConfig',
            {params}
            )
            .then(response => {
            this.modules = response.data.list;
            })
            .catch(function (error) { // 请求失败处理
            console.log(error);
            });
        },
        fetchStatus(params = {}) {
            console.log('params:', params);
            this.loading = true;
            this.instance
            .get(
            '/private/consultModulation/statusConfig',
            {params}
            )
            .then(response => {
            this.status = response.data.list;
            let that = this;
            const failStrOption = [];
            for(let failStr in failStrMap){
                failStrOption.push({
                    label: failStrMap[failStr],
                    value: failStr,
                    isLeaf: true
                })
            }
            this.status.forEach(status=>{
                let tempOption = {
                    label: status.name,
                    value: status.name,
                    isLeaf: false,
                    children:[]
                }
                status.values.forEach(value=>{
                    tempOption.children.push({
                        label: value.value,
                        value: value.value,
                        isLeaf: false,
                        children: failStrOption
                    })
                })
                that.dependencyOptions.push(tempOption);
            })
            })
            .catch(function (error) { // 请求失败处理
            console.log(error);
            });
        },
        async fetchDocMap(){
            console.log(`getting sourceMap...`);
            return this.instance
            .get(
            '/private/consultModulation/docMap'
            )
            .then(response => {
                let result = response.data;
                this.conditionType = result.conditionType;
                for(let typeName in this.conditionType){
                    this.conditionOptions.push({
                        label: this.conditionType[typeName],
                        value: typeName
                    })
                }
                this.sourceMapObj = result.source;
                this.docMap = result.doc;
                let that = this;
                for(let docName in this.docMap){
                    this.docOptions.push({
                        label: this.docMap[docName].name,
                        value: docName
                    })
                    if(this.docMap[docName].extras && this.docMap[docName].extras.length>0){
                        this.extraMapObj[docName] = this.docMap[docName].extras.map(item=>{
                            return {
                                label: item.name,
                                value: JSON.stringify(that.lodash.flatten(that.lodash.toPairs(item.extra)))
                            }
                        })
                    }
                    if(this.docMap[docName].populate){
                        this.docCascader[docName]=formPopulateOption(this.docMap[docName].populate);
                    }
                }
                this.elementMap = result.elements;
                for(let elementName in this.elementMap){
                    this.elementOptions.push({
                        label: this.elementMap[elementName],
                        value: elementName
                    });
                }

                this.$forceUpdate();
            })
            .catch(function (error) { // 请求失败处理
                console.log(error);
            });
        },
        showData(){
            console.log(JSON.parse(JSON.stringify(this.modules)));
            console.log(JSON.parse(JSON.stringify(this.status)));
        },
        showInput(){
            this.inputVisible = true;
            this.$nextTick(function() {
                this.$refs.input.focus();
            });
        },
        handleInputChange(e) {
            this.inputValue = e.target.value;
        },
        handleInputConfirm() {
            if(this.inputValue){
                this.status.push({
                    name: this.inputValue,
                    values: []
                })
            }
            Object.assign(this, {
                inputVisible: false,
                inputValue: '',
            });
        },
        getApiNames(){
            this.instance
            .get(
            '/private/consultModulation/apiConfig',
            {params:{app_id: this.appId}}
            )
            .then(response => {
                this.apiNames = response.data.list.map(item=>{
                    return {
                        label: item.name,
                        value: item.name
                    }
                });
                console.log(this.apiNames);
                this.$forceUpdate();
            })
            .catch(function (error) { // 请求失败处理
                console.log(error);
            });
        }
    },
    mounted(){
      //注册事件监听
      if(this.appId){
        console.log(`app_id: ${this.appId}`);
        this.fetchModules({
          app_id: this.appId
        })
        this.fetchStatus({
          app_id: this.appId
        })
      }else{
          console.log(`no appId presented!`)
      }
      this.fetchDocMap();
      this.getApiNames();
    }
  };

    function formPopulateOption(populate){
      let options = [];
      for(let population of populate){
          let tempOption = {
              label: population.name,
              value: population.path
          };
          if(population.populate){
              tempOption.children = formPopulateOption(population.populate)
          }
          options.push(tempOption);
      }
      return options;
  }
</script>