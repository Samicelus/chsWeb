<template>
    <div style="margin:10px;display:inline-block;vertical-align:top;width:100%" v-if="loading">
        <a-row>
            <a-col :span="24">
                <a-input
                addonBefore="回调名称"
                v-model="callbackConfig.name"
                >
                </a-input>
            </a-col>
        </a-row>
        <a-divider dashed/>
        <a-row>
            <a-col :span="24">
                <a-input
                addonBefore="回调Tag"
                v-model="callbackConfig.callbackTag"
                >
                </a-input>
            </a-col>
        </a-row>
        <a-divider orientation="left" dashed>回调方法配置</a-divider>
        <a-card v-for="(methodConfig, mIndex) in callbackConfig.methodConfigs" :key="methodConfig.method" :title="methodConfig.method" style="margin-top:5px">
            <a slot="extra" @click="deleteMethodConfig(mIndex)">删除</a>
            <b-callbackTypeConfig :signPositionOptions="signPositionOptions" :hashOptions="hashOptions" :encodeOptions="encodeOptions" :dataTypeOptions="dataTypeOptions" :convertTextOptions="convertTextOptions" :apiOptions="apiOptions" :sortTypeOptions="sortTypeOptions" :methodConfig="methodConfig" :customizeConfig="customizeConfig" />
        </a-card>
        <div style="margin-top:5px">
            <div v-if="showAddMethod">
                <a-select
                style="width:120px"
                @change="onAddMethodChange"
                >
                    <a-select-option value="get">GET</a-select-option>
                    <a-select-option value="post">POST</a-select-option>
                </a-select>
                <a-button style="margin-left:5px" @click="onAddMethodConfirm">确定</a-button>
            </div>
            <a-button type="dashed" v-else @click="onShowAddMethod">新增回调方式</a-button>
        </div>

        <a-divider orientation="left" dashed>透传配置</a-divider>
        <a-row style="margin-top:5px">
            <a-col :span="24">
                <a-input
                addonBefore="透传地址"
                v-model="callbackConfig.callbackUrl"
                >
                </a-input>
            </a-col>
        </a-row>
        <a-divider orientation="left" dashed>mock配置</a-divider>
        <a-row>
            <a-col :span="4">
                <a-switch
                checked-children="开启mock"
                un-checked-children="关闭mock"
                v-model="callbackConfig.mock.enable"
                style="margin:5px">
                </a-switch>
            </a-col>
            <a-col :span="4" v-if="callbackConfig.mock && callbackConfig.mock.enable">
                mock数据类型:
                <a-select
                :defaultValue="callbackConfig.mock.dataType"
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
        <a-row v-if="callbackConfig.mock && callbackConfig.mock.enable" style="margin-top:5px">
            <a-col :span="24">
            <a-textarea 
            :placeholder="(callbackConfig.mock.dataType == 'json')?'作为固定data传入,JSON格式':'输入字符串mock数据'" 
            :autoSize="{ minRows: 3}"
            :defaultValue="(callbackConfig.mock.dataType == 'json')?JSON.stringify(callbackConfig.mock.mockReturn,null,2):callbackConfig.mock.mockReturn"
            @focus="e=>onMockFocus(e.target)"
            @blur="e=>onMockConfirm(e.target)"
            />
            </a-col>
        </a-row>
        <a-divider dashed></a-divider>
        <a-button @click="showData">显示数据</a-button>
    </div>
</template>

<script>
    import { EventBus } from '../lib/event-bus.js'; //全局事件总线
    import BCallbackTypeConfig from './b-components/b-callbackTypeConfig'

    export default {
        data(){
            return {
                showAddMethod: false,
                addMethod: "",
                loading: false,
                callback_id:"",
                callbackConfig: {
                    name: "",
                    callbackUrl: "",
                    callbackTag: "",
                    mock: {
                        enable: false,
                        dataType: 'json',
                        mockReturn: {}
                    },
                    methodConfigs:[]
                },
                tempMock: "",
                fromMap: {
                },
                fromOptions:[],
                systemMap: {
                },
                cryptoMethodMap:{
                },
                hashMap: {
                },
                encodeMap: {
                },
                cryptoMethodOptions:[
                ],
                hashOptions:[
                ],
                encodeOptions:[
                ],
                dataTypeMap: {},
                dataTypeOptions:[
                ],
                convertTextMap:{},
                convertTextOptions:[
                    {
                        label: "不解析",
                        value: ""
                    }
                ],
                desensitizationMap: {},
                desensitizationOptions: [],
                signPositionMap: {},
                signPositionOptions:[],
                sortTypeMap: {},
                sortTypeOptions:[],
                apiOptions: []
            };
        },
        props: ['appId', 'callbackId', 'apis', 'customizeConfig'],
        components: {
            "b-callbackTypeConfig": BCallbackTypeConfig
        },
        methods:{
            showData(){
                console.log(this.callbackConfig);
            },
            onShowAddMethod(){
                this.showAddMethod = true;
            },
            onAddMethodChange(value){
                this.addMethod = value;
            },
            onAddMethodConfirm(){
                let invalid = true;
                if(!this.addMethod){
                    this.$message.error("未选择回调方法");
                }else{
                    invalid = false;
                }
                let addMethod = this.addMethod;
                let setted = false;
                this.callbackConfig.methodConfigs.forEach(item=>{
                    if(item.method == addMethod){
                        setted = true;
                    }
                })
                if(setted){
                    this.$message.error("回调方法重复");
                }
                if(!invalid && !setted){
                    this.callbackConfig.methodConfigs.push({
                        method: addMethod,
                        verifySignature: {
                            enable: false,
                            algorithm: "sha1",
                            coding: "hex",
                            enableSeparator: false,
                            separator: "&",
                            signature: {
                                path: "",
                                origin: "query"
                            },
                            verifykeys:[]
                        },
                        bodyType: "json",
                        convertText: "",
                        callApis: [],
                        asReturn: ""
                    })
                }
                this.addMethod = "";
                this.showAddMethod = false;
            },
            deleteMethodConfig(index){
                this.callbackConfig.methodConfigs.splice(index, 1);
            },
            mockEnableChange(checked){
                if(!this.callbackConfig.mock){
                    this.callbackConfig.mock = {
                        enable: false,
                        dataType: 'json',
                        mockReturn: {}
                    }
                }
                this.callbackConfig.mock.enable = checked;
            },
            mockTypeChange(value){
                if(!this.callbackConfig.mock){
                    this.callbackConfig.mock = {
                        enable: false,
                        dataType: 'json',
                        mockReturn: {}
                    }
                }
                let preType = this.callbackConfig.mock.dataType;
                this.callbackConfig.mock.dataType = value;
                if(preType != value){
                    switch(value){
                        case "json":
                            this.callbackConfig.mock.mockReturn = {};
                        break;
                        case "text":
                            this.callbackConfig.mock.mockReturn = "";
                        break;
                        default:
                        break;
                    }
                }
                this.$forceUpdate();
            },
            onMockFocus(target){
                this.tempMock = target.value;
            },
            onMockConfirm(target){
                if(!this.callbackConfig.mock){
                    this.callbackConfig.mock = {
                        enable: false,
                        dataType: 'json',
                        mockReturn: {}
                    }
                }
                if(this.callbackConfig.mock.dataType == 'json'){
                    try{
                    this.callbackConfig.mock.mockReturn = JSON.parse(target.value);
                    }catch(e){
                        target.value = this.tempMock;
                    }
                }
                if(this.callbackConfig.mock.dataType == 'text'){
                    this.callbackConfig.mock.mockReturn = target.value;
                }
            },
            async fetchCallback(callback_id){
                return this.instance
                .get(
                `/private/consultModulation/callbackConfig?callback_id=${callback_id}`
                )
                .then(response => {
                    let result = response.data;
                    let callbackConfig = result.data;
                    this.callbackConfig.name = callbackConfig.name || "";
                    this.callbackConfig.callbackUrl = callbackConfig.callbackUrl || "";
                    this.callbackConfig.callbackTag = callbackConfig.callbackTag || "";
                    this.callbackConfig.mock = callbackConfig.mock || {
                        enable: false,
                        dataType: 'json',
                        mockReturn: {}
                    };
                    this.callbackConfig.methodConfigs = callbackConfig.methodConfigs || [];
                    this.loading = true;
                })
                .catch(function (error) { // 请求失败处理
                    console.log(error);
                });
            },
            modifyItem(){
                this.instance
                .patch(
                `/private/consultModulation/${this.callbackId}/callbackConfig`,
                {
                    callback: this.callbackConfig
                }
                )
                .then(response => {
                    let result = response.data;
                    if(result.result){
                        if(result.data){
                            this.$message.info(`修改回调成功`);
                        }
                    EventBus.$emit('apiCreated',{});
                    }
                })
                .catch(function (error) { // 请求失败处理
                    console.log(error);
                });
            },
            createItem(){
                this.instance
                .post(
                `/private/consultModulation/callbackConfig`,
                {
                    app_id: this.appId,
                    callback: this.callbackConfig
                }
                )
                .then(response => {
                    let result = response.data;
                    if(result.result){
                        if(result.data){
                            this.$message.info(`新增回调 ${result.data.callbackTag} 成功`);
                        }
                    EventBus.$emit('apiCreated',{});
                    }
                })
                .catch(function (error) { // 请求失败处理
                    console.log(error);
                });
            },
            fetchDocMap(){
                this.instance
                .get(
                '/private/consultModulation/docMap'
                )
                .then(response => {
                    let result = response.data;
                    this.cryptoMethodMap = result.crypto;
                    this.desensitizationMap = result.desensitization;
                    this.dataTypeMap = result.dataType;
                    this.convertTextMap = result.convertText;
                    this.fromMap = result.from;
                    this.systemMap = result.system;
                    this.hashMap = result.hash;
                    this.encodeMap = result.encode;
                    this.signPositionMap = result.signPosition;
                    this.sortTypeMap = result.sortType;
                    for(let from in this.fromMap){
                        this.fromOptions.push({
                            label: this.fromMap[from],
                            value: from
                        })
                    }
                    for(let cryptoMethod in this.cryptoMethodMap){
                        this.cryptoMethodOptions.push({
                            label: this.cryptoMethodMap[cryptoMethod],
                            value: cryptoMethod
                        })
                    }
                    for(let desensitization in this.desensitizationMap){
                        this.desensitizationOptions.push({
                            label: this.desensitizationMap[desensitization],
                            value: desensitization
                        })
                    }
                    for(let dataType in this.dataTypeMap){
                        this.dataTypeOptions.push({
                            label: this.dataTypeMap[dataType],
                            value: dataType
                        })
                    }
                    for(let convertText in this.convertTextMap){
                        this.convertTextOptions.push({
                            label: this.convertTextMap[convertText],
                            value: convertText
                        })
                    }
                    for(let protocal in this.protocalMap){
                        this.protocalOptions.push({
                            label: this.protocalMap[protocal],
                            value: protocal
                        })
                    }
                    for(let hash in this.hashMap){
                        this.hashOptions.push({
                            label: this.hashMap[hash],
                            value: hash
                        })
                    }
                    for(let encode in this.encodeMap){
                        this.encodeOptions.push({
                            label: this.encodeMap[encode],
                            value: encode
                        })
                    }
                    for(let signPosition in this.signPositionMap){
                        this.signPositionOptions.push({
                            label: this.signPositionMap[signPosition],
                            value: signPosition
                        })
                    }
                    for(let sortType in this.sortTypeMap){
                        this.sortTypeOptions.push({
                            label: this.sortTypeMap[sortType],
                            value: sortType
                        })
                    }
                })
                .catch(function (error) { // 请求失败处理
                    console.log(error);
                });
            }
        },
        created(){
            this.callback_id = this.callbackId;
            
            this.fetchDocMap();
            if(this.callbackId){
                this.fetchCallback(this.callbackId);
            }else{
                this.loading = true;
            }
        },
        mounted(){
            //注册事件监听
            let that = this;
            EventBus.$off('editCallbackConfirm');
            EventBus.$on('editCallbackConfirm',async ()=>{
                if(that.callback_id){
                    await that.modifyItem();
                }else{
                    await that.createItem();
                }
            });
            this.apiOptions = this.apis.map(item=>{
                return {
                    label: item.name,
                    value: item._id
                }
            })
        }
    }
</script>
<style>
</style>
