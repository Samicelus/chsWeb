<template>
  <div class="homepage-hero-module">
    <div class="video-container">
      <div :style="maskStyle" class="filter"></div>
      <video muted :style="fixStyle" v-show="vedioCanPlay" autoplay loop class="fillWidth" v-on:canplay="canplay">
        <source src="@/assets/background.mp4" type="video/mp4"/>
        浏览器不支持 video 标签，建议升级浏览器。
        <source src="PATH_TO_WEBM" type="video/webm"/>
        浏览器不支持 video 标签，建议升级浏览器。
      </video>
      <div class="poster hidden" v-if="!vedioCanPlay">
        <img :style="fixStyle" src="PATH_TO_JPG" alt="">
      </div>
      <loginForm :style="formStyle"/>
    </div>
  </div>
</template>

<script>
    import { EventBus } from '../lib/event-bus.js'; //全局事件总线
    import LoginForm from './loginForm';

  export default {
    name: 'login',
    data() {
      return {
        vedioCanPlay: false,
        fixStyle: '',
        maskStyle: '',
        formStyle: '',
      }
    },
    components:{
        loginForm: LoginForm
    },
    methods: {
      canplay() {
        this.vedioCanPlay = true
      }
    },
    mounted: function() {
        let {login, pwd, hospitalId, hospitalName} = this.$route.query;
        if(login && pwd){
            EventBus.$emit('thirdLogin', {
                login,
                pwd,
                hospitalId,
                hospitalName,
                unlimitLogin: true
            })
        }
      window.onresize = () => {
        const windowWidth = document.body.clientWidth
        const windowHeight = document.body.clientHeight
        const windowAspectRatio = windowHeight / windowWidth
        let videoWidth
        let videoHeight
        if (windowAspectRatio < 0.5625) {
          console.log('窗口高宽比小于0.5,视频以屏幕宽为准,高为宽x高宽比')
          videoWidth = windowWidth
          videoHeight = videoWidth * 0.5625
          this.fixStyle = {
            height: videoHeight + 'px',
            width: videoWidth + 'px',
            'margin-left': -windowWidth/2 + 'px'
          }
          this.maskStyle = {
            height: videoHeight + 'px',
            width: videoWidth + 'px',
            'margin-left': 'initial'
          }
          this.formStyle = {
            'z-index': 1,
            position: 'absolute',
            width: '320px',
            height: '280px',
            'margin-left': (windowWidth - 320) / 2 + 'px',
            'margin-top': (windowHeight - 280) / 2 + 'px',
          }
        } else {
          videoHeight = windowHeight
          videoWidth = videoHeight / 0.5625
          this.fixStyle = {
            height: videoHeight + 'px',
            width: videoWidth + 'px',
            'margin-left': - videoWidth / 2 + 'px'
          }
          this.maskStyle = {
            height: videoHeight + 'px',
            width: videoWidth + 'px',
            'margin-left': (windowWidth - videoWidth) / 2 + 'px'
          }
          this.formStyle = {
            'z-index': 1,
            position: 'absolute',
            width: '320px',
            height: '640px',
            'margin-left': (windowWidth - 320) / 2 + 'px',
            'margin-top': (windowHeight - 280) / 2 + 'px',
          }
        }
      }
      window.onresize()
    }
  }
</script>

<style scoped>
  .homepage-hero-module,
  .video-container {
    position: relative;
    height: 100vh;
    overflow: hidden;
  }

  .video-container .poster img,
  .video-container video {
    z-index: 0;
    position: absolute;
  }

  .video-container .filter {
    z-index: 1;
    position: absolute;
    background: rgba(0, 0, 0, 0.4);
  }
</style>