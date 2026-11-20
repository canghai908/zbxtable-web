// Unbounded API text must be summarized in table cells; full values remain
// available in a separate, scrollable detail view.
export function formatDetail(value) {
  if (value == null || value === '') return '—'
  try { return JSON.stringify(typeof value === 'string' ? JSON.parse(value) : value, null, 2) }
  catch (e) { return String(value) }
}
export function shortText(value, limit = 160) {
  const text = typeof value === 'string' ? value : formatDetail(value)
  const characters = Array.from(text.replace(/\s+/g, ' ').trim())
  return characters.length > limit ? characters.slice(0, limit).join('') + '…' : characters.join('')
}
