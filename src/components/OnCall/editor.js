import { dateKey, clockLabel } from './calendar'
import { ids } from './model'

function wallTime(value, timezone) {
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
  })
  const parts = formatter.formatToParts(new Date(value))
  const n = type => parts.find(part => part.type === type).value
  return `${n('year')}-${n('month')}-${n('day')}T${n('hour')}:${n('minute')}:${n('second')}`
}

// Interpret editor fields in the chosen schedule timezone, never in the device
// timezone. Reject DST gaps/folds rather than silently moving the handoff.
export function scheduleStart(date, clock, timezone) {
  const civil = `${date}T${clock}`
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(civil)) throw new Error('请选择首次日期和有效交接时间')
  const target = Date.parse(`${civil}Z`)
  if (!Number.isFinite(target) || new Date(target).toISOString().slice(0,19) !== civil) throw new Error('日期或交接时间无效')
  const offsets = new Set()
  try {
    for (const hours of [-36,-24,-12,0,12,24,36]) {
      const instant = target + hours * 3600000
      offsets.add(Date.parse(`${wallTime(instant,timezone)}Z`) - instant)
    }
  } catch (e) { throw new Error('请选择有效的排班时区') }
  const candidates = [...offsets].map(offset => target - offset).filter(instant => wallTime(instant,timezone) === civil)
  if (!candidates.length) throw new Error('所选时区该交接时间不存在（夏令时跳时），请选择其他时间')
  if (candidates.length > 1) throw new Error('所选时区该交接时间出现两次（夏令时回拨），请选择其他时间')
  return new Date(candidates[0]).toISOString()
}

export function createScheduleForm(record, now = new Date()) {
  const timezone = record ? record.timezone : 'Asia/Shanghai'
  let startDate = '', handoff = ''
  try {
    startDate = dateKey(record ? record.start : now, timezone)
    handoff = record ? clockLabel(record.start, timezone, true) : '00:00:00'
  } catch (e) { /* Keep malformed stored dates editable, with validation on save. */ }
  return {
    ...(record || {name:'',rotation:'daily',enabled:true}), timezone,
    members: ids(record && record.members),
    weekdays: record ? (record.weekdays || []).slice() : [0,1,2,3,4,5,6],
    fallback_user_ids: ids(record && record.fallback_user_ids),
    fallback_group_ids: ids(record && record.fallback_group_ids),
    window_start: record ? record.window_start : '00:00',
    window_end: record ? record.window_end : '00:00',
    all_day: record ? record.window_start === record.window_end : true,
    start_date: startDate, handoff_time: handoff,
    _anchor: record ? {start:record.start,timezone,start_date:startDate,handoff_time:handoff} : null,
  }
}

export function buildSchedulePayload(form) {
  const anchor = form._anchor
  const unchanged = anchor && anchor.timezone === form.timezone && anchor.start_date === form.start_date && anchor.handoff_time === form.handoff_time
  // Validate edited civil fields even when preserving the exact legacy instant.
  if (!form.start_date || !form.handoff_time) throw new Error('请选择首次日期和交接时间')
  const start = unchanged ? anchor.start : scheduleStart(form.start_date,form.handoff_time,form.timezone)
  let windowStart = form.window_start, windowEnd = form.window_end
  if (form.all_day) {
    if (windowStart !== windowEnd) windowStart = windowEnd = '00:00'
  } else if (windowStart === windowEnd) throw new Error('非全天值班的开始和结束时间不能相同')
  const clock = /^(?:[01]\d|2[0-3]):[0-5]\d$/
  if (!clock.test(windowStart) || !clock.test(windowEnd)) throw new Error('请选择有效的每日覆盖时段')
  const payload = {
    name:form.name,timezone:form.timezone,rotation:form.rotation,start,
    members:ids(form.members),weekdays:form.weekdays.slice(),
    window_start:windowStart,window_end:windowEnd,
    fallback_user_ids:ids(form.fallback_user_ids),fallback_group_ids:ids(form.fallback_group_ids),enabled:form.enabled,
  }
  if (form.id) payload.id = form.id
  return payload
}
