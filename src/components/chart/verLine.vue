<template>
  <div v-if="datas.length">
    <v-chart :forceFit="true"  height="340" :data="datas" :scale="scale" :padding="padding">
      <v-tooltip></v-tooltip>
      <v-interval position="hostname*score" opacity="1" :label="barLabel" :size="20"></v-interval>
      <v-axis dataKey="hostname"></v-axis>
      <v-coord type="rect" direction="LB"></v-coord>
      <v-axis dataKey="score"></v-axis>
    </v-chart>
  </div>
</template>

<script>
export default {
  props: ["mock"],
  data() {
    return {
      datas: [],
      sortType: 'negative',
      padding: [20, 20, 50, 150],
      scale: [{ dataKey: 'score', min: 0, max: 100, alias: '单位: %', formatter:function(v){return v+'%'}}],
      barLabel: ['score', { textStyle: { fill: '#8d8d8d' },  offset: 10 }],
    }
  },
  created () {
    this.datas = this.mock
  }
};
</script>

