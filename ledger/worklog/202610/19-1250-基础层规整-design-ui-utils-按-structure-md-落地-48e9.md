# 20261019-1250-基础层规整-design-ui-utils-按-structure-md-落地-48e9：基础层规整：design/ui/utils 按 structure.md 落地（adv.* 不动）

> **创建**：2026-10-19 12:50:25（@GuoJia-Agent）
> **分类**：建设 ｜ **标签**：规整、ui、结构、官方原语

## 背景

用户 2026-10-19 定稿 `docs/design/structure.md` 后，要求：**除开两个高级定制（`adv.explorer` / `adv.session`），把 design / ui / utils 三个基础层按文档方式规整好**。这是上一个任务（`19-1132`，设计与结构定稿）之后的代码落地阶段。

已定的事实（来自 structure.md 与用户拍板）：

- `ui` = 基础能力：纯零件 + 可复用基础容器（`Modal`、侧边栏/拉栏、选工作区/选文件）。
- `adv.*` = 成品，**本任务不动**。
- 路径方法 `joinPath` / `parentOf` / `crumbsOf` / `extOf` / `mimeOf` 是**纯方法、与宿主无关** ⇒ 进 `utils`，**不加前缀**；`previewKindOf` 是业务判断，留 `adv.explorer` 内部。
- 暂缓：`utils/string`、`utils/number`、`utils/http`、`ui/feedback/Loading` —— 只标注，不新建/不扩展。

## 待办

按风险从低到高，一步一验证（`pnpm run build` + `pnpm test`）：

1. **路径归基础**：`joinPath` / `parentOf` / `crumbsOf` / `extOf` / `mimeOf` 从 `src/explorer/types.ts` 迁入 `src/utils/path.ts` 并从 `utils/index.ts` 导出；`explorer/types.ts` 只留 `previewKindOf` 与宿主契约类型，改为从 utils import。同步所有调用点。
2. **补 ui 布局基础**：新增 `SidebarLayout` / `SplitPane`（基于现有 `resizer` 的拖拽能力），API 只做「侧栏 + 内容 + 可拖拽宽度」，具体内容由使用方填。
3. **L1 adapter 收口**：`src/ui/official.ts` 的 `export *` 改**显式具名再导出**（官方新增件必须经此登记，保持「唯一入口可审计」）。
4. **P2 逐控件包官方**：Modal / Toast / Chip(Pill) / Switch / Input / FieldHint(Tooltip) / MarqueeText / Picker(Menu) / 图标 —— 一次一个，每包一个删一块自绘 CSS；Button / Segmented / Checkbox / Card 保持自绘但重砌到共享基。
5. **P1 抽象收敛**：focus ring（~11 处）、hover、transition 三连、`prefers-reduced-motion`（6 处）、语义 tint、单一下拉锚点、省略号；删孤儿 CSS。
6. **平台类型进 dist**：`primitives.d.ts` 随包发布为公开契约 + 公开 API 对平台类型 opaque。
7. **文档/样例同步**：`architecture.md` / `features.md` / `features/*.md` / `examples/integration.md` 里过时的导出与结构说明跟着改。

## 下一步

从第 1 步起手：读 `src/explorer/types.ts` 与所有调用点，把 5 个纯路径方法迁到 `src/utils/path.ts`，跑 build + test。

## 过程

**2026-10-19 12:50** 建任务。范围与 `structure.md` 对齐；上一任务 `19-1132` 已结案（设计/结构/地基），代码改造从本任务开始。

执行流程（用户指定）：**写代码 → 专家团评审 → 不结案 → 升版 + 推 `style` tag 给用户真机测试**。

## 结论

<!-- 收尾时填 -->
