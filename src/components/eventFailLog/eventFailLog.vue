<template>
  <div>
    <a-row type="flex" justify="start">
        <a-col :span="6">
            <a-input
            addonBefore="事件标签"
            @change="e=>onTagDescriptionChange(e.target.value)"
            >
            </a-input>
        </a-col>
        <a-col :span="6" style="text-align:left;padding-left:5px">
            <span class="c-col-title">调用次数</span>
            <a-input-number
            :min="0"
            :step="1"
            @change="value=>onFailTimesChange(value)"
            >
            </a-input-number>
        </a-col>
        <a-col :span="6" style="text-align:left">
            <span class="c-col-title">是否已解决</span>
            <a-select
            :options="fullfilledOptions"
            @change="onFullfilledChange"
            style="width:64px"
            >
            </a-select>
        </a-col>
        <a-col :span="6" style="text-align:right">
            <a-button-group>
                <a-button @click="clearSearchOption">清空</a-button>
                <a-button type="primary" icon="search" @click="onSearch">搜索</a-button>
            </a-button-group>
        </a-col>
    </a-row>
    <a-row style="margin-top:5px" type="flex" justify="start">
        <a-col :span="12" style="text-align:left">
            <span class="c-col-title">最近调用时间</span>
            <a-range-picker 
            :mode="['date', 'date']"
            :placeholder="['最近调用时间-起', '最近调用时间-止']"
            format="YYYY-MM-DD"
            :value="searchOption.recentTried"
            @change="handleRecentTriedChange"
            />
        </a-col>
        <a-col :span="12" style="text-align:left">
            <span class="c-col-title">初次调用时间</span>
            <a-range-picker 
            :mode="['date', 'date']"
            :placeholder="['初次调用时间-起', '初次调用时间-止']"
            format="YYYY-MM-DD"
            :value="searchOption.created"
            @change="handleCreatedChange"
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
    <span slot="tagName" slot-scope="record">
        <p>{{record.tagDescription}}</p>
        <p>({{record.tagName}})</p>
    </span>
    <span slot="fullfilled" slot-scope="fullfilled">
        <a-icon 
        :type="fullfilled === true? 'check-circle':'close-circle'"
        theme="twoTone"
        :two-tone-color="fullfilled === true? '#52c41a':'#eb2f96'"
        style="font-size: 28px;"
        >
        </a-icon>
    </span>
    <span slot="params" slot-scope="params">
        <pre v-html="syntaxHighlight(params)" class="formated-json"></pre>
    </span>
    <span slot="action" slot-scope="text, record">
        <a @click="recallFailEvent(record._id)">重试</a>
    </span>
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
        title: '事件标签名称',
        width: '15%',
        key: 'tagName',
        scopedSlots: { customRender: 'tagName' }
    },
    {
        title: '已解决',
        width: '10%',
        key: 'fullfilled',
        dataIndex: 'fullfilled',
        scopedSlots: { customRender: 'fullfilled' }
    },
    {
        title: '调用次数',
        width: '5%',
        key: 'failTimes',
        dataIndex: 'failTimes',
        scopedSlots: { customRender: 'failTimes' }
    },
    {
        title: '调用参数',
        width: '40%',
        key: 'params',
        dataIndex: 'params',
        scopedSlots: { customRender: 'params' }
    },
    {
        title: '最近调用时间',
        width: '10%',
        key: 'recentTried',
        dataIndex: 'recentTried',
        scopedSlots: { customRender: 'recentTried' }
    },
    {
        title: '初次调用时间',
        width: '10%',
        key: 'created',
        dataIndex: 'created',
        scopedSlots: { customRender: 'created' }
    },
    {
        title: '操作',
        key: 'action',
        width: '10%',
        scopedSlots: { customRender: 'action' }
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
        pagination: {
            current: 1,
            pageSize: 15,
            total: 0
        },
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
        ttf: [],
        fullfilledOptions: [
            {
                value: "true",
                label: "是"
            },
            {
                value: "false",
                label: "否"
            }
        ],
        searchOption: {
            tagDescription: "",
            failTimes: 0,
            created: [],
            recentTried: [],
            fullfilled: ""
        }
      };
    },
    props: ['appId'],
    methods:{
        onSearch(){
            console.log(this.pagination);
            this.fetch({
                pageSize: this.pagination.pageSize,
                page: 1,
                app_id: this.appId,
                tagDescription: this.searchOption.tagDescription,
                failTimes: this.searchOption.failTimes,
                fromCreated: this.searchOption.created[0],
                toCreated: this.searchOption.created[1],
                fromRecentTried: this.searchOption.recentTried[0],
                toRecentTried: this.searchOption.recentTried[1],
                fullfilled: this.searchOption.fullfilled
            });
        },
        handleRecentTriedChange(value){
            this.searchOption.recentTried = value.map(item=>item.format('YYYY-MM-DD'))
        },
        handleCreatedChange(value){
            this.searchOption.created = value.map(item=>item.format('YYYY-MM-DD'))
        },
        onTagDescriptionChange(value){
            this.searchOption.tagDescription = value;
        },
        onFailTimesChange(value){
            this.searchOption.failTimes = value;
        },
        onFullfilledChange(value){
            this.searchOption.fullfilled = value;
        },
        clearSearchOption(value){
            this.searchOption = {
                tagDescription: "",
                failTimes: 0,
                created: [],
                recentTried: [],
                fullfilled: ""
            }
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
            this.loading = true;
            this.instance
            .get(
            '/public/api/getCompanyEventFailLogs',
            {params}
            )
            .then(response => {
                const pagination = { ...this.pagination };
                let result = response.data;
                pagination.total = result.count;
                this.loading = false;
                this.data = result.list;
                this.pagination = pagination;
                console.log(this.pagination)
            })
            .catch(function (error) { // 请求失败处理
                console.log(error);
            });
        },
        recallFailEvent(eventFailLog_id) {
            console.log(eventFailLog_id);
            this.instance
            .post(
            '/public/api/recallFailEvent',
            {   
                eventFailLog_id
            }
            )
            .then(response => {
                this.fetch({
                    app_id: this.appId,
                    page:1,
                    pageSize:15
                });
            })
            .catch(function (error) { // 请求失败处理
                console.log(error);
            });
        }
    },
    mounted(){
        console.log(`this is eventFailLog`)
        //注册事件监听
        this.fetch({
            app_id: this.appId,
            page:1,
            pageSize:15
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
.c-col-title{
    display:inline-block;
    height:32px;
    line-height: 30px;
    padding: 0 8px;
    border:1px solid #d9d9d9;
    border-right:none;
    background-color:#fafafa;
    vertical-align: top;

}
</style>