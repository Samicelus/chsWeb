<template>
    <div>
        <div v-if="hasUpperPath">
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
                    <a-divider dashed>输入</a-divider>
                    <a-select 
                    mode="tags"
                    :defaultValue="inputData"
                    @change="value=>onInputChange(value, 'inputData')"
                    :options="blockOption"
                    style="width:100%"
                    >
                    </a-select>
                </a-col>
            </a-row>
            <a-divider orientation="left">数据组合</a-divider>
        </div>
        <div v-for="(param, key) in data" :key="param.key">
        <a-divider orientation="left" dashed>
            {{param.key||key}}
            <a-input
            style="border-color:rgba(0,0,0,0.2);border-style:dashed;width:120px"
            :defaultValue="param.description"
            @change="e=>onDescriptionChange(e.target.value, key)"
            >
            </a-input>
        </a-divider>
                <a-row type="flex" justify="end">
                    <a-col :span="1">
                        <a-button size="small" shape="circle" icon="close" @click="e=>deleteParam(key)"></a-button>
                    </a-col>

                    <!-- 来源设置 -->
                    <a-col :span="5">
                        <a-input value="来源" disabled style="width:22%"></a-input>
                        <a-select
                        :defaultValue="param.from || 'result'"
                        :options="fromOptions"
                        @change="value=>onFromChange(value, key)"
                        style="width:75%"
                        >
                        </a-select>
                    </a-col>

                    <!-- dataSource的source设置,或system的method设置 -->
                    <a-col :span="3">
                        <a-input 
                        :defaultValue="param.value"
                        v-if="param.from == 'value'"
                        @change="e=>onValueChange(e.target.value, key)"
                        addonBefore="固定值"
                        >
                        </a-input>
                        <a-switch
                        :defaultChecked="param.temp"
                        checked-children="临时"
                        un-checked-children="非临时"
                        @change="value=>onTempChange(value, key)"
                        >
                        </a-switch>
                    </a-col>

                    <!-- 路径 -->
                    <a-col :span="6">
                        <a-input
                        v-if="!['system','value'].includes(param.from)"
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
                    </a-col>

                    <!-- 字段转化 -->
                    <a-col :span="9">
                        <a-row>
                            <a-col :span="6">
                                <a-checkbox :defaultChecked="!!param.convert" @change="e=>convertChange(e.target.checked, key)" style="margin:5px">
                                    洗数据
                                </a-checkbox>
                            </a-col>
                            <a-col :span="18">
                                <span v-if="param.convert">
                                    <a-select
                                    :defaultValue="param.convert.type"
                                    :options="typeOptions"
                                    @change="value=>onTypeChange(value, key)"
                                    style="width:50%"
                                    >
                                    </a-select>
                                </span>
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
                            </a-col>
                            <a-col :span="14" style="margin-top:5px">
                                <span v-if="param.convert && (param.convert.type == 'String' || (['Object', 'Array'].includes(param.convert.type) && (param.convert.parse||param.convert.fromXml)))">
                                    <a-checkbox 
                                    :defaultChecked="!!param.convert.decrypt" @change="e=>decryptChange(e.target.checked, key)" style="margin:5px">
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
                                    :options="codingOptions"
                                    @change="value=>onCodingChange(value, key)"
                                    style="width:100%"
                                    >
                                    </a-select>
                                    <a-divider v-if="param.convert.decrypt"/>
                                    <a-select
                                    v-if="param.convert.decrypt"
                                    placeholder="密钥配置"
                                    :defaultValue="param.convert.decryptSecret"
                                    :options="customizeConfig"
                                    @change="value=>onDecryptSecretChange(value, key)"
                                    style="width:100%"
                                    >
                                    </a-select>
                                </span>
                                <span v-if="param.convert && param.convert.type == 'String'">
                                    <a-input placeholder="默认转化值" :defaultValue="param.convert.default" addonBefore="默认" @change="e=>onDefaultStringChange(e.target.value, key)"></a-input>
                                </span>
                                <span v-if="param.convert && param.convert.type == 'Boolean'">
                                    <a-select
                                    :defaultValue="param.convert.default.toString()"
                                    :options="booleanOptions"
                                    @change="value=>onBooleanDefaultChange(value, key)"
                                    />
                                </span>
                                <span v-if="param.convert && param.convert.type == 'Number'">
                                    <a-input-number
                                    :defaultValue="param.convert.default"
                                    >
                                    </a-input-number>
                                </span>
                                
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
                                     <a-tooltip>
                                        <template slot="title">
                                        打开后, 组合的对象将被字符串化
                                        </template>
                                        <a-switch
                                        checked-children="转化成字符串"
                                        un-checked-children="不转化成字符串"
                                        :defaultChecked="param.convert.stringify" 
                                        @change="value=>onStringifyChange(value, key)" 
                                        style="margin:5px"
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
                                        style="margin:5px"
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
                                        style="margin:5px"
                                        >
                                        </a-switch>
                                    </a-tooltip>
                                </span>
                                <span v-if="param.convert && (param.convert.type == 'String' || (['Object', 'Array'].includes(param.convert.type) && param.convert.toXml))">
                                    <a-checkbox 
                                    :defaultChecked="!!param.convert.encrypt" @change="e=>encryptChange(e.target.checked, key)" style="margin:5px">
                                        加密数据
                                    </a-checkbox>
                                    <a-divider v-if="param.convert.encrypt"/>
                                    <a-select
                                    v-if="param.convert.encrypt"
                                    placeholder="加密算法"
                                    :defaultValue="param.convert.encryptMethod"
                                    :options="cryptoMethodOptions"
                                    @change="value=>onEncryptMethodChange(value, key)"
                                    style="width:100%"
                                    >
                                    </a-select>
                                    <a-divider v-if="param.convert.encrypt"/>
                                    <a-select
                                    v-if="param.convert.encrypt"
                                    placeholder="编码"
                                    :defaultValue="param.convert.coding"
                                    :options="codingOptions"
                                    @change="value=>onCodingChange(value, key)"
                                    style="width:100%"
                                    >
                                    </a-select>
                                    <a-divider v-if="param.convert.encrypt"/>
                                    <a-select
                                    v-if="param.convert.encrypt"
                                    placeholder="密钥配置"
                                    :defaultValue="param.convert.encryptSecret"
                                    :options="customizeConfig"
                                    @change="value=>onEncryptSecretChange(value, key)"
                                    style="width:100%"
                                    >
                                    </a-select>
                                </span>
                            </a-col>
                        </a-row>
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
                    </a-col>

                    <!-- 递归return -->
                    <a-col :span="22">
                        <span v-if="param.convert && (param.convert.type == 'Object' || param.convert.itemType == 'Object')">
                            <dataBlock v-if="param.convert.return" :dataObj="param.convert.return" :inputData="inputData" :upperPath="param.source+'.'+param.path"/>
                        </span>
                    </a-col>
                </a-row>
        </div>
        <div style="margin-top:10px">
            <a-button v-if="inputParam" type="primary" size="small" shape="round" icon="setting" @click="showInput">添加字段</a-button>
            <a-input v-else @change="e=>onParamChange(e.target.value)" @keyup.enter="addParam"/>
        </div>
        <a-button @click="showData" v-if="block_id" style="margin-top:10px">显示数据</a-button>
    </div>
</template>

<script>
    import { EventBus } from '../../lib/event-bus.js'; //全局事件总线
    import mongoose from 'mongoose';

  export default {
    data() {
        return {
            block_id: '',
            newBlockName: '',
            hasUpperPath: false,
            inputParam: true,
            tempParam: '',
            tempPath: '',
            data: {
            },
            desensitizationOptions: [
                {
                    label: '手机号',
                    value: 'phone'
                },
                {
                    label: '身份证号',
                    value: 'idCard'
                },
                {
                    label: '护照号',
                    value: 'passport'
                },
                {
                    label: '全部',
                    value: 'whole'
                },
                {
                    label: '无',
                    value: ''
                }
            ],
            cryptoMethodOptions: [
                {
                    label: 'AES-128-ECB',
                    value: 'aes-128-ecb'
                },
                {
                    label: 'AES-192-CBC',
                    value: 'aes-192-cbc'
                }
            ],
            codingOptions: [
                {
                    label: 'HEX',
                    value: 'hex'
                },
                {
                    label: 'BASE64',
                    value: 'base64'
                }
            ],
            fromOptions: [
                {
                    label: '输入',
                    value: 'result'
                },
                {
                    label: '固定值',
                    value: 'value'
                },
                {
                    label: '现有配置数据',
                    value: 'return'
                }
            ],
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
                    value: "true"
                },
                {
                    label: "假",
                    value: "false"
                }
            ],
            tempCondition: "",
        }
    },
    name: 'dataBlock',
    props: ['blockName', 'blockData', 'blockId', 'inputData' ,'upperPath', 'dataObj', 'blockOption'],
    methods:{
        onNewNameChange(value){
            this.newBlockName = value;
        },
        onInputChange(value, inputName){
            EventBus.$emit('changeBlocksInput',{
                blockName: this.blockName,
                inputName,
                value
            })
        },
        showData(){
            console.log(JSON.parse(JSON.stringify(this.data)));
        },
        fetchBlockData(){
            this.data = this.blockData.return;
        },
        updateBlockData(){
            EventBus.$emit('updateBlock', {block_id:this.block_id, blockConfig:{_id:this.block_id, return: this.data}});
        },
        createBlockData(){
            let block_id = mongoose.Types.ObjectId().toString();
            EventBus.$emit('createDataBlock', {
                block_id, 
                name: this.newBlockName,
                inputData: this.inputData,
                blockConfig:{
                    _id:block_id, 
                    return: this.data
                }
            });
        },
        lowerCapital(str){
            return str.charAt(0).toLowerCase()+str.slice(1);
        },
        onDescriptionChange(value, key){
            this.data[key].description = value;
            this.$forceUpdate();
        },
        onFromChange(value, key){
            this.data[key].from = value;
        },
        onValueChange(value, key){
            this.data[key].value = value;
        },
        onTempChange(value, key){
            this.data[key].temp = value;
        },
        onPathChange(value, key){
            this.data[key].path = value;
        },
        onDesensitizationChange(value, key){
            this.data[key].desensitization = value;
        },
        showInput(){
            console.log(`show input`);
            this.inputParam = false;
        },
        onParamChange(value){
            this.tempParam = value;
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
        decryptChange(value, key){
            this.data[key].convert.decrypt = value;
            this.$forceUpdate();
        },
        encryptChange(value, key){
            this.data[key].convert.encrypt = value;
            this.$forceUpdate();
        },
        onDecryptMethodChange(value, key){
            this.data[key].convert.decryptMethod = value;
        },
        onEncryptMethodChange(value, key){
            this.data[key].convert.encryptMethod = value;
        },
        onCodingChange(value, key){
            this.data[key].convert.coding = value;
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
            enumCase.value = Boolean(value);
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
        if(this.dataObj){
            this.data = this.dataObj;
        }else if(this.blockId){
            this.block_id = this.blockId;
            this.fetchBlockData(this.block_id);
        }
        this.hasUpperPath = !this.upperPath;
    },
    mounted(){
        let that = this;
        if(!this.upperPath){
            EventBus.$off('editDataBlockConfirm');
            EventBus.$on('editDataBlockConfirm',async ()=>{
                if(that.blockId){
                    await that.updateBlockData();
                }else{
                    await that.createBlockData();
                }
            });
        }
    }
  };
</script>