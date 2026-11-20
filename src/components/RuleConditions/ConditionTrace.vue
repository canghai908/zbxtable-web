<template>
  <div class="trace-node">
    <a-tag :color="node.matched ? 'green' : 'red'">{{ node.matched ? '命中' : '未命中' }}</a-tag>
    <span>{{ node.children ? (node.op === 'and' ? '全部满足 AND' : '任意满足 OR') : label }}</span>
    <span v-if="!node.children" class="actual">实际值：{{ node.actual }}</span>
    <condition-trace v-for="(child, index) in node.children || []" :key="index" :node="child" />
  </div>
</template>
<script>
import { leafLabel } from './model'
export default { name: 'ConditionTrace', props: { node: { type: Object, required: true } }, computed: { label() { return leafLabel(this.node) } } }
</script>
<style scoped>
.trace-node { padding: 6px 0 6px 12px; border-left: 2px solid #ddd; overflow-wrap: anywhere; }
.actual { margin-left: 8px; color: #666; }
</style>
