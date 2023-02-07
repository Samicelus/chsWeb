<template>
  <div>
    <a-row type="flex" justify="end" style="margin-bottom:10px;">
      <a-col :span="8">
      </a-col>
      <a-col :span="4">
      </a-col>
      <a-col :span="4">
        <a-button type="primary" shape="round" @click="showModal"><a-icon type="folder-add"/>添加接口</a-button>
      </a-col>
    </a-row>
    <a-modal title="添加接口" v-model="addSetVisible" @ok="hideModal" @cancel="clearModal" okText="添加" cancelText="取消">
      <a-input placeholder="接口名称" v-model="nameInput"></a-input>
      <a-textarea placeholder="添加接口描述" :rows="4" style="margin-top:20px" v-model="descriptionInput"/>
      选择实例
      <a-divider type="vertical" />
      <a-select
      show-search
      v-model="company.hospitalId"
      option-filter-prop="children"
      :filter-option="(input, option)=>filterCompany(input, option.componentOptions.children[0].text)"
      @focus="getCompany"
      style="margin-top:20px;width:83.7%"
      @change="onSelectCompany"
      destroyOnClose
      >
        <a-select-opt-group v-for="companyType in companyOptions" :key="companyType.name" :label="companyType.name">
            <a-select-option v-for="a in companyType.list" :key="a.hospitalId || a._id" :title="a.hospitalName || a.company_name">
            {{a.hospitalName || a.company_name}}
            </a-select-option>
        </a-select-opt-group>
      </a-select>
        <a-divider dashed/>
        <a-row v-if="!showGroupSelect" type="flex" justify="center">
            <a-col :span="8">
                <a-button type="primary" @click="showGroup">按分类添加接口模板</a-button>
            </a-col>
        </a-row>
        <a-row v-else>
            <a-col :span="18">
                <a-select 
                style="width:100%"
                show-search
                placeholder="搜索接口厂商模板名称，所属接口类别名称"
                :default-active-first-option="false"
                :show-arrow="false"
                :filter-option="false"
                :not-found-content="null"
                @focus="searchTemplate('')"
                @search="searchTemplate"
                @change="changeTemplate"
                class="selectTag"
                >
                    <a-select-opt-group v-for="(apiTemplate, group_id) in apiTemplates" :key="group_id" :label="apiTemplate[0].apiGroup_oid.groupName">
                        <a-select-option v-for="a in apiTemplate" :key="`${group_id}|${apiTemplate[0].apiGroup_oid.groupName}|${a._id}|${a.templateName}`">
                            <a-row type="flex" justify="space-between">
                                <a-col :span="8">
                                    {{a.templateName}} 
                                </a-col>
                                <a-col :span="8">
                                    Ver: <a-tag>{{a.version}}</a-tag>
                                </a-col>
                            </a-row>
                        </a-select-option>
                    </a-select-opt-group>
                </a-select>
            </a-col>
            <a-col :span="6">
                <a-button type="primary" style="margin-left:10px" @click="addTemplate">添加</a-button>
            </a-col>
        </a-row>

        <a-row v-for="(addedTemplate, group_key) in addTemplates" :key="group_key" style="margin-top:10px">
            <a-col :span="2">
                <a-button size="small" type="danger" shape="circle" icon="minus"
                @click="e=>deleteAdded(group_key)"
                >
                </a-button>
            </a-col>
            <a-col :span="12">
                <span>{{addedTemplate.templateName}}</span>
            </a-col>
            <a-col :span="10">
                <a-tag>{{addedTemplate.groupName}}</a-tag>
            </a-col>
        </a-row>
    </a-modal>
    <a-modal title="配置应用" v-model="configVisible" @ok="setApp" okText="设置" cancelText="取消">
        <a-input placeholder="应用Secret" v-model="tempSecret" addonBefore="应用Secret"></a-input>
        <a-divider dashed/>
        <a-input placeholder="应用agentid" v-model="tempAgentid" addonBefore="应用agentid"></a-input>
    </a-modal>
    <a-modal :title="editAlertBotAppName" v-model="editAlertBotVisible" @ok="confirmEditAlertBot" okText="设置告警" cancelText="取消">
        <a-input v-model="tempWebhook" addonBefore="告警webhook地址" placeholder="https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key="></a-input>
        <p><a-icon type="warning" /> webhook地址在目标企业微信群-设置-群机器人中查看</p>
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
      <a slot="hospitalName" slot-scope="record">{{record.company?record.company.hospitalName:(record.company_oid?record.company_oid.company_name:"")}}({{record.company?record.company.hospitalId:(record.company_oid?record.company_oid._id:"")}})</a>
      <span slot="action" slot-scope="text, record">

        <a-dropdown>
            <a-menu slot="overlay">
                <a-menu-item key="1">
                    <a-button :block="true" type="primary" icon="api" style='margin: 5px' @click="handleEditApi(record._id)">
                        <a-badge :count="record.errorCount" dot>
                        接口配置
                        </a-badge>
                    </a-button>
                </a-menu-item>
                <a-menu-item key="2">
                    <a-button :block="true" type="primary" icon="warning" style='margin: 5px' @click="handleEditAlert(record._id, record.name, (record.qywechat && record.qywechat.alertBot)?record.qywechat.alertBot.webhook:'')">
                        告警配置
                    </a-button>
                </a-menu-item>
                <a-menu-item key="3">
                    <a-button :block="true" type="primary" icon="database" style='margin: 5px' @click="handleBackup(record._id)">
                        备份还原
                    </a-button>
                </a-menu-item>
                <a-menu-item key="4">
                    <a-button :block="true" type="primary" icon="api" style='margin: 5px' @click="handleEditApi2(record._id)">
                        <a-badge :count="record.errorCount" dot>
                        接口配置 V2.0
                        </a-badge>
                    </a-button>
                </a-menu-item>
                <a-menu-item key="5">
                    <a-button :block="true" type="primary" icon="control" style='margin: 5px' @click="handleEditCustomize(record._id)">公用参数配置</a-button>
                </a-menu-item>
                <a-menu-item key="6">
                    <a-button :block="true" type="primary" icon="database" style='margin: 5px' @click="handleDataSource(record._id)">数据源配置</a-button>
                </a-menu-item>
                <!--
                <a-menu-item key="4">
                    <a-button :block="true" type="primary" icon="setting" style='margin: 5px' @click="configurate(record._id, record.qywechat?record.qywechat.secret:'', record.qywechat?record.qywechat.agentid:'')">配置应用</a-button>
                </a-menu-item>
                -->
                <a-menu-item key="7">
                    <a-button :block="true" type="primary" icon="warning" style='margin: 5px' @click="handleGetEventFailLog(record._id)">事件调用失败记录</a-button>
                </a-menu-item>
                <a-menu-item key="8">
                    <a-popconfirm
                    title="亲,真的要抛弃我吗？"
                    okText="狠心删除"
                    cancelText="手下留情"
                    @confirm="handleDelete(record._id)"
                    >
                        <a-icon slot="icon" type="aliwangwang" style="color:red"/>
                        <a-button :block="true" type="primary" icon="delete" style='margin: 5px'>删除接口</a-button>
                    </a-popconfirm>
                </a-menu-item>
            </a-menu>
                <a-button :block="true">
                <a-badge :count="record.errorCount" dot>
                    <a-row type="flex" justify="space-between">
                        <a-col :span="6">
                        操作
                        </a-col>
                        <a-col :span="2">
                            <a-icon type="down"/>
                        </a-col>
                    </a-row>
                </a-badge>
                </a-button>
        </a-dropdown>
      </span>
    </a-table>
  </div>
</template>
<script>
  import { EventBus } from '../lib/event-bus.js'; //全局事件总线

  const columns = [
    {
      title: '接口名称',
      dataIndex: 'name',
      width: '20%',
      key: 'name'
    },
    {
        title: '应用实例',
        width: '20%',
        key: 'hospitalName',
        scopedSlots: { customRender: 'hospitalName' },
    },
    {
      title: '简介',
      dataIndex: 'description',
      width: '40%',
      key: 'description',
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
        showGroupSelect: false,
        apiTemplates: [],
        selectedTemplate: "",
        addTemplates: {},
        data: [],
        pagination: {},
        loading: false,
        columns,
        mode: 'appConfig',
        addSetVisible: false,
        nameInput: "",
        descriptionInput: "",
        companyOptions: [],
        companyMap:{},
        company: {},
        hisTemplate:"",
        caTemplate:"",
        configVisible: false,
        tempAppId: "",
        tempSecret: "",
        tempAgentid: "",
        specifiedCompany: "",
        editAlertBotVisible: false,
        editAlertBotAppId: "",
        editAlertBotAppName: "",
        tempWebhook: "",
        company_id: "",
      };
    },
    methods:{
        searchTemplate(search){
            this.instance
            .get(
            '/private/consultModulation/apiTemplate/search',
            {
                params: {
                    search
                }
            }
            )
            .then(response => {
                this.apiTemplates = response.data.templates;
            })
            .catch(function (error) { // 请求失败处理
                console.log(error);
            });
        },
        changeTemplate(value){
            this.selectedTemplate = value;
        },
        showGroup(){
            this.showGroupSelect = true;
            this.apiTemplates = [];
        },
        addTemplate(){
            if(this.selectedTemplate){
                let group_id = this.selectedTemplate.split('|')[0];
                let groupName = this.selectedTemplate.split('|')[1];
                let template_id = this.selectedTemplate.split('|')[2];
                let templateName = this.selectedTemplate.split('|')[3];
                this.addTemplates[group_id] = {
                    groupName,
                    template_id,
                    templateName
                }
            }
            this.showGroupSelect = false;
            this.$forceUpdate();
        },
        deleteAdded(group_key){
            delete this.addTemplates[group_key];
            this.$forceUpdate();
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
        handleEdit(value){
            EventBus.$emit('selectApp', value);
            EventBus.$emit('modeChange', 'moduleConfig');
        },
        handleEditApi(value){
            EventBus.$emit('selectApp', value);
            EventBus.$emit('modeChange', 'apiConfig');
        },
        handleGetEventFailLog(value){
            EventBus.$emit('selectApp', value);
            EventBus.$emit('modeChange', 'eventFailLog');
        },
        handleEditAlert(value, name, webhook){
            this.editAlertBotVisible = true;
            this.editAlertBotAppId = value;
            this.editAlertBotAppName = name;
            this.tempWebhook = webhook;
        },
        confirmEditAlertBot(){
            this.instance
            .post(
            'private/consultModulation/appConfig/setAlertBot',
            {
                app_id: this.editAlertBotAppId,
                webhook: this.tempWebhook
            }
            )
            .then(response => {
                let result = response.data;
                this.$message.info('设置告警成功');
                this.fetch({
                    page:1,
                    pageSize:15
                });
            })
            .catch(function (error) { // 请求失败处理
                this.$message.error('设置告警失败')
                console.log(error);
            });
            this.editAlertBotVisible = false;
        },
        handleBackup(value){
            EventBus.$emit('selectApp', value);
            EventBus.$emit('modeChange', 'backup');
        },
        handleEditApi2(value){
            EventBus.$emit('selectApp', value);
            EventBus.$emit('modeChange', 'boxConfig');
        },
        handleEditCustomize(value){
            EventBus.$emit('selectApp', value);
            EventBus.$emit('modeChange', 'customizeConfig');
        },
        handleTest(value){
            EventBus.$emit('selectApp', value);
            EventBus.$emit('modeChange', 'testConfig');
        },
        handleDataSource(value){
            EventBus.$emit('selectApp', value);
            EventBus.$emit('modeChange', 'dataSourceManage');
        },
        configurate(value, secret, agentid){
            this.tempAppId = value;
            this.tempSecret = secret;
            this.tempAgentid = agentid;
            this.configVisible = true;
        },
        setApp(){
            this.configVisible = false;
            let data = {
                app_id: this.tempAppId,
                secret: this.tempSecret,
                agentid: this.tempAgentid
            }
            this.instance
            .post(
            '/private/consultModulation/appConfig/setAppSecret',
            data
            )
            .then(() => {
                this.$message.info('设置成功');
            })
            .catch(function (error) { // 请求失败处理
            console.log(error);
            });
            this.tempAppId = "";
            this.tempSecret = "";
        },
        handleDelete(value){
            this.deleteSetAndRefetch(value);
            // console.log(value);
            // this.$message.error(`暂不开放删除应用功能`);
        },
        showModal(){
            this.addSetVisible = true;
            this.addTemplates = {};
        },
        hideModal(){
            this.addSetVisible = false;
            this.addSetAndRefetch();
        },
        clearModal(){
            this.nameInput = "";
            this.descriptionInput = "";
            this.company = {};
            this.$forceUpdate();
        },
        addSetAndRefetch(){
            let that = this;
            if(!this.company.hospitalId && !this.company_id){
                this.$message.warning('必须选择医院');
                return;
            }
            if(!this.nameInput){
                this.$message.warning('缺失应用名');
                return;
            }
            let template_ids = [];
            for(let group_id in this.addTemplates){
                template_ids.push(this.addTemplates[group_id].template_id)
            }
            let data = {
                name: this.nameInput,
                description: this.descriptionInput,
                template_ids
            };

            if(this.company_id){
                data.company_id = this.company_id;
            }else{
                data.company = this.company;
            }
            this.instance
            .post(
            '/private/consultModulation/appConfig',
            data
            )
            .then(() => {
                that.clearModal();
                that.fetch();
            })
            .catch(function (error) { // 请求失败处理
            console.log(error);
            });
        },
        deleteSetAndRefetch(id){
            let that = this;
            this.instance
            .delete(
            `/private/consultModulation/${id}/appConfig`
            )
            .then(() => {
            that.fetch();
            })
            .catch(function (error) { // 请求失败处理
            console.log(error);
            });
        },
        getCompany(){
            this.instance
            .get(
            '/private/consultModulation/company',
            {
                params: {
                    hospitalId: this.specifiedCompany||""
                }
            }
            )
            .then(response => {
                let {list} = response.data;
                this.companyOptions = list;
                for(let companyType of list){
                    for(let company of companyType.list){
                        this.companyMap[company.hospitalId || company._id] = company.hospitalName || company.company_name;
                    }
                }
            })
            .catch(function (error) { // 请求失败处理
                console.log(error);
            });
        },
        onSelectCompany(value){
            
            if(!isNaN(value)){
                this.company.hospitalId = Number(value);
                this.company.hospitalName = this.companyMap[value];
            }else{
                this.company_id = value;
            }

            this.$forceUpdate();
        },
        filterCompany(input, text){
            let regex = new RegExp(input,'i');
            return regex.test(text);
        }
    },
    mounted(){
        //注册事件监听
        EventBus.$emit('selectApp', "");
        let {hospitalId, hospitalName} = this.$route.query;
        if(hospitalId && hospitalName){
            this.company.hospitalId = hospitalId;
            this.company.hospitalName = hospitalName;
            this.specifiedCompany = hospitalId;
        }
        
        this.fetch({
            page:1,
            pageSize:15
        });
        this.getCompany();
    }
  };
</script>