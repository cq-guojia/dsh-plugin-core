// session 子包的使用帮助 —— 真源（TS 数据模块）。内容全在此一处，demo 与 md 都从这份派生。
import type { DocTopic } from '../design/doc-format.js'

const usage = `import { openSessionView, openSessionReview, SessionViewModal } from 'dsh-plugin-core/session'

// 宿主服务由调用方注入：sessions ← dsh-api-session-controller、
//   uiConversation ← dsh-client-ui-conversation
const view = openSessionView(sessions, uiConversation, sessionId, 'dsh-task-reminder')
if (view !== null) {
  h(SessionViewModal, {
    sessionId,
    view,
    heading: '镜像升级日报',                    // 标题，缺省「会话预览」
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
}`

const dataChain = `// 数据链（越往上越早）：
//   sessions.retain(id, { source })  物化 scope
//     → sessions.binding(id)         取绑定
//     → session.open()               幂等拉历史尾页
//     → uiConversation.binding(binding).target('chat')
//                                     拿 ChatSnapshot：order + nodes（keyed 流）
//     → session.projections.faceOf('inbox')
//                                     首轮等待期用户消息（host 投影，冷读也拿得到）
// 用完必须 view.dispose()，否则会话 scope 不回收。`

const doc: DocTopic = {
  title: { zh: 'session —— 会话预览', en: 'session — session preview' },
  exports: ['SessionViewModal', 'openSessionView', 'openSessionReview', 'ChangedFileDiff'],
  sections: [
    {
      id: 'session',
      heading: { zh: '会话预览', en: 'Session preview' },
      prose: [
        {
          zh: '把一次会话渲染成**只读弹窗**，观感与官方会话页一致。先用 `openSessionView` 建数据链得到 `view`（不可解析返回 `null`），再交给 `SessionViewModal`；**关闭时必须 `view.dispose()`**。',
          en: 'Renders one session as a **read-only dialog** that looks like the official session page. First `openSessionView` builds the chain and returns a `view` (`null` when unresolvable), then hand it to `SessionViewModal`; **call `view.dispose()` on close**.',
        },
        {
          zh: '归档态不需要调用方传：核心订阅官方 `workspaces.list` 快照的 `archivedSessionIds`（宿主 `domain/changed` → `workspace/follow` 增量推送），弹窗开着期间归档徽标与「继续对话」实时跟随；点击前还会用权威快照复核，不会直开已归档会话。前提是插件 client `apply` 调过一次 `connectHost(ctx)`。归档会话走同一条数据链，同样可读。',
          en: 'Archive state needs no prop: core subscribes to `archivedSessionIds` on the official `workspaces.list` snapshot (host `domain/changed` → `workspace/follow` increments), so the badge and "Continue" follow changes while the dialog stays open; the click re-checks the authoritative snapshot so an archived session is never opened directly. Call `connectHost(ctx)` once in the plugin client `apply`. Archived sessions use the same data chain and read fine.',
        },
        {
          zh: '「继续对话」始终保留：未归档是会话图标、点击直跳官方会话区；已归档换成开分支图标、点击先弹确认框（fork 出子会话再跳转）。按钮只在缺 `openHostSession` 时缺席；缺 `forkSession` 时确认框内如实说明能力未就位，不静默隐藏入口。',
          en: '"Continue" is always kept: for an active session it shows the conversation icon and jumps straight to the official session; for an archived one it switches to the branch icon and opens a confirm dialog before forking into a child session. The button disappears only when `openHostSession` is absent; without `forkSession` the dialog states plainly that the capability is unavailable instead of silently hiding the entry.',
        },
        {
          zh: '新会话首轮：首个模型事件落盘前，用户提示词只在官方 `inbox` 投影与 `session.pendingSubmissions` 本地回显里，`chat.order` 还没有 user 节点。核心两路合并渲染（按 rpcId 去重），所以刚发完提示词就打开预览也能立刻看到自己发的话；投影与回显都缺席时不编造气泡。',
          en: 'First turn: before the first model event is durable, the user prompt lives only in the official `inbox` projection and the `session.pendingSubmissions` local echo — `chat.order` has no user node yet. Core merges both sources (deduped by rpcId), so opening the preview right after sending a prompt still shows what you wrote; nothing is invented when neither source is present.',
        },
        {
          zh: '快照只读，框内不能打字续聊。续聊 = `forkSession` 开分支 + `openHostSession` 跳官方会话区；暂存输入框的确定走 `onContinue`（fork + 发首轮 + 跳转）。',
          en: 'The snapshot is read-only, so you cannot type inside the dialog. Continuing means `forkSession` + `openHostSession`; the staging input’s confirm goes through `onContinue` (fork + first turn + navigate).',
        },
        {
          zh: '文件出口只有一个：工具卡路径、行内引用、交付卡都走 `onOpenFile`；不传则链接降级为纯文本（可以点但没有出口，不是坏了）。自己已有预览面的，在回调里调你自己的（核心一个 DOM 都不碰）；没有的，一行接上核心自带的右侧分栏：`onOpenFile: (path, sid) => openFilePreview({ mount: \'#page-row\', path, sessionId: sid })`——落点给元素或选择器都行，弹窗不需要任何遮罩参数。',
          en: 'There is exactly one file exit: tool-card paths, inline mentions and delivered cards all go through `onOpenFile`; without it links degrade to plain text (clickable-looking but no exit — not a break). If you already own a preview surface, call yours inside the callback (core touches no DOM); otherwise wire core’s dock in one line: `onOpenFile: (path, sid) => openFilePreview({ mount: \'#page-row\', path, sessionId: sid })` — the mount takes an element or a selector, and the dialog needs no mask props.',
        },
        {
          zh: '变更文件的审阅出口是 `onOpenReview`，落点用 `openSessionReview({ mount, locator })` 一行接上：`locator`（sessionId / seq / index / display）到 diff 的拼装归会话域，调用方不挑组件、不塞节点、不补 ✕。审阅面板是无头的，`openSessionReview` 已把关闭钮画在审阅头行尾（与换行钮同排），你什么都不用做。',
          en: 'The review exit for changed files is `onOpenReview`; wire it with one line, `openSessionReview({ mount, locator })`. Turning the locator (sessionId / seq / index / display) into a diff belongs to the session domain — pick no components, pass no nodes, add no ✕. The review panel is headerless, so `openSessionReview` already draws the close button at the end of the review header row (next to the wrap toggle); nothing left for you to do.',
        },
        {
          zh: '限制：官方样式未注入时回退自绘观感（功能不受影响）；长会话一次全渲染，用「加载更早记录」向前翻页；👍👎 反馈走官方 slots，弹窗没有该插槽。',
          en: 'Limits: without official styles injected, the self-drawn look applies (functionality unaffected); long sessions render whole, paged backward via "load earlier"; 👍👎 feedback goes through official slots, which this dialog lacks.',
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
              desc: { zh: '建数据链：retain → binding → open → target(chat)；不可解析返回 null', en: 'Builds the chain retain → binding → open → target(chat); null when unresolvable' },
            },
            {
              name: 'target',
              type: 'SnapshotFace<ChatViewFace | undefined>',
              def: '—',
              desc: { zh: 'chat 快照订阅面（供 useSyncExternalStore）', en: 'Chat snapshot surface (for useSyncExternalStore)' },
            },
            {
              name: 'session',
              type: 'SnapshotFace<SessionSnapshotFace>',
              def: '—',
              desc: { zh: '会话自身快照（加载态 / 是否翻尽 / 本地提交回显）', en: 'Snapshot of the session itself (loading state, paged-out, local submission echoes)' },
            },
            {
              name: 'inbox',
              type: 'SnapshotFace<unknown>',
              def: '—',
              desc: { zh: '官方 `inbox` 投影订阅面（faceOf("inbox")）；首轮等待期用户消息的 host 侧真源，由 openSessionView 接好，调用方零接线', en: 'Official `inbox` projection surface (faceOf("inbox")); the host-side source of first-turn user messages, wired by openSessionView — no caller setup' },
            },
            {
              name: 'loadOlder',
              type: '() => void',
              def: '—',
              desc: { zh: '向前翻一页更早的历史', en: 'Page backward through older history' },
            },
            {
              name: 'dispose',
              type: '() => void',
              def: '—',
              desc: { zh: '释放 retain 引用；弹窗关闭必调', en: 'Release the retain reference; call on close' },
            },
          ],
        },
        {
          id: 'session-view-modal',
          rows: [
            { name: 'sessionId', type: 'string', def: '—', required: '是', desc: { zh: '要预览的会话', en: 'The session to preview' } },
            { name: 'view', type: 'SessionViewTarget', def: '—', required: '是', desc: { zh: 'openSessionView 的返回值', en: 'What openSessionView returned' } },
            { name: 'onClose', type: '() => void', def: '—', required: '是', desc: { zh: '关闭回调；由调用方在里面调 view.dispose()', en: 'Close callback; the caller calls view.dispose() inside it' } },
            { name: 'heading', type: 'string', def: '「会话预览」', required: '否', desc: { zh: '弹窗标题，通常传宿主 sessions.list 的 displayTitle；会话 id 显示在标题下方副标题行（等宽小字）', en: 'Dialog title, usually the displayTitle from the host sessions.list; the session id sits on the monospace subtitle line below it' } },
            {
              name: 'forkSession',
              type: '(sessionId, atSeq?) => Promise<string>',
              def: '—',
              desc: { zh: '开分支并返回子会话 id；已归档会话的「继续对话」始终渲染，缺它时确认框内如实说明能力未就位', en: 'Fork and resolve the child session id; "Continue" stays rendered for archived sessions, and the dialog states plainly when this capability is missing' },
            },
            {
              name: 'openHostSession',
              type: '(sessionId: string) => void',
              def: '—',
              desc: { zh: '跳官方会话区（uiWorkspace.openSession）', en: 'Jump into the official session area (uiWorkspace.openSession)' },
            },
            {
              name: 'onContinue',
              type: '(message: string) => Promise<void>',
              def: '—',
              desc: { zh: '暂存输入框的确定：调用方完成 fork + 发首轮 + 跳转；缺省 = 不渲染输入框', en: 'Staging input confirm: caller forks, sends the first turn, navigates; absent = no input rendered' },
            },
            {
              name: 'onOpenFile',
              type: '(path: string, sessionId: string, options?: { line?: number }) => void',
              def: '—',
              desc: { zh: '文件打开出口（工具卡 fileLink / 行内引用 / 交付卡共用）；第二参是文件所属会话 id，别拿别的会话去定位；第三参可带 `line`（read 工具卡的 `offset`，直接转给 `openFilePreview` 的 `opts.line`）；缺省 = 链接纯文本', en: 'File-open exit shared by fileLinks, mentions and delivered cards; the second arg is the owning session id — locate the file there, not elsewhere; the third may carry `line` (a read call’s `offset`, forward it to `openFilePreview`’s `opts.line`); absent = plain text' },
            },
            {
              name: 'onOpenReview',
              type: '(locator: ChangedFileReviewLocator) => void',
              def: '—',
              desc: { zh: '变更文件的审阅出口（等价官方 openReview）；落点用 `openSessionReview({ mount, locator })` 一行接上；缺省 = 变更卡整张不可点', en: 'Review exit for changed files (equals official openReview); wire it with `openSessionReview({ mount, locator })`; absent = the change card is not clickable' },
            },
            { name: 't', type: 'Translate', def: '内置', desc: { zh: '覆盖文案（内置字典已含全部会话文案，中英）', en: 'Override copy (the built-in dictionary has all session copy, zh+en)' } },
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
