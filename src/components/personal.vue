<template>
  <div>
    <a-row>
        <a-col :span="24">
            <h1 style="font-size:36px">{{data.nickname}}</h1>
            <a-tag :color="data.isAdmin?'red':'blue'">
                {{data.isAdmin?"超级管理员":"普通用户"}}
            </a-tag>
        </a-col>
    </a-row>
    <a-row style="margin-top:5px">
        <a-col :span="8">
        </a-col>
        <a-col :span="8">
            <a-button @click="changeVisible" v-if="!changePasswordVisible">
            修改密码
            </a-button>
            <div v-else>
                <a-alert
                description="密码长度必须为8~255位，包含：大写字母，小写字母，数字，特殊字符中的至少3种"
                type="info"
                show-icon
                style="margin-bottom:10px"
                />
                <a-input-password 
                addonBefore="旧密码" 
                v-model="tempPassword"
                >
                </a-input-password>
                <a-input-password 
                addonBefore="新密码" 
                v-model="tempNewPassword" 
                style="margin-top:10px"
                @change="e=>checkPasswordSecurity(e.target.value)"
                >
                </a-input-password>
                <a-input-password 
                addonBefore="请重复" 
                v-model="tempReNewPassword" 
                style="margin-top:10px"
                >
                </a-input-password>
                <a-button-group style="margin-top:10px">
                    <a-button type="primary" @click="changePassword">修改</a-button>
                    <a-button @click="changeHide">取消</a-button>
                </a-button-group>
            </div>
        </a-col>
        <a-col :span="8">
            <div v-if="changePasswordVisible">
                <a-alert
                :description="checkError"
                type="error"
                show-icon
                style="margin:10px"
                v-if="checkError"
                />
                <p>密码强度: {{levelDesc}}</p>
                <a-progress 
                :percent="secureLevel"
                :strokeColor="secureColor"
                :status="checkError||!tempNewPassword?'exception':'success'"
                style="margin-left:10px"
                />
            </div>
        </a-col>
    </a-row>
    <a-divider orientation="left">权限</a-divider>
    <a-row>
        <a-col :span="24">
            <a-tree :tree-data="data.accessTree" show-icon default-expand-all>
                <a-icon slot="apartment" type="apartment" />
                <a-icon slot="block" type="block" />
            </a-tree>
        </a-col>
    </a-row>
    <a-divider orientation="left">系统信息</a-divider>
    <a-row>
        <a-col :span="12" style="text-align:left">
            <span>当前系统版本: {{version}}</span>
            <a-row>
                <a-col :span="24">
                <a-divider orientation="left" dashed>查看版本更新说明</a-divider>
                <a-select
                :defaultValue="version"
                @change="onSelectVersion"
                style="width:99%;margin-left:4px">
                    <a-select-option v-for="(revision, versionNum) in revisions" :key="versionNum">
                        {{versionNum}}
                    </a-select-option>
                </a-select>
                </a-col>
            </a-row>
            <pre style="height:420px">{{revisions[selectedVersion]}}</pre>
        </a-col>
        <a-col :span="12" style="text-align:left">
            <span>当前服务器版本: {{serverVersion}}</span>
            <a-row>
                <a-col :span="24">
                <a-divider orientation="left" dashed>查看版本更新说明</a-divider>
                <a-select
                v-model="selectedServerVersion"
                @change="onSelectServerVersion"
                style="width:99%;margin-left:4px">
                    <a-select-option v-for="(revision, versionNum) in serverRevisions" :key="versionNum">
                        {{versionNum}}
                    </a-select-option>
                </a-select>
                </a-col>
            </a-row>
            <pre style="height:420px">{{serverRevisions[selectedServerVersion]}}</pre>
        </a-col>
    </a-row>
  </div>
</template>
<script>
  //import { EventBus } from '../lib/event-bus.js'; //全局事件总线
    import revisions from '../../revision.json'
    import { version } from '../../package.json';

  export default {
    data() {
        return {
            data: {},
            changePasswordVisible: false,
            tempPassword: "",
            tempNewPassword: "",
            tempReNewPassword: "",
            revisions,
            selectedVersion: version,
            version,
            serverRevisions:{},
            selectedServerVersion: "",
            serverVersion: "",
            passwordChecked: true,
            checkError: "",
            secureLevel: 0,
            secureColor: 'red',
            levelDesc: '弱'
        };
    },
    props: ['moduleMap', 'powerMap'],
    methods:{
        checkPasswordSecurity(password){
            this.secureLevel = 25;
            let lower = /(?=.*[a-z])/;
            let upper = /(?=.*[A-Z])/;
            let num = /(?=.*\d)/;
            let spec = /(?=.*[^A-Za-z0-9\s])/;
            let eight = /(?=^.{8,255}$)/;
        
            let hasLower = lower.test(password);
            let hasUpper = upper.test(password);
            let hasNum = num.test(password);
            let hasSpec = spec.test(password);
            let atLeast8 = eight.test(password);
            let has3Diff = (hasLower && hasUpper && hasNum) || (hasUpper && hasNum && hasSpec) || (hasLower && hasNum && hasSpec) || (hasLower && hasUpper && hasSpec);

            this.checkError = "";
            if(!atLeast8){
                this.checkError += "密码长度必须为8~255位!";
            }else{
                this.secureLevel += 25;
            }
            if(!has3Diff){
                this.checkError += "密码必须包含：大写字母，小写字母，数字，特殊字符中的至少3种!";
            }else{
                this.secureLevel += 25;
            }
            if(password.length>10){
                this.secureLevel += 25;
            }
            if(this.secureLevel<30){
                this.secureColor = 'red';
                this.levelDesc = '弱';
            }else if(this.secureLevel<60){
                this.secureColor = 'volcano';
                this.levelDesc = '一般';
            }else if(this.secureLevel<80){
                this.secureColor = 'gold';
                this.levelDesc = '强';
            }else{
                this.secureColor = 'lime';
                this.levelDesc = '非常强';
            }
        },
        onSelectVersion(value){
            this.selectedVersion = value;
            this.$forceUpdate();
        },
        onSelectServerVersion(value){
            this.selectedServerVersion = value;
            this.$forceUpdate();
        },
        changeVisible(){
            this.changePasswordVisible=true;
        },
        changeHide(){
            this.changePasswordVisible=false;
        },
        changePassword(){
            if(this.tempNewPassword == this.tempReNewPassword){
                this.instance
                .patch(
                `/private/user/${this.data.user_id}/password`,
                {
                    password: this.tempPassword,
                    newPassword: this.tempNewPassword
                }
                )
                .then(response => {
                    let result = response.data;
                    if(result.result){
                        this.$message.info('密码修改成功');
                        this.modScopVisible = false;
                    }else{
                        this.$message.error('密码修改失败');
                    }
                })
                .catch(function (error) { // 请求失败处理
                    console.log(error);
                    this.$message.error(error.message);
                });
            }else{
                this.$message.error(`两次输入的密码不一致`)
            }
        },
        getSystemInfo(){
            this.instance
            .get(
            `/private/consultModulation/systemInfo`
            )
            .then(response => {
                let result = response.data;
                if(result.result){
                    this.serverVersion = result.version;
                    this.selectedServerVersion = result.version;
                    this.serverRevisions = result.revision||{};
                    this.$forceUpdate();
                }else{
                    this.$message.error('获取系统信息失败');
                }
            })
            .catch(function (error) { // 请求失败处理
                console.log(error);
                this.$message.error(error.message);
            });
        }
    },
    mounted(){
        //注册事件监听
        console.log(this.moduleMap, this.powerMap)
        this.data.user_id = this.$store.state.user_id;
        this.data.nickname = this.$store.state.nickname;
        this.data.isAdmin = this.$store.state.isAdmin;
        this.data.access = this.$store.state.access;
        let that = this;
        if(this.data.access){
            this.data.accessTree = 
            this.data.access.map((access, aIndex)=>{
                return {
                    title: that.moduleMap[access.module] || access.module,
                    key: `${aIndex}`,
                    slots: {
                        icon: 'apartment'
                    },
                    children: access.power.map((power, pIndex)=>{
                        return {
                            title: that.powerMap[power] || power,
                            key: `${aIndex}-${pIndex}`,
                            slots: {
                                icon: 'block'
                            }
                        }
                    })
                }
            });
        }
        this.$forceUpdate();
        this.getSystemInfo();
    }
  };
</script>