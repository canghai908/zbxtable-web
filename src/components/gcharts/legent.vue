<template>
  <v-chart v-if="showPage" :data="mock" :forceFit="true" :height="height" :padding="padding" :scale="scale">
    <v-polygon position="name*inx" :color="color" :vStyle="style"></v-polygon>
  </v-chart>
</template>

<script>
export default {
  props: {
    height: { type: Number, default: 14 },
    rate: { type: Number, default: 0 }
  },
  data() {
    return {
      mock: [],
      scale: [],
      padding:[0,0,0,0],
      color:['sales', '#E2E7EE-#38BA24'],
      label:['sales',{offset: -2,textStyle: {fill: '#fff', shadowBlur: 2, shadowColor: 'rgba(0, 0, 0, .45)'}}],
      style:{ lineWidth: 2, stroke: '#fff'},
      showPage: false
    };
  },
  created () {
    if((this.rate && this.rate > 0) || this.rate == 0) {
      let source = [];
      for(let i=0; i<20; i++) {
        let count = 0;
        if(this.rate >= 0 && this.rate > i*5) {
          if(this.rate < 100 && i==19) {count = 0} else {count = 100;}
        }
        source.push({name: i, inx: 0, sales: count});
      }
      this.mock = source;
      const ys = "ABCDEFGHIJKLMNOPQRST";
      this.scale = [
        {dataKey: 'name', type: 'cat', values: ys.split('')},
        {dataKey: 'inx', type: 'cat', values: ["Y"]}
      ];
      this.showPage = true;
    }
  }
};
</script>
