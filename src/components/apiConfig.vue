<template>
  <div>
    <a-divider orientation="left">接口</a-divider>
    <a-row type="flex" justify="end">
        <a-col :span="16">
            <a-input-search placeholder="筛选接口名称" @search="onSearchApi"></a-input-search>
        </a-col>
        <a-col :span="8" style="text-align:right">
            <a-button-group>
                <a-button type="primary" :icon="exporting?'loading':'database'" @click="exportConfigs" :disabled="exporting">导出配置备份</a-button>
                <a-button type="primary" :icon="exporting?'loading':'file-word'" @click="exportDocs" :disabled="exporting">导出HIS对接文档</a-button>
            </a-button-group>
        </a-col>
    </a-row>
    <a-row style="margin-top:20px">
        <a-card v-for="(templatesApis, templateKey) in groupedApis" :key="templateKey" style="margin-bottom:20px">
            <div slot="title">
                <a-tag color="blue">
                    {{groupedNameMap[templateKey]}}
                </a-tag>
            </div>
            <a-row>
                <div v-for="(apiObj, index) in templatesApis" :key="apiObj.name">
                    <a-col :span="6">
                        
                        <a-card style="margin: 5px">
                            <a-tag slot="extra" v-if="apiObj.apiTemplate_oid" color="orange">
                                {{apiObj.apiTemplate_oid.templateName}}
                            </a-tag>
                            <div slot="cover">
                                <a-row style="margin:5px">
                                    <a-col :span="24">
                                        <a-tooltip>
                                            <template slot="title">
                                                调整接口分类
                                            </template>
                                            <a-select
                                            :defaultValue="apiObj.apiGroup_oid?apiObj.apiGroup_oid._id:''"
                                            @change="value=>onSelectApiGroup(value, templateKey, index)"
                                            style="width:100%"
                                            >
                                                <a-select-option v-for="apiGroup in apiGroups" :key="apiGroup._id">
                                                {{apiGroup.groupName}}
                                                </a-select-option>
                                            </a-select>
                                        </a-tooltip>
                                    </a-col>
                                </a-row>
                            </div>
                            <a-row slot="title">
                                {{apiObj.name}}
                                <a-tag 
                                v-if="apiObj.tag_oid" 
                                color="cyan"
                                v-clipboard:copy="apiObj.tag_oid.tagName"
                                v-clipboard:success="onCopy"
                                v-clipboard:error="onError"
                                >
                                    {{apiObj.tag_oid.description}}
                                </a-tag>
                            </a-row>
                            <template slot="actions" class="ant-card-actions">
                                <a-tooltip>
                                    <template slot="title">
                                        配置API
                                    </template>
                                    <a-badge title="开启了返回示例Mock">
                                        <div slot="count" v-if="apiObj.mockReturn" class="mock-return-badge-icon">M</div>
                                        <a-icon style="fontSize:24px" type="setting" @click="handleEdit(templateKey, index)"/>
                                    </a-badge>
                                </a-tooltip>
                                <a-tooltip>
                                    <template slot="title">
                                        调用日志
                                    </template>
                                    <a-badge :count="apiObj.errorCount" dot>
                                        <a-icon style="fontSize:24px" type="history" @click="getApiLog(templateKey, index)"/>
                                    </a-badge>
                                </a-tooltip>
                                <a-tooltip>
                                    <template slot="title">
                                        复制该接口配置
                                    </template>
                                    <a-icon style="fontSize:24px" type="copy" @click="showCopy(templateKey, index)"/>
                                </a-tooltip>
                                <a-tooltip>
                                    <template slot="title">
                                        配置接口调用权限
                                    </template>
                                    <a-icon style="fontSize:24px" type="exclamation-circle" @click="handleApiAccessEdit(templateKey, index)"/>
                                </a-tooltip>
                                <a-popconfirm
                                title="亲,真的要抛弃我吗？"
                                okText="狠心删除"
                                cancelText="手下留情"
                                @confirm="handleDelete(templateKey, index)"
                                >
                                    <a-icon slot="icon" type="aliwangwang" style="color:red"/>
                                    <a-tooltip>
                                        <template slot="title" v-if="!apiObj.defaultApi">
                                            删除API
                                        </template>
                                        <a-icon style="fontSize:24px" type="delete"/>
                                    </a-tooltip>
                                </a-popconfirm>
                            </template>
                        </a-card>
                    </a-col>
                </div>
            </a-row>
        </a-card>
    </a-row>
    <a-button-group>
        <a-button type="primary" icon="plus" @click="handleAdd">新增自定义接口</a-button>
        <a-button type="dashed" icon="vertical-align-bottom" @click="showImport('api')">从分类及厂商模板导入接口</a-button>
    </a-button-group>
    <a-divider orientation="left">回调</a-divider>
    <a-row style="margin-top:20px">
        <div v-for="(callbackObj, cbIndex) in callbacks" :key="callbackObj.callbackTag">
            <a-col :span="6">
                <a-card style="margin: 5px">
                    <a-row slot="title">
                        <a-col :span="24">
                            {{callbackObj.name||callbackObj.callbackTag}}
                        </a-col>
                    </a-row>
                    <template slot="actions" class="ant-card-actions">
                        <a-tooltip>
                            <template slot="title">
                                配置回调
                            </template>
                            <a-icon style="fontSize:24px" type="setting" @click="handleCallbackEdit(cbIndex)"/>
                        </a-tooltip>
                        <a-tooltip>
                            <template slot="title">
                                调用日志
                            </template>
                            <a-badge :count="callbackObj.errorCount" dot>
                                <a-icon style="fontSize:24px" type="history" @click="getCallbackLog(cbIndex)"/>
                            </a-badge>
                        </a-tooltip>
                        <a-tooltip>
                            <template slot="title">
                                复制回调地址到剪贴板
                            </template>
                            <a-icon 
                            type="copy"
                            style="fontSize:24px"
                            v-clipboard:copy="callbackObj.callbackOutUrl"
                            v-clipboard:success="onCopy"
                            v-clipboard:error="onError"
                            />
                        </a-tooltip>
                        <a-popconfirm
                        title="亲,真的要抛弃我吗？"
                        okText="狠心删除"
                        cancelText="手下留情"
                        @confirm="handleCallbackDelete(cbIndex)"
                        >
                            <a-icon slot="icon" type="aliwangwang" style="color:red"/>
                            <a-tooltip>
                                <template slot="title">
                                    删除回调
                                </template>
                                <a-icon style="fontSize:24px" type="delete"/>
                            </a-tooltip>
                        </a-popconfirm>
                    </template>
                </a-card>
            </a-col>
        </div>
    </a-row>
    <a-button-group>
        <a-button type="primary" icon="plus" @click="handleCallbackAdd">新增回调</a-button>
        <a-button type="dashed" icon="vertical-align-bottom" @click="showImport('callback')">从模板导入回调</a-button>
    </a-button-group>
    <a-divider></a-divider>

    <a-modal 
    title="从模板导入"
    v-model="importVisible"
    @ok="importApi" okText="导入"
    cancelText="取消"
    >
        <a-row v-if="!showGroupSelect" type="flex" justify="center">
            <a-col :span="8">
                <a-button type="primary" @click="showGroup">按组添加模板</a-button>
            </a-col>
        </a-row>
        <a-row v-else>
            <a-col :span="18">
                <a-select 
                style="width:100%"
                show-search
                placeholder="搜索模板名称，所属组名称"
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

    <a-modal
    title="复制接口配置"
    v-model="showCopyModal"
    @ok="copyApi" okText="确认"
    cancelText="取消"
    >
        <p style="color:red">注意:复制后的接口标签为空，需要重新选择！</p>
        <a-row>
            <a-input
            addonBefore="新接口名称"
            :defaultValue="newName"
            @change="e=>onNewNameChange(e.target.value)"
            placeholder="请输入新接口的名称"
            >
            </a-input>
        </a-row>
    </a-modal>

    <a-modal 
    v-model="editApiVisible" 
    @ok="editApi" :okText="currentApiId?'修改':'新增'" 
    cancelText="取消"
    :width="1280"
    :maskClosable="false"
    >
        <div slot="title">
            API 配置 
            <a-divider type="vertical"></a-divider>
            Ver.
            <a-tag color="blue" style="margin-top:5px">
                {{versionTag}}
            </a-tag>
        </div>
        <api :appId="appId" :sourceMap="sourceMap" :apiId="currentApiId" :customizeConfig="customizeConfig" :apis="apis" :callbackMap="callbackMap" v-if="editApiVisible"></api>
    </a-modal>

    <a-modal
    v-model="editApiAccessVisible"
    :title="currentApiName+' 调用权限配置'"
    okText="确定" 
    cancelText="取消"
    >
        <apiAccess :apiId="currentApiId"/>
    </a-modal>

    <a-modal 
    title="回调 配置" 
    v-model="editCallbackVisible" 
    @ok="editCallback" :okText="currentCallbackId?'修改':'新增'" 
    cancelText="取消"
    :width="1280"
    >
        <callback :appId="appId" :callbackId="currentCallbackId" :apis="apis" :customizeConfig="customizeConfig" v-if="editCallbackVisible"/>
    </a-modal>

  </div>
</template>

<script>
    import { EventBus } from '../lib/event-bus.js'; //全局事件总线
    import Api from './api'
    import ApiAccess from './apiAccess'
    import Callback from './callback'
    import _ from 'lodash'
    import moment from 'moment'

  export default {
    data() {
        return {
            showGroupSelect: false,
            apiTemplates: [],
            selectedTemplate: "",
            addTemplates: {},
            importVisible: false,
            groupedApis: {},
            groupedNameMap: {},
            apis: [],
            callbacks: [],
            editApiVisible: false,
            editApiAccessVisible: false,
            editCallbackVisible: false,
            currentApiId: "",
            currentApiName: "",
            currentCallbackId: "",
            customizeConfig:[],
            exporting: false,
            callbackMap: [],
            importType: "api",
            showCopyModal: false,
            preCopiedApiId: "",
            newName: "",
            apiGroups: [],
            versionTag: ""
        };
    },
    components:{
      api: Api,
      apiAccess: ApiAccess,
      callback: Callback
    },
    computed:{
    },
    props: ['appId', 'sourceMap'],
    methods:{
        onSelectApiGroup(apiGroup_id, templateKey, index){
            let api_id = this.groupedApis[templateKey][index]._id;
            this.instance
            .patch(
            `/private/consultModulation/${api_id}/adjustApiGroup`,
            {
                apiGroup_id
            }
            )
            .then(() => {
                this.fetchApi({app_id: this.appId});
            })
            .catch(function (error) { // 请求失败处理
                console.log(error);
            });
        },
        fetchApiGroup(){
            this.instance
            .get(
            '/private/apiGroup?page=1&pageSize=200'
            )
            .then(response => {
                let result = response.data;
                this.apiGroups = result.list;
                this.apiGroups.push({
                    _id: "",
                    groupName: "其他"
                })
            })
            .catch(function (error) { // 请求失败处理
                console.log(error);
            });
        },
        onSearchApi(value){
            this.fetchApi({
            app_id: this.appId,
                name: value
            });
        },
        onCopy(e){
            this.$message.info(`已复制 ${e.text} 到剪切板`);
        },
        onError(){
            this.$message.error(`复制到剪切板失败`);
        },
        importApi(){
            let template_ids = [];
            for(let group_id in this.addTemplates){
                template_ids.push(this.addTemplates[group_id].template_id)
            }
            this.instance
            .post(
            '/private/consultModulation/appConfig/api/import',
            {
                app_id: this.appId,
                template_ids,
                importType: this.importType
            }
            )
            .then(() => {
                this.fetchApi({app_id: this.appId});
            })
            .catch(function (error) { // 请求失败处理
                console.log(error);
            });
            this.importVisible = false;
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
        fetchApi(params = {}) {
            console.log('params:', params);
            this.loading = true;
            this.instance
            .get(
            '/private/consultModulation/apiConfig',
            {params}
            )
            .then(response => {
                this.apis = response.data.list;
                let apis = response.data.list;
                this.groupedApis = _.groupBy(apis, 'apiGroup_oid._id');
                for(let key in this.groupedApis){
                    if(this.groupedApis[key][0] && this.groupedApis[key][0].apiGroup_oid){
                        this.groupedNameMap[key] = this.groupedApis[key][0].apiGroup_oid.groupName;
                    }else{
                        this.groupedNameMap[key] = "其他";
                    }
                }
                if(!this.groupedNameMap["undefined"]){
                    this.groupedNameMap["undefined"] = "其他";
                }
                this.callbacks = response.data.callbackList || [];
                this.callbackMap = this.callbacks.map(item=>{
                    return {
                        label: item.callbackTag,
                        value: item.callbackTag
                    }
                })
            })
            .catch(function (error) { // 请求失败处理
                console.log(error);
            });
        },
        showData(){
            console.log(JSON.parse(JSON.stringify(this.apis)));
        },
        handleEdit(templateKey, index){
            this.currentApiId = this.groupedApis[templateKey][index]._id;
            this.editApiVisible = true;
            this.versionTag = this.groupedApis[templateKey][index].versionTag;
        },
        handleApiAccessEdit(templateKey, index){
            this.currentApiId = this.groupedApis[templateKey][index]._id;
            this.currentApiName = this.groupedApis[templateKey][index].name;
            this.editApiAccessVisible = true;
        },
        handleCallbackEdit(index){
            this.currentCallbackId = this.callbacks[index]._id;
            this.editCallbackVisible = true;
        },
        getApiLog(templateKey, index){
            EventBus.$emit('apiIdChange', this.groupedApis[templateKey][index]._id);
            EventBus.$emit('modeChange', 'apiLog');
        },
        showCopy(templateKey, index){
            this.preCopiedApiId = this.groupedApis[templateKey][index]._id;
            this.showCopyModal = true;
        },
        cancelCopy(){
            this.preCopiedApiId = "";
            this.showCopyModal = false;
        },
        onNewNameChange(value){
            this.newName = value;
        },
        copyApi(){
            if(!this.newName){
                this.$message.error('请输入一个新接口名称!');
            }else if(this.apis.map(item=>item.name.trim()).includes(this.newName.trim())){
                this.$message.error('新接口名称与现有接口重复!');
            }else{
                this.instance
                .post(
                '/private/consultModulation/apiConfig/copy',
                {
                    api_id: this.preCopiedApiId,
                    newName: this.newName.trim()
                }
                ).then(response => {
                    let result = response.data;
                    if(result.result){
                        this.$message.info('复制接口成功!');
                        this.fetchApi({
                            app_id: this.appId
                        })
                    }else{
                        this.$message.error('复制接口失败!');
                    }
                })
                .catch(function (error) { // 请求失败处理
                    console.log(error);
                });
                this.preCopiedApiId = "";
                this.showCopyModal = false;
            }
        },
        getCallbackLog(index){
            EventBus.$emit('callbackIdChange', {callback_id:this.callbacks[index]._id, callback_tag: this.callbacks[index].callbackTag});
            EventBus.$emit('modeChange', 'callbackLog');
        },
        exportDoc(templateKey, index){
            this.instance
            .get(
            '/private/consultModulation/apiConfig/doc',
            {
                params: {
                    api_id: this.groupedApis[templateKey][index]._id
                },
                responseType: 'blob'
            }
            )
            .then(response => {
                const content = response.data;
                const blob = new Blob([content],{type:'application/octet-stream'});
                const fileName = `${this.apis[index].name} 接口文档.docx`;
                
                if ('download' in document.createElement('a')) { //支持a标签download的浏览器
                    const link = document.createElement('a')//创建a标签
                    link.download = fileName//a标签添加属性
                    link.style.display = 'none'
                    link.href = URL.createObjectURL(blob)
                    document.body.appendChild(link)
                    link.click()//执行下载
                    URL.revokeObjectURL(link.href) //释放url
                    document.body.removeChild(link)//释放标签
                } else { //其他浏览器
                    navigator.msSaveBlob(blob, fileName)
                }
                this.$message.info('已导出');
            })
            .catch(function (error) { // 请求失败处理
                console.log(error);
            });
        },
        exportConfigs(){
            this.exporting = true;
            this.instance
            .get(
            '/private/backup/exportConfigs',
            {
                params: {
                    app_id: this.appId
                },
                responseType: 'blob'
            }
            )
            .then(response => {
                const content = response.data;
                console.log(response);
                const blob = new Blob([content],{type:'application/octet-stream'});
                const fileName = `${moment().format('YYYY-MM-DD HH:mm:ss')}-配置备份.json`;
                
                if ('download' in document.createElement('a')) { //支持a标签download的浏览器
                    const link = document.createElement('a')//创建a标签
                    link.download = fileName//a标签添加属性
                    link.style.display = 'none'
                    link.href = URL.createObjectURL(blob)
                    document.body.appendChild(link)
                    link.click()//执行下载
                    URL.revokeObjectURL(link.href) //释放url
                    document.body.removeChild(link)//释放标签
                } else { //其他浏览器
                    navigator.msSaveBlob(blob, fileName)
                }
                this.$message.info('已导出');
                this.exporting = false;
            })
            .catch(function (error) { // 请求失败处理
                this.exporting = false;
                console.log(error);
            });
        },
        exportDocs(){
            this.exporting = true;
            this.instance
            .get(
            '/private/consultModulation/apiConfig/docs',
            {
                params: {
                    app_id: this.appId
                },
                responseType: 'blob'
            }
            )
            .then(response => {
                const content = response.data;
                const blob = new Blob([content],{type:'application/octet-stream'});
                const fileName = `${this.appId}.docx`;
                
                if ('download' in document.createElement('a')) { //支持a标签download的浏览器
                    const link = document.createElement('a')//创建a标签
                    link.download = fileName//a标签添加属性
                    link.style.display = 'none'
                    link.href = URL.createObjectURL(blob)
                    document.body.appendChild(link)
                    link.click()//执行下载
                    URL.revokeObjectURL(link.href) //释放url
                    document.body.removeChild(link)//释放标签
                } else { //其他浏览器
                    navigator.msSaveBlob(blob, fileName)
                }
                this.$message.info('已导出');
                this.exporting = false;
            })
            .catch(function (error) { // 请求失败处理
                this.exporting = false;
                console.log(error);
            });
        },
        exportMD(index){
            this.instance
            .get(
            '/private/consultModulation/apiConfig/md',
            {
                params: {
                    api_id: this.apis[index]._id
                },
                responseType: 'blob'
            }
            )
            .then(response => {
                const content = response.data;
                const blob = content;
                const fileName = `${this.apis[index].name} 接口文档.md`;
                
                if ('download' in document.createElement('a')) { //支持a标签download的浏览器
                    const link = document.createElement('a')//创建a标签
                    link.download = fileName//a标签添加属性
                    link.style.display = 'none'
                    link.href = URL.createObjectURL(blob)
                    document.body.appendChild(link)
                    link.click()//执行下载
                    URL.revokeObjectURL(link.href) //释放url
                    document.body.removeChild(link)//释放标签
                } else { //其他浏览器
                    navigator.msSaveBlob(blob, fileName)
                }
                this.$message.info('已导出');
            })
            .catch(function (error) { // 请求失败处理
                console.log(error);
            });
        },
        exportMDs(){
            this.exporting = true;
            this.instance
            .get(
            '/private/consultModulation/apiConfig/mds',
            {
                params: {
                    app_id: this.appId
                },
                responseType: 'blob'
            }
            )
            .then(response => {
                const content = response.data;
                const blob = content;
                const fileName = `${this.appId}.md`;
                
                if ('download' in document.createElement('a')) { //支持a标签download的浏览器
                    const link = document.createElement('a')//创建a标签
                    link.download = fileName//a标签添加属性
                    link.style.display = 'none'
                    link.href = URL.createObjectURL(blob)
                    document.body.appendChild(link)
                    link.click()//执行下载
                    URL.revokeObjectURL(link.href) //释放url
                    document.body.removeChild(link)//释放标签
                } else { //其他浏览器
                    navigator.msSaveBlob(blob, fileName)
                }
                this.exporting = false;
                this.$message.info('已导出');
            })
            .catch(function (error) { // 请求失败处理
                this.exporting = false;
                console.log(error);
            });
        },
        handleCallbackDelete(index){
            let callback_id = this.callbacks[index]._id;
            this.instance
            .delete(
            `/private/consultModulation/${callback_id}/callbackConfig`
            )
            .then(() => {
                this.fetchApi({app_id: this.appId});
            })
            .catch(function (error) { // 请求失败处理
                console.log(error);
            });
        },
        handleDelete(templateKey, index){
            let api_id = this.groupedApis[templateKey][index]._id;
            this.instance
            .delete(
            `/private/consultModulation/${api_id}/apiConfig`
            )
            .then(() => {
                this.fetchApi({app_id: this.appId});
            })
            .catch(function (error) { // 请求失败处理
                console.log(error);
            });
        },
        showImport(importType){
            this.importVisible = true;
            this.importType = importType;
        },
        handleAdd(){
            this.currentApiId = "";
            this.editApiVisible = true;
        },
        handleCallbackAdd(){
            this.currentCallbackId = "";
            this.editCallbackVisible = true;
        },
        editApi(){
            EventBus.$emit('editApiConfirm', {});
            //this.editApiVisible = false;
        },
        editCallback(){
            EventBus.$emit('editCallbackConfirm', {});
            this.editCallbackVisible = false;
        },
        getCustomizeConfig(){
            this.instance
            .get(
            `/private/consultModulation/customizeConfig?app_id=${this.appId}`
            )
            .then((response) => {
                let result = response.data;
                if(result.data){
                    this.customizeConfig = [];
                    let config = result.data.config;
                    for(let key in config){
                        this.customizeConfig.push({
                            label: config[key].name,
                            value: key
                        })
                    }
                }
            })
            .catch(function (error) { // 请求失败处理
                console.log(error);
            });
        }
    },
    created(){
        EventBus.$off('apiCreated');
        EventBus.$on('apiCreated',()=>{
            console.log('apiCreated!');
            this.editApiVisible = false;
            this.fetchApi({
                app_id: this.appId
            })
        });
        if(this.appId){
            console.log(`app_id: ${this.appId}`);
            this.fetchApi({
            app_id: this.appId
            })
        }else{
            console.log(`no appId presented!`)
        }
        this.getCustomizeConfig();
        this.fetchApiGroup();
    },
    mounted(){
      //注册事件监听
    }
  };
</script>

<style>
.mock-return-badge-icon{
    font-size:10px;
    color: white;
    background-color:orange;
    border:1px solid;
    border-radius:50%;
    padding:4px
}
</style>