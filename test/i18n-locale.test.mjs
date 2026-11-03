// 语言默认跟随宿主：官方 locale 插件把生效语言写进 `<html lang>`（dsh-host.md §14）。
// 这里单独一个文件：`setLocale` 一旦调用就固定下来，没法在同一进程里验证「没调时跟随宿主」。
import test from 'node:test'
import assert from 'node:assert/strict'
import { getLocale, t } from '../dist/utils/index.js'

test('没调 setLocale 时，语言跟随宿主 <html lang>', () => {
  const doc = { documentElement: { lang: 'en-US' } }
  globalThis.document = doc
  try {
    assert.equal(getLocale(), 'en')
    assert.equal(t('explorerRootDir'), 'Root')
    doc.documentElement.lang = 'zh-CN'
    assert.equal(getLocale(), 'zh')
    assert.equal(t('explorerRootDir'), '根目录')
  } finally {
    delete globalThis.document
  }
  // 非浏览器环境（Node 自检）回落中文
  assert.equal(getLocale(), 'zh')
})
