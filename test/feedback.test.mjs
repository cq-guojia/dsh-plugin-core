import test from 'node:test'
import assert from 'node:assert/strict'
import { showToast } from '../dist/ui/index.js'
import { setLocale, t } from '../dist/utils/index.js'

test('showToast 在无 DOM 环境静默跳过，不抛', () => {
  assert.equal(typeof document, 'undefined')
  assert.doesNotThrow(() => showToast('hello'))
  assert.doesNotThrow(() => showToast('hello', { variant: 'error', durationMs: 10 }))
})

test('反馈件文案自带中英', () => {
  setLocale('zh')
  assert.equal(t('modalClose'), '关闭')
  assert.equal(t('emptyText'), '暂无数据')
  assert.equal(t('errorTitle'), '出错了')
  assert.equal(t('errorRetry'), '重试')
  setLocale('en')
  assert.equal(t('modalClose'), 'Close')
  assert.equal(t('errorRetry'), 'Retry')
  setLocale('zh')
})
