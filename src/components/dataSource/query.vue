<template>
    <div>
        <div v-if="data.type">
            <a-divider orientation="left" dashed style="border-left: #e5e5e5 1px dashed; margin: 0 0 !important">
                <template>
                    <a-icon v-if="unfold" type="minus-square"  title="收起" @click="changeUnfold(false)"/>
                    <a-icon v-else type="plus-square" title="展开" @click="changeUnfold(true)"/>
                </template >

                <a-icon v-if="false" type="minus-square" style="color:#eee"/>
                {{data.key || data.type}}
                <a-icon class="deleteFiled" type="close-circle" @click="deleteField" />
            </a-divider>
            <div v-if="unfold" style="padding-left: calc(1.2% + 13px); border-left: #e5e5e5 1px dashed">
                <div>
                    <div class="queryField">
                        字段："{{data.key}}"<a-button size="small" shape="round" @click="showChangeKey" icon="setting"></a-button>
                        <span v-if="changeKey">
                            <a-cascader placeholder="系统检查字段" :options="field" change-on-select  v-model="cascader_select_field" @popupVisibleChange="cascaderSelectChange" />
                            <a-input v-model="temp_key" placeholder="自定义字段" style="display: inline; width: 100px" @pressEnter="keyChange" />
                        </span>
                    </div>
                    <div class="queryField">
                        操作：
                        <a-select v-model="data.type" style="width: 100px" @change="value => onSelectChange(value, 'type')">
                            <a-select-option v-for="item in query_operator" :key="item" :value="item" >
                                {{item}}
                            </a-select-option>
                        </a-select>
                    </div>
                    <div>
                        来源：
                        <a-select
                            v-model="data.from"
                            :options="map.from"
                            @change="value => onSelectChange(value, 'from')"
                        ></a-select>
                    </div>
                    <div>
                        <div v-if="data.from==='nest'">
                            <div v-if="Array.isArray(data.path)">
                                <div v-for="(item, index) in data.path" :key="JSON.stringify(item)">
                                    <Query v-if="data.from==='nest'" :pathIndex="index" :query="item" :field="field" :map="map" v-on:deleteQueryField="deleteQueryField"/>
                                </div>
                            </div>
                            <Query v-else :query="data.path" :pathIndex="0" :field="field" :map="map" v-on:deleteQueryField="deleteQueryField" v-on:addQueryField="addQueryField" />
                        </div>
                        <a-row v-else>
                            <a-col :span="8">
                                路径：
                                <a-select
                                    v-if="data.from==='system'"
                                    :defaultValue="data.path || ''"
                                    :options="map.system"
                                    @change="value => onSelectChange(value, 'path')"
                                    style="width: 200px"
                                ></a-select>
                                <a-select
                                    v-else-if="data.from==='customConfig'"
                                    :defaultValue="data.path || ''"
                                    :options="map.customConfig"
                                    @change="value => onSelectChange(value, 'customConfig')"
                                    style="width: 200px"
                                ></a-select>
                                <a-input v-else style="display: inline; width: 100px" v-model="temp_path" @blur="pathChange" @pressEnter="pathChange" v-on:addQueryField="addQueryField" />
                            </a-col>
                            <!--洗数据-->
                            <a-col :span="8" style="padding-left:30px">
                                <a-checkbox :defaultChecked="!!data.convert" @change="e=>convertChange(e.target.checked)" style="margin:5px 5px 5px 0">洗数据</a-checkbox>
                                <div v-if="data.convert">
                                    <span>
                                        <a-select
                                            :defaultValue="data.convert.type"
                                            :options="typeOptions"
                                            @change="onTypeChange"
                                            style="width:60%">
                                        </a-select>
                                    </span>
                                </div>
                                <a-row style="margin-top:5px">
                                    <a-col>
                                        <span v-if="data.convert && data.convert.type == 'Array'">
                                            <a-select
                                                :defaultValue="data.convert.itemType"
                                                :options="itemTypeOptions"
                                                @change="onItemTypeChange"
                                                style="width:40%"
                                            />
                                        </span>
                                        <span v-if="data.convert && data.convert.type == 'arrayJoin'">
                                            <a-input
                                                addonBefore="分隔符"
                                                :defaultValue="data.convert.joinArraySeparator"
                                                @change="e=>onConvertItemChange(e.target.value, 'joinArraySeparator')"
                                                style="width:40%"
                                            >
                                            </a-input>
                                        </span>
                                        <span v-if="data.convert && data.convert.type == 'stringSplit'">
                                            <a-input
                                                addonBefore="分隔符"
                                                :defaultValue="data.convert.stringSplitSeparator"
                                                @change="e=>onConvertItemChange(e.target.value, 'stringSplitSeparator')"
                                                style="width:40%"
                                            >
                                            </a-input>
                                        </span>
                                    </a-col>
                                </a-row>

                                <a-row>
                                    <a-col style="margin-top:5px">
                                        <span v-if="data.convert && (data.convert.type == 'String' || (['Object', 'Array'].includes(data.convert.type) && (data.convert.parse||data.convert.fromXml)))">
                                            <a-checkbox
                                                :checked="data.convert.decoded" @change="e=>onConvertItemChange(e.target.checked, 'decoded')" style="margin:5px">
                                                解码数据
                                            </a-checkbox>
                                            <a-checkbox
                                                :checked="data.convert.decrypt" @change="e=>onConvertItemChange(e.target.checked, 'decrypt')" style="margin:5px">
                                                解密数据
                                            </a-checkbox>
                                            <a-divider v-if="data.convert.decrypt"/>
                                            <a-select
                                                v-if="data.convert.decrypt"
                                                placeholder="解密算法"
                                                :defaultValue="data.convert.decryptMethod"
                                                :options="map.cryptoMethodOptions"
                                                @change="value=>onConvertItemChange(value, 'encryptMethod')"
                                                style="width:100%"
                                            >
                                            </a-select>
                                            <a-divider v-if="data.convert.decrypt"/>
                                            <a-select
                                                v-if="data.convert.decrypt"
                                                placeholder="编码"
                                                :defaultValue="data.convert.coding"
                                                :options="map.encodeOptions"
                                                @change="value=>onConvertItemChange(value, 'coding')"
                                                style="width:100%"
                                            >
                                            </a-select>
                                            <a-divider v-if="data.convert.decrypt"/>
                                            <a-input
                                                v-if="data.convert.decrypt"
                                                addonBefore="密钥路径"
                                                :defaultValue="data.convert.secretPath"
                                                @change="e=>onConvertItemChange(e.target.value, 'secretPath')">
                                            </a-input>
                                            <a-select
                                                v-if="data.convert.decrypt"
                                                placeholder="密钥配置"
                                                :defaultValue="data.convert.decryptSecret"
                                                :options="map.customConfig"
                                                @change="value=>onConvertItemChange(value, 'decryptSecret')"
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
                                        <span v-if="data.convert && data.convert.type == 'String' && data.convert.enum && data.convert.enum.length">
                                            <a-input placeholder="默认转化值" :defaultValue="data.convert.default" addonBefore="默认" @change="e=>onConvertItemChange(e.target.value, 'default')"></a-input>
                                        </span>
                                        <span v-if="data.convert && data.convert.type == 'Boolean' && data.convert.enum && data.convert.enum.length">
                                            <a-select
                                                :defaultValue="data.convert.default.toString()"
                                                :options="booleanOptions"
                                                @change="value=>onBooleanDefaultChange(value, 'default')"
                                            />
                                        </span>
                                        <span v-if="data.convert && data.convert.type == 'Number' && data.convert.enum && data.convert.enum.length">
                                            <a-input-number
                                                :defaultValue="data.convert.default"
                                            >
                                            </a-input-number>
                                        </span>
                                        <div v-if="data.convert && ['String','Number','Boolean'].includes(data.convert.type)" style="margin-top:5px">
                                            <div v-for="(valueCase, enumIndex) in data.convert.enum" :key="valueCase.value">
                                                <a-row>
                                                    <a-col :span="2">
                                                        <a-button size="small" shape="circle" icon="close" @click="e=>deleteEnum(enumIndex)"></a-button>
                                                    </a-col>
                                                    <a-col :span="12">
                                                        <a-input
                                                            v-if="data.convert.type=='String'"
                                                            v-model="valueCase.value"
                                                            addonBefore="结果值"
                                                            addonAfter="判断"
                                                        >
                                                        </a-input>
                                                        <a-select
                                                            v-if="data.convert.type=='Boolean'"
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
                                                            @focus="e=>onConditionFocus(e.target, enumIndex)"
                                                            @blur="e=>onConditionConfirm(e.target, enumIndex)"
                                                        />
                                                    </a-col>
                                                </a-row>
                                            </div>
                                            <a-button shape="round" @click="addEnum()">添加枚举</a-button>
                                        </div>
                                        <span v-if="data.convert && ['Object', 'Array'].includes(data.convert.type)">
                                            <a-tooltip>
                                                <template slot="title">
                                                有时候数据来源为字符串格式的xml或json,需要转化成JSON对象来处理
                                                </template>
                                                <a-radio-group
                                                    button-style="solid"
                                                    :defaultValue="data.convert.parse?'json':data.convert.fromXml?'xml':'none'"
                                                    @change="e=>onParseChange(e.target.value)"
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
                                                :defaultChecked="data.convert.useResult"
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
                                                    :defaultChecked="data.convert.stringify"
                                                    @change="value=>onConvertItemChange(value, 'stringify')"
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
                                                    :defaultChecked="data.convert.toXml"
                                                    @change="value=>onToXmlChange(value)"
                                                    style="margin:5px 5px 5px 0"
                                                >
                                                </a-switch>
                                            </a-tooltip>

                                            <a-tooltip v-if="!!data.convert.toXml">
                                                <template slot="title">
                                                转化xml时,使用CDATA包裹数据
                                                </template>
                                                <a-switch
                                                    checked-children="CDATA"
                                                    un-checked-children="不包裹CDATA"
                                                    :defaultChecked="data.convert.cdata"
                                                    @change="value=>onConvertItemChange(value, 'cdata')"
                                                    style="margin:5px 5px 5px 0"
                                                >
                                                </a-switch>
                                            </a-tooltip>
                                        </span>
                                        <span v-if="data.convert && (data.convert.type == 'String' || (['Object', 'Array'].includes(data.convert.type) && (data.convert.toXml || data.convert.stringify)))">
                                            <br/>
                                            <a-checkbox
                                                :checked="data.convert.encrypt" @change="e=>encryptChange(e.target.checked)" style="margin:5px">
                                                加密数据
                                            </a-checkbox>
                                            <a-checkbox
                                                :checked="data.convert.hashed" @change="e=>hashedChange(e.target.checked, key)" style="margin:5px">
                                                哈希数据
                                            </a-checkbox>
                                            <a-checkbox
                                                :checked="data.convert.encoded" @change="e=>onConvertItemChange(e.target.checked, 'encoded')" style="margin:5px">
                                                编码数据
                                            </a-checkbox>
                                            <a-checkbox
                                                :checked="data.convert.toUpperCase" @change="e=>toUpperCaseChange(e.target.checked)" style="margin:5px"
                                            >
                                            转化为大写
                                            </a-checkbox>
                                            <a-checkbox
                                                :checked="data.convert.toLowerCase" @change="e=>toLowerCaseChange(e.target.checked, key)" style="margin:5px"
                                            >
                                            转化为小写
                                            </a-checkbox>
                                            <a-divider v-if="data.convert.encrypt||data.convert.hashed"/>
                                            <a-select
                                                v-if="data.convert.encrypt"
                                                placeholder="加密算法"
                                                :value="data.convert.encryptMethod"
                                                :options="map.cryptoMethodOptions"
                                                @change="value=>onConvertItemChange(value, 'encryptMethod')"
                                                style="width:100%"
                                            >
                                            </a-select>
                                            <a-select
                                                v-if="data.convert.hashed"
                                                placeholder="哈希算法"
                                                :value="data.convert.encryptMethod"
                                                :options="map.hashOptions"
                                                @change="value=>onConvertItemChange(value, 'encryptMethod')"
                                                style="width:100%"
                                            >
                                            </a-select>
                                            <a-divider v-if="data.convert.encrypt||data.convert.hashed||data.convert.decoded||data.convert.encoded"/>
                                            <a-select
                                                v-if="data.convert.encrypt||data.convert.hashed||data.convert.decoded||data.convert.encoded"
                                                placeholder="编码"
                                                :defaultValue="data.convert.coding"
                                                :options="map.encodeOptions"
                                                @change="value=>onConvertItemChange(value, 'coding')"
                                                style="width:100%"
                                            >
                                            </a-select>
                                            <a-divider v-if="data.convert.hashed&&['hmac'].includes(data.convert.encryptMethod)"/>
                                            <a-input
                                                v-if="data.convert.hashed&&['hmac'].includes(data.convert.encryptMethod)"
                                                placeholder="哈希密钥地址"
                                                :defaultValue="data.convert.hashSecretPath"
                                                @change="e=>onConvertItemChange(e.target.value, 'hashSecretPath')"
                                            ></a-input>
                                            <a-divider v-if="data.convert.encrypt"/>
                                            <a-input
                                                v-if="data.convert.encrypt"
                                                addonBefore="密钥路径"
                                                :defaultValue="data.convert.secretPath"
                                                @change="e=>onConvertItemChange(e.target.value, 'secretPath')">
                                            </a-input>
                                            <a-select
                                                v-if="data.convert.encrypt"
                                                placeholder="密钥配置"
                                                :defaultValue="data.convert.encryptSecret"
                                                :options="map.customConfig"
                                                @change="value=>onConvertItemChange(value, 'encryptSecret')"
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
            </div>
        </div>

        <div style="padding-left: calc(1.2% + 13px); border-left: #e5e5e5 1px dashed; padding-bottom:10px" v-if="!data.type || arrayOperator.includes(data.type)">
            <a-button type="primary" size="small" shape="round" icon="setting" @click="showAdd">添加字段</a-button>
        </div>
    </div>
</template>
<script>

export default {
    name: "Query",
    data() {
        return {
            data: this.query,
            unfold: true,
            changeKey: false,
            query_operator: [
                '$and', '$or',
                '$eq', '$gt', '$gte', '$lt', '$lte',
                '$in', '$nin', '$like', '$regex'
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
            arrayOperator: ['$and', '$or'],
            cascader_select_field: [],
            temp_key: '',
            temp_path: '',
        };
    },
    props: ['query', 'pathIndex', 'field', 'map'],
    methods:{
        onSelectChange(value, key){
            if (key === 'from') {
                this.query.from = value;
                this.query.path = '';
            } else if (['path', 'customConfig'].includes(key)) {
                this.query.path = value;
            } else if (key === 'type') {
                if (this.arrayOperator.includes(this.data.type)) {
                    if (!Array.isArray(this.query.path)){
                        this.query.path = [];
                    }
                    this.query.from = 'nest';
                } else {
                    if (Array.isArray(this.query.path)){
                        this.query.path = '';
                        this.temp_path = '';
                    }
                    this.query.from = 'params';
                }
            }
            this.$forceUpdate();
        },

        // 洗数据
        convertChange(value){
            return this.$message.error('暂不支持该功能');
            // 下面是开启洗数据的开关
            // if(value){
            //     this.query.convert = {
            //         type: "String",
            //         default: '',
            //         enum: []
            //     }
            // }else{
            //     delete this.query.convert;
            // }
            // this.$forceUpdate();
        },
        onTypeChange(value){
            this.data.convert.type = value;
            if(value === "Array"){
                if(!this.data.convert.itemType){
                    this.data.convert.itemType = "String"
                }
            }else{
                delete this.data.convert.itemType
            }
            if(value === "Object" && !this.data.convert.return){
                this.data.convert.return = {};
            }
            if(value === "Number"){
                this.data.convert.default = 0;
            }
            if(value == "Boolean"){
                if(typeof this.data.convert.default != 'boolean'){
                    this.data.convert.default = false;
                }
                if(!this.data.convert.enum){
                    this.data.convert.enum = [];
                }
            }
            this.$forceUpdate();
        },
        onItemTypeChange(value){
            this.query.convert.itemType = value;
            if(value === "Object" && !this.query.convert.return){
                this.query.convert.return = {};
            }
            this.$forceUpdate();
        },
        onConvertItemChange(value, key) {
            this.query.convert[key] = value;
            this.$forceUpdate();
        },
        onBooleanDefaultChange(value, key){
            this.query.convert[key] = (value == 'true'? true : false)
        },
        deleteEnum(enumIndex){
            this.query.convert.enum.splice(enumIndex,1);
            this.$forceUpdate();
        },
        addEnum(){
            if(!this.query.convert.enum.map(item=>item.value).includes(this.query.convert.default)){
                this.query.convert.enum.push({
                    value: this.query.convert.default,
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
        onConditionConfirm(target, enumIndex){
            try{
                this.query.convert.enum[enumIndex].condition = JSON.parse(target.value)
            }catch(e){
                target.value = this.tempDataMerge;
            }
        },
        onParseChange(value){
            switch(value){
                case 'json':
                    this.query.convert.parse = true;
                    this.query.convert.fromXml = false;
                    break;
                case 'xml':
                    this.query.convert.parse = false;
                    this.query.convert.fromXml = true;
                    break;
                default:
                    this.query.convert.parse = false;
                    this.query.convert.fromXml = false;
                    break;
            }
            if(!value || value == 'none'){
                this.query.convert.decrypt = false;
            }
            this.$forceUpdate();
        },
        onToXmlChange(value){
            this.query.convert.toXml = value;
            if(!value){
                this.query.convert.encrypt = false;
            }
            this.$forceUpdate();
        },
        encryptChange(value){
            this.query.convert.encrypt = value;
            if(value){
                this.query.convert.encryptMethod = "";
                this.query.convert.coding = "";
                this.query.convert.hashed = false;
            }
            this.$forceUpdate();
        },
        hashedChange(value){
            this.query.convert.hashed = value;
            if(value){
                this.query.convert.encryptMethod = "";
                this.query.convert.coding = "";
                this.query.convert.encrypt = false;
            }
            this.$forceUpdate();
        },
        toUpperCaseChange(value){
            this.query.convert.toUpperCase = value;
            if(value){
                this.query.convert.toLowerCase = false;
            }
            this.$forceUpdate();
        },
        toLowerCaseChange(value){
            this.query.convert.toLowerCase = value;
            if(value){
                this.query.convert.toUpperCase = false;
            }
            this.$forceUpdate();
        },

        changeUnfold(value){
            this.unfold = value
        },
        showChangeKey() {
            this.changeKey = !this.changeKey;
        },
        showAdd() {
            let newField = {
                key: "",
                type: '$eq',
                from: 'params',
                path: '',
            }
            if (!this.data.type) {
                this.data = newField;
            } else {
                for (let i=0; i<this.data.path.length; i++) {
                    if (JSON.stringify(this.data.path[i]) === JSON.stringify(newField)) {
                        return this.$message.error('您当前还有未配置的字段，请先配置')
                    }
                }
                this.data.path.push(newField)
            }
            this.$emit('addQueryField',  this.data);
        },
        cascaderSelectChange(value) {
            if (value || this.cascader_select_field.length === 0) {
                // 浮层显示，不做任何处理
                return ;
            }
            this.data.key = this.cascader_select_field.join('.');
            this.temp_key = this.cascader_select_field.join('.');
            this.changeKey = false;
        },
        keyChange() {
            this.data.key = this.temp_key;
            this.cascader_select_field = this.temp_key.split('.');
        },
        deleteField(){
            this.$emit('deleteQueryField',  this.pathIndex);
        },
        deleteQueryField(index) {
            if (Array.isArray(this.data.path)) {
                this.data.path.splice(index, 1);
            } else {
                this.data.path = '';
            }
        },
        addQueryField(value) {
            if (Array.isArray(this.data.path)) {
                this.data.path.push(value);
            } else {
                this.data = value;
            }
            this.$emit('addQueryField',  this.data);
        },
        pathChange(){
            this.data.path = this.temp_path;
        },
    },
    mounted(){
        this.temp_path = this.query.path;
    },
    watch: {
        // 监听父级query数据是否改变
        query(n){
            this.data = n;
        }
    }
};
</script>

<style scoped>
.ant-divider-horizontal.ant-divider-with-text-left::before{
    width: 1.2% !important
}
.queryField {
    padding-bottom: 3px;
}
.deleteFiled:hover {
    cursor:pointer;
}
</style>
