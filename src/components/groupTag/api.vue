<template>
  <div style="margin:10px;display:inline-block;vertical-align:top;width:100%" v-if="loading">
    <a-modal 
    v-model="delConfirm"
    :closable="false" 
    @ok="delKey" 
    okText="删除" 
    cancelText="取消"
    :width="176"
    centered
    >
        <a-icon
        theme="twoTone"
        twoToneColor="#d1ba00"
        type="question-circle"
        /><span> 确认删除该字段</span>
    </a-modal>
    <a-modal 
    title="添加字段" 
    v-model="addConfirm" 
    @ok="addKey" 
    okText="添加" 
    cancelText="取消"
    destroyOnClose
    >
      <a-input 
      placeholder="请输入字段名称" 
      :defaultValue="tempAddKey"
      @change="e=>onAddKeychange(e.target.value)"
      />
    </a-modal>
    <a-modal title="添加标签" v-model="showAddItem" @ok="hideModal" okText="添加" cancelText="取消">
        <a-input placeholder="输入标签映射名" v-model="tempTagName"/>
        <p v-if="isTagDup()" style="color:#CC3366">标签映射名重复</p>
        <a-input placeholder="输入标签中文名称" v-model="tempDescription" style="margin-top:10px"/>
        <p v-if="isDesDup()" style="color:#EE6633">标签名称可能已存在，请检查!</p>
    </a-modal>
    
    <a-divider orientation="left">基础配置</a-divider>
        <a-input 
        :defaultValue="api.name" 
        style="margin:5px" 
        @change="e=>onApiNameChange(e.target.value)" 
        addonBefore="API名称"
        :disabled="!!itemId"
        />
        <a-input 
        :defaultValue="api.url" 
        style="margin:5px" 
        @change="e=>onUrlChange(e.target.value)" 
        addonBefore="URL"
        />

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

    选择标签:
    <a-select 
    :defaultValue="api.tag_oid" 
    show-search
    @search="fetchTags"
    filter
    style="margin:5px;width:600px"
    @focus="fetchTags"
    @change="changeTagid"
    >   
        <div slot="dropdownRender" slot-scope="menu">
            <v-nodes :vnodes="menu" />
            <a-divider style="margin: 4px 0;" />
            <div
                style="padding: 4px 8px; cursor: pointer;"
                @mousedown="e => e.preventDefault()"
            >
                <a-button shape="round" @click="addItem" style="width:100%">添加标签</a-button>
            </div>
        </div>
        <a-select-option v-for="tag in tags" :key="tag._id" :value="tag._id">
            {{tag.description}}    {{tag.tagName}}
        </a-select-option>
    </a-select>

    <a-input
    :defaultValue="api.type"
    addonBefore="同类多态标识"
    @change="e=>onApiTypeChange(e.target.value)"
    style="margin:5px;width:30%"
    >
    </a-input>

    <a-divider orientation="left">前置请求配置</a-divider>

    <a-row>
        <a-col :span="8">
            <a-checkbox :defaultChecked="!!api.pre && api.pre.hasPre" @change="e=>hasPreChange(e.target.checked)" style="margin:5px">
                是否有前置请求
            </a-checkbox>
        </a-col>
        <a-col :span="16" v-if="api.pre && api.pre.hasPre">
            <a-input-group compact>
                <a-input style="width: 30%" value="API名称" disabled></a-input>
                <a-select
                :options="apiNames"
                :defaultValue="api.pre.apiName"
                style="width: 70%"
                @focus="getApiNames"
                @change="onPreApiNameChange"
                >
                </a-select>
            </a-input-group>
        </a-col>
    </a-row>

    <div v-if="api.pre && api.pre.hasPre">
        <div v-for="(ret, key) in api.pre.processReturn" :key="key.split('').join('_')">
            <a-divider dashed>{{key}}</a-divider>
            <a-row>
                <a-col :span="8">
                    <a-input 
                    :defaultValue="key" 
                    addonBefore="返回字段"
                    @change="e=>enterPreProcessReturn(e.target, ret, key)"
                    >
                        <a-icon 
                        slot="addonAfter" 
                        type="minus-circle"
                        theme="twoTone"
                        twoToneColor="#eb2f96"
                        @click="e=>showDelConfirm(key)"
                        />
                    </a-input>
                </a-col>
                <a-col :span="1">
                    <a-divider type="vertical" />
                </a-col>
                <a-col :span="15">
                    <div v-for="part in preProcessOptions" :key="part">
                        <a-row>
                            <a-input 
                            :defaultValue="ret[part]?ret[part].name:''" 
                            placeholder="请输入字段名称" 
                            @change="e=>preProcessKeyChange(e.target.value, key, part)" 
                            :addonBefore="part"
                            >
                            </a-input>
                        </a-row>
                        <a-divider dashed />
                    </div>
                </a-col>
            </a-row>
        </div>
        <a-divider dashed/>
        <a-button size="small" shape="round" type="primary" icon="setting" @click="addPreProcessReturn">添加字段</a-button>
    </div>

    <!--
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
    -->
    
    <a-divider orientation="left">自定义Header配置</a-divider>

    <a-row v-for="(header, headerName) in api.headers" :key="header.split('').join('_')" style="margin-top:10px">
        <a-col :span="24">
            <a-input-group v-if="headerName==='Content-Type'" compact>
                <a-input
                defaultValue="Content-Type"
                style="width:20%"
                disabled
                >
                </a-input>
                <a-select
                style="width:80%"
                :defaultValue="api.headers['Content-Type'] || 'application/json'"
                :options="contentTypeOptions"
                @change="onContentTypeChange"
                >
                </a-select>
            </a-input-group>
            <a-input-group v-if="headerName!='Content-Type'" compact>
                <a-input
                :addonBefore="headerName"
                :defaultValue="header"
                @change="e=>onHeaderChange(e.target.value, headerName)"
                >
                </a-input>
            </a-input-group>
        </a-col>
    </a-row>

    <a-row>
        <a-col :span="8">
        </a-col>
        <a-col :span="8">
        </a-col>
        <a-col :span="8">
            <a-button 
            v-if="hideAddHeader" 
            type="primary" 
            icon="plus" 
            shape="circle" 
            style="margin-top:10px"
            @click="showAddHeader">
            </a-button>
            <a-input 
            addonBefore="header字段名称" 
            v-else style="margin-top:10px" 
            @blur="e=>addHeader(e.target.value)" 
            @keyup.enter="e=>addHeader(e.target.value)">
            </a-input>
        </a-col>
    </a-row>

    <a-divider orientation="left">数据配置</a-divider>
    <a-divider dashed>固定数据</a-divider>
    <a-textarea 
    placeholder="作为固定data传入,JSON格式" 
    :autoSize="{ minRows: 3}"
    :defaultValue="JSON.stringify(api.data,null,2)"
    @focus="e=>onDataFocus(e.target)"
    @blur="e=>onDataConfirm(e.target)"
    />


    <a-divider dashed>数据来源</a-divider>
    <div v-for="(source, index) in api.dataSource" :key="source._id">
        <!--
        <div v-if="source.targetModel">
            <a-divider orientation="left" dashed>{{source.targetModel}}</a-divider>
            <a-row type="flex" justify="space-around">
                <a-col :span="6">
                    <a-input 
                    @change="e=>onSourceNameChange(e.target.value, index)"
                    :defaultValue="source.sourceName"
                    addonBefore="数据名称"
                    />
                </a-col>
                <a-col :span="18" v-if="source.populate">
                    <div v-for="(population, pIndex) in source.populate" :key="population"
                        style="margin-left:10px;margin-bottom:5px">
                        <a-button
                        size="small"
                        shape="circle"
                        icon="close"
                        @click="e=>deletePopulate(index, pIndex)"
                        >
                        </a-button>
                        <a-cascader
                        :options="docCascader[source.targetModel]"
                        :allowClear="false"
                        changeOnSelect
                        expandTrigger="hover"
                        @change="value=>changePopulation(value, index, pIndex)"
                        :default-value="population.split(' ')"
                        style="margin-left:5px"
                        />
                    </div>
                    <div style="margin-left:10px;margin-top:15px">
                        <a-button
                        type="primary" 
                        size="small"
                        shape="round"
                        icon="link"
                        v-if="!source.addPopulation"
                        @click="e=>showPopulations(index)"
                        >添加数据关联</a-button>
                        <a-cascader
                        v-else
                        :options="docCascader[source.targetModel]"
                        changeOnSelect
                        :allowClear="false"
                        expandTrigger="hover"
                        @change="value=>addPopulation(value, index)"
                        @blur="e=>cancelAddPopulation(index)"
                        style="margin-left:5px"
                        />
                    </div>
                </a-col>
            </a-row>
        </div>
        -->
        <div>
            <a-divider orientation="left" dashed>{{source.path}}</a-divider>
            <a-row>
                <a-col :span="6">
                    <a-row>
                        <a-col :span="24">
                            <a-input
                            addonBefore="输入数据源名称"
                            :defaultValue="source.sourceName"
                            @change="e=>onSourceNameChange(e.target.value, index)"
                            >
                            </a-input>
                        </a-col>
                    </a-row>
                    <a-row style="margin-top:5px">
                        <a-col :span="24">
                            <a-input-group compact>
                                <a-input
                                defaultValue="输入数据库类型"
                                style="width:40%"
                                disabled
                                >
                                </a-input>
                                <a-select
                                style="width:60%"
                                :defaultValue="source.dbType"
                                :options="dbTypeOptions"
                                @change="value=>onDbTypeChange(value, index)"
                                >
                                </a-select>
                            </a-input-group>
                        </a-col>
                    </a-row>
                </a-col>
                <a-col :span="6">
                    <a-input
                    addonBefore="输入数据表名称"
                    :defaultValue="source.collectionName"
                    @change="e=>onModelNameChange(e.target.value, index)"
                    >
                    </a-input>
                </a-col>
                <a-col :span="6">
                    <a-input 
                    :defaultValue="source.query||source.where"
                    placeholder="如是mongodb,则输入传入find的对象.如是mysql,则输入where后语句" 
                    addonBefore="查询语句"
                    @change="e=>onQueryChange(e.target.value, index)"
                    />
                </a-col>
                <a-col :span="6">
                    <a-divider orientation="left" dashed>联表查询配置</a-divider>
                    <a-button type="primary" icon="plus" @click="e=>addJoinConfig(index)">添加联表配置</a-button>
                    <a-row v-for="(joinConfig, jIndex) in source.joins" :key="joinConfig.joinKey" style="margin-top:5px">
                        <a-col :span="24">
                            <a-row>
                                <a-col :span="3">
                                    <a-button size="small" shape="circle" icon="minus" type="danger" @click="e=>deleteJoinConfig(index, jIndex)"/>
                                </a-col>
                                <a-col :span="8">
                                    <a-select
                                    :defaultValue="joinConfig.joinType||''"
                                    @change="value=>changeJoinType(value, index, jIndex)"
                                    style="width:100%">
                                        <a-select-option key="">
                                            不联表
                                        </a-select-option>
                                        <a-select-option key="INNER JOIN" :disabled="!['mysql'].includes(source.dbType)">
                                            INNER JOIN
                                        </a-select-option>
                                        <a-select-option key="LEFT JOIN">
                                            LEFT JOIN
                                        </a-select-option>
                                        <a-select-option key="RIGHT JOIN" :disabled="!['mysql'].includes(source.dbType)">
                                            RIGHT JOIN
                                        </a-select-option>
                                    </a-select>
                                </a-col>
                                <a-col :span="1">
                                </a-col>
                                <a-col :span="12" v-if="['mysql'].includes(source.dbType) && !!joinConfig.joinType && joinConfig.joinType != ''">
                                    <a-input 
                                    v-model="joinConfig.joinModel"
                                    addonBefore="联表"
                                    >
                                    </a-input>
                                </a-col>
                            </a-row>
                            <a-row style="margin-top:10px">
                                <a-col :span="24">
                                    <a-input 
                                    v-model="joinConfig.joinKey"
                                    addonBefore="联表字段"
                                    >
                                    </a-input>
                                </a-col>
                            </a-row>
                            <a-row style="margin-top:10px" v-if="['mysql'].includes(source.dbType) && !!joinConfig.joinType && joinConfig.joinType != ''">
                                <a-col :span="24">
                                    <a-input 
                                    v-model="joinConfig.targetKey"
                                    addonBefore="目标字段"
                                    >
                                    </a-input>
                                </a-col>
                            </a-row>
                        </a-col>
                    </a-row>
                </a-col>
            </a-row>
        </div>
    </div>
    <a-row style="margin-top:10px">
        <a-col :span="8">
            <a-button v-if="!inputDataSource" type="primary" size="small" shape="round" icon="database" @click="showSourceInput">添加数据来源</a-button>
            <a-input
            v-else
            @blur="e=>addDataSource(e.target.value)"
            >
            </a-input>
        </a-col>
    </a-row>

    <a-divider dashed>数据组合</a-divider>
    <returnComp :dataObj="api.dataMerge" :dataSourceObj="api.dataSource" :systemMap="systemMap" :sourceMapObj="sourceMapObj" :customizeConfig="customizeConfig"/>
    <a-divider v-if="api.method==='SOAP'" dashed>JSON字符串化数据</a-divider>
    <a-input
    v-if="api.method==='SOAP'"
    :defaultValue="api.stringifyPath"
    @change="e=>onStringifyPathChange(e.target.value)"
    />

    <a-divider dashed>签名配置</a-divider>
    <a-row>
        <a-col :span="2">
            <a-switch
            v-if="api.sign"
            :defaultChecked="api.sign.enabled" 
            @change="signEnabledChange" 
            >
            </a-switch>
        </a-col>
        <a-col :span="4" v-if="api.sign && api.sign.enabled">
            <a-input
            :defaultValue="api.sign.path||'sign'"
            addonBefore="签名名称"
            @change="e=>onSignPathChange(e.target.value)"
            />
        </a-col>
        <a-col :span="6" v-if="api.sign && api.sign.enabled">
            <a-switch
            checked-children="对整个data签名"
            un-checked-children="部分data签名"
            :defaultChecked="api.sign.useData"
            @change="onUseDataChange"
            style="margin-left:5px"
            >
            </a-switch>
            <a-switch
            checked-children="空值参与签名"
            un-checked-children="空值不参与签名"
            :defaultChecked="api.sign.signNull"
            @change="onSignNullChange"
            style="margin-left:5px"
            >
            </a-switch>
        </a-col>
        <a-col :span="12" v-if="api.sign && api.sign.enabled">
            <a-input
            :defaultValue="api.sign.salt"
            @change="e=>onSaltChange(e.target.value)"
            addonBefore="尾部加盐"
            >
                <a-select
                slot="addonAfter"
                :defaultValue="api.sign.algorithm"
                :options="cryptoOptions"
                @change="onAlgorithmChange"
                >
                </a-select>
            </a-input>
        </a-col>
    </a-row>
    <a-row>
        <a-col :span="24" v-if="api.sign && api.sign.enabled">
            
            <returnComp :dataObj="api.sign.addedParam" :dataSourceObj="api.dataSource" :systemMap="systemMap" :sourceMapObj="sourceMapObj" :customizeConfig="customizeConfig" :callbackMap="callbackMap"/>
            
        </a-col>
    </a-row>
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
                    style="width:70%"
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
                    :defaultValue="api.convetText"
                    style="width:70%"
                    @change="onConvertTextChange"
                    >
                    </a-select>
                </a-input-group>
            </a-col>
        </a-row>
    <a-divider orientation="left">输出配置</a-divider>
    <returnComp :dataObj="api.return" :dataSourceObj="api.dataSource" :systemMap="systemMap" :sourceMapObj="sourceMapObj" :customizeConfig="customizeConfig" :callbackMap="callbackMap"/>
    <a-divider />
    <a-button @click="showData">显示数据</a-button>
  </div>
</template>
<script>
    import { EventBus } from '../../lib/event-bus.js'; //全局事件总线
    import ReturnComp from './returnComp';
    import {v4 as uuidv4} from 'uuid';

  export default {
    data() {
        return {
            tags: [],
            showAddItem: false,
            tempTagName: "",
            tempDescription: "",
            loading: false,
            delConfirm: false,
            tempDelKey: "",
            addConfirm: false,
            tempAddKey: "",
            tempCacheKey: "",
            tempData: "",
            tempDataSource: "",
            tempDataMerge: "",
            tempReturn: "",
            dbTypeOptions: [
                {
                    label: "mongodb",
                    value: "mongodb"
                },
                {
                    label: "mysql",
                    value: "mysql"
                }
            ],
            contentTypeOptions:[
                {
                    label: "application/json",
                    value: "application/json"
                },
                {
                    label: "multipart/form-data",
                    value: "multipart/form-data"
                },
                {
                    label: "application/x-www-form-urlencoded",
                    value: "application/x-www-form-urlencoded"
                },
                {
                    label: "text/plain",
                    value: "text/plain"
                }
            ],
            hideAddHeader: true,
            apiNames: [
                {
                    label: "获取token",
                    value: "获取token",
                    isLeaf: true
                },
                {
                    label: "向his写入处方",
                    value: "向his写入处方",
                    isLeaf: true
                },
                {
                    label: "同步药品目录",
                    value: "同步药品目录",
                    isLeaf: true
                },
                {
                    label: "查询库存",
                    value: "查询库存",
                    isLeaf: true
                },
                {
                    label: "获取access_token",
                    value: "获取access_token"
                }
                ],
            preProcessOptions: [
                "header", "body", "query"
            ],
            item_id: "",
            api:{
                threshold: -1,
                cache:{isCached:false},
                data:{},
                method:"GET",
                headers:{},
                pre:{hasPre:false,processReturn:{}},
                dataSource:[],
                dataMerge:{},
                return:{},
                bodyConfig: {},
                sign:{enabled:false},
                dataType: 'json',
                convertText: ''
            },
            sourceNameMap:{
            },
            docMap:{
            },
            fromMap: {
            },
            sourceMapObj: {
            },
            systemMap: {
            },
            cryptoMap: {
            },
            docOptions:[
            ],
            cryptoOptions:[
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
            customizeSources:[]
        };
    },
    props: ['apiGroupId', 'apiTemplateId','sourceMap', 'itemId', 'customizeConfig', 'callbackMap'],
    methods:{
        onApiTypeChange(value){
            this.api.type = value;
        },
        isTagDup(){
            return this.tags.map(item=>item.tagName).includes(this.tempTagName);
        },
        isDesDup(){
            if(!this.tempDescription){
                return false;
            }
            let that = this;
            return this.tags.map(item=>item.description).filter(item=>{
                return new RegExp(that.tempDescription).test(item);
            }).length;
        },
        addJoinConfig(index){
            if(!this.api.dataSource[index].joins){
                this.api.dataSource[index].joins = [];
            }
            this.api.dataSource[index].joins.push({
                joinType: "None"
            });
            this.$forceUpdate();
        },
        deleteJoinConfig(index, jIndex){
            this.api.dataSource[index].joins.splice(jIndex, 1);
            this.$forceUpdate();
        },
        hideModal(){
            if(this.isTagDup()){
                this.$message.error('标签映射名重复，无法添加!');
                return;
            }
            if(!this.tempDescription || !this.tempTagName){
                this.$message.error('请输入映射名和标签名!');
                return;
            }
            let regex = /^[a-zA-Z0-9]{1,50}$/
            if(!regex.test(this.tempTagName)){
                this.$message.error('映射名必须为50字符内的英文或数字组合');
            }else{
                this.instance
                .post(
                `/private/tag`,
                {
                    tagName: this.tempTagName,
                    description: this.tempDescription
                }
                )
                .then(response => {
                    let result = response.data;
                    this.api = result.data;
                    this.fetchDocMap();
                })
                .catch(function (error) { // 请求失败处理
                    console.log(error);
                });
            }
            
            this.tempTagName = "";
            this.tempDescription = "";
            this.showAddItem = false;
        },
        fetchTags(search){
            let params = {search}
            this.instance
            .get(
            '/private/tag/search',
            {
                params
            }
            )
            .then(response => {
                this.tags = response.data.list;
                this.loading = true;
            })
            .catch(function (error) { // 请求失败处理
                console.log(error);
            });
        },
        addItem(){
            this.showAddItem = true;
        },
        changeTagid(value){
            this.api.tag_oid = value
        },
        hasPreChange(checked){
            this.api.pre.hasPre = checked;
        },
        onApiNameChange(value) {
            this.api.name = value;
        },
        onFuncNameChange(value){
            this.api.funcName = value;
        },
        onUrlChange(value) {
            this.api.url = value;
        },
        onContentTypeChange(value){
            if(!this.api.headers){
                this.api.headers = {};
            }
            this.api.headers['Content-Type'] = value;
        },
        showAddHeader(){
            this.hideAddHeader = false;
        },
        addHeader(value){
            if(!Object.keys(this.api.headers).includes(value) && value){
                this.api.headers[value] = "";
            }
            this.hideAddHeader = true;
        },
        onHeaderChange(value, headerName){
            this.api.headers[headerName] = value;
        },
        enterPreProcessReturn(target, returnConfig, key) {
            if(target.value){
                if(
                    target.value!=key &&
                    !Object.keys(this.api.pre.processReturn).includes(target.value)
                ){
                    this.api.pre.processReturn[target.value] = returnConfig;
                    delete this.api.pre.processReturn[key];
                }
            }else{
                this.$message.error('返回字段名不能为空!');
                target.value = key;
            }
        },
        showDelConfirm(key){
            this.delConfirm = true;
            this.tempDelKey = key;
        },
        delKey(){
            delete this.api.pre.processReturn[this.tempDelKey];
            this.delConfirm = false;
            this.tempDelKey = "";
        },
        preProcessKeyChange(value, key, part) {
            if(value){
                this.api.pre.processReturn[key][part] = {
                    name: value
                }
            }else{
                delete this.api.pre.processReturn[key][part];
            }
        },
        addPreProcessReturn() {
            this.addConfirm = true;
        },
        onPreApiNameChange(value) {
            this.api.pre.apiName = value;
        },
        onAddKeychange(value) {
            this.tempAddKey = value;
        },
        addKey() {
            this.addConfirm = false;
            if(this.tempAddKey){
                if(Object.keys(this.api.pre.processReturn).includes(this.tempAddKey)){
                    this.$message.error('输入字段已存在!');
                } else {
                    this.api.pre.processReturn[this.tempAddKey] = {};
                }
            }
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
        onDataFocus(target){
            this.tempData = target.value;
        },
        onDataConfirm(target){
            try{
                this.api.data = JSON.parse(target.value)
            }catch(e){
                target.value = this.tempData;
            }
        },
        onSourceNameChange(value, index){
            this.api.dataSource[index].sourceName = value;
        },
        onDbTypeChange(value, index){
            this.api.dataSource[index].dbType = value;
        },
        onModelNameChange(value, index){
            this.api.dataSource[index].collectionName = value;
        },
        changeJoinType(value, index, jIndex){
            this.api.dataSource[index].joins[jIndex].joinType = value;
            this.$forceUpdate();
        },
        showInput(){
            this.inputSource = true;
        },
        showSourceInput(){
            this.inputDataSource = true;
        },
        addSource(value, option){
            this.api.dataSource.push({
                sourceName: option.componentOptions.children[0].text + '数据',
                targetModel: value,
                populate:[]
            })
            this.inputSource = false;
        },
        addDataSource(value){
            if(value){
                this.api.dataSource.push({
                    sourceName: '',
                    collectionName: '',
                    path: value,
                    _id: uuidv4()
                });
            }
            this.inputDataSource = false;
        },
        loadSource(){
            let queryString = {
                params:{
                    page: 1,
                    pageSize: 200,
                    app_id: this.appId
                }
            };
            this.instance
            .get(
            '/private/sourceConfig',
            queryString
            )
            .then(response => {
                let result = response.data;
                this.customizeSources = result.list.map((item)=>{
                    return {
                        label: item.sourceName,
                        value: item.sourceName,
                        source_id: item._id,
                        isLeaf: false
                    }
                })
            })
            .catch(function (error) { // 请求失败处理
                console.log(error);
            });
        },
        loadModel(selectedOptions){
            const targetOption = selectedOptions[selectedOptions.length - 1];
            targetOption.loading = true;
            let queryString = {
                params:{
                    page: 1,
                    pageSize: 200,
                    source_id: targetOption.source_id
                }
            };
            this.instance
            .get(
            '/private/customizeModel',
            queryString
            )
            .then(response => {
                let result = response.data;
                targetOption.loading = false;
                targetOption.children = result.list.map((item)=>{
                    return {
                        label: item.name,
                        value: item.name
                    }
                })
                this.customizeSources = [...this.customizeSources];
            })
            .catch(function (error) { // 请求失败处理
                console.log(error);
            });
        },
        onQueryChange(value, index){
            if(this.api.dataSource[index].dbType){
                switch(this.api.dataSource[index].dbType){
                    case "mongodb":
                        this.api.dataSource[index].where = "";
                        this.api.dataSource[index].query = value;
                    break;
                    case "mysql":
                        this.api.dataSource[index].where = value;
                        this.api.dataSource[index].query = "";
                    break;
                    default:
                    break;
                }
            }else{
                this.$message.error('请先选择数据源!');
            }
        },
        onCustomizeSourceChange(value, index){
            if(value.length == 2){
                this.api.dataSource[index].sourceName = value[0];
                this.api.dataSource[index].collectionName = value[1];
            }
        },
        cancleAddSource(){
            this.inputSource = false;
        },
        deletePopulate(index, pIndex){
            this.api.dataSource[index].populate.splice(pIndex,1);
            this.$forceUpdate();
        },
        showPopulations(index){
            this.api.dataSource[index].addPopulation = true;
            this.$forceUpdate();
        },
        addPopulation(value, index){
            if(!this.api.dataSource[index].populate){
                this.api.dataSource[index].populate = [];
            }
            if(!this.api.dataSource[index].populate.includes(value.join(' '))){
                this.api.dataSource[index].populate.push(value.join(' '));
            }
            this.api.dataSource[index].addPopulation = false;
            this.$forceUpdate();
        },
        cancelAddPopulation(index){
            this.api.dataSource[index].addPopulation = false;
            this.$forceUpdate();
        },
        changePopulation(value, index, pIndex){
            if(!this.api.dataSource[index].populate.includes(value.join(' '))){
                this.api.dataSource[index].populate.splice(pIndex,1,value.join(' '));
            }
            this.$forceUpdate();
        },
        onDataSourceFocus(target){
            this.tempDataSource = target.value;
        },
        onDataSourceConfirm(target){
            try{
                this.api.dataSource = JSON.parse(target.value)
            }catch(e){
                target.value = this.tempDataSource;
            }
        },
        onDataMergeFocus(target){
            this.tempDataMerge = target.value;
        },
        onDataMergeConfirm(target){
            try{
                this.api.dataMerge = JSON.parse(target.value)
            }catch(e){
                target.value = this.tempDataMerge;
            }
        },
        onStringifyPathChange(value){
            this.api.stringifyPath = value;
        },
        signEnabledChange(checked){
            this.api.sign.enabled = checked;
        },
        flashChange(checked){
            this.api.cache.flashNow = checked;
        },
        onUseDataChange(value){
            this.api.sign.useData = value;
        },
        onSignNullChange(value){
            this.api.sign.signNull = value;
        },
        onSignPathChange(value){
            this.api.sign.path = value;
        },
        onSaltChange(value){
            this.api.sign.salt = value;
        },
        onAlgorithmChange(value){
            this.api.sign.algorithm = value;
        },
        onReturnFocus(target){
            this.tempReturn = target.value;
        },
        onReturnConfirm(target){
            try{
                this.api.return = JSON.parse(target.value)
            }catch(e){
                target.value = this.tempReturn;
            }
        },
        onSourceChange(value, source){
            source.targetModel = value;
            source.sourceName = this.docMap[value].name;
            this.formSourceNameMap();
            EventBus.$emit('sourceChange', this.sourceNameMap);
        },
        showData(){
            console.log(JSON.parse(JSON.stringify(this.api)));
        },
        async fetchDocMap(){
            console.log(`getting sourceMap...`);
            return this.instance
            .get(
            '/private/consultModulation/docMap'
            )
            .then(response => {
                let result = response.data;
                this.docMap = result.doc;
                this.fromMap = result.from;
                this.sourceMapObj = result.source || {};
                this.systemMap = result.system;
                this.cryptoMap = result.crypto;
                for(let docName in this.docMap){
                    this.docOptions.push({
                        label: this.docMap[docName].name,
                        value: docName
                    })
                    if(this.docMap[docName].populate){
                        this.docCascader[docName]=formPopulateOption(this.docMap[docName].populate);
                    }
                }
                for(let crypto in this.cryptoMap){
                    this.cryptoOptions.push({
                        label: this.cryptoMap[crypto],
                        value: crypto
                    })
                }
                this.formSourceNameMap();
                console.log(`finish loading`);
                this.loading = true;
                this.$forceUpdate();
            })
            .catch(function (error) { // 请求失败处理
                console.log(error);
            });
        },
        formSourceNameMap(){
            this.sourceNameMap = {}
            if(this.api && this.api.dataSource){
                for(let source of this.api.dataSource){
                    if(source.targetModel){
                        this.sourceNameMap[this.modelToSource(source.targetModel)] = source.sourceName;
                    }
                }
            }
        },
        modelToSource(modelName){
            return modelName.charAt(0).toLowerCase() + modelName.slice(1)
        },
        onSourcePartChange(value, mergeOption){
            console.log(`source from: ${value}`);
            console.log(mergeOption);
        },
        onDataTypeChange(value){
            this.api.dataType = value;
        },
        onConvertTextChange(value){
            this.api.convertText = value;
        },
        showValue(value, mergeOption){
            console.log(this.sourceMap[mergeOption.source][value])
        },
        async fetchApi(item_id){
            return this.instance
            .get(
            `/private/apiGroup/apiTemplate/item/detail?apiTemplateItem_id=${item_id}`
            )
            .then(response => {
                let result = response.data;
                this.api = result.apiTemplateItem;
                this.fetchTags();
                this.fetchDocMap();
            })
            .catch(function (error) { // 请求失败处理
                console.log(error);
            });
        },
        async modifyApi(){
            if(!this.api.apiTemplate_oid){
                this.api.apiTemplate_oid = this.apiTemplateId;
            }
            return this.instance
            .patch(
            `/private/apiGroup/apiTemplate/${this.itemId}/item`,
            {
                item:this.api
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
        async createApi(){
            return this.instance
            .post(
            `/private/apiGroup/apiTemplate/item`,
            {
                apiTemplate_id:this.apiTemplateId,
                item:this.api
            }
            )
            .then(response => {
                let result = response.data;
                if(result.result){
                    if(result.apiTemplateItem){
                        this.$message.info(`新增API模板 ${result.data.name} 成功`);
                    }
                }
            })
            .catch(function (error) { // 请求失败处理
                console.log(error);
            });
        },
        getApiNames(){
            this.instance
            .get(
            '/private/consultModulation/apiConfig',
            {params:{app_id: this.appId}}
            )
            .then(response => {
                this.apiNames = response.data.list.map(item=>{
                    return {
                        label: item.name,
                        value: item.name
                    }
                });
                this.$forceUpdate();
            })
            .catch(function (error) { // 请求失败处理
                console.log(error);
            });
        }
    },
    components:{
        VNodes: {
            functional: true,
            render: (h, ctx) => ctx.props.vnodes 
        },
        returnComp: ReturnComp
      //dataMerge: DataMerge
    },
    created(){
        this.item_id = this.itemId;
        if(this.itemId){
            this.fetchApi(this.itemId);
        }else{
            this.fetchTags();
            this.fetchDocMap();
        }
    },
    mounted(){
        //注册事件监听
        let that = this;
        EventBus.$off('editItemConfirm');
        EventBus.$on('editItemConfirm',async ()=>{
            if(that.itemId){
                await that.modifyApi();
            }else{
                await that.createApi();
                EventBus.$emit('itemCreated',{});
            }
        });

        console.log('api mounted!')
    }
  };

  function formPopulateOption(populate){
      let options = [];
      for(let population of populate){
          let tempOption = {
              label: population.name,
              value: population.path
          };
          if(population.populate){
              tempOption.children = formPopulateOption(population.populate)
          }
          options.push(tempOption);
      }
      return options;
  }
</script>
