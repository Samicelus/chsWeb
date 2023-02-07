<template>
  <div :style="{position: 'relative'}">
    <a-drawer
    :width="520"
    placement="right"
    :closable="false"
    @close="onClose"
    :visible="showDetail"
    :getContainer="false"
    :wrap-style="{ position: 'absolute', height: '800px' }"
    >
        <a-descriptions bordered :title="customizeModel.name" size="small">
            <a-descriptions-item label="操作" :span="3">
                <a-button-group>
                    <a-button type="primary" @click="updateCustomizeModel">
                        修改结构
                    </a-button>
                    <a-button @click="cancelModelEdit">
                        取消
                    </a-button>
                </a-button-group>
            </a-descriptions-item>
            <a-descriptions-item label="数据表名称" :span="3">
                <a-input
                v-model="customizeModel.name"
                disabled
                >
                </a-input>
            </a-descriptions-item>
            <a-descriptions-item label="schema" :span="3">
                <a-textarea
                v-model="schemaStr"
                :autoSize="true"
                @blur="e=>changeModelSchema(e.target.value)"
                >
                </a-textarea>
            </a-descriptions-item>
        </a-descriptions>
    </a-drawer>
    <a-row type="flex" justify="end" style="margin-bottom:10px;">
        <a-col :span="8">
        </a-col>
        <a-col :span="4">
            <a-button type="primary" shape="round" @click="scanSchemas"><a-icon type="container"/>扫描数据表</a-button>
        </a-col>
        <a-col :span="4">
            <a-button type="primary" shape="round" @click="showModal"><a-icon type="container"/>添加数据表</a-button>
        </a-col>
    </a-row>
    <a-modal title="添加数据表" v-model="addModelVisible" @ok="hideModal" okText="添加" cancelText="取消">
        <a-input
        placeholder="数据表名称"
        v-model="nameInput"
        >
        </a-input>
        <a-textarea placeholder="添加schema" :rows="4" style="margin-top:20px" v-model="descriptionInput"/>
        <a-button @click="getStructure" style="margin-top:10px">获取model结构</a-button>
    </a-modal>
    <a-modal title="选择要添加的数据库表" v-model="preAddTables" @ok="confirmAdd" okText="确定" cancelText="取消" :width="1000">
         <a-transfer
        :data-source="tables"
        :titles="['未添加', '待添加']"
        :locale="{itemUnit: '项', itemsUnit: '项', notFoundContent: '无项目'}"
        show-search
        :filter-option="filterOption"
        :target-keys="existSchemas"
        :selected-keys="preAddSchemas"
        :render="item => item.title"
        @change="handleChange"
        @selectChange="handleSelectChange"
        :list-style="{width:'450px',height:'300px'}"
        />
    </a-modal>
    <a-table
    :columns="columns"
    :dataSource="data"
    :rowKey="item => item._id"
    :pagination="pagination"
    :loading="loading"
    @change="handleTableChange"
    >
        <a slot="name" slot-scope="text">{{text}}</a>
        <span slot="action" slot-scope="text, record">
            <a-tooltip>
            <template slot="title">
                编辑数据表
            </template>
            <a-button type="primary" shape="circle" icon="edit" style='margin: 5px' @click="editModel(record)"></a-button>
            </a-tooltip>
            <a-tooltip>
            <template slot="title">
                配置
            </template>
            <a-button type="primary" shape="circle" icon="tool" style='margin: 5px' @click="configQuery(record)"></a-button>
            </a-tooltip>
        </span>
        <div slot="expandedRowRender" slot-scope="record">
        <a-row>
            <a-col :span="24">
                <p>数据表schema</p>
                <a-divider dashed/>
                <pre v-if="record.modelSchema" v-html="syntaxHighlight(record.modelSchema)" class="formated-json"></pre>
            </a-col>
        </a-row>
      </div>
    </a-table>
  </div>
</template>
<script>
import { EventBus } from '../../lib/event-bus.js'; //全局事件总线

const columns = [
    {
        title: '数据表名称',
        dataIndex: 'name',
        width: '70%',
        key: 'name'
    },
    {
        title: '操作',
        key: 'action',
        width: '30%',
        scopedSlots: { customRender: 'action' },
    },
];

export default {
    data() {
        return {
            data: [],
            pagination: {},
            loading: false,
            columns,
            mode: 'modelManage',
            addModelVisible: false,
            nameInput: "",
            descriptionInput: "",
            schema: {},
            showDetail: false,
            customizeModel: {},
            schemaStr: "{}",
            queryData: "",
            modelName: "",
            gotData: [],
            tables: [],
            preAddSchemas: [],
            existSchemas: [],
            preAddTables: false
        };
    },
    props:['appId', 'sourceId', 'sourceName'],
    methods:{
        configQuery(value) {
            EventBus.$emit('selectCollection', value);
            EventBus.$emit('modeChange', 'configQuery');
        },
        changeModelSchema(value) {
            try{
                this.customizeModel.modelSchema = JSON.parse(value);
                this.schemaStr = JSON.stringify(JSON.parse(value),null,2);
            }catch(e){
                console.error(e);
                this.$forceUpdate();
            }
        },
        updateCustomizeModel() {
            this.instance
            .patch(
            `/public/${this.customizeModel._id}/customizeModel`,
            {
                schema: this.customizeModel.modelSchema
            }
            )
            .then(response => {
                let result = response.data;
                if(!result.result){
                    this.$message.error('修改数据模型表结构失败');
                }else{
                    this.fetch({
                        page: this.pagination.page,
                        pageSize: this.pagination.pageSize,
                        source_id: this.sourceId
                    });
                }
            })
            .catch(function (error) { // 请求失败处理
                console.log(error);
            });
            this.showDetail = false;
        },
        cancelModelEdit(){
            this.showDetail = false;
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
        onDbTypeChange(value){
            this.dbType = value;
        },
        scanSchemas(){
            this.instance
            .get(
            '/public/getTable',
            {
                params:{
                    app_id: this.appId,
                    sourceName: this.sourceName
                }
            }
            )
            .then(response => {
                let result = response.data;
                if(!result.result){
                    this.$message.error('扫描数据库表失败');
                }else{
                    this.tables = [...result.preAddSchemas, ...result.existSchemas].map((item)=>{
                        return {
                            key: item,
                            title: item,
                            description: item,
                            disabled: result.existSchemas.includes(item)
                        }
                    });
                    this.preAddSchemas = [...result.preAddSchemas, ...result.existSchemas];
                    this.preAddTables = true;
                }
            })
            .catch(function (error) { // 请求失败处理
                console.log(error);
            });
        },
        handleChange(nextTargetKeys) {
            this.existSchemas = nextTargetKeys;
        },
        handleSelectChange(sourceSelectedKeys, targetSelectedKeys) {
            this.preAddSchemas = [...sourceSelectedKeys, ...targetSelectedKeys];
        },
        filterOption(inputValue, option) {
            return option.description.indexOf(inputValue) > -1;
        },
        confirmAdd(){
            this.preAddTables = false;
            this.instance
            .post(
            '/public/constructSelectedSchema',
            {
                app_id: this.appId,
                sourceName: this.sourceName,
                preAddSchemas: this.existSchemas
            }
            )
            .then(response => {
                let result = response.data;
                if(!result.result){
                    this.$message.error('添加数据库表失败');
                }else{
                    this.fetch({
                        source_id: this.sourceId,
                        pageSize: this.pagination.pageSize,
                        page: this.pagination.current
                    })
                }
            })
            .catch(function (error) { // 请求失败处理
                console.log(error);
            });
        },
        showModal(){
            this.addModelVisible = true;
        },
        hideModal(){
            let data = {
                source_id: this.sourceId,
                modelName: this.nameInput,
                schema: JSON.parse(this.descriptionInput)
            };
            let that = this;
            this.instance
            .post(
            '/public/customizeModel',
            data
            )
            .then(response => {
                let result = response.data;
                if(!result.result){
                    that.$message.error('添加数据来源失败');
                }
                that.fetch({
                    source_id: this.sourceId,
                    pageSize: that.pagination.pageSize,
                    page: that.pagination.current
                })
            })
            .catch(function (error) { // 请求失败处理
                console.log(error);
            });
            this.addModelVisible = false;
        },
        handleTableChange(pagination, filters, sorter) {
            const pager = { ...this.pagination };
            pager.current = pagination.current;
            this.pagination = pager;
            this.fetch({
                source_id: this.sourceId,
                pageSize: pagination.pageSize,
                page: pagination.current,
                sortField: sorter.field,
                sortOrder: sorter.order,
                ...filters,
            });
        },
        fetch(params = {}) {
            this.loading = true;
            let queryString = {
                params
            };
            this.instance
            .get(
            '/public/customizeModel',
            queryString
            )
            .then(response => {
                const pagination = { ...this.pagination };
                let result = response.data;
                pagination.total = result.count;
                pagination.pageSize = result.pageSize;
                this.loading = false;
                this.data = result.list;
                this.pagination = pagination;
            })
            .catch(function (error) { // 请求失败处理
                console.log(error);
            });
        },
        editModel(customizeModel){
            this.customizeModel = customizeModel;
            this.schemaStr = JSON.stringify(customizeModel.modelSchema, null, 2);
            this.showDetail = true;
        },
        onQueryChange(value){
            this.queryData = value;
        },
        confirmGet(){
            let queryString = {
                params:{
                    app_id: this.appId,
                    sourceName: this.sourceName,
                    modelName: this.modelName,
                    query: this.queryData
                }
            };
            this.instance
            .get(
            '/public/getData',
            queryString
            )
            .then(response => {
                let result = response.data;
                if(!result.result){
                    this.$message.error('获取数据失败');
                }else{
                    this.gotData = result.data;
                }
            })
            .catch(function (error) { // 请求失败处理
                console.log(error);
            });
        },
        onClose(){
            this.showDetail = false;
        },
        judgeColor(number){
            if(number<5){
                return 'orange';
            }else if(5<=number && number<10){
                return 'yellow';
            }else if(10<=number && number<20){
                return 'green';
            }else if(20<=number && number<50){
                return 'cyan';
            }else if(50<=number && number<100){
                return 'blue';
            }else if(100<=number && number<250){
                return 'purple';
            }else{
                return 'red';
            }
        },
        getStructure(){
            if(this.nameInput){
                let queryString = {
                    params:{
                        app_id: this.appId,
                        sourceName: this.sourceName,
                        modelName: this.nameInput
                    }
                };
                this.instance
                .get(
                '/public/getStructure',
                queryString
                )
                .then(response => {
                    let result = response.data;
                    if(!result.result){
                        this.$message.error('获取表结构失败');
                    }else{
                        this.descriptionInput = JSON.stringify(result.structure,null,2);
                    }
                })
                .catch(function (error) { // 请求失败处理
                    console.log(error);
                });
            }else{
                this.$message.error('缺少表名称');
            }
        }
    },
    mounted(){
        //注册事件监听
        this.fetch({
            page:1,
            pageSize:15,
            source_id: this.sourceId
        });
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
