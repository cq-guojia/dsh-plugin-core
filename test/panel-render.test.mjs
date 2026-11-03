// 渲染级自检（2026-11-03）：用 SSR 断言**结构**，不再只 grep 源码字符串。
//
// 为什么用 renderToStaticMarkup：本仓已有 `react-dom/server`，零新增依赖（用户 2026-11-03 定「不依赖」）。
// 官方 primitives 只存在于宿主，Node 里 import 会 ERR_MODULE_NOT_FOUND ⇒ 本文件先用
// `primitives-hooks.mjs` 把那个包指向本地替身，再**动态** import 被测模块。
import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { register } from 'node:module'
import { createElement as h } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

register(new URL('./primitives-hooks.mjs', import.meta.url))

const { PanelClose, PanelSurface } = await import('../dist/ui/panel.js')
const { Modal } = await import('../dist/ui/Modal.js')
const { LandingBody } = await import('../dist/explorer/landing.js')
const { CrumbNav, PlainNav } = await import('../dist/explorer/crumb-nav.js')
const { PreviewTitleBar } = await import('../dist/explorer/preview-title-bar.js')

const tt = (key) => key

test('PanelSurface：只出皮肤类，档位与追加类名并存', () => {
  const modal = renderToStaticMarkup(h(PanelSurface, { tier: 'modal' }, 'x'))
  assert.match(modal, /^<div class="dshpc-panel dshpc-panel--modal">/)
  const popover = renderToStaticMarkup(h(PanelSurface, { tier: 'popover', className: 'dshpc-fb', role: 'dialog' }, 'x'))
  assert.match(popover, /class="dshpc-panel dshpc-panel--popover dshpc-fb"/)
  assert.match(popover, /role="dialog"/)
})

test('PanelSurface：attrs 原样透传（data-* 钩子不能丢）', () => {
  const html = renderToStaticMarkup(
    h(PanelSurface, { tier: 'popover', attrs: { 'data-dshpc-picker-panel': '', 'aria-modal': 'true' } }, 'x'),
  )
  assert.match(html, /data-dshpc-picker-panel=""/)
  assert.match(html, /aria-modal="true"/)
})

test('PanelClose：唯一关闭钮，带无障碍名与追加类名能力', () => {
  const html = renderToStaticMarkup(h(PanelClose, { label: '关闭', onClick: () => {}, className: 'dshpc-overlay-head__close' }))
  assert.match(html, /class="dshpc-panel__close dshpc-overlay-head__close"/)
  assert.match(html, /aria-label="关闭"/)
})

test('Modal：遮罩居中档 + 面板 modal 档 + 关闭钮走公共件', () => {
  const html = renderToStaticMarkup(h(Modal, { title: 't', onClose: () => {} }, 'x'))
  assert.match(html, /class="dshpc-overlay dshpc-overlay--center"/)
  assert.match(html, /class="dshpc-panel dshpc-panel--modal dshpc-modal"/)
  assert.match(html, /class="dshpc-panel__close dshpc-overlay-head__close"/)
})

test('落地页：根行 + 工作区行；选择器形态才出行尾「选择」钮', () => {
  const common = {
    translate: tt,
    roots: [{ label: '根目录', path: '/' }],
    anchors: [{ title: 'proj', path: '/w/proj' }],
    onOpen: () => {},
    onPickDir: () => {},
  }
  const pickable = renderToStaticMarkup(h(LandingBody, { ...common, pickable: true }))
  assert.match(pickable, /dshpc-fb__row-name">根目录</)
  assert.match(pickable, /dshpc-fb__row-name">proj</)
  assert.equal(pickable.match(/dshpc-fb__row-act/g)?.length, 2, '两行都该有「选择」钮')
  const browse = renderToStaticMarkup(h(LandingBody, { ...common, pickable: false }))
  assert.equal(browse.match(/dshpc-fb__row-act/g), null, '浏览形态不该有「选择」钮')
})

const navBase = {
  translate: tt,
  landing: false,
  crumbs: [{ label: '根目录', path: '/' }, { label: 'w', path: '/w' }],
  overflow: false,
  menuItems: [],
  menuOpen: false,
  onToggleMenu: () => {},
  onCloseMenu: () => {},
  onLoadDir: () => {},
  pickNow: null,
  regionRef: { current: null },
  measureRef: { current: null },
}

test('面包屑栏：▾ 打开时菜单挂 menu 档与 panel 类', () => {
  const closed = renderToStaticMarkup(h(CrumbNav, navBase))
  assert.equal(closed.includes('dshpc-fb__crumbs-menu'), false, '菜单收起时不该渲染菜单')
  const open = renderToStaticMarkup(h(CrumbNav, { ...navBase, menuOpen: true }))
  assert.match(open, /class="dshpc-panel dshpc-panel--menu dshpc-fb__crumbs-menu"/)
  assert.match(open, /class="dshpc-fb__crumbs-backdrop"/)
})

test('面包屑栏：落地页留空位；溢出只显示末段；关闭钮走公共件', () => {
  const landing = renderToStaticMarkup(h(CrumbNav, { ...navBase, landing: true }))
  assert.equal(landing.includes('dshpc-fb__crumbs-measure'), false, '落地页不该渲染测量条')
  const overflow = renderToStaticMarkup(h(CrumbNav, { ...navBase, overflow: true }))
  // 溢出时可见区只剩「当前层」一段（带 --current），隐藏测量条仍渲染全链（它按全链量宽度）。
  assert.equal(overflow.match(/dshpc-fb__crumb--current/g)?.length, 1, '溢出时可见区只该剩最后一段')
  assert.equal(renderToStaticMarkup(h(CrumbNav, navBase)).includes('crumb--current'), false, '不溢出时不该有「当前段」标记')
  const withClose = renderToStaticMarkup(h(CrumbNav, { ...navBase, onClose: () => {} }))
  assert.match(withClose, /class="dshpc-panel__close"/, '关闭钮没走公共件')
})

test('越界形态：整条换成只读路径（没有 ▾）', () => {
  const html = renderToStaticMarkup(h(PlainNav, { translate: tt, path: '/other/x', pickNow: null }))
  assert.match(html, /dshpc-fb__bar-plain/)
  assert.equal(html.includes('dshpc-fb__menu-wrap'), false, '越界不该给 ▾ 入口')
})

test('预览标题栏：md/html 才出渲染⇄源码切换', () => {
  const base = {
    translate: tt,
    path: '/w/a.md',
    copied: false,
    onCopyPath: () => {},
    onReload: () => {},
    onSourceViewChange: () => {},
    sourceView: false,
  }
  const switchable = renderToStaticMarkup(h(PreviewTitleBar, { ...base, switchable: true, isMarkdown: true }))
  assert.match(switchable, /dshpc-seg/)
  const plain = renderToStaticMarkup(h(PreviewTitleBar, { ...base, path: '/w/a.png', switchable: false, isMarkdown: false }))
  assert.equal(plain.includes('dshpc-seg'), false, '不可切换的文件不该出 Segmented')
})

// 拆分自检：展示层从 FileBrowser 搬走后，这些标记只应出现在各自的模块里。
test('展示模块已从 FileBrowser 拆出（落地页 / 面包屑栏 / 预览标题栏）', async () => {
  const read = async (rel) => readFile(new URL(`../dist/explorer/${rel}`, import.meta.url), 'utf8')
  const browser = await read('FileBrowser.js')
  const nav = await read('crumb-nav.js')

  assert.ok(browser.includes('./landing.js'), 'FileBrowser 没接落地页模块（拆了但没用）')
  assert.ok(browser.includes('./crumb-nav.js'), 'FileBrowser 没接面包屑栏模块')
  assert.ok(browser.includes('./preview-title-bar.js'), 'FileBrowser 没接预览标题栏模块')
  assert.ok(nav.includes('dshpc-fb__crumbs-backdrop'), '面包屑栏没搬走 ▾ 遮罩')
  assert.ok(!browser.includes('dshpc-fb__crumbs-backdrop'), '▾ 遮罩在 FileBrowser 里还有一份')
  assert.ok(!browser.includes('dshpc-fb__title-inner'), '预览标题栏在 FileBrowser 里还有一份')
})
