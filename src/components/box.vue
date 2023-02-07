<template>
  <div style="margin:10px;display:inline-block;vertical-align:top;width:100%" v-if="loading">
    <a-modal title="添加标签" v-model="showAddItem" @ok="hideModal" okText="添加" cancelText="取消">
        <a-input placeholder="输入标签映射名" v-model="tempTagName"/>
        <p v-if="isTagDup()" style="color:#CC3366">标签映射名重复</p>
        <a-input placeholder="输入标签中文名称" v-model="tempDescription" style="margin-top:10px"/>
        <p v-if="isDesDup()" style="color:#EE6633">标签名称可能已存在，请检查!</p>
    </a-modal>
    <span v-if="!api.tag_oid" style="color:red">*</span>
    选择标签:
    <a-select 
    :defaultValue="api.tag_oid" 
    show-search
    :allowClear="true"
    @search="fetchTags"
    filter
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
        <a-select-option v-for="tag in tags" :key="tag._id" :value="tag._id" :disabled="judgeArrangement(tag._id, tag.tagName)">
            <a-row type="flex" justify="space-between">
                <a-col :span="12">
                    {{tag.description}}    {{tag.tagName}}
                </a-col>
                <a-col :span="4" v-if="isTagArranged(tag)">
                    -->
                </a-col>
                <a-col :span="8" v-if="isTagArranged(tag)">
                    <a-tag :style="judgeArrangement(tag._id, tag.tagName)?'color:#bbb':'color:#333'">{{getArrangedApi(tag)}}</a-tag>
                </a-col>
            </a-row>
        </a-select-option>
    </a-select>

    <a-tooltip>
        <template slot="title">
            复制标签到剪贴板
        </template>
        <a-icon 
        type="copy"
        style="margin:5px;fontSize:24px"
        v-clipboard:copy="tagMap[api.tag_oid]"
        v-clipboard:success="onCopy"
        v-clipboard:error="onError"
        />
    </a-tooltip>
    <a-divider />

    <a-modal :title="api.topology.blocks[currentBlockName]?api.topology.blocks[currentBlockName].name:''" v-model="showDataBlock" :width="1280"
    @ok="editDataBlock" :okText="currentDataBlockId?'修改':'新增'" 
    cancelText="取消">
        <dataBlock v-if="showDataBlock" :blockName="currentBlockName" :blockData="currentBlockData" :blockId="currentDataBlockId" :inputData="currentInputData" :blockOption="blockOption"></dataBlock>
    </a-modal>

    <a-modal :title="api.topology.blocks[currentBlockName]?api.topology.blocks[currentBlockName].name:''" v-model="showRequestBlock" :width="1280"
    @ok="editRequestBlock" :okText="currentRequestBlockId?'修改':'新增'" 
    cancelText="取消">
        <requestBlock v-if="showRequestBlock" :blockName="currentBlockName" :blockData="currentBlockData" :blockId="currentRequestBlockId" :inputData="currentInputData" :headerData="currentHeaderData" :signData="currentSignData" :blockOption="blockOption"></requestBlock>
    </a-modal>
    <a-row>
        <a-col :span="4">
            <div style="width:112px;margin:5px">
                <a-row>
                    <a-col :span="12">
                        <a-tooltip placement="topLeft" title="添加数据节点">
                            <a-icon type="box-plot" theme="twoTone" two-tone-color="#FF1493" class="tool-button" @click="addDataBlock" />
                        </a-tooltip>
                    </a-col>
                    <a-col :span="12">
                        <a-tooltip  placement="topLeft" title="添加请求节点">
                            <a-icon type="api" theme="twoTone" two-tone-color="#00FA9A" class="tool-button" @click="addRequestBlock" />
                        </a-tooltip>
                    </a-col>
                </a-row>
            </div>
            <div style="width:112px;margin:5px">
                <a-row>
                    <a-col :span="12">
                        <a-tooltip placement="topLeft" title="编辑模式">
                            <a-icon type="edit" theme="twoTone" two-tone-color="#A0A0A0" :class="control.mode=='edit'?'mode-button-active':'mode-button-inactive'" @click="switchToEditMode" />
                        </a-tooltip>
                    </a-col>
                    <a-col :span="12">
                        <a-tooltip placement="topLeft" title="删除模式">
                            <a-icon type="delete" theme="twoTone" two-tone-color="#A0A0A0" :class="control.mode=='delete'?'mode-button-active':'mode-button-inactive'" @click="switchToDeleteMode" />
                        </a-tooltip>
                    </a-col>
                    <a-col :span="12">
                        <a-tooltip  placement="topLeft" title="设为返回">
                            <a-icon type="export" color="#A0A0A0" :class="control.mode=='end'?'mode-button-active':'mode-button-inactive'" @click="switchToEndMode" />
                        </a-tooltip>
                    </a-col>
                </a-row>
                <a-row>
                </a-row>
            </div>
        </a-col>
        <a-col :span="20">
            <topology :dataObj="api.topology" :mode="control.mode"></topology>
        </a-col>
    </a-row>
    <a-divider />
    <a-button @click="showData">显示数据</a-button>
  </div>
</template>
<script>
    import { EventBus } from '../lib/event-bus.js'; //全局事件总线
    import Topology from './topology';
    import DataBlock from './blocks/dataBlock';
    import RequestBlock from './blocks/requestBlock';
    import _ from 'lodash';

  export default {
    data() {
        return {
            showAddItem: false,
            loading: false,
            delConfirm: false,
            tempDelKey: "",
            addConfirm: false,
            tempAddKey: "",
            tempCacheKey: "",
            tempData: "",
            currentBlockName: "",
            currentDataBlockId: "",
            currentBlockData: {},
            currentRequestBlockId: "",
            currentInputData: [],
            currentHeaderData: [],
            currentSignData: [],
            showDataBlock: false,
            showRequestBlock: false,
            api:{
                topology:{
                    blocks:{
                    }
                }
            },
            tags: [],
            tagMap: {},
            tempTagName: "",
            tempDescription: "",
            control: {
                mode: 'edit'
            }
        };
    },
    props: ['appId', 'apiId', 'apis'],
    methods:{
        addDataBlock(){
            this.currentBlockData = {
                return: {}
            };
            this.currentDataBlockId = "";
            this.currentInputData = [];
            this.currentBlockName = "";
            this.showDataBlock = true;
        },
        addRequestBlock(){
            this.currentBlockData = {
            };
            this.currentRequestBlockId = "";
            this.currentInputData = [];
            this.currentHeaderData = [];
            this.currentSignData = [];
            this.currentBlockName = "";
            this.showRequestBlock = true;
        },
        switchToEditMode(){
            this.control.mode = 'edit';
        },
        switchToDeleteMode(){
            this.control.mode = 'delete';
        },
        switchToEndMode(){
            this.control.mode = 'end';
        },
        async updateBox(){
            return this.v2Instance
            .patch(
            `/private/${this.apiId}/box`,
            {
                box: this.api
            }
            )
            .then(response => {
                let result = response.data;
                this.api = result.box;
                this.fetchTags();
            })
            .catch(function (error) { // 请求失败处理
                console.log(error);
            });
        },
        editDataBlock(){
            this.showDataBlock = false;
            EventBus.$emit('editDataBlockConfirm');
        },
        editRequestBlock(){
            this.showRequestBlock = false;
            EventBus.$emit('editRequestBlockConfirm');
        },
        onCopy(){
            if(this.api.tag_oid){
                this.$message.info('标签已成功复制到剪切板');
            }else{
                this.$message.error('未选择标签');
            }
        },
        onError(){
            this.$message.error('复制标签发送错误！');
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
        addJoinConfig(index){
            if(!this.api.dataSource[index].joins){
                this.api.dataSource[index].joins = [];
            }
            this.api.dataSource[index].joins.push({
                joinType: "None"
            });
            this.$forceUpdate();
        },
        deleteJoinConfig(index, jIndex){
            this.api.dataSource[index].joins.splice(jIndex, 1);
            this.$forceUpdate();
        },
        fetchTags(search){
            let params = {search}
            this.instance
            .get(
            '/public/tag/search',
            {
                params
            }
            )
            .then(response => {
                this.tags = response.data.list;
                let that = this;
                this.tagMap = {};
                response.data.list.map(item=>{
                    that.tagMap[item._id] = item.tagName;
                })
                this.loading = true;
            })
            .catch(function (error) { // 请求失败处理
                console.log(error);
            });
        },
        addItem(){
            this.showAddItem = true;
        },
        judgeArrangement(tag_id, tagName){
            let arrangedTags = this.apis.filter(item=>item.tag_oid).map(item=>item.tag_oid.tagName);
            return (arrangedTags.includes(tagName) && (this.api.tag_oid != tag_id))
        },
        isTagArranged(tag){
            let arrangedTags = this.apis.filter(item=>item.tag_oid).map(item=>item.tag_oid.tagName);
            return arrangedTags.includes(tag.tagName);
        },
        getArrangedApi(tag){
            let arrangedMap = _.groupBy(this.apis.filter(item=>item.tag_oid), 'tag_oid._id');
            return arrangedMap[tag._id]? arrangedMap[tag._id][0].name:"";
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
                `/public/tag`,
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
            this.api.tag_oid = value;
            this.$forceUpdate();
        },
        async fetchApi(box_id){
            return this.v2Instance
            .get(
            `/private/boxDetail?box_id=${box_id}`
            )
            .then(response => {
                let result = response.data;
                this.api = result.box;
                this.fetchTags();
                EventBus.$emit('redrawCharts', this.api.topology);
            })
            .catch(function (error) { // 请求失败处理
                console.log(error);
            });
        },
        showData(){
            console.log(this.api)
        },
        async modifyApi(){
            let that = this;
            if(!this.api.app_oid){
                this.api.app_oid = this.appId;
            }
            return this.instance
            .post(
            `/private/consultModulation/apiConfig/update`,
            {
                api_id:this.api_id,
                api:this.api
            }
            )
            .then(response => {
                let result = response.data;
                if(result.result){
                    if(result.data){
                        this.$message.info(`更新API ${result.data.name} 成功`);
                    }
                }else{
                    this.$message.error(`更新API失败：${result.error}`);
                }
            })
            .catch(function (error) { // 请求失败处理
                that.$message.error(`更新API失败: ${error}`);
            });
        },
        async createApi(){
            return this.instance
            .post(
            `/private/consultModulation/apiConfig`,
            {
                app_id:this.appId,
                api:this.api
            }
            )
            .then(response => {
                let result = response.data;
                if(result.result){
                    if(result.data){
                        this.$message.info(`新增API ${result.data.name} 成功`);
                    }
                }
            })
            .catch(function (error) { // 请求失败处理
                console.log(error);
            });
        },
        async modifyDataBlock(){
            
        },
        async deleteBlock(block_id){
            for(let blockId in this.api.topology.blocks){
                let blockConfig = this.api.topology.blocks[blockId];
                dispatchBlockFromInput(blockConfig, block_id)
            }
            delete this.api.topology.blocks[block_id];
            EventBus.$emit('redrawCharts', this.api.topology);
        },
    },
    computed:{
        blockOption: function(){
            console.log('compute blockOptions!');
            let that = this;
            let blockIds = Object.keys(this.api.topology.blocks);
            let notSelfBlockOption = blockIds.filter(item=>item!=this.currentBlockName).map(item=>{
                return {
                    value: item,
                    label: that.api.topology.blocks[item].name
                }
            })
            notSelfBlockOption.push({
                value: 'params',
                label: '调用入参'
            })
            return notSelfBlockOption
        }
    },
    components:{
        VNodes: {
            functional: true,
            render: (h, ctx) => ctx.props.vnodes 
        },
        topology: Topology,
        dataBlock: DataBlock,
        requestBlock: RequestBlock
    },
    created(){
        this.api_id = this.apiId;
        if(this.apiId){
            this.fetchApi(this.apiId);
        }else{
            this.fetchTags();
        }
    },
    mounted(){
        //注册事件监听
        let that = this;
        EventBus.$off('editBoxConfirm');
        EventBus.$on('editBoxConfirm',async ()=>{
            console.log(that.apiId, that.api);
            if(that.apiId){
                await that.updateBox();
                EventBus.$emit('apiCreated',{});
            }else{
                // await that.createApi();
                // EventBus.$emit('apiCreated',{});
            }
        });
        EventBus.$off('changeBlocksInput');
        EventBus.$on('changeBlocksInput',({blockName, inputName, value})=>{
            console.log(blockName, inputName, value);
            that.currentInputData = value;
            if(blockName){
                that.api.topology.blocks[blockName][inputName] = value;
                EventBus.$emit('redrawCharts', that.api.topology);
            }
        });
        EventBus.$off('editDataBlock');
        EventBus.$on('editDataBlock',({blockName, block_id, inputData, blockData})=>{
            that.currentBlockName = blockName;
            that.currentDataBlockId = block_id;
            that.currentInputData = inputData;
            that.currentBlockData = blockData;
            that.showDataBlock = true;
        });
        EventBus.$off('editRequestBlock');
        EventBus.$on('editRequestBlock',({blockName, block_id, inputData, headerData, signData, blockData})=>{
            console.log(inputData, headerData, signData);
            that.currentBlockName = blockName;
            that.currentRequestBlockId = block_id;
            that.currentInputData = inputData;
            that.currentHeaderData = headerData;
            that.currentSignData = signData;
            that.currentBlockData = blockData;
            that.showRequestBlock = true;
        });
        EventBus.$off('deleteBlock');
        EventBus.$on('deleteBlock',(block_id)=>{
            that.deleteBlock(block_id)
        });
        EventBus.$off('updateBlock');
        EventBus.$on('updateBlock',({block_id, blockConfig})=>{
            that.api.topology.blocks[block_id].blockConfig = blockConfig;
            EventBus.$emit('redrawCharts', that.api.topology);
        });
        EventBus.$off('createDataBlock');
        EventBus.$on('createDataBlock',({block_id, name, inputData, blockConfig})=>{
            that.api.topology.blocks[block_id] = {
                name,
                block_oid: block_id,
                inputData,
                type: 'data',
                blockConfig
            };
            that.currentBlockName = name;
            EventBus.$emit('redrawCharts', that.api.topology);
        });
        EventBus.$off('createRequestBlock');
        EventBus.$on('createRequestBlock',({block_id, name, inputData, headerData, signData, blockConfig})=>{
            that.api.topology.blocks[block_id] = {
                name,
                block_oid: block_id,
                inputData,
                headerData,
                signData,
                type: 'request',
                blockConfig
            };
            that.currentBlockName = name;
            EventBus.$emit('redrawCharts', that.api.topology);
        });
    }
  };

    function dispatchBlockFromInput(blockConfig, block_id){
        switch(blockConfig.type){
            case "data":
                _.pull(blockConfig.inputData, block_id);
                break;
            case "request":
                _.pull(blockConfig.inputData, block_id);
                _.pull(blockConfig.headerData, block_id);
                _.pull(blockConfig.signData, block_id);
                break;
            default:
                break;
        }
    }

</script>

<style>
.tool-button{
    width: 56px;
    height: 56px;
    font-size:36px;
    border:2px outset;
    border-radius: 5px;
    line-height:1.5
}
.tool-button:hover{
    width: 56px;
    height: 56px;
    font-size:36px;
    border:2px inset;
    background-color: rgba(100,100,100, 0.2);
    border-radius: 5px;
    line-height:1.5
}
.mode-button-inactive{
    width: 56px;
    height: 56px;
    font-size:36px;
    border:2px outset;
    border-radius: 5px;
    line-height:1.5
}
.mode-button-active{
    width: 56px;
    height: 56px;
    font-size:36px;
    border:2px inset;
    background-color: rgba(100,100,100, 0.2);
    border-radius: 5px;
    line-height:1.5
}
</style>
