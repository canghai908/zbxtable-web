/* eslint-env node */
const assert = require('node:assert/strict')
const {readFile} = require('node:fs/promises')
const {test} = require('node:test')
const path = require('node:path')
async function main() {
  const source = await readFile(path.join(__dirname,'../src/components/OnCall/calendar.js'),'utf8')
  const {calendarDays,dateKey,segmentRange,timezoneOptions,calendarMonthWindow,calendarMonthCells,shiftCalendarMonth} = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`)
  const slot = (start,end,source='rotation') => ({start,end,source,user_ids:[1],reason:'normal'})
  test('calendar splits cross-midnight slots in schedule timezone, without mutating data',()=>{
    const slots = [slot('2026-11-20T14:00:00Z','2026-11-21T02:00:00Z')]
    const original = JSON.stringify(slots)
    const days = calendarDays(slots,'Asia/Shanghai')
    assert.deepEqual(days.map(d=>d.key),['2026-11-20','2026-11-21'])
    assert.equal(segmentRange(days[0].segments[0],'Asia/Shanghai'),'22:00–24:00')
    assert.equal(segmentRange(days[1].segments[0],'Asia/Shanghai'),'00:00–10:00')
    assert.equal(JSON.stringify(slots),original)
  })
  test('calendar merges adjacent equal segments but preserves override and gap boundaries',()=>{
    const days = calendarDays([
      slot('2026-11-20T09:00:00+08:00','2026-11-20T10:00:00+08:00'),
      slot('2026-11-20T10:00:00+08:00','2026-11-20T11:00:00+08:00'),
      slot('2026-11-20T11:00:00+08:00','2026-11-20T12:00:00+08:00','override'),
      {...slot('2026-11-20T12:00:00+08:00','2026-11-20T13:00:00+08:00','uncovered'),user_ids:[]},
    ],'Asia/Shanghai')
    assert.equal(days[0].segments.length,3)
    assert.equal(segmentRange(days[0].segments[0],'Asia/Shanghai'),'09:00–11:00')
    assert.deepEqual(days[0].segments[2].user_ids,[])
  })
  test('calendar civil midnight handles 23-hour and 25-hour DST days',()=>{
    for (const [start,end,hours] of [
      ['2026-03-08T00:00:00-05:00','2026-03-09T00:00:00-04:00',23],
      ['2026-11-01T00:00:00-04:00','2026-11-02T00:00:00-05:00',25],
    ]) {
      const days = calendarDays([slot(start,end)],'America/New_York')
      assert.equal(days.length,1)
      assert.equal((days[0].segments[0].end-days[0].segments[0].start)/3600000,hours)
    }
  })
  test('calendar retains exact ambiguous-hour instants and identifies their timezone',()=>{
    const days = calendarDays([slot('2026-11-01T01:30:00-04:00','2026-11-01T01:15:00-05:00')],'America/New_York')
    const segment = days[0].segments[0]
    assert.equal((segment.end-segment.start)/60000,45)
    assert.match(segmentRange(segment,'America/New_York'),/(?:EDT|GMT-4).*(?:EST|GMT-5)/)
  })
  test('short overrides remain visible with seconds instead of zero-length labels',()=>{
    const days=calendarDays([slot('2026-11-20T10:00:00+08:00','2026-11-20T10:00:20+08:00','override')],'Asia/Shanghai')
    assert.equal(segmentRange(days[0].segments[0],'Asia/Shanghai'),'10:00:00–10:00:20')
  })
  test('skipped civil date is not invented in the calendar',()=>{
    const days = calendarDays([slot('2011-12-29T22:00:00-10:00','2011-12-31T02:00:00+14:00')],'Pacific/Apia')
    assert.deepEqual(days.map(d=>d.key),['2011-12-29','2011-12-31'])
  })
  test('calendar ignores malformed or empty intervals and handles empty preview',()=>{
    assert.deepEqual(calendarDays([],'UTC'),[])
    assert.deepEqual(calendarDays([slot('bad','bad'),slot('2026-01-01','2026-01-01')],'UTC'),[])
    assert.equal(dateKey('2026-11-20T20:00:00Z','Asia/Shanghai'),'2026-11-21')
  })
  test('month windows use local month boundaries and real month lengths',()=>{
    const november=calendarMonthWindow('2026-11-20T09:00:00+08:00','Asia/Shanghai')
    assert.deepEqual(november,{month:'2026-11',days:30,start:'2026-10-31T16:00:00.000Z',end:'2026-11-30T16:00:00.000Z'})
    assert.equal(calendarMonthWindow('2024-02','UTC').days,29)
    assert.equal(calendarMonthWindow('2026-02','UTC').days,28)
    assert.equal(calendarMonthWindow('2026-11-01T00:00:00Z','America/New_York').month,'2026-10')
    const dst=calendarMonthWindow('2026-11','America/New_York')
    assert.equal((new Date(dst.end)-new Date(dst.start))/3600000,30*24+1)
  })
  test('standard month calendar always aligns Monday through Sunday across six weeks',()=>{
    const cells=calendarMonthCells([], 'Asia/Shanghai','2026-11')
    assert.equal(cells.length,42)
    assert.equal(cells[0].key,'2026-10-26')
    assert.equal(cells[6].key,'2026-11-01')
    assert.equal(cells[11].key,'2026-11-06')
    assert.equal(cells[41].key,'2026-12-06')
    assert.equal(cells.filter(c=>c.inMonth).length,30)
    cells.forEach((cell,index)=>assert.equal((new Date(cell.key+'T12:00:00Z').getUTCDay()+6)%7,index%7))
    assert.equal(calendarMonthCells([], 'UTC','2024-02').filter(c=>c.inMonth).length,29)
  })
  test('adjacent-month padding cells do not claim unloaded coverage',()=>{
    const cells=calendarMonthCells([slot('2026-10-31T00:00:00+08:00','2026-11-02T00:00:00+08:00')],'Asia/Shanghai','2026-11')
    assert.deepEqual(cells.find(c=>c.key==='2026-10-31').segments,[])
    assert.equal(cells.find(c=>c.key==='2026-11-01').segments.length,1)
    assert.equal(shiftCalendarMonth('2026-12',1),'2027-01')
    assert.equal(shiftCalendarMonth('2026-01',-1),'2025-12')
  })
  test('timezone options include common choices and preserve an existing IANA value',()=>{
    const zones = timezoneOptions('Etc/GMT+12')
    assert.ok(zones.some(z=>z.value==='Asia/Shanghai'&&z.label.includes('北京')))
    assert.ok(zones.some(z=>z.value==='UTC'))
    assert.ok(zones.some(z=>z.value==='Etc/GMT+12'))
    assert.equal(new Set(zones.map(z=>z.value)).size,zones.length)
  })
}
main()
