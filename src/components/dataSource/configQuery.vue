<template>
    <a-row :style="{position: 'relative'}">
        <a-row style="text-align: right">
            <a-button type="primary" @click="showUpsert()">新增</a-button>
        </a-row>

        <a-row>
            <a-row>
                <div v-for="(item) in data" :key="item._id">
                    <a-col :span="6">
                        <a-card style="margin: 5px">
                            <a-row slot="title">{{item.name}}</a-row>
                            <template slot="actions" class="ant-card-actions">
                                <a-tooltip>
                                    <template slot="title">配置</template>
                                    <a-badge title="开启了返回示例Mock">
                                        <div slot="count" v-if="item.mockReturn" class="mock-return-badge-icon">M</div>
                                        <a-icon style="fontSize:24px" type="setting" @click="showUpsert(item)"/>
                                    </a-badge>
                                </a-tooltip>
                                <a-tooltip>
                                    <template slot="title">调用日志</template>
                                    <a-icon type="history" style="fontSize:24px" @click="configModel(item)"/>
                                </a-tooltip>
                                <a-tooltip>
                                    <template slot="title">
                                        复制地址到剪贴板
                                    </template>
                                    <a-icon
                                        type="copy"
                                        style="fontSize:24px"
                                        @click="doCopy(item)"
                                    />
                                </a-tooltip>
                                <a-popconfirm
                                    title="亲,真的要抛弃我吗？"
                                    okText="狠心删除"
                                    cancelText="手下留情"
                                    @confirm="handleDelete(item)"
                                >
                                    <a-icon slot="icon" type="aliwangwang" style="color:red"/>
                                    <a-tooltip>
                                        <a-icon style="fontSize:24px" type="delete"/>
                                    </a-tooltip>
                                </a-popconfirm>
                            </template>
                        </a-card>
                    </a-col>
                </div>
            </a-row>
            <a-row style="text-align: right">
                <a-pagination v-model="page" :defaultPageSize="pageSize" :total="total" @change="changePage" show-less-items />
            </a-row>
        </a-row>


        <a-modal
            :title="upsertData.title"
            :visible="visibleUpsert"
            :confirm-loading="upsertLoading"
            @ok="upsertSubmit"
            @cancel="upsertCancel"
            :width="1280"
        >
            <Config :appId="appId" :upsertData="upsertData" :collectionId="collectionId" v-if="visibleUpsert" ref="config"/>
        </a-modal>
    </a-row>
</template>
<script>
import { EventBus } from '../../lib/event-bus.js'; //全局事件总线
import Config from './config'

export default {
    data() {
        return {
            data: [],
            page: 1,
            pageSize: 10,
            total: 0,
            visibleUpsert: false,
            upsertLoading: false,
            upsertData: {title: '新增'}
        };
    },
    props:['appId', 'sourceId', 'collectionId', 'collectionName'],
    components:{
        Config: Config,
    },
    methods:{
        configModel(value){
            EventBus.$emit('selectQueryConfig', value);
            EventBus.$emit('modeChange', 'dataSourceLog');
        },
        async changePage(current){
            this.page = current;
            await this.fetch();
        },
        async fetch() {
            let queryString = {
                source_oid: this.sourceId,
                collection_oid: this.collectionId,
                page: this.page,
                pageSize: this.pageSize
            }
            let result = await this.instance.get('/public/getQueryConfig', {params: queryString});
            if (!result.data.result) {
                return this.$message.error('数据拉取失败');
            }
            this.data = result.data.data.data;
            for (let i=0; i<this.data.length; i++) {
                this.data[i].params_example = JSON.stringify(this.data[i].params_example, null, 2);
            }
            this.total = result.data.data.count;
        },
        async handleDelete(queryConfig) {
            let result = await this.instance.post('/public/deleteQueryConfig', {queryconfig_id: queryConfig._id});
            if (!result.data.result) {
                return this.$message.error('删除失败');
            } else {
                this.$message.info('删除成功');
                await this.fetch();
            }
        },
        doCopy: function (queryConfig) {
            let url = 'http://127.0.0.1:7001/v1/public/'+queryConfig._id+'/getDataByConfig'
            this.$copyText(url).then(function (e) {
                this.$message.info(`已复制 ${e.text} 到剪切板`);
            }.bind(this), function (e) {
                this.$message.error(`复制到剪切板失败`);
            }.bind(this))
        },
        async upsertSubmit(){
            let payLoad = Object.assign({}, this.$refs.config.data);
            if (payLoad.tab === 'complex') {
                try {
                    payLoad.query = JSON.parse(payLoad.queryText);
                } catch (e) {
                    this.$message.error('高级查询语法错误 或 参数示例语法错误');
                }
            }
            try {
                payLoad.params_example = JSON.parse(payLoad.params_example);
            } catch (e) {
                this.$message.error('参数示例语法错误');
            }
            let result;
            if (payLoad._id){
                result = await this.instance.post('/public/updateQueryConfig', {queryconfig_id: payLoad._id, ...payLoad});
            } else {
                result = await this.instance.post('/public/postQueryConfig', payLoad);
            }
            if (!result.data.result) {
                return this.$message.error('保存失败');
            } else {
                this.visibleUpsert = false;
                this.$message.info('保存成功');
                await this.fetch();
            }
        },
        upsertCancel(){
            this.visibleUpsert = false;
        },
        showUpsert(queryConfig){
            if (queryConfig) {
                this.upsertData = {title: '修改', tab: 'normal', ...queryConfig};
            } else {
                this.upsertData = {
                    title: '新增',
                    tab: 'normal',
                    app_oid: this.appId,
                    source_oid: this.sourceId,
                    collection_oid: this.collectionId,
                    collection_name: this.collectionName,
                    name: "",
                    operation: "",
                    query: {},
                    extra_operation : {},
                    params_example: '{}',
                }
            }
            this.visibleUpsert = true;
        }
    },
    mounted(){
        this.fetch();
    }
};
</script>

<style>
.schemaField{
    border: none;
}
.result-json {
    height:240px;
    text-align:left;
}
</style>
