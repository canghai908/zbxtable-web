<template>
  <div>
    <v-chart :forceFit="true" :height="height" :padding="padding" :data="datas" :scale="scale">
      <v-tooltip />
      <v-axis />
      <v-legend />
      <v-line position="clock*value" :size="2" adjust="stack" />
      <v-stack-area position="clock*value" />
    </v-chart>
  </div>
</template>

<script>
  import {parseTimeFun} from '@/utils/formatter'
  export default {
    props: ["mock"],
    data() {
      return {
        datas: [],
        scale: [
          { dataKey: "clock", tickCount: 6, formatter: function (val){return parseTimeFun(val*1000);}}
        ],
        padding: [20, 80, 50, 80],
        height: 400,
      };
    },
    created () {
      this.datas = this.mock;
    }
  };
</script>