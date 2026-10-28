// 停靠面板的语义自检：同名唯一、上限拒绝、关栏腾位、宽度夹取、事件回调。
// 这些是「多个插件各自开面板」时最容易写错的地方，且错误不会崩、只会静默变成另一个行为。
import test from 'node:test'
import assert from 'node:assert/strict'
import {
  DEFAULT_PANEL_ID,
  clampWidth,
  closePanel,
  collapsePanel,
  emptyDock,
  expandPanel,
  isCollapsed,
  isOpen,
  openPanel,
  setPanelWidth,
} from '../dist/ui/panel-dock-logic.js'
import { DockPanel, createPanelDock } from '../dist/ui/PanelDock.js'

// ── 纯逻辑 ────────────────────────────────────────────────────────────────
test('不传 id 用默认窗口；重复打开不新增', () => {
  const first = openPanel(emptyDock(), DEFAULT_PANEL_ID, 3)
  assert.deepEqual(first.result, { ok: true, id: 'default', created: true })

  const again = openPanel(first.state, DEFAULT_PANEL_ID, 3)
  assert.deepEqual(again.result, { ok: true, id: 'default', created: false })
  assert.equal(again.state, first.state, '重复打开不应产生新状态对象')
})

test('到上限拒绝新组名：状态原样返回，结果带 reason', () => {
  let state = emptyDock()
  for (const id of ['A', 'B', 'C']) state = openPanel(state, id, 3).state

  const rejected = openPanel(state, 'D', 3)
  assert.deepEqual(rejected.result, { ok: false, id: 'D', reason: 'limit' })
  assert.equal(rejected.state, state)
  assert.deepEqual(rejected.state.ids, ['A', 'B', 'C'])
})

test('关掉一栏腾出位置后可以开新组名', () => {
  let state = emptyDock()
  for (const id of ['default', 'A', 'B']) state = openPanel(state, id, 3).state
  state = closePanel(state, 'default')
  assert.deepEqual(state.ids, ['A', 'B'])

  const opened = openPanel(state, 'C', 3)
  assert.equal(opened.result.ok, true)
  assert.deepEqual(opened.state.ids, ['A', 'B', 'C'])
})

test('关不存在的栏是幂等的', () => {
  const state = openPanel(emptyDock(), 'A', 3).state
  assert.equal(closePanel(state, 'nope'), state)
  assert.equal(isOpen(state, 'A'), true)
})

test('宽度只对开着的栏生效，值没变时原样返回', () => {
  const state = openPanel(emptyDock(), 'A', 3).state
  const widened = setPanelWidth(state, 'A', 520)
  assert.equal(widened.widths.A, 520)
  assert.equal(setPanelWidth(widened, 'A', 520), widened)
  assert.equal(setPanelWidth(state, 'nope', 520), state)
})

test('clampWidth 对 NaN / Infinity / 越界都给出确定值', () => {
  assert.equal(clampWidth(Number.NaN, 320), 320)
  assert.equal(clampWidth(Number.POSITIVE_INFINITY, 320), 320)
  assert.equal(clampWidth(800, 320, 600), 600)
  assert.equal(clampWidth(100, 320), 320)
  assert.equal(clampWidth(499.6, 320), 500)
})

// ── 控制器：真正被插件调用的那一层 ─────────────────────────────────────────
test('控制器 open / close / toggle / ids 基本行为', () => {
  const dock = createPanelDock({ storageKey: false })
  assert.deepEqual(dock.open(), { ok: true, id: 'default', created: true })
  assert.equal(dock.open('A').ok, true)
  assert.deepEqual(dock.ids(), ['default', 'A'])
  assert.equal(dock.isOpen('A'), true)

  dock.toggle('A')
  assert.equal(dock.isOpen('A'), false)

  dock.close()
  assert.deepEqual(dock.ids(), [])
})

test('控制器到上限回调 onLimitReached，且不抛异常', () => {
  const hit = []
  const dock = createPanelDock({ maxPanels: 2, storageKey: false, onLimitReached: (event) => hit.push(event.id) })
  dock.open('A')
  dock.open('B')
  const rejected = dock.open('C')

  assert.deepEqual(rejected, { ok: false, id: 'C', reason: 'limit' })
  assert.deepEqual(hit, ['C'])
  assert.deepEqual(dock.ids(), ['A', 'B'])
})

test('事件带「为什么」：onBeforeClose 可拦截，onClose 报 reason', () => {
  const seen = []
  let allow = false
  const dock = createPanelDock({
    storageKey: false,
    onBeforeClose: (event) => {
      seen.push(`before:${event.reason}`)
      return allow
    },
    onClose: (event) => seen.push(`after:${event.reason}`),
  })
  dock.open('A')

  dock.close('A', 'button')
  assert.equal(dock.isOpen('A'), true, 'onBeforeClose 返回 false 时必须留住面板')

  allow = true
  dock.close('A', 'button')
  assert.equal(dock.isOpen('A'), false)
  assert.deepEqual(seen, ['before:button', 'before:button', 'after:button'])
})

test('onOpen 只在首次打开触发，onResize 报最终宽度', () => {
  const opened = []
  const resized = []
  const dock = createPanelDock({
    storageKey: false,
    onOpen: (event) => opened.push(event.id),
    onResize: (event) => resized.push(`${event.id}:${event.width}`),
  })
  dock.open('A')
  dock.open('A')
  dock.setWidth('A', 500)

  assert.deepEqual(opened, ['A'])
  assert.deepEqual(resized, ['A:500'])
  assert.equal(dock.getSnapshot().widths.A, 500)
})

test('DockPanel 是「声明标记」，自身不渲染内容', () => {
  assert.equal(typeof DockPanel, 'function')
  assert.equal(DockPanel({ id: 'x' }), null)
})

// ── 收起为耳朵（2026-10-28）────────────────────────────────────────────────
test('收起：退出布局、宽度保留、进入耳朵列表', () => {
  let state = openPanel(emptyDock(), 'A', 3).state
  state = setPanelWidth(state, 'A', 520)
  const collapsed = collapsePanel(state, 'A')

  assert.deepEqual(collapsed.ids, [], '收起后不再占布局')
  assert.deepEqual(collapsed.collapsed, ['A'])
  assert.equal(collapsed.widths.A, 520, '宽度必须保留，展开要还原')
  assert.equal(isCollapsed(collapsed, 'A'), true)
  assert.equal(isOpen(collapsed, 'A'), false)
})

test('展开：回到布局末尾、宽度照旧、移出耳朵', () => {
  let state = openPanel(emptyDock(), 'A', 3).state
  state = setPanelWidth(state, 'A', 520)
  state = collapsePanel(state, 'A')
  const expanded = expandPanel(state, 'A')

  assert.deepEqual(expanded.ids, ['A'])
  assert.deepEqual(expanded.collapsed, [])
  assert.equal(expanded.widths.A, 520)
})

test('收起对未开的栏无效；展开对非耳朵无效', () => {
  const state = openPanel(emptyDock(), 'A', 3).state
  assert.equal(collapsePanel(state, 'nope'), state)
  assert.equal(expandPanel(state, 'A'), state)
})

test('多面板：各收各的、按收起顺序堆叠', () => {
  let state = emptyDock()
  for (const id of ['A', 'B', 'C']) state = openPanel(state, id, 3).state
  state = collapsePanel(state, 'B')
  state = collapsePanel(state, 'A')
  assert.deepEqual(state.ids, ['C'])
  assert.deepEqual(state.collapsed, ['B', 'A'])
})

test('控制器 collapse / expand / isCollapsed；开着再打开会撤销耳朵', () => {
  const dock = createPanelDock({ storageKey: false })
  dock.open('A')
  dock.setWidth('A', 480)
  dock.collapse('A')
  assert.equal(dock.isOpen('A'), false)
  assert.equal(dock.isCollapsed('A'), true)
  assert.equal(dock.getSnapshot().widths.A, 480, '收起保留宽度')

  dock.expand('A')
  assert.equal(dock.isOpen('A'), true)
  assert.equal(dock.isCollapsed('A'), false)
  assert.equal(dock.getSnapshot().widths.A, 480)

  dock.collapse('A')
  dock.open('A') // 直接 open 也应撤销耳朵，避免「既开着又留着耳朵」
  assert.equal(dock.isCollapsed('A'), false)
})

test('记忆里那份宽度读回时也过一遍夹（宽屏拖的值换窄窗口不越界）', async () => {
  const { readFile } = await import('node:fs/promises')
  const src = await readFile(new URL('../dist/ui/PanelDock.js', import.meta.url), 'utf8')
  // 只有兜底宽度走 clampWidth、存下来的值直接吃 ⇒ 上次 900 换窄窗口重开就撑满。
  assert.ok(/clampWidth\(state\.widths\[pane\.id\] \?\?/.test(src), '存下来的宽度没夹边界')
})

test('展开受数量闸约束：满栏时耳朵展开被拒并回调', () => {
  const hit = []
  const dock = createPanelDock({ maxPanels: 2, storageKey: false, onLimitReached: (event) => hit.push(event.id) })
  dock.open('A')
  dock.open('B')
  dock.collapse('A') // 现在只开着 B，A 是耳朵
  dock.open('C') // 占掉 A 腾出的位置 → 又满 2
  dock.expand('A') // 满栏，展开应被拒
  assert.equal(dock.isCollapsed('A'), true)
  assert.deepEqual(hit, ['A'])
})
