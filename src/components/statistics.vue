<template>
  <div>
    <a-row>
        <a-col :span="12">
            <div ref="Errheatmap" style="width: 100%;height:360px;"></div>
        </a-col>
        <a-col :span="12">
            <div ref="recentErr" style="width: 100%;height:360px;"></div>
        </a-col>
    </a-row>
    <a-row>
        
    </a-row>
    <a-divider />
    <a-row>
        <a-col :span="12">
            <div ref="arrange" style="width: 100%;height:360px;"></div>
        </a-col>
        <a-col :span="12">
            <div ref="fail" style="width: 100%;height:360px;"></div>
        </a-col>
    </a-row>
    <a-row>
        <a-col :span="12">
            <div ref="ttf" style="width: 100%;height:360px;"></div>
        </a-col>
        <a-col :span="12">
            <div ref="times" style="width: 100%;height:360px;"></div>
        </a-col>
    </a-row>
    <a-divider/>
  </div>
</template>
<script>
    import { EventBus } from '../lib/event-bus.js'; //全局事件总线
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
        timesStatistics: [],
        companyStatistics:[],
        failStatistics: [],
        successStatistics: [],
        ttf: [],
        failHeatmap: [],
        recent: []
      };
    },
    props: ['apiTemplateId'],
    methods:{
        toLog(app_id, api_id){
            EventBus.$emit('selectApp', app_id);
            EventBus.$emit('apiIdChange', api_id);
            EventBus.$emit('modeChange', 'apiLog');
        },
        timeValue2Date(value){
            return moment(`${Math.floor(value/1000000)}-${_.padStart(Math.floor(value/10000)%100,2,'0')}-${_.padStart(Math.floor(value/100)%100,2,'0')} ${_.padStart(value%100,2,'0')}:00:00`).toDate();
        },
        format2Date(value){
            return moment(value.slice(0,-2)+'00').toDate();
        },
        fetchStatistics(){
            this.instance
            .get(
            '/private/statistics'
            )
            .then(response => {
                let result = response.data;
                this.timesStatistics = result.timesStatistics.slice(0,10);
                this.companyStatistics = result.companyStatistics;
                this.failStatistics = result.failStatistics.slice(0,10);
                this.successStatistics = result.successStatistics.slice(0,10);
                this.failHeatmap = result.failHeatmap.filter(item=>item._id);
                this.recent = result.recent10Fails.filter(item=>{
                    return (item.app_oid && item.api_oid);
                });
                this.drawCharts();
            })
            .catch(function (error) { // 请求失败处理
                console.log(error);
            });
        },
        drawCharts(){
            let errorHeatmapChart = echarts.init(this.$refs.Errheatmap);
            errorHeatmapChart.setOption({
                title:{
                    text: '报错日历'
                },
                toolbox:{
                    show: true,
                    feature:{
                        saveAsImage:{show: true}
                    }
                },
                tooltip: {
                    position: 'top',
                    formatter: function (p) {
                        return `${p.data[1]}`;
                    }
                },
                visualMap: {
                    dimension: 1,
                    show: false,
                    min: 0,
                    max: 50,
                    inRange: {
                        color: ['#ffc7cd', '#9e0012']
                    }
                },
                calendar: {
                    cellSize: 'auto',
                    yearLabel: {
                        margin: 50,
                        textStyle: {
                            fontSize: 30
                        }
                    },
                    dayLabel: {
                        firstDay: 1,
                        nameMap: ['周日','周一','周二','周三','周四','周五','周六']
                    },
                    monthLabel: {
                        nameMap: 'cn',
                        margin: 15,
                        textStyle: {
                            fontSize: 12,
                            color: '#999'
                        }
                    },
                    range: [this.failHeatmap[this.failHeatmap.length-1]._id, this.failHeatmap[0]._id]
                },
                series: [{
                    type: 'heatmap',
                    coordinateSystem: 'calendar',
                    rippleEffect: {
                        brushType: 'stroke'
                    },
                    hoverAnimation: true,
                    data: this.failHeatmap.map(item=>{
                        return [item._id, item.fail]
                    }),
                    zlevel: 2
                }]
            })

            //let reds = ['#f47983', '#db5a6b', '#c93756', '#f05654', '#ff461f', '#ff2d51', '#ed5736', '#ff4777', '#f00056', '#f35336', '#dc3023', '#ff3300', '#cb3a56', '#ff2121', '#f20c00', '#ff4c00', '#ef7a82', '#ff0097', '#c32136', '#be002f', '#c91f37', '#bf242a', '#c3272b'];
            let recentErrorChart = echarts.init(this.$refs.recentErr);
            recentErrorChart.setOption({
                title: {
                    text: '近期发生错误'
                },
                toolbox:{
                    show: true,
                    feature:{
                        saveAsImage:{show: true}
                    }
                },
                tooltip: {
                    position: 'top',
                    formatter: function (p) {
                        return p.data.log_time;
                    }
                },
                grid: {
                    show:false,
                    left: '5%',
                    right: '5%',
                    bottom: '0%',
                    containLabel: false
                },
                xAxis:{
                    show: false,
                    type: 'value',
                    triggerEvent: true
                },
                yAxis: {
                    show: false,
                    type: 'category',
                    triggerEvent: true
                },
                series: [
                    {
                        type: 'bar',
                        name: '近期错误',
                        stack: '近期错误',
                        label:{
                            show: true,
                            position: 'inside',
                            formatter: '{b}'
                        },
                        barMaxWidth: 16,
                        data: this.recent.map((item, index)=>{
                            return {
                                id: index,
                                value: 10,
                                log_time: item.log_time,
                                name: `${item.app_oid.name}-${item.api_oid.name}:${item.log_time}`,
                                app_id: item.app_oid._id,
                                api_id: item.api_oid._id,
                                itemStyle: {
                                    color: '#CC3366'
                                }
                            }
                        })
                    }
                ]
            })
            recentErrorChart.on('click',function(params){
                EventBus.$emit('selectApp', params.data.app_id);
                EventBus.$emit('apiIdChange', params.data.api_id);
                EventBus.$emit('modeChange', 'apiLog');
            });

            let arrangeChart = echarts.init(this.$refs.arrange);
            arrangeChart.setOption({
                title:{
                    text: '厂商模板数与使用分布'
                },
                toolbox:{
                    show: true,
                    feature:{
                        saveAsImage:{
                            show: true,
                            emphasis:{
                                iconStyle:{
                                    textPosition: 'bottom',
                                    textFill: '#000'
                                    }
                                }
                            }
                    }
                },
                xAxis:{
                    triggerEvent: true,
                    splitLine: {
                        lineStyle: {
                            type: 'dashed'
                        }
                    },
                    axisLabel: {
                        formatter: '{value} 所医院'
                    },
                    minInterval: 1
                },
                yAxis: {
                    triggerEvent: true,
                    splitLine: {
                        lineStyle: {
                            type: 'dashed'
                        }
                    },
                    axisLabel: {
                        formatter: '{value} 个接口'
                    },
                    minInterval: 1,
                    scale: true
                },
                series:[
                    {
                        type: 'scatter',
                        name: '使用医院数',
                        data: this.companyStatistics.map(item=>[item.count, item.items.length, item.template.templateName, item._id, item.template.version]),
                        symbolSize: function (data) {
                            return Math.sqrt(data[0]*data[1])*10;
                        },
                        emphasis: {
                            label: {
                                show: true,
                                formatter: function (param) {
                                    return `${param.data[2]}${param.data[4]?'-'+param.data[4]:''}`;
                                },
                                position: 'top'
                            }
                        },
                        itemStyle: {
                            shadowBlur: 10,
                            shadowColor: 'rgba(25, 100, 150, 0.5)',
                            shadowOffsetY: 5,
                            color: new echarts.graphic.RadialGradient(0.4, 0.3, 1, [{
                                offset: 0,
                                color: 'rgb(129, 227, 238)'
                            }, {
                                offset: 1,
                                color: 'rgb(25, 183, 207)'
                            }])
                        }
                    }
                ]
            });
            arrangeChart.on('click', function(params){
                EventBus.$emit('selectTemplate', {template_id:params.data[3], templateName:params.data[2]});
                EventBus.$emit('modeChange', 'template');
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
                    triggerEvent: true,
                    boundaryGap: [0, 0.01]
                },
                yAxis: {
                    type: 'category',
                    triggerEvent: true,
                    data: this.failStatistics.map(item=>`${item.template.templateName}${item.template.version?'-'+item.template.version:''}-${item.tag.description}`).reverse()
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
                        barMaxWidth: 16,
                        itemStyle: {
                            color: '#CC3366'
                        },
                        data: this.failStatistics.map(item=>{return {value:item.count, _id:item._id, api_id:item.api_oid, app_id:item.app_oid}}).reverse() 
                    }
                ]
            });
            failChart.on('click',function(params){
                EventBus.$emit('selectApp', params.data.app_id);
                EventBus.$emit('apiIdChange', params.data.api_id);
                EventBus.$emit('modeChange', 'apiLog');
                // EventBus.$emit('selectTemplate', {template_id:params.data._id.template, templateName:params.name.split('-')[0]});
                // EventBus.$emit('selectTag', params.data._id.tag);
                // EventBus.$emit('modeChange', 'itemStatics');
            });

            let ttfChart = echarts.init(this.$refs.ttf);
            ttfChart.setOption({
                title:{
                    text: '成功调用响应时长 Top10 '
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
                    triggerEvent: true,
                    boundaryGap: [0, 0.01],
                    axisLabel: {
                        formatter: '{value} ms'
                    }
                },
                yAxis: {
                    type: 'category',
                    triggerEvent: true,
                    data: this.successStatistics.map(item=>`${item.template.templateName}${item.template.version?'-'+item.template.version:''}-${item.tag.description}`).reverse()
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
                        barMaxWidth: 16,
                        itemStyle: {
                            color: '#339966'
                        },
                        data: this.successStatistics.map(item=>{return {value:Math.floor(item.ttf), _id:item._id}}).reverse() 
                    }
                ]
            });
            ttfChart.on('click', function(params){
                EventBus.$emit('selectTemplate', {template_id:params.data._id.template, templateName:params.name.split('-')[0]});
                EventBus.$emit('selectTag', params.data._id.tag);
                EventBus.$emit('modeChange', 'itemStatics');
            })

            let timesChart = echarts.init(this.$refs.times);
            timesChart.setOption({
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
                    triggerEvent: true,
                    boundaryGap: [0, 0.01]
                },
                yAxis: {
                    type: 'category',
                    triggerEvent: true,
                    data: this.timesStatistics.map(item=>`${item.template.templateName}${item.template.version?'-'+item.template.version:''}-${item.tag.description}`).reverse()
                },
                series:[
                    {
                        type: 'bar',
                        name: '调用成功次数',
                        stack: '总调用次数',
                        label:{
                            show: true,
                            position: 'right',
                            formatter: '{@[1]}'
                        },
                        barMaxWidth: 16,
                        itemStyle: {
                            color: '#339966'
                        },
                        data: this.timesStatistics.map(item=>{return {value:item.success, _id:item._id, type:'success', api_id: item.api_oid, app_id:item.app_oid}} ).reverse() 
                    },
                    {
                        type: 'bar',
                        name: '调用失败次数',
                        stack: '总调用次数',
                        label:{
                            show: true,
                            position: 'left',
                            formatter: (item)=>{
                                return -item.value
                            }
                        },
                        barMaxWidth: 16,
                        itemStyle: {
                            color: '#CC3366'
                        },
                        data: this.timesStatistics.map(item=>{return {value:item.fail, _id:item._id, type:'fail', api_id: item.api_oid, app_id:item.app_oid}}).reverse() 
                    }
                ]
            });
            timesChart.on('click', function(params){
                console.log(params);
                EventBus.$emit('selectApp', params.data.app_id);
                EventBus.$emit('apiIdChange', params.data.api_id);
                EventBus.$emit('modeChange', 'apiLog');
                // EventBus.$emit('selectTemplate', {template_id:params.data._id.template, templateName:params.name.split('-')[0]});
                // EventBus.$emit('selectTag', params.data._id.tag);
                // EventBus.$emit('modeChange', 'itemStatics');
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