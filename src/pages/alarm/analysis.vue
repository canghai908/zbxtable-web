<template>
  <page-layout :noTitle="true">
    <a-card :bodyStyle="{boxShadow: '0 1px 8px 0 #ddd'}" :loading="!showPage">
      <a-form-model class="home-search" layout="inline" :colon='false'>
        <a-form-model-item :label="$t('analysis_select_instance')">
          <a-select v-model="selectedInstance" :placeholder="$t('analysis_all_instances')" allowClear style="width: 200px">
            <a-select-option value="">{{ $t('analysis_all_instances') }}</a-select-option>
            <a-select-option v-for="item in instanceList" :key="item.id" :value="item.id">
              {{ item.name }}
            </a-select-option>
          </a-select>
        </a-form-model-item>
        <a-form-model-item :label="$t('analysis_alarm_time')">
          <a-range-picker format="YYYY-MM-DD HH:mm:ss" :show-time="{ format: 'HH:mm', defaultValue:[moment('00:00:00', 'HH:mm:ss'),moment('23:59:59', 'HH:mm:ss')]}" v-model="timeValue"
            :ranges="timeRanges" @change="changeCreationTime" :getCalendarContainer="triggerNode=>{return triggerNode.parentNode || document.body}" />
        </a-form-model-item>
        <a-form-model-item>
          <a-button type="primary" @click="init">{{ $t('btn_query') }}</a-button>
        </a-form-model-item>
        <a-form-model-item>
          <a-button type="primary" @click="anayexport">{{ $t('btn_export') }}</a-button>
        </a-form-model-item>
      </a-form-model>
      <a-row style="margin: 20px -12px">
        <a-col style="padding: 0 12px" :xl="12" :lg="12" :md="24" :sm="24" :xs="24" v-if="nameList && nameList.length">
          <a-card hoverable :headStyle="$cardHeadStyle" :bodyStyle="{padding: '0'}" :title="$t('analysis_historical_alarm_top10')">
            <e-line :mock="nameList" :numList="numList" />
          </a-card>
        </a-col>
        <a-col style="padding: 0 12px" :xl="12" :lg="12" :md="24" :sm="24" :xs="24" v-if="list && list.length">
          <a-card hoverable :headStyle="$cardHeadStyle" :bodyStyle="{padding: '0'}" :title="$t('analysis_alarm_classification_top')">
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
import { alarmAnalysis, alarmExport } from "@/services/admin";
import { listZabbixInstance } from '@/services/zabbix'
import { parseTimeFun } from "@/utils/formatter";
import { buildAlarmTimeRanges, getDefaultAlarmTimeRange } from "./timeRange";
import moment from "moment";
import "moment/locale/zh-cn";
export default {
  i18n: require('./i18n'),
  name: "analysis",
  components: {
    PageLayout,
    ePie,
    eLine,
  },
  data() {
    return {
      instanceList: [],
      selectedInstance: '',
      list: [],
      nameList: [],
      numList: [],
      moment,
      timeRanges: {},
      timeValue: null,
      beginTime: "",
      endTime: "",
      showPage: false,
      data: "",
    };
  },
  created() {
    this.timeRanges = buildAlarmTimeRanges(this.$t.bind(this));
    this.applyTimeRange(getDefaultAlarmTimeRange());
    this.loadInstances();
    this.init();
  },
  methods: {
    applyTimeRange(range = []) {
      if (!range.length) {
        this.timeValue = null;
        this.beginTime = "";
        this.endTime = "";
        return;
      }
      this.timeValue = range;
      this.beginTime = parseTimeFun(range[0].toDate());
      this.endTime = parseTimeFun(range[1].toDate());
    },
    loadInstances() {
      listZabbixInstance().then((resp) => {
        let res = resp.data
        if (res.code == 200) {
          const allItems = Array.isArray(res.data) ? res.data : []
          this.instanceList = allItems.filter(item => item.enabled)
        }
      }).catch(err => {
        console.error('加载实例列表失败:', err)
      })
    },
    init() {
      this.list = [];
      this.nameList = [];
      this.numList = [];
      const params = { 
        begin: this.beginTime, 
        end: this.endTime
      };
      if (this.selectedInstance) {
        params.zid = this.selectedInstance;
      }
      alarmAnalysis(params)
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
    },
    anayexport() {
      const params = { 
        begin: this.beginTime, 
        end: this.endTime
      };
      if (this.selectedInstance) {
        params.zid = this.selectedInstance;
      }
      alarmExport(
        params,
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
    changeCreationTime(e) {
      this.applyTimeRange(e || []);
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
