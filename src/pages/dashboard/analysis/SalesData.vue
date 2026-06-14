<template>
  <div style="">
    <v-chart :forceFit="true" :height="height" :data="data" :scale="scale">
      <v-tooltip :showTitle="false" dataKey="item*percent" />
      <v-axis />
      <v-legend dataKey="item" position="right" :offsetX="-140"/>
      <v-pie position="percent" color="item" :vStyle="pieStyle" :label="labelConfig" />
      <v-coord type="theta" :radius="0.75" :innerRadius="0.6" />
    </v-chart>
  </div>
</template>

<script>
import { toPercentRows } from '@/utils/chartData'

const sourceData = [
  { item: '事例一', count: 40 },
  { item: '事例二', count: 21 },
  { item: '事例三', count: 17 },
  { item: '事例四', count: 13 },
  { item: '事例五', count: 9 }
]

const scale = [{
  dataKey: 'percent',
  min: 0,
  formatter: '.0%'
}]

const data = toPercentRows(sourceData)
export default {
  name: 'SalesData',
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
