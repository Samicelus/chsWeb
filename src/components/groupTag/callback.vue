<template>
    <div style="margin:10px;display:inline-block;vertical-align:top;width:100%">
        <a-row>
            <a-col :span="24">
                <a-input
                addonBefore="回调名称"
                v-model="callbackConfig.name"
                >
                </a-input>
            </a-col>
        </a-row>
        <a-divider dashed/>
        <a-row>
            <a-col :span="24">
                <a-input
                addonBefore="回调地址"
                v-model="callbackConfig.callbackUrl"
                >
                </a-input>
            </a-col>
        </a-row>
        <a-divider dashed/>
        <a-row>
            <a-col :span="24">
                <a-input
                addonBefore="回调Tag"
                v-model="callbackConfig.callbackTag"
                >
                </a-input>
            </a-col>
        </a-row>
    </div>
</template>

<script>
    import { EventBus } from '../../lib/event-bus.js'; //全局事件总线

    export default {
        data(){
            return {
                item_id:"",
                callbackConfig: {
                    name: "",
                    callbackUrl: "",
                    callbackTag: ""
                }
            };
        },
        props: ['apiTemplateId', 'itemId'],
        methods:{
            fetchCallbackTemplate(item_id){
                return this.instance
                .get(
                `/private/apiGroup/apiTemplate/item/detail?apiTemplateItem_id=${item_id}`
                )
                .then(response => {
                    let result = response.data;
                    this.callbackConfig = result.apiTemplateItem;
                })
                .catch(function (error) { // 请求失败处理
                    console.log(error);
                });
            },
            modifyItem(){

            },
            createItem(){
                this.instance
                .post(
                `/private/apiGroup/apiTemplate/callbackItem`,
                {
                    apiTemplate_id: this.apiTemplateId,
                    item: this.callbackConfig
                }
                )
                .then(response => {
                    let result = response.data;
                    if(result.result){
                        if(result.apiTemplateCallbackItem){
                            this.$message.info(`新增回调模板 ${result.apiTemplateCallbackItem.callbackTag} 成功`);
                        }
                    }
                })
                .catch(function (error) { // 请求失败处理
                    console.log(error);
                });
            }
        },
        created(){
            this.item_id = this.itemId;
            if(this.itemId){
                this.fetchCallbackTemplate(this.itemId);
            }
        },
        mounted(){
            //注册事件监听
            let that = this;
            EventBus.$off('editCallbackTemplateConfirm');
            EventBus.$on('editCallbackTemplateConfirm',async ()=>{
                if(that.itemId){
                    await that.modifyItem();
                }else{
                    await that.createItem();
                    EventBus.$emit('itemCreated',{});
                }
            });
        }
    }
</script>