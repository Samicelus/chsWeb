<template>
  <div>
    <img src="@/assets/images/logo.png" class="logo" />
    <a-input placeholder="请输入用户名" allowClear v-model="username">
      <a-icon slot="prefix" type="user" />
    </a-input>
    <br />
    <br />
    <a-input-password
      placeholder="请输入密码"
      @pressEnter="login"
      v-model="password"
    >
      <a-icon slot="prefix" type="key" />
    </a-input-password>
    <a-checkbox
      @change="(e) => onChange(e.target.checked)"
      style="margin-top: 5px; color: white"
    >
      8小时内免登录
    </a-checkbox>
    <a-button
      class="loginButton"
      type="primary"
      @click="login"
      :loading="loginLoading"
      >登录</a-button
    >
    <p>当前环境：{{ env }}</p>
  </div>
</template>

<script>
import { EventBus } from "../lib/event-bus.js"; //全局事件总线
import { getExpire, setExpire, setUnlimit } from "../lib/localStorage";
const crypto = require("crypto");

export default {
  name: "loginForm",
  data() {
    return {
      username: "",
      password: "",
      hospitalId: "", //外部登录后直接跳转
      hospitalName: "",
      loginLoading: false,
      freeLogin: false,
      unlimitLogin: false,
      env: this.$store.state.env,
    };
  },
  methods: {
    onChange(value) {
      this.freeLogin = value;
    },
    login() {
      const key = crypto
        .createHash("sha1")
        .update(this.username)
        .digest("hex")
        .slice(0, 24);
      const iv1 = Buffer.alloc(16, 0);
      let cipher = crypto.createCipheriv("aes-192-cbc", key, iv1);
      let encrypted = cipher.update(this.password, "utf8", "hex");
      encrypted += cipher.final("hex");

      const userKey = crypto
        .createHash("sha1")
        .update("runningdoctor")
        .digest("hex")
        .slice(0, 24);
      const iv2 = Buffer.alloc(16, 0);
      let userCipher = crypto.createCipheriv("aes-192-cbc", userKey, iv2);
      let userEncrypted = userCipher.update(this.username, "utf8", "hex");
      userEncrypted += userCipher.final("hex");

      let data = {
        login: userEncrypted,
        password: encrypted,
      };
      this.loginLoading = true;
      this.instance
        .post("/private/user/login", data)
        .then((response) => {
          this.loginLoading = false;
          if (response.data.result) {
            this.clearInput();
            let result = response.data;
            this.$store.commit("saveUserInfo", {
              user_id: result.user_id,
              nickname: result.nickname,
              token: result.token,
              isAdmin: result.isAdmin,
              access: result.access,
            });
            if (this.freeLogin) {
              setExpire("user_id", result.user_id, 8 * 60 * 60 * 1000);
              setExpire("nickname", result.nickname, 8 * 60 * 60 * 1000);
              setExpire("token", result.token, 8 * 60 * 60 * 1000);
              setExpire("isAdmin", result.isAdmin, 8 * 60 * 60 * 1000);
              setExpire("access", result.access, 8 * 60 * 60 * 1000);
            }
            if (this.unlimitLogin) {
              setUnlimit("user_id", result.user_id);
              setUnlimit("nickname", result.nickname);
              setUnlimit("token", result.token);
              setUnlimit("isAdmin", result.isAdmin);
              setUnlimit("access", result.access);
            }
            this.$router.push({
              name: "home",
              query: {
                hospitalId: this.hospitalId,
                hospitalName: this.hospitalName,
              },
            });
          } else {
            //TODO 显示登录错误
            console.log("登录错误!");
            this.loginLoading = false;
            this.showError();
            this.clearInput();
          }
        })
        .catch((error) => {
          // 请求失败处理
          console.log("登录失败!");
          this.loginLoading = false;
          this.clearInput();
          this.showError();
          console.error(error);
        });
    },
    clearInput() {
      this.username = "";
      this.password = "";
    },
    showError() {
      this.$message.error("用户名/密码不正确!");
    },
  },
  mounted: function () {
    let user_id = getExpire("user_id");
    if (user_id) {
      let nickname = getExpire("nickname");
      let token = getExpire("token");
      let isAdmin = getExpire("isAdmin");
      let access = getExpire("access");

      this.$store.commit("saveUserInfo", {
        user_id,
        nickname,
        token,
        isAdmin,
        access,
      });
      this.$router.push({
        name: "home",
      });
    }
    let that = this;
    EventBus.$off("thirdLogin");
    EventBus.$on("thirdLogin", (data) => {
      that.username = data.login;
      that.password = data.pwd;
      that.hospitalId = data.hospitalId;
      that.hospitalName = data.hospitalName;
      that.unlimitLogin = data.unlimitLogin;
      that.login();
    });
  },
};
</script>

<style scoped>
.loginButton {
  margin: 20px;
}
.logo {
  transform: rotate(-15deg) translate(-65px, -110px);
  width: 230px;
  height: 92px;
  background-size: contain;
  background-repeat: no-repeat;
  margin: 16px 28px 16px 0;
  float: left;
  position: absolute;
  z-index: 3;
}
</style>
