<template>
  <div>
    <v-chart :forceFit="true" :height="height" :padding="padding" :data="datas" :scale="scale">
      <v-tooltip />
      <v-axis />
      <v-bar position="hostname*score" :label="barLabel" :size="20" />
    </v-chart>
  </div>
</template>

<script>
  export default {
    props: ["mock"],
    data() {
      return {
        datas: [],
        scale: [
          { dataKey: "score", tickCount: 8, min: 0, max: 100, formatter:function(v){return v+'%'}}
        ],
        padding: [20, 120, 50, 50],
        barLabel: ['score', { textStyle: { fill: '#8d8d8d' },  offset: 10 }],
        height: 340,
      };
    },
    created () {
      this.datas = this.mock;
    }
  };
</script>