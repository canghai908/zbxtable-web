<template>
  <page-layout :noTitle="true">
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
              <a-card :title="$t('bandwidth')" :headStyle="cardHeadStyle" :bodyStyle="{height: '220px', padding: '12px'}" size="small" :loading="!loading3">
                <egress-bandwidth :data="egressData" />
              </a-card>
            </a-col>
          </a-row>
        </a-col>
      </a-row>
    </a-card>
    <div style="width: 100%;height: 12px;"></div>
    <a-card :bodyStyle="{boxShadow: '0 1px 8px 0 #ddd'}" :loading="!loading4 && !loading5">
      <a-row :gutter="16">
        <a-col :xl="{ span: 12 }" :lg="{ span: 24 }">
          <h2 class="homeH2" :style="{ color: theme.color }">{{ $t('windows_systems_title') }}</h2>
          <a-card :title="$t('cpu_top5_title')" :headStyle="cardHeadStyle" size="small" :loading="!loading4">
            <div class="homePies">
              <div class="homePied" v-for="(v, i) in winC" :key="'1'+i">
                <div class="homePie">
                  <pie :name="v.hostname" :rate="v.score" :height="130"></pie>
                </div>
                <div class="homePieN" :title="v.hostname + (v.instance_name ? ' [' + v.instance_name + ']' : '')">
                  <div>{{v.hostname}}</div>
                  <a-tag v-if="v.instance_name" :color="theme.color" class="instance-tag">{{v.instance_name}}</a-tag>
                </div>
              </div>
            </div>
          </a-card>
        </a-col>
        <a-col :xl="{ span: 12 }" :lg="{ span: 24 }">
          <a-card :title="$t('memory_top5_title')" :headStyle="cardHeadStyle" :bodyStyle="{ padding: 0 }" size="small" :loading="!loading5">
            <div class="homeLegent" v-if="winM.length > 0" :style="cssVars">
              <div class="homeLegent1">
                <div class="homeLeItem1">
                  <div class="homeLeLeft">
                    <div class="homeLeLeft1"><img src="../../assets/img/top1.png" alt=""><span>{{winM[0].score}}%</span></div>
                    <div class="homeLeLeft2" :title="winM[0].hostname + (winM[0].instance_name ? ' [' + winM[0].instance_name + ']' : '')">
                      <div>{{winM[0].hostname}}</div>
                      <a-tag v-if="winM[0].instance_name" :color="theme.color" class="instance-tag-small">{{winM[0].instance_name}}</a-tag>
                    </div>
                  </div>
                  <div class="homeLeRight">
                    <legent :rate="winM[0].score" :height="38"></legent>
                  </div>
                </div>
              </div>
              <div class="homeLegent2">
                <div class="homeLeItem" v-for="(v, i) in winM.slice(1)" :key="'winM-'+i">
                  <div class="homeLeTop">
                    <div class="homeLeTop1"><img :src="require('../../assets/img/top'+(i+2)+'.png')" alt=""></div>
                    <div class="homeLeTop2" :title="v.hostname + (v.instance_name ? ' [' + v.instance_name + ']' : '')">
                      <div>{{v.hostname}}</div>
                      <a-tag v-if="v.instance_name" :color="theme.color" class="instance-tag-small">{{v.instance_name}}</a-tag>
                    </div>
                    <div class="homeLeTop3">{{v.score}}%</div>
                  </div>
                  <div class="homeLeBot">
                    <legent :rate="v.score"></legent>
                  </div>
                </div>
                <div class="homeLeItem" v-for="i in 5-winM.length" :key="'winM-empty-'+i"></div>
              </div>
            </div>
          </a-card>
        </a-col>
      </a-row>
    </a-card>
    <div style="width: 100%;height: 12px;"></div>
    <a-card :bodyStyle="{boxShadow: '0 1px 8px 0 #ddd'}" :loading="!loading6 && !loading7">
      <a-row :gutter="16">
        <a-col :xl="{ span: 12 }" :lg="{ span: 24 }">
          <h2 class="homeH2" :style="{ color: theme.color }">{{ $t('linux_systems_title') }}</h2>
          <a-card :title="$t('cpu_top5_title')" :headStyle="cardHeadStyle" size="small" :loading="!loading6">
            <div class="homePies">
              <div class="homePied" v-for="(v, i) in linC" :key="'2'+i">
                <div class="homePie">
                  <pie :name="v.hostname" :rate="v.score" :height="130"></pie>
                </div>
                <div class="homePieN" :title="v.hostname + (v.instance_name ? ' [' + v.instance_name + ']' : '')">
                  <div>{{v.hostname}}</div>
                  <a-tag v-if="v.instance_name" :color="theme.color" class="instance-tag">{{v.instance_name}}</a-tag>
                </div>
              </div>
            </div>
          </a-card>
        </a-col>
        <a-col :xl="{ span: 12 }" :lg="{ span: 24 }">
          <a-card :title="$t('memory_top5_title')" :headStyle="cardHeadStyle" :bodyStyle="{ padding: 0 }" size="small" :loading="!loading5">
            <div class="homeLegent" v-if="linM.length > 0" :style="cssVars">
              <div class="homeLegent1">
                <div class="homeLeItem1">
                  <div class="homeLeLeft">
                    <div class="homeLeLeft1"><img src="../../assets/img/top1.png" alt=""><span>{{linM[0].score}}%</span></div>
                    <div class="homeLeLeft2" :title="linM[0].hostname + (linM[0].instance_name ? ' [' + linM[0].instance_name + ']' : '')">
                      <div>{{linM[0].hostname}}</div>
                      <a-tag v-if="linM[0].instance_name" :color="theme.color" class="instance-tag-small">{{linM[0].instance_name}}</a-tag>
                    </div>
                  </div>
                  <div class="homeLeRight">
                    <legent :rate="linM[0].score" :height="38"></legent>
                  </div>
                </div>
              </div>
              <div class="homeLegent2">
                <div class="homeLeItem" v-for="(v, i) in linM.slice(1)" :key="'linM-'+i">
                  <div class="homeLeTop">
                    <div class="homeLeTop1"><img :src="require('../../assets/img/top'+(i+2)+'.png')" alt=""></div>
                    <div class="homeLeTop2" :title="v.hostname + (v.instance_name ? ' [' + v.instance_name + ']' : '')">
                      <div>{{v.hostname}}</div>
                      <a-tag v-if="v.instance_name" :color="theme.color" class="instance-tag-small">{{v.instance_name}}</a-tag>
                    </div>
                    <div class="homeLeTop3">{{v.score}}%</div>
                  </div>
                  <div class="homeLeBot">
                    <legent :rate="v.score"></legent>
                  </div>
                </div>
                <div class="homeLeItem" v-for="i in 5-linM.length" :key="'linM-empty-'+i"></div>
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
  indexEgress
} from '@/services/admin'
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
      info: '',
      egressData: [], // 改为数组，支持多个出口
      refreshTimer: null, // 定时刷新
      loading4: false,
      winC: [],
      loading5: false,
      winM: [],
      loading6: false,
      linC: [],
      loading7: false,
      linM: []
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
    this.initTop()
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
          this.triggerList = res.data.items || []
        })
        .finally(() => {
          this.loading1 = true
        })
    },
    initInfo() {
      indexInfo()
        .then((resp) => {
          let res = resp.data
          this.info = res.data
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
            // 新格式：数组
            this.egressData = res.data
          } else if (res.data && typeof res.data === 'object') {
            // 旧格式：对象，转换为数组格式（向后兼容）
            this.egressData = [
              {
                id: 1,
                name: res.data.name_one || '出口1',
                in_value: res.data.in_one || '0',
                out_value: res.data.out_one || '0'
              },
              {
                id: 2,
                name: res.data.name_two || '出口2',
                in_value: res.data.in_two || '0',
                out_value: res.data.out_two || '0'
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
      indexRestop({ host_type: 'VM_WIN', metrics_type: 'CPU', top_num: '5' })
        .then((resp) => {
          let res = resp.data
          let arr = res.data || []
          arr.sort((a, b) => {
            return b.score - a.score
          })
          this.winC = arr.slice(0, 5)
        })
        .finally(() => {
          this.loading4 = true
        })
      indexRestop({ host_type: 'VM_WIN', metrics_type: 'MEM', top_num: '5' })
        .then((resp) => {
          let res = resp.data
          let arr = res.data || []
          arr.sort((a, b) => {
            return b.score - a.score
          })
          this.winM = arr.slice(0, 5)
        })
        .finally(() => {
          this.loading5 = true
        })
      indexRestop({ host_type: 'VM_LIN', metrics_type: 'CPU', top_num: '5' })
        .then((resp) => {
          let res = resp.data
          let arr = res.data || []
          arr.sort((a, b) => {
            return b.score - a.score
          })
          this.linC = arr.slice(0, 5)
        })
        .finally(() => {
          this.loading6 = true
        })
      indexRestop({ host_type: 'VM_LIN', metrics_type: 'MEM', top_num: '5' })
        .then((resp) => {
          let res = resp.data
          let arr = res.data || []
          arr.sort((a, b) => {
            return b.score - a.score
          })
          this.linM = arr.slice(0, 5)
        })
        .finally(() => {
          this.loading7 = true
        })
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
