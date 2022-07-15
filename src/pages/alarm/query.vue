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
      <a-form-model-item label="告警类型">
        <a-select optionFilterProp="label" style="width:100px" v-model="status" option-label-prop="label" @change="handleStatusChange">
          <a-select-option v-for="(item, index) in statuslist" :key="index" :value="item.id" :label="item.value" :title="item.value">
            {{ item.value }}
          </a-select-option>
        </a-select>
      </a-form-model-item>
      <a-form-model-item label="告警级别">
        <a-select optionFilterProp="label" style="width:100px" v-model="level" option-label-prop="label" @change="handleLevelChange">
          <a-select-option v-for="(item, index) in levellist" :key="index" :value="item.id" :label="item.value" :title="item.value">
            {{ item.value }}
          </a-select-option>
        </a-select>
      </a-form-model-item>
      <a-form-model-item label="创建时间">
        <a-range-picker format="YYYY-MM-DD HH:mm:ss" :show-time="{ format: 'HH:mm', defaultValue:[moment('00:00:00', 'HH:mm:ss'),moment('23:59:59', 'HH:mm:ss')]}" v-model="timeValue" @change="changeCreationTime" :getCalendarContainer="triggerNode=>{return triggerNode.parentNode || document.body}" />
      </a-form-model-item>
      <a-form-model-item>
        <a-button type="primary" @click="init">查询</a-button>
        <a-button style="margin-left: 10px;" @click="resetData">重置</a-button>
        <a-button style="margin-left: 10px;" type="primary" @click="anayexport">导出</a-button>
      </a-form-model-item>
    </a-form-model>

    <div class="linux-list">
      <a-table :loading="loading" :columns="columns" :data-source="list" @change="changePage" :pagination="pagination" :rowKey="(record) => { return record.id;}">
        <div slot="level" slot-scope="record">
          <a-tag v-if="record.level==0" color="#97AAB3">{{record.level | levelFilter}}</a-tag>
          <a-tag v-else-if="record.level==1" color=" #7499FF">{{record.level | levelFilter}}</a-tag>
          <a-tag v-else-if="record.level==2" color="#FFC859">{{record.level | levelFilter}}</a-tag>
          <a-tag v-else-if="record.level==3" color="#FFA059">{{record.level | levelFilter}}</a-tag>
          <a-tag v-else-if="record.level==4" color="#E97659">{{record.level | levelFilter}}</a-tag>
          <a-tag v-else-if="record.level==5" color="#f50000">{{record.level | levelFilter}}</a-tag>
        </div>
        <div slot="status" slot-scope="record">
          <a-tag v-if="record.status==0" color="#87d068">{{record.status | statusFilter}}</a-tag>
          <a-tag v-else-if="record.status==1" color="#f50">{{record.status | statusFilter}}</a-tag>
        </div>
        <span slot="occurtime" slot-scope="record">{{record.occurtime | parsetime }}</span>
      </a-table>
    </div>
  </page-layout>
</template>

<script>
import PageLayout from "@/layouts/PageLayout";
import { alarm, alarmTenantGet, alarmExport } from "@/services/admin";
import { parseTimeFun } from "@/utils/formatter";
import moment from "moment";
import "moment/locale/zh-cn";
export default {
  name: "LinuxList",
  components: {
    PageLayout,
  },
  data() {
    return {
      page: 1,
      pageSize: 10,
      loading: false,
      status: "",
      level: "",
      statuslist: [
        { id: 1, value: "告警", },
        { id: 0, value: "恢复", }
      ],
      levellist: [
        { id: 0, value: "未分类", },
        { id: 1, value: "信息", },
        { id: 2, value: "警告", },
        { id: 3, value: "一般", },
        { id: 4, value: "严重", },
        { id: 5, value: "灾难", },
      ],

      columns: [
        { title: "ID", dataIndex: "id", align: "center" },
        { title: "告警租户", dataIndex: "tenant_id", align: "left" },
        { title: "告警类型", key: "status", align: "center", scopedSlots: { customRender: "status" }, },
        { title: "设备名称", dataIndex: "hostname", align: "left" },
        { title: "IP", dataIndex: "host_ip", align: "center", scopedSlots: { customRender: "host_ip" }, },
        { title: "告警级别", key: "level", align: "center", scopedSlots: { customRender: "level" }, },
        { title: "告警描述", dataIndex: "message", align: "left" },
        { title: "告警详情", dataIndex: "detail", align: "left" },
        { title: "发生时间", key: "occurtime", align: "center", scopedSlots: { customRender: "occurtime" }, },
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
      moment,
      tenantid: "",
      hosts: "",
      timeValue: null,
      beginTime: "",
      endTime: "",
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
      alarm(req).then((resp) => {
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
    handleTenantChange(value) {
      this.tenantid = value
    },

    handleStatusChange(value) {
      this.status = value
    },
    handleLevelChange(value) {
      this.level = value
    },
    //导出excel
    anayexport() {
      alarmExport(
        {
          begin: this.beginTime, end: this.endTime,
          hosts: this.hosts, tenant_id: this.tenantid,
          status: this.status, level: this.level
        },
        {
          responseType: "arraybuffer",
        }
      ).then((resp) => {
        let filename = resp.headers["content-disposition"]
          .split(";")
          .find((n) => n.includes("filename="))
          .replace("filename=", "")
          .trim();
        const url = window.URL.createObjectURL(new Blob([resp.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
      });
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
</style>
