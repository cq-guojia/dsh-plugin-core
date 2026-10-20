# 20261020-1100-弹窗-modal-confirm-控件样式与分类调研-demo-反馈页-0a8c：弹窗（Modal/Confirm）控件样式与分类调研——demo 反馈页

> **创建**：2026-10-20 11:00:31（@GuoJia-Agent）
> **分类**：界面 ｜ **标签**：弹窗、Modal、调研、demo、样式

<!-- 「> **分类**：… ｜ **标签**：…」行由脚本按 new --category / --tags 插入；两者皆空则不写。 -->

## 背景

用户要做 demo「反馈」页控件样式调整，先从弹窗入手。兄弟项目 dsh-task-dispatch-table 有两个确认弹窗视觉不一致（"删除任务" 360px 窄卡 / "放弃未保存的更改?" 380px 浅底卡），第三种是"会话记录"大内容弹窗。需要调研：

1. 宿主/官方是否提供弹窗？提供了哪些？
2. 这两个弹窗是不是官方样式？能直接用官方吗？
3. 本仓弹窗分类应该怎么定——参照开源大型项目的归类。

## 待办

- [x] 调研兄弟项目弹窗实现（几套、各用什么）
- [x] 调研官方 primitives 提供的浮层组件清单
- [x] 调研开源大项目（Ant Design / Radix / shadcn / MUI / Carbon）对弹窗的归类
- [ ] 用户基于调研结果拍板分类与开发方案（下一步）
- [ ] 拍板后：设计并实现弹窗控件族，demo 反馈页接入

## 下一步

等用户对「结论 §三 分类建议」拍板：
1. core 弹窗分几类（建议：Modal 容器 + ConfirmDialog 确认层 + Toast）；
2. ConfirmDialog 基于自绘 Modal 还是官方 Modal（涉及 open 受控口径与 pickOfficial 兜底取舍）；
3. 是否提供命令式 `confirm()` 便捷 API（兄弟项目 4 处全是声明式散装，无先例）。

## 过程

### 一、官方（宿主）提供了什么

官方包本体不在任何 node_modules（平台模块，宿主运行时解析）；最权威证据是钉版本的 ambient 声明 `src/types/primitives.d.ts`（兄弟项目同文 `src/client/primitives.d.ts`，复述自 0.1.7-rc.2 / 0.2.0-rc.x）：

- **Modal**（primitives.d.ts:86-101）：`{ open, onClose, title, description?, children?, footer?, className?, contentClassName?, shortcutModal?, onKeyDownCapture?, backdropBlur? } & { headless, closeLabel }`。body portal + 遮罩/blur + 标准头部/正文/footer；Escape 与点遮罩触发 onClose。
- **Toast**（:272-282）：顶部横幅 body 传送门，tone 仅 'success'，actions/holdMs。
- 其他浮层：**Tooltip**（:252-263）、**Menu**（:228-249）、`useAnchoredPosition`（:285）、`useDismissOnOutsidePointer`（:296）。
- **没有**：AlertDialog / Dialog / Popover / Sheet / Drawer；Modal 无 danger/tone/severity 变体；无命令式 `alert()` / `confirm()`。官方内部有 "RiskConfirmation" 形态惯例（outline 取消 + primary 确认），但未导出为组件（兄弟项目 session-view.ts:1445 注释提及）。

结论：**宿主只给一个通用 Modal 容器，确认框语义层完全没给**。

### 二、兄弟项目那两个弹窗是什么

都不是官方样式，是**两套独立手写的自绘实现**，视觉不一致正是没有统一控件的漂移后果：

| | 删除任务 | 放弃未保存的更改? |
|---|---|---|
| 实现 | `task-list.tsx:1066-1087`（renderConfirm），样式常量 :452-459 | `task-editor.tsx:940-964`（ConfirmDiscard），调用点 :2459-2465 |
| 定位 | fixed 全屏 overlay，z=--tdt-z-modal | absolute 挂编辑抽屉面板内（z=10；官方 Modal className 抬不到分栏层，注释 :936-939） |
| 宽度 | 360px | min(380px,100%) |
| 背景/圆角 | surface-base / radius-md | surface-2(#2a2e33) / radius-panel(10px) + shadow-2 |
| 标题 | font-lg / 600 | font-xl / 500 |
| 按钮 | 取消=outline、删除=danger 实心红（自家 Button :18 有 danger 档） | 继续编辑=outline、放弃更改=primary |

兄弟项目全貌：**4 套互不复用的自绘确认框** + 1 个官方 Modal 组合：

1. `renderConfirm` 删除确认（task-list.tsx:1066-1087，inline style，fixed）
2. `renderRunConfirm` 立即执行确认（task-list.tsx:1089-1106，同 1 的样式）
3. `ConfirmDiscard` 放弃更改（task-editor.tsx:940-964，absolute，第二套样式）
4. `VersionConfirm` 版本恢复（task-editor.tsx:967-1029，第三套：400px、bullets 圆点清单、三按钮 middleLabel、warning 橙标题、勾选确认）
5. 会话记录大弹窗（session-view.ts:1372-1374，archive-session-css.ts:21/42，1120px 面板）内部嵌的"开分支确认"反而是官方 Modal（session-view.ts:1447-1458：title/description/footer[outline,primary]/className）
6. 无统一 confirm API（全 client 目录 grep 无命令式封装）

### 三、开源大项目怎么归类弹窗

| 库 | 弹窗类组件 | 分类逻辑 |
|---|---|---|
| Ant Design | Modal（内容型）+ Modal.confirm/info/success/warning/error（静态方法确认型）+ Popconfirm（气泡轻确认）+ Drawer + Alert/message（非模态反馈条） | 按交互重量分：模态打断 vs 气泡内联 vs 非模态；确认型再按 severity 分档 |
| Radix / shadcn | Dialog（无头容器）+ **AlertDialog**（确认专用：含 Cancel/Action 语义、强制交互不可点遮罩关）+ Sheet（侧滑）+ Drawer + Toast/Sonner | 容器与语义分层：Dialog 管形态，AlertDialog 管确认语义 |
| MUI | Dialog + DialogTitle/DialogContent/DialogActions 槽位 + Snackbar + Alert | 容器自由组装，按钮区独立槽位 |
| Carbon (IBM) | Modal + danger 变体（主按钮红） | 一个 Modal，danger 语义做在主按钮档位上 |
| Fluent | ContentDialog（commands 槽） | 单容器多槽位 |

共同规律（各家一致）：

1. **容器只有一个**（Modal/Dialog），确认框不另起炉灶，而是容器上的一个**语义层**（AlertDialog / Modal.confirm / danger 变体）；
2. 分类轴 = 交互重量：**模态弹窗 vs 非模态反馈（Toast/Alert 条）vs 内联气泡（Popconfirm）**；
3. 确认型的要素：title + description + 右下按钮组（1~3 个）+ severity（默认确认 / 危险红 / 警告黄）；
4. 大内容弹窗 = 容器 + 自由 children，槽位（标题、关闭钮、footer）留给消费方。

## 结论

1. **宿主只提供通用 Modal**（title/description/footer/headless 槽位，open 受控）；无确认框变体、无 danger、无命令式 API。另提供 Toast（仅 success tone）。
2. **用户截图的两个确认弹窗都不是官方样式**——是兄弟项目两套独立自绘（渲染方式都不同：一个 fixed 全屏、一个 absolute 挂抽屉内），样式漂移没有官方原因，纯粹是没统一控件。所以"直接用官方现成的确认框"**不存在**，需要本仓自己做 ConfirmDialog。
3. 分类建议（对齐开源共识 + 本仓现状）：
   - **Modal**（容器，已有 src/ui/Modal.ts）：槽位 = 标题（可两级）/关闭按钮/footer 按钮区/自由内容；消费方定尺寸。用于"会话记录"这类大内容弹窗。
   - **ConfirmDialog**（新增，基于 Modal）：title + description + 右下按钮组；变体 = 确认（primary）/ 危险（danger）/ 警告（warning）；按钮 1~3 个可配，可选中性档。覆盖兄弟项目全部 5 个确认场景。
   - **Toast**（已有）：非模态反馈，不属弹窗但同页配套。
   - Popconfirm（气泡轻确认）本轮不做，等有真实场景再加。
4. 决策点留给用户：① ConfirmDialog 底座用自绘 Modal 还是官方 Modal（口径不同：open 受控 vs 条件渲染；官方在宿主内恒在，按既有拍板"不写降级兜底"，用官方则直连）；② 是否提供命令式 `confirm()` API；③ danger 档按钮本仓 Button 需确认已有（src/ui/controls/button.css 似有）。

### 四、本次在 demo 反馈页加了"原生弹窗（宿主）"演示

用户要亲眼看看宿主原生弹窗长什么样、是否可定制。改动：

- `packages/demo/src/sections/controls.tsx` FeedbackPage：新增一个 `Demo` 块，按钮"打开宿主原生弹窗"→ 用 `Official.Modal`（`open` 受控 + `closeLabel` + `description` + `contentClassName`、`children` 里塞 core 的 Input/Checkbox、`footer` 放 取消/删除(danger)/确认 三按钮）。
- `src/ui/feedback.css`：补 `.dshpc-native-demo-content{max-width:520px}`，经 `contentClassName` 注入证明宿主内容区尺寸可经类名自定义。
- **踩到硬约束**：最初把 `Official` 经 `src/ui/index.ts` 透出，结果 `ui` 入口重新依赖平台模块，4 个 Node 单测 `import dist/ui` 全挂（`ERR_MODULE_NOT_FOUND`，根因 `official.js` 顶层静态 import 平台模块）。依据 `docs/examples/integration.md:99` + `docs/design/external/dsh-host.md:23-31`「本包 ui 已零官方依赖，官方件在插件侧自己处理」——**撤销 index 透出**，改为 demo 直接从官方适配层 `dist/ui/official.js` 取 `Official`（全仓唯一 import 点仍是 official.ts，审计口径不变）。改完 `pnpm test` 49 项全绿、`koc-codelint` 全过。

### 六、弹窗控件族需求（用户 2026-10-20 口述）与专家团讨论稿

需求：demo 反馈页补齐原生弹窗示例（alert / 确定框 / 自定义）；自绘弹窗至少两种形态——

- **形态 A（小型确认框）**：无 ✕；头部三块 = 左 icon + 主标题 + 标题右侧小标签/数字；标题可不传（整条头部消失，直接出说明文字）；底部按钮区。
- **形态 B（大弹窗）**：头部右侧动作区（关闭钮甚至更多按钮）；左侧标题可多排自定义；底部 Footer 可选（不要 Footer 时中间区直接写）；中间滚动。
- **封装要求**：alert、confirm 一行调用；按钮默认样式预置，改文字传文字、改主色传色；**样式封闭**——不接受自定义样式，只开放语义档。

现状盘点（证据）：

- Button 已有 10 个语义档（primary/secondary/outline/ghost/danger/success/warning/info/danger-outline/link）+ size 三档 + icon/iconRight/color/loading（`src/ui/Button.ts:26-39,44-70`）→ 封装层直接用，无需新皮肤。
- 现有 Modal 缺：头部 icon 位、标题右侧 extra 位、头部动作区、size 档；`onClose` 双重职责（既是回调又是 ✕ 开关，`src/ui/Modal.ts:57-75`）需拆出 `closable`。footer/hideHeader/closeOnMask/escClose/maxWidth 已有。
- 官方 Modal 头部只有 title+closeLabel，做不到上述头部需求 → **底座走自绘扩展**（与"Card 官方无原件故自绘"同一逻辑，不违反"不写降级兜底"——官方缺该能力，非降级）。

讨论稿（两视角结论收敛后）：

- **容器 Modal 扩展**：头部四槽 `icon` / `title`(ReactNode，可多排) / `headerExtra`(ReactNode，标签/数字) / `headerActions`(ReactNode，动作区)；新增 `closable?`（默认=onClose 是否传入）；新增 size 档 `sm`(≈400px)/默认；其余沿用。
- **AlertModal**：severity(info/success/warning/error→图标+色) + title? + message + confirmText(默认 i18n「知道了」)；单按钮固定 primary；默认无 ✕。
- **ConfirmModal**：title? + message + tone('primary'|'danger'|'warning'→确认钮档位) + confirmText/cancelText(默认 i18n) + onConfirm/onCancel；双按钮固定布局（三按钮场景直接用底层 Modal，属容器职责）；不接受自定义样式 props（样式封闭，只开放 文字/主色/档位）。
- **样式封闭实现**：封装层不透传 className/style 给按钮，只透传 variant/color/文字。
- **demo 反馈页示例矩阵**：原生区（官方 Modal 基础 + 官方当 alert 用）+ 自绘区（Alert ×4 severity、Confirm 默认/danger/改文案、无标题纯文字、大弹窗多排标题+actions+footer+滚动）。

待用户拍板：① 底座自绘扩展（推荐）；② 命令式 alert()/confirm() 本轮不做（声明式够用）；③ ConfirmModal 默认允许点遮罩关（=取消）；④ headerExtra 用 ReactNode slot（demo 用 Chip 演示）。

### 五、宿主原生弹窗可定制性结论（答用户问）

以钉版本 ambient 声明 `src/types/primitives.d.ts:85-101` 为准（真机以装进宿主后所见为准）：

- **自定义内容**：`children?: ReactNode` —— 正文区可塞任意自定义节点（演示里放了 Input + Checkbox），支持。
- **自定义按钮**：`footer?: ReactNode` —— 任意按钮组合，多个/危险档/主按钮都行（演示放了 3 个），支持。
- **改大小**：`className`（外层容器）+ `contentClassName`（内容区）两个样式钩子 → 经这两个 class 用 CSS 改尺寸/外观（演示用 contentClassName 注入 max-width:520px）。宿主内容区默认宽度不在声明里，**默认尺寸以真机为准**。
- **去官方头部自绘**：`headless: true`（此时 `closeLabel` 不适用）可完全自绘头部与关闭钮。
- 头部：官方提供 `title` + `description` 标准头部；暗/亮由宿主 token 决定。

## 执行记录

<!-- 本节由脚本维护：new / claim / set / close / log 自动追加，请勿手改。
     要补一条就跑 progress.py log --id <任务号> --note "做了什么"。 -->

- 2026-10-20 11:07:52 · log · @GuoJia-Agent · 调研完成：官方仅有通用 Modal 无确认变体；兄弟项目两弹窗均为自绘且互不统一（task-list.tsx:1066 / task-editor.tsx:940）；开源共识=容器+确认语义层；结论与分类建议已写入 worklog，待用户拍板
- 2026-10-20 11:20:10 · log · @GuoJia-Agent · 反馈页加『原生弹窗（宿主）』演示：Official.Modal 展示自定义内容与三按钮 footer（controls.tsx:744+）；踩硬约束 ui 零官方依赖，撤销 index 透出改从 official.js 取，49 测试+lint 全过；可定制性结论已写入 worklog 五节
- 2026-10-20 11:41:49 · log · @GuoJia-Agent · 收用户弹窗控件族需求，出专家团讨论稿：Modal 头部四槽(icon/title/extra/actions)+closable 拆分+size 档；AlertModal/ConfirmModal 语义封装样式封闭；底座自绘（官方头部做不到）；讨论稿入 worklog 六节，4 个决策点待拍板
