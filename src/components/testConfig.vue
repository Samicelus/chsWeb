<template>
  <div>
    <a-row>
      <a-col :span="cols">
        <div class="iphone">
          <div class="listen"></div>
          <div class="speaker"></div>
          <div class="phoneHead"></div>
          <iframe
            ref="doctorFrame"
            class="content"
            id="doctor-mobile"
            name="doctorMobile"
            scrolling="auto"
            src="/mobile/doctor"
          >
          </iframe>
          <div class="power"></div>
        </div>
      </a-col>
      <a-col :span="cols">
        <div class="iphone">
          <div class="listen"></div>
          <div class="speaker"></div>
          <div class="phoneHead"></div>
          <iframe
            ref="patientFrame"
            class="content"
            id="patient-mobile"
            name="patientMobile"
            scrolling="auto"
            src="/mobile/patient"
          >
          </iframe>
          <div class="power"></div>
        </div>
      </a-col>
    </a-row>
  </div>
</template>
<script>
import { EventBus } from "../lib/event-bus.js"; //全局事件总线

const failStrMap = {
  ErrorNotOngoingConsult: "咨询不在进行状态",
  ErrorConsultClosed: "咨询已关闭",
  ErrorConsultCanceled: "咨询已取消",
  ErrorNotValidConsult: "咨询无效",
  ErrorRecordAlreadyAuthed: "病历已经审核",
  ErrorNoAdvicePower: "没有开处方的权限",
  ErrorRecordNotAuthed: "没有已审核的就诊记录",
  ErrorNotEnoughStorage: "药品库存不足",
  ErrorNoAdmId: "尚未挂号",
  ErrorConsultTotalAdvicesPrice: "总处方金额达到上限",
};

export default {
  data() {
    return {
      doctorIframe: {},
      patientIframe: {},
      consultId: "",
      cols: 12,
    };
  },
  components: {},
  computed: {},
  props: ["appId"],
  methods: {
    rearrange() {
      const windowWidth = document.body.clientWidth;
      if (windowWidth < 930) {
        this.cols = 24;
      } else {
        this.cols = 12;
      }
    },
    sendMessage(cmd, params) {
      switch (params.from) {
        case "doctor":
          this.doctorIframe.postMessage(
            {
              cmd,
              params,
            },
            "*"
          );
          break;
        case "patient":
          this.patientIframe.postMessage(
            {
              cmd,
              params,
            },
            "*"
          );
          break;
        case "consult":
          this.doctorIframe.postMessage(
            {
              cmd,
              params,
            },
            "*"
          );
          break;
        default:
          break;
      }
    },
    handleMessage(event) {
      let that = this;
      const data = event.data;
      switch (data.cmd) {
        case "doctorMonted":
          break;
        case "callTest":
          this.callTest(
            data.params.method,
            data.params.data,
            function (result) {
              that.sendMessage("cb", {
                result,
                method: data.params.method,
                from: data.params.from,
              });
            }
          );
          break;
        default:
          break;
      }
    },
    callTest(method, data, callback) {
      this[method](data, callback);
    },
    listConsult(data, callback) {
      this.instance.defaults.headers.common["app-id"] = this.appId;
      let params = {
        user_id: this.$store.state.user_id,
        type: data.type,
      };
      if (data.lastFetch) {
        params.lastFetch = data.lastFetch;
      }
      this.instance
        .get(`/public/consult`, { params })
        .then((response) => {
          let result = response.data;
          callback(result);
        })
        .catch(function (error) {
          // 请求失败处理
          console.log(error);
        });
    },
    consultDetail(data, callback) {
      this.instance.defaults.headers.common["app-id"] = this.appId;
      let params = {
        consult_id: data.consult_id,
        readType: data.readType,
      };
      if (data.lastFetch) {
        params.lastFetch = data.lastFetch;
      }
      this.instance
        .get(`/public/consult/detail`, { params })
        .then((response) => {
          let result = response.data;
          callback(result);
        })
        .catch(function (error) {
          // 请求失败处理
          console.log(error);
        });
    },
    sendDoctorMessage(data, callbcak) {
      this.instance.defaults.headers.common["app-id"] = this.appId;
      this.instance
        .post("/public/message/doctor/send", {
          content: data.content,
          consult_id: data.consult_id,
        })
        .then((response) => {
          let result = response.data;
          callbcak(result);
        })
        .catch(function (error) {
          // 请求失败处理
          console.log(error);
        });
    },
    sendPatientMessage(data, callbcak) {
      this.instance.defaults.headers.common["app-id"] = this.appId;
      this.instance
        .post("/public/message/patient/send", {
          content: data.content,
          consult_id: data.consult_id,
        })
        .then((response) => {
          let result = response.data;
          callbcak(result);
        })
        .catch(function (error) {
          // 请求失败处理
          console.log(error);
        });
    },
    listDepartment() {},
    getMyConsult(data, callback) {
      this.instance.defaults.headers.common["app-id"] = this.appId;
      let params = {
        patient_id: data.patient_id,
      };
      if (data.lastFetch) {
        params.lastFetch = data.lastFetch;
      }
      this.instance
        .get("/public/myConsult", { params })
        .then((response) => {
          let result = response.data;
          callback(result);
        })
        .catch(function (error) {
          // 请求失败处理
          console.log(error);
        });
    },
    createConsult(data, callback) {
      this.instance.defaults.headers.common["app-id"] = this.appId;
      this.instance
        .post("/public/consult", {
          patient: {
            profile: {
              identityCard: "510103198704220518",
              name: "测试患者",
              phone: "18100000000",
            },
            cards: {},
          },
          cardInfo: {
            cardNo: "1029382",
          },
          record: {
            hospital: "成都市第五人民医院",
            date: "20190912",
            department: "骨科",
            doctor: "测试医生",
            diagnosis: "痛风",
            pic: "",
          },
          doctor_id: data.doctor_id,
          complaint: {
            title: "手腕痛",
            image: "",
          },
        })
        .then((response) => {
          let result = response.data;
          callback(result);
        })
        .catch(function (error) {
          // 请求失败处理
          console.log(error);
        });
    },
    getDepartments(data, callback) {
      this.instance.defaults.headers.common["app-id"] = this.appId;
      this.instance
        .get("/public/listDepartment", {
          params: {
            app_id: this.appId,
          },
        })
        .then((response) => {
          let result = response.data;
          callback(result);
        })
        .catch(function (error) {
          // 请求失败处理
          console.log(error);
        });
    },
    getDoctors(data, callback) {
      this.instance.defaults.headers.common["app-id"] = this.appId;
      this.instance
        .get(`/public/doctor?department_id=${data.department_id}`)
        .then((response) => {
          let result = response.data;
          callback(result);
        })
        .catch(function (error) {
          // 请求失败处理
          console.log(error);
        });
    },
    closeConsult(data, callback) {
      this.instance.defaults.headers.common["app-id"] = this.appId;
      this.instance.defaults.headers.common["consult-id"] = data.consult_id;
      this.instance
        .patch(`/public/${data.consult_id}/consult/close`)
        .then((response) => {
          let result = response.data;
          callback(result);
        })
        .catch(function (error) {
          // 请求失败处理
          console.log(error);
        });
    },
    fillForm(data, callback) {
      this.instance.defaults.headers.common["app-id"] = this.appId;
      let params = {
        consult_id: data.consult_id,
      };
      this.instance
        .get(`/public/advice/wait`, {
          params,
        })
        .then((response) => {
          let result = response.data;
          callback(result);
        })
        .catch(function (error) {
          // 请求失败处理
          console.log(error);
        });
    },
    cancelAdvice(data, callback) {
      callback({
        result: true,
        data,
      });
    },
    searchMedicine(data, callback) {
      this.instance.defaults.headers.common["app-id"] = this.appId;
      let params = {
        app_id: this.appId,
        keyWord: data.search,
      };
      this.instance
        .get(`/public/advice/medicines`, {
          params,
        })
        .then((response) => {
          let result = response.data;
          callback(result);
        })
        .catch(function (error) {
          // 请求失败处理
          console.log(error);
        });
    },
    saveAdvice(data, callback) {
      let body = {
        app_id: this.appId,
        consult_id: data.consult_id,
        diagnosis: data.diagnosis,
        diagnosisType: "first",
        notes: "",
        advices: data.advices.map((item) => {
          item.medicine_id = item.medicine_oid._id;
          delete item.medicine_oid;
          return item;
        }),
      };
      this.instance
        .post(`/public/advice/create`, body)
        .then((response) => {
          let result = response.data;
          callback(result);
        })
        .catch(function (error) {
          // 请求失败处理
          console.log(error);
        });
    },
    authRecord(data, callback) {
      this.instance.defaults.headers.common["app-id"] = this.appId;
      this.instance
        .patch(`/public/${data.consult_id}/record/auth`)
        .then((response) => {
          let result = response.data;
          callback(result);
        })
        .catch(function (error) {
          // 请求失败处理
          console.log(error);
        });
    },
    addComment(data, callback) {
      this.instance.defaults.headers.common["app-id"] = this.appId;
      this.instance
        .post(`/public/consult/comment`, {
          ...data,
        })
        .then((response) => {
          let result = response.data;
          callback(result);
        })
        .catch(function (error) {
          // 请求失败处理
          console.log(error);
        });
    },
    onMaxPriceChange(value) {
      this.maxPrice = value;
    },
    getMaxPrice() {
      this.instance.defaults.headers.common["app-id"] = this.appId;
      this.instance
        .get(
          `/public/customizeConfig?app_id=${this.appId}&key=maxPricePerConsult`
        )
        .then((response) => {
          let { data } = response.data;
          this.maxPrice = data.value || data.default;
        })
        .catch(function (error) {
          // 请求失败处理
          console.log(error);
        });
    },
    setMaxPrice() {
      let data = {
        app_id: this.appId,
        key: "maxPricePerConsult",
        value: this.maxPrice,
      };
      this.instance.defaults.headers.common["app-id"] = this.appId;
      this.instance
        .post(`/public/customizeConfig/set`, data)
        .then((response) => {
          let { data } = response.data;
          console.log(data);
          this.$message.info("更新最大金额成功");
        })
        .catch(function (error) {
          // 请求失败处理
          console.log(error);
        });
    },
    onConsultChange(value) {
      this.consultId = value;
      this.adviceId = "";
    },
    testCreateConsult(params = {}) {
      console.log("params:", params);
    },
    testSendPatientMessage(params = {}) {
      console.log("params:", params);
      this.loadingTSPM = true;
      this.instance.defaults.headers.common["app-id"] = this.appId;
      this.instance
        .post("/public/message/patient/send", {
          content: "测试消息",
          consult_id: this.consultId,
        })
        .then((response) => {
          let that = this;
          if (!response.data.result) {
            if (response.data.failStrArr) {
              response.data.failStrArr.forEach((str) => {
                that.$message.error(failStrMap[str]);
              });
            } else if (response.data.message) {
              that.$message.error(response.data.message);
            } else {
              that.$message.error(`未知错误`);
            }
          }
          this.valueTSPM = JSON.stringify(response.data, null, 2);
          this.loadingTSPM = false;
        })
        .catch(function (error) {
          // 请求失败处理
          console.log(error);
        });
    },
    testCloseConsult(params = {}) {
      console.log("params:", params);
      this.loadingTCloseC = true;
      this.instance.defaults.headers.common["app-id"] = this.appId;
      this.instance
        .patch(`/public/${this.consultId}/consult/close`)
        .then((response) => {
          let that = this;
          if (!response.data.result) {
            if (response.data.failStrArr) {
              response.data.failStrArr.forEach((str) => {
                that.$message.error(failStrMap[str]);
              });
            } else if (response.data.message) {
              that.$message.error(response.data.message);
            } else {
              that.$message.error(`未知错误`);
            }
          }
          this.valueTCloseC = JSON.stringify(response.data, null, 2);
          this.loadingTCloseC = false;
        })
        .catch(function (error) {
          // 请求失败处理
          console.log(error);
        });
    },
    testGetConsult(params = {}) {
      console.log("params:", params);
      this.loadingTGC = true;
      this.instance.defaults.headers.common["app-id"] = this.appId;
      this.instance
        .get(`/public/consult/detail?consult_id=${this.consultId}`)
        .then((response) => {
          let that = this;
          if (!response.data.result) {
            if (response.data.failStrArr) {
              response.data.failStrArr.forEach((str) => {
                that.$message.error(failStrMap[str]);
              });
            } else if (response.data.message) {
              that.$message.error(response.data.message);
            } else {
              that.$message.error(`未知错误`);
            }
          }
          let { consult, messages } = response.data;
          this.valueTGC = `咨询: ${consult.complaint.title}\t\r患者: ${consult.patient_oid.profile.name}\t\r就诊卡号: ${consult.usedCard.cardNo}\t\r就诊记录: ${consult.record_oid.date} ${consult.record_oid.hospital} ${consult.record_oid.department} ${consult.record_oid.diagnosis}\t\r`;
          messages.forEach((message) => {
            this.valueTGC += `${message.from}[${message.created}]: ${message.content}\t\r`;
          });
          this.loadingTGC = false;
        })
        .catch(function (error) {
          // 请求失败处理
          console.log(error);
        });
    },
    handleChange(nextTargetKeys) {
      this.targetKeys = nextTargetKeys;
    },
    handleSelectChange(sourceSelectedKeys, targetSelectedKeys) {
      this.selectedKeys = [...sourceSelectedKeys, ...targetSelectedKeys];
    },
    testSaveAdvice() {
      if (!this.consultId) {
        this.$message.error("请选择要测试的咨询单");
        return;
      }
      if (this.targetKeys.length == 0) {
        this.$message.error("无法保存空处方");
        return;
      }
      let that = this;
      let data = {
        app_id: this.appId,
        consult_id: this.consultId,
        diagnosis: "诊断详情1",
        diagnosisType: "first",
        notes: "",
        advices: [],
      };
      this.targetKeys.forEach((item) => {
        data.advices.push({
          medicine_id: item._id,
          price: item.hisUnitPrice,
          quantity: 1,
          unit: that.medicineMap[item._id].hisUom,
          dosage: 1,
          dosageUnit: that.medicineMap[item._id].hisDosageUom,
          method: "109",
          duration: "302",
          frequency: "13",
        });
      });
      this.instance
        .post(`/public/advice/create`, data)
        .then((response) => {
          let that = this;
          if (!response.data.result) {
            if (response.data.failStrArr) {
              response.data.failStrArr.forEach((str) => {
                that.$message.error(failStrMap[str]);
              });
            } else if (response.data.message) {
              that.$message.error(response.data.message);
            } else {
              that.$message.error(`未知错误`);
            }
          }
          let ret = response.data;
          this.valueTSA = JSON.stringify(ret, null, 2);
        })
        .catch(function (error) {
          // 请求失败处理
          console.log(error);
        });
    },
    fetchAdvices() {
      if (!this.consultId) {
        this.$message.error("请选择要测试的咨询单");
        return;
      }
      this.instance.defaults.headers.common["app-id"] = this.appId;
      this.instance
        .get(`/public/advice?consult_id=${this.consultId}`)
        .then((response) => {
          let { list } = response.data;
          this.advices = list;
        })
        .catch(function (error) {
          // 请求失败处理
          console.log(error);
        });
    },
    onAdviceChange(value) {
      this.adviceId = value;
    },
    testSendAdvice() {
      if (!this.adviceId) {
        this.$message.error("请选择要发送的处方");
        return;
      }

      let data = {
        app_id: this.appId,
        consultAdvice_id: this.adviceId,
      };
      this.instance
        .post(`/public/advice/send`, data)
        .then((response) => {
          let that = this;
          if (!response.data.result) {
            if (response.data.failStrArr) {
              response.data.failStrArr.forEach((str) => {
                that.$message.error(failStrMap[str]);
              });
            } else if (response.data.message) {
              that.$message.error(response.data.message);
            } else {
              that.$message.error(`未知错误`);
            }
          }
          let ret = response.data;
          this.valueTSendA = JSON.stringify(ret, null, 2);
        })
        .catch(function (error) {
          // 请求失败处理
          console.log(error);
        });
    },
    testAuthRecord() {
      this.instance.defaults.headers.common["app-id"] = this.appId;
      if (!this.consultId) {
        this.$message.error("请选择要测试的咨询单");
        return;
      }
      this.instance
        .patch(`/public/${this.consultId}/record/auth`)
        .then((response) => {
          let that = this;
          if (!response.data.result) {
            if (response.data.failStrArr) {
              response.data.failStrArr.forEach((str) => {
                that.$message.error(failStrMap[str]);
              });
            } else if (response.data.message) {
              that.$message.error(response.data.message);
            } else {
              that.$message.error(`未知错误`);
            }
          }
          let ret = response.data;
          this.valueTAR = JSON.stringify(ret, null, 2);
        })
        .catch(function (error) {
          // 请求失败处理
          console.log(error);
        });
    },
  },
  mounted() {
    this.rearrange();
    let that = this;
    window.onresize = () => {
      that.rearrange();
    };
    clearInterval(EventBus.doctorJob);
    clearInterval(EventBus.patientJob);
    //注册事件监听,注册前前解绑已注册的事件，避免重复绑定
    this.doctorIframe = this.$refs.doctorFrame.contentWindow;
    this.patientIframe = this.$refs.patientFrame.contentWindow;
    this.getMaxPrice();
    console.log(`about to remove test listener`);
    window.removeEventListener("message", this.handleMessage);
    console.log(`about to add test listener`);
    window.addEventListener("message", this.handleMessage);
  },
  beforeDestroy() {
    window.removeEventListener("message", this.handleMessage);
  },
};
</script>

<style>
.iphone {
  width: 300px;
  height: 600px;
  margin: 50px auto;
  background-color: #2e2e2e;
  border: 10px solid #3b3b3b;
  border-radius: 40px;
  position: relative;
  box-shadow: 5px 8px 8px rgba(0, 0, 0, 0.5);
}
.iphone:before {
  content: "";
  position: absolute;
  width: 2px;
  height: 32px;
  border-radius: 3px 0px 0px 3px;
  background-color: #2e2e2e;
  left: -12px;
  top: 120px;
}
.iphone:after {
  content: "";
  position: absolute;
  height: 32px;
  width: 2px;
  border-radius: 3px 0px 0px 3px;
  background-color: #2e2e2e;
  left: -12px;
  top: 80px;
}
.listen {
  width: 4px;
  height: 4px;
  background-color: #1a1a1a;
  border: 3px solid #4a4a4a;
  position: absolute;
  top: 6px;
  left: 39%;
  margin-left: -8px;
  border-radius: 50%;
  box-shadow: 2px 2px 2px rgba(0, 0, 0, 0.5);
  z-index: 3;
}
.speaker {
  width: 56px;
  height: 1px;
  border: 2px solid #4a4a4a;
  background-color: #1a1a1a;
  position: absolute;
  left: 53%;
  margin-left: -35px;
  top: 6px;
  border-radius: 10px;
  box-shadow: 2px 2px 2px rgba(0, 0, 0, 0.5);
  z-index: 3;
}
.phoneHead {
  width: 110px;
  height: 16px;
  background-color: #1a1a1a;
  position: absolute;
  left: 42%;
  margin-left: -35px;
  top: 1px;
  border-radius: 0px 0px 15px 15px;
  box-shadow: 1px 1px 1px rgba(0, 0, 0, 0.5);
  z-index: 2;
}
.power {
  content: "";
  position: absolute;
  width: 3px;
  height: 63px;
  border-radius: 0px 3px 3px 0px;
  background-color: #2e2e2e;
  right: -13px;
  top: 80px;
  z-index: 2;
}
.content {
  width: 280px;
  height: 585px;
  background-color: #0a0a0a;
  margin: 80px auto 0;
  font: 35px/450px "微软雅黑";
  text-align: center;
  color: white;
  border: 4px solid #1a1a1a;
  border-radius: 38px;
  position: relative;
  top: -81px;
}
.content:before {
  content: "";
  width: 250px;
  height: 450px;
  position: absolute;
  top: 0;
  left: 0;
  background: -webkit-linear-gradient(
    top left,
    rgba(255, 255, 255, 0.3),
    rgba(255, 255, 255, 0) 80%
  );
}
</style>
