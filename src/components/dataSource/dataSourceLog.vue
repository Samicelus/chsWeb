<template>
    <div>
        <a-modal title="测试接口" v-model="test" @ok="launchTest" okText="测试" cancelText="取消">
            传参
            <a-textarea
                placeholder="调用接口时传参,JSON格式"
                :autoSize="{ minRows: 3}"
                v-model="testParam"
            />
        </a-modal>
        <a-row :style="{position: 'relative'}">
            <a-row>
                <a-col :span="18">
                    <p style="font-size:26px">{{configInfo.name}}</p>
                </a-col>
                <a-col :span="3">
                    <a-button type="primary" @click="showTest"> 测试接口 </a-button>
                </a-col>
                <a-col :span="3">
                    <a-button type="primary" @click="clearTestResult"> 清除结果 </a-button>
                </a-col>
            </a-row>
            <pre v-html="syntaxHighlight(testResult)" class="result-json" v-if="showTestResult"></pre>
        </a-row>

        <a-table
            size="small"
            :columns="columns"
            :data-source="logs"
            :rowKey="item => item._id"
            :pagination="pagination"
            :loading="logLoading"
            @change="handleTableChange"
        >
            <span slot="time" slot-scope="record">
                <p>{{record.created}}</p>
                <p>{{record.total_time? record.total_time+' ms':''}}</p>
            </span>
            <span slot="tags" slot-scope="status">
                <a-icon
                    :type="status === 'success'? 'check-circle':'close-circle'"
                    theme="twoTone"
                    :two-tone-color="status === 'success'? '#52c41a':'#eb2f96'"
                    style="font-size: 28px;"
                ></a-icon>
            </span>
            <span slot="process" slot-scope="process">
                <div v-if="process">
                        <a-tag color="orange" style="margin-top:5px">
                            开始
                        </a-tag>
                    <span v-for="state in process" :key="state._id">
                        <a-icon type="right" style="margin-top:5px" v-if="state.state!='error'"></a-icon>
                        <a-tooltip>
                            <template slot="title" v-if="state.apiName">
                                {{state.apiName}}
                            </template>
                            <a-tag :color="state.color || processMap[state.state?state.state:state].color" style="margin-top:5px" v-if="state.state!='error'" @click="toApiLog(state.api_oid)">
                                {{`${processMap[state.state?state.state:state].name}${typeof state.time == 'number'?'\r'+state.time+'ms':''}`}}
                            </a-tag>
                        </a-tooltip>
                    </span>
                </div>
            </span>
            <div slot="expandedRowRender" slot-scope="record">
                <a-row>
                    <a-col :span="8">
                        <p>传参</p>
                        <a-divider dashed/>
                        <pre v-html="syntaxHighlight(record.parameter)" class="formated-json"></pre>
                    </a-col>
                    <a-col :span="8" v-if="record.actual_parameter">
                        <p>数据库查询参数</p>
                        <a-divider dashed/>
                        <pre v-if="record.actual_parameter.startsWith('select')" v-html="record.actual_parameter" class="formated-json">></pre>
                        <pre v-else v-html="syntaxHighlight(record.actual_parameter)" class="formated-json">></pre>
                    </a-col>
                    <a-col :span="8" v-if="record.error_message">
                        <p>错误信息</p>
                        <a-divider dashed/>
                        <pre v-html="syntaxHighlight(record.error_message)" class="formated-json">></pre>
                    </a-col>
                </a-row>
            </div>
        </a-table>
    </div>
</template>
<script>
import { EventBus } from '../../lib/event-bus.js'; //全局事件总线

export default {
    data() {
        return {
            configInfo: {},
            test: false,
            testParam: '{}',
            showTestResult: false,
            testResult: {},
            processMap: {
                triggedByApi: {
                    name: "接口调用触发",
                    color: "pink"
                },
                getConfig:{
                    name: "获取配置",
                    color: "cyan"
                },
                parseData:{
                    name: "替换外部入参",
                    color: "blue"
                },
                queryDatabase:{
                    name: "查询数据库",
                    color: "blue"
                },
                error: {
                    name: "发生错误",
                    color: "red"
                }
            },
            logLoading: false,
            columns: [
                {
                    title: '调用时间',
                    width: '15%',
                    scopedSlots: { customRender: 'time' },
                },
                {
                    title: '状态',
                    dataIndex: 'status',
                    filters: [
                        { text: '成功', value: 'success' },
                        { text: '失败', value: 'fail' },
                    ],
                    defaultFilteredValue: ['success','fail'],
                    width: '20%',
                    scopedSlots: { customRender: 'tags' }
                },
                {
                    title: '执行过程',
                    dataIndex: 'process',
                    width: '55%',
                    scopedSlots: { customRender: 'process' }
                }
            ],
            logs: [],
            pagination: {
                current: 1,
                total: 0,
                pageSize: 20,
            },
        };
    },
    props:['appId', 'sourceId', 'collectionId', 'queryConfigId'],
    methods:{
        async loadConfigInfo() {
            let queryString = { _id: this.queryConfigId };
            let result = await this.instance.get('/public/getQueryConfigById', {params: queryString});
            if (!result.data.result) {
                return this.$message.error('数据拉取失败');
            }
            this.configInfo = result.data.data;
            this.testParam = JSON.stringify(result.data.data.params_example, null, 2);
        },
        showTest() {
            this.test = true;
        },
        clearTestResult() {
            this.showTestResult = false;
            this.testResult = {};
        },
        async launchTest() {
            let data = {};
            try {
                data = JSON.parse(this.testParam);
            } catch (e){
                return this.$message.error('测试参数格式不正确');
            }
            let option = {
                method: 'post',
                url: '/public/'+this.queryConfigId+'/getDataByConfig'
            }
            // 对参数进行解析，组装到option中
            if (data.body) {
                option.data = data.body;
            }
            if (data.query) {
                option.params = data.query;
            }
            if (data.headers) {
                option.headers = data.headers;
            }
            let result = await this.instance(option);
            this.test = false;
            this.testResult = result.data;
            this.showTestResult = true;
            await this.loadLog({page: this.page, pageSize: this.pageSize, queryConfig_id: this.queryConfigId})
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
        async loadLog({page, pageSize, queryConfig_id, status}) {
            let payLoad = {page, pageSize, queryConfig_id};
            if (status) {
                payLoad.status = status;
            }
            let result = await this.instance.post('/public/queryLog', payLoad);
            if (!result.data.result) {
                return this.$message.error('数据加载失败');
            }
            this.logs = result.data.data.data;
            this.pagination.total = result.data.data.total;
        },
        async handleTableChange(pagination, filters, sorter){
            let payLoad = {page: this.page, pageSize: this.pageSize, queryConfig_id: this.queryConfigId};
            if (filters && filters.status){
                payLoad.status = filters.status;
            }
            this.pagination = pagination;
            await this.loadLog(payLoad);
        },
        toApiLog(api_oid){
            if(api_oid){
                EventBus.$emit('apiIdChange', api_oid)
                EventBus.$emit('modeChange', 'apiLog');
            }
        }
    },
    mounted(){
        this.loadConfigInfo();
        this.loadLog({page: this.page, pageSize: this.pageSize, queryConfig_id: this.queryConfigId});
    }
};
</script>

<style>
</style>
