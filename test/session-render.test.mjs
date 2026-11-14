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
const { statDialogStyles } = await import('../dist/adv/session/mirror/StatDialog.js')
const { TurnUsagePanelMirror } = await import('../dist/adv/session/mirror/TurnUsagePanel.js')

// Node 里没有宿主 style 注入，officialClass() 恒 null ⇒ 断言不到「类名真挂」。
// 这里只造一个最小假 document（QuestionComposer 一个模块），让这条链在 SSR 里真实生效；
// 其余模块仍返回 null，与改动前的行为一致。
const OFFICIAL_CLS = { customRowYielded: '_qXk2_customRowYielded' }
globalThis.document = {
  querySelectorAll: () => [{
    dataset: { pluginCss: '@deepseek-ai/dsh-client-ui-user-questions/QuestionComposer.module.css' },
    textContent: `._qXk2_root{color:red}._qXk2_customRow{color:red}.${OFFICIAL_CLS.customRowYielded}{color:red}`,
  }],
}

test('统计弹窗走官方 CSS anchor：trigger 声明锚点，panel 指向同一名字', () => {
  const { anchorStyle, panelStyle } = statDialogStyles('--dsh-stat-r1')
  assert.equal(anchorStyle.anchorName, '--dsh-stat-r1')
  assert.equal(panelStyle.positionAnchor, anchorStyle.anchorName)
  const html = renderToStaticMarkup(h(TurnUsagePanelMirror, {
    usage: { totalTokens: 100, uncachedInputTokens: 60, outputTokens: 40 },
    t: (key) => key,
  }))
  assert.match(html, /anchor-name:--dsh-stat-/)
  assert.doesNotMatch(html, /visibility:hidden/)
})

// 注意：这两条断言的是「本仓按官方契约把哪些 props 交给官方原语」。
// SSR 替身（primitives-stub.mjs）把收到的 props 回显成属性，所以看到的是入参而非官方渲染结果；
// 官方原语自身输出什么标记由宿主保证，测试不假装验过它。
test('用户气泡按官方契约向 UserMessageBubble 传入两个 data 标记', () => {
  const html = renderToStaticMarkup(h(UserMessage, { text: '你好', t: (key) => key }))
  assert.match(html, /data-message-bubble=""/)
  assert.match(html, /data-text-interaction-source=""/)
})

test('退出码徽章按官方契约给 Tag 传 tone="neutral" + 失败点', () => {
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

// ── 题卡作答气泡（官方 QuestionReplyView）与思考行的流式展开 ──

const { QuestionReplyBubble, replyAnswerValues, replyClipboardText } =
  await import('../dist/adv/session/mirror/QuestionReply.js')
const { ReasoningRowMirror } = await import('../dist/adv/session/mirror/ReasoningRow.js')

const REPLY_DATA = {
  callId: 'c1',
  outcome: 'answered',
  time: Date.UTC(2026, 10, 11, 15, 3),
  questions: [
    { id: 'q1', header: '数据库选型', question: '数据库用哪个?' },
    { id: 'q2', question: '要不要缓存?' },
  ],
  answers: [
    { id: 'q1', selected: ['SQLite'] },
    { id: 'q2', selected: [], custom: '先不做' },
  ],
}

test('题卡作答气泡：题在上、答案在下，推荐/跳过/自定义都对', () => {
  const html = renderToStaticMarkup(h(QuestionReplyBubble, { data: REPLY_DATA, t: (key) => key }))
  assert.match(html, /data-question-reply="c1"/)
  assert.match(html, /data-reply-outcome="answered"/)
  assert.match(html, /数据库选型/)
  assert.match(html, /数据库用哪个\?/)
  assert.match(html, /SQLite/)
  assert.match(html, /先不做/, '自定义答案照样出')
  assert.match(html, /role="group"/)
  assert.match(html, />\d{2}:\d{2}</, '带 HH:mm 时间')
})

test('题卡作答气泡：题面读不出来时退回 payload 原话；跳过显示「已跳过」', () => {
  const raw = renderToStaticMarkup(h(QuestionReplyBubble, {
    data: { text: '{"questions":[]}', outcome: 'answered', time: 0 }, t: (key) => key,
  }))
  assert.match(raw, /replyLabel/)
  assert.match(raw, /\{&quot;questions&quot;:\[\]\}/)
  const skipped = renderToStaticMarkup(h(QuestionReplyBubble, {
    data: { callId: 'c2', questions: [{ id: 'q1', question: 'q' }], answers: [{ id: 'q1', selected: [] }] },
    t: (key) => key,
  }))
  assert.match(skipped, /replySkipped/)
})

test('题卡作答数据：选中值 + 非空自定义拼一起；复制文本按题分段', () => {
  assert.deepEqual(replyAnswerValues(REPLY_DATA, 'q1'), ['SQLite'])
  assert.deepEqual(replyAnswerValues(REPLY_DATA, 'q2'), ['先不做'])
  assert.deepEqual(replyAnswerValues(REPLY_DATA, 'q3'), [])
  assert.equal(
    replyClipboardText(REPLY_DATA, (key) => key),
    '数据库选型 — 数据库用哪个?\nreplyAnswerLabelSQLite\n\n要不要缓存?\nreplyAnswerLabel先不做',
  )
  assert.equal(replyClipboardText({ text: 'raw' }, (key) => key), 'raw')
})

test('思考行：流式时正文一直展开，结束后才收成摘要', () => {
  const running = renderToStaticMarkup(h(ReasoningRowMirror, {
    text: '第一段思考\n\n第二段还在写', running: true, t: (key) => key,
  }))
  assert.match(running, /data-expanded="(true|)"/, 'running 时展开')
  assert.match(running, /data-state="running"/)
  assert.doesNotMatch(running, /data-preview/, '展开时不再显示单行预览')
  const settled = renderToStaticMarkup(h(ReasoningRowMirror, {
    text: '第一段思考\n\n第二段', t: (key) => key,
  }))
  assert.doesNotMatch(settled, /data-expanded/, '结束后收起')
  assert.match(settled, /data-preview="(true|)"/, '收起后是摘要行')
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

// ── RC.3 官方 src/ 契约对齐：A 类 9 条的 DOM 层级、条件与数据面 ──

const { ChatOlderButton } = await import('../dist/adv/session/mirror/ChatView.js')
const { turnTriggerDetails, TurnTriggerNodeViewMirror } = await import('../dist/adv/session/mirror/TurnTriggerNodeView.js')
const { patchFileTargets, GenericCommandCard } = await import('../dist/adv/session/mirror/GenericCommandCard.js')
const { customRowYielded } = await import('../dist/adv/session/mirror/QuestionPanel.js')

const HISTORY_LABELS = {
  more: '加载更早', loading: '正在加载', processing: '正在处理', error: '重新加载', start: '已到会话开头',
}

test('older 按钮：官方五态叠放，仅当前态可见；五态判定逐条可复现', () => {
  const cases = [
    [{ hasMore: true }, '加载更早'],
    [{ hasMore: true, loadingOlder: true }, '正在加载'],
    [{ hasMore: true, historyLoadStatus: 'error' }, '重新加载'],
    [{ hasMore: true, historyProcessing: true }, '正在处理'],
    [{ hasMore: false }, '已到会话开头'],
  ]
  for (const [state, visible] of cases) {
    const html = renderToStaticMarkup(h(ChatOlderButton, { labels: HISTORY_LABELS, ...state, onClick: () => {} }))
    assert.equal((html.match(/<span /g) ?? []).length, 5, `必须叠放 5 个状态 span：${visible}`)
    assert.match(html, new RegExp(`aria-hidden="false">${visible}<`))
    assert.equal((html.match(/aria-hidden="true"/g) ?? []).length, 4, `其余四态必须隐藏：${visible}`)
    assert.equal(html.includes('disabled=""'), state.hasMore === false, 'hasMore=false 才 disabled')
  }
  const errored = renderToStaticMarkup(h(ChatOlderButton, {
    labels: HISTORY_LABELS, hasMore: true, historyLoadStatus: 'error', onClick: () => {},
  }))
  assert.match(errored, /data-chat-history="error"/)
})

test('审批卡：官方 heading 层与 subject/description 可选分支按条件渲染', () => {
  const approval = { kind: 'approval', key: 'approval:9', toolName: 'bash', answerable: false, answer: async () => {} }
  const base = { approval, command: 'sh x.sh', t: (k) => k }
  const plain = renderToStaticMarkup(h(ApprovalPanelMirror, base))
  assert.ok(!plain.includes('<img'), '不传 subject 不得画图标')
  assert.ok(!plain.includes('<p>'), '不传 description 不得画描述')
  const full = renderToStaticMarkup(h(ApprovalPanelMirror, {
    ...base, subject: { name: '插件 X', icon: 'icon.png' }, description: '请求写入工作区',
  }))
  assert.match(full, /<img[^>]*width="40"[^>]*height="40"/)
  assert.match(full, /<strong>插件 X<\/strong>/)
  assert.ok(full.indexOf('插件 X') < full.indexOf('approvalEscalation'), 'subject 必须是 body 首子')
  assert.ok(full.indexOf('请求写入工作区') > full.indexOf('approvalEscalation'), 'description 在 heading 之后')
  assert.ok(full.indexOf('请求写入工作区') < full.indexOf('sh x.sh'), 'description 在 command 之前')
})

test('触发行：retry 且 content 为空走官方 continuation compact 早返回', () => {
  assert.deepEqual(turnTriggerDetails({ source: { kind: 'retry' }, content: [] }),
    { title: 'triggerContinuation', icon: 'continue', compact: true })
  assert.equal(turnTriggerDetails({ source: { kind: 'retry' }, content: ['x'] }).compact, undefined)
  const html = renderToStaticMarkup(h(TurnTriggerNodeViewMirror, {
    data: { source: { kind: 'retry' }, content: [] }, t: (k) => k,
  }))
  assert.match(html, /data-generation-continuation="true"/)
  assert.match(html, /triggerContinuation/)
  assert.ok(!html.includes('<section'), 'compact 不渲 section.root')
  assert.ok(!html.includes('aria-expanded'), 'compact 不渲折叠头')
})

test('apply_patch 多文件目标：按官方 patchSummary 契约解析 add/update/delete/move', () => {
  const patch = [
    '*** Begin Patch',
    '*** Update File: src/a.ts',
    '*** Move to: src/b.ts',
    '@@',
    '-old',
    '+new',
    '*** Add File: src/c.ts',
    '+content',
    '*** Delete File: src/d.ts',
    '*** End Patch',
  ].join('\n')
  const targets = patchFileTargets(patch)
  assert.equal(targets.length, 3)
  assert.deepEqual(targets[0], { id: 2, from: 'src/a.ts', label: 'src/b.ts', filePath: 'src/b.ts' })
  assert.deepEqual(targets[1], { id: 7, label: 'src/c.ts', filePath: 'src/c.ts' })
  assert.deepEqual(targets[2], { id: 9, label: 'src/d.ts', filePath: undefined })
  assert.deepEqual(patchFileTargets('not a patch'), [], 'malformed patch 与官方一样给空目标')
  assert.deepEqual(patchFileTargets(undefined), [])
})

test('工具卡：多文件出官方 fileLinks，删除项只出裸 label', () => {
  const patch = ['*** Begin Patch', '*** Add File: src/a.ts', '+a', '*** Delete File: src/b.ts', '*** End Patch'].join('\n')
  // patch 只从 apply_patch 的 input 参数派生（官方 tool-call-model.ts:380），这里走真实数据链。
  const html = renderToStaticMarkup(h(GenericCommandCard, {
    name: 'apply_patch', argsRaw: JSON.stringify({ input: patch }), output: 'Done', isError: false,
    onOpenFile: () => {}, t: (k) => k,
  }))
  const collapsed = html.slice(html.indexOf('data-slot="collapsed"'), html.indexOf('data-slot="expanded"'))
  assert.match(collapsed, /data-shimmer-decoration="true"/, '官方 sep 必须落在折叠摘要槽')
  assert.ok(collapsed.includes('src/a.ts') && collapsed.includes('src/b.ts'))
  assert.ok(collapsed.includes('>src/a.ts</button>'), '可打开的目标出 fileTargetLink 按钮')
  assert.ok(!collapsed.includes('>src/b.ts</button>'), '删除项 filePath 为空，只出裸 label')
})

test('工具卡：非 apply_patch 工具即使参数里有 input 也不出 fileLinks', () => {
  const patch = ['*** Begin Patch', '*** Add File: src/a.ts', '+a', '*** Add File: src/b.ts', '+b', '*** End Patch'].join('\n')
  const html = renderToStaticMarkup(h(GenericCommandCard, {
    name: 'bash', argsRaw: JSON.stringify({ input: patch }), output: 'Done', isError: false,
    onOpenFile: () => {}, t: (k) => k,
  }))
  assert.ok(!html.includes('fileTargetLink'), '官方 patch 只由 apply_patch 派生')
})

test('自定义输入行：单选已选中时按官方条件真挂 customRowYielded 类名', () => {
  assert.equal(customRowYielded(false, 0), false)
  assert.equal(customRowYielded(false, 1), true)
  assert.equal(customRowYielded(true, 1), false, '多选题不抑制')
  // QUESTION_PANEL_CASE 的首个选项带「(推荐)」⇒ recommendedOptions 预选非空 ⇒ 条件成立。
  const html = renderToStaticMarkup(h(QuestionPanel, { ...QUESTION_PANEL_CASE, t: (k) => k }))
  assert.match(html, /data-question-key="question:s1:c1"/)
  assert.match(html, new RegExp(OFFICIAL_CLS.customRowYielded), '条件成立时官方类名必须真挂上')
  const multi = renderToStaticMarkup(h(QuestionPanel, {
    ...QUESTION_PANEL_CASE,
    questions: [{ ...QUESTION_PANEL_CASE.questions[0], multiSelect: true }],
    t: (k) => k,
  }))
  assert.ok(!multi.includes(OFFICIAL_CLS.customRowYielded), '多选题条件不成立时不得挂该类')
})

const { useStatDialog } = await import('../dist/adv/session/mirror/StatDialog.js')

test('useStatDialog：运行时生成的 anchor-name 与 panel position-anchor 同源', () => {
  const Probe = () => {
    const { anchorName, panelStyle } = useStatDialog()
    return h('span', null, `${anchorName}|${panelStyle.positionAnchor}`)
  }
  const html = renderToStaticMarkup(h(Probe))
  const [left, right] = html.replace(/<\/?span>/g, '').split('|')
  assert.match(left, /^--dsh-stat-/)
  assert.equal(right, left, 'anchorName 与 positionAnchor 必须运行时相等，而不只是格式对')
})
