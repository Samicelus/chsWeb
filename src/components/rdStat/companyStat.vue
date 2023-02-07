<template>
    <a-layout>
        <a-layout-header>
        </a-layout-header>
        <a-layout-content  :style="{ padding: '0 50px', marginTop: '64px' }">

            <div>
                <a-row>
                    <a-col :span="8" style="padding-left:10px" @click="toRdStat()">
                        <a-row type="flex" justify="start" style="font-size:20px">
                            <a-icon type="left" style="padding-top:5px"></a-icon>
                            <span style="margin-left:5px">回到总览</span>
                        </a-row>
                    </a-col>
                </a-row>
            </div>

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
                        <div style="height:300px; background:rgba(234, 245, 255, 1);margin-left:12px;vertical-align:center" >
                            <p style="padding-top:90px;margin-bottom:0px;font-size:64px;font-weight:650;">{{dailyData.accessCount}}</p>
                            <p style="margin-top:0px;font-size:14px;font-weight:400;color:#7F7F7F;">访问总数</p>
                        </div>
                    </a-col>
                    <a-col :span="isMobile?24:8">
                        <div ref="accessRate" style="height:300px"></div>
                    </a-col>
                    <a-col :span="isMobile?24:8">
                        <div style="height:300px; background:rgba(254, 244, 237, 1);margin-left:12px;vertical-align:center" >
                            <p style="padding-top:90px;margin-bottom:0px;font-size:64px;font-weight:650;">{{dailyData.iflowCount}}</p>
                            <p style="margin-top:0px;font-size:14px;font-weight:400;color:#7F7F7F;">自建流程数量</p>
                        </div>
                    </a-col>
                </a-row>
            </div>

            <!--每日访问量趋势-->
            <!--
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
            -->
            
            <!--医院活跃前20--> <!--医院活跃率前20-->

            <div :style="{ minHeight: '480px', marginTop: '12px'}">
                <a-row style="background:#f0f2f5">
                    <a-col :span="24" style="background:#fff;padding:24px">
                        <a-row>
                            <a-col :span="6">
                                <div style="background:#1DA57A">
                                    <div style="background:#fff; text-align:left;font-size:24px;margin-left:8px;padding-left:12px">医互通访问情况</div>
                                </div>
                            </a-col>
                            <a-col :span="12" style="text-align:right;line-height:32px">
                                <a-radio-group style="margin-right:20px" defaultValue="thisWeek">
                                    <a-radio-button @click="chooseAppListAll" value="all">全部</a-radio-button>
                                    <a-radio-button @click="chooseAppListThisWeek" value="thisWeek">本周</a-radio-button>
                                    <a-radio-button @click="chooseAppListThisMonth" value="thisMonth">本月</a-radio-button>
                                    <a-radio-button @click="chooseAppListThisSeason" value="thisSeason">本季</a-radio-button>
                                    <a-radio-button @click="chooseAppListThisYear" value="thisYear">本年</a-radio-button>
                                </a-radio-group>
                            </a-col>
                            <a-col :span="6">
                                <a-range-picker 
                                v-model="appAccessDateRange"
                                :placeholder="['开始日期', '结束日期']"
                                style="width:100%"
                                @change="onAppListDateRangeChange"
                                />
                            </a-col>
                        </a-row>
                    </a-col>
                    <a-col :span="24" style="background:#fff;padding:24px">
                        <a-divider />
                    </a-col>
                    <a-col :span="isMobile?24:12">
                        <div style="background:#fff;padding:24px">
                            <a-row style="margin-top:12px">
                                <a-col :span="6">
                                    <div style="background:#1DA57A">
                                        <div style="background:#fff; text-align:left;font-size:24px;margin-left:8px;padding-left:12px">应用访问情况(次)</div>
                                    </div>
                                </a-col>
                            </a-row>
                            <a-divider />
                            <a-row>
                                <div ref="appList" style="height:480px"></div>
                            </a-row>
                        </div>
                    </a-col>
                    <a-col :span="isMobile?24:12">
                        <div style="background:#fff;padding:24px">
                            <a-row style="margin-top:12px">
                                <a-col :span="12">
                                    <div style="background:#1DA57A">
                                        <div style="background:#fff; text-align:left;font-size:24px;margin-left:8px;padding-left:12px">部门访问情况(次)</div>
                                    </div>
                                </a-col>
                            </a-row>
                            <a-divider />
                            <a-row>
                                <div ref="userList" style="height:480px"></div>
                            </a-row>
                        </div>
                    </a-col>
                </a-row>
            </div>

            <div :style="{ minHeight: '480px', marginTop: '12px'}">
                <a-row style="background:#f0f2f5">
                    <a-col :span="12" style="background:#fff;padding:24px">
                        <a-row>
                            <a-col :span="6">
                                <div style="background:#1DA57A">
                                    <div style="background:#fff; text-align:left;font-size:24px;margin-left:8px;padding-left:12px">用户访问排名</div>
                                </div>
                            </a-col>
                            <a-col :span="12" style="text-align:right;line-height:32px">
                                <a-radio-group style="margin-right:20px" defaultValue="thisWeek">
                                    <a-radio-button @click="chooseUserRankAll" value="all">全部</a-radio-button>
                                    <a-radio-button @click="chooseUserRankThisWeek" value="thisWeek">本周</a-radio-button>
                                    <a-radio-button @click="chooseUserRankThisMonth" value="thisMonth">本月</a-radio-button>
                                    <a-radio-button @click="chooseUserRankThisSeason" value="thisSeason">本季</a-radio-button>
                                    <a-radio-button @click="chooseUserRankThisYear" value="thisYear">本年</a-radio-button>
                                </a-radio-group>
                            </a-col>
                            <a-col :span="6">
                                <a-range-picker 
                                v-model="userRankDateRange"
                                :placeholder="['开始日期', '结束日期']"
                                style="width:100%"
                                @change="onUserRankDateRangeChange"
                                />
                            </a-col>
                        </a-row>
                        <a-divider />
                        <a-row>
                            <div ref="userRank" style="height:480px"></div>
                        </a-row>
                    </a-col>
                    <a-col :span="12" style="background:#fff;padding:24px">
                        <a-row>
                            <a-col :span="6">
                                <div style="background:#1DA57A">
                                    <div style="background:#fff; text-align:left;font-size:24px;margin-left:8px;padding-left:12px">部门访问排名</div>
                                </div>
                            </a-col>
                            <a-col :span="12" style="text-align:right;line-height:32px">
                                <a-radio-group style="margin-right:20px" defaultValue="thisWeek">
                                    <a-radio-button @click="chooseGroupRankAll" value="all">全部</a-radio-button>
                                    <a-radio-button @click="chooseGroupRankThisWeek" value="thisWeek">本周</a-radio-button>
                                    <a-radio-button @click="chooseGroupRankThisMonth" value="thisMonth">本月</a-radio-button>
                                    <a-radio-button @click="chooseGroupRankThisSeason" value="thisSeason">本季</a-radio-button>
                                    <a-radio-button @click="chooseGroupRankThisYear" value="thisYear">本年</a-radio-button>
                                </a-radio-group>
                            </a-col>
                            <a-col :span="6">
                                <a-range-picker 
                                v-model="groupRankDateRange"
                                :placeholder="['开始日期', '结束日期']"
                                style="width:100%"
                                @change="onGroupRankDateRangeChange"
                                />
                            </a-col>
                        </a-row>
                        <a-divider />
                        <a-row>
                            <div ref="groupRank" style="height:480px"></div>
                        </a-row>
                    </a-col>
                </a-row>
            </div>

            <!--医院平均日活-->
            <!--
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
            -->

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
            userCount: 0,
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

        company_id: "",
        appAccessStartDate: new moment().startOf('week').format('YYYY-MM-DD'),
        appAccessEndDate: new moment().endOf('week').format('YYYY-MM-DD'),
        appAccessDateRange:[new moment().startOf('week'), new moment().endOf('week')],
        userList:[],
        appList:[],
        fetchingUserInfo: false,
        userRankStartDate: new moment().startOf('week').format('YYYY-MM-DD'),
        userRankEndDate: new moment().endOf('week').format('YYYY-MM-DD'),
        userRankDateRange:[new moment().startOf('week'), new moment().endOf('week')],
        userRank:[],
        groupRankStartDate: new moment().startOf('week').format('YYYY-MM-DD'),
        groupRankEndDate: new moment().endOf('week').format('YYYY-MM-DD'),
        groupRankDateRange:[new moment().startOf('week'), new moment().endOf('week')],
        groupRank:[],
      };
    },
    props: [],
    methods:{
        
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
                                name: item.company_name
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
                                name: item.company_name
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
                                name: item.company_name
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


        onDailyDateChange(value){
            this.dailyDate = value.format('YYYY-MM-DD');
            this.fetchDailyData()
        },
        chooseToday(){
            this.dailyDate = new moment().format('YYYY-MM-DD');
            this.dailyMoment = new moment();
            this.fetchDailyData()
        },
        chooseYesterday(){
            this.dailyDate = new moment().subtract(1, 'day').format('YYYY-MM-DD');
            this.dailyMoment = new moment().subtract(1, 'day');
            this.fetchDailyData()
        },
        fetchDailyData(){
            this.instance
            .get(
            '/public/companyDailyData',
            {
                params: {
                    date: this.dailyDate,
                    company_id: this.company_id
                }
            }
            )
            .then(response => {
                let result = response.data;
                this.$set(this.dailyData, "userCount" , result.userCount);
                this.$set(this.dailyData, "accessCount" , result.accessCount);
                this.$set(this.dailyData, "iflowCount" , result.iflowCount);
                this.drawAccessRateChart()
            })
            .catch(function (error) { // 请求失败处理
                console.log(error);
            });
        },
        drawAccessRateChart(){
            let accessRateChart = echarts.init(this.$refs.accessRate);
            accessRateChart.setOption({
                toolbox:{
                    show: true,
                    feature:{
                        saveAsImage:{show: true}
                    }
                },
                series:[{
                    type: 'gauge',
                    startAngle: 90,
                    endAngle: -270,
                    pointer: {
                        show: false
                    },
                    progress: {
                        show: true,
                        overlap: false,
                        roundCap: true,
                        clip: false,
                        itemStyle: {
                        borderWidth: 1,
                        borderColor: '#464646'
                        }
                    },
                    axisLine: {
                        lineStyle: {
                        width: 40
                        }
                    },
                    splitLine: {
                        show: false,
                        distance: 0,
                        length: 10
                    },
                    axisTick: {
                        show: false
                    },
                    axisLabel: {
                        show: false,
                        distance: 50
                    },
                    data: [
                        {
                            value: ((this.dailyData.accessCount/this.dailyData.userCount)*100).toFixed(2),
                            name: '活跃率',
                            title: {
                                offsetCenter: ['0%', '-30%']
                            },
                            detail: {
                                valueAnimation: true,
                                offsetCenter: ['0%', '0%']
                            }
                        }
                    ],
                    title: {
                        fontSize: 14
                    },
                    detail: {
                        width: 50,
                        height: 14,
                        fontSize: 14,
                        color: 'auto',
                        borderColor: 'auto',
                        borderRadius: 20,
                        borderWidth: 1,
                        formatter: '{value}%'
                    }
                }]
            })
        },
        onAppListDateRangeChange(value){
            this.appAccessStartDate = value[0].format('YYYY-MM-DD')
            this.appAccessEndDate = value[1].format('YYYY-MM-DD')
            this.fetchAppAccess();
        },
        chooseAppListAll(){
            this.appAccessDateRange = [new moment("2021-11-25"), new moment()]
            this.appAccessStartDate = new moment("2021-11-25").format('YYYY-MM-DD');
            this.appAccessEndDate = new moment().format('YYYY-MM-DD');
            this.fetchAppAccess();
        },
        chooseAppListThisWeek(){
            this.appAccessDateRange = [new moment().startOf('week'), new moment().endOf('week')]
            this.appAccessStartDate = new moment().startOf('week').format('YYYY-MM-DD');
            this.appAccessEndDate = new moment().endOf('week').format('YYYY-MM-DD');
            this.fetchAppAccess();
        },
        chooseAppListThisMonth(){
            this.appAccessDateRange = [new moment().startOf('month'), new moment().endOf('month')]
            this.appAccessStartDate = new moment().startOf('month').format('YYYY-MM-DD');
            this.appAccessEndDate = new moment().endOf('month').format('YYYY-MM-DD');
            this.fetchAppAccess();
        },
        chooseAppListThisSeason(){
            this.appAccessDateRange = [new moment().startOf('quarter'), new moment().endOf('quarter')]
            this.appAccessStartDate = new moment().startOf('quarter').format('YYYY-MM-DD');
            this.appAccessEndDate = new moment().endOf('quarter').format('YYYY-MM-DD');
            this.fetchAppAccess();
        },
        chooseAppListThisYear(){
            this.appAccessDateRange = [new moment().startOf('year'), new moment().endOf('year')]
            this.appAccessStartDate = new moment().startOf('year').format('YYYY-MM-DD');
            this.appAccessEndDate = new moment().endOf('year').format('YYYY-MM-DD');
            this.fetchAppAccess();
        },
        fetchAppAccess(){
            this.instance
            .get(
            '/public/appAccess',
            {
                params: {
                    startDate: this.appAccessStartDate,
                    endDate: this.appAccessEndDate,
                    company_id: this.company_id
                }
            }
            )
            .then(response => {
                let result = response.data;
                this.appList = result.appList;
                this.userList = result.userList;
                this.drawAppListChart();
                this.drawUserListChart();
            })
            .catch(function (error) { // 请求失败处理
                console.log(error);
            });
        },
        drawAppListChart(){
            let that = this
            let appListChart = echarts.init(this.$refs.appList);
            appListChart.setOption({
                toolbox:{
                    show: true,
                    feature:{
                        saveAsImage:{show: true}
                    }
                },
                tooltip: {
                    show: true,
                    trigger: 'item',
                    formatter: function(params){
                        let { user_id, name, userInfo, value, type } = params.data;
                        if(type == 'user'){
                            if(!userInfo){
                                if(!that.fetchingUserInfo){
                                    that.fetchingUserInfo = true;
                                    that.instance
                                    .get(
                                    '/public/showUserInfo',
                                    {
                                        params: {
                                            user_id,
                                            company_id: that.company_id
                                        }
                                    }
                                    )
                                    .then(response => {
                                        let result = response.data;
                                        params.data.userInfo = result;
                                        that.fetchingUserInfo = false;
                                        let {title, phone, group_name, employee_id, last_login_date} = result;
                                        return `姓名: ${name}<br />访问次数: ${value} 次<br />头衔: ${title||''}<br />科室: ${group_name||''}<br />最后登录时间: ${last_login_date||''}`
                                    })
                                    .catch(function (error) { // 请求失败处理
                                        console.log(error);
                                        that.fetchingUserInfo = false;
                                    });
                                }
                            }else{
                                let {title, phone, group_name, employee_id, last_login_date} = userInfo;
                                return `姓名: ${name}<br />访问次数: ${value} 次<br />头衔: ${title||''}<br />科室: ${group_name||''}<br />最后登录时间: ${last_login_date||''}`
                            }
                        }else if(type == 'app'){
                            return `应用名称: ${name}<br />访问次数: ${value}次`
                        }else if(type == 'group'){
                            return `部门名称: ${name}<br />访问次数: ${value}次`
                        }
                    }
                },
                visualMap: {
                    type: 'continuous',
                    inRange: {
                        color: ['#2F93C8', '#AEC48F', '#FFDB5C', '#F98862']
                    }
                },
                series: [
                    {
                        data: this.appList,
                        type: 'sunburst',
                        radius: [60, '90%'],
                        itemStyle: {
                            borderRadius: 7,
                            borderWidth: 2
                        },
                        label: {
                            show: true
                        }
                    }
                ]
            })
        },
        drawUserListChart(){
            let that = this
            let userListChart = echarts.init(this.$refs.userList);
            userListChart.setOption({
                toolbox:{
                    show: true,
                    feature:{
                        saveAsImage:{show: true}
                    }
                },
                tooltip: {
                    show: true,
                    trigger: 'item',
                    formatter: function(params){
                        let { user_id, name, userInfo, value, type } = params.data;
                        if(type == 'user'){
                            if(!userInfo){
                                if(!that.fetchingUserInfo){
                                    that.fetchingUserInfo = true;
                                    that.instance
                                    .get(
                                    '/public/showUserInfo',
                                    {
                                        params: {
                                            user_id,
                                            company_id: that.company_id
                                        }
                                    }
                                    )
                                    .then(response => {
                                        let result = response.data;
                                        params.data.userInfo = result;
                                        that.fetchingUserInfo = false;
                                        let {title, phone, group_name, employee_id, last_login_date} = result;
                                        return `姓名: ${name}<br />访问次数: ${value} 次<br />头衔: ${title||''}<br />科室: ${group_name||''}<br />最后登录时间: ${last_login_date||''}`
                                    })
                                    .catch(function (error) { // 请求失败处理
                                        console.log(error);
                                        that.fetchingUserInfo = false;
                                    });
                                }
                            }else{
                                let {title, phone, group_name, employee_id, last_login_date} = userInfo;
                                return `姓名: ${name}<br />访问次数: ${value} 次<br />头衔: ${title||''}<br />科室: ${group_name||''}<br />最后登录时间: ${last_login_date||''}`
                            }
                        }else if(type == 'app'){
                            return `应用名称: ${name}<br />访问次数: ${value}次`
                        }else if(type == 'group'){
                            return `部门名称: ${name}<br />访问次数: ${value}次`
                        }
                    }
                },
                visualMap: {
                    type: 'continuous',
                    inRange: {
                        color: ['#2F93C8', '#AEC48F', '#FFDB5C', '#F98862']
                    }
                },
                series: [
                    {
                        data: this.userList,
                        type: 'sunburst',
                        radius: [60, '90%'],
                        itemStyle: {
                            borderRadius: 7,
                            borderWidth: 2
                        },
                        label: {
                            show: true
                        }
                    }
                ]
            })
        },
        toRdStat(){
            this.$router.push({
                name: 'rdStat'
            });
        },
        onUserRankDateRangeChange(value){
            this.userRankStartDate = value[0].format('YYYY-MM-DD')
            this.userRankEndDate = value[1].format('YYYY-MM-DD')
            this.fetchUserRank();
        },
        chooseUserRankAll(){
            this.userRankDateRange = [new moment("2021-11-25"), new moment()]
            this.userRankStartDate = new moment("2021-11-25").format('YYYY-MM-DD');
            this.userRankEndDate = new moment().format('YYYY-MM-DD');
            this.fetchUserRank();
        },
        chooseUserRankThisWeek(){
            this.userRankDateRange = [new moment().startOf('week'), new moment().endOf('week')]
            this.userRankStartDate = new moment().startOf('week').format('YYYY-MM-DD');
            this.userRankEndDate = new moment().endOf('week').format('YYYY-MM-DD');
            this.fetchUserRank();
        },
        chooseUserRankThisMonth(){
            this.userRankDateRange = [new moment().startOf('month'), new moment().endOf('month')]
            this.userRankStartDate = new moment().startOf('month').format('YYYY-MM-DD');
            this.userRankEndDate = new moment().endOf('month').format('YYYY-MM-DD');
            this.fetchUserRank();
        },
        chooseUserRankThisSeason(){
            this.userRankDateRange = [new moment().startOf('quarter'), new moment().endOf('quarter')]
            this.userRankStartDate = new moment().startOf('quarter').format('YYYY-MM-DD');
            this.userRankEndDate = new moment().endOf('quarter').format('YYYY-MM-DD');
            this.fetchUserRank();
        },
        chooseUserRankThisYear(){
            this.userRankDateRange = [new moment().startOf('year'), new moment().endOf('year')]
            this.userRankStartDate = new moment().startOf('year').format('YYYY-MM-DD');
            this.userRankEndDate = new moment().endOf('year').format('YYYY-MM-DD');
            this.fetchUserRank();
        },
        fetchUserRank(){
            this.instance
            .get(
            '/public/userRank',
            {
                params: {
                    startDate: this.userRankStartDate,
                    endDate: this.userRankEndDate,
                    company_id: this.company_id
                }
            }
            )
            .then(response => {
                let result = response.data;
                this.userRank = result.userList;
                this.drawUserRankChart();
            })
            .catch(function (error) { // 请求失败处理
                console.log(error);
            });
        },
        drawUserRankChart(){
            let that = this
            let userRankChart = echarts.init(this.$refs.userRank);
            userRankChart.setOption({
                tooltip: {
                    show: true,
                    trigger: 'item',
                    formatter: function(params){
                        let { user_id, name, userInfo, value, type, appList } = params.data;
                        if(type == 'user'){
                            let ol = "";
                            if(appList){
                                ol = "<p>应用访问情况:</p><ol>"+ _.reduce(_.sortBy(appList, 'value').reverse(), (total,item)=>{ return total + `<li>${item.app_name}: ${item.value}</li>`}, "") + "</ol>"
                            }

                            if(!userInfo){
                                if(!that.fetchingUserInfo){
                                    that.fetchingUserInfo = true;
                                    that.instance
                                    .get(
                                    '/public/showUserInfo',
                                    {
                                        params: {
                                            user_id,
                                            company_id: that.company_id
                                        }
                                    }
                                    )
                                    .then(response => {
                                        let result = response.data;
                                        params.data.userInfo = result;
                                        that.fetchingUserInfo = false;
                                        let {title, phone, group_name, employee_id, last_login_date} = result;
                                        console.log(ol)
                                        return '<div style="text-align:left">' + `姓名: ${name}<br />访问次数: ${value} 次<br />头衔: ${title||''}<br />科室: ${group_name||''}<br />手机号: ${phone||''}<br />最后登录时间: ${last_login_date||''}` + ol + '</div>'
                                    })
                                    .catch(function (error) { // 请求失败处理
                                        console.log(error);
                                        that.fetchingUserInfo = false;
                                    });
                                }
                            }else{
                                let {title, phone, group_name, employee_id, last_login_date} = userInfo;
                                return '<div style="text-align:left">' + `姓名: ${name}<br />访问次数: ${value} 次<br />头衔: ${title||''}<br />科室: ${group_name||''}<br />手机号: ${phone||''}<br />最后登录时间: ${last_login_date||''}` + ol + '</div>'
                            }
                        }else if(type == 'app'){
                            return `应用名称: ${name}<br />访问次数: ${value}次`
                        }else if(type == 'group'){
                            return `部门名称: ${name}<br />访问次数: ${value}次`
                        }
                    }
                },
                backgroundColor: "#fff",
                toolbox:{
                    show: true,
                    feature:{
                        saveAsImage:{show: true}
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
                        color: 'rgba(16,16,16,1)'
                    },
                    data: this.userRank.map(item=>{
                        return {
                            value: item.name
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
                        data: this.userRank,
                        label: {
                            show: true,
                            position: 'right',
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
        },

        onGroupRankDateRangeChange(value){
            this.groupRankStartDate = value[0].format('YYYY-MM-DD')
            this.groupRankEndDate = value[1].format('YYYY-MM-DD')
            this.fetchGroupRank();
        },
        chooseGroupRankAll(){
            this.groupRankDateRange = [new moment("2021-11-25"), new moment()]
            this.groupRankStartDate = new moment("2021-11-25").format('YYYY-MM-DD');
            this.groupRankEndDate = new moment().format('YYYY-MM-DD');
            this.fetchGroupRank();
        },
        chooseGroupRankThisWeek(){
            this.groupRankDateRange = [new moment().startOf('week'), new moment().endOf('week')]
            this.groupRankStartDate = new moment().startOf('week').format('YYYY-MM-DD');
            this.groupRankEndDate = new moment().endOf('week').format('YYYY-MM-DD');
            this.fetchGroupRank();
        },
        chooseGroupRankThisMonth(){
            this.groupRankDateRange = [new moment().startOf('month'), new moment().endOf('month')]
            this.groupRankStartDate = new moment().startOf('month').format('YYYY-MM-DD');
            this.groupRankEndDate = new moment().endOf('month').format('YYYY-MM-DD');
            this.fetchGroupRank();
        },
        chooseGroupRankThisSeason(){
            this.groupRankDateRange = [new moment().startOf('quarter'), new moment().endOf('quarter')]
            this.groupRankStartDate = new moment().startOf('quarter').format('YYYY-MM-DD');
            this.groupRankEndDate = new moment().endOf('quarter').format('YYYY-MM-DD');
            this.fetchGroupRank();
        },
        chooseGroupRankThisYear(){
            this.groupRankDateRange = [new moment().startOf('year'), new moment().endOf('year')]
            this.groupRankStartDate = new moment().startOf('year').format('YYYY-MM-DD');
            this.groupRankEndDate = new moment().endOf('year').format('YYYY-MM-DD');
            this.fetchGroupRank();
        },
        fetchGroupRank(){
            this.instance
            .get(
            '/public/groupRank',
            {
                params: {
                    startDate: this.groupRankStartDate,
                    endDate: this.groupRankEndDate,
                    company_id: this.company_id
                }
            }
            )
            .then(response => {
                let result = response.data;
                this.groupRank = result.groupList;
                this.drawGroupRankChart();
            })
            .catch(function (error) { // 请求失败处理
                console.log(error);
            });
        },
        drawGroupRankChart(){
            let that = this
            let groupRankChart = echarts.init(this.$refs.groupRank);
            groupRankChart.setOption({
                tooltip: {
                    show: true,
                    trigger: 'item',
                    formatter: function(params){
                        let { user_id, name, userInfo, value, type, appList } = params.data;
                        if(type == 'user'){
                            let ol = "";
                            if(appList){
                                ol = "<p>应用访问情况:</p><ol>"+ _.reduce(_.sortBy(appList, 'value'), (total,item)=>{ return total + `<li>${item.app_name}: ${item.value}</li>`}, "") + "</ol>"
                            }

                            if(!userInfo){
                                if(!that.fetchingUserInfo){
                                    that.fetchingUserInfo = true;
                                    that.instance
                                    .get(
                                    '/public/showUserInfo',
                                    {
                                        params: {
                                            user_id,
                                            company_id: that.company_id
                                        }
                                    }
                                    )
                                    .then(response => {
                                        let result = response.data;
                                        params.data.userInfo = result;
                                        that.fetchingUserInfo = false;
                                        let {title, phone, group_name, employee_id, last_login_date} = result;
                                        console.log(ol)
                                        return '<div style="text-align:left">' + `姓名: ${name}<br />访问次数: ${value} 次<br />头衔: ${title||''}<br />科室: ${group_name||''}<br />手机号: ${phone||''}<br />最后登录时间: ${last_login_date||''}` + ol + '</div>'
                                    })
                                    .catch(function (error) { // 请求失败处理
                                        console.log(error);
                                        that.fetchingUserInfo = false;
                                    });
                                }
                            }else{
                                let {title, phone, group_name, employee_id, last_login_date} = userInfo;
                                return '<div style="text-align:left">' + `姓名: ${name}<br />访问次数: ${value} 次<br />头衔: ${title||''}<br />科室: ${group_name||''}<br />手机号: ${phone||''}<br />最后登录时间: ${last_login_date||''}` + ol + '</div>'
                            }
                        }else if(type == 'app'){
                            return `应用名称: ${name}<br />访问次数: ${value}次`
                        }else if(type == 'group'){
                            let ol = "";
                            if(appList){
                                ol = "<p>应用访问情况:</p><ol>"+ _.reduce(_.sortBy(appList, 'value').reverse(), (total,item)=>{ return total + `<li>${item.app_name}: ${item.value}</li>`}, "") + "</ol>"
                            }
                            return '<div style="text-align:left">' + `部门名称: ${name}<br />访问次数: ${value}次` + ol + '</div>'
                        }
                    }
                },
                backgroundColor: "#fff",
                toolbox:{
                    show: true,
                    feature:{
                        saveAsImage:{show: true}
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
                        color: 'rgba(16,16,16,1)'
                    },
                    data: this.groupRank.map(item=>{
                        return {
                            value: item.name
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
                        data: this.groupRank,
                        label: {
                            show: true,
                            position: 'right',
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
        },
    },
    computed:{
        isMobile:{
            get: function(){
                return navigator.userAgent.match(/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i)
            }
        }
    },
    mounted(){
        let {company_id} = this.$route.query;
        this.company_id = company_id;
        this.dailyDate = new moment().format('YYYY-MM-DD')
        let that = this;
        let previousInterval = getExpire('rdStatInterval');
        if(previousInterval){
            clearInterval(previousInterval);
        }
        let interval = setInterval(function(){
            this.fetchDailyData()
        }, 10000);
        setUnlimit('rdStatInterval', interval);
        this.fetchDailyData()
        this.fetchAppAccess()
        this.fetchUserRank()
        this.fetchGroupRank()
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