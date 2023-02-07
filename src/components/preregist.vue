<template>
    <div>
        <a-row>
            <a-menu v-model="current" mode="horizontal" theme="dark" style="flex:1">
                <a-menu-item v-for="item in steps" :key="item.title" class="main-menu" disabled>{{item.title}}</a-menu-item>
            </a-menu>
        </a-row>

        <div id="personal" v-if="current[0]=='个人信息'">
            <a-card size="small">
                <a-divider orientation="left"><a-icon type="contacts"></a-icon>个人基本信息</a-divider>
                <a-input placeholder="请输入姓名" v-model="preregist.personal.name" @blur="savePersonalDraft">
                    <div slot="addonBefore" :style="inputLabelStyle">姓名</div>
                </a-input>
                <a-input placeholder="请输入联系方式" v-model="preregist.personal.phone" @blur="savePersonalDraft">
                    <div slot="addonBefore" :style="inputLabelStyle">联系电话</div>
                </a-input>
                <a-input placeholder="请输入本人籍贯" v-model="preregist.personal.origin" @blur="savePersonalDraft">
                    <div slot="addonBefore" :style="inputLabelStyle">籍贯</div>
                </a-input>
                <a-input placeholder="请输入出生地点" v-model="preregist.personal.placeOfBirth" @blur="savePersonalDraft">
                    <div slot="addonBefore" :style="inputLabelStyle">出生地</div>
                </a-input>
                <a-input placeholder="请输入本人身份证号码" v-model="preregist.personal.identityCard" @blur="e=>saveIdentityCard(e.target.value)">
                    <div slot="addonBefore" :style="inputLabelStyle">身份证号码</div>
                </a-input>
                <a-button :style="buttonLableStyle">出生日期</a-button>
                <a-date-picker placeholder="请先输入身份证号码" :style="selectStyle" v-model="preregist.personal.dateOfBirth" @change="savePersonalDraft" disabled/>
                <a-input placeholder="请输入本人身高(CM)" addonAfter="CM" v-model="preregist.personal.height" @blur="savePersonalDraft">
                    <div slot="addonBefore" :style="inputLabelStyle">身高</div>
                </a-input>
                <a-input defaultValue="民族" disabled>
                    <a-select placeholder="请选择民族" :options="ethnicOptions" slot="addonAfter" :style="selectStyle"
                    v-model="preregist.personal.ethnic"
                    @change="savePersonalDraft">
                    </a-select>
                </a-input>
                <a-input defaultValue="政治面貌" disabled>
                    <a-select placeholder="请选择政治面貌" :options="partyOptions" slot="addonAfter" :style="selectStyle"
                    v-model="preregist.personal.party"
                    @change="savePersonalDraft">
                    </a-select>
                </a-input>
                <a-input defaultValue="婚姻状况" disabled>
                    <a-select placeholder="请选择婚姻状况" :options="marriageOptions" slot="addonAfter" :style="selectStyle"
                    v-model="preregist.personal.marriage"
                    @change="savePersonalDraft">
                    </a-select>
                </a-input>
                <a-button :style="wideButtonLableStyle">参加工作时间</a-button>
                <a-date-picker placeholder="请选择参加工作时间" :style="narrowSelectStyle" v-model="preregist.personal.startOfWork" @change="savePersonalDraft"/>
                <a-input placeholder="请输入现有专业技术资格" v-model="preregist.personal.qualified" @blur="savePersonalDraft">
                    <div slot="addonBefore" style="width:110px">现有专业技术资格</div>
                </a-input>
                <a-input placeholder="请输入本人联系邮箱" v-model="preregist.personal.email" @blur="savePersonalDraft">
                    <div slot="addonBefore" :style="inputLabelStyle">电子邮箱</div>
                </a-input>
            </a-card>
            <a-card  size="small">
                <a-divider orientation="left"><a-icon type="rise"></a-icon>主要工作业绩</a-divider>
                <a-textarea placeholder="请输入主要工作业绩" :auto-size="{ minRows: 3, maxRows: 6 }"
                 v-model="preregist.personal.achievement"
                 @blur="savePersonalDraft">
                </a-textarea>
            </a-card>
            <a-card  size="small">
                <a-divider orientation="left"><a-icon type="experiment"></a-icon>科研情况</a-divider>
                <a-textarea placeholder="请输入个人科研情况" :auto-size="{ minRows: 3, maxRows: 6 }"
                 v-model="preregist.personal.academic"
                 @blur="savePersonalDraft">
                </a-textarea>
            </a-card>
            <a-card  size="small">
                <a-divider orientation="left"><a-icon type="star"></a-icon>奖惩情况</a-divider>
                <a-textarea placeholder="请输入个人奖惩情况" :auto-size="{ minRows: 3, maxRows: 6 }"
                 v-model="preregist.personal.award"
                 @blur="savePersonalDraft">
                </a-textarea>
            </a-card>
            <a-card  size="small">
                <a-divider orientation="left"><a-icon type="solution"></a-icon>自我评价</a-divider>
                <a-textarea placeholder="请输入自我评价信息" :auto-size="{ minRows: 3, maxRows: 6 }"
                 v-model="preregist.personal.comment"
                 @blur="savePersonalDraft">
                </a-textarea>
            </a-card>
            <a-divider></a-divider>
        </div>

        <div id="study" v-if="current[0]=='学习经历'">
            <a-card size="small">
                <a-divider orientation="left"><a-icon type="book"></a-icon>学习经历(高中以后)</a-divider>
                <a-card size="small" v-for="(study, sIndex) of preregist.study" :key="study._id">
                    <a slot="extra" @click="e=>deleteStudy(sIndex)">删除</a>
                    <a-input placeholder="请输入教学机构名称" v-model="study.school" @blur="saveStudyDraft">
                        <div slot="addonBefore" :style="inputLabelStyle">毕业学校</div>
                    </a-input>
                    <a-button :style="buttonLableStyle">入学日期</a-button>
                    <a-date-picker placeholder="请选择入学日期" :style="innerStyle" v-model="study.dateOfStart" @change="saveStudyDraft"/>
                    <a-button :style="buttonLableStyle">毕业日期</a-button>
                    <a-date-picker placeholder="请选择毕业日期" :style="innerStyle" v-model="study.dateOfEnd" @change="saveStudyDraft"/>
                    <a-input placeholder="请输入学习专业" v-model="study.specialty" @blur="saveStudyDraft">
                        <div slot="addonBefore" :style="inputLabelStyle">专业</div>
                    </a-input>
                    <a-input placeholder="请输入获得学历" v-model="study.education" @blur="saveStudyDraft">
                        <div slot="addonBefore" :style="inputLabelStyle">学历</div>
                    </a-input>
                    <a-input placeholder="请输入获得学位" v-model="study.degree" @blur="saveStudyDraft">
                        <div slot="addonBefore" :style="inputLabelStyle">学位</div>
                    </a-input>
                    <a-input defaultValue="形式" disabled>
                        <a-select placeholder="请选择学习形式" :options="formOptions" slot="addonAfter" :style="innerStyle"
                         v-model="study.form"
                         @change="saveStudyDraft">
                        </a-select>
                    </a-input>
                </a-card>
                <a-button style="margin-top:10px" @click="addStudy">添加经历</a-button>
            </a-card>
        </div>

        <div id="work" v-if="current[0]=='工作经历'">
            <a-card size="small">
                <a-divider orientation="left"><a-icon type="book"></a-icon>工作经历(首次参加工作起)</a-divider>
                <a-card size="small" v-for="(work, wIndex) of preregist.work" :key="work._id">
                    <a slot="extra" @click="e=>deleteWork(wIndex)">删除</a>
                    <a-input placeholder="请输入单位名称" v-model="work.company" @blur="saveWorkDraft">
                        <div slot="addonBefore" :style="inputLabelStyle">所在单位</div>
                    </a-input>
                    <a-button :style="buttonLableStyle">入职日期</a-button>
                    <a-date-picker placeholder="请选择入职日期" :style="innerStyle" v-model="work.dateOfStart" @change="saveWorkDraft"/>
                    <a-button :style="buttonLableStyle">离职日期</a-button>
                    <a-date-picker placeholder="请选择离职日期" :style="innerStyle" v-model="work.dateOfEnd" @change="saveWorkDraft"/>
                    <a-input placeholder="请输入担任职务" v-model="work.job" @blur="saveWorkDraft">
                        <div slot="addonBefore" :style="inputLabelStyle">职务</div>
                    </a-input>
                </a-card>
                <a-button style="margin-top:10px" @click="addWork">添加经历</a-button>
            </a-card>
        </div>

        <div id="profession" v-if="current[0]=='专业信息'">
            <a-card size="small">
                <a-divider orientation="left"><a-icon type="tool"></a-icon>专业技术职务信息</a-divider>
                <a-card size="small" v-for="(profession, pIndex) of preregist.profession" :key="profession._id">
                    <a slot="extra" @click="e=>deleteProfession(pIndex)">删除</a>
                    <a-input placeholder="请输入现有资格名称" v-model="profession.qualified" @blur="saveProfessionDraft">
                        <div slot="addonBefore" style="width:110px">现有专业技术资格</div>
                    </a-input>
                    <a-input placeholder="请输入专业名称,如：外科学" v-model="profession.specialty" @blur="saveProfessionDraft">
                        <div slot="addonBefore" :style="inputLabelStyle">专业名称</div>
                    </a-input>
                    <a-button :style="buttonLableStyle">取得时间</a-button>
                    <a-date-picker placeholder="请选择取得时间" :style="innerStyle" v-model="profession.dateOfAquisition" @change="saveProfessionDraft"/>
                    <a-input placeholder="请输入发证单位名称" v-model="profession.issue" @blur="saveProfessionDraft">
                        <div slot="addonBefore" :style="inputLabelStyle">发证单位</div>
                    </a-input>
                </a-card>
                <a-button style="margin-top:10px" @click="addProfession">添加信息</a-button>
            </a-card>
        </div>

        <div id="family" v-if="current[0]=='家庭成员'">
            <a-card size="small">
                <a-divider orientation="left"><a-icon type="home"></a-icon>家庭基本信息</a-divider>
                <a-card size="small" v-for="(family, fIndex) of preregist.family" :key="family._id">
                    <a slot="extra" @click="e=>deleteFamily(fIndex)">删除</a>
                    <a-input placeholder="请输入家庭成员姓名" v-model="family.name" @blur="saveFamilyDraft">
                        <div slot="addonBefore" style="width:90px">家庭成员姓名</div>
                    </a-input>
                    <a-input placeholder="请输入家庭成员关系" v-model="family.relation" @blur="saveFamilyDraft">
                        <div slot="addonBefore" :style="inputLabelStyle">关系</div>
                    </a-input>
                    <a-input placeholder="请输入成员年龄" addonAfter="岁" v-model="family.age" @blur="saveFamilyDraft">
                        <div slot="addonBefore" :style="inputLabelStyle">年龄</div>
                    </a-input>
                    <a-input placeholder="请输入单位名称" v-model="family.company" @blur="saveFamilyDraft">
                        <div slot="addonBefore" style="110px">所在单位及部门</div>
                    </a-input>
                    <a-input placeholder="请输入担任职务" v-model="family.job" @blur="saveFamilyDraft">
                        <div slot="addonBefore" :style="inputLabelStyle">担任职务</div>
                    </a-input>
                </a-card>
                <a-button style="margin-top:10px" @click="addFamily">添加成员</a-button>
            </a-card>
        </div>

        <div :style="affixStyle">
            <a-button-group style="width:100%">
                <a-button @click="prevStep" style="width:50%">上一步</a-button>
                <a-button type="primary" @click="nextStep" style="width:50%">{{current[0]=="家庭成员"?"提交":"下一步"}}</a-button>
            </a-button-group>
        </div>
    </div>
</template>

<script>
    import _ from 'lodash';
    //import moment from 'moment';

    export default{
        name: "preregist",
        data(){
            return {
                company_id: "",
                preregist:{
                    openid: "",
                    company_oid: "",
                    personal:{
                        name: "",
                        phone: "",
                        origin: "",
                        placeOfBirth: "",
                        identityCard: "",
                        dateOfBirth: "",
                        ethnic: "",
                        party: "",
                        marriage: "",
                        startOfWork: "",
                        qualified: "",
                        email: "",
                        achievement: "",
                        academic: "",
                        award: "",
                        comment: ""
                    },
                    study:[],
                    work:[],
                    profession:[],
                    family:[]
                },
                labelCol: {
                    xs: { span: 1 },
                    sm: { span: 5 },
                },
                wrapperCol: {
                    xs: { span: 1 },
                    sm: { span: 12 },
                },
                windowHeight: 0,
                windowWidth: 0,
                offset: 100,
                current: ["个人信息"],
                data: {},
                steps: [
                    {
                        title: "个人信息"
                    },
                    {
                        title: "学习经历"
                    },
                    {
                        title: "工作经历"
                    },
                    {
                        title: "专业信息"
                    },
                    {
                        title: "家庭成员"
                    }
                ],
                partyOptions: [
                    {
                        label: "请选择政治面貌",
                        value: "",
                        disabled: true
                    },
                    {
                        label: "中共党员",
                        value: "中共党员"
                    },
                    {
                        label: "中共预备党员",
                        value: "中共预备党员"
                    },
                    {
                        label: "共青团员",
                        value: "共青团员"
                    },
                    {
                        label: "民革党员",
                        value: "民革党员"
                    },
                    {
                        label: "民盟盟员",
                        value: "民盟盟员"
                    },
                    {
                        label: "民建会员",
                        value: "民建会员"
                    },
                    {
                        label: "民进会员",
                        value: "民进会员"
                    },
                    {
                        label: "农工党党员",
                        value: "农工党党员"
                    },
                    {
                        label: "致公党党员",
                        value: "致公党党员"
                    },
                    {
                        label: "九三学社社员",
                        value: "九三学社社员"
                    },
                    {
                        label: "台盟盟员",
                        value: "台盟盟员"
                    },
                    {
                        label: "无党派人士",
                        value: "无党派人士"
                    },
                    {
                        label: "群众",
                        value: "群众"
                    }
                ],
                ethnicOptions: [ 
                    { label: '请选择民族', value: '', disabled:true },
                    { label: '汉族', value: '汉族' },        
                    { label: '满族', value: '满族' },        
                    { label: '蒙古族', value: '蒙古族' },    
                    { label: '回族', value: '回族' },        
                    { label: '藏族', value: '藏族' },        
                    { label: '维吾尔族', value: '维吾尔族' },
                    { label: '苗族', value: '苗族' },
                    { label: '彝族', value: '彝族' },
                    { label: '壮族', value: '壮族' },
                    { label: '布依族', value: '布依族' },
                    { label: '侗族', value: '侗族' },
                    { label: '瑶族', value: '瑶族' },
                    { label: '白族', value: '白族' },
                    { label: '土家族', value: '土家族' },
                    { label: '哈尼族', value: '哈尼族' },
                    { label: '哈萨克族', value: '哈萨克族' },
                    { label: '傣族', value: '傣族' },
                    { label: '黎族', value: '黎族' },
                    { label: '傈僳族', value: '傈僳族' },
                    { label: '佤族', value: '佤族' },
                    { label: '畲族', value: '畲族' },
                    { label: '高山族', value: '高山族' },
                    { label: '拉祜族', value: '拉祜族' },
                    { label: '水族', value: '水族' },
                    { label: '东乡族', value: '东乡族' },
                    { label: '纳西族', value: '纳西族' },
                    { label: '景颇族', value: '景颇族' },
                    { label: '柯尔克孜族', value: '柯尔克孜族' },
                    { label: '土族', value: '土族' },
                    { label: '达斡尔族', value: '达斡尔族' },
                    { label: '仫佬族', value: '仫佬族' },
                    { label: '羌族', value: '羌族' },
                    { label: '布朗族', value: '布朗族' },
                    { label: '撒拉族', value: '撒拉族' },
                    { label: '毛南族', value: '毛南族' },
                    { label: '仡佬族', value: '仡佬族' },
                    { label: '锡伯族', value: '锡伯族' },
                    { label: '阿昌族', value: '阿昌族' },
                    { label: '其他', value: '其他' }
                ],
                marriageOptions: [
                    { label: '请选择婚姻状况', value: '', disabled:true },
                    { label: '已婚', value: '已婚' },
                    { label: '未婚', value: '未婚' },
                    { label: '丧偶', value: '丧偶' }
                ],
                formOptions: [
                    { label: '请选择学习形式', value: '', disabled:true },
                    { label: '全日制', value: '全日制' },
                    { label: '函授', value: '函授' },
                    { label: '自考', value: '自考' },
                    { label: '在读', value: '在读' },
                    { label: '其他', value: '其他' }
                ],
                stepStyle: {
                    marginBottom: '60px',
                    boxShadow: '0px -1px 0 0 #e8e8e8 inset',
                },
                cardTitleStyle: {
                    left: '10px'
                },
                affixStyle:{ 
                    width: '100%',
                    position: 'fixed', 
                    bottom: '5px',
                },
                selectStyle:{
                    width: '100%'
                },
                narrowSelectStyle: {
                    width: '100%'
                },
                innerStyle: {
                    width: '100%'
                },
                inputLabelStyle: {
                    width: '70px',
                    "text-align": 'left'
                },
                buttonLableStyle: {
                    width: '94px',
                    "text-align": 'left',
                    "padding-left": '10px',
                    "background-color": '#f8f8f8'
                },
                wideButtonLableStyle: {
                    width: '120px',
                    "text-align": 'left',
                    "padding-left": '10px',
                    "background-color": '#f8f8f8'
                }
            }
        },
        props: [],
        methods:{
            getOpenid(){
                let {company_id, app_id, code} = this.$route.query;
                this.instance
                .get(
                `/private/user/weixinQy/userInfo?company_id=${company_id}&app_id=${app_id}&code=${code}`
                )
                .then(response => {
                    let data = response.data;
                    this.data = data;
                })
                .catch(function (error) { // 请求失败处理
                    console.log(error);
                });
            },
            getDraftByCode(){
                let {company_id, app_id, code} = this.$route.query;
                this.company_id = company_id;
                this.iflow2Instance
                .get(
                    `/preregist/getDraftByCode?company_id=${company_id}&app_id=${app_id}&code=${code}`
                )
                .then(response => {
                    let data = response.data;
                    if(data.result == "FALSE"){
                        this.$message.error(data.message);
                    }else{
                        if(data.data && data.data.draft){
                            this.preregist = data.data.draft
                        }
                        if(data.data && data.data.openid){
                            this.preregist.openid = data.data.openid;
                        }
                    }
                })
                .catch(function (error) { // 请求失败处理
                    console.log(error);
                });
            },
            prevStep(){
                let now = this.current[0];
                let prev;
                this.steps.forEach((item, index)=>{
                    if(item.title == now && index>0){
                        prev = index - 1;
                    }
                })
                this.current = [this.steps[prev].title];
            },
            nextStep(){
                if(this.current[0] != "家庭成员"){
                    let now = this.current[0];
                    let prev;
                    let length = this.steps.length;
                    this.steps.forEach((item, index)=>{
                        if(item.title == now && index < (length - 1)){
                            prev = index + 1;
                        }
                    })
                    this.current = [this.steps[prev].title];
                }else{
                    this.submit();
                }
            },
            submit(){
                this.$message.loading({
                    content: '提交中',
                    key: 'submitPreregist'
                });
                if(this.preregist._id){
                    this.iflow2Instance
                    .post(
                        `/preregist/submitDraft`,
                        {
                            draft_id: this.preregist._id
                        }
                    )
                    .then(response => {
                        let data = response.data;
                        if(data.result == "FALSE"){
                            this.$message.error(data.message);
                        }else{
                            if(data.data && data.data.draft){
                                this.preregist = data.data.draft
                            }
                            this.$message.success({
                                content: '提交成功!',
                                key: 'submitPreregist',
                                duration: 2
                            }).then(()=>{
                                this.$message.info({
                                    content: '如需修改信息可再次扫码进行更改',
                                    key: 'submitPreregist',
                                    duration: 2
                                })
                            });
                        }
                    })
                    .catch(function (error) { // 请求失败处理
                        this.$message.error({
                            content: error.message,
                            key: 'submitPreregist'
                        });
                    });
                }else{
                    this.$message.warning('请先填写预注册信息！')
                }
            },
            saveIdentityCard(value){
                let regex = /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/;
                if(regex.test(value)){
                    this.preregist.personal.identityCard = value;
                    let birthday = `${value.slice(6,10)}-${value.slice(10,12)}-${value.slice(12,14)}`;
                    this.preregist.personal.dateOfBirth = birthday;
                    this.savePersonalDraft();
                }else{
                    this.preregist.personal.identityCard = "";
                    this.$message.error('输入的身份证不符合规则');
                }
                this.$forceUpdate();
            },
            savePersonalDraft(){
                if(this.preregist.openid && this.company_id){
                    this.iflow2Instance
                    .post(
                        `/preregist/saveDraft`,
                        {
                            openid: this.preregist.openid, 
                            company_id: this.company_id, 
                            saveType: "personal", 
                            entity: this.preregist.personal
                        }
                    )
                    .then(response => {
                        let data = response.data;
                        if(data.result == "FALSE"){
                            this.$message.error(data.message);
                        }else{
                            if(data.data && data.data.draft){
                                this.preregist = data.data.draft
                            }
                        }
                    })
                    .catch(function (error) { // 请求失败处理
                        console.log(error);
                    });
                }else{
                    this.$message.error('尚未获取到用户信息，请重新扫码')
                }
            },
            addStudy(){
                let checkVide = false;
                this.preregist.study.forEach(item=>{
                    if(!item.school && !item.dateOfStart && !item.dateOfEnd && !item.specialty && !item.education && !item.degree && !item.form){
                        checkVide = true
                    }
                })
                if(!checkVide){
                    this.preregist.study.push({
                        _id: new Date().getTime(),
                        school: "",
                        dateOfStart: "",
                        dateOfEnd: "",
                        specialty: "",
                        education: "",
                        degree: "",
                        form: ""
                    })
                }else{
                    this.$message.error('请先填写空页面')
                }
            },
            deleteStudy(sIndex){
                this.preregist.study.splice(sIndex,1);
                this.saveStudyDraft();
            },
            saveStudyDraft(){
                if(this.preregist.openid && this.company_id){
                    let study = _.cloneDeep(this.preregist.study);
                    study.forEach(item=>{
                        delete item._id;
                    })
                    this.iflow2Instance
                    .post(
                        `/preregist/saveDraft`,
                        {
                            openid: this.preregist.openid, 
                            company_id: this.company_id, 
                            saveType: "study", 
                            entity: study
                        }
                    )
                    .then(response => {
                        let data = response.data;
                        if(data.result == "FALSE"){
                            this.$message.error(data.message);
                        }else{
                            if(data.data && data.data.draft){
                                this.preregist = data.data.draft
                            }
                        }
                    })
                    .catch(function (error) { // 请求失败处理
                        console.log(error);
                    });
                }else{
                    this.$message.error('尚未获取到用户信息，请重新扫码')
                }
            },
            addWork(){
                let checkVide = false;
                this.preregist.work.forEach(item=>{
                    if(!item.company && !item.dateOfStart && !item.dateOfEnd && !item.job){
                        checkVide = true
                    }
                })
                if(!checkVide){
                    this.preregist.work.push({
                        company: "",
                        dateOfStart: "",
                        dateOfEnd: "",
                        job: ""
                    })
                }
            },
            deleteWork(wIndex){
                this.preregist.work.splice(wIndex,1);
                this.saveWorkDraft();
            },
            saveWorkDraft(){
                if(this.preregist.openid && this.company_id){
                    let work = _.cloneDeep(this.preregist.work);
                    work.forEach(item=>{
                        delete item._id;
                    })
                    this.iflow2Instance
                    .post(
                        `/preregist/saveDraft`,
                        {
                            openid: this.preregist.openid, 
                            company_id: this.company_id, 
                            saveType: "work", 
                            entity: work
                        }
                    )
                    .then(response => {
                        let data = response.data;
                        if(data.result == "FALSE"){
                            this.$message.error(data.message);
                        }else{
                            if(data.data && data.data.draft){
                                this.preregist = data.data.draft
                            }
                        }
                    })
                    .catch(function (error) { // 请求失败处理
                        console.log(error);
                    });
                }else{
                    this.$message.error('尚未获取到用户信息，请重新扫码')
                }
            },
            addProfession(){
                let checkVide = false;
                this.preregist.profession.forEach(item=>{
                    if(!item.qualified && !item.specialty && !item.dateOfAquisition && !item.issue){
                        checkVide = true
                    }
                })
                if(!checkVide){
                    this.preregist.profession.push({
                        qualified: "",
                        specialty: "",
                        dateOfAquisition: "",
                        issue: ""
                    })
                }
            },
            deleteProfession(pIndex){
                this.preregist.profession.splice(pIndex,1);
                this.saveProfessionDraft();
            },
            saveProfessionDraft(){
                if(this.preregist.openid && this.company_id){
                    let profession = _.cloneDeep(this.preregist.profession);
                    profession.forEach(item=>{
                        delete item._id;
                    })
                    this.iflow2Instance
                    .post(
                        `/preregist/saveDraft`,
                        {
                            openid: this.preregist.openid, 
                            company_id: this.company_id, 
                            saveType: "profession", 
                            entity: profession
                        }
                    )
                    .then(response => {
                        let data = response.data;
                        if(data.result == "FALSE"){
                            this.$message.error(data.message);
                        }else{
                            if(data.data && data.data.draft){
                                this.preregist = data.data.draft
                            }
                        }
                    })
                    .catch(function (error) { // 请求失败处理
                        console.log(error);
                    });
                }else{
                    this.$message.error('尚未获取到用户信息，请重新扫码')
                }
            },
            addFamily(){
                let checkVide = false;
                this.preregist.family.forEach(item=>{
                    if(!item.name && !item.relation && !item.age && !item.company && !item.job){
                        checkVide = true
                    }
                })
                if(!checkVide){
                    this.preregist.family.push({
                        name: "",
                        relation: "",
                        age: 0,
                        company: "",
                        job: ""
                    })
                }
            },
            deleteFamily(fIndex){
                this.preregist.family.splice(fIndex,1);
                this.saveFamilyDraft();
            },
            saveFamilyDraft(){
                if(this.preregist.openid && this.company_id){
                    let family = _.cloneDeep(this.preregist.family);
                    family.forEach(item=>{
                        delete item._id;
                    })
                    this.iflow2Instance
                    .post(
                        `/preregist/saveDraft`,
                        {
                            openid: this.preregist.openid, 
                            company_id: this.company_id, 
                            saveType: "family", 
                            entity: family
                        }
                    )
                    .then(response => {
                        let data = response.data;
                        if(data.result == "FALSE"){
                            this.$message.error(data.message);
                        }else{
                            if(data.data && data.data.draft){
                                this.preregist = data.data.draft
                            }
                        }
                    })
                    .catch(function (error) { // 请求失败处理
                        console.log(error);
                    });
                }else{
                    this.$message.error('尚未获取到用户信息，请重新扫码')
                }
            },
        },
        mounted(){
            this.windowHeight = document.body.clientHeight;
            this.windowWidth = document.body.clientWidth;
            this.selectStyle.width = (document.body.clientWidth - 120) + 'px';
            this.narrowSelectStyle.width = (document.body.clientWidth - 146) + 'px';
            this.innerStyle.width = (document.body.clientWidth - 146) + 'px';
            this.offset = this.windowHeight - 50;
            this.getDraftByCode();
        }
    }
</script>

<style>
.main-menu{
    font-size:12px;
    padding:0px 10px 0px 10px;
}
.ant-menu-dark .ant-menu-item-disabled{
    color:rgba(255, 255, 255, 1) !important;
}
.ant-input[disabled]{
    color: rgba(0, 0, 0, 0.7);
    background-color: #f8f8f8;
}
</style>