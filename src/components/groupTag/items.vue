<template>
  <div>
    <h1>{{groupName}}</h1>
    <a-divider/>
    <a-row type="flex" justify="end">
        <a-col :span="24" style="text-align:right">
            <a-button-group>
                <!--
                <a-button :icon="exporting?'loading':'file-markdown'" @click="exportMDs" :disabled="exporting">导出Markdown文档</a-button>
                -->
                <a-button type="primary" :icon="exportingItems?'loading':'database'" @click="exportGroupItems" :disabled="exportingItems">导出分类成员备份</a-button>
                <a-button type="primary" icon="plus" @click="handleAdd">新增接口标准成员</a-button>
                <a-button  :icon="exporting?'loading':'file-word'" @click="exportDocs" :disabled="exporting">导出Word文档</a-button>
            </a-button-group>
        </a-col>
    </a-row>
    <a-row style="margin-top:20px">
        <div v-for="(itemObj, index) in items" :key="itemObj.name">
            <a-col :span=6>
                <a-card style="margin: 5px">
                    <div slot="title">
                        <a-row>
                            <a-col :span="24">
                                {{itemObj.itemName}}
                                <a-tag
                                v-clipboard:copy="itemObj.tag_oid.tagName"
                                v-clipboard:success="onCopy"
                                v-clipboard:error="onError"
                                >
                                    {{itemObj.tag_oid.description}}
                                </a-tag>
                            </a-col>
                        </a-row>
                    </div>
                    <a-tooltip>
                        <template slot="title">
                            配置标准成员
                        </template>
                        <a-button type="primary" shape="circle" icon="setting" style='margin: 5px' @click="handleEdit(index)"></a-button>
                    </a-tooltip>
                </a-card>
            </a-col>
        </div>
    </a-row>
    <a-divider />
    
    <a-modal 
    title="接口标准成员配置" 
    v-model="editItemVisible" 
    @ok="editItem" :okText="currentItemId?'修改':'新增'" 
    cancelText="取消"
    :width="1280"
    >
        <item :apiGroupId="apiGroupId" :itemId="currentItemId" v-if="editItemVisible"></item>
    </a-modal>
  </div>
</template>

<script>
    import { EventBus } from '../../lib/event-bus.js'; //全局事件总线
    import Item from './item'
    import moment from 'moment'

  export default {
    data() {
      return {
          groupName: "",
          items: [],
          editItemVisible: false,
          currentItemId: "",
          customizeConfig:[],
          exporting: false,
          exportingItems: false
      };
    },
    components:{
      item: Item
    },
    computed:{
    },
    props: ['apiGroupId'],
    methods:{
        exportGroupItems(){
            let that = this;
            this.exportingItems = true;
            this.instance
            .get(
            '/private/backup/exportGroupItems',
            {
                params: {
                    group_id: this.apiGroupId
                },
                responseType: 'blob'
            }
            )
            .then(response => {
                const content = response.data;
                console.log(response);
                const blob = new Blob([content],{type:'application/octet-stream'});
                const fileName = `${moment().format('YYYY-MM-DD HH:mm:ss')}-成员备份.json`;
                
                if ('download' in document.createElement('a')) { //支持a标签download的浏览器
                    const link = document.createElement('a')//创建a标签
                    link.download = fileName//a标签添加属性
                    link.style.display = 'none'
                    link.href = URL.createObjectURL(blob)
                    document.body.appendChild(link)
                    link.click()//执行下载
                    URL.revokeObjectURL(link.href) //释放url
                    document.body.removeChild(link)//释放标签
                } else { //其他浏览器
                    navigator.msSaveBlob(blob, fileName)
                }
                this.$message.info('已导出');
                this.exportingItems = false;
            })
            .catch(function (error) { // 请求失败处理
                that.exportingItems = false;
                console.log(error);
            });
        },
        onCopy(){
            this.$message.info('复制成功');
        },
        onError(){
            this.$message.error('复制失败');
        },
        fetchItem() {
            this.instance
            .get(
            '/private/apiGroup/items',
            {
                params: {
                    apiGroup_id: this.apiGroupId 
                }
            }
            )
            .then(response => {
                this.items = response.data.list;
                this.groupName = response.data.groupName;
            })
            .catch(function (error) { // 请求失败处理
                console.log(error);
            });
        },
        handleEdit(index){
            this.currentItemId = this.items[index]._id;
            this.editItemVisible = true;
        },
        handleAdd(){
            this.currentItemId = "";
            this.editItemVisible = true;
        },
        editItem(){
            EventBus.$emit('editItemConfirm', {});
            this.editItemVisible = false;
        },
        exportDocs(){
            this.exporting = true;
            this.instance
            .get(
            '/private/apiGroup/item/docs',
            {
                params: {
                    apiGroup_id: this.apiGroupId
                },
                responseType: 'blob'
            }
            )
            .then(response => {
                const content = response.data;
                const blob = new Blob([content],{type:'application/octet-stream'});
                const fileName = `${this.groupName} 接口标准.docx`;
                
                if ('download' in document.createElement('a')) { //支持a标签download的浏览器
                    const link = document.createElement('a')//创建a标签
                    link.download = fileName//a标签添加属性
                    link.style.display = 'none'
                    link.href = URL.createObjectURL(blob)
                    document.body.appendChild(link)
                    link.click()//执行下载
                    URL.revokeObjectURL(link.href) //释放url
                    document.body.removeChild(link)//释放标签
                } else { //其他浏览器
                    navigator.msSaveBlob(blob, fileName)
                }
                this.$message.info('已导出');
                this.exporting = false;
            })
            .catch(function (error) { // 请求失败处理
                this.exporting = false;
                console.log(error);
            });
        },
        exportMDs(){

        }
    },
    created(){
    },
    mounted(){
        //注册事件监听
        EventBus.$off('itemCreated');
        EventBus.$on('itemCreated',()=>{
            console.log('itemCreated!');
            this.fetchItem()
        });

        this.fetchItem();
    }
  };
</script>