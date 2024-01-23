<template>
  <page-layout :noTitle="true">
    <a-form-model class="home-search" layout="inline" :colon='false'>
      <a-form-model-item label="搜索">
        <a-input v-model.trim="name" placeholder="策略名称" />
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
  </page-layout>
</template>

<script>
import PageLayout from "@/layouts/PageLayout";
import { ruleList, alarmTenantGet, userList, groupList, ruleStatusPut, ruleDelete } from "@/services/admin";
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
      rChannelOptions: [
        { value: "mail", label: "邮件" },
        { value: "wechat", label: "微信" },
        // { value: "dingding", label: "钉钉" },
        // { value: "sms", label: "短信" },
      ],
      columns: [
        { title: "ID", dataIndex: "id", align: "left" },
        { title: "名称", dataIndex: "name", align: "left" },
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
        { title: "分发条件", dataIndex: "conditions", align: "left" },
        {
          title: "分发通道", dataIndex: "channel", align: "left", customRender: (value, row, index) => {
            let allist = []
            value.split(",").forEach(items => {
              if (items == "wechat") {
                allist.push("微信");
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
      tenantlist: [],
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
    init() {
      this.loading = true;
      let req = {
        page: this.page, limit: this.pageSize,
        hosts: this.hosts, tenant_id: this.tenantid,
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
    },
    addRecord() {
      this.$router.push("/alarm/rule-add")
    },
    seeEdit(record) {
      this.$router.push("/alarm/rule-edit?id=" + record.id)
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
</style>
