# 20261114-1721-1c7b-workspacepicker-支持对象返回与取值口径: WorkspacePicker 支持对象返回与取值口径

- **Tags**: 选择器, 工作区, 接口
- **Status**: doing · 2026-11-14 17:30:08 · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6
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

- `docs/api/ui.doc.ts` 的 props 表还没写 `valueKey` 与 onChange 第二参（用户明确说对外页面先不改）；
  真要对外写的时候再补这一处。
- 消费方升级时按新签名改调用（用户：兼容不做，升级时让他们改）。

## Next

交用户验收：`valueKey="path"` + `onChange={(v, ws) => …}` 是目标用法；
验收看 `src/ui/inputs/WorkspacePicker.ts:36-48` 的 props 注释与 `test/workspace-picker.test.mjs`。

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

按方案 B 落地（用户 2026-11-15 拍板，明确不做兼容、对外页面先不导出）：

- `src/ui/inputs/WorkspacePicker.ts`：新增 `valueKey?: 'id' | 'path' | 'title'`（默认 `id`），
  `value` / `onChange` 第一参按该口径发字符串；`onChange` **第二参**给完整 `HostWorkspaceItem`
  （多选给数组、与第一参同序；「所有工作区」与清空给 `undefined`）。消费方想用哪个字段自己取。
- 新增 `workspaceOptionsOf(items, key)`：缺字段（宿主没给 path）或与前面撞值的行**置灰保留**，
  不静默丢、也不回落别的口径。`onChange` 的「值 → 对象」只查当前快照，查不到给 `undefined`，不编造。
- `src/ui/index.ts` 追加导出 `type WorkspaceKey`；未传 `valueKey` 的调用方行为与旧版完全一致。
- 新增 `test/workspace-picker.test.mjs`（置灰规则 + `valueKey="path"` 受控值匹配）。
- 验证：`pnpm run build` → `pnpm test`（519 全过）→ `pnpm run typecheck` → `pnpm run build:demo` →
  `codelint.py`（L0-L5 全过）。
- 未做：`docs/api/ui.doc.ts` 文档页、demo 示例（用户说不改）。

## Execution Log

<!-- Maintained by the script: appended by new / claim / set / release / log / close. Do not edit.
     Backfill with: progress log --id 20261114-1721-1c7b-workspacepicker-支持对象返回与取值口径 --note "...". -->
- 2026-11-14 17:21:56 · new · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6 · created and claimed
- 2026-11-14 17:22:30 · log · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6 · 接单并落实现状：WorkspacePicker.ts:50 只发 workspaceId，host-data.ts:72-85 已握有 path/title/sessionIds，Picker 只能吃 string；待与用户敲定 API 形态
- 2026-11-14 17:30:08 · log · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6 · 已交付待验收：WorkspacePicker 加 valueKey(id/path/title) + onChange 第二参给完整工作区对象；workspaceOptionsOf 缺字段/撞值置灰；新测 workspace-picker.test.mjs，build/test 519/typecheck/build:demo/codelint 全过；docs 与 demo 按用户要求未改
