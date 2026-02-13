<template>
  <div class="legent-chart-wrapper" :style="{height: height + 'px'}">
    <v-chart v-if="showPage" :key="rate" :data="mock" :forceFit="true" :height="height" :padding="padding" :scale="scale">
      <v-polygon position="name*inx" :color="color" :vStyle="style"></v-polygon>
    </v-chart>
  </div>
</template>

<script>
import { mapState } from 'vuex'
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
      label:['sales',{offset: -2,textStyle: {fill: '#fff', shadowBlur: 2, shadowColor: 'rgba(0, 0, 0, .45)'}}],
      style:{ lineWidth: 2, stroke: '#fff'},
      showPage: false
    };
  },
  computed: {
    ...mapState('setting', ['theme']),
    color() {
      const themeColor = this.theme.color || '#1890ff'
      // 未使用部分用调整后的主题色（亮度+80），已使用部分用主题色
      const lightColor = this.adjustColor(themeColor, 80)
      return ['sales', `${lightColor}-${themeColor}`]
    }
  },
  methods: {
    init() {
      if ((this.rate && this.rate > 0) || this.rate == 0) {
        let source = [];
        for (let i = 0; i < 20; i++) {
          let count = 0;
          if (this.rate >= 0 && this.rate > i * 5) {
            if (this.rate < 100 && i == 19) {
              count = 0;
            } else {
              count = 100;
            }
          }
          source.push({ name: i, inx: 0, sales: count });
        }
        this.mock = source;
        const ys = "ABCDEFGHIJKLMNOPQRST";
        this.scale = [
          { dataKey: 'name', type: 'cat', values: ys.split('') },
          { dataKey: 'inx', type: 'cat', values: ["Y"] }
        ];
        this.showPage = true;
      }
    },
    hexToRgba(hex, alpha = 1) {
      const r = parseInt(hex.slice(1, 3), 16)
      const g = parseInt(hex.slice(3, 5), 16)
      const b = parseInt(hex.slice(5, 7), 16)
      return `rgba(${r}, ${g}, ${b}, ${alpha})`
    },
    adjustColor(hex, amount) {
      // 调整颜色亮度
      const num = parseInt(hex.slice(1), 16)
      const r = Math.min(255, Math.max(0, (num >> 16) + amount))
      const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount))
      const b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount))
      return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
    }
  },
  watch: {
    rate: {
      immediate: true,
      handler() {
        this.init()
      }
    }
  },
  created () {
    this.init()
  }
};
</script>

<style scoped>
.legent-chart-wrapper {
  width: 100%;
  display: block;
}
</style>
