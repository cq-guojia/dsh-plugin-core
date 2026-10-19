# 运行逻辑

系统级分层、边界、触发关系与不变量。不写接口细节（那些在 `docs/design/features/`）。

## 一句话

一个 npm 包、五个子路径导出；插件按需引，tree-shaking 掉没用到的部分。

```
dsh-plugin-core/
├── design/         token + createStyleKit 注入器工厂 + 主题判据    （零 React）
├── ui/             基础控件（Button / Input / Picker / Modal / toast …） （依赖 design）
├── utils/          纯方法：日期 / 字符串 / 字节 / 时间区间 / HTTP / 路径    （零 React / DOM）
├── adv.explorer/   文件浏览成品（目录树 + 面包屑 + 预览）           （依赖 ui + utils）
└── adv.session/    会话记录预览成品                                 （依赖 ui + utils）
```

> 目录名目标态（`adv.` 前缀）。选工作区/选文件在 `ui`，路径方法归 `utils`——结构细节见
> `docs/design/structure.md`。

## 依赖方向（单向，不许反向）

```
design ──▶ ui ──▶ adv.explorer / adv.session
utils（谁都不依赖，谁都可以用）
```

不变量：

- `utils` 不得 import `ui` / `design` / React / DOM / 任何宿主 API —— 它将来要能被整体剥出去复用。
- `design` 不得依赖 `ui`（否则「只想用 token 的插件」被迫拖进 React）。
- `ui` 不得依赖 `adv.*`（反向依赖会造成环）。

## 立包判据

**有实质内容、会持续长大的功能模块才配独立成子包；只是一个控件就进 `ui`。**

统一到「控件」粒度就够了，不要提整个页面。已按此判据砍掉的：`host`（取消）、
`llm` 独立包（ModelPicker 进 ui）、设置页骨架（不抽，等第二个消费者）。

## 样式注入（本包最特殊的机制）

```
插件启动 ──▶ setStyleKit(createStyleKit({ id, prefix }))
                    │
                    ▼
              ensureControls() ──▶ 往 <head> 插一个 <style id="{id}">
                                    内容 = tokens 域 + 各控件域拼成的 CSS 文本
```

为什么必须运行时注入：DSH 客户端产物是 `window.__ModuleLoader__.load({ id, factory })` 的
CJS 闭包，`import './x.css'` 只会产出独立 css 资源、**内核不加载它** ⇒ CSS 只能以字符串在运行时注入。

为什么是工厂而不是模块级单例：单例只有一个固定 style id 与固定变量前缀，多个插件同处一页时会抢同一个
`<style>` 标签、变量互相覆盖。每个插件领一套自己的（`id` + `prefix`）。

为什么 core 可以用模块级变量存「当前 kit」：core 会被**内联进每个插件各自的 bundle**（不是共享运行时），
模块级变量天然按插件隔离，不像共享模块那样会互相踩。

## 数据从哪来（组件不自己取数）

工作区列表、模型列表、会话消息都要跨 host↔client 边界，而那条通道是**插件私有**的 ⇒ 组件取不到。
所以统一约定：**数据由调用方经 props 给，宿主能力经接口注入**。

| 组件 | 要调用方给什么 |
|---|---|
| `Picker` / `ModelPicker` / `WorkspacePicker` / `FilePicker` | 选项数据（props） |
| `ExplorerPanel` | `WorkspaceFilesFace`（从 ctx 取出后注入） |
| `SessionPreview` | `SessionSource`（同上） |

不传整个 `ctx`：ctx 是宿主给的整个大对象，传进来就把本包和宿主版本焊死；只传需要的那一小块，
宿主 breaking 时改的是插件「取出」的一行。

## 触发关系

- `setStyleKit()` / `ensureControls()`：插件启动时调一次（幂等）。
- 控件渲染时内部会再调 `ensureControls()`，漏了初始化也不会白屏，只是样式可能晚一帧。
- `ensureControls()` 无 `document` 时静默跳过（SSR / 单测不炸）。
- `showToast()` 无 `document` 时静默跳过。
