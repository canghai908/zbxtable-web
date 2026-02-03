import { mapState } from 'vuex'

export default {
  computed: {
    ...mapState('setting', ['theme']),
    cardHeadStyle() {
      // 使用主题颜色的浅色版本作为卡片标题背景
      return {
        background: this.hexToRgba(this.theme.color || '#1890ff', 0.08),
        color: this.theme.color || '#1890ff',
        fontWeight: 600
      }
    },
    themeColor() {
      return this.theme.color || '#1890ff'
    }
  },
  methods: {
    hexToRgba(hex, alpha = 1) {
      if (!hex) return `rgba(24, 144, 255, ${alpha})`
      const r = parseInt(hex.slice(1, 3), 16)
      const g = parseInt(hex.slice(3, 5), 16)
      const b = parseInt(hex.slice(5, 7), 16)
      return `rgba(${r}, ${g}, ${b}, ${alpha})`
    }
  }
}
