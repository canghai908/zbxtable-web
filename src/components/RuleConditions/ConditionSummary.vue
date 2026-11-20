<template>
  <div class="condition-summary">
    <a-tag v-if="error" color="red">配置异常：{{ error }}</a-tag>
    <span v-else-if="!tree.children.length">{{ emptyLabel }}</span>
    <template v-else>
      <div class="summary-text" :class="{ collapsed: !expanded }">{{ summary }}</div>
      <a-button v-if="summary.length > 90" type="link" size="small" @click="expanded = !expanded">{{ expanded ? '收起条件' : '展开全部条件' }}</a-button>
    </template>
  </div>
</template>
<script>
import { normalizeConditions, conditionSummary } from './model'
export default {
  props: { value: { default: '' }, emptyLabel: { type: String, default: '未配置条件' } },
  data: () => ({ expanded: false }),
  computed: {
    parsed() { try { return { tree: normalizeConditions(this.value), error: '' } } catch (e) { return { tree: null, error: e.message } } },
    tree() { return this.parsed.tree },
    error() { return this.parsed.error },
    summary() { return this.tree ? conditionSummary(this.tree) : '' },
  },
}
</script>
<style scoped>
.condition-summary { max-width: 520px; min-width: 190px; }
.summary-text { white-space: pre-wrap; overflow-wrap: anywhere; line-height: 1.8; }
.collapsed { max-height: 5.4em; overflow: hidden; }
</style>
