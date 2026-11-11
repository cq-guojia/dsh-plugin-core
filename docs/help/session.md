<!-- 本文件由 scripts/gen-docs.mjs 自动生成，请勿手改；改对应的 .doc.ts 后重跑 node scripts/gen-docs.mjs -->

# session —— 会话预览

> EN: session — session preview

导出：SessionViewModal、openSessionView、openSessionReview、ChangedFileDiff

## 会话预览

> EN: Session preview

把一次会话渲染成**只读弹窗**，观感与官方会话页一致。先用 `openSessionView` 建数据链得到 `view`（不可解析返回 `null`），再交给 `SessionViewModal`；**关闭时必须 `view.dispose()`**。

> EN: Renders one session as a **read-only dialog** that looks like the official session page. First `openSessionView` builds the chain and returns a `view` (`null` when unresolvable), then hand it to `SessionViewModal`; **call `view.dispose()` on close**.

归档态不需要调用方传：核心订阅官方 `workspaces.list` 快照的 `archivedSessionIds`（宿主 `domain/changed` → `workspace/follow` 增量推送），弹窗开着期间归档徽标与「继续对话」实时跟随；点击前还会用权威快照复核，不会直开已归档会话。前提是插件 client `apply` 调过一次 `connectHost(ctx)`。归档会话走同一条数据链，同样可读。

> EN: Archive state needs no prop: core subscribes to `archivedSessionIds` on the official `workspaces.list` snapshot (host `domain/changed` → `workspace/follow` increments), so the badge and "Continue" follow changes while the dialog stays open; the click re-checks the authoritative snapshot so an archived session is never opened directly. Call `connectHost(ctx)` once in the plugin client `apply`. Archived sessions use the same data chain and read fine.

「继续对话」始终保留：未归档是会话图标、点击直跳官方会话区；已归档换成开分支图标、点击先弹确认框（fork 出子会话再跳转）。按钮只在缺 `openHostSession` 时缺席；缺 `forkSession` 时确认框内如实说明能力未就位，不静默隐藏入口。

> EN: "Continue" is always kept: for an active session it shows the conversation icon and jumps straight to the official session; for an archived one it switches to the branch icon and opens a confirm dialog before forking into a child session. The button disappears only when `openHostSession` is absent; without `forkSession` the dialog states plainly that the capability is unavailable instead of silently hiding the entry.

新会话首轮：首个模型事件落盘前，用户提示词只在官方 `inbox` 投影与 `session.pendingSubmissions` 本地回显里，`chat.order` 还没有 user 节点。核心两路合并渲染（按 rpcId 去重），所以刚发完提示词就打开预览也能立刻看到自己发的话；投影与回显都缺席时不编造气泡。

> EN: First turn: before the first model event is durable, the user prompt lives only in the official `inbox` projection and the `session.pendingSubmissions` local echo — `chat.order` has no user node yet. Core merges both sources (deduped by rpcId), so opening the preview right after sending a prompt still shows what you wrote; nothing is invented when neither source is present.

快照只读，框内不能打字续聊。续聊 = `forkSession` 开分支 + `openHostSession` 跳官方会话区；暂存输入框的确定走 `onContinue`（fork + 发首轮 + 跳转）。

> EN: The snapshot is read-only, so you cannot type inside the dialog. Continuing means `forkSession` + `openHostSession`; the staging input’s confirm goes through `onContinue` (fork + first turn + navigate).

**两类「等用户表态」的卡**画在底栏栈顶部（等价官方的输入框接管 / 题面板位置），有卡时底栏分隔线自动关掉（官方那里没有线）：`等待审批`卡的外观光挂官方 `ApprovalPanel.module.css` 类名，「拒绝 / 允许一次」直接调该审批对象自己的 `answer()`，答完自行消失；`选题卡`取官方 `userQuestions` 投影的第一组待答问题，按官方「不可作答」的呈现画（verdict + 问题清单）——**只渲染、不作答**，因为实时阻塞的作答只有官方题面板那条瀑布。要审批卡就得给 `openSessionView` 第五参 `uiSession`；不给则预览保持纯只读、完全不画。两条边界：审批是**在线请求**（审计事件虽落会话日志，但没有「未决」投影），归档 / 已结束会话永远没有；预览因此**可选地可写**（点按钮会真正作答，与官方视图先答者生效）。

> EN: **Two "waiting for you" cards** render at the top of the footer stack (the equivalent of the official composer takeover / question panel), and the footer divider hides itself while one is present (the official side has no line there): the `waiting for approval` card is styled purely by the official `ApprovalPanel.module.css` classes, and its "Reject / Allow once" buttons call that pending approval’s own `answer()`, so it vanishes once answered; the `question card` shows the first pending set from the official `userQuestions` projection in the official **non-answerable** presentation (verdict + question list) — **rendered, not answered**, because answering a live block belongs to the official question panel’s waterfall. The approval card requires the host `uiSession` service as `openSessionView`’s fifth argument; without it the preview stays strictly read-only and draws nothing. Two limits: approvals are **live requests** (the audit events do land in the session log, but nothing projects "undecided"), so archived / finished sessions never have one; and the preview thus becomes **optionally writable** (clicking really answers; whoever answers first wins against the official view).

**内容插槽**（都可选，都是 `ReactNode`，缺省不渲染 —— DOM 与不传时逐字一致）：`title` 换标题行（sessionId 副标题行仍在）；`header` 整块换左侧标题区（连 sessionId 行一起，归档徽标改挂动作区最前）；`headerActions` 追加在「继续对话」**左边**（继续对话与 ✕ 恒居右）；`bodyHeader` 落在会话滚动容器内最顶（自带固定下边距 `--dshpc-space-3`，不跟随相邻项的 margin）；`bodyFooter` 落在最后一条回复下方、交付文件 / 变更卡之后、复制 / 分支 / 用量操作行之上（末尾没有回复时退回流的末尾）。两个内容槽都随会话一起滚，加载中 / 空 / 出错 / 正常四态都渲染。槽内容由调用方自己渲染，核心不取数、不做数据注入；弹窗与调用方在同一文档内，槽里直接用 `--dshpc-*` token 与核心样式即可生效。标题是一整块 `ReactNode`，放链接 / 标签 / 按钮都行（点击不会冒泡关窗）；文字与徽标混排时用 `inline-flex` + `align-items:center` 包一层，否则徽标会贴基线显得下沉。

> EN: **Content slots** (all optional `ReactNode`s; absent means nothing is rendered — the DOM stays byte-identical): `title` replaces the title row (the sessionId subtitle stays); `header` replaces the whole left title area (including the sessionId row, moving the archived badge to the front of the header actions); `headerActions` is appended after "Continue" and before the close button; `bodyHeader` / `bodyFooter` sit at the very top / bottom inside the session scroller, scroll with the session, and render in all four states (loading / empty / error / normal). Slot content belongs to the caller — core fetches nothing and injects no data; the dialog shares the document, so `--dshpc-*` tokens and core styles just work inside a slot.

文件出口只有一个：工具卡路径、行内引用、交付卡都走 `onOpenFile`；不传则链接降级为纯文本（可以点但没有出口，不是坏了）。自己已有预览面的，在回调里调你自己的（核心一个 DOM 都不碰）；没有的，一行接上核心自带的右侧分栏：`onOpenFile: (path, sid) => openFilePreview({ mount: '#page-row', path, sessionId: sid })`——落点给元素或选择器都行，弹窗不需要任何遮罩参数。

> EN: There is exactly one file exit: tool-card paths, inline mentions and delivered cards all go through `onOpenFile`; without it links degrade to plain text (clickable-looking but no exit — not a break). If you already own a preview surface, call yours inside the callback (core touches no DOM); otherwise wire core’s dock in one line: `onOpenFile: (path, sid) => openFilePreview({ mount: '#page-row', path, sessionId: sid })` — the mount takes an element or a selector, and the dialog needs no mask props.

变更文件的审阅出口是 `onOpenReview`，落点用 `openSessionReview({ mount, locator })` 一行接上：`locator`（sessionId / seq / index / display）到 diff 的拼装归会话域，调用方不挑组件、不塞节点、不补 ✕。审阅面板是无头的，`openSessionReview` 已把关闭钮画在审阅头行尾（与换行钮同排），你什么都不用做。

> EN: The review exit for changed files is `onOpenReview`; wire it with one line, `openSessionReview({ mount, locator })`. Turning the locator (sessionId / seq / index / display) into a diff belongs to the session domain — pick no components, pass no nodes, add no ✕. The review panel is headerless, so `openSessionReview` already draws the close button at the end of the review header row (next to the wrap toggle); nothing left for you to do.

限制：官方样式未注入时回退自绘观感（功能不受影响）；长会话一次全渲染，用「加载更早记录」向前翻页；👍👎 反馈走官方 slots，弹窗没有该插槽。

> EN: Limits: without official styles injected, the self-drawn look applies (functionality unaffected); long sessions render whole, paged backward via "load earlier"; 👍👎 feedback goes through official slots, which this dialog lacks.

| 参数 | 类型 | 必填 | 默认 | 说明(zh) | 说明(en) |
|---|---|---|---|---|---|
| `openSessionView` | `(sessions, uiConversation, id, retainSource?, uiSession?) => SessionViewTarget \| null` | 是 | — | 建数据链：retain → binding → open → target(chat)；不可解析返回 null | Builds the chain retain → binding → open → target(chat); null when unresolvable |
| `target` | `SnapshotFace<ChatViewFace \| undefined>` | — | — | chat 快照订阅面（供 useSyncExternalStore） | Chat snapshot surface (for useSyncExternalStore) |
| `session` | `SnapshotFace<SessionSnapshotFace>` | — | — | 会话自身快照（加载态 / 是否翻尽 / 本地提交回显） | Snapshot of the session itself (loading state, paged-out, local submission echoes) |
| `inbox` | `SnapshotFace<unknown>` | — | — | 官方 `inbox` 投影订阅面（faceOf("inbox")）；首轮等待期用户消息的 host 侧真源，由 openSessionView 接好，调用方零接线 | Official `inbox` projection surface (faceOf("inbox")); the host-side source of first-turn user messages, wired by openSessionView — no caller setup |
| `pendingApproval` | `SnapshotFace<PendingApprovalFace \| undefined> \| null` | — | null | 「等待审批」在线请求面（`uiSession.sessionStatus` 派生）：只在该会话此刻真在等审批时有值；null = 没给 uiSession | Live approval surface (from `uiSession.sessionStatus`): a value only while that session is actually waiting; null = no `uiSession` passed |
| `pendingQuestions` | `SnapshotFace<PendingQuestionSet \| null> \| null` | — | null | 「选择题卡」面（官方 `userQuestions` 投影里的第一组待答问题）：只渲染，不作答；null = 宿主没注册该投影 | Question-card surface (first pending set in the official `userQuestions` projection): rendered only, not answered; null = projection not registered |
| `loadOlder` | `() => void` | — | — | 向前翻一页更早的历史 | Page backward through older history |
| `dispose` | `() => void` | — | — | 释放 retain 引用；弹窗关闭必调 | Release the retain reference; call on close |

| 参数 | 类型 | 必填 | 默认 | 说明(zh) | 说明(en) |
|---|---|---|---|---|---|
| `sessionId` | `string` | 是 | — | 要预览的会话 | The session to preview |
| `view` | `SessionViewTarget` | 是 | — | openSessionView 的返回值 | What openSessionView returned |
| `onClose` | `() => void` | 是 | — | 关闭回调；由调用方在里面调 view.dispose() | Close callback; the caller calls view.dispose() inside it |
| `title` | `ReactNode` | 否 | 「会话预览」 | 标题行；通常传宿主 sessions.list 的 displayTitle，也可放任意节点（后面跟标签 / 按钮）。会话 id 仍在下方副标题行（等宽小字），不受影响 | Title row; usually the displayTitle from the host sessions.list, or any node (tags / buttons after it). The session id stays on the monospace subtitle line below, unaffected |
| `heading` | `string` | 否 | — | 0.34 的旧名，等价 `title`（只收字符串）；两者都给以 `title` 为准 | Legacy name from 0.34, equal to `title` (string only); `title` wins when both are given |
| `header` | `ReactNode` | 否 | — | 整块替换左侧标题区（标题行 + sessionId 行）：传了则 `title` / `heading` 不生效，归档徽标改挂到右侧动作区最前；「继续对话」与关闭 ✕ 不受影响 | Replaces the whole left title area (title row + sessionId row): `title` / `heading` stop applying, and the archived badge moves to the front of the header actions; "Continue" and ✕ are unaffected |
| `headerActions` | `ReactNode` | 否 | — | 头部右侧追加动作：排在核心「继续对话」**左边**（「继续对话」与关闭 ✕ 恒居最右） | Extra header actions, placed to the **left** of core "Continue" (Continue and ✕ always stay rightmost) |
| `bodyHeader` | `ReactNode` | 否 | — | 会话内容最顶端（滚动容器内、所有节点与「加载更早」之前），自带固定下边距（`--dshpc-space-3`）；随会话一起滚，加载中 / 空 / 出错 / 正常四态都渲染 | Very top of the session content (inside the scroller, before all nodes and "load earlier"), with a fixed bottom gap (`--dshpc-space-3`); scrolls with the session and renders in all four states (loading / empty / error / normal) |
| `bodyFooter` | `ReactNode` | 否 | — | 最后一条回复下方、交付文件 / 变更卡**之后**、复制 / 分支 / 用量操作行**之上**（末尾没有回复或没有尾操作行时落在流的末尾）；随会话一起滚，四态都渲染 | Below the last reply, after the delivered-files / changed-files cards and **above** the copy / branch / usage action row (falls to the end of the flow when there is no trailing reply or action row); scrolls with the session and renders in all four states |
| `forkSession` | `(sessionId, atSeq?) => Promise<string>` | — | — | 开分支并返回子会话 id；已归档会话的「继续对话」始终渲染，缺它时确认框内如实说明能力未就位 | Fork and resolve the child session id; "Continue" stays rendered for archived sessions, and the dialog states plainly when this capability is missing |
| `openHostSession` | `(sessionId: string) => void` | — | — | 跳官方会话区（uiWorkspace.openSession） | Jump into the official session area (uiWorkspace.openSession) |
| `onContinue` | `(message: string) => Promise<void>` | — | — | 暂存输入框的确定：调用方完成 fork + 发首轮 + 跳转；缺省 = 不渲染输入框 | Staging input confirm: caller forks, sends the first turn, navigates; absent = no input rendered |
| `onOpenFile` | `(path: string, sessionId: string, options?: { line?: number }) => void` | — | — | 文件打开出口（工具卡 fileLink / 行内引用 / 交付卡共用）；第二参是文件所属会话 id，别拿别的会话去定位；第三参可带 `line`（read 工具卡的 `offset`，直接转给 `openFilePreview` 的 `opts.line`）；缺省 = 链接纯文本 | File-open exit shared by fileLinks, mentions and delivered cards; the second arg is the owning session id — locate the file there, not elsewhere; the third may carry `line` (a read call’s `offset`, forward it to `openFilePreview`’s `opts.line`); absent = plain text |
| `onOpenReview` | `(locator: ChangedFileReviewLocator) => void` | — | — | 变更文件的审阅出口（等价官方 openReview）；落点用 `openSessionReview({ mount, locator })` 一行接上；缺省 = 变更卡整张不可点 | Review exit for changed files (equals official openReview); wire it with `openSessionReview({ mount, locator })`; absent = the change card is not clickable |
| `t` | `Translate` | — | 内置 | 覆盖文案（内置字典已含全部会话文案，中英） | Override copy (the built-in dictionary has all session copy, zh+en) |

```tsx id="session-usage"
import { openSessionView, openSessionReview, SessionViewModal } from 'dsh-plugin-core/adv/session'

// 宿主服务由调用方注入：sessions ← dsh-api-session-controller、
//   uiConversation ← dsh-client-ui-conversation
const view = openSessionView(sessions, uiConversation, sessionId, 'dsh-task-reminder')
if (view !== null) {
  h(SessionViewModal, {
    sessionId,
    view,
    title: '镜像升级日报',                      // 标题行，缺省「会话预览」
    // 插槽（都可选，缺省不渲染 —— DOM 与不传时一致）：
    // 标题行加节点，sessionId 行仍在；文字与徽标混排要用 inline-flex，否则徽标贴基线会下沉
    // title: h('span', { style: { display: 'inline-flex', alignItems: 'center', gap: '6px' } },
    //   '日报', h(Chip, { size: 'xs' }, '运行中')),
    // header: h(TaskHead, { taskId }),         // 整块换左侧标题区（含 sessionId 行；归档徽标改挂动作区最前）
    // headerActions: h(Button, null, '导出'),   // 排在「继续对话」左边（继续对话与 ✕ 恒居右）
    // bodyHeader: h(ContextBar),               // 会话滚动容器内最顶，随会话滚
    // bodyFooter: h(SessionSummary),           // 交付文件之后、复制/分支/用量操作行之上；没回复则在最底
    onClose: () => { view.dispose(); setOpen(false) },   // 关闭必须 dispose
    // 续聊（可选）：fork 开分支 → 跳官方会话区；缺 openHostSession 才不渲染该入口
    forkSession: (id, atSeq) => sessions.fork({ sessionId: id, increaseTitle: true, atSeq }),
    openHostSession: (id) => uiWorkspace.openSession(id),
    // 暂存输入框（可选）：由调用方 fork + 发首轮 + 跳转
    onContinue: async (message) => {
      const child = await forkSession(sessionId)
      await hostContinue(child, message)
      openHostSession(child)
    },
    // 文件打开出口：给一个落点即可（元素或选择器），核心自带右侧分栏
    onOpenFile: (path, sid, opts) => openFilePreview({ mount: '#page-row', path, sessionId: sid, line: opts?.line }),
    // 变更文件审阅：一行打开那次改动的 diff（面板 / 关闭钮全归核心）
    onOpenReview: (locator) => openSessionReview({ mount: '#page-row', locator }),
    // 归档态不用传：核心订阅官方 workspaces 快照（apply 里 connectHost 接线一次即可）
    t,                                          // 可选，覆盖文案
  })
}
```

```ts id="session-data-chain"
// 数据链（越往上越早）：
//   sessions.retain(id, { source })  物化 scope
//     → sessions.binding(id)         取绑定
//     → session.open()               幂等拉历史尾页
//     → uiConversation.binding(binding).target('chat')
//                                     拿 ChatSnapshot：order + nodes（keyed 流）
//     → session.projections.faceOf('inbox')
//                                     首轮等待期用户消息（host 投影，冷读也拿得到）
// 用完必须 view.dispose()，否则会话 scope 不回收。
```
