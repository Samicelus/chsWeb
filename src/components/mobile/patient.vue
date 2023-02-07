<template>
    <div>
        <div v-if="mode==='doctors'">
        <a-layout>
            <a-layout>
                <div
                :style="{position: 'relative'}"
                >
                    <a-drawer
                        :width="200"
                        placement="left"
                        :closable="false"
                        @close="onClose"
                        :visible="showDepartments"
                        :getContainer="false"
                        :wrap-style="{ position: 'absolute' }"
                    >
                        <a-list item-layout="horizontal" :data-source="departments">
                            <a-list-item slot="renderItem" slot-scope="item" @click="selectDepartment(item._id)">
                                <a-badge
                                slot="extra"
                                :count="item.count"
                                :showZero="true"
                                :number-style="{
                                    backgroundColor: '#1DA57A',
                                }"
                                >
                                </a-badge>
                                <a-list-item-meta>
                                    <a slot="title">{{item.name}}</a>
                                </a-list-item-meta>
                            </a-list-item>
                        </a-list>
                    </a-drawer>
                    <a-list item-layout="horizontal" :data-source="doctors" class="doctorList" :style="`height:${fullHeight-35}px`">
                        <a-list-item slot="renderItem" slot-scope="item">

                            <template slot="actions">
                                <a-rate :default-value="item.score||5" disabled></a-rate>
                            </template>

                            <a-list-item-meta
                            :description="`${item.profile.description} 咨询价格: ${item.consultTypes.text.price}`"
                            >
                                <a slot="title" href="">{{`${item.user_oid?item.user_oid.nickname:item.consultUser_oid?item.consultUser_oid.nickname:''}   职称:${item.profile.profession}`}}</a>
                                <a-avatar slot="avatar" :src="item.user_oid?item.user_oid.avatar:item.consultUser_oid?item.consultUser_oid.avatar:''" />
                            </a-list-item-meta>
                            
                            <a-button
                            shape="circle"
                            type="primary"
                            icon="message"
                            style="margin-right:20px"
                            @click="e=>createConsult(item._id)"
                            >
                            </a-button>
                        </a-list-item>
                    </a-list>
                    </div>
            </a-layout>
        </a-layout>
        </div>
        <div v-if="mode==='list'">
            <a-layout>
                <a-layout-header class="navBarPatient"
                >
                <a-row>
                    <a-col :span="4" :pull="7">
                        <a-button type="primary" icon="left"></a-button>
                    </a-col>
                    <a-col :span="20" :pull="2">
                        <p>我的咨询</p>
                    </a-col>
                    <a-col :span="4">
                    </a-col>
                </a-row>
                </a-layout-header>
            </a-layout>
            <div class="patientConsult">
                <a-list item-layout="horizontal" :data-source="consults">
                    <a-list-item slot="renderItem" slot-scope="item">
                        <a-list-item-meta
                        :description="`${item.complaint.title}`"
                        >
                            <a slot="title" href="">
                            {{`医生:${item.doctor_oid.user_oid?item.doctor_oid.user_oid.nickname:item.doctor_oid.consultUser_oid?item.doctor_oid.consultUser_oid.nickname:''}`}}
                                <a-tag :color="item.isCanceled?'orange':(item.isClosed?'blue':'green')">
                                    {{item.isCanceled?'无效咨询':(item.isClosed?'已结束':'进行中')}}
                                </a-tag>
                            </a>
                            <a-badge
                            :count="item.count||0"
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
            </div>
        </div>
        <div v-if="mode==='consult'">
            <consult :messages="messages" :detail="detail" :consultId="consult_id" :type="'patient'"/>
        </div>
        <a-row>
            <a-col :span="8">
                <div class="bottomMenu" @click="showDep">
                    科室列表
                </div>
            </a-col>
            <a-col :span="8">
                <div class="bottomMenu" @click="toList">
                    我的问诊
                </div>
            </a-col>
            <a-col :span="8">
                <div class="bottomMenu">
                    个人中心
                </div>
            </a-col>
        </a-row>
    </div>
</template>

<script>
import Consult from './consult'
import { EventBus } from '../../lib/event-bus.js'; //全局事件总线

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
    name:"patient",
    data(){
        return {
            fullHeight: document.documentElement.clientHeight,
            consults: [],
            patient_id: '5eddb2bce25cbf004594bc34',
            consult_id: "",
            messages: [],
            detail: {
                record_oid:{}
            },
            mode: 'doctors',
            showDepartments: true,
            departments:[
                {
                    _id: '',
                    name: '全部'
                }
            ],
            doctors:[],
            lastFetch: "",
            listLastFetch: "",
            actions: [
                { type: 'star-o', text: '156' },
                { type: 'like-o', text: '156' },
                { type: 'message', text: '2' },
            ]
        }
    },
    components:{
        consult: Consult
    },
    methods:{
        enter(id){
            this.mode = 'consult';
            this.consult_id = id;
        },
        createConsult(doctor_id){
            window.parent.postMessage({
                cmd: 'callTest',
                params: {
                    method: 'createConsult',
                    data: {
                        doctor_id
                    },
                    from: 'patient'
                }
            })
        },
        getMyConsults(){
            window.parent.postMessage({
                cmd: 'callTest',
                params: {
                    method: 'getMyConsult',
                    data: {
                        patient_id: this.patient_id,
                        lastFetch: this.listLastFetch
                    },
                    from: 'patient'
                }
            })
        },
        selectDepartment(id){
            this.fetchDoctor(id);
            this.showDepartments = false;
        },
        showDep(){
            this.mode = 'doctors';
            this.fetchDepartment();
            this.showDepartments = true;
        },
        toList(){
            this.getMyConsults();
            this.mode = 'list';
            this.showDepartments = false;
        },
        onClose(){
            this.showDepartments = false;
        },
        processCB(params){
            this[`process${params.method}`](params.result);
        },
        fetchDepartment(){
            window.parent.postMessage({
                cmd: 'callTest',
                params: {
                    method: 'getDepartments',
                    data: {},
                    from: 'patient'
                }
            })
        },
        fetchDoctor(department_id){
            window.parent.postMessage({
                cmd: 'callTest',
                params: {
                    method: 'getDoctors',
                    data: {
                        department_id
                    },
                    from: 'patient'
                }
            })
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
        processsendPatientMessage(result){
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
            this.fetchMessage();
        },
        fetchMessage(){
            window.parent.postMessage({
                cmd: 'callTest',
                params: {
                    method: 'consultDetail',
                    data: {
                        consult_id: this.consult_id,
                        readType: 'doctor',
                        lastFetch: this.lastFetch
                    },
                    from: 'patient'
                }
            })
        },
        processgetDoctors(result){
            if(!result.result){
                this.$message.error(result.message);
                return;
            }
            this.doctors = result.list;
        },
        processgetDepartments(result){
            if(!result.result){
                this.$message.error(result.message);
                return;
            }
            this.departments = result.list;
            this.$forceUpdate();
        },
        processcreateConsult(result){
            this.$message.info(result);
        },
        processgetMyConsult(result){
            if(!result.result){
                this.$message.error(result.message);
                return;
            }
            if(!result.notChanged){
                this.listLastFetch = result.renewed;
                this.consults = result.list;
            }
        },
        processaddComment(result){
            if(!result.result){
                this.$message.error(result.message);
                return;
            }else{
                console.log(result);
                this.$message.info('评论成功');
            }
        },
        handlerMessage(event){
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
        window.removeEventListener('message', this.handlerMessage);
        window.addEventListener("message", this.handlerMessage);
    },
    created(){
        let that = this;
        clearInterval(EventBus.patientJob);
        EventBus.patientJob = setInterval(()=>{
            if(that.mode === 'consult'){
                that.fetchMessage();
            }
            if(that.mode === 'list'){
                that.getMyConsults();
            }
        },10000);
    },
    beforeDestroy(){
        window.removeEventListener('message', this.handlerMessage);
        clearInterval(EventBus.patientJob);
    }
}

</script>

<style>
.navBarPatient {
    height: 42px;
    background-color: #1DA57A;
    color: white;
    font-size: 16px;
    font-weight: bold;
    line-height: 50px;
}
.doctorList {
    background-color: white;
    text-align:left;
    padding-left: 5px;
    overflow: auto;
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
.departmentSelector{
    border:1px solid #ababab;
}
.patientConsult {
    height: 500px;
    text-align: left;
    padding-left: 5px;
    overflow: auto;
}
</style>