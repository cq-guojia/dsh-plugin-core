# 样例：从零接入一个插件

一个插件从装包到用上各子包的完整路径。复制粘贴级别的最小可用示例。

## 0. 装包

```bash
pnpm add dsh-plugin-core
```

（npm 也能用；推荐 pnpm。）
`react` 是 optional peer——只用 `utils` / `design` 的插件不必装。
包里带预编译 `dist`（宿主以 git/npm 装插件**不跑构建脚本**，产物必须随包发布）。

## 1. 初始化样式（一次）

```ts
// 插件 client 入口
import { createStyleKit } from 'dsh-plugin-core/design'
import { ensureControls, setStyleKit } from 'dsh-plugin-core/ui'

const kit = createStyleKit({ id: 'dsh-task-reminder-ui', prefix: 'reminder' })
setStyleKit(kit)
ensureControls()
```

`id` 必须插件内唯一；`prefix` 是变量前缀（`reminder` ⇒ `--reminder-fg`）。
两者取值按**项目规范**定（多插件同页必须互不冲突）——示例里的 `dsh-task-reminder` / `reminder`
只是演示命名规律（前缀取插件名缩写），不是可用值的枚举。

## 2. 用一个控件

```tsx
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

## 3. 用通用方法

```ts
import { formatDateTime, relativeFuture, formatBytes } from 'dsh-plugin-core/utils'

formatDateTime(task.runAt, { seconds: true })   // 2026-10-18 09:30:05
relativeFuture(task.runAt, Date.now())          // 3 分钟后（未来时间用这个）
formatBytes(file.size)                          // 12 KB
```

## 4. 接工作区浏览（要宿主能力）

```tsx
import { ExplorerPanel } from 'dsh-plugin-core/explorer'

// 从 ctx 取出这一小块（不要传整个 ctx）
const workspaceFiles = ctx.remote.workspaceFiles

h(ExplorerPanel, { workspaceFiles, sessionId, path: '', onSelect: (p) => setFile(p) })
```

选工作区的下拉（数据由你给——它要经插件私有通道送到 client）：

```tsx
import { WorkspacePicker } from 'dsh-plugin-core/ui'

h(WorkspacePicker, { workspaces: wsList, value: cur, onChange: setCur })
```

## 5. 接会话预览

```tsx
import { SessionPreview } from 'dsh-plugin-core/session'

const source = {
  listMessages: async (id) => (await api.get(`/sessions/${id}/messages`)).data,
  download: async (id, path) => api.getBytes(`/sessions/${id}/file?path=${path}`),
}

h(SessionPreview, { sessionId, source, variant: 'modal', onClose: close })
```

## 6. 卸载清理（可选）

```ts
kit.dispose()   // 撤掉 <style> 标签并清空登记域（插件卸载 / HMR）
```

## 接入坑（按踩频排序）

| 坑 | 现象 | 解法 |
|---|---|---|
| 忘了 `setStyleKit` 就渲染控件 | 样式晚一帧或串到默认前缀 | 入口处先调，再渲染 |
| 直接 `import` 官方 `@deepseek-ai/*` 并指望本包帮你引 | Node 下 `ERR_MODULE_NOT_FOUND` | 本包 `ui` 已零官方依赖；你要用官方件就在插件侧自己处理平台模块 |
| 给 `read` 少传第三参 `range` | 远端拒：`expected 3 business argument(s) … got 2` | 一律显式传 `{}` |
| 用 `relativePast` 显示未来时间 | 「3 分钟后」显示成「刚刚」 | 用 `relativeFuture` |
| 想让组件自己取工作区 / 模型列表 | 取不到（通道是插件私有的） | 数据经 props 给，宿主能力经接口注入 |
| 暗色不跟随宿主 | 插件固守一种明暗 | 判据是 `body[data-ds-dark-theme]`，别用 `prefers-color-scheme` |
