<template>
  <div>
    <v-chart :forceFit="true" height="300" :data="data" :scale="scale" :padding="40">
      <v-axis />
      <v-pie position="percent" color="item" :v-style="pieStyle" :label="labelConfig" />
      <v-coord type="theta" />
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
  ];

  const scale = [{
    dataKey: 'percent',
    min: 0,
    formatter: '.0%',
  }];

  const data = toPercentRows(sourceData);

  export default {
    data() {
      return {
        data,
        scale,
        height: 400,
        pieStyle: {
          stroke: "#fff",
          lineWidth: 1
        },
        labelConfig: ['percent', {
          formatter: (val, item) => {
            return item.point.item + ': ' + val;
          }
        }],
      };
    }
  };
</script>
