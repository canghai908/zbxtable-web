<template>
  <div class="top-list">
    <div class="top-row" v-for="(v, i) in visibleRows" :key="v.hostid || v.hostname || i">
      <div class="rank" :class="'rank-' + (i + 1)">{{ i + 1 }}</div>
      <div class="name" :title="(v && v.hostname) || ''">{{ (v && v.hostname) || '—' }}</div>
      <div class="bar-wrap" :class="{ 'bar-warn': pct(v) >= 80 }">
        <div class="bar-fill" :style="{ width: pct(v) + '%' }" />
      </div>
      <div class="val" :class="{ 'val-warn': pct(v) >= 80 }">{{ v ? pct(v) + '%' : '—' }}</div>
    </div>
    <div v-if="!visibleRows.length" class="top-empty">{{ $t('resource_empty') }}</div>
  </div>
</template>

<script>
export default {
  name: 'ResourceTopBar',
  i18n: require('../i18n'),
  props: {
    rows: { type: Array, default: () => [] },
    metric: { type: String, default: 'cpu' }, // 'cpu' | 'mem'
    slots: { type: Number, default: 10 }
  },
  computed: {
    visibleRows() {
      return (this.rows || []).slice(0, this.slots)
    }
  },
  methods: {
    pct(v) {
      if (!v) return 0
      const n = Number(v[this.metric] || 0)
      return Math.max(0, Math.min(100, Math.round(n)))
    }
  }
}
</script>
