import test from 'node:test'
import assert from 'node:assert/strict'
import { ROLE_LABEL_KEY } from '../dist/session/index.js'
import { setLocale, t } from '../dist/utils/index.js'

test('角色 → 文案 key 的映射完整', () => {
  assert.deepEqual(Object.keys(ROLE_LABEL_KEY).sort(), ['assistant', 'system', 'tool', 'user'])
  for (const key of Object.values(ROLE_LABEL_KEY)) {
    assert.notEqual(t(key), key, `${key} 应能在内置字典里找到（找不到会回退成 key 本身）`)
  }
})

test('会话文案中英齐全', () => {
  setLocale('zh')
  assert.equal(t('sessionEmpty'), '该会话暂无内容')
  assert.equal(t('sessionAttachments'), '附件')
  setLocale('en')
  assert.equal(t('sessionLoading'), 'Loading session…')
  assert.equal(t('sessionFailed'), 'Failed to load session')
  setLocale('zh')
})
