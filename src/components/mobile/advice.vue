<template>
    <div>
        <a-layout>
        </a-layout>
        <div class="advice" :style="`height:${fullHeight}px`">
            <a-card :title="detail.patient_oid?detail.patient_oid.profile.name:''" size="small" class="patientInfo">
                <div slot="extra">
                    <a-tag
                    :color="(detail.usedCard && detail.usedCard.cardNo)?'green':'orange'"
                    >
                    {{(detail.usedCard && detail.usedCard.cardNo)?'已绑卡':'未绑卡'}}
                    </a-tag>
                </div>
                <a-row>
                    <a-col :span="16">
                        <a-button type="primary" icon="mail" @click="saveAndSend">发送</a-button>
                    </a-col>
                    <a-col :span="8">
                        <a-button-group>
                            <a-button type="primary" icon="download" @click="saveAdvice"></a-button>
                            <a-button icon="close" @click="cancelAdvice"></a-button>
                        </a-button-group>
                    </a-col>
                </a-row>
            </a-card>
            <a-form-model :model="advice" style="margin:7px">
                <a-form-model-item>
                    <a-card title="诊断" size="small" type="inner" style="text-align:left">
                        <a-button slot="extra">常用诊断</a-button>
                        <a-textarea 
                        :autoSize="{minRows:3,maxRows:3}"
                        v-model="advice.diagnosis"/>
                    </a-card>
                </a-form-model-item>
                <div class="recipe">
                    <div v-for="(advice, index) in advice.advices" :key="advice.medicine_oid.hisMedicine">
                        <a-form-model-item>
                            <a-card size="small" :title="advice.medicine_oid.hisMedicineDesc" class="medicineItem">
                                <a-button-group slot="extra">
                                    <a-button type="danger" size="small" icon="close" @click="e=>remove(index)" ghost></a-button>
                                </a-button-group>
                                <a-row>
                                    <a-col :span="12">
                                    <a-input
                                    v-model="advice.quantity"
                                    @change="e=>onQuantityChange(e.target.value, index)"
                                    style="width:100px"
                                    >
                                        <a-select
                                        slot="addonAfter"
                                        :defaultValue="advice.unit"
                                        @change="value=>onUnitChange(value, index)"
                                        >
                                            <a-select-option v-for="(unit, map_key) in unitMap" :key="map_key">
                                                {{unit}}
                                            </a-select-option>
                                        </a-select>
                                    </a-input>
                                    </a-col>
                                    <a-col :span="12">
                                    <a-input
                                    v-model="advice.dosage"
                                    @change="e=>onDosageChange(e.target.value, index)"
                                    style="width:100px"
                                    >
                                        <a-select
                                        slot="addonAfter"
                                        :defaultValue="advice.dosageUnit"
                                        @change="value=>onDosageUnitChange(value, index)"
                                        >
                                            <a-select-option v-for="(unit, map_key) in unitMap" :key="map_key">
                                                {{unit}}
                                            </a-select-option>
                                        </a-select>
                                    </a-input>
                                    </a-col>
                                </a-row>
                                <br/>
                                <a-row>
                                    <a-col :span="24">
                                    <a-input defaultValue="用法/频次" disabled>
                                        <a-select
                                        :defaultValue="advice.method"
                                        placeholder="请选择用法"
                                        slot="addonBefore"
                                        @change="value=>onMethodChange(value, index)"
                                        style="width:80px"
                                        >
                                            <a-select-option v-for="(method, map_key) in methodMap" :key="map_key">
                                                {{method}}
                                            </a-select-option>
                                        </a-select>
                                        <a-select
                                        :defaultValue="advice.frequency"
                                        slot="addonAfter"
                                        placeholder="请选择频次"
                                        @change="value=>onFrequencyChange(value, index)"
                                        style="width:80px"
                                        >
                                            <a-select-option v-for="(frequency, map_key) in frequencyMap" :key="map_key">
                                                {{frequency}}
                                            </a-select-option>
                                        </a-select>
                                    </a-input>
                                    </a-col>
                                </a-row>
                                <a-row>
                                    <a-col :span="24">
                                        <a-input 
                                        defaultValue="疗程"
                                        style="margin-top:5px"
                                        disabled>
                                            <a-select
                                            slot="addonAfter"
                                            :defaultValue="advice.duration"
                                            placeholder="请选择疗程"
                                            @change="value=>onDurationChange(value, index)"
                                            style="width:80px"
                                            >
                                                <a-select-option v-for="(duration, map_key) in durationMap" :key="map_key">
                                                    {{duration}}
                                                </a-select-option>
                                            </a-select>
                                        </a-input>
                                    </a-col>
                                </a-row>
                                <p>{{methodMap[advice.method]}},{{advice.dosage+unitMap[advice.dosageUnit]}},{{frequencyMap[advice.frequency]}},</p>
                                <p>{{advice.quantity+unitMap[advice.unit]}},合计:￥{{advice.quantity*advice.price}}</p>
                                <a-divider dashed/>
                            </a-card>
                        </a-form-model-item>
                    </div>
                </div>
                <a-form-model-item>
                    <a-button shape="round" type="primary" @click="showAddAdvice">添加医嘱</a-button>
                </a-form-model-item>
            </a-form-model>
        </div>
        <a-modal title="搜索药品" v-model="addAdvice" @ok="addMedicine" okText="添加" cancelText="取消">
            <a-select
            show-search
            placeholder="输入要搜索的药品名称"
            :value="selectedMedicine"
            :default-active-first-option="false"
            :show-arrow="false"
            :filter-option="false"
            :not-found-content="null"
            style="width:83.7%"
            @search="onMedicineSearch"
            @change="onMedicineChange"
            >
                <a-select-option v-for="(medicine, index) in medicines" :key="index">
                    {{medicine.hisMedicineDesc}}
                </a-select-option>
            </a-select>
        </a-modal>
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
    data(){
        return {
            fullHeight:document.documentElement.clientHeight,
            addAdvice: false,
            selectedMedicine: undefined,
            methodMap: {
                "109": "口服"
            },
            unitMap: {
                "1": "片",
                "22": "盒"
            },
            frequencyMap: {
                "13": "一日三次"
            },
            durationMap: {
                "117": "8周"
            }
        }
    },
    props: ['detail', 'consultId', 'medicines', 'advice'],
    components:{

    },
    methods:{
        remove(index){
            this.advice.advices.splice(index,1);
        },
        saveAdvice(){
            if(!this.advice.diagnosis){
                this.$message.error('请填写诊断');
                return;
            }
            if(this.advice.advices.length == 0){
                this.$message.error('医嘱不能为空');
                return;
            }
            if(this.$route.query.app_id){
                let body = {
                    app_id: this.$route.query.app_id,
                    consult_id: this.consultId,
                    diagnosis: this.advice.diagnosis,
                    diagnosisType: "first",
                    notes: "",
                    advices: this.advice.advices.map(item=>{
                        item.medicine_id = item.medicine_oid._id;
                        delete item.medicine_oid;
                        return item;
                    })
                }
                this.instance
                .post(
                `/public/advice/create`,
                body
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
                    EventBus.$emit('doctorModeChange', 'consult');
                    this.$message.info('医嘱已保存')
                })
                .catch(function (error) { // 请求失败处理
                    console.log(error);
                });
            }

            window.parent.postMessage({
                cmd: 'callTest',
                params: {
                    method: 'saveAdvice',
                    data: {
                        consult_id: this.consultId,
                        diagnosis: this.advice.diagnosis,
                        advices: this.advice.advices
                    },
                    from: 'doctor'
                }
            });
        },
        saveAndSend(){
            if(!this.advice.diagnosis){
                this.$message.error('请填写诊断');
                return;
            }
            if(this.advice.advices.length == 0){
                this.$message.error('医嘱不能为空');
                return;
            }
        },
        cancelAdvice(){
            if(this.$route.query.code){
                EventBus.$emit('doctorModeChange', 'consult');
            }
            window.parent.postMessage({
                cmd: 'callTest',
                params: {
                    method: 'cancelAdvice',
                    data: {},
                    from: 'doctor'
                }
            })
        },
        showAddAdvice(){
            this.addAdvice = true;
        },
        onMedicineSearch(value){
            if(this.$route.query.code){
                this.instance.defaults.headers.common['app-id'] = this.$route.query.app_id;
                let params = {
                    app_id: this.$route.query.app_id,
                    keyWord: value
                }
                this.instance
                .get(
                `/public/advice/medicines`,
                {
                    params
                }
                )
                .then(response => {
                    let result = response.data;
                    if(!result.result){
                        this.$message.error(result.message);
                        return;
                    }
                    this.medicines = result.list;
                })
                .catch(function (error) { // 请求失败处理
                    console.log(error);
                });
            }
            window.parent.postMessage({
                cmd: 'callTest',
                params: {
                    method: 'searchMedicine',
                    data: {
                        search: value
                    },
                    from: 'doctor'
                }
            });
        },
        onMedicineChange(value){
            this.selectedMedicine = value;
        },
        addMedicine(){
            let medicine = this.medicines[this.selectedMedicine]
            this.advice.advices.push({
                medicine_oid: medicine,
                price: medicine.hisUnitPrice,
                quantity: 1,
                unit: medicine.hisUom,
                dosage: 1,
                dosageUnit: medicine.hisDosageUom,
                method: "",
                duration: "",
                frequency: "",
            })
            this.addAdvice = false;
            this.medicines = [];
        },
        onDosageChange(value, index){
            this.advice.advices[index].dosage = Number(value);
        },
        onQuantityChange(value, index){
            this.advice.advices[index].quantity = Number(value);
        },
        onUnitChange(value, index){
            this.advice.advices[index].unit = value;
        },
        onDosageUnitChange(value, index){
            this.advice.advices[index].dosageUnit = value;
        },
        onMethodChange(value, index){
            this.advice.advices[index].method = value;
        },
        onFrequencyChange(value, index){
            this.advice.advices[index].frequency = value;
        },
        onDurationChange(value, index){
            this.advice.advices[index].duration = value;
        }
    },
    created(){
        console.log(this.detail);
    },
    mounted(){

    },
    beforeDestory(){

    }
}
</script>

<style>
.patientInfo {
    text-align: left;
}
.advice {
    width: 100%;
    overflow: auto;
    background-color: #e4e4e4;
}
.recipe {
    background-color: white;
    z-index:2;
    box-shadow: 1px 2px 2px  rgba(0,0,0,0.2);
}
.medicineItem {
    text-align: left;
}
</style>