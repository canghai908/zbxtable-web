/* eslint-env node */
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const {test} = require('node:test')
const {parseComponent} = require('vue-template-compiler')
const babel = require('@babel/core')
async function main() {
  const source=fs.readFileSync(path.join(__dirname,'../src/pages/alarm/muteState.js'),'utf8')
  const {mutePolicyState}=await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`)
  const rule={status:'0',s_time:'2026-11-20 09:00:00',e_time:'2026-11-20 10:00:00'}
  const cases=[
    ['pending before start',rule,'2026-11-20T08:59:59+08:00','pending'],
    ['start inclusive',rule,'2026-11-20T09:00:00+08:00','active'],
    ['active within window',rule,'2026-11-20T09:30:00+08:00','active'],
    ['end inclusive',rule,'2026-11-20T10:00:00+08:00','active'],
    ['whole end second inclusive',rule,'2026-11-20T10:00:00.999+08:00','active'],
    ['expired after end second',rule,'2026-11-20T10:00:01+08:00','expired'],
    ['disabled overrides expired time',{...rule,status:'1'},'2026-11-21T00:00:00+08:00','disabled'],
    ['numeric enabled status',{...rule,status:0},'2026-11-20T09:30:00+08:00','active'],
    ['legacy dotted dates',{...rule,s_time:'2026.11.20 09:00:00'},'2026-11-20T09:30:00+08:00','active'],
    ['missing time',{...rule,s_time:''},'2026-11-20T09:30:00+08:00','invalid'],
    ['invalid civil date',{...rule,s_time:'2026-02-30 09:00:00'},'2026-11-20T09:30:00+08:00','invalid'],
    ['reversed window',{...rule,e_time:'2026-11-20 08:00:00'},'2026-11-20T09:30:00+08:00','invalid'],
  ]
  for(const [name,record,instant,want] of cases) test(name,()=>assert.equal(mutePolicyState(record,Date.parse(instant)),want))
  test('mute state uses Shanghai wall time independently of the process timezone',()=>{
    const before=process.env.TZ
    try {
      for(const tz of ['UTC','America/New_York','Asia/Tokyo']) {
        process.env.TZ=tz
        assert.equal(mutePolicyState(rule,Date.parse('2026-11-20T01:30:00Z')),'active')
      }
    } finally { if(before===undefined) delete process.env.TZ;else process.env.TZ=before }
  })
  const script=parseComponent(fs.readFileSync(path.join(__dirname,'../src/pages/alarm/mutes.vue'),'utf8')).script.content
  const code=babel.transformSync(script,{babelrc:false,configFile:false,plugins:[require.resolve('@babel/plugin-transform-modules-commonjs')]}).code
  function component(api={}) {
    const mod={exports:{}}
    new Function('require','module','exports',code)(name=>name==='vuex'?{mapGetters:()=>({})}:name==='@/services/admin'?api:name==='./muteState'?{mutePolicyState}:{},mod,mod.exports)
    return mod.exports.default
  }
  test('clock updates without HTTP requests and stops when leaving a kept-alive page',()=>{
    const comp=component(),ctx={policyNow:0,policyTimer:null},before={setInterval,clearInterval,now:Date.now}
    let tick,starts=0,now=1000;const cleared=[]
    global.setInterval=(fn,ms)=>{assert.equal(ms,1000);tick=fn;starts++;return 0}
    global.clearInterval=id=>cleared.push(id);Date.now=()=>now
    try {
      ctx.startPolicyClock=comp.methods.startPolicyClock.bind(ctx);ctx.stopPolicyClock=comp.methods.stopPolicyClock.bind(ctx)
      ctx.startPolicyClock();ctx.startPolicyClock();assert.equal(starts,1)
      now=2000;tick();assert.equal(ctx.policyNow,2000)
      comp.deactivated.call(ctx);assert.deepEqual(cleared,[0]);assert.equal(ctx.policyTimer,null)
      comp.activated.call(ctx);assert.equal(starts,2)
      comp.beforeDestroy.call(ctx);assert.deepEqual(cleared,[0,0])
    } finally {global.setInterval=before.setInterval;global.clearInterval=before.clearInterval;Date.now=before.now}
  })
  for(const failure of ['rejected','network']) test(`failed switch ${failure} restores the persisted status`,async()=>{
    const comp=component({ruleStatusPut:async()=>{if(failure==='network')throw Error('network');return {data:{code:500,message:'failed'}}}})
    const record={...rule,status:'1'},draft={name:'unsaved draft'},errors=[]
    const ctx={rule:draft,loading:false,$message:{error:msg=>errors.push(msg),success:()=>assert.fail('failed change reported success')}}
    await comp.methods.onStatusChange.call(ctx,true,record)
    assert.equal(record.status,'1');assert.equal(ctx.loading,false);assert.equal(ctx.rule,draft);assert.equal(errors.length,1)
  })
}
main()
