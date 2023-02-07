<template>
    <div>
        <a-row type="flex" justify="end">
            <a-col :span="8">
                <a-select
                :defaultValue="fetch.method"
                :options="methodOptions"
                style="width:100%"
                @change="value=>onMethodChange(value)"
                >
                </a-select>
            </a-col>
            <a-col :span="8">
                <a-select
                v-if="sourceMapObj"
                :defaultValue="['WEIGHTEDSUM'].includes(fetch.method)? fetch.path[0] : fetch.path"
                :options="sourceMapObj[lowerCapital(targetModel)]"
                @change="value=>onPathChange(value)"
                style="width:100%"
                >
                </a-select>
                <a-input
                v-else
                :defaultValue="['WEIGHTEDSUM'].includes(fetch.method)? fetch.path[0] : fetch.path"
                >
                </a-input>
            </a-col>
            <a-col :span="8">
                <a-select
                v-if="['WEIGHTEDSUM'].includes(fetch.method) && sourceMapObj"
                :defaultValue="fetch.path[1]"
                :options="sourceMapObj[lowerCapital(targetModel)]"
                @change="value=>onPath2Change(value)"
                style="width:100%"
                >
                </a-select>
                <a-input
                v-if="['WEIGHTEDSUM'].includes(fetch.method) && !sourceMapObj"
                :defaultValue="fetch.path[1]"
                >
                </a-input>
                <a-tooltip>
                    <template slot="title">
                        {{(fetch.fetch?'取消':'设置')+'数据元素来源'}}
                    </template>
                    <a-button
                    v-if="['SUM','AVERAGE','MAX','MIN','AVEDEV'].includes(fetch.method)"
                    type="primary"
                    shape="circle"
                    :icon="fetch.fetch?'up':'down'"
                    size="small"
                    @click="toggleChildFetch"
                    >
                    </a-button>
                </a-tooltip>
            </a-col>
            <a-col :span="22">
                <span v-if="fetch.fetch">
                    <fetch 
                    :fetch="fetch.fetch"
                    :sourceMapObj="sourceMapObj"
                    :targetModel="targetModel+'.'+fetch.path"
                    >
                    </fetch>
                </span>
            </a-col>
        </a-row>

    </div>
</template>

<script>

export default{
    data(){
        return{
            methodOptions:[
                {
                    label:'数字和',
                    value: 'SUM'
                },
                {
                    label:'平均值',
                    value: 'AVERAGE'
                },
                {
                    label:'最大值',
                    value: 'MAX'
                },
                {
                    label:'最小值',
                    value: 'MIN'
                },
                {
                    label:'离散度',
                    value: 'AVEDEV'
                },
                {
                    label:'加权和',
                    value: 'WEIGHTEDSUM'
                }
            ]
        }
    },
    name: 'fetch',
    props:['fetch', 'sourceMapObj', 'targetModel'],
    methods:{
        onMethodChange(value){
            let origin = this.fetch.method;
            if(['WEIGHTEDSUM'].includes(value) && !['WEIGHTEDSUM'].includes(origin)){
                this.fetch.path = [this.fetch.path,'']
            }
            if(['WEIGHTEDSUM'].includes(origin) && !['WEIGHTEDSUM'].includes(value)){
                this.fetch.path = this.fetch.path[0];
            }
            this.fetch.method = value;
            this.$forceUpdate();
        },
        onPathChange(value){
            if(['WEIGHTEDSUM'].includes(this.fetch.method)){
                this.fetch.path[0] = value;
            }else{
                this.fetch.path = value;
            }
        },
        onPath2Change(value){
            this.fetch.path[1] = value;
        },
        lowerCapital(str){
            return str.charAt(0).toLowerCase()+str.slice(1);
        },
        toggleChildFetch(){
            if(this.fetch.fetch){
                delete this.fetch.fetch;
            }else{
                this.fetch.fetch = {
                    method: '',
                    path: ''
                }
            }
            this.$forceUpdate();
        }
    },
    mounted(){
    }
}
</script>