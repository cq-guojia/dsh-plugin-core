// session 子包自检。
//
// ⚠ 只 import **不牵连官方平台模块**的叶子模块：mirror 组件经 src/ui/official.js 静态
// import '@deepseek-ai/dsh-client-ui-primitives'（宿主才解析得了），Node 里 import 会
// ERR_MODULE_NOT_FOUND（official.ts 头注记着这个坑）⇒ 组件观感验证走 demo 预览站，
// 这里钉纯函数与数据链（open-session-view 只 import 类型，编译后零依赖）。
import test from 'node:test'
import assert from 'node:assert/strict'
import { parseOfficialCss, ocOr, officialModuleCount } from '../dist/session/official-classes.js'
import { openSessionView, DEFAULT_RETAIN_SOURCE } from '../dist/session/open-session-view.js'
import { buildProcessGroups, toolActivity, processTitle } from '../dist/session/mirror/process-groups.js'
import { formatRunDuration, formatMessageClock, formatTokens, formatExactCount, formatCacheHitPercent } from '../dist/session/mirror/message-chrome.js'
import { setLocale, t } from '../dist/utils/index.js'

// ── official-classes：官方 CSS module 类名运行时发现 ──

test('parseOfficialCss：哈希_语义名 切分（含哈希以 _ 开头的实测形态）', () => {
  // 一个 style 标签 = 一个模块 = 一个哈希；实测 GenericCommandCard 的哈希以 _ 开头。
  const css = '._5OnbHa_root{display:flex}._5OnbHa_frame{flex:auto}._5OnbHa_chevron{color:red}'
  const map = parseOfficialCss(css)
  assert.equal(map.get('root'), '_5OnbHa_root')
  assert.equal(map.get('frame'), '_5OnbHa_frame')
  assert.equal(map.get('chevron'), '_5OnbHa_chevron')
  assert.equal(map.size, 3)
})

test('parseOfficialCss：解析不出哈希前缀时返回空表', () => {
  assert.equal(parseOfficialCss('.root{color:red}').size, 0)
  assert.equal(parseOfficialCss('').size, 0)
})

test('ocOr：官方类缺失回退自绘类；无 document 时模块数为 0', () => {
  assert.equal(ocOr('ChatView', 'frame', 'dshpc-sv-body'), 'dshpc-sv-body')
  assert.equal(officialModuleCount(), 0)
})

// ── open-session-view：retain → binding → target 数据链 ──

/** 造一套假宿主服务：retain 物化 binding，target 给快照。 */
function fakeHost(options = {}) {
  const calls = { retain: [], release: 0, open: 0, loadOlder: 0 }
  let released = false
  const session = {
    openState: 'open',
    hasMore: true,
    open() { calls.open += 1; return Promise.resolve() },
    loadOlder() { calls.loadOlder += 1; return Promise.resolve() },
  }
  const listeners = new Set()
  const chatSnap = { order: ['k1'], legacy: { nodes: [] } }
  const target = {
    getSnapshot: () => chatSnap,
    subscribe: (fn) => { listeners.add(fn); return () => { listeners.delete(fn) } },
  }
  const binding = {
    sessionId: 's1',
    session: {
      getSnapshot: () => session,
      subscribe: () => () => {},
      open() { calls.open += 1; return Promise.resolve() },
      loadOlder() { calls.loadOlder += 1; return Promise.resolve() },
    },
  }
  const sessions = {
    retain(target, opts) {
      calls.retain.push([target, opts])
      if (options.retainThrows === true) throw new Error('unknown session')
      return { release() { released = true; calls.release += 1 } }
    },
    binding(id) { return options.bindingUndefined === true ? undefined : binding },
  }
  const uiConversation = {
    binding(b) {
      if (options.uiThrows === true) throw new Error('inactive session')
      return { target: (name) => { if (name !== 'chat') throw new Error('bad target'); return target } }
    },
  }
  return { sessions, uiConversation, calls, isReleased: () => released }
}

test('openSessionView：retain（默认 source）→ binding → open → target 全链路', () => {
  const host = fakeHost()
  const view = openSessionView(host.sessions, host.uiConversation, 's1')
  assert.notEqual(view, null)
  assert.deepEqual(host.calls.retain, [['s1', { source: DEFAULT_RETAIN_SOURCE }]])
  assert.equal(host.calls.open, 1, 'retain 后应探测拉尾页')
  assert.equal(view.target.getSnapshot().order.length, 1)
  view.loadOlder()
  assert.equal(host.calls.loadOlder, 1)
  view.dispose()
  assert.equal(host.isReleased(), true, '关闭必须 release retain 引用')
})

test('openSessionView：retain source 可参数化（写进宿主 retainedBy 的键）', () => {
  const host = fakeHost()
  openSessionView(host.sessions, host.uiConversation, 's1', 'my-plugin')
  assert.deepEqual(host.calls.retain, [['s1', { source: 'my-plugin' }]])
})

test('openSessionView：binding 取不到（retain 也没物化）时返回 null 且释放引用', () => {
  const host = fakeHost({ bindingUndefined: true })
  assert.equal(openSessionView(host.sessions, host.uiConversation, 's1'), null)
  assert.equal(host.isReleased(), true)
})

test('openSessionView：uiConversation.binding 抛错（inactive）时返回 null', () => {
  const host = fakeHost({ uiThrows: true })
  assert.equal(openSessionView(host.sessions, host.uiConversation, 's1'), null)
})

test('openSessionView：retain 抛错不阻断（软着陆，继续尝试 binding）', () => {
  const host = fakeHost({ retainThrows: true })
  const view = openSessionView(host.sessions, host.uiConversation, 's1')
  assert.notEqual(view, null, 'retain 抛错只告警，binding 仍有机会')
})

// ── process-groups：官方 grouped('chat') 算法移植 ──

const node = (key, kind, turn, extra = {}) => ({ key, kind, anchorSeq: 1, location: { kind: 'turn', turn: { turn, status: 'closed' } }, data: {}, ...extra })

test('buildProcessGroups：INDEPENDENT kind 独立成条目，工具调用入组', () => {
  const order = ['u1', 't1', 't2', 'tp', 'tail']
  const store = new Map([
    ['u1', node('u1', 'user', 1)],
    ['t1', node('t1', 'tool-call', 1, { data: { root: { callId: 'c1', name: 'read', argsRaw: '{}' } } })],
    ['t2', node('t2', 'tool-call', 1, { data: { root: { callId: 'c2', name: 'bash', argsRaw: '{}' } } })],
    ['tp', node('tp', 'turn-process', 1)],
    ['tail', node('tail', 'turn-tail', 1)],
  ])
  const view = buildProcessGroups(order, (k) => store.get(k), () => true)
  // ⚠ turn-process 是「独立条目但不闭合组」（官方 process-groups.js:10580-10586）⇒
  // 组要等下一个 INDEPENDENT kind（turn-tail）才落位，排在 turn-process 之后。
  assert.deepEqual(view.entries.map((e) => e.kind), ['node', 'node', 'group', 'node'])
  assert.equal(view.entries[0].key, 'u1')
  assert.equal(view.entries[1].key, 'tp')
  assert.equal(view.entries[3].key, 'tail')
  const group = view.groups.get(view.entries[2].key)
  assert.equal(group.members.length, 2)
  assert.deepEqual(group.data.summary.counts.map((c) => c.kind), ['read', 'commands'])
})

test('buildProcessGroups：assistant-step 思考入组、回复独立', () => {
  const order = ['a1']
  const store = new Map([
    ['a1', node('a1', 'assistant-step', 1, { data: { blocks: [{ kind: 'reasoning', text: '想' }, { kind: 'text', text: '答' }] } })],
  ])
  const view = buildProcessGroups(order, (k) => store.get(k), () => true)
  assert.deepEqual(view.entries.map((e) => `${e.kind}:${e.groupPart ?? ''}`), ['group:', 'node:response'])
})

test('toolActivity：官方工具名 → 活动类别映射', () => {
  assert.equal(toolActivity('read'), 'read')
  assert.equal(toolActivity('read_image'), 'readImage')
  assert.equal(toolActivity('grep'), 'search')
  assert.equal(toolActivity('apply_patch'), 'edit')
  assert.equal(toolActivity('terminal_send'), 'commands')
  assert.equal(toolActivity('unknown_tool'), 'tools')
})

test('processTitle：zh 两类「A并B」去已前缀、超三类补等', () => {
  setLocale('zh')
  assert.equal(processTitle({ counts: [{ kind: 'read' }, { kind: 'commands' }] }, t), '已读取文件并执行了命令')
  assert.equal(
    processTitle({ counts: [{ kind: 'read' }, { kind: 'write' }, { kind: 'edit' }, { kind: 'code' }] }, t),
    '已读取文件，已写入文件，修改了文件等',
  )
  setLocale('en')
  assert.equal(processTitle({ counts: [{ kind: 'read' }, { kind: 'commands' }] }, t), 'Read files and ran commands')
  setLocale('zh')
})

// ── message-chrome：官方文案格式化逐字钉住 ──

test('formatRunDuration / formatMessageClock / formatTokens 逐字对齐官方', () => {
  setLocale('zh')
  assert.equal(formatRunDuration(34_000, t), '34秒')
  assert.equal(formatRunDuration(65_000, t), '1分05秒')
  assert.equal(formatRunDuration(3_725_000, t), '1小时02分05秒')
  assert.equal(formatMessageClock(new Date(2026, 8, 26, 1, 35).getTime(), t, new Date(2026, 8, 26, 12, 0).getTime()), '01:35')
  assert.equal(formatMessageClock(new Date(2026, 8, 26, 1, 35).getTime(), t, new Date(2026, 8, 20, 12, 0).getTime()), '9月26日 01:35')
  assert.equal(formatMessageClock(new Date(2025, 8, 26, 1, 35).getTime(), t, new Date(2026, 8, 20, 12, 0).getTime()), '2025年9月26日 01:35')
  assert.equal(formatTokens(517, t), '517')
  assert.equal(formatTokens(12_200, t), '12.2K')
  assert.equal(formatTokens(1_200_000, t), '1.2M')
  assert.equal(formatExactCount(91_500, t), '91,500 tok')
  setLocale('en')
  assert.equal(formatRunDuration(65_000, t), '1m 05s')
  assert.equal(formatTokens(12_200, t), '12.2K')
  setLocale('zh')
})

test('formatCacheHitPercent：部分命中不四舍五入成 100%', () => {
  assert.equal(formatCacheHitPercent(0, 100, 0), '0')
  assert.equal(formatCacheHitPercent(100, 100, 0), '100')
  assert.equal(formatCacheHitPercent(99, 100, 0), '99')
  assert.equal(formatCacheHitPercent(999, 1000, 0), '99.9', '99.9% 不四舍五入成 100%（官方自动加精度）')
  // 9999/10000 = 99.99% ⇒ 官方自动加精度成 99.99 而不是 100
  assert.equal(formatCacheHitPercent(9999, 10000, 0), '99.99')
  assert.equal(formatCacheHitPercent(50, 0, 0), null, 'promptTokens 为 0 才 null')
})

// ── 文案：会话预览新增键中英齐全 ──

test('会话预览文案中英齐全（镜像官方词典的新增键）', () => {
  const keys = [
    'sessionLoadOlder', 'sessionProcess', 'sessionArchived', 'continueBranch', 'forkConfirmTitle',
    'turnProcessTook', 'chatDeepDiving', 'thinkLabel', 'durationSeconds', 'retryStatus', 'turnErrorTitle',
    'clockDate', 'turnUsageTitle', 'turnUsageCount', 'numberThousand', 'stepProcessDoneRead',
    'stepProcessJoinTwo', 'toolTitleRead', 'toolTitleGeneric', 'toolInputLabel', 'rowRunning',
    'readWindow', 'terminalExitCode', 'diffWrapLabel', 'deliverRowTitle', 'deliverAll',
    'branchLabel', 'composerPlaceholder', 'composerHint', 'forkFailed',
  ]
  for (const key of keys) {
    setLocale('zh')
    assert.notEqual(t(key), key, `${key} 应能在 zh 字典里找到`)
    setLocale('en')
    assert.notEqual(t(key), key, `${key} 应能在 en 字典里找到`)
  }
  setLocale('zh')
})
