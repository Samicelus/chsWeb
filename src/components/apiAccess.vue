<template>
    <div>
        <a-switch :default-checked="apiAccess.enabled" @change="onEnabledChange" >
            <a-icon slot="checkedChildren" type="check" />
            <a-icon slot="unCheckedChildren" type="close" />
        </a-switch>
        <a-divider dashed/>
        <a-table v-if="apiAccess.enabled" size="small" :data-source="apiAccess.rules" :columns="columns" bordered>
            <template
            slot="dailyLimit"
            slot-scope="dailyLimit, record"
            >
                <a-input-number
                :defaultValue="dailyLimit"
                @change="value=>onDailyLimitChange(value, record)"
                >
                </a-input-number>
            </template>
            <template
            slot="used"
            slot-scope="used"
            >
                {{used}}
            </template>
            <template slot="footer">
                <a-button icon="plus">添加规则</a-button>
            </template>
        </a-table>
    </div>
</template>
<script>
    //import _ from 'lodash';

    const columns = [
        {
            title: '用户',
            width: '33%',
            scopedSlots: { customRender: 'user' },
        },
        {
            title: '调用次数限制 次/日',
            dataIndex: 'dailyLimit',
            width: '34%',
            scopedSlots: { customRender: 'dailyLimit' },
        },
        {
            title: '今日已使用次数',
            dataIndex: 'used',
            width: '33%',
            scopedSlots: { customRender: 'used' },
        }
    ]

    export default {
        data() {
        return {
            columns,
            apiAccess:{
                enabled: false,
                rules: [
                    {
                        dailyLimit:0,
                        used:1
                    }
                ]
            }
        }
        },
        props: ['apiId'],
        methods:{
            onEnabledChange(value){
                this.apiAccess.enabled = value;
            },
            onDailyLimitChange(value, record){
                record.dailyLimit = value;
            }
        },
        computed:{
        },
        mounted(){
        },
        beforeCreate(){
        },
        created(){
        },
        updated(){
        }
    };
</script>