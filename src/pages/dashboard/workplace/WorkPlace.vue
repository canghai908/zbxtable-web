<template>
  <page-layout :noTitle="true">
    <a-row style="margin: 0 -12px">
      <a-col style="padding: 0 12px" :xl="12" :lg="24" :md="24" :sm="24" :xs="24">
        <a-card title="告警列表" :headStyle="$cardHeadStyle" size="small">
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
        <a-card title="设备统计" :headStyle="$cardHeadStyle" size="small">
          <div class="homeMain homeList">
            <div class="homeItem" v-for="item in deviceStats" :key="item.type_code">
              <div>{{ item.name }}:</div>
              <span>{{ item.count }}台</span>
            </div>
          </div>
        </a-card>
      </a-col>
      <a-col style="padding: 0 12px" :xl="8" :lg="16" :md="24" :sm="24" :xs="24">
        <a-card title="出入口流量" :headStyle="$cardHeadStyle" size="small">
          <div class="homeMain beauty-scroll">
            <div class="home_net">
              <div class="home_net1">
                <a-button type="primary">电信1</a-button>
                <p style="margin-top: 20px">带宽: <span>200MB</span></p>
                <p>流出: <span>{{net.val1 | kbFilters}} &#8593;&#8593;</span></p>
                <p>流入: <span>{{net.val2 | kbFilters}} &#8595;&#8595;</span></p>
              </div>
              <div class="home_net1">
                <a-button type="primary">电信2</a-button>
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
        <a-card title="Windows TOP5" :headStyle="$cardHeadStyle" size="small">
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
        <a-card title="Linux TOP5" :headStyle="$cardHeadStyle" size="small">
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
      info: {
        net_count: 0,
        srv_count: 0,
        win_count: 0,
        lin_count: 0,
        total_count: 0,
        asset_type_counts: []
      },
      winC: [],
      winM: [],
      linC: [],
      linM: [],
      net: {val1: "--", val2: "--", val3: "--", val4: "--"}
    }
  },
  computed: {
    deviceStats() {
      const counts = Array.isArray(this.info.asset_type_counts) ? this.info.asset_type_counts : []
      if (counts.length) {
        return counts.map(item => ({
          type_code: item.type_code,
          name: this.getPrimaryName(item.name || item.type_code),
          count: item.count || 0
        }))
      }

      return [
        { type_code: 'VM_LIN', name: 'Linux主机', count: this.info.lin_count || 0 },
        { type_code: 'VM_WIN', name: 'Window主机', count: this.info.win_count || 0 },
        { type_code: 'HW_SRV', name: '物理机器', count: this.info.srv_count || 0 },
        { type_code: 'HW_NET', name: '网络设备', count: this.info.net_count || 0 }
      ]
    }
  },
  created() {
    this.initTrigger()
    this.initInfo()
    this.hostMock()
    this.initMock();
  },
  methods: {
    getPrimaryName(name) {
      if (!name) return ''
      return String(name).replace(/\s*[（(][^（）()]*[）)]\s*$/u, '').trim()
    },
    initTrigger () {
      indexTrigger().then(resp => {
        let res = resp.data;
        this.triggerList = res.data.items || [];
      })
    },
    initInfo () {
      indexInfo().then(resp => {
        let res = resp.data;
        const data = (res && res.data) || {};
        this.info = {
          net_count: data.net_count || 0,
          srv_count: data.srv_count || 0,
          win_count: data.win_count || 0,
          lin_count: data.lin_count || 0,
          total_count: data.total_count || 0,
          asset_type_counts: Array.isArray(data.asset_type_counts) ? data.asset_type_counts : []
        };
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
