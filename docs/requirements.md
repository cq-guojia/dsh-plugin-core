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
├── design/         token（含深色段）+ 样式注入器工厂 + 主题判据
├── ui/             基础控件（零件 + 选择器 + 反馈件 + 侧栏/拉栏 + 选工作区/选文件）
├── utils/          纯方法（日期 / 字符串 / 字节 / 时间区间 / HTTP 骨架 / 路径）
├── adv.explorer/   文件浏览成品（目录树 + 面包屑 + 预览）
└── adv.session/    会话记录预览成品
```

依赖方向**单向**：`design` ← `ui` ← `adv.explorer` / `adv.session`；
`utils` 与 `design` **互不依赖**；`ui` 不反向依赖任何人。

### 2.1 design

- token 变量表，**变量前缀全生态统一为 `dshpc`**
- 样式注入器工厂 `createStyleKit({ id })`
- 主题判据
- **零 React、没有组件**

### 2.2 ui

- 零件：Button / Input 家族 / Textarea / Checkbox / Segmented / 下拉框 / 搜索框 / 滑轨 /
  MarqueeText / LiveText / Field（含错误提示）/ resizer / DateTime / TimeRange
- 选择器：`Picker`（通用：单选/多选/上限/搜索/分组/空态/降级）、`ModelPicker`、
  `WorkspacePicker`（选工作区）；`FilePicker` 已删（2026-10-20 用户：文件选择框没有用）
- 日期时间：`DateTimePicker`（2026-10-24 新增：单值 / 时间段 × 精度 day/hour/minute/second；
  数据恒完整本地 ISO 到毫秒、**显示只到精度**；起始端 floor、结束端 ceil）
- 「统一某类元素」的控件：`SectionHead` 等
- 反馈件：`Modal` / `Loading` / `toast` / 空态
- 布局基础：`PanelDock` / `DockPanel` / `createPanelDock`（**可停靠分栏容器**：多面板并存、按组名寻址、拖拽拉栏、宽度记忆；2026-10-20 拍板用此名，替代早先的 `SidebarLayout` / `SplitPane`）。只做右侧；组名与窗口一对一；默认上限 3，超限拒绝新开；不做 tab 切换 / 自动淘汰 / 浮动层 / 多份同名。**结构照成熟库口径写 children，`open/close` 只传 id，不把页面树塞进调用参数**
- **通用控件是纯零件，数据由调用方传入**；**领域选择器例外**（2026-10-20 用户拍板反转）：
  `ModelPicker` / `WorkspacePicker` 是「现成的包」，接线后**自己取数自己显示**，消费方不再拿数组传 props。
  接线两处、共用同一 path 常量：宿主 `serveModelCatalog(ctx,{path})`（`llm.listModels` 挂只读路由，
  client 侧 remote 拿不到模型列表）+ client `connectHost(ctx,{modelsPath})`（工作区走官方 `workspaces` 快照）

### 2.3 utils

- 日期 / 字符串 / 字节体积 / 时间区间 / HTTP 骨架 + 数据获取
- **硬约束**：不得 import `utils` 以外的任何子包，不得依赖 React / DOM / 宿主 API，
  只能用标准库 + 注入的参数（为的是将来能整体剥出去复用）

### 2.4 adv.explorer

- `FileBrowser` 面板 + 两命令式能力：`openFilePreview`（侧边栏预览，外壳 = 核心 `PanelDock`，2026-10-21 拍板不许自绘外壳 / 拖拽条）/ `pickWorkspaceFile`（锚定弹窗选文件，Promise 返回工作区相对路径），2026-10-20 移植自重做
- 控件纪律（2026-10-21）：核心有的控件一律核心（`Button` ghost 面包屑 / `IconButton` / `Segmented` / `MarqueeText` / `PanelDock`）；核心没有的那一项（▾ 选层浮层）严格按兄弟项目度量照抄
- 选工作区（`WorkspacePicker`）在 `ui`，不在这里；`FilePicker` 已删（2026-10-20）

### 2.5 adv.session

- 会话预览：整体封装（连会话渲染一起），调用方注入取数能力
- `variant` 决定承载方式：弹窗 / 侧栏 / 整页（**承载可换**是硬要求）
- 必须预留定制扩展点

## 3. 不进（业务，各插件自己写）

- 设置页骨架（**候补**：等出现第二个愿意用它的消费者再抽；`stp` 目前走官方 `SettingsForm`）
- `host` 子包（**已取消**）
- `llm/` 独立子包（**已取消**，ModelPicker 进 ui）
- 业务件：`TaskPicker` / 日历 / `CodeViewer` 审美 / 业务 token（`--dshpc-cal-*` / chip-bg /
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

⇒ 必须是 `createStyleKit({ id })`：每个插件调一次领一套自己的（`<style>` 标签 id 按插件唯一）。

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

### 5.6 第三方依赖（**非**绝对禁止）

> **不是「绝对不允许引第三方包」。默认优先用官方件（`@deepseek-ai/dsh-client-ui-primitives`）；当某个外部包明显比我们自己手搓的实现更好（更成熟 / 更稳 / 更省事 / 观感更好）时，可以引入——但必须先向用户提建议并说明理由，用户明确拍板后才可引入。**

- **引入前提**：该能力确实值得（如 toast 这类成熟库、文件预览要的解释器），自研没有性价比。
- **引入方式**：作为 core 的**内部依赖封装**，对外只暴露 core 自己的 API（如 `showToast`），**不 re-export 第三方包**，使消费者无法直接引用第三方、保持单点管控。
- **引入后必须真机验证**：在真实 DSH profile 加载，确认渲染 / 暗色跟随 `body[data-ds-dark-theme]` / 回调 / 与宿主层级无冲突。
- **仍硬禁止**（与「能否引第三方」是两条独立规则，本条不动）：把 `react` / `react-dom` / 官方 `@deepseek-ai/*` 打进包（见 §5.1，会产生第二份 React 实例、Node 下 import 崩）。这条 `external + optional peer` 是宿主运行时决定的。

## 6. 关键接口约定

| 位置 | 约定 |
|---|---|
| design | `createStyleKit({ id })` → `{ registerStyle, ensureStyles, applyStyle }` |
| ui / ModelPicker | `variant: 'grouped' \| 'cascade'`（分组：一个下拉、完全独立 / 联动：供应商与模型两个下拉联动；2026-10-20 用户拍板两形态都要）；**两种形态 onChange 都发最终模型 value**；「默认模型」选项默认提供（`allowDefault:false` 关），选中发 `''`。默认读 connectHost 喂入的真实目录，`groups` 仅作覆盖。**禁止用数字或无意义名** |
| ui / Picker | `mode: 'single' \| 'multiple'`、`max`（到上限已选项仍可反选）、`searchable`（搜索框开关）、`icon`（触发器前置 icon）、选项级 `icon`、`hint`（问号提示内置）、分组、空态、降级 |
| ui / DateTimePicker | `mode: 'single' \| 'range'`、`precision: 'day' \| 'hour' \| 'minute' \| 'second'`（同时管弹层步进、显示截断与默认宽度）；single 传 `string \| null`、range 传 `[start, end] \| null`（本地 ISO 到毫秒）；草稿态「确定」才 onChange，没选日期不传数据；起端补零 / 止端补满（day ⇒ 止 `23:59:59.999`） |
| explorer | `WorkspaceFilesFace` 由插件注入（`list` / `stat` / `read` 最小面），组件不抓宿主全局；对外 = 两命令式能力 `openFilePreview`（侧边栏预览）+ `pickWorkspaceFile`（Promise 选文件，回传工作区相对路径），共用同一 `FileBrowser` 面板（2026-10-20 拍板） |
| explorer / WorkspacePicker | `WorkspacePicker({ mode, max, onChange, allowDefault, defaultLabel, … })` —— **无数据参数**：connectHost 接线后自动订官方 `workspaces` 服务快照，选中值为 `workspaceId`；「所有工作区」默认项默认提供、选中发 `''`（2026-10-20） |
| session | `SessionPreview({ sessionId, source, variant })` —— `source` = 取数能力接口（会话预览内部有交互：传输文件等，光有静态消息流不够） |

## 7. 分期与任务切分

**一个子包一个任务**，不再出现「一个任务做完 v1.0」。

| 期 | 内容 | 状态 |
|---|---|---|
| 骨架 | package.json exports / tsconfig / 构建出 dist | ✅ 已完成（`tsc` 出 ESM + d.ts，不走 tsdown） |
| v1 | `design` + `utils` + `ui` | ✅ 已完成（零件 + Picker / ModelPicker + Modal / toast / 空态） |
| v2 | `explorer`（用户拍板要抽） | ✅ 已完成（浏览面板 + 预览；**选择器后移至 ui**，见 §2.4） |
| v2+ | `explorer` 重做（2026-10-20） | ✅ 已完成（FileBrowser 面板 + `openFilePreview` / `pickWorkspaceFile` 两能力 + 全量预览：md / 代码高亮 / HTML / PDF / Office；官方件经 `./ui/official` 子路径） |
| v3 | `session` | ⚠️ **半完成**：契约与三种承载已好，**官方会话 UI 镜像未搬**（只做最简渲染） |
| 文档 | README 接入指南 | ✅ 已完成 |

**未做**（按重要性）：真实插件接入验证 / 会话 UI 镜像 / 类名隔离 /
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
