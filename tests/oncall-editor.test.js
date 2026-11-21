/* eslint-env node */
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const {test} = require('node:test')
const url = file => `data:text/javascript;base64,${Buffer.from(fs.readFileSync(path.join(__dirname,'../src/components/OnCall/',file),'utf8')).toString('base64')}`
async function main() {
  const source=fs.readFileSync(path.join(__dirname,'../src/components/OnCall/editor.js'),'utf8').replace("'./calendar'",JSON.stringify(url('calendar.js'))).replace("'./model'",JSON.stringify(url('model.js')))
  const {createScheduleForm,buildSchedulePayload,scheduleStart}=await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`)
  const stored={id:7,name:'ops',timezone:'Asia/Shanghai',rotation:'daily',start:'2026-11-20T09:00:27.123456789+08:00',members:[3,1,2],weekdays:[0,1,2,3,4,5,6],window_start:'00:00',window_end:'00:00',fallback_user_ids:[4],fallback_group_ids:[],enabled:true}
  test('legacy handoff date and seconds display in the schedule timezone and preserve the exact anchor',()=>{
    const form=createScheduleForm(stored)
    assert.equal(form.start_date,'2026-11-20');assert.equal(form.handoff_time,'09:00:27')
    const payload=buildSchedulePayload(form)
    assert.equal(payload.start,stored.start);assert.deepEqual(payload.members,[3,1,2])
    assert.ok(!('_anchor' in payload));assert.ok(!('all_day' in payload));assert.ok(!('start_date' in payload))
  })
  test('editing the handoff changes only the intended clock and preserves membership order',()=>{
    const form=createScheduleForm(stored);form.handoff_time='08:30:00'
    const payload=buildSchedulePayload(form)
    assert.equal(payload.start,'2026-11-20T00:30:00.000Z')
    assert.deepEqual(payload.members,[3,1,2]);assert.equal(payload.rotation,'daily')
  })
  test('first shift date and handoff clock are independent inputs interpreted in the selected timezone',()=>{
    assert.equal(scheduleStart('2026-11-21','09:00:00','Asia/Shanghai'),'2026-11-21T01:00:00.000Z')
    assert.equal(scheduleStart('2026-11-21','09:00:00','America/New_York'),'2026-11-21T14:00:00.000Z')
  })
  test('new schedules begin on today in Shanghai even if device date differs',()=>{
    const form=createScheduleForm(undefined,new Date('2026-11-20T18:00:00Z'))
    assert.equal(form.start_date,'2026-11-21');assert.equal(form.handoff_time,'00:00:00');assert.equal(form.all_day,true)
  })
  test('all-day toggle translates to compatible equal endpoints and restores custom coverage',()=>{
    const form=createScheduleForm({...stored,window_start:'22:00',window_end:'06:00'})
    assert.equal(form.all_day,false)
    form.all_day=true;const full=buildSchedulePayload(form)
    assert.equal(full.window_start,'00:00');assert.equal(full.window_end,'00:00')
    assert.equal(form.window_start,'22:00');assert.equal(form.window_end,'06:00')
    form.all_day=false;assert.equal(buildSchedulePayload(form).window_end,'06:00')
    const legacy=createScheduleForm({...stored,window_start:'09:00',window_end:'09:00'})
    assert.equal(buildSchedulePayload(legacy).window_start,'09:00')
    legacy.all_day=false;assert.throws(()=>buildSchedulePayload(legacy),/不能相同/)
  })
  test('DST spring gap and autumn ambiguous handoffs cannot silently move to another hour',()=>{
    assert.throws(()=>scheduleStart('2026-03-08','02:30:00','America/New_York'),/不存在/)
    assert.throws(()=>scheduleStart('2026-11-01','01:30:00','America/New_York'),/出现两次/)
    assert.equal(scheduleStart('2026-03-08','09:00:00','America/New_York'),'2026-03-08T13:00:00.000Z')
  })
  test('existing unedited ambiguous DST anchor is kept instead of resetting an already active rotation',()=>{
    const form=createScheduleForm({...stored,timezone:'America/New_York',start:'2026-11-01T01:30:00-05:00'})
    assert.equal(buildSchedulePayload(form).start,'2026-11-01T01:30:00-05:00')
  })
  test('invalid civil dates, clocks and zones are rejected with actionable messages',()=>{
    assert.throws(()=>scheduleStart('2026-02-30','09:00:00','UTC'),/无效/)
    assert.throws(()=>scheduleStart('2026-11-20','24:00:00','UTC'),/无效/)
    assert.throws(()=>scheduleStart('2026-11-20','09:00:00','Invalid/Zone'),/时区/)
    const form=createScheduleForm({...stored,start:'bad'})
    assert.equal(form.start_date,'');assert.throws(()=>buildSchedulePayload(form),/请选择/)
  })
  test('editing dates does not depend on the process timezone',()=>{
    const previous=process.env.TZ
    try {
      for(const tz of ['UTC','America/Los_Angeles','Asia/Tokyo']) {process.env.TZ=tz;assert.equal(scheduleStart('2026-11-20','09:00:00','Asia/Shanghai'),'2026-11-20T01:00:00.000Z')}
    } finally {if(previous===undefined) delete process.env.TZ;else process.env.TZ=previous}
  })
}
main()
