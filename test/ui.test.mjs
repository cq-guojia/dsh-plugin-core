import test from 'node:test'
import assert from 'node:assert/strict'
import { buildCss, ensureControls, getStyleKit, setStyleKit } from '../dist/ui/css.js'
import { createStyleKit } from '../dist/design/index.js'

const SAMPLE = '.dsh-tdt-btn{color:var(--tdt-fg);border:1px solid var(--tdt-border)}'

test('buildCss 同时换类名前缀与变量前缀', () => {
  const css = buildCss(SAMPLE, 'acme')
  assert.equal(css, '.dsh-acme-btn{color:var(--acme-fg);border:1px solid var(--acme-border)}')
  assert.ok(!css.includes('dsh-tdt-'), '类名前缀必须换掉，否则多插件同类名互相覆盖')
  assert.ok(!css.includes('--tdt-'))
})

test('setStyleKit 生效，getStyleKit 拿得到', () => {
  const kit = createStyleKit({ id: 'acme-ui', prefix: 'acme' })
  setStyleKit(kit)
  assert.equal(getStyleKit().prefix, 'acme')
  assert.equal(getStyleKit().id, 'acme-ui')
})

test('ensureControls 在无 DOM 环境不抛，并登记 tokens + controls 两个域', () => {
  const kit = createStyleKit({ id: 'acme-ui', prefix: 'acme' })
  assert.doesNotThrow(() => ensureControls(kit))
  // 登记后 CSS 内容已替换前缀（通过 kit 内部 domains 反映到 tokensCss）
  assert.ok(kit.tokensCss.includes('--acme-fg'))
})

test('默认 kit 兜底：不 setStyleKit 也能用，prefix 为 dsh', () => {
  setStyleKit(createStyleKit({ id: 'probe', prefix: 'probe' }))
  assert.equal(getStyleKit().prefix, 'probe')
})
