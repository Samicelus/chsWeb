import Home from './components/home.vue'
import Login from './components/login.vue'
import Doctor from './components/mobile/doctor.vue'
import Patient from './components/mobile/patient.vue'
import Preregist from './components/preregist.vue'
import Jump from './components/jump.vue'
import Target from './components/target.vue'
import RdStat from './components/rdStat/rdStat'
import CompanyStat from './components/rdStat/companyStat'

const routers = [
  {
    path: '/home',
    name: 'home',
    meta: {
        checkLogined: true,
        title: '接口平台管理端'
    },
    component: Home
  },
  {
    path: '/',
    meta: {
        checkLogined: false,
        title: '接口平台管理端'
    },
    component: Login
  },
  {
    path: '/login',
    meta: {checkLogined: false,
        title: '登录 接口平台管理端'},
        component: Login
  },
  {
      path: '/mobile/doctor',
      meta: {checkLogined: false,
        title: '接口平台'},
      component: Doctor
  },
  {
      path: '/mobile/patient',
      meta: {checkLogined: false,
        title: '在线咨询'},
      component: Patient
  },
  {
      path: '/preregist',
      meta: {
          checkLogined: false,
          title: '预入职信息填写'
      },
      component: Preregist
  },
  {
      path: '/jump',
      meta: {
          checkLogined: false,
          title: '跳转'
      },
      component: Jump
  },
  {
      path: '/target',
      meta: {
          checkLogined: false,
          title: '获取openid'
      },
      component: Target
  },
  {
      path: '/rdStat',
      name: 'rdStat',
      meta: {
          checkLogined: false,
          title: '医互通日活统计'
      },
      component: RdStat
  },
  {
      path: '/companyStat',
      name: 'companyStat',
      meta: {
          checkLogined: false,
          title: '医院数据统计'
      },
      component: CompanyStat
  }
]
export default routers