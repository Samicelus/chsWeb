<template>
    <a-layout>
        <a-layout-header>
        </a-layout-header>
        <a-layout-content  :style="{ padding: '0 50px', marginTop: '64px' }">

            <!--今日流量-->
            <div style="background:#fff; padding:24px">
                <a-row>
                    <a-col :span="4">
                        <div style="background:#1DA57A">
                            <div style="background:#fff;text-align:left;font-size:24px;margin-left:8px;padding-left:12px">今日流量</div>
                        </div>
                    </a-col>
                    <a-col :span="14" style="text-align:right;line-height:32px">
                        <a-radio-group style="margin-right:20px" defaultValue="today">
                            <a-radio-button @click="chooseToday" value="today">今日</a-radio-button>
                            <a-radio-button @click="chooseYesterday" value="yesterday">昨日</a-radio-button>
                        </a-radio-group>
                    </a-col>
                    <a-col :span="6">
                        <a-date-picker 
                        v-model="dailyMoment"
                        placeholder="请选择日期" 
                        style="width:100%"
                        @change="onDailyDateChange"
                        />
                    </a-col>
                </a-row>
                <a-divider />
                <a-row style="margin-top:12px">
                    <a-col :span="isMobile?24:8">
                        <div style="height:120px; background:rgba(234, 245, 255, 1);vertical-align:center" >
                            <p style="padding-top:30px;margin-bottom:0px;font-size:28px;font-weight:650;">{{dailyData.hospitalCount}}</p>
                            <p style="margin-top:0px;font-size:14px;font-weight:400;color:#7F7F7F;">医院使用数量</p>
                        </div>
                    </a-col>
                    <a-col :span="isMobile?24:8">
                        <div style="height:120px; background:rgba(231, 248, 251, 1);margin-left:12px;vertical-align:center" >
                            <p style="padding-top:30px;margin-bottom:0px;font-size:28px;font-weight:650;">{{dailyData.accessCount}}</p>
                            <p style="margin-top:0px;font-size:14px;font-weight:400;color:#7F7F7F;">访问总数</p>
                        </div>
                    </a-col>
                    <a-col :span="isMobile?24:8">
                        <div style="height:120px; background:rgba(254, 244, 237, 1);margin-left:12px;vertical-align:center" >
                            <p style="padding-top:30px;margin-bottom:0px;font-size:28px;font-weight:650;">{{dailyData.iflowCount}}</p>
                            <p style="margin-top:0px;font-size:14px;font-weight:400;color:#7F7F7F;">自建流程数量</p>
                        </div>
                    </a-col>
                </a-row>
            </div>

            <!--每日访问量趋势-->
            <div style="background:#fff; padding:24px; margin-top:12px">
                <a-row>
                    <a-col :span="4">
                        <div style="background:#1DA57A">
                            <div style="background:#fff;text-align:left;font-size:24px;margin-left:8px;padding-left:12px">每日访问量趋势</div>
                        </div>
                    </a-col>
                    <a-col :span="14" style="text-align:right;line-height:32px">
                        <a-radio-group style="margin-right:20px" defaultValue="thisWeek">
                            <a-radio-button @click="chooseAll" value="all">全部</a-radio-button>
                            <a-radio-button @click="chooseThisWeek" value="thisWeek">本周</a-radio-button>
                            <a-radio-button @click="chooseThisMonth" value="thisMonth">本月</a-radio-button>
                            <a-radio-button @click="chooseThisSeason" value="thisSeason">本季</a-radio-button>
                            <a-radio-button @click="chooseThisYear" value="thisYear">本年</a-radio-button>
                        </a-radio-group>
                    </a-col>
                    <a-col :span="6">
                        <a-range-picker 
                        v-model="activitiesDateRange"
                        :placeholder="['开始日期', '结束日期']"
                        style="width:100%"
                        @change="onActivitiesDateRangeChange"
                        />
                    </a-col>
                </a-row>
                <a-divider />
                <a-row style="margin-top:12px">
                    <a-col :span="24">
                        <div ref="dailyActivities" style="height:480px"></div>
                    </a-col>
                </a-row>
            </div>

            <!--医院活跃前20--> <!--医院活跃率前20-->
            <div :style="{ minHeight: '480px', marginTop: '12px'}">
                <a-row style="background:#f0f2f5">
                    <a-col :span="isMobile?24:12">
                        <div style="background:#fff;padding:24px">
                            <a-row style="margin-top:12px">
                                <a-col :span="6">
                                    <div style="background:#1DA57A">
                                        <div style="background:#fff; text-align:left;font-size:24px;margin-left:8px;padding-left:12px">医院活跃人数 前 20 名</div>
                                    </div>
                                </a-col>
                                <a-col :span="12" style="text-align:right;line-height:32px">
                                    <a-radio-group style="margin-right:20px" defaultValue="today">
                                        <a-radio-button @click="chooseActivityRankToday" value="today">今日</a-radio-button>
                                        <a-radio-button @click="chooseActivityRankYesterday" value="yesterday">昨日</a-radio-button>
                                    </a-radio-group>
                                </a-col>
                                <a-col :span="6">
                                    <a-date-picker 
                                    v-model="activityRankMoment"
                                    placeholder="请选择日期" 
                                    style="width:100%"
                                    @change="onActivityRankDateChange"
                                    />
                                </a-col>
                            </a-row>
                            <a-divider />
                            <a-row>
                                <div ref="activityRank" style="height:480px"></div>
                            </a-row>
                        </div>
                    </a-col>
                    <a-col :span="isMobile?24:12" :style="{paddingLeft: isMobile?'0px':'12px'}">
                        <div style="background:#fff;padding:24px">
                            <a-row style="margin-top:12px">
                                <a-col :span="12">
                                    <div style="background:#1DA57A">
                                        <div style="background:#fff; text-align:left;font-size:24px;margin-left:8px;padding-left:12px">医院活跃率 前 20 名(活跃人数/总人数)</div>
                                    </div>
                                </a-col>
                                <a-col :span="6" style="text-align:right;line-height:32px">
                                    <a-radio-group style="margin-right:20px" defaultValue="today">
                                        <a-radio-button @click="chooseActivityRateToday" value="today">今日</a-radio-button>
                                        <a-radio-button @click="chooseActivityRateYesterday" value="yesterday">昨日</a-radio-button>
                                    </a-radio-group>
                                </a-col>
                                <a-col :span="6">
                                    <a-date-picker 
                                    v-model="activityRankRateMoment"
                                    placeholder="请选择日期" 
                                    style="width:100%"
                                    @change="onActivityRateDateChange"
                                    />
                                </a-col>
                            </a-row>
                            <a-divider />
                            <a-row>
                                <div ref="activityRankRate" style="height:480px"></div>
                            </a-row>
                        </div>
                    </a-col>
                </a-row>
            </div>

            <!--医院平均日活-->
            <div style="background:#fff; padding:24px; margin-top:12px">
                <a-row>
                    <a-col :span="4">
                        <div style="background:#1DA57A">
                            <div style="background:#fff;text-align:left;font-size:24px;margin-left:8px;padding-left:12px">医院平均日活 前20名</div>
                        </div>
                    </a-col>
                    <a-col :span="14" style="text-align:right;line-height:32px">
                        <a-radio-group style="margin-right:20px" defaultValue="thisWeek">
                            <a-radio-button @click="chooseAverageAll" value="all">全部</a-radio-button>
                            <a-radio-button @click="chooseAverageThisWeek" value="thisWeek">本周</a-radio-button>
                            <a-radio-button @click="chooseAverageThisMonth" value="thisMonth">本月</a-radio-button>
                            <a-radio-button @click="chooseAverageThisSeason" value="thisSeason">本季</a-radio-button>
                            <a-radio-button @click="chooseAverageThisYear" value="thisYear">本年</a-radio-button>
                        </a-radio-group>
                    </a-col>
                    <a-col :span="6">
                        <a-range-picker 
                        v-model="averageActivitiesDateRange"
                        :placeholder="['开始日期', '结束日期']"
                        style="width:100%"
                        @change="onActivitiesAverageDateRangeChange"
                        />
                    </a-col>
                </a-row>
                <a-divider />
                <a-row style="margin-top:12px">
                    <a-col :span="24">
                        <div ref="activitiesAverage" style="height:480px"></div>
                    </a-col>
                </a-row>
            </div>

            <!--医院日活数据表-->
            <div style="background:#fff; padding:24px; margin-top:12px">
                <a-row>
                    <a-col :span="4">
                        <div style="background:#1DA57A">
                            <div style="background:#fff;text-align:left;font-size:24px;margin-left:8px;padding-left:12px">医院人数活跃人数所有数据</div>
                        </div>
                    </a-col>
                    <a-col :span="14" style="text-align:right;line-height:32px">
                        <a-radio-group style="margin-right:20px" defaultValue="today">
                            <a-radio-button @click="chooseActivityTableToday" value="today">今日</a-radio-button>
                            <a-radio-button @click="chooseActivityTableYesterday" value="yesterday">昨日</a-radio-button>
                        </a-radio-group>
                    </a-col>
                    <a-col :span="6">
                        <a-date-picker 
                        v-model="activityTableMoment"
                        placeholder="请选择日期" 
                        style="width:100%"
                        @change="onActivityTableDateChange"
                        />
                    </a-col>
                </a-row>
                <a-divider />
                <a-row>
                    <a-table 
                    :columns="columns" 
                    :pagination="pagination"
                    :data-source="activityTable"
                    :rowKey="item => item._id"
                    :loading="activityTableLoading"
                    >
                        <span slot="rate" slot-scope="rate">{{(rate*100).toFixed(2) + " %"}}</span>
                    </a-table>
                </a-row>
            </div>

            <!--自建流程数量变化趋势-->
            <div style="background:#fff; padding:24px; margin-top:12px">
                <a-row>
                    <a-col :span="4">
                        <div style="background:#1DA57A">
                            <div style="background:#fff;text-align:left;font-size:24px;margin-left:8px;padding-left:12px">自建流程数量变化趋势</div>
                        </div>
                    </a-col>
                    <a-col :span="14" style="text-align:right;line-height:32px">
                        <a-radio-group style="margin-right:20px" defaultValue="thisWeek">
                            <a-radio-button @click="chooseIflowStatAll" value="all">全部</a-radio-button>
                            <a-radio-button @click="chooseIflowStatThisWeek" value="thisWeek">本周</a-radio-button>
                            <a-radio-button @click="chooseIflowStatThisMonth" value="thisMonth">本月</a-radio-button>
                            <a-radio-button @click="chooseIflowStatThisSeason" value="thisSeason">本季</a-radio-button>
                            <a-radio-button @click="chooseIflowStatThisYear" value="thisYear">本年</a-radio-button>
                        </a-radio-group>
                    </a-col>
                    <a-col :span="6">
                        <a-range-picker 
                        v-model="iflowStatDateRange"
                        :placeholder="['开始日期', '结束日期']"
                        style="width:100%"
                        @change="onIflowStatDateRangeChange"
                        />
                    </a-col>
                </a-row>
                <a-divider />
                <!--
                <a-row type="flex" justify="start">
                    <span class="c-col-title">选择医院</span>
                    <a-select
                    show-search
                    option-filter-prop="children"
                    defaultValue=""
                    :filter-option="(input, option)=>filterCompany(input, option.componentOptions.children[0].text)"
                    @focus="getCompany"
                    style="width:300px"
                    @change="onSelectCompany"
                    allowClear
                    destroyOnClose
                    >
                        <a-select-opt-group v-for="companyType in companyOptions" :key="companyType.name" :label="companyType.name">
                            <a-select-option v-for="a in companyType.list" :key="a.hospitalId || a._id" :title="a.hospitalName || a.company_name">
                            {{a.hospitalName || a.company_name}}
                            </a-select-option>
                        </a-select-opt-group>
                    </a-select>
                </a-row>
                -->
                <a-row style="margin-top:12px">
                    <a-col :span="24">
                        <div ref="iflowStat" style="height:480px"></div>
                    </a-col>
                </a-row>
            </div>

            <!--医院自建流程数量表-->
            <div style="background:#fff; padding:24px; margin-top:12px">
                <a-row>
                    <a-col :span="4">
                        <div style="background:#1DA57A">
                            <div style="background:#fff;text-align:left;font-size:24px;margin-left:8px;padding-left:12px">医院自建流程数量</div>
                        </div>
                    </a-col>
                    <a-col :span="14" style="text-align:right;line-height:32px">
                        <a-radio-group style="margin-right:20px" defaultValue="today">
                            <a-radio-button @click="chooseCompanyIflowsToday" value="today">今日</a-radio-button>
                            <a-radio-button @click="chooseCompanyIflowsYesterday" value="yesterday">昨日</a-radio-button>
                        </a-radio-group>
                    </a-col>
                    <a-col :span="6">
                        <a-date-picker 
                        v-model="companyIflowsTableMoment"
                        placeholder="请选择日期" 
                        style="width:100%"
                        @change="onCompanyIflowsTableDateChange"
                        />
                    </a-col>
                </a-row>
                <a-divider />
                <a-row>
                    <a-table 
                    :columns="companyIflowsColumns" 
                    :pagination="companyIflowsPagination"
                    :data-source="companyIflowsTable"
                    :rowKey="item => item._id"
                    :loading="companyIflowsTableLoading"
                    >
                    </a-table>
                </a-row>
            </div>
        </a-layout-content>
        <a-layout-footer :style="{ textAlign: 'center' }">
        EMT ©2021 Powered by Samicelus
        </a-layout-footer>
    </a-layout>
</template>
<script>
    import moment from 'moment';
    moment.locale('zh-cn');
    import * as echarts from 'echarts';
    import _ from 'lodash';
    import {getExpire, setExpire, setUnlimit} from '../../lib/localStorage'

    const columns = [
                        {
                            'title':'医院名称',
                            'dataIndex':'company_name',
                            'key':"company_name",
                            'onFilter': (value, record) => record.company_name == value
                        },
                        {
                            'title':'总人数',
                            'dataIndex':'total',
                            'key':"total",
                            'sorter': (a, b) => a.total - b.total
                        },
                        {
                            'title':'日活数',
                            'dataIndex':'count',
                            'key':"count",
                            'sorter': (a, b) => a.count - b.count
                        },
                        {
                            'title':'日活率',
                            'dataIndex':'rate',
                            'key':"rate",
                            'scopedSlots': { 'customRender': 'rate' },
                            'sorter': (a, b) => a.rate - b.rate
                        }
                    ]

    const companyIflowsColumns = [
                        {
                            'title':'医院名称',
                            'dataIndex':'company_name',
                            'key':"company_name",
                            'onFilter': (value, record) => record.company_name == value
                        },
                        {
                            'title':'自建流程数量',
                            'dataIndex':'count',
                            'key':"count",
                            'sorter': (a, b) => a.count - b.count
                        }
                    ]
  export default {
    data() {
      return {
        name:"",
        moment,
        data: [],
        loading: false,
        companyOptions: [
            {type:1, list:[{_id:"",company_name:"全部"}]}
        ],
        companyMap: {},
        company_name: "",
        dailyData: {
            hospitalCount: 0,
            accessCount: 0,
            iflowCount: 0
        },
        dailyDate: new moment().format('YYYY-MM-DD'),
        dailyMoment: new moment(),
        activitiesStartDate: new moment().startOf('week').format('YYYY-MM-DD'),
        activitiesEndDate: new moment().endOf('week').format('YYYY-MM-DD'),
        activitiesDateRange:[new moment().startOf('week'), new moment().endOf('week')],
        dailyActivities: {},
        activityRankDate: new moment().format('YYYY-MM-DD'),
        activityRankMoment: new moment(),
        activityRank: [],
        activityRankRateDate: new moment().format('YYYY-MM-DD'),
        activityRankRateMoment: new moment(),
        activityRankRate: [],
        averageActivitiesStartDate: new moment().startOf('week').format('YYYY-MM-DD'),
        averageActivitiesEndDate: new moment().endOf('week').format('YYYY-MM-DD'),
        averageActivitiesDateRange:[new moment().startOf('week'), new moment().endOf('week')],
        averageActivities: [],
        activityTableDate: new moment().format('YYYY-MM-DD'),
        activityTableMoment: new moment(),
        columns,
        activityTableLoading: false,
        pagination: {
            page:1,
            pageSize:8
        },
        activityTable: [],
        iflowStatStartDate: "",
        iflowStatEndDate: "",
        iflowStatDateRange: [new moment().startOf('week'), new moment().endOf('week')],
        iflowStat: {},
        iflowStatCompanyId: "",
        companyIflowsTableDate: new moment().format('YYYY-MM-DD'),
        companyIflowsTableMoment: new moment(),
        companyIflowsColumns,
        companyIflowsTableLoading: false,
        companyIflowsPagination: {
            page:1,
            pageSize:8
        },
        companyIflowsTable: [],
      };
    },
    props: [],
    methods:{
        // getCompany(){
        //     this.instance
        //     .get(
        //     '/private/consultModulation/company',
        //     {
        //         params: {
        //             hospitalId: this.specifiedCompany||""
        //         }
        //     }
        //     )
        //     .then(response => {
        //         let {list} = response.data;
        //         this.companyOptions = list;
        //         if(list.length){
        //             for(let companyType of list){
        //                 for(let company of companyType.list){
        //                     this.companyMap[company.hospitalId || company._id] = company.hospitalName || company.company_name;
        //                 }
        //             }
        //             this.companyOptions[0].list.push({_id:"",company_name:"全部"})
        //         }
        //     })
        //     .catch(function (error) { // 请求失败处理
        //         console.log(error);
        //     });
        // },
        onSelectCompany(value){
            this.iflowStatCompanyId = value
            this.fetchIflowStat()
        },
        filterCompany(input, text){
            let regex = new RegExp(input,'i');
            return regex.test(text);
        },
        onDailyDateChange(value){
            this.dailyDate = value.format('YYYY-MM-DD');
        },
        chooseToday(){
            this.dailyDate = new moment().format('YYYY-MM-DD');
            this.dailyMoment = new moment();
        },
        chooseYesterday(){
            this.dailyDate = new moment().subtract(1, 'day').format('YYYY-MM-DD');
            this.dailyMoment = new moment().subtract(1, 'day');
        },
        fetchDailyData(){
            this.instance
            .get(
            '/public/dailyData',
            {
                params: {
                    date: this.dailyDate
                }
            }
            )
            .then(response => {
                let result = response.data;
                this.$set(this.dailyData, "hospitalCount" , result.hospitalCount);
                this.$set(this.dailyData, "accessCount" , result.accessCount);
                this.$set(this.dailyData, "iflowCount" , result.iflowCount);
            })
            .catch(function (error) { // 请求失败处理
                console.log(error);
            });
        },
        onActivitiesDateRangeChange(value){
            this.activitiesStartDate = value[0].format('YYYY-MM-DD')
            this.activitiesEndDate = value[1].format('YYYY-MM-DD')
            this.fetchDailyActivities();
        },
        chooseAll(){
            this.activitiesDateRange = [new moment("2021-11-25"), new moment()]
            this.activitiesStartDate = new moment("2021-11-25").format('YYYY-MM-DD');
            this.activitiesEndDate = new moment().format('YYYY-MM-DD');
            this.fetchDailyActivities();
        },
        chooseThisWeek(){
            this.activitiesDateRange = [new moment().startOf('week'), new moment().endOf('week')]
            this.activitiesStartDate = new moment().startOf('week').format('YYYY-MM-DD');
            this.activitiesEndDate = new moment().endOf('week').format('YYYY-MM-DD');
            this.fetchDailyActivities();
        },
        chooseThisMonth(){
            this.activitiesDateRange = [new moment().startOf('month'), new moment().endOf('month')]
            this.activitiesStartDate = new moment().startOf('month').format('YYYY-MM-DD');
            this.activitiesEndDate = new moment().endOf('month').format('YYYY-MM-DD');
            this.fetchDailyActivities();
        },
        chooseThisSeason(){
            this.activitiesDateRange = [new moment().startOf('quarter'), new moment().endOf('quarter')]
            this.activitiesStartDate = new moment().startOf('quarter').format('YYYY-MM-DD');
            this.activitiesEndDate = new moment().endOf('quarter').format('YYYY-MM-DD');
            this.fetchDailyActivities();
        },
        chooseThisYear(){
            this.activitiesDateRange = [new moment().startOf('year'), new moment().endOf('year')]
            this.activitiesStartDate = new moment().startOf('year').format('YYYY-MM-DD');
            this.activitiesEndDate = new moment().endOf('year').format('YYYY-MM-DD');
            this.fetchDailyActivities();
        },
        fetchDailyActivities(){
            this.instance
            .get(
            '/public/dailyActivities',
            {
                params: {
                    startDate: this.activitiesStartDate,
                    endDate: this.activitiesEndDate
                }
            }
            )
            .then(response => {
                let result = response.data;
                this.dailyActivities = result.activities
                this.drawDailyActivities()
            })
            .catch(function (error) { // 请求失败处理
                console.log(error);
            });
        },
        onActivityRankDateChange(value){
            this.activityRankDate = value.format('YYYY-MM-DD');
            this.fetchActivitiesRank();
        },
        chooseActivityRankToday(){
            this.activityRankDate = new moment().format('YYYY-MM-DD');
            this.activityRankMoment = new moment();
            this.fetchActivitiesRank();
        },
        chooseActivityRankYesterday(){
            this.activityRankDate = new moment().subtract(1, 'day').format('YYYY-MM-DD');
            this.activityRankMoment = new moment().subtract(1, 'day');
            this.fetchActivitiesRank();
        },
        fetchActivitiesRank(){
            this.instance
            .get(
            `/public/activitiesRank`,
            {
                params:{
                    date: this.activityRankDate
                }
            }
            )
            .then(response => {
                let result = response.data;
                this.activityRank = result.list;
                this.drawActivitiesRankCharts();
            })
            .catch(function (error) { // 请求失败处理
                console.log(error);
            });
        },
        onActivityRateDateChange(value){
            this.activityRankRateDate = value.format('YYYY-MM-DD');
            this.fetchActivitiesRankRate();
        },
        chooseActivityRateToday(){
            this.activityRankRateDate = new moment().format('YYYY-MM-DD');
            this.activityRankRateMoment = new moment();
            this.fetchActivitiesRankRate();
        },
        chooseActivityRateYesterday(){
            this.activityRankRateDate = new moment().subtract(1, 'day').format('YYYY-MM-DD');
            this.activityRankRateMoment = new moment().subtract(1, 'day');
            this.fetchActivitiesRankRate();
        },
        fetchActivitiesRankRate(){
            this.instance
            .get(
            `/public/activitiesRankRate`,
            {
                params:{
                    date: this.activityRankRateDate
                }
            }
            )
            .then(response => {
                let result = response.data;
                this.activityRankRate = result.list;
                this.drawActivitiesRankRateCharts();
            })
            .catch(function (error) { // 请求失败处理
                console.log(error);
            });
        },
        onActivitiesAverageDateRangeChange(value){
            this.averageActivitiesStartDate = value[0].format('YYYY-MM-DD')
            this.averageActivitiesEndDate = value[1].format('YYYY-MM-DD')
            this.fetchAverageActivities();
        },
        chooseAverageAll(){
            this.averageActivitiesDateRange = [new moment("2021-11-25"), new moment()]
            this.averageActivitiesStartDate = new moment("2021-11-25").format('YYYY-MM-DD');
            this.averageActivitiesEndDate = new moment().format('YYYY-MM-DD');
            this.fetchAverageActivities();
        },
        chooseAverageThisWeek(){
            this.averageActivitiesDateRange = [new moment().startOf('week'), new moment().endOf('week')]
            this.averageActivitiesStartDate = new moment().startOf('week').format('YYYY-MM-DD');
            this.averageActivitiesEndDate = new moment().endOf('week').format('YYYY-MM-DD');
            this.fetchAverageActivities();
        },
        chooseAverageThisMonth(){
            this.averageActivitiesDateRange = [new moment().startOf('month'), new moment().endOf('month')]
            this.averageActivitiesStartDate = new moment().startOf('month').format('YYYY-MM-DD');
            this.averageActivitiesEndDate = new moment().endOf('month').format('YYYY-MM-DD');
            this.fetchAverageActivities();
        },
        chooseAverageThisSeason(){
            this.averageActivitiesDateRange = [new moment().startOf('quarter'), new moment().endOf('quarter')]
            this.averageActivitiesStartDate = new moment().startOf('quarter').format('YYYY-MM-DD');
            this.averageActivitiesEndDate = new moment().endOf('quarter').format('YYYY-MM-DD');
            this.fetchAverageActivities();
        },
        chooseAverageThisYear(){
            this.averageActivitiesDateRange = [new moment().startOf('year'), new moment().endOf('year')]
            this.averageActivitiesStartDate = new moment().startOf('year').format('YYYY-MM-DD');
            this.averageActivitiesEndDate = new moment().endOf('year').format('YYYY-MM-DD');
            this.fetchAverageActivities();
        },
        fetchAverageActivities(){
            this.instance
            .get(
            '/public/averageActivities',
            {
                params: {
                    startDate: this.averageActivitiesStartDate,
                    endDate: this.averageActivitiesEndDate
                }
            }
            )
            .then(response => {
                let result = response.data;
                this.averageActivities = result.list
                this.drawAverageActivitiesCharts()
            })
            .catch(function (error) { // 请求失败处理
                console.log(error);
            });
        },
        onActivityTableDateChange(value){
            this.activityTableDate = value.format('YYYY-MM-DD');
            this.fetchActivityTable();
        },
        chooseActivityTableToday(){
            this.activityTableDate = new moment().format('YYYY-MM-DD');
            this.activityTableMoment = new moment();
            this.fetchActivityTable();
        },
        chooseActivityTableYesterday(){
            this.activityTableDate = new moment().subtract(1, 'day').format('YYYY-MM-DD');
            this.activityTableMoment = new moment().subtract(1, 'day');
            this.fetchActivityTable();
        },
        fetchActivityTable(){
            this.activityTableLoading = true;
            this.instance
            .get(
            `/public/activitiesRankRate`,
            {
                params:{
                    date: this.activityTableDate
                }
            }
            )
            .then(response => {
                this.activityTableLoading = false;
                let result = response.data;
                this.activityTable = result.list;
                this.pagination.page = 1;
                this.pagination.total = this.activityTable.length;
                this.columns[0].filters = result.list.map(item => {
                    return {
                        text: item.company_name,
                        value: item.company_name
                    }
                })
            })
            .catch(function (error) { // 请求失败处理
                this.activityTableLoading = false;
                console.log(error);
            });
        },
        onIflowStatDateRangeChange(value){
            this.iflowStatStartDate = value[0].format('YYYY-MM-DD')
            this.iflowStatEndDate = value[1].format('YYYY-MM-DD')
            this.fetchIflowStat()
        },
        chooseIflowStatAll(){
            this.iflowStatDateRange = [new moment("2021-11-25"), new moment()]
            this.iflowStatStartDate = new moment("2021-11-25").format('YYYY-MM-DD');
            this.iflowStatEndDate = new moment().format('YYYY-MM-DD');
            this.fetchIflowStat()
        },
        chooseIflowStatThisWeek(){
            this.iflowStatDateRange = [new moment().startOf('week'), new moment().endOf('week')]
            this.iflowStatStartDate = new moment().startOf('week').format('YYYY-MM-DD');
            this.iflowStatEndDate = new moment().endOf('week').format('YYYY-MM-DD');
            this.fetchIflowStat()
        },
        chooseIflowStatThisMonth(){
            this.iflowStatDateRange = [new moment().startOf('month'), new moment().endOf('month')]
            this.iflowStatStartDate = new moment().startOf('month').format('YYYY-MM-DD');
            this.iflowStatEndDate = new moment().endOf('month').format('YYYY-MM-DD');
            this.fetchIflowStat()
        },
        chooseIflowStatThisSeason(){
            this.iflowStatDateRange = [new moment().startOf('quarter'), new moment().endOf('quarter')]
            this.iflowStatStartDate = new moment().startOf('quarter').format('YYYY-MM-DD');
            this.iflowStatEndDate = new moment().endOf('quarter').format('YYYY-MM-DD');
            this.fetchIflowStat()
        },
        chooseIflowStatThisYear(){
            this.iflowStatDateRange = [new moment().startOf('year'), new moment().endOf('year')]
            this.iflowStatStartDate = new moment().startOf('year').format('YYYY-MM-DD');
            this.iflowStatEndDate = new moment().endOf('year').format('YYYY-MM-DD');
            this.fetchIflowStat()
        },
        fetchIflowStat(){
            this.instance
            .get(
            '/public/iflowStat',
            {
                params: {
                    startDate: this.iflowStatStartDate,
                    endDate: this.iflowStatEndDate,
                    company_id: this.iflowStatCompanyId
                }
            }
            )
            .then(response => {
                let result = response.data;
                this.iflowStat = result.iflowStat
                this.drawIflowStat()
            })
            .catch(function (error) { // 请求失败处理
                console.log(error);
            });
        },
        onCompanyIflowsTableDateChange(value){
            this.companyIflowsTableDate = value.format('YYYY-MM-DD');
            this.fetchCompanyIflowsTable()
        },
        chooseCompanyIflowsToday(){
            this.companyIflowsTableDate = new moment().format('YYYY-MM-DD');
            this.companyIflowsTableMoment = new moment();
            this.fetchCompanyIflowsTable()
        },
        chooseCompanyIflowsYesterday(){
            this.companyIflowsTableDate = new moment().subtract(1, 'day').format('YYYY-MM-DD');
            this.companyIflowsTableMoment = new moment().subtract(1, 'day');
            this.fetchCompanyIflowsTable()
        },
        fetchCompanyIflowsTable(){
            this.companyIflowsTableLoading = true;
            this.instance
            .get(
            `/public/companyIflows`,
            {
                params:{
                    date: this.companyIflowsTableDate
                }
            }
            )
            .then(response => {
                this.companyIflowsTableLoading = false;
                let result = response.data;
                this.companyIflowsTable = result.list;
                this.companyIflowsPagination.page = 1;
                this.companyIflowsPagination.total = this.companyIflowsTable.length;
                this.companyIflowsColumns[0].filters = result.list.map(item => {
                    return {
                        text: item.company_name,
                        value: item.company_name
                    }
                })
            })
            .catch(function (error) { // 请求失败处理
                this.companyIflowsTableLoading = false;
                console.log(error);
            });
        },
        drawActivitiesRankCharts(){
            let activityRankChart = echarts.init(this.$refs.activityRank);
            activityRankChart.setOption({
                backgroundColor: "#fff",
                toolbox:{
                    show: true,
                    feature:{
                        saveAsImage:{show: true}
                    }
                },
                tooltip: {
                    position: 'top',
                    formatter: function (p) {
                        return p.data.value;
                    }
                },
                grid: {
                    show: true,
                    left: '5%',
                    right: '5%',
                    bottom: '0%',
                    containLabel: true
                },
                xAxis:{
                    show: true,
                    type: 'value',
                    triggerEvent: true
                },
                yAxis: {
                    show: true,
                    type: 'category',
                    triggerEvent: true,
                    axisLabel: {
                        show: true,
                        inside: this.isMobile,
                        color: 'rgba(16,16,16,1)'
                    },
                    data: this.activityRank.map(item=>{
                        return {
                                value:item.company_name
                            }
                        }),
                    inverse: true,
                    animationDuration: 300,
                    animationDurationUpdate: 300,
                    max: 20,
                    zlevel: 2
                },
                series: [
                    {
                        realtimeSort: true,
                        type: 'bar',
                        name: '活跃度',
                        stack: '活跃度',
                        barMaxWidth: 16,
                        data: this.activityRank.map((item, index)=>{
                            return {
                                id: index,
                                value: item.count,
                                name: item.company_name,
                                company_id: item.company_id
                            }
                        }),
                        label: {
                            show: true,
                            position: this.isMobile?'top':'right',
                            valueAnimation: true
                        },
                        itemStyle: {
                            color: '#7DF5CA',
                            shadowBlur: 10,
                            shadowColor: '#333'
                        },
                        zlevel: 1
                    }
                ],
                animationDuration: 0,
                animationDurationUpdate: 3000,
                animationEasing: 'linear',
                animationEasingUpdate: 'linear'
            })
            let that = this;
            activityRankChart.off('click')
            activityRankChart.on('click', function(param){
                let company_id = param.data.company_id;
                that.toCompanyStat(company_id);
            })
        },
        drawActivitiesRankRateCharts(){
            let activityRankRateChart = echarts.init(this.$refs.activityRankRate);
            activityRankRateChart.setOption({
                backgroundColor: "#fff",
                toolbox:{
                    show: true,
                    feature:{
                        saveAsImage:{show: true}
                    }
                },
                tooltip: {
                    position: 'top',
                    formatter: function (p) {
                        return p.data.value;
                    }
                },
                grid: {
                    show: true,
                    left: '5%',
                    right: '5%',
                    bottom: '0%',
                    containLabel: true
                },
                xAxis:{
                    show: true,
                    type: 'value',
                    triggerEvent: true
                },
                yAxis: {
                    show: true,
                    type: 'category',
                    triggerEvent: true,
                    axisLabel: {
                        show: true,
                        inside: this.isMobile,
                        color: 'rgba(16,16,16,1)'
                    },
                    data: this.activityRankRate.map(item=>{
                        return {
                                value:item.company_name
                            }
                        }),
                    inverse: true,
                    animationDuration: 300,
                    animationDurationUpdate: 300,
                    max: 20,
                    zlevel: 2
                },
                series: [
                    {
                        realtimeSort: true,
                        type: 'bar',
                        name: '活跃率',
                        stack: '活跃率',
                        barMaxWidth: 16,
                        data: this.activityRankRate.map((item, index)=>{
                            return {
                                id: index,
                                value: item.rate,
                                name: item.company_name,
                                company_id: item.company_id
                            }
                        }),
                        label: {
                            show: true,
                            position: this.isMobile?'top':'right',
                            valueAnimation: true,
                            formatter: function(params){
                                return (params.data.value * 100).toFixed(2) + " %"
                            }
                        },
                        itemStyle: {
                            color: '#7DF5CA',
                            shadowBlur: 10,
                            shadowColor: '#333'
                        },
                        zlevel: 1
                    }
                ],
                animationDuration: 0,
                animationDurationUpdate: 3000,
                animationEasing: 'linear',
                animationEasingUpdate: 'linear'
            })

            let that = this;
            activityRankRateChart.off('click')
            activityRankRateChart.on('click', function(param){
                let company_id = param.data.company_id;
                that.toCompanyStat(company_id);
            })
        },
        drawAverageActivitiesCharts(){
            let averageActivityChart = echarts.init(this.$refs.activitiesAverage);
            averageActivityChart.setOption({
                backgroundColor: "#fff",
                toolbox:{
                    show: true,
                    feature:{
                        saveAsImage:{show: true}
                    }
                },
                tooltip: {
                    position: 'top',
                    formatter: function (p) {
                        return p.data.value;
                    }
                },
                grid: {
                    show: true,
                    left: '5%',
                    right: '5%',
                    bottom: '0%',
                    containLabel: true
                },
                xAxis:{
                    show: true,
                    type: 'value',
                    triggerEvent: true
                },
                yAxis: {
                    show: true,
                    type: 'category',
                    triggerEvent: true,
                    axisLabel: {
                        show: true,
                        inside: this.isMobile,
                        color: 'rgba(16,16,16,1)'
                    },
                    data: this.averageActivities.map(item=>{
                        return {
                                value:item.company_name
                            }
                        }),
                    inverse: true,
                    animationDuration: 300,
                    animationDurationUpdate: 300,
                    max: 20,
                    zlevel: 2
                },
                series: [
                    {
                        realtimeSort: true,
                        type: 'bar',
                        name: '平均日活',
                        stack: '平均日活',
                        barMaxWidth: 16,
                        data: this.averageActivities.map((item, index)=>{
                            return {
                                id: index,
                                value: item.average,
                                name: item.company_name,
                                company_id: item.company_id
                            }
                        }),
                        label: {
                            show: true,
                            position: 'right',
                            valueAnimation: true,
                            formatter: function(params){
                                return params.data.value.toFixed(2)
                            }
                        },
                        itemStyle: {
                            color: '#7DF5CA',
                            shadowBlur: 10,
                            shadowColor: '#333'
                        },
                        zlevel: 1
                    }
                ],
                animationDuration: 0,
                animationDurationUpdate: 3000,
                animationEasing: 'linear',
                animationEasingUpdate: 'linear'
            })
            let that = this;
            averageActivityChart.off('click')
            averageActivityChart.on('click', function(param){
                console.log(param);
                let company_id = param.data.company_id;
                that.toCompanyStat(company_id);
            })
        },
        drawDailyActivities(){
            let dailyActivitiesChart = echarts.init(this.$refs.dailyActivities);
            dailyActivitiesChart.setOption({
                toolbox:{
                    show: true,
                    feature:{
                        saveAsImage:{show: true}
                    }
                },
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'cross',
                        animation: false,
                        label: {
                            backgroundColor: '#ccc',
                            borderColor: '#aaa',
                            borderWidth: 1,
                            shadowBlur: 0,
                            shadowOffsetX: 0,
                            shadowOffsetY: 0,
                            color: '#222'
                        }
                    },
                    formatter: function (params) {
                        return params[0].data[0] + '<br />' + params[0].data[1] + ' 人'
                    }
                },
                xAxis: {
                    type: 'time',
                    interval: 86400,                //一天秒数
                    min: this.dailyActivities.range[0],
                    max: this.dailyActivities.range[1],
                    axisLabel: {
                        formatter: function(value, index){
                            return moment(value).format('YYYY-MM-DD')
                        }
                    }
                },
                yAxis: {
                    type: 'value'
                },
                series: [
                    {
                        data: this.dailyActivities.data.map((item, index)=>{
                                return [item.time.format, item.count]
                        }),
                        type: 'line'
                    }
                ]
            })
        },
        drawIflowStat(){
            let iflowStatChart = echarts.init(this.$refs.iflowStat);
            iflowStatChart.setOption({
                toolbox:{
                    show: true,
                    feature:{
                        saveAsImage:{show: true}
                    }
                },
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'cross',
                        animation: false,
                        label: {
                            backgroundColor: '#ccc',
                            borderColor: '#aaa',
                            borderWidth: 1,
                            shadowBlur: 0,
                            shadowOffsetX: 0,
                            shadowOffsetY: 0,
                            color: '#222'
                        }
                    },
                    formatter: function (params) {
                        return params[0].data[0] + '<br />' + params[0].data[1] + ' 条'
                    }
                },
                xAxis: {
                    type: 'time',
                    interval: 86400,                //一天秒数
                    min: this.iflowStat.range[0],
                    max: this.iflowStat.range[1],
                    axisLabel: {
                        formatter: function(value, index){
                            return moment(value).format('YYYY-MM-DD')
                        }
                    }
                },
                yAxis: {
                    type: 'value'
                },
                series: [
                    {
                        data: this.iflowStat.data.map((item, index)=>{
                                return [item.time.format, item.count]
                        }),
                        type: 'line'
                    }
                ]
            })
        },
        toCompanyStat(company_id){
            this.$router.push({
                name: 'companyStat',
                query: {
                    company_id
                }
            });
        }
    },
    computed:{
        isMobile:{
            get: function(){
                return navigator.userAgent.match(/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i)
            }
        }
    },
    mounted(){
        this.dailyDate = new moment().format('YYYY-MM-DD')
        let that = this;
        let previousInterval = getExpire('rdStatInterval');
        if(previousInterval){
            clearInterval(previousInterval);
        }
        let interval = setInterval(function(){
            that.fetchDailyData()
            let today = new moment().format('YYYY-MM-DD');
            if(that.activityRankDate == today){
                that.fetchActivitiesRank();
            }
            if(that.activityRankRateDate == today){
                that.fetchActivitiesRankRate();
            }
            if(that.activitiesStartDate <= today && that.activitiesEndDate >= today){
                that.fetchDailyActivities()
            }
            if(that.averageActivitiesStartDate <= today && that.averageActivitiesEndDate >= today){
                that.fetchAverageActivities();
            }
            if(that.iflowStatStartDate <= today && that.iflowStatEndDate >= today){
                that.fetchIflowStat()
            }
        }, 10000);
        setUnlimit('rdStatInterval', interval);
        this.fetchDailyData();
        this.fetchActivitiesRank();
        this.fetchActivitiesRankRate();
        this.fetchDailyActivities();
        this.fetchAverageActivities();
        this.fetchActivityTable()
        this.fetchIflowStat()
        this.fetchCompanyIflowsTable()
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
.c-col-title{
    display:inline-block;
    height:32px;
    line-height: 30px;
    padding: 0 8px;
    border:1px solid #d9d9d9;
    border-right:none;
    background-color:#fafafa;
    vertical-align: top;

}
</style>