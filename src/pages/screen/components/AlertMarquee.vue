<template>
  <div class="alert-marquee">
    <!-- 固定表头：级别 | 时间 | 主机名 | 事件 -->
    <div class="alert-header">
      <span>级别</span>
      <span>时间</span>
      <span>主机名</span>
      <span>事件</span>
    </div>
    <!-- 滚动区 -->
    <div class="alert-track" v-if="list.length">
      <div class="alert-inner" :style="{ animationDuration: duration + 's' }">
        <div class="alert-row" v-for="(v, i) in doubled" :key="i">
          <span class="sev-tag" :class="'sev-' + sevKey(v)">{{ sevLabel(v) }}</span>
          <span class="col-time">{{ fmtTime(v.lastchange) }}</span>
          <span class="col-host" :title="v.name || ''">{{ v.name || '--' }}</span>
          <span class="col-evt"  :title="v.lasteventname || ''">{{ v.lasteventname || '--' }}</span>
        </div>
      </div>
    </div>
    <div class="alert-empty" v-else>{{ $t('alert_empty') }}</div>
  </div>
</template>

<script>
import { parseTimeFun } from '@/utils/formatter'

export default {
  name: 'AlertMarquee',
  i18n: require('../i18n'),
  props: {
    list: { type: Array, default: () => [] }
  },
  computed: {
    doubled() {
      return this.list.length > 0 ? [...this.list, ...this.list] : []
    },
    duration() {
      return Math.max(18, this.list.length * 2.5)
    }
  },
  methods: {
    sevKey(v) {
      const s = Number(v && v.severity)
      return [0, 1, 2, 3, 4, 5].includes(s) ? s : 0
    },
    sevLabel(v) {
      const map = {
        5: this.$t('severity_disaster'),
        4: this.$t('severity_high'),
        3: this.$t('severity_average'),
        2: this.$t('severity_warning'),
        1: this.$t('severity_info'),
        0: this.$t('severity_unknown')
      }
      return map[this.sevKey(v)]
    },
    fmtTime(t) {
      if (!t) return '--'
      return parseTimeFun(t)
    }
  }
}
</script>
