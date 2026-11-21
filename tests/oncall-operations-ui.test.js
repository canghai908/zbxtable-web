/* eslint-env node */
const assert=require('node:assert/strict')
const fs=require('node:fs')
const path=require('node:path')
const {test}=require('node:test')
const {parseComponent}=require('vue-template-compiler')
const babel=require('@babel/core')
async function main(){
  const source=fs.readFileSync(path.join(__dirname,'../src/components/OnCall/model.js'),'utf8')
  const model=await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`)
  function readComponent(file,modules={}){
    const script=parseComponent(fs.readFileSync(path.join(__dirname,'../src',file),'utf8')).script.content
    const code=babel.transformSync(script,{babelrc:false,configFile:false,plugins:[require.resolve('@babel/plugin-transform-modules-commonjs')]}).code
    const mod={exports:{}}
    new Function('require','module','exports',code)(name=>modules[name]||{},mod,mod.exports)
    return mod.exports.default
  }
  function page(api={}){
    const component=readComponent('pages/alarm/OnCallSchedules.vue',{
      moment:require('moment'),'@/services/admin':api,'@/components/OnCall/model':model,'@/components/OnCall/audit':{auditSummary:()=>'',auditActionLabels:{}},
      '@/components/OnCall/editor':{createScheduleForm:()=>({name:'',members:[],weekdays:[],all_day:true,window_start:'00:00',window_end:'00:00'}),buildSchedulePayload:form=>form},
    })
    const ctx={...component.data(),$message:{error:()=>{},success:()=>{}}}
    for(const [name,method] of Object.entries(component.methods)) {assert.equal(typeof method,'function',`method ${name} must be callable`);ctx[name]=method.bind(ctx)}
    Object.defineProperty(ctx,'canManage',{get:()=>component.computed.canManage.call(ctx)})
    return {component,ctx}
  }
  const ok=data=>({data:{code:200,data}})
  test('ordinary accounts remain read only and do not call write or audit APIs',async()=>{
    const fail=()=>assert.fail('ordinary account invoked a privileged API')
    const {component,ctx}=page({onCallCreate:fail,onCallUpdate:fail,onCallDelete:fail,onCallOverrideCreate:fail,onCallOverrideDelete:fail,onCallAudit:fail})
    assert.equal(ctx.canManage,false)
    ctx.viewer={id:22,role:'user'}
    assert.equal(ctx.canManage,false)
    await ctx.edit({id:1});await ctx.save();await ctx.remove({id:1});ctx.openOverride();await ctx.saveOverride();await ctx.removeOverride({id:1});await ctx.loadAudit();await ctx.tabChanged('audit')
    assert.equal(ctx.editorVisible,false);assert.equal(ctx.overrideVisible,false)
    assert.ok(component.computed.readableOverrideColumns.call(ctx).every(column=>column.key!=='action'))
    ctx.viewer={id:1,role:'admin'};assert.equal(ctx.canManage,true)
  })
  test('overview is requested once per page and mine uses server pagination without per-row previews',async()=>{
    const calls=[]
    const {ctx}=page({onCallDirectory:async()=>ok({viewer:{id:22,role:'user'},users:[{id:22,username:'operator',status:0,channels:{mail:true}}],groups:[]}),onCallOverview:async params=>{calls.push(params);return ok({items:[{schedule:{id:7,name:'ops'},current:{user_ids:[22]},today:[],my_next:null}],total:31,at:'2026-11-20T01:00:00Z'})},onCallPreview:()=>assert.fail('list caused a per-row preview')})
    ctx.scope='mine';ctx.pagination.current=2
    await ctx.load()
    assert.deepEqual(calls,[{page:2,limit:20,mine:1}])
    assert.equal(ctx.list[0].id,7);assert.equal(ctx.pagination.total,31);assert.equal(ctx.viewer.id,22);assert.equal(ctx.loading,false)
  })
  test('late overview response cannot replace a newer mine page',async()=>{
    const requests=[]
    const {ctx}=page({onCallDirectory:async()=>ok({viewer:{id:22,role:'user'}}),onCallOverview:params=>new Promise(resolve=>requests.push({params,resolve}))})
    const first=ctx.load();ctx.scope='mine';const second=ctx.load()
    requests[1].resolve(ok({items:[{schedule:{id:2}}],total:1}));await second
    requests[0].resolve(ok({items:[{schedule:{id:1}}],total:99}));await first
    assert.equal(ctx.list[0].id,2);assert.equal(ctx.pagination.total,1);assert.equal(ctx.loading,false)
  })
  test('directory failures remove write capabilities',async()=>{
    const {ctx}=page({onCallDirectory:async()=>{throw Error('not authorized')}})
    ctx.viewer={id:1,role:'admin'}
    await assert.rejects(ctx.loadDirectory(),/not authorized/)
    assert.equal(ctx.canManage,false)
  })
  test('all-day switch retains a configured custom window and gives a useful first custom default',()=>{
    const {ctx}=page()
    ctx.setAllDay(false);assert.equal(ctx.form.window_start,'09:00');assert.equal(ctx.form.window_end,'18:00')
    ctx.form.window_start='22:00';ctx.form.window_end='06:00'
    ctx.setAllDay(true);ctx.setAllDay(false)
    assert.equal(ctx.form.window_start,'22:00');assert.equal(ctx.form.window_end,'06:00')
  })
  test('my duty label distinguishes current shift, next shift and backup-only membership',()=>{
    const {ctx}=page();ctx.overviewAt='2026-11-20T10:00:00+08:00'
    const record={timezone:'Asia/Shanghai',_overview:{my_next:{start:'2026-11-20T09:00:00+08:00',end:'2026-11-21T09:00:00+08:00'}}}
    assert.match(ctx.myShiftText(record),/^正在值班/)
    record._overview.my_next.start='2026-11-21T09:00:00+08:00';record._overview.my_next.end='2026-11-22T09:00:00+08:00'
    assert.match(ctx.myShiftText(record),/2026.*11.*21/)
    record._overview.my_next=null;record._overview.my_role='fallback';assert.match(ctx.myShiftText(record),/备用接收人/)
    record._overview.my_role='member';assert.equal(ctx.myShiftText(record),'未来31天未排班')
  })
  test('continuous duties are labelled as bounded lookup results instead of a false end date',()=>{
    const {ctx}=page();ctx.overviewAt='2026-11-20T10:00:00+08:00'
    const record={timezone:'Asia/Shanghai',_overview:{lookup_until:'2026-12-21T10:00:00+08:00',my_next:{start:ctx.overviewAt,end:'2026-12-21T10:00:00+08:00'}}}
    assert.equal(ctx.myShiftText(record),'正在值班（查询期内持续覆盖）')
    record._overview.error='invalid';assert.equal(ctx.myShiftText(record),'排班读取失败')
  })
  test('today details use the already loaded local-day slots without extra preview requests',()=>{
    const {ctx}=page();const record={name:'ops',timezone:'Asia/Shanghai',_overview:{today:[{start:'2026-11-20T00:00:00+08:00'}]}}
    ctx.inspectToday(record);assert.equal(ctx.todayVisible,true);assert.equal(ctx.todaySchedule,record)
  })
  test('channel checks count enabled configured accounts, retain missing users and never infer delivery success',()=>{
    const component=readComponent('components/OnCall/MemberChannels.vue',{'./model':model})
    const ctx={members:[1,2,3],fallbackUserIds:[1,4],users:[{id:1,username:'one',status:0,channels:{mail:true,wechat:false}},{id:2,username:'two',status:1,channels:{mail:true}},{id:4,username:'backup',status:0,channels:{wechat:true}}]}
    ctx.rows=component.computed.rows.call(ctx)
    assert.equal(ctx.rows.length,4);assert.equal(ctx.rows[0].role,'轮班 / 备用');assert.equal(ctx.rows[2].missing,true)
    assert.equal(component.methods.configuredCount.call(ctx,'mail'),1)
    assert.equal(component.methods.configuredCount.call(ctx,'wechat'),1)
  })
}
main()
