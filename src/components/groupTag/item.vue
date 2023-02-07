<template>
  <div style="margin:10px;display:inline-block;vertical-align:top;width:100%" v-if="loading">
    <a-divider orientation="left">基础配置</a-divider>

    <a-input 
    :defaultValue="item.itemName" 
    style="margin:5px" 
    @change="e=>onItemNameChange(e.target.value)" 
    addonBefore="接口标准成员名称"
    />
    
    <a-modal title="添加标签" v-model="showAddItem" @ok="hideModal" okText="添加" cancelText="取消">
        <a-input placeholder="输入标签映射名" v-model="tempTagName"/>
        <p v-if="isTagDup()" style="color:#CC3366">标签映射名重复</p>
        <a-input placeholder="输入标签中文名称" v-model="tempDescription" style="margin-top:10px"/>
        <p v-if="isDesDup()" style="color:#EE6633">标签名称可能已存在，请检查!</p>
    </a-modal>
    选择标签:
    <a-select 
    :defaultValue="item.tag_oid" 
    show-search
    @search="fetchTags"
    filter
    :allowClear="true"
    style="margin:5px;width:500px"
    @focus="fetchTags"
    @change="changeTagid"
    :maxTagTextLength="500"
    class="selectTag"
    >   
        <div slot="dropdownRender" slot-scope="menu">
            <v-nodes :vnodes="menu" />
            <a-divider style="margin: 4px 0;" />
            <div
                style="padding: 4px 8px; cursor: pointer;"
                @mousedown="e => e.preventDefault()"
            >
                <a-button shape="round" @click="addItem" style="width:100%">添加标签</a-button>
            </div>
        </div>
        <a-select-option v-for="tag in tags" :key="tag._id" :value="tag._id" :disabled="tag.arrangement && item.itemName != tag.arrangement.itemName">
            <a-row type="flex" justify="space-between">
                <a-col :span="12">
                    {{tag.description}}    {{tag.tagName}}
                </a-col>
                <a-col :span="12">
                    <a-tag v-if="tag.arrangement">{{tag.arrangement.groupName}}->{{tag.arrangement.itemName}}</a-tag>
                </a-col>
            </a-row>
        </a-select-option>
    </a-select>

    <a-divider orientation="left">入参原型配置</a-divider>
    <dataProto :dataObj="item.params"/>

    <a-divider orientation="left" dashed>入参示例</a-divider>
    <a-textarea
    placeholder="入参示例,JSON格式" 
    :autoSize="{ minRows: 3}"
    :defaultValue="JSON.stringify(item.paramsExample,null,2)"
    @focus="e=>onParamsExampleFocus(e.target.value)"
    @blur="e=>onParamsExampleConfirm(e.target.value)"
    >
    </a-textarea>

    <a-divider orientation="left">返回原型配置</a-divider>
    <dataProto :dataObj="item.return"/>

    <a-divider orientation="left" dashed>返回示例</a-divider>
    <a-textarea
    placeholder="入参示例,JSON格式" 
    :autoSize="{ minRows: 3}"
    :defaultValue="JSON.stringify(item.returnExample,null,2)"
    @focus="e=>onReturnExampleFocus(e.target.value)"
    @blur="e=>onReturnExampleConfirm(e.target.value)"
    >
    </a-textarea>

    <a-divider dashed/>
    <a-button @click="showData">显示数据</a-button>
  </div>
</template>
<script>
    import { EventBus } from '../../lib/event-bus.js'; //全局事件总线
    import DataProto from './dataProto'

  export default {
    data() {
        return {
            loading: false,
            delConfirm: false,
            addConfirm: false,
            item:{
                tag_oid: "",
                itemName: "",
                params: {},
                paramsExample: {},
                return: {},
                returnExample: {}
            },
            tagSearch: "",
            tags: [],
            showAddItem: false,
            tempTagName: "",
            tempDescription: "",
            tempParamsExample: "",
            tempReturnExample: ""
        };
    },
    props: ['apiGroupId', 'itemId'],
    methods:{
        onReturnExampleFocus(value){
            this.tempReturnExample = value;
        },
        onReturnExampleConfirm(value){
            try{
                this.item.returnExample = JSON.parse(value)
            }catch(e){
                value = this.tempReturnExample;
            }
        },
        onParamsExampleFocus(value){
            this.tempParamsExample = value;
        },
        onParamsExampleConfirm(value){
            try{
                this.item.paramsExample = JSON.parse(value)
            }catch(e){
                value = this.tempParamsExample;
            }
        },
        isTagDup(){
            return this.tags.map(item=>item.tagName).includes(this.tempTagName);
        },
        isDesDup(){
            if(!this.tempDescription){
                return false;
            }
            let that = this;
            return this.tags.map(item=>item.description).filter(item=>{
                return new RegExp(that.tempDescription).test(item);
            }).length;
        },
        onItemNameChange(value) {
            this.item.itemName = value;
        },
        onSearchFocus(target){
            console.log(target);
        },
        fetchTags(search){
            let params = {search}
            this.instance
            .get(
            '/private/tag/search',
            {
                params
            }
            )
            .then(response => {
                this.tags = response.data.list;
                this.loading = true;
            })
            .catch(function (error) { // 请求失败处理
                console.log(error);
            });
        },
        addItem(){
            this.showAddItem = true;
        },
        hideModal(){
            if(this.isTagDup()){
                this.$message.error('标签映射名重复，无法添加!');
                return;
            }
            if(!this.tempDescription || !this.tempTagName){
                this.$message.error('请输入映射名和标签名!');
                return;
            }
            let regex = /^[a-zA-Z0-9]{1,50}$/
            if(!regex.test(this.tempTagName)){
                this.$message.error('映射名必须为50字符内的英文或数字组合');
            }else{
                this.instance
                .post(
                `/private/tag`,
                {
                    tagName: this.tempTagName,
                    description: this.tempDescription
                }
                )
                .then(response => {
                    let result = response.data;
                    if(!result.result){
                        this.$message.error(`添加标签失败: ${result.errorMessage}`);
                    }else{
                        this.$message.info('添加标签成功!');
                    }
                })
                .catch(function (error) { // 请求失败处理
                    console.log(error);
                });
            }
            
            this.tempTagName = "";
            this.tempDescription = "";
            this.showAddItem = false;
        },
        changeTagid(value){
            this.item.tag_oid = value
        },
        showData(){
            console.log(JSON.parse(JSON.stringify(this.item)));
        },
        async fetchItem(item_id){
            this.instance
            .get(
            `/private/apiGroup/item/detail?apiGroupItem_id=${item_id}`
            )
            .then(response => {
                let result = response.data;
                this.item = result.apiGroupItem;
                this.fetchTags();
            })
            .catch(function (error) { // 请求失败处理
                console.log(error);
            });
        },
        async modifyItem(){
            return this.instance
            .patch(
            `/private/apiGroup/${this.item._id}/item`,
            {
                itemName: this.item.itemName,
                tag_id: this.item.tag_oid,
                params: this.item.params,
                paramsExample: this.item.paramsExample,
                returnConfig: this.item.return,
                returnExample: this.item.returnExample
            }
            )
            .then(response => {
                let result = response.data;
                if(result.result){
                    if(result.data){
                        this.$message.info(`更新Item ${result.data.name} 成功`);
                    }
                }
            })
            .catch(function (error) { // 请求失败处理
                console.log(error);
            });
        },
        async createItem(){
            this.instance
            .post(
            `/private/apiGroup/item`,
            {
                tag_id: this.item.tag_oid,
                apiGroup_id: this.apiGroupId,
                itemName: this.item.itemName,
                params: this.item.params,
                paramsExample: this.item.paramsExample,
                returnConfig: this.item.return,
                returnExample: this.item.returnExample
            }
            )
            .then(response => {
                let result = response.data;
                if(result.result){
                    if(result.apiGroupItem){
                        this.$message.info(`新增API ${result.apiGroupItem.itemName} 成功`);
                    }
                }
            })
            .catch(function (error) { // 请求失败处理
                console.log(error);
            });
        },

    },
    components:{
        VNodes: {
            functional: true,
            render: (h, ctx) => ctx.props.vnodes 
        },
        dataProto: DataProto
    },
    created(){
        if(this.itemId){
            this.fetchItem(this.itemId);
        }else{
            this.loading = true;
        }
    },
    mounted(){
        //注册事件监听
        let that = this;
        EventBus.$off('editItemConfirm');
        EventBus.$on('editItemConfirm',async ()=>{
            if(that.itemId){
                await that.modifyItem();
            }else{
                await that.createItem();
                EventBus.$emit('itemCreated',{});
            }
        });

        console.log('item mounted!')
    }
  };

</script>
<style>
.selectTag .ant-select-selection-selected-value{
    width:100%;
}
</style>
