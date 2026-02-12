<template>
  <div v-if="showPage">
    <v-chart :forceFit="true" :height="height" :data="mock" :padding="[0, 0, 0, 0]" :scale="scale">
      <v-guide type="text" :position="['50%','50%']" :content="rate+'%'" :v-style="textStyle" />
      <v-pie position="percent" :color="['item',[themeColor, lightColor]]" />
      <v-coord type="theta" :radius="0.9" :innerRadius="0.75" />
    </v-chart>
  </div>
</template>

<script>
import { mapState } from 'vuex'
const DataSet = require('@antv/data-set');
export default {
  props: {
    name: { type: String, default: "" },
    color: { type: String, default: "" },
    height: { type: Number, default: 300 },
    rate: { type: Number, default: 0 }
  },
  data() {
    return {
      data: [],
      mock: [],
      named: "",
      showPage: false,
      scale: [{ dataKey: 'percent', min: 0, formatter: '.0%',}]
    };
  },
  computed: {
    ...mapState('setting', ['theme']),
    themeColor() {
      return this.color || this.theme.color || '#1890ff'
    },
    lightColor() {
      // 未使用部分用浅色
      return this.adjustColor(this.themeColor, 100)
    },
    textStyle() {
      return {
        fontSize: '12',
        fill: this.themeColor,
        textAlign: 'center',
        fontWeight: 'bold'
      }
    }
  },
  methods: {
    adjustColor(hex, amount) {
      const num = parseInt(hex.slice(1), 16)
      const r = Math.min(255, Math.max(0, (num >> 16) + amount))
      const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount))
      const b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount))
      return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
    }
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

