<template>
    <div>
        <a-row>
        <a-col :span="8">
        <a-input defaultValue="判断方式" disabled></a-input>
        </a-col>
        <a-col :span="16">
            <a-select
            :defaultValue="condition.conditionType"
            :options="conditionOptions"
            style="width:100%"
            @change="value=>onConditionChange(value)"
            >
            </a-select>
        </a-col>
        </a-row>
        <div>
            <a-row>
                <a-divider 
                v-if="['statistic','hasDoc'].includes(condition.conditionType)"
                orientation="left" 
                dashed>数据设置：</a-divider>
                <a-col :span="9">
                    <a-select
                    :defaultValue="condition.targetModel"
                    :options="docOptions"
                    style="width:100%"
                    v-if="['statistic','hasDoc'].includes(condition.conditionType)"
                    @change="value=>onModelChange(value)"
                    >
                    </a-select>
                    <a-select
                    :defaultValue="condition.targetElement"
                    :options="elementOptions"
                    style="width:100%"
                    v-if="['keyEval','hasKey'].includes(condition.conditionType)"
                    @change="value=>onElementChange(value)"
                    >
                    </a-select>
                </a-col>
                <a-col :span="15">

                    <a-select
                    :defaultValue="condition.elementKey"
                    :options="sourceMapObj[condition.targetElement]"
                    style="width:100%"
                    v-if="['keyEval','hasKey'].includes(condition.conditionType)"
                    @change="value=>onElementKeyChange(value)"
                    >
                    </a-select>

                    <div v-if="['statistic','hasDoc'].includes(condition.conditionType)">
                    
                    <div v-for="(population, pIndex) in condition.populate" :key="population"
                    style="margin-left:10px;margin-bottom:5px"
                    >
                        <a-button
                        type="danger"
                        size="small"
                        shape="circle"
                        icon="close"
                        @click="e=>deletePopulate(pIndex)"
                        ghost
                        >
                        </a-button>
                        <a-cascader
                        :options="docCascader[condition.targetModel]"
                        :allowClear="false"
                        changeOnSelect
                        expandTrigger="hover"
                        @change="value=>changePopulation(value, pIndex)"
                        :default-value="population.split(' ')"
                        style="margin-left:5px;width:80%"
                        />
                    </div>
                    <div style="margin-left:10px;margin-top:15px">
                        <a-button
                        type="primary" 
                        size="small"
                        shape="round"
                        icon="link"
                        v-if="!condition.addPopulation"
                        @click="e=>showPopulations()"
                        >添加数据关联</a-button>
                        <a-cascader
                        v-else
                        :options="docCascader[condition.targetModel]"
                        changeOnSelect
                        :allowClear="false"
                        expandTrigger="hover"
                        @change="value=>addPopulation(value)"
                        @blur="e=>cancelAddPopulation()"
                        style="margin-left:5px"
                        />
                    </div>
                    </div>
                </a-col>
            </a-row>
            <a-row>
                <a-col :span="24">
                    <a-row v-if="['hasDoc'].includes(condition.conditionType)">
                        <a-col :span="24">
                            <a-divider orientation="left">特殊过滤条件</a-divider>
                        </a-col>
                        <a-col :span="24">
                            <a-select
                            mode="multiple"
                            :default-value="lodash.map(lodash.toPairs(condition.extra),JSON.stringify)"
                            :options="extraMapObj[condition.targetModel]"
                            @change="value=>onExtraChange(value)"
                            style="width:100%"
                            >
                            </a-select>
                        </a-col>
                        <a-col :span="24">
                            <a-textarea
                            :value="JSON.stringify(condition.extra,null,4)"
                            disabled
                            >
                            </a-textarea>
                        </a-col>
                    </a-row>
                    <a-input
                    v-if="['keyEval'].includes(condition.conditionType)"
                    :defaultValue="JSON.stringify(condition.elementEval)"
                    addonBefore="判断值"
                    @focus="onBeginEval"
                    @blur="e=>onElementEvalChange(e.target.value)"
                    @keyup.enter="e=>onElementEvalChange(e.target.value)"
                    >
                    </a-input>
                    <a-divider 
                    v-if="condition.conditionType === 'statistic'"
                    orientation="left"
                    dashed
                    >统计方式：
                    </a-divider>
                    <fetch 
                    v-if="condition.conditionType === 'statistic'"
                    :fetch="condition.fetch"
                    :sourceMapObj="sourceMapObj"
                    :targetModel="condition.targetModel"
                    >
                    </fetch>
                </a-col>
            </a-row>
            <a-row>
                <a-col :span="24">
                    <a-divider 
                    v-if="condition.conditionType === 'statistic'"
                    orientation="left"
                    dashed
                    >比较方式：
                    </a-divider>
                    <compare
                    v-if="condition.conditionType === 'statistic'"
                    :compare="condition.compare"
                    >
                    </compare>

                    <a-divider 
                    v-if="condition.conditionType === 'apiValidate'"
                    orientation="left"
                    dashed
                    >比较方式：
                    </a-divider>
                    <a-select
                    v-if="condition.conditionType === 'apiValidate'"
                    :options="apiNames"
                    :defaultValue="condition.service"
                    style="width:100%"
                    >
                    </a-select>
                </a-col>
            </a-row>
        </div>
        <a-divider />
    </div>
</template>

<script>
    import Fetch from './fetch'
    import Compare from './compare'
    import lodash from 'lodash'

    export default{
        data(){
            return {
                tempEval: "",
                lodash
            }
        },
        props:['condition','docCascader','conditionOptions','docOptions','elementOptions','sourceMapObj','extraMapObj','apiNames'],
        components:{
            fetch: Fetch,
            compare: Compare
        },
        methods:{
            onConditionChange(value){
                switch(value){
                    case 'statistic':
                        this.condition.fetch = {
                            method: '',
                            path: ''
                        };
                        break;
                    default:
                        break;
                }
                this.condition.conditionType = value;
                this.$forceUpdate();
            },
            onModelChange(value){
                this.condition.targetModel = value;
            },
            onElementChange(value){
                this.condition.targetElement = value;
            },
            onElementKeyChange(value){
                this.condition.elementKey = value;
            },
            deletePopulate(pIndex){
                this.condition.populate.splice(pIndex,1);
                this.$forceUpdate();
            },
            changePopulation(value, pIndex){
                if(!this.condition.populate.includes(value.join(' '))){
                    this.condition.populate.splice(pIndex,1,value.join(' '));
                }
                this.$forceUpdate();
            },
            showPopulations(){
                this.condition.addPopulation = true;
                this.$forceUpdate();
            },
            addPopulation(value){
                if(!this.condition.populate){
                    this.condition.populate = [];
                }
                if(!this.condition.populate.includes(value.join(' '))){
                    this.condition.populate.push(value.join(' '));
                }
                this.condition.addPopulation = false;
                this.$forceUpdate();
            },
            cancelAddPopulation(){
                this.condition.addPopulation = false;
                this.$forceUpdate();
            },
            onBeginEval(){
                this.tempEval = this.condition.elementEval;
            },
            onExtraChange(value){
                this.condition.extra = this.lodash.fromPairs(this.lodash.map(value,JSON.parse));
            },
            onElementEvalChange(value){
                try{
                    this.condition.elementEval = JSON.parse(value);
                }catch(e){
                    this.$message.error(e.message);
                }
                
            }
        },
        mounted(){
            //console.log(this.extraMapObj);
        }
    }
</script>