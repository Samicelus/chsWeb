<template>
    <div>
        <a-divider orientation="left">上传备份文件</a-divider>
        <a-upload
        :customRequest="onUpload"
        :file-list="fileList"
        @change="onFileChange">
            <a-button><a-icon type="upload" />备份文件</a-button>
        </a-upload>
        <a-divider orientation="left">备份文件内容</a-divider>
        <a-row>
            <a-col :span="2">
            </a-col>
            <a-col :span="22">
                <a-divider orientation="left">将会被替换的接口</a-divider>
                    <div :style="{ borderBottom: '1px solid #E9E9E9', 'text-align':'left' }">
                        <a-checkbox :indeterminate="indeterminate" :checked="checkAll" @change="e=>onCheckAllChange(e.target.checked)">
                            全选
                        </a-checkbox>
                    </div>
                    <a-row v-for="(tagMappedApi, mappedKey) in tagMappedApis" :key="mappedKey" type="flex" justify="start">
                        <a-col :span="10" style="text-align:left">
                        <a-checkbox
                        :checked="!!replacedApis[mappedKey]"
                        @change="e=>mappedApiCheckedChange(e.target.checked, mappedKey)"
                        >
                            {{tagMappedApi.replacedName}}
                        </a-checkbox>
                        </a-col>
                        <a-col :span="6" style="text-align:center">
                            <a-tag style="width:100%">
                                {{tagMappedApi.tagName}}
                            </a-tag>
                        </a-col>
                    </a-row>
                <a-divider orientation="left">新增接口</a-divider>
                    <div :style="{ borderBottom: '1px solid #E9E9E9', 'text-align':'left' }">
                        <a-checkbox :indeterminate="addIndeterminate" :checked="addCheckAll" @change="e=>onCheckAllAddChange(e.target.checked)">
                            全选
                        </a-checkbox>
                    </div>
                    <a-row v-for="(noTagApi, noTagKey) in noTagApis" :key="noTagKey" type="flex" justify="start">
                        <a-col :span="10" style="text-align:left">
                            <a-checkbox
                            :checked="!!addedApis[noTagKey]"
                            @change="e=>noTagApiCheckedChange(e.target.checked, noTagKey)"
                            >
                                {{noTagApi.name}}
                                
                            </a-checkbox>
                        </a-col>
                        <a-col :span="6" style="text-align:center">
                            <a-tag v-if="noTagApi.tagName" style="width:100%">
                                {{noTagApi.tagName}}
                            </a-tag>
                        </a-col>
                    </a-row>
                <a-divider orientation="left">标签</a-divider>
                    <a-row v-for="(notExistTag, tagKey) in notExistTagsMap" :key="tagKey" type="flex" justify="start">
                        <a-checkbox
                        :checked="!!addedTags[tagKey]"
                        disabled
                        >
                            {{notExistTag.tagName}}
                        </a-checkbox>
                    </a-row>
            </a-col>
        </a-row>
        <a-row>
            <a-col :span="20">
            </a-col>
            <a-col :span="4">
                <a-button type="primary" @click="startImport" :disabled="doing">导入</a-button>
            </a-col>
        </a-row>
    </div>
</template>

<script>

export default{
    data(){
        return {
            fileList: [
            ],
            tagMappedApis: {},
            noTagApis:[],
            notExistTagsMap: {},
            groupedTargetTags: {},
            replacedApis:{},
            addedApis:{},
            addedTags:{},
            doing : false,
            tempAction: {},
            indeterminate: false,
            checkAll: false,
            addIndeterminate: false,
            addCheckAll: false
        }
    },
    props:['appId'],
    methods:{
        onCheckAllChange(value){
            this.checkAll = value;
            if(value){
                for(let key in this.tagMappedApis){
                    this.mappedApiCheckedChange(true, key);
                }
            }else{
                for(let key in this.tagMappedApis){
                    this.mappedApiCheckedChange(false, key);
                }
            }
        },
        onCheckAllAddChange(value){
            this.addCheckAll = value;
            if(value){
                for(let key in this.noTagApis){
                    this.noTagApiCheckedChange(true, key);
                }
            }else{
                for(let key in this.noTagApis){
                    this.noTagApiCheckedChange(false, key);
                }
            }
        },
        onFileChange(info){
            let fileList = [...info.fileList];
            fileList = fileList.slice(-1);
            this.fileList = fileList;
        },
        mappedApiCheckedChange(checked, key){
            if(checked){
                this.replacedApis[key] = this.tagMappedApis[key];
                let reg = new RegExp('-');
                let tagName;
                if(reg.test(this.replacedApis[key].tagName)){
                    tagName = this.replacedApis[key].tagName.split('-')[0];
                }else{
                    tagName = this.replacedApis[key].tagName
                }
                if(tagName && this.notExistTagsMap[tagName]){
                    this.addedTags[tagName] = this.notExistTagsMap[tagName];
                }
            }else{
                delete this.replacedApis[key];
            }
            let checkedLength = Object.keys(this.replacedApis).length;
            let allOptionsLength = Object.keys(this.tagMappedApis).length;
            this.indeterminate = !!checkedLength && checkedLength < allOptionsLength;
            this.$forceUpdate();
        },
        noTagApiCheckedChange(checked, key){
            if(checked){
                this.addedApis[key] = this.noTagApis[key];
                let reg = new RegExp('-');
                let tagName;
                if(reg.test(this.addedApis[key].tagName)){
                    tagName = this.addedApis[key].tagName.split('-')[0];
                }else{
                    tagName = this.addedApis[key].tagName;
                }
                if(tagName && this.notExistTagsMap[tagName]){
                    this.addedTags[tagName] = this.notExistTagsMap[tagName];
                }
            }else{
                delete this.addedApis[key];
            }
            let checkedLength = Object.keys(this.addedApis).length;
            let allOptionsLength = Object.keys(this.noTagApis).length;
            this.addIndeterminate = !!checkedLength && checkedLength < allOptionsLength;
            this.$forceUpdate();
        },
        onUpload(action){
            const data = new FormData();
            this.tempAction = action;
            data.append('files', action.file);
            this.instance.post(
                `/private/backup/${this.appId}/analyseBackupFile`,
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
                    this.noTagApis = result.result.noTagApis;
                    this.tagMappedApis = result.result.tagMappedApis;
                    this.notExistTagsMap = result.result.notExistTagsMap;
                    this.replacedApis = {};
                    this.addedApis = {};
                    this.indeterminate = false;
                    this.checkAll = false;
                    this.addIndeterminate = false;
                    this.addCheckAll = fals;
                    this.$forceUpdate();
                }else{
                    action.onError(new Error(result.errorMessage));
                }
            }).catch(function (error) { // 请求失败处理
                action.onError(error);
            });
        },
        startImport(){
            this.doing = true;
            let addedTags = [];
            for(let tagName in this.addedTags){
                addedTags.push(this.addedTags[tagName]);
            }
            let addedConfigs = [];
            for(let tagName in this.addedApis){
                addedConfigs.push(this.addedApis[tagName]);
            }
            let replacedConfigs = [];
            for(let key in this.replacedApis){
                replacedConfigs.push(this.replacedApis[key]);
            }
            this.instance
            .post(
            '/private/backup/importConfigs',
            {
                app_id: this.appId,
                addedTags, 
                addedConfigs, 
                replacedConfigs
            }
            ).then(response => {
                let result = response.data;
                this.onUpload(this.tempAction);
                this.doing = false;
                if(result.result){
                    this.$message.info('导入成功!');
                }else{
                    this.$message.error('导入失败!');
                }
            })
            .catch(function (error) { // 请求失败处理
                this.reset();
                console.log(error);
            });
        },
        reset(){
            this.fileList = [];
            this.tagMappedApis = {};
            this.noTagApis = [];
            this.notExistTagsMap = {};
            this.groupedTargetTags = {};
            this.replacedApis = {};
            this.addedApis = {};
            this.addedTags = {};
            this.doing = false;
        }
    },
    created(){

    },
    mounted(){

    }
}
</script>

