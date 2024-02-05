<template>
  <page-layout :noTitle="true">
    <a-form-model class="home-search" layout="inline" :colon='false'>
      <a-form-model-item label="主机名">
        <a-input v-model.trim="hosts" placeholder="主机名" />
      </a-form-model-item>
      <a-form-model-item label="IP">
        <a-input v-model.trim="interfaces" placeholder="IP" />
      </a-form-model-item>
      <a-form-model-item label="采集状态">
        <a-select style="width: 80px" v-model.trim="available">
          <a-select-option :value="item.value" v-for="item in availableOption" :key="item.value">{{item.label}}</a-select-option>
        </a-select>
      </a-form-model-item>
      <a-form-model-item>
        <a-button type="primary" @click="init">查询</a-button>
        <a-button style="margin-left: 10px;" @click="resetData">重置</a-button>
        <a-button type="primary" style="margin-left: 10px;" @click="hostexport">导出</a-button>
      </a-form-model-item>
    </a-form-model>
    <div class="linux-list">
      <a-table :loading="loading" :columns="columns" :data-source="list" @change="changePage" :pagination="pagination" :rowKey="(record) => { return record.hostid;}">
        <span slot="hostid" slot-scope="record">{{record.hostid}}</span>
        <div slot="name" slot-scope="record">{{record.name}}</div>
        <div slot="os" slot-scope="record">{{record.os}}</div>
        <div slot="interfaces" slot-scope="record">{{record.interfaces}}</div>
        <span slot="uptime" slot-scope="record">{{record.uptime||'--'}}</span>
        <div slot="cpu_utilization" slot-scope="record">
          <a-progress :percent="parseFloat(record.cpu_utilization || 0)" size="small" status="active" />
        </div>
        <div slot="memory_utilization" slot-scope="record">
          <a-progress :percent="parseFloat(record.memory_utilization || 0)" size="small" status="active" />
        </div>
        <div slot="ping" slot-scope="record">
          <a-tag v-if="record.ping.includes('Up')" color="#34af67">Up</a-tag>
          <a-tag v-else-if="record.ping.includes('Down')" color="#DC143C">Down</a-tag>
          <a-tag v-else status="default" color="#808080">Unknown</a-tag>
          {{record.ping_sec.replace(/\s/g, '') || '--'}}/{{record.ping_loss.replace(/\s/g, '') || '--'}}
        </div>
        <span slot="available" slot-scope="record">
          <a-tooltip>
            <template slot="title">
              {{record.error}}
            </template>
            <a-tag v-if="record.available == 1" color="#34af67">正常</a-tag>
            <a-tag v-else-if="record.available ==2" color="#DC143C">异常</a-tag>
            <a-tag v-else status="default" text="未知" />
          </a-tooltip>
        </span>
        <span slot="operation" slot-scope="record">
          <a-button class="pd20 paddingleft0" type="link" size="small" @click="seeDetail(record)">详细信息</a-button>
        </span>
      </a-table>
    </div>
  </page-layout>
</template>

<script>
import PageLayout from "@/layouts/PageLayout";
import { hostList, hostExport } from "@/services/admin";
export default {
  name: "LinuxList",
  components: {
    PageLayout,
  },
  data() {
    return {
      page: 1,
      pageSize: 10,
      hosts: "",
      ip: "",
      available: "",
      interfaces: "",
      hosttype: "VM_LIN",
      loading: false,
      availableOption: [
        { label: "正常", value: "1" },
        { label: "异常", value: "2" },
      ],
      columns: [
        { title: "主机ID", key: "hostid", align: "left", scopedSlots: { customRender: "hostid" }, },
        { title: "主机名", key: "name", align: "left", scopedSlots: { customRender: "name" }, },
        { title: "IP地址", key: "interfaces", align: "left", scopedSlots: { customRender: "interfaces" }, },
        { title: "内核版本", key: "os", align: "left", scopedSlots: { customRender: "os" }, },
        { title: "运行时长", key: "uptime", align: "left", scopedSlots: { customRender: "uptime" }, },
        { title: "CPU使用率", key: "cpu_utilization", align: "left", width: "150px", scopedSlots: { customRender: "cpu_utilization" }, },
        { title: "内存使用率", key: "memory_utilization", align: "left", width: "150px", scopedSlots: { customRender: "memory_utilization" }, },
        { title: "Ping(Sec/Loss)", key: "ping", align: "left", scopedSlots: { customRender: "ping" }, },
        { title: "采集状态", key: "available", align: "left", scopedSlots: { customRender: "available" }, },
        { title: "操作", key: "operation", align: "center", scopedSlots: { customRender: "operation" } },
      ],
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
    };
  },
  created() {
    this.init();
  },
  methods: {
    init() {
      this.loading = true;
      hostList({
        page: this.page,
        limit: this.pageSize,
        hosttype: this.hosttype,
        hosts: this.hosts,
        ip: this.interfaces,
        available: this.available,
      })
        .then((resp) => {
          let res = resp.data;
          if (res.code == 200) {
            this.pagination.total = res.data.total;
            this.pagination.current = this.page;
            this.pagination.pageSize = this.pageSize;
            this.list = res.data.items || [];
          }
        })
        .finally(() => {
          this.loading = false;
        });
    },
    changePage(e) {
      // 切换页码
      this.page = e.current;
      this.pageSize = e.pageSize;
      this.init();
    },
    hostexport() {
      hostExport(
        {
          hosttype: this.hosttype,
          hosts: this.hosts,
          ip: this.interfaces,
          available: this.available,
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
    seeDetail(v) {
      this.$router.push("/host/lindetail?id=" + v.hostid + "&type=1");
    },
    resetData() {
      if (this.hosts || this.interfaces || this.available) {
        this.hosts = "";
        this.interfaces = "";
        this.available = "";
        this.init();
      }
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
.home-search {
  margin-bottom: 10px;
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
.linux-list {
  /deep/ .ant-progress-bg {
    height: 14px !important;
  }
  /deep/ .ant-progress-text {
    margin-left: 2px;
  }
}
</style>
