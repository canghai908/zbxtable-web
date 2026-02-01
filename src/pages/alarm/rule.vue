<template>
  <page-layout :noTitle="true">
    <a-alert message="多实例告警规则说明" type="info" show-icon closable style="margin-bottom: 16px;">
      <template slot="description">
        系统已支持多实例数据聚合。在配置告警分发规则时，可以选择一个或多个实例，规则将应用于所选实例的告警。
      </template>
    </a-alert>

    <a-form-model class="home-search" layout="inline" :colon='false'>
      <a-form-model-item label="搜索">
        <a-input v-model.trim="name" placeholder="策略名称" />
      </a-form-model-item>
      <a-form-model-item>
        <a-button type="primary" @click="init">查询</a-button>
        <a-button style="margin-left: 10px;" @click="resetData">重置</a-button>
        <a-button style="margin-left: 10px;" type="primary" @click="addRecord">添加</a-button>
      </a-form-model-item>
    </a-form-model>
    <div class="linux-list">
      <a-table :loading="loading" :columns="columns" :data-source="list" @change="changePage" :pagination="pagination" :rowKey="(record) => { return record.id;}">
        <span slot="created" slot-scope="record">{{record.created | parsetime }}</span>
        <span slot="status" slot-scope="record">
          <a-switch :checked="record.status == '0' ? true : false" checked-children="启用" un-checked-children="禁用" @change="onStatusChange($event, record)" />
        </span>
        <span slot="operation" slot-scope="record">
          <!-- <a-button class="pd20 paddingleft0" type="link" size="small" @click="seeDetail(record)">详细信息</a-button> -->
          <a-button class="pd20 paddingleft0" type="link" size="small" @click="seeEdit(record)">编辑</a-button>
          <a-popconfirm title="确定要删除吗?" ok-text="确定" cancel-text="取消" @confirm="deleteRecord(record)">
            <a-button class="paddingleft0" type="link" size="small" v-auth="`delete`">删除</a-button>
          </a-popconfirm>
        </span>
      </a-table>
    </div>
    <!-- 新增/编辑规则弹窗 -->
    <a-modal :title="editingId ? '编辑分发规则' : '新增分发规则'" :visible="modalVisible" :confirmLoading="modalLoading" @ok="saveRule" @cancel="closeModal" width="900px">
      <a-form-model :model="editRule" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
        <a-form-model-item label="名称" required>
          <a-input v-model.trim="editRule.name" placeholder="请输入规则名称" />
        </a-form-model-item>
        <a-form-model-item label="实例" required>
          <a-select v-model="editRule.zid" mode="multiple" style="width: 100%" placeholder="选择告警实例">
            <a-select-option v-for="(item, index) in instanceList" :key="index" :value="item.id" :label="item.name" :title="item.name">
              {{ item.name }}
            </a-select-option>
          </a-select>
        </a-form-model-item>

        <a-card title="匹配条件" :bordered="false" size="small">
          <div v-for="(itv, its) in editRule.conditions" :key="its" class="condition-row">
            <a-row :gutter="8" type="flex" align="middle">
              <a-col :span="6">
                <a-form-item label="字段" :label-col="{ span: 24 }" :wrapper-col="{ span: 24 }">
                  <a-select v-model="itv.r_type">
                    <a-select-option v-for="(item, index) in rTypeOptions" :key="index" :value="item.value">
                      {{ item.label }}
                    </a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :span="5">
                <a-form-item label="操作符" :label-col="{ span: 24 }" :wrapper-col="{ span: 24 }">
                  <a-select v-model="itv.r_func">
                    <a-select-option v-for="(item, index) in rFuncOptions" :key="index" :value="item.value">
                      {{ item.label }}
                    </a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :span="8">
                <a-form-item label="值" :label-col="{ span: 24 }" :wrapper-col="{ span: 24 }">
                  <a-input v-model="itv.r_value" placeholder="匹配值" />
                </a-form-item>
              </a-col>
              <a-col :span="5" class="condition-actions">
                <a-button type="danger" v-if="editRule.conditions && editRule.conditions.length > 1" icon="delete" size="small" @click="editRule.conditions.splice(its, 1)">
                  删除
                </a-button>
                <a-button type="primary" v-if="its === 0" icon="plus" size="small" @click="editRule.conditions.push({ r_type: '', r_func: '', r_value: '' })" style="margin-left: 8px;">
                  添加
                </a-button>
              </a-col>
            </a-row>
          </div>
        </a-card>

        <a-card title="时间与通道" :bordered="false" size="small" style="margin-top: 12px;">
          <a-form-model-item label="星期">
            <a-select v-model="editRule.s_week" mode="multiple" style="width: 100%">
              <a-select-option v-for="(item, index) in rWeekOptions" :key="index" :value="item.value">
                {{ item.label }}
              </a-select-option>
            </a-select>
          </a-form-model-item>
          <a-form-model-item label="时间段">
            <a-time-picker v-model="editRule.s_time" format="HH:mm" style="margin-right: 8px;" />
            <a-time-picker v-model="editRule.e_time" format="HH:mm" />
          </a-form-model-item>
          <a-form-model-item label="通道">
            <a-checkbox-group v-model="editRule.channel" :options="rChannelOptions" />
          </a-form-model-item>
        </a-card>

        <a-card title="接收对象" :bordered="false" size="small" style="margin-top: 12px;">
          <a-form-model-item label="接收人">
            <a-select v-model="editRule.user_ids" mode="multiple" style="width: 100%" placeholder="告警接收人">
              <a-select-option v-for="(item, index) in userlist" :key="index" :value="item.id.toString()" :label="item.username" :title="item.username">
                {{ item.username }}
              </a-select-option>
            </a-select>
          </a-form-model-item>
          <a-form-model-item label="接收组">
            <a-select v-model="editRule.group_ids" mode="multiple" style="width: 100%" placeholder="告警接收组">
              <a-select-option v-for="(item, index) in grouplist" :key="index" :value="item.id.toString()" :label="item.name" :title="item.name">
                {{ item.name }}
              </a-select-option>
            </a-select>
          </a-form-model-item>
        </a-card>

        <a-form-model-item label="备注" style="margin-top: 12px;">
          <a-input v-model.trim="editRule.note" placeholder="备注说明" />
        </a-form-model-item>
        <a-form-model-item label="状态">
          <a-switch v-model="editRule.status" checked-children="启用" un-checked-children="禁用" />
        </a-form-model-item>
      </a-form-model>
    </a-modal>
  </page-layout>
</template>

<script>
import PageLayout from "@/layouts/PageLayout";
import { ruleList, userList, groupList, ruleStatusPut, ruleDelete, ruleAdd, rulePut, ruleGet } from "@/services/admin";
import { listZabbixInstance } from "@/services/zabbix";
import { parseTimeFun } from "@/utils/formatter";
import moment from "moment";
import "moment/locale/zh-cn";
export default {
  name: "LinuxList",
  components: {
    PageLayout,
  },
  authorize: {              //权限校验注入设置
    deleteRecord: {        //需要 注入权限校验 的方法名：deleteRecord
      check: 'delete',     //需要校验的操作权限：check
      type: 'role'         //指定操作权限校验的类型，可选 permission 和 role。这里指定以 role.operation 校验操作权限
    },
    onStatusChange: {        //需要 注入权限校验 的方法名：deleteRecord
      check: 'update',     //需要校验的操作权限：check
      type: 'role'         //指定操作权限校验的类型，可选 permission 和 role。这里指定以 role.operation 校验操作权限
    },
  },
  data() {
    return {
      page: 1,
      pageSize: 10,
      loading: false,
      pplist: [],
      status: "",
      rTypeOptions: [
        { value: "host", label: "主机" },
        { value: "group", label: "主机组" },
        { value: "item", label: "指标名称" },
        { value: "key", label: "指标Key" },
        { value: "trigger", label: "触发器" },
        { value: "severity", label: "告警级别" }
      ],
      rFuncOptions: [
        { value: "==", label: "==" },
        { value: "=~", label: "=~" },
        { value: "!=", label: "!=" }
      ],
      rWeekOptions: [
        { value: "0", label: "星期日" },
        { value: "1", label: "星期一" },
        { value: "2", label: "星期二" },
        { value: "3", label: "星期三" },
        { value: "4", label: "星期四" },
        { value: "5", label: "星期五" },
        { value: "6", label: "星期六" }
      ],
      rChannelOptions: [
        { value: "mail", label: "邮件" },
        { value: "wechat", label: "微信" },
        { value: "wechat_robot", label: "企业微信群机器人" },
        // { value: "dingding", label: "钉钉" },
        // { value: "sms", label: "短信" },
      ],
      // 弹窗状态
      modalVisible: false,
      modalLoading: false,
      editingId: null,
      editRule: {
        name: "",
        zid: [],
        m_type: "1",
        conditions: [{ r_type: "", r_func: "", r_value: "" }],
        s_week: ["0", "1", "2", "3", "4", "5", "6"],
        s_time: moment("00:00", "HH:mm"),
        e_time: moment("23:59", "HH:mm"),
        channel: [],
        user_ids: [],
        group_ids: [],
        note: "",
        status: true,
      },
      columns: [
        { title: "ID", dataIndex: "id", align: "left" },
        { title: "名称", dataIndex: "name", align: "left" },
        {
          title: "实例", dataIndex: "z_ids", align: "left", customRender: (value) => {
            // 直接展示规则中配置的实例字符串（支持多实例用逗号分隔）
            const text = (value || '').toString()
            return { children: text, attrs: {} }
          },
        },
        { title: "分发条件", dataIndex: "conditions", align: "left" },
        {
          title: "分发通道", dataIndex: "channel", align: "left", customRender: (value, row, index) => {
            let allist = []
            value.split(",").forEach(items => {
              if (items == "wechat") {
                allist.push("微信");
              }
              if (items == "wechat_robot") {
                allist.push("企业微信群机器人");
              }
              if (items == "sms") {
                allist.push("短信");
              }
              if (items == "dingding") {
                allist.push("钉钉");
              }
              if (items == "mail") {
                allist.push("邮件");
              }
            });
            const obj = {
              children: allist.join(","),
            };
            return obj;
          },
        },
        {
          title: "接收人", dataIndex: "user_ids", align: "left", customRender: (value, row, index) => {
            let allist = []
            value.split(",").forEach(items => {
              this.userlist.forEach(tid => {
                if (items == tid.id) {
                  allist.push(tid.username);
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
        {
          title: "接收组", dataIndex: "group_ids", align: "left", customRender: (value, row, index) => {
            let allist = []
            value.split(",").forEach(items => {
              this.grouplist.forEach(tid => {
                if (items == tid.id) {
                  allist.push(tid.name);
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
        { title: "备注", dataIndex: "note", align: "left" },
        { title: "添加时间", key: "created", align: "left", scopedSlots: { customRender: "created" }, },
        { title: "状态", key: "status", align: "left", scopedSlots: { customRender: "status" } },
        { title: "操作", key: "operation", align: "center", scopedSlots: { customRender: "operation" } },
      ],
      instanceList: [],
      grouplist: [],
      userlist: [],
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
      moment,
      tenantid: "",
      name: "",
      timeValue: null,
    };
  },
  created() {
    let ntime = new Date(),
      qtime = new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000);
    this.beginTime = parseTimeFun(qtime);
    this.endTime = parseTimeFun(ntime);
    this.timeValue = [
      moment(qtime, "YYYY-MM-DD HH:mm:ss"),
      moment(ntime, "YYYY-MM-DD HH:mm:ss"),
    ];
    this.init();
  },
  methods: {
    resetEditRule() {
      this.editRule = {
        name: "",
        zid: [],
        m_type: "1",
        conditions: [{ r_type: "", r_func: "", r_value: "" }],
        s_week: ["0", "1", "2", "3", "4", "5", "6"],
        s_time: moment("00:00", "HH:mm"),
        e_time: moment("23:59", "HH:mm"),
        channel: [],
        user_ids: [],
        group_ids: [],
        note: "",
        status: true,
      }
    },
    init() {
      this.loading = true;
      let req = {
        page: this.page, limit: this.pageSize,
        hosts: this.hosts,
        status: this.status, level: this.level
      };
      if (this.beginTime) {
        req.begin = this.beginTime;
        req.end = this.endTime;
      }
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
      // 使用 listZabbixInstance 从实例表获取实例列表
      listZabbixInstance().then((resp) => {
        let res = resp.data
        if (res.code == 200) {
          this.instanceList = res.data || []
          console.log(this.instanceList)
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
    },
    addRecord() {
      this.editingId = null
      this.resetEditRule()
      this.modalVisible = true
    },
    seeEdit(record) {
      this.editingId = record.id
      this.resetEditRule()
      this.modalVisible = true
      // 加载规则详情
      ruleGet(record.id).then((resp) => {
        const res = resp.data
        if (res.code === 200 && res.data) {
          const item = res.data
          this.editRule.name = item.name || ""
          this.editRule.m_type = item.m_type || "1"
          this.editRule.z_ids = item.z_ids ? item.z_ids.split(",") : []
          this.editRule.conditions = item.conditions ? JSON.parse(item.conditions) : [{ r_type: "", r_func: "", r_value: "" }]
          this.editRule.s_time = moment(item.s_time || "00:00", "HH:mm")
          this.editRule.e_time = moment(item.e_time || "23:59", "HH:mm")
          this.editRule.s_week = item.s_week ? item.s_week.split(",") : []
          this.editRule.channel = item.channel ? item.channel.split(",") : []
          this.editRule.user_ids = item.user_ids ? item.user_ids.split(",") : []
          this.editRule.group_ids = item.group_ids ? item.group_ids.split(",") : []
          this.editRule.note = item.note || ""
          this.editRule.status = item.status === "0"
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
    changeCreationTime(e) {
      if (e.length) {
        this.beginTime = parseTimeFun(new Date(e[0]));
        this.endTime = parseTimeFun(new Date(e[1]));
      } else {
        this.beginTime = "";
        this.endTime = "";
      }
    },
    resetData() {
      this.hosts = "";
      this.tenantid = "";
      this.tenantid = "";
      this.status = "";
      this.level = "";
      this.init();
    },
    closeModal() {
      this.modalVisible = false
    },
    async saveRule() {
      if (!this.editRule.name) {
        this.$message.warning("请填写名称")
        return
      }
      if (!this.editRule.z_ids || this.editRule.z_ids.length === 0) {
        this.$message.warning("请选择实例")
        return
      }
      this.modalLoading = true
      try {
        const payload = JSON.parse(JSON.stringify(this.editRule))
        // 与原新增/编辑页面保持一致的字段格式
        payload.status = payload.status ? "0" : "1"
        payload.s_time = this.editRule.s_time ? this.editRule.s_time.format("HH:mm") : "00:00"
        payload.e_time = this.editRule.e_time ? this.editRule.e_time.format("HH:mm") : "23:59"
        // 保持原有的 m_type，编辑时使用从后端获取的值，新增时默认为 "1"
        // 不要硬编码覆盖，避免将默认规则(m_type=2)错误更新为普通规则(m_type=1)
        payload.m_type = this.editRule.m_type || "1"

        let resp
        if (this.editingId) {
          resp = await rulePut(this.editingId, payload)
        } else {
          resp = await ruleAdd(payload)
        }
        const res = resp.data
        if (res.code === 200) {
          this.$message.success(res.message || "保存成功")
          this.modalVisible = false
          this.init()
        } else {
          this.$message.error(res.message || "保存失败")
        }
      } finally {
        this.modalLoading = false
      }
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
          res = "启用";
          break;
        case "1":
          res = "禁用";
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

.condition-row {
  margin-bottom: 16px;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.condition-actions {
  display: flex;
  align-items: flex-end;
  padding-bottom: 24px;
}

/deep/ .condition-row .ant-form-item {
  margin-bottom: 0;
}

/deep/ .condition-row .ant-form-item-label {
  padding-bottom: 4px;
}
</style>
