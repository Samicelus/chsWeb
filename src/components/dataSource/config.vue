<template>
    <div style="margin:10px;display:inline-block;vertical-align:top;width:100%">
        <a-row>
            <a-form :label-col="{ span: 2 }" :wrapper-col="{ span: 10 }">
                <a-form-item label="名称">
                    <a-input v-model="data.name" />
                </a-form-item>
                <a-form-item label="操作">
                    <a-select v-model="data.operation" style="width: 100%">
                        <a-select-option v-for="item in operator" :key="item" :value="item">
                            {{item}}
                        </a-select-option>
                    </a-select>
                </a-form-item>
            </a-form>

            <a-divider orientation="left">查询条件</a-divider>
            <a-tabs :activeKey="data.tab" @change="changeQueryTab">
                <a-tab-pane key="normal" tab="普通查询">
                    <Query :query="data.query" :pathIndex="0" :field="field" :map="map" v-on:deleteQueryField="deleteQueryField" v-on:addQueryField="addQueryField" />
                </a-tab-pane>
                <a-tab-pane key="complex" tab="高级查询" force-render>
                    <a-textarea
                        placeholder="JSON格式"
                        :autoSize="{ minRows: 3}"
                        v-model="data.queryText"
                    />
                </a-tab-pane>
            </a-tabs>

            <a-divider orientation="left">其它操作</a-divider>
            <a-form :label-col="{ span: 2 }" :wrapper-col="{ span: 22 }">
                <a-form-item v-if="data.extra_operation.select !== undefined"  label="select">
                    <a-row>
                        <a-icon class="deleteFiled" type="close-circle" @click="deleteField('select')" />
                        <a-tag v-for="item in data.extra_operation.select"  :key="item" :value="item" closable @close="delSelectField(item)">{{item}}</a-tag>
                    </a-row>
                    <a-row>
                        <a-col :span="12">
                            <a-cascader placeholder="系统检查字段" :options="field" change-on-select v-model="cascader_select_field" @popupVisibleChange="cascaderSelectChange"/>
                        </a-col>
                        <a-col :span="12">
                            <a-input placeholder="自定义字段" v-model="custom_select_field" @pressEnter="addSelectField(custom_select_field)"/>
                        </a-col>
                    </a-row>
                </a-form-item>

                <a-form-item v-if="data.extra_operation.sort !== undefined"  label="sort">
                    <a-row>
                        <a-icon class="deleteFiled" type="close-circle" @click="deleteField('sort')" />
                        <a-tag v-for="key in Object.keys(data.extra_operation.sort)"  :key="key" :value="key" closable @close="delSortField(key)">{{key}}:{{data.extra_operation.sort[key] ? '升序' : '降序'}}</a-tag>
                    </a-row>
                    <a-row>
                        <a-col :span="3">
                            <a-select v-model="custom_sort_ASC" style="width: 100%;">
                                <a-select-option :value="1">升序</a-select-option>
                                <a-select-option :value="0">降序</a-select-option>
                            </a-select>
                        </a-col>
                        <a-col :span="9">
                            <a-cascader placeholder="系统检查字段" :options="field" change-on-select v-model="cascader_sort_field" @popupVisibleChange="cascaderSortChange"/>
                        </a-col>
                        <a-col :span="10">
                            <a-input placeholder="自定义字段" v-model="custom_sort_field" @pressEnter="addSortField(custom_sort_field, custom_sort_ASC)"/>
                        </a-col>
                    </a-row>
                </a-form-item>

                <a-form-item v-if="data.extra_operation.skip !== undefined"  label="skip">
                    <a-icon class="deleteFiled" type="close-circle" @click="deleteField('skip')" />
                    <a-select
                        style="width: 100px"
                        v-model="data.extra_operation.skip.from"
                        :options="map.extraOperation"
                        @change="value => onExtraSelectChange(value, 'skip')"
                    ></a-select>
                    <a-input style="width: 150px" v-model="data.extra_operation.skip.path"/>
                </a-form-item>

                <a-form-item v-if="data.extra_operation.limit !== undefined"  label="limit">
                    <a-icon class="deleteFiled" type="close-circle" @click="deleteField('limit')" />
                    <a-select
                        style="width: 100px"
                        v-model="data.extra_operation.limit.from"
                        :options="map.extraOperation"
                        @change="value => onExtraSelectChange(value, 'limit')"
                    ></a-select>
                    <a-input style="width: 150px" v-model="data.extra_operation.limit.path"/>
                </a-form-item>

            </a-form>

            <a-button v-if="show_extra_operation_button" @click="clickExtraOperationButton" >新增操作</a-button>
            <a-select v-if="!show_extra_operation_button" @change="selectExtraOperationButton" style="width: 120px">
                <a-select-option v-for="item in extra_operation" :key="item" :value="item">{{item}}</a-select-option>
            </a-select>

            <a-divider orientation="left">参数示例</a-divider>
            <a-textarea
                placeholder="调用接口时传参,JSON格式"
                :autoSize="{ minRows: 3}"
                v-model="data.params_example"
            />
        </a-row>
    </div>
</template>
<script>
import Query from './query'

export default {
    data() {
        return {
            data: this.upsertData,
            operator: ['find', 'count', 'distinct'],
            // 检索出来的字段
            field: [],
            // 字典
            map: {},
            extra_operation: ['select', 'sort', 'skip', 'limit'],
            show_extra_operation_button: true,
            custom_select_field: '',
            cascader_select_field: [],
            custom_sort_field: '',
            cascader_sort_field: [],
            custom_sort_ASC: 1,
        };
    },
    props: ['appId', 'upsertData', 'collectionId'],
    components:{
        Query: Query,
    },
    methods:{
        parseField(data){
            let keys = Object.keys(data);
            if (keys.length===0 || typeof data.type === 'string'){
                data = null;
            } else {
                let tempData = []
                keys.forEach(function (key) {
                    let result = this.parseField(data[key]);
                    if (!result) {
                        tempData.push({
                            value: key,
                            label: key,
                        })
                    } else {
                        tempData.push({
                            value: key,
                            label: key,
                            children: result
                        })
                    }
                }.bind(this));
                data = tempData;
            }
            return data;
        },
        async loadField(){
            let queryString = {
                collection_oid: this.collectionId
            }
            let result = await this.instance.get('/public/getModelSchemaDetail', {params: queryString});
            if (!result.data.result) {
                return this.$message.error('数据拉取失败');
            }
            let tempData = result.data.data;
            if (tempData) {
                this.field = this.parseField(tempData);
            }
        },
        async loadMap() {
            let result = await this.instance.get('/public/docMap', {});
            if (!result.data.result) {
                return this.$message.error('数据拉取失败');
            }
            let tempMap = {
                from: [],
                system: [],
                customConfig: [],
                cryptoMethodOptions: [],
                encodeOptions: [],
                hashOptions: [],
                extraOperation: []
            }
            for (let key in result.data.from) {
                tempMap.from.push({
                    label: result.data.from[key],
                    value: key
                });
            }
            for (let key in result.data.system) {
                tempMap.system.push({
                    label: result.data.system[key],
                    value: key
                });
            }
            for(let cryptoMethod in result.data.crypto){
                tempMap.cryptoMethodOptions.push({
                    label: result.data.crypto[cryptoMethod],
                    value: cryptoMethod
                })
            }
            for(let encode in result.data.encode){
                tempMap.encodeOptions.push({
                    label: result.data.encode[encode],
                    value: encode
                })
            }
            for(let hash in result.data.hash){
                tempMap.hashOptions.push({
                    label: result.data.hash[hash],
                    value: hash
                })
            }
            for (let key in result.data.extraOperation) {
                tempMap.extraOperation.push({
                    label: result.data.extraOperation[key],
                    value: key
                });
            }
            // 拉取公用参数
            result = await this.instance.get('/private/consultModulation/customizeConfig?app_id='+this.appId);
            if (!result.data.result) {
                return this.$message.error('数据拉取失败');
            }
            if (result.data.data && result.data.data.config) {
                for (let key in result.data.data.config) {
                    tempMap.customConfig.push({
                        label: result.data.data.config[key].name,
                        value: result.data.data.config[key].key
                    });
                }
            }
            this.map = tempMap;
        },
        async loadConfigDetail() {
            if (!this.upsertData._id) {
                // 假如是更新，则每次点修改都刷新数据
                return ;
            }
            let queryString = {
                _id: this.upsertData._id
            }
            let result = await this.instance.get('/public/getQueryConfigById', {params: queryString});
            if (!result.data.result) {
                return this.$message.error('数据拉取失败');
            }
            this.data = {...result.data.data, queryText: JSON.stringify(result.data.data.query, null, 2), params_example: JSON.stringify(result.data.data.params_example, null, 2), title: '修改', tab: 'normal'};
        },
        changeQueryTab(key) {
            this.data.tab = key;
            if(key === 'normal') {
                try {
                    this.data.query = JSON.parse(this.data.queryText)
                } catch (e) {
                    this.$message.error('不能自动转高级查询为普通查询');
                }
            } else {
                this.data.queryText = JSON.stringify(this.data.query, null, 2);
            }
        },
        clickExtraOperationButton(){
            this.show_extra_operation_button = false;
        },
        selectExtraOperationButton(value){
            this.show_extra_operation_button = true;
            if (this.data.extra_operation[value] !== undefined){
                return this.$message.error('您已新增该操作，直接修改即可');
            }
            switch (value) {
                case 'select':
                    this.data.extra_operation.select = []; break;
                case 'sort':
                    this.data.extra_operation.sort = {}; break;
                case 'skip':
                    this.data.extra_operation.skip = {
                        from: 'value',
                        path: '0',
                    }; break;
                case 'limit':
                    this.data.extra_operation.limit = {
                        from: 'value',
                        path: '0',
                    }; break;
                default:
                    this.$message.error('未知操作');

            }
        },
        addSelectField(value) {
            let tempSelect = this.data.extra_operation.select;
            tempSelect.push(value);
            this.data.extra_operation.select = undefined;
            this.data.extra_operation.select = tempSelect;
            this.custom_select_field = '';
        },
        cascaderSelectChange(value) {
            if (value || this.cascader_select_field.length === 0) {
                // 浮层显示，不做任何处理
                return ;
            }
            let tempValue = this.cascader_select_field.join('.');
            this.cascader_select_field = [];
            if (this.data.extra_operation.select.includes(tempValue)){
                // 已经有了，去重
                return ;
            }
            this.addSelectField(tempValue);
        },
        delSelectField(value){
            let tempSelect = this.data.extra_operation.select;
            this.data.extra_operation.select = undefined;
            tempSelect.splice(tempSelect.indexOf(value), 1);
            this.data.extra_operation.select = tempSelect;
        },
        addSortField(key, value) {
            let tempSort = this.data.extra_operation.sort;
            this.data.extra_operation.sort = undefined;
            tempSort[key] = value;
            this.data.extra_operation.sort = tempSort;
            this.custom_sort_field = '';
        },
        cascaderSortChange(value) {
            if (value || this.cascader_sort_field.length === 0) {
                // 浮层显示，不做任何处理
                return ;
            }
            let tempValue = this.cascader_sort_field.join('.');
            this.cascader_sort_field = [];
            if (Object.keys(this.data.extra_operation.sort).includes(tempValue)){
                // 已经有了，去重
                return ;
            }
            this.addSortField(tempValue, this.custom_sort_ASC);
        },
        delSortField(key) {
            let tempSort = this.data.extra_operation.sort;
            this.data.extra_operation.sort = undefined;
            delete tempSort[key];
            this.data.extra_operation.sort = tempSort;
        },
        deleteQueryField() {
            this.data.query = {};
        },
        addQueryField(value) {
            if (Array.isArray(this.data.path)) {
                this.data.query.path.push(value);
            } else {
                this.data.query = value;
            }
        },
        deleteField(data) {
            delete this.data.extra_operation[data];
            this.$forceUpdate();
        },
        onExtraSelectChange(value, key) {
            this.data.extra_operation[key].from = value;
            this.$forceUpdate();
        }
    },
    async mounted(){
        this.upsertData.queryText = JSON.stringify(this.upsertData.query);
        await this.loadField();
        await this.loadMap();
        await this.loadConfigDetail();
    },
};
</script>

<style scoped>
.deleteFiled {
    padding-top: 5px;
    float: right;
}
.deleteFiled:hover {
    cursor:pointer;
}
</style>
