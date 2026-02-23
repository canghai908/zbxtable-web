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
      return this.adjustColor(this.themeColor, 80)
    },
    clampedRate() {
      const n = Number(this.rate)
      if (Number.isNaN(n)) return 0
      return Math.max(0, Math.min(100, n))
    }
  },
  methods: {
    adjustColor(hex, amount) {
      const num = parseInt(hex.slice(1), 16)
      const r = Math.min(255, Math.max(0, (num >> 16) + amount))
      const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amount))
      const b = Math.min(255, Math.max(0, (num & 0x0000ff) + amount))
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
