// SessionViewModal 插槽渲染自检（SSR 静态标记）。
//
// 为什么能在这里 import 组件：`SessionViewModal` 经 `src/ui/official.js` 静态 import 官方
// primitives（宿主才解析得了），Node 里直接 import 会 ERR_MODULE_NOT_FOUND ⇒ 先 register
// `primitives-hooks.mjs` 把平台包指向本地替身（与 session-render.test.mjs 同一套）。
import test from 'node:test'
import assert from 'node:assert/strict'
import { register } from 'node:module'
import { createElement as h } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

register(new URL('./primitives-hooks.mjs', import.meta.url))
const { SessionViewModal } = await import('../dist/adv/session/SessionViewModal.js')
const { setLocale } = await import('../dist/utils/i18n.js')

setLocale('zh')

// SSR 里 useLayoutEffect / 官方模块数探针只会刷屏，不影响断言 —— 丢掉这两条噪音。
const originalError = console.error
console.error = (message, ...rest) => {
  if (typeof message === 'string' && message.includes('useLayoutEffect does nothing on the server')) return
  originalError(message, ...rest)
}
const originalInfo = console.info
console.info = (message, ...rest) => {
  if (typeof message === 'string' && message.includes('[dsh-plugin-core:session]')) return
  originalInfo(message, ...rest)
}

const noop = () => {}
const snapshot = (value) => ({ getSnapshot: () => value, subscribe: () => noop })

/** 假数据链：只要 SnapshotFace 三角色 + loadOlder / dispose（见 open-session-view.ts:36）。 */
function fakeView(chat, session = {}) {
  return { target: snapshot(chat), session: snapshot(session), inbox: snapshot(undefined), loadOlder: noop, dispose: noop }
}

const USER_NODE = {
  key: 'n1',
  kind: 'user',
  anchorSeq: 1,
  location: { kind: 'turn', turn: { turn: 1, status: 'closed' } },
  data: { content: [{ type: 'text', text: '会话里的第一句话' }] },
}
const READY_CHAT = {
  order: ['n1'],
  nodes: new Map([['n1', USER_NODE]]),
  timeline: { turns: new Map([[1, { status: 'closed' }]]) },
}

function render(props = {}) {
  return renderToStaticMarkup(h(SessionViewModal, {
    sessionId: 'sess-abc-123',
    view: fakeView(READY_CHAT, { openState: 'open', hasMore: true }),
    onClose: noop,
    ...props,
  }))
}

test('不传槽：不渲染槽容器，标题与 sessionId 副标题仍在（无槽一致性）', () => {
  const html = render({ heading: '任务 A 的运行记录' })
  assert.doesNotMatch(html, /dshpc-sv-body-header/)
  assert.doesNotMatch(html, /dshpc-sv-body-footer/)
  assert.match(html, /任务 A 的运行记录/)
  assert.match(html, /sess-abc-123/)
})

test('四态（空 / 加载 / 出错 / 正常）都渲染两个内容槽', () => {
  const states = [
    fakeView(undefined, { openState: 'open', hasMore: false }),
    fakeView(undefined, { openState: 'loading' }),
    fakeView(undefined, { openState: 'error' }),
    fakeView(READY_CHAT, { openState: 'open', hasMore: true }),
  ]
  for (const view of states) {
    const html = renderToStaticMarkup(h(SessionViewModal, {
      sessionId: 'sess-abc-123',
      view,
      onClose: noop,
      bodyHeader: '顶端提示',
      bodyFooter: '底端汇总',
    }))
    assert.match(html, /dshpc-sv-body-header">顶端提示/)
    assert.match(html, /dshpc-sv-body-footer">底端汇总/)
  }
})

test('顺序：顶端槽在「加载更早」与全部节点之前，底端槽在最后一条内容之后', () => {
  const html = render({ bodyHeader: '顶端提示', bodyFooter: '底端汇总' })
  const flow = html.indexOf('data-chat-flow')
  const header = html.indexOf('dshpc-sv-body-header')
  const older = html.indexOf('加载更早记录')
  const first = html.indexOf('会话里的第一句话')
  const footer = html.indexOf('dshpc-sv-body-footer')
  assert.ok(flow > -1 && header > flow, '顶端槽必须在会话流容器内')
  assert.ok(first > -1, `节点未渲染：${html.slice(0, 1600)}`)
  assert.ok(header < older, `顶端槽必须在「加载更早」之前：${html.slice(0, 1600)}`)
  assert.ok(older < first, '「加载更早」在节点之前')
  assert.ok(first < footer, '底端槽必须在最后一条内容之后')
})

test('一级标题：title 节点替换标题行，sessionId 副标题行照旧保留', () => {
  const html = render({
    heading: '旧标题不该出现',
    title: h('span', { className: 'custom-title' }, '任务 A · 进行中'),
  })
  assert.match(html, /custom-title/)
  assert.match(html, /任务 A · 进行中/)
  assert.doesNotMatch(html, /旧标题不该出现/)
  assert.match(html, /sess-abc-123/)
})

test('二级标题：header 整块替换左侧标题区，sessionId 与内置标题格子都不出现', () => {
  const html = render({ header: h('div', { className: 'custom-head' }, 'TASK-42') })
  assert.match(html, /custom-head/)
  assert.match(html, /dshpc-overlay-head__heading--custom/)
  assert.doesNotMatch(html, /sess-abc-123/)
  assert.doesNotMatch(html, /dshpc-overlay-head__title"/)
})

test('headerActions 排在「继续对话」左边（继续对话与 ✕ 恒居右）', () => {
  const html = render({
    openHostSession: noop,
    headerActions: h('button', { className: 'custom-action' }, '导出'),
  })
  const cont = html.indexOf('继续对话')
  const custom = html.indexOf('custom-action')
  const close = html.indexOf('dshpc-overlay-head__close')
  assert.ok(cont > -1, '核心「继续对话」必须在')
  assert.ok(custom < cont && cont < close, '自定义动作在「继续对话」左边，✕ 最右')
})

test('不传 headerActions 时动作区不被额外容器占位（只有核心按钮）', () => {
  const html = render({ openHostSession: noop })
  assert.doesNotMatch(html, /custom-action/)
  const actions = html.indexOf('dshpc-overlay-head__actions')
  assert.ok(actions > -1)
})

const TAIL_NODE = {
  key: 'tail1',
  kind: 'turn-tail',
  anchorSeq: 3,
  location: { kind: 'turn', turn: { turn: 1, status: 'closed' } },
  data: { turn: 1, seq: 3, closing: { time: 0, blocks: [{ kind: 'text', text: '大模型回复' }] } },
}
const CHAT_WITH_TAIL = {
  order: ['n1', 'tail1'],
  nodes: new Map([['n1', USER_NODE], ['tail1', TAIL_NODE]]),
  timeline: { turns: new Map([[1, { status: 'closed' }]]) },
}

test('底端槽在尾操作行容器内、复制/用量行之前（交付文件之后），且只出现一次', () => {
  const html = renderToStaticMarkup(h(SessionViewModal, {
    sessionId: 'sess-abc-123',
    view: fakeView(CHAT_WITH_TAIL, { openState: 'open', hasMore: true }),
    onClose: noop,
    bodyFooter: '底端汇总',
  }))
  const first = html.indexOf('会话里的第一句话')
  const tailRoot = html.indexOf('data-turn-tail=')
  const footer = html.indexOf('底端汇总')
  const actions = html.indexOf('data-clock="end"')
  assert.ok(first < tailRoot, '尾操作行在最后一条内容之后')
  assert.ok(tailRoot < footer, '底端槽在尾容器内（交付卡那一层）')
  assert.ok(footer < actions, '底端槽必须在复制/分支/用量操作行之前')
  assert.equal(html.split('底端汇总').length, 2, '底端槽只渲染一处')
})

test('末尾没有回复（order 最后不是 turn-tail）时底端槽回落到流末尾', () => {
  const html = render({ bodyFooter: '底端汇总' })
  assert.equal(html.split('底端汇总').length, 2)
  assert.doesNotMatch(html, /data-turn-tail=/)
})
