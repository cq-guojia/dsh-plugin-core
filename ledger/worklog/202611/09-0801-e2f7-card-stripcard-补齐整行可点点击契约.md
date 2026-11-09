# 20261109-0801-e2f7-card-stripcard-补齐整行可点点击契约: Card/StripCard 补齐整行可点点击契约

- **Tags**: Card, 点击契约, 可访问性
- **Status**: done · 2026-11-09 08:32:03 · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6
- **Created**: 2026-11-09 08:01:49 · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6
- **Sealed**: 2026-11-09 08:32:03 · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6

<!-- Header lines are maintained by the script, fixed order: Tags → Status → Created → Sealed.
     The `- **Tags**: …` line is inserted at the top by new --tags; omitted when there are no tags
     (category goes to the ledger and history only, never into this document).
     The `- **Sealed**: …` line is appended on close. -->

## Background

消费方 dsh-task-dispatch-table 反馈：任务配置卡 / 执行记录卡 `hoverable:true` 后整条边到边变色并显示手形，但点在 `__body` 内距圈里没反应，只有点到 `children` 内层 div 才生效。根因：hoverable 0.35.4 / hoverScope 0.35.6 只补视觉与手势，`src/ui/display/Card.ts` 从未有点击契约，唯一的 `onClick` 是折叠箭头。消费方不能在卡片外包一层：`panel` 展开区会冒泡误触、拖选复制受影响，且拿不到键盘可达。

## To Do

以下是核心侧交付后的**移交项**，不在本任务内（核心改动已复核结案）：

- 真机验收：点 `__body` padding 圈四边、head 作用域点 panel 不触发、card 作用域触发、Tab / Enter / Space、action 与折叠箭头不连带触发。
- 消费方自行把 `task-list.tsx:1102` / `records-timeline.tsx:504` 的内层 `onClick` 换成新 prop（核心不管）。
- 用户未要求提交 / 发版：代码改动未 commit、未 bump、未打 tag。

## Next

用户在 dsh-task-dispatch-table 装新 dist 真机验收；通过后明确说「提交」再 commit+push，明确说「发版」再 bump 两包并打 tag。核心侧无待办。

## Process

- 消费方方案第 2 条「只绑 `__body`」与第 3 条「card 作用域 panel 按定义触发」互斥：`__panel` 是 `__body` 的兄弟节点（`Card.ts:186-190` 与 panel 渲染），冒泡不经过 `__body`。改为点击层随 scope 选（`Card.ts:125-128`、`182-190`）：head = `__body`、card = 根节点。
- 复用 `ListRow.ts:53-54` 的 `interactive = onClick !== undefined` / `hover = hoverable ?? interactive`；`Card.ts:125-126` 同款，避免「点得中但看着不像能点」。
- `list-row.css:28` 有键盘焦点环；Card 根节点 `overflow:hidden`（`card.css:30`）会裁掉画在 `__body` 外侧的 outline，故 `card.css` 新增 `.dshpc-card__hit:focus-visible{outline-offset:-2px}`（`table.css:34` 有内缩先例）。
- `action` 与 `onToggle` 同在 `__side`（`Card.ts:200-209`），一层 `stopPropagation` 即可；仅在 interactive 时挂，避免改变不传 prop 时的冒泡行为。
- 复核轮：`docs/help/ui.doc.ts:647-648` 原写「鼠标在展开区里操作时整卡都不触发」，与新增的 `card` 作用域点击契约冲突 ⇒ 中英同步改成「默认作用域下既不变色也不触发点击」。`git diff` 里看似多余的一个空行是 CRLF 显示，源码本来没问题，未改。
- 原自检只有静态标记断言，证明不了「点哪里会触发」：补一条直接调 `Card(props)` 拿 element tree 的行为自检（函数组件即函数，无需 DOM），逐层断言 head 时根节点/panel 无 `onClick`、card 时根节点有而 `__body` 无（防双触发）、Enter/Space 与非自身 target 判据、`__side` 真调 `stopPropagation`，并锁住「纯视觉 `hoverable:true` + `hoverScope:'card'` 不产生点击层」。

## Conclusion

`src/ui/display/Card.ts:42-49` 新增 `onClick`（`CardSharedProps`），Card / StripCard 同享；不传时 DOM 与外观零变化。复核修掉帮助文档两处绝对化表述，并把自检从静态标记补到行为层。`pnpm run build` / `pnpm test`（353 全绿）/ `pnpm run typecheck` / koc-codelint 六层全过，`dist/` 产物与帮助文档真源/投影同步。未做浏览器真机验收（本仓无 dsh 运行环境），已列为移交项。

## Execution Log

<!-- Maintained by the script: appended by new / claim / set / release / log / close. Do not edit.
     Backfill with: progress log --id 20261109-0801-e2f7-card-stripcard-补齐整行可点点击契约 --note "...". -->
- 2026-11-09 08:01:49 · new · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6 · created and claimed
- 2026-11-09 08:09:58 · log · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6 · 已交付待验收：Card.ts:42-49 新增 onClick、179-191 点击层随 hoverScope 选；pnpm build/test(352 全绿)/typecheck/codelint 全过，dist 与帮助文档已同步
- 2026-11-09 08:31:50 · log · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6 · 复核完成：修掉 ui.doc.ts 中英两处「整卡都不触发」绝对化表述；补不依赖 DOM 的行为自检（逐层 onClick/键盘判据/stopPropagation/纯视觉零点击层）；build/test(353 全绿)/typecheck/codelint 全过
- 2026-11-09 08:32:03 · close · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6 · sealed: Card/StripCard onClick 点击契约落地：head 绑 __body、card 上提根节点，hover 默认跟随可点性，__side 挡冒泡，补焦点环与帮助文档；复核修掉中英两处绝对化表述并补行为自检；build/test 353 全绿/typecheck/codelint 全过，dist 与投影已同步；真机验收与消费方迁移列为移交项
