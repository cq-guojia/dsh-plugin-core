# dsh-plugin-core 需求文档

> 定稿：2026-10-18（需求澄清任务 `20261018-0110`）
> 状态：**已定稿，进入实施**。范围变更请回 worklog 开新任务，不要直接改本文而不留痕。

## 0. 一句话

把 DSH（DeepSeek Harness）插件反复要写的东西收敛成一个 npm 包，以后写新插件按文档 `npm i` 引用，
不再一个个仓库抄样式、抄文件浏览、抄日期格式化。

## 1. 服务对象（最重要的一条）

**这个包服务的是「以后要写的每一个 DSH 插件」，不是现有这三个。**

现有三个插件（`dsh-task-dispatch-table` / `dsh-session-title-pattern` / `dsh-task-ledger`）的定位是：

- （a）需求会反复出现的**证据**
- （b）第一批消费者

⇒ **判据不是「三家都抄了什么」，而是「任何一个 DSH 插件大概率都要用到什么」。**
三家没有、但未来插件一定会用到的，照样进；三家都有、但属于业务的，照样不进。

## 2. 子包划分

安装 = 整包；使用 = 按子路径 import（tree-shaking 掉没引入的部分）。

```
dsh-plugin-core/
├── design/    token（含深色段）+ 样式注入器工厂 + 主题判据
├── ui/        控件（零件 + 选择器 + 反馈件）
├── utils/     纯方法（日期 / 字符串 / 字节 / 时间区间 / HTTP 骨架）
├── explorer/  工作区浏览 + 预览 + 选工作区 + 选文件
└── session/   会话预览
```

依赖方向**单向**：`design` ← `ui` ← `explorer` / `session`；
`utils` 与 `design` **互不依赖**；`ui` 不反向依赖任何人。

### 2.1 design

- token 变量表，**前缀参数化**（`--tdt-` / `--dtl-` / `--stp-` → 由调用方给的 prefix 决定）
- 样式注入器工厂 `createStyleKit({ id, prefix })`
- 主题判据
- **零 React、没有组件**

### 2.2 ui

- 零件：Button / Input 家族 / Textarea / Checkbox / Segmented / 下拉框 / 搜索框 / 滑轨 /
  MarqueeText / LiveText / Field（含错误提示）/ resizer / DateTime / TimeRange
- 选择器：`Picker`（通用：单选/多选/上限/搜索/分组/空态/降级）、`ModelPicker`
- 「统一某类元素」的控件：`SectionHead` 等
- 反馈件：`Modal` / `Loading` / `toast` / 空态 / 错误边界
- **纯零件，不自己取数** —— 数据由调用方传入

### 2.3 utils

- 日期 / 字符串 / 字节体积 / 时间区间 / HTTP 骨架 + 数据获取
- **硬约束**：不得 import `utils` 以外的任何子包，不得依赖 React / DOM / 宿主 API，
  只能用标准库 + 注入的参数（为的是将来能整体剥出去复用）

### 2.4 explorer

- `ExplorerPanel`：工作区浏览（目录树 + 面包屑）+ 文件预览
- `WorkspacePicker`：选工作区
- `FilePicker`：选文件

### 2.5 session

- 会话预览：整体封装（连会话渲染一起），调用方注入取数能力
- `variant` 决定承载方式：弹窗 / 侧栏 / 整页（**承载可换**是硬要求）
- 必须预留定制扩展点

## 3. 不进（业务，各插件自己写）

- 设置页骨架（**候补**：等出现第二个愿意用它的消费者再抽；`stp` 目前走官方 `SettingsForm`）
- `host` 子包（**已取消**）
- `llm/` 独立子包（**已取消**，ModelPicker 进 ui）
- 业务件：`TaskPicker` / 日历 / `CodeViewer` 审美 / 业务 token（`--tdt-cal-*` / chip-bg /
  filechip / PROCESS_FILES_CSS）/ 页面几何 / 插件私有路由 / DB 表 / `mirror/` 之外的业务 UI

## 4. 立包判据（防止子包无限膨胀）

> **独立成包 = 它是一块有实质内容、会持续长大的「功能模块」；只是一个控件 ⇒ 进 `ui`。**

- 按**功能模块**分，不按**控件类型**分（弹窗 / toast / Loading / 下拉都是呈现形式，不是立包理由）
- 按**功能模块**分，不按**业务领域名词**分（不能因为叫「模型」就建包）
- 硬指标：这块有没有超过一个控件的工作量？会不会自己长出第二个 API？
- **统一到「控件」粒度就够了，不要提整个页面**（想统一所有标题 ⇒ 做一个 `SectionHead` 进 ui，
  而不是把设置页整个搬进来）

## 5. 硬约束（写代码时必须遵守，不遵守会崩或脏）

### 5.1 打包与产物

- 宿主以 git/npm 装插件**不跑构建脚本** ⇒ 包必须发**预编译 dist**
- client 产物是 `window.__ModuleLoader__.load({ id, factory })` 的 CJS 闭包，
  `import './x.css'` 只会产出独立 css 资源、**内核不加载** ⇒ **样式只能以 TS 字符串 + 运行时注入分发**
- `react` / `react-dom` / `@deepseek-ai/*` primitives 一律 **external + optional peer**；
  打进包里会产生第二份 React 实例（hooks 直接崩）

### 5.2 样式注入必须工厂化

现 `dsh-task-dispatch-table/src/client/ui/style.ts:25` 是模块级单例 + 固定 style id
`dsh-task-dispatch-table-ui`，多插件同页必然互相覆盖。

⇒ 必须是 `createStyleKit({ id, prefix })`：每个插件调一次领一套自己的
（自己的 `<style>` 标签 id + 自己的变量前缀），互不干扰。

### 5.3 明暗色判据（别跟错）

- 判据 = **`body[data-ds-dark-theme]`**（宿主启动脚本 `toggleAttribute` 写入，
  是**用户在 DeepSeek 客户端里的选择**）
- **禁止 `prefers-color-scheme`** —— 它跟的是系统，不是用户在宿主里的选择。
  两者会分叉：系统亮色 + 用户在 DSH 选暗色时，跟 `prefers-color-scheme` 会显示成亮色，与宿主不一致

### 5.4 多语言

> **核心提供什么，核心就负责它的多语言。**

- 包内控件自带的**固定提示语**（校验错误 / 加载中 / 空态 / 确认取消）⇒ 包内置字典
  （至少中英）+ 一个语言设置入口（`setLocale`，或探测宿主语言）
- **插件自己界面的文案由插件自己管**，包不提供插件级 i18n 框架
- 分界线：控件显示**调用方传入的业务数据**（任务名 / 文件名）⇒ 不翻译；
  控件**自带的固定提示语** ⇒ 包翻译

### 5.5 依赖注入，不抓宿主全局

- 不传整个 `ctx`（传了就把包和宿主版本焊死），只传**需要的那一小块能力**
  （`WorkspaceFilesFace` / `source` 这类最小接口）
- 好处：宿主 breaking 时改的是插件「取出那一小块」的一行，包不用动；包也能用假实现做单测

## 6. 关键接口约定

| 位置 | 约定 |
|---|---|
| design | `createStyleKit({ id, prefix })` → `{ registerStyle, ensureStyles, applyStyle }` |
| ui / ModelPicker | `variant: 'cascade' \| 'flat'`（级联：先厂商后模型 / 平铺：一个下拉列全部）；
数据统一为 `groups: [{ value, label, options }]`，一份数据两种渲染。**禁止用数字或无意义名** |
| ui / Picker | `mode: 'single' \| 'multiple'`、`max`、分组、搜索、空态、降级 |
| explorer | `WorkspaceFilesFace` 由插件注入（`list` / `stat` / `read` 最小面），组件不抓宿主全局 |
| explorer / WorkspacePicker | `WorkspacePicker({ workspaces, mode, max, onChange })` —— 数据调用方给
（工作区列表是 host 侧 `ctx.workspaceRegistry.list()` 取的，要经插件私有通道送到 client，**组件自己取不到**） |
| session | `SessionPreview({ sessionId, source, variant })` —— `source` = 取数能力接口
（会话预览内部有交互：传输文件等，光有静态消息流不够） |

## 7. 分期与任务切分

**一个子包一个任务**，不再出现「一个任务做完 v1.0」。

| 期 | 内容 | 状态 |
|---|---|---|
| 骨架 | package.json exports / tsconfig / 构建出 dist | ✅ 已完成（`tsc` 出 ESM + d.ts，不走 tsdown） |
| v1 | `design` + `utils` + `ui` | ✅ 已完成（零件 + Picker / ModelPicker + Modal / toast / 空态 / 错误边界） |
| v2 | `explorer`（用户拍板要抽） | ✅ 已完成（浏览面板 + 预览 + WorkspacePicker / FilePicker） |
| v3 | `session` | ⚠️ **半完成**：契约与三种承载已好，**官方会话 UI 镜像未搬**（只做最简渲染） |
| 文档 | README 接入指南 | ✅ 已完成 |

**未做**（按重要性）：真实插件接入验证 / 会话 UI 镜像 / 代码高亮与 PDF 预览 / 类名隔离 /
设置页骨架（等第二个消费者）/ npm 发布流程。详见 README「还没做的事」。

## 8. 验收口径

- 每个子包：构建通过 + 类型检查通过 + 一个 smoke 自检（新逻辑必留）
- 包发 dist，**消费者不跑构建**（复现硬约束）
- 发布前 `npm view dsh-plugin-core` 复核包名
- 消费者接入（先 `dsh-task-dispatch-table`，删自有副本）⇒ 另开任务，不在本轮改兄弟仓
- 接入后控件视觉与接入前**逐一截图对比**，差异要么被接受要么回滚

## 9. 发布

- npm **公开包**（私有包会让最终用户装插件时配 token；公开 ≠ 开源，源码仓可私有）
- OIDC 发布，复刻现有三个仓的 workflow
- 包名 `dsh-plugin-core`（2026-10-18 探为空闲，发布前复核）；备选 `dsh-plugin-koc-core`
