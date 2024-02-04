<template>
  <page-layout :title="detail.name">
    <div slot="headerContent" class="linux-detail">
      <detail-list size="small" :col="3">
        <detail-list-item term="主机ID">{{detail.hostid}}</detail-list-item>
        <detail-list-item term="CPU核心数">{{detail.number_of_cores}}</detail-list-item>
        <detail-list-item term="类型">{{detail.model || "--"}}</detail-list-item>
        <detail-list-item term="总内存">{{detail.memory_total || "--"}}</detail-list-item>
        <detail-list-item term="内核版本">{{detail.os || "--"}}</detail-list-item>
        <detail-list-item term="运行时长">{{detail.uptime || "--"}}</detail-list-item>
        <detail-list-item term="备注">{{detail.vendor || "--"}}</detail-list-item>
      </detail-list>
      <a-tabs :tabBarStyle="{textAlign: 'left', width: '100%'}" style="padding: 0px 2px;">
        <a-tab-pane tab="运行信息" key="1">
          <a-card :bodyStyle="{boxShadow: '0 1px 8px 0 #ddd'}" :loading="!detail">
            <a-row :gutter="16">
              <a-col :xl="{ span: 5 }" :lg="{ span: 12 }">
                <a-card hoverable :headStyle="{textAlign: 'left', width: '100%', background: '#FAFBFC'}" :bodyStyle="{padding: '0'}" title="CPU使用率">
                  <div id="liquidCPU" style="width: 300px; height: 300px;margin:0 auto;"></div>
                </a-card>
              </a-col>
              <a-col :xl="{ span: 5 }" :lg="{ span: 12 }">
                <a-card hoverable :headStyle="{textAlign: 'left', width: '100%', background: '#FAFBFC'}" :bodyStyle="{padding: '0'}" title="内存使用率">
                  <div id="liquidMem" style="width: 300px; height: 300px;margin:0 auto;"></div>
                </a-card>
              </a-col>
              <a-col :xl="{ span: 14 }" :lg="{ span: 12 }">
                <a-col :xl="{ span: 24 }" :lg="{ span: 12 }">
                  <!-- <a-card hoverable :headStyle="{textAlign: 'center', width: '100%', background: '#FAFBFC'}" :bodyStyle="{padding: '0'}" title="磁盘使用率"> -->
                  <a-table :loading="loading2" :columns="columns" :data-source="FileSystemlist" :pagination=false :scroll="{ y: 600, }" :rowKey="(record) => { return record.id;}">
                    <div slot="name" slot-scope="record">{{record.name}}</div>
                    <div slot="total_space" slot-scope="record">{{record.total_space | formatBytes}}</div>
                    <div slot="used_space" slot-scope="record">{{record.used_space | formatBytes}}</div>
                    <div slot="space_utilization" slot-scope="record">
                      <a-progress :percent=record.space_utilization status="active" />
                    </div>
                    <div slot="inodes_pused" slot-scope="record">
                      <a-progress :percent=record.inodes_pused status="active" />
                    </div>
                    <span slot="lastclock" slot-scope="record">{{record.lastclock| dateFormat }}</span>
                  </a-table>
                </a-col>
              </a-col>
            </a-row>
            <a-row :gutter="16">
              <!--pingloss-->
              <a-col :xl="{ span: 5 }" :lg="{ span: 12 }" class="pingloss">
                <a-card hoverable :headStyle="{textAlign: 'center', width: '100%', background: '#FAFBFC'}" :bodyStyle="{padding: '0'}" title="网络丢包">
                  <div id="liquidPingloss" style="width: 300px; height: 300px;margin:0 auto;"></div>
                </a-card>
              </a-col>
              <!--pingsec-->
              <a-col :xl="{ span: 5 }" :lg="{ span: 12 }" class="pingsec">
                <a-card hoverable :headStyle="{textAlign: 'center', width: '100%', background: '#FAFBFC'}" :bodyStyle="{padding: '0'}" title="网络延时">
                  <div id="liquidPingsec" class="text-pingsec">{{detail.ping_sec.replace(/\s/g, '') || "--"}}</div>
                </a-card>
              </a-col>
            </a-row>
          </a-card>
          <a-card :bodyStyle="{boxShadow: '0 1px 8px 0 #ddd'}" :loading="!detail">
            <a-row :gutter="16">
              <a-col :xl="{ span: 24 }" :lg="{ span: 24 }">
                <a-col :xl="{ span: 24 }" :lg="{ span: 24 }">
                  <!-- <a-card hoverable :headStyle="{textAlign: 'center', width: '100%', background: '#FAFBFC'}" :bodyStyle="{padding: '0'}" title="磁盘使用率"> -->
                  <a-table :loading="loading2" :columns="columns2" :data-source="Interfacelist" :pagination=false :scroll="{ y: 300, }" :rowKey="(record) => { return record.id;}">
                    <span slot="operational_status" slot-scope="record">
                      <template slot="title">
                        {{record.operational_status||'--'}}
                      </template>
                      <a-badge v-if="record.operational_status.indexOf('up')!=-1" status="success" :text=record.operational_status />
                      <a-badge v-else-if="record.operational_status.indexOf('down')!=-1" status="error" :text=record.operational_status />
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
                      <a-button type="primary" @click="seeDetail(record)">详情</a-button>
                    </div>
                    <span slot="lastclock" slot-scope="record">{{record.lastclock | dateFormat }}</span>
                  </a-table>
                </a-col>
              </a-col>
            </a-row>
          </a-card>
        </a-tab-pane>
      </a-tabs>
      <a-modal v-model="visible" width="1400px" title="接口详情">
        <a-row>
          <a-col>
            <a-form-model class="home-search" layout="inline" style="width: 80%; height: 10%;margin:0 auto;" :colon='false'>
              <a-form-model-item label="时间">
                <a-range-picker format="YYYY-MM-DD HH:mm:ss" :show-time="{ format: 'HH:mm', defaultValue:[moment('00:00:00', 'HH:mm:ss'),moment('23:59:59', 'HH:mm:ss')]}" v-model="timeValue" @change="changeCreationTime" :getCalendarContainer="triggerNode=>{return triggerNode.parentNode || document.body}" />
              </a-form-model-item>
              <a-form-model-item>
                <a-button :style="{ marginRight: '10px' }" type="primary" @click="trafficeQuery">查询</a-button>
                <a-button @click="restDate">重置</a-button>
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
                <a-table :loading="loading3" style="width: 90%;margin:0 auto;" :columns="trafficeColumns" :data-source="trafficeSeries.list" :pagination="false" :rowKey="(record) => { return record.name}">
                  <div slot="name" slot-scope="record">{{record.name }}</div>
                  <div slot="min" slot-scope="record">{{record.min | TrafficTBytes}}</div>
                  <div slot="max" slot-scope="record">{{record.max | TrafficTBytes}}</div>
                  <div slot="avg" slot-scope="record">{{record.avg | TrafficTBytes}}</div>
                  <div slot="th_perc_avg" slot-scope="record">{{record.th_perc_avg | TrafficTBytes}}</div>
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
                <a-table :loading="loading3" style="width: 90%; height: 10%;margin:0 auto;" :columns="discardedColumns" :data-source="diescardedSeries.list" :pagination="false" :rowKey="(record) => { return record.name}">
                  <div slot="name" slot-scope="record">{{record.name }}</div>
                  <div slot="min" slot-scope="record">{{record.min }}</div>
                  <div slot="max" slot-scope="record">{{record.max}}</div>
                  <div slot="avg" slot-scope="record">{{record.avg  }}</div>
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
                <a-table :loading="loading3" style="width: 90%;margin:0 auto;" :columns="discardedColumns" :data-source="errorsSeries.list" :pagination="false" :rowKey="(record) => { return record.name}">
                  <div slot="name" slot-scope="record">{{record.name }}</div>
                  <div slot="min" slot-scope="record">{{record.min }}</div>
                  <div slot="max" slot-scope="record">{{record.max}}</div>
                  <div slot="avg" slot-scope="record">{{record.avg  }}</div>
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
                <a-table :loading="loading3" style="width: 90%;margin:0 auto;" :columns="discardedColumns" :data-source="operationalSeries.list" :pagination="false" :rowKey="(record) => { return record.name}">
                  <div slot="name" slot-scope="record">{{record.name }}</div>
                  <div slot="min" slot-scope="record">{{record.min }}</div>
                  <div slot="max" slot-scope="record">{{record.max}}</div>
                  <div slot="avg" slot-scope="record">{{record.avg  }}</div>
                </a-table>
              </a-col>
            </a-row>
          </a-col>
        </a-row>
        <template slot="footer">
          <a-button @click="handleCancel">关闭</a-button>
        </template>
      </a-modal>
    </div>
    <img slot="extra" src="@/assets/img/extraBg.png" alt="" class="extraBg">
  </page-layout>

</template>

<script>
import PageLayout from "@/layouts/PageLayout";
import DetailList from "@/components/tool/DetailList";
const DetailListItem = DetailList.Item;
import { hostDetail, netInterfaceData, linMonList } from "@/services/admin";
import { parseTimeFun } from "@/utils/formatter";
import moment from "moment";
import echarts from 'echarts';
require('echarts-liquidfill');
import FileSaver from "file-saver";
import XLSX from "xlsx";


export default {
  name: "LinuxDetail",
  components: { PageLayout, DetailListItem, DetailList, },
  data() {
    return {
      moment,
      id: "",
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
      mode1: "date",
      mode2: "date",
      disabledTime: { h: 0, m: 0, s: 0 },
      tpercent: 0,
      zbx: false,
      liquidNode: null,
      FileSystemlist: [],
      Interfacelist: [],
      visible: false,
      list: [],
      columns: [
        { title: '挂载点', key: 'name', align: 'left', scopedSlots: { customRender: 'name' } },
        { title: '总空间', key: 'total_space', align: 'left', scopedSlots: { customRender: 'total_space' } },
        { title: '已使用', key: 'used_space', align: 'left', scopedSlots: { customRender: 'used_space' } },
        { title: '空间使用率', key: 'space_utilization', align: 'left', scopedSlots: { customRender: 'space_utilization' } },
        { title: 'Inodes使用率', key: 'inodes_pused', align: 'left', scopedSlots: { customRender: 'inodes_pused' } },
        { title: '采集时间', key: 'lastclock', align: 'left', scopedSlots: { customRender: 'lastclock' } }
      ],
      columns2: [
        { title: '状态', key: 'operational_status', align: 'left', scopedSlots: { customRender: 'operational_status' }, sorter: (a, b) => a.operational_status.localeCompare(b.operational_status) },
        { title: '接口名', key: 'name', align: 'left', scopedSlots: { customRender: 'name' } },
        { title: '接收流量(Kbps)', key: 'bits_received', align: 'left', scopedSlots: { customRender: 'bits_received' }, sorter: (a, b) => b.bits_received - a.bits_received },
        { title: '发送流量(Kbps)', key: 'bits_sent', align: 'left', scopedSlots: { customRender: 'bits_sent' }, sorter: (a, b) => b.bits_sent - a.bits_sent },
        { title: '进丢包/错包', key: 'instatus', align: 'left', scopedSlots: { customRender: 'instatus' }, sorter: (a, b) => b.instatus - a.instatus },
        { title: '出丢包/错包', key: 'outstatus', align: 'left', scopedSlots: { customRender: 'outstatus' }, sorter: (a, b) => b.outstatus - a.outstatus },
        { title: '端口速率', key: 'speed', align: 'left', scopedSlots: { customRender: 'speed' }, sorter: (a, b) => b.speed - a.speed },
        { title: '采集时间', key: 'lastclock', align: 'left', scopedSlots: { customRender: 'lastclock' } },
        { title: '操作', key: 'operation', align: 'left', scopedSlots: { customRender: 'operation' } }
      ],
      trafficeColumns: [
        { title: '类型', key: 'name', align: 'left', scopedSlots: { customRender: 'name' } },
        { title: '最小', key: 'min', align: 'left', scopedSlots: { customRender: 'min' } },
        { title: '最大', key: 'max', align: 'left', scopedSlots: { customRender: 'max' } },
        { title: '平均', key: 'avg', align: 'left', scopedSlots: { customRender: 'avg' } },
        { title: '95th PercAvg', key: 'th_perc_avg', align: 'left', scopedSlots: { customRender: 'th_perc_avg' } },
        // { title: '95th PercVal', key: 'th_perc_val', align: 'left', scopedSlots: { customRender: 'th_perc_val' } },
      ],
      discardedColumns: [
        { title: '类型', key: 'name', align: 'left', scopedSlots: { customRender: 'name' } },
        { title: '最小', key: 'min', align: 'left', scopedSlots: { customRender: 'min' } },
        { title: '最大', key: 'max', align: 'left', scopedSlots: { customRender: 'max' } },
        { title: '平均', key: 'avg', align: 'left', scopedSlots: { customRender: 'avg' } },
      ],
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
        list: "",
      },
      diescardedSeries: {
        xAxis: "",
        yAxis: "",
        legend: "",
        title: "",
      },
      errorsSeries: {
        xAxis: "",
        yAxis: "",
        legend: "",
        title: "",
      },
      operationalSeries: {
        xAxis: "",
        yAxis: "",
        legend: "",
        title: "",
      },
      loading1: false,
      loading2: false,
      loading3: false,
    };
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
    }
  },
  methods: {
    init() {
      hostDetail(this.id).then((resp) => {
        let res = resp.data;
        this.detail = res;
      }).finally(() => {
        this.initBaseChart();
        this.loading1 = false;
      });
      this.loading2 = true
      linMonList(this.id).then((resp) => {
        let res = resp.data
        if (res.code == 200) {
          this.FileSystemlist = res.data.items.filesystem || []
          this.Interfacelist = res.data.items.interfaces || []
        }
      }).finally(() => { this.loading2 = false })
    },
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
      //cpu
      this.myChart = echarts.init(document.getElementById('liquidCPU'));
      this.myChart.setOption(
        {
          series: [
            {
              type: 'liquidFill',
              radius: '85%',
              center: ['50%', '50%'],
              data: [this.detail.cpu_utilization.split(" ")[0] / 100],
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
                      color: 'rgba(168, 218, 247, 0.4)'
                    },
                    {
                      offset: 0.5,
                      color: 'rgba(168, 218, 247, 0.5)'
                    },
                    {
                      offset: 0,
                      color: 'rgba(168, 218, 247, 0.8)'
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
                        color: 'rgba(81,142,215, 0)'
                      },
                      {
                        offset: 0.5,
                        color: 'rgba(53,142,215, 0.45)'
                      },
                      {
                        offset: 1,
                        color: 'rgba(53,142,215, 0.6)'
                      }
                    ],
                    globalCoord: false
                  },
                  shadowColor: 'rgba(66,102,247, 0.55)',
                  shadowBlur: 10
                }
              },
              label: {
                normal: {
                  formatter: this.detail.cpu_utilization.split(" ")[0] + "%",
                  textStyle: {
                    fontSize: 35
                  }
                }
              }
            }
          ]
        },
        true
      );
      //memory
      this.myChart = echarts.init(document.getElementById('liquidMem'));
      this.myChart.setOption(
        {
          series: [
            {
              type: 'liquidFill',
              radius: '85%',
              center: ['50%', '50%'],
              data: [this.detail.memory_utilization.split(" ")[0] / 100],
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
                      color: 'rgba(168, 218, 247, 0.4)'
                    },
                    {
                      offset: 0.5,
                      color: 'rgba(168, 218, 247, 0.5)'
                    },
                    {
                      offset: 0,
                      color: 'rgba(168, 218, 247, 0.8)'
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
                        color: 'rgba(81,142,215, 0)'
                      },
                      {
                        offset: 0.5,
                        color: 'rgba(53,142,215, 0.45)'
                      },
                      {
                        offset: 1,
                        color: 'rgba(53,142,215, 0.6)'
                      }
                    ],
                    globalCoord: false
                  },
                  shadowColor: 'rgba(66,102,247, 0.55)',
                  shadowBlur: 10
                }
              },
              label: {
                normal: {
                  formatter: this.detail.memory_utilization.split(" ")[0] + "%",
                  textStyle: {
                    fontSize: 35
                  }
                }
              }
            }
          ]
        },
        true
      )
      //pingloss
      this.myChart = echarts.init(document.getElementById('liquidPingloss'));
      this.myChart.setOption(
        {
          series: [
            {
              type: 'gauge',
              radius: '85%',
              center: ['50%', '50%'],
              data: [this.detail.ping_loss.split(" ")[0]],
              detail: { // 中间数据
                valueAnimation: true,
                formatter: '{value}%', // 数据值的样式
                textStyle: {
                  fontSize: 14
                },
                offsetCenter: [0, '80%'] // 中间值的位置
              },
            }
          ]
        },
        true
      );
    },
    //流量
    initTrafficChart() {
      const chart = echarts.init(document.getElementById('trafficChat'))
      const option = {
        title: {
          text: this.trafficeSeries.title,
          left: 'center'
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
        },
        xAxis: this.trafficeSeries.xAxis,
        yAxis: {
          type: 'value',
          scale: true,
          axisLabel: {
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
          left: 'center'
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
        },
        xAxis: this.diescardedSeries.xAxis,
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
          left: 'center'
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
        },
        xAxis: this.errorsSeries.xAxis,
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
          left: 'center'
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
        },
        xAxis: this.operationalSeries.xAxis,
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
      }).then((resp) => {
        let res = resp.data;
        this.loading3 = false
        //流量
        this.trafficeSeries.xAxis = res.traffic_series.xAxis
        this.trafficeSeries.yAxis = res.traffic_series.yAxis
        this.trafficeSeries.legend = res.traffic_series.legend.data
        this.trafficeSeries.list = res.traffic_series.table || []
        this.trafficeSeries.title = '接口' + this.record.name + '流量'
        //丢包
        this.diescardedSeries.xAxis = res.discarded_series.xAxis
        this.diescardedSeries.yAxis = res.discarded_series.yAxis
        this.diescardedSeries.legend = res.discarded_series.legend.data
        this.diescardedSeries.list = res.discarded_series.table || []
        this.diescardedSeries.title = '接口' + this.record.name + '丢包'
        //错包
        this.errorsSeries.xAxis = res.errors_series.xAxis
        this.errorsSeries.yAxis = res.errors_series.yAxis
        this.errorsSeries.legend = res.errors_series.legend.data
        this.errorsSeries.list = res.errors_series.table || []
        this.errorsSeries.title = '接口' + this.record.name + '错误包'
        //端口状态
        this.operationalSeries.xAxis = res.operational_status_series.xAxis
        this.operationalSeries.yAxis = res.operational_status_series.yAxis
        this.operationalSeries.legend = res.operational_status_series.legend.data
        this.operationalSeries.list = res.operational_status_series.table || []
        this.operationalSeries.title = '接口' + this.record.name + '端口状态'
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
      }).then((resp) => {
        let res = resp.data;
        this.loading3 = false
        //流量
        this.trafficeSeries.xAxis = res.traffic_series.xAxis
        this.trafficeSeries.yAxis = res.traffic_series.yAxis
        this.trafficeSeries.legend = res.traffic_series.legend.data
        this.trafficeSeries.list = res.traffic_series.table || []
        this.trafficeSeries.title = '接口' + record.name + '流量'
        //丢包
        this.diescardedSeries.xAxis = res.discarded_series.xAxis
        this.diescardedSeries.yAxis = res.discarded_series.yAxis
        this.diescardedSeries.legend = res.discarded_series.legend.data
        this.diescardedSeries.list = res.discarded_series.table || []
        this.diescardedSeries.title = '接口' + record.name + '丢包'
        //错包
        this.errorsSeries.xAxis = res.errors_series.xAxis
        this.errorsSeries.yAxis = res.errors_series.yAxis
        this.errorsSeries.legend = res.errors_series.legend.data
        this.errorsSeries.list = res.errors_series.table || []
        this.errorsSeries.title = '接口' + record.name + '错误包'
        //端口状态
        this.operationalSeries.xAxis = res.operational_status_series.xAxis
        this.operationalSeries.yAxis = res.operational_status_series.yAxis
        this.operationalSeries.legend = res.operational_status_series.legend.data
        this.operationalSeries.list = res.operational_status_series.table || []
        this.operationalSeries.title = '接口' + record.name + '端口状态'
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
.extraBg {
  width: 195px;
  position: absolute;
  right: 20px;
  top: 50px;
  z-index: 8;
  img {
    width: 100%;
  }
}
.linux-charts {
  display: flex;
  margin-top: 20px;
  flex-direction: column;
  position: relative;
  z-index: 9;
}
.pingloss {
  margin-top: -280px;
}
.pingsec {
  margin-top: -280px;
}
.text-pingsec {
  width: 300px;
  height: 300px;
  margin: 0 auto;
  font-size: 100px;
  color: #1ed80d;
  font-weight: 600;
  flex: auto;
  justify-content: space-between;
  position: relative;
}
</style>
