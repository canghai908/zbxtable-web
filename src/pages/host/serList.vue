<template>
  <page-layout :noTitle="true">
    <a-form-model class="home-search" layout="inline" :colon='false'>
      <a-form-model-item label="搜索">
        <a-input v-model.trim="hosts" placeholder="主机名" />
      </a-form-model-item>
      <a-form-model-item label="型号">
        <a-input v-model.trim="model" placeholder="型号" />
      </a-form-model-item>
      <a-form-model-item label="IPMI">
        <a-input v-model.trim="interfaces" placeholder="IPMI" />
      </a-form-model-item>
      <a-form-model-item label="监控状态">
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
        <div slot="model" slot-scope="record">{{record.model}}</div>
        <div slot="serial_no" slot-scope="record">{{record.serial_no}}</div>
        <div slot="os" slot-scope="record">{{record.os}}</div>
        <div slot="interfaces" slot-scope="record">{{record.interfaces}}</div>
        <div slot="location" slot-scope="record">{{record.location}}</div>
        <span slot="uptime" slot-scope="record">{{record.uptime||'--'}}</span>
        <div slot="cpu_utilization" slot-scope="record">
          <a-progress :percent="parseFloat(record.cpu_utilization || 0)" size="small" status="active" />
        </div>
        <div slot="memory_utilization" slot-scope="record">
          <a-progress :percent="parseFloat(record.memory_utilization || 0)" size="small" status="active" />
        </div>
        <span slot="available" slot-scope="record">
          <a-tooltip>
            <template slot="title">
              {{record.error}}
            </template>
            <a-tag v-if="record.available == 1" color="#34af67">正常</a-tag>
            <a-tag v-else-if="record.available == 2" color="#DC143C">异常</a-tag>
            <a-tag v-else status="default" text="未知" />
          </a-tooltip>
        </span>
        <div slot="error" slot-scope="record">{{record.error}}</div>
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
      model: "",
      ip: "",
      available: "",
      hosttype: "HW_SRV",
      interfaces: "",
      loading: false,
      availableOption: [
        { label: "正常", value: "1" },
        { label: "异常", value: "2" },
      ],
      columns: [
        {
          title: "序号",
          key: "hostid",
          align: "center",
          scopedSlots: { customRender: "hostid" },
        },
        {
          title: "主机名",
          key: "name",
          align: "center",
          scopedSlots: { customRender: "name" },
        },
        {
          title: "型号",
          key: "model",
          align: "center",
          scopedSlots: { customRender: "model" },
        },
        {
          title: "序列号",
          key: "serial_no",
          align: "center",
          scopedSlots: { customRender: "serial_no" },
        },
        {
          title: "操作系统",
          key: "os",
          align: "center",
          scopedSlots: { customRender: "os" },
        },
        {
          title: "IPMI地址",
          key: "interfaces",
          align: "center",
          scopedSlots: { customRender: "interfaces" },
        },
        {
          title: "设备位置",
          key: "location",
          align: "center",
          scopedSlots: { customRender: "location" },
        },
        {
          title: "监控状态",
          key: "available",
          align: "center",
          scopedSlots: { customRender: "available" },
        },
        {
          title: "更多",
          key: "operation",
          align: "center",
          scopedSlots: { customRender: "operation" },
        },
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
        model: this.model,
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
          model: this.model,
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
      this.$router.push("/server/detail?id=" + v.hostid);
    },
    resetData() {
      if (this.hosts) {
        this.hosts = "";
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
