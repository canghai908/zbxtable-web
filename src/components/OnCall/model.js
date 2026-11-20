export const rotationLabels = { fixed: '固定人员', daily: '按天轮换', weekly: '按周轮换' }
export const sourceLabels = { rotation: '轮班', override: '临时代班', gap: '空班', disabled: '已禁用', fallback: '空班兜底', uncovered: '无可用接收人', snapshot: '沿用事件快照', error: '排班读取失败' }
export const weekdays = [
  { value: 1, label: '周一' }, { value: 2, label: '周二' }, { value: 3, label: '周三' },
  { value: 4, label: '周四' }, { value: 5, label: '周五' }, { value: 6, label: '周六' }, { value: 0, label: '周日' },
]
export function ids(value) {
  const list = Array.isArray(value) ? value : String(value || '').split(',')
  return [...new Set(list.map(Number).filter(id => Number.isSafeInteger(id) && id > 0))]
}
export function moveMember(members, index, offset) {
  const next = members.slice(), target = index + offset
  if (index < 0 || target < 0 || target >= next.length) return next
  const item = next.splice(index, 1)[0]
  next.splice(target, 0, item)
  return next
}
export function formatInZone(value, timezone = 'Asia/Shanghai') {
  if (!value) return '—'
  try { return new Intl.DateTimeFormat('zh-CN', { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date(value)) }
  catch (e) { return String(value) }
}
export function rulePayload(rule) {
  const result = { ...rule }
  ;['z_ids', 's_week', 'channel', 'user_ids', 'group_ids'].forEach(key => {
    result[key] = Array.isArray(rule[key]) ? rule[key].join(',') : (rule[key] || '')
  })
  result.schedule_ids = ids(rule.schedule_ids)
  result.conditions = typeof rule.conditions === 'string' ? rule.conditions : JSON.stringify(rule.conditions)
  result.s_time = rule.s_time && typeof rule.s_time.format === 'function' ? rule.s_time.format('HH:mm') : (rule.s_time || '00:00')
  result.e_time = rule.e_time && typeof rule.e_time.format === 'function' ? rule.e_time.format('HH:mm') : (rule.e_time || '23:59')
  result.status = typeof rule.status === 'boolean' ? (rule.status ? '0' : '1') : String(rule.status)
  return result
}
