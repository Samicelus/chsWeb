<template>
  <div style="margin:10px;display:inline-block;vertical-align:top;width:100%">
    <a-input 
    addonBefore="节点名称" 
    v-if="!blockName" 
    style="width:50%" 
    :defaultValue="newBlockName"
    @change="e=>onNewNameChange(e.target.value)">
    </a-input>
    <a-divider orientation="left">输入来源配置</a-divider>
        <a-row>
            <a-col :span="6">
                <div class="source-select">
                    <a-divider dashed>入参</a-divider>
                    <a-select 
                    mode="tags"
                    :defaultValue="inputData"
                    @change="value=>onInputChange(value, 'inputData')"
                    :options="blockOption"
                    style="width:100%"
                    >
                    </a-select>
                </div>
            </a-col>
            <a-col :span="6">
                <div class="source-select">
                    <a-divider dashed>请求头</a-divider>
                    <a-select 
                    mode="tags"
                    :defaultValue="headerData"
                    @change="value=>onInputChange(value, 'headerData')"
                    :options="blockOption"
                    style="width:100%"
                    >
                    </a-select>
                </div>
            </a-col>
            <a-col :span="6">
                <div class="source-select">
                    <a-divider dashed>签名数据</a-divider>
                    <a-select 
                    mode="tags"
                    :defaultValue="signData"
                    @change="value=>onInputChange(value, 'signData')"
                    :options="blockOption"
                    style="width:100%"
                    >
                    </a-select>
                </div>
            </a-col>
        </a-row>
    <a-divider orientation="left">基础配置</a-divider>
        <a-input-group compact>
            <a-input 
            :defaultValue="api.host" 
            placeholder="请输入接口主机域名"
            style="margin-bottom:5px;margin-left:5px;width:30%" 
            @change="e=>onHostChange(e.target.value)" 
            >
                <a-select 
                slot="addonBefore"
                v-model="api.protocal" 
                :options="protocalOptions"
                @change="value=>onProtocalChange(value)"
                style="width:95px"
                />
            </a-input>
            <a-input
                style=" width:30px; border-left: 0; pointer-events: none; backgroundColor: #fff"
                placeholder="/"
                disabled
            />
            <a-input
            :defaultValue="api.url"
            placeholder="接口路由为必填"
            :style="{'margin-bottom':'5px','width':'67%','border-color':!api.url?'#D90000':'rgba(0,0,0,0.2)'}"
            @change="e=>onUrlChange(e.target.value)"
            >
            </a-input>
        </a-input-group>
    <a-divider dashed/>

    <a-row>
        <a-col :span="5">
            <a-input value="请求方法" disabled></a-input>
        </a-col>
        <a-col :span="1">
            <a-divider type="vertical"/>
        </a-col>
        <a-col :span="11">
            <a-radio-group 
            v-model="api.method" 
            style="margin:5px" 
            size="small" 
            buttonStyle="solid">
                <a-radio-button value="GET">GET</a-radio-button>
                <a-radio-button value="POST">POST</a-radio-button>
                <a-radio-button value="DELETE">DELETE</a-radio-button>
                <a-radio-button value="PUT">PUT</a-radio-button>
                <a-radio-button value="PATCH">PATCH</a-radio-button>
                <a-radio-button value="HEAD">HEAD</a-radio-button>
                <a-radio-button value="SOAP">SOAP</a-radio-button>
            </a-radio-group>
        </a-col>
        <a-col :span="7">
            <a-input 
            v-if="api.method === 'SOAP'"
            :defaultValue="api.funcName"
            addonBefore="SOAP方法名称"
            @change="e=>onFuncNameChange(e.target.value)"
            />
        </a-col>
    </a-row>

    <a-divider orientation="left" dashed>签名配置</a-divider>
    <a-row>
        <a-col :span="2">
            <a-switch
            v-if="api.sign"
            :defaultChecked="api.sign.enabled" 
            @change="signEnabledChange" 
            >
            </a-switch>
        </a-col>
        <a-col :span="6" v-if="api.sign && api.sign.enabled">
            <a-input
            :defaultValue="api.sign.path||'sign'"
            addonBefore="签名字段名称"
            @change="e=>onSignPathChange(e.target.value)"
            style="padding-right:5px"
            />
        </a-col>
        <a-col :span="10" v-if="api.sign && api.sign.enabled">
            <a-input
            :defaultValue="api.sign.salt"
            @change="e=>onSaltChange(e.target.value)"
            addonBefore="待签名尾部加盐"
            style="padding-right:5px"
            >
            </a-input>
        </a-col>
        <a-col :span="6" v-if="api.sign && api.sign.enabled">
            hash算法:
            <a-select
            :defaultValue="api.sign.algorithm"
            :options="cryptoOptions"
            @change="onAlgorithmChange"
            >
            </a-select>
        </a-col>
    </a-row>

    <a-divider orientation="left">mock配置</a-divider>

    <a-row>
        <a-col :span="4">
            <a-switch
            checked-children="开启mock"
            un-checked-children="关闭mock"
            :defaultChecked="api.mock?api.mock.enable:false" 
            @change="mockEnableChange" 
            style="margin:5px">
            </a-switch>
        </a-col>
        <a-col :span="4" v-if="api.mock && api.mock.enable">
            mock数据类型:
            <a-select
            :defaultValue="api.mock.dataType"
            @change="mockTypeChange"
            >
                <a-select-option key="json">
                    json
                </a-select-option>
                <a-select-option key="text">
                    text
                </a-select-option>
            </a-select>
        </a-col>
        <a-col :span="16">
        </a-col>
    </a-row>

    <a-row v-if="api.mock && api.mock.enable" style="margin-top:5px">
        <a-col :span="24">
        <a-textarea 
        :placeholder="(api.mock.dataType == 'json')?'作为固定data传入,JSON格式':'输入字符串mock数据'" 
        :autoSize="{ minRows: 3}"
        :defaultValue="(api.mock.dataType == 'json')?JSON.stringify(api.mock.mockReturn,null,2):api.mock.mockReturn"
        @focus="e=>onMockFocus(e.target)"
        @blur="e=>onMockConfirm(e.target)"
        />
        </a-col>
    </a-row>

    <a-divider orientation="left">结果缓存配置</a-divider>

    <a-row>
        <a-col :span="5">
            <a-checkbox 
            v-if="api.cache"
            :defaultChecked="api.cache.isCached" 
            @change="e=>isCachedChange(e.target.checked)" 
            style="margin:5px">
                是否写入缓存
            </a-checkbox>
        </a-col>
        <a-col :span="3">
            <a-switch
            v-if="blockId"
            checked-children="立即清除缓存"
            un-checked-children="不清除缓存"
            :defaultChecked="false" 
            @change="flashChange" 
            style="margin:5px">
            </a-switch>
        </a-col>
        <a-col :span="16" v-if="api.cache && api.cache.isCached">
            <a-input-group compact>
                <a-input 
                :defaultValue="api.cache.cacheKey" 
                placeholder="输入缓存字段名称" 
                @change="e=>onCacheKeyChange(e.target)"
                addonBefore="缓存key"
                style="width: 50%"
                />
                <a-input value="缓存时间(秒)" disabled style="width: 25%"/>
                <a-input-number 
                v-model="api.cache.cacheTime.default"
                style="width: 25%"
                />
            </a-input-group>
        </a-col>
    </a-row>

    <a-divider v-if="api.method==='SOAP'" dashed>JSON字符串化数据</a-divider>
    <a-input
    v-if="api.method==='SOAP'"
    :defaultValue="api.stringifyPath"
    @change="e=>onStringifyPathChange(e.target.value)"
    />
    <a-divider orientation="left">调用结果解析</a-divider>
    <a-row>
        <a-col :span="12">
            <a-input-group>
                <a-input
                defaultValue="结果类型"
                disabled
                style="width:30%"
                >
                </a-input>
                <a-select
                :options="dataTypeOptions"
                :defaultValue="api.dataType"
                style="width:70%;padding-right:5px"
                @change="onDataTypeChange"
                >
                </a-select>
            </a-input-group>
        </a-col>
        <a-col :span="12">
            <a-input-group>
                <a-input
                defaultValue="解析字符串"
                disabled
                style="width:30%"
                >
                </a-input>
                <a-select
                :options="convertTextOptions"
                :defaultValue="api.convertText"
                style="width:70%"
                @change="onConvertTextChange"
                >
                </a-select>
            </a-input-group>
        </a-col>
    </a-row>

    <a-button @click="showData" style="margin-top:5px">显示数据</a-button>
  </div>
</template>
<script>
    import { EventBus } from '../../lib/event-bus.js'; //全局事件总线
    import mongoose from 'mongoose';
    //import _ from 'lodash';

  export default {
    data() {
        return {
            block_id: "",
            newBlockName: '',
            delConfirm: false,
            tempDelKey: "",
            addConfirm: false,
            tempAddKey: "",
            tempCacheKey: "",
            tempData: "",
            tempDataSource: "",
            tempDataMerge: "",
            tempMock: "",
            tempReturn: "",
            protocal: "http://",
            url: "",
            protocalOptions:[
                {
                    label: "选择协议",
                    value: "",
                    disabled: true
                },
                {
                    label: "http://",
                    value: "http://"
                },
                {
                    label: "https://",
                    value: "https://"
                }
            ],
            hideAddHeader: true,
            apiNames: [
            ],
            preProcessOptions: [
                "header", "body", "query"
            ],
            api_id: "",
            api:{
                url:"",
                protocal: "",
                host: "",
                cache:{isCached:false},
                data:{},
                method:"GET",
                sign:{enabled:false},
                bodyConfig: {},
                dataType: 'json',
                convertText: '',
                mock: {
                    enable: false,
                    dataType: 'json',
                    mockReturn: {}
                }
            },
            cryptoOptions:[
                {
                    label: 'MD5',
                    value: 'md5'
                },
                {
                    label: 'SHA1',
                    value: 'sha1'
                },
                {
                    label: 'Hmac',
                    value: 'hmac'
                }
            ],
            inputSource: false,
            inputDataSource: false,
            docCascader:{
            },
            dataTypeOptions:[
                {
                    label: 'json对象',
                    value: 'json'
                },
                {
                    label: 'text文本',
                    value: 'text'
                }
            ],
            convertTextOptions:[
                {
                    label: '不解析',
                    value: ''
                },
                {
                    label: '解析xml',
                    value: 'xml'
                },
                {
                    label: '解析json字符串',
                    value: 'json'
                }
            ],
            customizeSources:[],
            tags: [],
            tagMap: {},
            showAddItem: false,
            tempTagName: "",
            tempDescription: "",
            apiGroups: []
        };
    },
    props: ['blockName', 'blockData', 'blockId', 'inputData', 'headerData', 'signData', 'blockOption'],
    methods:{
        onNewNameChange(value){
            this.newBlockName = value;
        },
        updateBlockData(){
            EventBus.$emit('updateBlock', {block_id:this.block_id, blockConfig: this.api});
        },
        onInputChange(value, inputName){
            EventBus.$emit('changeBlocksInput',{
                blockName: this.blockName,
                inputName,
                value
            })
        },
        signEnabledChange(checked){
            this.api.sign.enabled = checked;
        },
        onSignPathChange(value){
            this.api.sign.path = value;
        },
        onUseDataChange(value){
            this.api.sign.useData = value;
        },
        onSaltChange(value){
            this.api.sign.salt = value;
        },
        onAlgorithmChange(value){
            this.api.sign.algorithm = value;
        },
        onApiNameChange(value) {
            this.api.name = value;
        },
        onFuncNameChange(value){
            this.api.funcName = value;
        },
        onProtocalChange(value){
            this.api.protocal = value;
        },
        onHostChange(value) {
            this.api.host = value;
        },
        onUrlChange(value) {
            this.api.url = value;
        },
        isCachedChange(checked){
            this.api.cache.isCached = checked;
            if(checked && !this.api.cache.cacheTime){
                this.api.cache.cacheTime = {
                    default: 60
                }
            }
            if(checked && !this.api.cache.cacheKey){
                this.api.cache.cacheKey = this.api.url? this.api.url.split('/').pop(): Math.floor((Math.random()*1000)+1).toString();
            }
            this.$forceUpdate();
        },
        onCacheKeyChange(target){
            if(target.value){
                this.api.cache.cacheKey = target.value;
            }else{
                this.$message.error('缓存字段名不能为空!');
                target.value = this.api.cache.cacheKey;
            }
        },
        onMockFocus(target){
            this.tempMock = target.value;
        },
        onMockConfirm(target){
            if(!this.api.mock){
                this.api.mock = {
                    enable: false,
                    dataType: 'json',
                    mockReturn: {}
                }
            }
            if(this.api.mock.dataType == 'json'){
                try{
                this.api.mock.mockReturn = JSON.parse(target.value);
                }catch(e){
                    target.value = this.tempMock;
                }
            }
            if(this.api.mock.dataType == 'text'){
                this.api.mock.mockReturn = target.value;
            }
        },
        onStringifyPathChange(value){
            this.api.stringifyPath = value;
        },
        mockEnableChange(checked){
            if(!this.api.mock){
                this.api.mock = {
                    enable: false,
                    dataType: 'json',
                    mockReturn: {}
                }
            }
            this.api.mock.enable = checked;
        },
        mockTypeChange(value){
            if(!this.api.mock){
                this.api.mock = {
                    enable: false,
                    dataType: 'json',
                    mockReturn: {}
                }
            }
            let preType = this.api.mock.dataType;
            this.api.mock.dataType = value;
            if(preType != value){
                switch(value){
                    case "json":
                        this.api.mock.mockReturn = {};
                    break;
                    case "text":
                        this.api.mock.mockReturn = "";
                    break;
                    default:
                    break;
                }
            }
            this.$forceUpdate();
        },
        flashChange(checked){
            this.api.cache.flashNow = checked;
        },
        showData(){
            console.log(JSON.parse(JSON.stringify(this.api)));
        },
        onDataTypeChange(value){
            this.api.dataType = value;
        },
        onConvertTextChange(value){
            this.api.convertText = value;
        },
        fetchBlockData(){
            this.api = this.blockData;
        },
        createBlockData(){
            let block_id = mongoose.Types.ObjectId().toString();
            EventBus.$emit('createRequestBlock', {
                block_id, 
                name: this.newBlockName,
                inputData: this.inputData,
                headerData: this.headerData,
                signData: this.signData,
                blockConfig: this.api
            });
        },
    },
    components:{
        
    },
    created(){
        if(this.blockId){
            this.block_id = this.blockId;
            this.fetchBlockData(this.block_id);
        }else{
            this.api = {
                url:"",
                protocal: "",
                host: "",
                cache:{isCached:false},
                data:{},
                method:"GET",
                sign:{enabled:false},
                bodyConfig: {},
                dataType: 'json',
                convertText: '',
                mock: {
                    enable: false,
                    dataType: 'json',
                    mockReturn: {}
                }
            }
            EventBus.$emit('clearTempInputs');
        }
    },
    mounted(){
        let that = this;
        EventBus.$off('editRequestBlockConfirm');
        EventBus.$on('editRequestBlockConfirm',async ()=>{
            if(that.blockId){
                await that.updateBlockData();
            }else{
                await that.createBlockData();
            }
        });
    }
  };

</script>

<style>
.source-select{
    padding-left:5px;
}
</style>
