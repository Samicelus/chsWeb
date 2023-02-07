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
    所属接口分类:
    <a-select
    :defaultValue="api.apiGroup_oid||''"
    @change="onSelectApiGroup"
    >
        <a-select-option v-for="apiGroup in apiGroups" :key="apiGroup._id">
        {{apiGroup.groupName}}
        </a-select-option>
    </a-select>
    <a-divider orientation="left">基础配置</a-divider>
        <a-input 
        :defaultValue="api.name" 
        style="margin:5px;width:99.5%" 
        @change="e=>onApiNameChange(e.target.value)" 
        addonBefore="API名称"
        :disabled="!!apiId"
        />
        <a-input-group compact>
            <a-select 
            v-model="api.protocal" 
            :options="protocalOptions"
            @change="value=>onProtocalChange(value)"
            style="width:95px;margin-bottom:5px;margin-left:5px;"
            />
            <a-select
            mode="combobox"
            :defaultValue="api.host" 
            :options="alreadyHostOptions"
            placeholder="请输入接口主机域名"
            style="margin-bottom:5px;margin-left:5px;width:40%" 
            @change="onHostChange" 
            >
            </a-select>
            <a-input
            style=" width:30px; border-left: 0; pointer-events: none; backgroundColor: #fff"
            placeholder="/"
            disabled
            />
            <a-input
            :defaultValue="api.url"
            placeholder="接口路由为必填"
            :style="{'margin-bottom':'5px','width':'49.2%','border-color':!api.url?'#D90000':'rgba(0,0,0,0.2)'}"
            @change="e=>onUrlChange(e.target.value)"
            >
            </a-input>
        </a-input-group>
        <a-row>
            <a-col :span="24">
                <span style="margin-left:5px">超时阈值: </span>
                <a-input-number
                style="margin-left:10px"
                :defaultValue="0"
                :min="0"
                :step="100"
                v-model="api.threshold">
                </a-input-number>
                <span style="margin-left:5px">ms</span>
            </a-col>
        </a-row>

    <a-divider dashed/>

    <a-row>
        <a-col :span="10">
            请求方法: <a-radio-group 
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

        <template v-if="api.method === 'SOAP'">
            <a-col :span="8">
                <a-input 
                :defaultValue="api.funcName"
                addonBefore="SOAP方法名称"
                @change="e=>onFuncNameChange(e.target.value)"
                />
            </a-col>
            <a-col :span="3">
                <a-checkbox 
                :defaultChecked="!!api.createWSDLOptions && api.createWSDLOptions.forceSoap12Headers" 
                @change="e=>forceSoap12HeadersChange(e.target.checked)" style="margin:5px">
                    使用soap1.2协议
                </a-checkbox>
            </a-col>
            <a-col :span="3">
                <a-checkbox 
                :defaultChecked="!!api.wsseOptions && api.wsseOptions.enable" 
                @change="e=>wsseEnableChange(e.target.checked)" style="margin:5px">
                    开启WSSE
                </a-checkbox>
            </a-col>
        </template>
    </a-row>
    
    <a-row v-if="api.wsseOptions && api.wsseOptions.enable" >
        <a-col :span="10">
        </a-col>
        <a-col :span="14">
            <a-input
            addonBefore="username"
            :defaultValue="api.wsseOptions.username"
            @change="e=>onWsseUsernameChange(e.target.value)"
            style="margin-top:5px"
            >
            </a-input>
            <a-input
            addonBefore="password"
            :defaultValue="api.wsseOptions.password"
            @change="e=>onWssePasswordChange(e.target.value)"
            style="margin-top:5px"
            >
            </a-input>
        </a-col>
    </a-row>

    <a-modal title="添加标签" v-model="showAddItem" @ok="hideModal" okText="添加" cancelText="取消">
        <a-input placeholder="输入标签映射名" v-model="tempTagName"/>
        <p v-if="isTagDup()" style="color:#CC3366">标签映射名重复</p>
        <a-input placeholder="输入标签中文名称" v-model="tempDescription" style="margin-top:10px"/>
        <p v-if="isDesDup()" style="color:#EE6633">标签名称可能已存在，请检查!</p>
    </a-modal>
    选择标签:
    <a-select 
    :defaultValue="api.tag_oid" 
    show-search
    :allowClear="true"
    @search="fetchTags"
    filter
    style="margin:5px;width:500px"
    @focus="fetchTags"
    @change="changeTagid"
    :maxTagTextLength="500"
    class="selectTag"
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
        <a-select-option v-for="tag in tags" :key="tag._id" :value="tag._id" :disabled="judgeArrangement(tag._id, tag.tagName)">
            <a-row type="flex" justify="space-between">
                <a-col :span="12">
                    {{tag.description}}    {{tag.tagName}}
                </a-col>
                <a-col :span="4" v-if="isTagArranged(tag)">
                    -->
                </a-col>
                <a-col :span="8" v-if="isTagArranged(tag)">
                    <a-tag :style="judgeArrangement(tag._id, tag.tagName)?'color:#bbb':'color:#333'">{{getArrangedApi(tag)}}</a-tag>
                </a-col>
            </a-row>
        </a-select-option>
    </a-select>

    <a-tooltip>
        <template slot="title">
            复制标签到剪贴板
        </template>
        <a-icon 
        type="copy"
        style="margin:5px;fontSize:24px"
        v-clipboard:copy="tagMap[api.tag_oid]"
        v-clipboard:success="onCopy"
        v-clipboard:error="onError"
        />
    </a-tooltip>

    <a-input
    :defaultValue="api.type"
    addonBefore="同类多态标识"
    @change="e=>onApiTypeChange(e.target.value)"
    style="margin:5px;width:30%"
    >
    </a-input>

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
            v-if="apiId"
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
    
    <!--
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
    -->

    <a-divider orientation="left">Header组合配置</a-divider>

    <returnComp :appId="api.app_oid" :dataObj="api.headerReturn" :dataSourceObj="api.dataSource" :systemMap="systemMap" :customizeConfig="customizeConfig" :callbackMap="callbackMap" :desensitizationOptions="desensitizationOptions" :cryptoMethodOptions="cryptoMethodOptions" :hashOptions="hashOptions" :encodeOptions="encodeOptions" :fromOptions="fromOptions"/>


    <a-divider orientation="left">Query组合配置</a-divider>

    <returnComp :appId="api.app_oid" :dataObj="api.queryReturn" :dataSourceObj="api.dataSource" :systemMap="systemMap" :customizeConfig="customizeConfig" :callbackMap="callbackMap" :desensitizationOptions="desensitizationOptions" :cryptoMethodOptions="cryptoMethodOptions" :hashOptions="hashOptions" :encodeOptions="encodeOptions" :fromOptions="fromOptions"/>

    <!--
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
            v-else
            style="margin-top:10px" 
            @blur="e=>addHeader(e.target.value)" @keyup.enter="e=>addHeader(e.target.value)"/>
        </a-col>
    </a-row>
    -->

    <a-divider orientation="left">数据配置</a-divider>
    <a-row v-if="['POST','PATCH', 'PUT', 'DELETE'].includes(api.method)">
        <a-col :span="6">
            body数据类型：
            <a-select
            :defaultValue="api.bodyConfig.bodyType||'json'"
            @change="onBodyTypeChange"
            >
                <a-select-option value="json">
                    json
                </a-select-option>
                <a-select-option value="xml">
                    xml
                </a-select-option>
                <a-select-option value="jsonString">
                    json字符串
                </a-select-option>
            </a-select>
        </a-col>
        <a-col :span="6">
            <a-switch
            checked-children="cdata包裹"
            un-checked-children="不包裹cdata"
            :defaultChecked="api.bodyConfig.cdata"
            @change="onCdataChange"
            >
            </a-switch>
        </a-col>
        <a-col :span="6">
            <a-input
            addonBefore="根节点名称"
            :defaultValue="api.bodyConfig.envelope"
            @change="e=>onEnvelopeChange(e.target.value)"
            >
            </a-input>
        </a-col>
    </a-row>
    <a-divider dashed>固定数据</a-divider>
    <a-textarea 
    placeholder="作为固定data传入,JSON格式" 
    :autoSize="{ minRows: 3}"
    :defaultValue="JSON.stringify(api.data,null,2)"
    @focus="e=>onDataFocus(e.target)"
    @blur="e=>onDataConfirm(e.target)"
    />
    <!--
    <a-divider dashed>数据来源</a-divider>
    
    <div v-for="(source, index) in api.dataSource" :key="source.sourceName+source.collectionName">
        <div>
            <a-divider orientation="left" dashed>{{source.path}}</a-divider>
            <a-row>
                <a-col :span="6">
                    <a-cascader
                    :defaultValue="[source.sourceName, source.collectionName]"
                    :options="customizeSources"
                    :load-data="opt=>loadModel(opt)"
                    placeholder="选择数据源"
                    @focus="loadSource"
                    @change="(value, selectedOptions)=>onCustomizeSourceChange(value, index, selectedOptions)"
                    >
                    </a-cascader>
                </a-col>
                <a-col :span="6">
                </a-col>
                <a-col :span="6">
                    <a-input 
                    :defaultValue="source.query || source.where"
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
        <a-col :span="8">
            
        </a-col>
    </a-row>
    -->
    <a-divider dashed>
        <a-tooltip>
            <template slot="title">
                入参示例:
                <pre>{{JSON.stringify(testParams,null,2)}}</pre>
            </template>
            数据组合
        </a-tooltip>
    </a-divider>
    <returnComp :appId="api.app_oid" :dataObj="api.dataMerge" :dataSourceObj="api.dataSource" :systemMap="systemMap" :customizeConfig="customizeConfig" :callbackMap="callbackMap" :desensitizationOptions="desensitizationOptions" :cryptoMethodOptions="cryptoMethodOptions" :hashOptions="hashOptions" :encodeOptions="encodeOptions" :fromOptions="fromOptions"/>
    <a-divider v-if="api.method==='SOAP'" dashed>JSON字符串化数据</a-divider>
    <a-input
    v-if="api.method==='SOAP'"
    :defaultValue="api.stringifyPath"
    @change="e=>onStringifyPathChange(e.target.value)"
    />

    <a-divider dashed>签名配置</a-divider>
    <a-row>
        <a-switch
        v-if="api.sign"
        :defaultChecked="api.sign.enabled"
        checked-children="签名开启"
        un-checked-children="签名关闭"
        @change="signEnabledChange" 
        >
        </a-switch>
    </a-row>
    <a-row v-if="api.sign && api.sign.enabled" style="margin-top:5px">
        <a-col :span="6">
            <a-input
            :defaultValue="api.sign.path||'sign'"
            addonBefore="签名字段"
            placeholder="请输入签名字段名称"
            @change="e=>onSignPathChange(e.target.value)"
            >
                <a-select slot="addonAfter" style="width:80px"
                :defaultValue="api.sign.signPosition||'body'">
                    <a-select-option value="body">
                    Body
                    </a-select-option>
                    <a-select-option value="query">
                    Query
                    </a-select-option>
                    <a-select-option value="header">
                    Header
                    </a-select-option>
                </a-select>
            </a-input>
        </a-col>
        <a-col :span="5" style="padding-left:5px">
            <a-row>
                <span class="ant-input-group-wrapper">
                    <span class="ant-input wrapper ant-input-group" style="font-size:0;border:0">
                        <span class="ant-input-group-addon">签名算法:</span>
                        <a-select
                        :defaultValue="api.sign.algorithm"
                        :options="hashOptions"
                        @change="onAlgorithmChange"
                        style="width:120px"
                        >
                        </a-select>
                    </span>
                </span>
            </a-row>
            <a-row style="margin-top:5px">
                <span class="ant-input-group-wrapper">
                    <span class="ant-input wrapper ant-input-group" style="font-size:0;border:0">
                        <span class="ant-input-group-addon">编码:</span>
                        <a-select
                        :defaultValue="api.sign.encode"
                        :options="encodeOptions"
                        @change="onEncodeChange"
                        style="width:148px"
                        >
                        </a-select>
                    </span>
                </span>
            </a-row>
            <a-row style="margin-top:5px" v-if="api.sign && ['hmac', 'RSA-SHA1', 'RSA-SHA256'].includes(api.sign.algorithm)">
                <span class="ant-input-group-wrapper">
                    <span class="ant-input wrapper ant-input-group" style="font-size:0;border:0">
                        <span class="ant-input-group-addon">密钥配置:</span>
                        <a-select
                        placeholder="密钥配置"
                        :defaultValue="api.sign.signSecret"
                        :options="customizeConfig"
                        @change="value=>onSignSecretChange(value)"
                        style="width:120px"
                        >
                            <div slot="notFoundContent">
                                <p>
                                <a-icon type="info-circle" size="24"/>
                                尚未配置公用参数，请前往
                                </p>
                                <p>
                                应用列表下拉菜单中配置
                                </p>
                            </div>
                        </a-select>
                    </span>
                </span>
            </a-row>
            <a-row>
                <a-checkbox
                :checked="api.sign.toUpperCase" @change="e=>toUpperCaseChange(e.target.checked)" style="margin:5px"
                >
                转化为大写
                </a-checkbox>
                <a-checkbox
                :checked="api.sign.toLowerCase" @change="e=>toLowerCaseChange(e.target.checked)" style="margin:5px"
                >
                转化为小写
                </a-checkbox>
            </a-row>
        </a-col>
        <a-col :span="13" style="padding-left:5px">
            <a-row>
                <a-switch
                checked-children="对整个data签名"
                un-checked-children="部分data签名"
                :defaultChecked="api.sign.useData"
                @change="onUseDataChange"
                style="margin-left:5px"
                >
                </a-switch>
            </a-row>
            <a-row style="margin-top:5px">
                <returnComp :appId="api.app_oid" :dataObj="api.sign.addedParam" :dataSourceObj="api.dataSource" :systemMap="systemMap" :customizeConfig="customizeConfig" :callbackMap="callbackMap" :desensitizationOptions="desensitizationOptions" :cryptoMethodOptions="cryptoMethodOptions" :hashOptions="hashOptions" :encodeOptions="encodeOptions" :fromOptions="fromOptions"/>
            </a-row>
            <a-row>
                <span class="ant-input-group-wrapper">
                <span class="ant-input wrapper ant-input-group" style="font-size:0;border:0">
                    <span class="ant-input-group-addon">参数排序</span>
                    <a-select
                    style="width:100%"
                    :defaultValue="api.sign.sortType"
                    :options="sortTypeOptions"
                    @change="onSortTypeChange"
                    >
                    </a-select>
                </span>
                </span>
            </a-row>
            <a-row style="margin-top:5px">
                <a-switch
                checked-children="空值参与签名"
                un-checked-children="空值不参与签名"
                :defaultChecked="api.sign.signNull"
                @change="onSignNullChange"
                style="margin-left:5px"
                >
                </a-switch>
            </a-row>
            <a-row style="margin-top:5px">
                <a-switch
                checked-children="取消分隔符"
                un-checked-children="使用分隔符"
                :defaultChecked="api.sign.ignoreSeparator"
                @change="onIgnoreSeparatorChange"
                style="margin-left:5px"
                >
                </a-switch>
            </a-row>
            <a-row style="margin-top:5px">
                <a-input
                :defaultValue="api.sign.preSalt"
                @change="e=>onPreSaltChange(e.target.value)"
                addonBefore="头部加盐"
                >  
                </a-input>
            </a-row>
            <a-row style="margin-top:5px">
                <a-input
                :defaultValue="api.sign.salt"
                @change="e=>onSaltChange(e.target.value)"
                addonBefore="尾部加盐"
                >  
                </a-input>
            </a-row>
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
                    :defaultValue="api.convertText"
                    style="width:70%"
                    @change="onConvertTextChange"
                    >
                    </a-select>
                </a-input-group>
            </a-col>
        </a-row>
    <a-divider orientation="left">调用结果验证</a-divider>
        <a-checkbox :defaultChecked="api.validateConfig && api.validateConfig.validateResult" @change="e=>validateResultChange(e.target.checked)" style="margin:5px">
            是否验证结果
        </a-checkbox>
        <dataProto v-if="api.validateConfig && api.validateConfig.validateResult" :dataObj="api.validateConfig.rule"/>
    <a-divider orientation="left">
        <a-tooltip>
            <template slot="title">
                返回示例:
                <pre>{{JSON.stringify(testReturn,null,2)}}</pre>
            </template>
            输出配置
        </a-tooltip>
        <a-switch
        checked-children="返回示例"
        un-checked-children="正常返回"
        :defaultChecked="api.mockReturn"
        @change="onMockReturnChange"
        style="margin-left:5px"
        >
        </a-switch>
    </a-divider>
    <returnComp :appId="api.app_oid" :dataObj="api.return" :dataSourceObj="api.dataSource" :systemMap="systemMap" :customizeConfig="customizeConfig" :callbackMap="callbackMap" :desensitizationOptions="desensitizationOptions" :cryptoMethodOptions="cryptoMethodOptions" :hashOptions="hashOptions" :encodeOptions="encodeOptions" :fromOptions="fromOptions"/>
    <a-divider />
    <a-button @click="showData">显示数据</a-button>
  </div>
</template>
<script>
    import { EventBus } from '../lib/event-bus.js'; //全局事件总线
    import ReturnComp from './returnComp';
    import DataProto from './groupTag/dataProto'
    import _ from 'lodash';

  export default {
    data() {
        return {
            loading: false,
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
            protocalMap: {
            },
            protocalOptions:[
                {
                    label: "选择协议",
                    value: "",
                    disabled: true
                }
            ],
            contentTypeOptions:[
            ],
            hideAddHeader: true,
            apiNames: [],
            preProcessOptions: [
                "header", "body", "query"
            ],
            api_id: "",
            api:{
                url:"",
                protocal: "",
                host: "",
                threshold: -1,
                cache:{isCached:false},
                data:{},
                method:"GET",
                headers:{},
                headerReturn: {},
                queryReturn: {},
                pre:{hasPre:false,processReturn:{}},
                dataSource:[],
                dataMerge:{},
                validate:{
                    validateResult: false,
                    rule: {}
                },
                return:{},
                mockReturn: false,
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
            sourceNameMap:{
            },
            docMap:{
            },
            contentTypeMap: {
            },
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
            inputSource: false,
            inputDataSource: false,
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
            sortTypeMap: {},
            sortTypeOptions: [],
            customizeSources:[],
            tags: [],
            tagMap: {},
            showAddItem: false,
            tempTagName: "",
            tempDescription: "",
            apiGroups: [],
            testParams: {},
            testReturn: {},
            alreadyHostOptions: []
        };
    },
    props: ['appId','sourceMap', 'apiId', 'customizeConfig', 'apis', 'callbackMap'],
    methods:{
        fetchAlreadyHosts(){
            this.instance
            .get(
            `/private/consultModulation/alreadyHost?app_id=${this.appId}`
            )
            .then(response => {
                this.alreadyHostOptions = response.data.hosts.filter(item=>!!item).map(item=>{
                    return {
                        label: item,
                        value: item
                    }
                });
                this.$forceUpdate();
            })
            .catch(function (error) { // 请求失败处理
                console.log(error);
            });
        },
        onSignSecretChange(value){
            this.api.sign.signSecret = value;
        },
        toUpperCaseChange(value){
            this.$set(this.api.sign, "toUpperCase", value);
            if(value){
                this.$set(this.api.sign, "toLowerCase", false);
            }
        },
        toLowerCaseChange(value){
            this.$set(this.api.sign, "toLowerCase", value);
            if(value){
                this.$set(this.api.sign, "toUpperCase", false);
            }
        },
        onApiTypeChange(value){
            this.api.type = value;
        },
        onBodyTypeChange(value){
            this.api.bodyConfig.bodyType = value;
        },
        onCdataChange(value){
            this.api.bodyConfig.cdata = value;
        },
        onEnvelopeChange(value){
            this.api.bodyConfig.envelope = value;
        },
        onCopy(){
            if(this.api.tag_oid){
                this.$message.info('标签已成功复制到剪切板');
            }else{
                this.$message.error('未选择标签');
            }
        },
        onError(){
            this.$message.error('复制标签发送错误！');
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
                let that = this;
                this.tagMap = {};
                response.data.list.map(item=>{
                    that.tagMap[item._id] = item.tagName;
                })
                this.loading = true;
            })
            .catch(function (error) { // 请求失败处理
                console.log(error);
            });
        },
        addItem(){
            this.showAddItem = true;
        },
        judgeArrangement(tag_id, tagName){
            let arrangedTags = this.apis.filter(item=>item.tag_oid).map(item=>item.tag_oid.tagName);
            return (arrangedTags.includes(tagName) && (this.api.tag_oid != tag_id) && (!this.api.type))
        },
        isTagArranged(tag){
            let arrangedTags = this.apis.filter(item=>item.tag_oid).map(item=>item.tag_oid.tagName);
            return arrangedTags.includes(tag.tagName);
        },
        getArrangedApi(tag){
            let arrangedMap = _.groupBy(this.apis.filter(item=>item.tag_oid), 'tag_oid._id');
            return arrangedMap[tag._id]? arrangedMap[tag._id][0].name:"";
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
                    if(!result.result){
                        this.$message.error(`添加标签失败: ${result.errorMessage}`);
                    }else{
                        this.$message.info('添加标签成功!');
                    }
                })
                .catch(function (error) { // 请求失败处理
                    console.log(error);
                });
            }
            
            this.tempTagName = "";
            this.tempDescription = "";
            this.showAddItem = false;
        },
        changeTagid(value){
            this.api.tag_oid = value
        },
        hasPreChange(checked){
            this.api.pre.hasPre = checked;
        },
        forceSoap12HeadersChange(checked){
            if(!this.api.createWSDLOptions){
                this.api.createWSDLOptions = {};
            }
            this.api.createWSDLOptions.forceSoap12Headers = checked;
            this.$forceUpdate();
        },
        wsseEnableChange(checked){
            if(!this.api.wsseOptions){
                this.api.wsseOptions = {};
            }
            this.api.wsseOptions.enable = checked;
            this.$forceUpdate();
        },
        onWsseUsernameChange(value){
            this.api.wsseOptions.username = value;
        },
        onWssePasswordChange(value){
            this.api.wsseOptions.password = value;
        },
        onApiNameChange(value) {
            this.api.name = value;
        },
        getWSDL(){
            if(this.api.url){
                this.instance
                .get(
                `/private/consultModulation/getSoapWSDL?protocal=${this.api.protocal}&host=${this.api.host}&url=${this.api.url}`
                )
                .then(response => {
                    console.log(response.data);
                })
                .catch(function (error) { // 请求失败处理
                    console.log(error);
                });
            }else{
                this.$message.error('请先填写url');
            }
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
        onSourceNameChange(value, index){
            this.api.dataSource[index].sourceName = value;
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
                    path: value
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
            '/public/sourceConfig',
            queryString
            )
            .then(response => {
                let result = response.data;
                this.customizeSources = result.list.map((item)=>{
                    return {
                        label: item.sourceName,
                        value: item.sourceName,
                        source_id: item._id,
                        dbType: item.dbType,
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
            let dbType = targetOption.dbType;
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
            '/public/customizeModel',
            queryString
            )
            .then(response => {
                let result = response.data;
                targetOption.loading = false;
                targetOption.children = result.list.map((item)=>{
                    return {
                        label: item.name,
                        value: item.name,
                        dbType
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
        onCustomizeSourceChange(value, index, selectedOptions){
            let selectedOption = selectedOptions[selectedOptions.length - 1];
            if(value.length == 2){
                this.api.dataSource[index].sourceName = value[0];
                this.api.dataSource[index].collectionName = value[1];
                this.api.dataSource[index].dbType = selectedOption.dbType;
                switch(selectedOption.dbType){
                    case "mongodb":
                        this.api.dataSource[index].where = "";
                    break;
                    case "mysql":
                        this.api.dataSource[index].query = "";
                    break;
                    default:
                    break;
                }
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
        onStringifyPathChange(value){
            this.api.stringifyPath = value;
        },
        signEnabledChange(checked){
            this.api.sign.enabled = checked;
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
        onUseDataChange(value){
            this.api.sign.useData = value;
        },
        onSortTypeChange(value){
            this.$set(this.api.sign, "sortType", value);
        },
        onSignNullChange(value){
            this.api.sign.signNull = value;
        },
        onIgnoreSeparatorChange(value){
            this.api.sign.ignoreSeparator = value;
        },
        onMockReturnChange(value){
            this.api.mockReturn = value;
        },
        onSignPathChange(value){
            this.api.sign.path = value;
        },
        onPreSaltChange(value){
            this.api.sign.preSalt = value;
        },
        onSaltChange(value){
            this.api.sign.salt = value;
        },
        onAlgorithmChange(value){
            this.api.sign.algorithm = value;
        },
        onEncodeChange(value){
            this.api.sign.encode = value;
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
                this.cryptoMethodMap = result.crypto;
                this.desensitizationMap = result.desensitization;
                this.protocalMap = result.protocal;
                this.dataTypeMap = result.dataType;
                this.convertTextMap = result.convertText;
                this.contentTypeMap = result.contentType;
                this.fromMap = result.from;
                this.systemMap = result.system;
                this.hashMap = result.hash;
                this.encodeMap = result.encode;
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
                for(let contentType in this.contentTypeMap){
                    this.contentTypeOptions.push({
                        label: this.contentTypeMap[contentType],
                        value: contentType
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
                for(let sortType in this.sortTypeMap){
                    this.sortTypeOptions.push({
                        label: this.sortTypeMap[sortType],
                        value: sortType
                    })
                }
                console.log(`finish loading`);
                this.loading = true;
                this.$forceUpdate();
            })
            .catch(function (error) { // 请求失败处理
                console.log(error);
            });
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
        async fetchApi(api_id){
            return this.instance
            .get(
            `/private/consultModulation/apiConfig/detail?api_id=${api_id}`
            )
            .then(response => {
                let result = response.data;
                this.api = result.data;
                if(!this.api.dataMerge){
                    this.api.dataMerge = {}
                }
                if(!this.api.headerReturn){
                    this.api.headerReturn = {}
                }
                if(!this.api.return){
                    this.api.return = {}
                }
                this.getTestParams();
                this.getTestReturn();
                this.fetchDocMap();
                this.fetchTags();
                this.loadSource();
                this.fetchApiGroup();
                this.fetchAlreadyHosts();
            })
            .catch(function (error) { // 请求失败处理
                console.log(error);
            });
        },
        async getTestParams(){
            this.instance
            .get(
            `/private/api/getTestParams?api_id=${this.apiId}`
            )
            .then(response => {
                let result = response.data;
                this.testParams = result.testParams;
            })
            .catch(function (error) { // 请求失败处理
                console.log(error);
            });
        },
        async getTestReturn(){
            this.instance
            .get(
            `/private/api/getTestReturn?api_id=${this.apiId}`
            )
            .then(response => {
                let result = response.data;
                this.testReturn = result.testReturn;
            })
            .catch(function (error) { // 请求失败处理
                console.log(error);
            });
        },
        async modifyApi(){
            let that = this;
            if(!this.api.app_oid){
                this.api.app_oid = this.appId;
            }
            return this.instance
            .post(
            `/private/consultModulation/apiConfig/update`,
            {
                api_id:this.api_id,
                api:this.api
            }
            )
            .then(response => {
                let result = response.data;
                if(result.result){
                    if(result.data){
                        this.$message.info(`更新API ${result.data.name} 成功`);
                    }
                }else{
                    this.$message.error(`更新API失败：${result.error}`);
                }
                EventBus.$emit('apiCreated',{});
            })
            .catch(function (error) { // 请求失败处理
                that.$message.error(`更新API失败: ${error}`);
            });
        },
        async createApi(){
            return this.instance
            .post(
            `/private/consultModulation/apiConfig`,
            {
                app_id:this.appId,
                api:this.api
            }
            )
            .then(response => {
                let result = response.data;
                if(result.result){
                    if(result.data){
                        this.$message.info(`新增API ${result.data.name} 成功`);
                    }
                }
                EventBus.$emit('apiCreated',{});
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
        },
        validateResultChange(checked){
            if(!this.api.validateConfig || !this.api.validateConfig.rule){
                this.api.validateConfig = {
                    validateResult: true,
                    rule: {}
                }
            }
            this.api.validateConfig.validateResult = checked;
            this.$forceUpdate();
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
        onSelectApiGroup(value){
            if(value){
                this.api.apiGroup_oid = value;
            }else{
                delete this.api.apiGroup_oid;
            }
        }
    },
    components:{
        VNodes: {
            functional: true,
            render: (h, ctx) => ctx.props.vnodes 
        },
        returnComp: ReturnComp,
        dataProto: DataProto
    },
    created(){
        this.api_id = this.apiId;
        if(this.apiId){
            this.fetchApi(this.apiId);
        }else{
            this.fetchDocMap();
            this.fetchTags();
            this.loadSource();
            this.fetchApiGroup();
            this.fetchAlreadyHosts();
        }
    },
    mounted(){
        //注册事件监听
        let that = this;
        EventBus.$off('editApiConfirm');
        EventBus.$on('editApiConfirm', ()=>{
            if(!that.api.url){
                that.$message.error('url不能为空!');
            }else{  
                if(that.api.mockReturn){
                    this.$confirm({
                        title: '返回示例已启用',
                        content: `你开启了返回示例，将不会调用实际接口！确认继续？`,
                        onOk(){
                            if(that.apiId){
                                that.modifyApi();
                            }else{
                                that.createApi();
                            }
                        },
                        onCancel(){

                        },
                        okText: '确认',
                        cancelText: '取消'
                    })
                }else{
                    if(that.apiId){
                        that.modifyApi();
                    }else{
                        that.createApi();
                    }
                }
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
