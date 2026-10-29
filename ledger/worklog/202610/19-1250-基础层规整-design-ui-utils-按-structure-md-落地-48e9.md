# 20261019-1250-基础层规整-design-ui-utils-按-structure-md-落地-48e9: 基础层规整：design/ui/utils 按 structure.md 落地（adv.* 不动）

- **Tags**: 建设, 规整, ui, 结构, 官方原语
- **Status**: done · 2026-10-19 13:56:08 · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6
- **Created**: 2026-10-19 12:50:25 · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6
- **Sealed**: 2026-10-19 13:56:08 · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6

<!-- Header lines are maintained by the script, fixed order: Tags → Status → Created → Sealed.
     The `- **Tags**: …` line is inserted at the top by new --tags; omitted when there are no tags
     (category goes to the ledger and history only, never into this document).
     The `- **Sealed**: …` line is appended on close. -->

## Background

用户 2026-10-19 定稿 `docs/design/structure.md` 后，要求：**除开两个高级定制（`adv.explorer` / `adv.session`），把 design / ui / utils 三个基础层按文档方式规整好**。这是上一个任务（`19-1132`，设计与结构定稿）之后的代码落地阶段。

已定的事实（来自 structure.md 与用户拍板）：

- `ui` = 基础能力：纯零件 + 可复用基础容器（`Modal`、侧边栏/拉栏、选工作区/选文件）。
- `adv.*` = 成品，**本任务不动**。
- 路径方法 `joinPath` / `parentOf` / `crumbsOf` / `extOf` / `mimeOf` 是**纯方法、与宿主无关** ⇒ 进 `utils`，**不加前缀**；`previewKindOf` 是业务判断，留 `adv.explorer` 内部。
- 暂缓：`utils/string`、`utils/number`、`utils/http`、`ui/feedback/Loading` —— 只标注，不新建/不扩展。

## To Do

按风险从低到高，一步一验证（`pnpm run build` + `pnpm test`）：

1. **路径归基础**：`joinPath` / `parentOf` / `crumbsOf` / `extOf` / `mimeOf` 从 `src/explorer/types.ts` 迁入 `src/utils/path.ts` 并从 `utils/index.ts` 导出；`explorer/types.ts` 只留 `previewKindOf` 与宿主契约类型，改为从 utils import。同步所有调用点。
2. **补 ui 布局基础**：新增 `SidebarLayout` / `SplitPane`（基于现有 `resizer` 的拖拽能力），API 只做「侧栏 + 内容 + 可拖拽宽度」，具体内容由使用方填。
3. **L1 adapter 收口**：`src/ui/official.ts` 的 `export *` 改**显式具名再导出**（官方新增件必须经此登记，保持「唯一入口可审计」）。
4. **P2 逐控件包官方**：Modal / Toast / Chip(Pill) / Switch / Input / FieldHint(Tooltip) / MarqueeText / Picker(Menu) / 图标 —— 一次一个，每包一个删一块自绘 CSS；Button / Segmented / Checkbox / Card 保持自绘但重砌到共享基。
5. **P1 抽象收敛**：focus ring（~11 处）、hover、transition 三连、`prefers-reduced-motion`（6 处）、语义 tint、单一下拉锚点、省略号；删孤儿 CSS。
6. **平台类型进 dist**：`primitives.d.ts` 随包发布为公开契约 + 公开 API 对平台类型 opaque。
7. **文档/样例同步**：`architecture.md` / `features.md` / `features/*.md` / `examples/integration.md` 里过时的导出与结构说明跟着改。

## Next

本任务由用户指令结案，**第 2–7 步未开始**，需另立任务承接：

- 第 2 步 `SidebarLayout` / `SplitPane`
- 第 3 步 L1 adapter 显式具名再导出
- 第 4 步逐控件包官方（Modal / Toast / Chip / Switch / Input / FieldHint / MarqueeText / Picker / 图标）
- 第 5 步 P1 抽象收敛（focus ring、hover、transition、reduced-motion、语义 tint）
- 第 6 步平台类型进 dist
- 第 7 步文档 / 样例同步

## Process

**2026-10-19 12:50** 建任务。范围与 `structure.md` 对齐；上一任务 `19-1132` 已结案（设计/结构/地基），代码改造从本任务开始。

执行流程（用户指定）：**写代码 → 专家团评审 → 不结案 → 升版 + 推 `style` tag 给用户真机测试**。

**2026-10-19 13:00** 第 1 步完成：5 个纯路径方法（`joinPath` / `parentOf` / `crumbsOf` / `extOf` / `mimeOf`）从 `src/explorer/types.ts` 迁入 `src/utils/path.ts` 并由 `utils/index.ts` 导出；`explorer/types.ts` 只留 `previewKindOf` 与宿主契约类型，调用点与 `test/explorer.test.mjs` 同步。build 干净、自检全绿，随 `7d0557b` 入库。

**2026-10-19 13:20** 控件层同名不同皮收敛（第 5 步「删孤儿 CSS」的一小块前置）：`.dsh-tdt-chip` 此前在 `controls-css.ts:124` 是 28×28 图标底板、在 `card-css.ts:41` 是胶囊标签，同页注入后互相覆盖。现独立为 `src/ui/chip-css.ts` 唯一来源（补 `focus-visible` / `disabled` / reduced-motion），图标按钮回归既有 `.dsh-tdt-iconbtn`，删除 `--label` 变体；`Modal` 关闭按钮改用 `.dsh-tdt-modal__close`（原借 `dsh-tdt-picker__trigger`，带 `min-width:120px`）；`Toast` 删掉不存在的 `remove` 事件监听。新增 `test/css-contract.test.mjs`（3 条：跨常量同名选择器即红、chip 语义边界、Modal 不借 Picker 类名）。

**2026-10-19 13:40** 发布链路接通：`publish.yml` / `demo-publish.yml` 由 `workflow_dispatch` 改为 `push tag v*` 自动发布，去掉 `--staging`；首次 404 定位为 Node 22 自带 npm 10.x 不满足 Trusted Publishing 的 npm ≥ 11.5.1，已加 `Upgrade npm` 步骤并打印版本。版本规则落为硬约束：`tag vX.Y.Z` == 核心 version == demo version，demo 由 `0.0.2` 对齐到 `0.1.2`，`test/version-sync.test.mjs` 本地校验，规则写入 `AGENTS.md`。`v0.1.2` 已发布。

## Conclusion

已完成本任务第 1 步（路径方法归 `utils`）与 ui 层「同名不同皮」收敛（chip / Modal 关闭按钮 / Toast 清理），并额外接通 tag 自动发布链路（库 + demo 同版本 `0.1.2`）。

**剩余第 2–7 步未做**，按用户 2026-10-19 指令本任务先结案，剩余内容见「下一步」，由后续任务承接。

## Execution Log

<!-- Maintained by the script: appended by new / claim / set / release / log / close. Do not edit.
     Backfill with: progress log --id <id> --note "...". -->

- 2026-10-19 13:56:05 · log · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6 · 第1步完成（路径方法归 utils）+ chip/Modal/Toast 同名不同皮收敛 + tag 自动发布接通（v0.1.2），第2-7步未做，按用户指令结案
- 2026-10-19 13:56:08 · close · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6 · sealed
