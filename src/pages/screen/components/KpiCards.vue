<template>
  <div class="kpi-row">
    <div class="kpi-card">
      <a-icon class="kpi-icon" type="cluster" />
      <div class="kpi-label">{{ $t('kpi_host_total') }}</div>
      <div>
        <span class="kpi-value">{{ animated.total }}</span>
        <span class="kpi-unit">{{ $t('kpi_unit_count') }}</span>
      </div>
    </div>
    <div class="kpi-card">
      <a-icon class="kpi-icon" type="check-circle" />
      <div class="kpi-label">{{ $t('kpi_host_online') }}</div>
      <div>
        <span class="kpi-value">{{ animated.online }}</span>
        <span class="kpi-unit">{{ $t('kpi_unit_percent') }}</span>
      </div>
    </div>
    <div class="kpi-card">
      <a-icon class="kpi-icon" type="alert" />
      <div class="kpi-label">{{ $t('kpi_alarm_total') }}</div>
      <div>
        <span class="kpi-value">{{ animated.alarms }}</span>
      </div>
    </div>
    <div class="kpi-card kpi-warn">
      <a-icon class="kpi-icon" type="fire" />
      <div class="kpi-label">{{ $t('kpi_alarm_critical') }}</div>
      <div>
        <span class="kpi-value">{{ animated.critical }}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'KpiCards',
  i18n: require('../i18n'),
  props: {
    total: { type: Number, default: 0 },
    online: { type: Number, default: 0 },
    alarms: { type: Number, default: 0 },
    critical: { type: Number, default: 0 }
  },
  data() {
    return {
      animated: { total: 0, online: 0, alarms: 0, critical: 0 },
      raf: null
    }
  },
  watch: {
    total() { this.animate() },
    online() { this.animate() },
    alarms() { this.animate() },
    critical() { this.animate() }
  },
  mounted() {
    this.animate()
  },
  beforeDestroy() {
    if (this.raf) cancelAnimationFrame(this.raf)
  },
  methods: {
    animate() {
      const target = { total: this.total, online: this.online, alarms: this.alarms, critical: this.critical }
      const start = { ...this.animated }
      const duration = 800
      const t0 = performance.now()
      const tick = (now) => {
        const p = Math.min(1, (now - t0) / duration)
        const ease = 1 - Math.pow(1 - p, 3)
        this.animated = {
          total: Math.round(start.total + (target.total - start.total) * ease),
          online: Math.round((start.online + (target.online - start.online) * ease) * 10) / 10,
          alarms: Math.round(start.alarms + (target.alarms - start.alarms) * ease),
          critical: Math.round(start.critical + (target.critical - start.critical) * ease)
        }
        if (p < 1) this.raf = requestAnimationFrame(tick)
      }
      if (this.raf) cancelAnimationFrame(this.raf)
      this.raf = requestAnimationFrame(tick)
    }
  }
}
</script>
