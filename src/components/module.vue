<template>
  <div>
    <a-card :title="module.name" :bordered="false" style="background:#ECECEC;margin:10px;">
        <div>
            <a-collapse activeKey="operation" expandIconPosition="right">
                <a-collapse-panel v-for="(action, aindex) in module.actions" :key="action.key" :header="action.name" >
                    <!--
                    <div v-for="(dependency, dindex) in action.dependencies" :key="dependency.failStr"
                    style="margin-top:5px">
                        <a-textarea 
                        placeholder="描述如何组合数据来源到入参,JSON格式" 
                        :autoSize="{ minRows: 3, maxRows: 3}"
                        :defaultValue="JSON.stringify(dependency)"
                        @focus="e=>onDataFocus(e.target)"
                        @blur="e=>onDataConfirm(e.target, aindex, dindex)"
                        style="width:80%"
                        />
                        <a-button 
                        size="small" 
                        shape="circle" 
                        type="primary" 
                        icon="minus"
                        @click="e=>deleteDependency(e, aindex, dindex)"
                        />
                    </div>
                    -->
                    <a-cascader
                    v-for="(dependency, dindex) in action.dependencies"
                    :options="dependencyOptions"
                    :defaultValue="[dependency.statusName, dependency.value, dependency.failStr]"
                    expandTrigger="hover"
                    :key="dependency.failStr"
                    style="margin-bottom:10px"
                    @change="value => onDependencyChange(value, aindex, dindex)"
                    size="small"
                    :allowClear="true"
                    />
                    <a-button type="primary" size="small" shape="round" @click="addDependency(aindex)"><a-icon type="plus-circle"/>添加依赖</a-button>
                </a-collapse-panel>
            </a-collapse>
        </div>
        <template slot="actions" class="ant-card-actions">
            <a-icon key="setting" type="save" @click="saveModule"/>
        </template>
    </a-card>
  </div>
</template>
<script>
    //import { EventBus } from '../lib/event-bus.js'; //全局事件总线

  export default {
    data() {
      return {
          module: {},
          tempData: '',
      };
    },
    computed:{
    },
    props: ['moduleObj', 'dependencyOptions', 'moduleIndex'],
    methods:{
        addDependency(index){
            if(!this.module.actions[index].dependencies){
                this.module.actions[index].dependencies = [];
            }
            this.module.actions[index].dependencies.push({
                statusName: this.dependencyOptions[0].value,
                value: this.dependencyOptions[0].children[0].value,
                failStr: this.dependencyOptions[0].children[0].children[0].value
            });
        },
        onDependencyChange(value, aindex, dindex){
            if(value.length == 0){
                //如果发现这样删除元素错位了，请检查是否以index作为key!
                this.module.actions[aindex].dependencies.splice(dindex, 1);
                return;
            }
            this.module.actions[aindex].dependencies[dindex].statusName = value[0];
            this.module.actions[aindex].dependencies[dindex].value = value[1];
            this.module.actions[aindex].dependencies[dindex].failStr = value[2];
        },
        onDataFocus(target){
            this.tempData = target.value;
        },
        onDataConfirm(target, aindex, dindex){
            try{
                this.module.actions[aindex].dependencyMap[dindex] = JSON.parse(target.value)
            }catch(e){
                target.value = this.tempData;
            }
        },
        // deleteDependency(e, aindex, dindex){
        //     this.module.actions[aindex].dependencies.splice(dindex,1)
        // },
        async saveModule(){
            console.log(this.module);
            return this.instance
            .post(
            `/private/consultModulation/moduleConfig/update`,
            {
                module_id:this.module._id,
                module:this.module
            }
            )
            .then(response => {
                let result = response.data;
                if(result.result){
                    if(result.data){
                        this.$message.info(`更新模块 ${result.data.name} 成功`);
                    }else{
                        this.$message.info(`新建模块 ${this.module.name} 成功`);
                    }
                }
            })
            .catch(function (error) { // 请求失败处理
                console.log(error);
            });
        }
    },
    mounted(){
        //注册事件监听
        this.module = {...this.moduleObj};
        //console.log(this.module);
        // for(let key in this.module.actions){
        //     this.module.actions[key].dependencyMap = {};
        //     let that = this;
        //     this.module.actions[key].dependencies.forEach(dependency=>{
        //         that.module.actions[key].dependencyMap[dependency.statusName] = dependency;
        //     })
        // }
    }
  };
</script>