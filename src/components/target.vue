<template>
    <div>
        <p>openid: {{openid}} </p>
    </div>
</template>

<script>
    export default{
        name: "target",
        data(){
            return {
                openid: ""
            }
        },
        props: [],
        methods:{
        },
        mounted(){
            let { openid } = this.$route.query;
            this.openid = openid
        }
    }
</script>

<style>
</style>