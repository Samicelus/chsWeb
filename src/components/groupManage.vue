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
        <a-descriptions bordered :title="department.name" size="small">
            <a-descriptions-item label="科室名称" :span="3">
                <a-input 
                v-model="department.name"
                @keyup.enter="e=>onNameChange(e.target.value)"
                @blur="e=>onNameChange(e.target.value)"
                >
                </a-input>
            </a-descriptions-item>
            <a-descriptions-item label="科室描述" :span="3">
                <a-textarea 
                v-model="department.description"
                @keyup.enter="e=>onDescriptionChange(e.target.value)"
                @blur="e=>onDescriptionChange(e.target.value)"
                >
                </a-textarea>
            </a-descriptions-item>
            <a-descriptions-item label="科室人数" :span="1">
               <a-badge 
               status="processing" 
               :text="department.count?department.count.toString():'0'" 
               :color="judgeColor(department.count)"
               />
            </a-descriptions-item>
        </a-descriptions>
    </a-drawer>
    <a-row type="flex" justify="end" style="margin-bottom:10px;">
        <a-col :span="8">
        </a-col>
        <a-col :span="4">
        </a-col>
        <a-col :span="4">
            <a-button type="primary" shape="round" @click="showModal"><a-icon type="usergroup-add"/>添加科室</a-button>
        </a-col>
    </a-row>
    <a-modal title="添加科室" v-model="addGroupVisible" @ok="hideModal" okText="添加" cancelText="取消">
        <a-input placeholder="科室名称" v-model="nameInput"></a-input>
        <a-textarea placeholder="添加描述" :rows="4" style="margin-top:20px" v-model="descriptionInput"/>
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
                编辑科室
            </template>
            <a-button type="primary" shape="circle" icon="edit" style='margin: 5px' @click="editGroup(record)"></a-button>
            </a-tooltip>
        </span>
    </a-table>
  </div>
</template>
<script>
//import { EventBus } from '../lib/event-bus.js'; //全局事件总线

const columns = [
    {
        title: '科室名称',
        dataIndex: 'name',
        width: '20%',
        key: 'name'
    },
    {
        title: '描述',
        dataIndex: 'description',
        width: '20%',
        key: 'description'
    },
    {
        title: '医生数',
        dataIndex: 'count',
        width: '30%',
        key: 'count',
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
            mode: 'groupManage',
            addGroupVisible: false,
            nameInput: "",
            descriptionInput: "",
            showDetail: false,
            department: {
                name: "",
                description: ""
            }
        };
    },
    props:['appId'],
    methods:{
        showModal(){
            this.addGroupVisible = true;
        },
        hideModal(){
            this.addGroupVisible = false;
            let data = {
                department: {
                    name: this.nameInput,
                    description: this.descriptionInput
                },
                app_id: this.appId
            };
            let that = this;
            this.instance
            .post(
            '/public/department',
            data
            )
            .then(response => {
                let result = response.data;
                if(!result.result){
                    that.$message.error('添加科室失败');
                }
                that.fetch({
                    pageSize: that.pagination.pageSize,
                    page: that.pagination.current
                })
            })
            .catch(function (error) { // 请求失败处理
                console.log(error);
            });
        },
        handleTableChange(pagination, filters, sorter) {
            const pager = { ...this.pagination };
            pager.current = pagination.current;
            this.pagination = pager;
            this.fetch({
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
            queryString.params.app_id = this.appId
            this.instance
            .get(
            '/public/listDepartment',
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
        editGroup(department){
            this.department = department;
            this.showDetail = true;
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
        onNameChange(value){
            this.updateDepartment('name', value);
        },
        onDescriptionChange(value){
            this.updateDepartment('description', value);
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
                        pageSize:15
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
            pageSize:15
        });
    }
};
</script>