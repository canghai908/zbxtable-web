<template>
  <page-layout :noTitle="true">
    <a-form-model class="home-search" layout="inline" :colon='false'>
      <a-form-model-item label="搜索">
        <a-input v-model.trim="hosts" placeholder="主机名" />
      </a-form-model-item>
      <a-form-model-item label="租户">
        <a-select optionFilterProp="label" style="width:100px" v-model="tenantid" option-label-prop="label" @change="handleTenantChange">
          <a-select-option v-for="(item, index) in tenantlist" :key="index" :value="item.tenant_id" :label="item.tenant_id" :title="item.tenant_id">
            {{ item.tenant_id }}
          </a-select-option>
        </a-select>
      </a-form-model-item>
      <a-form-model-item>
        <a-button type="primary" @click="init">查询</a-button>
        <a-button style="margin-left: 10px;" @click="resetData">重置</a-button>
        <a-button type="primary" style="margin-left: 10px;" @click="showModal">新增</a-button>
      </a-form-model-item>
    </a-form-model>
    <div>
      <a-table :loading="loading" :columns="columns" :data-source="list" @change="changePage" :pagination="pagination" :rowKey="(record) => { return record.id;}">
        <span slot="status" slot-scope="record">
          <a-switch :checked="record.status == '0' ? true : false" checked-children="启用" un-checked-children="禁用" @change="onStatusChange($event, record)" />
        </span>
        <span slot="s_time" slot-scope="record">{{record.s_time | parsetime }}</span>
        <span slot="e_time" slot-scope="record">{{record.e_time | parsetime }}</span>
        <span slot="created" slot-scope="record">{{record.created | parsetime }}</span>
        <span slot="operation" slot-scope="record">
          <!-- <a-button class="pd20 paddingleft0" type="link" size="small" @click="seeDetail(record)">详细信息</a-button> -->
          <a-button class="pd20 paddingleft0" type="link" size="small" @click="seeEdit(record)">编辑</a-button>
          <a-popconfirm title="确定要删除吗?" ok-text="确定" cancel-text="取消" @confirm="deleteRecord(record)">
            <a-button class="paddingleft0" type="link" size="small">删除</a-button>
          </a-popconfirm>
        </span>
      </a-table>
    </div>
    <a-modal title="新增规则" :visible="visible" :confirm-loading="confirmLoading" @ok="createRule" @cancel="handleCancel" width="1000px">
      <template>
        <a-form-model :model="rule">
          <a-form-model-item :label="$t('title')" :labelCol="{span: 7}" :wrapperCol="{span: 10}" prop="name" :required="true">
            <a-input v-model.trim="rule.name" :placeholder="$t('titleInput')" />
          </a-form-model-item>
          <a-form-model-item :label="$t('tenant_id')" :labelCol="{span: 7}" :wrapperCol="{span: 10}" prop="tenant_id" :required="true">
            <a-select v-model="rule.tenant_id" mode="multiple" style="width: 100%" placeholder="选择告警租户" @change="handleTenantChange">
              <a-select-option v-for="(item, index) in tenantlist" :key="index" :value="item.tenant_id" :label="item.tenant_id" :title="item.tenant_id">
                {{ item.tenant_id }}
              </a-select-option>
            </a-select>
          </a-form-model-item>
          <a-card class="card" :title="$t('task1')" :bordered="false">
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
            <a-row>
              <a-col :span="8">
                <a-form-model-item :label="$t('s_time')" :labelCol="{span: 8}" :wrapperCol="{span: 14}" :required="true">
                  <a-date-picker show-time v-model="rule.s_time" @change="changeStime"></a-date-picker>
                </a-form-model-item>
              </a-col>
              <a-col :span="8">
                <a-form-model-item :label="$t('tduration')" :labelCol="{span: 8}" :wrapperCol="{span: 16}" :required="true">
                  <a-select v-model="duration" @change="changeDuration">
                    <a-select-option v-for="(item, index) in tOptions" :key="index" :value="item.value" :label="item.label" :title="item.label">
                      {{ item.label }}
                    </a-select-option>
                  </a-select>
                </a-form-model-item>
              </a-col>
              <a-col :span="8">
                <a-form-model-item :label="$t('e_time')" :labelCol="{span: 8}" :wrapperCol="{span: 16}" :required="true">
                  <a-date-picker show-time v-model="rule.e_time" @change="changeEtime"></a-date-picker>
                </a-form-model-item>
              </a-col>
            </a-row>
            <a-row>
              <a-col :span="16">
                <a-form-model-item :label="$t('mchannels')" :labelCol="{span: 4}" :wrapperCol="{span: 16}" :required="true">
                  <a-checkbox-group v-model="rule.channel" :options="rChannelOptions" @change="onChannelChange">
                  </a-checkbox-group>
                </a-form-model-item>
              </a-col>
            </a-row>
            <a-row>
              <a-col :span="16">
                <a-form-model-item :label="$t('mute_note')" :labelCol="{span:4}" :wrapperCol="{span: 18}" :required="true">
                  <a-textarea v-model.trim="rule.note" :placeholder="$t('mute_noteInput')" :rows="2" />
                </a-form-model-item>
              </a-col>
            </a-row>
          </a-card>
        </a-form-model>
      </template>
    </a-modal>
    <a-modal title="编辑规则" :visible="visibleEdit" :confirm-loading="confirmLoading" @ok="updateRule" @cancel="handleEditCancel" width="1000px">
      <template>
        <a-form-model :model="rule">
          <a-form-model-item :label="$t('title')" :labelCol="{span: 7}" :wrapperCol="{span: 10}" prop="name" :required="true">
            <a-input v-model.trim="rule.name" :placeholder="$t('titleInput')" />
          </a-form-model-item>
          <a-form-model-item :label="$t('tenant_id')" :labelCol="{span: 7}" :wrapperCol="{span: 10}" prop="tenant_id">
            <a-select v-model="rule.tenant_id" mode="multiple" style="width: 100%" placeholder="选择告警租户" @change="handleTenantChange" :required="true">
              <a-select-option v-for="(item, index) in tenantlist" :key="index" :value="item.tenant_id" :label="item.tenant_id" :title="item.tenant_id">
                {{ item.tenant_id }}
              </a-select-option>
            </a-select>
          </a-form-model-item>
          <a-card class="card" :title="$t('task1')" :bordered="false">
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
            <a-row>
              <a-col :span="8">
                <a-form-model-item :label="$t('s_time')" :labelCol="{span: 8}" :wrapperCol="{span: 16}" :required="true">
                  <a-date-picker show-time v-model="rule.s_time" @change="changeStime"></a-date-picker>
                </a-form-model-item>
              </a-col>
              <a-col :span="8">
                <a-form-model-item :label="$t('tduration')" :labelCol="{span: 8}" :wrapperCol="{span: 16}" :required="true">
                  <a-select @change="changeDuration">
                    <a-select-option v-for="(item, index) in tOptions" :key="index" :value="item.value" :label="item.label" :title="item.label">
                      {{ item.label }}
                    </a-select-option>
                  </a-select>
                </a-form-model-item>
              </a-col>
              <a-col :span="8">
                <a-form-model-item :label="$t('e_time')" :labelCol="{span: 8}" :wrapperCol="{span: 16}" :required="true">
                  <a-date-picker show-time v-model="rule.e_time" @change="changeEtime"></a-date-picker>
                </a-form-model-item>
              </a-col>
            </a-row>
            <a-row>
              <a-col :span="16">
                <a-form-model-item :label="$t('mchannels')" :labelCol="{span: 4}" :wrapperCol="{span: 16}" :required="true">
                  <a-checkbox-group v-model="rule.channel" :options="rChannelOptions" @change="onChannelChange">
                  </a-checkbox-group>
                </a-form-model-item>
              </a-col>
            </a-row>
            <a-row>
              <a-col :span="16">
                <a-form-model-item :label="$t('mute_note')" :labelCol="{span:4}" :wrapperCol="{span: 18}" :required="true">
                  <a-textarea v-model.trim="rule.note" :placeholder="$t('mute_noteInput')" :rows="2" />
                </a-form-model-item>
              </a-col>
            </a-row>
          </a-card>
        </a-form-model>
      </template>
    </a-modal>
  </page-layout>
</template>

<script>
import { mapGetters } from 'vuex'
import PageLayout from "@/layouts/PageLayout";
import { ruleList, ruleAdd, rulePut, alarmTenantGet, ruleStatusPut, ruleDelete } from "@/services/admin";
import { parseTimeFun } from "@/utils/formatter";
import moment from "moment";
import "moment/locale/zh-cn";
export default {
  name: "LinuxList",
  i18n: require('./i18n'),
  computed: {
    ...mapGetters('account', ['user']),
  },
  components: {
    PageLayout,
  },
  data() {
    return {
      page: 1,
      pageSize: 10,
      loading: false,
      status: "",
      confirmLoading: false,
      visible: false,
      visibleEdit: false,
      level: "",
      rule: {
        name: "",
        tenant_id: [],
        m_type: "3",
        conditions: [],
        s_week: ['0', '1', '2', '3', '4', '5', '6'],
        s_time: parseTimeFun(new Date()),
        e_time: parseTimeFun(new Date().getTime() + 1 * 60 * 60 * 1000),
        channel: "",
        user_ids: "",
        group_ids: "",
        note: "",
        duration: "1h",
        status: "0",
      },
      rChannelOptions: [
        { value: "mail", label: "邮件" },
        { value: "wechat", label: "微信" },
        // { value: "dingding", label: "钉钉" },
        // { value: "sms", label: "短信" },
      ],
      rFuncOptions: [
        { value: "==", label: "等于" },
        { value: "=~", label: "包含" },
        { value: "!=", label: "不等于" },],
      rTypeOptions: [
        { value: "host", label: "主机名" },
        { value: "group", label: "主机组" },
        { value: "item", label: "指标名称" },
        { value: "key", label: "指标Key" },
        { value: "trigger", label: "触发器名称" },
        { value: "severity", label: "告警级别" }],
      columns: [
        { title: "ID", dataIndex: "id", align: "center" },
        { title: "策略名称", dataIndex: "name", align: "left" },
        {
          title: "租户", dataIndex: "tenant_id", align: "left", customRender: (value, row, index) => {
            let allist = []
            value.split(",").forEach(items => {
              this.tenantlist.forEach(tid => {
                if (items == tid.tenant_id) {
                  allist.push(tid.tenant_id);
                }
              });

            });
            const obj = {
              children: allist.join(","),
              attrs: {},
            };
            return obj;
          },
        },
        { title: "屏蔽条件", dataIndex: "conditions", align: "left", },
        {
          title: "屏蔽时长", key: "duration", align: "left", customRender: (value, row, index) => {
            var dateBegin = new Date(row.s_time);
            var dateEnd = new Date(row.e_time);
            var dateDiff = dateEnd.getTime() - dateBegin.getTime(); //时间差的毫秒数
            var dayDiff = Math.floor(dateDiff / (24 * 3600 * 1000)); //计算出相差天数
            var leave1 = dateDiff % (24 * 3600 * 1000); //计算天数后剩余的毫秒数
            var hours = Math.floor(leave1 / (3600 * 1000)); //计算出小时数
            //计算相差分钟数
            var leave2 = leave1 % (3600 * 1000); //计算小时数后剩余的毫秒数
            var minutes = Math.floor(leave2 / (60 * 1000)); //计算相差分钟数
            //计算相差秒数
            var leave3 = leave2 % (60 * 1000); //计算分钟数后剩余的毫秒数
            var seconds = Math.round(leave3 / 1000);
            let duration = dayDiff + "天" + hours + "小时" + minutes + "分钟" + seconds + "秒"
            const obj = {
              children: duration,
              attrs: {},
            };
            return obj;
          },
        },
        { title: "开始时间", key: "s_time", align: "left", scopedSlots: { customRender: "s_time" }, },
        { title: "结束时间", key: "e_time", align: "left", scopedSlots: { customRender: "e_time" }, },
        { title: "添加时间", key: "created", align: "left", scopedSlots: { customRender: "created" }, },
        { title: "策略状态", key: "status", align: "left", scopedSlots: { customRender: "status" }, },
        { title: "操作", key: "operation", align: "left", scopedSlots: { customRender: "operation" } },
      ],
      tOptions: [
        { value: "1", label: "1小时" },
        { value: "2", label: "2小时" },
        { value: "3", label: "5小时" },
        { value: "6", label: "8小时" },
        { value: "12", label: "12小时" },
        { value: "24", label: "1天" },
        { value: "48", label: "2天" },
        { value: "120", label: "5天" },
        { value: "168", label: "7天" },
        { value: "336", label: "14天" },
        { value: "720", label: "30天" },
        { value: "1440", label: "60天" },
        { value: "2160", label: "90天" },
        { value: "86400", label: "永久" },
      ],
      tenantlist: [],
      list: [],
      pagination: {
        total: 0,
        current: 1,
        "show-quick-jumper": true,
        "page-size-options": ["10", "20", "30", "40", "50", "100", "200"],
        pageSize: 10,
        "show-size-changer": true,
        "show-total": (total) => `共 ${total} 条数据`,
      },
      duration: "1h",
      moment,
      tenantid: "",
      hosts: "",
    };
  },
  created() {
    this.init();
    this.hostid = this.$route.query.hostid || ""
    this.host = this.$route.query.host || ""
    this.tenant_id = this.$route.query.tenantid || ""
    this.message = this.$route.query.message || ""
    if (this.hostid != "") {
      this.rule = {
        name: this.host + " muted " + this.message,
        tenant_id: this.tenant_id,
        channel: '',
        conditions: [{
          "r_type": "host",
          "r_func": "==",
          "r_value": this.host,
        }, {
          "r_type": "trigger",
          "r_func": "==",
          "r_value": this.message,
        }],
        s_time: parseTimeFun(new Date()),
        e_time: parseTimeFun(new Date().getTime() + 1 * 60 * 60 * 1000),
        note: this.host + " muted by " + this.$store.state.account['user'].name,
        duration: "1h",
        channel: '',
        m_type: "3",
        status: "0"
      }
      this.visible = true
    }
  },
  methods: {
    init() {
      this.loading = true;
      let req = {
        page: this.page, limit: this.pageSize,
        hosts: this.hosts, tenant_id: this.tenantid,
        status: this.status, m_type: "3"
      };
      ruleList(req).then((resp) => {
        let res = resp.data;
        if (res.code == 200) {
          this.pagination.total = res.data.total;
          this.pagination.current = this.page;
          this.pagination.pageSize = this.pageSize;
          this.list = res.data.items || [];
        }
      }).finally(() => {
        this.loading = false;
      });
      alarmTenantGet().then((resp) => {
        let res = resp.data
        if (res.code == 200) {
          this.tenantlist = res.data.items || []
        }
      }).finally(() => { this.loading2 = false })
    },
    onStatusChange(e, record) {
      if (e) {
        record.status = 0
      } else {
        record.status = 1
      }
      this.loading = true;
      ruleStatusPut(record.id, this.rule = { status: record.status }).then((resp) => {
        let res = resp.data;
        if (res.code == 200) {
          this.$message.success(res.message);
          this.loading = false;
        } else {
          this.$message.error(res.message);
          this.loading = true;
        }
      }).finally(() => {
        this.loading = false;
      });
    },
    onChannelChange(val) {
      this.rule.channel = val;
    },
    showModal() {
      this.visible = true;
      this.rule = {
        name: "",
        tenant_id: [],
        m_type: "3",
        conditions: [
          { r_type: "", r_func: "", r_value: "", }
        ],
        s_week: ['0', '1', '2', '3', '4', '5', '6'],
        s_time: parseTimeFun(new Date()),
        e_time: parseTimeFun(new Date().getTime() + 1 * 60 * 60 * 1000),
        channel: "",
        note: "",
        duration: "1h",
        status: "0",
      };
    },
    seeEdit(record) {
      this.visibleEdit = true;
      let lten = []
      let lchan = []
      if (record.tenant_id != "") {
        lten = record.tenant_id.split(",")
      }
      if (record.channel != "") {
        lchan = record.channel.split(",")
      }
      this.rule = {
        id: record.id,
        name: record.name,
        tenant_id: lten,
        channel: lchan,
        conditions: record.conditions ? JSON.parse(record.conditions) : [],
        s_time: parseTimeFun(record.s_time),
        e_time: parseTimeFun(record.e_time),
        note: record.note,
        m_type: "3",
        status: "0"
      }
    },
    changeDuration(value) {
      this.duration = value;
      this.rule.s_time = parseTimeFun(new Date().getTime())
      this.rule.e_time = parseTimeFun(new Date().getTime() + 1 * value * 60 * 60 * 1000)
    },
    changeStime(value) {
      this.rule.s_time = moment(value).format("YYYY-MM-DD HH:mm:ss")
    },
    changeEtime(value) {
      this.rule.e_time = moment(value).format("YYYY-MM-DD HH:mm:ss")
    },
    updateRule() {
      rulePut(this.rule.id, this.rule).then((resp) => {
        let res = resp.data
        if (res.code == 200) {
          this.$message.success(res.message)
          this.init()
        } else {
          this.$message.error(res.message)
        }
      })
      this.visibleEdit = false
    },
    handleEditCancel() {
      this.visibleEdit = false;
    },
    handleCancel() {
      this.visible = false;
    },
    createRule() {
      ruleAdd(this.rule).then((resp) => {
        let res = resp.data
        if (res.code == 200) {
          this.$message.success(res.message)
          this.loading = false;
          this.confirmLoading = false;
          this.visible = false;
          this.init()
        } else {
          this.visible = true;
          this.confirmLoading = false;
          this.$message.error(res.message);
        }
      })
    },
    handleTenantChange(value) {
      this.tenantid = value
    },
    handleStatusChange(value) {
      this.status = value
    },
    handleLevelChange(value) {
      this.level = value
    },
    deleteRecord(record) {
      this.loading = true
      ruleDelete(record.id).then((resp) => {
        let res = resp.data
        if (res.code == 200) {
          this.loading = false
          this.$message.success(res.message)
          this.init()
        } else {
          this.loading = false
          this.$message.error(res.message)
        }
      })
    },
    changePage(e) {
      // 切换页码
      this.page = e.current;
      this.pageSize = e.pageSize;
      this.init();
    },
    // changeCreationTime(e) {
    //   if (e.length) {
    //     this.beginTime = parseTimeFun(new Date(e[0]));
    //     this.endTime = parseTimeFun(new Date(e[1]));
    //   } else {
    //     this.beginTime = "";
    //     this.endTime = "";
    //   }
    // },
    resetData() {
      this.hosts = "";
      this.tenantid = "";
      this.status = "";
      this.level = "";
      this.init();
    },
  },
  filters: {
    parsetime(v) {
      return parseTimeFun(v);
    },
    levelFilter(v) {
      let res = "未分类";
      switch (v) {
        case "0":
          res = "未分类";
          break;
        case "1":
          res = "信息";
          break;
        case "2":
          res = "警告";
          break;
        case "3":
          res = "一般";
          break;
        case "4":
          res = "严重";
          break;
        case "5":
          res = "灾难";
          break;
      }
      return res;
    },
    statusFilter(v) {
      let res = "未分类";
      switch (v) {
        case "0":
          res = "恢复";
          break;
        case "1":
          res = "告警";
          break;
      }
      return res;
    },
  },
};
</script>

<style lang="less" scoped>
.card-avatar {
  width: 48px;
  height: 48px;
  border-radius: 48px;
}
.new-btn {
  border-radius: 2px;
  width: 100%;
  height: 187px;
}
.meta-content {
  position: relative;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  height: 64px;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

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
