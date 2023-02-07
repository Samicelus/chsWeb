<template>
  <div>
    <a-row>
        <a-col :span="16">
            <a-input-search
            placeholder="搜索目标医院，应用，处理人"
            @search="onSearch"
            />
        </a-col>
    </a-row>
    <a-divider />
    <a-table
    size="small"
      :columns="columns" 
      :data-source="data"
      :rowKey="item => item._id"
      :pagination="pagination"
      :loading="loading"
      :locale="{filterConfirm:'确认',filterReset:'重置'}"
      @change="handleTableChange"
    >
      <span slot="time" slot-scope="record">
        <p v-if="record.iflow_oid">{{record.iflow_oid.title}}</p>
        <p v-if="record.handler_oid">{{record.handler_oid.nickname}}</p>
        <p>{{record.created}}</p>
      </span>
      <span slot="tags" slot-scope="flowResult">
        <a-row>
            <a-col :span="24">
            <a-tooltip>
                <template slot="title" v-if="flowResult.success != true" >
                    <p>{{flowResult.error}}</p>
                </template>
                <a-icon 
                :type="flowResult.success === true? 'check-circle':'close-circle'"
                theme="twoTone"
                :two-tone-color="flowResult.success === true? '#52c41a':'#eb2f96'"
                style="font-size: 28px;"
                >
                </a-icon>
            </a-tooltip>
            </a-col>
        </a-row>
      </span>
      <span slot="target" slot-scope="record">
            <a-tag v-if="record.company_oid" color="orange">
            {{record.company_oid.company_name}}
            </a-tag>
            <a-tag v-if="record.smartApp_oid" color="cyan">
            {{record.smartApp_oid.name}}
            </a-tag>
      </span>
      <span slot="totalTime" slot-scope="record">
        <p>{{record.totalTime? record.totalTime+' ms':''}}</p>
      </span>
      <span slot="process" slot-scope="process">
        <div v-if="process">
                <a-tag color="orange" style="margin-top:5px">
                    开始
                </a-tag>
            <span v-for="state in process" :key="state._id">
                <a-icon type="right" style="margin-top:5px"></a-icon>
                <a-tag :color="processMap[state.state?state.state:state].color" style="margin-top:5px">
                    {{`${processMap[state.state?state.state:state].name}${typeof state.time == 'number'?'\r'+state.time+'ms':''}`}}
                </a-tag>
            </span>
        </div>
      </span>
      <div slot="expandedRowRender" slot-scope="record">
        <a-row>
            <a-col :span="5">
                <p>流程数据</p>
                <a-divider dashed/>
                <pre v-if="record.iflow_oid" v-html="syntaxHighlight(record.iflow_oid.user_list)" class="formated-json"></pre>
            </a-col>
            <a-col :span="7">
                <p>发送数据</p>
                <a-divider dashed/>
                <pre v-if="record.data" v-html="syntaxHighlight(record.data)" class="formated-json"></pre>
            </a-col>
            <a-col :span="5">
                <p>命中判断</p>
                <a-divider dashed/>
                <pre v-if="record.hitRegex" v-html="syntaxHighlight(record.hitRegex)" class="formated-json"></pre>
            </a-col>
            <a-col :span="7">
                <p>下一步流程</p>
                <a-divider dashed/>
                <pre v-if="record.nextStep_oid" v-html="record.nextStep_oid.step_name" class="formated-json"></pre>
            </a-col>
        </a-row>
      </div>
    </a-table>
  </div>
</template>
<script>
  //import { EventBus } from '../lib/event-bus.js'; //全局事件总线
    import moment from 'moment';
    moment.locale('zh-cn');
    import _ from 'lodash';
    import vkbeautify from 'vkbeautify'

  const columns = [
    {
        title: '流程标题/处理人/审核时间',
        width: '15%',
        key: 'handler',
        scopedSlots: { customRender: 'time' },
    },
    {
        title: '推送结果',
        dataIndex: 'flowResult',
        width: '10%',
        key: 'success',
        scopedSlots: { customRender: 'tags' }
    },
    {
        title: '目标应用',
        width: '20%',
        key: 'target',
        scopedSlots: { customRender: 'target' }
    },
    {
        title: '耗时',
        width: '5%',
        key: 'totalTime',
        scopedSlots: { customRender: 'totalTime' }
    },
    {
        title: '执行过程',
        dataIndex: 'process',
        width: '50%',
        scopedSlots: { customRender: 'process' }
    }
  ];

  export default {
    data() {
      return {
        currentSearch: "",
        onlyTimeout: false,
        name:"",
        testParam:{},
        tempParamStr:"",
        test: false,
        testResult:{},
        showResult: false,
        moment,
        vkbeautify,
        data: [],
        pagination: {},
        loading: false,
        columns,
        processMap: {
            newFlow:{
                name: "发起流程",
                color: "yellow" 
            },
            checkData:{
                name: "数据检查",
                color: "cyan"
            },
            powerCheck:{
                name: "权限检查",
                color: "cyan"
            },
            endCheck:{
                name: "流程结束检查",
                color: "cyan"
            },
            getCurrentStep:{
                name: "获取当前步骤",
                color: "blue"
            },
            saveHandleHistory:{
                name: "保存处理历史记录",
                color: "green"
            },
            changeNextHandler:{
                name: "计算下一节点处理人",
                color: "green"
            },
            changeOwners:{
                name: "记录流程经手人",
                color: "green"
            },
            setOtherStepHandler:{
                name: "设置其他节点处理人",
                color: "green"
            },
            getApp:{
                name: "获取应用信息",
                color: "blue"
            },
            getRefs:{
                name: "获取数据映射",
                color: "blue"
            },
            getHandleData:{
                name: "获取流程处理数据",
                color: "blue"
            },
            getAllSteps:{
                name: "获取所有流程步骤",
                color: "blue"
            },
            approverLogic:{
                name: "审核人计算逻辑",
                color: "green"
            },
            setAgent:{
                name: "设置代理人",
                color: "green"
            },
            autoRun:{
                name: "节点自动去重逻辑",
                color: "green"
            },
            modifyCurrentStep:{
                name: "改变当前节点处理人数",
                color: "green"
            },
            sendToFollower:{
                name: "推送消息给关注人",
                color: "orange"
            },
            saveHandleData:{
                name: "保存流程处理数据",
                color: "green"
            },
            clearHandlerNum:{
                name: "重置当前节点处理人数",
                color: "green"
            },
            beforeEndSpecial:{
                name: "结束前特殊处理逻辑",
                color: "orange"
            },
            sendNotice:{
                name: "推送消息给经手人",
                color: "orange"
            },
            sendAlert:{
                name: "推送消息给审核人",
                color: "orange"
            },
            specialProcess: {
                name: "特殊处理流程",
                color: "orange"
            },
            pushPatient: {
                name: "推送转诊消息给患者",
                color: "orange"
            },
            herpSpecial: {
                name: "华四物资领用流程与herp对接",
                color: "orange"
            },
            handleLastHook: {
                name: "唤起钩子函数",
                color: "orange"
            },
            openSpecialProcess: {
                name: "开通问诊流程特殊处理",
                color: "orange"
            },
            propagateSpecialProcess: {
                name: "宣传工作流程特殊处理",
                color: "orange"
            },
            innerSpecialProcess: {
                name: "省中医内部发文流程特殊处理",
                color: "orange"
            },
            referralInSpecial: {
                name: "转入特殊流程处理",
                color: "orange"
            },
            serviceTask: {
                name: "自动调用服务",
                color: "orange"
            },
            referralOutSpecial: {
                name: "转出特殊流程处理",
                color: "orange"
            },
            setTimeout: {
                name: "设置自动通过时间",
                color: "orange"
            },
            sendToUnhandler: {
                name: "推送消息给上一步未处理人",
                color: "orange"
            },
            endIflow: {
                name: "结束流程",
                color: "purple"
            },
            pushAlreadyHandler: {
                name: "记录已处理人",
                color: "green"
            },
            purchaseApplySpecial: {
                name: "华西口腔申购特殊处理",
                color: "orange"
            },
            getEquipmentSpecial: {
                name: "设备采购流程特殊处理",
                color: "orange"
            },
            referSpecial: {
                name: "转发文流程特殊处理",
                color: "orange"
            },
            calculateNextStep: {
                name: "计算下一步流转方向",
                color: "green"
            },
            formHandleOperation: {
                name: "组装审核数据",
                color: "blue"
            },
            rpcCall: {
                name: "rpc调用",
                color: "orange"
            },
            execEvent: {
                name: "触发事件",
                color: "orange" 
            },
            error: {
                name: "发生错误",
                color: "red"
            }
        },
        typeMap: {
            "text": "文本消息",
            "image": "图片消息",
            "voice": "语言消息",
            "video": "视频消息",
            "file": "文件消息",
            "textcard": "文本卡片消息",
            "news": "图文消息",
            "mpnews": "图文消息",
            "markdown": "markdown消息",
            "miniprogram_notice": "小程序通知消息",
            "taskcard": "任务卡片消息"
        },
        statistics:[],
        success:0,
        fail:0,
        ttf: []
      };
    },
    props: [],
    methods:{
        onSearch(value){
            this.currentSearch = value;
            this.fetch({
                pageSize: this.pagination.pageSize,
                page: 1,
                search: value
            });
        },
        syntaxHighlight(json) {
            if(typeof json == 'string'){
                if(/^{/.test(json)){
                    json = JSON.parse(json);
                }
            }
            if (typeof json != 'string') {
                json = JSON.stringify(json, null, 2);
            }
            json = json.replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>');

            return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE]?\d+)?)/g,(match)=>{
                var cls = 'number';
                if (/^"/.test(match)) {
                    if (/:$/.test(match)) {
                        cls = 'key';
                    } else {
                        cls = 'string';
                    }
                } else if (/true|false/.test(match)) {
                    cls = 'boolean';
                } else if (/null/.test(match)) {
                    cls = 'null';
                }
                return '<span class="' + cls + '">' + match + '</span>';
            });
        },
        escape2Html(str) {
            var arrEntities={'lt':'<','gt':'>','nbsp':' ','amp':'&','quot':'"'};
            return str.replace(/&(lt|gt|nbsp|amp|quot);/ig,function(all,t){return arrEntities[t];});
        },
        timeValue2Date(value){
            return moment(`${Math.floor(value/1000000)}-${_.padStart(Math.floor(value/10000)%100,2,'0')}-${_.padStart(Math.floor(value/100)%100,2,'0')} ${_.padStart(value%100,2,'0')}:00:00`).toDate();
        },
        format2Date(value){
            return moment(value.slice(0,-2)+'00').toDate();
        },
        handleTableChange(pagination, filters, sorter) {
            for(let key in filters){
                if(Array.isArray(filters[key])){
                    filters[key] = filters[key].join('|')
                }
            }
            const pager = { ...this.pagination };
            pager.current = pagination.current;
            this.pagination = pager;
            this.fetch({
                search: this.currentSearch,
                pageSize: pagination.pageSize,
                page: pagination.current,
                sortField: sorter.field,
                sortOrder: sorter.order,
                ...filters
            });
        },
        fetch(params = {}) {
            params.onlyTimeout = this.onlyTimeout;
            this.loading = true;
            this.instance
            .get(
            '/public/iflowLog',
            {params}
            )
            .then(response => {
            const pagination = { ...this.pagination };
            let result = response.data;
            pagination.total = result.count;
            pagination.pageSize = result.pageSize || pagination.pageSize || 15;
            this.loading = false;
            this.data = result.list;
            this.pagination = pagination;
            })
            .catch(function (error) { // 请求失败处理
                console.log(error);
            });
        }
    },
    mounted(){
        //注册事件监听
        this.fetch({
            page:1,
            pageSize:15,
            sortField: "created",
            sortOrder: "descend",
            success: 'false'
        });
    }
  };
</script>
<style>
.formated-json {
    white-space: pre-wrap;
    white-space: -moz-pre-wrap; 
    white-space: -pre-wrap;     
    white-space: -o-pre-wrap;
    word-wrap: break-word;
    word-break: break-all;
    height:240px;
    text-align:left;
}
.result-json {
    height:240px;
    text-align:left;
}
pre {outline: 1px solid #ccc; padding: 5px; margin: 5px; }
.string { color: green; }
.number { color: darkorange; }
.boolean { color: blue; }
.null { color: magenta; }
.key { color: red; }
.ant-tooltip {
    width: 500px
}
</style>