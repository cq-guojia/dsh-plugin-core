// session 子包自检。
//
// ⚠ 只 import **不牵连官方平台模块**的叶子模块：mirror 组件经 src/ui/official.js 静态
// import '@deepseek-ai/dsh-client-ui-primitives'（宿主才解析得了），Node 里 import 会
// ERR_MODULE_NOT_FOUND（official.ts 头注记着这个坑）⇒ 组件观感验证走 demo 预览站，
// 这里钉纯函数与数据链（open-session-view 只 import 类型，编译后零依赖）。
import test from 'node:test'
import assert from 'node:assert/strict'
import { parseOfficialCss, officialClass, officialModuleCount } from '../dist/session/official-classes.js'
import { openSessionView, DEFAULT_RETAIN_SOURCE } from '../dist/session/open-session-view.js'
import { buildProcessGroups, toolActivity, processTitle } from '../dist/session/mirror/process-groups.js'
import {
  changesSummaryUrl,
  parseChangesSummary,
  turnDeliverablesChangesSeq,
  turnDeliverablesValue,
  changesDiffUrl,
  parseChangesDiff,
  hunkRows,
  hunkHeader,
  diffNoteKey,
  DIFF_MAX_RENDERED_LINES,
} from '../dist/session/changes.js'
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

test('officialClass：官方模块缺席时返回 null（调用方退化空类，不白屏）；无 document 时模块数为 0', () => {
  // 2026-10-23 起不再自绘兜底（本包只跑 DSH 宿主、官方样式必在场）：取不到 ⇒ null ⇒ `?? ''`。
  assert.equal(officialClass('ChatView', 'frame'), null)
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
    binding(_id) { return options.bindingUndefined === true ? undefined : binding },
  }
  const uiConversation = {
    binding(_b) {
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

// ── 官方「已编辑文件」卡（changes.ts：api/changes.summary 契约） ──

test('changesSummaryUrl：官方文档相对路由 + 查询参数', () => {
  assert.equal(
    changesSummaryUrl('session-abc', 42),
    'api/changes.summary?sessionId=session-abc&seq=42',
  )
})

test('parseChangesSummary：官方 isChangesSummary 逐字段校验', () => {
  const ok = {
    turn: 3,
    total: 1,
    added: 3,
    deleted: 8,
    files: [{ path: '/w/timestamp.md', display: 'timestamp.md', added: 3, deleted: 8 }],
  }
  assert.deepEqual(parseChangesSummary(ok), ok)
  // 二进制 / 超限是合法可选标记
  assert.ok(parseChangesSummary({
    turn: 1, total: 1, added: 0, deleted: 0,
    files: [{ path: 'a.bin', display: 'a.bin', added: 0, deleted: 0, binary: true }],
  }) !== null)
  // 缺字段 / 类型错 / 空路径一律 null（官方按 missing 处理，不渲染）
  for (const bad of [
    null,
    {},
    { ...ok, turn: 0 },
    { ...ok, total: 1.5 },
    { ...ok, files: [{ path: '', display: 'x', added: 0, deleted: 0 }] },
    { ...ok, files: [{ path: 'x', display: 'x', added: '3', deleted: 8 }] },
    { ...ok, files: 'nope' },
  ]) assert.equal(parseChangesSummary(bad), null, JSON.stringify(bad))
})

test('turnDeliverablesValue：官方 TurnLocation.data 是 store（.get(key)），不是 Map / 普通对象', () => {
  // 官方契约（conversation.d.ts:87-95）：ConversationLocationDataStore.get(key)
  const store = { get: (key) => (key === 'deliverables' ? { presented: [{ path: 'a.md' }] } : undefined) }
  assert.deepEqual(turnDeliverablesValue({ data: store }, 'deliverables'), { presented: [{ path: 'a.md' }] })
  assert.equal(turnDeliverablesValue({ data: store }, 'other'), undefined)
  // 兼容形态：Map / 纯对象（容忍宿主改版）
  assert.deepEqual(turnDeliverablesValue({ data: new Map([['deliverables', { x: 1 }]]) }, 'deliverables'), { x: 1 })
  assert.deepEqual(turnDeliverablesValue({ data: { deliverables: { y: 2 } } }, 'deliverables'), { y: 2 })
  assert.equal(turnDeliverablesValue({}, 'deliverables'), undefined)
  assert.equal(turnDeliverablesValue(undefined, 'deliverables'), undefined)
})

test('turnDeliverablesChangesSeq：读 turn.data 的 deliverables.changes（store / Map / 对象）', () => {
  const store = (value) => ({ get: (key) => (key === 'deliverables' ? value : undefined) })
  assert.equal(turnDeliverablesChangesSeq({ data: store({ changes: { seq: 7 } }) }), 7)
  assert.equal(turnDeliverablesChangesSeq({ data: new Map([['deliverables', { changes: { seq: 7 } }]]) }), 7)
  assert.equal(turnDeliverablesChangesSeq({ data: { deliverables: { changes: { seq: 9 } } } }), 9)
  // 没有公告 / 没这个键 / seq 不是整数 ⇒ null（官方此时不挂卡）
  assert.equal(turnDeliverablesChangesSeq({ data: store(undefined) }), null)
  assert.equal(turnDeliverablesChangesSeq({ data: new Map() }), null)
  assert.equal(turnDeliverablesChangesSeq({ data: { deliverables: {} } }), null)
  assert.equal(turnDeliverablesChangesSeq({ data: { deliverables: { changes: { seq: 1.5 } } } }), null)
  assert.equal(turnDeliverablesChangesSeq(undefined), null)
})

// ── 单文件改动预览（changes.ts：api/changes.diff 契约，官方 FileDiff 逐值）──

test('changesDiffUrl：官方文档相对路由 + 查询参数（client.js:15/103-110）', () => {
  assert.equal(
    changesDiffUrl('session-abc', 42, 3),
    'api/changes.diff?sessionId=session-abc&seq=42&index=3',
  )
})

test('parseChangesDiff：text 载荷逐字段校验，binary / oversized 只认 kind', () => {
  const text = {
    kind: 'text',
    path: '/w/timestamp.md',
    display: 'timestamp.md',
    before: true,
    after: true,
    coarse: false,
    hunks: [{ oldStart: 1, oldLines: 3, newStart: 1, newLines: 3, lines: [' a', '-b', '+B'] }],
  }
  assert.deepEqual(parseChangesDiff(text), text)
  assert.deepEqual(parseChangesDiff({ kind: 'binary', path: 'a.png', display: 'a.png' }), {
    kind: 'binary', path: 'a.png', display: 'a.png',
  })
  assert.deepEqual(parseChangesDiff({ kind: 'oversized', path: 'b.csv', display: 'b.csv' }), {
    kind: 'oversized', path: 'b.csv', display: 'b.csv',
  })
  for (const bad of [
    null,
    {},
    { ...text, path: '' },
    { ...text, kind: 'nope' },
    { ...text, before: undefined },
    { ...text, hunks: [{ ...text.hunks[0], lines: ['a'] }] }, // 行必须以 + / - / 空格 开头
    { ...text, hunks: [{ ...text.hunks[0], oldStart: -1 }] },
    { kind: 'text', path: 'x', display: 'x' },
  ]) assert.equal(parseChangesDiff(bad), null, JSON.stringify(bad))
})

test('hunkRows：上下文双边计数，删计旧边，增计新边（官方行号口径）', () => {
  const rows = hunkRows({ oldStart: 10, oldLines: 3, newStart: 8, newLines: 3, lines: [' ctx', '-old', '+new', ' tail'] })
  assert.deepEqual(rows, [
    { kind: 'context', old: 10, new: 8, text: 'ctx' },
    { kind: 'del', old: 11, new: undefined, text: 'old' },
    { kind: 'add', old: undefined, new: 9, text: 'new' },
    { kind: 'context', old: 12, new: 10, text: 'tail' },
  ])
})

test('hunkHeader：`@@ -a,b +c,d @@`（官方格式）', () => {
  assert.equal(
    hunkHeader({ oldStart: 10, oldLines: 3, newStart: 8, newLines: 4, lines: [] }),
    '@@ -10,3 +8,4 @@',
  )
})

test('diffNoteKey：新建 / 删除 / 无变化，正常改动无提示', () => {
  assert.equal(diffNoteKey({ kind: 'text', path: 'a', display: 'a', before: false, after: true, coarse: false, hunks: [] }), 'diffCreated')
  assert.equal(diffNoteKey({ kind: 'text', path: 'a', display: 'a', before: true, after: false, coarse: false, hunks: [] }), 'diffDeleted')
  assert.equal(diffNoteKey({ kind: 'text', path: 'a', display: 'a', before: true, after: true, coarse: false, hunks: [] }), 'diffUnchanged')
  assert.equal(diffNoteKey({ kind: 'text', path: 'a', display: 'a', before: true, after: true, coarse: true, hunks: [{ oldStart: 0, oldLines: 0, newStart: 0, newLines: 0, lines: ['+x'] }] }), undefined)
})

test('DIFF_MAX_RENDERED_LINES = 5000（官方截断阈值，超出出 diff.truncated）', () => {
  assert.equal(DIFF_MAX_RENDERED_LINES, 5000)
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
    'changesSingle', 'changesMulti', 'changesBinary', 'changesOversized',
    'diffLoading', 'diffMissing', 'diffError', 'diffBinary', 'diffOversized',
    'diffCreated', 'diffDeleted', 'diffUnchanged', 'diffCoarse', 'diffTruncated',
  ]
  for (const key of keys) {
    setLocale('zh')
    assert.notEqual(t(key), key, `${key} 应能在 zh 字典里找到`)
    setLocale('en')
    assert.notEqual(t(key), key, `${key} 应能在 en 字典里找到`)
  }
  setLocale('zh')
})
