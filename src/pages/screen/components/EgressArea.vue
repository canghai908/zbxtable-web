<template>
  <div ref="chart" style="width:100%;height:100%;" />
</template>

<script>
import echarts from 'echarts'

const MAX_POINTS = 30

export default {
  name: 'EgressArea',
  i18n: require('../i18n'),
  props: {
    data: { type: Array, default: () => [] }
  },
  data() {
    return {
      chart: null,
      ro: null,
      history: [] // [{ t, in, out }]
    }
  },
  watch: {
    data: {
      deep: true,
      handler() { this.push() }
    }
  },
  mounted() {
    this.chart = echarts.init(this.$refs.chart)
    this.render()
    this.ro = new ResizeObserver(() => this.chart && this.chart.resize())
    this.ro.observe(this.$refs.chart)
    this.push()
  },
  beforeDestroy() {
    if (this.ro) this.ro.disconnect()
    if (this.chart) { this.chart.dispose(); this.chart = null }
  },
  methods: {
    push() {
      const arr = this.data || []
      let inSum = 0
      let outSum = 0
      arr.forEach(d => {
        inSum += Number((d && d.in_value) || 0)
        outSum += Number((d && d.out_value) || 0)
      })
      const now = new Date()
      const label = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
      this.history.push({ t: label, in: inSum, out: outSum })
      if (this.history.length > MAX_POINTS) this.history.shift()
      this.render()
    },
    fmt(v) {
      v = Number(v || 0)
      if (v <= 0) return '0'
      const units = ['B/s', 'KB/s', 'MB/s', 'GB/s', 'TB/s']
      let i = 0
      while (v >= 1024 && i < units.length - 1) { v /= 1024; i++ }
      return v.toFixed(1) + ' ' + units[i]
    },
    render() {
      if (!this.chart) return
      const xs = this.history.map(p => p.t)
      const ins = this.history.map(p => p.in)
      const outs = this.history.map(p => p.out)
      this.chart.setOption({
        tooltip: {
          trigger: 'axis',
          backgroundColor: 'rgba(2,6,13,0.85)',
          borderColor: 'rgba(0,230,255,0.4)',
          textStyle: { color: '#cfe8ff' },
          formatter: params => {
            const lines = params.map(p => `${p.marker} ${p.seriesName}: ${this.fmt(p.value)}`)
            return `${params[0].axisValue}<br/>${lines.join('<br/>')}`
          }
        },
        legend: {
          top: 0, right: 8,
          textStyle: { color: 'rgba(207,232,255,0.75)', fontSize: 12 },
          data: [this.$t('egress_in'), this.$t('egress_out')]
        },
        grid: {
          left: 12,
          right: 18,
          top: 30,
          bottom: 30,
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: xs,
          boundaryGap: false,
          axisLine: { lineStyle: { color: 'rgba(0,230,255,0.3)' } },
          axisLabel: { color: 'rgba(207,232,255,0.6)', fontSize: 11 }
        },
        yAxis: {
          type: 'value',
          axisLine: { lineStyle: { color: 'rgba(0,230,255,0.3)' } },
          splitLine: { lineStyle: { color: 'rgba(0,230,255,0.08)' } },
          axisLabel: {
            color: 'rgba(207,232,255,0.6)',
            fontSize: 11,
            margin: 12,
            formatter: v => this.fmt(v)
          }
        },
        series: [
          {
            name: this.$t('egress_in'),
            type: 'line',
            smooth: true,
            showSymbol: false,
            lineStyle: { color: '#00e6ff', width: 2 },
            itemStyle: { color: '#00e6ff' },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(0,230,255,0.55)' },
                { offset: 1, color: 'rgba(0,230,255,0.02)' }
              ])
            },
            data: ins
          },
          {
            name: this.$t('egress_out'),
            type: 'line',
            smooth: true,
            showSymbol: false,
            lineStyle: { color: '#ff9248', width: 2 },
            itemStyle: { color: '#ff9248' },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(255,146,72,0.5)' },
                { offset: 1, color: 'rgba(255,146,72,0.02)' }
              ])
            },
            data: outs
          }
        ]
      }, true)
    }
  }
}
</script>
