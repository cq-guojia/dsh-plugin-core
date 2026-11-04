<!-- 本文件由 scripts/gen-docs.mjs 自动生成，请勿手改；改对应的 .doc.ts 后重跑 node scripts/gen-docs.mjs -->

# 样例：从零接入一个插件

> EN: Example: integrate a plugin from scratch

## 从零接入

> EN: Integrate from scratch

从装包到用上各子包的完整路径，示例都是可直接粘贴的最小可用版。

> EN: The full path from install to every subpackage, with copy-paste-ready minimal examples.

§0 装包：`react` 是 optional peer，只用 `utils` / `design` 的插件不必装。

> EN: §0 Install: `react` is an optional peer — plugins using only `utils`/`design` need not install it.

§1 初始化样式（入口一次）：`id` 必须插件内唯一，多插件同页靠它互不覆盖；变量与类名固定 `dshpc` 前缀，不需传参。

> EN: §1 Initialize styles (once at entry): `id` must be unique within the plugin so co-mounted plugins don’t clobber; vars and classes use the fixed `dshpc` prefix, no parameter.

§2 用一个控件

> EN: §2 Use a control

§3 用通用方法

> EN: §3 Use helpers

§4 接文件浏览：`mount` 必填（预览面板是布局成员，占宽挤窄主区），传页面那层 flex 行——元素或选择器都行，解析不到就放弃、不回落 body；数据面要在宿主 `serveFsRoute` + client `connectFs` 用同一个 path 常量接上，浏览本身不需要会话。

> EN: §4 Wire file browsing: `mount` is required (the preview panel is a layout member that takes width); pass the page’s flex row — an element or a selector, and an unresolvable selector abandons the open instead of falling back to `body`. Wire the data face with the same path constant on both sides (`serveFsRoute` / `connectFs`) — browsing itself needs no session.

§5 接会话预览：`openSessionView` 返回 `null` 表示该会话不可解析；拿到 view 后交给 `SessionViewModal`，关闭时记得 `dispose()`。

> EN: §5 Wire session preview: `openSessionView` returns `null` when the session cannot be resolved; hand the view to `SessionViewModal` and remember `dispose()` on close.

§6 卸载清理（可选）

> EN: §6 Teardown (optional)

```bash id="integration-install"
pnpm add dsh-plugin-core
```

```ts id="integration-init-style"
// 插件 client 入口
import { createStyleKit } from 'dsh-plugin-core/design'
import { setStyleKit } from 'dsh-plugin-core/ui'

const kit = createStyleKit({ id: 'dsh-task-reminder-ui' })
setStyleKit(kit)
// 只需这一行：控件首次渲染时自注入自己那份 CSS，token 也一并登记。
```

```tsx id="integration-use-control"
import { Button, Input, Picker, showToast } from 'dsh-plugin-core/ui'

h(Input, { value: name, onChange: setName, placeholder: '任务名', error: nameError })
h(Button, { variant: 'primary', onClick: save }, '保存')
h(Picker, {
  options: models,                 // [{ value, label }]
  value: current,
  onChange: (v) => setCurrent(v as string),
  searchable: true,
  clearable: true,
})
showToast('已保存', { variant: 'success' })
```

```ts id="integration-use-utils"
import { formatDateTime, relativeFuture, formatBytes } from 'dsh-plugin-core/utils'

formatDateTime(task.runAt, { seconds: true })   // 2026-10-18 09:30:05
relativeFuture(task.runAt, Date.now())          // 3 分钟后（未来时间用这个）
formatBytes(file.size)                          // 12 KB
```

```tsx id="integration-use-explorer"
import { connectFs, openFilePreview, pickWorkspaceFile } from 'dsh-plugin-core/explorer'
import { serveFsRoute } from 'dsh-plugin-core/host'
import { FS_PATH } from './paths'   // 自己的常量，宿主与 client 共用

// 宿主 apply：挂只读文件路由（列目录 / 读文件都在它上面，不限工作区）
serveFsRoute(ctx, { path: FS_PATH })
// client apply：接同一个常量（connectHost(ctx) 照旧负责工作区快照）
connectFs({ path: FS_PATH })

// 预览某文件：右侧分栏（挤窄 row 左边的主区，不是浮在上面）；绝对 / 相对都收
// 落点给元素或选择器都行（openFilePreview({ mount: '#page-row' })），不必存 ref
openFilePreview({ mount: pageRowEl, path: '/abs/ws/docs/requirements.md' })

// 让用户选：锚定按钮旁弹模态，Promise 返回 { path: 绝对路径, isDir, workspaceRel?, workspace? }
const picked = await pickWorkspaceFile({ anchor: btn, filter: { exts: ['ts'] } })
const folder = await pickWorkspaceFile({ anchor: btn, filter: { dirs: true } })   // 只选文件夹
```

```tsx id="integration-use-session"
import { openSessionView, SessionViewModal } from 'dsh-plugin-core/session'

// sessions / uiConversation 同样从 ctx 取出（懒得取就用官方 client 服务）
const view = openSessionView(sessions, uiConversation, sessionId, 'dsh-task-reminder')
if (view !== null) {
  h(SessionViewModal, {
    sessionId, view,
    // 关闭必须释放 retain 引用
    onClose: () => { view.dispose(); setOpen(false) },
    // 文件出口：已经点开的那条会话 id 会作为第二参传进来（相对路径 / Office 都按它定位）
    onOpenFile: (path, sid, opts) => openFilePreview({ mount: pageRowEl, path, sessionId: sid, line: opts?.line }),
  })
}
```

```ts id="integration-cleanup"
kit.dispose()   // 撤掉 <style> 标签并清空登记域（插件卸载 / HMR）
```

## 接入坑

> EN: Pitfalls

按踩频排序的常犯错误：

> EN: Common mistakes, ranked by frequency:

| 参数 | 类型 | 默认 | 说明(zh) | 说明(en) |
|---|---|---|---|---|
| `忘了 setStyleKit 就渲染控件` | `现象：样式晚一帧或落到默认 style id` | — | 入口处先调，再渲染 | Call it at entry, then render |
| `指望本包帮你引官方 @deepseek-ai/*` | `现象：Node 下 ERR_MODULE_NOT_FOUND` | — | 本包 ui 零官方依赖；要用官方件请自行处理平台模块 | Our ui has zero official deps; handle platform modules yourself |
| `给 read 少传第三参 range` | `现象：远端拒：expected 3 business argument(s) … got 2` | — | 一律显式传 {} | Always pass {} explicitly |
| `用 relativePast 显示未来时间` | `现象：「3 分钟后」显示成「刚刚」` | — | 用 relativeFuture | Use relativeFuture |
| `想让组件自己取工作区 / 模型列表` | `现象：取不到（通道是插件私有的）` | — | 数据经 props 给，宿主能力经接口注入 | Data via props, host capability via injected interface |
| `暗色不跟随宿主` | `现象：插件固守一种明暗` | — | 判据是 body[data-ds-dark-theme]，别用 prefers-color-scheme | Predicate is body[data-ds-dark-theme], not prefers-color-scheme |
