<template>
  <div class="condition-group">
    <div class="group-heading">
      <a-select :value="node.op" style="width: 160px" @change="changeOp">
        <a-select-option value="and">满足全部 AND</a-select-option>
        <a-select-option value="or">满足任意 OR</a-select-option>
      </a-select>
      <a-button v-if="depth > 1" :disabled="!removable" type="link" @click="$emit('remove')">删除条件组</a-button>
    </div>
    <div v-for="(child, index) in node.children" :key="index" class="child-condition">
      <div v-if="index" class="connector">{{ node.op === 'and' ? '且 AND' : '或 OR' }}</div>
      <condition-group v-if="child.children" :node="child" :depth="depth + 1" :total="total" :removable="node.children.length > 1" @change="replace(index, $event)" @remove="remove(index)" />
      <div v-else class="leaf-row">
        <a-select :value="child.field" aria-label="条件字段" class="condition-select" @change="patch(index, { field: $event })">
          <a-select-option v-for="field in fields" :key="field.value" :value="field.value">{{ field.label }}</a-select-option>
        </a-select>
        <a-select :value="child.operator" aria-label="条件操作符" class="condition-select" @change="patch(index, { operator: $event })">
          <a-select-option v-for="operator in operators" :key="operator.value" :value="operator.value">{{ operator.label }}</a-select-option>
        </a-select>
        <a-input :value="child.value" aria-label="条件值" placeholder="请输入匹配值" class="condition-value" @input="patch(index, { value: $event.target.value })" />
        <a-button type="link" :disabled="node.children.length <= 1" @click="remove(index)">删除</a-button>
      </div>
    </div>
    <div class="group-actions">
      <a-button size="small" :disabled="total >= 50" @click="append(false)">+ 添加条件</a-button>
      <a-button size="small" :disabled="depth >= 3 || total >= 50" @click="append(true)">+ 添加条件组</a-button>
    </div>
  </div>
</template>
<script>
import { fields, operators, newGroup, newCondition } from './model'
export default {
  name: 'ConditionGroup',
  props: { node: { type: Object, required: true }, depth: { type: Number, default: 1 }, total: { type: Number, default: 0 }, removable: { type: Boolean, default: true } },
  data: () => ({ fields, operators }),
  methods: {
    changeOp(op) { this.$emit('change', { ...this.node, op }) },
    replace(index, child) {
      const children = this.node.children.slice()
      children.splice(index, 1, child)
      this.$emit('change', { ...this.node, children })
    },
    patch(index, patch) { this.replace(index, { ...this.node.children[index], ...patch }) },
    remove(index) {
      if (this.node.children.length <= 1) return
      const children = this.node.children.filter((child, i) => i !== index)
      this.$emit('change', { ...this.node, children })
    },
    append(group) { this.$emit('change', { ...this.node, children: [...this.node.children, group ? newGroup() : newCondition()] }) },
  },
}
</script>
<style scoped>
.condition-group { border-left: 2px solid var(--ops-accent, #91caff); padding: 8px 12px; background: rgba(128,128,128,.04); min-width: 0; }
.group-heading, .leaf-row, .group-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
.child-condition { margin-top: 8px; min-width: 0; }
.connector { font-size: 12px; color: var(--ops-muted, rgba(0,0,0,.65)); margin-bottom: 4px; }
.condition-select { width: 128px; flex-shrink: 0; }
.condition-value { flex: 1 1 160px; min-width: 0; }
.group-actions { margin-top: 8px; }
@media (max-width: 620px) {
  .condition-group { padding: 8px; }
  .leaf-row { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); }
  .condition-select { width: 100%; min-width: 0; }
  .condition-value { grid-column: 1 / -1; width: 100%; }
  .leaf-row > .ant-btn { justify-self: end; grid-column: 2; }
}
</style>
