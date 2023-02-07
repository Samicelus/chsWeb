<template>
    <div>
    </div>
</template>

<script>
    export default{
        name: "jump",
        data(){
            return {
                openid: ""
            }
        },
        props: [],
        methods:{
            getDraftByCode(){
                let {company_id, app_id, code} = this.$route.query;
                this.company_id = company_id;
                this.iflow2Instance
                .get(
                    `/preregist/getDraftByCode?company_id=${company_id}&app_id=${app_id}&code=${code}`
                )
                .then(response => {
                    let data = response.data;
                    if(data.result == "FALSE"){
                        this.$message.error(data.message);
                    }else{
                        if(data.data && data.data.openid){
                            let openid = data.data.openid;
                            this.$message.info(openid);
                            this.openid = openid;
                            window.location.replace(`http://rd-platform.mobimedical.cn/target?openid=${openid}` + '&timestamp='+((new Date()).getTime()+Math.random()));
                        }
                    }
                })
                .catch(function (error) { // 请求失败处理
                    console.log(error);
                });
            }
        },
        mounted(){
            this.getDraftByCode();
        }
    }
</script>

<style>
</style>