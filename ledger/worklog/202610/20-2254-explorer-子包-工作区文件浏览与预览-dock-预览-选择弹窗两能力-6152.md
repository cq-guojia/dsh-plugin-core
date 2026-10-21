# 20261020-2254-explorer-子包-工作区文件浏览与预览-dock-预览-选择弹窗两能力-6152：explorer 子包：工作区文件浏览与预览（dock 预览 + 选择弹窗两能力）

> **✅ 完成封卷**：2026-10-22 00:45:06（@GuoJia-Agent）
> **创建**：2026-10-20 22:54:32（@GuoJia-Agent）
> **分类**：功能 ｜ **标签**：explorer、文件预览、dock、picker、官方件

<!-- 「> **分类**：… ｜ **标签**：…」行由脚本按 new --category / --tags 插入；两者皆空则不写。 -->

## 背景

两轮真机反馈驱动：
- 第一轮（2026-10-21 早些）：demo 里面板本体全是 mock ⇒ 删；demo 要读真实工作区并放真样例文件；
  「打开文件夹」落到最近会话的工作区；侧边栏必须用核心 `PanelDock`；所有 button 用核心控件；
  ▾ 菜单 / 树行间距「和兄弟项目一模一样」。
- 第二轮（2026-10-21 本轮）：分栏被做成了浮层（「你的是浮在页面上，我核心里面那个是分栏」）；
  dock 头部多出一条线（应走 `header=null` 那版）；行尾文案该是「选择」不是「选择此文件夹」；
  面包屑的 ▾ 与树行小尖号没对齐；核心有的控件不许手搓；间距逐行对兄弟。

## 待办

- **待用户真机验收**：① 分栏是否真的挤窄主区（不是盖上去）；② `header={null}` 后顶部不再多一条线、✕ 浮右上角是否可接受；
  ③ 树行 / 面包屑 / ▾ 菜单逐像素对比兄弟项目；④ 行尾按钮文案「选择」。
- 若用户判定核心的浮动 ✕ 与面包屑行对不齐 ⇒ 允许改为自写关钮（用户原话：「这也是允许的」）。
- `SessionPreview` 仍是 mock（`packages/demo/src/mock.ts` 只剩这一处假数据）。

## 下一步

用户在宿主里重装 demo 后，按上面四条逐一看；反馈「关钮位置不对」就直接把 `DockPanel` 的 `closeButton` 换 `'none'` + 自写关钮。

## 过程

- **分栏纠偏（2026-10-21 二次反馈）**：上一轮虽然用了核心 `PanelDock`，但把它塞进 `document.body` 的
  `position:fixed;z-index:1050` 容器 ⇒ 观感是浮层（用户原话「你的是浮在页面上，我核心里面那个是分栏」）。
  现在 `OpenFilePreviewOptions.mount` **必填**（调用方那层 flex 行），容器 `display:contents` + `createRoot`，
  核心 `.dshpc-dock` 直接成为 `mount` 的 flex 子项（`src/explorer/open.ts:60-150`）。
  真实证据：`PanelDock.ts:4-5` 注释原文「布局成员，不是浮层…自挂 document.body 只能遮盖、挤不窄」。
- **头部**：改 `DockPanel header={null}`（`open.ts:129`）——上一轮传 `title:''` 走的内置头，多出一条
  border-bottom 的线（用户「上面还有一条线，只是没有了标题」正是此因）。关钮按核心规则浮右上角（`--floating`）。
- **样式逐条对齐**：`src/explorer/explorer.css` 按兄弟 `archive-session-css.ts` 的 `.dsh-tdt-sv-*` 全族重写，
  数值一一对应：crumbbar `4px 10px`+`--border`；crumb `2px 4px`；tree `6px 8px`；tree-row `gap 8/padding 6px 8px`;
  tree-toggle `20×20`+`rotate(90deg)`；tree-act `2px 8px`/`line-height 1.4`/`opacity 0`；children `margin-left 9/padding-left 7`;
  truncated `8px 10px`；preview-body `12px 14px`；titlebar `8px 14px`+单行省略；hint `12px 0` 居中；err `padding 8px 0 / gap 10`。
  核心控件自带 padding/高度在本文件用 `.dshpc-fb .dshpc-fb__xxx`（0,2,0）覆盖控件默认（0,1,0）。
- **文案**：`explorerPickDir` 由「选择此文件夹」改回兄弟原文「选择」（`Select`），新增 `explorerPickDirAria`
  = 兄弟 `editorPickerPickDir`「选择此目录（连带其下所有文件）」；`explorerRootName` 也对齐兄弟「（工作区根目录）」。
  `FileTypeIcon` 尺寸 16 → 18（兄弟 `file-browser.tsx:611`）。
- **档位**：Segmented 回 `sm`（兄弟调用点），✕ / ▾ 回 `md`——之前把两边都调成 `md` 是我自作主张，兄弟就是 sm+md。
- **picker 补齐文案注入**：`PickWorkspaceFileOptions.translate`（原来只有 dock 侧能注入）⇒ 两能力文案通道一致。

## 结论

- 两能力**同一个 `FileBrowser`**（`open.ts:120` dock / `open.ts:226` picker 都是 `h(FileBrowser, …)`），
  差异只有承载与 `picker` 形态参数；文案经 `translate`、根名经 `rootName`、可选类型经 `filter` 在调用时传入。
- 分栏不再是浮层：`mount` 必填 + `display:contents` 挂载；demo 在整页 flex 行上登记 `pageRow.element`。
- 校验：`pnpm run build` / demo `tsc` / `build:demo` / `node --test`（74/74）/ koc-codelint 全过。
- 本轮未提交（用户只要求提交上一轮）。

## 结论

<!-- 做成了什么、留了什么坑 -->

- **真机验收通过（2026-10-22，随 `…0a67` 一并验）**：① 分栏确是挤窄主区、不是浮层；② `header={null}` 后顶部不多线、✕ 浮右上角用户接受；③ 树行 / 面包屑 / ▾ 与兄弟对齐；④ 行尾文案「选择」。
- 验收前的最后一批修复落在 `…0a67`：`read` 传参（首页 `{}` / 翻页 `{offset}`，旧 `{offset:0,limit:5000}` 违反官方 offset≥1 且 limit≤maxLines）、HTML `buildStaticHtml` 非法属性选择器 `[xlink:href]`、扩展名过滤下目录不可选 + 文件行补「选择」、弹窗改锚在按钮下方、`errView` 带出真实错误码。
- **留到别处的两条**（不属于本任务，用户 2026-10-22 拍板「先结，之后另行处理」）：
  ① 类名 / 变量未跨版本隔离（`createStyleKit` 只隔离 `<style>` 标签 id，类名仍是写死 `dshpc-*`）；
  ② 全仓零渲染测试（77 用例全是纯逻辑，无 DOM）。
  另：demo 的 `SessionPreview` 仍走 `mock.ts`（页面提示里已明示「source 是 mock 的」），属 session 侧，不在 explorer 子包范围内。

## 执行记录

<!-- 本节由脚本维护：new / claim / set / release / log / close 自动追加，请勿手改。
     补记用 progress.py log --id <任务号> --note "一句话"。 -->
- 2026-10-20 22:54:32 · new · @GuoJia-Agent · 创建任务（doing）
- 2026-10-20 22:55:52 · log · @GuoJia-Agent · 填正文：背景=用户两能力定义+拍板口径表+兄弟项目7条问题清单；待办9项；下一步读实现依赖现状文件
- 2026-10-20 23:27:43 · log · @GuoJia-Agent · 交付：FileBrowser 面板 + openFilePreview/pickWorkspaceFile 两能力 + 六档预览体 + ./ui/official 通路；build/build:demo/73 测试/codelint 全过；正文曾被拉取回滚已重写；待用户真机验收
- 2026-10-21 01:18:31 · log · @GuoJia-Agent · 本轮：openFilePreview 改挂核心 PanelDock、FileBrowser 全换核心按钮并统一高度档、▾ 反转为准 兄弟度量的自写浮层、demo 改接 remote.workspaceFiles + 真样例文件 + pickWorkspaceAnchor 锚点；build/tests 74/codelint 全过，待真机验收
- 2026-10-21 07:44:21 · log · @GuoJia-Agent · 分栏纠偏：openFilePreview 新增必填 mount，dock 用 DockPanel header=null 挂进调用方 flex 行（不再 body+fixed 浮层）；explorer.css 按兄弟 .dsh-tdt-sv-* 逐条重抄；行尾文案改「选择」；picker 补 translate 注入
- 2026-10-21 08:32:26 · log · @GuoJia-Agent · ▾ 下拉对齐兄弟：点当前工作区=回根（原误走 onPickWorkspace）、图标间距6px/条目左距8px 照抄；OpenFilePreviewOptions 补 workspaces/onSelectWorkspace 透传，demo 方法A 传工作区清单（原来只有方法B有）；越界文件逻辑核对=与兄弟一致（三个错误码→只读全路径+✕、预览照常），catch 分支补 ensureRootLearned
- 2026-10-22 00:44:50 · log · @GuoJia-Agent · 补结论：四条真机验收点随 0a67 于 2026-10-22 全部通过；遗留（类名跨版本隔离 / 零渲染测试 / SessionPreview mock）用户拍板另议，不属于本任务
- 2026-10-22 00:45:06 · close · @GuoJia-Agent · 结案：真机验收通过（2026-10-22）：分栏挤窄主区非浮层、header=null 顶部不多线、树行/面包屑/▾ 对齐兄弟、行尾文案「选择」。dock 预览与选择弹窗共用同一个 FileBrowser，差异只在承载与 picker 形态。遗留（类名跨版本隔离 / 零渲染测试 / demo SessionPreview 仍 mock）不在本任务范围，用户拍板另议
