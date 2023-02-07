<template>
    <div>
        <a-tag v-for="item of list" :key="item" closable @close="()=>onItemClose(item)"
        style="margin-top:5px"
        :color="colorMap[item.origin]"
        >
            {{item.path}}
        </a-tag>
        <a-input
        style="margin-top:5px"
        v-if="fieldsItemAdd"
        ref="input"
        type="text"
        size="small"
        :value="tempItemValue"
        @change="e=>handleFieldItemChange(e.target.value)"
        @keyup.enter="handleFieldItemConfirm"
        >
            <a-select
            slot="addonAfter"
            :options="originOptions"
            @change="handleOriginChange"
            style="width:86px"
            >
            </a-select>
        </a-input>
        <a-tag v-else style="background: #fff; borderStyle: dashed;margin-top:5px" @click="showFieldsItemAdd">
            <a-icon type="plus" /> 新增路径
        </a-tag>
    </div>
</template>
<script>
    //import _ from 'lodash';
    export default {
        data() {
        return {
            colorMap:{
                "body": "pink",
                "query": "orange",
                "param": "green",
                "header": "cyan"
            },
            fieldsItemAdd: false,
            tempItemValue: "",
            tempOrigin: ""
        }
        },
        props: ['list', 'originOptions'],
        methods:{
            showFieldsItemAdd(){
                this.fieldsItemAdd = true;
            },
            handleFieldItemChange(value){
                this.tempItemValue = value;
            },
            handleOriginChange(value){
                this.tempOrigin = value;
            },
            handleFieldItemConfirm(){
                if(this.tempItemValue && this.tempOrigin){
                    this.list.push(
                        {
                            path: this.tempItemValue,
                            origin: this.tempOrigin
                        }
                    )
                    
                }else{
                    this.$message.error('路径或来源不正确,请重新输入')
                }
                this.tempItemValue = "";
                this.tempOrigin = "";
                this.fieldsItemAdd = false;
            },
            onItemClose(value){
                this.list.splice(this.list.indexOf(value),1)
            }
        },
        computed:{
        },
        mounted(){
            
        },
        beforeCreate(){
            
        },
        created(){
        },
        updated(){
        }
    };
</script>