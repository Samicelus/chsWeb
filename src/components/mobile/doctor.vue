<template>
    <div>
        <div v-if="mode==='list'">
            <a-layout>
                <a-layout>
                    <a-tabs
                    size="small"
                    default-active-key="wait"
                    @change="onChange"
                    >
                        <a-tab-pane key="wait" class="consultList">
                        <span slot="tab">
                            <a-icon type="shake" />
                            待回复
                        </span>
                        <a-list item-layout="horizontal" :data-source="wait">
                            <a-list-item slot="renderItem" slot-scope="item">
                                <a-list-item-meta
                                :description="`${item.complaint.title}`"
                                >
                                    <a slot="title" href="">
                                    {{`患者:${item.patient_oid.profile.name}`}}
                                        <a-tag :color="item.isCanceled?'orange':(item.isClosed?'blue':'green')">
                                            {{item.isCanceled?'无效咨询':(item.isClosed?'已结束':'进行中')}}
                                        </a-tag>
                                    </a>
                                    <a-badge
                                    :count="item.count"
                                    slot="avatar"
                                    >
                                        <a-avatar
                                        shape="square"
                                        icon="user"
                                        />
                                    </a-badge>
                                </a-list-item-meta>
                                <div>
                                    <a-button
                                    style="margin-right:10px"
                                    @click="e=>enter(item._id)"
                                    >
                                    进入咨询
                                    </a-button>
                                </div>
                            </a-list-item>
                        </a-list>
                        </a-tab-pane>
                        <a-tab-pane key="ongoing" class="consultList">
                        <span slot="tab">
                            <a-icon type="bars" />
                            已回复
                        </span>
                        <a-list item-layout="horizontal" :data-source="ongoing">
                            <a-list-item slot="renderItem" slot-scope="item">
                                <a-list-item-meta
                                :description="`${item.complaint.title}`"
                                >
                                    <p slot="title">
                                    {{`患者姓名:${item.patient_oid.profile.name}`}}
                                        <a-tag :color="item.isCanceled?'orange':(item.isClosed?'blue':'green')">
                                            {{item.isCanceled?'无效咨询':(item.isClosed?'已结束':'进行中')}}
                                        </a-tag>
                                    </p>
                                    <a-avatar
                                    slot="avatar"
                                    shape="square"
                                    icon="user"
                                    />
                                </a-list-item-meta>
                                <div>
                                    <a-button
                                    style="margin-right:10px"
                                    @click="e=>enter(item._id)"
                                    >
                                    进入咨询
                                    </a-button>
                                </div>
                            </a-list-item >
                        </a-list>
                        </a-tab-pane>
                        <a-tab-pane key="finish" class="consultList" :style="`height:${fullHeight}px`">
                        <span slot="tab">
                            <a-icon type="book" />
                            已结束
                        </span>
                        <a-list item-layout="horizontal" :data-source="finish">
                            <a-list-item slot="renderItem" slot-scope="item">
                                <a-list-item-meta
                                :description="`${item.complaint.title}`"
                                >
                                    <a slot="title" href="">
                                    {{`患者姓名:${item.patient_oid.profile.name}`}}
                                        <a-tag :color="item.isCanceled?'orange':(item.isClosed?'blue':'green')">
                                            {{item.isCanceled?'无效咨询':(item.isClosed?'已结束':'进行中')}}
                                        </a-tag>
                                    </a>
                                    <a-avatar
                                    slot="avatar"
                                    shape="square"
                                    icon="user"
                                    />
                                </a-list-item-meta>
                                <div>
                                    <a-button
                                    style="margin-right:10px"
                                    @click="e=>enter(item._id)"
                                    >
                                    进入咨询
                                    </a-button>
                                </div>
                            </a-list-item >
                        </a-list>
                        </a-tab-pane>
                    </a-tabs>
                </a-layout>
            </a-layout>
        </div>
        <div v-if="mode==='consult'">
            <consult :messages="messages" :detail="detail" :consultId="consult_id" :type="'doctor'" :qywx="wx"/>
        </div>
        <div v-if="mode==='advice'">
            <advice :detail="detail" :consultId="consult_id" :medicines="medicines" :advice="savedAdvice"/>
        </div>
        <!--
        <a-row>
            <a-col :span="8">
                <div class="bottomMenu">
                    
                </div>
            </a-col>
            <a-col :span="8">
                <div class="bottomMenu" @click="toList">
                    咨询列表
                </div>
            </a-col>
            <a-col :span="8">
                <div class="bottomMenu">
                    个人中心
                </div>
            </a-col>
        </a-row>
        -->
    </div>
</template>

<script>
import Consult from './consult'
import Advice from './advice'
import { EventBus } from '../../lib/event-bus.js'; //全局事件总线
import wx from 'weixin-js-sdk';

const failStrMap = {
        "ErrorNotOngoingConsult": "咨询不在进行中状态",
        "ErrorConsultClosed": "咨询已关闭",
        "ErrorConsultCanceled": "咨询已取消",
        "ErrorNotValidConsult": "咨询无效",
        "ErrorRecordAlreadyAuthed": "病历已经审核",
        "ErrorNoAdvicePower": "没有开处方的权限",
        "ErrorRecordNotAuthed": "没有已审核的就诊记录",
        "ErrorNotEnoughStorage": "药品库存不足",
        "ErrorNoAdmId": "尚未挂号",
        "ErrorConsultTotalAdvicesPrice": "总处方金额达到上限"
    }

export default {
    name:"doctor",
    data(){
        return {
            fullHeight:document.documentElement.clientHeight,
            wait:[],
            ongoing:[],
            finish:[],
            mode: 'list',
            messages: [],
            detail: {
                record_oid:{
                }
            },
            consult_id: "",
            current_list: "wait",
            lastFetch: "",
            waitLastFetch: "",
            ongoingLastFetch: "",
            finishLastFetch: "",
            medicines: [],
            savedAdvice: {
                diagnosis: "",
                advices: []
            },
            wx
        }
    },
    components:{
        consult: Consult,
        advice: Advice
    },
    methods:{
        enter(id){
            this.consult_id = id;
            this.mode = 'consult';
        },
        toList(){
            this.mode = 'list';
            this.current_list = 'wait';
            this.fetchConsult('wait');
        },
        showMore(){
            this.$message.info('clicked!')
        },
        onChange(key){
            this.current_list = key;
            this.fetchConsult(key);
        },
        processCB(params){
            this[`process${params.method}`](params.result);
        },
        fetchConsult(type){
            if(this.$route.query.app_id){
                this.instance.defaults.headers.common['app-id'] = this.$route.query.app_id;
                let params = {
                    user_id: this.$store.state.user_id,
                    type
                }
                if(this[`${type}LastFetch`]){
                    params.lastFetch = this[`${type}LastFetch`];
                }
                this.instance
                .get(
                `/public/consult`,
                {params}
                )
                .then(response => {
                    let result = response.data;
                    if(!result.result){
                        this.$message.error(result.message);
                        return;
                    }
                    if(!result.notChanged){
                        this[`${result.type}LastFetch`] = result.renewed;
                        this[result.type] = result.list;
                    }
                })
                .catch(function (error) { // 请求失败处理
                    console.log(error);
                });
            }

            window.parent.postMessage({
                cmd: 'callTest',
                params: {
                    method: 'listConsult',
                    data: {
                        type,
                        lastFetch: this[`${type}LastFetch`]
                    },
                    from: 'doctor'
                }
            })
        },
        processauthRecord(result){
            if(!result.result){
                if(result.failStrArr){
                    result.failStrArr.forEach((failStr)=>{
                        this.$message.error(failStrMap[failStr]);
                    })
                }else{
                    this.$message.error(result.message);
                }
                return;
            }
            this.$message.info('审核完成');
        },
        processcloseConsult(result){
            if(!result.result){
                if(result.failStrArr){
                    result.failStrArr.forEach((failStr)=>{
                        this.$message.error(failStrMap[failStr]);
                    })
                }else{
                    this.$message.error(result.message);
                }
                return;
            }
        },
        processfillForm(result){
            if(!result.result){
                if(result.failStrArr){
                    result.failStrArr.forEach((failStr)=>{
                        this.$message.error(failStrMap[failStr]);
                    })
                }else{
                    this.$message.error(result.message);
                }
                return;
            }
            if(result.advice){
                this.savedAdvice = result.advice;
            }else{
                this.savedAdvice = {
                    advices:[],
                    diagnosis: ""
                }
            }
            this.mode = 'advice';
        },
        processcancelAdvice(){
            this.savedAdvice = {};
            this.mode = 'consult';
        },
        processsaveAdvice(result){
            if(!result.result){
                if(result.failStrArr){
                    result.failStrArr.forEach((failStr)=>{
                        this.$message.error(failStrMap[failStr]);
                    })
                }else{
                    this.$message.error(result.message);
                }
                return;
            }
            this.mode = "consult";
            this.$message.info('医嘱已保存')
        },
        processsearchMedicine(result){
            if(!result.result){
                this.$message.error(result.message);
                return;
            }
            this.medicines = result.list;
        },
        processlistConsult(result){
            if(!result.result){
                this.$message.error(result.message);
                return;
            }
            if(!result.notChanged){
                this[`${result.type}LastFetch`] = result.renewed;
                this[result.type] = result.list;
            }
        },
        processconsultDetail(result){
            if(!result.result){
                this.$message.error(result.message);
                return;
            }
            if(!result.notChanged){
                this.messages = result.messages;
                this.detail = result.consult;
                this.lastFetch = result.renewed;
            }
        },
        fetchMessage(){
            if(this.$route.query.app_id){
                this.instance.defaults.headers.common['app-id'] = this.$route.query.app_id;
                let params = {
                        consult_id: this.consult_id,
                        readType: 'patient'
                    };
                this.instance
                .get(
                `/public/consult/detail`,
                {params}
                )
                .then(response => {
                    let result = response.data;
                    if(!result.result){
                        this.$message.error(result.message);
                        return;
                    }
                    if(!result.notChanged){
                        this.messages = result.messages;
                        this.detail = result.consult;
                        this.lastFetch = result.renewed;
                    }
                })
                .catch(function (error) { // 请求失败处理
                    console.log(error);
                });
            }
            window.parent.postMessage({
                cmd: 'callTest',
                params: {
                    method: 'consultDetail',
                    data: {
                        consult_id: this.consult_id,
                        readType: 'patient',
                        lastFetch: this.lastFetch
                    },
                    from: 'doctor'
                }
            })
        },
        processsendDoctorMessage(result){
            if(!result.result){
                this.$message.error(result.message);
            }
            this.fetchMessage();
        },
        handleMessage(event){
            let data = event.data;
            switch (data.cmd){
                case 'cb':
                    this.processCB(data.params);
                break;
                default:
                break;
            }
        }
    },
    mounted(){
        window.removeEventListener('message', this.handleMessage);
        window.addEventListener("message", this.handleMessage);
    },
    created(){
        let that = this;
        if(!this.$route.query.code){
            this.$message.warning('无法获取用户微信授权code');
        }else{
            this.instance
            .post(
            '/private/user/qywechat/login',
            {
                "app_id": this.$route.query.app_id,
                "code": this.$route.query.code
            }
            )
            .then(response => {
                let result = response.data;
                this.$store.commit('saveUserInfo', {user_id:result.user_id, nickname: result.nickname, token:result.token});
                clearInterval(EventBus.doctorJob);
                this.fetchConsult('wait');
                EventBus.doctorJob = setInterval(()=>{
                    if(that.mode === 'consult'){
                        that.fetchMessage();
                    }
                    if(that.mode === 'list'){
                        that.fetchConsult(that.current_list);
                    }
                },10000);
                
                //初始化wx jssdk
                this.wx.config({
                    beta: true,
                    debug: false,
                    appId: result.corpId,
                    timestamp: result.timestamp,
                    nonceStr: result.nonceStr,
                    signature: result.signature,
                    jsApiList: ['startRecord','stopRecord','playVoice','stopVoice','uploadVoice']
                });

                this.wx.ready(function(){
                    // config信息验证后会执行ready方法，所有接口调用都必须在config接口获得结果之后，config是一个客户端的异步操作，所以如果需要在页面加载时就调用相关接口，则须把相关接口放在ready函数中调用来确保正确执行。对于用户触发时才调用的接口，则可以直接调用，不需要放在ready函数中。
                });

                this.wx.error(function(res){
                    that.$message.error(`jssdk配置信息注入失败:${JSON.stringify(res)}`)
                    // config信息验证失败会执行error函数，如签名过期导致验证失败，具体错误信息可以打开config的debug模式查看，也可以在返回的res参数中查看，对于SPA可以在这里更新签名。
                });

            })
            .catch(function (error) { // 请求失败处理
                console.log(error);
            });
        }
        
        EventBus.$off('doctorModeChange');
        EventBus.$on('doctorModeChange', mode => {
            this.mode = mode;
        });
        EventBus.$off('adviceChange');
        EventBus.$on('adviceChange', advice => {
            this.savedAdvice = advice;
        });
        if(this.$route.query.consult_id){
            this.enter(this.$route.query.consult_id);
        }
    },
    beforeDestory(){
        window.removeEventListener('message', this.handleMessage);
        clearInterval(EventBus.doctorJob);
    }
}

</script>

<style>
.navBarDoctor {
    height: 42px;
    background-color: #1DA57A;
    color: white;
    font-size: 16px;
    font-weight: bold;
    line-height: 50px;
}
.consultList {
    overflow: auto;
    text-align: left;
    padding-left: 5px;
}
.bottomMenu {
    height: 35px;
    border:1px solid #ababab;
    line-height: 33px;
    font-weight: bold;
}
.bottomMenu:hover{
    border:1px solid #1da57a;
    color: #1da57a;
}
.head-example {
  width: 42px;
  height: 42px;
  border-radius: 4px;
  background: #eee;
  display: inline-block;
}
</style>