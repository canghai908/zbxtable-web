/* eslint-env node */
const assert = require('node:assert/strict')
const { readFile } = require('node:fs/promises')
const { test } = require('node:test')
const path = require('node:path')
async function main() {
  const source = await readFile(path.join(__dirname, '../src/components/OnCall/model.js'), 'utf8')
  const { ids, moveMember, formatInZone, rulePayload } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`)
  test('schedule IDs normalize legacy values without reordering rotation', () => {
    assert.deepEqual(ids(['3','1','3',0,-1,'bad']), [3,1])
    assert.deepEqual(ids('4,2,4'), [4,2])
    assert.deepEqual(ids(null), [])
  })
  test('member ordering moves one slot, preserves source, and respects boundaries', () => {
    const list = [1,2,3]
    assert.deepEqual(moveMember(list, 1, -1), [2,1,3])
    assert.deepEqual(moveMember(list, 0, -1), list)
    assert.deepEqual(moveMember(list, 2, 1), list)
    assert.deepEqual(list, [1,2,3])
  })
  test('rule serialization preserves legacy fields and adds native schedule ID array', () => {
    const rule = {status:true,z_ids:['1'],channel:['mail','wechat'],s_week:['1','2'],user_ids:['3'],group_ids:['4'],conditions:[{r_type:'host',r_func:'==',r_value:'prod'}],s_time:{format:()=> '09:00'},e_time:{format:()=> '18:00'},schedule_ids:['5','6']}
    const result = rulePayload(rule)
    assert.equal(result.channel, 'mail,wechat')
    assert.equal(result.status, '0')
    assert.equal(result.s_time, '09:00')
    assert.deepEqual(result.schedule_ids, [5,6])
    assert.equal(JSON.parse(result.conditions)[0].r_func, '==')
    assert.deepEqual(rule.schedule_ids, ['5','6'])
    assert.deepEqual(rulePayload({...rule,schedule_ids:undefined}).schedule_ids, [])
  })
  test('preview timestamps use requested schedule timezone', () => {
    const text = formatInZone('2026-11-20T00:00:00Z', 'Asia/Shanghai')
    assert.match(text, /08:00/)
    assert.equal(formatInZone(null), '—')
  })
}
main()
