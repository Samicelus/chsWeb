<template>
    <div>
        <a-layout>
        </a-layout>
        <div class="chat"  @click="hideAction" :style="`height:${fullHeight}px`">
            <a-affix :offset-top="10" style="margin-top:10px">
                <a-card>
                    <a-row type="flex" justify="start">
                        <a-col :span="6">
                        <a-avatar
                        shape="square"
                        icon="user"
                        />
                        </a-col>
                        <a-col :span="12" class="consultPatient">
                            <p v-if="detail.patient_oid" >{{detail.patient_oid.profile.name}}</p>
                        </a-col>
                        <a-col :span="6">
                            <a-tag :color="detail.isCanceled?'orange':(detail.isClosed?'blue':'green')">
                                {{detail.isCanceled?'无效咨询':(detail.isClosed?'已结束':'进行中')}}
                            </a-tag>
                        </a-col>
                    </a-row>
                    <a-row>
                        <a-col :span="17" class="consultComplaint">
                            <p v-if="detail.complaint">主诉：{{detail.complaint.title}}</p>
                        </a-col>
                        <a-col :span="7" v-if="type ==='patient' && detail.isClosed === true">
                            <a-button 
                            size="small" 
                            v-if="!detail.consultComment_oid" 
                            @click="openComment" 
                            >
                            {{detail.consultComment_oid?'已评价':'评价'}}
                            </a-button>
                        </a-col>
                        <a-col :span="24">
                            <a-rate
                            :default-value="detail.consultComment_oid.score"
                            v-if="detail.consultComment_oid" 
                            disabled
                            allow-half
                            >
                            </a-rate>
                        </a-col>
                    </a-row>
                </a-card>
                <a-collapse>
                    <a-collapse-panel key="1" header="就诊记录" :bordered="false" class="record">
                        <a-row>
                            <a-col :span="16">
                                <p>{{detail.record_oid.hospital}}</p>
                            </a-col>
                            <a-col :span="8">
                                <a-tag :color="detail.recordAuthed?'blue':'red'">{{detail.recordAuthed?'已审核':'未审核'}}</a-tag>
                            </a-col>
                        </a-row>
                        <a-row>
                            <a-col :span="24">
                                <p>日期:{{detail.record_oid.created}}</p>
                            </a-col>
                        </a-row>
                        <a-row>
                            <a-col :span="24">
                                <p>科室:{{detail.record_oid.department}}, 医生:{{detail.record_oid.doctor}}</p>
                            </a-col>
                        </a-row>
                        <a-row>
                            <a-col :span="24">
                                <p>诊断:{{detail.record_oid.diagnosis}}</p>
                            </a-col>
                        </a-row>
                        <a-row v-if="type==='doctor' && detail.record_oid.status==='wait'">
                            <a-col :span="24">
                                <a-button type="primary" icon="check" @click="authRecord" :disabled="detail.recordAuthed">通过</a-button>
                            </a-col>
                        </a-row>
                    </a-collapse-panel>
                </a-collapse>
            </a-affix>
            <div>
                <a-drawer
                placement="top"
                :closable="true"
                @close="onClose"
                :visible="rate && detail.isClosed === true && !detail.consultComment_oid && type==='patient'"
                :getContainer="false"
                :wrap-style="{ position: 'absolute' }"
                >
                    <p>填写评价</p>
                    <a-rate v-model="score"/>
                    <a-textarea
                    :auto-size="{minRows: 3}"
                    v-model="comments"
                    >
                    </a-textarea>
                    <a-checkbox v-model="anonymous">匿名评价</a-checkbox>
                    <br/>
                    <a-button-group>
                        <a-button
                        @click="addComment"
                        type="primary"
                        >
                        评价
                        </a-button>
                        <a-button
                        @click="onClose"
                        >
                        取消
                        </a-button>
                    </a-button-group>
                </a-drawer>
            <div v-for="item in messages" :key="item._id" style="display:list-item;margin-top:15px">
                <a-row type="flex" align="top">
                    <a-col :span="4">
                        <a-avatar icon="user" v-if="item.from!=type"></a-avatar>
                    </a-col>
                    <a-col :span="16">
                        <p 
                        v-if="item.content" 
                        :class="item.from===type?'messageContent':'otherMessageContent'"
                        >
                        {{item.content}}
                        </p>
                    </a-col>
                    <a-col :span="4">
                        <a-avatar icon="user" v-if="item.from===type"></a-avatar>
                    </a-col>
                </a-row>
            </div>
            </div>
        </div>
        <a-affix :offset-bottom="105">
            <a-row v-show="showActions">
                <a-col :span="4">
                    <a-button
                    v-if="soundInput"
                    type="primary" 
                    icon="border-bottom" 
                    shape="circle"
                    style="background-color:1DA57A;border:0px"
                    @click="toTextInput"
                    ></a-button>
                    <a-button
                    v-else
                    type="primary" 
                    icon="sound" 
                    shape="circle"
                    style="background-color:1DA57A;border:0px"
                    @click="toSoundInput"
                    ></a-button>
                </a-col>
                <a-col :span="4">
                    <a-popconfirm
                        title="结束咨询?"
                        okText="是"
                        cancelText="否"
                        @confirm="closeConsult"
                        @cancel="hideAction"
                    >
                        <a-button 
                        type="primary" 
                        icon="stop" 
                        shape="circle"
                        style="background-color:#eb2f96;border:0px"
                        ></a-button>
                    </a-popconfirm>
                </a-col>
                <a-col :span="4">
                    <a-button 
                    type="primary" 
                    icon="form" 
                    shape="circle"
                    style="background-color:#52c41a;border:0px"
                    @click="fillForm"
                    ></a-button>
                </a-col>
                <a-col :span="4">
                    <a-button 
                    type="primary" 
                    icon="experiment" 
                    shape="circle"
                    style="background-color:#32147a;border:0px"
                    ></a-button>
                </a-col>
                <a-col :span="4">
                    <a-button 
                    type="primary" 
                    icon="folder-open" 
                    shape="circle"
                    style="background-color:#e3c428;border:0px"
                    ></a-button>
                </a-col>
            </a-row>
        </a-affix>
        <div>
            <a-row class="inputFooter" type="flex" justify="center">
                <a-col :span="4">
                    <a-button v-if="type==='doctor'" type="primary" shape="circle" icon="plus" @click="actionButtons"></a-button>
                </a-col>
                <a-col :span="16">
                <a-button v-if="soundInput" :icon="onRecord?'border':'caret-right'" @click="toggleRecord" style="width:100%">{{onRecord?'结束说话':'开始说话'}}</a-button>
                <a-input 
                v-else
                class="inputField"
                :value="tempInput"
                @click="hideAction"
                @change="e=>onInputChange(e.target.value)"
                >
                </a-input>
                </a-col>
                <a-col :span="4">
                <a-button type="primary" shape="round" icon="message" @click="sendMessage"></a-button>
                </a-col>
            </a-row>
        </div>
    </div>
</template>

<script>
import { EventBus } from '../../lib/event-bus.js'; //全局事件总线

const failStrMap = {
        "ErrorNotOngoingConsult": "咨询不在进行状态",
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
    name: 'consult',
    data(){
        return {
            fullHeight:document.documentElement.clientHeight,
            showRecord: false,
            tempInput: "",
            showActions: false,
            rate: true,
            score: 5,
            comments: "非常好",
            anonymous: false,
            soundInput: false,
            onRecord: false
        }
    },
    props: ['messages', 'detail', 'consultId', 'type', 'qywx'],
    methods:{
        toTextInput(){
            this.soundInput = false;
            this.$forceUpdate();
        },
        toSoundInput(){
            this.soundInput = true;
            this.$forceUpdate();
        },
        toggleRecord(){
            let that = this;
            this.onRecord = !this.onRecord;
            this.$forceUpdate();
            if(this.onRecord){
                this.qywx.startRecord();
            }else{
                this.qywx.stopRecord({
                    success: function (res) {
                        let localId = res.localId;
                        that.qywx.playVoice({
                            localId // 需要播放的音频的本地ID，由stopRecord接口获得
                        });

                        that.qywx.uploadVoice({
                            localId, // 需要上传的音频的本地ID，由stopRecord接口获得
                            isShowProgressTips: 1, // 默认为1，显示进度提示
                            success: function (res) {
                                let serverId = res.serverId; // 返回音频的服务器端ID
                                that.sendVoice(serverId);
                            }
                        });
                    }
                });
            }
        },
        sendVoice(serverId){
            if(this.$route.query.code){
                this.instance.defaults.headers.common['app-id'] = this.$route.query.app_id;
                this.instance
                .post(
                `/public/consult/voice/send`,
                {
                    app_id: this.$route.query.app_id,
                    media_id: serverId,
                    consult_id: this.consultId
                }
                )
                .then(response => {
                    let result = response.data;
                    if(result.result){
                        this.$message.info('语音发送成功');
                    }else{
                        this.$message.error('语音发送失败');
                    }
                })
                .catch(function (error) { // 请求失败处理
                    console.log(error);
                });
            }
        },
        onClose(){
            this.rate = false;
        },
        openComment(){
            this.rate = true;
        },
        addComment(){
            this.rate = false;
            if(!this.comments){
                this.$message.error('评论不能为空');
            }
            window.parent.postMessage({
                cmd: 'callTest',
                params: {
                    method: 'addComment',
                    data: {
                        consult_id: this.consultId,
                        score: this.score,
                        comments: this.comments,
                        anonymous: this.anonymous
                    },
                    from: this.type
                }
            })
        },
        authRecord(){
            if(this.$route.query.code){
                this.instance.defaults.headers.common['app-id'] = this.$route.query.app_id;
                this.instance
                .patch(
                `/public/${this.consultId}/record/auth`
                )
                .then(response => {
                    let result = response.data;
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
                })
                .catch(function (error) { // 请求失败处理
                    console.log(error);
                });
            }
            window.parent.postMessage({
                cmd: 'callTest',
                params: {
                    method: 'authRecord',
                    data: {
                        consult_id: this.consultId
                    },
                    from: this.type
                }
            })
        },
        hideAction(){
            this.showActions = false;
        },
        actionButtons(){
            this.showActions = !this.showActions;
        },
        closeConsult(){
            this.showActions = false;
            if(this.$route.query.code){
                this.instance.defaults.headers.common['app-id'] = this.$route.query.app_id;
                this.instance.defaults.headers.common['consult-id'] = this.consultId;
                this.instance
                .patch(
                `/public/${this.consultId}/consult/close`
                )
                .then(response => {
                    let result = response.data;
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
                })
                .catch(function (error) { // 请求失败处理
                    console.log(error);
                });
            }
            window.parent.postMessage({
                cmd: 'callTest',
                params: {
                    method: 'closeConsult',
                    data: {
                        consult_id: this.consultId
                    },
                    from: this.type
                }
            })
        },
        fillForm(){
            this.showActions = false;
            if(this.$route.query.app_id){
                this.instance.defaults.headers.common['app-id'] = this.$route.query.app_id;
                let params = {
                    consult_id: this.consultId
                }
                this.instance
                .get(
                `/public/advice/wait`,
                {
                    params
                }
                )
                .then(response => {
                    let result = response.data;
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
                        EventBus.$emit('adviceChange', result.advice);
                    }else{
                        EventBus.$emit('adviceChange', {
                            advices:[],
                            diagnosis: ""
                        });
                    }
                    EventBus.$emit('doctorModeChange', 'advice');
                })
                .catch(function (error) { // 请求失败处理
                    console.log(error);
                });
            }
            window.parent.postMessage({
                cmd: 'callTest',
                params: {
                    method: 'fillForm',
                    data: {
                        consult_id: this.consultId
                    },
                    from: this.type
                }
            })
        },
        fetchMessage(){
            if(this.$route.query.app_id){
                this.instance.defaults.headers.common['app-id'] = this.$route.query.app_id;
                let params = {
                        consult_id: this.consultId,
                        readType: (this.type == 'patient'?'doctor':'patient')
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
                        consult_id: this.consultId,
                        readType: (this.type == 'patient'?'doctor':'patient')
                    },
                    from: this.type
                }
            })
        },
        onInputChange(value){
            this.tempInput = value;
        },
        sendMessage(){
            this.hideAction();
            if(this.$route.query.app_id){
                this.instance.defaults.headers.common['app-id'] = this.$route.query.app_id;
                this.instance
                .post(
                `/public/message/${this.type}/send`,
                {
                    "content": this.tempInput,
                    "consult_id": this.consultId
                }
                )
                .then(response => {
                    let result = response.data;
                    if(!result.result){
                        this.$message.error(result.message);
                    }
                    this.fetchMessage();
                })
                .catch(function (error) { // 请求失败处理
                    console.log(error);
                });
            }

            if(this.tempInput){
                window.parent.postMessage({
                    cmd: 'callTest',
                    params: {
                        method: `send${this.type=="doctor"?"Doctor":"Patient"}Message`,
                        data: {
                            content: this.tempInput,
                            consult_id: this.consultId
                        },
                        from: this.type
                    }
                })
            }
            this.tempInput = "";
            this.$forceUpdate();
        }
    },
    created(){

    },
    mounted(){
        this.fetchMessage();
    }
}
</script>

<style>
.actionBar {
}
.record {
    text-align: left;
}
.chat {
    width: 100%;
    overflow: auto;
}
.consultPatient {
    font-weight: bold;
    font-size: 14px;
    text-align: left;
}
.consultComplaint {
    text-align: left;
    padding-left: 10px;
}
.inputField {
    border-radius: 8px;
}
.otherMessageContent {
    text-align: left;
    white-space: pre-wrap;
    white-space: -moz-pre-wrap; 
    white-space: -pre-wrap;     
    white-space: -o-pre-wrap;
    word-wrap: break-word;
    word-break: break-all;
    padding: 3px;
    border-radius: 0px 10px 10px 10px;
    border: 0px solid #1a1a1a;
    background-color: #1DA57A;
    position: absolute;
    top: 5px;
    box-shadow: 1px 2px 2px  rgba(0,0,0,0.5);
}
.otherMessageContent:after {
    content: "";
    position: absolute;
    width: 0;
    height: 0;
    border: 10px solid;
    border-radius: 0px 0px 0px 0px;
    border-color: #1DA57A transparent transparent transparent;
    left: -7px;
    top: 0px;
}

.messageContent {
    text-align: left;
    white-space: pre-wrap;
    white-space: -moz-pre-wrap; 
    white-space: -pre-wrap;     
    white-space: -o-pre-wrap;
    word-wrap: break-word;
    word-break: break-all;
    padding: 3px;
    border-radius: 10px 0px 10px 10px;
    border: 0px solid #1a1a1a;
    background-color: #1DA57A;
    position: absolute;
    top: 5px;
    right: 0px;
    box-shadow: 1px 2px 2px  rgba(0,0,0,0.5);
}
.messageContent:after {
    content: "";
    position: absolute;
    width: 0;
    height: 0;
    border: 10px solid;
    border-radius: 0px 0px 0px 0px;
    border-color: #1DA57A transparent transparent transparent;
    right: -7px;
    top: 0px;
}
.inputFooter {
    padding: 5px;
    background-color: #6FF6CB;
}
</style>