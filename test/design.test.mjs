import test from 'node:test'
import assert from 'node:assert/strict'
import { createStyleKit, DARK_THEME_SELECTOR, TOKENS_CSS_TEMPLATE } from '../dist/design/index.js'

test('token 变量统一使用 dshpc 前缀，不留旧前缀', () => {
  assert.ok(TOKENS_CSS_TEMPLATE.includes('--dshpc-fg'))
  assert.ok(TOKENS_CSS_TEMPLATE.includes('--dshpc-surface-1'))
  assert.ok(!TOKENS_CSS_TEMPLATE.includes('--tdt-'))
})

test('深色段保留，判据是宿主写入的 body[data-ds-dark-theme]', () => {
  assert.ok(TOKENS_CSS_TEMPLATE.includes(DARK_THEME_SELECTOR))
  // 原文注释里会提到 prefers-color-scheme（是禁令说明），所以只查真实用法：不许出现媒体查询
  assert.ok(!/@media[^{]*prefers-color-scheme/.test(TOKENS_CSS_TEMPLATE), '明暗判据禁止跟系统')
})

test('style kit 在无 DOM 环境下静默跳过，不抛', () => {
  const kit = createStyleKit({ id: 'test-kit' })
  assert.equal(kit.cssVar('fg'), '--dshpc-fg')
  kit.ensureStyles()
  kit.registerStyle('controls', '.x{color:var(--dshpc-fg)}')
  kit.applyStyle('controls', '.x{color:var(--dshpc-fg)}')
  assert.equal(typeof document, 'undefined')
})

test('两个插件各自建 kit，style id 互不干扰', () => {
  const a = createStyleKit({ id: 'plugin-a-ui' })
  const b = createStyleKit({ id: 'plugin-b-ui' })
  assert.notEqual(a.id, b.id)
  assert.equal(a.cssVar('fg'), '--dshpc-fg')
  assert.equal(b.cssVar('fg'), '--dshpc-fg')
  assert.ok(a.tokensCss.includes('--dshpc-fg'))
})
