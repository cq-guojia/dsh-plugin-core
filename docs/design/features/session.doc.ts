// session 子包的使用帮助 —— 真源（TS 数据模块）。内容全在此一处，demo 与 md 都从这份派生。
import type { DocTopic } from '../doc-format.js'

const usage = `import { openSessionView, SessionViewModal } from 'dsh-plugin-core/session'

// 1. 宿主服务（插件从 ctx 取出后注入；sessions ← dsh-api-session-controller、
//    uiConversation ← dsh-client-ui-conversation，inject 边决定装配顺序）
const view = openSessionView(sessions, uiConversation, sessionId, 'my-plugin')
if (view !== null) {
  h(SessionViewModal, {
    sessionId,
    view,
    heading: '镜像升级日报',              // 可选标题
    onClose: () => { view.dispose(); setOpen(false) },   // 关闭必须释放 retain 引用
    // 续聊（可选服务）：fork → 跳官方会话区
    forkSession: (id, atSeq) => sessions.fork({ sessionId: id, increaseTitle: true, atSeq }),
    openHostSession: (id) => uiWorkspace.openSession(id),
    // 暂存输入框（可选）：确定后由调用方 fork + host 侧 agent.send 起轮次 + 跳转
    onContinue: async (message) => {
      const child = await forkSession(sessionId)
      await hostContinue(child, message)   // 插件 host 半侧：agents.create + agent.send
      openHostSession(child)
    },
    onOpenFile: (path) => openFilePreview(path),   // 文件打开出口
    t,                                        // 可选，覆盖文案
  })
}`

const dataChain = `// 数据链（决策 28，全部经官方源码核实）：
//   sessions.retain(id, { source })  物化 scope（归档 / 久未打开的会话也能读）
//     → sessions.binding(id)         取绑定
//     → session.open()               幂等拉历史尾页
//     → uiConversation.binding(binding).target('chat')
//                                     拿 ChatSnapshot：order + nodes（keyed 流）
// 用完 view.dispose() 释放引用（否则会话 scope 永不回收）。
//
// 已证伪、勿再尝试：弹窗内挂官方 ChatView（renderSlot 只认 key='root'）；
//    自己 retain('mainView')（锁死宿主会话导航）；冷读 RPC session/follow（无活动通道）。`

const doc: DocTopic = {
  title: { zh: 'session —— 会话预览', en: 'session — session preview' },
  exports: ['SessionViewModal', 'openSessionView'],
  sections: [
    {
      id: 'session',
      heading: { zh: '会话预览', en: 'Session preview' },
      prose: [
        {
          zh: '依赖 ui。把「看一眼某个会话、看完即关」封装成与官方会话页同构的只读弹窗：自动执行的任务想回看这次会话，不想开新窗口（回来还得找）。',
          en: 'Depends on ui. Wraps the "peek at a session and close when done" flow into a read-only dialog isomorphic to the official session page: for auto-run tasks you want to review this run without opening a new window.',
        },
        {
          zh: '弹窗只是当前的呈现方式，不是这个包的定义。「纯 Modal 控件」在 ui 里，这里装的是「会话预览」这个功能。',
          en: 'A modal is only the current presentation, not the definition of the package. The bare Modal lives in ui; this package owns the "session preview" feature.',
        },
        {
          zh: '渲染 = 「官方零件 + 自绘容器」：mirror/ 下 15 个组件按官方文件名一一对应（ChatView / ChatNodeSeat / MessageItem / GenericCommandCard / ReasoningRow / Turn×NodeView / MessageIconActions / TurnUsagePanel / StatDialog / Deliverables / ChatGroupSeat…），逐值镜像官方 UI；官方 CSS module 类名运行时发现（official-classes.ts），未命中回退自绘样式（session.css），不崩不白屏。',
          en: 'Rendering = "official parts + self-drawn chrome": the 15 components under mirror/ map one-to-one to official file names (ChatView / ChatNodeSeat / MessageItem / GenericCommandCard / ReasoningRow / Turn×NodeView / MessageIconActions / TurnUsagePanel / StatDialog / Deliverables / ChatGroupSeat…), mirroring the official UI value-by-value. Official CSS-module class names are discovered at runtime (official-classes.ts); on a miss, self-drawn fallback styles apply (session.css) — no crash, no blank screen.',
        },
        {
          zh: '归档会话同样可读：archiveSession 只把会话藏出显示面、不动存储；sessions.retain 物化 scope 与归档正交 ⇒ 预览归档会话走的是同一条数据链，无额外开发。',
          en: 'Archived sessions are readable too: archiveSession only hides a session from grouping surfaces and never touches storage; sessions.retain materializes the scope regardless of archive status ⇒ previewing an archived session uses the same data chain, with no extra work.',
        },
        {
          zh: '文件显示逻辑全量移植：用户消息官方 file 块 → 附件卡；工具卡 read/write/edit 摘要路径 = 可点 fileLink；tool-fs meta.diffs 路径进词表；markdown 行内文件引用 → fileMentions 解析成链接（resolve 不出保持惰性 code，永不猜）；交付文件（present / turn 级 deliverables.presented 同源）→ 整卡可点预览。统一出口 = onOpenFile。',
          en: 'File display logic is fully ported: official file blocks in user messages → attachment cards; read/write/edit tool-card summary paths are clickable fileLinks; tool-fs meta.diffs paths feed the mention vocabulary; inline markdown file references resolve through fileMentions (unresolved stays inert code — never guessed); delivered files (present / turn-level deliverables.presented, same source) → whole-card clickable preview. Single exit = onOpenFile.',
        },
        {
          zh: '续聊正道（重要）：底层 keyed 数组（order + nodes）是只读快照，官方没有「往预览 binding 发消息」的写面 ⇒ 框内不可打字续聊。正道 = fork 开分支（sessions.fork）→ uiWorkspace.openSession 跳官方会话区；底部暂存输入框的「确定」经 onContinue 由调用方完成 fork + host 侧 agent.send 起轮次 + 跳转（官方派发同款路，无歪门邪道）。',
          en: 'The sanctioned way to continue (important): the underlying keyed array (order + nodes) is a read-only snapshot; the host exposes no write surface for sending into a preview binding ⇒ you cannot type inside the dialog. The sanctioned path = fork a branch (sessions.fork) → uiWorkspace.openSession to jump into the official session area; the bottom staging input’s "Confirm" goes through onContinue, where the caller forks + sends the first turn via host-side agent.send + navigates (the same official dispatch path — no hacks).',
        },
        {
          zh: '已知限制：官方样式未注入时回退自绘观感（功能不受影响）；长会话一次全渲染（翻页靠「加载更早记录」按钮，官方 loadOlder）；系统提示 / 上下文注入行按决策 28 过滤（官方 ContextInjectionRow 待实施）；👍👎 反馈按钮官方走 slots，弹窗无该插槽。',
          en: 'Known limits: when official styles are not injected, the self-drawn look applies (functionality unaffected); long sessions render all at once (paging via the "load earlier" button, official loadOlder); system-prompt / context-injection rows are filtered per decision 28 (official ContextInjectionRow pending); thumbs up/down go through official slots, which the dialog does not have.',
        },
      ],
      api: [
        {
          id: 'session-view-target',
          rows: [
            {
              name: 'openSessionView',
              type: '(sessions, uiConversation, id, retainSource?) => SessionViewTarget | null',
              def: '—',
              required: '是',
              desc: { zh: '建数据链：retain 物化 → binding → open 拉尾页 → target(chat)；不可解析返回 null', en: 'Builds the data chain: retain materialize → binding → open tail → target(chat); null when unresolvable' },
            },
            {
              name: 'target',
              type: 'SnapshotFace<ChatViewFace | undefined>',
              def: '—',
              desc: { zh: 'chat 快照订阅面（useSyncExternalStore 用）', en: 'Chat snapshot subscription surface (for useSyncExternalStore)' },
            },
            {
              name: 'loadOlder',
              type: '() => void',
              def: '—',
              desc: { zh: '向前翻一页更早的历史（官方 loadOlder）', en: 'Page backward through older history (official loadOlder)' },
            },
            {
              name: 'dispose',
              type: '() => void',
              def: '—',
              desc: { zh: '释放 retain 引用；弹窗关闭必调', en: 'Release the retain reference; must be called when the dialog closes' },
            },
          ],
        },
        {
          id: 'session-view-modal',
          rows: [
            { name: 'sessionId', type: 'string', def: '—', required: '是', desc: { zh: '要预览的会话', en: 'The session to preview' } },
            { name: 'view', type: 'SessionViewTarget', def: '—', required: '是', desc: { zh: 'openSessionView 的产物', en: 'The result of openSessionView' } },
            { name: 'heading', type: 'string', def: '—', desc: { zh: '可选标题（拼在「会话记录（只读）」后）', en: 'Optional title (appended after "Session transcript (read-only)")' } },
            { name: 'onClose', type: '() => void', def: '—', required: '是', desc: { zh: '关闭回调（调用方负责 view.dispose()）', en: 'Close callback (the caller owns view.dispose())' } },
            {
              name: 'forkSession',
              type: '(sessionId, atSeq?) => Promise<string>',
              def: '—',
              desc: { zh: 'fork 源会话（官方 ISessions.fork）；与 openHostSession 缺一即不渲染「继续对话」', en: 'Fork the source session (official ISessions.fork); without openHostSession the "Continue" button does not render' },
            },
            {
              name: 'openHostSession',
              type: '(sessionId: string) => void',
              def: '—',
              desc: { zh: '官方导航跳转（uiWorkspace.openSession）', en: 'Official navigation jump (uiWorkspace.openSession)' },
            },
            {
              name: 'onContinue',
              type: '(message: string) => Promise<void>',
              def: '—',
              desc: { zh: '暂存输入框「确定」：调用方完成 fork + host 侧 agent.send 起轮次 + 跳转；缺省 = 不渲染输入框', en: 'Staging input "Confirm": the caller forks + sends the first turn via host-side agent.send + navigates; absent = the input is not rendered' },
            },
            {
              name: 'onOpenFile',
              type: '(path: string) => void',
              def: '—',
              desc: { zh: '文件打开出口（工具卡 fileLink / md mention / 交付卡共用）；缺省 = 链接降级纯文本', en: 'File-open exit (shared by tool-card fileLink / md mentions / delivered cards); absent = links degrade to plain text' },
            },
            { name: 't', type: 'Translate', def: '内置', desc: { zh: '覆盖文案（核心字典自带全部会话文案，中英）', en: 'Override copy (the built-in dictionary carries all session copy, zh+en)' } },
          ],
        },
      ],
      code: [
        { id: 'session-usage', lang: 'tsx', src: usage },
        { id: 'session-data-chain', lang: 'ts', src: dataChain },
      ],
    },
  ],
}

export default doc
