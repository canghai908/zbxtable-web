<template>
  <div class="screen-header">
    <div class="header-left">
      <span class="header-btn" @click="goBack"><a-icon type="arrow-left" />{{ $t('screen_back') }}</span>
    </div>
    <div class="header-title">
      <div class="title-main">{{ $t('screen_title') }}</div>
      <div class="title-sub">{{ $t('screen_subtitle') }}</div>
    </div>
    <div class="header-right">
      <span class="clock-date">{{ dateText }}</span>
      <span class="clock-time">{{ timeText }}</span>

      <!-- 刷新间隔设置 -->
      <div class="refresh-wrap">
        <a-icon type="sync" class="refresh-icon" :spin="spinning" />
        <select class="refresh-select" :value="interval" @change="onIntervalChange">
          <option v-for="opt in intervalOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
        </select>
      </div>

      <span class="header-btn" @click="toggleFullscreen">
        <a-icon :type="isFs ? 'fullscreen-exit' : 'fullscreen'" />
        {{ isFs ? $t('screen_exit_fullscreen') : $t('screen_fullscreen') }}
      </span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HeaderBar',
  i18n: require('../i18n'),
  props: {
    interval: { type: Number, default: 30 }
  },
  data() {
    return {
      now: new Date(),
      timer: null,
      isFs: false,
      spinning: false,
      spinTimer: null,
      intervalOptions: [
        { label: '10 秒', value: 10 },
        { label: '30 秒', value: 30 },
        { label: '1 分钟', value: 60 },
        { label: '5 分钟', value: 300 },
        { label: '10 分钟', value: 600 }
      ]
    }
  },
  computed: {
    dateText() {
      const d = this.now
      const week = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][d.getDay()]
      return `${d.getFullYear()}-${this.pad(d.getMonth() + 1)}-${this.pad(d.getDate())} ${week}`
    },
    timeText() {
      const d = this.now
      return `${this.pad(d.getHours())}:${this.pad(d.getMinutes())}:${this.pad(d.getSeconds())}`
    }
  },
  mounted() {
    this.timer = setInterval(() => { this.now = new Date() }, 1000)
    document.addEventListener('fullscreenchange', this.syncFs)
  },
  beforeDestroy() {
    if (this.timer) clearInterval(this.timer)
    if (this.spinTimer) clearTimeout(this.spinTimer)
    document.removeEventListener('fullscreenchange', this.syncFs)
  },
  methods: {
    pad(n) { return String(n).padStart(2, '0') },
    goBack() { this.$router.push('/dashboard/workplace') },
    syncFs() { this.isFs = !!document.fullscreenElement },
    toggleFullscreen() {
      const el = document.documentElement
      if (!document.fullscreenElement) {
        if (el.requestFullscreen) el.requestFullscreen()
      } else if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    },
    onIntervalChange(e) {
      const val = Number(e.target.value)
      this.$emit('interval-change', val)
      // 短暂旋转图标提示已更新
      this.spinning = true
      if (this.spinTimer) clearTimeout(this.spinTimer)
      this.spinTimer = setTimeout(() => { this.spinning = false }, 1200)
    }
  }
}
</script>
