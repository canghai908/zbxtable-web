<template>
  <page-layout :noTitle="true">
    <a-card :bodyStyle="{boxShadow: '0 1px 8px 0 #ddd'}" :loading="!showPage">
      <a-form-model class="home-search" layout="inline" :colon='false'>
        <a-form-model-item label="告警时间">
          <a-range-picker format="YYYY-MM-DD HH:mm:ss" :show-time="{ format: 'HH:mm', defaultValue:[moment('00:00:00', 'HH:mm:ss'),moment('23:59:59', 'HH:mm:ss')]}" v-model="timeValue" @change="changeCreationTime" :getCalendarContainer="triggerNode=>{return triggerNode.parentNode || document.body}" />
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
        </a-form-model-item>
        <a-form-model-item>
          <a-button type="primary" @click="anayexport">导出</a-button>
        </a-form-model-item>
      </a-form-model>
      <a-row style="margin: 20px -12px">
        <a-col style="padding: 0 12px" :xl="14" :lg="16" :md="24" :sm="24" :xs="24" v-if="nameList && nameList.length">
          <a-card hoverable :headStyle="{textAlign: 'center', width: '100%', background: '#FAFBFC'}" :bodyStyle="{padding: '0'}" title="历史告警TOP10">
            <e-line :mock="nameList" :numList="numList" />
          </a-card>
        </a-col>
        <a-col style="padding: 0 12px" :xl="10" :lg="8" :md="24" :sm="24" :xs="24" v-if="list && list.length">
          <a-card hoverable :headStyle="{textAlign: 'center', width: '100%', background: '#FAFBFC'}" :bodyStyle="{padding: '0'}" title="告警分类TOP">
            <e-pie :mock="list" />
          </a-card>
        </a-col>
      </a-row>
    </a-card>
  </page-layout>
</template>

<script>
import PageLayout from "@/layouts/PageLayout";
import ePie from "./ePie";
import eLine from "./eLine";
import { alarmAnalysis, alarmTenantGet, alarmExport } from "@/services/admin";
import { parseTimeFun } from "@/utils/formatter";
import moment from "moment";
import "moment/locale/zh-cn";
export default {
  name: "analysis",
  components: {
    PageLayout,
    ePie,
    eLine,
  },
  data() {
    return {
      tenantid: "",
      tenantlist: [],
      list: [],
      nameList: [],
      numList: [],
      moment,
      timeValue: null,
      beginTime: "",
      endTime: "",
      showPage: false,
      data: "",
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
      this.list = [];
      this.nameList = [];
      this.numList = [];
      alarmAnalysis({ begin: this.beginTime, end: this.endTime, tenant_id: this.tenantid })
        .then((resp) => {
          let res = resp.data;
          if (res.code == 200) {
            this.list = res.data ? res.data.level_count || [] : [];
            this.nameList = res.data ? res.data.host || [] : [];
            this.numList = res.data ? res.data.host_count || [] : [];
          }
        })
        .finally(() => {
          this.showPage = true;
        });
      alarmTenantGet().then((resp) => {
        let res = resp.data
        if (res.code == 200) {
          this.tenantlist = res.data.items || []
        }
      }).finally(() => { this.loading2 = false })
    },
    anayexport() {
      alarmExport(
        { begin: this.beginTime, end: this.endTime, tenant_id: this.tenantid },
        { responseType: "arraybuffer", }
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
    handleTenantChange(value) {
      this.tenantid = value
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
