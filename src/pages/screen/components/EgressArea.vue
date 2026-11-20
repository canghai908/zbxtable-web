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
          backgroundColor: '#1a222b',
          borderColor: 'rgba(215,221,228,0.18)',
          textStyle: { color: '#d7dde4' },
          formatter: params => {
            const lines = params.map(p => `${p.marker} ${p.seriesName}: ${this.fmt(p.value)}`)
            return `${params[0].axisValue}<br/>${lines.join('<br/>')}`
          }
        },
        legend: {
          top: 0, right: 8,
          textStyle: { color: '#b3bdc8', fontSize: 12 },
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
          axisLine: { lineStyle: { color: 'rgba(215,221,228,0.18)' } },
          axisLabel: { color: '#9ba5b1', fontSize: 11 }
        },
        yAxis: {
          type: 'value',
          axisLine: { lineStyle: { color: 'rgba(215,221,228,0.18)' } },
          splitLine: { lineStyle: { color: 'rgba(215,221,228,0.08)' } },
          axisLabel: {
            color: '#9ba5b1',
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
            lineStyle: { color: '#70bfd0', width: 2 },
            itemStyle: { color: '#70bfd0' },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(112,191,208,0.28)' },
                { offset: 1, color: 'rgba(112,191,208,0.02)' }
              ])
            },
            data: ins
          },
          {
            name: this.$t('egress_out'),
            type: 'line',
            smooth: true,
            showSymbol: false,
            lineStyle: { color: '#d69a65', width: 2 },
            itemStyle: { color: '#d69a65' },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(214,154,101,0.24)' },
                { offset: 1, color: 'rgba(214,154,101,0.02)' }
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
