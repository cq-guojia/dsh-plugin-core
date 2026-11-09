# 20261109-0801-e2f7-card-stripcard-补齐整行可点点击契约: Card/StripCard 补齐整行可点点击契约

- **Tags**: Card, 点击契约, 可访问性
- **Status**: doing · 2026-11-09 08:09:58 · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6
- **Created**: 2026-11-09 08:01:49 · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6

<!-- Header lines are maintained by the script, fixed order: Tags → Status → Created → Sealed.
     The `- **Tags**: …` line is inserted at the top by new --tags; omitted when there are no tags
     (category goes to the ledger and history only, never into this document).
     The `- **Sealed**: …` line is appended on close. -->

## Background

消费方 dsh-task-dispatch-table 反馈：任务配置卡 / 执行记录卡 `hoverable:true` 后整条边到边变色并显示手形，但点在 `__body` 内距圈里没反应，只有点到 `children` 内层 div 才生效。根因：hoverable 0.35.4 / hoverScope 0.35.6 只补视觉与手势，`src/ui/display/Card.ts` 从未有点击契约，唯一的 `onClick` 是折叠箭头。消费方不能在卡片外包一层：`panel` 展开区会冒泡误触、拖选复制受影响，且拿不到键盘可达。

## To Do

- 真机验收：点 `__body` padding 圈四边、head 作用域点 panel 不触发、card 作用域触发、Tab / Enter / Space、action 与折叠箭头不连带触发。
- 消费方自行把 `task-list.tsx:1102` / `records-timeline.tsx:504` 的内层 `onClick` 换成新 prop（核心不管）。
- 用户未要求提交 / 发版：未 commit、未 bump、未打 tag。

## Next

等用户在 dsh-task-dispatch-table 真机验收 `src/ui/display/Card.ts:179-191` 的点击层；通过后由用户明确说「提交」再 commit+push，明确说「发版」再 bump 两包并打 tag。

## Process

- 消费方方案第 2 条「只绑 `__body`」与第 3 条「card 作用域 panel 按定义触发」互斥：`__panel` 是 `__body` 的兄弟节点（`Card.ts:186-190` 与 panel 渲染），冒泡不经过 `__body`。改为点击层随 scope 选（`Card.ts:125-128`、`182-190`）：head = `__body`、card = 根节点。
- 复用 `ListRow.ts:53-54` 的 `interactive = onClick !== undefined` / `hover = hoverable ?? interactive`；`Card.ts:125-126` 同款，避免「点得中但看着不像能点」。
- `list-row.css:28` 有键盘焦点环；Card 根节点 `overflow:hidden`（`card.css:30`）会裁掉画在 `__body` 外侧的 outline，故 `card.css` 新增 `.dshpc-card__hit:focus-visible{outline-offset:-2px}`（`table.css:34` 有内缩先例）。
- `action` 与 `onToggle` 同在 `__side`（`Card.ts:200-209`），一层 `stopPropagation` 即可；仅在 interactive 时挂，避免改变不传 prop 时的冒泡行为。

## Conclusion

`src/ui/display/Card.ts:42-49` 新增 `onClick`（`CardSharedProps`），Card / StripCard 同享；不传时 DOM 与外观零变化。`pnpm run build` / `pnpm test`（352 全绿）/ `pnpm run typecheck` / koc-codelint 六层全过，`dist/` 产物已生成，帮助文档真源与投影已同步。未做浏览器真机验收（本仓无 dsh 运行环境）。

## Execution Log

<!-- Maintained by the script: appended by new / claim / set / release / log / close. Do not edit.
     Backfill with: progress log --id 20261109-0801-e2f7-card-stripcard-补齐整行可点点击契约 --note "...". -->
- 2026-11-09 08:01:49 · new · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6 · created and claimed
- 2026-11-09 08:09:58 · log · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6 · 已交付待验收：Card.ts:42-49 新增 onClick、179-191 点击层随 hoverScope 选；pnpm build/test(352 全绿)/typecheck/codelint 全过，dist 与帮助文档已同步
