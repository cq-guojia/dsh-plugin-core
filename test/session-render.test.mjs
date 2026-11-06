// 会话预览渲染级自检：钉住 0.2.2-rc.1 起用户气泡改走官方原语的结构。
// 官方原语在 Node 里由 primitives-stub.mjs 替身渲染成原生 div，故能断言 data-* 钩子。
import test from 'node:test'
import assert from 'node:assert/strict'
import { register } from 'node:module'
import { createElement as h, Fragment } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

register(new URL('./primitives-hooks.mjs', import.meta.url))
const { UserMessage } = await import('../dist/adv/session/mirror/MessageItem.js')
const { ExitCodeBadge } = await import('../dist/adv/session/mirror/GenericCommandCard.js')
const { SkillRowMirror } = await import('../dist/adv/session/mirror/SkillRow.js')
const { ChatNodeListMirror } = await import('../dist/adv/session/mirror/ChatView.js')
const { contextBodyView } = await import('../dist/adv/session/mirror/ContextBody.js')
const { contextRowFacts } = await import('../dist/adv/session/mirror/ContextInjectionRow.js')
const { t, setLocale } = await import('../dist/utils/i18n.js')

test('用户气泡用官方 UserMessageBubble，带官方两个 data 标记', () => {
  const html = renderToStaticMarkup(h(UserMessage, { text: '你好', t: (key) => key }))
  assert.match(html, /data-message-bubble=""/)
  assert.match(html, /data-text-interaction-source=""/)
})

test('退出码徽章用官方 Tag(neutral) 胶囊 + 失败点，不是裸 span', () => {
  const html = renderToStaticMarkup(h(ExitCodeBadge, { label: '退出码 1' }))
  assert.match(html, /data-tone="neutral"/)
  assert.match(html, /aria-hidden="true"/)
  assert.match(html, /退出码 1/)
})

test('用户消息是官方纯文本 UserTextRun：## / ** / 反引号不渲染成标题粗体 code', () => {
  const text = '## 第一步：读\n**不需要你判断** `20261105-0051`'
  const html = renderToStaticMarkup(h(UserMessage, { text, t: (key) => key }))
  assert.match(html, /## 第一步：读/)
  assert.match(html, /\*\*不需要你判断\*\*/)
  assert.doesNotMatch(html, /<h2/)
  assert.doesNotMatch(html, /<strong/)
})

test('skill 工具走专属 SkillRow：加载技能标题 + 技能名摘要，不落通用工具卡', () => {
  const html = renderToStaticMarkup(h(SkillRowMirror, {
    argsRaw: '{"name":"task-ledger"}',
    output: 'SKILL.md 内容',
    isError: false,
    t: (key) => key,
  }))
  assert.match(html, /data-tool="skill"/)
  assert.match(html, /skillRowTitle/)
  assert.match(html, /task-ledger/)
  assert.match(html, /aria-expanded="false"/)
  assert.doesNotMatch(html, /toolTitleGeneric/)
  assert.doesNotMatch(html, /toolInputLabel/)
})

test('过程组默认收起：有「执行了命令」汇总行，组内条目点开才展开', () => {
  setLocale('zh')
  const key = JSON.stringify(['process', 'tool-1', null])
  const member = {
    key: 'tool-1',
    kind: 'tool-call',
    anchorSeq: 1,
    location: { kind: 'turn', turn: { turn: 1, status: 'closed' } },
    data: {},
  }
  const store = { get: (k) => (k === 'tool-1' ? member : undefined) }
  const groups = new Map([[key, {
    key,
    members: [{ key: 'tool-1' }],
    data: { turn: 1, closed: true, summary: { counts: [{ kind: 'commands', count: 1 }] } },
  }]])
  const rows = ChatNodeListMirror({
    order: ['tool-1'],
    store,
    entries: [{ kind: 'group', key }],
    groups,
    openState: new Map(),
    onSetOpen: () => {},
    foldCompleted: true,
    renderNode: () => h('div', null, 'member'),
    t,
  })
  const html = renderToStaticMarkup(h(Fragment, null, rows))
  assert.match(html, /data-step-process="true"/)
  assert.match(html, /aria-expanded="false"/)
  assert.match(html, /执行了命令/)
  assert.match(html, /data-step-process-body="true"[^>]*hidden=""/)
  assert.doesNotMatch(html, /data-group-expanded-mode/)
})

// ── 上下文注入各 form 体（官方 ContextBody 0.2.2-rc.1）──

test('context catalog form：条目列表 + 「替换目录」提示，不再重复模型面向文本', () => {
  setLocale('zh')
  const view = contextBodyView({
    form: 'catalog',
    content: [{ type: 'text', text: '目录正文' }],
    source: { kind: 'catalog', update: true, entries: [{ name: 'dsh-task-ledger', description: '任务台账' }] },
    t,
  })
  assert.equal(view.rendered, 'catalog')
  const html = renderToStaticMarkup(h('div', null, view.body))
  assert.match(html, /data-context-entries="true"/)
  assert.match(html, /dsh-task-ledger/)
  assert.match(html, /任务台账/)
  assert.match(html, /替换目录/)
  assert.doesNotMatch(html, /目录正文/)
})

test('context recall form：来源会话的保留 / 省略条数 + 截断标记 + 正文', () => {
  setLocale('zh')
  const view = contextBodyView({
    form: 'recall',
    content: [{ type: 'text', text: '召回正文' }],
    source: { references: [{ label: '会话 A', retainedMessages: 3, omittedMessages: 1, truncated: true }] },
    t,
  })
  assert.equal(view.rendered, 'recall')
  const html = renderToStaticMarkup(h('div', null, view.body))
  assert.match(html, /data-context-recalls="true"/)
  assert.match(html, /会话 A/)
  assert.match(html, /保留 3 条 · 省略 1 条/)
  assert.match(html, /已截断/)
  assert.match(html, /召回正文/)
})

test('context instructions form：baseline 记「已载入」，增量记「已新增」', () => {
  setLocale('zh')
  const render = (source) => renderToStaticMarkup(h('div', null, contextBodyView({
    form: 'instructions',
    content: [{ type: 'text', text: '指令正文' }],
    source,
    t,
  }).body))
  const baseline = render({ kind: 'instructions', baseline: true, changes: [{ path: 'AGENTS.md', action: 'set' }] })
  assert.match(baseline, /data-context-files="true"/)
  assert.match(baseline, /AGENTS\.md/)
  assert.match(baseline, /已载入/)
  assert.doesNotMatch(baseline, /已新增/)
  assert.match(render({ kind: 'instructions', changes: [{ path: 'AGENTS.md', action: 'set' }] }), /已新增/)
})

test('context form 读不出 source ⇒ 回落 opaque：正文 + source 其余字段键值表', () => {
  setLocale('zh')
  const view = contextBodyView({
    form: 'catalog',
    content: [{ type: 'text', text: '原文' }],
    source: { kind: 'catalog', summary: '来源目录' },
    t,
  })
  assert.equal(view.rendered, null)
  const html = renderToStaticMarkup(h('div', null, view.body))
  assert.match(html, /data-context-fields="true"/)
  assert.match(html, /原文/)
  assert.match(html, /<dt class="[^"]*">summary<\/dt>/)
  assert.match(html, /来源目录/)
  // kind 由行标题表达，不进字段表。
  assert.doesNotMatch(html, />kind</)
})

test('context notice form：折叠行那一行话取 source.summary，正文是模型面向文本', () => {
  setLocale('zh')
  const view = contextBodyView({
    form: 'notice',
    content: [{ type: 'text', text: '通知正文' }],
    source: { summary: '刚发生了什么' },
    t,
  })
  assert.equal(view.rendered, 'notice')
  assert.equal(view.summary, '刚发生了什么')
  assert.match(renderToStaticMarkup(h('div', null, view.body)), /通知正文/)
})

test('工具增删块：单条进标题、多条出行汇总（不重复计数）', () => {
  setLocale('zh')
  const both = contextRowFacts([{ type: 'tool-addition', toolName: 'a' }, { type: 'tool-removal', toolName: 'b' }], undefined, t)
  assert.equal(both.title, '工具已更新')
  assert.equal(both.summary, '新增 1 个，移除 1 个')
  const single = contextRowFacts([{ type: 'tool-addition', toolName: 'dsh_reader' }], undefined, t)
  assert.equal(single.title, '已添加工具：dsh_reader')
  assert.equal(single.summary, null)
  // 非工具块 ⇒ 按 producer 角色给标题，summary 不出现。
  const recall = contextRowFacts([{ type: 'text', text: 'x' }], 'recall', t)
  assert.equal(recall.title, '跨会话召回')
  assert.equal(recall.summary, null)
  assert.equal(recall.toolBlocks, undefined)
})
