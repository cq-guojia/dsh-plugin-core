# 20261019-1132-控件层重构-改继承官方-primitives-l0-l4-分层-逐控件包裹-eb12: 控件层重构：改继承官方 primitives（L0-L4 分层 + 逐控件包裹）

- **Tags**: 建设, 重构, 控件, 官方原语, 分层
- **Status**: done · 2026-10-19 12:50:21 · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6
- **Created**: 2026-10-19 11:32:47 · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6
- **Sealed**: 2026-10-19 12:50:21 · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6

<!-- Header lines are maintained by the script, fixed order: Tags → Status → Created → Sealed.
     The `- **Tags**: …` line is inserted at the top by new --tags; omitted when there are no tags
     (category goes to the ledger and history only, never into this document).
     The `- **Sealed**: …` line is appended on close. -->

## Background

用户 2026-10-19 凌晨把 demo 插件装进真实宿主后反馈："界面上来了但还是不对"——自绘控件和真宿主长得不一样。定位结论（对照兄弟项目 `dsh-task-dispatch-table`）：

- 兄弟项目是**混合分工**：能官方的一律 `import { Button, Switch, Input, Modal, Toast, Pill, Menu, Icon*… } from '@deepseek-ai/dsh-client-ui-primitives'`（宿主平台模块，运行时 `require()` 解析），宿主没有的才自绘且只吃官方 token（`--dsw-alias-*`）。
- 本仓是 **100% 自绘**：每个控件配一个 `*-css.ts`，类名 `dsh-tdt-*`，token 虽已别名到官方但几何/皮肤是重新演绎，必然有差。

用户拍板（2026-10-19 01:36 原话要点）："字号/皮肤继承官方（包一层官方 primitives），在上面做定制，而不是重造"；两条硬要求：**能抽象的一律往上抽、架构做健壮**；**该删的外部引用删干净**。

专家团（三路：架构对标 / 落地树 / 批判评审）结论见本文「过程」节附录（原 `docs/refactor-work-log.md` 全文，2026-10-19 搬入本台账）：canonical 分层 **tokens → platform → components（含 layouts）→ headless → utils → features**，对用户初版"扩展空间/抽象方法区独立成层"提出两处反对（违反本仓"等第二个消费者再抽"自订规矩；官方 Modal 本身就是 modal base）。

**本任务的由来**：上述会话在 10-19 02:18（UTC）停在"等用户拍板 3 件事"后中断，**台账里没建任务**，台面只剩过时的 `20261018-1124-文档补全` 任务。本任务补登记该工作线。

**已落地未登记的地基**（两个 commit）：
- `8904ac4` 重构地基(P0)：删死脚本 `scripts/plugin-client-build.mjs`；`src/types/primitives.d.ts` 从 any-stub 换成版本钉死真类型；新建 `src/ui/official.ts`（L1 adapter，全仓唯一官方 import 点 + `pickOfficial` 漂移兜底）；typecheck/build/35 测试全绿
- `5f9f378` docs：`docs/refactor-work-log.md`（模式/分层树/专家结论/待拍板）——该文件建错位置（工作日志不该入 `docs/`），2026-10-19 已全文搬入本文「过程」节并删除原文件

## To Do

**① 等用户拍板**（见本文「过程」节附录·原重构工作日志 §13，专家团遗留 3 决策）：
1. ③「扩展空间」④「抽象方法区」接受不独立成层（③→`components/layouts` 复合控件、④→并入 `./utils`），还是坚持独立 tier？
2. 趁无外部消费者换 canonical 名（`./tokens` / `./platform` / `./components` / `./headless`），还是保留现名（`./design` / `./ui` / `./utils`）？
3. 平台类型进 dist 方案：(a) `primitives.d.ts` 随包发布成公开契约 + (b) 公开 API 对平台类型 opaque？

**② P0 拆雷 + 清算**（无视觉回归，动第一个 wrap 前的硬伤）：
- Node 单测 stub：`pnpm test` 在 Node 里 import 组件，一沾官方模块就 `ERR_MODULE_NOT_FOUND`——用 `module.register` 把 `@deepseek-ai/*` 映射到测试 stub（几行，只为命令不崩；用户已确认"无数组环境能否跑不重要"）
- 根 `demo/` 拆分：`demo/sections/` 被 `packages/demo` 共用（`import '../../../../demo/sections/index.js'`），须先挪进 `packages/demo` 再删坏的预览站外壳（App/main/index.html/build.mjs/mock.ts）+ `demo:build` 脚本
- 文档不变量改写：`AGENTS.md` / `docs/design/architecture.md` / `docs/design/external/dsh-host.md` 里"ui 零 `@deepseek-ai/*` 依赖"硬约束 → 改为"官方平台模块经 L1 adapter 消费"；`docs/requirements.md` 记录"反转 SelectField 旧决策"（`18-0425` 任务当年因官方 Menu 依赖被删）
- `scripts/gen-token-alias.mjs` 被引用但不存在；alias hack 已漂移（`surface-3`/`surface-raised` 不在别名表，静默失效）→ 删 hack，不补生成器
- CSS 类名 `dsh-tdt-*` 全局命名空间不隔离（`tdt` 是兄弟项目缩写）→ 趁重构类名前缀化
- 默认 kit 固定 id/prefix，忘了 `setStyleKit` 的插件会互相覆盖 → 工厂默认值处理
- 反向依赖违规：`src/ui/css.ts` import 了 `explorer`/`session` 的 CSS

**③ P1 抽象收敛**（用户硬要求"往上抽"）：尺寸三档 / focus ring（重复 ~11 处）/ hover / transition 三连 / `prefers-reduced-motion`（6 处）/ 语义色 tint / 单一下拉锚点（现 3-4 处分叉，Modal 关闭钮在蹭 picker 类）/ 省略号——抽成共享基 + 工具类 + token。

**④ P2 逐个包裹官方 + 删自绘**（有视觉变化，一次一个可回归）：
- wrap 官方（L3）：Modal、Toast、Chip→Pill/Tag、Switch、Input、FieldHint→Tooltip、MarqueeText、Picker 下拉→Menu+hook、图标、MarkdownText/CodeBlock/ReadBlock
- 自绘留用（L4，复刻兄弟项目重砌到共享基）：Button/IconButton、Segmented、Checkbox、Textarea、Card/StripCard、Field、SectionHead、Loading、EmptyState、BackToTop、LiveText、ErrorBoundary
- 删：孤儿 CSS（`DATETIME_CSS`、`SELECT_CSS` 的 `.dsh-tdt-ed-*`、`.dsh-tdt-switch`、重复的 `.dsh-tdt-chip`）+ 被官方取代的自绘实现

**⑤ 收尾**：每个 wrap 完成后 `pnpm run build` + `pnpm test` + 装进宿主看真实观感（用户：测试就是装进宿主看，没有 HTML 测试）。

## Next

等用户对 §13 三件事拍板（用户回"照推荐"= ③④不独立成层、换 canonical 名、类型进 dist）。拍板后从 P0 起手：先补 Node 测试 stub loader（这是动任何控件 import `official.ts` 的前置），再拆根 `demo/`，再改文档不变量。

## Process

**2026-10-19 11:32** 补建本任务。核实：会话中断前的地基（`8904ac4`、`5f9f378`）已在 main；`src/ui/official.ts` 存在（2412B）；`docs/refactor-work-log.md` 存在，§13 三条待拍板原样未动；`ledger/progress.json` 在办任务只有过时的 `20261018-1124-文档补全`（其 worklog 自记"等用户确认后 close"，未结案）。

**2026-10-19 11:32 之后**：用户指出 `docs/refactor-work-log.md` **建错位置**——它是工作日志/设计规格（过程叙事），按项目落位规则「任务进度与过程叙事不入 `docs/`，由 task-ledger 统一管理」应归台账。用户要求：全文搬进本任务过程文档 → 删原文件 → close 掉 `20261018-1124-文档补全` 任务。

已核实 `docs/refactor-work-log.md` 无任何外部引用（`docs/README.md` 槽位表、README、AGENTS.md 均未登记/引用它），删除不影响别的文档。

以下为原 `docs/refactor-work-log.md` 全文（commit `5f9f378` 产物；除标题降两级嵌入本节、首加 provenance 标注外，正文一字未改）：

---

#### 原文档标题：dsh-plugin-core 架构重构 · 工作日志 / 设计规格

> 本文档**不写代码**，只记录：需求、已确认的引用模式、分层架构、两个成熟模块的接入、待决问题。
> 代码落地按本文的共识另开。所有结论以用户 2026-10-19 拍板为准。

#### 1. 背景与目标

- `dsh-plugin-core` 是 DSH 插件的**共享基础库**（npm 名 `dsh-plugin-core`），提供设计 token、UI 控件、布局空间、工具方法。
- **触发问题**：demo 预览插件装进真实 DSH 宿主后，自绘控件的观感与宿主不一致（用户："还是这样"）。兄弟项目 `dsh-task-dispatch-table` 观感对，因为它大量直接用宿主官方件。
- **目标**：
  1. 观感与真实宿主一致；
  2. 架构健壮，**能抽象的一律往上抽**，不在每个调用点重复；
  3. **该删的外部引用删干净**；
  4. 结合成熟的软件设计架构 / 框架设计，出一套方案。

#### 2. 已确认的引用模式（2026-10-19 拍板）

- **一切运行在 DSH 宿主内**：平台模块数组（`@deepseek-ai/*`，运行时由宿主 `__ModuleLoader__` 解析）。**不存在脱离宿主运行 / HTML 测试的场景**；测试就是装进宿主看效果。⇒ "无数组环境下能否跑"不作为设计要求。
- **控件 = 继承官方 primitives + 定制**，不是从零重造。
- **混合分工**（复刻兄弟项目 `dsh-task-dispatch-table` 的实测做法）：

  | 情况 | 处置 | 例子 |
  |---|---|---|
  | 官方够用 | 包一层官方 `@deepseek-ai/dsh-client-ui-primitives` | Modal、Toast、Pill/Tag、Switch、Input、Menu、MarqueeText、FieldHint(→Tooltip)、图标、MarkdownText、CodeBlock、ReadBlock/TerminalBlock/DiffBlock、DisclosureRow、FileTypeIcon、writeClipboard、useAnchoredPosition、useDismissOnOutsidePointer、TextShimmer |
  | 官方缺对应"轴" | 自绘，但只吃官方 token | Button（danger/lg 官方无）、Segmented（multiple/badge/count 官方无）、Checkbox、Textarea |
  | 官方完全没有 | 自绘，只吃官方 token | Card / StripCard（左侧 accent 条 + 可展开 panel，宿主无此物） |

- **单一入口（L1 adapter）**：全仓**唯一** import 官方平台模块的文件（已建 `src/ui/official.ts`），`export *` + `pickOfficial` 漂移兜底。业务控件只从这一个文件消费官方件——grep 即审计、stub/替换只改一处。
- **token 层（L2，保留）**：`src/design/*` 的"可前缀化 token kit + 字符串 CSS 注入器"。官方组件吃 `--dsw-alias-*`，我们的自绘面吃 kit 前缀变量，两层互补共存。

#### 3. 分层架构（树）—— 用户提出，待专家团校准

```
dsh-plugin-core（共享基础库）
│
├─ ① 基础 UI · 配置层（design）             ← 最基础：颜色 / 尺寸 / 字体 / 圆角 / 间距 / 阴影 / 层级 / 动效
│     单一事实源、可按前缀实例化（多插件同页不互踩）
│
├─ ② 基础 UI · 控件层（ui/controls）        ← Input / Select / Button / Checkbox / Segmented / Modal / Toast / Chip …
│     引用 ① 的颜色与尺寸；能官方的包官方，不能的自绘吃 ①
│
├─ ③ 扩展空间（spaces / layouts）           ← 提供"基础能力"，具体内容由使用方填充
│     ├─ (a) 侧边栏 + 分栏/拉栏（sidebar & split-resize）
│     └─ (b) 模态弹窗（modal base + 确定/取消等类型）
│
├─ ④ 抽象方法区（utils / methods）          ← 与 React 无关的纯逻辑，独立可取
│     └─ 日期处理（先做）；以后扩：字符串等
│
└─ 成熟模块（消费方，建在 ①②③ 之上；同仓 packages/ 或独立仓）
      ├─ 文件浏览模块：用 ③(a) 侧边栏分栏 + ② 控件 + 外部包（语法高亮 / 文件浏览）
      └─ 绘画记录模块：用 ③(b) 模态弹窗，把绘画记录装进弹窗
```

**demo 预览插件**按这四层分 section 展示（基础 UI / 扩展空间 / 抽象方法区 / 成熟模块示例）。

#### 4. 依赖规则（谁引用谁，单向向下）

- ④ 抽象方法区：不依赖任何层（纯逻辑）。
- ① 配置层：不依赖任何层（最底）。
- ② 控件层：只依赖 ①（颜色/尺寸）+ L1 adapter（官方）。
- ③ 扩展空间：依赖 ①②（+ L1）。
- 成熟模块 / demo：依赖 ①②③④。
- **禁止反向依赖、禁止跨层斜构**（如控件直接用字面量颜色而绕过 ①；空间直接用官方而绕过 L1）。
- 代码里已存在的"单一事实源"规矩继续有效：使用点不许就地写样式，要改就改基础层、一处生效全站。

#### 5. 两个成熟模块接入

1. **文件浏览模块**：核心是"侧边栏 + 分栏拉栏"空间；内部定制，引入语法高亮、文件浏览等外部包；会用到 ② 的 Input/Select 等基础控件。→ 依赖 ③(a) + ② + 外部包。
2. **绘画记录模块**：复用 ③(b) 模态弹窗基础能力，把绘画记录内容装进弹窗。→ 依赖 ③(b)。

（这两个模块是否放进本仓 `packages/` 还是独立仓，待定；但它们对基础库的**消费契约**要先定义清楚。）

#### 6. 抽象方法区

- 与 UI 无关的纯函数/纯逻辑单独一块，框架无关、可单测、可被非 React 侧引用。
- 先落地**日期处理**；预留扩展位（字符串等后续包）。

#### 7. Node / 宿主测试澄清（结论）

- 真测试 = 装进 DSH 宿主看效果；不做 HTML 测试、不要求脱离宿主可运行。
- 仓库现有 `pnpm test`（Node，35 条）在组件 import 官方模块后会因解析不到平台模块报错——用**最小 stub** 保持命令不红即可，不作为质量门禁。

#### 8. P0 拆雷 / 清算清单（无视觉回归）

- [x] 删死脚本 `scripts/plugin-client-build.mjs`（入口不存在、无引用）。
- [x] `src/types/primitives.d.ts`：any-stub → 版本钉死真类型（对齐兄弟项目 0.1.7-rc.2）。
- [x] L1 adapter `src/ui/official.ts`。
- [ ] Node 测试最小 stub（`@deepseek-ai/*` → test stub），保持 `pnpm test` 不红。
- [ ] 根 `demo/` 拆分：共用 `demo/sections/` 挪进 `packages/demo/`，删坏的预览站外壳（App/main/index.html/build.mjs/mock.ts）+ `demo:build` 脚本。
- [ ] 文档不变量改写：`AGENTS.md` / `architecture.md` / `dsh-host.md` 的"ui 零官方依赖"硬约束 → "官方平台模块经 L1 adapter 消费"；`requirements.md` 记录"反转 SelectField 旧决策"（旧决策：SelectField 曾因依赖官方 Menu 被删）。
- [ ] 补 `scripts/gen-token-alias.mjs`（被 `token-alias.ts` 引用却不存在）或消灭 alias hack。

#### 9. P1 抽象收敛（跨 `*-css.ts` 与组件，重复模式上抽）

- 尺寸三档、focus ring（~11 处）、hover、transition 三连、`prefers-reduced-motion`（6 处）、语义色 tint、**单一下拉锚点**（现 3-4 处分叉，Modal 关闭钮在蹭 picker 类）、省略号 —— 抽成共享基 / 工具类 / token。
- 孤儿 CSS 删除：`DATETIME_CSS`、`SELECT_CSS` 的 `.dsh-tdt-ed-*`、`.dsh-tdt-switch`、**重复的 `.dsh-tdt-chip`**（card-css 与 controls-css 同名不同皮）。

#### 10. P2 控件改造（有视觉变化，一次一个可回归）

- wrap 官方：Modal → Toast → Chip → Switch → Input → FieldHint → MarqueeText → Picker(→Menu) → 图标；每包一个删一块自绘 CSS。
- 自绘保留但重砌到共享基：Button / Segmented / Checkbox / Card / StripCard / Field 家族。
- 删除被官方取代的自绘实现。

#### 11. 开放问题 / 待定

1. 两个成熟模块（文件浏览 / 绘画记录）放本仓 `packages/` 还是独立仓？其对基础库的消费契约如何定义？
2. ③ 扩展空间命名为 `spaces` 还是 `layouts`？侧边栏"基础能力"具体暴露哪些 API（slot？render prop？）？
3. ④ 抽象方法区命名 `utils`（已存在 `src/utils/`）还是新开 `methods`/`lib`？与现有 `src/utils`（i18n 等）如何合并/区分？
4. 现有 `src/explorer`（工作区浏览器）、`src/session`（会话预览）与新分层的关系？（是否即"文件浏览 / 绘画记录"的雏形，归入成熟模块？）
5. demo 的 section 是否严格按四层重组？

#### 12. 专家组评审结论（2026-10-19，三路：架构对标 / 落地树 / 批判评审）

##### 12.1 共识（全部认可，保留）
- **L1 单一官方入口**（唯一 import 平台模块）+ **混合分工**（官方够用就包、缺轴自绘吃 token、完全没有才自绘）+ **token kit 工厂**：对的，保留。
- canonical 设计系统分层 = **tokens → primitives → components → patterns → features**（Atlassian ADS / Material 3 / Adobe Spectrum / SLDS / GitHub Primer 一致）；headless/styled 分离是横切（Radix / React Aria / Downshift）；L1 最佳先例 = **VS Code Webview UI Toolkit**（包一层宿主官方件 + 吃宿主 token）。
- **P1 去重**（focus ring ~11 处、transition、reduced-motion、语义 tint、**单一下拉锚点**——硬证据：`Modal.ts` 关闭钮在蹭 picker 的类）最实，必做。

##### 12.2 对初版树的修正（批判评审 + 架构对标一致）
1. **③「扩展空间」不作为独立顶层 tier**——过度设计，违反本仓 `architecture.md` 自立的"等第二个消费者再抽"规矩；且**官方 Modal 本身就是 modal base**，再套一层是重复造轮子。→ 改为 `components` 下的复合控件：`ConfirmDialog`（薄封装官方 Modal + 确定/取消）、`SidebarLayout`/`SplitPane`（内核 `resizer.ts` 已在）。"基础能力+使用方填内容"由复合件交付，不新开层（demo 仍可单列展示区，代码不单开 tier）。
2. **④「抽象方法区」不新开层**——与既有 `src/utils/` 重复，且"纯逻辑"前提已破产（`utils/date.ts` 已 import i18n 的 `t`、`utils/http.ts` 是 IO）。→ date 并入 `./utils`，内部按纯度分域（纯函数/状态型 i18n/IO http）；可选 `./headless` 只提拔 `resizer`/`picker-logic`。
3. **命名趁现在换 canonical 名**——目前无外部消费者（全仓自用），现在改名最省；拖久了是破坏性变更。`./design→./tokens`、`./ui→./components`、新增 `./platform`（L1 提升，`@internal`）、可选 `./headless`、`./utils` 保留。
4. **L1 `export *` 改显式具名再导出**——`export *` 会让新增官方件无需改 official.ts 即到手，掏空"唯一入口可审计"。`pickOfficial` 只留易漂移边角件。

##### 12.3 动第一个官方 wrap 前必须解决的硬伤（高危）
- **平台类型泄漏进 dist**：`declaration:true` 但 `.d.ts` 不进 dist；公开控件一 wrap 官方件，下游 tsc 会 `Cannot find module` 或退化 `any`。**先定方案**：(a) `primitives.d.ts` 随包发布为公开契约；或 (b) 公开 API 对平台类型 opaque（不 `export *`）；或 (c) 文档强制下游 externalize+自带 ambient。**推荐 (a)+(b)**。
- **CSS 类名 `dsh-tdt-*` 是全局命名空间**，内联进多插件并不隔离（`css.ts` 自认跨 core 版本互覆盖；`tdt` 还是兄弟项目缩写）。趁重构把类名前缀化（与 kit 前缀同源）。
- **默认 kit 固定 `id`/`prefix`**（`css.ts` 模块级 `createStyleKit({id:'dsh-plugin-core-ui',prefix:'dsh'})`）会让未 `setStyleKit` 的插件互覆盖样式——工厂白做。改唯一化默认或未初始化告警。
- **已有一处反向依赖违规**：`src/ui/css.ts` import 了 `explorer`/`session` 的 CSS 拼进 `CONTROLS_CSS`，违反 architecture.md"ui 不依赖 explorer/session"。提升模块时剪断。
- **alias hack 已漂移**：`token-alias.ts` 硬编码 60 个 token 名，`tokens-css.ts` 的 `--tdt-surface-3`/`--tdt-surface-raised` 不在表里→静默失效。**删 `token-alias.ts`、展示代码改前缀相对**，别补生成器。
- **react-dom 被官方 Modal 悄悄变必需**（官方 Modal 用 `createPortal`，react-dom 是 optional peer）→ 文档标注契约变更。
- **`src/explorer` = 文件浏览雏形、`src/session` = 绘画/会话记录雏形**（`SessionPreview` 已有 `variant:'modal'|'sidebar'|'page'`，modal 分支就是套 `ui/Modal`）。两个"成熟模块"就是它们，别新开 `packages/` monorepo，当 features 层重构为消费基础库。

##### 12.4 校准后的目标树（推荐）

```
dsh-plugin-core（无根桶，按子路径导出）
├── ./tokens     ① 设计 token + 可前缀 kit 注入器（零 React）          [原 ./design]
├── ./platform   L1 宿主边界：唯一 import @deepseek-ai/*，显式具名再导出 + pickOfficial（@internal）
├── ./components ② 控件（官方够用经 ./platform 包；缺轴/无才自绘吃 token）   [原 ./ui]
│     └── layouts/ 复合：ConfirmDialog（薄封装官方 Modal）、SidebarLayout/SplitPane（内核 resizer.ts）
├── ./headless   （可选）无样式行为/逻辑：resizer / picker-logic
├── ./utils      ④ 纯方法：date/string/number + 状态型 i18n + IO http，内部按纯度分域
└── ./features/* 成熟模块（现 src/explorer 文件浏览 / src/session 绘画记录），只吃公开子路径
```

##### 12.5 依赖规则（单向向下，层内只走公开 index）
tokens/platform/utils 不依赖上层；components → tokens+platform+headless+utils；layouts → components+…；features → 仅公开子路径；**features 禁止直接 import 平台模块**（要包先经 ./platform→components）。

#### 13. 待用户拍板（专家团遗留的 3 个决策）
1. **③④ 是否接受"不独立成层"**：③→`components/layouts` 复合控件、④→并入 `./utils`（vs 坚持初版独立 tier）。
2. **是否趁无外部消费者换 canonical 名**（`./tokens`/`./components`/`./platform`/`./headless`）。
3. **平台类型进 dist 选哪个方案**：推荐 (a) 随包发布 `primitives.d.ts` + (b) 公开 API 对平台类型 opaque。

（附录完——原 `docs/refactor-work-log.md` 全文至此结束，原文件已随本提交删除。）

## Conclusion

<!-- What got done, what got left behind -->

## Execution Log

<!-- Maintained by the script: appended by new / claim / set / release / log / close. Do not edit.
     Backfill with: progress log --id <id> --note "...". -->
