<template>
  <div>
    <a-row>
        <a-col :span="12">
            <div ref="count" style="width: 100%;height:360px;"></div>
        </a-col>
        <a-col :span="12">
            <div ref="fail" style="width: 100%;height:360px;"></div>
        </a-col>
    </a-row>
    <a-row>
        <a-col :span="12">
            <div ref="ttf" style="width: 100%;height:360px;"></div>
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
        failStatistics: [],
        successStatistics: [],
        success:0,
        fail:0,
        ttf: []
      };
    },
    props: ['apiTemplateId'],
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
            '/private/templateStatistics',
            {
                params:{
                    apiTemplate_id: this.apiTemplateId
                }
            }
            )
            .then(response => {
                let result = response.data;
                this.statistics = result.statistics.slice(0,10);
                this.failStatistics = result.failStatistics.slice(0,10);
                this.successStatistics = result.successStatistics.slice(0,10);
                this.drawCharts();
            })
            .catch(function (error) { // 请求失败处理
                console.log(error);
            });
        },
        drawCharts(){
            let countChart = echarts.init(this.$refs.count)
            countChart.setOption({
                title:{
                    text: '接口调用次数 Top10 统计'
                },
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
                    type: 'value',
                    boundaryGap: [0, 0.01]
                },
                yAxis: {
                    type: 'category',
                    data: this.statistics.map(item=>item.tag.description).reverse()
                },
                series:[
                    {
                        type: 'bar',
                        name: '调用次数',
                        stack: '调用次数',
                        label:{
                            show: true,
                            position: 'right',
                            formatter: '{@[1]}'
                        },
                        barMaxWidth: 28,
                        itemStyle: {
                            color: '#339966'
                        },
                        data: this.statistics.map(item=>{
                            return {
                                value:item.count,
                                app_id: item.app_oid,
                                api_id: item.api_oid
                            }
                        }).reverse() 
                    }
                ]
            });
            countChart.on('click', function(params){
                EventBus.$emit('selectApp', params.data.app_id);
                EventBus.$emit('apiIdChange', params.data.api_id);
                EventBus.$emit('modeChange', 'apiLog');
            })
            
            let failChart = echarts.init(this.$refs.fail)
            failChart.setOption({
                title:{
                    text: '接口失败次数 Top10 统计'
                },
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
                    type: 'value',
                    boundaryGap: [0, 0.01]
                },
                yAxis: {
                    type: 'category',
                    data: this.failStatistics.map(item=>item.tag.description).reverse()
                },
                series:[
                    {
                        type: 'bar',
                        name: '失败次数',
                        stack: '失败次数',
                        label:{
                            show: true,
                            position: 'right',
                            formatter: '{@[1]}'
                        },
                        barMaxWidth: 28,
                        itemStyle: {
                            color: '#CC3366'
                        },
                        data: this.failStatistics.map(item=>{
                            return {
                                value: item.count,
                                app_id: item.app_oid,
                                api_id: item.api_oid
                            }
                        }).reverse() 
                    }
                ]
            });
            failChart.on('click', function(params){
                EventBus.$emit('selectApp', params.data.app_id);
                EventBus.$emit('apiIdChange', params.data.api_id);
                EventBus.$emit('modeChange', 'apiLog');
            })

            let ttfChart = echarts.init(this.$refs.ttf)
            ttfChart.setOption({
                title:{
                    text: '调用ttf Top10 '
                },
                tooltip:{
                    trigger: 'axis'
                },
                toolbox:{
                    show: true,
                    position: 'right',
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
                    type: 'value',
                    boundaryGap: [0, 0.01],
                    axisLabel: {
                        formatter: '{value} ms'
                    }
                },
                yAxis: {
                    type: 'category',
                    data: this.successStatistics.map(item=>item.tag.description).reverse()
                },
                series:[
                    {
                        type: 'bar',
                        name: 'ttf',
                        stack: 'ttf',
                        label:{
                            show: true,
                            position: 'right',
                            formatter: '{@[1]} ms'
                        },
                        barMaxWidth: 28,
                        itemStyle: {
                            color: '#339966'
                        },
                        data: this.successStatistics.map(item=>{
                            return {
                                value: Math.floor(item.ttf),
                                app_id: item.app_oid,
                                api_id: item.api_oid
                            }
                        }).reverse() 
                    }
                ]
            });
            ttfChart.on('click', function(params){
                EventBus.$emit('selectApp', params.data.app_id);
                EventBus.$emit('apiIdChange', params.data.api_id);
                EventBus.$emit('modeChange', 'apiLog');
            })
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