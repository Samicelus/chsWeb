<template>
  <div>
    <a-row type="flex" justify="end" style="margin-bottom:10px;">
      <a-col :span="8">
      </a-col>
      <a-col :span="4">
        <a-button type="primary" shape="round" @click="showRoleAdd"><a-icon type="usergroup-add"/>添加角色</a-button>
      </a-col>
      <a-col :span="4">
        <a-button type="primary" shape="round" @click="showUserAdd"><a-icon type="user-add"/>添加用户</a-button>
      </a-col>
    </a-row>
    <a-modal title="添加用户" v-model="addUserVisible" @ok="addUser" okText="添加" cancelText="取消">
      <a-input placeholder="用户名" v-model="nameInput"></a-input>
      选择用户角色
      <a-divider type="vertical" />
      <a-select
      show-search
      option-filter-prop="children"
      :filter-option="(input, option)=>filterRole(input, option.componentOptions.children[0].text)"
      :options="roleOptions"
      @focus="getRoles"
      style="margin-top:20px;width:83.7%"
      @change="onSelectRole"
      destroyOnClose
      >
      </a-select>
    </a-modal>
    <a-modal title="设置角色" v-model="setRoleVisible" @ok="setUserRole" okText="修改" cancelText="取消">
        <a-input-group compact>
            <a-input defaultValue="角色" disabled style="width:12%"/>
            <a-select
            show-search
            v-model="role_id"
            option-filter-prop="children"
            :filter-option="(input, option)=>filterRole(input, option.componentOptions.children[0].text)"
            :options="roleOptions"
            @focus="getRoles"
            style="width:83.7%"
            @change="onSelectRole"
            destroyOnClose
            >
            </a-select>
        </a-input-group>
    </a-modal>
    <a-modal title="添加角色" v-model="addRoleVisible" @ok="addRole" okText="添加" cancelText="取消">
      <a-input placeholder="角色名称" v-model="tempRolename" addonBefore="角色名称"></a-input>
      <a-divider orientation="left">权限设置</a-divider>
      <a-tree
      checkable
      :tree-data="accessOptions"
      @check="onCheck" 
      >
      </a-tree>
    </a-modal>
    <a-modal title="编辑用户可见范围" v-model="modScopVisible" @ok="modifyUserScope" okText="修改" cancelText="取消">
        <a-transfer
        :data-source="mockData"
        :target-keys="targetKeys"
        :selected-keys="selectedKeys"
        :locale="local"
        :titles="['医院列表', '已选择医院']"
        :render="item => item.title"
        @change="handleChange"
        @selectChange="handleSelectChange"
        style="text-align:left"
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
      <span slot="scope_oid" slot-scope="scope_oid">
        <div v-if="scope_oid">
            <p v-for="hospital in scope_oid.scope" :key="hospital.hospitalId">{{hospital.hospitalName}}</p>
        </div>
      </span>
      <span slot="role_oid" slot-scope="role_oid">
        <div v-if="role_oid">
            <a-tag :color="role_oid.isAdmin?'red':'blue'">
                {{role_oid.isAdmin?"超级管理员":"普通用户"}}
            </a-tag>
            <a-tag color="green">
                {{role_oid.name}}
            </a-tag>
            <a-divider dashed/>
            <a-tree :tree-data="role_oid.accessTree" show-icon default-expand-all>
                <a-icon slot="apartment" type="apartment" />
                <a-icon slot="block" type="block" />
            </a-tree>
        </div>
      </span>
      <span slot="action" slot-scope="text, record">
        <a-tooltip>
          <template slot="title">
            编辑用户可见医院
          </template>
          <a-button type="primary" shape="circle" icon="eye" style='margin: 5px' @click="handleEdit(record._id, record.scope_oid)" :disabled="record.role_oid.isAdmin"></a-button>
        </a-tooltip>
        <a-tooltip>
          <template slot="title">
            重置密码
          </template>
          <a-button type="primary" shape="circle" icon="undo" style='margin: 5px' @click="handleReset(record._id)" :disabled="record.role_oid.isAdmin"></a-button>
        </a-tooltip>
        <a-tooltip>
          <template slot="title">
            设置角色
          </template>
          <a-button type="primary" shape="circle" icon="user" style='margin: 5px' @click="setRole(record._id, record.role_oid._id)" :disabled="record.role_oid.isAdmin"></a-button>
        </a-tooltip>
      </span>
    </a-table>
  </div>
</template>
<script>
  //import { EventBus } from '../lib/event-bus.js'; //全局事件总线

  const columns = [
    {
        title: '昵称',
        dataIndex: 'nickname',
        width: '20%',
        key: 'nickname'
    },
    {
        title: '权限',
        dataIndex: 'role_oid',
        width: '20%',
        key: 'role_oid',
        scopedSlots: { customRender: 'role_oid' }
    },
    {
      title: '可见医院',
      dataIndex: 'scope_oid',
      width: '30%',
      key: 'scope_oid',
      scopedSlots: { customRender: 'scope_oid' }
    },
    {
        title: '初始密码',
        dataIndex: 'defaultPwd',
        width: '10%',
        key: 'defaultPwd'
    },
    {
      title: '操作',
      key: 'action',
      width: '20%',
      scopedSlots: { customRender: 'action' },
    },
  ];

  export default {
    data() {
      return {
        user_id: "",
        data: [],
        pagination: {},
        loading: false,
        columns,
        mode: 'users',
        addUserVisible: false,
        role_id: "",
        nameInput: "",
        roleOptions: [],
        addRoleVisible: false,
        setRoleVisible: false,
        tempRolename: "",
        modScopVisible: false,
        mockData: [],
        local:{
            itemUnit: "家 医院",
            itemsUnit: "家 医院"
        },
        targetKeys: [],
        selectedKeys: [],
        hospitalMap:{},
        accessOptions: [],
        access: []
      };
    },
    props: ['moduleMap', 'powerMap'],
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
            let that = this;
            this.instance
            .get(
            '/private/user',
            {params}
            )
            .then(response => {
                const pagination = { ...this.pagination };
                let result = response.data;
                pagination.total = result.count;
                pagination.pageSize = Number(result.pageSize);
                this.loading = false;
                this.data = result.list;
                let that = this;
                this.data.forEach(user=>{
                    if(user.role_oid && user.role_oid.access){
                        user.role_oid.accessTree = 
                        user.role_oid.access.map((access, aIndex)=>{
                            return {
                                title: that.moduleMap[access.module] || access.module,
                                key: `${aIndex}`,
                                slots: {
                                    icon: 'apartment'
                                },
                                children: access.power.map((power, pIndex)=>{
                                    return {
                                        title: that.powerMap[power] || power,
                                        key: `${aIndex}-${pIndex}`,
                                        slots: {
                                            icon: 'block'
                                        }
                                    }
                                })
                            }
                        });
                    }
                })
                this.pagination = pagination;
            })
            .catch(function (error) { // 请求失败处理
                console.log(error);
                that.$message.error(error.message)
                that.loading = false;
            });
        },
        setRole(id, role_id){
            this.user_id = id;
            this.role_id = role_id;
            this.setRoleVisible = true;
        },
        handleEdit(id, scope_oid){
            this.user_id = id;
            if(scope_oid){
                this.targetKeys = scope_oid.scope? scope_oid.scope
                .filter(item=>item.hospitalId||item.company_oid)
                .map(item=>item.hospitalId?item.hospitalId.toString():item.company_oid.toString()):[];
            }else{
                this.targetKeys = [];
            }
            this.getCompanies();
            this.modScopVisible = true;
        },
        handleReset(id){
            this.instance
            .patch(`/private/user/${id}/reset/password`)
            .then(response => {
                let {result} = response.data;
                if(result){
                    this.$message.info('成功重置用户密码,请复制初始密码并分发给用户!');
                    this.fetch();
                }else{
                    this.$message.error('重置用户密码失败');
                }
            })
            .catch(function (error) { // 请求失败处理
                console.log(error);
            });
        },
        showRoleAdd(){
            this.addRoleVisible = true;
        },
        addRole(){
            this.instance
            .post(
            '/private/user/role',
            {
                name: this.tempRolename,
                access: this.access
            }
            )
            .then(response => {
                let {result} = response.data;
                if(result){
                    this.$message.info('添加角色成功');
                }else{
                    this.$message.error('添加角色失败');
                }
            })
            .catch(function (error) { // 请求失败处理
                console.log(error);
            });
            this.tempRolename = "";
            this.addRoleVisible = false;
        },
        showUserAdd(){
            this.addUserVisible = true;
        },
        addUser(){
            this.instance
            .post(
            '/private/user',
            {
                username: this.nameInput,
                role_id: this.role_id
            }
            )
            .then(response => {
                let {result} = response.data;
                if(result){
                    this.$message.info('添加用户成功');
                    this.fetch(
                        {
                            page:1,
                            pageSize:15
                        }
                    );
                }else{
                    this.$message.error('添加用户失败');
                }
            })
            .catch(function (error) { // 请求失败处理
                console.log(error);
            });
            this.nameInput = "";
            this.addUserVisible = false;
        },
        setUserRole(){
            this.instance
            .patch(
            `/private/user/${this.user_id}/role`,
            {
                role_id: this.role_id
            }
            )
            .then(response => {
                let {result} = response.data;
                if(result){
                    this.$message.info('修改用户角色成功');
                    this.fetch(
                        {
                            page: this.pagination.current,
                            pageSize: this.pagination.pageSize
                        }
                    );
                }else{
                    this.$message.error('修改用户角色失败');
                }
            })
            .catch(function (error) { // 请求失败处理
                console.log(error);
            });
            this.setRoleVisible = false;
        },
        getRoles(){
            this.instance
            .get(
            '/private/user/roles'
            )
            .then(response => {
                let {list} = response.data;
                this.roleOptions = list
                .filter(item=>item.name && item._id && !item.isAdmin)
                .map((item)=>{
                    return {
                        label: item.name,
                        value: item._id,
                        isLeaf: true
                    }
                })
            })
            .catch(function (error) { // 请求失败处理
                console.log(error);
            });
        },
        onSelectRole(value){
            this.role_id = value;
        },
        filterRole(input, text){
            let regex = new RegExp(input);
            return regex.test(text);
        },
        handleChange(nextTargetKeys) {
            this.targetKeys = nextTargetKeys;
        },
        handleSelectChange(sourceSelectedKeys, targetSelectedKeys) {
            this.selectedKeys = [...sourceSelectedKeys, ...targetSelectedKeys];
        },
        getCompanies(){
            this.instance
            .get(
            '/private/consultModulation/company'
            )
            .then(response => {
                let {list} = response.data;
                let that = this;
                this.mockData = [];
                let companies = [];
                for(let companyType of list){
                    for(let company of companyType.list){
                        companies.push(company);
                    }
                }
                companies.forEach((item)=>{
                    if(item.hospitalId){
                        that.mockData.push({
                            key: item.hospitalId.toString(),
                            title: item.hospitalName
                        })
                        that.hospitalMap[item.hospitalId.toString()] = item.hospitalName;
                    }
                    if(item._id){
                        that.mockData.push({
                            key: item._id.toString(),
                            title: item.company_name
                        })
                        that.hospitalMap[item._id.toString()] = item.company_name;
                    }
                })
            })
            .catch(function (error) { // 请求失败处理
                console.log(error);
            });
        },
        modifyUserScope(){
            let that = this;
            this.instance
            .patch(
            `/private/user/${this.user_id}/scope`,
            {
                scope: this.targetKeys.map(item=>{
                    let companyInfo = {}
                    if(isNaN(Number(item))){
                        companyInfo.company_oid = item.toString();
                    }else{
                        companyInfo.hospitalId = item.toString();
                    }
                    companyInfo.hospitalName = that.hospitalMap[item]
                    return companyInfo;
                })
            }
            )
            .then(response => {
                let result = response.data;
                if(result.result){
                    this.$message.info('可见医院修改成功');
                    this.fetch({
                        page: this.pagination.page,
                        pageSize: this.pagination.pageSize
                    })
                }else{
                    this.$message.error('可见医院修改失败');
                }
            })
            .catch(function (error) { // 请求失败处理
                console.log(error);
            });
            this.modScopVisible = false;
        },
        onCheck(checkedKeys){
            let access = {};
            checkedKeys.forEach(checkedKey=>{
                let first = checkedKey.split('|')[0];
                let second = checkedKey.split('|')[1];
                if(!access[first]){
                    access[first] = []
                }
                access[first].push(second)
            })
            this.access = [];
            for(let module in access){
                this.access.push({
                    module,
                    power: access[module]
                })
            }
        }
    },
    mounted(){
      //注册事件监听
      this.fetch({
        page:1,
        pageSize:15
      });
      for(let moduleKey in this.moduleMap){
          let module = {
              title: this.moduleMap[moduleKey],
              key: moduleKey,
              disableCheckbox: true,
              children: []
          }
          for(let powerKey in this.powerMap){
              module.children.push({
                  title: this.powerMap[powerKey],
                  key: `${moduleKey}|${powerKey}`
              })
          } 
          this.accessOptions.push(module);
      }
    }
  };
</script>