<!-- 本文件由 scripts/gen-docs.mjs 自动生成，请勿手改；改对应的 .doc.ts 后重跑 node scripts/gen-docs.mjs -->

# session —— 会话预览

> EN: session — session preview

导出：SessionViewModal、openSessionView

## 会话预览

> EN: Session preview

把一次会话渲染成**只读弹窗**，观感与官方会话页一致。先用 `openSessionView` 建数据链得到 `view`（不可解析返回 `null`），再交给 `SessionViewModal`；**关闭时必须 `view.dispose()`**。

> EN: Renders one session as a **read-only dialog** that looks like the official session page. First `openSessionView` builds the chain and returns a `view` (`null` when unresolvable), then hand it to `SessionViewModal`; **call `view.dispose()` on close**.

数据全由调用方注入，组件不自己取。`archived` 从官方 `workspaces` 快照的 `archivedSessionIds` 读取并订阅刷新。归档会话走同一条链，同样可读。

> EN: All data is injected by the caller; the component fetches nothing. Read `archived` from `archivedSessionIds` on the official `workspaces` snapshot and keep it subscribed. Archived sessions travel the same chain and read fine.

快照只读，框内不能打字续聊。续聊 = `forkSession` 开分支 + `openHostSession` 跳官方会话区；暂存输入框的确定走 `onContinue`（fork + 发首轮 + 跳转）。

> EN: The snapshot is read-only, so you cannot type inside the dialog. Continuing means `forkSession` + `openHostSession`; the staging input’s confirm goes through `onContinue` (fork + first turn + navigate).

文件出口只有一个：工具卡路径、行内引用、交付卡都走 `onOpenFile`；不传则链接降级为纯文本。预览由调用方开在**页面右侧**（`openFilePreview` 的 dock），弹窗不需要任何遮罩参数。

> EN: There is exactly one file exit: tool-card paths, inline mentions and delivered cards all go through `onOpenFile`; without it links degrade to plain text. The caller opens the preview as a **page-level right column** (the `openFilePreview` dock) — the dialog takes no mask props.

限制：官方样式未注入时回退自绘观感（功能不受影响）；长会话一次全渲染，用「加载更早记录」向前翻页；👍👎 反馈走官方 slots，弹窗没有该插槽。

> EN: Limits: without official styles injected, the self-drawn look applies (functionality unaffected); long sessions render whole, paged backward via "load earlier"; 👍👎 feedback goes through official slots, which this dialog lacks.

| 参数 | 类型 | 必填 | 默认 | 说明(zh) | 说明(en) |
|---|---|---|---|---|---|
| `openSessionView` | `(sessions, uiConversation, id, retainSource?) => SessionViewTarget \| null` | 是 | — | 建数据链：retain → binding → open → target(chat)；不可解析返回 null | Builds the chain retain → binding → open → target(chat); null when unresolvable |
| `target` | `SnapshotFace<ChatViewFace \| undefined>` | — | — | chat 快照订阅面（供 useSyncExternalStore） | Chat snapshot surface (for useSyncExternalStore) |
| `session` | `SnapshotFace<SessionSnapshotFace>` | — | — | 会话自身快照（加载态 / 是否翻尽） | Snapshot of the session itself (loading state, paged-out) |
| `loadOlder` | `() => void` | — | — | 向前翻一页更早的历史 | Page backward through older history |
| `dispose` | `() => void` | — | — | 释放 retain 引用；弹窗关闭必调 | Release the retain reference; call on close |

| 参数 | 类型 | 必填 | 默认 | 说明(zh) | 说明(en) |
|---|---|---|---|---|---|
| `sessionId` | `string` | 是 | — | 要预览的会话 | The session to preview |
| `view` | `SessionViewTarget` | 是 | — | openSessionView 的返回值 | What openSessionView returned |
| `onClose` | `() => void` | 是 | — | 关闭回调；由调用方在里面调 view.dispose() | Close callback; the caller calls view.dispose() inside it |
| `heading` | `string` | 否 | 「会话预览」 | 弹窗标题，通常传宿主 sessions.list 的 displayTitle；会话 id 显示在标题下方副标题行（等宽小字） | Dialog title, usually the displayTitle from the host sessions.list; the session id sits on the monospace subtitle line below it |
| `archived` | `boolean` | 否 | false | 已归档时标题旁显示归档徽标，且「继续对话」先弹 fork 确认框；未归档则直跳官方会话页 | When true an archive badge appears beside the title and "Continue" asks to fork first; when false it jumps straight to the official session page |
| `forkSession` | `(sessionId, atSeq?) => Promise<string>` | — | — | 开分支并返回子会话 id；缺 openHostSession 则不渲染「继续对话」 | Fork and resolve the child session id; without openHostSession "Continue" does not render |
| `openHostSession` | `(sessionId: string) => void` | — | — | 跳官方会话区（uiWorkspace.openSession） | Jump into the official session area (uiWorkspace.openSession) |
| `onContinue` | `(message: string) => Promise<void>` | — | — | 暂存输入框的确定：调用方完成 fork + 发首轮 + 跳转；缺省 = 不渲染输入框 | Staging input confirm: caller forks, sends the first turn, navigates; absent = no input rendered |
| `onOpenFile` | `(path: string, sessionId: string) => void` | — | — | 文件打开出口（工具卡 fileLink / 行内引用 / 交付卡共用）；第二参是文件所属会话 id，别拿别的会话去定位；缺省 = 链接纯文本 | File-open exit shared by fileLinks, mentions and delivered cards; the second arg is the owning session id — locate the file there, not elsewhere; absent = plain text |
| `onOpenReview` | `(locator: ChangedFileReviewLocator) => void` | — | — | 变更文件的审阅出口（等价官方 openReview）；缺省 = 变更卡整张不可点 | Review exit for changed files (equals official openReview); absent = the change card is not clickable |
| `t` | `Translate` | — | 内置 | 覆盖文案（内置字典已含全部会话文案，中英） | Override copy (the built-in dictionary has all session copy, zh+en) |

```tsx id="session-usage"
import { openSessionView, SessionViewModal } from 'dsh-plugin-core/session'

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
}
```

```ts id="session-data-chain"
// 数据链（越往上越早）：
//   sessions.retain(id, { source })  物化 scope
//     → sessions.binding(id)         取绑定
//     → session.open()               幂等拉历史尾页
//     → uiConversation.binding(binding).target('chat')
//                                     拿 ChatSnapshot：order + nodes（keyed 流）
// 用完必须 view.dispose()，否则会话 scope 不回收。
```
