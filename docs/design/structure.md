# 结构规范

本文件回答两个问题：

1. **代码怎么分** —— 每个目录放什么、谁依赖谁。
2. **预览插件（packages/demo）左侧怎么分** —— 组件预览的分区，跟代码结构对齐。

> 本文是**目标态**（2026-10-19 用户拍板）。哪些已在、哪些暂缓，用状态标注区分；
> 现状与目标的差异见文末「未落地项」。
> 运行逻辑（样式注入机制、数据流、触发关系）的真源在 `docs/design/architecture.md`，本文不重复。

## 命名约定

- **`ui`** = 基础能力：纯零件 + 可复用的基础容器（`Modal`、侧边栏/拉栏、选工作区/选文件），不碰业务成品。
- **`adv.`** = advanced，高级空间：**成品**——拿 `ui` 的基础能力拼出来、与业务对象相关的共享件。
- 高级空间统一加 `adv.` 前缀：`adv.explorer`、`adv.session`。
- npm 子路径允许带点，引用写法就是 `dsh-plugin-core/adv.explorer`。

## 状态图例

| 标记 | 含义 |
|---|---|
| ✅ | 代码已在（质量待逐个重审） |
| 🟡 | 缺口 / 待迁：需要补或需要挪位置的 |
| ⚪ | 暂缓：先标着，不做 |

---

## 一、代码分层

```
dsh-plugin-core/
│
├── design/              ① 设计层 —— 只放「值」和「注入机制」，零 React
│   ├── tokens              ✅ 颜色 / 字号 / 间距 / 圆角 / 层级（别名官方 --dsw-alias-*）
│   └── style-kit           ✅ 运行时注入 <style>，createStyleKit({ id })
│
├── ui/                  ② 基础控件 —— 纯零件 + 可复用基础能力（依赖 design）
│   ├── official.ts         ✅ 全仓唯一 import 官方 primitives 的入口（L1）
│   ├── 表单                ✅ Input / NumberInput / PrefixedInput / Textarea /
│   │                          Checkbox / Segmented / Picker（下拉选择）/
│   │                          DateTimePicker（日期时间：单值 / 时间段 × 精度到秒）
│   ├── 动作                ✅ Button / IconButton
│   ├── 反馈                ✅ Modal / Toast / Loader 家族（2026-10-30）：
│   │   │                      Loader（ring / blocks × 五档尺寸）、LoaderBar（胶囊不定进度）；
│   │   │                      两者都只画图形，无背景无定位，背景与位置归调用方
│   │   └── Loading         ✅ 旧复合浮层（贴右下角的 pill + 两种加载卡），保留、已标 deprecated
│   ├── 展示                ✅ Card / StripCard / Chip / MarqueeText /
│   │                          SectionHead / FieldHint / LiveText / BackToTop /
│   │                          Table（第一档 Plain：外框 + 灰底表头 + 按列分隔线；
│   │                            表级 density / striped / borders，列级 divider / padding / headerTone，
│   │                            单元格可跨列跨行；TableGrid / TableZebra 预留同族独立组件）
│   ├── 选择                ✅ WorkspacePicker（选工作区，自取宿主快照）
│   │                          通用 Picker 是纯零件；领域选择器经 connectHost 自取数（2026-10-20）
│   ├── 组合                ✅ SplitGroup（两格焊成一体：只画外框 / 分隔 / 聚焦圈，不持状态）
│   └── 布局                ✅ PanelDock / createPanelDock（可停靠分栏：多面板 + 拖拽拉栏）
│                              组名 = 窗口一对一、同名覆盖、默认上限 3 超限拒绝；
│                              不做 tab 切换 / 自动淘汰 / 浮动层（用户 2026-10-20 定案）
│
├── utils/               ③ 纯方法 —— 零 React / 零 DOM（谁都能用，它不依赖谁）
│   ├── date                ✅ 日期 / 相对时间 / 时间区间
│   ├── i18n                ✅ 内置中英字典
│   ├── string              ⚪ 暂缓
│   ├── number              ⚪ 暂缓（注：formatBytes 已被 adv.session 附件卡使用，只「不对外承诺」，不删）
│   ├── http                ⚪ 暂缓
│   └── path                ✅ 纯路径方法（无 UI）：joinPath / parentOf / crumbsOf / extOf / mimeOf
│                              （已从 explorer/types.ts 迁入，2026-10-20）
│
├── adv.explorer/        ④ 高级空间①：文件浏览（依赖 ui + utils）
│   ├── FileBrowser        ✅ 面板本体：面包屑（▾ 选层）+ 内联展开树 + 预览（+ picker 形态）
│   ├── open               ✅ 两命令式能力：openFilePreview（侧边栏预览）/ pickWorkspaceFile（锚定弹窗选文件）
│   ├── types              ✅ 纯逻辑层（零 React / 零官方件）：预览分发 / 错误码 / 根反推 / 过滤
│   └── preview            ✅ 预览体家族：md / 代码 / HTML / PDF / Office / 图片
│
└── adv.session/         ⑤ 高级空间②：会话记录（依赖 ui + utils）
    └── SessionPreview      ✅ 成品：ui.Modal 承载会话消息（modal / sidebar / page）
```

### 组合关系（成品 = 基础能力 + 定制）

| 成品 | 用到的 `ui` 基础能力 | 定制了什么 |
|---|---|---|
| `adv.session` · `SessionPreview` | `Modal` | 把会话消息放进弹窗 |
| `adv.explorer` · `FileBrowser` | `Button`（面包屑 ghost / 行尾 outline）/ `IconButton` / `Segmented` / `MarqueeText` / `PanelDock`（浏览态外壳与拖宽）+ 官方件（`FileTypeIcon` / `MarkdownText` / `CodeBlock`，经 `ui/official`） | 面包屑 + 内联展开树 + 预览体家族 + 两命令式能力 |

`adv.*` 只做「拼装 + 业务定制」，不重新实现按钮 / 下拉 / 弹窗 / 侧栏。

### 依赖方向（单向，不许反向）

```
design ──▶ ui ──▶ adv.explorer / adv.session
utils（谁都不依赖，谁都可以用）
```

- `utils` 不得 import `ui` / `design` / React / DOM / 宿主 API —— 将来要能整体剥出去复用。
- `design` 不得依赖 `ui`（否则「只想要 token 的插件」被迫拖进 React）。
- `ui` 不得依赖 `adv.*`（反向依赖成环）。
- `adv.*` 只从 `ui` / `utils` 的公开导出消费，不直接 import 官方平台模块（要包先过 `ui/official.ts`）。

### 立包判据

**有实质内容、会持续长大的功能模块才独立成子包；只是一个控件就进 `ui`。**
统一到「控件」粒度，不提整个页面。

---

## 二、demo 展示分区（左侧导航）

```
组件预览
│
├─ ① 设计
│     色板 / 字号 / 间距 / 圆角 / 阴影 / 明暗
│     （只摆值，不点交互）
│
├─ ② 基础控件
│   ├─ 表单    Input / NumberInput / PrefixedInput / Textarea / Checkbox / Segmented / Picker / DateTimePicker
│   ├─ 动作    Button / IconButton
│   ├─ 反馈    Modal / Toast
│   ├─ 展示    Card / StripCard / Chip / Table / MarqueeText / SectionHead / FieldHint / LiveText / BackToTop
│   ├─ 组合    SplitGroup（展示在选择器页）
│   └─ 布局    PanelDock / 拉栏
│
├─ ③ 高级空间
│   ├─ 文件浏览   FileBrowser + openFilePreview / pickWorkspaceFile（点文件夹、点文件看预览）
│   └─ 会话预览   SessionPreview（弹窗里放会话记录）
│
└─ ④ 工具方法
      日期格式化 / 相对时间（拿真实值演示，不是控件）
```

### 现有分区 → 新分组映射（全部是重排，不用新写内容）

| 现有 `demo/sections/` | 归到 |
|---|---|
| `design.tsx` | ① 设计 |
| `buttons.tsx` | ② 基础控件 · 动作 |
| `pickers.tsx` | ② 基础控件 · 表单 |
| `display.tsx` | ② 基础控件 · 展示 |
| `feedback.tsx` | ② 基础控件 · 反馈 |
| `explorer.tsx` | ③ 高级空间 · 文件浏览 |
| `session.tsx` | ③ 高级空间 · 会话预览 |
| `utils.tsx` | ④ 工具方法 |

---

## 三、未落地项（等调整）

- **目录改名**：`src/explorer` → `src/adv.explorer`、`src/session` → `src/adv.session`；同步改
  `package.json` 的 `exports`、各 `index.ts`、`packages/demo` 的 import、`docs/design/architecture.md` 的树。
  代码现在仍是旧名。
- ~~**收窄导出**：`adv.explorer` 只暴露 `ExplorerPanel`~~ → 已定（2026-10-20）：暴露 `FileBrowser` 面板 +
  `openFilePreview` / `pickWorkspaceFile` 两命令式能力 + 纯逻辑层；`WorkspacePicker` 留在 `ui`。
- ~~**路径方法归基础**~~ → **已落地**（2026-10-20）：`joinPath` / `parentOf` / `crumbsOf` / `extOf` / `mimeOf`
  在 `utils/path`；`previewInfoOf` 等业务判断留 `explorer/types.ts`（纯逻辑层，node 单测直接引）。
- ~~**补基础组件**：`ui` 需补 `SidebarLayout` / `SplitPane`~~ → **已落地为 `PanelDock`**（2026-10-20），
  `resizer` 保留为它的底层函数。
- **暂缓项**：`utils/string`、`utils/number`、`utils/http`、`ui/feedback/Loading` —— 只标注，未删代码。
- **库里没有的**：
  - Switch 开关 —— 官方 primitives 有，归「包官方」批次；
  - Select 下拉 —— 用 `Picker` 代替（`SelectField` 曾因依赖官方 Menu 被删，属待反转的旧决策）。
