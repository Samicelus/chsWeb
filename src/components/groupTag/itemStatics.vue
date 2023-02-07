<template>
  <div>
    <a-row>
        <a-col :span="24">
            <div ref="frequence" style="width: 100%;height:250px;"></div>
        </a-col>
    </a-row>
    <a-row>
        <a-col :span="24">
            <div ref="ttf" style="width: 100%;height:250px;"></div>
        </a-col>
    </a-row>
    <a-row>
        <a-col :span="24">
            <div ref="ratio" style="width: 100%;height:250px;"></div>
        </a-col>
    </a-row>
    <a-divider/>
  </div>
</template>
<script>
    import { EventBus } from '../../lib/event-bus.js'; //全局事件总线
    import moment from 'moment';
    moment.locale('zh-cn');
    import * as echarts from 'echarts';
    import _ from 'lodash';

  export default {
    data() {
      return {
        onlyTimeout: false,
        name:"",
        testParam:{},
        tempParamStr:"",
        test: false,
        testResult:{},
        showResult: false,
        moment,
        data: [],
        pagination: {},
        loading: false,
        processMap: {
            getConfig:{
                name: "获取API配置",
                color: "cyan"
            },
            fromCache:{
                name: "获取缓存结果",
                color: "purple"
            },
            parseData:{
                name: "替换外部入参",
                color: "blue"
            },
            formHeader:{
                name: "组合请求头",
                color: "blue"
            },
            callPreApi:{
                name: "调用前置API",
                color: "blue"
            },
            formFromPreApi:{
                name: "组合前置数据",
                color: "blue"
            },
            queryDatabase:{
                name: "查询数据库",
                color: "blue"
            },
            mergeData:{
                name: "组装数据",
                color: "blue"
            },
            stringifyData:{
                name: "字符串化JSON",
                color: "blue"
            },
            sign:{
                name: "计算签名",
                color: "grey"
            },
            request:{
                name: "请求接口",
                color: "blue"
            },
            toCache:{
                name: "写入缓存",
                color: "purple"
            },
            parseText:{
                name: "解析返回字符串",
                color: "blue"
            },
            return:{
                name: "返回结果",
                color: "green"
            },
            error: {
                name: "发生错误",
                color: "red"
            }
        },
        statistics:[],
        success:0,
        fail:0,
        ttf: []
      };
    },
    props: ['apiTemplateId', 'tagId'],
    methods:{
        timeValue2Date(value){
            return moment(`${Math.floor(value/1000000)}-${_.padStart(Math.floor(value/10000)%100,2,'0')}-${_.padStart(Math.floor(value/100)%100,2,'0')} ${_.padStart(value%100,2,'0')}:00:00`).toDate();
        },
        format2Date(value){
            return moment(value.slice(0,-2)+'00').toDate();
        },
        fetchStatistics(){
            this.instance
            .get(
            '/private/itemStatistics',
            {
                params:{
                    apiTemplate_id: this.apiTemplateId,
                    tag_id: this.tagId
                }
            }
            )
            .then(response => {
                let result = response.data;
                this.statistics = result.statistics;
                this.success = result.success;
                this.fail = result.fail;
                this.name = result.name;
                this.ttf = result.ttf;
                this.drawCharts();
            })
            .catch(function (error) { // 请求失败处理
                console.log(error);
            });
        },
        drawCharts(){
            let that = this;
            let frequenceChart = echarts.init(this.$refs.frequence);
            frequenceChart.setOption({
                title:{
                    text: '接口调用频率'
                },
                tooltip:{
                    trigger: 'axis'
                },
                legend: {
                    data:['成功', '失败']
                },
                toolbox:{
                    show: true,
                    feature:{
                        saveAsImage:{show: true}
                    }
                },
                dataZoom:[
                    {
                        show: true,
                        realtime: true,
                        start: 0,
                        end: 100
                    }
                ],
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true
                },
                xAxis:{
                    type: 'time'
                },
                yAxis: {
                    type: 'value'
                },
                series:[{
                    type: 'bar',
                    name: '成功',
                    stack: '调用次数',
                    label:{
                        show: false,
                        formatter: '{@[1]}'
                    },
                    itemStyle: {
                        color: '#339966'
                    },
                    data: this.statistics.map(item=>[that.timeValue2Date(item._id), item.success, item.app_oid, item.api_oid]) 
                },
                {
                    type: 'bar',
                    name: '失败',
                    stack: '调用次数',
                    label:{
                        show: false,
                        formatter: '{@[1]}'
                    },
                    barMaxWidth: 48,
                    itemStyle: {
                        color: '#CC3366'
                    },
                    data: this.statistics.map(item=>[that.timeValue2Date(item._id), item.fail, item.app_oid, item.api_oid]) 
                }
                ]
            });
            frequenceChart.on('click', function(params){
                EventBus.$emit('selectApp', params.data[2]);
                EventBus.$emit('apiIdChange', params.data[3]);
                EventBus.$emit('modeChange', 'apiLog');
            })
            
            let ttfChart = echarts.init(this.$refs.ttf)
            ttfChart.setOption({
                title:{
                    text: '接口响应时间'
                },
                dataZoom:[
                    {
                        show: true,
                        realtime: true,
                        start: 0,
                        end: 100
                    }
                ],
                tooltip:{
                    trigger: 'axis'
                },
                toolbox:{
                    show: true,
                    feature:{
                        saveAsImage:{show: true}
                    }
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true
                },
                xAxis:{
                    type: 'time'
                },
                yAxis: {
                    type: 'value'
                },
                series:[{
                    type: 'bar',
                    name: '接口响应时间',
                    stack: '接口响应时间',
                    label:{
                        show: false,
                        formatter: '{@[1]}'
                    },
                    itemStyle: {
                        color: '#339966'
                    },
                    barMaxWidth: 28,
                    data: this.ttf.map(item=>[item.log_time, item.totalTime, item.app_oid, item.api_oid]) 
                }]
            });
            ttfChart.on('click', function(params){
                EventBus.$emit('selectApp', params.data[2]);
                EventBus.$emit('apiIdChange', params.data[3]);
                EventBus.$emit('modeChange', 'apiLog');
            })

            let ratioChart = echarts.init(this.$refs.ratio)
            ratioChart.setOption({
                title:{
                    text: '调用成功比例'
                },
                tooltip:{
                    trigger: 'item',
                    formatter: '{b} : {c} ({d}%)'
                },
                legend:{
                    top: 'bottom',
                    data: ['成功','失败']
                },
                toolbox:{
                    show: true,
                    feature:{
                        saveAsImage:{show: true}
                    }
                },
                series:[{
                    type: 'pie',
                    itemStyle:{
                        color: function({data}){
                            return data.name == "成功"?'#339966':'#CC3366'
                        }
                    },
                    label:{
                        formatter: '{b} : {c} ({d}%)'
                    },
                    startAngle: 45,
                    roseType: 'radius',
                    data: [
                        {
                            name: "成功",
                            value: this.success
                        },
                        {
                            name: "失败",
                            value: this.fail
                        }
                    ] 
                }]
            });
        }
    },
    mounted(){
        //注册事件监听
        this.fetchStatistics();
    }
  };
</script>
<style>
.formated-json {
    white-space: pre-wrap;
    white-space: -moz-pre-wrap; 
    white-space: -pre-wrap;     
    white-space: -o-pre-wrap;
    word-wrap: break-word;
    word-break: break-all;
    height:240px;
    text-align:left;
}
.result-json {
    height:240px;
    text-align:left;
}
pre {outline: 1px solid #ccc; padding: 5px; margin: 5px; }
.string { color: green; }
.number { color: darkorange; }
.boolean { color: blue; }
.null { color: magenta; }
.key { color: red; }
.ant-tooltip {
    width: 500px
}
</style>