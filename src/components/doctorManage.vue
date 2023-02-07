<template>
  <div :style="{position: 'relative'}">
    <a-drawer
    :width="520"
    destroyOnClose
    placement="right"
    :closable="false"
    @close="onClose"
    :visible="showDetail"
    :getContainer="false"
    :wrap-style="{ position: 'absolute', height: '800px' }"
    >
        <a-descriptions bordered :title="doctor.user_oid && doctor.user_oid.nickname" size="small">
            <a-descriptions-item label="医生姓名" :span="3">
                <a-input v-model="doctor.user_oid.nickname" disabled></a-input>
            </a-descriptions-item>
            <a-descriptions-item label="所在科室" :span="1">
                <a-select
                style="width:100%"
                :defaultValue="doctor.profile.department_oid?doctor.profile.department_oid._id:''" 
                @focus="getDepartments"
                @change="onDepartmentChange"
                >
                    <a-select-option v-for="depart in departments" :key="depart._id" :value="depart._id">
                    {{depart.name}}
                    </a-select-option>
                </a-select>
            </a-descriptions-item>
            <a-descriptions-item label="医生类型" :span="2">
                <a-select 
                v-model="doctor.profile.property"
                @change="onPropertyChange"
                >
                    <a-select-option value="doctor" key="doctor">医生</a-select-option>
                    <a-select-option value="nurse" key="nurse">护士</a-select-option>
                    <a-select-option value="technician" key="technician">技师</a-select-option>
                </a-select>
            </a-descriptions-item>
            <a-descriptions-item label="简介" :span="3">
                <a-textarea 
                :auto-size="{ minRows: 3, maxRows: 3 }" 
                v-model="doctor.profile.description"
                @keyup.enter="e=>onDescriptionChange(e.target.value)"
                @blur="e=>onDescriptionChange(e.target.value)"
                >
                </a-textarea>
            </a-descriptions-item>
            <a-descriptions-item label="职称" :span="1">
                <a-input 
                v-model="doctor.profile.profession"
                @keyup.enter="e=>onProfessionChange(e.target.value)"
                @blur="e=>onProfessionChange(e.target.value)"
                >
                </a-input>
            </a-descriptions-item>
            <a-descriptions-item label="擅长" :span="2">
                <a-input 
                v-model="doctor.profile.sections"
                @keyup.enter="e=>onSectionsChange(e.target.value)"
                @blur="e=>onSectionsChange(e.target.value)"
                >
                </a-input>
            </a-descriptions-item>
            <a-descriptions-item label="权限设置" :span="2">
                <a-switch 
                checked-children="可开处方" 
                un-checked-children="禁开处方" 
                v-model="doctor.hisPower.canGiveAdvice"
                @change="onAdviceChange"
                />
                <br/>
                <a-switch 
                checked-children="可开检验" 
                un-checked-children="禁开检验" 
                v-model="doctor.hisPower.canGiveLab"
                @change="onLabChange" 
                />
                <br/>
                <a-switch 
                checked-children="可开检查" 
                un-checked-children="禁开检查" 
                v-model="doctor.hisPower.canGivePicture" 
                @change="onPictureChange" 
                />
                <br/>
                <a-switch 
                checked-children="可写病历" 
                un-checked-children="禁写病历" 
                v-model="doctor.hisPower.canGiveRecord"
                @change="onRecordChange" 
                />
            </a-descriptions-item>
            <a-descriptions-item label="hisId" :span="1">
                <a-input 
                v-model="doctor.hisPower.hisId"
                @keyup.enter="e=>onHisIdChange(e.target.value)"
                @blur="e=>onHisIdChange(e.target.value)"
                >
                </a-input>
            </a-descriptions-item>
            <a-descriptions-item label="CA认证信息" :span="3">
                <a-badge 
                status="processing" 
                :text="doctor.CA?CA_STATE_MAP[doctor.CA.state]:'未知状态'" 
                :color="doctor.CA?judgeColor(doctor.CA.state):'red'"
                >
                </a-badge>
                <br/>
                <a-input 
                v-model="doctor.CA.idCard"
                @keyup.enter="e=>onIdCardChange(e.target.value)"
                @blur="e=>onIdCardChange(e.target.value)"
                addonBefore="身份证号"
                >
                </a-input>
                <a-divider dashed/>
                <a-input 
                v-model="doctor.CA.professionId"
                @keyup.enter="e=>onProfessionIdChange(e.target.value)"
                @blur="e=>onProfessionIdChange(e.target.value)"
                addonBefore="证件号码"
                >
                    <a-select
                    slot="addonAfter"
                    v-model="doctor.CA.professionIdType"
                    @change="onProfessionIdTypeChange"
                    >
                        <a-select-option value="YS" key="YS">医师资格证</a-select-option>
                    </a-select>
                </a-input>
            </a-descriptions-item>
            <a-descriptions-item label="咨询类型" :span="3">
                <a-row>
                    <a-col :span="12">
                        <a-switch 
                        checked-children="图文咨询" 
                        un-checked-children="关闭图文" 
                        v-model="doctor.consultTypes.text.isOpen"
                        @change="onTextOpenChange"
                        />
                    </a-col>
                    <a-col :span="12">
                        咨询价格：
                        <a-input-number 
                        :min="0"
                        v-model="doctor.consultTypes.text.price"
                        @keyup.enter="e=>onTextPriceChange(e.target.value)"
                        @blur="e=>onTextPriceChange(e.target.value)"
                        >
                        </a-input-number>
                    </a-col>
                </a-row>
                <a-row>
                    <a-col :span="12">
                        <a-switch 
                        checked-children="语音咨询" 
                        un-checked-children="关闭语音" 
                        v-model="doctor.consultTypes.phone.isOpen"
                        @change="onPhoneOpenChange"
                        />
                    </a-col>
                    <a-col :span="12">
                        咨询价格：
                        <a-input-number 
                        :min="0"
                        v-model="doctor.consultTypes.phone.price"
                        @keyup.enter="e=>onPhonePriceChange(e.target.value)"
                        @blur="e=>onPhonePriceChange(e.target.value)"
                        >
                        </a-input-number>
                    </a-col>
                </a-row>
                <a-row>
                    <a-col :span="12">
                        <a-switch 
                        checked-children="视频咨询" 
                        un-checked-children="关闭视频" 
                        v-model="doctor.consultTypes.video.isOpen"
                        @change="onVideoOpenChange"
                        />
                    </a-col>
                    <a-col :span="12">
                        咨询价格：
                        <a-input-number 
                        :min="0"
                        v-model="doctor.consultTypes.video.price"
                        @keyup.enter="e=>onVideoPriceChange(e.target.value)"
                        @blur="e=>onVideoPriceChange(e.target.value)"
                        >
                        </a-input-number>
                    </a-col>
                </a-row>
            </a-descriptions-item>
        </a-descriptions>
    </a-drawer>
    <a-row type="flex" justify="end" style="margin-bottom:10px;">
        <a-col :span="20">
            <a-input-search placeholder="医生姓名/hisId" @search="searchDoctor" allowClear></a-input-search>
        </a-col>
        <a-col :span="4">
            <a-button type="primary" shape="round" @click="showModal"><a-icon type="user-add"/>添加医生</a-button>
        </a-col>
    </a-row>
    <a-modal title="添加医生" v-model="addDoctorVisible" @ok="hideModal" okText="添加" cancelText="取消">
        从组织架构中选取：
        <a-select
        show-search
        :value="tempUserId"
        placeholder="输入医生用户名"
        style="width:72%"
        :default-active-first-option="false"
        :show-arrow="false"
        :filter-option="false"
        :not-found-content="null"
        @search="listCompanyUser"
        @change="onUserSelect"
        >
            <a-select-option v-for="user in companyUsers" :key="user.user_id" :value="user.user_id">
                {{user.nickname}}({{user.phoneno}})
            </a-select-option>
        </a-select>
        <a-input placeholder="职称" v-model="profile.profession" style="margin-top:10px;width:48%"></a-input>
        <a-input placeholder="擅长" v-model="profile.sections" style="margin-left:17px;margin-top:10px;width:48%"></a-input>
        <a-textarea placeholder="添加简介" :rows="4" style="margin-top:10px" v-model="profile.description"/>
        <a-select
            style="margin-top:10px;width:48%"
            placeholder="选择科室"
            @focus="getDepartments"
            @change="selectDepartment"
            >
                <a-select-option v-for="depart in departments" :key="depart._id" :value="depart._id">
                {{depart.name}}
                </a-select-option>
        </a-select>
        <a-select 
        :defaultValue="profile.property"
        style="margin-left:17px;margin-top:10px;width:48%"
        @change="selectProperty"
        >
            <a-select-option value="doctor" key="doctor">医生</a-select-option>
            <a-select-option value="nurse" key="nurse">护士</a-select-option>
            <a-select-option value="technician" key="technician">技师</a-select-option>
        </a-select>
    </a-modal>

    <a-table 
    :columns="columns" 
    :dataSource="data"
    :rowKey="item => item._id"
    :pagination="pagination"
    :loading="loading"
    @change="handleTableChange"
    >
        <a slot="name" slot-scope="text">{{text}}</a>
        <span slot="department" slot-scope="department">
            <p>{{department? department.name: ''}}</p>
        </span>
        <div slot="filterDropdown">
            <a-checkbox-group @change="onFilterChange">
                <div v-for="depart in departments" :key="depart._id">
                    <a-checkbox :value="depart._id" style="margin:5px">
                    {{depart.name}}
                    </a-checkbox>
                </div>
            </a-checkbox-group>
        </div>
        <span slot="hisPower" slot-scope="hisPower">
            <a-tag v-if="hisPower.canGiveAdvice" color="#52c41a"  style="margin-top:2px">
            开处方
            </a-tag>
            <a-tag v-if="hisPower.canGiveLab" color="#32147a" style="margin-top:2px">
            开检验
            </a-tag>
            <a-tag v-if="hisPower.canGivePicture" color="#32147a" style="margin-top:2px">
            开检查
            </a-tag>
            <a-tag v-if="hisPower.canGiveRecord" color="#e3c428" style="margin-top:2px">
            写病历
            </a-tag>
        </span>
        <span slot="CA" slot-scope="CA">
            <a-tag v-if="CA.state" :color="judgeColor(CA.state)">
            {{CA_STATE_MAP[CA.state]}}
            </a-tag>
        </span>
        <span slot="action" slot-scope="text, record">
            <a-tooltip>
            <template slot="title">
                编辑医生信息
            </template>
            <a-button type="primary" shape="circle" icon="edit" style='margin: 5px' @click="editDoctor(record)"></a-button>
            </a-tooltip>
        </span>
    </a-table>
  </div>
</template>
<script>
//import { EventBus } from '../lib/event-bus.js'; //全局事件总线
import lodash from 'lodash';

const CA_STATE_MAP = {                      //CA认证状态码
    "-1": "未进行认证",
    "0": "身份审核通过, 请下载医网签app并在app内下载证书",
    "1": "证书已签发，请在医网签app内设置签章",
    "2": "签章已设置，CA认证流程已完成",
    "3": "未知状态",
    "4": "申请已拒绝，请前往设置并重新提交"
}
const columns = [
    {
        title: '医生',
        dataIndex: 'user_oid.nickname',
        width: '10%',
        key: 'user_oid.nickname'
    },
    {
        title: '科室',
        dataIndex: 'profile.department_oid',
        width: '10%',
        scopedSlots: {
            filterDropdown: 'filterDropdown',
            filterIcon: 'filterIcon',
            customRender: 'department'
        },
        onFilter: (value, record) => {
            console.log(value, record);
        }
    },
    {
        title: '职称',
        dataIndex: 'profile.profession',
        width: '10%',
        key: 'profile.profession'
    },
    {
        title: '擅长',
        dataIndex: 'profile.sections',
        width: '10%',
        key: 'profile.sections'
    },
    {
        title: '权限',
        dataIndex: 'hisPower',
        width: '15%',
        scopedSlots: { customRender: 'hisPower' },
    },
    {
        title: 'CA状态',
        dataIndex: 'CA',
        width: '10%',
        scopedSlots: { customRender: 'CA' },
    },
    {
        title: '操作',
        key: 'action',
        width: '20%',
        scopedSlots: { customRender: 'action' },
    },
];

export default {
    data() {
        return {
            lodash,
            data: [],
            pagination: {},
            loading: false,
            columns,
            mode: 'doctorManage',
            addDoctorVisible: false,
            nameInput: "",
            descriptionInput: "",
            showDetail: false,
            selectedIndex: 0,
            doctor: {
                user_oid:{},
                hisPower:{},
                CA:{},
                profile:{
                    department_oid:{}
                },
                consultTypes:{
                    text:{isOpen:false, isAvailable:false},
                    phone:{isOpen:false, isAvailable:false},
                    video:{isOpen:false, isAvailable:false}
                }
            },
            departments: [],
            CA_STATE_MAP,
            companyUsers: [],
            tempUserId: "",
            profile: {
                profession: "",
                sections: "",
                description: "",
                department_id: "",
                property: "doctor"
            },
            search: "",
            department_ids:[]
        };
    },
    props:['appId'],
    methods:{
        onFilterChange(value){
            this.department_ids = value;
            if(value.length>0){
                this.fetch({
                    page:1,
                    pageSize:15
                });
            }else{
                this.fetch({
                    page:1,
                    pageSize:15
                });
            }
        },
        judgeColor(state){
            switch(state){
                case '-1':
                    return 'yellow';
                case '0':
                    return 'cyan';
                case '1':
                    return 'lime';
                case '2':
                    return 'green';
                case '3':
                    return 'red';
                case '4':
                    return 'orange';
                default:
                    return 'red';
            }
        },
        showModal(){
            this.addDoctorVisible = true;
        },
        hideModal(){
            this.addDoctorVisible = false;
            let profile = {
                ...this.profile
            };
            if(!profile.department_id){
                delete profile.department_id
            }
            let data = {
                app_id: this.appId,
                user_id: this.tempUserId,
                profile,
            };
            let that = this;
            this.instance
            .post(
            '/public/doctor',
            data
            )
            .then(response => {
                let result = response.data;
                if(!result.result){
                    that.$message.error('添加医生失败');
                }
                this.fetch({
                    pageSize: that.pagination.pageSize,
                    page: that.pagination.current
                })
            })
            .catch(function (error) { // 请求失败处理
                console.log(error);
            });
        },
        searchDoctor(value){
            this.search = value;
            this.fetch({
                pageSize:15,
                page:1
            })
        },
        handleTableChange(pagination, filters, sorter) {
            const pager = { ...this.pagination };
            pager.current = pagination.current;
            this.pagination = pager;
            this.fetch({
                pageSize: pagination.pageSize,
                page: pagination.current,
                sortField: sorter.field,
                sortOrder: sorter.order,
                ...filters
            });
        },
        fetch(params = {}) {
            this.loading = true;
            let queryString = {
                params
            }
            queryString.params.app_id = this.appId;
            if(this.search){
                queryString.params.search = this.search;
            }
            console.log(this.department_ids);
            if(this.department_ids.length>0){
                queryString.params.department_ids = JSON.stringify(this.department_ids);
            }

            this.instance
            .get(
            '/public/listDoctor',
            queryString
            )
            .then(response => {
                const pagination = { ...this.pagination };
                let result = response.data;
                pagination.total = result.count;
                pagination.pageSize = result.pageSize;
                this.loading = false;
                this.data = result.list;
                this.pagination = pagination;
            })
            .catch(function (error) { // 请求失败处理
                console.log(error);
            });
        },
        editDoctor(doctor){
            let temp = {
                user_oid:{},
                hisPower:{},
                CA:{},
                profile:{
                    department_oid:{}
                }
            }
            this.doctor = lodash.merge(temp, lodash.cloneDeep(doctor));
            this.showDetail = true;
        },
        onClose(){
            this.showDetail = false;
        },
        getDepartments(){
            this.instance
            .get(
            '/public/listDepartment',
            {
                params:{
                    app_id: this.appId
                }
            }
            )
            .then(response => {
                let result = response.data;
                this.departments = result.list;
            })
            .catch(function (error) { // 请求失败处理
                console.log(error);
            });
        },
        onDepartmentChange(value){
            this.updateDoctor('department_id',value);
        },
        onPropertyChange(value){
            this.updateDoctor('property',value);
        },
        onDescriptionChange(value){
            this.updateDoctor('description',value);
        },
        onSectionsChange(value){
            this.updateDoctor('sections',value);
        },      
        onProfessionChange(value){
            this.updateDoctor('profession',value);
        },
        onAdviceChange(value){
            this.updateDoctor('canGiveAdvice', value.toString());
        },
        onLabChange(value){
            this.updateDoctor('canGiveLab', value.toString());
        },
        onPictureChange(value){
            this.updateDoctor('canGivePicture', value.toString());
        },
        onRecordChange(value){
            this.updateDoctor('canGiveRecord', value.toString());
        },
        onTextOpenChange(value){
            this.updateDoctor('textOpen',value.toString());
        },
        onTextPriceChange(value){
            this.updateDoctor('textPrice',Number(value));
        },
        onPhoneOpenChange(value){
            this.updateDoctor('phoneOpen',value.toString());
        },
        onPhonePriceChange(value){
            this.updateDoctor('phonePrice', Number(value));
        },
        onVideoOpenChange(value){
            this.updateDoctor('videoOpen',value.toString());
        },
        onVideoPriceChange(value){
            this.updateDoctor('videoPrice', Number(value));
        },
        onIdCardChange(value){
            this.updateDoctor('idCard', value);
        },
        onProfessionIdTypeChange(value){
            this.updateDoctor('professionIdType', value);
        },
        onProfessionIdChange(value){
            this.updateDoctor('professionId', value);
        },
        onHisIdChange(value){
            this.updateDoctor('hisId', value);
        },
        updateDoctor(field, value){
            let data = {};
            data[field] = value
            this.instance
            .patch(
            `/public/${this.doctor._id}/doctor`,
            data
            )
            .then(response => {
                let result = response.data;
                if(!result.result){
                    this.$message.error('修改医生信息失败');
                }else{
                    this.fetch({
                        page:1,
                        pageSize:15
                    });
                }
            })
            .catch(function (error) { // 请求失败处理
                console.log(error);
            });
        },
        listCompanyUser(value){
            if(value){
                this.instance
                .get(
                `/public/companyUser`,
                {
                    params: {
                        app_id: this.appId,
                        search: value
                    }
                }
                )
                .then(response => {
                    let result = response.data;
                    if(!result.result){
                        this.$message.error('获取组织用户失败');
                    }else{
                        this.companyUsers = lodash.uniqBy(result.list, 'user_id');
                    }
                })
                .catch(function (error) { // 请求失败处理
                    console.log(error);
                });
            }
        },
        filterCompanyUser(input, text){
            let regex = new RegExp(input);
            return regex.test(text);
        },
        onUserSelect(value){
            console.log(value);
            this.tempUserId = value;
            this.listCompanyUser(value);
        },
        selectDepartment(value){
            this.profile.department_id = value;
        },
        selectProperty(value){
            this.profile.property = value;
        }
    },
    mounted(){
        //注册事件监听
        this.fetch({
            page:1,
            pageSize:15
        });
        this.getDepartments();
    }
};
</script>