<template>
  <page-layout :title="detail.name">
    <div slot="headerContent" class="linux-detail">
      <!-- 主机基本信息 -->
      <a-card :headStyle="{...$cardHeadStyle, marginBottom: '12px'}" :bodyStyle="{padding: '12px'}" :title="$t('win_card_basic_info')">
        <a-row :gutter="[24, 8]">
          <a-col :xl="6" :lg="8" :md="12" :sm="24">
            <div class="info-item">
              <span class="info-label" :style="{color: themeColor, opacity: 0.85}">{{ $t('win_label_host_id') }}:</span>
              <span class="info-value">{{detail.hostid}}</span>
            </div>
          </a-col>
          <a-col :xl="6" :lg="8" :md="12" :sm="24">
            <div class="info-item">
              <span class="info-label" :style="{color: themeColor, opacity: 0.85}">{{ $t('win_label_cpu_cores') }}:</span>
              <span class="info-value">{{detail.number_of_cores}}</span>
            </div>
          </a-col>
          <a-col :xl="6" :lg="8" :md="12" :sm="24">
            <div class="info-item">
              <span class="info-label" :style="{color: themeColor, opacity: 0.85}">{{ $t('win_label_type') }}:</span>
              <span class="info-value">{{detail.model || "--"}}</span>
            </div>
          </a-col>
          <a-col :xl="6" :lg="8" :md="12" :sm="24">
            <div class="info-item">
              <span class="info-label" :style="{color: themeColor, opacity: 0.85}">{{ $t('win_label_total_memory') }}:</span>
              <span class="info-value">{{detail.memory_total || "--"}}</span>
            </div>
          </a-col>
        </a-row>
        <a-row :gutter="[24, 8]">
          <a-col :xl="6" :lg="8" :md="12" :sm="24">
            <div class="info-item">
              <span class="info-label" :style="{color: themeColor, opacity: 0.85}">{{ $t('win_label_os') }}:</span>
              <span class="info-value">{{detail.os || "--"}}</span>
            </div>
          </a-col>
          <a-col :xl="6" :lg="8" :md="12" :sm="24">
            <div class="info-item">
              <span class="info-label" :style="{color: themeColor, opacity: 0.85}">{{ $t('win_label_uptime') }}:</span>
              <span class="info-value">{{detail.uptime || "--"}}</span>
            </div>
          </a-col>
          <a-col :xl="12" :lg="16" :md="24" :sm="24">
            <div class="info-item">
              <span class="info-label" :style="{color: themeColor, opacity: 0.85}">{{ $t('win_label_remarks') }}:</span>
              <span class="info-value">{{detail.vendor || "--"}}</span>
            </div>
          </a-col>
        </a-row>
      </a-card>
      <a-tabs :tabBarStyle="{textAlign: 'center', width: '100%'}" style="padding: 0px 2px;">
        <a-tab-pane :tab="$t('win_tab_runtime_info')" key="1">
          <a-card :bodyStyle="{boxShadow: '0 1px 8px 0 #ddd', padding: '12px'}" :loading="!detail">
            <a-row :gutter="[12, 12]">
              <a-col :xl="{ span: 6 }" :lg="{ span: 12 }">
                <a-card hoverable :headStyle="{...$cardHeadStyle, textAlign: 'center'}" :bodyStyle="{padding: '0'}" :title="$t('card_cpu_usage')">
                  <div id="liquidCPU" style="width: 300px; height: 300px;margin:0 auto;"></div>
                </a-card>
              </a-col>
              <a-col :xl="{ span: 6 }" :lg="{ span: 12 }">
                <a-card hoverable :headStyle="{...$cardHeadStyle, textAlign: 'center'}" :bodyStyle="{padding: '0'}" :title="$t('card_memory_usage')">
                  <div id="liquidMem" style="width: 300px; height: 300px;margin:0 auto;"></div>
                </a-card>
              </a-col>
              <a-col :xl="{ span: 6 }" :lg="{ span: 12 }">
                <a-card hoverable :headStyle="{...$cardHeadStyle, textAlign: 'center'}" :bodyStyle="{padding: '0'}" :title="$t('card_network_packet_loss')">
                  <div id="liquidPingloss" style="width: 300px; height: 300px;margin:0 auto;"></div>
                </a-card>
              </a-col>
              <a-col :xl="{ span: 6 }" :lg="{ span: 12 }">
                <a-card hoverable :headStyle="{...$cardHeadStyle, textAlign: 'center'}" :bodyStyle="{padding: '0'}" :title="$t('card_network_latency')">
                  <div id="liquidPingsec" class="text-pingsec" :style="{color: themeColor}">{{detail.ping_sec | dataFormat}}</div>
                </a-card>
              </a-col>
            </a-row>
            <a-row :gutter="[12, 12]" style="margin-top: 12px;">
              <a-col :span="24">
                <a-card hoverable :headStyle="{...$cardHeadStyle, textAlign: 'center'}" :bodyStyle="{padding: '12px'}" :title="$t('win_card_disk_usage')">
                  <a-table :loading="loading2" :columns="columns" :data-source="FileSystemList" :pagination=false :scroll="{ y: 400 }" :rowKey="(record) => { return record.id;}">
                    <div slot="name" slot-scope="record">{{record.name}}</div>
                    <div slot="total_space" slot-scope="record">{{record.total_space | formatBytes}}</div>
                    <div slot="used_space" slot-scope="record">{{record.used_space | formatBytes}}</div>
                    <div slot="space_utilization" slot-scope="record" style="display: flex; align-items: center; gap: 8px;">
                      <a-progress :percent=record.space_utilization status="active" :show-info="false" style="flex: 1; min-width: 100px;" />
                      <span style="white-space: nowrap; min-width: 45px;">{{record.space_utilization}}%</span>
                    </div>
                    <span slot="lastclock" slot-scope="record">{{record.lastclock| dateFormat}}</span>
                  </a-table>
                </a-card>
              </a-col>
            </a-row>
          </a-card>
          <a-card :bodyStyle="{boxShadow: '0 1px 8px 0 #ddd', padding: '12px'}" :loading="!detail">
            <a-row :gutter="[12, 12]">
              <a-col :span="24">
                <a-card hoverable :headStyle="{...$cardHeadStyle, textAlign: 'center'}" :bodyStyle="{padding: '12px'}" :title="$t('win_card_network_card')">
                  <a-table :loading="loading2" :columns="columns2" :data-source="Interfacelist" :pagination=false :scroll="{ y: 400 }" :rowKey="(record) => { return record.id;}">
                    <span slot="operational_status" slot-scope="record">
                      <template slot="title">
                        {{record.operational_status||'--'}}
                      </template>
                      <a-badge v-if="record.operational_status.indexOf('Connected')!=-1" status="success" :text=record.operational_status />
                      <a-badge v-else-if="record.operational_status.indexOf('Disconnected')!=-1" status="error" :text=record.operational_status />
                      <a-badge v-else status="default" :text=record.operational_status />
                    </span>
                    <div slot="name" slot-scope="record">{{record.name}}</div>
                    <div slot="bits_received" slot-scope="record">
                      {{record.bits_received | TrafficBytes(record.speed) }}
                    </div>
                    <div slot="bits_sent" slot-scope="record">
                      {{record.bits_sent | TrafficBytes(record.speed) }}
                    </div>
                    <div slot="instatus" slot-scope="record">{{record.in_discarded}}/{{record.in_errors}}</div>
                    <div slot="outstatus" slot-scope="record">{{record.out_discarded}}/{{record.out_errors}}</div>
                    <div slot="speed" slot-scope="record">{{record.speed | SpeedToSize}}</div>
                    <div slot="operation" slot-scope="record">
                      <a-button type="primary" @click="seeDetail(record)">{{ $t('btn_detail') }}</a-button>
                    </div>
                    <span slot="lastclock" slot-scope="record">{{record.lastclock | dateFormat }}</span>
                  </a-table>
                </a-card>
              </a-col>
            </a-row>
          </a-card>
        </a-tab-pane>
      </a-tabs>
      <a-modal v-model="visible" width="1400px" :title="$t('modal_interface_detail')">
        <a-row>
          <a-col>
            <a-form-model class="home-search" layout="inline" style="width: 80%; height: 10%;margin:0 auto;" :colon='false'>
              <a-form-model-item :label="$t('form_time_label')">
                <a-range-picker format="YYYY-MM-DD HH:mm:ss" :show-time="{ format: 'HH:mm', defaultValue:[moment('00:00:00', 'HH:mm:ss'),moment('23:59:59', 'HH:mm:ss')]}" v-model="timeValue" @change="changeCreationTime" :getCalendarContainer="triggerNode=>{return triggerNode.parentNode || document.body}" />
              </a-form-model-item>
              <a-form-model-item>
                <a-button :style="{ marginRight: '10px' }" type="primary" @click="trafficeQuery">{{ $t('form_query_btn') }}</a-button>
                <a-button @click="restDate">{{ $t('form_reset_btn') }}</a-button>
              </a-form-model-item>
            </a-form-model>
          </a-col>
        </a-row>
        <a-divider />
        <a-row>
          <!-- 流量 -->
          <a-col :span="12">
            <a-row>
              <a-col>
                <div id="trafficChat" style="width: 700px; height: 300px;"></div>
              </a-col>
            </a-row>
            <a-row>
              <a-col>
                <a-table :loading="loading3" style="width: 90%;margin:0 auto;" :columns="trafficeColumns" :data-source="trafficeSeries.list" :pagination="false" :rowKey="(record) => { return record.name}" :customHeaderRow="() => ({ style: { color: $themeColor } })">
                  <div slot="name" slot-scope="record" :style="{ color: $themeColor }">{{record.name }}</div>
                  <div slot="min" slot-scope="record" :style="{ color: $themeColor }">{{record.min | TrafficTBytes}}</div>
                  <div slot="max" slot-scope="record" :style="{ color: $themeColor }">{{record.max | TrafficTBytes}}</div>
                  <div slot="avg" slot-scope="record" :style="{ color: $themeColor }">{{record.avg | TrafficTBytes}}</div>
                  <div slot="th_perc_avg" slot-scope="record" :style="{ color: $themeColor }">{{record.th_perc_avg | TrafficTBytes}}</div>
                  <!-- <div slot="th_perc_val" slot-scope="record">{{record.th_perc_val | TrafficTBytes}}</div> -->
                </a-table>
              </a-col>
            </a-row>
          </a-col>
          <!-- 丢包 -->
          <a-col :span="12">
            <a-row>
              <a-col>
                <div id="discardedChart" style="width: 700px; height: 300px;"></div>
              </a-col>
              <a-col>
                <a-table :loading="loading3" style="width: 90%; height: 10%;margin:0 auto;" :columns="discardedColumns" :data-source="diescardedSeries.list" :pagination="false" :rowKey="(record) => { return record.name}" :customHeaderRow="() => ({ style: { color: $themeColor } })">
                  <div slot="name" slot-scope="record" :style="{ color: $themeColor }">{{record.name }}</div>
                  <div slot="min" slot-scope="record" :style="{ color: $themeColor }">{{record.min }}</div>
                  <div slot="max" slot-scope="record" :style="{ color: $themeColor }">{{record.max}}</div>
                  <div slot="avg" slot-scope="record" :style="{ color: $themeColor }">{{record.avg  }}</div>
                </a-table>
              </a-col>
            </a-row>
          </a-col>
        </a-row>
        <a-divider />

        <a-row>
          <!-- 错包 -->
          <a-col :span="12">
            <a-row>
              <a-col>
                <div id="errorsChart" style="width: 700px; height: 300px;"></div>
              </a-col>
              <a-col>
                <a-table :loading="loading3" style="width: 90%;margin:0 auto;" :columns="discardedColumns" :data-source="errorsSeries.list" :pagination="false" :rowKey="(record) => { return record.name}" :customHeaderRow="() => ({ style: { color: $themeColor } })">
                  <div slot="name" slot-scope="record" :style="{ color: $themeColor }">{{record.name }}</div>
                  <div slot="min" slot-scope="record" :style="{ color: $themeColor }">{{record.min }}</div>
                  <div slot="max" slot-scope="record" :style="{ color: $themeColor }">{{record.max}}</div>
                  <div slot="avg" slot-scope="record" :style="{ color: $themeColor }">{{record.avg  }}</div>
                </a-table>
              </a-col>
            </a-row>
          </a-col>
          <!-- 端口状态 -->
          <a-col :span="12">
            <a-row>
              <a-col>
                <div id="operationalChart" style="width: 700px; height: 300px;"></div>
              </a-col>
              <a-col>
                <a-table :loading="loading3" style="width: 90%;margin:0 auto;" :columns="discardedColumns" :data-source="operationalSeries.list" :pagination="false" :rowKey="(record) => { return record.name}" :customHeaderRow="() => ({ style: { color: $themeColor } })">
                  <div slot="name" slot-scope="record" :style="{ color: $themeColor }">{{record.name }}</div>
                  <div slot="min" slot-scope="record" :style="{ color: $themeColor }">{{record.min }}</div>
                  <div slot="max" slot-scope="record" :style="{ color: $themeColor }">{{record.max}}</div>
                  <div slot="avg" slot-scope="record" :style="{ color: $themeColor }">{{record.avg  }}</div>
                </a-table>
              </a-col>
            </a-row>
          </a-col>
        </a-row>
        <template slot="footer">
          <a-button @click="handleCancel">{{ $t('modal_close') }}</a-button>
        </template>
      </a-modal>
    </div>
  </page-layout>

</template>

<script>
import PageLayout from "@/layouts/PageLayout";
import DetailList from "@/components/tool/DetailList";
const DetailListItem = DetailList.Item;
import { hostDetail, winMonList, netInterfaceData } from "@/services/admin";
import { parseTimeFun } from "@/utils/formatter";
import moment from "moment";
import echarts from 'echarts';
require('echarts-liquidfill');
import FileSaver from "file-saver";
import XLSX from "xlsx";
import themeMixin from '@/mixins/themeMixin';

export default {
  i18n: require('./i18n'),
  name: "WinDetail",
  mixins: [themeMixin],
  components: { PageLayout, DetailListItem, DetailList, },
  data() {
    return {
      moment,
      id: "",
      zid: "",
      detail: "",
      cpuList: [],
      memoryList: [],
      dates: "",
      dater: "",
      historyType: "",
      cpu: "",
      memory: "",
      loading1: false,
      loading2: false,
      loading3: false,
      mode1: "date",
      mode2: "date",
      disabledTime: { h: 0, m: 0, s: 0 },
      tpercent: 0,
      liquidNode: null,
      FileSystemList: [],
      Interfacelist: [],
      columns: [],
      columns2: [],
      visible: false,
      list: [],
      trafficeColumns: [],
      discardedColumns: [],
      timeValue: "",
      name: "",
      bits_received_itemid: "",
      bits_received_value_type: "",
      bits_sent_itemid: "",
      bits_sent_value_type: "",
      in_discarded_itemid: "",
      in_discarded_value_type: "",
      in_errors_itemid: "",
      in_errors_value_type: "",
      operational_status_itemid: "",
      operational_status_value_type: "",
      out_discarded_itemid: "",
      out_discarded_value_type: "",
      out_errors_itemid: "",
      out_errors_value_type: "",
      beginTime: "",
      endTime: "",
      //sync
      firstChart: null,
      secondChart: null,
      thirdChart: null,
      fourthChart: null,
      //line
      lineData: [],
      currentName: "",
      trafficeSeries: {
        xAxis: "",
        yAxis: "",
        legend: "",
        title: "",
        list: [],
      },
      diescardedSeries: {
        xAxis: "",
        yAxis: "",
        legend: "",
        title: "",
        list: [],
      },
      errorsSeries: {
        xAxis: "",
        yAxis: "",
        legend: "",
        title: "",
        list: [],
      },
      operationalSeries: {
        xAxis: "",
        yAxis: "",
        legend: "",
        title: "",
        list: [],
      },
      loading1: false,
      loading2: false,
      loading3: false,
      cpuChart: null,
      memChart: null,
      pingLossChart: null,
    };
  },
  watch: {
    themeColor() {
      // 当主题颜色变化时，重新渲染图表
      this.$nextTick(() => {
        if (this.detail && this.detail.cpu_utilization) {
          this.initBaseChart()
        }
      })
    }
  },
  created() {
    this.dates = new Date().getTime();
    let ntime = new Date(),
      qtime = new Date(new Date().getTime() - 2 * 60 * 60 * 1000);
    this.beginTime = parseTimeFun(qtime);
    this.endTime = parseTimeFun(ntime);
    this.timeValue = [
      moment(qtime, "YYYY-MM-DD HH:mm:ss"),
      moment(ntime, "YYYY-MM-DD HH:mm:ss"),
    ];
    this.dater = parseTimeFun(this.dates);
    this.id = this.$route.query.id || "";
    this.zid = this.$route.query.zid || "";
    this.initColumns();
    this.init();
  },
  filters: {
    SpeedToSize(bytes) {
      var sizes = ['B', 'K', 'M', 'G', 'T'];
      if (bytes == 0) return '';
      var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1000)));
      return Math.round(bytes / Math.pow(1000, i), 2) + '' + sizes[i];
    },
    formatBytes(bytes, decimals = 3) {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const dm = decimals < 0 ? 0 : decimals;
      const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    },
    dataFormat(val) {
      if (val === null || val === undefined || val === '') {
        return '--';
      } else {
        return val.replace(/\s/g, '');
      }
    },
    TrafficBytes(bytes, speed) {
      if (bytes === 0) return '0/(0.0%)';
      let by = bytes / 1000
      var per
      if (speed == 0) {
        per = by + "(0%)";
      } else {
        let pert = bytes / speed * 100
        per = by + "(" + pert.toFixed(2) + "%)";
      }
      return per
    },
    TrafficTBytes(bytes, decimals = 2) {
      if (bytes === "0.00") return '0 Bytes';
      const k = 1000;
      const dm = decimals < 0 ? 0 : decimals;
      const sizes = ['Bytes', 'KBps', 'MBps', 'GBps', 'TBps', 'PBps', 'EBps', 'ZBps', 'YBps'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + sizes[i];
    },
    dateFormat(val) {
      if (val) { //判断是否存在
        var date = new Date(val * 1000);
        var year = date.getFullYear();
        var month = date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1;
        var day = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
        var hours = date.getHours() < 10 ? "0" + date.getHours() : date.getHours();
        var minutes = date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
        var seconds = date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds();
        return year + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds;
      } else {
        return "--"
      }
    },
  },
  methods: {
    // 转换后端返回的中文字段名为 i18n
    translateChartData(data) {
      const nameMap = {
        '接收流量': this.$t('chart_data_receive_traffic'),
        '发送流量': this.$t('chart_data_send_traffic'),
        '接收丢弃包': this.$t('chart_data_receive_discard'),
        '发送丢弃包': this.$t('chart_data_send_discard'),
        '接收错包': this.$t('chart_data_receive_error'),
        '发送错包': this.$t('chart_data_send_error'),
        '端口状态': this.$t('chart_data_port_status')
      }
      
      if (data.yAxis && Array.isArray(data.yAxis)) {
        data.yAxis.forEach(item => {
          if (item.name && nameMap[item.name]) {
            item.name = nameMap[item.name]
          }
        })
      }
      
      if (data.legend && data.legend.data && Array.isArray(data.legend.data)) {
        data.legend.data = data.legend.data.map(name => nameMap[name] || name)
      }
      
      if (data.table && Array.isArray(data.table)) {
        data.table.forEach(item => {
          if (item.name && nameMap[item.name]) {
            item.name = nameMap[item.name]
          }
        })
      }
      
      return data
    },
    initColumns() {
      this.columns = [
        { title: this.$t('win_col_disk'), key: 'name', align: 'left', scopedSlots: { customRender: 'name' } },
        { title: this.$t('win_col_total_space'), key: 'total_space', align: 'left', scopedSlots: { customRender: 'total_space' } },
        { title: this.$t('win_col_used_space'), key: 'used_space', align: 'left', scopedSlots: { customRender: 'used_space' } },
        { title: this.$t('win_col_usage_rate'), key: 'space_utilization', align: 'left', scopedSlots: { customRender: 'space_utilization' } },
        { title: this.$t('win_col_collection_time'), key: 'lastclock', align: 'left', scopedSlots: { customRender: 'lastclock' } }
      ]
      
      this.columns2 = [
        { title: this.$t('col_status'), key: 'operational_status', align: 'left', scopedSlots: { customRender: 'operational_status' }, sorter: (a, b) => a.operational_status.localeCompare(b.operational_status) },
        { title: this.$t('col_interface_name'), key: 'name', align: 'left', scopedSlots: { customRender: 'name' } },
        { title: this.$t('col_received_traffic'), key: 'bits_received', align: 'left', scopedSlots: { customRender: 'bits_received' }, sorter: (a, b) => b.bits_received - a.bits_received },
        { title: this.$t('col_sent_traffic'), key: 'bits_sent', align: 'left', scopedSlots: { customRender: 'bits_sent' }, sorter: (a, b) => b.bits_sent - a.bits_sent },
        { title: this.$t('col_in_discarded_errors'), key: 'instatus', align: 'left', scopedSlots: { customRender: 'instatus' }, sorter: (a, b) => b.instatus - a.instatus },
        { title: this.$t('col_out_discarded_errors'), key: 'outstatus', align: 'left', scopedSlots: { customRender: 'outstatus' }, sorter: (a, b) => b.outstatus - a.outstatus },
        { title: this.$t('col_port_speed'), key: 'speed', align: 'left', scopedSlots: { customRender: 'speed' }, sorter: (a, b) => b.speed - a.speed },
        { title: this.$t('win_col_collection_time'), key: 'lastclock', align: 'left', scopedSlots: { customRender: 'lastclock' } },
        { title: this.$t('interface_operation'), key: 'operation', align: 'left', scopedSlots: { customRender: 'operation' } }
      ]
      
      this.trafficeColumns = [
        { title: this.$t('table_type'), key: 'name', align: 'left', scopedSlots: { customRender: 'name' } },
        { title: this.$t('table_min'), key: 'min', align: 'left', scopedSlots: { customRender: 'min' } },
        { title: this.$t('table_max'), key: 'max', align: 'left', scopedSlots: { customRender: 'max' } },
        { title: this.$t('table_avg'), key: 'avg', align: 'left', scopedSlots: { customRender: 'avg' } },
        { title: this.$t('table_95th_perc_avg'), key: 'th_perc_avg', align: 'left', scopedSlots: { customRender: 'th_perc_avg' } },
      ]
      
      this.discardedColumns = [
        { title: this.$t('table_type'), key: 'name', align: 'left', scopedSlots: { customRender: 'name' } },
        { title: this.$t('table_min'), key: 'min', align: 'left', scopedSlots: { customRender: 'min' } },
        { title: this.$t('table_max'), key: 'max', align: 'left', scopedSlots: { customRender: 'max' } },
        { title: this.$t('table_avg'), key: 'avg', align: 'left', scopedSlots: { customRender: 'avg' } },
      ]
    },
    init() {
      hostDetail(this.id, this.zid).then((resp) => {
        let res = resp.data.data;
        this.detail = res;
      }).finally(() => {
        this.initBaseChart();
        this.loading1 = false;
      });
      this.loading2 = true
      winMonList(this.id, this.zid).then((resp) => {
        let res = resp.data
        if (res.code == 200) {
          this.FileSystemList = res.data.items.filesystem || []
          this.Interfacelist = res.data.items.interfaces || []
        }
      }).finally(() => { this.loading2 = false })
    },
    //重置开始时间和结束时间
    restDate() {
      let ntime = new Date(),
        qtime = new Date(new Date().getTime() - 2 * 60 * 60 * 1000);
      this.beginTime = parseTimeFun(qtime);
      this.endTime = parseTimeFun(ntime);
      this.timeValue = [
        moment(qtime, "YYYY-MM-DD HH:mm:ss"),
        moment(ntime, "YYYY-MM-DD HH:mm:ss"),
      ];
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
    handleCancel() {
      this.visible = false
    },
    initBaseChart() {
      // 检查 detail 数据是否已加载
      if (!this.detail || !this.detail.cpu_utilization || !this.detail.memory_utilization) {
        console.warn('Detail data not loaded yet, skipping chart initialization')
        return
      }
      
      // 将主题色转换为 RGB 值用于渐变
      const themeColor = this.themeColor || '#1890ff'
      const hexToRgb = (hex) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
        } : { r: 24, g: 144, b: 255 };
      }
      const rgb = hexToRgb(themeColor)
      
      //cpu
      const cpuValue = parseFloat(this.detail.cpu_utilization.split(" ")[0]) || 0
      if (this.cpuChart) {
        this.cpuChart.dispose()
      }
      this.cpuChart = echarts.init(document.getElementById('liquidCPU'));
      this.cpuChart.setOption(
        {
          series: [
            {
              type: 'liquidFill',
              radius: '85%',
              center: ['50%', '50%'],
              data: [cpuValue / 100],
              color: [themeColor],
              backgroundStyle: {
                color: {
                  type: 'linear',
                  x: 1,
                  y: 0,
                  x2: 0.5,
                  y2: 1,
                  colorStops: [
                    {
                      offset: 1,
                      color: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`
                    },
                    {
                      offset: 0.5,
                      color: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.15)`
                    },
                    {
                      offset: 0,
                      color: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)`
                    }
                  ],
                  globalCoord: false
                }
              },
              outline: {
                borderDistance: 0,
                itemStyle: {
                  borderWidth: 5,
                  borderColor: {
                    type: 'linear',
                    x: 0,
                    y: 0,
                    x2: 0,
                    y2: 1,
                    colorStops: [
                      {
                        offset: 0,
                        color: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)`
                      },
                      {
                        offset: 0.5,
                        color: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.45)`
                      },
                      {
                        offset: 1,
                        color: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.6)`
                      }
                    ],
                    globalCoord: false
                  },
                  shadowColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.55)`,
                  shadowBlur: 10
                }
              },
              label: {
                normal: {
                  formatter: cpuValue + "%",
                  textStyle: {
                    fontSize: 35,
                    color: themeColor
                  }
                }
              }
            }
          ]
        },
        true
      );
      //memory
      const memValue = parseFloat(this.detail.memory_utilization.split(" ")[0]) || 0
      if (this.memChart) {
        this.memChart.dispose()
      }
      this.memChart = echarts.init(document.getElementById('liquidMem'));
      this.memChart.setOption(
        {
          series: [
            {
              type: 'liquidFill',
              radius: '85%',
              center: ['50%', '50%'],
              data: [memValue / 100],
              color: [themeColor],
              backgroundStyle: {
                color: {
                  type: 'linear',
                  x: 1,
                  y: 0,
                  x2: 0.5,
                  y2: 1,
                  colorStops: [
                    {
                      offset: 1,
                      color: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`
                    },
                    {
                      offset: 0.5,
                      color: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.15)`
                    },
                    {
                      offset: 0,
                      color: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)`
                    }
                  ],
                  globalCoord: false
                }
              },
              outline: {
                borderDistance: 0,
                itemStyle: {
                  borderWidth: 5,
                  borderColor: {
                    type: 'linear',
                    x: 0,
                    y: 0,
                    x2: 0,
                    y2: 1,
                    colorStops: [
                      {
                        offset: 0,
                        color: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)`
                      },
                      {
                        offset: 0.5,
                        color: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.45)`
                      },
                      {
                        offset: 1,
                        color: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.6)`
                      }
                    ],
                    globalCoord: false
                  },
                  shadowColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.55)`,
                  shadowBlur: 10
                }
              },
              label: {
                normal: {
                  formatter: memValue + "%",
                  textStyle: {
                    fontSize: 35,
                    color: themeColor
                  }
                }
              }
            }
          ]
        },
        true
      )
      //pingloss
      const pingLossValue = this.detail.ping_loss ? parseFloat(this.detail.ping_loss.split(" ")[0]) || 0 : 0
      if (this.pingLossChart) {
        this.pingLossChart.dispose()
      }
      this.pingLossChart = echarts.init(document.getElementById('liquidPingloss'));
      this.pingLossChart.setOption(
        {
          series: [
            {
              type: 'gauge',
              radius: '85%',
              center: ['50%', '50%'],
              data: [pingLossValue],
              axisLine: {
                lineStyle: {
                  width: 20,
                  color: [
                    [0.3, '#67e0e3'],
                    [0.7, themeColor],
                    [1, '#fd666d']
                  ]
                }
              },
              pointer: {
                itemStyle: {
                  color: themeColor
                }
              },
              axisTick: {
                distance: -20,
                length: 5,
                lineStyle: {
                  color: '#fff',
                  width: 1
                }
              },
              splitLine: {
                distance: -20,
                length: 20,
                lineStyle: {
                  color: '#fff',
                  width: 2
                }
              },
              axisLabel: {
                color: themeColor,
                distance: 15,
                fontSize: 12
              },
              detail: {
                valueAnimation: true,
                formatter: '{value}%',
                color: themeColor,
                fontSize: 20,
                offsetCenter: [0, '70%']
              },
            }
          ]
        },
        true
      );
    },
    initTrafficChart() {
      const chart = echarts.init(document.getElementById('trafficChat'))
      const option = {
        title: {
          text: this.trafficeSeries.title,
          left: 'center',
          textStyle: {
            color: this.$themeColor
          }
        },
        toolbox: {
          feature: {
            saveAsImage: {},
            dataZoom: {
              show: true,
              // iconStyle:{ //不需要图标可以设置隐藏按钮
              //   opacity:0
              // },
              yAxisIndex: 'none'
            },
            dataView: {
              show: true,
              lang: ['数据视图', '关闭', '导出Excel'],
              //optionToContent为重画表格的函数
              optionToContent: function (opt) {
                //axisData是你想定义的表格第一列的数据，我这里设置为柱形图的x轴数据
                var axisData = opt.xAxis[0].data;
                //tAxis[0]为你想定义的表格第一行的数据
                var txisData = opt.series;
                var series = opt.series;
                //表头
                var tdHeads = '<td  style="padding: 0 10px"></td>';
                var tdBodys = '';
                var nameData = txisData;
                for (var i = 0; i < nameData.length; i++) {
                  tdHeads += '<td style="padding: 0 10px">' + nameData[i].name + '</ td >';
                }
                var table = '<table id="Mytable" border="1" class="table table-bordered table-striped table-hover" style="width:100%;text-align:center" ><tbody><tr>' + tdHeads + ' </tr>';
                for (var i = 0, l = axisData.length; i < l; i++) {
                  for (var j = 0; j < series.length; j++) {
                    var temp = series[j].data[i];
                    if (temp != null && temp != undefined) {
                      tdBodys += '<td>' + temp + '</td>';
                    } else {
                      tdBodys += '<td></td>';
                    }
                  }
                  table += '<tr><td style="padding: 0 10px">' + axisData[i] + '</td>' + tdBodys + '</tr>';
                  tdBodys = '';
                }
                table += '</tbody></table>';
                return table;
              },
              //contentToOption为重写“刷新”按钮的语句
              contentToOption: function (HTMLDomElement, opt) {
                let et = XLSX.utils.table_to_book(
                  document.getElementById("Mytable")
                );
                let etout = XLSX.write(et, {
                  bookType: "xlsx",
                  bookSST: true,
                  type: "array",
                });
                try {
                  FileSaver.saveAs(
                    new Blob([etout], {
                      type: "application/octet-stream",
                    }),
                    opt.title[0].text + "-" + new Date().toLocaleString() + ".xlsx"
                  );
                } catch (e) {
                }
                return etout;
              },
            },
          },
          left: "5%",
        },
        tooltip: {
          trigger: 'axis',
          formatter: function (value) {
            //这里的value[0].value就是我需要每次显示在图上的数据
            if (value[0].value <= 0) {
              value[0].value = '0B';
            } else {
              var k = 1000;
              var sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
              var v1 = Math.floor(Math.log(value[0].value) / Math.log(k));
              var v2 = Math.floor(Math.log(value[1].value) / Math.log(k));
              value[0].value = (value[0].value / Math.pow(k, v1)).toPrecision(3) + ' ' + sizes[v1];
              value[1].value = (value[1].value / Math.pow(k, v2)).toPrecision(3) + ' ' + sizes[v2];
            }
            return value[0].axisValue + "<br/>" +
              value[0].seriesName + " :" + value[0].value + "<br/>" +
              value[1].seriesName + " :" + value[1].value;
          }
        },
        legend: {
          data: this.trafficeSeries.legend,
          icon: 'rect',
          right: '4%',
          orient: 'vertical',
          textStyle: {
            color: this.$themeColor
          }
        },
        xAxis: {
          ...this.trafficeSeries.xAxis,
          axisLabel: {
            color: this.$themeColor
          },
          axisLine: {
            lineStyle: {
              color: this.$themeColor
            }
          }
        },
        yAxis: {
          type: 'value',
          scale: true,
          axisLabel: {
            color: this.$themeColor,
            formatter: function (value) {
              if ((value / (1024 * 1024 * 1024)) > 1) {
                return (value / (1024 * 1024 * 1024)).toFixed(2) + " GB";
              } else if ((value / (1024 * 1024)) > 1) {
                return (value / (1024 * 1024)).toFixed(2) + " MB";
              } else if ((value / 1024) > 1) {
                return (value / 1024).toFixed(2) + " KB";
              } else {
                return value + " B";
              }
            }
          },
          axisLine: {
            lineStyle: {
              color: this.$themeColor
            }
          }
        },
        series: this.trafficeSeries.yAxis,
      }
      chart.setOption(option)
      chart.dispatchAction({
        type: 'takeGlobalCursor',
        key: 'dataZoomSelect',
        dataZoomSelectActive: true
      })
      chart.group = 'group1';
      this.firstChart = chart;
    },
    initDiscardedChart() {
      const chart = echarts.init(document.getElementById('discardedChart'))
      const option = {
        title: {
          text: this.diescardedSeries.title,
          left: 'center',
          textStyle: {
            color: this.$themeColor
          }
        },
        toolbox: {
          feature: {
            saveAsImage: {},
            dataZoom: {
              show: true,
              // iconStyle:{ //不需要图标可以设置隐藏按钮
              //   opacity:0
              // },
              yAxisIndex: 'none'
            },
            dataView: {
              show: true,
              lang: ['数据视图', '关闭', '导出Excel'],
              //optionToContent为重画表格的函数
              optionToContent: function (opt) {
                //axisData是你想定义的表格第一列的数据，我这里设置为柱形图的x轴数据
                var axisData = opt.xAxis[0].data;
                //tAxis[0]为你想定义的表格第一行的数据
                var txisData = opt.series;
                var series = opt.series;
                //表头
                var tdHeads = '<td  style="padding: 0 10px"></td>';
                var tdBodys = '';
                var nameData = txisData;
                for (var i = 0; i < nameData.length; i++) {
                  tdHeads += '<td style="padding: 0 10px">' + nameData[i].name + '</ td >';
                }
                var table = '<table id="Mytable" border="1" class="table table-bordered table-striped table-hover" style="width:100%;text-align:center" ><tbody><tr>' + tdHeads + ' </tr>';
                for (var i = 0, l = axisData.length; i < l; i++) {
                  for (var j = 0; j < series.length; j++) {
                    var temp = series[j].data[i];
                    if (temp != null && temp != undefined) {
                      tdBodys += '<td>' + temp + '</td>';
                    } else {
                      tdBodys += '<td></td>';
                    }
                  }
                  table += '<tr><td style="padding: 0 10px">' + axisData[i] + '</td>' + tdBodys + '</tr>';
                  tdBodys = '';
                }
                table += '</tbody></table>';
                return table;
              },
              //contentToOption为重写“刷新”按钮的语句
              contentToOption: function (HTMLDomElement, opt) {
                let et = XLSX.utils.table_to_book(
                  document.getElementById("Mytable")
                );
                let etout = XLSX.write(et, {
                  bookType: "xlsx",
                  bookSST: true,
                  type: "array",
                });
                try {
                  FileSaver.saveAs(
                    new Blob([etout], {
                      type: "application/octet-stream",
                    }),
                    opt.title[0].text + "-" + new Date().toLocaleString() + ".xlsx"
                  );
                } catch (e) {
                }
                return etout;
              },
            },
          },
          left: "5%",
        },
        tooltip: {
          trigger: 'axis',
          formatter: function (value) {
            //这里的value[0].value就是我需要每次显示在图上的数据
            return value[0].axisValue + "<br/>" +
              value[0].seriesName + " :" + value[0].value + "<br/>" +
              value[1].seriesName + " :" + value[1].value;
          }
        },
        legend: {
          data: this.diescardedSeries.legend,
          icon: 'rect',
          right: '4%',
          orient: 'vertical',
          textStyle: {
            color: this.$themeColor
          }
        },
        xAxis: {
          ...this.diescardedSeries.xAxis,
          axisLabel: {
            color: this.$themeColor
          },
          axisLine: {
            lineStyle: {
              color: this.$themeColor
            }
          }
        },
        yAxis: {
          // name: 'bits per second(kb/s)',
          nameLocation: 'center',
          nameGap: 30,
          type: 'value',
          min: 0,
          // boundaryGap: [0, '30%'],//坐标轴两边留白策略
          splitLine: {
            show: true
          },
          axisLabel: {
            color: this.$themeColor
          },
          axisLine: {
            lineStyle: {
              color: this.$themeColor
            }
          }
        },
        series: this.diescardedSeries.yAxis,
      }
      chart.setOption(option)
      chart.dispatchAction({
        type: 'takeGlobalCursor',
        key: 'dataZoomSelect',
        dataZoomSelectActive: true
      })
      chart.group = 'group1';
      this.secondChart = chart;
    },
    initErrorsChart() {
      const chart = echarts.init(document.getElementById('errorsChart'))
      const option = {
        title: {
          text: this.errorsSeries.title,
          left: 'center',
          textStyle: {
            color: this.$themeColor
          }
        },
        toolbox: {
          feature: {
            saveAsImage: {},
            dataZoom: {
              show: true,
              // iconStyle:{ //不需要图标可以设置隐藏按钮
              //   opacity:0
              // },
              yAxisIndex: 'none'
            },
            dataView: {
              show: true,
              lang: ['数据视图', '关闭', '导出Excel'],
              //optionToContent为重画表格的函数
              optionToContent: function (opt) {
                //axisData是你想定义的表格第一列的数据，我这里设置为柱形图的x轴数据
                var axisData = opt.xAxis[0].data;
                //tAxis[0]为你想定义的表格第一行的数据
                var txisData = opt.series;
                var series = opt.series;
                //表头
                var tdHeads = '<td  style="padding: 0 10px"></td>';
                var tdBodys = '';
                var nameData = txisData;
                for (var i = 0; i < nameData.length; i++) {
                  tdHeads += '<td style="padding: 0 10px">' + nameData[i].name + '</ td >';
                }
                var table = '<table id="Mytable" border="1" class="table table-bordered table-striped table-hover" style="width:100%;text-align:center" ><tbody><tr>' + tdHeads + ' </tr>';
                for (var i = 0, l = axisData.length; i < l; i++) {
                  for (var j = 0; j < series.length; j++) {
                    var temp = series[j].data[i];
                    if (temp != null && temp != undefined) {
                      tdBodys += '<td>' + temp + '</td>';
                    } else {
                      tdBodys += '<td></td>';
                    }
                  }
                  table += '<tr><td style="padding: 0 10px">' + axisData[i] + '</td>' + tdBodys + '</tr>';
                  tdBodys = '';
                }
                table += '</tbody></table>';
                return table;
              },
              //contentToOption为重写“刷新”按钮的语句
              contentToOption: function (HTMLDomElement, opt) {
                let et = XLSX.utils.table_to_book(
                  document.getElementById("Mytable")
                );
                let etout = XLSX.write(et, {
                  bookType: "xlsx",
                  bookSST: true,
                  type: "array",
                });
                try {
                  FileSaver.saveAs(
                    new Blob([etout], {
                      type: "application/octet-stream",
                    }),
                    opt.title[0].text + "-" + new Date().toLocaleString() + ".xlsx"
                  );
                } catch (e) {
                }
                return etout;
              },
            },
          },
          left: "5%",
        },
        tooltip: {
          trigger: 'axis',
          formatter: function (value) {
            //这里的value[0].value就是我需要每次显示在图上的数据
            return value[0].axisValue + "<br/>" +
              value[0].seriesName + " :" + value[0].value + "<br/>" +
              value[1].seriesName + " :" + value[1].value;
          }
        },
        legend: {
          data: this.errorsSeries.legend,
          icon: 'rect',
          right: '4%',
          orient: 'vertical',
          textStyle: {
            color: this.$themeColor
          }
        },
        xAxis: {
          ...this.errorsSeries.xAxis,
          axisLabel: {
            color: this.$themeColor
          },
          axisLine: {
            lineStyle: {
              color: this.$themeColor
            }
          }
        },
        yAxis: {
          // name: 'bits per second(kb/s)',
          nameLocation: 'center',
          nameGap: 30,
          type: 'value',
          min: 0,
          // boundaryGap: [0, '30%'],//坐标轴两边留白策略
          splitLine: {
            show: true
          },
          axisLabel: {
            color: this.$themeColor
          },
          axisLine: {
            lineStyle: {
              color: this.$themeColor
            }
          }
        },
        series: this.errorsSeries.yAxis,
      }
      chart.setOption(option)
      chart.dispatchAction({
        type: 'takeGlobalCursor',
        key: 'dataZoomSelect',
        dataZoomSelectActive: true
      })
      chart.group = 'group1';
      this.thirdChart = chart;
    },
    //端口状态
    initOperationalChart() {
      const chart = echarts.init(document.getElementById('operationalChart'))
      const option = {
        title: {
          text: this.operationalSeries.title,
          left: 'center',
          textStyle: {
            color: this.$themeColor
          }
        },
        toolbox: {
          feature: {
            saveAsImage: {},
            dataZoom: {
              show: true,
              // iconStyle:{ //不需要图标可以设置隐藏按钮
              //   opacity:0
              // },
              yAxisIndex: 'none'
            },
            dataView: {
              show: true,
              lang: ['数据视图', '关闭', '导出Excel'],
              //optionToContent为重画表格的函数
              optionToContent: function (opt) {
                //axisData是你想定义的表格第一列的数据，我这里设置为柱形图的x轴数据
                var axisData = opt.xAxis[0].data;
                //tAxis[0]为你想定义的表格第一行的数据
                var txisData = opt.series;
                var series = opt.series;
                //表头
                var tdHeads = '<td  style="padding: 0 10px"></td>';
                var tdBodys = '';
                var nameData = txisData;
                for (var i = 0; i < nameData.length; i++) {
                  tdHeads += '<td style="padding: 0 10px">' + nameData[i].name + '</ td >';
                }
                var table = '<table id="Mytable" border="1" class="table table-bordered table-striped table-hover" style="width:100%;text-align:center" ><tbody><tr>' + tdHeads + ' </tr>';
                for (var i = 0, l = axisData.length; i < l; i++) {
                  for (var j = 0; j < series.length; j++) {
                    var temp = series[j].data[i];
                    if (temp != null && temp != undefined) {
                      tdBodys += '<td>' + temp + '</td>';
                    } else {
                      tdBodys += '<td></td>';
                    }
                  }
                  table += '<tr><td style="padding: 0 10px">' + axisData[i] + '</td>' + tdBodys + '</tr>';
                  tdBodys = '';
                }
                table += '</tbody></table>';
                return table;
              },
              //contentToOption为重写“刷新”按钮的语句
              contentToOption: function (HTMLDomElement, opt) {
                let et = XLSX.utils.table_to_book(
                  document.getElementById("Mytable")
                );
                let etout = XLSX.write(et, {
                  bookType: "xlsx",
                  bookSST: true,
                  type: "array",
                });
                try {
                  FileSaver.saveAs(
                    new Blob([etout], {
                      type: "application/octet-stream",
                    }),
                    opt.title[0].text + "-" + new Date().toLocaleString() + ".xlsx"
                  );
                } catch (e) {
                }
                return etout;
              },
            },
          },
          left: "5%",
        },
        tooltip: {
          trigger: 'axis',
          formatter: function (value) {
            //这里的value[0].value就是我需要每次显示在图上的数据
            return value[0].axisValue + "<br/>" +
              value[0].seriesName + " :" + value[0].value
          }
        },
        legend: {
          data: this.operationalSeries.legend,
          icon: 'rect',
          right: '4%',
          orient: 'vertical',
          textStyle: {
            color: this.$themeColor
          }
        },
        xAxis: {
          ...this.operationalSeries.xAxis,
          axisLabel: {
            color: this.$themeColor
          },
          axisLine: {
            lineStyle: {
              color: this.$themeColor
            }
          }
        },
        yAxis: {
          // name: 'bits per second(kb/s)',
          nameLocation: 'center',
          nameGap: 30,
          type: 'value',
          min: 0,
          // boundaryGap: [0, '30%'],//坐标轴两边留白策略
          splitLine: {
            show: true
          },
          axisLabel: {
            color: this.$themeColor
          },
          axisLine: {
            lineStyle: {
              color: this.$themeColor
            }
          }
        },
        series: this.operationalSeries.yAxis,
      }
      chart.setOption(option)
      chart.dispatchAction({
        type: 'takeGlobalCursor',
        key: 'dataZoomSelect',
        dataZoomSelectActive: true
      })
      chart.group = 'group1';
      this.fourthChart = chart;
    },
    trafficeQuery() {
      netInterfaceData({
        name: this.record.name,
        bits_received_itemid: this.record.bits_received_itemid,
        bits_received_value_type: this.record.bits_received_value_type,
        bits_sent_itemid: this.record.bits_sent_itemid,
        bits_sent_value_type: this.record.bits_sent_value_type,
        in_discarded_itemid: this.record.in_discarded_itemid,
        in_discarded_value_type: this.record.in_discarded_value_type,
        in_errors_itemid: this.record.in_errors_itemid,
        in_errors_value_type: this.record.in_errors_value_type,
        operational_status_itemid: this.record.operational_status_itemid,
        operational_status_value_type: this.record.operational_status_value_type,
        out_discarded_itemid: this.record.out_discarded_itemid,
        out_discarded_value_type: this.record.out_discarded_value_type,
        out_errors_itemid: this.record.out_errors_itemid,
        out_errors_value_type: this.record.out_errors_itemid,
        begin: this.beginTime,
        end: this.endTime,
        zid: this.zid,
      }).then((resp) => {
        let res = resp.data.data;
        this.loading3 = false
        //流量 - 转换中文字段名
        this.trafficeSeries.xAxis = res.traffic_series.xAxis
        this.trafficeSeries.yAxis = this.translateChartData(res.traffic_series).yAxis
        this.trafficeSeries.legend = this.translateChartData(res.traffic_series).legend.data
        this.trafficeSeries.list = (res.traffic_series.table || []).map(item => ({
          ...item,
          name: this.$t('chart_data_' + (item.name === '接收流量' ? 'receive_traffic' : 'send_traffic'))
        }))
        this.trafficeSeries.title = this.$t('chart_interface_traffic', { name: this.record.name })
        //丢包 - 转换中文字段名
        this.diescardedSeries.xAxis = res.discarded_series.xAxis
        this.diescardedSeries.yAxis = this.translateChartData(res.discarded_series).yAxis
        this.diescardedSeries.legend = this.translateChartData(res.discarded_series).legend.data
        this.diescardedSeries.list = (res.discarded_series.table || []).map(item => ({
          ...item,
          name: this.$t('chart_data_' + (item.name === '接收丢弃包' ? 'receive_discard' : 'send_discard'))
        }))
        this.diescardedSeries.title = this.$t('chart_interface_packet_loss', { name: this.record.name })
        //错包 - 转换中文字段名
        this.errorsSeries.xAxis = res.errors_series.xAxis
        this.errorsSeries.yAxis = this.translateChartData(res.errors_series).yAxis
        this.errorsSeries.legend = this.translateChartData(res.errors_series).legend.data
        this.errorsSeries.list = (res.errors_series.table || []).map(item => ({
          ...item,
          name: this.$t('chart_data_' + (item.name === '接收错包' ? 'receive_error' : 'send_error'))
        }))
        this.errorsSeries.title = this.$t('chart_interface_error_packets', { name: this.record.name })
        //端口状态 - 转换中文字段名
        this.operationalSeries.xAxis = res.operational_status_series.xAxis
        this.operationalSeries.yAxis = this.translateChartData(res.operational_status_series).yAxis
        this.operationalSeries.legend = this.translateChartData(res.operational_status_series).legend.data
        this.operationalSeries.list = (res.operational_status_series.table || []).map(item => ({
          ...item,
          name: this.$t('chart_data_port_status')
        }))
        this.operationalSeries.title = this.$t('chart_interface_port_status', { name: this.record.name })
        echarts.connect('group1');
        this.initTrafficChart()
        this.initDiscardedChart()
        this.initErrorsChart()
        this.initOperationalChart()

      })
    },
    seeDetail(record) {
      this.visible = true
      this.record = record
      netInterfaceData({
        name: record.name,
        bits_received_itemid: record.bits_received_itemid,
        bits_received_value_type: record.bits_received_value_type,
        bits_sent_itemid: record.bits_sent_itemid,
        bits_sent_value_type: record.bits_sent_value_type,
        in_discarded_itemid: record.in_discarded_itemid,
        in_discarded_value_type: record.in_discarded_value_type,
        in_errors_itemid: record.in_errors_itemid,
        in_errors_value_type: record.in_errors_value_type,
        operational_status_itemid: record.operational_status_itemid,
        operational_status_value_type: record.operational_status_value_type,
        out_discarded_itemid: record.out_discarded_itemid,
        out_discarded_value_type: record.out_discarded_value_type,
        out_errors_itemid: record.out_errors_itemid,
        out_errors_value_type: record.out_errors_itemid,
        begin: this.beginTime,
        end: this.endTime,
        zid: this.zid,
      }).then((resp) => {
        let res = resp.data.data;
        this.loading3 = false
        //流量 - 转换中文字段名
        this.trafficeSeries.xAxis = res.traffic_series.xAxis
        this.trafficeSeries.yAxis = this.translateChartData(res.traffic_series).yAxis
        this.trafficeSeries.legend = this.translateChartData(res.traffic_series).legend.data
        this.trafficeSeries.list = (res.traffic_series.table || []).map(item => ({
          ...item,
          name: this.$t('chart_data_' + (item.name === '接收流量' ? 'receive_traffic' : 'send_traffic'))
        }))
        this.trafficeSeries.title = this.$t('chart_interface_traffic', { name: record.name })
        //丢包 - 转换中文字段名
        this.diescardedSeries.xAxis = res.discarded_series.xAxis
        this.diescardedSeries.yAxis = this.translateChartData(res.discarded_series).yAxis
        this.diescardedSeries.legend = this.translateChartData(res.discarded_series).legend.data
        this.diescardedSeries.list = (res.discarded_series.table || []).map(item => ({
          ...item,
          name: this.$t('chart_data_' + (item.name === '接收丢弃包' ? 'receive_discard' : 'send_discard'))
        }))
        this.diescardedSeries.title = this.$t('chart_interface_packet_loss', { name: record.name })
        //错包 - 转换中文字段名
        this.errorsSeries.xAxis = res.errors_series.xAxis
        this.errorsSeries.yAxis = this.translateChartData(res.errors_series).yAxis
        this.errorsSeries.legend = this.translateChartData(res.errors_series).legend.data
        this.errorsSeries.list = (res.errors_series.table || []).map(item => ({
          ...item,
          name: this.$t('chart_data_' + (item.name === '接收错包' ? 'receive_error' : 'send_error'))
        }))
        this.errorsSeries.title = this.$t('chart_interface_error_packets', { name: record.name })
        //端口状态 - 转换中文字段名
        this.operationalSeries.xAxis = res.operational_status_series.xAxis
        this.operationalSeries.yAxis = this.translateChartData(res.operational_status_series).yAxis
        this.operationalSeries.legend = this.translateChartData(res.operational_status_series).legend.data
        this.operationalSeries.list = (res.operational_status_series.table || []).map(item => ({
          ...item,
          name: this.$t('chart_data_port_status')
        }))
        this.operationalSeries.title = this.$t('chart_interface_port_status', { name: record.name })
        echarts.connect('group1');
        this.initTrafficChart()
        this.initDiscardedChart()
        this.initErrorsChart()
        this.initOperationalChart()
      })
    },
  },
};
</script>

<style lang="less" scoped>
.info-item {
  display: flex;
  align-items: center;
  padding: 4px 0;
  
  .info-label {
    font-weight: 500;
    margin-right: 8px;
    white-space: nowrap;
  }
  
  .info-value {
    flex: 1;
    word-break: break-all;
  }
}

.linux-charts {
  display: flex;
  margin-top: 20px;
  flex-direction: column;
  position: relative;
  z-index: 9;
}

.text-pingsec {
  width: 300px;
  height: 300px;
  margin: 0 auto;
  font-size: 100px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}
</style>
