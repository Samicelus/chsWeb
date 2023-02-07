<template>
    <div>
        <div v-for="(param, key) in data" :key="param.key">
            <a-divider orientation="left" dashed style="border-left: #e5e5e5 1px dashed; margin: 0 0 !important">
                <template v-if="param.convert && (param.convert.type == 'Object' || param.convert.itemType == 'Object')">
                    <span v-if="!objectItemsOpenStatus[key]" class="open-item-icon" @click="e=>openObjectItemInfo(key, false)"><a-icon type="minus-square"  title="收起"/></span>
                    <a-icon v-else type="plus-square" class="open-item-icon" title="展开" @click="e=>openObjectItemInfo(key, true)"/>
                </template >

                <a-icon v-else type="minus-square" style="color:#eee"/>

                {{param.key||key}}

                <a-input
                style="border-color:rgba(0,0,0,0.2);border-style:dashed;width:120px"
                :defaultValue="param.description"
                size="small"
                @change="e=>onDescriptionChange(e.target.value, key)">
                </a-input>
            </a-divider>

            <div style="padding-left: calc(1.2% + 13px); border-left: #e5e5e5 1px dashed" v-show="!objectItemsOpenStatus[key]">
                <div class="object-item" :class="{'item-left-line': param.convert && (param.convert.type == 'Object' || param.convert.itemType == 'Object')}">
                    <a-icon type="close-circle" class="close-icon" @click="e=>deleteParam(key)" title="删除"/>
                    <div class="object-item-option">
                        <a-row type="flex" justify="end">

                            <a-col :span="16">
                                <a-row type="flex" justify="start">
                                    <!-- 来源设置 -->
                                    <a-col :span="6">
                                        <span class="c-col-title">来源</span><a-select
                                        :defaultValue="param.from || 'result'"
                                        :options="fromOptions"
                                        @change="value=>onFromChange(value, key)"
                                        style="width:75%"
                                        >
                                        </a-select>
                                    </a-col>

                                    <!-- dataSource的source设置,或system的method设置 -->
                                    <a-col :span="13" style="padding: 0 20px">
                                        <!--
                                        <a-select
                                        :defaultValue="param.source"
                                        :options="sourceOptions"
                                        @focus="formSourceOption"
                                        @change="(value, option)=>onSourceChange(value, key, option)"
                                        v-if="param.from == 'dataSource'"
                                        style="width:100%"
                                        >
                                        </a-select>
                                        -->
                                        <a-select
                                        :defaultValue="param.method"
                                        :options="methodOptions"
                                        @focus="formMethodOption"
                                        @change="value=>onMethodChange(value, key)"
                                        v-if="param.from == 'system'"
                                        style="width:100%"
                                        >
                                        </a-select>
                                        <a-input
                                        :defaultValue="param.value"
                                        v-if="param.from == 'value'"
                                        @change="e=>onValueChange(e.target.value, key)"
                                        addonBefore="固定值"
                                        >
                                        </a-input>

                                        <!-- 路径 -->
                                        <!--
                                        <a-select
                                        v-if="param.from == 'dataSource'"
                                        :defaultValue="param.query_id"
                                        :options="apiConfiguredQuery"
                                        @focus="getApiConfiguredQurey"
                                        @change="value=>onPathChange(value, key)"
                                        style="width:100%"
                                        >
                                        </a-select>
                                        -->

                                        <a-select
                                        v-if="param.from == 'dataSource'"
                                        placeholder="选择已配置的Query"
                                        show-search
                                        v-model="param.query_id"
                                        option-filter-prop="children"
                                        :filter-option="(input, option)=>filterQuery(input, option.componentOptions.children[0].children[0].text)"
                                        @focus="getApiConfiguredQurey"
                                        style="width:100%"
                                        @change="value=>onQueryChange(value, key)"
                                        destroyOnClose
                                        >
                                            <a-select-opt-group v-for="sourceType in apiConfiguredQuery" :key="sourceType.label">
                                                <span slot="label"><a-icon type="database" />{{sourceType.label}}</span>
                                                <a-select-opt-group v-for="collectionType in sourceType.children" :key="collectionType.label">
                                                    <span slot="label" style="padding-left:10px"><a-icon type="table" />{{collectionType.label}}</span>
                                                    <a-select-option v-for="queryItem in collectionType.children" :key="queryItem.value" :value="queryItem.value">
                                                        <span style="padding-left:10px">{{queryItem.label}}</span>
                                                    </a-select-option>
                                                </a-select-opt-group>
                                            </a-select-opt-group>
                                        </a-select>


                                        <a-select
                                            v-if="['customConfig'].includes(param.from)"
                                            placeholder="公用参数"
                                            :defaultValue="param.path"
                                            :options="customizeConfig"
                                            @change="value=>onPathChange(value, key)"
                                            style="width:100%"
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
                                        <a-select
                                        v-else-if="['callbackUrl'].includes(param.from)"
                                        :defaultValue="param.path"
                                        :options="callbackMap"
                                        style="width:100%"
                                        @change="value=>onPathChange(value, key)"
                                        >
                                        </a-select>
                                        <a-input
                                        v-else-if="!['system','value','dataSource'].includes(param.from)"
                                        :defaultValue="param.path"
                                        @change="e=>onPathChange(e.target.value, key)"
                                        addonBefore="路径"
                                        style="width:100%"
                                        >
                                            <span slot="addonAfter">
                                            <a-tooltip >
                                                <template>
                                                    脱敏方式
                                                </template>
                                                <a-select
                                                :options="desensitizationOptions"
                                                :defaultValue="param.desensitization"

                                                @change="value=>onDesensitizationChange(value, key)"
                                                >
                                                </a-select>
                                            </a-tooltip>
                                            </span>
                                        </a-input>
                                        <a-input
                                        v-else-if="param.method=='stringConcat'"
                                        placeholder="使用${}包裹要替换的字段"
                                        addonBefore="表达式"
                                        :defaultValue="param.options?param.options.expression:''"
                                        @change="e=>onExpressionChange(e.target.value, key)"
                                        >
                                        </a-input>
                                        <div v-else-if="param.method=='mergeList'">
                                            <a-input
                                            addonBefore="主字段"
                                            :defaultValue="param.options?param.options.primaryKey:''"
                                            @change="e=>onPrimaryKeyChange(e.target.value, key)"
                                            >
                                            </a-input>
                                            <div v-if="param.options">
                                                <a-row v-for="(listConfig, itemKey) in param.options.lists" :key="listConfig.path">
                                                    <a-col :span="12">
                                                        <a-input addonBefore="列表路径" placeholder="相对返回的路径" :defaultValue="listConfig.path" @change="e=>onListConfigPathChange(e.target.value, key, itemKey)"/>
                                                    </a-col>
                                                    <a-col :span="12">
                                                        <a-input addonBefore="映射字段" placeholder="该列表匹配字段" :defaultValue="listConfig.refKey" @change="e=>onListConfigRefKeyChange(e.target.value, key, itemKey)"/>
                                                    </a-col>
                                                </a-row>
                                            </div>
                                            <a-icon type="plus-circle" style="margin-left:5px" @click="e=>addMergeListItem(key)"/>
                                        </div>
                                        <div v-else-if="param.method=='filter'">
                                        <a-input
                                        placeholder="相对返回数据的路径"
                                        addonBefore="路径"
                                        :defaultValue="param.options?param.options.path:''"
                                        @change="e=>onFilterPathChange(e.target.value, key)"
                                        >
                                        </a-input>
                                        <a-textarea
                                        placeholder="仅支持全json匹配"
                                        :autoSize="{ minRows: 3}"
                                        v-model="param.options.filter"
                                        @change="e=>onFilterChange(e.target.value, key)"
                                        />
                                        </div>
                                    </a-col>

                                    <a-col :span="5">
                                        <a-switch
                                        :defaultChecked="param.required"
                                        v-if="param.from == 'result'"
                                        checked-children="必须"
                                        un-checked-children="非必须"
                                        @change="value=>onRequiredChange(value, key)"
                                        >
                                        </a-switch>
                                        <a-switch
                                        :defaultChecked="param.temp"
                                        checked-children="临时"
                                        un-checked-children="非临时"
                                        @change="value=>onTempChange(value, key)"
                                        >
                                        </a-switch>
                                    </a-col>
                                </a-row>
                            </a-col>

                            <!-- 字段转化 -->
                            <a-col :span="8" style="padding-left:30px">
                                <a-checkbox :defaultChecked="!!param.convert" @change="e=>convertChange(e.target.checked, key)" style="margin:5px 5px 5px 0">洗数据</a-checkbox>
                                <div v-if="param.convert">
                                    <span>
                                        <a-select
                                        :defaultValue="param.convert.type"
                                        :options="typeOptions"
                                        @change="value=>onTypeChange(value, key)"
                                        style="width:60%">
                                        </a-select>
                                    </span>
                                </div>
                                <a-row style="margin-top:5px">
                                    <a-col>
                                        <span v-if="param.convert && param.convert.type == 'Array'">
                                            <a-select
                                            :defaultValue="param.convert.itemType"
                                            :options="itemTypeOptions"
                                            @change="value=>onItemTypeChange(value, key)"
                                            style="width:40%"
                                            />
                                        </span>
                                        <span v-if="param.convert && param.convert.type == 'arrayJoin'">
                                            <a-input
                                            addonBefore="分隔符"
                                            :defaultValue="param.convert.joinArraySeparator"
                                            @change="e=>onSeparatorChange(e.target.value, key)"
                                            style="width:40%"
                                            >
                                            </a-input>
                                        </span>
                                        <span v-if="param.convert && param.convert.type == 'stringSplit'">
                                            <a-input
                                            addonBefore="分隔符"
                                            :defaultValue="param.convert.stringSplitSeparator"
                                            @change="e=>onSplitSeparatorChange(e.target.value, key)"
                                            style="width:40%"
                                            >
                                            </a-input>
                                        </span>
                                        <span v-if="param.convert && param.convert.type == 'slice'">
                                            <a-input-number
                                            v-model="param.convert.sliceStart"
                                            style="width:40%"
                                            >
                                            </a-input-number>
                                            -
                                            <a-input-number
                                            v-model="param.convert.sliceEnd"
                                            style="width:40%"
                                            >
                                            </a-input-number>
                                        </span>
                                    </a-col>
                                </a-row>
                                <a-row>
                                    <a-col style="margin-top:5px">
                                        <span v-if="param.convert && (param.convert.type == 'String' || (['Object', 'Array'].includes(param.convert.type) && (param.convert.parse||param.convert.fromXml)))">
                                            <a-checkbox
                                            :checked="param.convert.decoded" @change="e=>decodedChange(e.target.checked, key)" style="margin:5px">
                                                解码数据
                                            </a-checkbox>
                                            <a-checkbox
                                            :checked="param.convert.decrypt" @change="e=>decryptChange(e.target.checked, key)" style="margin:5px">
                                                解密数据
                                            </a-checkbox>
                                            <a-divider v-if="param.convert.decrypt"/>
                                            <a-select
                                            v-if="param.convert.decrypt"
                                            placeholder="解密算法"
                                            :defaultValue="param.convert.decryptMethod"
                                            :options="cryptoMethodOptions"
                                            @change="value=>onDecryptMethodChange(value, key)"
                                            style="width:100%"
                                            >
                                            </a-select>
                                            <a-divider v-if="param.convert.decrypt"/>
                                            <a-select
                                            v-if="param.convert.decrypt"
                                            placeholder="编码"
                                            :defaultValue="param.convert.coding"
                                            :options="encodeOptions"
                                            @change="value=>onCodingChange(value, key)"
                                            style="width:100%"
                                            >
                                            </a-select>
                                            <a-divider v-if="param.convert.decrypt"/>
                                            <a-input
                                            v-if="param.convert.decrypt"
                                            addonBefore="密钥路径"
                                            :defaultValue="param.convert.secretPath"
                                            @change="e=>onSecretPathChange(e.target.value, key)">
                                            </a-input>
                                            <a-select
                                            v-if="param.convert.decrypt"
                                            placeholder="密钥配置"
                                            :defaultValue="param.convert.decryptSecret"
                                            :options="customizeConfig"
                                            @change="value=>onDecryptSecretChange(value, key)"
                                            style="width:100%"
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
                                            <div v-if="['RSA-SHA1', 'RSA-SHA256'].includes(param.convert.decryptMethod)">
                                            <a-divider></a-divider>
                                            <a-input
                                            v-if="param.convert.decrypt"
                                            addonBefore="验签内容路径"
                                            :defaultValue="param.convert.verifyPath"
                                            @change="e=>onVerifyPathChange(e.target.value, key)">
                                            </a-input>
                                            </div>
                                        </span>
                                        <span v-if="param.convert && param.convert.type == 'String' && param.convert.enum && param.convert.enum.length">
                                            <a-input placeholder="默认转化值" :defaultValue="param.convert.default" addonBefore="默认" @change="e=>onDefaultStringChange(e.target.value, key)"></a-input>
                                        </span>
                                        <span v-if="param.convert && param.convert.type == 'Boolean' && param.convert.enum && param.convert.enum.length">
                                            <a-select
                                            :defaultValue="param.convert.default.toString()"
                                            :options="booleanOptions"
                                            @change="value=>onBooleanDefaultChange(value, key)"
                                            />
                                        </span>
                                        <span v-if="param.convert && param.convert.type == 'Number' && param.convert.enum && param.convert.enum.length">
                                            <a-input-number
                                            :defaultValue="param.convert.default"
                                            >
                                            </a-input-number>
                                        </span>
                                        <div v-if="param.convert && ['String','Number','Boolean'].includes(param.convert.type)" style="margin-top:5px">
                                            <div v-for="(valueCase, enumIndex) in param.convert.enum" :key="valueCase.value">
                                                <a-row>
                                                    <a-col :span="2">
                                                        <a-button size="small" shape="circle" icon="close" @click="e=>deleteEnum(key,enumIndex)"></a-button>
                                                    </a-col>
                                                    <a-col :span="12">
                                                        <a-input
                                                        v-if="param.convert.type=='String'"
                                                        v-model="valueCase.value"
                                                        addonBefore="结果值"
                                                        addonAfter="判断"
                                                        >
                                                        </a-input>
                                                        <a-select
                                                        v-if="param.convert.type=='Boolean'"
                                                        :defaultValue="valueCase.value.toString()"
                                                        :options="booleanOptions"
                                                        @change="value=>onEnumChange(value, valueCase)"
                                                        />
                                                    </a-col>
                                                    <a-col :span="10">
                                                        <a-textarea
                                                        placeholder="描述判断方式,JSON格式"
                                                        :autoSize="{ minRows: 3, maxRows: 3}"
                                                        :defaultValue="JSON.stringify(valueCase.condition,null,2)"
                                                        @focus="e=>onConditionFocus(e.target, key, enumIndex)"
                                                        @blur="e=>onConditionConfirm(e.target, key, enumIndex)"
                                                        />
                                                    </a-col>
                                                </a-row>
                                            </div>
                                            <a-button shape="round" @click="addEnum(key)">添加枚举</a-button>
                                        </div>
                                        <span v-if="param.convert && ['Object', 'Array'].includes(param.convert.type)">
                                            <a-tooltip>
                                                <template slot="title">
                                                有时候数据来源为字符串格式的xml或json,需要转化成JSON对象来处理
                                                </template>
                                                <a-radio-group
                                                button-style="solid"
                                                :defaultValue="param.convert.parse?'json':param.convert.fromXml?'xml':'none'"
                                                @change="e=>onParseChange(e.target.value, key)"
                                                >
                                                    <a-radio-button value="json">
                                                        JSON
                                                    </a-radio-button>
                                                    <a-radio-button value="xml">
                                                        XML
                                                    </a-radio-button>
                                                    <a-radio-button value="none">
                                                        不解析
                                                    </a-radio-button>
                                                </a-radio-group>
                                            </a-tooltip>
                                            <!--
                                            <a-tooltip>
                                                <template slot="title">
                                                如果关闭，则新对象仅包含下层定义的字段，原对象并不返回
                                                </template>
                                                <a-switch
                                                checked-children="返回原对象"
                                                un-checked-children="不返回原对象"
                                                :defaultChecked="param.convert.useResult"
                                                @change="value=>onUseResultChange(value, key)"
                                                style="margin:5px"
                                                >
                                                </a-switch>
                                            </a-tooltip>
                                            -->
                                            <br/>
                                            <a-tooltip>
                                                <template slot="title">
                                                打开后, 组合的对象将被字符串化
                                                </template>
                                                <a-switch
                                                checked-children="转化成字符串"
                                                un-checked-children="不转化成字符串"
                                                :defaultChecked="param.convert.stringify"
                                                @change="value=>onStringifyChange(value, key)"
                                                style="margin:5px 5px 5px 0"
                                                >
                                                </a-switch>
                                            </a-tooltip>

                                            <a-tooltip>
                                                <template slot="title">
                                                打开后, 组合的对象将被转化成XML字符串
                                                </template>
                                                <a-switch
                                                checked-children="转化成XML"
                                                un-checked-children="不转化XML"
                                                :defaultChecked="param.convert.toXml"
                                                @change="value=>onToXmlChange(value, key)"
                                                style="margin:5px 5px 5px 0"
                                                >
                                                </a-switch>
                                            </a-tooltip>

                                            <a-tooltip v-if="!!param.convert.toXml">
                                                <template slot="title">
                                                转化xml时,使用CDATA包裹数据
                                                </template>
                                                <a-switch
                                                checked-children="CDATA"
                                                un-checked-children="不包裹CDATA"
                                                :defaultChecked="param.convert.cdata"
                                                @change="value=>onCdataChange(value, key)"
                                                style="margin:5px 5px 5px 0"
                                                >
                                                </a-switch>
                                            </a-tooltip>
                                        </span>
                                        <span v-if="param.convert && (param.convert.type == 'String' || (['Object', 'Array'].includes(param.convert.type) && (param.convert.toXml || param.convert.stringify)))">
                                            <br/>
                                            <a-checkbox
                                            :checked="param.convert.encrypt" @change="e=>encryptChange(e.target.checked, key)" style="margin:5px">
                                                加密数据
                                            </a-checkbox>
                                            <a-checkbox
                                            :checked="param.convert.hashed" @change="e=>hashedChange(e.target.checked, key)" style="margin:5px">
                                                哈希数据
                                            </a-checkbox>
                                            <a-checkbox
                                            :checked="param.convert.encoded" @change="e=>encodedChange(e.target.checked, key)" style="margin:5px">
                                                编码数据
                                            </a-checkbox>
                                            <a-checkbox
                                            :checked="param.convert.toUpperCase" @change="e=>toUpperCaseChange(e.target.checked, key)" style="margin:5px"
                                            >
                                            转化为大写
                                            </a-checkbox>
                                            <a-checkbox
                                            :checked="param.convert.toLowerCase" @change="e=>toLowerCaseChange(e.target.checked, key)" style="margin:5px"
                                            >
                                            转化为小写
                                            </a-checkbox>
                                            <a-divider v-if="param.convert.encrypt||param.convert.hashed"/>
                                            <a-select
                                            v-if="param.convert.encrypt"
                                            placeholder="加密算法"
                                            :value="param.convert.encryptMethod"
                                            :options="cryptoMethodOptions"
                                            @change="value=>onEncryptMethodChange(value, key)"
                                            style="width:100%"
                                            >
                                            </a-select>
                                            <a-select
                                            v-if="param.convert.hashed"
                                            placeholder="哈希算法"
                                            :value="param.convert.encryptMethod"
                                            :options="hashOptions"
                                            @change="value=>onEncryptMethodChange(value, key)"
                                            style="width:100%"
                                            >
                                            </a-select>
                                            <a-divider v-if="param.convert.encrypt||param.convert.hashed||param.convert.decoded||param.convert.encoded"/>
                                            <a-select
                                            v-if="param.convert.encrypt||param.convert.hashed||param.convert.decoded||param.convert.encoded"
                                            placeholder="编码"
                                            :defaultValue="param.convert.coding"
                                            :options="encodeOptions"
                                            @change="value=>onCodingChange(value, key)"
                                            style="width:100%"
                                            >
                                            </a-select>
                                            <a-divider v-if="param.convert.hashed&&['hmac', 'RSA-SHA1', 'RSA-SHA256'].includes(param.convert.encryptMethod)"/>
                                            <a-input
                                            v-if="param.convert.hashed&&['hmac', 'RSA-SHA1', 'RSA-SHA256'].includes(param.convert.encryptMethod)"
                                            placeholder="哈希密钥地址"
                                            :defaultValue="param.convert.hashSecretPath"
                                            @change="e=>onHashSecretPathChange(e.target.value, key)"
                                            ></a-input>
                                            <a-divider v-if="param.convert.encrypt"/>
                                            <a-input
                                            v-if="param.convert.encrypt"
                                            addonBefore="密钥路径"
                                            :defaultValue="param.convert.secretPath"
                                            @change="e=>onSecretPathChange(e.target.value, key)">
                                            </a-input>
                                            <a-select
                                            v-if="param.convert.encrypt"
                                            placeholder="密钥配置"
                                            :defaultValue="param.convert.encryptSecret"
                                            :options="customizeConfig"
                                            @change="value=>onEncryptSecretChange(value, key)"
                                            style="width:100%"
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
                                    </a-col>
                                </a-row>
                            </a-col>

                        </a-row>
                    </div>
                </div>
                <!-- 递归return -->
                <div>
                    <span v-if="param.convert && (param.convert.type == 'Object' || param.convert.itemType == 'Object')">
                        <returnComp v-if="param.convert.return" :appId="appId" :dataObj="param.convert.return" :dataSourceObj="dataSourceObj" :systemMap="systemMap" :upperPath="param.source+'.'+param.path" :customizeConfig="customizeConfig" :callbackMap="callbackMap" :desensitizationOptions="desensitizationOptions" :cryptoMethodOptions="cryptoMethodOptions" :hashOptions="hashOptions" :encodeOptions="encodeOptions" :fromOptions="fromOptions"/>
                    </span>
                </div>
            </div>

            <div v-show="objectItemsOpenStatus[key]" style="padding-left: calc(1.2% + 13px); border-left: #e5e5e5 1px dashed; font-size:14px; padding-top: 20px; padding-bottom: 20px; color:#999">...... 点击右上角<a-icon type="plus-square"/>号展开 ......</div>

        </div>
        <div style="padding-bottom:10px">
            <a-button v-if="inputParam" type="primary" size="small" shape="round" icon="setting" @click="showInput">添加字段</a-button>
            <a-input v-else style="width:30%" @change="e=>onParamChange(e.target.value)" @keyup.enter="addParam"/>
        </div>
    </div>
</template>

<script>
    //import { EventBus } from '../lib/event-bus.js'; //全局事件总线

  export default {
    data() {
        return {
            inputParam: true,
            tempParam: '',
            tempPath: '',
            data: {
            },
            // fromOptions: [
            //     {
            //         label: '前置请求数据',
            //         value: 'preResult'
            //     },
            //     {
            //         label: '结果',
            //         value: 'result'
            //     },
            //     {
            //         label: '数据库',
            //         value: 'dataSource'
            //     },
            //     {
            //         label: '系统方法',
            //         value: 'system'
            //     },
            //     {
            //         label: '公用参数',
            //         value: 'customConfig'
            //     },
            //     {
            //         label: '固定值',
            //         value: 'value'
            //     },
            //     {
            //         label: '调用入参',
            //         value: 'params'
            //     },
            //     {
            //         label: '配置回调地址',
            //         value: 'callbackUrl'
            //     },
            //     {
            //         label: '现有配置数据',
            //         value: 'return'
            //     }
            // ],
            sourceOptions: [],
            methodOptions: [],
            pathOptions: [
            ],
            typeOptions: [
                {
                    label: '字符串',
                    value: 'String'
                },
                {
                    label: '数字',
                    value: 'Number'
                },
                {
                    label: '布尔值',
                    value: 'Boolean'
                },
                {
                    label: '数组',
                    value: 'Array'
                },
                {
                    label: '对象',
                    value: 'Object'
                },
                {
                    label: '回调配置',
                    value: 'callbackUrl'
                },
                {
                    label: '对象数组缩减',
                    value: 'reducedArrayObject',
                    title: '将元素为对象的数组缩减为一个对象，\n每个对象的字段将被组合成一个数组，\n数组内的元素为每一个对象对应字段的值\n[\n {\n  "name":"a",\n  "score":1\n },\n {\n  "name":"b",\n  "score":2\n },\n {\n  "name":"c"\n }\n] \n--> \n{\n "name":["a","b","c"],\n "score":[1,2,undefined]\n}'
                },
                {
                    label: '数组拼接字符串',
                    value: 'arrayJoin',
                    title: '将数组内的元素使用join方法拼接成字符串，\n各元素之间使用分隔符连接\n例如：\n分隔符为","\n["a","b",undefined,"d"]\n-->\n"a,b,,d"'
                },
                {
                    label: '字符串拆分成数组',
                    value: 'stringSplit',
                    title: '将字符串按分割符使用split方法拆分成元素放进数组内，\n例如：\n分隔符为","\n"a,b,,d"\n-->["a","b",undefined,"d"]\n'
                },
                {
                    label: '获取数组长度',
                    value: 'getLength',
                    title: '计算出数组的长度'
                },
                {
                    label: '字符串截取',
                    value: 'slice',
                    title: '使用slice方法截取字符串'
                },
                {
                    label: 'encodeURI',
                    value: 'encodeURI',
                    title: 'encodeURI() 函数可把字符串作为 URI 进行编码。\n对以下在 URI 中具有特殊含义的 ASCII 标点符号，encodeURI() 函数是不会进行转义的： , / ? : @ & = + $ # (可以使用 encodeURIComponent() 方法分别对特殊含义的 ASCII 标点符号进行编码。).'
                },
                {
                    label: 'encodeURIComponent',
                    value: 'encodeURIComponent',
                    title: 'encodeURIComponent() 函数可把字符串作为 URI 组件进行编码。\n该方法不会对 ASCII 字母和数字进行编码，也不会对这些 ASCII 标点符号进行编码： - _ . ! ~ * \' ( ) 。\n其他字符（比如 ：;/?:@&=+$,# 这些用于分隔 URI 组件的标点符号），都是由一个或多个十六进制的转义序列替换的。'
                },
                {
                    label: 'decodeURI',
                    value: 'decodeURI',
                    title: 'decodeURI() 函数可对 encodeURI() 函数编码过的 URI 进行解码。'
                },
                {
                    label: 'decodeURIComponent',
                    value: 'decodeURIComponent',
                    title: 'decodeURIComponent() 函数可对 encodeURIComponent() 函数编码的 URI 进行解码。'
                }
            ],
            itemTypeOptions: [
                {
                    label: '字符串',
                    value: 'String'
                },
                {
                    label: '数字',
                    value: 'Number'
                },
                {
                    label: '布尔值',
                    value: 'Boolean'
                },
                {
                    label: '数组',
                    value: 'Array'
                },
                {
                    label: '对象',
                    value: 'Object'
                }
            ],
            booleanOptions: [
                {
                    label: "真",
                    value: 'true'
                },
                {
                    label: "假",
                    value: 'false'
                }
            ],
            tempCondition: "",
            objectItemsOpenStatus: {},
            apiConfiguredQuery: []
        }
    },
    name: 'returnComp',
    props: ['appId', 'dataObj', 'dataSourceObj', 'systemMap', 'upperPath', 'customizeConfig', 'callbackMap', 'desensitizationOptions', 'cryptoMethodOptions', 'hashOptions', 'encodeOptions', 'fromOptions'],
    methods:{
        getApiConfiguredQurey(){
            this.instance
            .get(
            `/public/getApiConfiguredQuery?app_id=${this.appId}`
            )
            .then(response => {
                let result = response.data;
                this.apiConfiguredQuery = result.list;
            })
            .catch(function (error) { // 请求失败处理
                console.log(error);
            });
        },
        onQueryChange(value, key){
            this.data[key].query_id = value;
        },
        filterQuery(input, text){
            let regex = new RegExp(input,'i');
            return regex.test(text);
        },
        formSourceOption(){
            let tempOption = [];
            if(this.dataSourceObj){
                for(let source of this.dataSourceObj){
                    if(source.targetModel){
                        tempOption.push(
                            {
                                label: source.sourceName,
                                value: this.lowerCapital(source.targetModel)
                            }
                        )
                    }else if(source.sourceName && source.modelName){
                        tempOption.push(
                            {
                                label: source.path,
                                value: source.path,
                                customizeSource: true
                            }
                        )
                    }
                }
            }
            this.sourceOptions = tempOption;
        },
        formMethodOption(){
            let tempOption = [];
            for(let method in this.systemMap){
                tempOption.push({
                    label: this.systemMap[method],
                    value: method
                })
            }
            this.methodOptions = tempOption;
        },
        lowerCapital(str){
            return str.charAt(0).toLowerCase()+str.slice(1);
        },
        openObjectItemInfo(key, isShow){
            // 展开和收起开关
            // 这里为了不污染原始数据结构，这里重新定义了一个object来存储展开和收起的状态
            this.$set(this.objectItemsOpenStatus,key,!isShow)
        },
        onFromChange(value, key){
            this.data[key].from = value;
            if(['callbackUrl'].includes(value)){
                this.data[key].path = ""
            }
            this.$forceUpdate();
        },
        onDescriptionChange(value, key){
            this.data[key].description = value;
            this.$forceUpdate();
        },
        onSourceChange(value, key, option){
            this.data[key].source = value;
            this.data[key].customizeSource = option.data.props.customizeSource;
            this.$forceUpdate();
        },
        onMethodChange(value, key){
            this.data[key].method = value;
            if(["stringConcat", "mergeList", "filter"].includes(value)){
                if(!this.data[key].options){
                    this.data[key].options = {};
                }
            }
            this.$forceUpdate();
        },
        onValueChange(value, key){
            this.data[key].value = value;
        },
        onRequiredChange(value, key){
            this.data[key].required = value;
        },
        onTempChange(value, key){
            this.data[key].temp = value;
        },
        onPathChange(value, key){
            this.data[key].path = value;
        },
        onExpressionChange(value, key){
            if(!this.data[key].options){
                this.data[key].options = {};
            }
            this.data[key].options.expression = value.replace(/\\n/g,"\n");
        },
        onFilterPathChange(value, key){
            if(!this.data[key].options){
                this.data[key].options = {};
            }
            this.data[key].options.path = value
        },
        onFilterChange(value, key){
            this.data[key].options.filter = value
        },
        onPrimaryKeyChange(value, key){
            if(!this.data[key].options){
                this.data[key].options = {};
            }
            this.data[key].options.primaryKey = value;
        },
        addMergeListItem(key){
            if(!this.data[key].options){
                this.data[key].options = {
                    lists:[]
                };
            }
            if(!this.data[key].options.lists){
                this.data[key].options.lists = [];
            }
            this.data[key].options.lists.push(
                {
                    path: "",
                    refKey: ""
                }
            )
            this.$forceUpdate();
        },
        onListConfigPathChange(value, key, itemKey){
            this.data[key].options.lists[itemKey].path = value;
        },
        onListConfigRefKeyChange(value, key, itemKey){
            this.data[key].options.lists[itemKey].refKey = value;
        },
        onDesensitizationChange(value, key){
            this.data[key].desensitization = value;
        },
        showInput(){
            console.log(`show input`);
            this.inputParam = false;
        },
        onParamChange(value){
            this.tempParam = value.trim();
        },
        addParam(){
            if(this.tempParam && !this.data[this.tempParam]){
                //如果this.tempParam中含有'.'，不能作为键名（数据库结构不允许）,则作为
                //key
                if(/\./.test(this.tempParam)||/\[/.test(this.tempParam)){
                    let key = this.tempParam.split('.').join('_')
                    .replace(/\[/g,'_').replace(/\]_/g,'_').replace(/\]/g,'');
                    if(!this.data[key]){
                        this.data[key] = {
                            from: "result",
                            path: this.tempParam,
                            key: this.tempParam
                        }
                    }
                }else{
                    this.data[this.tempParam] = {
                        from: "result",
                        path: this.tempParam,
                        source: ""
                    }
                }
                this.tempParam = "";
            }else{
                this.$message.error('字段名称重复');
            }
            this.inputParam = true;
            this.$forceUpdate();
        },
        deleteParam(key){
            delete this.data[key];
            this.$forceUpdate();
        },
        convertChange(value, key){
            if(value){
                if(!this.data[key].convert){
                    this.data[key].convert = {
                    type: "String",
                    default: '',
                    enum: []
                    }
                }
            }else{
                delete this.data[key].convert;
            }
            this.$forceUpdate();
        },
        decodedChange(value, key){
            this.data[key].convert.decoded = value;
            this.$forceUpdate();
        },
        decryptChange(value, key){
            this.data[key].convert.decrypt = value;
            this.$forceUpdate();
        },
        encryptChange(value, key){
            this.data[key].convert.encrypt = value;
            if(value){
                this.data[key].convert.encryptMethod = "";
                this.data[key].convert.coding = "";
                this.data[key].convert.hashed = false;
            }
            this.$forceUpdate();
        },
        hashedChange(value, key){
            this.data[key].convert.hashed = value;
            if(value){
                this.data[key].convert.encryptMethod = "";
                this.data[key].convert.coding = "";
                this.data[key].convert.encrypt = false;
            }
            this.$forceUpdate();
        },
        encodedChange(value, key){
            this.data[key].convert.encoded = value;
            this.$forceUpdate();
        },
        toUpperCaseChange(value, key){
            this.data[key].convert.toUpperCase = value;
            if(value){
                this.data[key].convert.toLowerCase = false;
            }
            this.$forceUpdate();
        },
        toLowerCaseChange(value, key){
            this.data[key].convert.toLowerCase = value;
            if(value){
                this.data[key].convert.toUpperCase = false;
            }
            this.$forceUpdate();
        },
        onDecryptMethodChange(value, key){
            this.data[key].convert.decryptMethod = value;
            this.$forceUpdate();
        },
        onEncryptMethodChange(value, key){
            this.data[key].convert.encryptMethod = value;
            this.$forceUpdate();
        },
        onCodingChange(value, key){
            this.data[key].convert.coding = value;
            this.$forceUpdate();
        },
        onHashSecretPathChange(value, key){
            this.data[key].convert.hashSecretPath = value;
            this.$forceUpdate();
        },
        onSecretPathChange(value, key){
            this.data[key].convert.secretPath = value;
            this.$forceUpdate();
        },
        onVerifyPathChange(value, key){
            this.data[key].convert.verifyPath = value;
            this.$forceUpdate();
        },
        onDecryptSecretChange(value, key){
            this.data[key].convert.decryptSecret = value;
        },
        onEncryptSecretChange(value, key){
            this.data[key].convert.encryptSecret = value;
        },
        onSeparatorChange(value, key){
            this.data[key].convert.joinArraySeparator = value;
        },
        onSplitSeparatorChange(value, key){
            this.data[key].convert.stringSplitSeparator = value;
        },
        onDefaultStringChange(value, key){
            this.data[key].convert.default = value;
        },
        onTypeChange(value, key){
            this.data[key].convert.type = value;
            if(value === "Array"){
                if(!this.data[key].convert.itemType){
                    this.data[key].convert.itemType = "String"
                }
            }else{
                delete this.data[key].convert.itemType
            }
            if(value === "Object" && !this.data[key].convert.return){
                this.data[key].convert.return = {};
            }
            if(value === "Number"){
                this.data[key].convert.default = 0;
            }
            if(value == "Boolean"){
                if(typeof this.data[key].convert.default != 'boolean'){
                    this.data[key].convert.default = false;
                }
                if(!this.data[key].convert.enum){
                    this.data[key].convert.enum = [];
                }
            }
            this.$forceUpdate();
        },
        onParseChange(value, key){
            switch(value){
                case 'json':
                    this.data[key].convert.parse = true;
                    this.data[key].convert.fromXml = false;
                    break;
                case 'xml':
                    this.data[key].convert.parse = false;
                    this.data[key].convert.fromXml = true;
                    break;
                default:
                    this.data[key].convert.parse = false;
                    this.data[key].convert.fromXml = false;
                    break;
            }
            if(!value || value == 'none'){
                this.data[key].convert.decrypt = false;
            }
            this.$forceUpdate();
        },
        onUseResultChange(value, key){
            this.data[key].convert.useResult = value;
        },
        onStringifyChange(value, key){
            this.data[key].convert.stringify = value;
        },
        onToXmlChange(value, key){
            this.data[key].convert.toXml = value;
            if(!value){
                this.data[key].convert.encrypt = false;
            }
            this.$forceUpdate();
        },
        onCdataChange(value, key){
            this.data[key].convert.cdata = value;
        },
        onItemTypeChange(value, key){
            this.data[key].convert.itemType = value;
            if(value === "Object" && !this.data[key].convert.return){
                this.data[key].convert.return = {};
            }
            this.$forceUpdate();
        },
        onBooleanDefaultChange(value, key){
            this.data[key].convert.default = (value == 'true'? true : false)
        },
        deleteEnum(key, enumIndex){
            this.data[key].convert.enum.splice(enumIndex,1);
            this.$forceUpdate();
        },
        addEnum(key){
            if(!this.data[key].convert.enum.map(item=>item.value).includes(this.data[key].convert.default)){
                this.data[key].convert.enum.push({
                    value: this.data[key].convert.default,
                    condition: {}
                })
            }else{
                this.$message.error(`即将添加的枚举值(默认)已存在，请先修改已存在的枚举值或默认值再添加`)
            }
            this.$forceUpdate();
        },
        onEnumChange(value, enumCase){
            enumCase.value = ((value == 'true')? true: false);
        },
        onConditionFocus(target){
            this.tempCondition = target.value
        },
        onConditionConfirm(target, key, enumIndex){
            try{
                this.data[key].convert.enum[enumIndex].condition = JSON.parse(target.value)
            }catch(e){
                target.value = this.tempDataMerge;
            }
        }
    },
    created(){
        this.getApiConfiguredQurey();
        //this.formSourceOption();
    },
    mounted(){
        this.data = this.dataObj;
    }
  };
</script>
<style scoped>
.ant-divider-horizontal.ant-divider-with-text-left::before{
    width: 1.2% !important
}
.open-item-icon:hover{
    color: #1DA57A
}
.object-item{
    padding-top: 8px;
    padding-bottom: 15px;
    padding-left: 16px;
    position: relative;
}
.object-item-option{
    background-color: #f6f6f6;
    padding: 10px;
    border-radius: 0 12px 12px 12px;
}
.close-icon{
    font-size:20px;
    color:#888;
    position: absolute;
    padding: 2px;
    right: -4px;
    top: 0;
    background-color: #fff;
    border-radius: 50%;
}
.close-icon:hover{
    color:#1DA57A
}
.item-left-line{
    border-left: #e5e5e5 1px dashed;
}
.c-col-title{
    display:inline-block;
    height:32px;
    line-height: 30px;
    padding: 0 8px;
    border:1px solid #d9d9d9;
    border-right:none;
    background-color:#fafafa;
    vertical-align: top;

}
</style>
