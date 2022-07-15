<template>
  <div v-if="showPage">
    <v-chart :forceFit="true" :height="height" :data="mock" :padding="[0, 0, 0, 0]" :scale="scale">
      <v-guide type="text" :position="['50%','50%']" :content="rate+'%'" :v-style="{ fontSize: '12', fill: '#262626', textAlign: 'center'}" />
      <v-pie position="percent" :color="['item',[color,'#5D7092']]" />
      <v-coord type="theta" :radius="0.9" :innerRadius="0.75" />
    </v-chart>
  </div>
</template>

<script>
const DataSet = require('@antv/data-set');
export default {
  props: {
    name: { type: String, default: "" },
    color: { type: String, default: "#0a9afe" },
    height: { type: Number, default: 300 },
    rate: { type: Number, default: 0 }
  },
  data() {
    return {
      data: [],
      named: "",
      showPage: false,
      scale: [{ dataKey: 'percent', min: 0, formatter: '.0%',}]
    };
  },
  created () {
    if((this.rate && this.rate > 0) || this.rate == 0) {
      let source = [{ item: this.name, count: this.rate }, {item: "其他", count: 100 - this.rate}];
      const dv = new DataSet.View().source(source);
      dv.transform({ type: 'percent', field: 'count', dimension: 'item', as: 'percent' });
      const data = dv.rows;
      this.mock = data;
      const count = 12;
      this.named = this.name.length > count ? (this.name.substring(0, count)+"...") : this.name;
      this.showPage = true;
    }
  }
};
</script>

