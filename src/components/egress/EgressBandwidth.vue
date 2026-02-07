<template>
  <div class="egress-bandwidth">
    <div v-if="egressList.length === 0" class="no-data">
      <a-empty description="暂无出口配置" />
    </div>
    <div v-else class="egress-list">
      <div 
        v-for="(egress, index) in egressList" 
        :key="egress.id"
        class="egress-item"
        :class="{ 'full-width': egressList.length === 1 }"
        :style="egressItemStyle"
      >
        <div class="egress-header">
          <span class="egress-name">{{ egress.name }}</span>
          <span class="egress-time">{{ updateTime }}</span>
        </div>
        <div class="egress-stats">
          <div class="stat-item in" :style="inStyle">
            <span class="label">入流量</span>
            <span class="value">{{ formatTraffic(egress.in_value) }}</span>
          </div>
          <div class="stat-item out" :style="outStyle">
            <span class="label">出流量</span>
            <span class="value">{{ formatTraffic(egress.out_value) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'EgressBandwidth',
  props: {
    data: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      egressList: [],
      updateTime: '--',
    }
  },
  computed: {
    ...mapState('setting', ['theme']),
    themeColor() {
      return this.theme.color || '#1890ff'
    },
    egressItemStyle() {
      return {
        '--egress-bg': this.hexToRgba(this.themeColor, 0.05),
        '--egress-border': this.hexToRgba(this.themeColor, 0.2)
      }
    },
    inStyle() {
      return {
        '--stat-bg': this.hexToRgba(this.themeColor, 0.1),
        '--stat-color': this.themeColor
      }
    },
    outStyle() {
      return {
        '--stat-bg': this.hexToRgba(this.adjustColor(this.themeColor, 30), 0.1),
        '--stat-color': this.adjustColor(this.themeColor, 30)
      }
    }
  },
  watch: {
    data: {
      handler(newData) {
        if (newData && newData.length > 0) {
          this.egressList = newData
          this.updateTime = this.formatTime(new Date())
        }
      },
      immediate: true,
      deep: true
    }
  },
  methods: {
    hexToRgba(hex, alpha = 1) {
      const r = parseInt(hex.slice(1, 3), 16)
      const g = parseInt(hex.slice(3, 5), 16)
      const b = parseInt(hex.slice(5, 7), 16)
      return `rgba(${r}, ${g}, ${b}, ${alpha})`
    },
    adjustColor(hex, amount) {
      // 调整颜色亮度，用于生成第二个颜色
      const num = parseInt(hex.slice(1), 16)
      const r = Math.min(255, Math.max(0, (num >> 16) + amount))
      const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount))
      const b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount))
      return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
    },
    formatTraffic(bytes) {
      // 处理 undefined、null、空字符串等情况
      if (bytes === undefined || bytes === null || bytes === '' || bytes === 0) {
        return '0 B/s'
      }
      
      const value = parseFloat(bytes)
      // 如果转换后是 NaN 或者小于等于 0，返回 0
      if (isNaN(value) || value <= 0) {
        return '0 B/s'
      }
      
      const k = 1024
      const sizes = ['B/s', 'KB/s', 'MB/s', 'GB/s', 'TB/s']
      const i = Math.floor(Math.log(value) / Math.log(k))
      
      return (value / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i]
    },
    formatTime(date, format = 'YYYY-MM-DD HH:mm:ss') {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')
      const seconds = String(date.getSeconds()).padStart(2, '0')
      
      if (format === 'HH:mm:ss') {
        return `${hours}:${minutes}:${seconds}`
      }
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
    }
  }
}
</script>

<style lang="less" scoped>
.egress-bandwidth {
  width: 100%;
  height: 100%;
}

.no-data {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 80px;
}

.egress-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.egress-item {
  flex: 0 0 calc(50% - 4px);
  background: var(--egress-bg);
  border: 1px solid var(--egress-border);
  border-radius: 6px;
  padding: 8px;
  box-sizing: border-box;
  
  &.full-width {
    flex: 0 0 100%;
  }
}

.egress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  
  .egress-name {
    font-size: 14px;
    font-weight: 600;
    color: #333;
  }
  
  .egress-time {
    font-size: 11px;
    color: #999;
  }
}

.egress-stats {
  display: flex;
  gap: 8px;
}

.stat-item {
  flex: 1;
  padding: 10px 12px;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  background: var(--stat-bg);
  
  .label {
    font-size: 11px;
    font-weight: 500;
    color: var(--stat-color);
  }
  
  .value {
    font-size: 16px;
    font-weight: 600;
    color: var(--stat-color);
  }
}
</style>
