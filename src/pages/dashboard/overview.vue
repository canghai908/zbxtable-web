<template>
  <page-layout>
    <div slot="headerContent" class="overview-container">
      <!-- 统计概览卡片 -->
      <div class="stats-overview">
        <a-row :gutter="[24, 24]">
          <a-col :xl="6" :lg="12" :md="12" :sm="24" :xs="24" v-for="(stat, index) in statsCards" :key="index" class="stat-col">
            <div class="stat-card" :class="`stat-card-${stat.type}`">
              <div class="stat-icon" :class="`stat-icon-${stat.type}`">
                <a-icon :type="stat.icon" />
              </div>
              <div class="stat-content">
                <div class="stat-title">{{ stat.title }}</div>
                <div class="stat-value">{{ stat.value }}</div>
                <div class="stat-detail">
                  <span class="stat-status healthy">
                    <a-icon type="check-circle" /> {{ stat.healthy }}
                  </span>
                  <span class="stat-status warning" v-if="stat.warning > 0">
                    <a-icon type="warning" /> {{ stat.warning }}
                  </span>
                  <span class="stat-status error" v-if="stat.error > 0">
                    <a-icon type="close-circle" /> {{ stat.error }}
                  </span>
                </div>
              </div>
            </div>
          </a-col>
        </a-row>
      </div>

      <!-- 主机详情卡片 -->
      <a-card :bodyStyle="{padding: '24px'}" :loading="loading" class="main-card">
        <a-row :gutter="[24, 24]">
          <!-- Windows 主机 -->
          <a-col :xl="12" :lg="12" :md="24" :sm="24" :xs="24">
            <div class="host-section">
              <div class="section-header windows-header">
                <div class="header-left">
                  <a-icon type="windows" class="section-icon" />
                  <span class="section-title">{{ winTitle }}</span>
                </div>
                <a-badge :count="getAlarmCount(win)" :number-style="{ backgroundColor: '#faad14' }" />
              </div>
              <div class="host-grid">
                <div 
                  v-for="(item, index) in win" 
                  :key="index" 
                  class="host-item"
                  :class="getHostClass(item)"
                >
                  <a-popover :title="$t('title_device_info')" placement="top">
                    <template slot="content">
                      <div class="popover-content">
                        <p><strong>{{ $t('label_hostname') }}:</strong> {{ item.name }}</p>
                        <p v-if="item.instance_name"><strong>{{ $t('label_instance_name') }}:</strong> {{ item.instance_name }}</p>
                        <p><strong>{{ $t('label_IP') }}:</strong> {{ item.interfaces }}</p>
                        <p><strong>{{ $t('label_cpu_usage') }}:</strong> {{ item.cpu_utilization }}</p>
                        <p><strong>{{ $t('label_memory_usage') }}:</strong> {{ item.memory_utilization }}</p>
                        <p><strong>{{ $t('label_num_errors') }}:</strong> {{ item.error }}</p>
                        <p><strong>{{ $t('label_num_alarms') }}:</strong> {{ item.alarm }}</p>
                      </div>
                    </template>
                    <div class="host-dot" :class="getStatusClass(item)">
                      <div class="pulse-ring" v-if="item.alarm > 0"></div>
                    </div>
                  </a-popover>
                </div>
              </div>
            </div>
          </a-col>

          <!-- Linux 主机 -->
          <a-col :xl="12" :lg="12" :md="24" :sm="24" :xs="24">
            <div class="host-section">
              <div class="section-header linux-header">
                <div class="header-left">
                  <a-icon type="code" class="section-icon" />
                  <span class="section-title">{{ linTitle }}</span>
                </div>
                <a-badge :count="getAlarmCount(lin)" :number-style="{ backgroundColor: '#faad14' }" />
              </div>
              <div class="host-grid">
                <div 
                  v-for="(item, index) in lin" 
                  :key="index" 
                  class="host-item"
                  :class="getHostClass(item)"
                >
                  <a-popover :title="$t('title_device_info')" placement="top">
                    <template slot="content">
                      <div class="popover-content">
                        <p><strong>{{ $t('label_hostname') }}:</strong> {{ item.name }}</p>
                        <p v-if="item.instance_name"><strong>{{ $t('label_instance_name') }}:</strong> {{ item.instance_name }}</p>
                        <p><strong>{{ $t('label_IP') }}:</strong> {{ item.interfaces }}</p>
                        <p><strong>{{ $t('label_cpu_usage') }}:</strong> {{ item.cpu_utilization }}</p>
                        <p><strong>{{ $t('label_memory_usage') }}:</strong> {{ item.memory_utilization }}</p>
                        <p><strong>{{ $t('label_num_errors') }}:</strong> {{ item.error }}</p>
                        <p><strong>{{ $t('label_num_alarms') }}:</strong> {{ item.alarm }}</p>
                      </div>
                    </template>
                    <div class="host-dot" :class="getStatusClass(item)">
                      <div class="pulse-ring" v-if="item.alarm > 0"></div>
                    </div>
                  </a-popover>
                </div>
              </div>
            </div>
          </a-col>

          <!-- 网络设备 -->
          <a-col :xl="12" :lg="12" :md="24" :sm="24" :xs="24">
            <div class="host-section">
              <div class="section-header network-header">
                <div class="header-left">
                  <a-icon type="global" class="section-icon" />
                  <span class="section-title">{{ netTitle }}</span>
                </div>
                <a-badge :count="getAlarmCount(net)" :number-style="{ backgroundColor: '#faad14' }" />
              </div>
              <div class="host-grid">
                <div 
                  v-for="(item, index) in net" 
                  :key="index" 
                  class="host-item"
                  :class="getHostClass(item)"
                >
                  <a-popover :title="$t('title_device_info')" placement="top">
                    <template slot="content">
                      <div class="popover-content">
                        <p><strong>{{ $t('label_hostname') }}:</strong> {{ item.name }}</p>
                        <p v-if="item.instance_name"><strong>{{ $t('label_instance_name') }}:</strong> {{ item.instance_name }}</p>
                        <p><strong>{{ $t('label_IP') }}:</strong> {{ item.interfaces }}</p>
                        <p><strong>{{ $t('label_cpu_usage') }}:</strong> {{ item.cpu_utilization }}</p>
                        <p><strong>{{ $t('label_memory_usage') }}:</strong> {{ item.memory_utilization }}</p>
                        <p><strong>{{ $t('label_num_errors') }}:</strong> {{ item.error }}</p>
                        <p><strong>{{ $t('label_num_alarms') }}:</strong> {{ item.alarm }}</p>
                      </div>
                    </template>
                    <div class="host-dot" :class="getStatusClass(item)">
                      <div class="pulse-ring" v-if="item.alarm > 0"></div>
                    </div>
                  </a-popover>
                </div>
              </div>
            </div>
          </a-col>

          <!-- 硬件服务器 -->
          <a-col :xl="12" :lg="12" :md="24" :sm="24" :xs="24">
            <div class="host-section">
              <div class="section-header server-header">
                <div class="header-left">
                  <a-icon type="database" class="section-icon" />
                  <span class="section-title">{{ srvTitle }}</span>
                </div>
                <a-badge :count="getAlarmCount(srv)" :number-style="{ backgroundColor: '#faad14' }" />
              </div>
              <div class="host-grid">
                <div 
                  v-for="(item, index) in srv" 
                  :key="index" 
                  class="host-item"
                  :class="getHostClass(item)"
                >
                  <a-popover :title="$t('title_device_info')" placement="top">
                    <template slot="content">
                      <div class="popover-content">
                        <p><strong>{{ $t('label_hostname') }}:</strong> {{ item.name }}</p>
                        <p v-if="item.instance_name"><strong>{{ $t('label_instance_name') }}:</strong> {{ item.instance_name }}</p>
                        <p><strong>{{ $t('label_IP') }}:</strong> {{ item.interfaces }}</p>
                        <p><strong>{{ $t('label_cpu_usage') }}:</strong> {{ item.cpu_utilization }}</p>
                        <p><strong>{{ $t('label_memory_usage') }}:</strong> {{ item.memory_utilization }}</p>
                        <p><strong>{{ $t('label_num_errors') }}:</strong> {{ item.error }}</p>
                        <p><strong>{{ $t('label_num_alarms') }}:</strong> {{ item.alarm }}</p>
                      </div>
                    </template>
                    <div class="host-dot" :class="getStatusClass(item)">
                      <div class="pulse-ring" v-if="item.alarm > 0"></div>
                    </div>
                  </a-popover>
                </div>
              </div>
            </div>
          </a-col>
        </a-row>
      </a-card>
    </div>
  </page-layout>
</template>

<script>
import PageLayout from "@/layouts/PageLayout";
import { indexOverview } from "@/services/admin";

export default {
  i18n: require('./i18n'),
  name: "LinuxDetail",
  components: { PageLayout },
  data() {
    return {
      name: '测试',
      win: [],
      lin: [],
      net: [],
      srv: [],
      loading: false,
      winTitle: '',
      linTitle: '',
      netTitle: '',
      srvTitle: '',
    };
  },
  computed: {
    statsCards() {
      return [
        {
          title: this.$t('num_windows_hosts'),
          value: this.win.length,
          icon: 'windows',
          type: 'windows',
          healthy: this.getHealthyCount(this.win),
          warning: this.getWarningCount(this.win),
          error: this.getErrorCount(this.win)
        },
        {
          title: this.$t('num_linux_hosts'),
          value: this.lin.length,
          icon: 'code',
          type: 'linux',
          healthy: this.getHealthyCount(this.lin),
          warning: this.getWarningCount(this.lin),
          error: this.getErrorCount(this.lin)
        },
        {
          title: this.$t('num_networking_hosts'),
          value: this.net.length,
          icon: 'global',
          type: 'network',
          healthy: this.getHealthyCount(this.net),
          warning: this.getWarningCount(this.net),
          error: this.getErrorCount(this.net)
        },
        {
          title: this.$t('num_hardware_hosts'),
          value: this.srv.length,
          icon: 'database',
          type: 'server',
          healthy: this.getHealthyCount(this.srv),
          warning: this.getWarningCount(this.srv),
          error: this.getErrorCount(this.srv)
        }
      ];
    }
  },
  created() {
    this.init();
  },
  methods: {
    init() {
      this.loading = true;
      indexOverview().then((resp) => {
        let res = resp.data;
        if (res.code == 200) {
          this.win = res.data.vm_win || [];
          this.winTitle = this.$t('num_windows_hosts');
          this.lin = res.data.vm_lin || [];
          this.linTitle = this.$t('num_linux_hosts');
          this.net = res.data.hw_net || [];
          this.netTitle = this.$t('num_networking_hosts');
          this.srv = res.data.hw_srv || [];
          this.srvTitle = this.$t('num_hardware_hosts');
        }
      }).finally(() => { 
        this.loading = false;
      });
    },
    getStatusClass(item) {
      if (item.available == 1 && item.alarm == 0) return 'status-healthy';
      if (item.available == 1 && item.alarm > 0) return 'status-warning';
      if (item.available == 0) return 'status-unknown';
      if (item.available == 2) return 'status-error';
      return 'status-unknown';
    },
    getHostClass(item) {
      if (item.available == 1 && item.alarm == 0) return 'host-healthy';
      if (item.available == 1 && item.alarm > 0) return 'host-warning';
      if (item.available == 0) return 'host-unknown';
      if (item.available == 2) return 'host-error';
      return 'host-unknown';
    },
    getHealthyCount(hosts) {
      return hosts.filter(h => h.available == 1 && h.alarm == 0).length;
    },
    getWarningCount(hosts) {
      return hosts.filter(h => h.available == 1 && h.alarm > 0).length;
    },
    getErrorCount(hosts) {
      return hosts.filter(h => h.available == 2 || h.available == 0).length;
    },
    getAlarmCount(hosts) {
      return hosts.filter(h => h.alarm > 0).length;
    }
  },
};
</script>

<style lang="less" scoped>
.overview-container {
  min-height: 100vh;
  background: @layout-bg-color;
  padding: 24px;
}

// 统计卡片样式
.stats-overview {
  margin-bottom: 24px;
  animation: fadeInDown 0.6s ease-out;
}

.stat-col {
  animation: fadeInUp 0.6s ease-out;
  animation-fill-mode: both;
  
  &:nth-child(1) { animation-delay: 0.1s; }
  &:nth-child(2) { animation-delay: 0.2s; }
  &:nth-child(3) { animation-delay: 0.3s; }
  &:nth-child(4) { animation-delay: 0.4s; }
}

.stat-card {
  background: @component-background;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  border: 1px solid @border-color-base;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.3s ease;
  }
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    border-color: transparent;
    
    &::before {
      transform: scaleX(1);
    }
    
    .stat-icon {
      transform: scale(1.05);
    }
  }
}

// 统一使用主题色
.stat-card-windows,
.stat-card-linux,
.stat-card-network,
.stat-card-server {
  &::before { background: @primary-color; }
  &:hover { box-shadow: 0 8px 24px fade(@primary-color, 20%); }
}

.stat-icon {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  margin-right: 20px;
  transition: all 0.3s ease;
  position: relative;
  
  .anticon {
    font-size: 32px;
    position: relative;
    z-index: 1;
  }
  
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 12px;
    opacity: 0.12;
    transition: opacity 0.3s ease;
  }
}

// 统一使用主题色的图标配色
.stat-icon-windows,
.stat-icon-linux,
.stat-icon-network,
.stat-icon-server {
  color: @primary-color;
  &::before { background: @primary-color; }
  .stat-card:hover & {
    &::before { opacity: 0.18; }
  }
}

.stat-content {
  flex: 1;
}

.stat-title {
  font-size: 14px;
  color: @text-color-secondary;
  margin-bottom: 8px;
  font-weight: 500;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: @heading-color;
  margin-bottom: 8px;
  line-height: 1;
}

.stat-detail {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.stat-status {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: 500;
  
  &.healthy {
    color: #52c41a;
    background: fade(#52c41a, 10%);
  }
  
  &.warning {
    color: #faad14;
    background: fade(#faad14, 10%);
  }
  
  &.error {
    color: #f5222d;
    background: fade(#f5222d, 10%);
  }
}

// 主卡片样式
.main-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  animation: fadeIn 0.8s ease-out 0.3s both;
  border: 1px solid @border-color-base;
  background: @component-background;
}

// 主机区域样式
.host-section {
  background: @component-background;
  border-radius: 8px;
  padding: 20px;
  min-height: 280px;
  transition: all 0.3s ease;
  border: 1px solid @border-color-split;
  
  &:hover {
    border-color: @border-color-base;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  }
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid fade(@primary-color, 30%);
  transition: all 0.3s ease;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.section-icon {
  font-size: 22px;
  color: @primary-color;
  transition: all 0.3s ease;
  
  .host-section:hover & {
    transform: scale(1.1);
  }
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: @heading-color;
}

// 主机网格样式
.host-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(32px, 1fr));
  gap: 12px;
  padding: 8px;
}

.host-item {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  animation: scaleIn 0.4s ease-out;
  animation-fill-mode: both;
}

// 生成动画延迟
.host-item:nth-child(1) { animation-delay: 0.02s; }
.host-item:nth-child(2) { animation-delay: 0.04s; }
.host-item:nth-child(3) { animation-delay: 0.06s; }
.host-item:nth-child(4) { animation-delay: 0.08s; }
.host-item:nth-child(5) { animation-delay: 0.10s; }
.host-item:nth-child(6) { animation-delay: 0.12s; }
.host-item:nth-child(7) { animation-delay: 0.14s; }
.host-item:nth-child(8) { animation-delay: 0.16s; }
.host-item:nth-child(9) { animation-delay: 0.18s; }
.host-item:nth-child(10) { animation-delay: 0.20s; }
.host-item:nth-child(n+11) { animation-delay: 0.22s; }

.host-dot {
  width: 28px;
  height: 28px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 10px;
    height: 10px;
    border-radius: 2px;
    background: rgba(255, 255, 255, 0.4);
  }
  
  &:hover {
    transform: scale(1.25);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  &.status-healthy {
    background: #52c41a;
  }
  
  &.status-warning {
    background: #faad14;
  }
  
  &.status-error {
    background: #f5222d;
  }
  
  &.status-unknown {
    background: #d9d9d9;
  }
}

// 脉冲动画（用于告警）
.pulse-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  border-radius: 6px;
  border: 2px solid #faad14;
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

// Popover 内容样式
.popover-content {
  p {
    margin: 8px 0;
    font-size: 14px;
    line-height: 1.6;
    
    strong {
      color: @heading-color;
      font-weight: 600;
      margin-right: 8px;
    }
  }
}

// 动画定义
@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes pulse {
  0% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(1.5);
    opacity: 0;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .overview-container {
    padding: 16px;
  }
  
  .stat-card {
    padding: 16px;
  }
  
  .stat-icon {
    width: 48px;
    height: 48px;
    font-size: 24px;
    margin-right: 12px;
    
    .anticon {
      font-size: 24px;
    }
  }
  
  .stat-value {
    font-size: 24px;
  }
  
  .host-grid {
    grid-template-columns: repeat(auto-fill, minmax(28px, 1fr));
    gap: 8px;
  }
  
  .host-dot {
    width: 24px;
    height: 24px;
    border-radius: 5px;
  }
}
</style>
