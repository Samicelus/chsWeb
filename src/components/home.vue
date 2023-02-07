<template>
  <a-layout id="components-layout-demo-top-side-2">
    <a-layout-header class="header">
      <a-row>
        <a-col :span="3">
          <div class="logo" :style="logoStyle" @click="playLogo" />
        </a-col>
        <a-col :span="20"> </a-col>
        <a-col :span="1">
          <a-popconfirm
            title="确认要登出?"
            @confirm="logout"
            okText="确认"
            cancelText="取消"
          >
            <a-button shape="circle" icon="poweroff" />
          </a-popconfirm>
        </a-col>
      </a-row>
    </a-layout-header>
    <a-layout>
      <a-layout-sider width="200" style="background: #fff">
        <a-menu
          mode="inline"
          theme="dark"
          :inline-collapsed="!collapsed"
          :defaultSelectedKeys="['1']"
          :defaultOpenKeys="['sub1']"
          :style="{ height: '100%', borderRight: 0, textAlign: 'left' }"
        >
          <a-menu-item
            key="statistics"
            v-if="checkAccess('statistics', 'view')"
            @click="toPage('statistics')"
          >
            <a-icon type="dashboard" />
            <span>首页</span>
          </a-menu-item>
          <a-sub-menu
            key="sub1"
            @click="handleSubMenuClick"
            v-if="
              checkAccess('apiGroupManage', 'view') ||
              checkAccess('config', 'view')
            "
          >
            <span slot="title"><a-icon type="profile" />接口管理</span>
            <a-menu-item
              key="apiGroup"
              v-if="checkAccess('apiGroupManage', 'view')"
              >接口分类</a-menu-item
            >
            <a-menu-item key="appConfig" v-if="checkAccess('config', 'view')"
              >接口列表</a-menu-item
            >
          </a-sub-menu>
          <a-sub-menu
            key="sub2"
            @click="handleSubMenuClick"
            v-if="checkAccess('pushLog', 'view')"
          >
            <span slot="title"><a-icon type="message" />推送管理</span>
            <a-menu-item key="pushLog">推送日志</a-menu-item>
            <a-menu-item key="pushFreq">推送频率</a-menu-item>
          </a-sub-menu>
          <a-sub-menu
            key="sub3"
            @click="handleSubMenuClick"
            v-if="checkAccess('iflowLog', 'view')"
          >
            <span slot="title"><a-icon type="message" />流程日志管理</span>
            <a-menu-item key="iflowLog">流程日志</a-menu-item>
          </a-sub-menu>
          <a-sub-menu key="sub4" @click="handleSubMenuClick">
            <span slot="title"><a-icon type="user" />用户管理</span>
            <a-menu-item key="users" v-if="checkAccess('userManage', 'view')"
              >用户列表</a-menu-item
            >
            <a-menu-item key="personal">个人中心</a-menu-item>
          </a-sub-menu>
          <a-sub-menu key="sub5" @click="handleSubMenuClick">
            <span slot="title"><a-icon type="download" />下载</span>
            <a-menu-item key="nodejs">Node.js SDK</a-menu-item>
            <a-menu-item key="php">PHP SDK</a-menu-item>
          </a-sub-menu>
        </a-menu>
      </a-layout-sider>
      <a-layout style="padding: 0 24px 24px">
        <a-breadcrumb style="margin: 16px 0; text-align: left">
          <a-breadcrumb-item
            v-show="
              [
                'appConfig',
                'moduleConfig',
                'apiConfig',
                'customizeConfig',
                'testConfig',
                'apiLog',
              ].includes(mode)
            "
            ><span @click="toPage('appConfig')"
              >接口列表</span
            ></a-breadcrumb-item
          >
          <a-breadcrumb-item v-show="['moduleConfig'].includes(mode)"
            ><span @click="toPage('moduleConfig')"
              >应用配置</span
            ></a-breadcrumb-item
          >
          <a-breadcrumb-item v-show="['apiConfig', 'apiLog'].includes(mode)"
            ><span @click="toPage('apiConfig')"
              >接口配置</span
            ></a-breadcrumb-item
          >
          <a-breadcrumb-item v-show="['customizeConfig'].includes(mode)"
            ><span @click="toPage('customizeConfig')"
              >自定义配置</span
            ></a-breadcrumb-item
          >
          <a-breadcrumb-item v-show="['testConfig'].includes(mode)"
            ><span @click="toPage('testConfig')"
              >应用接口测试</span
            ></a-breadcrumb-item
          >
          <a-breadcrumb-item v-show="['apiLog'].includes(mode)"
            ><span @click="toPage('apiLog')">接口日志</span></a-breadcrumb-item
          >
          <a-breadcrumb-item v-show="['users'].includes(mode)"
            ><span @click="toPage('users')">用户管理</span></a-breadcrumb-item
          >
          <a-breadcrumb-item v-show="['personal'].includes(mode)"
            ><span @click="toPage('personal')"
              >个人中心</span
            ></a-breadcrumb-item
          >

          <a-breadcrumb-item
            v-show="
              [
                'apiGroup',
                'item',
                'template',
                'itemStatics',
                'templateStatistics',
              ].includes(mode)
            "
            ><span @click="toPage('apiGroup')"
              >接口标准列表</span
            ></a-breadcrumb-item
          >
          <a-breadcrumb-item v-show="['item'].includes(mode)"
            ><span @click="toPage('item')"
              >标准成员列表</span
            ></a-breadcrumb-item
          >
          <a-breadcrumb-item
            v-show="
              ['template', 'itemStatics', 'templateStatistics'].includes(mode)
            "
            ><span @click="toPage('template')"
              >API模板列表</span
            ></a-breadcrumb-item
          >
          <a-breadcrumb-item v-show="['itemStatics'].includes(mode)"
            ><span @click="toPage('itemStatics')"
              >模板成员统计</span
            ></a-breadcrumb-item
          >
          <a-breadcrumb-item v-show="['templateStatistics'].includes(mode)"
            ><span @click="toPage('templateStatistics')"
              >模板统计</span
            ></a-breadcrumb-item
          >

          <a-breadcrumb-item
            v-show="['appManage', 'groupManage', 'doctorManage'].includes(mode)"
            ><span @click="toPage('appManage')"
              >应用管理列表</span
            ></a-breadcrumb-item
          >
          <a-breadcrumb-item v-show="['groupManage'].includes(mode)"
            ><span @click="toPage('groupManage')"
              >科室管理</span
            ></a-breadcrumb-item
          >
          <a-breadcrumb-item v-show="['doctorManage'].includes(mode)"
            ><span @click="toPage('doctorManage')"
              >医生管理</span
            ></a-breadcrumb-item
          >

          <a-breadcrumb-item
            v-show="
              [
                'dataSourceLog',
                'configQuery',
                'modelManage',
                'dataSourceManage',
              ].includes(mode)
            "
            ><span @click="toPage('dataSourceManage')"
              >数据来源管理</span
            ></a-breadcrumb-item
          >
          <a-breadcrumb-item
            v-show="
              ['dataSourceLog', 'configQuery', 'modelManage'].includes(mode)
            "
            ><span @click="toPage('modelManage')"
              >数据表管理</span
            ></a-breadcrumb-item
          >
          <a-breadcrumb-item
            v-show="['dataSourceLog', 'configQuery'].includes(mode)"
            ><span @click="toPage('configQuery')"
              >数据表配置</span
            ></a-breadcrumb-item
          >
          <a-breadcrumb-item v-show="['dataSourceLog'].includes(mode)"
            ><span @click="toPage('dataSourceLog')"
              >数据查询日志</span
            ></a-breadcrumb-item
          >

          <a-breadcrumb-item v-show="['statistics'].includes(mode)"
            ><span @click="toPage('statistics')">首页</span></a-breadcrumb-item
          >

          <a-breadcrumb-item v-show="['nodejs'].includes(mode)"
            ><span @click="toPage('nodejs')"
              >Node.js SDK</span
            ></a-breadcrumb-item
          >
          <a-breadcrumb-item v-show="['php'].includes(mode)"
            ><span @click="toPage('php')">PHP SDK</span></a-breadcrumb-item
          >
        </a-breadcrumb>
        <a-layout-content
          :style="{
            background: '#fff',
            padding: '24px',
            margin: 0,
            minHeight: '825px',
          }"
        >
          <appConfig
            v-if="mode == 'appConfig' && checkAccess('config', 'view')"
          ></appConfig>
          <moduleConfig
            :appId="app_id"
            v-if="mode == 'moduleConfig'"
          ></moduleConfig>
          <apiConfig
            :appId="app_id"
            :sourceMap="sourceMap"
            v-if="mode == 'apiConfig'"
          ></apiConfig>
          <boxConfig
            :appId="app_id"
            :sourceMap="sourceMap"
            v-if="mode == 'boxConfig'"
          ></boxConfig>
          <customizeConfig
            :appId="app_id"
            v-if="mode == 'customizeConfig'"
          ></customizeConfig>
          <testConfig :appId="app_id" v-if="mode == 'testConfig'"></testConfig>
          <apiLog
            :appId="app_id"
            :apiId="api_id"
            v-if="mode == 'apiLog'"
          ></apiLog>
          <callbackLog
            :appId="app_id"
            :callbackId="callback_id"
            :callbackTag="callback_tag"
            v-if="mode == 'callbackLog'"
          ></callbackLog>
          <users
            v-if="mode == 'users'"
            :moduleMap="moduleMap"
            :powerMap="powerMap"
          ></users>
          <personal
            v-if="mode == 'personal'"
            :moduleMap="moduleMap"
            :powerMap="powerMap"
          ></personal>
          <appManage
            v-if="mode == 'appManage' && checkAccess('config', 'view')"
          ></appManage>

          <apiGroup v-if="mode == 'apiGroup'"></apiGroup>
          <apiGroupItem
            v-if="mode == 'item'"
            :apiGroupId="apiGroup_id"
          ></apiGroupItem>
          <apiTemplate
            v-if="mode == 'template'"
            :apiTemplateId="apiTemplate_id"
            :templateName="templateName"
            :apiGroupId="apiGroup_id"
          ></apiTemplate>

          <pushLog
            v-if="mode == 'pushLog' && checkAccess('pushLog', 'view')"
          ></pushLog>
          <pushFreq v-if="mode == 'pushFreq'" />
          <iflowLog
            v-if="mode == 'iflowLog' && checkAccess('iflowLog', 'view')"
          ></iflowLog>
          <eventFailLog
            v-if="mode == 'eventFailLog'"
            :appId="app_id"
          ></eventFailLog>

          <groupManage
            v-if="mode == 'groupManage'"
            :appId="app_id"
          ></groupManage>
          <doctorManage
            v-if="mode == 'doctorManage'"
            :appId="app_id"
          ></doctorManage>

          <dataSourceManage
            v-if="mode == 'dataSourceManage'"
            :appId="app_id"
          ></dataSourceManage>
          <modelManage
            v-if="mode == 'modelManage'"
            :appId="app_id"
            :sourceId="source_id"
            :sourceName="source_name"
          ></modelManage>
          <configQuery
            v-if="mode == 'configQuery'"
            :appId="app_id"
            :sourceId="source_id"
            :collectionName="collection_name"
            :collectionId="collection_id"
          ></configQuery>
          <dataSourceLog
            v-if="mode == 'dataSourceLog'"
            :appId="app_id"
            :sourceId="source_id"
            :collectionId="collection_id"
            :queryConfigId="query_config_id"
          ></dataSourceLog>

          <itemStatics
            v-if="mode == 'itemStatics'"
            :apiTemplateId="apiTemplate_id"
            :tagId="tag_id"
          ></itemStatics>
          <templateStatistics
            v-if="mode == 'templateStatistics'"
            :apiTemplateId="apiTemplate_id"
          ></templateStatistics>
          <statistics v-if="mode == 'statistics'"></statistics>

          <nodeSdk v-if="mode == 'nodejs'" />
          <phpSdk v-if="mode == 'php'" />
          <backup v-if="mode == 'backup'" :appId="app_id"></backup>
        </a-layout-content>
      </a-layout>
    </a-layout>
  </a-layout>
</template>

<script>
import { EventBus } from "../lib/event-bus.js"; //全局事件总线
import { clearInfo } from "../lib/localStorage";

import AppConfig from "./appConfig";
import ModuleConfig from "./moduleConfig";
import ApiConfig from "./apiConfig";
import BoxConfig from "./boxConfig";
import CustomizeConfig from "./customizeConfig";
import TestConfig from "./testConfig";
import ApiLog from "./apiLog";
import CallbackLog from "./callbackLog";
import Users from "./users";
import Personal from "./personal";
import AppManage from "./appManage";

import ApiGroup from "./groupTag/apiGroup";
import ApiGroupItem from "./groupTag/items";
import ApiTemplate from "./groupTag/template";

import GroupManage from "./groupManage";
import DoctorManage from "./doctorManage";

import DataSourceManage from "./dataSource/dataSourceManage";
import ModelManage from "./dataSource/modelManage";
import ConfigQuery from "./dataSource/configQuery";
import DataSourceLog from "./dataSource/dataSourceLog";

import ItemStatics from "./groupTag/itemStatics";
import TemplateStatistics from "./groupTag/templateStatistics";
import Statistics from "./statistics";

import PushLog from "./pushLog/pushLog";
import PushFreq from "./pushLog/pushFrequency";
import IflowLog from "./iflowLog/iflowLog";
import EventFailLog from "./eventFailLog/eventFailLog";

import NodeSdk from "./nodeSdk";
import PhpSdk from "./phpSdk";

import Backup from "./backup";

let mode = "statistics";

export default {
  data() {
    return {
      collapsed: false,
      card_set_id: "",
      app_id: "",
      api_id: "",
      callback_id: "",
      callback_tag: "",
      tag_id: "",
      apiGroup_id: "",
      apiTemplate_id: "",
      templateName: "",
      source_id: "",
      source_name: "",
      collection_id: "",
      collection_name: "",
      mode,
      sourceMap: {},
      moduleMap: {},
      powerMap: {},
      logoStyle: {
        width: "115px",
        height: "46px",
        "background-image": require("../assets/images/logo.png"),
        "background-size": "contain",
        "background-repeat": "no-repeat",
        margin: "16px 28px 16px 0",
        float: "left",
        animation: "runner 4.5s",
        "animation-iteration-count": "1",
        "animation-timing-function": "ease-out",
        "animation-direction": "normal",
        "animation-delay": "2s",
      },
    };
  },
  components: {
    appConfig: AppConfig,
    moduleConfig: ModuleConfig,
    apiConfig: ApiConfig,
    boxConfig: BoxConfig,
    testConfig: TestConfig,
    customizeConfig: CustomizeConfig,
    apiLog: ApiLog,
    callbackLog: CallbackLog,
    users: Users,
    personal: Personal,
    appManage: AppManage,
    apiGroup: ApiGroup,
    apiGroupItem: ApiGroupItem,
    apiTemplate: ApiTemplate,
    groupManage: GroupManage,
    doctorManage: DoctorManage,
    dataSourceManage: DataSourceManage,
    modelManage: ModelManage,
    configQuery: ConfigQuery,
    dataSourceLog: DataSourceLog,
    itemStatics: ItemStatics,
    templateStatistics: TemplateStatistics,
    statistics: Statistics,
    pushLog: PushLog,
    pushFreq: PushFreq,
    iflowLog: IflowLog,
    eventFailLog: EventFailLog,
    backup: Backup,
    nodeSdk: NodeSdk,
    phpSdk: PhpSdk,
  },
  methods: {
    playLogo() {
      this.logoStyle["animation-iteration-count"] = "infinite";
      let that = this;
      setTimeout(function () {
        that.logoStyle["animation-iteration-count"] = "0";
      }, 4500);
    },
    toggleCollapsed() {
      this.collapsed = !this.collapsed;
    },
    handleSubMenuClick({ key }) {
      EventBus.$emit("modeChange", key);
    },
    toPage(pageName) {
      if (this.mode != pageName) {
        EventBus.$emit("modeChange", pageName);
      }
    },
    logout() {
      this.$store.commit("saveUserInfo", {});
      clearInfo("user_id");
      clearInfo("nickname");
      clearInfo("token");
      clearInfo("isAdmin");
      clearInfo("access");
      this.$router.push({
        path: "/login",
      });
    },
    fetchSourceMap() {
      console.log(`getting sourceMap...`);
      return this.instance
        .get("/private/consultModulation/docMap")
        .then((response) => {
          let result = response.data;
          this.sourceMap = result.source || {};
        })
        .catch(function (error) {
          // 请求失败处理
          console.log(error);
        });
    },
    fetchModuleMap() {
      this.instance
        .get("/private/user/modulePowerMap")
        .then((response) => {
          let result = response.data;
          this.moduleMap = result.module;
          this.powerMap = result.power;
        })
        .catch(function (error) {
          // 请求失败处理
          console.log(error);
        });
    },
    checkAccess(modulename, power) {
      let temp = false;
      if (this.$store.state.isAdmin) {
        temp = true;
      } else {
        let powerMap = {};
        this.$store.state.access.forEach((access) => {
          powerMap[access.module] = {};
          access.power.forEach((power) => {
            powerMap[access.module][power] = true;
          });
        });
        if (powerMap[modulename] && powerMap[modulename][power]) {
          temp = true;
        }
      }
      return temp && this.$store.state.modules[modulename];
    },
  },
  mounted() {
    //外部跳转登录后加hospitalId参数到指定医院的创建界面
    let { hospitalId, hospitalName } = this.$route.query;
    if (hospitalId && hospitalName) {
      this.mode = "appConfig";
    }

    //注册事件监听
    EventBus.$on("modeChange", (mode) => {
      this.mode = mode;
    });
    EventBus.$off("selectApp");
    EventBus.$on("selectApp", (app_id) => {
      this.app_id = app_id;
    });
    EventBus.$off("selectGroup");
    EventBus.$on("selectGroup", (apiGroup_id) => {
      this.apiGroup_id = apiGroup_id;
    });
    EventBus.$off("selectTemplate");
    EventBus.$on(
      "selectTemplate",
      ({ template_id: apiTemplate_id, templateName }) => {
        this.apiTemplate_id = apiTemplate_id;
        this.templateName = templateName;
      }
    );
    EventBus.$off("selectSource");
    EventBus.$on("selectSource", (source) => {
      this.source_id = source._id;
      this.source_name = source.sourceName;
    });
    EventBus.$off("selectQueryConfig");
    EventBus.$on("selectQueryConfig", (queryConfig) => {
      this.query_config_id = queryConfig._id;
    });
    EventBus.$off("selectCollection");
    EventBus.$on("selectCollection", (collection) => {
      this.collection_name = collection.name;
      this.collection_id = collection._id;
    });
    EventBus.$off("selectTag");
    EventBus.$on("selectTag", (tag_id) => {
      this.tag_id = tag_id;
    });
    EventBus.$off("apiIdChange");
    EventBus.$on("apiIdChange", (api_id) => {
      this.api_id = api_id;
    });
    EventBus.$off("callbackIdChange");
    EventBus.$on("callbackIdChange", ({ callback_id, callback_tag }) => {
      this.callback_id = callback_id;
      this.callback_tag = callback_tag;
    });
    //this.fetchSourceMap();
    this.fetchModuleMap();
  },
};
</script>

<style>
#components-layout-demo-top-side-2 .logo {
  width: 115px;
  height: 46px;
  background-image: url("../assets/images/logo.png");
  background-size: contain;
  background-repeat: no-repeat;
  margin: 16px 28px 16px 0;
  float: left;
  animation: runner 4.5s infinite;
  animation-timing-function: ease-out;
  animation-direction: normal;
  animation-delay: 2s;
}

@keyframes runner {
  0% {
    transform: translate(-150px, 0px);
  }
  30% {
    transform: translate(1500px, 0px);
  }
  80% {
    transform: translate(1650px, 0px);
  }
  89% {
    transform: translate(1900px, 0px);
  }
  90% {
    transform: translate(-150px, 0px);
  }
  100% {
    transform: translate(0px, 0px);
  }
}
</style>
