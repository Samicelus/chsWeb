import Vue from 'vue'
import Vuex from 'vuex'
import VueRouter from 'vue-router'
import routers from './routers'
import App from './App.vue'
import axios from 'axios'
import VueClipboard from 'vue-clipboard2'

const config = require(`../config/config.${process.env.NODE_ENV || "default"}.js`);

Vue.use(VueRouter);
Vue.use(Vuex);
Vue.use(VueClipboard);

const instance = axios.create({
  baseURL: config.url
});

const v2Instance = axios.create({
    baseURL: config.v2Url
});

const iflow2Instance = axios.create({
    baseURL: config.iflow2Url
})

const store = new Vuex.Store({
    state: {
        jwt: "",
        isAdmin: false,
        access: [],
        env: process.env.NODE_ENV,
        modules: config.modules
    },
    mutations: {
        saveUserInfo (state, info) {
            const {user_id, nickname, token, isAdmin, access} = info
            state.user_id = user_id;
            state.nickname = nickname;
            state.jwt = token;
            state.isAdmin = isAdmin;
            state.access = access;
            instance.defaults.headers.common['b-json-web-token'] = token;
            v2Instance.defaults.headers.common['b-json-web-token'] = token;
        },
        clearUserInfo (state){
            state.user_id = "";
            state.nickname = "";
            state.jwt = "";
            state.isAdmin = false,
            state.access = [];
            instance.defaults.headers.common['b-json-web-token'] = "";
            v2Instance.defaults.headers.common['b-json-web-token'] = "";
        }
    }
})

Vue.prototype.instance=instance;
Vue.prototype.v2Instance=v2Instance;
Vue.prototype.iflow2Instance=iflow2Instance;

const router = new VueRouter({
  mode: 'history',
  base: config.publicPath,
  routes: routers
})

router.beforeEach((to, from, next) => {
    if(to.meta.title){
        document.title = to.meta.title;
    }
    if(to.meta.checkLogined){
        if(!store.state.jwt){
            let {login, pwd, hospitalId, hospitalName } = to.query;
            next({
                path: '/login',
                query: {
                    login,
                    pwd,
                    hospitalId,
                    hospitalName
                }
            })
        }else{
            next()
        }
    }else{
        next()
    }
});




import {
  Alert,
  Button,
  Row,
  Col,
  Layout,
  Menu,
  Breadcrumb,
  Badge,
  Avatar,
  Icon,
  Affix,
  Table,
  Slider,
  InputNumber,
  Select,
  Card,
  DatePicker,
  Modal,
  Input,
  Tooltip,
  Popover,
  Popconfirm,
  Checkbox,
  Collapse,
  Cascader,
  Tag,
  Divider,
  Radio,
  Transfer,
  Switch,
  Tree,
  Tabs,
  List,
  PageHeader,
  Drawer,
  FormModel,
  Descriptions,
  Rate,
  Dropdown,
  Carousel,
  Steps,
  Form,
  Progress,
  Upload,
  message,
  Pagination
} from 'ant-design-vue';

Vue.prototype.$message = message;
Vue.prototype.$confirm = Modal.confirm;

message.config({
    duration: 2,
})

// Vue.use(antd);
Vue.use(Alert);
Vue.use(Button);
Vue.use(Row);
Vue.use(Col);
Vue.use(Layout);
Vue.use(Menu);
Vue.use(Breadcrumb);
Vue.use(Badge);
Vue.use(Avatar);
Vue.use(Icon);
Vue.use(Affix);
Vue.use(Table);
Vue.use(Slider);
Vue.use(InputNumber);
Vue.use(Select);
Vue.use(Card);
Vue.use(DatePicker);
Vue.use(Modal);
Vue.use(Input);
Vue.use(Tooltip);
Vue.use(Popover);
Vue.use(Popconfirm);
Vue.use(Checkbox);
Vue.use(Collapse);
Vue.use(Cascader);
Vue.use(Tag);
Vue.use(Divider);
Vue.use(Radio);
Vue.use(Transfer);
Vue.use(Switch);
Vue.use(Tree);
Vue.use(Tabs);
Vue.use(List);
Vue.use(PageHeader);
Vue.use(Drawer);
Vue.use(FormModel);
Vue.use(Descriptions);
Vue.use(Rate);
Vue.use(Dropdown);
Vue.use(Carousel);
Vue.use(Steps);
Vue.use(Form);
Vue.use(Progress);
Vue.use(Upload);
Vue.use(Pagination);
Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app')
