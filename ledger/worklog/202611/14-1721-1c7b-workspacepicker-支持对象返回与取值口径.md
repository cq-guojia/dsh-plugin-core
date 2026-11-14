# 20261114-1721-1c7b-workspacepicker-支持对象返回与取值口径: WorkspacePicker 支持对象返回与取值口径

- **Tags**: 选择器, 工作区, 接口
- **Status**: doing · 2026-11-14 17:22:30 · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6
- **Created**: 2026-11-14 17:21:56 · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6

<!-- Header lines are maintained by the script, fixed order: Tags → Status → Created → Sealed.
     The `- **Tags**: …` line is inserted at the top by new --tags; omitted when there are no tags
     (category goes to the ledger and history only, never into this document).
     The `- **Sealed**: …` line is appended on close. -->

## Background

消费方用 `WorkspacePicker` 选工作区，但它的自有数据口径是**工作区路径**，而本组件只发 `workspaceId`：

- 消费方原话（转述）：props 里没有 `options` 也没有 `valueKey`，连「喂自己的候选」这条路都没有；
  硬换成本组件等于把数据口径从 path 反转回 UUID，这个代价不该由组件替换顺手带出来。
- 用户拍板：这是核心该改的地方，不是消费方该打补丁；并且「只返回 ID 肯定不行」——
  优先做成**返回工作区对象**（「能的话，他想用哪个就取哪个」），比加一个 view 回调更彻底。
- 用户要求：先接任务、先讨论方案，方案定了再动手。

## To Do

- 与用户敲定 API 形态（字符串口径 + 对象怎么给），未定前不改代码。
- 定了之后：改 `src/ui/inputs/WorkspacePicker.ts`、同目录导出类型、`docs/api/ui.doc.ts`、
  demo 示例、单测、`pnpm run build` / `pnpm test` / `typecheck` / `build:demo`。

## Next

先出方案给用户选（见下轮对话），落点 `src/ui/inputs/WorkspacePicker.ts:13-43`（props）
与 `:50`（`value: w.workspaceId` 唯一取值处）。

## Process

现状证据（2026-11-14 读源）：

- `src/ui/inputs/WorkspacePicker.ts:50` —— `options = items.map(w => ({ value: w.workspaceId, label: w.title }))`，
  **value 只有 id**，其余字段在映射时被丢掉。
- `src/ui/inputs/WorkspacePicker.ts:56-77` —— 直接委托 `Picker`，`value` / `onChange` 原样透传。
- `src/ui/inputs/picker-logic.ts:4-12` —— `PickerOption.value` 是 `string`，底层选择器按字符串比较 /
  去重 / 发值；所以「对象」不可能直接当 `value`，只能在字符串口径之上补。
- `src/ui/infra/host-data.ts:72-85` —— 核心其实已经握着完整对象：`HostWorkspaceItem` 有
  `workspaceId` / `title` / `path?` / `sessionIds?` / `updatedAt?`，`path` 明确注释为「路径 → 工作区匹配用」。
  ⇒ 数据不缺，只是没交出去。
- `docs/dependencies/dsh-host.md` §11 —— 官方 `workspaces` 快照每行含 `workspaceId` / `path` / `title` /
  `sessionIds` / `createdAt` / `updatedAt`，`path` 是 realpath 形态，可直接给消费方用。

## Conclusion

<!-- What got done, what got left behind -->

## Execution Log

<!-- Maintained by the script: appended by new / claim / set / release / log / close. Do not edit.
     Backfill with: progress log --id 20261114-1721-1c7b-workspacepicker-支持对象返回与取值口径 --note "...". -->
- 2026-11-14 17:21:56 · new · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6 · created and claimed
- 2026-11-14 17:22:30 · log · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6 · 接单并落实现状：WorkspacePicker.ts:50 只发 workspaceId，host-data.ts:72-85 已握有 path/title/sessionIds，Picker 只能吃 string；待与用户敲定 API 形态
