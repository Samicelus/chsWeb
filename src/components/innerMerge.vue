<template>
    <div>
        <a-divider dashed orientation="left">{{mergeKey}}</a-divider>
        <a-input-group compact>
            <a-input
            :defaultValue="mergeKey"
            addonBefore="字段名"
            style="width: 40%"
            />
            <a-select :defaultValue="mergeOption.path" @change="value=>showValue(value, mergeOption)" style="width: 60%">
                <a-select-option v-for="(source, path) in sourceMap" :key="path" :value="path">{{source.name}}</a-select-option>
            </a-select>
        </a-input-group>
    </div>
</template>

<script>
    //import { EventBus } from '../lib/event-bus.js'; //全局事件总线
    
  export default {
    data() {
        return {
        }
    },
    props: ['mergeOption', 'mergeKey', 'sourceMap'],
    methods:{
        showValue(value, mergeOption){
            console.log(this.sourceMap[mergeOption.source][value])
        }
    },
    
    mounted(){

    }
  };
</script>