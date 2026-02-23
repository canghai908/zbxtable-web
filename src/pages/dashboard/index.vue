<template>
  <page-layout :noTitle="true">
    <a-modal
      :visible="topConfigModalVisible"
      :confirmLoading="topNumSaving"
      :title="topConfigTitle"
      okText="保存"
      cancelText="取消"
      @ok="saveTopNum"
      @cancel="closeTopConfigModal"
    >
      <a-form :layout="'vertical'">
        <a-form-item :label="topConfigLabel">
          <a-input-number v-model="topNumDraft" :min="1" :max="50" style="width: 100%;" />
        </a-form-item>
      </a-form>
    </a-modal>
    <!-- 未配置实例提示 -->
    <a-alert
      v-if="!hasZabbixInstance && (loading1 || loading2)"
      :message="$t('alert_no_instance_title')"
      type="warning"
      show-icon
      closable
      style="margin-bottom: 16px;"
    >
      <template slot="description">
        <div>
          <p style="margin-bottom: 8px;">{{ $t('alert_no_instance_desc') }}</p>
          <p style="margin-bottom: 12px;">{{ $t('alert_no_instance_action') }} <a @click="goToZabbixConfig" style="font-weight: 600; cursor: pointer; color: #1890ff;">{{ $t('alert_no_instance_link') }}</a> {{ $t('alert_no_instance_action_end') }}</p>
        </div>
      </template>
    </a-alert>
    
    <a-card :bodyStyle="{boxShadow: '0 1px 8px 0 #ddd'}" :loading="!loading1 &&!loading2 && !loading3">
      <a-row :gutter="16">
        <a-col :xl="{ span: 12 }" :lg="{ span: 24 }">
          <a-card :title="$t('title_problems')" :headStyle="cardHeadStyle" size="small" :loading="!loading1">
            <div class="homeMain beauty-scroll">
              <a-timeline>
                <a-timeline-item v-for="(v, i) in triggerList" :key="i">
                  <a-tag v-if="v.severity == 1" color="#7499FF">{{ $t('severity_informational') }}</a-tag>
                  <a-tag v-else-if="v.severity == 2" color="#FFC859">{{ $t('severity_warning') }}</a-tag>
                  <a-tag v-else-if="v.severity == 3" color="#FFA059">{{ $t('severity_average') }}</a-tag>
                  <a-tag v-else-if="v.severity == 4" color="#E97659">{{ $t('severity_high') }}</a-tag>
                  <a-tag v-else-if="v.severity == 5" color="#f50000">{{ $t('severity_disaster') }}</a-tag>
                  <a-tag v-else color="#97AAB3">{{ $t('severity_unknown') }}</a-tag>
                  <a-tag v-if="v.instance_name" :color="theme.color" style="margin-left: 4px;">{{ v.instance_name }}</a-tag>
                  <!-- <a-icon slot="dot" type="minus-circle" v-else-if="v.severity == 2" :style="{ fontSize: '16px', color: '#F56C6C' }" />
                  <a-icon slot="dot" type="exclamation-circle" v-else :style="{ fontSize: '16px', color: '#E6A23C' }" /> -->
                  {{v.lastchange | parsetime}} <b>{{v.name}}</b> {{v.lasteventname}}
                </a-timeline-item>
              </a-timeline>
            </div>
          </a-card>
        </a-col>
        <a-col :xl="{ span: 12 }" :lg="{ span: 24 }">
          <a-row>
            <a-col :lg="24" :md="24">
              <a-card :title="$t('title_hosttypecount')" :headStyle="cardHeadStyle" :bodyStyle="{height: '180px'}" size="small" :loading="!loading2">
                <div class="homeHost beauty-scroll" :style="cssVars">
                  <div class="homeHItem">
                    <span class="device-name">{{ $t('device_network_devices') }}</span>
                    <em class="device-count">{{ info.net_count }}</em>
                  </div>
                  <div class="homeHItem">
                    <span class="device-name">{{ $t('device_server_devices') }}</span>
                    <em class="device-count">{{ info.srv_count }}</em>
                  </div>
                  <div class="homeHItem">
                    <span class="device-name">{{ $t('device_windows_hosts') }}</span>
                    <em class="device-count">{{ info.win_count }}</em>
                  </div>
                  <div class="homeHItem">
                    <span class="device-name">{{ $t('device_linux_hosts') }}</span>
                    <em class="device-count">{{ info.lin_count }}</em>
                  </div>
                </div>
              </a-card>
            </a-col>
            <a-col :lg="24" :md="24" style="margin-top: 8px;">
              <a-card :headStyle="cardHeadStyle" :bodyStyle="{padding: '12px'}" size="small" :loading="!loading3">
                <template slot="title">
                  <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
                    <span>{{ $t('bandwidth') }}</span>
                    <span style="font-size: 12px; font-weight: 400; color: rgba(0,0,0,0.45); white-space: nowrap;">{{ egressUpdateTime ? (egressUpdateTime) : '' }}</span>
                  </div>
                </template>
                <egress-bandwidth :data="egressData" />
              </a-card>
            </a-col>
          </a-row>
        </a-col>
      </a-row>
    </a-card>
    <div style="width: 100%;height: 12px;"></div>
    <a-card :bodyStyle="{boxShadow: '0 1px 8px 0 #ddd'}" :loading="false">
      <a-row :gutter="16">
        <a-col :xl="{ span: 24 }" :lg="{ span: 24 }">
          <a-card :headStyle="cardHeadStyle" :bodyStyle="{ padding: 0 }" size="small" :loading="!loading4">
            <template slot="title">
              <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
                <span>{{ $t('windows_systems_title') }}</span>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <a-radio-group size="small" :value="winSortBy" @change="onWinSortChange">
                    <a-radio-button value="CPU">{{ $t('sort_by_cpu') }}</a-radio-button>
                    <a-radio-button value="MEM">{{ $t('sort_by_mem') }}</a-radio-button>
                  </a-radio-group>
                  <a-tooltip :title="$t('top_settings')">
                    <a-button size="small" icon="setting" @click="openTopConfigModal('VM_WIN')" />
                  </a-tooltip>
                </div>
              </div>
            </template>
            <div class="homeTopList" :style="cssVars">
              <div class="topListHeader">
                <span class="col-name">{{ $t('column_hostname') }}</span>
                <span class="col-metric">{{ $t('top_header_cpu') }}</span>
                <span class="col-metric">{{ $t('top_header_mem') }}</span>
              </div>
              <div class="beauty-scroll listBody">
                <div class="topListItem" v-for="(v, i) in winTop" :key="'winTop-'+i">
                  <div class="col-name" :title="hostTitle(v)">
                    <div class="rank-icon"><img :src="require('../../assets/img/top'+(i+1)+'.png')" v-if="i < 3" /><span v-else>{{i+1}}</span></div>
                    <div class="host-info">
                      <a-tag v-if="v.instance_name" :color="theme.color" class="instance-tag-small">{{v.instance_name}}</a-tag>
                      <span class="hostname">{{v.hostname}}</span>
                    </div>
                  </div>
                  <div class="col-metric">
                  <legent :rate="v.cpu" :height="20"></legent>
                  <span class="metric-value">{{fmtPercent(v.cpu)}}</span>
                  </div>
                  <div class="col-metric">
                  <legent :rate="v.mem" :height="20"></legent>
                  <span class="metric-value">{{fmtPercent(v.mem)}}</span>
                  </div>
                  </div>
                  <div class="topListItem empty" v-for="i in winTopNum-winTop.length" :key="'winTop-empty-'+i"></div>
                  </div>
                  </div>
          </a-card>
        </a-col>
      </a-row>
    </a-card>
    <div style="width: 100%;height: 12px;"></div>
    <a-card :bodyStyle="{boxShadow: '0 1px 8px 0 #ddd'}" :loading="false">
      <a-row :gutter="16">
        <a-col :xl="{ span: 24 }" :lg="{ span: 24 }">
          <a-card :headStyle="cardHeadStyle" :bodyStyle="{ padding: 0 }" size="small" :loading="!loading6">
            <template slot="title">
              <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
                <span>{{ $t('linux_systems_title') }}</span>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <a-radio-group size="small" :value="linSortBy" @change="onLinSortChange">
                    <a-radio-button value="CPU">{{ $t('sort_by_cpu') }}</a-radio-button>
                    <a-radio-button value="MEM">{{ $t('sort_by_mem') }}</a-radio-button>
                  </a-radio-group>
                  <a-tooltip :title="$t('top_settings')">
                    <a-button size="small" icon="setting" @click="openTopConfigModal('VM_LIN')" />
                  </a-tooltip>
                </div>
              </div>
            </template>
            <div class="homeTopList" :style="cssVars">
              <div class="topListHeader">
                <span class="col-name">{{ $t('column_hostname') }}</span>
                <span class="col-metric">{{ $t('top_header_cpu') }}</span>
                <span class="col-metric">{{ $t('top_header_mem') }}</span>
              </div>
              <div class="beauty-scroll listBody">
                <div class="topListItem" v-for="(v, i) in linTop" :key="'linTop-'+i">
                  <div class="col-name" :title="hostTitle(v)">
                    <div class="rank-icon"><img :src="require('../../assets/img/top'+(i+1)+'.png')" v-if="i < 3" /><span v-else>{{i+1}}</span></div>
                    <div class="host-info">
                      <a-tag v-if="v.instance_name" :color="theme.color" class="instance-tag-small">{{v.instance_name}}</a-tag>
                      <span class="hostname">{{v.hostname}}</span>
                    </div>
                  </div>
                  <div class="col-metric">
                  <legent :rate="v.cpu" :height="20"></legent>
                  <span class="metric-value">{{fmtPercent(v.cpu)}}</span>
                  </div>
                  <div class="col-metric">
                  <legent :rate="v.mem" :height="20"></legent>
                  <span class="metric-value">{{fmtPercent(v.mem)}}</span>
                  </div>
                  </div>
                  <div class="topListItem empty" v-for="i in linTopNum-linTop.length" :key="'linTop-empty-'+i"></div>
                  </div>
                  </div>
          </a-card>
        </a-col>
      </a-row>
    </a-card>
    <div style="width: 100%;height: 20px;"></div>
  </page-layout>
</template>

<script>
import PageLayout from '@/layouts/PageLayout'
import {
  indexTrigger,
  indexInfo,
  indexRestop,
  indexEgress,
  configGetList,
  configUpdate
} from '@/services/admin'
import { message } from 'ant-design-vue'
import { parseTimeFun } from '@/utils/formatter'
import pie from '@/components/gcharts/pie'
import legent from '@/components/gcharts/legent'
import EgressBandwidth from '@/components/egress/EgressBandwidth'
import { mapState } from 'vuex'

export default {
  name: 'index',
  i18n: require('./i18n'),
  data() {
    return {
      triggerList: [],
      loading1: false,
      loading2: false,
      loading3: false,
      loading4: true,
      loading5: false,
      loading6: true,
      topConfigModalVisible: false,
      topConfigType: '', // 'VM_WIN' 或 'VM_LIN'
      topNumDraft: 10,
      topNumSaving: false,
      linTopNumConfigId: null,
      winTopNumConfigId: null,
      info: {
        net_count: 0,
        srv_count: 0,
        win_count: 0,
        lin_count: 0
      },
      egressData: [], // 改为数组，支持多个出口
      egressUpdateTime: '', // 出口带宽采集时间
      refreshTimer: null, // 定时刷新
      linTop: [],
      winTop: [],
      winSortBy: 'CPU',
      linSortBy: 'CPU',
      linTopNum: 10,
      winTopNum: 10,
      hasZabbixInstance: null // 是否配置了 Zabbix 实例，初始为 null 表示未检测
    }
  },
  computed: {
    ...mapState('setting', ['theme']),
    cardHeadStyle() {
      // 使用主题颜色的浅色版本作为卡片标题背景
      return {
        background: this.hexToRgba(this.theme.color || '#1890ff', 0.08),
        color: this.theme.color || '#1890ff',
        fontWeight: 600
      }
    },
    cssVars() {
      return {
        '--primary-color': this.theme.color || '#1890ff',
        '--primary-bg': this.hexToRgba(this.theme.color || '#1890ff', 0.08),
        '--primary-bg-hover': this.hexToRgba(this.theme.color || '#1890ff', 0.12)
      }
    },
    topConfigTitle() {
      return this.topConfigType === 'VM_WIN' ? 'Windows Top 设置' : 'Linux Top 设置'
    },
    topConfigLabel() {
      return 'Top 数量'
    }
  },
  components: {
    PageLayout,
    pie,
    legent,
    EgressBandwidth
  },
  created() {
    this.initTrigger()
    this.initInfo()
    this.initEgress()
    this.initConfig().then(() => {
      this.initTop()
    })
    // 每30秒刷新一次出口数据
    this.refreshTimer = setInterval(() => {
      this.initEgress()
    }, 30000)
  },
  beforeDestroy() {
    // 清除定时器
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer)
    }
  },
  methods: {
    goToZabbixConfig() {
      this.$router.push('/system/zabbix')
    },
    openTopConfigModal(type) {
      this.topConfigType = type
      this.topNumDraft = type === 'VM_WIN' ? this.winTopNum : this.linTopNum
      this.topConfigModalVisible = true
    },
    closeTopConfigModal() {
      this.topConfigModalVisible = false
    },
    async saveTopNum() {
      const n = parseInt(this.topNumDraft, 10)
      if (!Number.isFinite(n) || n <= 0 || n > 50) {
        message.error('Top 数量请输入 1-50 的整数')
        return
      }

      const configId = this.topConfigType === 'VM_WIN' ? this.winTopNumConfigId : this.linTopNumConfigId
      if (!configId) {
        message.error('未找到 Top 数量配置项')
        return
      }

      this.topNumSaving = true
      try {
        await configUpdate(configId, { config_value: String(n) })
        if (this.topConfigType === 'VM_WIN') {
          this.winTopNum = n
        } else {
          this.linTopNum = n
        }
        this.topConfigModalVisible = false
        this.initTop()
        message.success('已更新 Top 数量')
      } catch (e) {
        console.error('更新 Top 数量失败:', e)
        message.error('更新失败')
      } finally {
        this.topNumSaving = false
      }
    },
    hostTitle(v) {
      if (!v) return ''
      return v.hostname + (v.instance_name ? ' [' + v.instance_name + ']' : '')
    },
    displayScore(v) {
      return v ? (v.displayScore || 0) : 0
    },
    fmtPercent(v) {
      return (v || 0) + '%'
    },
    onWinSortChange(e) {
      this.winSortBy = e.target.value
      this.loadWinTop()
    },
    onLinSortChange(e) {
      this.linSortBy = e.target.value
      this.loadLinTop()
    },
    loadWinTop() {
      return indexRestop({ host_type: 'VM_WIN', metrics_type: this.winSortBy, top_num: String(this.winTopNum) })
        .then((resp) => {
          const res = resp.data
          const arr = (res && Array.isArray(res.data)) ? res.data : []
          this.winTop = arr.filter(Boolean).map(item => ({
            ...item,
            displayScore: item.score
          }))
        })
        .catch((err) => {
          console.error('获取 Windows Top 失败:', err)
          this.winTop = []
        })
    },
    loadLinTop() {
      return indexRestop({ host_type: 'VM_LIN', metrics_type: this.linSortBy, top_num: String(this.linTopNum) })
        .then((resp) => {
          const res = resp.data
          const arr = (res && Array.isArray(res.data)) ? res.data : []
          this.linTop = arr.filter(Boolean).map(item => ({
            ...item,
            displayScore: item.score
          }))
        })
        .catch((err) => {
          console.error('获取 Linux Top 失败:', err)
          this.linTop = []
        })
    },
    initConfig() {
      return configGetList().then(resp => {
        const res = resp.data
        if (res.code === 200 && res.data && res.data.items) {
          const cfgLin = res.data.items.find(item => item.config_key === 'dash_top_lin_num')
          const cfgWin = res.data.items.find(item => item.config_key === 'dash_top_win_num')
          
          if (cfgLin) {
            this.linTopNumConfigId = cfgLin.id || cfgLin.config_id || null
            this.linTopNum = parseInt(cfgLin.config_value) || 10
            this.linTopNumDraft = this.linTopNum
          }
          if (cfgWin) {
            this.winTopNumConfigId = cfgWin.id || cfgWin.config_id || null
            this.winTopNum = parseInt(cfgWin.config_value) || 10
            this.winTopNumDraft = this.winTopNum
          }
        }
      }).catch(err => {
        console.error('获取配置失败:', err)
      })
    },
    hexToRgba(hex, alpha = 1) {
      const r = parseInt(hex.slice(1, 3), 16)
      const g = parseInt(hex.slice(3, 5), 16)
      const b = parseInt(hex.slice(5, 7), 16)
      return `rgba(${r}, ${g}, ${b}, ${alpha})`
    },
    initTrigger() {
      indexTrigger()
        .then((resp) => {
          let res = resp.data
          // 添加空值保护
          this.triggerList = (res && res.data && res.data.items) ? res.data.items : []
          // 如果有数据或者明确返回成功，认为实例已配置
          if (res && (res.code === 200 || res.code === 0)) {
            if (this.hasZabbixInstance === null) {
              this.hasZabbixInstance = true
            }
          }
        })
        .catch((err) => {
          console.error('获取告警信息失败:', err)
          // 任何错误都可能是未配置实例导致的
          this.hasZabbixInstance = false
          this.triggerList = []
        })
        .finally(() => {
          this.loading1 = true
        })
    },
    initInfo() {
      indexInfo()
        .then((resp) => {
          let res = resp.data
          // 确保数据有默认值
          this.info = {
            net_count: res.data?.net_count || 0,
            srv_count: res.data?.srv_count || 0,
            win_count: res.data?.win_count || 0,
            lin_count: res.data?.lin_count || 0
          }
          // 如果有数据或者明确返回成功，认为实例已配置
          if (res && (res.code === 200 || res.code === 0)) {
            if (this.hasZabbixInstance === null) {
              this.hasZabbixInstance = true
            }
          }
        })
        .catch((err) => {
          console.error('获取主机统计信息失败:', err)
          // 任何错误都可能是未配置实例导致的
          this.hasZabbixInstance = false
          // 保持默认值
          this.info = {
            net_count: 0,
            srv_count: 0,
            win_count: 0,
            lin_count: 0
          }
        })
        .finally(() => {
          this.loading2 = true
        })
    },
    initEgress() {
      indexEgress()
        .then((resp) => {
          let res = resp.data
          // 检查返回的数据格式
          if (res.data && Array.isArray(res.data)) {
            // 新格式：数组，确保每个项都有有效的值
            this.egressData = res.data.filter(Boolean).map(item => ({
              ...item,
              in_value: item?.in_value || 0,
              out_value: item?.out_value || 0
            }))
            
            // 从数据中提取最新的采集时间 (取最大的 timestamp)
            const timestamps = res.data.filter(Boolean).map(item => item?.timestamp).filter(t => t > 0)
            if (timestamps.length > 0) {
              const maxTimestamp = Math.max(...timestamps)
              // 接口返回的是秒级时间戳，需要乘以 1000
              const date = new Date(maxTimestamp * 1000)
              this.egressUpdateTime = parseTimeFun(date)
            }
          } else if (res.data && typeof res.data === 'object') {
            // 旧格式：对象，转换为数组格式（向后兼容）
            this.egressData = [
              {
                id: 1,
                name: res.data.name_one || '出口1',
                in_value: res.data.in_one || 0,
                out_value: res.data.out_one || 0
              },
              {
                id: 2,
                name: res.data.name_two || '出口2',
                in_value: res.data.in_two || 0,
                out_value: res.data.out_two || 0
              }
            ].filter(item => item.name && item.name !== '--')
          } else {
            this.egressData = []
          }
        })
        .catch((err) => {
          console.error('获取出口数据失败:', err)
          this.egressData = []
        })
        .finally(() => {
          this.loading3 = true
        })
    },
    initTop() {
      // A2：按当前选择的排序字段分别请求 Windows/Linux 的 TopN，后端返回已包含 cpu/mem 两项
      this.loadWinTop()
      this.loadLinTop()
    }
  },
  filters: {
    parsetime(v) {
      return parseTimeFun(v)
    },
    TrafficBytes(bytes, decimals = 2) {
      if (bytes === 0) return '0 Bytes'
      const k = 1000
      const dm = decimals < 0 ? 0 : decimals
      const sizes = [
        'Bytes',
        'KBps',
        'MBps',
        'GBps',
        'TBps',
        'PBps',
        'EBps',
        'ZBps',
        'YBps'
      ]
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + sizes[i]
    },
    kbFilters(v) {
      if (v && v > 0) {
        v = parseFloat(v)
        if (v <= 1024) {
          return v + 'B/s'
        }
        if (v > 1024 && (v * 8) / 1024 < 1024) {
          return ((v * 8) / 1024).toFixed(2) + 'Kb/s'
        }
        if ((v * 8) / 1024 > 1024 && (v * 8) / 1024 / 1024 < 1024) {
          return ((v * 8) / 1024 / 1024).toFixed(2) + 'Mb/s'
        }
        if ((v * 8) / 1024 / 1024 > 1024) {
          return ((v * 8) / 1024 / 1024 / 1024).toFixed(2) + 'Gb/s'
        }
      } else {
        return v
      }
    }
  }
}
</script>

<style lang="less">
.homeTopList {
  width: 100%;
  padding: 10px 20px;
  .topListHeader {
    display: flex;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px solid #f0f0f0;
    color: rgba(0, 0, 0, 0.45);
    font-size: 12px;
    font-weight: 500;
    .col-name {
      flex: 0 0 35%;
      padding-left: 45px;
    }
    .col-metric {
      flex: 1;
      text-align: left;
      padding-left: 10px;
    }
  }
  .listBody {
    max-height: 400px;
    overflow-y: auto;
  }
  .topListItem {
    display: flex;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px solid #f0f0f0;
    transition: all 0.3s;
    &:hover {
      background: var(--primary-bg);
    }
    &.empty {
      height: 50px;
      border-bottom: none;
    }
    .col-name {
      flex: 0 0 35%;
      display: flex;
      align-items: center;
      gap: 12px;
      min-width: 0;
      .rank-icon {
        flex: 0 0 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        font-weight: 600;
        color: #999;
        img {
          width: 24px;
          height: auto;
        }
      }
      .host-info {
        flex: 1;
        min-width: 0;
        display: flex;
        align-items: center;
        gap: 6px;
        .hostname {
          font-size: 13px;
          color: #262626;
          font-weight: 500;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          flex: 1;
          min-width: 0;
        }
      }
    }
    .col-metric {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 0 10px;
      .metric-value {
        flex: 0 0 60px;
        font-size: 13px;
        font-weight: 500;
        color: var(--primary-color);
        text-align: right;
      }
      /deep/ .legent {
        flex: 1;
        min-width: 160px;
        display: block;
      }
    }
  }
}
.homeMain {
  height: 430px;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 10px;
}
.homeLegent1 {
  width: 100%;
  padding: 20px 30px 20px;
  border-bottom: 1px solid #ddd;
  overflow: hidden;
}
.homeLeItem1 {
  width: 100%;
  display: inline-flex;
  justify-content: space-between;
  align-items: center;
}
.homeLeLeft {
  flex: 0 0 40%;
  min-width: 0;
}
.homeLeLeft1 {
  width: 90%;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  img {
    width: 30px;
    height: auto;
    margin: 0 20px;
  }
  span {
    flex: 0 0 100px;
    border-left: 1px solid #ddd;
    font-size: 16px;
    line-height: 16px;
    font-weight: 500;
    color: var(--primary-color);
    text-align: center;
  }
}
.homeLeLeft2 {
  width: 90%;
  text-align: center;
  font-size: 14px;
  font-weight: 500;
  color: #354052;
  line-height: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.homeLeRight {
  flex: 0 0 60%;
  height: 38px;
  min-width: 0;
  overflow: hidden;
}
.homeLegent2 {
  width: 100%;
  padding: 20px 30px 0;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  overflow: hidden;
}
.homeLeItem {
  flex: 0 0 48%;
  display: inline-flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin-bottom: 23px;
  height: 66px;
  min-width: 0;
}
.homeLeTop {
  width: 100%;
  display: inline-flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}
.homeLeTop1 {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid #ddd;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  img {
    width: 22px;
    height: auto;
  }
}
.homeLeTop2 {
  flex: 1;
  width: 0;
  font-size: 12px;
  font-weight: 500;
  color: #354052;
  line-height: 16px;
  margin: 0 10px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
}
.homeLeTop3 {
  font-size: 16px;
  line-height: 16px;
  font-weight: 500;
  color: var(--primary-color);
}
.homeLeBot {
  width: 100%;
  height: 20px;
  overflow: hidden;
}
.homeH2 {
  width: 100%;
  line-height: 60px;
  font-size: 28px;
  color: #000;
  font-weight: 600;
}
.homePies {
  width: 100%;
  height: 170px;
  display: flex;
  align-items: center;
}
.homePied {
  flex: 0 0 20%;
  width: 0;
  height: 170px;
  display: inline-flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.homePie {
  width: 100%;
  height: 130px;
}
.homePieN {
  height: 40px;
  line-height: 16px;
  font-size: 12px;
  color: #000;
  text-align: center;
  width: 80%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.instance-tag {
  font-size: 10px;
  margin-top: 4px;
  height: 18px;
  line-height: 16px;
  padding: 0 6px;
}
.instance-tag-small {
  font-size: 10px;
  margin-top: 2px;
  height: 16px;
  line-height: 14px;
  padding: 0 4px;
}
.homeHost {
  height: 156px;
  overflow: hidden;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 0 8px;
}
.homeHItem {
  flex: 1;
  min-width: 0;
  height: 140px;
  border: 2px solid;
  border-color: var(--primary-color);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 16px;
  padding: 16px 12px;
  background: var(--primary-bg);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
    background: var(--primary-bg-hover);
    
    .device-count {
      transform: scale(1.15);
  }
  }
  
  .device-name {
    font-size: 14px;
    color: #666;
    line-height: 1.4;
    text-align: center;
    font-weight: 500;
    word-break: break-word;
    max-width: 100%;
  }
  
  .device-count {
    font-size: 42px;
    line-height: 1;
    color: var(--primary-color);
    font-style: normal;
    font-weight: 700;
    transition: transform 0.3s ease;
  }
}
</style>
