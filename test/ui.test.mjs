import test from 'node:test'
import assert from 'node:assert/strict'
import { buildCss, ensureControls, getStyleKit, setStyleKit } from '../dist/ui/css.js'
import { createStyleKit } from '../dist/design/index.js'

const SAMPLE = '.dsh-tdt-btn{color:var(--tdt-fg);border:1px solid var(--tdt-border)}'

test('buildCss 换变量前缀，但保留类名前缀（与控件硬编码 className 对齐）', () => {
  const css = buildCss(SAMPLE, 'acme')
  assert.equal(css, '.dsh-tdt-btn{color:var(--acme-fg);border:1px solid var(--acme-border)}')
  assert.ok(!css.includes('--tdt-'))
  // 类名必须原样保留：控件里的 className 是硬编码的 dsh-tdt-*，换掉就对不上、样式全丢
  assert.ok(css.includes('dsh-tdt-btn'))
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

test('setStyleKit 覆盖默认 kit，getStyleKit 反映新值', () => {
  setStyleKit(createStyleKit({ id: 'probe', prefix: 'probe' }))
  assert.equal(getStyleKit().prefix, 'probe')
})
