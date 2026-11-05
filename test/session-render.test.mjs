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
