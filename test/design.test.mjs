import test from 'node:test'
import assert from 'node:assert/strict'
import { buildTokensCss, createStyleKit, DARK_THEME_SELECTOR } from '../dist/design/index.js'

test('token 前缀被整体替换，不留源码前缀', () => {
  const css = buildTokensCss('acme')
  assert.ok(!css.includes('--tdt-'), '不应残留 --tdt-')
  assert.ok(css.includes('--acme-fg'))
  assert.ok(css.includes('--acme-surface-1'))
})

test('深色段保留，判据是宿主写入的 body[data-ds-dark-theme]', () => {
  const css = buildTokensCss('acme')
  assert.ok(css.includes(DARK_THEME_SELECTOR))
  // 原文注释里会提到 prefers-color-scheme（是禁令说明），所以只查真实用法：不许出现媒体查询
  assert.ok(!/@media[^{]*prefers-color-scheme/.test(css), '明暗判据禁止跟系统')
})

test('prefix 非法时报错', () => {
  assert.throws(() => buildTokensCss('1bad'), /prefix/)
  assert.throws(() => buildTokensCss('has space'), /prefix/)
})

test('style kit 在无 DOM 环境下静默跳过，不抛', () => {
  const kit = createStyleKit({ id: 'test-kit', prefix: 'acme' })
  assert.equal(kit.cssVar('fg'), '--acme-fg')
  kit.ensureStyles()
  kit.registerStyle('controls', '.x{color:var(--acme-fg)}')
  kit.applyStyle('controls', '.x{color:var(--acme-fg)}')
  assert.equal(typeof document, 'undefined')
})

test('两个插件各自建 kit，id 与前缀互不干扰', () => {
  const a = createStyleKit({ id: 'plugin-a-ui', prefix: 'a' })
  const b = createStyleKit({ id: 'plugin-b-ui', prefix: 'b' })
  assert.notEqual(a.id, b.id)
  assert.equal(a.cssVar('fg'), '--a-fg')
  assert.equal(b.cssVar('fg'), '--b-fg')
  assert.ok(a.tokensCss.includes('--a-fg'))
  assert.ok(!a.tokensCss.includes('--b-fg'))
})
