// session 子包的使用帮助 —— 真源（TS 数据模块）。内容全在此一处，demo 与 md 都从这份派生。
import type { DocTopic } from '../doc-format.js'

const usage = `import { openSessionView, SessionViewModal } from 'dsh-plugin-core/session'

// 宿主服务由调用方注入：sessions ← dsh-api-session-controller、
//   uiConversation ← dsh-client-ui-conversation
const view = openSessionView(sessions, uiConversation, sessionId, 'dsh-task-reminder')
if (view !== null) {
  h(SessionViewModal, {
    sessionId,
    view,
    heading: '镜像升级日报',                    // 标题，缺省「会话预览」
    onClose: () => { view.dispose(); setOpen(false) },   // 关闭必须 dispose
    // 续聊（可选）：fork 开分支 → 跳官方会话区；两者缺一即不渲染该入口
    forkSession: (id, atSeq) => sessions.fork({ sessionId: id, increaseTitle: true, atSeq }),
    openHostSession: (id) => uiWorkspace.openSession(id),
    // 暂存输入框（可选）：由调用方 fork + 发首轮 + 跳转
    onContinue: async (message) => {
      const child = await forkSession(sessionId)
      await hostContinue(child, message)
      openHostSession(child)
    },
    onOpenFile: (path) => openFilePreview(path), // 文件打开出口
    archived,                                   // 是否已归档
    t,                                          // 可选，覆盖文案
  })
}`

const dataChain = `// 数据链（越往上越早）：
//   sessions.retain(id, { source })  物化 scope
//     → sessions.binding(id)         取绑定
//     → session.open()               幂等拉历史尾页
//     → uiConversation.binding(binding).target('chat')
//                                     拿 ChatSnapshot：order + nodes（keyed 流）
// 用完必须 view.dispose()，否则会话 scope 不回收。`

const doc: DocTopic = {
  title: { zh: 'session —— 会话预览', en: 'session — session preview' },
  exports: ['SessionViewModal', 'openSessionView'],
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
          zh: '数据全由调用方注入，组件不自己取。`archived` 从官方 `workspaces` 快照的 `archivedSessionIds` 读取并订阅刷新。归档会话走同一条链，同样可读。',
          en: 'All data is injected by the caller; the component fetches nothing. Read `archived` from `archivedSessionIds` on the official `workspaces` snapshot and keep it subscribed. Archived sessions travel the same chain and read fine.',
        },
        {
          zh: '快照只读，框内不能打字续聊。续聊 = `forkSession` 开分支 + `openHostSession` 跳官方会话区；暂存输入框的确定走 `onContinue`（fork + 发首轮 + 跳转）。',
          en: 'The snapshot is read-only, so you cannot type inside the dialog. Continuing means `forkSession` + `openHostSession`; the staging input’s confirm goes through `onContinue` (fork + first turn + navigate).',
        },
        {
          zh: '文件出口只有一个：工具卡路径、行内引用、交付卡都走 `onOpenFile`；不传则链接降级为纯文本。预览由调用方开在**页面右侧**（`openFilePreview` 的 dock），弹窗不需要任何遮罩参数。',
          en: 'There is exactly one file exit: tool-card paths, inline mentions and delivered cards all go through `onOpenFile`; without it links degrade to plain text. The caller opens the preview as a **page-level right column** (the `openFilePreview` dock) — the dialog takes no mask props.',
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
              desc: { zh: '会话自身快照（加载态 / 是否翻尽）', en: 'Snapshot of the session itself (loading state, paged-out)' },
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
            { name: 'archived', type: 'boolean', def: 'false', required: '否', desc: { zh: '已归档时标题旁显示归档徽标，且「继续对话」先弹 fork 确认框；未归档则直跳官方会话页', en: 'When true an archive badge appears beside the title and "Continue" asks to fork first; when false it jumps straight to the official session page' } },
            {
              name: 'forkSession',
              type: '(sessionId, atSeq?) => Promise<string>',
              def: '—',
              desc: { zh: '开分支并返回子会话 id；缺 openHostSession 则不渲染「继续对话」', en: 'Fork and resolve the child session id; without openHostSession "Continue" does not render' },
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
              type: '(path: string, sessionId: string) => void',
              def: '—',
              desc: { zh: '文件打开出口（工具卡 fileLink / 行内引用 / 交付卡共用）；第二参是文件所属会话 id，别拿别的会话去定位；缺省 = 链接纯文本', en: 'File-open exit shared by fileLinks, mentions and delivered cards; the second arg is the owning session id — locate the file there, not elsewhere; absent = plain text' },
            },
            {
              name: 'onOpenReview',
              type: '(locator: ChangedFileReviewLocator) => void',
              def: '—',
              desc: { zh: '变更文件的审阅出口（等价官方 openReview）；缺省 = 变更卡整张不可点', en: 'Review exit for changed files (equals official openReview); absent = the change card is not clickable' },
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
