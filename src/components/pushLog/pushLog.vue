<template>
  <div>
    <a-row style="text-align: left; margin-bottom: 5px">
        <a-col :span="12">
            时间段：
            <a-range-picker
                show-time
                format="YYYY-MM-DD HH:mm:ss"
                v-model="dateSearch"
                @ok="onSearch"
                @change="dateSearchChange"
            />
        </a-col>
        <a-col :span="6">
            推送结果：
            <a-radio-group v-model="typeSearch" @change="onSearch">
                <a-radio value="all">全部</a-radio>
                <a-radio value="success">成功</a-radio>
                <a-radio value="fail">失败</a-radio>
            </a-radio-group>
        </a-col>
    </a-row>
    <a-row>
        <a-col :span="16">
            <a-input-search
            placeholder="搜索目标医院，应用"
            @search="onSearch"
            v-model="currentSearch"
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
      <span slot="tags" slot-scope="pushResult, record">
        <a-row>
            <a-col :span="12">
            <a-tooltip>
                <template slot="title" v-if="pushResult.success != true" >
                    <p>{{pushResult.errorMessage}}</p>
                </template>
                <a-icon
                :type="pushResult.success === true? 'check-circle':'close-circle'"
                theme="twoTone"
                :two-tone-color="pushResult.success === true? '#52c41a':'#eb2f96'"
                style="font-size: 28px"
                >
                </a-icon>
            </a-tooltip>
        </a-col>
        <a-col :span="12">
            <a-row>
                <a-col :span="24">
                    <p>尝试次数：{{record.sender_oid.tried}}</p>
                    <p>成功次数：{{record.sender_oid.succeeded}}</p>
                </a-col>
            </a-row>
            <a-row>
                <a-col :span="24">
                    <a-button
                    icon="redo"
                    style="margin-right:5px"
                    v-if="!pushResult.success"
                    :loading="resending && resendMessage_id == record.message_id"
                    @click="resendFail(record)"
                    :disabled="resending"
                    shape="round"
                    >
                        重推
                    </a-button>
                </a-col>
                </a-row>
            </a-col>
        </a-row>
      </span>
      <span slot="target" slot-scope="sender_oid">
            <a-tag v-if="sender_oid && sender_oid.company_oid" color="orange">
            {{sender_oid.company_oid.company_name}}
            </a-tag>
            <a-tag v-if="sender_oid && sender_oid.smartapp_oid" color="cyan">
            {{sender_oid.smartapp_oid.name}}
            </a-tag>
            <a-tag v-if="sender_oid && sender_oid.detail_oid">
            detail_oid: {{sender_oid.detail_oid}}
            </a-tag>
      </span>
      <span slot="time" slot-scope="record">
        <p>{{record.log_time}}</p>
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
                <p>目标医院</p>
                <a-divider dashed/>
                <pre v-if="record.sender_oid && record.sender_oid.company_oid" class="formated-json">{{record.sender_oid.company_oid.company_name}}</pre>
            </a-col>
            <a-col :span="5">
                <p>数据类型</p>
                <a-divider dashed/>
                <pre v-if="record.sender_oid" v-html="typeMap[record.sender_oid.msgtype]" class="formated-json"></pre>
            </a-col>
            <a-col :span="7">
                <p>发送数据</p>
                <a-divider dashed/>
                <pre v-if="record.sendData" v-html="syntaxHighlight(record.sendData)" class="formated-json"></pre>
            </a-col>
            <a-col :span="7">
                <p>结果</p>
                <a-divider dashed/>
                <pre v-if="record.pushResult" v-html="syntaxHighlight(record.pushResult)" class="formated-json"></pre>
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
        title: '推送时间',
        width: '10%',
        key: 'time',
        scopedSlots: { customRender: 'time' },
    },
    {
        title: '推送结果',
        dataIndex: 'pushResult',
        width: '15%',
        key: 'success',
        scopedSlots: { customRender: 'tags' }
    },
    {
        title: '目标应用',
        dataIndex: 'sender_oid',
        width: '20%',
        key: 'target',
        scopedSlots: { customRender: 'target' }
    },
    {
        title: '执行过程',
        dataIndex: 'process',
        width: '55%',
        scopedSlots: { customRender: 'process' }
    }
  ];

  export default {
    data() {
      return {
        resending: false,
        resendMessage_id: "",
        typeSearch: 'all',
        dateSearch: [],
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
            pageSize: 10
        },
        loading: false,
        columns,
        processMap: {
            getSender:{
                name: "获取推送配置",
                color: "cyan"
            },
            getAccessToken:{
                name: "获取access_token结果",
                color: "purple"
            },
            formContent:{
                name: "组合推送内容",
                color: "blue"
            },
            formTarget:{
                name: "解析推送目标",
                color: "blue"
            },
            requestPush:{
                name: "推送",
                color: "blue"
            },
            removeItem:{
                name: "推送成功删除队列数据",
                color: "blue"
            },
            resumeItem:{
                name: "推送失败重新加入队列数据",
                color: "green"
            },
            pushToSecretary:{
                name: "推送到小秘书",
                color: "pink"
            },
            ignoreSecretary:{
                name: "忽略小秘书推送",
                color: "pink"
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
        resendFail(record){
            let that = this;
            this.resending = true;
            this.resendMessage_id = record.message_id;
            this.instance
            .post(
            '/public/pushLog/resendFail',
            {
                message_id: record.message_id
            }
            )
            .then(response => {
                let result = response.data;
                if(result.result){
                    that.$message.info("重推消息成功!")
                }else{
                    that.$message.error("重推消息失败!")
                }
                that.resending = false
                that.pagination.current = 1;
                that.fetch({
                    pageSize: that.pagination.pageSize,
                    page: that.pagination.current,
                    search: that.currentSearch
                });
            })
            .catch(function (error) { // 请求失败处理
                that.$message.error(error)
                that.resending = false
            });

        },
        onSearch(){
            let payLoad = {
                pageSize: this.pagination.pageSize,
                page: this.pagination.current,
                search: this.currentSearch
            }
            if (this.dateSearch && this.dateSearch.length===2){
                payLoad.startTime = this.dateSearch[0].format("YYYY-MM-DD HH:mm:ss");
                payLoad.endTime = this.dateSearch[1].format("YYYY-MM-DD HH:mm:ss");
            }
            if (this.typeSearch === 'success') {
                payLoad.hideSuccess = false;
                payLoad.hideFail = true;
            } else if (this.typeSearch === 'fail') {
                payLoad.hideSuccess = true;
                payLoad.hideFail = false;
            }
            this.fetch(payLoad);
        },
        dateSearchChange(param){
            if (param.length === 0) {
                this.onSearch();
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
            let payLoad = {
                search: this.currentSearch,
                pageSize: pagination.pageSize,
                page: pagination.current,
                sortField: sorter.field,
                sortOrder: sorter.order,
                ...filters
            }
            if (this.dateSearch && this.dateSearch.length===2){
                payLoad.startTime = this.dateSearch[0].format("YYYY-MM-DD HH:mm:ss");
                payLoad.endTime = this.dateSearch[1].format("YYYY-MM-DD HH:mm:ss");
            }
            if (this.typeSearch === 'success') {
                payLoad.hideSuccess = false;
                payLoad.hideFail = true;
            } else if (this.typeSearch === 'fail') {
                payLoad.hideSuccess = true;
                payLoad.hideFail = false;
            }
            this.fetch(payLoad);
        },
        fetch(params = {}) {
            params.onlyTimeout = this.onlyTimeout;
            this.loading = true;
            this.instance
            .get(
            '/public/pushLog',
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
            sortField: "log_time",
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
