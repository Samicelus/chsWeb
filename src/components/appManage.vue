<template>
  <div>
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
                管理科室
            </template>
            <a-button type="primary" shape="circle" icon="team" style='margin: 5px' @click="toGroupManage(record._id)"></a-button>
            </a-tooltip>
            <a-tooltip>
            <template slot="title">
                管理医生
            </template>
            <a-button type="primary" shape="circle" icon="user" style='margin: 5px' @click="doctorManage(record._id)"></a-button>
            </a-tooltip>
        </span>
    </a-table>
  </div>
</template>
<script>
import { EventBus } from '../lib/event-bus.js'; //全局事件总线

const columns = [
    {
        title: '应用名称',
        dataIndex: 'name',
        width: '20%',
        key: 'name'
    },
    {
        title: '医院',
        dataIndex: 'company_oid.company_name',
        width: '20%',
        key: 'company_name'
    },
    {
        title: '简介',
        dataIndex: 'description',
        width: '30%',
        key: 'description',
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
            mode: 'appManage',
            nameInput: "",
            descriptionInput: "",
            companyOptions: [],
            company_id: "",
            tempAppId: "",
            tempSecret: "",
            tempAgentid: "",
        };
    },
    methods:{
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
            this.instance
            .get(
            '/private/consultModulation/appConfig',
            {params}
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
        toGroupManage(value){
            EventBus.$emit('selectApp', value);
            EventBus.$emit('modeChange', 'groupManage');
        },
        doctorManage(value){
            EventBus.$emit('selectApp', value);
            EventBus.$emit('modeChange', 'doctorManage');
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