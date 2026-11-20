<template>
  <div ref="chart" style="width:100%;height:100%;" />
</template>

<script>
import echarts from 'echarts'

export default {
  name: 'HostTypePie',
  i18n: require('../i18n'),
  props: {
    data: { type: Object, default: () => ({}) }
  },
  data() {
    return { chart: null, ro: null }
  },
  watch: {
    data: {
      deep: true,
      handler() { this.render() }
    }
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
    getPrimaryName(name) {
      if (!name) return ''
      return String(name).replace(/\s*[（(][^（）()]*[）)]\s*$/u, '').trim()
    },
    render() {
      if (!this.chart) return
      const d = this.data || {}
      const palette = ['#70bfd0', '#8197c4', '#a391bd', '#c89a6d', '#82a889', '#c9b46c', '#c77f89', '#8b9aa8']
      const dynamicItems = Array.isArray(d.asset_type_counts) ? d.asset_type_counts : []
      const items = dynamicItems.length
        ? dynamicItems.map((item, index) => ({
          name: this.getPrimaryName(item.name || item.type_code),
          value: item.count || 0,
          itemStyle: { color: palette[index % palette.length] }
        }))
        : [
          { name: this.$t('host_type_lin'), value: d.lin_count || 0, itemStyle: { color: palette[0] } },
          { name: this.$t('host_type_win'), value: d.win_count || 0, itemStyle: { color: palette[1] } },
          { name: this.$t('host_type_srv'), value: d.srv_count || 0, itemStyle: { color: palette[2] } },
          { name: this.$t('host_type_net'), value: d.net_count || 0, itemStyle: { color: palette[3] } }
        ]
      this.chart.setOption({
        tooltip: { trigger: 'item', backgroundColor: '#1a222b', borderColor: 'rgba(215,221,228,0.18)', textStyle: { color: '#d7dde4' } },
        legend: {
          bottom: 4, left: 'center', itemWidth: 10, itemHeight: 10,
          textStyle: { color: '#b3bdc8', fontSize: 12 }
        },
        series: [{
          type: 'pie',
          radius: ['38%', '62%'],
          center: ['50%', '46%'],
          avoidLabelOverlap: true,
          itemStyle: {
            borderColor: '#151b22',
            borderWidth: 2
          },
          label: {
            color: '#d7dde4',
            fontSize: 11,
            formatter: '{b}\n{c}'
          },
          labelLine: { lineStyle: { color: 'rgba(215,221,228,0.32)' } },
          data: items
        }]
      }, true)
    }
  }
}
</script>
