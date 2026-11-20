/* eslint-env node */
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const {test} = require('node:test')
const {parseComponent} = require('vue-template-compiler')
const babel = require('@babel/core')
function auditMethods(api) {
  const script = parseComponent(fs.readFileSync(path.join(__dirname,'../src/pages/alarm/OnCallSchedules.vue'),'utf8')).script.content
  const code = babel.transformSync(script,{babelrc:false,configFile:false,plugins:[require.resolve('@babel/plugin-transform-modules-commonjs')]}).code
  const mod = {exports:{}}
  new Function('require','module','exports',code)(name=>name==='@/services/admin'?api:{},mod,mod.exports)
  return mod.exports.default.methods
}
function context() {
  return {selected:{id:41},auditSequence:0,audit:[],auditLoading:false,auditError:'',auditPagination:{current:1,pageSize:10,total:0}}
}
const response = id => ({data:{code:200,data:{items:[{id}],total:250}}})
test('actual audit loader passes page and limit to the server',async()=>{
  const calls=[]
  const methods=auditMethods({onCallAudit:async(id,params)=>{calls.push({id,...params});return response(240)}})
  const ctx=context();ctx.auditPagination.current=2;ctx.auditPagination.pageSize=20
  await methods.loadAudit.call(ctx)
  assert.deepEqual(calls,[{id:41,page:2,limit:20}])
  assert.equal(ctx.auditPagination.total,250)
  assert.equal(ctx.audit[0].id,240)
})
test('late audit responses never overwrite the latest page or its loading state',async()=>{
  for(const oldFirst of [true,false]) {
    const pending=[]
    const methods=auditMethods({onCallAudit:()=>new Promise(resolve=>pending.push(resolve))})
    const ctx=context()
    const old=methods.loadAudit.call(ctx)
    ctx.auditPagination.current=2
    const latest=methods.loadAudit.call(ctx)
    if(oldFirst){pending[0](response(1));await old;assert.equal(ctx.auditLoading,true);assert.deepEqual(ctx.audit,[])}
    pending[1](response(2));await latest
    if(!oldFirst){pending[0](response(1));await old}
    assert.equal(ctx.audit[0].id,2)
    assert.equal(ctx.auditLoading,false)
  }
})
test('audit errors clear old rows and remain visible without leaving loading stuck',async()=>{
  const methods=auditMethods({onCallAudit:async()=>{throw Error('service unavailable')}})
  const ctx=context();ctx.audit=[{id:1}]
  await methods.loadAudit.call(ctx)
  assert.deepEqual(ctx.audit,[])
  assert.equal(ctx.auditError,'service unavailable')
  assert.equal(ctx.auditLoading,false)
})
