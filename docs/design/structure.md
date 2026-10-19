# 结构规范

本文件回答两个问题：

1. **代码怎么分** —— 每个目录放什么、谁依赖谁。
2. **demo 左侧怎么分** —— 组件预览站的分区，跟代码结构对齐。

> 本文是**目标态**（2026-10-19 用户拍板）。哪些已在、哪些暂缓，用状态标注区分；
> 现状与目标的差异见文末「未落地项」。
> 运行逻辑（样式注入机制、数据流、触发关系）的真源在 `docs/design/architecture.md`，本文不重复。

## 命名约定

- **`ui`** = 基础控件：纯零件、纯样式、不碰业务数据。
- **`adv.`** = advanced，高级空间：**高度整合、与业务对象相关**的共享件，一眼和 `ui` 区分开。
- 高级空间统一加 `adv.` 前缀：`adv.explorer`、`adv.session`。
- npm 子路径允许带点，引用写法就是 `dsh-plugin-core/adv.explorer`。

## 状态图例

| 标记 | 含义 |
|---|---|
| ✅ | 代码已在（质量待逐个重审） |
| ⚪ | 暂缓：先标着，不做 |

---

## 一、代码分层

```
dsh-plugin-core/
│
├── design/              ① 设计层 —— 只放「值」和「注入机制」，零 React
│   ├── tokens              ✅ 颜色 / 字号 / 间距 / 圆角 / 层级（别名官方 --dsw-alias-*）
│   └── style-kit           ✅ 运行时注入 <style>，createStyleKit({ id, prefix })
│
├── ui/                  ② 基础控件 —— 纯样式 + 无业务逻辑（依赖 design）
│   ├── official.ts         ✅ 全仓唯一 import 官方 primitives 的入口（L1）
│   ├── 表单                ✅ Input / NumberInput / PrefixedInput / Textarea /
│   │                          Checkbox / Segmented / Picker（下拉选择）
│   ├── 动作                ✅ Button / IconButton
│   ├── 反馈                ✅ Modal / Toast / EmptyState / ErrorBoundary
│   │   └── Loading         ⚪ 暂缓
│   ├── 展示                ✅ Card / StripCard / Chip / MarqueeText /
│   │                          SectionHead / FieldHint / LiveText / BackToTop
│   └── 基础能力            ✅ resizer（侧边栏拖拽改宽）
│
├── utils/               ③ 纯方法 —— 零 React / 零 DOM（谁都能用，它不依赖谁）
│   ├── date                ✅ 日期 / 相对时间 / 时间区间
│   ├── i18n                ✅ 内置中英字典
│   ├── string              ⚪ 暂缓
│   ├── number              ⚪ 暂缓（注：formatBytes 已被 adv.session 附件卡使用，只「不对外承诺」，不删）
│   └── http                ⚪ 暂缓
│
├── adv.explorer/        ④ 高级空间①：文件浏览（依赖 ui + utils）
│   ├── ExplorerPanel       ✅ 目录树 + 面包屑 + 文件预览
│   ├── WorkspacePicker     ✅ 选工作区（现暂放 ui，待迁入）
│   ├── FilePicker          ✅ 选文件（同上）
│   └── 路径工具            ✅ crumbsOf / joinPath / mimeOf / previewKindOf
│
└── adv.session/         ⑤ 高级空间②：会话记录（依赖 ui + utils）
    └── SessionPreview      ✅ modal / sidebar / page 三种承载
```

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
│   ├─ 表单    Input / NumberInput / PrefixedInput / Textarea / Checkbox / Segmented / Picker
│   ├─ 动作    Button / IconButton
│   ├─ 反馈    Modal / Toast / EmptyState / ErrorBoundary
│   └─ 展示    Card / StripCard / Chip / MarqueeText / SectionHead / FieldHint / LiveText / BackToTop
│
├─ ③ 高级空间
│   ├─ 文件浏览   ExplorerPanel（点文件夹、点文件看预览）
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
- **迁移**：`WorkspacePicker` / `FilePicker` 从 `ui` 迁到 `adv.explorer`。
- **暂缓项**：`utils/string`、`utils/number`、`utils/http`、`ui/feedback/Loading` —— 只标注，未删代码。
- **库里没有的**：
  - 表格 Table —— 待真实需求再定，不预造；
  - Switch 开关 —— 官方 primitives 有，归「包官方」批次；
  - Select 下拉 —— 用 `Picker` 代替（`SelectField` 曾因依赖官方 Menu 被删，属待反转的旧决策）。
