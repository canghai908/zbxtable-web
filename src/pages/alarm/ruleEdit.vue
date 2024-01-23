<template>
  <page-layout :noTitle="true">
    <a-card :body-style="{padding: '24px 32px'}" :bordered="false">
      <a-form layout="horizontal">
        <a-form-item :label="$t('title')" :labelCol="{span: 7}" :wrapperCol="{span: 4}">
          <a-input v-model="rule.name" :placeholder="$t('titleInput')" />
        </a-form-item>
        <a-form-item :label="$t('tenant_id')" :labelCol="{span: 7}" :wrapperCol="{span: 4}" :required="true">
          <a-select v-model="rule.tenant_id" mode="multiple" style="width: 100%" placeholder="选择告警租户" @change="handleTenantChange">
            <a-select-option v-for="(item, index) in this.tenantlist" :key="index" :value="item.id.toString()" :label="item.tenant_id" :title="item.tenant_id">
              {{ item.tenant_id }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-card v-if="rule.m_type==1" class="card" :title="$t('condition')" :bordered="false">
          <a-row class="form-row" v-for="(itv, its) in rule.conditions" :key="its">
            <a-col :lg="6" :md="12" :sm="24">
              <a-form-item :label="$t('rule')" :required="false">
                <a-select v-model="itv.r_type">
                  <a-select-option v-for="(item, index) in rTypeOptions" :key="index" :value="item.value" :label="item.label" :title="item.label">
                    {{ item.label }}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :xl="{span: 6, offset: 1}" :lg="{span: 8}" :md="{span: 12}" :sm="24">
              <a-form-item :label="$t('operator')">
                <a-select v-model="itv.r_func">
                  <a-select-option v-for="(item, index) in rFuncOptions" :key="index" :value="item.value" :label="item.label" :title="item.label">
                    {{ item.label }}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :xl="{span: 6, offset: 1}" :lg="{span: 10}" :md="{span: 24}" :sm="24">
              <a-form-item :label="$t('value')" :required="false">
                <a-input v-model="itv.r_value" :placeholder="$t('valueInput')" />
              </a-form-item>
            </a-col>
            <a-col :span="2" :offset="1">
              <a-form-item :label="$t('operation')" :required="false">
                <a-button type="primary" style="margin-right: 10px" v-if="rule.conditions && rule.conditions.length > 1" icon="delete" shape="circle" @click="rule.conditions.splice(its, 1)" />
                <a-button type="primary" v-if="its == 0" icon="plus" shape="circle" @click='rule.conditions.push({ r_type: "", r_func: "", r_value: "",})' />
              </a-form-item>
            </a-col>
          </a-row>
        </a-card>
        <a-card class="card" :title="$t('task')" :bordered="false">
          <a-form-item v-if="rule.m_type==1" :label="$t('date')" :labelCol="{span: 7}" :wrapperCol="{span: 8}" :required="false">
            <a-select v-model="rule.s_week" mode="multiple" style="width: 100%">
              <a-select-option v-for="(item, index) in rWeekOptions" :key="index" :value="item.value.toString()" :label="item.label" :title="item.label">
                {{ item.label }}
              </a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item v-if="rule.m_type==1" :label="$t('date2')" :labelCol="{span: 7}" :wrapperCol="{span: 8}" :required="true">
            <a-col>
              <a-time-picker v-model="rule.s_time" format="HH:mm"></a-time-picker>-->
              <a-time-picker v-model="rule.e_time" format="HH:mm"></a-time-picker>
            </a-col>
          </a-form-item>
          <a-form-item :label="$t('channels')" :labelCol="{span: 7}" :wrapperCol="{span: 10}" :required="false">
            <a-checkbox-group v-model="rule.channel" :options="rChannelOptions" @change="onChannelChange">
              <!-- <a-checkbox v-for="(item, index) in rChannelOptions" :value="item.value" :key="index" style="margin-left: 0;">
                {{ item.auth_name }}
              </a-checkbox> -->
            </a-checkbox-group>

          </a-form-item>
          <a-form-item :label="$t('user')" :labelCol="{span: 7}" :wrapperCol="{span: 4}" :required="false">
            <a-select v-model="rule.user_ids" mode="multiple" style="width: 100%" placeholder="告警接收人" @change="handleUserChange">
              <a-select-option v-for="(item, index) in this.userlist" :key="index" :value="item.id.toString()" :label="item.username" :title="item.username">
                {{ item.username }}
              </a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item :label="$t('user_group')" :labelCol="{span: 7}" :wrapperCol="{span: 4}" :required="false">
            <a-select v-model="rule.group_ids" mode="multiple" style="width: 100%" placeholder="告警接收组" @change="handleGroupChange">
              <a-select-option v-for="(item, index) in this.grouplist" :key="index" :value="item.id.toString()" :label="item.name" :title="item.name">
                {{ item.name }}
              </a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item :label="$t('note')" :labelCol="{span: 7}" :wrapperCol="{span: 4}">
            <a-input v-model="rule.note" :placeholder="$t('noteInput')" />
          </a-form-item>
          <a-form-item :label="$t('status')" :labelCol="{span: 7}" :wrapperCol="{span: 4}" :required="false">
            <a-switch v-model="rule.status" checked-children="启用" un-checked-children="禁用" />
          </a-form-item>
        </a-card>
        <a-form-item style="margin-top: 24px" :wrapperCol="{span: 10, offset: 7}">
          <a-button type="primary" @click="saveData">{{$t('save')}}</a-button>
          <a-button style="margin-left: 8px" @click="back">{{$t('back')}}</a-button>
        </a-form-item>
      </a-form>
    </a-card>
  </page-layout>
</template>

<script>
import PageLayout from "@/layouts/PageLayout";
import moment from 'moment';
import { rulePut, ruleGet, alarmTenantGet, userList, groupList } from "@/services/admin";
export default {
  name: 'BasicForm',
  i18n: require('./i18n'),
  components: {
    PageLayout,
  },
  data() {
    return {
      value: 1,
      tenantlist: [],
      userlist: [],
      grouplist: [],
      rTypeOptions: [
        { value: "host", label: "主机" },
        { value: "group", label: "主机组" },
        { value: "item", label: "指标名称" },
        { value: "key", label: "指标Key" },
        { value: "trigger", label: "触发器" },
        { value: "severity", label: "告警级别" }],
      rFuncOptions: [
        { value: "==", label: "==" },
        { value: "=~", label: "=~" },
        { value: "!=", label: "!=" },],
      rWeekOptions: [
        { value: "0", label: "星期日" },
        { value: "1", label: "星期一" },
        { value: "2", label: "星期二" },
        { value: "3", label: "星期三" },
        { value: "4", label: "星期四" },
        { value: "5", label: "星期五" },
        { value: "6", label: "星期六" },
      ],
      rChannelOptions: [
        { value: "mail", label: "邮件" },
        { value: "wechat", label: "微信" },
        // { value: "dingding", label: "钉钉" },
        // { value: "sms", label: "短信" },
      ],
      rule: {
        name: "",
        tenant_id: "",
        m_type: "1",
        conditions: [],
        s_week: "",
        s_time: "",
        e_time: "",
        channel: [],
        user_ids: [],
        group_ids: "",
        note: "",
        status: "",
      },
    }
  },
  computed: {
    desc() {
      return this.$t('pageDesc')
    }
  },
  created() {
    this.id = this.$route.query.id || ""
    this.init()
  },
  methods: {
    init() {
      //tenant get
      alarmTenantGet().then((resp) => {
        let res = resp.data
        if (res.code == 200) {
          this.tenantlist = res.data.items || []
        }
      })
      //user get
      userList({
        page: 1,
        limit: 1000,
      }).then((resp) => {
        let res = resp.data;
        if (res.code == 200) {
          this.userlist = res.data.items || [];
        }
      })
      //group get
      groupList({
        page: 1,
        limit: 1000,
      }).then((resp) => {
        let res = resp.data;
        if (res.code == 200) {
          this.grouplist = res.data.items || [];
        }
      })
      ruleGet(this.id).then((resp) => {
        let res = resp.data
        if (res.code == 200) {
          this.rule.name = res.data.items.name
          this.rule.conditions = res.data.items.conditions ? JSON.parse(res.data.items.conditions) : []
          this.rule.s_time = moment(res.data.items.s_time, 'HH:mm');
          this.rule.e_time = moment(res.data.items.e_time, 'HH:mm');
          if (res.data.items.tenant_id != "") {
            this.rule.tenant_id = res.data.items.tenant_id.split(',')
          } else {
            this.rule.tenant_id = []
          }
          if (res.data.items.s_week) {
            this.rule.s_week = res.data.items.s_week.split(',') || ""
          } else {
            this.rule.s_week = []
          }
          if (res.data.items.channel != "") {
            this.rule.channel = res.data.items.channel.split(',')
          } else {
            this.rule.channel = []
          }
          if (res.data.items.user_ids != "") {
            this.rule.user_ids = res.data.items.user_ids.split(',')
          } else {
            this.rule.user_ids = []
          }
          if (res.data.items.group_ids != "") {
            this.rule.group_ids = res.data.items.group_ids.split(',')
          } else {
            this.rule.group_ids = []
          }
          this.rule.note = res.data.items.note || ""
          this.rule.status = res.data.items.status == '0' ? true : false
          this.rule.m_type = res.data.items.m_type || ""
        }
      })
      this.rule.s_time = moment('00:00', 'HH:mm');
      this.rule.e_time = moment('23:59', 'HH:mm');
    },
    back() {
      this.$router.push("/alarm/rule")
    },
    // onStatusChange(e) {
    //   if (e) {
    //     this.rule.status = 0
    //   } else {
    //     this.rule.status = 1
    //   }
    // },
    onChannelChange(val) {
      this.rule.channel = val;
    },
    handleTenantChange(val) {
      this.rule.tenant_id = val;
    },
    handleUserChange(val) {
      this.rule.user_ids = val;
    },
    handleGroupChange(val) {
      this.rule.group_ids = val;
    },
    saveData() {
      let rule = JSON.parse(JSON.stringify(this.rule));
      rule.status = rule.status ? '0' : '1';
      rule.s_time = this.rule.s_time.format('HH:mm')
      rule.e_time = this.rule.e_time.format('HH:mm')
      rulePut(this.id, rule).then((resp) => {
        let res = resp.data
        if (res.code == 200) {
          this.$message.success(res.message)
          this.$router.push("/alarm/rule")
        }
      })
    }
  },
}
</script>

<style lang="less" scoped>
.form {
  .form-row {
    margin: 0 -8px;
  }
  .ant-col-md-12,
  .ant-col-sm-24,
  .ant-col-lg-6,
  .ant-col-lg-8,
  .ant-col-lg-10,
  .ant-col-xl-8,
  .ant-col-xl-6 {
    padding: 0 8px;
  }
}
</style>
