<template>
  <div>
    <a-modal title="测试接口" v-model="test" @ok="lanchTest" okText="测试" cancelText="取消">
        传参
        <a-textarea 
        placeholder="调用接口时传参,JSON格式" 
        :autoSize="{ minRows: 3}"
        :defaultValue="JSON.stringify(testParam,null,2)"
        @focus="e=>onParamFocus(e.target)"
        @blur="e=>onParamConfirm(e.target)"
        />
    </a-modal>
    <a-row>
        <a-col :span="18">
            <p style="font-size:26px">{{name}}</p>
        </a-col>
        <a-col :span="3">
            <a-button
            type="primary"
            @click="showTest"
            >
            测试接口
            </a-button>
        </a-col>
        <a-col :span="3">
            <a-button
            type="primary"
            @click="hideResult"
            >
            清除结果
            </a-button>
        </a-col>
    </a-row>
    <pre v-html="syntaxHighlight(testResult)" class="result-json" v-if="showResult">
    </pre>
    <a-row>
        <a-col :span="24">
            <div ref="frequence" style="width: 100%;height:250px;"></div>
        </a-col>
    </a-row>
    <a-row>
        <a-col :span="24">
            <div ref="ttf" style="width: 100%;height:250px;"></div>
        </a-col>
    </a-row>
    <a-row>
        <a-col :span="24">
            <div ref="ratio" style="width: 100%;height:250px;"></div>
        </a-col>
    </a-row>
    <a-divider/>
    <a-row style="margin-bottom:10px">
        <a-col :span="6">
            <a-switch
            v-model="onlyTimeout"
            checked-children="仅显示超时请求"
            un-checked-children="全部请求显示"
            @change="onOnlyChange"
            >
            </a-switch>
        </a-col>
    </a-row>
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
      <span slot="tags" slot-scope="callResult">
        <a-row>
            <a-col :span="12">
            <a-tooltip>
                <template slot="title" v-if="callResult.success != true" >
                    <p>{{callResult.error}}</p>
                </template>
                <a-badge :count="isNewError(callResult)">
                    <a-icon 
                    :type="callResult.success === true? 'check-circle':'close-circle'"
                    theme="twoTone"
                    :two-tone-color="callResult.success === true? '#52c41a':'#eb2f96'"
                    style="font-size: 28px;"
                    >
                    </a-icon>
                </a-badge>
            </a-tooltip>
            </a-col>
            <a-col :span="12" v-if="callResult.status">
                <a-tag
                :color="callResult.status==200?'green':'red'"
                >
                {{callResult.status||'unknown'}}
                </a-tag>
            </a-col>
        </a-row>
      </span>
      <span slot="time" slot-scope="record">
        <p>{{record.log_time}}</p>
        <p>{{record.totalTime? record.totalTime+' ms':''}}</p>
      </span>
      <span slot="versionTag" slot-scope="record">
        <a-tag color="blue" style="margin-top:5px"
        v-clipboard:copy="record.versionConfig"
        v-clipboard:success="onCopy"
        v-clipboard:error="onError"
        >
            {{record.versionTag}}
        </a-tag>
      </span>
      <span slot="process" slot-scope="process">
        <div v-if="process">
                <a-tag color="orange" style="margin-top:5px">
                    开始
                </a-tag>
            <span v-for="state in process" :key="state._id">
                <a-icon type="right" style="margin-top:5px" v-if="state.state!='error'"></a-icon>
                <a-tag :color="state.color || processMap[state.state?state.state:state].color" style="margin-top:5px" v-if="state.state!='error'">
                    {{`${processMap[state.state?state.state:state].name}${typeof state.time == 'number'?'\r'+state.time+'ms':''}`}}
                </a-tag>
            </span>
        </div>
      </span>
      <div slot="expandedRowRender" slot-scope="record">
        <a-row>
            <a-col :span="5">
                <p>url</p>
                <a-divider dashed/>
                <pre class="formated-json">{{record.url}}</pre>
            </a-col>
            <a-col :span="5">
                <p>传参</p>
                <a-divider dashed/>
                <pre v-html="syntaxHighlight(record.params)" class="formated-json"></pre>
            </a-col>
            <a-col :span="7">
                <p>实际入参</p>
                <a-divider dashed/>
                <pre v-if="record.data" class="formated-json">{{vkbeautify.xml(escape2Html(record.data))}}</pre>
            </a-col>
            <a-col :span="7">
                <p>结果</p>
                <a-divider dashed/>
                <pre v-if="record.result||record.callResult.error" class="formated-json">{{vkbeautify.xml(escape2Html(record.result||record.callResult.error))}}</pre>
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
    import * as echarts from 'echarts';
    import _ from 'lodash';
    import vkbeautify from 'vkbeautify'

  const columns = [
    {
        title: '调用时间',
        width: '15%',
        key: 'time',
        scopedSlots: { customRender: 'time' },
    },
    {
        title: '调用结果/接口状态',
        dataIndex: 'callResult',
        filters: [
            { text: '成功', value: 'true' },
            { text: '失败', value: 'false' },
        ],
        defaultFilteredValue: ['true','false'],
        width: '20%',
        key: 'success',
        scopedSlots: { customRender: 'tags' }
    },
    {
        title: '接口版本',
        width: '10%',
        key: 'versionTag',
        scopedSlots: { customRender: 'versionTag' }
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
            getConfig:{
                name: "获取API配置",
                color: "cyan"
            },
            fromCache:{
                name: "获取缓存结果",
                color: "purple"
            },
            parseData:{
                name: "替换外部入参",
                color: "blue"
            },
            formHeader:{
                name: "组合请求头",
                color: "blue"
            },
            callPreApi:{
                name: "调用前置API",
                color: "blue"
            },
            formFromPreApi:{
                name: "组合前置数据",
                color: "blue"
            },
            queryDatabase:{
                name: "查询数据库",
                color: "blue"
            },
            mergeData:{
                name: "组装数据",
                color: "blue"
            },
            stringifyData:{
                name: "字符串化JSON",
                color: "blue"
            },
            sign:{
                name: "计算签名",
                color: "grey"
            },
            request:{
                name: "请求接口",
                color: "blue"
            },
            mock:{
                name: "mock请求",
                color: "blue"
            },
            toCache:{
                name: "写入缓存",
                color: "purple"
            },
            parseText:{
                name: "解析返回字符串",
                color: "blue"
            },
            return:{
                name: "返回结果",
                color: "green"
            },
            error: {
                name: "发生错误",
                color: "red"
            }
        },
        statistics:[],
        success:0,
        fail:0,
        ttf: []
      };
    },
    props: ['appId', 'apiId'],
    methods:{
        onCopy(){
            this.$message.info('历史配置已复制到剪贴板！');
        },
        onError(){
            this.$message.error('复制历史配置错误！');
        },
        isNewError(callResult){
            let result = 0;
            if(!callResult.success && (!callResult.read || !callResult.read.includes(this.$store.state.user_id))){
                result = 'new'
            }
            return result;
        },
        onOnlyChange(){
            this.fetch({
                app_id: this.appId,
                api_id: this.apiId,
                page:1,
                pageSize:15,
                sortField: "log_time",
                sortOrder: "descend"
            });
        },
        showTest(){
            if(Object.keys(this.testParam).length == 0){
                this.instance
                .get(
                `/private/api/getTestParams?api_id=${this.apiId}`
                )
                .then(response => {
                    let result = response.data;
                    this.testParam = result.testParams;
                    this.test = true;
                })
                .catch(function (error) { // 请求失败处理
                    console.log(error);
                });
            }else{
                this.test = true;
            }
        },
        onParamFocus(target){
            this.tempParamStr = target.value;
        },
        onParamConfirm(target){
            try{
                this.testParam = JSON.parse(target.value)
            }catch(e){
                target.value = this.tempParamStr;
            }
        },
        lanchTest(){
            let data={
                app_id: this.appId,
                apiName: this.name,
                params: this.testParam
            }
            this.instance
            .post(
            '/public/api/call',
            data
            )
            .then(response => {
                let result = response.data;
                this.testResult = result;
                this.showResult = true;
                this.fetch({
                    app_id: this.appId,
                    api_id: this.apiId,
                    page:1,
                    pageSize:15,
                    sortField: "log_time",
                    sortOrder: "descend"
                });
            })
            .catch(function (error) { // 请求失败处理
                console.log(error);
            });
            this.test = false;
        },
        hideResult(){
            this.showResult = false;
            this.testParam = {};
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
            return moment(value).toDate();
        },
        handleTableChange(pagination, filters, sorter) {
            let inputFilters = {};
            for(let key in filters){
                if(Array.isArray(filters[key])){
                    inputFilters[key] = filters[key].join('|')
                }else{
                    inputFilters[key] = filters[key]
                }
            }
            const pager = { ...this.pagination };
            pager.current = pagination.current;
            this.pagination = pager;
            this.fetch({
            app_id: this.appId,
            api_id: this.apiId,
            pageSize: pagination.pageSize,
            page: pagination.current,
            sortField: sorter.field,
            sortOrder: sorter.order,
            ...inputFilters,
            });
        },
        fetch(params = {}) {
            params.onlyTimeout = this.onlyTimeout;
            this.loading = true;
            this.instance
            .get(
            '/private/consultModulation/apiLog',
            {params}
            )
            .then(response => {
            const pagination = { ...this.pagination };
            let result = response.data;
            pagination.total = result.count;
            pagination.pageSize = result.pageSize;
            this.loading = false;
            this.data = result.list;
            this.data.forEach(item=>{
                if(item.process && item.process[item.process.length-1] && item.process[item.process.length-1].state=='error'){
                    item.process[item.process.length-2].color = 'red'
                }
            })
            this.pagination = pagination;
            this.fetchStatistics({
                api_id: this.apiId
            });
            })
            .catch(function (error) { // 请求失败处理
                console.log(error);
            });
        },
        fetchStatistics(params={}){
            this.instance
            .get(
            '/private/consultModulation/apiStatistics',
            {params}
            )
            .then(response => {
                let result = response.data;
                this.statistics = result.statistics;
                this.success = result.success;
                this.fail = result.fail;
                this.name = result.name;
                this.ttf = result.ttf;
                this.drawCharts();
            })
            .catch(function (error) { // 请求失败处理
                console.log(error);
            });
        },
        drawCharts(){
            let that = this;
            echarts.init(this.$refs.frequence).setOption({
                title:{
                    text: '接口调用频率'
                },
                tooltip:{
                    trigger: 'axis'
                },
                legend: {
                    data:['成功', '失败']
                },
                toolbox:{
                    show: true,
                    feature:{
                        saveAsImage:{show: true}
                    }
                },
                dataZoom:[
                    {
                        show: true,
                        realtime: true,
                        start: 0,
                        end: 100
                    }
                ],
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true
                },
                xAxis:{
                    type: 'time'
                },
                yAxis: {
                    type: 'value'
                },
                series:[{
                    type: 'bar',
                    name: '成功',
                    stack: '调用次数',
                    label:{
                        show: false,
                        formatter: '{@[1]}'
                    },
                    itemStyle: {
                        color: '#339966'
                    },
                    data: this.statistics.map(item=>[that.timeValue2Date(item._id), item.success]) 
                },
                {
                    type: 'bar',
                    name: '失败',
                    stack: '调用次数',
                    label:{
                        show: false,
                        formatter: '{@[1]}'
                    },
                    barMaxWidth: 48,
                    itemStyle: {
                        color: '#CC3366'
                    },
                    data: this.statistics.map(item=>[that.timeValue2Date(item._id), item.fail]) 
                }
                ]
            });
            
            echarts.init(this.$refs.ttf).setOption({
                title:{
                    text: '接口响应时间'
                },
                tooltip:{
                    trigger: 'axis'
                },
                dataZoom:[
                    {
                        show: true,
                        realtime: true,
                        start: 0,
                        end: 100
                    }
                ],
                toolbox:{
                    show: true,
                    feature:{
                        saveAsImage:{show: true}
                    }
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true
                },
                xAxis:{
                    type: 'time'
                },
                yAxis: {
                    type: 'value'
                },
                series:[{
                    type: 'bar',
                    name: '接口响应时间',
                    stack: '接口响应时间',
                    label:{
                        show: false,
                        formatter: '{@[1]}'
                    },
                    barMaxWidth: 48,
                    itemStyle: {
                        color: '#339966'
                    },
                    data: this.ttf.map(item=>{
                        return [
                            item.log_time, 
                            item.totalTime
                            ]
                    }) 
                }]
            });

            echarts.init(this.$refs.ratio).setOption({
                title:{
                    text: '调用成功比例'
                },
                tooltip:{
                    trigger: 'item',
                    formatter: '{b} : {c} ({d}%)'
                },
                legend:{
                    top: 'bottom',
                    data: ['成功','失败']
                },
                toolbox:{
                    show: true,
                    feature:{
                        saveAsImage:{show: true}
                    }
                },
                series:[{
                    type: 'pie',
                    itemStyle:{
                        color: function({data}){
                            return data.name == "成功"?'#339966':'#CC3366'
                        }
                    },
                    label:{
                        formatter: '{b} : {c} ({d}%)'
                    },
                    startAngle: 45,
                    roseType: 'radius',
                    data: [
                        {
                            name: "成功",
                            value: this.success
                        },
                        {
                            name: "失败",
                            value: this.fail
                        }
                    ] 
                }]
            });
        }
    },
    mounted(){
        this.fetch({
            app_id: this.appId,
            api_id: this.apiId,
            page:1,
            pageSize:15,
            sortField: "log_time",
            sortOrder: "descend"
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