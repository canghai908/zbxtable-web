/* eslint-env node */
const assert = require('node:assert/strict')
const { readFile } = require('node:fs/promises')
const path = require('node:path')
const { test } = require('node:test')
async function main() {
  const modelSource=await readFile(path.join(__dirname,'../src/components/TableTextDetail/model.js'),'utf8')
  const modelURL=`data:text/javascript;base64,${Buffer.from(modelSource).toString('base64')}`
  const {shortText,formatDetail}=await import(modelURL)
  const auditSource=(await readFile(path.join(__dirname,'../src/components/OnCall/audit.js'),'utf8')).replace("'../TableTextDetail/model'",JSON.stringify(modelURL))
  const {auditSummary,auditActionLabels}=await import(`data:text/javascript;base64,${Buffer.from(auditSource).toString('base64')}`)
  test('large snapshots produce field summaries without exposing full JSON in rows',()=>{
    const before={id:1,name:'prod',members:Array.from({length:200},(_,i)=>i+1),rotation:'daily',created:'2026-11-20',updated:'before'}
    const after={...before,rotation:'weekly',members:[...before.members].reverse(),updated:'after'}
    const detail=JSON.stringify({before,after})
    const summary=auditSummary({action:'update',detail})
    assert.match(summary,/轮换方式/)
    assert.match(summary,/值班成员/)
    assert.ok(summary.length<100)
    assert.ok(!summary.includes('"before"'))
    assert.deepEqual(JSON.parse(formatDetail(detail)),{before,after})
  })
  test('timestamp-only changes do not look like configuration edits',()=>{
    assert.equal(auditSummary({action:'update',detail:{before:{name:'ops',updated:'a'},after:{name:'ops',updated:'b'}}}),'保存排班，配置未发生变化')
  })
  test('many changes and unknown future fields remain bounded and readable',()=>{
    const result=auditSummary({action:'update',detail:{before:{},after:{name:'x',timezone:'UTC',rotation:'fixed',members:[1],future_field:'new'}}})
    assert.match(result,/等 5 项/)
    assert.match(auditSummary({action:'update',detail:{before:{},after:{future_field:true}}}),/future_field/)
  })
  test('create, delete and override actions have readable summaries',()=>{
    assert.match(auditSummary({action:'create',detail:{after:{name:'ops'}}}),/创建排班：ops/)
    assert.match(auditSummary({action:'delete',detail:{name:'ops'}}),/删除排班：ops/)
    assert.match(auditSummary({action:'override_create',detail:{reason:'请假'}}),/新增代班：请假/)
    assert.equal(auditActionLabels.update,'修改排班')
  })
  test('long malformed, unbroken and unicode text cannot create unbounded summaries',()=>{
    for(const text of ['x'.repeat(20000),'🙂'.repeat(10000),'a\n b\t'.repeat(5000)]) {
      assert.ok(Array.from(shortText(text)).length<=161)
      assert.ok(Array.from(auditSummary({action:'update',detail:text})).length<=161)
      assert.equal(formatDetail(text),text)
    }
    assert.equal(shortText('短文本'),'短文本')
    assert.equal(shortText(null),'—')
  })
  test('detail formatting preserves escaped HTML as text and handles missing data',()=>{
    const text=JSON.stringify({message:'<script>alert(1)</script>',before:null})
    assert.deepEqual(JSON.parse(formatDetail(text)),JSON.parse(text))
    assert.equal(formatDetail(null),'—')
    assert.equal(formatDetail('invalid JSON'),'invalid JSON')
    assert.ok(auditSummary({detail:'{"future":true}'}))
  })
}
main()
