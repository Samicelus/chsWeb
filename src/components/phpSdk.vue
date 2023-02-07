<template>
  <div>
    <p class="title">PHP SDK</p>
    <a-divider orientation="left"></a-divider>
    <p class="title1">Installation</p>
    <a-divider orientation="left" dashed></a-divider>
    <p class="title2">Download PHP sdk: </p>
    <a-row type="flex" justify="start">
        <a-col :span="12" style="text-align:left">
            <a href="./download/ApiPlatform.php" download="ApiPlatform.php">php sdk</a>
        </a-col>
        <a-col :span="12">
        </a-col>
    </a-row>
    <br />
    <p class="title2">In Php code: </p>
    <a-row type="flex" justify="start">
        <a-col :span="12">
            <pre class="code">
                include_once 'ApiPlatform.php';
                $serverUrl = "http://localhost:7001";
                $login = "monitor";
                $password = "pJ2@YwzE";
                $company_id = "57ac41595fcef1246d5a756e";
                $tagName = "test";
                $params = array();
                $params["a"] = 1;
                $params["b"] = "asrr";
                $apiPlatform = new ApiPlatform($serverUrl, $login, $password);
                $result = $apiPlatform::callApi($company_id, $tagName, $params);
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