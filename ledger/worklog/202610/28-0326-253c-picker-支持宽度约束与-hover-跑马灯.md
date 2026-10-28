# 20261028-0326-253c-picker-支持宽度约束与-hover-跑马灯：Picker 支持宽度约束与 hover 跑马灯

- **标签**：picker、宽度、跑马灯
- **状态**：doing · 2026-10-28 03:42:51 · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6
- **创建**：2026-10-28 03:26:22 · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6

<!-- 头部四行由脚本维护，顺序固定：标签 → 状态 → 创建 → 封卷。
     「- **标签**：…」按 new --tags 插在最上面，没有标签就不写（分类只进台账与历史，不进本文档）；
     「- **封卷**：…」在结案时加在最后。 -->

## 背景

用户反馈：外层给 131px div 包住 Picker，但 `.dshpc-picker` 是 `inline-block`、触发器 `max-width:100%` 参照被内容撑开的父级（自我参照）无约束力，导致 picker 溢出父 div、压到后面的执行人（后绘制在上层）；`__label` 的省略号规则因触发器不限宽永远触发不到。要求：新增 `width` / `minWidth` / `maxWidth`（落到 `__trigger` 内联宽度），定宽忽略 min/max；溢出省略号、hover 跑马灯（复用库内 MarqueeText）。另问：传 100 个选项时下拉是否已有滚动条。

## 待办

- 无（已发版 v0.6.0；真机视觉效果若需微调再开）。

## 下一步

- 用户真机验收；通过后再视情况 close（验收前保持 doing）。

## 过程

- `src/ui/picker-logic.ts`：新增纯函数 `resolveTriggerSizing`，把 `width`/`minWidth`/`maxWidth` 译成内联样式（数值按 px，字符串透传；定宽锁定三值），便于单测。
- `src/ui/Picker.ts`：触发器 `button` 加 `style: resolveTriggerSizing(props)`；标签由静态 `span` 改为 `MarqueeText`（非 hover 内层省略号、hover 跑马灯，库自带）；`PickerProps` 加三属性。
- `src/ui/picker.css`：`.dshpc-picker` 加 `max-width:100%`，封住「picker 溢出父容器压到兄弟元素」的根因（菜单经 portal 挂 body，不受此影响）。
- 100 项滚动：`.dshpc-picker__menu` 本就有 `max-height:280px;overflow:auto`，且 floating `size` 中间件把浮层 `maxHeight` 封顶 280px ⇒ 已有滚动条，无需改动（用户口径：已有滚动条就不管）。
- 验证：`pnpm run build`（gen-css 重生成 picker-css + tsc）+ `pnpm test` 全绿（123/123，含新增 resolveTriggerSizing 用例与 css 同步闸）。

## 结论

三属性 + hover 跑马灯已实现并通过构建与自检；picker 根溢出根因已用 `max-width:100%` 堵住。100 项下拉滚动为既有能力，未动。帮助文档 ui.doc.ts（Picker API 表 + 说明）已同步。已发版 v0.6.0（核心与 demo 同号，tag 已推，触发 npm publish）。库内无渲染测试，真机视觉效果若需微调再开。

## 执行记录

<!-- 本节由脚本维护：new / claim / set / release / log / close 自动追加，请勿手改。
     补记用 progress log --id <任务号> --note "一句话"。 -->
- 2026-10-28 03:26:22 · new · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6 · 创建任务并认领
- 2026-10-28 03:31:28 · log · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6 · 实现 width/minWidth/maxWidth（resolveTriggerSizing）+ 标签改用 MarqueeText（省略号+hover 跑马灯）；.dshpc-picker 加 max-width:100% 堵溢出根因；100 项下拉滚动为既有能力未动。build + test 123/123 通过，待用户真机验收。
- 2026-10-28 03:42:51 · log · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6 · 已发版 v0.6.0：核心与 demo 同号，commit 71ea053，tag v0.6.0 已推（触发 npm publish）。文档 ui.doc.ts 已同步，dist 与 demo dist 入库，test 123/123。
