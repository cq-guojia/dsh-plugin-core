# session —— 会话预览

依赖 `ui`。把「看一眼某个会话、看完即关」这件事封装起来：自动执行的任务想回看这次会话，
不想开新窗口（回来还得找）。

## 定位

**弹窗只是当前的呈现方式**，不是这个包的定义。将来也可能是侧边栏或整页。
「纯 Modal 控件」在 `ui` 里，这里装的是「会话预览」这个功能。

2026-10-22 重建：替换此前的占位骨架（`SessionPreview` + `SessionSource` 扁平契约），
改为**镜像官方会话 UI 的完整业务模块**（移植自兄弟项目 dsh-task-dispatch-table 的
session-view + mirror/ 15 组件，任务定制已剥离）。

## 宿主契约：数据链

不传静态数据，注入**宿主服务消费面**（`sessions` / `uiConversation`，本地结构化声明见 `faces.ts`）：

```
openSessionView(sessions, uiConversation, id, retainSource?)
  → sessions.retain(id, { source })     物化 scope（归档 / 久未打开的会话也能读）
  → sessions.binding(id)                取绑定（只查已物化 scope，从不创建）
  → session.open()                      幂等拉历史尾页
  → uiConversation.binding(b).target('chat')   ChatSnapshot：order + nodes（keyed 流）
```

用完必须 `view.dispose()` 释放 retain 引用（否则会话 scope 永不回收）。

**归档会话**：`archiveSession` 只把会话藏出显示面、不动存储 ⇒ 预览归档会话走同一条链，无额外开发。

**已证伪、勿再尝试**（兄弟项目真机实测）：弹窗内挂官方 ChatView（`renderSlot` 只认 `key='root'`）；
自己 `retain('mainView')` 切官方视图（锁死宿主会话导航，出过事故）；冷读 RPC `session/follow`（无活动通道）。

## `SessionViewModal`

| 参数 | 类型 | 默认 | 说明 |
|---|---|---|---|
| `sessionId` | `string` | — | 必填 |
| `view` | `SessionViewTarget` | — | 必填，`openSessionView` 的产物 |
| `heading` | `string` | — | 可选标题 |
| `onClose` | `() => void` | — | 必填；调用方负责 `view.dispose()` |
| `forkSession` | `(id, atSeq?) => Promise<string>` | — | 官方 `ISessions.fork`；与 `openHostSession` 缺一即不渲染「继续对话」 |
| `openHostSession` | `(id) => void` | — | 官方 `uiWorkspace.openSession` 导航 |
| `onContinue` | `(message) => Promise<void>` | — | 暂存输入框「确定」：调用方 fork + host 侧 `agent.send` 起轮次 + 跳转；缺省 = 不渲染输入框 |
| `onOpenFile` | `(path) => void` | — | 文件打开出口；缺省 = 链接降级纯文本 |
| `t` | `Translate` | 内置 | 核心字典自带全部会话文案（中英） |

```tsx
import { openSessionView, SessionViewModal } from 'dsh-plugin-core/session'

const view = openSessionView(sessions, uiConversation, sessionId, 'my-plugin')
if (view !== null) {
  h(SessionViewModal, {
    sessionId, view, heading: '镜像升级日报',
    onClose: () => { view.dispose(); setOpen(false) },
    forkSession: (id, atSeq) => sessions.fork({ sessionId: id, increaseTitle: true, atSeq }),
    openHostSession: (id) => uiWorkspace.openSession(id),
    onOpenFile: (path) => openFilePreview(path),
  })
}
```

## 渲染与文件显示

「官方零件 + 自绘容器」：`mirror/` 15 个组件按官方文件名一一对应，逐值镜像官方 UI；
官方 CSS module 类名运行时发现（`official-classes.ts`），未命中回退自绘样式（`session.css`）。

文件显示逻辑（统一出口 `onOpenFile`）：

- 用户消息官方 `file` 块 → 附件卡（引用无路径 ⇒ 只读展示，不伪造打开行为）；
- 工具卡 read/write/edit 摘要路径 = 可点 `fileLink`；
- tool-fs `meta.diffs` 路径进 markdown 行内文件词表；
- `fileMentions`：行内 code 解析为真实文件 → 下划线链接（resolve 不出保持惰性 code，永不猜）；
- 交付文件（`present` 工具 / turn 级 `deliverables.presented` 同源）→ 整卡可点预览。

## 续聊（正道）

底层 keyed 数组（`order` + `nodes`）是**只读快照**，官方没有「往预览 binding 发消息」的写面
⇒ 框内不可打字续聊。「继续对话」按钮**按归档状态分化**（`archived` prop 注入）：

- **已归档**：开分支图标 + 确认框 → `sessions.fork` → 关弹窗释放 → `uiWorkspace.openSession`
  跳官方会话区（官方策略：归档会话不进主视图）。
- **未归档**：会话图标，点击**直跳**官方会话页（`uiWorkspace.openSession`，无确认）。

底部暂存输入框：打字 → 确定 → `onContinue(message)`，由调用方完成 fork +
host 半侧 `agents.create + agent.send(msg, 'next-turn', true)` 起轮次 + 跳转。
（client→host remote 通道为新增能力，实现期第一验证项。）

**标题与归档标识**：弹窗标题 = 会话自己的标题（`heading`，宿主 `sessions.list` 的
`displayTitle`），不再带固定前缀；已归档时标题旁显示官方归档图标 + 「已归档」。
归档状态 client 读不到（官方 UiWorkspace 公开面无此读口）⇒ 与本包 `./host` 模型目录同模式：
宿主 `serveArchivedSessions` 读 `workspaceRegistry.archivedSessionIds` 挂只读路由，
client fetch 后传入 `archived`。

## 定制边界

- 不做的（任务语义，留给我们之外的上层插件）：顶部「接收/随附」输入区、任务 DB 回执产出、
  过程文件桶、标题任务名入口、桌面可用性（`/api/present.host`）。
- `retainSource` 参数化：写进宿主 `retainedBy` 的键，默认 `'dsh-plugin-core'`。
- 官方类名 / 词典逐字镜像；宿主升级后按兄弟项目 ui-map §〇 流程 diff 复核。

## 配套：官方会话列表（冷安全）

宿主 client 服务 `sessions`（`@deepseek-ai/dsh-api-session-controller` client 半侧，0.2.0-rc.2
解包核实）暴露 `list` 快照存储：`{ ids, byId, phase }`，每行带 `displayTitle`
（durable title → 项目 basename → session id 三级回落）/ `updatedAt` / `running` / `blank`。
数据来自宿主 `session/list` RPC（「Read every visible attached and persisted Session
**without activating an Agent**」，按活动序）⇒ **列会话 ≠ 打开会话，冷安全，归档会话也在列**。

demo 预览站「真实会话列表」即此实现：按 `updatedAt` 降序取前 20 条，点行 →
`openSessionView` 真预览；fork 与跳转都是官方口子。服务缺席（根预览站）时如实说
「未就位」并回退离线假数据演示，不造假数据。

## 已知限制

- 官方样式未注入时回退自绘观感（功能不受影响，控制台 + 面板内可见探针提示）。
- 长会话一次全渲染；翻页靠「加载更早记录」（官方 `loadOlder`）。
- 系统提示 / 上下文注入行按决策 28 过滤；👍👎 官方走 slots，弹窗无该插槽。
- Node 单测只覆盖纯函数与数据链（组件静态 import 官方平台模块，观感验证走 demo 预览站）。
