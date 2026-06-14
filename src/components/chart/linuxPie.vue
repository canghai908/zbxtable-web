<template>
  <div style="">
    <v-chart :forceFit="true" :height="height" :data="data" :scale="scale">
      <v-tooltip :showTitle="false" dataKey="item*percent" />
      <v-axis />
      <v-pie position="percent" color="item" :vStyle="pieStyle" :label="labelConfig" />
      <v-coord type="theta" />
    </v-chart>
  </div>
</template>

<script>
import { toPercentRows } from '@/utils/chartData'

const sourceData = [
  { item: 'ROOT', count: 37 },
  { item: 'C盘', count: 13 },
  { item: 'D盘', count: 49 },
  { item: 'E盘', count: 1 }
]

const scale = [{
  dataKey: 'percent',
  min: 0,
  formatter: '.0%'
}]

const data = toPercentRows(sourceData)
export default {
  name: 'LinuxPie',
  data () {
    return {
      data,
      scale,
      height: 385,
      pieStyle: {
        stroke: '#fff',
        lineWidth: 1
      },
      labelConfig: ['percent', {
        formatter: (val, item) => {
          return item.point.item + ': ' + val
        }
      }]
    }
  }
}
</script>

<style scoped>

</style>
