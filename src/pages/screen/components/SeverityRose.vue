<template>
  <div ref="chart" style="width:100%;height:100%;" />
</template>

<script>
import echarts from 'echarts'

export default {
  name: 'SeverityRose',
  i18n: require('../i18n'),
  props: {
    triggers: { type: Array, default: () => [] }
  },
  data() {
    return { chart: null, ro: null }
  },
  watch: {
    triggers() { this.render() }
  },
  mounted() {
    this.chart = echarts.init(this.$refs.chart)
    this.render()
    this.ro = new ResizeObserver(() => this.chart && this.chart.resize())
    this.ro.observe(this.$refs.chart)
  },
  beforeDestroy() {
    if (this.ro) this.ro.disconnect()
    if (this.chart) { this.chart.dispose(); this.chart = null }
  },
  methods: {
    render() {
      if (!this.chart) return
      const buckets = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
      ;(this.triggers || []).forEach(t => {
        const s = Number(t && t.severity)
        if (buckets[s] !== undefined) buckets[s] += 1
      })
      const items = [
        { name: this.$t('severity_disaster'), value: buckets[5], itemStyle: { color: '#ff4d6d' } },
        { name: this.$t('severity_high'),     value: buckets[4], itemStyle: { color: '#ff6347' } },
        { name: this.$t('severity_average'),  value: buckets[3], itemStyle: { color: '#ff9248' } },
        { name: this.$t('severity_warning'),  value: buckets[2], itemStyle: { color: '#ffc859' } },
        { name: this.$t('severity_info'),     value: buckets[1], itemStyle: { color: '#7499ff' } }
      ]
      const total = items.reduce((a, b) => a + b.value, 0)
      this.chart.setOption({
        tooltip: { trigger: 'item', backgroundColor: 'rgba(2,6,13,0.85)', borderColor: 'rgba(0,230,255,0.4)', textStyle: { color: '#cfe8ff' } },
        legend: {
          bottom: 4, left: 'center', itemWidth: 10, itemHeight: 10,
          textStyle: { color: 'rgba(207,232,255,0.75)', fontSize: 12 }
        },
        title: {
          text: String(total),
          subtext: 'TOTAL',
          left: 'center',
          top: '38%',
          textStyle: { color: '#00e6ff', fontSize: 26, fontWeight: 700 },
          subtextStyle: { color: 'rgba(207,232,255,0.55)', fontSize: 11, letterSpacing: 2 }
        },
        series: [{
          type: 'pie',
          radius: ['52%', '70%'],
          center: ['50%', '46%'],
          roseType: 'area',
          itemStyle: {
            borderColor: 'rgba(2,6,13,0.85)',
            borderWidth: 2,
            shadowBlur: 14,
            shadowColor: 'rgba(255,77,109,0.4)'
          },
          label: {
            color: '#cfe8ff',
            fontSize: 11,
            formatter: '{b} {c}'
          },
          labelLine: { lineStyle: { color: 'rgba(255,77,109,0.4)' } },
          data: items
        }]
      }, true)
    }
  }
}
</script>
