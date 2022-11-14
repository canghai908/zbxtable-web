<template>
  <page-layout :title="detail.name">
    <div slot="headerContent" class="linux-detail">
      <detail-list size="small" :col="3" v-if="type == 1 || type == 2">
        <detail-list-item term="主机ID">{{detail.hostid}}</detail-list-item>
        <detail-list-item term="CPU核心数">{{detail.number_of_cores}}</detail-list-item>
        <detail-list-item term="类型">{{detail.model || "--"}}</detail-list-item>
        <detail-list-item term="内存总量">{{detail.memory_total || "--"}}</detail-list-item>
        <detail-list-item term="操作系统">{{detail.system_name || "--"}}</detail-list-item>
        <detail-list-item term="运行时长">{{detail.uptime || "--"}}</detail-list-item>
        <detail-list-item term="备注">{{detail.vendor || "--"}}</detail-list-item>
      </detail-list>
      <detail-list size="small" :col="3" v-if="type == 3 || type == 4">
        <detail-list-item term="主机ID">{{detail.hostid}}</detail-list-item>
        <detail-list-item term="设备位置">{{detail.location || "--"}}</detail-list-item>
        <detail-list-item term="运行时间">{{detail.uptime || "--"}}</detail-list-item>
        <detail-list-item term="设备安装时间">{{detail.date_hw_install || "--"}}</detail-list-item>
        <detail-list-item term="维保到期时间">{{detail.date_hw_expiry || "--"}}</detail-list-item>
        <detail-list-item term="资产编号">{{detail.resource_id || "--"}}</detail-list-item>
        <detail-list-item term="设备型号">{{detail.model}}</detail-list-item>
        <detail-list-item term="备注">{{detail.vendor || "--"}}</detail-list-item>
      </detail-list>
      <a-tabs :tabBarStyle="{textAlign: 'left', width: '100%'}" style="padding: 0px 2px;" v-if="type == 1 || type == 2 || type == 4">
        <a-tab-pane tab="详情" key="1">
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
        <!-- <a-tab-pane tab="备注" key="2">
          <p>{{detail.vendor}}</p>
        </a-tab-pane> -->
      </a-tabs>
    </div>
    <img slot="extra" src="https://gw.alipayobjects.com/zos/rmsportal/RzwpdLnhmvDJToTdfDPe.png" alt="" class="extraBg">
    
  </page-layout>
</template>

<script>
import PageLayout from '@/layouts/PageLayout'
import DetailList from '@/components/tool/DetailList'
const DetailListItem = DetailList.Item
// import HeadInfo from '../../components/tool/HeadInfo'
import linuxLine from '../../components/chart/linuxLine'
import {hostDetail, hostMock, hostMockd} from "@/services/admin"
import {parseTimeFun} from '@/utils/formatter'
import moment from 'moment';
export default {
  name: 'LinuxDetail',
  components: { PageLayout, DetailListItem, DetailList, linuxLine},
  data () {
    return {
      moment,
      id: "",
      type: "",   // 1-linux  2-window 3-硬件  4-网络设备
      detail: "",
      cpuList: [],
      memoryList: [],
      dates:"",
      dater: "",
      historyType: "",
      cpu: "",
      memory: "",
      loading1: false,
      loading2: false,
      mode1: "date",
      mode2: "date",
      disabledTime: {h: 0,m: 0,s: 0}
    }
  },
  created() {
    this.dates = new Date().getTime();
    this.dater = parseTimeFun(this.dates);
    this.id = this.$route.query.id || "";
    this.type = this.$route.query.type || "1";
    this.init();
    if(this.type == 1 || this.type == 2 || this.type == 4) {
      this.initMock(this.dates)
    }
  },
  methods: {
    init () {
      hostDetail(this.id).then(resp => {
        let res = resp.data;
        this.detail = res;
      })
    },
    initMock (dates) {
      hostMock(this.id).then(resp => {
        let res = resp.data, cpu = {}, memory = {}, times = [parseTimeFun(dates - 1000*60*30), parseTimeFun(dates)];
        for(let i=0; i<res.length; i++) {
          if(res[i].name == "CPU") {
            for(let j=0; j<res[i].items.length; j++) {
              if(res[i].items[j].name == "CPU utilization") {
                cpu = {type: "cpu", history: res[i].items[j].value_type, itemids: res[i].items[j].itemid, period:times}
              }
            }
          }
          if(res[i].name == "Memory") {
            for(let j=0; j<res[i].items.length; j++) {
              if(res[i].items[j].name == "Memory utilization") {
                memory = {type: "memory", history: res[i].items[j].value_type, itemids: res[i].items[j].itemid, period:times}
              }
            }
          }
        }
        if(cpu.itemids) {
          this.cpu = cpu;
          hostMockd(cpu).then(retp => {
            let ret = retp.data;
            let arr = ret.data.items || [];
            arr.forEach((v) => {v.value = parseFloat(v.value);})
            arr.reverse();
            this.cpuList = arr;
          })
        }
        if(memory.itemids) {
          this.memory = memory;
          hostMockd(memory).then(retp => {
            let ret = retp.data;
            let arr = ret.data.items || [];
            arr.forEach((v) => {v.value = parseFloat(v.value);})
            arr.reverse();
            this.memoryList = arr;
          })
        }        
      })
    },
    mockDate (dates) {
      let mock = this.historyType == 1 ? this.cpu : this.memory;
      let times = [parseTimeFun(dates - 1000*60*30), parseTimeFun(dates)];
      mock.period = times;
      if(this.historyType == 1) {this.loading1 = true; this.cpuList = []} else {this.loading2 = false; this.memoryList = []}
      hostMockd(mock).then(retp => {
        let ret = retp.data;
        let arr = ret.data.items || [];
        arr.forEach((v) => {v.value = parseFloat(v.value);})
        arr.reverse();
        if(this.historyType == 1) {this.cpuList = arr;} else {this.memoryList = arr;}
      }).finally(() => {this.loading1 = false;this.loading2 = false;})
    },
    dateOpen(open) {
      if (open) {this.mode1 = 'date'; this.mode2 = "date"; console.log()}
    },
    datePanel1(value, mode) {
      console.log(1, value, mode);
      if(mode == "time") {this.setTime(value)}
      this.mode1 = mode;
    },
    datePanel2(value, mode) {
      console.log(2, value, mode);
      if(mode == "time") {this.setTime(value)}
      this.mode2 = mode;
    },
    dateOk1 (value) {
      this.historyType = 1;
      this.mockDate(moment(value).valueOf())
    },
    dateOk2 (value) {
      this.historyType = 2;
      this.mockDate(moment(value).valueOf())
    },
    range(start, end) {
      const result = [];
      for (let i = start; i < end; i++) { result.push(i);}
      return result;
    },
    disabledDate(current) {
      return current && current >= moment().endOf('day');
    },
    disabledDateTime() {
      return {
        disabledHours: () => this.range(0, 24).splice(this.disabledTime.h, 24),
        disabledMinutes: () => this.range(0, 60).splice(this.disabledTime.m+1, 60),
        disabledSeconds: () => this.range(0, 60).splice(this.disabledTime.s, 60)
      };
    },
    setTime(data) {
      this.resEndtimeDis()
      let time = data.format('YYYY/MM/DD HH mm').split(' ')//切割存放的年月日，时，分      
      var date = new Date()//获取当前时间
      if (moment(time[0]).valueOf() == moment(date.toLocaleDateString()).valueOf()) {
        this.disabledTime.h = date.getHours()//ban掉 时
        if (date.getHours() < time[1]) {
          this.disabledTime.m = 60 //解除分的禁止
        } else {
          this.disabledTime.m = date.getMinutes()//ban掉 分
          if (date.getMinutes() < time[2]) {
            this.disabledTime.s = 60
          } else {
            this.disabledTime.s = date.getSeconds()
          }
        }
      } else {
        //日期不同解除所有限制条件
        this.resEndtimeDis()
      }
      console.log(111, this.disabledTime)
    },
    resEndtimeDis() {//解除限制
      this.disabledTime = { h: 0, m: 0, s:0}
    }
  }
}
</script>

<style lang="less" scoped>
  .extraBg{
    width: 195px;
    position: absolute;
    right: 20px;
    top: 50px;
    z-index: 8;
    img{
      width: 100%;
    }
  }
  .linux-charts{
    display: flex;
    margin-top: 20px;
    flex-direction: column;
    position: relative;
    z-index: 9;
  }
</style>
