<template>
  <div>
    <p class="title">Node.js SDK</p>
    <a-divider orientation="left"></a-divider>
    <p class="title1">api-platform-lib</p>
    <p class="title2">Installation</p>
    <p class="title3">Using npm: </p>
    <a-row type="flex" justify="start">
        <a-col :span="12">
            <pre class="code">
                $ npm i api-platform-lib
            </pre>
        </a-col>
        <a-col :span="12">
        </a-col>
    </a-row>
    <br />
    <p class="title2">In Node.js: </p>
    <a-row type="flex" justify="start">
        <a-col :span="12">
            <pre class="code">
                //creat client instance and config
                const client = require('api-platform-lib')({
                    "server_url": "http://localhost:7001",
                    "login": "monitor",
                    "password": "pJ2@YwzE"
                })

                //call taged API with params
                let result = await client.callApi({
                    company_id:"57ac41595fcef1246d5a756e",
                    tagName: "test",
                    params: {
                        "param1": 1,
                        "param2": "cs"
                    }
                })
            </pre>
        </a-col>
        <a-col :span="12">
        </a-col>
    </a-row>

    <a-divider orientation="left"></a-divider>
    <p class="title1">messagepushlib</p>
    <p class="title2">Installation</p>
    <p class="title3">Using npm: </p>
    <a-row type="flex" justify="start">
      <a-col :span="12">
        <pre class="code">
            $ npm i messagepushlib
        </pre>
      </a-col>
      <a-col :span="12">
      </a-col>
    </a-row>
    <br />
    <p class="title2">In Node.js: </p>
    <a-row type="flex" justify="start">
      <a-col :span="12">
        <pre class="code">
            //creat client instance and config
            const RedisClient = require('./libs/redis.js').redisClient;
            const SenderModel = require('./models/sender.js');
            const messagePushOption = {
                redisClient: RedisClient,
                senderModel: SenderModel
            }
            const messagePushClient = require('messagepushlib')(messagePushOption);

            //call taged API with params
            // news 类型
            let msgInfo = {
                type: 'news',
                company_id: '****',
                tousers: ['****'],
                group_oids: ['****'],   // 收消息部门id，我们的id(是ObjectID)
                party_ids: [**],    // 收消息部门id，企业微信的id(是数字)
                articles: [
                    {
                        title: `测试messagePushLib`,
                        description: '这是测试描述',
                        url: '****',
                    }
                ],
                agentid: '****',
                app_id: '****',
                detail_id: '****',  // 可选，推送给mos平台时所需要的数据id
            }

            let result = await messagePushClient.sender(msgInfo);
            // { code: 0, msg: '消息成功写入消息队列' }
            // code 为非0时表示异常，异常信息见msg
        </pre>
      </a-col>
      <a-col :span="12">
      </a-col>
    </a-row>
  </div>
</template>
<script>
  export default {
    data() {
        return {
        };
    },
    props: [],
    methods:{
    },
    mounted(){
    }
  };
</script>
<style>
.title{
    text-align:left;
    font-size: 48px;
}
.title1{
    text-align:left;
    font-size: 24px;
}
.title2{
    text-align:left;
    font-size: 18px;
}
.title3{
    text-align:left;
    font-size: 16px;
}
.code{
    align: left;
    white-space: pre-wrap;
    white-space: -moz-pre-wrap;
    white-space: -pre-wrap;
    white-space: -o-pre-wrap;
    word-wrap: break-word;
    word-break: break-all;
    text-align:left;
    outline: 1px solid #ccc; padding: 5px; margin: 5px;
}
</style>
