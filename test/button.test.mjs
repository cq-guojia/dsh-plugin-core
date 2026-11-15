import test from 'node:test'
import assert from 'node:assert/strict'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { Button } from '../dist/ui/index.js'

/** 静态渲染（颜色轴走 inline style，服务端就能看全）。 */
function render(props) {
  return renderToStaticMarkup(createElement(Button, props, 'x'))
}

// 2026-11-15 用户：合并 IconButton 后少了底色轴，「浅色底 + 同色系图标」表达不出来。
test('background 与 color 正交：一个管字与描边，一个只管底', () => {
  const html = render({ variant: 'outline', color: 'red', background: '#eef' })
  assert.match(html, /--btn-bg:#eef/)
  assert.match(html, /--btn-fg:red/)
  assert.match(html, /--btn-border:red/)
  // hover / active 由底色与前景混出，明暗两主题自动跟随，不写死色值
  assert.match(html, /--btn-bg-hover:color-mix\(in srgb, #eef 88%, var\(--dshpc-fg\)\)/)
  assert.match(html, /--btn-bg-active:color-mix\(in srgb, #eef 76%, var\(--dshpc-fg\)\)/)
})

test('只给 background：不碰字色与描边', () => {
  const html = render({ variant: 'ghost', background: '#eef' })
  assert.match(html, /--btn-bg:#eef/)
  assert.doesNotMatch(html, /--btn-fg:/)
  assert.doesNotMatch(html, /--btn-border:/)
})

test('实心档同时给 color 与 background：底色以 background 为准', () => {
  const html = render({ variant: 'primary', color: 'red', background: '#eef' })
  assert.match(html, /--btn-bg:#eef/)
  assert.doesNotMatch(html, /--btn-fg:red/)
})

test('两条轴都不给：不产生 inline 颜色变量', () => {
  assert.doesNotMatch(render({ variant: 'outline' }), /--btn-(bg|fg|border):/)
})
