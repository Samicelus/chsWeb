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
        <a-descriptions bordered :title="dataSource.sourceName" size="small">
            <a-descriptions-item label="数据来源名称" :span="2">
                <a-input 
                v-model="dataSource.sourceName"
                >
                </a-input>
            </a-descriptions-item>
            <a-descriptions-item label="来源连通性" :span="1">
                <a-tag 
                :color="dataSource.tested?'green':'red'"
                >
                {{dataSource.tested?'已连通':'未连通'}}
                </a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="描述" :span="3">
                <a-textarea 
                v-model="dataSource.description"
                >
                </a-textarea>
            </a-descriptions-item>
            <a-descriptions-item label="数据库类型" :span="1">
                <a-select
                v-model="dataSource.dbType"
                :options="dbTypes"
                style="width:100%"
                >
                </a-select>
            </a-descriptions-item>
            <a-descriptions-item label="数据库名" :span="2">
                <a-input 
                v-model="dataSource.dbName"
                >
                </a-input>
            </a-descriptions-item>
            <a-descriptions-item label="访问地址" :span="3">
                <a-input 
                v-model="dataSource.connectStr"
                >
                </a-input>
            </a-descriptions-item>
            <a-descriptions-item label="用户名" :span="1">
                <a-input 
                v-model="dataSource.login"
                >
                </a-input>
            </a-descriptions-item>
            <a-descriptions-item label="密码" :span="2">
                <a-input 
                v-model="dataSource.password"
                >
                </a-input>
            </a-descriptions-item>
            <a-descriptions-item label="数据映射数" :span="3">
               <a-badge 
               status="processing" 
               :text="dataSource.modelCount?dataSource.modelCount.toString():'0'" 
               :color="judgeColor(dataSource.modelCount)"
               />
            </a-descriptions-item>
        </a-descriptions>
        <a-divider dashed/>
        <a-row>
            <a-col :span="12">
            </a-col>
            <a-col :span="12">
                <a-button-group>
                    <a-button type="primary" icon="edit" @click="updateSource">修改</a-button>
                    <a-button icon="stop" @click="cancelSource">取消</a-button>
                </a-button-group>
            </a-col>
        </a-row>
    </a-drawer>
    <a-row type="flex" justify="end" style="margin-bottom:10px;">
        <a-col :span="8">
        </a-col>
        <a-col :span="4">
        </a-col>
        <a-col :span="4">
            <a-button type="primary" shape="round" @click="showModal"><a-icon type="database"/>添加数据来源</a-button>
        </a-col>
    </a-row>
    <a-modal title="添加数据来源" v-model="addDataSourceVisible" @ok="hideModal" okText="添加" cancelText="取消">
        <a-input 
        placeholder="数据来源名称" 
        v-model="nameInput"
        >
        </a-input>
        <a-textarea placeholder="添加描述" :rows="4" style="margin-top:20px" v-model="descriptionInput"/>
        
        <a-input
        defaultValue="数据库类型"
        style="margin-top:20px"
        disabled
        >
            <a-select
            slot="addonAfter"
            defaultValue="mongodb"
            :options="dbTypes"
            @change="onDbTypeChange"
            >
            </a-select>
        </a-input>
        <a-input 
        placeholder="访问地址"
        v-model="connectStr"
        style="margin-top:20px"
        >
        </a-input>
        <a-input
        placeholder="数据库名"
        v-model="dbName"
        style="margin-top:20px"
        >
        <a-divider dashed>安全</a-divider>
        </a-input>
        <a-input 
        placeholder="用户名"
        v-model="login"
        style="margin-top:20px"
        >
        </a-input>
        <a-input 
        placeholder="密码"
        v-model="password"
        style="margin-top:20px"
        >
        </a-input>
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
        <span slot="connection" slot-scope="record">
            <a-tag :color="record.tested?'green':'red'">{{record.tested?'已连通':'未连通'}}</a-tag>
            <p style="font-size:10px;color:#aaa">{{record.testTime}}</p>
        </span>
        <span slot="action" slot-scope="text, record">
            <a-tooltip>
            <template slot="title">
                测试连通性
            </template>
            <a-button type="primary" shape="circle" icon="file-protect" style='margin: 5px' @click="testConnection(record)"></a-button>
            </a-tooltip>
            <a-tooltip>
            <template slot="title">
                编辑数据源
            </template>
            <a-button type="primary" shape="circle" icon="edit" style='margin: 5px' @click="editSource(record)"></a-button>
            </a-tooltip>
            <a-tooltip>
            <template slot="title">
                配置数据表
            </template>
            <a-button type="primary" shape="circle" icon="container" style='margin: 5px' @click="configModel(record)"></a-button>
            </a-tooltip>
        </span>
    </a-table>
  </div>
</template>
<script>
import { EventBus } from '../../lib/event-bus.js'; //全局事件总线

const columns = [
    {
        title: '数据源名称',
        dataIndex: 'sourceName',
        width: '10%',
        key: 'name'
    },
    {
        title: '数据库类型',
        dataIndex: 'dbType',
        width: '10%',
        key: 'dbType',
    },
    {
        title: '表映射数',
        dataIndex: 'modelCount',
        width: '10%',
        key: 'modelCount',
    },
    {
        title: '访问地址',
        dataIndex: 'connectStr',
        width: '20%',
        key: 'connectStr',
    },
    {
        title: '数据库名',
        dataIndex: 'dbName',
        width: '10%',
        key: 'dbName',
    },
    {
        title: '连通性',
        key: 'tested',
        width: '10%',
        scopedSlots: { customRender: 'connection' },
    },
    {
        title: '操作',
        key: 'action',
        width: '20%',
        scopedSlots: { customRender: 'action' },
    }
];

export default {
    data() {
        return {
            data: [],
            pagination: {},
            loading: false,
            columns,
            mode: 'dataSourceManage',
            addDataSourceVisible: false,
            nameInput: "",
            descriptionInput: "",
            dbTypes: [{label:"mongodb",value:"mongodb"},{label:"mysql",value:"mysql"}],
            dbType: "mongodb",
            connectStr: "",
            dbName: "",
            login: "",
            password: "",
            showDetail: false,
            dataSource: {}
        };
    },
    props:['appId'],
    methods:{
        onDbTypeChange(value){
            this.dbType = value;
        },
        showModal(){
            this.addDataSourceVisible = true;
        },
        hideModal(){
            let data = {
                app_id: this.appId,
                sourceName: this.nameInput,
                description: this.descriptionInput,
                dbType: this.dbType,
                connectStr: this.connectStr,
                dbName: this.dbName,
                login: this.login,
                password: this.password
            };
            let that = this;
            this.instance
            .post(
            '/public/sourceConfig',
            data
            )
            .then(response => {
                let result = response.data;
                if(!result.result){
                    that.$message.error('添加数据来源失败');
                }
                that.fetch({
                    app_id: this.appId,
                    pageSize: that.pagination.pageSize,
                    page: that.pagination.current
                })
            })
            .catch(function (error) { // 请求失败处理
                console.log(error);
            });
            this.addDataSourceVisible = false;
        },
        handleTableChange(pagination, filters, sorter) {
            const pager = { ...this.pagination };
            pager.current = pagination.current;
            this.pagination = pager;
            this.fetch({
                app_id: this.appId,
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
            '/public/sourceConfig',
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
        testConnection(dataSource){
            this.loading = true;
            this.instance
            .post(
            '/public/testDataSource',
            {
                source_id: dataSource._id
            }
            )
            .then(response => {
                let result = response.data;
                if(!result.result){
                    this.$message.error('测试连通性失败');
                }
                this.$message.info(`连通性: ${result.connected?'连通':'未连通'}`);
                this.fetch({
                    app_id: this.appId,
                    pageSize: this.pagination.pageSize,
                    page: this.pagination.current
                })
            })
            .catch(function (error) { // 请求失败处理
                console.log(error);
            });
        },
        updateSource(){
            this.instance
            .patch(
            `/public/${this.dataSource._id}/sourceConfig`,
            {
                dbType: this.dataSource.dbType,
                dbName: this.dataSource.dbName,
                connectStr: this.dataSource.connectStr,
                description: this.dataSource.description,
                login: this.dataSource.login,
                password: this.dataSource.password
            }
            )
            .then(response => {
                let result = response.data;
                if(!result.result){
                    this.$message.error('修改数据源失败');
                }else{
                    this.$message.info('修改数据源成功');
                }
                this.fetch({
                    app_id: this.appId,
                    pageSize: this.pagination.pageSize,
                    page: this.pagination.current
                })
            })
            .catch(function (error) { // 请求失败处理
                console.log(error);
            });
            this.showDetail = false;
        },
        cancelSource(){
            this.fetch({
                app_id: this.appId,
                pageSize: this.pagination.pageSize,
                page: this.pagination.current
            });
            this.showDetail = false;
        },
        editSource(dataSource){
            this.dataSource = dataSource;
            this.showDetail = true;
        },
        configModel(value){
            EventBus.$emit('selectSource', value);
            EventBus.$emit('modeChange', 'modelManage');
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
        updateDepartment(field, value){
            let data = {};
            data[field] = value
            this.instance
            .patch(
            `/public/${this.department._id}/department`,
            data
            )
            .then(response => {
                let result = response.data;
                if(!result.result){
                    this.$message.error('修改科室信息失败');
                }else{
                    this.fetch({
                        page:1,
                        pageSize:15,
                        app_id: this.appId
                    });
                }
            })
            .catch(function (error) { // 请求失败处理
                console.log(error);
            });
        },
    },
    mounted(){
        //注册事件监听
        this.fetch({
            page:1,
            pageSize:15,
            app_id: this.appId
        });
    }
};
</script>