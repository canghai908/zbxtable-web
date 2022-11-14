<template>
  <page-layout :title="detail.name">
    <div slot="headerContent" class="linux-detail">
      <detail-list size="small" :col="3">
        <detail-list-item term="主机ID">{{detail.hostid}}</detail-list-item>
        <detail-list-item term="CPU核心数">{{detail.number_of_cores}}</detail-list-item>
        <detail-list-item term="类型">{{detail.model || "--"}}</detail-list-item>
        <detail-list-item term="总内存">{{detail.memory_total || "--"}}</detail-list-item>
        <detail-list-item term="操作系统">{{detail.os || "--"}}</detail-list-item>
        <detail-list-item term="运行时长">{{detail.uptime || "--"}}</detail-list-item>
        <detail-list-item term="备注">{{detail.vendor || "--"}}</detail-list-item>
      </detail-list>
      <a-tabs :tabBarStyle="{textAlign: 'left', width: '100%'}" style="padding: 0px 2px;">
        <a-tab-pane tab="运行信息" key="1">
          <a-card :bodyStyle="{boxShadow: '0 1px 8px 0 #ddd'}" :loading="!detail">
            <a-row :gutter="16">
              <a-col :xl="{ span: 6 }" :lg="{ span: 12 }">
                <a-card hoverable :headStyle="{textAlign: 'center', width: '100%', background: '#FAFBFC'}" :bodyStyle="{padding: '0'}" title="CPU使用率">
                  <pie name="CPU使用率" :rate="parseFloat(detail.cpu_utilization || 0)"></pie>
                </a-card>
              </a-col>
              <a-col :xl="{ span: 6 }" :lg="{ span: 12 }">
                <a-card hoverable :headStyle="{textAlign: 'center', width: '100%', background: '#FAFBFC'}" :bodyStyle="{padding: '0'}" title="内存使用率">
                  <pie name="内存使用率" :rate="parseFloat(detail.memory_utilization || 0)" color="#F7C137"></pie>
                </a-card>
              </a-col>
              <a-col :xl="{ span: 12 }" :lg="{ span: 12 }">
                <a-col :xl="{ span: 24 }" :lg="{ span: 12 }">
                  <!-- <a-card hoverable :headStyle="{textAlign: 'center', width: '100%', background: '#FAFBFC'}" :bodyStyle="{padding: '0'}" title="磁盘使用率"> -->
                  <a-table :loading="loading2" :columns="columns" :data-source="FileSystemList" :pagination=false :scroll="{ y: 600, }" :rowKey="(record) => { return record.id;}">
                    <div slot="name" slot-scope="record">{{record.name}}</div>
                    <div slot="total_space" slot-scope="record">{{record.total_space | formatBytes}}</div>
                    <div slot="used_space" slot-scope="record">{{record.used_space | formatBytes}}</div>
                    <div slot="space_utilization" slot-scope="record">
                      <a-progress :percent=record.space_utilization status="active" />
                    </div>
                    <span slot="lastclock" slot-scope="record">{{record.lastclock| dateFormat}}</span>
                  </a-table>
                </a-col>
              </a-col>
            </a-row>
          </a-card>
          <a-card :bodyStyle="{boxShadow: '0 1px 8px 0 #ddd'}" :loading="!detail">
            <a-row :gutter="16">
              <a-col :xl="{ span: 24 }" :lg="{ span: 24 }">
                <a-col :xl="{ span: 24 }" :lg="{ span: 24 }">
                  <!-- <a-card hoverable :headStyle="{textAlign: 'center', width: '100%', background: '#FAFBFC'}" :bodyStyle="{padding: '0'}" title="磁盘使用率"> -->
                  <a-table :loading="loading2" :columns="columns2" :data-source="Interfacelist" :pagination=false :scroll="{ y: 300, }" :rowKey="(record) => { return record.id;}">
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
                      <a-badge v-if="record.operational_status.indexOf('Connected')!=-1" status="success" :text=record.operational_status />
                      <a-badge v-else-if="record.operational_status.indexOf('down')!=-1" status="error" :text=record.operational_status />
                      <a-badge v-else status="default" :text=record.operational_status />
                    </span>
                    <span slot="lastclock" slot-scope="record">{{record.lastclock| dateFormat}}</span>
                  </a-table>
                </a-col>
              </a-col>
            </a-row>
          </a-card>
        </a-tab-pane>
        <!-- <a-tab-pane tab="详情" key="1">
          <div class="linux-charts">
            <div>
              <a-card :headStyle="{textAlign: 'center'}" title="CPU使用率">
                <a-date-picker slot="extra" :mode="mode1" :default-value="moment(dater,'YYYY-MM-DD hh:mm:ss')" show-time @openChange="dateOpen" @panelChange="datePanel1" :showToday="false" @ok="dateOk1" :disabled-date="disabledDate" :disabled-time="disabledDateTime" @change="setTime" />
                <linux-line :mock="cpuList" v-if="cpuList && cpuList.length && !loading1" />
                <div style="width: 100%;height: 400px;line-height: 400px;text-align:center" v-else></div>
              </a-card>
            </div>
            <div style="margin-top: 30px;">
              <a-card :headStyle="{textAlign: 'center'}" title="内存使用率">
                <a-date-picker slot="extra" :mode="mode2" :default-value="moment(dater, 'YYYY-MM-DD hh:mm:ss')" show-time @openChange="dateOpen" @panelChange="datePanel2" :showToday="false" @ok="dateOk2" :disabled-date="disabledDate" :disabled-time="disabledDateTime" @change="setTime" />
                <linux-line :mock="memoryList" v-if="memoryList && memoryList.length && !loading2" />
                <div style="width: 100%;height: 400px;line-height: 400px;text-align:center" v-else></div>
              </a-card>
            </div>
          </div>
        </a-tab-pane>
        <a-tab-pane tab="备注" key="2">
          <p>{{detail.vendor}}</p>
        </a-tab-pane> -->
      </a-tabs>
    </div>
    <img slot="extra" src="https://gw.alipayobjects.com/zos/rmsportal/RzwpdLnhmvDJToTdfDPe.png" alt="" class="extraBg">
  </page-layout>

</template>

<script>
import PageLayout from "@/layouts/PageLayout";
import DetailList from "@/components/tool/DetailList";
const DetailListItem = DetailList.Item;
// import HeadInfo from '../../components/tool/HeadInfo'
// import linuxLine from '../../components/chart/linuxLine'
import { hostDetail, hostMock, hostMockd, winMonList } from "@/services/admin";
import { parseTimeFun } from "@/utils/formatter";
import moment from "moment";
import pie from "@/components/gcharts/pie";
import basicPie from "@/components/gcharts/basicPie";

export default {
  name: "LinuxDetail",
  components: { PageLayout, DetailListItem, DetailList, pie, basicPie },
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
      loading3: false,
      mode1: "date",
      mode2: "date",
      disabledTime: { h: 0, m: 0, s: 0 },
      tpercent: 0,
      liquidNode: null,
      FileSystemList: [],
      Interfacelist: [],
      columns: [
        { title: '磁盘', key: 'name', align: 'left', scopedSlots: { customRender: 'name' } },
        { title: '总空间', key: 'total_space', align: 'left', scopedSlots: { customRender: 'total_space' } },
        { title: '已使用', key: 'used_space', align: 'left', scopedSlots: { customRender: 'used_space' } },
        { title: '使用率', key: 'space_utilization', align: 'left', scopedSlots: { customRender: 'space_utilization' } },
        { title: '采集时间', key: 'lastclock', align: 'left', scopedSlots: { customRender: 'lastclock' } }
      ],
      columns2: [
        { title: '接口', key: 'name', align: 'left', scopedSlots: { customRender: 'name' } },
        { title: '流量(Received/Sent)', key: 'traffice', align: 'left', scopedSlots: { customRender: 'traffice' } },
        { title: '进丢包/错包', key: 'instatus', align: 'left', scopedSlots: { customRender: 'instatus' } },
        { title: '出丢包/错包', key: 'outstatus', align: 'left', scopedSlots: { customRender: 'outstatus' } },
        { title: '端口速率', key: 'speed', align: 'left', scopedSlots: { customRender: 'speed' } },
        { title: '端口状态', key: 'operational_status', align: 'left', scopedSlots: { customRender: 'operational_status' } },
        { title: '采集时间', key: 'lastclock', align: 'left', scopedSlots: { customRender: 'lastclock' } }
      ],
    };
  },
  created() {
    this.dates = new Date().getTime();
    this.dater = parseTimeFun(this.dates);
    this.id = this.$route.query.id || "";
    this.init();
  },
  filters: {
    formatBytes(bytes, decimals = 3) {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const dm = decimals < 0 ? 0 : decimals;
      const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    },
    TrafficBytes(bytes, decimals = 3) {
      if (bytes === 0) return '0 Bytes';
      const k = 1000;
      const dm = decimals < 0 ? 0 : decimals;
      const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    },
    SpeedToSize(bytes) {
      var sizes = ['B', 'K', 'M', 'G', 'T'];
      if (bytes == 0) return '';
      var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1000)));
      return Math.round(bytes / Math.pow(1000, i), 2) + '' + sizes[i];
    },
    dateFormat(val) {
      if (val) { //判断是否存在
        var date = new Date(val * 1000);
        console.log(date)
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
      });
      this.loading2 = true
      winMonList(this.id).then((resp) => {
        let res = resp.data
        if (res.code == 200) {
          this.FileSystemList = res.data.items.filesystem || []
          this.Interfacelist = res.data.items.interfaces || []
        }
      }).finally(() => { this.loading2 = false })
    },
    initMock(dates) {
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
      console.log(2, value, mode);
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
      console.log(111, this.disabledTime);
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
  flex-direction: column;
  position: relative;
  z-index: 9;
}
</style>
