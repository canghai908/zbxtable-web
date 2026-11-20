// Calendar presentation only. Assignments always come from the backend preview;
// the browser never independently calculates rotation or fallback recipients.
const dayFormatter = timezone => new Intl.DateTimeFormat('en-CA', {
  timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit',
})
export function dateKey(value, timezone) {
  const parts = dayFormatter(timezone).formatToParts(new Date(value))
  const part = type => parts.find(p => p.type === type).value
  return `${part('year')}-${part('month')}-${part('day')}`
}
function zonedDayStart(key, timezone) {
  const target = Date.parse(`${key}T00:00:00Z`)
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
  })
  let guess = target
  for (let i = 0; i < 6; i++) {
    const parts = formatter.formatToParts(new Date(guess))
    const n = type => Number(parts.find(p => p.type === type).value)
    const wall = Date.UTC(n('year'), n('month') - 1, n('day'), n('hour'), n('minute'), n('second'))
    const next = guess + target - wall
    if (next === guess) return next
    guess = next
  }
  // Resolve skipped/repeated local midnight at the civil date transition.
  let low = target - 36 * 3600000, high = target + 36 * 3600000
  while (high - low > 1) {
    const mid = Math.floor((low + high) / 2)
    if (dateKey(mid, timezone) < key) low = mid
    else high = mid
  }
  return high
}
function midnightAfter(value, timezone) {
  const [y,m,d] = dateKey(value,timezone).split('-').map(Number)
  return zonedDayStart(new Date(Date.UTC(y,m-1,d+1)).toISOString().slice(0,10),timezone)
}
export function shiftCalendarMonth(month, offset) {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) throw new Error('无效日历月份')
  const [year,number] = month.split('-').map(Number)
  return new Date(Date.UTC(year,number-1+offset,1)).toISOString().slice(0,7)
}
export function calendarMonthWindow(value, timezone) {
  const month = /^\d{4}-(0[1-9]|1[0-2])$/.test(value) ? value : dateKey(value,timezone).slice(0,7)
  const [year,number] = month.split('-').map(Number)
  return {
    month, days: new Date(Date.UTC(year,number,0)).getUTCDate(),
    start: new Date(zonedDayStart(`${month}-01`,timezone)).toISOString(),
    end: new Date(zonedDayStart(`${shiftCalendarMonth(month,1)}-01`,timezone)).toISOString(),
  }
}
// A standard Monday-first six-week month grid. Adjacent-month cells are dates
// only; they must not imply coverage beyond the loaded month's API result.
export function calendarMonthCells(slots, timezone, month) {
  const window = calendarMonthWindow(month,timezone)
  const [year,number] = window.month.split('-').map(Number)
  const first = Date.UTC(year,number-1,1)
  const leading = (new Date(first).getUTCDay()+6)%7
  const days = new Map(calendarDays(slots,timezone).map(day=>[day.key,day]))
  return Array.from({length:42},(_,index)=>{
    const civil = new Date(first+(index-leading)*86400000)
    const key = civil.toISOString().slice(0,10)
    const inMonth = key.slice(0,7)===window.month
    return {key,day:civil.getUTCDate(),inMonth,segments:inMonth && days.has(key) ? days.get(key).segments : []}
  })
}
export function calendarDays(slots, timezone) {
  const days = new Map()
  const sorted = [...slots].sort((a, b) => new Date(a.start) - new Date(b.start))
  for (const slot of sorted) {
    let cursor = new Date(slot.start).getTime()
    const end = new Date(slot.end).getTime()
    if (!Number.isFinite(cursor) || !Number.isFinite(end) || end <= cursor) continue
    // Preview API is capped at 31 days. Bound malformed responses as well.
    let count = 0
    while (cursor < end && count++ < 33) {
      const boundary = midnightAfter(cursor, timezone)
      const stop = Math.min(end, boundary)
      if (stop <= cursor) break
      const key = dateKey(cursor, timezone)
      if (!days.has(key)) days.set(key, { key, start: cursor, segments: [] })
      const segments = days.get(key).segments
      const previous = segments[segments.length - 1]
      const same = previous && previous.end === cursor && previous.source === slot.source &&
        previous.reason === slot.reason && JSON.stringify(previous.user_ids) === JSON.stringify(slot.user_ids)
      if (same) previous.end = stop
      else segments.push({ ...slot, start: cursor, end: stop })
      cursor = stop
    }
  }
  return [...days.values()]
}
export function clockLabel(value, timezone, seconds = false) {
  return new Intl.DateTimeFormat('zh-CN', { timeZone: timezone, hour: '2-digit', minute: '2-digit', hourCycle: 'h23', ...(seconds ? {second: '2-digit'} : {}) }).format(new Date(value))
}
export function segmentRange(segment, timezone) {
  const precise = new Date(segment.start).getSeconds() !== 0 || new Date(segment.end).getSeconds() !== 0 || segment.end - segment.start < 60000
  const start = clockLabel(segment.start, timezone, precise)
  const end = dateKey(segment.start, timezone) === dateKey(segment.end, timezone) ? clockLabel(segment.end, timezone, precise) : '24:00'
  const offset = value => new Intl.DateTimeFormat('en-GB', {timeZone: timezone, timeZoneName: 'short'}).formatToParts(new Date(value)).find(p => p.type === 'timeZoneName').value
  const first = offset(segment.start), last = offset(segment.end)
  return first === last ? `${start}–${end}` : `${start} ${first} → ${end} ${last}`
}
export const commonTimezones = [
  ['Asia/Shanghai', '北京 / 上海'], ['Asia/Hong_Kong', '香港'], ['Asia/Taipei', '台北'],
  ['Asia/Tokyo', '东京'], ['Asia/Singapore', '新加坡'], ['Asia/Seoul', '首尔'],
  ['Asia/Kolkata', '印度'], ['Asia/Dubai', '迪拜'], ['UTC', '协调世界时'],
  ['Europe/London', '伦敦'], ['Europe/Berlin', '柏林'], ['Europe/Paris', '巴黎'],
  ['America/New_York', '纽约'], ['America/Chicago', '芝加哥'], ['America/Denver', '丹佛'],
  ['America/Los_Angeles', '洛杉矶'], ['America/Toronto', '多伦多'], ['America/Sao_Paulo', '圣保罗'],
  ['Australia/Sydney', '悉尼'], ['Pacific/Auckland', '奥克兰'], ['Africa/Johannesburg', '约翰内斯堡'],
]
export function timezoneOptions(current) {
  let zones = []
  try { if (typeof Intl.supportedValuesOf === 'function') zones = Intl.supportedValuesOf('timeZone') } catch (e) { /* use common zones on older browsers */ }
  const options = new Map(commonTimezones.map(([value, name]) => [value, {value, label: `${name} · ${value}`}]))
  zones.forEach(value => { if (!options.has(value)) options.set(value, {value, label: value}) })
  if (current && !options.has(current)) options.set(current, {value: current, label: current})
  return [...options.values()]
}
