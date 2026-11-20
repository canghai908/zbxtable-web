export const fields = [
  { value: 'host', label: '主机名称' }, { value: 'group', label: '主机组' },
  { value: 'item', label: '监控项' }, { value: 'key', label: '监控项 Key' },
  { value: 'trigger', label: '告警内容' }, { value: 'severity', label: '告警等级' },
]
export const operators = [
  { value: '=', label: '等于' }, { value: '!=', label: '不等于' },
  { value: 'like', label: '包含' }, { value: 'not_contains', label: '不包含' },
  { value: '=~', label: '匹配正则' }, { value: '!~', label: '不匹配正则' },
]
export const newCondition = () => ({ field: 'host', operator: '=', value: '' })
export const newGroup = () => ({ op: 'and', children: [newCondition()] })
export function normalizeConditions(value) {
  const parsed = typeof value === 'string' ? (value.trim() ? JSON.parse(value) : []) : value
  if (!parsed || Array.isArray(parsed)) {
    const tree = {
      version: 2, op: 'and', children: (parsed || []).map(c => ({
        field: c.r_type, operator: c.r_func === '==' ? '=' : c.r_func, value: c.r_value,
      })),
    }
    if (tree.children.length) validateNode(tree)
    return tree
  }
  if (parsed.version !== 2 || !['and', 'or'].includes(parsed.op) || !Array.isArray(parsed.children)) {
    throw new Error('条件格式无效，请修正规则后保存')
  }
  validateNode(parsed)
  return JSON.parse(JSON.stringify(parsed))
}
function validateNode(node, depth = 1) {
  if (!node || typeof node !== 'object') throw new Error('条件格式无效')
  if (Object.prototype.hasOwnProperty.call(node, 'children')) {
    if (!['and', 'or'].includes(node.op) || !Array.isArray(node.children) || depth > 3) throw new Error('条件组无效或超过三级')
    if (!node.children.length) throw new Error('条件组不能为空')
    if (leafCount(node) > 50) throw new Error('最多支持 50 个条件')
    node.children.forEach(child => validateNode(child, depth + (child && child.children ? 1 : 0)))
  } else if (!fields.some(field => field.value === node.field) || !operators.some(operator => operator.value === node.operator) || typeof node.value !== 'string') {
    throw new Error('条件包含未知字段、操作符或值')
  }
}
export function leafLabel(node) {
  const field = fields.find(f => f.value === node.field)
  const operator = operators.find(o => o.value === node.operator)
  return `${field ? field.label : node.field} ${operator ? operator.label : node.operator} “${node.value == null ? '' : node.value}”`
}
export function conditionSummary(node) {
  if (!node.children) return leafLabel(node)
  return '(' + node.children.map(conditionSummary).join(node.op === 'and' ? ' 且 ' : ' 或 ') + ')'
}
export function leafCount(node) {
  return node.children ? node.children.reduce((sum, child) => sum + leafCount(child), 0) : 1
}
