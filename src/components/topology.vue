<template>
    <div>
        <div ref="blocks" style="width:100%;height:500px"></div>
    </div>
</template>

<script>
    import { EventBus } from '../lib/event-bus.js'; //全局事件总线
    import * as echarts from 'echarts';
    import _ from 'lodash';

  export default {
    data() {
        return {
            data: {
            },
            editableTypes: ["data", "request"],
            typeMap: {
                params: "调用入参",
                data: "数据",
                request: "请求",
                end: "返回"
            },
            colorMap: {
                params: "#1E90FF",
                data: "#FF1493",
                request: "#00FA9A",
                end: "#7FFF00"
            },
            interfaceName: {
                inputData: "输入",
                headerData: "请求头",
                signData: "签名数据"
            },
            charts:{}
        }
    },
    name: 'topology',
    props: ['dataObj', 'mode'],
    methods:{
        drawCharts(){
            let movement = {
                pos: {x:500, y:100},
                direction: 'right'
            }
            let endBlockName = this.data.end;
            let that = this;
            let data = [{
                id: 'params',
                name: this.typeMap['params'],
                itemStyle:{color: this.colorMap.params},
                type: 'params',
                x: 100,
                y: 100,
                symbolSize: 50
            }];
            let edges = [];
            for(let blockName in this.data.blocks){
                let item = this.data.blocks[blockName];
                let node = {
                    id: blockName,
                    name: this.data.blocks[blockName].name,
                    itemStyle:{color: this.colorMap[item.type]},
                    block_id: item.block_oid,
                    blockData: item.blockConfig,
                    inputData: item.inputData||[],
                    headerData: item.headerData||[],
                    signData: item.signData||[],
                    type: item.type,
                    symbolSize: 50,
                    ...movement.pos
                }
                let alreadyCurveness = [];
                let curveness = 0;
                switch(item.type){
                    case "data":
                        for(let source of item.inputData){
                            curveness = calculateCurveness(0, '', alreadyCurveness);
                            edges.push({
                                source,
                                target: blockName,
                                label: {
                                    show: true,
                                    formatter: function(){
                                        return that.interfaceName["inputData"]
                                    },
                                },
                                lineStyle: {
                                    width: 5,
                                    curveness
                                },
                                edgeType: "inputData"
                            })
                        }
                    break;
                    case "request":
                        for(let source of item.inputData){
                            curveness = calculateCurveness(0, '', alreadyCurveness);
                            edges.push({
                                source,
                                target: blockName,
                                label: {
                                    show: true,
                                    formatter: function(){
                                        return that.interfaceName["inputData"]
                                    },
                                },
                                lineStyle: {
                                    width: 5,
                                    curveness
                                },
                                edgeType: "inputData"
                            })
                        }
                        for(let source of item.headerData){
                            curveness = calculateCurveness(0, 'top', alreadyCurveness);
                            edges.push({
                                source,
                                target: blockName,
                                label: {
                                    show: true,
                                    formatter: function(){
                                        return that.interfaceName["headerData"]
                                    }
                                },
                                lineStyle: {
                                    width: 5,
                                    curveness
                                },
                                edgeType: "headerData"
                            })
                        }
                        for(let source of item.signData){
                            curveness = calculateCurveness(0, 'bottom', alreadyCurveness);
                            edges.push({
                                source,
                                target: blockName,
                                label: {
                                    show: true,
                                    formatter: function(){
                                        return that.interfaceName["signData"]
                                    }
                                },
                                lineStyle: {
                                    width: 5,
                                    curveness
                                },
                                edgeType: "signData"
                            })
                        }
                    break;
                    default:
                    break;
                }
                data.push(node);
                changePos(movement);
            }
            data.push({
                id: 'end',
                name: this.typeMap['end'],
                itemStyle:{color: this.colorMap['end']},
                type: 'end',
                symbolSize: 50,
                x: 1700,
                y: -50
            });
            edges.push({
                source: endBlockName,
                target: 'end',
                label: {
                    show: false
                },
                lineStyle: {
                    width: 5
                }
            });
            let blocksChart = echarts.init(this.$refs.blocks);
            
            blocksChart.setOption({
                backgroundColor: "#E0E0E0",
                series: [{
                    type: 'graph',
                    layout: 'none',
                    animation: true,
                    labelLine: {
                        show: false,
                        length: 30,
                    },
                    label: {
                        position: 'inside',
                        show: true
                    },
                    edgeSymbol: ['circle', 'arrow'],
                    edgeSymbolSize: [4, 10],
                    emphasis: {
                        focus: 'adjacency',
                        label: {
                            show: true
                        }
                    },
                    lineStyle: {
                        width: 1,
                        type: 'solid'
                    },
                    roam: 'scale',
                    data,
                    edges
                }]
            })

            this.charts = blocksChart;
        },
        editBlock(block){
            switch(block.type){
                case "data":
                    EventBus.$emit('editDataBlock', {blockName:block.id, block_id: block.block_id, inputData:block.inputData, blockData:block.blockData})
                    break;
                case "request":
                    EventBus.$emit('editRequestBlock', {blockName:block.id, block_id: block.block_id, inputData:block.inputData, headerData:block.headerData, signData:block.signData, blockData:block.blockData})
                    break;
                default:
                    break;
            }
        },
        deleteDataFlow(edge){
            _.pull(this.data.blocks[edge.target][edge.edgeType], edge.source);
            this.drawCharts();
        },
        setBlockAsEnd(block){
            this.data.end = block.id;
            this.drawCharts();
        },
        deleteNode(block){
            this.$confirm({
                title: '确认节点删除',
                content: `是否永久删除节点: ${block.name} ？`,
                onOk(){
                    EventBus.$emit('deleteBlock', block.id)
                },
                onCancel(){

                },
                okText: '确认',
                cancelText: '取消'
            })
        },
        registChartEvent(){
            let that = this;
            this.charts.on('click', function(params){
                if(that.mode == "edit"){
                    if(params.data){
                        that.editBlock(params.data)
                    }
                }
                if(that.mode == "delete"){
                    switch(params.dataType){
                        case "edge":
                            that.deleteDataFlow(params.data);
                            break;
                        case "node":
                            if(that.editableTypes.includes(params.data.type)){
                                that.deleteNode(params.data);
                            }
                            break;
                        default:
                            break;
                    }
                }
                if(that.mode == "end" && params.dataType == "node" && that.editableTypes.includes(params.data.type)){
                    that.setBlockAsEnd(params.data);
                }
            })
        }
    },
    created(){
        
    },
    mounted(){
        this.data = this.dataObj;
        this.drawCharts();
        let that = this
        EventBus.$off('redrawCharts');
        EventBus.$on('redrawCharts',(dataObj)=>{
            console.log("dataObj:", dataObj);
            if(dataObj){
                that.data = dataObj;
            }
            that.drawCharts();
        });
        this.registChartEvent();
    }
  };

  function changePos(movement){
      switch(movement.direction){
          case "right":
            if(movement.pos.x >= 1500){
                movement.pos.y += 400;
                movement.direction = "left"
            }else{
                movement.pos.x += 400;
            }
            break;
          case "left":
            if(movement.pos.x <= 200){
                movement.pos.y += 400;
                movement.direction = "right"
            }else{
                movement.pos.x -= 400;
            }
            break;
          default:
            break;
      }
  }

  function calculateCurveness(current, position, alreadyCurveness){
      if(alreadyCurveness.includes(current)){
          switch(position){
                case "top":
                    return calculateCurveness(current+0.2, position, alreadyCurveness)
                case "bottom":
                    return calculateCurveness(current-0.2, position, alreadyCurveness)
                default:
                    return calculateCurveness(current+0.2, position, alreadyCurveness)
          }
      }else{
          alreadyCurveness.push(current);
          return current
      }
  }
</script>