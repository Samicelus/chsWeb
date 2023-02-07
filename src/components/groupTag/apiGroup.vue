<template>
  <div>

    <a-row type="flex" justify="end" style="margin-bottom:10px;">
        <a-col :span="8">
        </a-col>
        <a-col :span="4">
        </a-col>
        <a-col :span="4">
            <a-button type="primary" shape="round" @click="showModal"><a-icon type="usergroup-add"/>添加接口分类</a-button>
        </a-col>
    </a-row>
    <a-modal title="添加接口分类" v-model="addGroupVisible" @ok="hideModal" okText="添加" cancelText="取消">
        <a-input placeholder="接口分类名称" v-model="nameInput"></a-input>
        <a-divider orientation="left">上传PDF文档</a-divider>
        <a-upload
        :file-list="pdfList"
        list-type="text"
        :customRequest="onUpload"
        @change="pdfListChange"
        >
            <a-button> <a-icon type="upload" /> pdf文档 </a-button>
        </a-upload>
        <a-divider orientation="left">上传WORD文档</a-divider>
        <a-upload
        :file-list="wordList"
        list-type="text"
        :customRequest="onUpload"
        @change="wordListChange"
        >
            <a-button> <a-icon type="upload" /> word文档 </a-button>
        </a-upload>
    </a-modal>
    <a-modal title="上传对接文档" v-model="modifyGroupDocsVisible" @ok="modifyGroupDocs" okText="修改" cancelText="取消">
        <a-divider orientation="left">上传PDF文档</a-divider>
        <a-upload
        :file-list="pdfList"
        list-type="text"
        :customRequest="onUpload"
        @change="pdfListChange"
        >
            <a-button> <a-icon type="upload" /> pdf文档 </a-button>
        </a-upload>
        <a-divider orientation="left">上传WORD文档</a-divider>
        <a-upload
        :file-list="wordList"
        list-type="text"
        :customRequest="onUpload"
        @change="wordListChange"
        >
            <a-button> <a-icon type="upload" /> word文档 </a-button>
        </a-upload>
    </a-modal>
    <a-modal title="添加API模板" v-model="showCreate" @ok="addTemplate" okText="添加" cancelText="取消">
        <a-row>
            <a-col :span="24">
                <a-select
                mode="combobox"
                placeholder="输入新的或选择现有模板名称"
                :options="templateNameOptions"
                style="width:100%"
                @search="onTemplateNameChange"
                @change="onSelectTemplateName"
                destroyOnClose
                >
                </a-select>
            </a-col>
        </a-row>
        <a-row>
            <a-col :span="24">
                <a-input placeholder="版本号" v-model="version" style="margin-top:10px"></a-input>
            </a-col>
        </a-row>
    </a-modal>

    <a-table 
    :columns="columns" 
    :dataSource="data"
    :rowKey="item => item._id"
    :pagination="pagination"
    :loading="loading"
    @change="handleTableChange"
    >
        <span slot="groupName" slot-scope="text, record">
            <a-tooltip v-if="!record.active" title="编辑分类名称">
                <a @click="activeGroup(record)">{{record.groupName}}</a>
            </a-tooltip>
            <a-input v-else 
            :defaultValue="record.groupName"
            @blur="e=>confirmGroupNameChange(record, e.target.value)"
            />
        </span>
        <span slot="templates" slot-scope="templates, record">
            <a-tooltip>
                <template slot="title">
                    <p>进入模板编辑</p>
                </template>
                <span v-for="(template, templatename) in templates" :key="template[0]._id">
                    <a-tag :color="randomColor()" style="margin-top:5px" @click="e=>toTemplateManage(template[0]._id, record._id, templatename)">
                        {{templatename}}
                    </a-tag>
                </span>
            </a-tooltip>
        </span>
        <span slot="action" slot-scope="text, record">
            <a-tooltip>
                <template slot="title">
                    查看接口分类成员
                </template>
                <a-button type="primary" shape="circle" icon="api" style='margin: 5px' @click="toItemManage(record._id)"></a-button>
            </a-tooltip>
            <a-tooltip>
                <template slot="title">
                    分类成员备份还原
                </template>
                <a-button type="primary" shape="circle" icon="database" style='margin: 5px' @click="handleBackup(record._id)"></a-button>
            </a-tooltip>
            <a-tooltip>
                <template slot="title">
                    添加模板
                </template>
                <a-button type="primary" shape="circle" icon="appstore" style='margin: 5px' @click="showAddTemplate(record)"></a-button>
            </a-tooltip>
            
            <a-tooltip>
                <template slot="title">
                上传对接文档
                </template>
            <a-button type="primary" shape="circle" icon="upload" style='margin: 5px' @click="uploadDocs(record)"></a-button>
            </a-tooltip>
            
            <a-button-group compact style='margin: 5px'>
                <a-tooltip>
                    <template slot="title">
                    下载word对接文档
                    </template>
                    <a-button 
                    type="primary" 
                    shape="circle" 
                    icon="file-word" 
                    style="border-radius:50% 0 0 50%" 
                    @click="downloadWord(record)"
                    :disabled="!(record.docs && record.docs.word && record.docs.word.url)"
                    >
                    </a-button>
                </a-tooltip>
                <a-tooltip>
                    <template slot="title">
                    下载pdf对接文档
                    </template>
                    <a-button 
                    type="primary" 
                    shape="circle" 
                    icon="file-pdf" 
                    style="border-radius:0 50% 50% 0" 
                    @click="downloadPdf(record)"
                    :disabled="!(record.docs && record.docs.pdf && record.docs.pdf.url)"
                    >
                    </a-button>
                </a-tooltip>
            </a-button-group>
        </span>
    </a-table>
  </div>
</template>
<script>
import { EventBus } from '../../lib/event-bus.js'; //全局事件总线

const columns = [
    {
        title: '接口分类名称',
        width: '20%',
        key: 'groupName',
        scopedSlots: { customRender: 'groupName' },
    },
    {
        title: '分类成员数',
        dataIndex: 'itemCount',
        width: '20%',
        key: 'itemCount'
    },
    {
        title: '厂商模板',
        dataIndex: 'templates',
        width: '20%',
        key: 'templates',
        scopedSlots: { customRender: 'templates' }
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
            mode: 'apiGroup',
            addGroupVisible: false,
            modifyGroupDocsVisible: false,
            nameInput: "",
            showCreate: false,
            templateName: "",
            version: "",
            apiGroupId: "",
            templateNameOptions:[],
            pdfList: [],
            pdfUrl:"",
            wordList: [],
            wordUrl: ""
        };
    },
    methods:{
        handleBackup(value){
            EventBus.$emit('selectGroup', value);
            EventBus.$emit('modeChange', 'groupBackup');
        },
        uploadDocs(record){
            this.apiGroupId = record._id;
            if(record.docs && record.docs.pdf){
                this.pdfList = [record.docs.pdf];
            }
            if(record.docs && record.docs.word){
                this.wordList = [record.docs.word];
            }
            this.modifyGroupDocsVisible = true;
        },
        modifyGroupDocs(){
            this.modifyGroupDocsVisible = false;
            let data = {};
            if(this.pdfList.length){
                let pdfFile = this.pdfList[0];
                if(pdfFile.name.split('.').reverse()[0] == 'pdf'){
                    data.pdfUrl = pdfFile;
                }else{
                    this.$message.warning('上传文件非PDF文件，无法上传！');
                }
            }else{
                delete data.pdfUrl;
            }
            if(this.wordList.length){
                let wordFile = this.wordList[0];
                if(['docx','doc'].includes(wordFile.name.split('.').reverse()[0])){
                    data.wordUrl =  wordFile;
                }else{
                    this.$message.warning('上传文件非WORD文件，无法上传！');
                }
            }else{
                delete data.wordUrl;
            }
            this.instance
            .patch(
            `/private/apiGroup/${this.apiGroupId}/uploadDocs`,
            data
            )
            .then(response => {
                let result = response.data;
                if(!result.result){
                    this.$message.error('上传失败');
                }else{
                    this.$message.info('上传成功');
                }
                this.fetch({
                    pageSize: this.pagination.pageSize,
                    page: this.pagination.current
                })
            })
            .catch(function (error) { // 请求失败处理
                console.log(error);
            });
        },
        onUpload(action){
            const data = new FormData();
            data.append('files', action.file);
            this.instance.post(
                '/private/cos/saveFile',
                data,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            ).then(response=>{
                let result = response.data;
                if(result.result){
                    action.onSuccess(result);
                }else{
                    action.onError(new Error(result.errorMessage));
                }
            }).catch(function (error) { // 请求失败处理
                action.onError(error);
            });
        },
        pdfListChange(info){
            let that = this;
            let fileList = [...info.fileList];
            fileList = fileList.slice(-1);
            this.pdfList = fileList;
            this.pdfUrl = "";
            fileList = fileList.map(file => {
                if (file.response) {
                    file.url = file.response.url;
                    that.pdfUrl = file.url
                }
                return file;
            });
        },
        wordListChange(info){
            let that = this;
            let fileList = [...info.fileList];
            fileList = fileList.slice(-1);
            this.wordList = fileList;
            this.wordUrl = "";
            fileList = fileList.map(file => {
                if (file.response) {
                    file.url = file.response.url;
                    that.wordUrl = file.url
                }
                return file;
            });
        },
        downloadPdf(record){
            if(record.docs && record.docs.pdf && record.docs.pdf.url){
                window.open(record.docs.pdf.url);
            }else{
                this.$message.warning('尚未上传PDF文件')
            }
        },
        downloadWord(record){
            if(record.docs && record.docs.word && record.docs.word.url){
                window.open(record.docs.word.url);
            }else{
                this.$message.warning('尚未上传WORD文件')
            }
        },
        showTemplateName(){
            console.log(this.templateName);
        },
        onTemplateNameChange(value){
            this.templateName = value;
            console.log(this.templateName)
        },
        onSelectTemplateName(value){
            this.templateName = value;
        },
        randomColor(){
            let color = '#';
            for(let i=0;i<6;i++){
                color += '0123456789abcdef'.split('')[Math.floor(Math.random()*16)];
            }
            return color;
        },
        showModal(){
            this.addGroupVisible = true;
        },
        hideModal(){
            this.addGroupVisible = false;

            let data = {
                groupName: this.nameInput
            };
            if(this.pdfList.length){
                data.pdfUrl = this.pdfList[0];
            }
            if(this.wordList.length){
                data.wordUrl = this.wordList[0];
            }
            this.instance
            .post(
            '/private/apiGroup',
            data
            )
            .then(response => {
                let result = response.data;
                if(!result.result){
                    this.$message.error('添加API组失败');
                }
                this.fetch({
                    pageSize: this.pagination.pageSize,
                    page: this.pagination.current
                })
            })
            .catch(function (error) { // 请求失败处理
                console.log(error);
            });
        },
        toItemManage(value){
            EventBus.$emit('selectGroup', value);
            EventBus.$emit('modeChange', 'item');
        },
        toTemplateManage(template_id, group_id, templatename){
            EventBus.$emit('selectTemplate', {template_id, templateName:templatename});
            EventBus.$emit('selectGroup', group_id);
            EventBus.$emit('modeChange', 'template');
        },
        showAddTemplate(record){
            this.showCreate = true;
            if(record.templates){
                this.templateNameOptions = []
                for(let templateName in record.templates){
                    this.templateNameOptions.push({
                        value: templateName,
                        label: templateName
                    })
                }
            }
            this.apiGroupId = record._id;
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
                this.fetch({
                    pageSize: this.pagination.pageSize,
                    page: this.pagination.current
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
            this.instance
            .get(
            '/private/apiGroup',
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
        activeGroup(record){
            record.active = true;
            this.$forceUpdate();
        },
        confirmGroupNameChange(record, groupName){
            this.instance
            .patch(
            `/private/apiGroup/${record._id}/modify`,
            {groupName}
            )
            .then(response => {
                this.$message.info('修改分类名称成功！');
                record.active = false;
                let result = response.data;
                record.groupName = result.apiGroup.groupName;
            })
            .catch(function (error) { // 请求失败处理
            console.log(error);
            });
        }
    },
    mounted(){
        //注册事件监听
        this.fetch({
            page:1,
            pageSize:15
        });
        this.actionUrl = `${this.instance.defaults.baseURL}/private/cos/saveFile`;
    }
};
</script>