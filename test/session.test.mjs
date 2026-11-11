// session 子包自检。
//
// ⚠ 只 import **不牵连官方平台模块**的叶子模块：mirror 组件经 src/ui/official.js 静态
// import '@deepseek-ai/dsh-client-ui-primitives'（宿主才解析得了），Node 里 import 会
// ERR_MODULE_NOT_FOUND（official.ts 头注记着这个坑）⇒ 组件观感验证走 demo 预览站，
// 这里钉纯函数与数据链（open-session-view 只 import 类型，编译后零依赖）。
import test from 'node:test'
import assert from 'node:assert/strict'
import { parseOfficialCss, officialClass, officialModuleCount } from '../dist/adv/session/official-classes.js'
import { openSessionView, DEFAULT_RETAIN_SOURCE } from '../dist/adv/session/open-session-view.js'
import { buildProcessGroups, toolActivity, processTitle } from '../dist/adv/session/mirror/process-groups.js'
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
} from '../dist/adv/session/changes.js'
import { durationText, formatRunDuration, formatMessageClock, formatTokens, formatExactCount, formatCacheHitPercent } from '../dist/adv/session/mirror/message-chrome.js'
import { observedRpcIds, visiblePendingInputs, pendingFiles, waitingUserRows } from '../dist/adv/session/pending-inputs.js'
import { openPendingApproval } from '../dist/adv/session/pending-approval.js'
import {
  openLiveQuestion,
  openPendingQuestions,
  parseRecommendedLabel,
  pendingQuestionsFromNodes,
  questionPanelWiring,
  recommendedOptions,
} from '../dist/adv/session/pending-questions.js'
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
  const run = (ms) => durationText(formatRunDuration(ms, t))
  assert.equal(run(34_000), '34秒')
  assert.equal(run(65_000), '1分5秒', '官方 0.2.x：秒不补零（parts 拼接）')
  assert.equal(run(3_725_000), '1小时2分5秒')
  // parts 的数字段标记（TurnProcessNodeView 据此套等宽数字类）
  assert.deepEqual(formatRunDuration(34_000, t).map((part) => part.numeric), [true, false])
  assert.equal(formatMessageClock(new Date(2026, 8, 26, 1, 35).getTime(), t, new Date(2026, 8, 26, 12, 0).getTime()), '01:35')
  assert.equal(formatMessageClock(new Date(2026, 8, 26, 1, 35).getTime(), t, new Date(2026, 8, 20, 12, 0).getTime()), '9月26日 01:35')
  assert.equal(formatMessageClock(new Date(2025, 8, 26, 1, 35).getTime(), t, new Date(2026, 8, 20, 12, 0).getTime()), '2025年9月26日 01:35')
  assert.equal(formatTokens(517, t), '517')
  assert.equal(formatTokens(12_200, t), '12.2K')
  assert.equal(formatTokens(1_200_000, t), '1.2M')
  assert.equal(formatExactCount(91_500, t), '91,500 tok')
  setLocale('en')
  assert.equal(run(65_000), '1m 5s')
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
    'turnProcessTook', 'chatDeepDiving', 'chatDeepDivingFor', 'reasoningRunning', 'jsonTruncated',
    'thinkLabel', 'durationSecondUnit', 'durationMinuteUnit', 'durationHourUnit', 'retryStatus', 'turnErrorTitle',
    'clockDate', 'turnUsageTitle', 'turnUsageCount', 'numberThousand', 'stepProcessDoneRead',
    'stepProcessJoinTwo', 'toolTitleRead', 'toolTitleGeneric', 'toolInputLabel', 'rowRunning',
    'readWindow', 'terminalExitCode', 'diffWrapLabel', 'deliverRowTitle', 'deliverAll',
    'branchLabel', 'composerPlaceholder', 'forkFailed',
    'approvalWaiting', 'approvalDetailAria', 'approvalEscalation', 'approvalReject', 'approvalAllowOnce',
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

// ── 首轮等待期：session.pendingSubmissions 的本地回显 ──

test('visiblePendingInputs：等待期保留 transcript / steering 回显，queued 不画', () => {
  const pending = [
    { requestId: 'r1', placement: 'transcript', text: '帮我把日程排好' },
    { requestId: 'r2', placement: 'queued', text: '排队中的第二条' },
    { requestId: 'r3', placement: 'steering', text: '补充一句' },
  ]
  assert.deepEqual(visiblePendingInputs(pending, new Set()).map(item => item.requestId), ['r1', 'r3'])
  assert.deepEqual(visiblePendingInputs(undefined, new Set()), [])
})

test('observedRpcIds：durable user 节点出现后回显被取代，不重复画气泡', () => {
  const nodes = new Map([
    ['k1', { key: 'k1', kind: 'user', anchorSeq: 1, data: { source: { kind: 'user', rpcId: 'r1' } } }],
    ['k2', { key: 'k2', kind: 'assistant-step', anchorSeq: 2, data: {} }],
    ['k3', { key: 'k3', kind: 'user', anchorSeq: 3, data: { source: { kind: 'agent' } } }],
  ])
  const observed = observedRpcIds(['k1', 'k2', 'k3', 'missing'], key => nodes.get(key))
  assert.deepEqual([...observed], ['r1'])
  assert.deepEqual(
    visiblePendingInputs([{ requestId: 'r1', text: '已落盘' }, { requestId: 'r4', text: '仍在等' }], observed),
    [{ requestId: 'r4', text: '仍在等' }],
  )
})

test('pendingFiles：只取官方已有的真实名字 / 大小，不造附件', () => {
  assert.deepEqual(pendingFiles({ requestId: 'r1', attachments: [
    { type: 'file', value: { name: 'a.md', bytes: 12 } },
    { type: 'image', value: { name: 'b.png' } },
    { type: 'file', value: null },
  ] }), [{ name: 'a.md', bytes: 12 }, { name: 'b.png', bytes: 0 }])
  assert.deepEqual(pendingFiles({ requestId: 'r2' }), [])
})

// ── 首轮等待期：host inbox 投影 + 本地回显两路合并 ──

test('waitingUserRows：本地回显被 retire 后，inbox 投影仍能画出首条提示词', () => {
  const inbox = {
    'next-turn': [
      { id: 'm1', source: { kind: 'user', rpcId: 'r1' }, content: [{ type: 'text', text: '帮我把日程排好' }] },
    ],
    'next-step': [],
  }
  assert.deepEqual(waitingUserRows(inbox, undefined, new Set()), [
    { key: 'm1', text: '帮我把日程排好', files: [], pending: true, echo: false },
  ])
})

test('waitingUserRows：rpcId 命中本地回显时不重复画，附件只取真实字段', () => {
  const inbox = {
    'next-step': [
      { id: 'm1', source: { kind: 'user', rpcId: 'r1' }, content: [{ type: 'text', text: '帮我把日程排好' }] },
    ],
  }
  const pending = [
    { requestId: 'r1', placement: 'transcript', text: '帮我把日程排好', attachments: [{ type: 'file', value: { name: 'a.md', bytes: 12 } }] },
  ]
  assert.deepEqual(waitingUserRows(inbox, pending, new Set()), [
    { key: 'r1', text: '帮我把日程排好', files: [{ name: 'a.md', bytes: 12 }], pending: false, echo: true },
  ])
})

test('waitingUserRows：durable 已落盘 / queued / 非 user 消息不画，附件字段缺席按 0 不编造', () => {
  const inbox = {
    'next-turn': [
      { id: 'm1', source: { kind: 'user', rpcId: 'r1' }, content: [{ type: 'text', text: '已落盘' }] },
      { id: 'm2', source: { kind: 'agent' }, content: [{ type: 'text', text: '系统注入' }] },
      { id: 'm3', source: { kind: 'user', rpcId: 'r3' }, content: [{ type: 'file', attachment: { name: 'b.pdf' } }] },
    ],
  }
  const pending = [
    { requestId: 'r1', placement: 'transcript', text: '已落盘' },
    { requestId: 'r4', placement: 'queued', text: '排队中的' },
  ]
  assert.deepEqual(waitingUserRows(inbox, pending, new Set(['r1'])), [
    { key: 'm3', text: '', files: [{ name: 'b.pdf', bytes: 0 }], pending: true, echo: false },
  ])
})

test('waitingUserRows：投影缺席时只画本地回显，不编造消息', () => {
  assert.deepEqual(waitingUserRows(undefined, undefined, new Set()), [])
  assert.deepEqual(waitingUserRows({}, [{ requestId: 'r1', placement: 'steering', text: '补充一句' }], new Set()), [
    { key: 'r1', text: '补充一句', files: [], pending: true, echo: false },
  ])
})
// ── 等待审批 / 选择题卡：宿主公开只读面的派生 ──

test('openPendingApproval：只认 kind=approval 且可作答的域值，会话隔离', () => {
  const approval = { kind: 'approval', key: 'approval:1', toolName: 'bash', callId: 'c1', answerable: true, answer: async () => {} }
  let current = new Map([['s1', { pendingInteraction: approval }]])
  const listeners = new Set()
  const face = openPendingApproval({
    sessionStatus: {
      getSnapshot: () => current,
      subscribe: (fn) => { listeners.add(fn); return () => { listeners.delete(fn) } },
    },
  }, 's1')
  assert.equal(face.getSnapshot(), approval)
  const statusOnly = { sessionStatus: { getSnapshot: () => current, subscribe: () => () => {} } }
  assert.equal(openPendingApproval(statusOnly, 's2').getSnapshot(), undefined)
  // 别的 pending-interaction 域（题卡等）一律当没有
  current = new Map([['s1', { pendingInteraction: { kind: 'question', key: 'q1', answer: () => {} } }]])
  for (const fn of listeners) fn()
  assert.equal(face.getSnapshot(), undefined)
  // 答完 / 撤销 ⇒ 官方 publish 后快照变空，弹窗自行收卡
  current = new Map()
  for (const fn of listeners) fn()
  assert.equal(face.getSnapshot(), undefined)
})

test('openPendingApproval：uiSession 缺席 / 无快照面时返回 null', () => {
  assert.equal(openPendingApproval(undefined, 's1'), null)
  assert.equal(openPendingApproval({}, 's1'), null)
  assert.equal(openPendingApproval({ sessionStatus: { getSnapshot: () => new Map() } }, 's1'), null)
})

test('openPendingQuestions：取投影里第一组 active，形状不对整体当没有', () => {
  const row = {
    callId: 'call-1',
    state: 'continued',
    questions: [
      {
        id: 'q1',
        question: '选哪个环境？',
        header: '部署',
        detail: '会影响后续命令',
        options: [{ label: 'staging', description: '预发' }, { label: 'prod' }],
        multiSelect: true,
      },
    ],
  }
  let view = { active: [row], settled: [] }
  const listeners = new Set()
  const store = {
    faceOf: (key) => {
      assert.equal(key, 'userQuestions')
      return {
        getSnapshot: () => view,
        subscribe: (fn) => { listeners.add(fn); return () => { listeners.delete(fn) } },
      }
    },
  }
  const face = openPendingQuestions(store)
  // 引用稳定：投影没换 ⇒ 映射结果不换（useSyncExternalStore 不会死循环）
  assert.equal(face.getSnapshot(), face.getSnapshot())
  assert.deepEqual(face.getSnapshot().questions[0].options, [{ label: 'staging', description: '预发' }, { label: 'prod' }])
  assert.equal(face.getSnapshot().state, 'continued')
  assert.equal(face.getSnapshot().questions[0].multiSelect, true)
  // 答完 ⇒ active 清空
  view = { active: [], settled: [{ callId: 'call-1', answers: [] }] }
  for (const fn of listeners) fn()
  assert.equal(face.getSnapshot(), null)
  // 形状不对（缺 questions / state 不认识）⇒ 当没有，不猜
  view = { active: [{ callId: 'x', state: 'weird', questions: [] }] }
  for (const fn of listeners) fn()
  assert.equal(face.getSnapshot(), null)
})

test('openPendingQuestions：宿主没注册该投影时返回 null', () => {
  assert.equal(openPendingQuestions(undefined), null)
  assert.equal(openPendingQuestions({ faceOf: () => undefined }), null)
})

test('pendingQuestionsFromNodes：未结算的 ask_user_question 调用 → 题卡（含选项）', () => {
  const args = JSON.stringify({
    questions: [{
      id: 'q1',
      question: '数据库用哪个？',
      header: '选择数据库',
      options: [{ label: 'PostgreSQL', description: '推荐' }, { label: 'MySQL' }],
      multi_select: false,
    }],
  })
  const nodes = new Map([
    ['a', { kind: 'tool-call', key: 'a', anchorSeq: 1, data: { root: { name: 'ask_user_question', phase: 'start', callId: 'c1', argsRaw: args } } }],
    ['b', { kind: 'tool-call', key: 'b', anchorSeq: 2, data: { root: { name: 'bash', phase: 'start', callId: 'c2', argsRaw: '{}' } } }],
  ])
  const got = pendingQuestionsFromNodes(['a', 'b'], (key) => nodes.get(key))
  assert.equal(got.callId, 'c1')
  assert.equal(got.state, 'open')
  assert.deepEqual(got.questions[0].options, [{ label: 'PostgreSQL', description: '推荐' }, { label: 'MySQL' }])
  // 结算后（同 callId 有 end 节点）不再算待答
  nodes.set('c', { kind: 'tool-call', key: 'c', anchorSeq: 3, data: { root: { callId: 'c1', phase: 'end' } } })
  assert.equal(pendingQuestionsFromNodes(['a', 'b', 'c'], (key) => nodes.get(key)), null)
  // 非 ask 工具不算
  assert.equal(pendingQuestionsFromNodes(['b'], (key) => nodes.get(key)), null)
})

// ── 题卡活体（官方 PendingQuestion 载体）：弹窗唯一的作答入口 ──

const liveQuestionFixture = (overrides = {}) => ({
  kind: 'question',
  key: 'question:s1:c1',
  questions: [{ id: 'q1', question: '数据库用哪个？', options: [{ label: 'PostgreSQL', description: '推荐' }] }],
  dismissal: 'hide',
  snapshot: () => ({ state: 'open' }),
  subscribe: () => () => {},
  answer: async () => {},
  ...overrides,
})

test('openLiveQuestion：只认 kind=question 的活体载体，会话隔离、答完即空', () => {
  const carrier = liveQuestionFixture()
  let current = new Map([['s1', { pendingInteraction: carrier }]])
  const listeners = new Set()
  const face = openLiveQuestion({
    sessionStatus: {
      getSnapshot: () => current,
      subscribe: (fn) => { listeners.add(fn); return () => { listeners.delete(fn) } },
    },
  }, 's1')
  assert.equal(face.getSnapshot(), carrier, '拿到的就是官方载体本体（作答/倒计时都在它身上）')
  assert.equal(openLiveQuestion({ sessionStatus: { getSnapshot: () => current, subscribe: () => () => {} } }, 's2').getSnapshot(), undefined)
  // 审批域 / 计划审阅域都不是题卡
  current = new Map([['s1', { pendingInteraction: { kind: 'approval', key: 'a1', toolName: 'bash', answer: () => {} } }]])
  for (const fn of listeners) fn()
  assert.equal(face.getSnapshot(), undefined)
  // 已答 / 撤销 ⇒ 注册表清空，弹窗自行收面板
  current = new Map()
  for (const fn of listeners) fn()
  assert.equal(face.getSnapshot(), undefined)
})

test('openLiveQuestion：uiSession 缺席 / 无快照面 / 载体不能作答时一律当没有', () => {
  assert.equal(openLiveQuestion(undefined, 's1'), null)
  assert.equal(openLiveQuestion({}, 's1'), null)
  assert.equal(openLiveQuestion({ sessionStatus: { getSnapshot: () => new Map() } }, 's1'), null)
  const broken = [
    liveQuestionFixture({ answer: undefined }),
    liveQuestionFixture({ snapshot: undefined }),
    liveQuestionFixture({ questions: [] }),
    liveQuestionFixture({ kind: 'plan-review' }),
    null,
  ]
  for (const carrier of broken) {
    const face = openLiveQuestion({
      sessionStatus: { getSnapshot: () => new Map([['s1', { pendingInteraction: carrier }]]), subscribe: () => () => {} },
    }, 's1')
    assert.equal(face.getSnapshot(), undefined)
  }
})

test('parseRecommendedLabel / recommendedOptions：推荐尾缀拆展示、作答值仍是原标签', () => {
  assert.deepEqual(parseRecommendedLabel('PostgreSQL(推荐)'), { label: 'PostgreSQL', recommended: true })
  assert.deepEqual(parseRecommendedLabel('MySQL（recommended）'), { label: 'MySQL', recommended: true })
  assert.deepEqual(parseRecommendedLabel('SQLite'), { label: 'SQLite', recommended: false })
  // 单选只认「第一项标了推荐」，多选全部推荐项
  assert.deepEqual(recommendedOptions({ id: 'q', question: 'q', options: [{ label: 'A(推荐)' }, { label: 'B(推荐)' }] }), ['A(推荐)'])
  assert.deepEqual(recommendedOptions({ id: 'q', question: 'q', multiSelect: true, options: [{ label: 'A(推荐)' }, { label: 'B(推荐)' }] }), ['A(推荐)', 'B(推荐)'])
  assert.deepEqual(recommendedOptions({ id: 'q', question: 'q', options: [{ label: 'A' }] }), [])
})

test('questionPanelWiring：作答与关闭钮解耦 —— cancel 型照样能答、也有关闭钮', () => {
  assert.deepEqual(questionPanelWiring(undefined), {}, '无载体 = 只读，一个入参都不给')
  const answered = []
  const hide = liveQuestionFixture({ dismissal: 'hide', dismiss: () => {}, answer: async (batch) => { answered.push(batch) } })
  const hideWiring = questionPanelWiring(hide)
  assert.equal(typeof hideWiring.answer, 'function')
  assert.equal(typeof hideWiring.dismiss, 'function')
  assert.equal(typeof hideWiring.readCard, 'function')
  assert.equal(typeof hideWiring.subscribeCard, 'function')
  const cancelWiring = questionPanelWiring(liveQuestionFixture({ dismissal: 'cancel', dismiss: () => Promise.resolve() }))
  assert.equal(typeof cancelWiring.answer, 'function', 'cancel 型（无 callId）也必须有作答通道')
  assert.equal(cancelWiring.dismissal, 'cancel')
  assert.equal(typeof cancelWiring.dismiss, 'function', '官方两种 dismissal 都给关闭钮，语义靠 dismissal 区分')
  return hideWiring.answer([{ id: 'q1', selected: ['PostgreSQL'] }]).then(() => {
    assert.deepEqual(answered, [{ answers: [{ id: 'q1', selected: ['PostgreSQL'] }] }], '作答透传给官方载体')
  })
})

test('openSessionView：题卡活体面只在给了 uiSession 时接线', () => {
  const host = fakeHost()
  assert.equal(openSessionView(host.sessions, host.uiConversation, 's1').pendingQuestion, null)
  const carrier = liveQuestionFixture()
  const withSession = openSessionView(host.sessions, host.uiConversation, 's1', undefined, {
    sessionStatus: {
      getSnapshot: () => new Map([['s1', { pendingInteraction: carrier }]]),
      subscribe: () => () => {},
    },
  })
  assert.equal(withSession.pendingQuestion.getSnapshot(), carrier)
})

test('openSessionView：revealPendingQuestion 只在给了 userQuestionPanels 时接线', () => {
  const host = fakeHost()
  const calls = []
  const view = openSessionView(host.sessions, host.uiConversation, 's1', undefined, undefined, {
    reveal: (sessionId, callId) => { calls.push([sessionId, callId]); return true },
  })
  assert.equal(view.revealPendingQuestion('c1'), true)
  assert.deepEqual(calls, [['s1', 'c1']], '按本会话 id + callId 调官方 reveal')
  // 官方抛错 ⇒ false，不把异常带进预览
  const broken = openSessionView(host.sessions, host.uiConversation, 's1', undefined, undefined, {
    reveal: () => { throw new Error('boom') },
  })
  assert.equal(broken.revealPendingQuestion('c1'), false)
  // 不给服务 ⇒ null（题卡只读，但预览照常）
  assert.equal(openSessionView(host.sessions, host.uiConversation, 's1').revealPendingQuestion, null)
})
