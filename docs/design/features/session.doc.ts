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
          zh: '「继续对话」按钮按归档状态分化（调用方经 `archived` prop 注入）：已归档 ⇒ 开分支图标 + 确认框（fork 出子会话再跳官方区；官方策略归档会话不进主视图）；未归档 / 未提供 ⇒ 会话图标，点击直跳官方会话页。弹窗标题 = 会话自己的标题（`heading`，通常传宿主 sessions.list 的 displayTitle），已归档时标题旁带官方归档图标 + 「已归档」。',
          en: 'The "Continue" button forks by archive state (injected by the caller via the `archived` prop): archived ⇒ branch icon + confirmation (fork a child, then jump to the official area — official policy keeps archived sessions out of the main view); not archived / not provided ⇒ session icon, one click jumps straight to the official session page. The dialog title is the session’s own title (`heading`, usually the host sessions.list displayTitle); when archived, the official archive icon + "Archived" appears beside it.',
        },
        {
          zh: '归档状态**客户端读得到**（2026-10-22 解包 @deepseek-ai/dsh-api-workspace-controller@0.2.0-rc.2 核实，推翻此前「只有宿主侧读得到、要走 serveArchivedSessions 路由」的结论）：官方 client 服务 `workspaces` 的 `list` 快照带 `archivedSessionIds`，是 **registry-global 归档集合**（不是每工作区一份），由宿主 follow 流 baseline / `archived` 增量持续替换 ⇒ 注入 `workspaces` → `list.getSnapshot().archivedSessionIds` + `list.subscribe` 实时刷新，传给 `archived`。无需宿主路由。',
          en: 'Archive state IS readable client-side (verified 2026-10-22 by unpacking @deepseek-ai/dsh-api-workspace-controller@0.2.0-rc.2 — overturns the earlier conclusion that only the host could read it, via a serveArchivedSessions route): the official client service `workspaces` exposes a `list` snapshot carrying `archivedSessionIds` — the registry-global archive set (not one per workspace), continuously replaced by the host follow stream’s baseline / `archived` increments ⇒ inject `workspaces` → `list.getSnapshot().archivedSessionIds` + `list.subscribe` for live refresh, then pass it as `archived`. No host route needed.',
        },
        {
          zh: '标题区三段固定（用户 2026-10-22 拍板）：第一行 = 标题（调用方给的人话标题，缺省「会话预览」）+ 「已归档」徽标（**紧跟标题**，不跨两行居中）；第二行 = 副标题（会话 id，等宽小字，走 Modal 的 `subtitle`）；右侧 = 「继续对话」/ 关闭。会话 id 是标识，不进正文。',
          en: 'The header has three fixed parts (decided 2026-10-22): line 1 = the title (caller-supplied human title, default "Session preview") plus the **Archived** badge directly after the title (not centered across both lines); line 2 = the subtitle (session id, monospace caption, via the Modal `subtitle` prop); right side = "Continue" / close. The session id is an identifier and never goes into the body.',
        },
        {
          zh: '滚动与内距归核心（用户 2026-10-22 拍板）：Modal 的 body 是**唯一滚动容器**，内距也归它 —— 内容（本模块）只按流排版，不写 `height:100%`、不自己开滚动条。所以会话区里的官方 ChatView.frame / scroll 的 `overflow` / 高度 / 内距一律归零（见 session.css 的双类名钩子）；真需要「左右两栏各自滚」时不用内容自管，而是把右侧那列放到**页面层**（见下条）。',
          en: 'Scrolling and padding belong to the core (decided 2026-10-22): the Modal body is the **only scroll container**, and it owns the padding — this module just lays out flow content, never `height:100%`, never its own scrollbar. That is why the inner ChatView.frame / scroll `overflow`, height and padding are all zeroed (see the double-class hooks in session.css). If two panes must scroll independently, do not let the content manage height — put the right column at the **page level** (next item).',
        },
        {
          zh: '文件链接（工具卡 fileLink / md 行内引用 / 交付卡）统一走 `onOpenFile`。接法（用户 2026-10-22 定）：预览开在**页面右侧**（核心 `openFilePreview` 的 dock，挤窄主区），不在弹窗里分栏。弹窗这边**什么都不用传**：dock 把占宽发布成 `--dshpc-page-inset-right`，遮罩按它让位 ⇒ 分栏不被压暗、照常可点，弹窗在左边剩余区域居中（用户 2026-10-22 二次拍板，撤掉了 `insetRight` 那条量宽度的路子）。工作区文件服务缺席时不给 `onOpenFile`，链接自然是纯文本，不假装能点。',
          en: 'Every file link (tool-card fileLink / md mentions / delivered cards) exits through `onOpenFile`. Wiring (decided 2026-10-22): the preview opens as a **page-level right column** (the core `openFilePreview` dock, squeezing the main area) — never as a split inside the dialog. The dialog passes **nothing** for this: the dock publishes its occupied width as `--dshpc-page-inset-right` and the mask yields by it, so the column stays bright and clickable while the dialog centers in the remaining left area (re-decided 2026-10-22, dropping the width-measuring `insetRight` route). When the workspace file service is absent, pass no `onOpenFile` so links stay plain text instead of pretending to be clickable.',
        },
        {
          zh: '「已编辑文件」卡（官方 ChangedFiles，ui-deliverables 2026-10-22 接上）：某轮出现 `workspace/changes` 公告时，turn 级 `deliverables.changes = { seq }` 落进同一份 turn.data；卡片内容走宿主只读路由 `GET api/changes.summary?sessionId&seq`（裸 fetch，鉴权随宿主会话），载荷按官方 `isChangesSummary` 逐字段校验，不合规 / 404 = 不渲染（不猜数据）。观感 = 文件类型图标 + 「已编辑 x.md」（多文件 = 「已编辑 N 个文件」）+ 计数 `+N -M`（hover 才上色）；单文件卡可点，走 `onOpenFile`（官方开右侧 review 标签页，本包只有文件打开这一个口子）。',
          en: '"Edited files" card (official ChangedFiles, ui-deliverables, wired 2026-10-22): when a turn announces `workspace/changes`, the turn-level `deliverables.changes = { seq }` lands in the same turn.data; the card body comes from the host read-only route `GET api/changes.summary?sessionId&seq` (bare fetch, host session auth), validated field-by-field against the official `isChangesSummary` — invalid / 404 renders nothing (no guessing). Look = file-type icon + "Edited x.md" ("Edited N files" for many) + counts `+N -M` (coloured on hover only); the single-file card is clickable via `onOpenFile` (the official one opens a right-sidebar review tab — this package only has the file-open hatch).',
        },
        {
          zh: '已知限制：官方样式未注入时回退自绘观感（功能不受影响）；长会话一次全渲染（翻页靠「加载更早记录」按钮，官方 loadOlder）；系统提示 / 上下文注入行按决策 28 过滤（官方 ContextInjectionRow 待实施）；👍👎 反馈按钮官方走 slots，弹窗无该插槽。',
          en: 'Known limits: when official styles are not injected, the self-drawn look applies (functionality unaffected); long sessions render all at once (paging via the "load earlier" button, official loadOlder); system-prompt / context-injection rows are filtered per decision 28 (official ContextInjectionRow pending); thumbs up/down go through official slots, which the dialog does not have.',
        },
        {
          zh: '配套的官方会话列表（demo 预览站「真实会话列表」在用）：宿主 client 服务 `sessions`（@deepseek-ai/dsh-api-session-controller client 半侧，0.2.0-rc.2 解包核实）暴露 `list` 快照存储——`{ ids, byId, phase }`，每行带 `displayTitle`（durable title → 项目 basename → session id 三级回落）/ `updatedAt` / `running` / `blank`；数据来自宿主 `session/list` RPC（ApiSessionList.list：「Read every visible attached and persisted Session without activating an Agent」，按活动序）⇒ **列会话 ≠ 打开会话，冷安全，归档会话也在列**。demo 页面按 updatedAt 降序取前 20 条，点行 → openSessionView 真预览。',
          en: 'The companion official session list (used by the demo preview site’s "real session list"): the host client service `sessions` (the client half of @deepseek-ai/dsh-api-session-controller, verified by unpacking 0.2.0-rc.2) exposes a `list` snapshot store — `{ ids, byId, phase }`, each row carrying `displayTitle` (durable title → project basename → session id, three-level fallback) / `updatedAt` / `running` / `blank`; the data comes from the host `session/list` RPC (ApiSessionList.list: "Read every visible attached and persisted Session without activating an Agent", ordered by activity) ⇒ listing sessions ≠ opening them — cold-safe, and archived sessions are listed too. The demo page takes the 20 most recent by updatedAt; clicking a row → openSessionView for a real preview.',
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
            { name: 'heading', type: 'string', def: 'sessionHeading（会话预览）', required: '否', desc: { zh: '弹窗标题 = 会话自己的标题（宿主 sessions.list 的 displayTitle，可自定义）；会话 id 是标识，固定显示在标题下方副标题行（等宽小字），不占正文', en: 'Dialog title = the session’s own title (host sessions.list displayTitle — fully customisable); the session id is an identifier and always sits on the subtitle line **under** the title (monospace caption), never in the body' } },
            { name: 'archived', type: 'boolean', def: '—', desc: { zh: '是否已归档（调用方从官方 client 服务 `workspaces` 快照的 `archivedSessionIds` 取）；分化「继续对话」：归档=开分支确认框，未归档=直跳官方会话页', en: 'Whether archived (caller reads it from the official client service `workspaces` snapshot field `archivedSessionIds`); differentiates "Continue": archived = fork confirmation, not archived = direct jump to the official session page' } },
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
