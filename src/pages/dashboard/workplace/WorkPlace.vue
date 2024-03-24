<template>
  <page-layout :noTitle="true">
    <a-row style="margin: 0 -12px">
      <a-col style="padding: 0 12px" :xl="12" :lg="24" :md="24" :sm="24" :xs="24">
        <a-card title="告警列表" :headStyle="{background: '#ecf8ff'}" size="small">
          <div class="homeMain beauty-scroll">
            <a-timeline>
              <a-timeline-item v-for="(v, i) in triggerList" :key="i" :color="v.severity == 3 ? '#ff0000': (v.severity == 2 ? '#F56C6C': '#E6A23C')">
                <a-icon slot="dot" type="close-circle" v-if="v.severity == 3" :style="{ fontSize: '16px', color: '#ff0000' }" />
                <a-icon slot="dot" type="minus-circle" v-else-if="v.severity == 2" :style="{ fontSize: '16px', color: '#F56C6C' }" />
                <a-icon slot="dot" type="exclamation-circle" v-else :style="{ fontSize: '16px', color: '#E6A23C' }" />
                {{v.lastchange | parsetime}} <b>{{v.name}}</b> {{v.lasteventname}}
              </a-timeline-item>
            </a-timeline>
          </div>
        </a-card>
      </a-col>
      <a-col style="padding: 0 12px" :xl="4" :lg="8" :md="24" :sm="24" :xs="24">
        <a-card title="设备统计" :headStyle="{background: '#ecf8ff'}" size="small">
          <div class="homeMain homeList">
            <div class="homeItem"><div>Linux:</div><span>{{info.lin_count}}台</span></div>
            <div class="homeItem"><div>Window主机:</div><span>{{info.win_count}}台</span></div>
            <div class="homeItem"><div>硬件服务器:</div><span>{{info.srv_count}}台</span></div>
            <div class="homeItem"><div>网络设备:</div><span>{{info.net_count}}台</span></div>
          </div>
        </a-card>
      </a-col>
      <a-col style="padding: 0 12px" :xl="8" :lg="16" :md="24" :sm="24" :xs="24">
        <a-card title="出入口流量" :headStyle="{background: '#ecf8ff'}" size="small">
          <div class="homeMain beauty-scroll">
            <div class="home_net">
              <div class="home_net1">
                <a-button type="primary">mobile network1</a-button>
                <p style="margin-top: 20px">带宽: <span>200MB</span></p>
                <p>流出: <span>{{net.val1 | kbFilters}} &#8593;&#8593;</span></p>
                <p>流入: <span>{{net.val2 | kbFilters}} &#8595;&#8595;</span></p>
              </div>
              <div class="home_net1">
                <a-button type="primary">mobile network2</a-button>
                <p style="margin-top: 20px">带宽: <span>50MB</span></p>
                <p>流出: <span>{{net.val3 | kbFilters}} &#8593;&#8593;</span></p>
                <p>流入: <span>{{net.val4 | kbFilters}} &#8595;&#8595;</span></p>
              </div>
            </div>
          </div>
        </a-card>
      </a-col>
    </a-row>
    <a-row style="margin: 20px -12px 0">
      <a-col style="padding: 0 12px" :xl="24" :lg="24" :md="24" :sm="24" :xs="24">
        <a-card title="Windows TOP5" :headStyle="{background: '#ecf8ff'}" size="small">
          <div class="home_line">
            <div style="flex: 0 0 50%" v-if="winC && winC.length">
              <h3>CPU使用率</h3>
              <ver-line :mock="winC" />
            </div>
            <div style="flex: 0 0 50%;margin-left: 20px;" v-if="winM && winM.length">
              <h3>内存使用率</h3>
              <ver-line1 :mock="winM" />
            </div>
          </div>
        </a-card> 
      </a-col>
    </a-row>
    <a-row style="margin: 20px -12px">
      <a-col style="padding: 0 12px" :xl="24" :lg="24" :md="24" :sm="24" :xs="24">
        <a-card title="Linux operating system TOP5" :headStyle="{background: '#ecf8ff'}" size="small">
          <div class="home_line">
            <div style="flex: 0 0 50%" v-if="linC && linC.length">
              <h3>CPU使用率</h3>
              <ver-line :mock="linC" />
            </div>
            <div style="flex: 0 0 50%;margin-left: 20px;" v-if="linM && linM.length">
              <h3>内存使用率</h3>
              <ver-line1 :mock="linM" />
            </div>
          </div>
        </a-card> 
      </a-col>
    </a-row>
  </page-layout>
</template>

<script>
import PageLayout from '@/layouts/PageLayout'
import {indexRestop, indexTrigger, indexInfo, hostMockd} from "@/services/admin"
import {parseTimeFun} from '@/utils/formatter'
import verLine from "@/components/chart/verLine"
import verLine1 from "@/components/chart/verLine1"
export default {
  name: 'WorkPlace',
  components: {
    PageLayout,
    verLine,
    verLine1,
  },
  data () {
    return {
      triggerList: [],
      info: "",
      winC: [],
      winM: [],
      linC: [],
      linM: [],
      net: {val1: "--", val2: "--", val3: "--", val4: "--"}
    }
  },
  created() {
    this.initTrigger()
    this.initInfo()
    this.hostMock()
    this.initMock();
  },
  methods: {
    initTrigger () {
      indexTrigger().then(resp => {
        let res = resp.data;
        this.triggerList = res.data.items || [];
      })
    },
    initInfo () {
      indexInfo().then(resp => {
        let res = resp.data;
        this.info = res.data.items;
      })
    },
    hostMock() {
      let ntime = new Date().getTime();
      let times = [parseTimeFun(ntime - 1000*60*30), parseTimeFun(ntime)];
      hostMockd({history: 3, itemids: 39700, period:times}).then(resp => {
        let res = resp.data;
        this.net.val1 = res.data.items[0].value
      })
      hostMockd({history: 3, itemids: 40036, period:times}).then(resp => {
        let res = resp.data;
        this.net.val2 = res.data.items[0].value
      })
      hostMockd({history: 3, itemids: 39698, period:times}).then(resp => {
        let res = resp.data;
        this.net.val3 = res.data.items[0].value
      })
      hostMockd({history: 3, itemids: 40034, period:times}).then(resp => {
        let res = resp.data;
        this.net.val4 = res.data.items[0].value
      })
    },
    initMock() {
      indexRestop({host_type: "VM_WIN", metrics_type: "CPU", top_num: "5"}).then(resp => {
        let res = resp.data;
        let arr = res.data.top_list || [];
        arr.sort((a, b) => {return a.score - b.score;})
        this.winC = arr
      })
      indexRestop({host_type: "VM_WIN", metrics_type: "MEM", top_num: "5"}).then(resp => {
        let res = resp.data;
        let arr = res.data.top_list || [];
        this.winM = arr
      })
      indexRestop({host_type: "VM_LIN", metrics_type: "CPU", top_num: "5"}).then(resp => {
        let res = resp.data;
        let arr = res.data.top_list || [];
        arr.sort((a, b) => {return a.score - b.score;})
        this.linC = arr
      })
      indexRestop({host_type: "VM_LIN", metrics_type: "MEM", top_num: "5"}).then(resp => {
        let res = resp.data;
        let arr = res.data.top_list || [];
        this.linM = arr
      })
    }
  },
  filters: {
    parsetime (v) {
      return parseTimeFun(v);
    },
    kbFilters (v) {
      if(v && v > 0) {
        v = parseFloat(v);
        if(v <= 1024) {return v + "B/s"}
        if(v > 1024 && (v*8/1024) < 1024) { return (v*8/1024).toFixed(2)+"Kb/s"}
        if((v*8/1024) > 1024 && (v*8/1024/1024) < 1024){ return (v*8/1024/1024).toFixed(2)+"Mb/s"}
        if((v*8/1024/1024) > 1024){ return (v*8/1024/1024/1024).toFixed(2)+"Gb/s"}
      } else {
        return v;
      }
    }
  }
}
</script>

<style lang="less">
.homeMain{
  height: 200px;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 10px;
}
.homeList{
  display: flex;
  flex-direction: column;
  .homeItem{
    display: inline-flex;
    justify-content: space-between;
    align-items: center;
    line-height: 40px;
    font-size: 16px;
    div{
      width: 100px;
      text-align: right;;
    }
    span{
      flex: 1;
      margin-left: 10px;
    }
  }
}
.home_line{
  width: 100%;
  height: 360px;
  display: flex;
  justify-content: flex-start;
}
.home_net{
  width: 100%;
  height: 200px;
  display: flex;
  justify-content: space-between;
  .home_net1{
    flex: 1;
    display: inline-flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    p{
      line-height: 30px;
      font-size: 14px;
      span{
        color: #108ee9;
      }
    }
  }
}
</style>
