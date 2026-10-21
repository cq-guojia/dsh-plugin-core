# 20261020-2317-demo-预览站界面重做-照抄-bootstrap-文档站布局-8427：demo 预览站界面重做（照抄 Bootstrap 文档站布局）

> **创建**：2026-10-20 23:17:28（@GuoJia-Agent）
> **分类**：界面 ｜ **标签**：demo、样式、布局

<!-- 「> **分类**：… ｜ **标签**：…」行由脚本按 new --category / --tags 插入；两者皆空则不写。 -->

## 背景

用户 2026-10-20 反馈 demo 预览站「界面丑得死人」，选定照抄 Bootstrap 文档站布局
（https://getbootstrap.com/docs/6.0/components/dialog/）。用户原话要点：
① 页面上方提示框显示备注；② 下方左侧放示例、右侧放代码；③ 代码块可滚动并渲染出来；
④ 不能只有示例，还要有代码示例且要说明「怎么用」（import / API）；现状「纯粹乱堆」。
约束不变：预览效果与实际使用一致（2026-10-17 建站初衷，Hindsight kp-8b65cdcf3dfd）。
用户拍板：每示例一对（左示例右代码）、右栏 PanelDock 保留、代码高亮走官方 CodeBlock；
**先只改 Button 一页做样式试点**，确认后再改其余页。
2026-10-21 第一轮验收：整体接受；两条改动——① 备注框要核心那种「方角 + 左边几个像素的
色条 + 整块浅色底、不带外边框」（⇒ 核心 StripCard）；② 示例左栏控件堆着没层次，尤其
「外观档」那块。官方代码框先不改（后面再研究是否引入三方高亮包）。
2026-10-21 第二轮验收：效果可以，按这个模板继续改其余页。
2026-10-21 第三轮：用户要求「先提交再改其他的」，并追问 Button 命名是否冲突——
澄清是「给其他插件引用后打包是否冲突」，给出三层 JS 隔离论证 + CSS 跨版本覆盖限制 +
external 打包契约。

## 待办

- [x] 布局提案拍板 + Button 页试点
- [x] 第一轮验收改动：备注框改核心 `StripCard`；示例左栏按语义分组分层
- [x] 骨架统一：`sections/index.tsx` 的 `Demo` 改为 `Example` 薄封装 ⇒ 其余页即时吃到双栏布局
- [x] components 组 8 页（button / input / picker / tooltip / card / chip / feedback / layout）：备注 + 代码（与左栏逐条一致）+ 用法 + API 表
- [x] blocks 组 2 页（explorer / session）：备注 + 代码 + 用法 + API 表
- [x] utils 组 5 页（date / number / text / http / i18n）：真实 3 页补齐，text/http 仍为占位
- [x] start 组（quickstart）+ foundation + reference：说明/占位页补 Note + 用法，风格统一
- [x] 全部 18 页完成、三批提交推送（036903f / 4b06009 / 836b4e6）
- [ ] 官方 `CodeBlock` 观感问题：是否引入三方高亮包，另行研究（用户要求推迟）
- [ ] 全部验收后：version bump（按发布节奏，不主动打 tag）

## 下一步

等待用户在宿主验收整体效果。可能的收尾：① 官方代码块观感（三方高亮包）另行立项；
② 验收通过后按发布节奏 bump 版本（不打 tag，除非用户要求）。toast 统一方案（多插件同页
只留一个提示区）已另开任务 **20261021-0855-toast-改全局共享宿主-多插件同页只留一个提示区-9a8a**
由另一个 Agent 实施，其改动（src/ui/toast-host.ts、test/toast-host.test.mjs 等）已出现在工作区
但尚未提交，归该 Agent 负责，本任务不碰。

## 过程

**勘察与提案（2026-10-20 23:17-23:23）**：外壳 `client/index.tsx` 的 `DemoPage` 为 flex 三栏
（左 180px 两级导航 + 单页 main + 右 PanelDock），无路由无 anchor，`useState<SectionId>`
切换；`sections/index.tsx` 的 `Demo` = 卡片 + h3 + hint + children + 可选裸 `<pre>`（无高亮，
全站仅 foundation 用过）；demo 包零 CSS、全 inline style；构建 esbuild 出 `dist/`，库从
`../../dist/` 引入。可复用：官方 `CodeBlock`（Shiki）经 `src/ui/official.ts` 再导出；
`Card`/`StripCard`/`Segmented`/`PanelDock`/`Button`/`IconButton`；token `--dshpc-code-surface` /
`--dshpc-code-font`。硬约束：运行时 TS 字符串注入、源码写真 .css 由 `scripts/gen-css.mjs` 生成、
`createStyleKit({id})` 单一注入点、`dshpc` 前缀、明暗判据 `body[data-ds-dark-theme]`、dist 入库、
调试期 commit+push 不 bump 不打 tag。Bootstrap 页结构（web_fetch 实测）：三栏 → 正文 =
页头 → 说明 → 示例（大写示例标题 + live demo + 带语言标签的代码块）→ 多张 API 表。

**第一轮（2026-10-20 深夜，Button 页）**：新增真源 `demo.css`（只消费 `var(--dshpc-*)`：
`.dshpc-doc-note` / `.dshpc-doc-block` / `.dshpc-doc-example*`（双栏 `repeat(auto-fit,minmax(300px,1fr))`，窄容器塌单列；代码内层 max-height 320px 可滚）/ `.dshpc-doc-api`）；
`scripts/gen-css.mjs` MAP 加一行；`test/css-contract.test.mjs` 孤儿自检补 walk `../packages/demo/src`；
新增 `doc.tsx`：`Note` / `Example` / `CodeOnly` / `ApiTable`（代码一律官方 `CodeBlock` lang tsx +
showHeader + copyLabel）；`primitives.d.ts` 补 `CodeBlock` 与 `Modal`。修两处**既有**类型错误
（demo 缺 `Modal` 声明；原生弹窗 `Input` 缺 value/onChange）。提交 `6168ee9` 并 push。

**第二轮（2026-10-21 凌晨，第一轮验收后）**：备注框改用核心 `StripCard`（方角+左缘 4px 通高
色条+浅底）；外观档拆 `VARIANT_GROUPS`（主行动/中性/语义色/弱化），每组一行 `Labeled`；
状态/颜色块同步分层。提交 `67eb0da`（含 `client/index.tsx` 的 `registerStyle('demo')` 注入点，
第一轮漏了这行导致宿主不生效）并 push。

**第三轮（2026-10-21 上午）**：`sections/index.tsx` 的 `Demo` 改为 `Example` 薄封装 ⇒ 17 页即时
吃到双栏；补齐 input/picker/tooltip/card/chip 五页；踩坑：新增 apiSize/apiDisabled 与 Button 页
撞名（TS1117）⇒ 通用 API 说明只准一份；后 apiTone 又撞 Chip 五档 tone ⇒ ConfirmModal 改用专用
`apiToneModal`。提交 `9b16ca9` 并 push。

**第四轮（2026-10-21 09:00，feedback/layout）**：feedback 页（6 示例块：宿主官方 Modal / 标准
小框 / 内容弹窗 / Sonner / 宿主 Toast / notify）+ 备注 + 用法 + 弹窗/提示两张 API 表；layout 页
（PanelDock 是布局成员不是浮层备注 + 建 dock/渲染/显隐/订阅四步代码 + DockPanelProps /
PanelDockOptions 两张 API 表，逐条对齐 `src/ui/PanelDock.ts`）。提交 `036903f` 并 push。

**第五轮（2026-10-21，blocks/utils/start/foundation/reference）**：
- blocks 组（explorer/session）：ExplorerPage 三块（数据来源 / openFilePreview 停靠预览 /
pickWorkspaceFile 锚定选文件）加备注+代码（拆 CODE_OPEN/CODE_PICK）+ 用法 + EXPLORER_API /
PICK_API 两张表；SessionPage（SessionPreview）加代码+SESSION_API。提交 `4b06009`。
- utils 组（date/number/text/http/i18n）：DatePage/NumberPage 用既有 FnTable 速查表，加备注+
代码（CODE_DATE/CODE_NUMBER）+ 用法 + DATE_API/NUMBER_API；I18nPage 加备注+代码（CODE_I18N）
+ I18N_API；text/http 仍占位（函数尚未 demo）。提交 `836b4e6`。
- start/foundation/reference：说明/占位页统一 `Demo→Example`，加顶部 `Note`（startNote/
foundationNote/referenceNote）；quickstart 额外加 `CODE_START_USAGE`（安装+样式注入片段）。
- 踩坑：i18n 中文文案一度误写入英文段（把 `apiOnLimitReached` 的英文行当锚点），脚本清掉误加
  的 16 行后，分别补到 zh/en 两段正确位置。
- 验证：core typecheck 0 / demo typecheck 0 / `gen-css --check` 0 / `node --test` 77 全绿（原 74
  + toast 任务新增 3）/ codelint 全过（5 文件 L0-L5 全过）。demo 三批产物均已 build 并入库。

## 结论

demo 预览站 **全部 18 页** 完成 Bootstrap 风格改造（备注 + 左示例右代码 + 用法 + API 表），
分三批提交推送：feedback/layout（`036903f`）、blocks（`4b06009`）、utils/start/foundation/
reference（`836b4e6`）。验证全绿。待用户在宿主验收；官方代码块观感、版本 bump 列为后续。
toast 多插件统一方案由另一 Agent（任务 9a8a）实施，工作区改动未提交、归它负责。

## 执行记录

<!-- 本节由脚本维护：new / claim / set / release / log / close 自动追加，请勿手改。 -->
- 2026-10-20 23:17:28 · new · @GuoJia-Agent · 创建任务（doing）
- 2026-10-20 23:33:39 · log · @GuoJia-Agent · Button 页试点完成，等宿主验收
- 2026-10-21 00:43:54 · log · @GuoJia-Agent · 第二轮：备注框改核心 StripCard、外观档分组分层
- 2026-10-21 08:27:42 · log · @GuoJia-Agent · 第三轮：Demo→Example 骨架统一，5 页补齐
- 2026-10-21 09:04:47 · log · @GuoJia-Agent · 第四轮：feedback/layout 完成，components 8 页全完
- 2026-10-21 09:35:00 · log · @GuoJia-Agent · 第五轮：blocks/utils/start/foundation/reference 改造；全部 18 页完成；77 测试+codelint 全绿；demo 三批已提交推送（036903f/4b06009/836b4e6）
