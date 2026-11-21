/* eslint-env node */
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const {test} = require('node:test')
const {parseComponent} = require('vue-template-compiler')
const babel = require('@babel/core')
async function main() {
  const source=fs.readFileSync(path.join(__dirname,'../src/components/OnCall/calendar.js'),'utf8')
  const calendar=await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`)
  const moduleURL = file => `data:text/javascript;base64,${Buffer.from(fs.readFileSync(path.join(__dirname,'../src/components/OnCall/',file),'utf8')).toString('base64')}`
  const editorSource=fs.readFileSync(path.join(__dirname,'../src/components/OnCall/editor.js'),'utf8').replace("'./calendar'",JSON.stringify(moduleURL('calendar.js'))).replace("'./model'",JSON.stringify(moduleURL('model.js')))
  const editor=await import(`data:text/javascript;base64,${Buffer.from(editorSource).toString('base64')}`)
  const script=parseComponent(fs.readFileSync(path.join(__dirname,'../src/pages/alarm/OnCallSchedules.vue'),'utf8')).script.content
  const code=babel.transformSync(script,{babelrc:false,configFile:false,plugins:[require.resolve('@babel/plugin-transform-modules-commonjs')]}).code
  const componentWith = api => {
    const mod={exports:{}}
    new Function('require','module','exports',code)(name=>name==='moment'?require('moment'):name==='@/services/admin'?api:name==='@/components/OnCall/calendar'?calendar:name==='@/components/OnCall/editor'?editor:{},mod,mod.exports)
    return mod.exports.default
  }
  const methodsWith = api => componentWith(api).methods
  const componentScript=parseComponent(fs.readFileSync(path.join(__dirname,'../src/components/OnCall/ScheduleCalendar.vue'),'utf8')).script.content
  const componentCode=babel.transformSync(componentScript,{babelrc:false,configFile:false,plugins:[require.resolve('@babel/plugin-transform-modules-commonjs')]}).code
  const componentModule={exports:{}}
  new Function('require','module','exports',componentCode)(name=>name==='./calendar'?calendar:{},componentModule,componentModule.exports)
  const calendarMethods=componentModule.exports.default.methods
  test('calendar navigation emits the adjacent month across year boundaries',()=>{
    const emitted=[]
    const ctx={activeMonth:'2026-01',$emit:(...args)=>emitted.push(args)}
    calendarMethods.navigate.call(ctx,-1)
    ctx.activeMonth='2026-12'
    calendarMethods.navigate.call(ctx,1)
    assert.deepEqual(emitted,[['month-change','2025-12'],['month-change','2027-01']])
  })
  test('compact day entry keeps every shift available in the detail view',()=>{
    const day={key:'2026-11-20',segments:Array.from({length:12},(_,i)=>({start:`shift-${i}`}))}
    const ctx={}
    calendarMethods.showDay.call(ctx,day)
    assert.equal(ctx.selectedDay.segments.length,12)
    assert.equal(ctx.selectedStart,null)
    calendarMethods.showDay.call(ctx,day,day.segments[11])
    assert.equal(ctx.selectedStart,'shift-11')
  })
  test('default calendar previews roster members instead of channel-filtered fallback recipients',async()=>{
    const calls=[]
    const component=componentWith({onCallPreview:async(id,params)=>{
      calls.push(params)
      const people=params.channel?[1]:[1,2,3]
      return {data:{code:200,data:{current:{user_ids:[1]},slots:people.map((id,index)=>({start:`2026-11-${20+index}T00:00:00+08:00`,end:`2026-11-${21+index}T00:00:00+08:00`,source:'rotation',user_ids:[id]}))}}}
    }})
    const ctx={...component.data(),selected:{id:41,timezone:'Asia/Shanghai'},previewAt:require('moment')('2026-11-20T10:00:00+08:00')}
    ctx.clearPreview=component.methods.clearPreview.bind(ctx)
    await component.methods.preview.call(ctx)
    assert.equal(ctx.previewChannel,'')
    assert.ok(calls.every(call=>!call.channel))
    assert.deepEqual(ctx.previewResult.slots.map(slot=>slot.user_ids[0]),[1,2,3])
    ctx.previewChannel='mail'
    await component.methods.preview.call(ctx)
    assert.deepEqual(ctx.previewResult.slots.map(slot=>slot.user_ids[0]),[1])
    assert.ok(calls.slice(-2).every(call=>call.channel==='mail'))
  })
  test('month preview loads the full month while current selection keeps its own result',async()=>{
    const calls=[]
    const methods=methodsWith({onCallPreview:async(id,params)=>{
      calls.push({id,...params})
      return {data:{code:200,data:{current:{user_ids:[params.days===1?2:1]},slots:params.days===1?[]:[{start:params.at,end:'2026-12-01T00:00:00+08:00'}]}}}
    }})
    const ctx={previewSequence:0,previewAt:{toISOString:()=> '2026-11-20T01:00:00.000Z'},selected:{id:41,timezone:'Asia/Shanghai'},previewView:'calendar',previewChannel:'mail',previewDays:7}
    ctx.clearPreview=methods.clearPreview.bind(ctx)
    await methods.preview.call(ctx)
    assert.deepEqual(calls,[{id:41,at:'2026-11-20T01:00:00.000Z',days:1,channel:'mail'},{id:41,at:'2026-10-31T16:00:00.000Z',days:30,channel:'mail'}])
    assert.deepEqual(ctx.previewResult.current.user_ids,[2])
    assert.equal(ctx.previewResult.slots.length,1)
    assert.equal(ctx.previewLoading,false)
  })
  test('list preview retains the requested rolling period',async()=>{
    const calls=[]
    const methods=methodsWith({onCallPreview:async(id,params)=>{calls.push(params);return {data:{code:200,data:{current:{user_ids:[]},slots:[]}}}}})
    const ctx={previewSequence:0,previewAt:{toISOString:()=> '2026-11-20T01:00:00.000Z'},selected:{id:1,timezone:'Asia/Shanghai'},previewView:'list',previewChannel:'mail',previewDays:14}
    ctx.clearPreview=methods.clearPreview.bind(ctx)
    await methods.preview.call(ctx)
    assert.equal(calls.length,1)
    assert.equal(calls[0].days,14)
  })
}
main()
