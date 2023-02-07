<template>
  <div>
    
    <a-divider />
    <a-row>
        <a-col :span="8">
            <a-select
            placeholder="选择版本"
            style="width:320px"
            :defaultValue="apiTemplateId"
            @change="onVersionSelect"
            >
                <a-select-option v-for="version in versions" :key="version._id" :value="version._id">
                    {{version.version}}
                </a-select-option>
            </a-select>
        </a-col>
        <a-col :span="8">
            <a-button type="dashed" v-if="!showChangeVersion" @click="showChange">修改版本号</a-button>
            <a-input 
            v-else
            placeholder="输入版本号"
            @keyup.enter="e=>onVersionChange(e.target.value)"
            @blur="cancelVersionChange"
            >
            </a-input>
        </a-col>
        <a-col :span="8">
            <a-input-group compact>
                <a-button icon="plus" @click="addVersion">增加新版本</a-button>
                <a-button :icon="exporting?'loading':'file-word'" @click="exportDocs">导出该版本厂商文档</a-button>
            </a-input-group>
        </a-col>
    </a-row>
    <a-divider orientation="left">接口模板</a-divider>
    <a-row type="flex" justify="end">
        <a-col :span="24" style="text-align:right">
        <a-button-group>
            <a-button icon="copy" @click="spawnTemplateItems">按标准生成配置</a-button>
            <a-button type="primary" icon="plus" @click="handleAdd">新增模板成员</a-button>
            <a-button type="dashed" icon="bar-chart" @click="showTemplateStatistics">模板统计</a-button>
        </a-button-group>
        </a-col>
    </a-row>
    
    <a-row style="margin-top:20px">
        <div v-for="(itemObj, index) in items" :key="itemObj.name">
            <a-col :span="6">
                <a-card style="margin: 5px">
                    <div slot="title">
                        <a-row>
                            <a-col :span="24">
                                {{itemObj.name}}
                                <a-tag 
                                v-if="itemObj.tag_oid" 
                                color="green"
                                v-clipboard:copy="itemObj.tag_oid.tagName"
                                v-clipboard:success="onCopy"
                                v-clipboard:error="onError"
                                >
                                    {{itemObj.tag_oid.description}}
                                </a-tag>
                                <a-tag color="red" v-else>
                                    !无标签
                                </a-tag>
                                <a-icon 
                                v-if="itemObj.tag_oid" 
                                type="area-chart" 
                                style="color:#1DA57A;fontSize:24px"
                                @click="e=>showStatics(itemObj.tag_oid._id)"
                                />
                            </a-col>
                        </a-row>
                    </div>
                    <a-dropdown>
                        <a-menu slot="overlay">
                            <a-menu-item key="1">
                                <a-button :block="true" type="primary" icon="setting" @click="handleEdit(index)">配置</a-button>
                            </a-menu-item>
                            <a-menu-item key="2">
                                <a-button :block="true" icon="api" @click="handleImport(index)">导入</a-button>
                            </a-menu-item>
                            <a-menu-item key="3">
                                <a-popconfirm
                                title="亲,真的要抛弃我吗？"
                                okText="狠心删除"
                                cancelText="手下留情"
                                @confirm="handleDelete(index)"
                                >
                                    <a-icon slot="icon" type="aliwangwang" style="color:red"/>
                                    <a-button :block="true" type="danger" icon="delete">删除</a-button>
                                </a-popconfirm>
                            </a-menu-item>
                        </a-menu>
                        <a-button :block="true">
                            <a-row type="flex" justify="space-between">
                                <a-col :span="6">
                                操作
                                </a-col>
                                <a-col :span="2">
                                    <a-icon type="down"/>
                                </a-col>
                            </a-row>
                        </a-button>
                    </a-dropdown>
                </a-card>
            </a-col>
        </div>
    </a-row>
    <a-divider orientation="left">回调模板</a-divider>
    <a-row type="flex" justify="end">
        <a-col :span="24" style="text-align:right">
        <a-button-group>
            <a-button icon="plus" @click="handleCallbackTemplateAdd">新增回调模板</a-button>
        </a-button-group>
        </a-col>
    </a-row>
    <a-row style="margin-top:20px">
        <div v-for="(callbackObj, cbIndex) in callbackItems" :key="callbackObj.callbackTag">
            <a-col :span="6">
                <a-card style="margin: 5px">
                    <div slot="title">
                        <a-row>
                            <a-col :span="24">
                                {{callbackObj.name||callbackObj.callbackTag}}
                            </a-col>
                        </a-row>
                    </div>
                    <a-dropdown>
                        <a-menu slot="overlay">
                            <a-menu-item key="1">
                                <a-button :block="true" type="primary" icon="setting" @click="handleCallbackEdit(cbIndex)" disabled>配置</a-button>
                            </a-menu-item>
                            <a-menu-item key="2">
                                <a-button :block="true" icon="api" @click="handleCallbackImport(cbIndex)" disabled>导入</a-button>
                            </a-menu-item>
                            <a-menu-item key="3">
                                <a-popconfirm
                                title="亲,真的要抛弃我吗？"
                                okText="狠心删除"
                                cancelText="手下留情"
                                @confirm="handleCallbackDelete(cbIndex)"
                                >
                                    <a-icon slot="icon" type="aliwangwang" style="color:red"/>
                                    <a-button :block="true" type="danger" icon="delete">删除</a-button>
                                </a-popconfirm>
                            </a-menu-item>
                        </a-menu>
                        <a-button :block="true">
                            <a-row type="flex" justify="space-between">
                                <a-col :span="6">
                                操作
                                </a-col>
                                <a-col :span="2">
                                    <a-icon type="down"/>
                                </a-col>
                            </a-row>
                        </a-button>
                    </a-dropdown>
                </a-card>
            </a-col>
        </div>
    </a-row>

    <a-modal
    title="回调模板配置"
    v-model="editCallbackVisible"
    @ok="editCallbackTemplate"
    :okText="currentCallbackId?'修改':'新增'" 
    cancelText="取消"
    :width="1280"
    >
        <callback :apiTemplateId="apiTemplateId" :itemId="currentCallbackTemplateId" v-if="editCallbackVisible"/>
    </a-modal>

    <a-modal 
    title="模板成员配置" 
    v-model="editItemVisible" 
    @ok="editItem" :okText="currentItemId?'修改':'新增'" 
    cancelText="取消"
    :width="1280"
    :maskClosable="false"
    >
        <api :apiGroupId="apiGroupId" :apiTemplateId="apiTemplateId" :itemId="currentItemId" :callbackMap="callbackMap" v-if="editItemVisible"></api>
    </a-modal>
    <a-modal 
    title="选择现有API"
    v-model="selectPresent"
    @ok="replaceApi"
    okText="导入"
    cancelText="取消"
    >
        <a-select
        show-search
        placeholder="搜索API名称，所属应用名称，标签名称"
        style="width: 100%"
        :default-active-first-option="false"
        :show-arrow="false"
        :filter-option="false"
        :not-found-content="null"
        @focus="searchApi('')"
        @search="searchApi"
        @change="changeSelect"
        >
            <a-select-opt-group v-for="(app, app_id) in apis" :key="app_id" :label="app[0].app_oid.name">
                <a-select-option v-for="a in app" :key="a._id">
                    {{a.name}}
                    <a-tag v-if="a.tag_oid" color="green">
                        {{a.tag_oid.tagName}}
                    </a-tag>
                </a-select-option>
            </a-select-opt-group>
        </a-select>
    </a-modal>
    <a-modal title="增加新模板" v-model="showCreate" @ok="addTemplate" okText="添加" cancelText="取消">
        <a-row>
            <a-col :span="24">
                <a-input placeholder="版本号" v-model="version" style="margin-top:10px"></a-input>
            </a-col>
        </a-row>
    </a-modal>
  </div>
</template>

<script>
    import { EventBus } from '../../lib/event-bus.js'; //全局事件总线
    import Api from './api'
    import Callback from './callback'

  export default {
    data() {
      return {
          items: [],
          callbackItems: [],
          selectPresent: false,
          selectApiId: "",
          editItemVisible: false,
          editCallbackVisible: false,
          currentItemId: "",
          currentCallbackTemplateId: "",
          currentCallbackId: "",
          customizeConfig:[],
          exporting: false,
          apis: [],
          versions: [],
          versionMap: {},
          version: "",
          showChangeVersion: false,
          showCreate: false,
          callbackMap: []
      };
    },
    components:{
      api: Api,
      callback: Callback
    },
    computed:{
    },
    props: ['apiTemplateId', 'templateName', 'apiGroupId'],
    methods:{
        onCopy(){
            this.$message.info('复制成功');
        },
        onError(){
            this.$message.error('复制失败');
        },
        addVersion(){
            this.showCreate = true;
        },
        addTemplate(){
            let data = {
                apiGroup_id: this.apiGroupId,
                templateName: this.templateName,
                version: this.version
            };
            this.showCreate = false;
            this.instance
            .post(
            '/private/apiGroup/apiTemplate',
            data
            )
            .then(response => {
                let result = response.data;
                if(!result.result){
                    this.$message.error('添加API模板失败');
                }
                this.getSerialVersions();
            })
            .catch(function (error) { // 请求失败处理
                console.log(error);
            });
        },
        onVersionSelect(value){
            EventBus.$emit('selectTemplate', {template_id:value, templateName:this.templateName});
            this.fetchTemplates(value);
        },
        showChange(){
            this.showChangeVersion = true;
        },
        cancelVersionChange(){
            this.showChangeVersion = false;
        },
        onVersionChange(value){
            this.changeVersion(value);
            this.showChangeVersion = false;
        },
        showTemplateStatistics(){
            EventBus.$emit('modeChange', 'templateStatistics');
        },
        showStatics(tag_id){
            EventBus.$emit('modeChange', 'itemStatics');
            EventBus.$emit('selectTag', tag_id);
        },
        replaceApi(){
            this.selectPresent = false;
            return this.instance
            .patch(
            `/private/apiGroup/apiTemplate/${this.currentItemId}/replaceItem`,
            {
                api_id:this.selectApiId
            }
            )
            .then(response => {
                let result = response.data;
                if(result.result){
                    if(result.apiTemplateItem){
                        this.$message.info(`更新API模板 ${result.data.name} 成功`);
                    }
                }
            })
            .catch(function (error) { // 请求失败处理
                console.log(error);
            });
        },
        changeSelect(value){
            this.selectApiId = value;
        },
        searchApi(search){
            this.instance
            .get(
            '/private/apiGroup/apiTemplate/searchApi',
            {
                params: {
                    search
                }
            }
            )
            .then(response => {
                this.apis = response.data.apis;
            })
            .catch(function (error) { // 请求失败处理
                console.log(error);
            });
        },
        fetchTemplates(value) {
            this.instance
            .get(
            '/private/apiGroup/apiTemplate/items',
            {
                params: {
                    apiTemplate_id: value || this.apiTemplateId 
                }
            }
            )
            .then(response => {
                this.items = response.data.list;
                this.callbackItems = response.data.callbackList || [];
                this.callbackMap = this.callbackItems.map(item=>{
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
        handleEdit(index){
            this.currentItemId = this.items[index]._id;
            this.editItemVisible = true;
        },
        handleCallbackEdit(){

        },
        handleImport(index){
            this.currentItemId = this.items[index]._id;
            this.selectPresent = true;
        },
        handleCallbackImport(){
        },
        handleDelete(index){
            this.instance
            .delete(
            `/private/apiGroup/apiTemplate/${this.items[index]._id}/item`
            )
            .then(response => {
                let result = response.data;
                if(!result.result){
                    this.$message.info('删除模板失败')
                }else{
                    this.fetchTemplates();
                }
            })
            .catch(function (error) { // 请求失败处理
                console.log(error);
            });
        },
        handleCallbackDelete(index){
            this.instance
            .delete(
            `/private/apiGroup/apiTemplate/${this.callbackItems[index]._id}/callbackItem`
            )
            .then(response => {
                let result = response.data;
                if(!result.result){
                    this.$message.info('删除回调模板失败')
                }else{
                    this.fetchTemplates();
                }
            })
            .catch(function (error) { // 请求失败处理
                console.log(error);
            });
        },
        handleAdd(){
            this.currentItemId = "";
            this.editItemVisible = true;
        },
        handleCallbackTemplateAdd(){
            this.currentCallbackTemplateId = "";
            this.editCallbackVisible = true;
        },
        editItem(){
            EventBus.$emit('editItemConfirm', {});
            this.editItemVisible = false;
        },
        editCallbackTemplate(){
            EventBus.$emit('editCallbackTemplateConfirm', {});
            this.editCallbackVisible = false;
        },
        spawnTemplateItems(){
            this.instance
            .post(
            '/private/apiGroup/apiTemplate/items',
            {
                apiTemplate_id: this.apiTemplateId,
                apiGroup_id: this.apiGroupId,
            }
            )
            .then(response => {
                let result = response.data;
                if(!result.result){
                    this.$message.info('生成模板失败')
                }else{
                    this.fetchTemplates();
                }
            })
            .catch(function (error) { // 请求失败处理
                console.log(error);
            });
        },
        getSerialVersions(){
            this.instance
            .get(
            '/private/apiGroup/apiTemplate/getSerialVersions',
            {
                params: {
                    apiTemplate_id: this.apiTemplateId
                }
            }
            )
            .then(response => {
                this.versions = response.data.list;
                for(let template of this.versions){
                    this.versionMap[template._id] = template.version;
                }
            })
            .catch(function (error) { // 请求失败处理
                console.log(error);
            });
        },
        changeVersion(version){
            this.instance
            .patch(
            `/private/apiGroup/apiTemplate/${this.apiTemplateId}/changeVersion`,
            {
                version
            }
            )
            .then(response => {
                let result = response.data;
                if(!result.result){
                    this.$message.error('修改版本号失败');
                }else{
                    this.$message.info('修改版本号成功');
                    this.getSerialVersions();
                }
            })
            .catch(function (error) { // 请求失败处理
                console.log(error);
            });
        },
        exportDocs(){
            this.exporting = true;
            this.instance
            .get(
            '/private/apiGroup/apiTemplate/item/docs',
            {
                params: {
                    apiTemplate_id: this.apiTemplateId
                },
                responseType: 'blob'
            }
            )
            .then(response => {
                const content = response.data;
                const blob = new Blob([content],{type:'application/octet-stream'});
                const fileName = `${this.templateName} 接口文档 V${this.versionMap[this.apiTemplateId]}.docx`;
                
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
    },
    created(){
    },
    mounted(){
        //注册事件监听
        EventBus.$off('itemCreated');
        EventBus.$on('itemCreated',()=>{
            this.fetchTemplates()
        });
        this.fetchTemplates();
        this.getSerialVersions();
    }
  };
</script>