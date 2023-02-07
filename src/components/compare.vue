<template>
    <div>
        <a-row type="flex" justify="end">
            <a-col :span="8">
                <a-select
                :options="operators"
                :defaultValue="compare.operator"
                @change="onOperatorChange"
                style="width:100%"
                >
                </a-select>
            </a-col>
            <a-col :span="8">
                <a-input-number
                v-show="['between','betweenLeft','betweenRight','betweenBoth'].includes(compare.operator)"
                :defaultValue="compare.left||0"
                @change="e=>onLeftChange(e)"
                style="width:100%"
                >
                </a-input-number>
                <a-input-number
                v-show="!['between','betweenLeft','betweenRight','betweenBoth'].includes(compare.operator)"
                :defaultValue="compare.value||0"
                @change="e=>onValueChange(e)"
                style="width:100%"
                >
                </a-input-number>
            </a-col>
            <a-col :span="8">
                <a-input-number
                v-show="['between','betweenLeft','betweenRight','betweenBoth'].includes(compare.operator)"
                :defaultValue="compare.right||0"
                @change="e=>onRightChange(e)"
                style="width:100%"
                >
                </a-input-number>
            </a-col>
        </a-row>
        <a-divider dashed>
            <a-badge>
                <a-tooltip slot="count">
                    <template slot="title">
                        比较值 = 统计值 + 补偿值
                    </template>
                    <a-icon type="question-circle" style="color: blue"/>
                </a-tooltip>
                <a-button type="link">补偿设置</a-button>
            </a-badge>
        </a-divider>
        <a-row>
            <a-col :span="10">
                <a-input
                defaultValue="默认补偿"
                disabled
                >
                </a-input>
            </a-col>
            <a-col :span="14">
                <a-input-number
                v-if="compare.offset"
                :defaultValue="compare.offset.default||0"
                @change="e=>onDefaultOffsetChange(e)"
                style="width:100%"
                >
                </a-input-number>
            </a-col>
        </a-row>
        <a-row>
            <a-col :span="10">
                <a-input
                defaultValue="来自上下文ctx"
                disabled
                >
                </a-input>
            </a-col>
            <a-col :span="14">
                <a-input
                v-if="compare.offset"
                :defaultValue="compare.offset.fromCtx"
                @change="e=>onOffsetFromCtxChange(e.target.value)"
                style="width:100%"
                >
                </a-input>
            </a-col>
        </a-row>
        <a-row>
            <a-col :span="24">
                <fetch 
                :fetch="compare.offset.fetch"
                >
                </fetch>
            </a-col>
        </a-row>
    </div>
</template>

<script>
    import Fetch from './fetch'

    const operators = [
        {
            "value": "eq",
            "label": "="
        },
        {
            "value": "ne",
            "label": "!="
        },
        {
            "value": "lt",
            "label": "<"
        },
        {
            "value": "lte",
            "label": "<="
        },
        {
            "value": "gt",
            "label": ">"
        },
        {
            "value": "gte",
            "label": ">"
        },
        {
            "value": "between",
            "label": "<<"
        },
        {
            "value": "betweenLeft",
            "label": "<=<"
        },
        {
            "value": "betweenRight",
            "label": "<<="
        },
        {
            "value": "betweenBoth",
            "label": "<=<="
        }
    ]

    export default {
        data(){
            return {
                operators
            }
        },
        name: 'compare',
        props:['compare'],
        components:{
            fetch: Fetch
        },
        methods:{
            onOperatorChange(value){
                this.compare.operator = value;
                this.$forceUpdate();
            },
            onLeftChange(value){
                this.compare.left = Number(value);
            },
            onRightChange(value){
                this.compare.right = Number(value);
            },
            onValueChange(value){
                this.compare.value = Number(value);
            },
            onDefaultOffsetChange(value){
                this.compare.offset.default = Number(value);
            },
            onOffsetFromCtxChange(value){
                this.compare.offset.fromCtx = value;
            }
        },
        created(){

        },
        mounted(){

        }
    }
</script>