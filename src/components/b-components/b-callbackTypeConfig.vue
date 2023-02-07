<template>
    <div>
        <a-row>
            <a-col :span="3">
                <a-switch
                checked-children="开启合法性校验"
                un-checked-children="关闭合法性校验"
                :defaultChecked="methodConfig.verifySignature.enable"
                @change="onVerifySignatureChange"
                >
                </a-switch>
            </a-col>
        </a-row>
        <a-row style="margin-top:5px" v-if="methodConfig.verifySignature && methodConfig.verifySignature.enable">
            <a-col :span="6">
                <a-input
                :defaultValue="methodConfig.verifySignature.signature.path"
                addonBefore="签名字段"
                @change="e=>onSignaturePathChange(e.target.value)"
                >
                    <a-select slot="addonAfter"
                    style="width:86px"
                    :defaultValue="methodConfig.verifySignature.signature.origin"
                    :options="signPositionOptions"
                    @change="onSignatureOriginChange"
                    >
                    </a-select>
                </a-input>
            </a-col>
            <a-col :span="6" style="padding-left:5px">
                <a-row>
                    <a-col :span="24">
                        <span class="ant-input-group-wrapper">
                        <span class="ant-input wrapper ant-input-group" style="font-size:0;border:0">
                            <span class="ant-input-group-addon">签名算法</span>
                            <a-select
                            style="width:100%"
                            :defaultValue="methodConfig.verifySignature.algorithm"
                            :options="hashOptions"
                            @change="onHashChange"
                            >
                            </a-select>
                        </span>
                        </span>
                    </a-col>
                </a-row>
                <a-row style="margin-top:5px">
                    <a-col :span="24">
                        <span class="ant-input-group-wrapper">
                        <span class="ant-input wrapper ant-input-group" style="font-size:0;border:0">
                            <span class="ant-input-group-addon">编码</span>
                            <a-select
                            style="width:100%"
                            :defaultValue="methodConfig.verifySignature.coding"
                            :options="encodeOptions"
                            @change="onEncodeChange"
                            >
                            </a-select>
                        </span>
                        </span>
                    </a-col>
                </a-row>
                <a-row style="margin-top:5px" v-if="needHashSecret">
                    <a-col :span="24">
                        <span class="ant-input-group-wrapper">
                        <span class="ant-input wrapper ant-input-group" style="font-size:0;border:0">
                            <span class="ant-input-group-addon">验签密钥</span>
                            <a-select
                            style="width:100%"
                            :defaultValue="methodConfig.verifySignature.secret"
                            :options="customizeConfig"
                            @change="onSecretChange"
                            >
                                <div slot="notFoundContent">
                                    <p>
                                    <a-icon type="info-circle" size="24"/>
                                    尚未配置公用参数，请前往
                                    </p>
                                    <p>
                                    应用列表下拉菜单中配置
                                    </p>
                                </div>
                            </a-select>
                        </span>
                        </span>
                    </a-col>
                </a-row>
            </a-col>
            <a-col :span="12" style="padding-left:5px">
                <a-row>
                    <a-col :span="24">
                        <a-divider orientation="left" dashed>
                            参与签名字段
                            <a-tag color="pink">body</a-tag>
                            <a-tag color="orange">query</a-tag>
                            <a-tag color="green">param</a-tag>
                            <a-tag color="cyan">header</a-tag>
                            <a-tag color="grey">公用参数</a-tag>
                        </a-divider>
                        <b-tagChooser :list="methodConfig.verifySignature.verifykeys" :originOptions="signPositionOptions"/>
                    </a-col>
                </a-row>
                <a-row style="margin-top:5px">
                    <a-col :span="24">
                        <span class="ant-input-group-wrapper">
                        <span class="ant-input wrapper ant-input-group" style="font-size:0;border:0">
                            <span class="ant-input-group-addon">参数排序</span>
                            <a-select
                            style="width:100%"
                            :defaultValue="methodConfig.verifySignature.sortType"
                            :options="sortTypeOptions"
                            @change="onSortTypeChange"
                            >
                            </a-select>
                        </span>
                        </span>
                    </a-col>
                </a-row>
                <a-row style="margin-top:5px">
                    <a-col :span="24">
                        <a-switch
                        checked-children="开启分隔符"
                        un-checked-children="关闭分隔符"
                        :defaultChecked="methodConfig.verifySignature.enableSeparator"
                        @change="onEnableSeparatorChange"
                        >
                        </a-switch>
                    </a-col>
                </a-row>
                <a-row  style="margin-top:5px" v-if="methodConfig.verifySignature.enableSeparator">
                    <a-col :span="24">
                        <a-input
                        :defaultValue="methodConfig.verifySignature.separator"
                        addonBefore="待签分隔符"
                        @change="e=>onSeparatorChange(e.target.value)"
                        >
                        </a-input>
                    </a-col>
                </a-row>
                <a-row style="margin-top:5px">
                    <a-col :span="24">
                        <a-input
                        :defaultValue="methodConfig.verifySignature.preSalt"
                        addonBefore="头部加盐"
                        @change="e=>onPreSaltChange(e.target.value)"
                        >
                        </a-input>
                    </a-col>
                </a-row>
                <a-row style="margin-top:5px">
                    <a-col :span="24">
                        <a-input
                        :defaultValue="methodConfig.verifySignature.salt"
                        addonBefore="尾部加盐"
                        @change="e=>onSaltChange(e.target.value)"
                        >
                        </a-input>
                    </a-col>
                </a-row>
            </a-col>
        </a-row>
        
        <a-divider orientation="left" dashed>回调body解析</a-divider>
        <a-row>
            <a-col :span="6">
                <span class="ant-input-group-wrapper">
                <span class="ant-input wrapper ant-input-group" style="font-size:0;border:0">
                    <span class="ant-input-group-addon">body类型</span>
                    <a-select
                    style="width:100%"
                    :defaultValue="methodConfig.bodyType"
                    :options="dataTypeOptions"
                    @change="onBodyTypeChange"
                    >
                    </a-select>
                </span>
                </span>
            </a-col>
            <a-col :span="6" style="padding-left:5px">
                <span class="ant-input-group-wrapper">
                <span class="ant-input wrapper ant-input-group" style="font-size:0;border:0">
                    <span class="ant-input-group-addon">解析方式</span>
                    <a-select
                    style="width:100%"
                    :options="convertTextOptions"
                    :defaultValue="methodConfig.convertText"
                    @change="onConvertTextChange"
                    >
                    </a-select>
                </span>
                </span>
            </a-col>
        </a-row>
        
        <a-divider dashed/>

        <div>
            <span class="ant-input-group-wrapper">
            <span class="ant-input wrapper ant-input-group" style="font-size:0;border:0">
                <span class="ant-input-group-addon">调用接口</span>
                <a-select
                style="width:100%"
                :options="apiOptions"
                v-model="methodConfig.callApis"
                mode="tags"
                @change="onCallApisChange"
                >
                </a-select>
            </span>
            </span>
        </div>

        <a-divider orientation="left" dashed>响应配置</a-divider>
        <div>
            <a-row>
                <a-col :span="24">
                    <span class="ant-input-group-wrapper">
                    <span class="ant-input wrapper ant-input-group" style="font-size:0;border:0">
                        <span class="ant-input-group-addon">作为回调响应</span>
                        <a-select
                        style="width:100%"
                        :options="apiOptions.filter(item=>methodConfig.callApis.includes(item.value))"
                        v-model="methodConfig.asReturn"
                        >
                        </a-select>
                    </span>
                    </span>
                </a-col>
            </a-row>
            <a-row style="margin-top:5px">
                <a-col :span="24">
                    <a-switch
                    checked-children="返回字符串字段"
                    un-checked-children="使用接口返回"
                    :defaultChecked="methodConfig.keyAsReturn"
                    @change="onKeyAsReturnChange"
                    >
                    </a-switch>
                </a-col>
            </a-row>
            <a-row style="margin-top:5px" v-if="methodConfig.keyAsReturn">
                <a-col :span="24">
                    <a-input
                    addonBefore="返回字段路径"
                    :defaultValue="methodConfig.returnKeyPath"
                    @change="e=>onReturnKeyPathChange(e.target.value)"
                    >
                    </a-input>
                </a-col>
            </a-row>
        </div>
    </div>
</template>
<script>
    //import _ from 'lodash';
    import BTagChooser from './b-tagChooser'

    export default {
        data() {
            return {
            }
        },
        props: ['signPositionOptions', 'hashOptions', 'encodeOptions', 'dataTypeOptions', 'convertTextOptions', 'apiOptions', 'sortTypeOptions', 'methodConfig', 'customizeConfig'],
        components: {
            "b-tagChooser": BTagChooser,
        },
        methods:{
            onVerifySignatureChange(checked){
                if(!this.methodConfig.verifySignature){
                    this.$set(this.methodConfig, "verifySignature",{
                        enable: false,
                        signature: {
                            path: "",
                            origin: ""
                        },
                        algorithm: "",
                        coding: "",
                        verifykeys: [],
                        enableSeparator: false,
                        separator: "&"
                    })
                }
                this.$set(this.methodConfig.verifySignature, "enable", checked);
            },
            onSignaturePathChange(value){
                this.methodConfig.verifySignature.signature.path = value;
            },
            onSignatureOriginChange(value){
                this.methodConfig.verifySignature.signature.origin = value;
            },
            onHashChange(value){
                this.$set(this.methodConfig.verifySignature, "algorithm", value);
            },
            onEncodeChange(value){
                this.$set(this.methodConfig.verifySignature, "coding", value);
            },
            onSortTypeChange(value){
                this.$set(this.methodConfig.verifySignature, "sortType", value);
            },
            onSecretChange(value){
                this.$set(this.methodConfig.verifySignature, "secret", value);
            },
            onEnableSeparatorChange(checked){
                this.methodConfig.verifySignature.enableSeparator = checked;
            },
            onSeparatorChange(value){
                this.methodConfig.verifySignature.separator = value;
            },
            onPreSaltChange(value){
                this.methodConfig.verifySignature.preSalt = value;
            },
            onSaltChange(value){
                this.methodConfig.verifySignature.salt = value;
            },
            onBodyTypeChange(value){
                this.methodConfig.bodyType = value;
            },
            onConvertTextChange(value){
                this.methodConfig.convertText = value;
            },
            onCallApisChange(value){
                if(!value.includes(this.methodConfig.asReturn)){
                    this.methodConfig.asReturn = ""
                }
            },
            onKeyAsReturnChange(value){
                this.methodConfig.keyAsReturn = value;
                this.$forceUpdate();
            },
            onReturnKeyPathChange(value){
                this.methodConfig.returnKeyPath = value;
            },
        },
        computed:{
            needHashSecret:{
                get: function(){
                    return ["hmac", "RSA-SHA1", "RSA-SHA256"].includes(this.methodConfig.verifySignature.algorithm)
                }
            }
        },
        mounted(){
        },
        beforeCreate(){
        },
        created(){
        },
        updated(){
        }
    };
</script>