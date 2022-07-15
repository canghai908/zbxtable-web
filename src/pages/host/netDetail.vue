<template>
  <page-layout :title="detail.name">
    <div slot="headerContent" class="linux-detail">
      <detail-list size="small" :col="3">
        <detail-list-item term="主机ID">{{detail.hostid}}</detail-list-item>
        <detail-list-item term="设备位置">{{detail.location || "--"}}</detail-list-item>
        <detail-list-item term="所属部门">{{detail.department || "--"}}</detail-list-item>
        <detail-list-item term="运行时间">{{detail.uptime || "--"}}</detail-list-item>
        <detail-list-item term="设备安装时间">{{detail.date_hw_install || "--"}}</detail-list-item>
        <detail-list-item term="维保到期时间">{{detail.date_hw_expiry || "--"}}</detail-list-item>
        <detail-list-item term="资产编号">{{detail.resource_id || "--"}}</detail-list-item>
        <detail-list-item term="设备型号">{{detail.model}}</detail-list-item>
        <detail-list-item term="IP地址">{{detail.interfaces}}</detail-list-item>
        <detail-list-item term="备注">{{detail.vendor || "--"}}</detail-list-item>
      </detail-list>
      <a-tabs :tabBarStyle="{textAlign: 'left', width: '100%'}" style="padding: 0px 2px;">
        <a-tab-pane tab="运行信息" key="2">
          <a-card :bodyStyle="{boxShadow: '0 1px 8px 0 #ddd'}">
            <a-row :gutter="16">
              <a-col :xl="{ span: 6 }" :lg="{ span: 12 }">
                <a-card hoverable :headStyle="{textAlign: 'center', width: '100%', background: '#FAFBFC'}" :bodyStyle="{padding: '0'}" title="CPU使用率">
                  <v-chart :data="data">
                    <v-scale y :options="yOptions" />
                    <v-tooltip disabled />
                    <v-pie :radius="0.85" series-field="name" />
                    <v-legend :options="legendOptions" />
                  </v-chart>
                  <pie name="CPU使用率" :rate="parseFloat(detail.cpu_utilization || 0)"></pie>
                </a-card>
              </a-col>
              <a-col :xl="{ span: 6 }" :lg="{ span: 12 }">
                <a-card hoverable :headStyle="{textAlign: 'center', width: '100%', background: '#FAFBFC'}" :bodyStyle="{padding: '0'}" title="内存使用率">
                  <pie name="内存使用率" :rate="parseFloat(detail.memory_utilization || 0)" color="#F7C137"></pie>
                </a-card>
              </a-col>
              <!-- <a-col :xl="{ span: 6 }" :lg="{ span: 12 }">
                <a-card hoverable :headStyle="{textAlign: 'center', width: '100%', background: '#FAFBFC'}" :bodyStyle="{padding: '0'}" title="网络延时">
                  <gauge :rate="80" :min="0" :max="100" icon="ms"></gauge>
                </a-card>
              </a-col>
              <a-col :xl="{ span: 6 }" :lg="{ span: 12 }">
                <a-card hoverable :headStyle="{textAlign: 'center', width: '100%', background: '#FAFBFC'}" :bodyStyle="{padding: '0'}" title="设备温度">
                  <gauge :rate="80" :min="0" :max="100" icon="℃"></gauge>
                </a-card>
              </a-col> -->
            </a-row>
          </a-card>
        </a-tab-pane>
        <a-tab-pane tab="接口信息" key="1">
          <a-card :bodyStyle="{boxShadow: '0 1px 8px 0 #ddd'}" :loading="!detail">
            <a-row :gutter="16">
              <a-table :loading="loading2" :columns="columns" :data-source="list" @change="changePage" :pagination="pagination" :scroll="{ y: 600 }" :rowKey="(record) => { return record.id;}">
                <div slot="name" slot-scope="record">{{record.name}}</div>
                <div slot="traffice" slot-scope="record">
                  <a-icon type="arrow-down" :style="{ fontSize: '16px', color: '#08c' }" />{{record.bits_received | TrafficBytes}}/
                  <a-icon type="arrow-up" :style="{ fontSize: '16px', color: '#08c' }" />{{record.bits_sent | TrafficBytes}}
                </div>
                <div slot="instatus" slot-scope="record">{{record.in_discarded}}/{{record.in_errors}}</div>
                <div slot="outstatus" slot-scope="record">{{record.out_discarded}}/{{record.out_errors}}</div>
                <div slot="speed" slot-scope="record">{{record.speed | SpeedToSize}}</div>
                <span slot="operational_status" slot-scope="record">
                  <template slot="title">
                    {{record.operational_status||'--'}}
                  </template>
                  <a-badge v-if="record.operational_status.indexOf('up')!=-1" status="success" :text=record.operational_status />
                  <a-badge v-else-if="record.operational_status.indexOf('down')!=-1" status="error" :text=record.operational_status />
                  <a-badge v-else status="default" :text=record.operational_status />
                </span>
                <span slot="lastclock" slot-scope="record">{{record.lastclock| dateFormat}}</span>
              </a-table>
            </a-row>
          </a-card>
        </a-tab-pane>
      </a-tabs>
    </div>
    <img slot="extra" src="@/assets/img/extraBg.png" alt="" class="extraBg">

  </page-layout>
</template>

<script>
import PageLayout from "@/layouts/PageLayout";
import DetailList from "@/components/tool/DetailList";
const DetailListItem = DetailList.Item;
import { hostDetail, hostMock, hostMockd, netInterfaceList } from "@/services/admin";
import { parseTimeFun } from "@/utils/formatter";
import moment from "moment";
import pie from "@/components/gcharts/pie";
import gauge from "@/components/gcharts/gauge";
export default {
  name: "LinuxDetail",
  components: { PageLayout, DetailListItem, DetailList, pie, gauge },
  data() {
    return {
      moment,
      id: "",
      detail: "",
      list: [],
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
      page: 1,
      pageSize: 10,
      columns: [
        { title: '接口', key: 'name', align: 'left', scopedSlots: { customRender: 'name' } },
        { title: '流量(Received/Sent)', key: 'traffice', align: 'left', scopedSlots: { customRender: 'traffice' } },
        { title: '进丢包/错包', key: 'instatus', align: 'left', scopedSlots: { customRender: 'instatus' } },
        { title: '出丢包/错包', key: 'outstatus', align: 'left', scopedSlots: { customRender: 'outstatus' } },
        { title: '端口速率', key: 'speed', align: 'left', scopedSlots: { customRender: 'speed' } },
        { title: '端口状态', key: 'operational_status', align: 'left', scopedSlots: { customRender: 'operational_status' } },
        { title: '采集时间', key: 'lastclock', align: 'left', scopedSlots: { customRender: 'lastclock' } }
      ],
      pagination: {
        total: 0, current: 1, "show-quick-jumper": true, "page-size-options": ["10", "20", "30", "40", "50", "100", "200"],
        pageSize: 10, "show-size-changer": true, "show-total": (total) => `共 ${total} 条数据`
      },
    };
  },
  created() {
    this.dates = new Date().getTime();
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
    TrafficBytes(bytes, decimals = 3) {
      if (bytes === 0) return '0 Bytes';
      const k = 1000;
      const dm = decimals < 0 ? 0 : decimals;
      const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
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
    init() {
      hostDetail(this.id).then((resp) => {
        let res = resp.data;
        this.detail = res;
      })
      this.loading2 = true
      netInterfaceList(this.id).then((resp) => {
        let res = resp.data
        if (res.code == 200) {
          this.pagination.total = res.data.total
          this.pagination.current = this.page
          this.pagination.pageSize = this.pageSize
          this.list = res.data.items || []
        }
      }).finally(() => { this.loading2 = false })
    },
    changePage(e) {
      this.page = e.current
      this.pageSize = e.pageSize
      this.init()
    },
    initMock(dates) {
      // 获取数据
      hostMock(this.id).then((resp) => {
        let res = resp.data,
          cpu = {},
          memory = {},
          times = [parseTimeFun(dates - 1000 * 60 * 30), parseTimeFun(dates)];
        for (let i = 0; i < res.length; i++) {
          if (res[i].name == "CPU") {
            for (let j = 0; j < res[i].items.length; j++) {
              if (res[i].items[j].name == "CPU utilization") {
                cpu = {
                  type: "cpu",
                  history: res[i].items[j].value_type,
                  itemids: res[i].items[j].itemid,
                  period: times,
                };
              }
            }
          }
          if (res[i].name == "Memory") {
            for (let j = 0; j < res[i].items.length; j++) {
              if (res[i].items[j].name == "Memory utilization") {
                memory = {
                  type: "memory",
                  history: res[i].items[j].value_type,
                  itemids: res[i].items[j].itemid,
                  period: times,
                };
              }
            }
          }
        }
        if (cpu.itemids) {
          this.cpu = cpu;
          hostMockd(cpu).then((retp) => {
            let ret = retp.data;
            let arr = ret.data.items || [];
            arr.forEach((v) => {
              v.value = parseFloat(v.value);
            });
            arr.reverse();
            this.cpuList = arr;
          });
        }
        if (memory.itemids) {
          this.memory = memory;
          hostMockd(memory).then((retp) => {
            let ret = retp.data;
            let arr = ret.data.items || [];
            arr.forEach((v) => {
              v.value = parseFloat(v.value);
            });
            arr.reverse();
            this.memoryList = arr;
          });
        }
      });
    },
    mockDate(dates) {
      let mock = this.historyType == 1 ? this.cpu : this.memory;
      let times = [parseTimeFun(dates - 1000 * 60 * 30), parseTimeFun(dates)];
      mock.period = times;
      if (this.historyType == 1) {
        this.loading1 = true;
        this.cpuList = [];
      } else {
        this.loading2 = false;
        this.memoryList = [];
      }
      hostMockd(mock)
        .then((retp) => {
          let ret = retp.data;
          let arr = ret.data.items || [];
          arr.forEach((v) => {
            v.value = parseFloat(v.value);
          });
          arr.reverse();
          if (this.historyType == 1) {
            this.cpuList = arr;
          } else {
            this.memoryList = arr;
          }
        })
        .finally(() => {
          this.loading1 = false;
          this.loading2 = false;
        });
    },
    dateOpen(open) {
      if (open) {
        this.mode1 = "date";
        this.mode2 = "date";
        console.log();
      }
    },
    datePanel1(value, mode) {
      console.log(1, value, mode);
      if (mode == "time") {
        this.setTime(value);
      }
      this.mode1 = mode;
    },
    datePanel2(value, mode) {
      if (mode == "time") {
        this.setTime(value);
      }
      this.mode2 = mode;
    },
    dateOk1(value) {
      this.historyType = 1;
      this.mockDate(moment(value).valueOf());
    },
    dateOk2(value) {
      this.historyType = 2;
      this.mockDate(moment(value).valueOf());
    },
    range(start, end) {
      const result = [];
      for (let i = start; i < end; i++) {
        result.push(i);
      }
      return result;
    },
    disabledDate(current) {
      return current && current >= moment().endOf("day");
    },
    disabledDateTime() {
      return {
        disabledHours: () => this.range(0, 24).splice(this.disabledTime.h, 24),
        disabledMinutes: () =>
          this.range(0, 60).splice(this.disabledTime.m + 1, 60),
        disabledSeconds: () =>
          this.range(0, 60).splice(this.disabledTime.s, 60),
      };
    },
    setTime(data) {
      this.resEndtimeDis();
      let time = data.format("YYYY/MM/DD HH mm").split(" "); //切割存放的年月日，时，分
      var date = new Date(); //获取当前时间
      if (
        moment(time[0]).valueOf() == moment(date.toLocaleDateString()).valueOf()
      ) {
        this.disabledTime.h = date.getHours(); //ban掉 时
        if (date.getHours() < time[1]) {
          this.disabledTime.m = 60; //解除分的禁止
        } else {
          this.disabledTime.m = date.getMinutes(); //ban掉 分
          if (date.getMinutes() < time[2]) {
            this.disabledTime.s = 60;
          } else {
            this.disabledTime.s = date.getSeconds();
          }
        }
      } else {
        //日期不同解除所有限制条件
        this.resEndtimeDis();
      }
    },
    resEndtimeDis() {
      //解除限制
      this.disabledTime = { h: 0, m: 0, s: 0 };
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
  justify-content: space-between;
  position: relative;
  z-index: 9;
}
</style>
