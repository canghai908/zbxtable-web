<template>
  <div>
    <template v-if="parseError">
      <a-alert type="error" :message="parseError" show-icon />
      <a-popconfirm title="重建会清除当前无效条件，保存后生效。确定重建？" @confirm="rebuild">
        <a-button style="margin-top: 8px">重建条件</a-button>
      </a-popconfirm>
    </template>
    <template v-else>
      <a-alert v-if="allowEmpty && !tree.children.length" type="info" message="默认规则：无条件，作为回退规则使用" />
      <condition-group v-else :node="editableTree" :total="total" @change="update" />
      <p class="condition-hint">最多三级分组、50 条条件；使用原始字段值，等级如 High、Disaster</p>
      <div class="preview"><strong>条件预览：</strong><condition-summary :value="tree" /></div>
      <a-collapse @change="clearTest">
        <a-collapse-panel key="test" header="测试条件匹配（不会发送通知）">
          <a-alert type="info" message="仅测试当前条件，不包含实例范围、生效时间、启用状态和渠道限制。结果不代表实际发送或屏蔽。" show-icon style="margin-bottom: 12px" />
          <div v-for="field in fields" :key="field.value" class="sample-field">
            <label>{{ field.label }}</label><a-input v-model="sample[field.value]" @input="clearTest" />
          </div>
          <a-button type="primary" :loading="testing" :disabled="!tree.children.length" @click="test">测试条件匹配</a-button>
          <a-alert v-if="testError" type="error" :message="testError" style="margin-top: 12px" />
          <condition-trace v-if="result" :node="result" style="margin-top: 12px" />
        </a-collapse-panel>
      </a-collapse>
    </template>
  </div>
</template>
<script>
import ConditionGroup from './ConditionGroup.vue'
import ConditionSummary from './ConditionSummary.vue'
import ConditionTrace from './ConditionTrace.vue'
import { fields, normalizeConditions, newGroup, leafCount } from './model'
import { ruleTest } from '@/services/admin'
export default {
  components: { ConditionGroup, ConditionSummary, ConditionTrace },
  props: { value: { default: '' }, allowEmpty: { type: Boolean, default: false } },
  data: () => ({ fields, sample: { host: '', group: '', item: '', key: '', trigger: '', severity: '' }, testing: false, result: null, testError: '', sequence: 0 }),
  computed: {
    parsed() { try { return { tree: normalizeConditions(this.value) } } catch (e) { return { error: e.message } } },
    parseError() { return this.parsed.error },
    tree() { return this.parsed.tree },
    editableTree() { return this.tree.children.length ? this.tree : { version: 2, ...newGroup() } },
    total() { return this.tree ? leafCount(this.tree) : 0 },
  },
  watch: { value: { deep: true, handler() { this.clearTest() } } },
  methods: {
    rebuild() { this.update({ version: 2, ...newGroup() }) },
    update(tree) { this.clearTest(); this.$emit('input', { ...tree, version: 2 }) },
    clearTest() { this.sequence++; this.result = null; this.testError = '' },
    async test() {
      this.clearTest()
      const sequence = this.sequence
      this.testing = true
      try {
        const response = await ruleTest({ conditions: JSON.stringify(this.tree), data: { ...this.sample } })
        if (sequence !== this.sequence) return
        const body = response.data
        if (body.code !== 200) throw new Error(body.message || '测试失败')
        this.result = body.data
      } catch (e) { if (sequence === this.sequence) this.testError = e.message || '测试失败' }
      finally { this.testing = false }
    },
  },
}
</script>
<style scoped>
.preview { display:flex;flex-wrap:wrap;gap:4px 8px;align-items:baseline; margin: 8px 0; overflow-wrap: anywhere; }
.condition-hint { color: var(--ops-muted, rgba(0,0,0,.65)); margin: 8px 0; font-size: 12px; }
.sample-field { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
.sample-field label { width: 100px; flex-shrink: 0; }
@media (max-width: 620px) {
  .sample-field { flex-wrap: wrap; gap: 4px; }
  .sample-field label { width: 100%; }
}
</style>
