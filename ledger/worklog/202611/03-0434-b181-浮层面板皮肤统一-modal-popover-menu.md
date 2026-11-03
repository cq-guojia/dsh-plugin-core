# 20261103-0434-b181-浮层面板皮肤统一-modal-popover-menu: 浮层面板皮肤统一（modal/popover/menu）

- **Tags**: 样式, 浮层, UI
- **Status**: doing · 2026-11-03 04:48:23 · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6
- **Created**: 2026-11-03 04:34:34 · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6

<!-- Header lines are maintained by the script, fixed order: Tags → Status → Created → Sealed.
     The `- **Tags**: …` line is inserted at the top by new --tags; omitted when there are no tags
     (category goes to the ledger and history only, never into this document).
     The `- **Sealed**: …` line is appended on close. -->

## Background

用户 2026-11-03 讨论原话要点：侧边栏 ▾ 弹出来的那个框、以及选文件弹窗，都是核心里手搓的；
「整个样式还是不太统一」；问能不能直接复用核心模态弹窗的样式；并明确**不接受把视觉规格交给官方**
（不改用官方 `Menu`）、**不接受把选文件弹窗改成居中模态**；要求把皮肤抽象出来统一，给出规范做法。

已讨论定案（细节见 Process）：

1. 抽象目标 = 把「浮起来的框」拆成**定位**与**皮肤**两件事，定位留各自控件，皮肤收进 `PanelSurface`。
2. 三档：`modal`（居中模态）/ `popover`（锚定面板）/ `menu`（下拉菜单）。
3. 对消费方**零改动**：公开 props、导出符号、包 exports、旧 CSS 类名、`data-*` 钩子全部保留。

## To Do

- 第 1 步（零视觉变化）：新建 `src/ui/panel.css` / `panel-css.ts` / `panel.ts`（`PanelSurface` + `PanelClose`），
  `gen-css.mjs` 登记；`Modal`(`src/ui/Modal.ts:81-118`) 与 `SideSheet`(`src/ui/SideSheet.ts`) 先切 `tier="modal"`。
- 第 2 步（视觉统一）：`pickWorkspaceFile` 面板（`src/explorer/open.ts:376-441`）切 `popover` + `OverlayMask kind="plain"`；
  ▾ 选层（`src/explorer/FileBrowser.ts:873`）与 `Picker` 下拉（`src/ui/Picker.ts:256`）切 `menu`。
- 第 3 步（守卫）：新增测试禁止 `tokens.css` 之外出现裸色值；档位变量只允许出现在 `panel.css`。
- 文档：`docs/design/style.md` 补「浮层三档」一节（样式规范槽位）。
- 目视验收：demo 里 Modal / 文件弹窗 / ▾ 选层 / Picker 下拉四处对比。
- **不做**：不引入官方 `Menu` / `Modal`；不改任何交互（锚定、翻转、点外关闭、Esc、遮罩关闭）；不改公开 props。

## Next

- 从第 1 步动手：先建 `src/ui/panel.css`（三档变量定义）与 `src/ui/panel.ts`，把 `.dshpc-modal` 现有参数
  （`src/ui/feedback.css:3-10`：`surface-1` / `3px` / `radius-xl` / `shadow-2`）原样搬成 `--modal` 档，
  再让 `Modal.ts` 挂 `dshpc-panel dshpc-panel--modal` 并保留 `dshpc-modal` 别名。

## Process

### 一、现状：四处面板、四套皮肤（2026-11-03 实测）

| 维度 | 核心 Modal | 文件选择弹窗 | ▾ 选层 | 核心 Picker 下拉 |
|---|---|---|---|---|
| 底 | `--dshpc-surface-1` | `--dshpc-surface-2`（兜底 `#fff`） | `--dshpc-surface-menu` | `--dshpc-surface-menu` |
| 描边 | `3px` | `1px`（兜底 `#d0d7de`） | `1px` | `1px` |
| 圆角 | `--dshpc-radius-xl`(20) | `8px` 硬编码 | `--dshpc-radius-sm`(8) | `--dshpc-radius-md` |
| 阴影 | `--dshpc-shadow-2` | `--dshpc-shadow-2` | `0 4px 16px rgba(0,0,0,.18)` | `0 8px 24px rgba(15,23,42,.12)` |
| 遮罩 | `--dshpc-mask` | `rgba(0,0,0,.28)` | 透明 | — |
| 关闭钮 | `.dshpc-overlay-head__close` 20×20 | 核心 `IconButton plain md` | 无 | — |

出处：`src/ui/feedback.css:3-10`、`src/explorer/open.ts:405-417`、`src/explorer/explorer.css:58-62`、
`src/ui/picker.css:19-25`、`src/ui/overlay.css:37-44`。

### 二、为什么不能直接复用 `Modal` 组件

`Modal` 是**居中 + 遮罩 + 点遮罩关 + Esc 关**（`src/ui/overlay.ts:38` 的 `kind:'center'`），
文件选择弹窗是**贴锚点、按剩余空间上下翻转**（`open.ts:387-404`）。套组件 = 改交互，用户已明确否掉。
可复用的是**皮肤与公共件**：面板参数、`OverlayHead`、遮罩让位规则、`PanelClose`。

### 三、抽象落点（L3 新增，不动 L2 token）

| 层 | 内容 | 动作 |
|---|---|---|
| L2 `src/design/` | token | 不动（`surface-1/2/menu`、`shadow-1/2`、`radius-sm/lg/xl` 够用） |
| L3 `src/ui/panel.css` + `panel.ts` | 三档皮肤 + `PanelSurface` + `PanelClose` | 新建，皮肤唯一真源 |
| L3 `src/ui/overlay.ts` | 遮罩 / 头部公共件 | 加 `kind:'plain'`（不居中，给锚定面板用） |
| L4 各控件 | 只选档位 + 排内容 | 五处消费点改挂档位类 |

档位定义只写在一处，组件 CSS 不许再写底色/描边/圆角/阴影字面值：

```css
.dshpc-panel{background:var(--dshpc-panel-bg);border:var(--dshpc-panel-bw) solid var(--dshpc-border);
  border-radius:var(--dshpc-panel-radius);box-shadow:var(--dshpc-panel-shadow)}
.dshpc-panel--modal{--dshpc-panel-bg:var(--dshpc-surface-1);--dshpc-panel-bw:3px;
  --dshpc-panel-radius:var(--dshpc-radius-xl);--dshpc-panel-shadow:var(--dshpc-shadow-2)}
```

### 四、三档规格（统一后的取值）

| 参数 | modal | popover | menu |
|---|---|---|---|
| 底 | `surface-1` | `surface-1` | `surface-menu` |
| 描边 | `3px` | `1px` | `1px` |
| 圆角 | `radius-xl` | `radius-lg` | `radius-sm` |
| 阴影 | `shadow-2` | `shadow-2` | `shadow-1` |
| 遮罩 | `--dshpc-mask` | `--dshpc-mask` | — |

保留三档而不是压成一档：菜单用 3px 描边 + 20px 圆角会笨重，且离宿主菜单更远。
**统一的是「取哪几个 token」，不是「所有地方同一个数字」。**

### 五、z 序与遮罩

现有 token：`--dshpc-z-dock:1030` / `drawer:1040` / `modal:1070` / `menu:1100` / `tip:1200`（`src/design/tokens.css:225-230`）。
散落的字面量：picker 面板 `1100`、picker 遮罩 `1099`、▾ 菜单 `1200/1201`、Picker 下拉 `60`、toast `1090`。

定案：新增两个**别名**（不改已发布 token）——`--dshpc-z-panel: var(--dshpc-z-menu)`、
`--dshpc-z-popmenu: var(--dshpc-z-tip)`；所有浮层只允许用 token，不许写字面量。
遮罩统一走 `OverlayMask`（`--dshpc-mask` + 右边界让位分栏那行现在两边一字不差）。

### 六、兼容策略（这是「引用不改」的落地方式）

- 旧类名保留为别名：`dshpc-modal`、`dshpc-picker__menu`、`dshpc-fb__crumbs-menu`、`dshpc-sheet` 继续挂，
  皮肤搬到 `dshpc-panel*`；消费方写在旧类名上的覆盖仍然命中。
- `data-dshpc-picker-panel` / `data-dshpc-picker-backdrop` 继续保留。
- `PanelClose` 只统一**那枚按钮**，不动各自头部结构（文件弹窗的头仍是 ▾ + 面包屑 + 选择 + ✕）。

### 七、顺带发现（统一时一并修）

`src/ui/feedback.css:2` 的注释说「抄兄弟项目 `.dsh-tdt-sv-panel`（surface-base + border-l2 + radius 12 + shadow-2）」，
但下面实际是 `surface-1` + `3px` + `radius-xl`(20px) —— 注释与值不符，以代码为准并改注释。

### 八、顺带体检：其余不规范项（本次不修，只记录）

按风险排序，证据均为 2026-11-03 实测；除第 1、2 条本任务会顺带收口，其余需另开任务。

| 级别 | 问题 | 证据 |
|---|---|---|
| 高 | 测试靠 dist 字符串匹配，只能证明「代码里有这串字」，证明不了行为 | `test/*.mjs` 共 77 处 `includes(` |
| 高 | `FileBrowser` 一文件五职责（菜单构造 / 目录树 / 面包屑 / 预览头 / 落地页） | `src/explorer/FileBrowser.ts` 1082 行 |
| 高 | 同一段「根基准推导」写三遍 | `src/explorer/open.ts:40`、`:154-160`、`:445-452` |
| 中 | `tokens.css` 之外 16 处裸色值（含 4 个严重度色写死 hex、3 处阴影字面量） | `feedback.css:26,36-40`、`picker.css:24`、`explorer.css:61`、`marquee.css:15`、`session.css:14,33,38` |
| 中 | z-index 字面量 5 处（1090 / 60 / 1200 / 1201 / 8）绕开 `--dshpc-z-*` | `feedback.css:20`、`picker.css:20`、`explorer.css:57,59`、`panel-dock.css:44`、`side-panel.css:49-65` |
| 中 | token 兜底策略不统一：picker 面板全量带 `#fff`/`#d0d7de` 兜底，`session.css` 用 `rgba(128,128,128,…)`，别处无兜底 | `open.ts:409-416`、`session.css:33,38` |
| 低 | `feedback.css:2` 注释与代码值不符（见上） | 同 |
| 低 | `docs/requirements.md:250` 引用 README「还没做的事」，该节已不存在 | `README.md` 章节表 |
| 低 | `props.workspaces` 与宿主 `anchors` 双源同义，易再分叉 | `FileBrowser.ts:776` |
| 低 | Windows 盘符路径未真机验证（0.20.5 结案记录内已标注） | 上个任务 worklog 二十节 |

## Conclusion

方案定稿，代码未动（用户 2026-11-03 明确「先别改」）。落地按 To Do 三步走；
第八节列出的其他项不在本任务范围，需用户点头后另开任务。

### 九、实施记录（2026-11-03，用户改口「全部合到这个任务里开始做，不要提交」）

新增：
- `src/ui/panel.css` + `panel-css.ts` + `panel-css.generated.ts`：三档皮肤唯一真源；关闭钮
  `.dshpc-panel__close`（`.dshpc-overlay-head__close` 作别名）；`gen-css.mjs` 已登记。
- `src/ui/panel.ts`：`PanelSurface`（皮肤载体，只管表面）+ `PanelClose`（唯一关闭钮）。
- `src/explorer/crumbs-menu.ts`：▾ 菜单条目构造从 `FileBrowser.ts` 拆出（135 行），FileBrowser 1082 → 965 行。
- `test/css-discipline.test.mjs`：① 色值只许在 `tokens.css`（`token-ok` 注释可豁免）；② `--dshpc-panel-*` 只许在 `panel.css`。

改造：
- `Modal` → `PanelSurface tier="modal"`，`dshpc-modal` 降为布局别名；`feedback.css` 不再带皮肤。
- 选文件弹窗（`open.ts`）→ `OverlayMask kind="plain"` + `PanelSurface tier="popover"`；手写 backdrop、
  内联皮肤（含 `#fff`/`#d0d7de` 兜底、`rgba(0,0,0,.28)` 遮罩）全删；`data-dshpc-picker-*` 钩子保留。
- ▾ 选层（`FileBrowser`）与 `Picker` 下拉（`Picker.ts`）→ `tier="menu"`，删硬编码阴影与 `z-index:60`。
- `DateTimePicker` 弹层（`.dshpc-dt__pop`）→ `tier="menu"`（原第五套皮肤，同样带 `z-index:60` 与裸阴影）。
- 层序：`tokens.css` 加 `--dshpc-z-panel`（=z-menu）/ `--dshpc-z-popmenu`（=z-tip）两个语义别名，
  三处字面量（1099/1100/1200/1201/60）全部换掉；已发布 token 名不动。
- 裸色值：告警严重度四色收进 `tokens.css`（`--dshpc-sev-*`）；`loading.css` 去掉 `#f4f4f5/#18181b`
  与整段暗色覆盖（改走 token）；`session.css` 8 处无意义兜底删除；`field.css` 兜底删除。
  例外：`marquee.css` 的遮罩模板色 `#000` 标 `token-ok`（纯黑=完全不透明，与主题无关）。
- 删除死样式：`.dshpc-toast*`（Toast 早已走宿主 `toast()`，这些类无消费者，还带裸 z-index 与裸阴影）。
- `open.ts` 三处「根基准推导」合并为 `rootPathOf()`，dock 与 picker 共用。
- 文档：`style.md` 增「浮层三档」一节（含「组件内部微层序不走 token」的边界）；
  `requirements.md` 里指向 README 已不存在章节的死引用改成「以任务台账为准」。
- 测试适配：`css-contract`（关闭钮皮肤唯一、PANEL_CSS 入皮肤清单）、`quality`（面板式滚动容器按类名放行，
  且先断言面板确实带 1px 边框）、`side-sheet`（类名断言更新）。

校验：`tsc --noEmit` / `build` / `build:demo` / 228 测试全过 / codelint 六层全过。**未提交**（用户要求先测）。

留待（本次未做，理由写在这里）：
- `FileBrowser` 剩余 965 行的继续拆分：余下部分共用 20+ 个闭包变量，需要先做 prop 化改造，硬拆风险大。
- 渲染级测试：需引入 DOM 依赖（happy-dom / jsdom），属「装依赖」，等用户明确同意。
- `PanelDock` / `SideSheet` 未并入三档：贴边家族，2026-11-02 已拍板两者皮肤一致，不是浮层。

## Execution Log

<!-- Maintained by the script: appended by new / claim / set / release / log / close. Do not edit.
     Backfill with: progress log --id 20261103-0434-b181-浮层面板皮肤统一-modal-popover-menu --note "...". -->
- 2026-11-03 04:34:34 · new · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6 · created and claimed
- 2026-11-03 04:35:52 · log · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6 · 方案写入 worklog（三档皮肤 + L3 落点 + 三步迁移 + 兼容策略），并附体检：77 处 dist 字符串断言、FileBrowser 1082 行、open.ts 根基准写三遍、16 处裸色值、z-index 5 处字面量；未动代码
- 2026-11-03 04:48:23 · log · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6 · 按用户指令合并实施：新增 panel.css/panel.ts（三档+PanelClose）；Modal/选文件弹窗/▾选层/Picker下拉/DateTime弹层全部切档；z 语义别名；裸色值收口到 tokens（含告警四色、loading、session）；删死 toast 样式；open.ts 根基准合并；拆出 crumbs-menu.ts；新增 css-discipline 测试；228 测试与 codelint 全过；未提交
