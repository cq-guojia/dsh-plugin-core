// SideSheet（覆盖式侧边抽屉）自检：结构 + 「和 PanelDock 共用同一套皮肤」两条契约。
// 没有浏览器渲染测试，所以这里只钉 SSR 的结构 —— 定位、拖宽与动效靠真机看。
import test from 'node:test'
import assert from 'node:assert/strict'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { Modal, SideSheet } from '../dist/ui/index.js'
import { setLocale } from '../dist/utils/index.js'

setLocale('zh')

test('默认从左侧滑入，遮罩走浮层公共件（不是自己一层 fixed）', () => {
  const html = renderToStaticMarkup(createElement(SideSheet, { title: '文件', onClose: () => {} }, '内容'))
  assert.match(html, /class="dshpc-overlay dshpc-overlay--side"/, '遮罩没用共用件（或是 modal 档）')
  assert.match(html, /dshpc-sheet--left/, '默认不是左侧档')
  assert.match(html, /内容/)
})

test('面板皮肤与 PanelDock 同一份（side-surface + dock 头部 / 拖拽条）', () => {
  const html = renderToStaticMarkup(createElement(SideSheet, { title: '文件', onClose: () => {} }))
  assert.match(html, /class="dshpc-side-surface dshpc-sheet dshpc-sheet--left"/, '没有挂共用皮肤基类')
  assert.match(html, /class="dshpc-dock__head"/, '头部不是 PanelDock 那一套')
  assert.match(html, /class="dshpc-dock__resizer"/, '默认应当可拖宽')
  // 分栏的 body 不带内距（内距归 FileBrowser 那类内容组件），抽屉是通用容器必须自带。
  assert.match(html, /class="dshpc-dock__body dshpc-sheet__body"/, '内容区没有自带内距，文字会贴面板边')
  assert.match(html, /class="dshpc-dock__close dshpc-dock__close--abs"/, '关闭钮位置与 PanelDock 不一致')
})

test('抽屉没有「收起」：不渲染收起钮、不渲染耳朵', () => {
  const html = renderToStaticMarkup(createElement(SideSheet, { title: 't', onClose: () => {} }))
  assert.doesNotMatch(html, /dshpc-dock__collapse/, '抽屉不该有收起钮')
  assert.doesNotMatch(html, /dshpc-dock__ear/, '抽屉不该有收起后的耳朵')
})

test('宽度：默认 460px（与 PanelDock 同档），可传初始宽度；resizable=false 去掉拖拽条', () => {
  assert.match(renderToStaticMarkup(createElement(SideSheet, { title: 't' })), /width:460px/)
  assert.match(renderToStaticMarkup(createElement(SideSheet, { width: 720 })), /width:720px/)
  const fixed = renderToStaticMarkup(createElement(SideSheet, { title: 't', resizable: false }))
  assert.doesNotMatch(fixed, /dshpc-dock__resizer/, 'resizable=false 仍渲染了拖拽条')
})

test('side="right" 换右侧档，拖拽条镜像到左缘（由 CSS 做）', () => {
  const right = renderToStaticMarkup(createElement(SideSheet, { side: 'right', title: 't' }))
  assert.match(right, /dshpc-sheet--right/)
})

test('没有 onClose 就不出关闭钮；header={null} 时关闭钮浮到右上角', () => {
  assert.doesNotMatch(
    renderToStaticMarkup(createElement(SideSheet, { title: 't' })),
    /dshpc-dock__close/,
    '没 onClose 不该出关闭钮',
  )
  const noHead = renderToStaticMarkup(createElement(SideSheet, { header: null, onClose: () => {} }))
  assert.doesNotMatch(noHead, /class="dshpc-dock__head"/, 'header={null} 仍渲染了内置头')
  assert.match(noHead, /dshpc-dock__close--floating/, '无头部时关闭钮没有浮起来')
})

test('关闭钮文案走内置字典', () => {
  assert.match(renderToStaticMarkup(createElement(SideSheet, { title: 't', onClose: () => {} })), /aria-label="关闭面板"/)
  setLocale('en')
  assert.match(renderToStaticMarkup(createElement(SideSheet, { title: 't', onClose: () => {} })), /aria-label="Close panel"/)
  setLocale('zh')
})

test('Modal 与 SideSheet 共用遮罩（只有档位不同）', () => {
  const modal = renderToStaticMarkup(createElement(Modal, { title: 'm', onClose: () => {} }, 'x'))
  assert.match(modal, /class="dshpc-overlay dshpc-overlay--center"/)
  assert.match(modal, /class="dshpc-modal"/)
})
