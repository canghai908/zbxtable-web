// Mute rules store civil timestamps parsed in Asia/Shanghai by utils.ParTime.
// Never let the browser's timezone reinterpret these values.
function muteTime(value) {
  if (typeof value !== 'string') return null
  const civil = value.trim().replace(/\./g, '-').replace(' ', 'T')
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(civil)) return null
  const wall = Date.parse(`${civil}Z`)
  if (!Number.isFinite(wall) || new Date(wall).toISOString().slice(0,19) !== civil) return null
  return wall - 8 * 3600000
}

export function mutePolicyState(rule, now = Date.now()) {
  if (String(rule.status) !== '0') return 'disabled'
  const start = muteTime(rule.s_time), end = muteTime(rule.e_time)
  if (start === null || end === null || end < start || !Number.isFinite(now)) return 'invalid'
  // The production matcher compares Unix seconds and includes both boundaries.
  const instant = Math.floor(now / 1000) * 1000
  if (instant < start) return 'pending'
  if (instant > end) return 'expired'
  return 'active'
}
