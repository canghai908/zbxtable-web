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
      >
        <div class="egress-header">
          <span class="egress-name">{{ egress.name }}</span>
          <span class="egress-time">{{ updateTime }}</span>
        </div>
        <div class="egress-stats">
          <div class="stat-item in">
            <span class="label">入流量</span>
            <span class="value">{{ formatTraffic(egress.in_value) }}</span>
          </div>
          <div class="stat-item out">
            <span class="label">出流量</span>
            <span class="value">{{ formatTraffic(egress.out_value) }}</span>
          </div>
        </div>
        <div :ref="`chart_${egress.id}`" class="egress-chart"></div>
      </div>
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'

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
      charts: {},
      updateTime: '--',
      historyData: {}, // 存储历史数据用于绘制趋势图
    }
  },
  watch: {
    data: {
      handler(newData) {
        if (newData && newData.length > 0) {
          this.egressList = newData
          this.updateTime = this.formatTime(new Date())
          this.$nextTick(() => {
            this.initCharts()
            this.updateHistoryData()
          })
        }
      },
      immediate: true,
      deep: true
    }
  },
  beforeDestroy() {
    // 销毁所有图表
    Object.values(this.charts).forEach(chart => {
      if (chart) {
        chart.dispose()
      }
    })
  },
  methods: {
    initCharts() {
      this.egressList.forEach(egress => {
        const chartRef = this.$refs[`chart_${egress.id}`]
        if (chartRef && chartRef[0]) {
          // 如果图表已存在，先销毁
          if (this.charts[egress.id]) {
            this.charts[egress.id].dispose()
          }
          
          // 创建新图表
          const chart = echarts.init(chartRef[0])
          this.charts[egress.id] = chart
          
          // 设置图表配置
          this.updateChart(egress.id)
        }
      })
    },
    updateChart(egressId) {
      const chart = this.charts[egressId]
      if (!chart) return
      
      const history = this.historyData[egressId] || { times: [], inValues: [], outValues: [] }
      
      const option = {
        tooltip: {
          trigger: 'axis',
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderColor: '#ccc',
          borderWidth: 1,
          textStyle: {
            color: '#333'
          },
          formatter: (params) => {
            let result = `${params[0].axisValue}<br/>`
            params.forEach(item => {
              result += `${item.marker}${item.seriesName}: ${this.formatTraffic(item.value)}<br/>`
            })
            return result
          }
        },
        legend: {
          data: ['入流量', '出流量'],
          bottom: 0,
          textStyle: {
            fontSize: 12
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '15%',
          top: '10%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: history.times,
          axisLabel: {
            fontSize: 10
          }
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            formatter: (value) => this.formatTraffic(value),
            fontSize: 10
          }
        },
        series: [
          {
            name: '入流量',
            type: 'line',
            smooth: true,
            data: history.inValues,
            itemStyle: {
              color: '#5470c6'
            },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(84, 112, 198, 0.3)' },
                { offset: 1, color: 'rgba(84, 112, 198, 0.05)' }
              ])
            }
          },
          {
            name: '出流量',
            type: 'line',
            smooth: true,
            data: history.outValues,
            itemStyle: {
              color: '#91cc75'
            },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(145, 204, 117, 0.3)' },
                { offset: 1, color: 'rgba(145, 204, 117, 0.05)' }
              ])
            }
          }
        ]
      }
      
      chart.setOption(option)
    },
    updateHistoryData() {
      const now = this.formatTime(new Date(), 'HH:mm:ss')
      
      this.egressList.forEach(egress => {
        if (!this.historyData[egress.id]) {
          this.historyData[egress.id] = {
            times: [],
            inValues: [],
            outValues: []
          }
        }
        
        const history = this.historyData[egress.id]
        
        // 添加新数据
        history.times.push(now)
        history.inValues.push(parseFloat(egress.in_value) || 0)
        history.outValues.push(parseFloat(egress.out_value) || 0)
        
        // 只保留最近20个数据点
        if (history.times.length > 20) {
          history.times.shift()
          history.inValues.shift()
          history.outValues.shift()
        }
        
        // 更新图表
        this.updateChart(egress.id)
      })
    },
    formatTraffic(bytes) {
      if (!bytes || bytes === 0) return '0 B/s'
      const value = parseFloat(bytes)
      if (isNaN(value)) return '0 B/s'
      
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
  height: 200px;
}

.egress-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.egress-item {
  flex: 0 0 calc(50% - 8px);
  background: #fafbfc;
  border-radius: 8px;
  padding: 16px;
  box-sizing: border-box;
  
  &.full-width {
    flex: 0 0 100%;
  }
}

.egress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  
  .egress-name {
    font-size: 16px;
    font-weight: 600;
    color: #333;
  }
  
  .egress-time {
    font-size: 12px;
    color: #999;
  }
}

.egress-stats {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
}

.stat-item {
  flex: 1;
  padding: 12px;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  
  &.in {
    background: rgba(84, 112, 198, 0.1);
    
    .label {
      color: #5470c6;
    }
    
    .value {
      color: #5470c6;
    }
  }
  
  &.out {
    background: rgba(145, 204, 117, 0.1);
    
    .label {
      color: #91cc75;
    }
    
    .value {
      color: #91cc75;
    }
  }
  
  .label {
    font-size: 12px;
    font-weight: 500;
  }
  
  .value {
    font-size: 18px;
    font-weight: 600;
  }
}

.egress-chart {
  width: 100%;
  height: 200px;
}
</style>
