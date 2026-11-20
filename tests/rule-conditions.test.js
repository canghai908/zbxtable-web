/* eslint-env node */
const assert = require('node:assert/strict')
const { readFile } = require('node:fs/promises')
const { test } = require('node:test')
const path = require('node:path')

async function main() {
  // The app uses Babel ES modules; load this dependency-free model as native ESM.
  const source = await readFile(path.join(__dirname, '../src/components/RuleConditions/model.js'), 'utf8')
  const { normalizeConditions, conditionSummary, leafCount } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`)

  test('legacy conditions preserve AND and regex semantics without mutating the input', () => {
    const old = [{ r_type: 'host', r_func: '==', r_value: 'prod-1' }, { r_type: 'trigger', r_func: '=~', r_value: 'CPU.*' }]
    const tree = normalizeConditions(old)
    assert.equal(tree.op, 'and')
    assert.equal(tree.children[0].operator, '=')
    assert.equal(tree.children[1].operator, '=~')
    assert.equal(old[0].r_func, '==')
  })

  test('nested OR groups produce explicit human-readable parentheses', () => {
    const tree = normalizeConditions({ version: 2, op: 'and', children: [
      { field: 'host', operator: 'like', value: 'prod-' },
      { op: 'or', children: [{ field: 'trigger', operator: 'like', value: 'CPU' }, { field: 'trigger', operator: 'like', value: 'Memory' }] },
    ] })
    assert.equal(leafCount(tree), 3)
    assert.equal(conditionSummary(tree), '(主机名称 包含 “prod-” 且 (告警内容 包含 “CPU” 或 告警内容 包含 “Memory”))')
  })

  test('empty legacy defaults remain empty', () => {
    assert.deepEqual(normalizeConditions('').children, [])
    assert.deepEqual(normalizeConditions('[]').children, [])
  })

  test('malformed and unknown conditions are rejected rather than hidden', () => {
    for (const raw of ['broken json', '{"version":3,"op":"and","children":[]}', '[{"r_type":"unknown","r_func":"=","r_value":"x"}]', '{"version":2,"op":"xor","children":[]}']) {
      assert.throws(() => normalizeConditions(raw))
    }
  })

  test('nested invalid groups and excessive complexity are rejected', () => {
    const leaf = { field: 'host', operator: '=', value: 'x' }
    const deep = { op: 'and', children: [{ op: 'and', children: [{ op: 'and', children: [{ op: 'and', children: [leaf] }] }] }] }
    assert.throws(() => normalizeConditions({ version: 2, ...deep }))
    assert.throws(() => normalizeConditions({ version: 2, op: 'and', children: Array.from({ length: 51 }, () => leaf) }))
    assert.throws(() => normalizeConditions({ version: 2, op: 'or', children: [{ op: 'and', children: [] }] }))
  })
}
main().catch(error => { console.error(error); process.exitCode = 1 })
