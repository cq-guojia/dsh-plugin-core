# dsh-plugin-core

[English](https://github.com/cq-guojia/dsh-plugin-core/blob/main/README.md) · **简体中文**

**DSH（DeepSeek Harness）** 插件的共享 UI 底座：设计 token、一整套 React 控件、纯方法、工作区文件浏览、只读会话预览——一个包，按子路径引入。

它存在的意义是：写下一个插件时，不必再把按钮、日期选择器、toast、文件预览、会话回放各抄一遍。这里的东西全部长在宿主自己的 token 与明暗开关上，拼出来的插件天然是宿主的样子，不需要每个插件各调一遍皮肤。

- **跟宿主走，不跟系统走**：明暗判据是宿主写在 body 上的 `body[data-ds-dark-theme]`，12 个强调色也是宿主那套。
- **组件不取数**：选项、当前值、工作区、会话，一律由调用方经 props 或一次性注入的接口给进来，组件绝不自己伸手去要。
- **在哪儿都能 import**：`design`、`ui`、`utils` 三个入口零 `@deepseek-ai/*` 依赖，Node 与单测环境里直接 import 不会炸，不是只能在宿主里活。

## 截图

以下都是在 DSH 宿主里暗色主题下的真实渲染：

设计基础——token 色板、明暗判据、样式注入机制：

![设计基础](https://cdn.jsdelivr.net/gh/cq-guojia/dsh-plugin-core@main/assets/readme/01-tokens.png)

按钮——18 档外观、三档高度、图标、自动 loading：

![按钮](https://cdn.jsdelivr.net/gh/cq-guojia/dsh-plugin-core@main/assets/readme/02-buttons.png)

录入——问号提示、Switch、Checkbox、分段选择器：

![录入](https://cdn.jsdelivr.net/gh/cq-guojia/dsh-plugin-core@main/assets/readme/03-inputs.png)

工作区浏览——右侧停靠的文件浏览与预览，且不限工作区：

![工作区浏览](https://cdn.jsdelivr.net/gh/cq-guojia/dsh-plugin-core@main/assets/readme/04-explorer.png)

会话预览——与官方会话页同构的只读弹窗：

![会话预览](https://cdn.jsdelivr.net/gh/cq-guojia/dsh-plugin-core@main/assets/readme/05-session.png)

五张截图都来自 [`dsh-plugin-core-demo`](#装上就能看预览插件)，也就是同仓库发布的预览插件。

## 安装

```bash
pnpm add dsh-plugin-core
# 或者
npm install dsh-plugin-core
```

发布包里带编译好的 `dist/` 与类型声明——宿主安装插件时不跑构建脚本。`react` / `react-dom`（`>= 18`）是**可选 peer**：只用 `design` 或 `utils` 的插件不必装。

## 快速开始

```tsx
// 插件 client 入口
import { createStyleKit } from 'dsh-plugin-core/design'
import { Button, Input, setStyleKit, showToast } from 'dsh-plugin-core/ui'

const kit = createStyleKit({ id: 'dsh-task-reminder-ui' }) // 1. 一个插件一套
setStyleKit(kit)

export function TaskEditor(props: { name: string; setName: (v: string) => void }) {
  return (
    <div>
      <Input value={props.name} onChange={props.setName} placeholder="任务名" hint="会显示在任务列表里" />
      <Button variant="primary" onClick={async () => { await save(); showToast('已保存', { variant: 'success' }) }}>
        保存
      </Button>
    </div>
  )
}
```

第一天就该知道的三件事：

1. **`setStyleKit` 只调一次。** 样式只能以字符串在运行时注入 `<style>`——插件 client 产物是 CJS 闭包，内核不加载 `.css` 资源。`id` 必须插件内唯一：多个插件同页时，靠它让自己的 `<style>` 不被别人覆盖。
2. **具名引入。** 每个控件在首次渲染时才登记自己那份 CSS（幂等），用不到的控件其 CSS 不进你的包。这条收益只在具名引入时成立（`import { Button } from 'dsh-plugin-core/ui'`）；写成 `import * as core` 或 CJS `require`，打包器无法摇树，收益静默归零。
3. **弹窗是 Promise 形态。** `await confirmModal({...})` 拿 `true` / `false`，`alertModal({...})` 关闭即 resolve。没有回调式写法。

## 包里有什么

| 引入路径 | 给你什么 | 需要 React |
|---|---|---|
| `dsh-plugin-core/design` | token 变量（明 + 暗）、`createStyleKit` 注入器工厂、明暗判据 | 否 |
| `dsh-plugin-core/ui` | 全套控件：动作、录入、展示、反馈、布局、导航 | 是 |
| `dsh-plugin-core/ui/official` | 官方 primitives 的直接再导出（少数确实要用官方原件的场景） | 是 |
| `dsh-plugin-core/ui/code-viewer` | 代码查看器（行级高亮，文件预览源码态用的也是它） | 是 |
| `dsh-plugin-core/ui/host` | 宿主自带 toast 的桥接 | 是 |
| `dsh-plugin-core/utils` | 纯方法：日期、字符串、字节、HTTP，外加内置中英字典 | 否 |
| `dsh-plugin-core/explorer` | 文件浏览、文件选择、右侧停靠的文件预览 | 是 |
| `dsh-plugin-core/explorer/preview` | 预览体：图片、PDF、Markdown、HTML、Office、文本 / 代码 | 是 |
| `dsh-plugin-core/session` | 只读会话预览弹窗 + 变更文件 diff | 是 |
| `dsh-plugin-core/host` | 宿主侧路由：只读 FS 路由、模型目录 | 否 |

依赖方向单向：`design` ← `ui` ← `explorer` / `session`，`utils` 谁也不依赖。

## 功能说明

### design——token 与样式注入

零 React、没有组件，装的是「值 + 把值弄上页面的机制」。

- 一张明暗双份的 token 表：表面（`--dshpc-surface-1/2/sunken`）、文字（`--dshpc-fg`、`--dshpc-fg-3`、`--dshpc-fg-4`）、边框，以及十二个强调色：`business`、`success`、`warning`、`danger`、`purple`、`pink`、`cyan`、`teal`、`orange`、`indigo`、`rose`、`slate`。
- `createStyleKit({ id })` 返回一套工具：`cssVar(name)`、`registerStyle(domain, css)`、`applyStyle(domain, css)`、`ensureStyles()`——一个插件一个 `<style>` 标签，按 id 隔离。
- `DARK_THEME_SELECTOR` 常量为 `body[data-ds-dark-theme]`，自己的 CSS 不必再猜系统主题。
- 变量与类名前缀全生态固定为 `--dshpc-*` / `dshpc-*`，不存在按插件改名；不同 core 版本的插件靠 style 标签 id 隔离，不靠前缀。

只想统一配色与尺寸、但组件自己写：只引这一个子路径就够。

### ui——控件

全部由 token 搭出来，数据走 props，配色跟随宿主主题。props 就是定制面——组合 props，不要 fork 源码。每个参数的完整说明见[控件参考](https://github.com/cq-guojia/dsh-plugin-core/blob/main/docs/help/ui.md)。

**动作**

- `Button`——18 档外观（实心 / 线框 / 无底：`primary`、`secondary`、`danger`、`success`、`warning`、`info`、`outline`、`danger-outline`、`ghost`、`link`，加扩展八色），三档高度（24 / 28 / 32），前置与后置图标，固定 / 最小 / 最大宽度（超长跑马灯），自动 loading：`onClick` 返回 Promise 就转圈、禁用、settle 后自恢复，reject 同样恢复。
- `IconButton`——纯图标版本，无障碍名强制给。
- `Segmented`——单选 / 多选、可选 1px 外框、段内图标 / 计数 / 角标、`tone` 换选中片配色。

**录入**

- `Input`、`PrefixedInput`、`NumberInput`、`Textarea`——共用一套字段尺寸（`fieldMetricsOf`），错误态、左侧图标槽、搜索清空键，问号提示直接走宿主 tooltip。
- `Checkbox`；开关语义用官方 `Switch`。
- `Picker`——单选 / 多选、搜索、分组、选择上限、可清空、空态；键盘可全操作（Esc / ↑↓ / Enter）。底层逻辑（`toGroups`、`filterGroups`、`toggleValue`）单独导出。
- `WorkspacePicker` / `ModelPicker`——自带数据的领域选择器：插件 `apply` 里调一次 `connectHost(ctx)` 即订阅宿主快照，没接线就是空态，不编造。
- `DateTimePicker`——一个控件覆盖「一个时刻」与「时间段」，精度 `day` / `hour` / `minute` / `second`，左右两块独立月历，键盘可用，起始端归零、结束端拉满。
- `InputGroup`——带附着动作的输入框。

**展示**

- `Surface`——纯框容器，tone / 边框 / 内距 / 圆角四轴。
- `Card` / `StripCard`——带强调色的卡片。
- `Chip`、`SectionHead`、`MarqueeText`、`FlipText`、`LiveText`。
- `Table`——多行分组表头、通栏分组（一张表装多个板块）、跨行跨列、行选中、密度 / 斑马纹 / 边框开关、列级对齐与表头语义色、内置空态、加载态与加载更多、可选内置分页。数据驱动：不排序、不取数、不虚拟滚动。
- `FieldHint`——独立的问号提示，浮层用的是宿主官方 tooltip。

**反馈**

- `Modal`、`SideSheet`——定尺寸弹窗与侧边抽屉，都支持 `busy` 锁。
- `AlertModal`、`ConfirmModal`、`alertModal()`、`confirmModal()`——Promise 形态的确认 / 提示。
- `showToast`、`notify`——Sonner 底座的 toast，全屏单例、多插件共用。
- `Loader`、`LoaderBar`、`Loading`、`LoadingBlock`、`LoadingToast`、`RunningBlocks`、`showLoading`——转圈图标、不定进度条、全局单槽加载卡。

**布局与导航**

- `PanelDock` / `DockPanel` / `createPanelDock`——右侧停靠分栏的通用壳：是布局成员而不是浮层，占宽挤窄主区；支持多栏、拖宽、宽度记忆、收起成右侧耳朵。
- `QuickToolbar`——随滚动出现的工具栏，带回到顶部与可见性规则。
- `SplitGroup`、`startResizeLayoutWidth`、`Pagination`。

### utils——纯方法

零 React、零 DOM、零 `design` 依赖。

- **日期时间**：`formatDateTime`、`formatYmd`、`formatClock`、`formatDurationHms`、`formatRange`、`sameCalendarDay`、`relativePast`、`relativeFuture`、`overlaps`、`pad2`。一律本机时区；解析失败按兜底返回、不抛错，也不编造时间。`relativePast` 与 `relativeFuture` 是对偶的——未来时间必须用后者，否则「3 分钟后」会显示成「刚刚」。
- **字符串 / 字节 / 路径**：`baseNameOf`、`safeTrim`、`truncateBytes`（按 UTF-8 字节截断，不切半个字）、`formatBytes`、`formatCount`、`joinPath`、`parentOf`、`extOf`、`mimeOf`、`crumbsOf`。
- **HTTP**：`request`、`requestJson`、`HttpError`——一个 options 对象，失败有结构。
- **多语言**：`setLocale('zh' | 'en')`、`getLocale()`、`t()`——管的是库自带的固定文案（占位符、空态、加载文案）。插件自己界面的文案仍归插件自己。

### explorer——工作区文件浏览

- `openFilePreview({ mount, path })`——在主区旁边打开右侧停靠的文件面板。`mount` 是包住主区的那个 flex 行（元素或选择器都行），面板作为布局成员占宽，关闭时还原。
- `pickWorkspaceFile({ anchor, filter })`——Promise 形态的文件选择器，resolve `{ path, isDir }` 或 `null`。
- `FileBrowser`——单独使用浏览面板本体。
- `FilePreview`——按扩展名分派到图片、PDF、Markdown（渲染 / 源码）、HTML（渲染 / 源码）、Office（走宿主转换能力，缺了就如实显示「不可用」）、文本（代码高亮、可定位到行）。
- 浏览**不限工作区**：一棵树里既有工作区节点也有真实根（POSIX 是 `/`，Windows 是盘符）。接线两行——宿主侧 `serveFsRoute({ path })`，client 侧用同一个路径常量 `connectFs({ path })`。浏览本身不需要会话。

### session——只读会话预览

- `openSessionView(sessions, uiConversation, sessionId, mountId)` 建数据链拿到 `view`（不可解析返回 `null`），交给 `SessionViewModal`，关闭时记得 `view.dispose()`。
- 渲染与官方会话页同构：用户 / 助手轮次、工具卡、思考块、变更文件、权限卡。
- 归档态实时跟随、不用调用方传：核心订阅官方工作区快照，弹窗开着期间归档徽标与「继续对话」会跟着变；归档会话同样可读。
- 「继续对话」始终保留：未归档直跳官方会话区，已归档先开分支并弹确认框（可以取消）。
- `openSessionReview({ mount, locator })` 打开变更文件的 diff；文件出口只有一个 `onOpenFile`，工具卡路径、行内引用、交付卡都走它。

## 适配范围

| 维度 | 要求 |
|---|---|
| 宿主 | DSH web client。插件 client 产物是 `window.__ModuleLoader__.load({ id, factory })` 的 CJS 闭包，所以样式只能运行时注入。 |
| Node.js | `>= 22.5`（只影响构建与安装阶段）。 |
| React / React DOM | `>= 18`，可选 peer。只有 `design` 与 `utils` 可以完全不用 React。 |
| 主题 | 跟随宿主 `body[data-ds-dark-theme]`，绝不使用 `prefers-color-scheme`。宿主没给 token 时回落到内置值。 |
| 命名 | 变量 `--dshpc-*`、类名 `dshpc-*`，全生态固定；不碰宿主的 `--dsw-*` / `--dsh-*`。 |
| 官方 primitives | 只从 `dsh-plugin-core/ui/official` 走，且只在宿主内可解析。主入口零 `@deepseek-ai/*`，因此在 Node / 单测里 import `ui` 不会失败。 |
| 打包 | ESM、`sideEffects: false`、控件各带自己的 CSS 域——具名引入可让用不到的控件连同其 CSS 都不进包。 |
| 数据 | 组件从不取数。工作区、模型、文件、会话由调用方给，或来自一次性注入的接口。 |

这是一个**库，不是插件**：没有 `main`、没有 `dsh` 字段。想看它跑起来，装下面的预览插件。

## 装上就能看：预览插件

`dsh-plugin-core-demo`（蓝鲸组件库）是同仓库发布的、可安装的 DSH 插件。它用宿主真实数据把每个控件、每个组合模块跑一遍——走的是你的插件将来会走的同一条代码路径，不是静态画廊。

用 DSH 命令装进宿主：

```bash
dsh plugin --profile web add dsh-plugin-core-demo
```

或用 npm 装这个包本身：

```bash
npm install dsh-plugin-core-demo
```

装好后在 DSH 里打开本插件：插件详情页有「组件预览」入口，点开即整页预览；侧栏入口的位置（第一级 / 收入「更多」/ 关闭）在插件设置里选。

覆盖内容：设计基础（token、明暗判据、注入机制）、动作、录入、展示、反馈、布局与滚动、导航、工作区浏览、会话预览、工具方法的输入输出实测，以及内置中英双语文案。

它的 `dist/` 随仓库入库，并把 core 的构建产物打进自己 bundle，所以预览的永远是当前这份代码——不需要先把 core 发到 npm。

## 文档

| 我想… | 看哪 |
|---|---|
| 把包接进插件 | [接入指引](https://github.com/cq-guojia/dsh-plugin-core/blob/main/docs/help/integration.md) |
| 查控件与全部 props | [控件参考](https://github.com/cq-guojia/dsh-plugin-core/blob/main/docs/help/ui.md) |
| 建 style kit、覆盖 token、多插件隔离 | [design](https://github.com/cq-guojia/dsh-plugin-core/blob/main/docs/help/design.md) |
| 用 token、配色或定制皮肤 | [样式说明](https://github.com/cq-guojia/dsh-plugin-core/blob/main/docs/help/style.md) |
| 处理日期、字符串、字节、HTTP | [utils](https://github.com/cq-guojia/dsh-plugin-core/blob/main/docs/help/utils.md)，以及[方法统一口径](https://github.com/cq-guojia/dsh-plugin-core/blob/main/docs/help/methods.md) |
| 加工作区文件浏览与预览 | [explorer](https://github.com/cq-guojia/dsh-plugin-core/blob/main/docs/help/explorer.md) |
| 把会话渲染成只读预览 | [session](https://github.com/cq-guojia/dsh-plugin-core/blob/main/docs/help/session.md) |
| 理解整体架构 | [架构](https://github.com/cq-guojia/dsh-plugin-core/blob/main/docs/design/architecture.md) |
| 查某个决定为什么这么定 | [需求与决策](https://github.com/cq-guojia/dsh-plugin-core/blob/main/docs/requirements.md) |

帮助文档为中英双语（正文中文，每节附英文摘要）。

## 发布

核心与预览插件共用同一个版本号，一个 tag 同时发布两个包：

```bash
# 1. 根 package.json 与 packages/demo/package.json 的 version 改成同一个号
# 2. 构建、提交（dist/ 必须入库）、推送
pnpm run build && pnpm run build:demo
git add -A && git commit -m "发布 X.Y.Z" && git push
# 3. 打 tag 触发 GitHub Actions 自动发 npm
git tag vX.Y.Z && git push origin vX.Y.Z
```

`tag vX.Y.Z` 必须等于两个 `version` 字段；没有 `demo-v*` 这种独立 tag。

## 许可证

MIT
