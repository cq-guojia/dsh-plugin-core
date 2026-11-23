import test from 'node:test'
import assert from 'node:assert/strict'
import { isModalDialogOpen } from '../dist/ui/infra/overlay.js'

const node = (attrs = {}, style = {}, ancestor = null, matches = []) => ({
  hasAttribute: (name) => Object.hasOwn(attrs, name),
  getAttribute: (name) => attrs[name] ?? null,
  closest: (selector) => (ancestor !== null && /data-dshpc-backgrounded|\[hidden\]|aria-hidden/.test(selector) ? ancestor : null),
  matches: (selector) => matches.includes(selector),
  style,
})
const doc = (nodes) => ({ querySelectorAll: () => nodes })

test('isModalDialogOpen 认标准模态语义，不按类名或组件名登记', () => {
  assert.equal(isModalDialogOpen(undefined), false, 'SSR / 无 document 时视为没有模态')
  assert.equal(isModalDialogOpen(doc([])), false)
  assert.equal(isModalDialogOpen(doc([node({ 'aria-modal': 'true' })])), true)
  assert.equal(isModalDialogOpen(doc([node({ role: 'alertdialog' })])), true)
  assert.equal(
    isModalDialogOpen(doc([node({ open: '' }, {}, null, ['dialog[open]', 'dialog:modal'])])),
    true,
    'showModal 打开的原生 dialog',
  )
})

test('隐藏 / backgrounded / 非模态 dialog 不算活动模态', () => {
  assert.equal(isModalDialogOpen(doc([node({ 'aria-modal': 'true', hidden: '' })])), false)
  assert.equal(isModalDialogOpen(doc([node({ 'aria-modal': 'true', 'aria-hidden': 'true' })])), false)
  assert.equal(isModalDialogOpen(doc([node({ 'aria-modal': 'true' }, {}, {})])), false, 'backgrounded 祖先内不算')
  assert.equal(isModalDialogOpen(doc([node({ 'aria-modal': 'true' }, {}, { hidden: '' })])), false, '祖先 hidden 也不算')
  assert.equal(isModalDialogOpen(doc([node({ 'aria-modal': 'true' }, { visibility: 'hidden' })])), false)
  assert.equal(isModalDialogOpen(doc([node({ 'aria-modal': 'true' }, { display: 'none' })])), false)
  assert.equal(
    isModalDialogOpen(doc([node({ open: '', 'aria-modal': 'false' }, {}, null, ['dialog[open]'])])),
    false,
    'show() 打开的非模态 dialog 不算',
  )
})

test('退场面板的 CSS 隐藏也能被识别，不只是内联 style', () => {
  const previous = globalThis.window
  globalThis.window = { getComputedStyle: () => ({ visibility: 'hidden', display: 'block' }) }
  try {
    assert.equal(isModalDialogOpen(doc([node({ 'aria-modal': 'true' })])), false, '退场动画期间不算活动模态')
  } finally {
    if (previous === undefined) delete globalThis.window
    else globalThis.window = previous
  }
})
