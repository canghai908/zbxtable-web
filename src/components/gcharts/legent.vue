<template>
  <div class="legent" :style="{ height: height + 'px' }">
    <div
      v-for="i in 20"
      :key="i"
      class="block"
      :style="blockStyle(i - 1)"
    ></div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  props: {
    height: { type: Number, default: 14 },
    rate: { type: Number, default: 0 }
  },
  computed: {
    ...mapState('setting', ['theme']),
    themeColor() {
      return this.theme.color || '#1890ff'
    },
    lightColor() {
      // 与白色混合生成柔和浅色（混合 78% 白），避免对高亮度主题色（如青色）提亮后过曝刺眼
      return this.mixWithWhite(this.themeColor, 0.78)
    },
    clampedRate() {
      const n = Number(this.rate)
      if (Number.isNaN(n)) return 0
      return Math.max(0, Math.min(100, n))
    }
  },
  methods: {
    // 将颜色与白色按比例混合：ratio 越大越接近白色（越浅、越柔和）
    mixWithWhite(hex, ratio) {
      const num = parseInt(hex.slice(1), 16)
      const r0 = num >> 16
      const g0 = (num >> 8) & 0x00ff
      const b0 = num & 0x0000ff
      const r = Math.round(r0 + (255 - r0) * ratio)
      const g = Math.round(g0 + (255 - g0) * ratio)
      const b = Math.round(b0 + (255 - b0) * ratio)
      return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
    },
    isActive(index) {
      return this.clampedRate > index * 5
    },
    blockStyle(index) {
      const active = this.isActive(index)
      return {
        background: active ? this.themeColor : this.lightColor,
        height: this.height + 'px',
        width: '100%'
      }
    }
  }
}
</script>

<style scoped>
.legent {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 2px;
}

.block {
  flex: 1;
  border: 1px solid rgba(255, 255, 255, 0.7);
  box-sizing: border-box;
}
</style>
