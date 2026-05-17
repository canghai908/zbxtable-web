<template>
  <div class="screen-root">
    <session-overlay :visible="sessionExpired" :default-username="currentUser" @success="onSessionRestored" />
    <header-bar :interval="refreshInterval" @interval-change="onIntervalChange" />
    <div class="screen-body">

      <!-- 行 1 左：主机类型分布 -->
      <screen-panel class="area-host-pie" :title="$t('panel_host_type')">
        <host-type-pie :data="info" />
      </screen-panel>

      <!-- 行 1 中：KPI 卡 + 出入口流量 -->
      <div class="area-kpi" style="display:flex;flex-direction:column;gap:14px;min-height:0;">
        <kpi-cards
          :total="kpi.total"
          :online="kpi.online"
          :alarms="kpi.alarms"
          :critical="kpi.critical"
          style="flex:0 0 auto;height:42%;"
        />
        <screen-panel :title="$t('panel_egress')" style="flex:1 1 auto;min-height:0;">
          <egress-area :data="egressData" />
        </screen-panel>
      </div>

      <!-- 行 1 右：告警分级玫瑰图 -->
      <screen-panel class="area-severity" :title="$t('panel_severity')">
        <severity-rose :triggers="triggerList" />
      </screen-panel>

      <!-- 行 3 左：Linux TOP（CPU/内存切换） -->
      <screen-panel class="area-cpu-top" :title="'Linux ' + (linMetric === 'cpu' ? 'CPU' : '内存') + ' TOP'">
        <template slot="extra">
          <div class="top-toggle">
            <span class="toggle-btn" :class="{ active: linMetric === 'cpu' }" @click="linMetric = 'cpu'">CPU</span>
            <span class="toggle-btn" :class="{ active: linMetric === 'mem' }" @click="linMetric = 'mem'">内存</span>
          </div>
        </template>
        <resource-top-bar :rows="linMetric === 'cpu' ? linCpuTop : linMemTop" :metric="linMetric" />
      </screen-panel>

      <!-- 行 3 中：实时告警动态 -->
      <screen-panel class="area-alert" :title="$t('panel_alert_list')" :extra="updateTime">
        <alert-marquee :list="triggerList" />
      </screen-panel>

      <!-- 行 3 右：Windows TOP（CPU/内存切换） -->
      <screen-panel class="area-mem-top" :title="'Windows ' + (winMetric === 'cpu' ? 'CPU' : '内存') + ' TOP'">
        <template slot="extra">
          <div class="top-toggle">
            <span class="toggle-btn" :class="{ active: winMetric === 'cpu' }" @click="winMetric = 'cpu'">CPU</span>
            <span class="toggle-btn" :class="{ active: winMetric === 'mem' }" @click="winMetric = 'mem'">内存</span>
          </div>
        </template>
        <resource-top-bar :rows="winMetric === 'cpu' ? winCpuTop : winMemTop" :metric="winMetric" />
      </screen-panel>

    </div>
  </div>
</template>

<script>
import HeaderBar from './components/HeaderBar'
import ScreenPanel from './components/ScreenPanel'
import KpiCards from './components/KpiCards'
import HostTypePie from './components/HostTypePie'
import SeverityRose from './components/SeverityRose'
import ResourceTopBar from './components/ResourceTopBar'
import EgressArea from './components/EgressArea'
import AlertMarquee from './components/AlertMarquee'
import SessionOverlay from './components/SessionOverlay'
import { startTokenRefresher } from '@/utils/tokenRefresher'
import { indexInfo, indexTrigger, indexRestop, indexEgress } from '@/services/admin'
import { parseTimeFun } from '@/utils/formatter'
import './style.less'

export default {
  name: 'ScreenDashboard',
  i18n: require('./i18n'),
  components: {
    HeaderBar, ScreenPanel, KpiCards,
    HostTypePie, SeverityRose, ResourceTopBar, EgressArea, AlertMarquee, SessionOverlay
  },
  data() {
    return {
      info: { net_count: 0, srv_count: 0, win_count: 0, lin_count: 0, total_count: 0, asset_type_counts: [] },
      triggerList: [],
      egressData: [],
      linCpuTop: [],
      linMemTop: [],
      winCpuTop: [],
      winMemTop: [],
      linMetric: 'cpu',
      winMetric: 'mem',
      updateTime: '',
      refreshInterval: 30,
      timers: [],
      sessionExpired: false,
      currentUser: ''
    }
  },
  computed: {
    kpi() {
      const dynamicCounts = Array.isArray(this.info.asset_type_counts) ? this.info.asset_type_counts : []
      const total = dynamicCounts.length
        ? dynamicCounts.reduce((sum, item) => sum + (Number(item && item.count) || 0), 0)
        : (this.info.net_count || 0) + (this.info.srv_count || 0) +
          (this.info.win_count || 0) + (this.info.lin_count || 0)
      const alarms = this.triggerList.length
      const critical = this.triggerList.filter(t => Number(t && t.severity) >= 4).length
      const online = total > 0 ? Math.max(0, Math.round(((total - critical) / total) * 1000) / 10) : 0
      return { total, alarms, critical, online }
    }
  },
  mounted() {
    this._origLoginNoAuth = window.loginNoAuth
    window.loginNoAuth = () => {
      this.sessionExpired = true
      this.clearTimers()
    }
    this.fetchAll()
    this.startTimers()
  },
  beforeDestroy() {
    this.clearTimers()
    window.loginNoAuth = this._origLoginNoAuth
  },
  methods: {
    startTimers() {
      this.clearTimers()
      const ms = this.refreshInterval * 1000
      this.timers.push(setInterval(this.fetchAll, ms))
      // 告警以 min(ms, 10s) 频率单独刷新，保持实时性
      const alarmMs = Math.min(ms, 10000)
      this.timers.push(setInterval(this.fetchAlarms, alarmMs))
    },
    clearTimers() {
      this.timers.forEach(t => clearInterval(t))
      this.timers = []
    },
    onIntervalChange(val) {
      this.refreshInterval = val
      this.fetchAll()
      this.startTimers()
    },
    fetchAll() {
      this.fetchInfo()
      this.fetchAlarms()
      this.fetchEgress()
      this.fetchTop()
    },
    fetchInfo() {
      indexInfo().then(resp => {
        const d = (resp && resp.data && resp.data.data) || {}
        this.info = {
          net_count: d.net_count || 0,
          srv_count: d.srv_count || 0,
          win_count: d.win_count || 0,
          lin_count: d.lin_count || 0,
          total_count: d.total_count || 0,
          asset_type_counts: Array.isArray(d.asset_type_counts) ? d.asset_type_counts : []
        }
      }).catch(() => {})
    },
    fetchAlarms() {
      indexTrigger().then(resp => {
        const items = resp && resp.data && resp.data.data && resp.data.data.items
        this.triggerList = Array.isArray(items) ? items : []
        this.updateTime = parseTimeFun(new Date())
      }).catch(() => {})
    },
    fetchEgress() {
      indexEgress().then(resp => {
        const d = resp && resp.data && resp.data.data
        if (Array.isArray(d)) {
          this.egressData = d.filter(Boolean).map(item => ({
            ...item,
            in_value: (item && item.in_value) || 0,
            out_value: (item && item.out_value) || 0
          }))
        } else if (d && typeof d === 'object') {
          this.egressData = [
            { name: d.name_one || '出口1', in_value: d.in_one || 0, out_value: d.out_one || 0 },
            { name: d.name_two || '出口2', in_value: d.in_two || 0, out_value: d.out_two || 0 }
          ]
        } else {
          this.egressData = []
        }
      }).catch(() => {})
    },
    onSessionRestored() {
      this.sessionExpired = false
      startTokenRefresher()
      this.fetchAll()
      this.startTimers()
    },
    fetchTop() {
      const parse = resp => {
        const arr = resp && resp.data && resp.data.data
        return Array.isArray(arr) ? arr.filter(Boolean) : []
      }
      indexRestop({ host_type: 'VM_LIN', metrics_type: 'CPU', top_num: '10' })
        .then(r => { this.linCpuTop = parse(r) }).catch(() => { this.linCpuTop = [] })
      indexRestop({ host_type: 'VM_LIN', metrics_type: 'MEM', top_num: '10' })
        .then(r => { this.linMemTop = parse(r) }).catch(() => { this.linMemTop = [] })
      indexRestop({ host_type: 'VM_WIN', metrics_type: 'CPU', top_num: '10' })
        .then(r => { this.winCpuTop = parse(r) }).catch(() => { this.winCpuTop = [] })
      indexRestop({ host_type: 'VM_WIN', metrics_type: 'MEM', top_num: '10' })
        .then(r => { this.winMemTop = parse(r) }).catch(() => { this.winMemTop = [] })
    }
  }
}
</script>
