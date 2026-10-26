# 20261021-2212-修-demo-工作区浏览演示-2-组-pagerow-挂载-真样例内容-open-0a67：修 demo 工作区浏览演示：2 组 + pageRow 挂载 + 真样例内容 + openFilePreview 坏 mount 警告

> **✅ 完成封卷**：2026-10-22 00:37:50（@GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6）
> **创建**：2026-10-21 22:12:15（@GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6）
> **分类**：界面 ｜ **标签**：demo、explorer、PanelDock、openFilePreview、CodeViewer

<!-- 「> **分类**：… ｜ **标签**：…」行由脚本按 new --category / --tags 插入；两者皆空则不写。 -->

## 背景

- demo「工作区浏览」页（原 `ExplorerPage`，被某应用重构成 `blocks.tsx`）出现：4 个演示块分不清、预览在窄 div 里左右滑而不停右侧、打开文件夹样式/内容不对。用户要求收敛成 2 组并修好。
- 专家组定位：**九成是那个应用用错，核心侧只有一个真实短板**——`openFilePreview` 的 `mount` 契约不校验、传错静默破相（第三方会中招）。

## 待办

- [x] `blocks.tsx` 收敛为 2 组：①「打开即预览」文件/文件夹/根目录 3 钮（`openFilePreview`）；②「选择文件」不限 / 仅 js+md（`pickWorkspaceFile`）。删掉重复的 MethodA 与 PreviewBody。
- [x] 预览 `mount` 改用页面级 `pageRow.element`（`layout-mount.ts` 专供此用），不再用 Example 内自建窄 flex 行。
- [x] 重写 `ExplorerDataHarness`：`list` 按路径返回真目录树（root → `samples/` → 4 文件）、`read` 返回真文件内容。
- [x] `build.mjs` 构建期读 `src/samples/*` 注入 `__DEMO_SAMPLES__`（esbuild 无 `import.meta.glob`，沿用既有 define 模式）。
- [x] `open.ts`：`openFilePreview` 对非 flex 的 `mount` 发 dev 期 `console.warn`（B1，只警告不改行为）。
- [x] 重建核心 `dist` + `build:demo`；`typecheck` 干净；产物验证（`OpenPreviewDemo` / warn / `CodeViewer` / 真内容均在包，旧块 0 残留）。
- [ ] 用户实机刷新 demo 眼验（暗色 / 停右 / 文件夹 / 选择）。

## 下一步

- 用户刷新宿主里的 demo 插件眼验：① 任意文件 / 文件夹 / HTML / MD 都能预览，不再「加载失败」；② 两个「选择文件」按钮的弹窗都贴在所点按钮正下方（下方不够才翻上）；③ 「仅 JS/MD」里文件夹没有「选择」、MD 文件有「选择」、选中只可能返回文件。
- 通过后 commit（**含核心 `dist` 与 demo `dist` 的重建产物**——demo 从核心 dist 打包，改 src 必须重建 dist 才生效）。

## 过程

**根因·他用错（demo 侧）**：
- ① mount 挂进 Example 窄盒（旧 `MethodADemo`/`PreviewBodyDemo` 自建 `dock`），没用现成 `pageRow.element`（`layout-mount.ts` 注释明写"explorer 页按钮取它当 mount"）→ dock 默认 460px 溢出窄盒 = 左右滑。
- ② `--dshpc-dock-h:100%`（`open.ts:122`）在没定高的 Example 里落空 → `.dshpc-dock__panel{height:var(--dshpc-dock-h,100vh)}`（`panel-dock.css:13`）解析不到 → FileBrowser 高度塌 = 样式不对。
- ③ `ExplorerDataHarness.list` 忽略传入路径、恒返回同一组 4 文件 → 文件夹内容错。
- ④ `read` 返回"这是示例文件内容"假内容。
- ⑤ 方法B 过滤写死 `['ts']` 而样例是 md/html/js/css（无 .ts）→ 选择列表空。
- ⑥ `MethodADemo` 被渲染两次 + `PreviewBodyDemo` → 4 块分不清。

**我们有 bug / 封装短板（核心侧）**：
- `openFilePreview` 不校验 `mount`（`open.ts` 直接 `mount.appendChild`），传错静默破相 → 第三方必中招；已加 dev warn。
- `--dshpc-dock-h` 是隐式契约，消费方 mount 没定高就塌，难自查。
- PanelDock **无开合动画**（`panel-dock.css` 仅 hover 过渡），所谓"滑"是窄盒溢出，非动画 bug。

**关键教训**：demo 从核心 `dist` 打包（`blocks.tsx` 引 `../../dist/explorer/index.js`）；此前 `TextPreview` 的 CodeViewer 切换、`open.ts` warn 都没进 demo，直到本次 `tsc` 重建核心 `dist` 后才进包（grep 产物确认）。

**四改（用户真机反馈三连：全部文件加载失败 / picker 飞到整页右下角 / 仅JS·MD 下文件夹能选而 MD 文件没按钮）**：
- ① **全部文件加载失败 = 核心 bug**：`TextPreview.ts` 调 `read(sid, path, {offset, limit: 5000})` —— 我们自己的口径（`types.ts:14`、外部事实文档、兄弟项目实机）都是**首页 `{}`、翻页 `{offset}`、绝不传 `limit`**，多传会被远端按值拒。改为两态传参；顺带把「返回体形状不对」从「加载失败」里拆出来用 `previewBadPayload`（混在一起永远查不出是谁的锅）。
- ② **picker 飞右下角**：`blocks.tsx` 用 `ref={setBtnAny}` 取锚点，但核心 `Button` 是普通函数组件（`Button.ts:124`，无 `forwardRef`）⇒ `ref` 拿不到节点 ⇒ 回落到 `document.body` ⇒ 定位到整页右下。改为在 onClick 里同步取 `event.currentTarget`（同一个事件回调内取，节点才有效）。
- ③ **弹窗方向**：`open.ts` 原「优先往上弹」，用户口径是**下面够就弹下面、不够才弹上面**；改为 `availBelow/availAbove` 先量两侧空间再定点，高度跟着所选那侧走（旧实现先按上方空间算高，锚点靠顶时算出矮条）。水平也从「先左后右翻」改成**与锚点左缘对齐 + 夹紧视口**（下拉式，永远贴在所点按钮正下方）。
- ④ **过滤语义**：`FileBrowser.ts` 里目录恒保留且恒带「选择」钮（`actThisDir` 回传 `isDir:true`）⇒ 「仅 JS/MD」下出现「文件夹旁有选择、MD 文件旁没有、选中还返回文件夹」。改为：过滤点名扩展名时目录只作导航（不给选择钮、回传也被兜住），文件行补一枚与目录行对齐的「选择」钮（`explorerPickFile` 作 aria-label）。

## 结论

- demo 工作区浏览页收敛为 2 组、预览停右、文件夹真目录、选择文件两过滤；真样例内容经 `__DEMO_SAMPLES__` 进包。
- `openFilePreview` 增加坏 mount dev 警告（封装短板补救，第三方传错有痕迹）。
- 四改又修掉 3 个核心真 bug（read range 多传 limit、picker 垂直方向反了、扩展名过滤下目录仍可选）+ 1 个 demo 用法坑（`Button` 无 forwardRef，锚点要用 `event.currentTarget`）。
- 未实机眼验、未 commit（核心 dist + demo dist 重建产物待提交）。

## 执行记录

<!-- 本节由脚本维护：new / claim / set / release / log / close 自动追加，请勿手改。
     补记用 progress.py log --id <任务号> --note "一句话"。 -->
- 2026-10-21 22:12:15 · new · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6 · 创建任务（open）
- 2026-10-21 22:13:20 · claim · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6 · 认领 → doing
- 2026-10-21 22:13:20 · log · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6 · 改完并验证：blocks.tsx 收敛 2 组（打开即预览 3 钮 / 选择文件 不限+js/md）、mount 改用 pageRow.element、harness 真目录树+build.mjs 注入 __DEMO_SAMPLES__ 真内容、open.ts 坏 mount dev warn；重建核心 dist+build:demo，typecheck 干净，产物 grep 确认 OpenPreviewDemo/warn/CodeViewer/真内容进包、旧块 0 残留；未实机眼验、未 commit
- 2026-10-21 22:37:38 · log · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6 · 二修（用户实测反馈）：① harness.list 对文件路径返回 not-directory 失败信封——修'打开文件变空目录'（FileBrowser 靠 list 失败进文件预览态，见 FileBrowser.ts:348/361）；② md 预览补 padding 12px 14px 对齐兄弟（代码/源码仍贴边=兄弟同款 0）；③ 按钮去'打开根目录'改'打开工作区'（取第一个工作区+▾下拉，用 demo 内置工作区名，非真实宿主快照）。重建核心 dist+demo，typecheck 干净，grep 确认 not-directory/padding/DEMO_WORKSPACES 进包。待用户实机复验 HTML/picker/打开工作区
- 2026-10-21 23:00:49 · log · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6 · 三改·改用真实宿主数据（用户要求去假存真）：拆除 ExplorerDataHarness + __DEMO_SAMPLES__（build.mjs 注入回退）；blocks.tsx 改订 fileServices(remote.workspaceFiles)+workspaceList(官方工作区快照)+pickWorkspaceAnchor(真 sessionId)+findSamples(真样例路径)；打开工作区=第一个真实工作区(带▾下拉)、打开文件夹/文件=findSamples 真路径；未就位如实 explorerFilesNone/explorerAnchorNone 不造假。另修核心 bug：pickWorkspaceFile 面板定位写死往左展、锚点偏左时整块溢出屏幕只剩遮罩——改为左侧不够翻右侧+夹紧视口(open.ts)。重建核心 dist+demo，typecheck 干净，grep 确认真实接线进包、假数据清零。待用户实机复验（依赖宿主提供 workspaceFiles+会话）
- 2026-10-21 23:32:16 · log · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6 · 四改（用户真机三连反馈）：① TextPreview.ts read 改回两态传参 {} / {offset}（多传 limit 被远端拒=所有文件加载失败），返回体形状错改报 previewBadPayload；② open.ts 弹窗垂直改'下方优先、不够翻上'，高度按所选侧空间算，水平改与锚点左缘对齐+夹紧视口；③ FileBrowser.ts 扩展名过滤下目录只作导航（不给选择钮、isDir 回传兜住），文件行补对齐的'选择'钮；④ demo blocks.tsx 锚点改取 event.currentTarget（Button 无 forwardRef，ref 恒 null 才弹到整页右下）。重建核心 dist+build:demo，codelint 全过、typecheck 干净、77 用例全绿，grep 确认 PAGE_LINES=0/availBelow/dirPickable/currentTarget 进包。待用户实机复验
- 2026-10-21 23:55:11 · log · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6 · 五改·HTML：拽 @deepseek-ai/dsh-api-workspace-files@0.2.1-rc.2 源码核实契约（read offset 从1起算、limit 不得超 maxLines ⇒ 旧 {offset:0,limit:5000} 必被拒；readBytes options 是 strictObject，{} 合法）并写入 docs/design/external/dsh-host.md §3.1。核心侧改：errView 未映射分支带出机器码+console.warn（不再一律'加载失败'）、Html/BytesPreview 形状错改报 previewBadPayload、iframe 外套兄弟同款 .dshpc-fb__fill 并补 min-height:0。codelint 全过、77 用例全绿，已 commit+push（0ae7771）。待用户复验 HTML 并把界面上的错误码报回来
- 2026-10-22 00:15:05 · log · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6 · 六改·HTML 根因落地（用户报 console）：buildStaticHtml 用 querySelectorAll('[xlink:href]') 删禁用属性，带命名空间冒号的属性名不是合法 CSS 选择器 ⇒ Chrome 抛 SyntaxError 被 catch 兜成'加载失败'（源码态走 read 不受影响，所以'源码能出来、渲染不出来'）。改为遍历元素逐个 removeAttribute（兄弟项目同款）。此错正是上一轮 errView 带机器码后才能一眼定位。重建 dist，77 用例全绿，commit+push 95293a4，待用户复验
- 2026-10-22 00:31:26 · log · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6 · 七改·修「点示例预览先闪一句没找到样例目录」：demo blocks.tsx 旧逻辑点一下就置 probed=true 而 samples 仍 null ⇒ 按钮文案短暂变成 samplesNotFound（用户以为是 toast），BFS 完才切回。改为 idle/probing/found/missing 四态 + 进页面即 findSamples 预探测（点按钮时已就绪），只有确认 missing 才改文案；删掉死键 samplesProbing。build:demo 重建，77 用例全绿，commit+push 0431b41，待用户复验
- 2026-10-22 00:37:50 · close · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6 · 结案：真机验收通过：① 文件/文件夹/HTML/MD 预览全部正常（根因：read 传 {offset:0,limit:5000} 违反官方 offset≥1 且 limit≤maxLines；HTML 另因 buildStaticHtml 用 [xlink:href] 非法选择器抛 SyntaxError）；② 两个选择弹窗都锚在按钮下方（下方不够翻上），「仅 JS/MD」下目录不可选、文件行有「选择」；③ 点示例预览不再闪「没找到样例目录」。核心侧一并修：errView 带出真实错误码、形状错报 previewBadPayload、iframe 补兄弟同款外壳。commit e00add4/0ae7771/95293a4/0431b41 已 push main（未 bump、未打 tag）
