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
// ── 消息图片（官方 ui-attachment 的 MessageImage / ImageGallery）──

test('用户图片附件：官方 ImageGallery 外壳（align=end），单图按 singleFit 定框', () => {
  setLocale('zh')
  const load = () => Promise.resolve('blob:loaded')
  load.peek = () => 'blob:cached'
  const html = renderToStaticMarkup(h(UserMessage, {
    text: '',
    images: [{ attachment: { attachmentId: 'att_1', name: 'shot.png', width: 400, height: 200 } }],
    loadImage: load,
    t,
  }))
  assert.match(html, /data-message-attachments="true"/)
  assert.match(html, /data-align="end"/)
  assert.match(html, /data-variant="single"/)
  // peek 命中就同步出图，不等 loader（SSR 不跑 effect）。
  assert.match(html, /src="blob:cached"/)
  // 400×200 ⇒ 240×120（长边 240、按原比例、不放大）。
  assert.match(html, /width:240px/)
  assert.match(html, /height:120px/)
})

test('多图走方砖：data-variant=tile；无 loader 时整组不画（调用方留文本占位）', () => {
  setLocale('zh')
  const load = () => Promise.resolve('blob:loaded')
  load.peek = () => 'blob:cached'
  const many = renderToStaticMarkup(h(UserMessage, {
    text: '',
    images: [
      { attachment: { attachmentId: 'a', name: 'a.png', width: 100, height: 100 } },
      { attachment: { attachmentId: 'b', name: 'b.png', width: 100, height: 100 } },
    ],
    loadImage: load,
    t,
  }))
  assert.match(many, /data-variant="tile"/)
  assert.equal((many.match(/data-variant="tile"/g) ?? []).length, 2)
  const noLoader = renderToStaticMarkup(h(UserMessage, {
    text: '[图片]',
    images: [{ attachment: { attachmentId: 'a' } }],
    t,
  }))
  assert.doesNotMatch(noLoader, /data-message-attachments/)
  assert.match(noLoader, /\[图片\]/)
})

// ── read_image 工具卡图片区（官方 imageCardModel）──

const { imageCardFace } = await import('../dist/adv/session/mirror/GenericCommandCard.js')
const ENVELOPE = '<path>/tmp/a.png</path>\n<type>image</type>\n<content>\n\n</content>'

test('read_image 卡面：image 块 + envelope + file_path 齐了才出图片卡', () => {
  const content = [{ type: 'text', text: ENVELOPE }, { type: 'image', attachment: { attachmentId: 'att_9', width: 800, height: 600, bytes: 2048 } }]
  const face = imageCardFace('read_image', JSON.stringify({ file_path: '/tmp/a.png' }), content, { path: '/tmp/a.png' }, false, true)
  assert.equal(face.path, '/tmp/a.png')
  assert.equal(face.images.length, 1)
  assert.equal(face.images[0].attachment.width, 800)
  assert.equal(face.extraText, null)
  // 非 envelope 的文本进 extraText。
  const withExtra = imageCardFace('read_image', JSON.stringify({ file_path: '/tmp/a.png' }),
    [...content, { type: 'text', text: '还有一张没显示' }], undefined, false, true)
  assert.equal(withExtra.extraText, '还有一张没显示')
})

test('read_image 卡面：错误 / 未结算 / 别的工具 / 缺 envelope / 缺附件 ⇒ 回通用卡', () => {
  const content = [{ type: 'text', text: ENVELOPE }, { type: 'image', attachment: { attachmentId: 'att_9' } }]
  const args = JSON.stringify({ file_path: '/tmp/a.png' })
  assert.equal(imageCardFace('read_image', args, content, undefined, true, true), null)
  assert.equal(imageCardFace('read_image', args, content, undefined, false, false), null)
  assert.equal(imageCardFace('read', args, content, undefined, false, true), null)
  assert.equal(imageCardFace('read_image', args, [content[1]], undefined, false, true), null)
  assert.equal(imageCardFace('read_image', args, [content[0]], undefined, false, true), null)
  assert.equal(imageCardFace('read_image', JSON.stringify({}), content, undefined, false, true), null)
})
// ── 等待审批卡（官方 ui-approval ApprovalPanel 的弹窗等价物）──

const { ApprovalPanelMirror, approvalCommand } = await import('../dist/adv/session/mirror/ApprovalPanel.js')

test('审批卡：官方结构（data-approval-key / body 组 / 拒绝 + 允许一次）', () => {
  const html = renderToStaticMarkup(h(ApprovalPanelMirror, {
    approval: {
      kind: 'approval', key: 'approval:7', toolName: 'bash', callId: 'c1',
      answerable: true, answer: async () => {},
    },
    command: 'sh /root/x.sh --id 1',
    t: (key) => key,
  }))
  assert.match(html, /data-approval-key="approval:7"/)
  assert.match(html, /data-approval-scroll=""/)
  assert.match(html, /role="group"/)
  // 命令行 = 官方 approval.detail 槽的等价物
  assert.match(html, /sh \/root\/x\.sh --id 1/)
  // 无 reason ⇒ 官方 escalation 文案
  assert.match(html, /approvalEscalation/)
  assert.match(html, /<button[^>]*data-variant="outline"[^>]*>approvalReject<\/button>/)
  assert.match(html, /<button[^>]*data-variant="primary"[^>]*>approvalAllowOnce<\/button>/)
})

test('审批卡：请求方本地化文案优先于 escalation', () => {
  const html = renderToStaticMarkup(h(ApprovalPanelMirror, {
    approval: {
      kind: 'approval', key: 'approval:8', toolName: 'bash',
      displayReason: { zh: '写入 .git 目录', en: 'Write to .git' },
      answerable: true, answer: async () => {},
    },
    t: (key) => key,
  }))
  assert.match(html, /写入 \.git 目录|Write to \.git/)
  assert.ok(!html.includes('approvalEscalation'))
})

// ── 待答题目面板（官方 ui-user-questions QuestionComposer 的弹窗等价物）──

const { QuestionPanel } = await import('../dist/adv/session/mirror/QuestionPanel.js')

const QUESTION_PANEL_CASE = {
  panelKey: 'question:s1:c1',
  questions: [
    {
      id: 'q1',
      question: '数据库用哪个？',
      header: '选择数据库',
      options: [{ label: 'PostgreSQL(推荐)', description: '生产环境默认' }, { label: 'MySQL' }],
    },
  ],
}

test('题目面板：官方结构（题干 + 选项行 + 序号 + 推荐徽标 + 跳过/提交）', () => {
  const html = renderToStaticMarkup(h(QuestionPanel, {
    ...QUESTION_PANEL_CASE,
    answer: async () => {},
    t: (key) => key,
  }))
  assert.match(html, /data-question-key="question:s1:c1"/)
  assert.match(html, /data-question-scroll=""/)
  assert.match(html, /选择数据库/)
  assert.match(html, /数据库用哪个？/)
  // 选项：一题一行，单选用 radio + 序号，标签去掉「(推荐)」尾缀、徽标单独出
  assert.equal(html.match(/data-option-row=""/g).length, 2)
  assert.match(html, /role="radiogroup"/)
  assert.match(html, /role="radio"/)
  assert.match(html, /PostgreSQL</)
  assert.match(html, /askPanelRecommended/)
  assert.ok(!html.includes('PostgreSQL(推荐)<'), '展示标签必须剥掉推荐尾缀')
  assert.match(html, /data-option-description=""/)
  assert.match(html, /生产环境默认/)
  // 底栏：分页 + 跳过 + 提交（最后一题）
  assert.match(html, /1 \/ 1/)
  assert.match(html, /askPanelSkip/)
  assert.match(html, /askPanelSubmit/)
})

test('题目面板：多选是 checkbox 组；只读（无作答通道）时没有底栏动作', () => {
  const multi = renderToStaticMarkup(h(QuestionPanel, {
    questions: [{ id: 'q1', question: '装哪些插件？', multiSelect: true, options: [{ label: 'A' }, { label: 'B' }] }],
    answer: async () => {},
    t: (key) => key,
  }))
  assert.match(multi, /role="group"/)
  assert.match(multi, /role="checkbox"/)
  assert.match(multi, /askPanelSkip/, '有作答通道就有跳过/提交')
  const readOnly = renderToStaticMarkup(h(QuestionPanel, {
    ...QUESTION_PANEL_CASE,
    t: (key) => key,
  }))
  // 只读也要把题与选项照出来（用户口径：不能只剩一行字）
  assert.equal(readOnly.match(/data-option-row=""/g).length, 2)
  assert.match(readOnly, /disabled=""/, '选项不可点')
  assert.ok(!readOnly.includes('askPanelSkip'))
  assert.ok(!readOnly.includes('askPanelSubmit'))
})

test('题目面板：关闭钮两种语义都在（hide=收起 / cancel=放弃整组），只读时不出', () => {
  const hide = renderToStaticMarkup(h(QuestionPanel, {
    ...QUESTION_PANEL_CASE, answer: async () => {}, dismiss: () => {}, dismissal: 'hide', t: (key) => key,
  }))
  assert.match(hide, /aria-label="askPanelClose"/)
  const cancel = renderToStaticMarkup(h(QuestionPanel, {
    ...QUESTION_PANEL_CASE, answer: async () => {}, dismiss: () => {}, dismissal: 'cancel', t: (key) => key,
  }))
  assert.match(cancel, /aria-label="askPanelCancel"/)
  const readOnly = renderToStaticMarkup(h(QuestionPanel, { ...QUESTION_PANEL_CASE, t: (key) => key }))
  assert.ok(!readOnly.includes('askPanelClose') && !readOnly.includes('askPanelCancel'), '没有 dismiss 通道就不出关闭钮')
})

test('题目面板：continued 态显示官方「已继续工作，仍可回答」', () => {
  const html = renderToStaticMarkup(h(QuestionPanel, {
    ...QUESTION_PANEL_CASE,
    card: { state: 'continued' },
    answer: async () => {},
    t: (key) => key,
  }))
  assert.match(html, /askPanelContinued/)
})

test('approvalCommand：按 callId 取 tool-call 起始节点的 args.command', () => {
  const nodes = new Map([
    ['k1', { kind: 'tool-call', key: 'k1', anchorSeq: 1, data: { root: { callId: 'c2', phase: 'start', argsRaw: '{"command":"ls"}' } } }],
    ['k2', { kind: 'tool-call', key: 'k2', anchorSeq: 2, data: { root: { callId: 'c1', phase: 'start', argsRaw: '{"command":"sh /root/x.sh"}' } } }],
    ['k3', { kind: 'assistant-step', key: 'k3', anchorSeq: 3 }],
  ])
  const read = (key) => nodes.get(key)
  assert.equal(approvalCommand(['k1', 'k2', 'k3'], read, 'c1'), 'sh /root/x.sh')
  assert.equal(approvalCommand(['k1', 'k2', 'k3'], read, 'c9'), undefined)
  assert.equal(approvalCommand(['k1', 'k2', 'k3'], read, undefined), undefined)
})
