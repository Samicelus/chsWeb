<template>
    <div>
        <!-- TODO:目前尚不支持二维数组 -->
        <div v-for="(param, key) in data" :key="param.key">
        <a-divider orientation="left" dashed>{{param.key||key}}</a-divider>
            <a-row type="flex" justify="end">
                <a-col :span="1">
                    <a-button size="small" shape="circle" icon="close" @click="e=>deleteParam(key)"></a-button>
                </a-col>

                <a-col :span="6">
                    <a-row>
                        <a-col :span="8">
                            <a-checkbox
                            :defaultChecked="param.required"
                            @change="e=>onRequiredChange(e.target.checked, key)"
                            >
                                是否必须
                            </a-checkbox>
                        </a-col>
                        <a-col :span="16">
                            <a-input
                            addonBefore="描述"
                            v-model="param.description">
                            </a-input>
                        </a-col>
                    </a-row>
                </a-col>

                <!-- 字段类型 -->
                <a-col :span="17">
                    <a-divider orientation="left" dashed>字段类型</a-divider>
                    <a-row>
                        <a-col :span="12">
                            <a-select
                            :defaultValue="param.type"
                            :options="typeOptions"
                            @change="value=>onTypeChange(value, key)">
                            </a-select>
                        </a-col>
                        <a-col :span="12">
                            <span v-if="param.type == 'array'">
                                <a-divider orientation="left" dashed>元素类型</a-divider>
                                <a-select
                                :defaultValue="param.itemType"
                                :options="typeOptions"
                                @change="value=>onItemTypeChange(value, key)"
                                />
                            </span>
                            <span v-if="param.type == 'enum'">
                                <a-divider orientation="left" dashed>枚举</a-divider>
                                <a-input
                                addonBefore="枚举值"
                                :defaultValue="JSON.stringify(param.values)"
                                @blur="e=>onEnumChange(e.target.value, key)"
                                @keyup.enter="e=>onEnumChange(e.target.value, key)"
                                />
                            </span>
                        </a-col>
                    </a-row>
                </a-col>

                <!-- 递归return -->
                <a-col :span="22">
                    <span v-if="param.rule && (param.type == 'object' || param.itemType == 'object')">
                        <dataProto v-if="param.rule" :dataObj="param.rule" />
                    </span>
                </a-col>
            </a-row>
        </div>
        <div style="margin-top:10px">
            <a-button v-if="inputParam" type="primary" size="small" shape="round" icon="setting" @click="showInput">添加字段</a-button>
            <a-input v-else @change="e=>onParamChange(e.target.value)" @keyup.enter="addParam"/>
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
            typeOptions: [
                {
                    label: '字符串',
                    value: 'string'
                },
                {
                    label: '数字',
                    value: 'int'
                },
                {
                    label: '布尔值',
                    value: 'boolean'
                },
                {
                    label: '数组',
                    value: 'array'
                },
                {
                    label: '对象',
                    value: 'object'
                },
                {
                    label: '枚举',
                    value: 'enum'
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
            tempCondition: ""
        }
    },
    name: 'dataProto',
    props: ['dataObj'],
    methods:{
        showInput(){
            console.log(`show input`);
            this.inputParam = false;
        },
        onParamChange(value){
            this.tempParam = value;
        },
        onRequiredChange(value, key){
            console.log(value);
            this.data[key].required = value;
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
                            type: 'string',
                            required: true
                        }
                    }
                }else{
                    this.data[this.tempParam] = {
                        type: "string",
                        required: true
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
        onTypeChange(value, key){
            this.data[key].type = value;
            if(value === "array"){
                if(!this.data[key].itemType){
                    this.data[key].itemType = "string"
                }
            }else{
                delete this.data[key].itemType;
            }
            if(value === "object" && !this.data[key].rule){
                this.data[key].rule = {};
            }
            this.$forceUpdate();
        },
        onItemTypeChange(value, key){
            this.data[key].itemType = value;
            if(value === "object" && !this.data[key].rule){
                this.data[key].rule = {};
            }
            this.$forceUpdate();
        },
        onEnumChange(value, key){
            try{
                this.data[key].values = JSON.parse(value);
            }catch(e){
                this.$message.error(`枚举值设置必须为有效的数组`)
            }
        }
    },
    created(){
    },
    mounted(){
        this.data = this.dataObj;
    }
  };
</script>