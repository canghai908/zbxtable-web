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
        { name: this.$t('severity_disaster'), value: buckets[5], itemStyle: { color: '#d9777d' } },
        { name: this.$t('severity_high'),     value: buckets[4], itemStyle: { color: '#de8065' } },
        { name: this.$t('severity_average'),  value: buckets[3], itemStyle: { color: '#d69a65' } },
        { name: this.$t('severity_warning'),  value: buckets[2], itemStyle: { color: '#d1b568' } },
        { name: this.$t('severity_info'),     value: buckets[1], itemStyle: { color: '#91a6d8' } }
      ]
      const total = items.reduce((a, b) => a + b.value, 0)
      this.chart.setOption({
        tooltip: { trigger: 'item', backgroundColor: '#1a222b', borderColor: 'rgba(215,221,228,0.18)', textStyle: { color: '#d7dde4' } },
        legend: {
          bottom: 4, left: 'center', itemWidth: 10, itemHeight: 10,
          textStyle: { color: '#b3bdc8', fontSize: 12 }
        },
        title: {
          text: String(total),
          subtext: 'Total',
          left: 'center',
          top: '38%',
          textStyle: { color: '#d7dde4', fontSize: 26, fontWeight: 500 },
          subtextStyle: { color: '#9ba5b1', fontSize: 11 }
        },
        series: [{
          type: 'pie',
          radius: ['52%', '70%'],
          center: ['50%', '46%'],
          itemStyle: {
            borderColor: '#151b22',
            borderWidth: 2
          },
          label: {
            color: '#d7dde4',
            fontSize: 11,
            formatter: '{b} {c}'
          },
          labelLine: { lineStyle: { color: 'rgba(215,221,228,0.32)' } },
          data: items
        }]
      }, true)
    }
  }
}
</script>
