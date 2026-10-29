# 20261018-0425-ui-选择器-picker-通用选择器-modelpicker-双形态-b6cd: ui 选择器：Picker 通用选择器 + ModelPicker 双形态

- **Tags**: 建设, ui, 选择器, 模型
- **Status**: done · 2026-10-18 06:02:14 · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6
- **Created**: 2026-10-18 04:25:16 · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6
- **Sealed**: 2026-10-18 06:02:14 · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6

<!-- Header lines are maintained by the script, fixed order: Tags → Status → Created → Sealed.
     The `- **Tags**: …` line is inserted at the top by new --tags; omitted when there are no tags
     (category goes to the ledger and history only, never into this document).
     The `- **Sealed**: …` line is appended on close. -->

## Background

需求文档 §2.2 + §6：ui 要有 `Picker`（通用选择器）和 `ModelPicker`（模型选择，两种形态）。
用户明确：**很多插件都要选大模型，这就是通用需求，要抽**；且形态要两种都支持
（有的地方先选厂商再选模型，有的地方一个下拉搞定），切换参数要用**有意义的名字**，不许 `style1` / 数字。

## To Do

无。

## Next

`explorer` 子包：ExplorerPanel（工作区浏览 + 预览）+ WorkspacePicker + FilePicker。

## Process

**Picker**：单选 / 多选 / 上限 / 搜索 / 分组 / 空态 / 降级，自绘（不依赖官方 Menu）。
**纯零件不取数** —— 选项由调用方传（工作区 / 模型列表要跨 host↔client 边界，通道是插件私有的）。

**ModelPicker**：`variant: 'cascade' | 'flat'`。
关键设计：**两种形态吃同一份分组数据**（`groups: [{value,label,options}]`），只是渲染方式不同
⇒ 调用方不用为两种形态准备两套数据。`cascade` 用 `groupOf(groups, value)` 反推当前供应商。

**纯逻辑抽到 `picker-logic.ts`**（`toGroups` / `flattenOptions` / `filterGroups` / `toggleValue` /
`labelsOf` / `groupOf`）—— 与 React 解耦，能单测；组件只管渲染。

**多语言**：扩展了 utils 的内置字典（`pickerEmpty` / `pickerSelected` / `modelProvider` … 中英），
ui 复用 utils 那套 `setLocale` —— 保持**单一 locale 状态**，不另起一套。

**⚠ 本任务最重要的决定：把 ui 对官方 primitives 的依赖去掉。**

写测试时发现 `import('./dist/ui/index.js')` 直接 `ERR_MODULE_NOT_FOUND: '@deepseek-ai/dsh-client-ui-primitives'`
—— 官方包只在内核里由模块表解析，**Node / 任何非内核环境都解析不到**，一个控件依赖它就**连累整个 ui 入口**。
处理：

- `BackToTop` 的官方 `IconChevronUpOutlineRegular` ⇒ 改自绘箭头 `↑`。
- `SelectField`（依赖官方 `Menu`）⇒ **删掉**，它的活由自绘的 `Picker` 接。

收益：`dsh-plugin-core/ui` 现在**零必需依赖**（react 仍是 optional peer），任何环境都能 import。

**踩坑**：第一次删 `SelectField` 时按「从某行到文件末尾」切，把排在它前面的
`EditorOption` / `FIELD_ANCHOR_STYLE` / `FIELD_LABEL_STYLE` / `fieldMetricsOf` **一起删掉了**。
用 `git show HEAD:src/ui/Field.ts` 恢复后，改成**先定位 `export interface SelectFieldProps` 再往上滚到注释块开头**精确裁剪。

**测试**：为跑通组件导入，装了 `react@18` 作 devDependency（peer 仍标 optional）。

## Conclusion

`Picker` + `ModelPicker` 可用，5 条逻辑自检 + 之前 16 条全过（共 21 条），
`dist/ui/index.js` 直接 import 成功（31 个导出），零官方依赖。

留坑：
- 菜单是**自绘**的（没用官方 Menu），外观与官方菜单不完全一致；`portal 到 body` 这类行为没有，
  在弹窗内部滚动时可能被裁切 —— 真碰到再处理。
- 仍**未在浏览器渲染验证**（同前几个任务）。
- `src/types/primitives.d.ts` 现在没有使用者了（留着给后续 explorer/session 用，若最终用不上要删）。

## Execution Log

<!-- Maintained by the script: appended by new / claim / set / release / log / close. Do not edit.
     Backfill with: progress log --id <id> --note "...". -->
