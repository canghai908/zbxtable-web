import { shortText } from '../TableTextDetail/model'
export const auditActionLabels = {
  create: '创建排班', update: '修改排班', delete: '删除排班',
  override_create: '新增代班', override_delete: '撤销代班',
}
const fieldLabels = {
  name:'名称',timezone:'时区',rotation:'轮换方式',start:'轮换起点',members:'值班成员 / 顺序',
  weekdays:'覆盖星期',window_start:'覆盖开始时间',window_end:'覆盖结束时间',
  fallback_user_ids:'兜底用户',fallback_group_ids:'兜底用户组',enabled:'启用状态',
}
const metadata = ['id','created','updated','created_at','updated_at']
export function auditSummary(record) {
  let detail
  try { detail = typeof record.detail === 'string' ? JSON.parse(record.detail) : record.detail }
  catch (e) { return shortText(record.detail || '暂无详情') }
  if (!detail || typeof detail !== 'object') return shortText(record.detail || '暂无详情')
  if (record.action === 'update' && detail.before && detail.after) {
    const changed = [...new Set([...Object.keys(detail.before),...Object.keys(detail.after)])]
      .filter(key=>!metadata.includes(key) && JSON.stringify(detail.before[key]) !== JSON.stringify(detail.after[key]))
    if (!changed.length) return '保存排班，配置未发生变化'
    const labels = changed.slice(0,3).map(key=>fieldLabels[key] || key)
    return shortText(`修改${labels.join('、')}${changed.length>3 ? `等 ${changed.length} 项` : ''}`)
  }
  const subject = detail.after || detail
  if (String(record.action || '').startsWith('override_')) return shortText(`${auditActionLabels[record.action] || '代班变更'}：${subject.reason || '查看代班详情'}`)
  return shortText(`${auditActionLabels[record.action] || '排班变更'}${subject.name ? '：'+subject.name : ''}`)
}
