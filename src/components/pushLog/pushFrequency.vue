<template>
  <div>
    <a-row>
        <a-col :span="4">
            <p style="margin-top:20px">选择医院：</p>
        </a-col>
        <a-col :span="20">
            <a-select
            show-search
            v-model="company.hospitalId"
            option-filter-prop="children"
            :filter-option="(input, option)=>filterCompany(input, option.componentOptions.children[0].text)"
            @focus="getCompany"
            style="margin-top:20px;width:83.7%"
            @change="onSelectCompany"
            destroyOnClose
            >
                <a-select-opt-group v-for="companyType in companyOptions" :key="companyType.name" :label="companyType.name">
                    <a-select-option v-for="a in companyType.list" :key="a.hospitalId || a._id" :title="a.hospitalName || a.company_name">
                    {{a.hospitalName || a.company_name}}
                    </a-select-option>
                </a-select-opt-group>
            </a-select>
        </a-col>
    </a-row>
    <a-divider />
    <div ref="legend" style="font-size:10px"></div>
    <a-row>
        <a-col :span="2" v-for="item in list" :key="item.app_id">
            <a-tooltip>
                <template slot="title">
                    <p>{{item.count}}</p>
                </template>
                <a-card hoverable :style="{width: '162.48px',background: color(item.count), color: d3.lab(color(item.count)).l<60?'white':'black'}">
                    <div slot="cover">
                        <img
                        :src="item.icon_url"
                        />
                    </div>
                    <a-card-meta :title="item.appName">
                    </a-card-meta>
                </a-card>
            </a-tooltip>
        </a-col>
    </a-row>
    <div ref="bubbleChart" />
  </div>
</template>

<script>
    import * as d3 from 'd3'
    import {Legend} from '../d3/js/colorLegend'
    import BubbleChart from '../d3/js/bubbleChart'

    export default{
        data(){
            return {
                d3,
                lengend: "",
                companyOptions: [],
                companyMap:{},
                company: {},
                company_id: "",
                list: [],
                color: {},
                chart: ""
            }
        },
        props: [],
        methods:{
            fetch(){
                if(this.company_id){
                    this.instance
                    .get(
                    '/public/messageStat',
                    {
                        params:{
                            company_id: this.company_id
                        }
                    }
                    )
                    .then(response => {
                        let result = response.data;
                        if(!result.result){
                            throw new Error("请求失败")
                        }
                        this.list = result.list.map(item=>{
                            return {
                                id: [item.type, item.subtype, item.appName].join('.'),
                                value: item.count
                            }
                        });
                        this.drawChart(this.list)
                    })
                    .catch(error => { // 请求失败处理
                        console.log(error)
                        if(error){
                            this.$message.error(error)
                        }
                    });
                }else{
                    this.$message.error("请选择医院")
                }
            },
            getCompany(){
                this.instance
                .get(
                '/private/consultModulation/company',
                {
                    params: {
                        hospitalId: this.specifiedCompany||""
                    }
                }
                )
                .then(response => {
                    let {list} = response.data;
                    this.companyOptions = list;
                    for(let companyType of list){
                        for(let company of companyType.list){
                            this.companyMap[company.hospitalId || company._id] = company.hospitalName || company.company_name;
                        }
                    }
                })
                .catch(function (error) { // 请求失败处理
                    console.log(error);
                });
            },
            onSelectCompany(value){
                
                if(!isNaN(value)){
                    this.company.hospitalId = Number(value);
                    this.company.hospitalName = this.companyMap[value];
                }else{
                    this.company_id = value;
                }
                this.fetch(this.company_id)
            },
            filterCompany(input, text){
                let regex = new RegExp(input,'i');
                return regex.test(text);
            },
            drawChart(data){
                if(data.length){
                    if(this.chart){
                        this.chart.remove(0);
                    }
                    this.chart = BubbleChart(data.filter(d=>d.value!==null),{
                        label: d => [...d.id.split(".").pop().split(/(?=[A-Z][a-z])/g), d.value.toLocaleString("en")].join("\n"),
                        value: d => d.value,
                        group: d => d.id.split(".")[1],
                        title: d => `${d.id}\n${d.value.toLocaleString("en")}`,
                        link: d => `https://github.com/prefuse/Flare/blob/master/flare/src/${d.id.replace(/\./g, "/")}.as`,
                        width: 1152
                    })
                    this.$refs.bubbleChart.appendChild(this.chart);
                }else{
                    this.$message.info("最近1小时无应用推送消息")
                }
            }
        },
        mounted(){
        }
    }
</script>