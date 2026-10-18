# session —— 会话预览

依赖 `ui`。把「看一眼某个会话、看完即关」这件事封装起来：自动执行的任务想回看这次会话，
不想开新窗口（回来还得找）。

## 定位

**弹窗只是当前的呈现方式**，不是这个包的定义。将来也可能是侧边栏或整页 ⇒ 用 `variant` 切换。
「纯 Modal 控件」在 `ui` 里，这里装的是「会话预览」这个功能。

## 宿主契约：`SessionSource`

| 方法 | 签名 | 必填 |
|---|---|---|
| `listMessages` | `(sessionId, signal?) => Promise<SessionMessage[]>` | 是 |
| `download?` | `(sessionId, path, signal?) => Promise<Uint8Array>` | 否（宿主没这能力就不显示下载钮） |

数据形状：

```ts
interface SessionMessage {
  id: string
  role: 'user' | 'assistant' | 'tool' | 'system'
  text: string                 // 纯文本正文
  createdAt?: string
  attachments?: { name: string; path: string; bytes?: number }[]
}
```

**为什么注入能力而不是传静态数据**：会话预览内部有交互（附件下载 / 打开文件），
光有消息流不够用，它必须能回调宿主。

## `SessionPreview`

| 参数 | 类型 | 默认 | 说明 |
|---|---|---|---|
| `sessionId` | `string` | — | 必填 |
| `source` | `SessionSource` | — | 必填，注入的取数能力 |
| `variant` | `'modal' \| 'sidebar' \| 'page'` | `modal` | 承载方式 |
| `title` | `ReactNode` | `sessionId` | modal 形态的标题 |
| `onClose` | `() => void` | — | 关闭回调 |
| `renderMessage` | `(m: SessionMessage) => ReactNode` | 内置最简渲染 | ★ **定制扩展点**：富内容（工具卡 / 代码块 / 推理行）走这里 |
| `onOpenFile` | `(path: string) => void` | — | 点附件「打开」（通常交给 explorer） |
| `translate` | `Translate` | 内置 | — |

三态齐备：加载中 / 失败（带重试）/ 空。

```tsx
import { SessionPreview } from 'dsh-plugin-core/session'

h(SessionPreview, {
  sessionId,
  source,                    // 从 ctx 取出后注入
  variant: 'modal',
  onClose: () => setOpen(false),
  renderMessage: (m) => h(RichMessage, { message: m }),  // 可选
})
```

## 已知限制（重要）

- **默认渲染只有「角色 + 纯文本 + 附件」**——官方会话 UI 的完整镜像（工具卡 / 代码块 / 推理行等）
  **还没搬进本包**。要长得像官方会话，请用 `renderMessage` 自己渲染，或等后续版本。
- 无消息分页 / 增量加载，长会话一次全渲染。

## 定制边界

- `renderMessage` 就是为「特殊定制」留的口子：换渲染器不用 fork 面板。
- 换承载方式用 `variant`，不用改调用方结构。
- `SessionSource` 的方法签名若与宿主对不上，在插件侧做适配层——**不要改本包接口去贴某个宿主导出版本**。
