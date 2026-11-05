# 20261105-1440-2653-picker-与-datetimepicker-四项增强: Picker 与 DateTimePicker 四项增强

- **Tags**: Picker, DateTimePicker, 搜索, 分页, 预设档
- **Status**: doing · 2026-11-05 16:46:48 · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6
- **Created**: 2026-11-05 14:40:50 · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6

<!-- Header lines are maintained by the script, fixed order: Tags → Status → Created → Sealed.
     The `- **Tags**: …` line is inserted at the top by new --tags; omitted when there are no tags
     (category goes to the ledger and history only, never into this document).
     The `- **Sealed**: …` line is appended on close. -->

## Background

消费方 2026-11-05 提四项需求（Picker 分页 / Picker 隐藏搜索词 / DateTimePicker 预设档 / 触发器总宽），用户拍板「合理，建个任务做」。四轮方案讨论后定稿如下，均经用户逐条确认：

1. **Picker `limit?`**：按**选项条数**跨组切片，首屏 limit 条，底部「显示更多」每次再追加 limit 条；搜索结果同样分页；不传则全量（现状不变）。`limit <= 0` 视为不分页。
2. **Picker `keywords?`**：`PickerOption` 加可选字符串 `keywords`，只参与搜索不渲染；匹配为 `` `${label} ${keywords ?? ''}`.toLowerCase().includes(q) ``。
3. **DateTimePicker `presets`**：快捷按钮放**弹层内日历右侧那一列**（不进触发器，否则总宽被三块切分）；点按钮**立刻 emit + 面板不关**（对齐 MUI X `changeImportance: 'set'`）；选中态 = 当前起止日期与每项算出的起止日期逐一比对，撞上高亮、都不撞上整排不高亮，**不显示「自定义」字样**；「清空」不内置，沿用弹层底部现有「清除」按钮，消费方可在列表里自带一项。仅 range 生效，单值模式静默忽略。
4. **相对档写法**：借 Grafana / Elasticsearch date math 语法 `now/d`、`now-1d/d`、`now/w`、`now-1w/w`、`now/M`、`now-1M/M`（`M` 月 `m` 分）。**短词只作为预设项的「怎么算」配方，不进 `value`** —— 对齐 Ant Design `presets[].value` 与 MUI X `getValue()`：`value` 永远是死日期（`DateTimeOutput` 不变），零歧义、现有调用点零改动。用户明确不要「按长词短词判断」。
5. **DateTimePicker `width?`**：触发器内联样式覆盖，数字 px / 字符串原样；不按 precision 换算、不改 `WIDTH_CLASS`；两日期区继续 `flex:1 1 0` 平分，图标/隔条/留白为固定开销先扣掉；过窄省略靠现有 CSS。

用户第 4 条原话「靠上哪个选项就是哪个选项选中，一个都没靠上就是都没选」，取代消费方原需求里「落到自定义、该档仅在自定义时出现」。用户第 5 条「传 week-1 当主、与起止互斥」，按成熟库做法落为「配方在预设项里、值恒为死日期」。

外部事实（已核，实现时按槽位表落 `docs/design/external/`）：Grafana `Use dashboards` 相对时间语法与 `TimeRange{from,to,raw}` / `RawTimeRange{from: DateTime|string}`；Elastic `Date math expressions`；Ant Design DatePicker `presets` / RangePicker API；MUI X `Shortcuts`（`getValue` / `changeImportance` / `onChange` 的 `context.shortcut`）；W3C：ISO 8601 无 "now" 表示。

## To Do

- 真机（DSH 宿主）观感未验：弹层右列撑宽、暗色配色、200px 宽下省略表现；`limit=10` 的「显示更多」点击效果需真机点一次。
- 外部事实（Grafana / Elastic / AntD / MUI 官方文档）是否单独落 `docs/design/external/` 待用户定，本轮随 `ui.doc.ts` 的中英说明引用。
- 未提交、未打 tag（用户未说提交 / 发版）。

## Next

宿主里更新 demo 插件后真机点一次：`limit=10` 的「显示更多」、贴 `uuid-0007` 搜到任务 8、预设列选「上周」立即生效且面板不关、手改起止后高亮消失、`width: 320` 的触发器宽度。真机过了再请用户验收结案。

## Process

只读调研结论（2026-11-05）：`filterGroups` 只按 label 匹配且无分页（`picker-logic.ts:35-45`、`Picker.ts:173-174,300-343`）；菜单滚动容器 `.dshpc-picker__menu` 已有 max-height/overflow（`picker.css:20-24`），「显示更多」用 sticky 底栏可避免新增滚动容器、不必改 `test/quality.test.mjs` 白名单；键盘游标基于 `flattenOptions(shown)`，切片必须发生在它之前否则方向键走到不可见项。
DateTimePicker 默认宽是 6 个 CSS 类按精度写死（`datetime.css:39-44` + `DateTimePicker.ts:119-126,465`），内联样式优先级更高，可直接覆盖；`.dshpc-dt__pair-date` / `--trigger-label` 已带省略（`datetime.css:17,24`）；range 两日期区严格平分（`datetime.css:23-24`），日历图标是整条末尾独立元素（`DateTimePicker.ts:456,484`），不算进任一框 —— 用户提醒的「I 卡 = icon」已核。
底部「清除」= `emit(null); setOpen(false)`（`DateTimePicker.ts:322-325,695`），即立刻生效，与预设按钮行为一致。
周一起排是项目既定（`datetime-logic.ts:29-30,204`）；`floorToPrecision` / `ceilToPrecision`（`datetime-logic.ts:168,186`）供预设展开后端点补全复用；`commit()` 已按此产出（`DateTimePicker.ts:312-313`）。

实现与验证（2026-11-05）：`sliceGroups` / `resolvePresetExpr` 都落在纯逻辑层并补了单测；`pickerMore` 进中英字典（无死 key）；`presets` 的非法 expr 静默跳过不渲染；`expr: null` 的清空项不参与选中态（它是动作不是范围）。
坑 1：`.mjs` 单测里写 TS 类型注解会直接 SyntaxError，已去掉。
坑 2：`floorToPrecision(..., 'second')` 把起端毫秒归零（`datetime-logic.ts:168`），滚动窗口断言按项目既有 floor 口径写 `.000` 而非 `.123`。
验证：`pnpm run build` 干净；`pnpm test` 304 项全绿（含 pretest 的 gen-css/gen-docs --check、根 tsc、demo tsc）；`pnpm run build:demo` 出 dist；`pnpm run typecheck` 双 tsconfig 干净；`koc-codelint` 22 文件六层全过。
本仓另有他人未提交改动：`src/adv/session/{index,official-classes}.ts` 与未跟踪 `tools/host-upgrade-diff/`，本次 build 连带把其编译结果写进 `dist/adv/session/`；源码不是本次改的，未回退、未纳入本任务。

返工（2026-11-06，用户真机指出）：快捷按钮与两个端框原先都是 `h('button')` + 就地写皮肤，违反 `src/ui/actions/Button.ts:21`「不许在任何使用点就地写按钮样式」；端框圆角用 `--dshpc-radius-sm`，与核心输入框的 `--dshpc-radius-md`（`src/ui/inputs/field.css:18`）不一致。更关键的是快捷列被塞进 `.dshpc-dt__panels`，把两个端框撑宽、对不齐下面两块日历。
改法：两处都改用核心 `Button`（`size="sm"` / `block` / 选中态走 `color` 轴 / `style` 只补 `justify-content`），删掉 `.dshpc-dt__preset*` 与 `.dshpc-dt__end--active` 等就地皮肤；弹层改 `.dshpc-dt__layout`：左 `.dshpc-dt__body` = 端框 + 两块日历，右 `.dshpc-dt__side` = 从端框那行竖排到日历底部的一列 + 一条竖线 + 溢出滚动（`border-right:1px solid transparent` 满足 `test/quality.test.mjs` 的滚动条让位自检）。demo 的「全部」改「清除」，带时分秒的 `second` 精度实例也打开 presets。
⚠️ 口径变化：range 两个端框的外观现在随核心 `Button`，**不传 presets 时也不再与旧版逐像素一致** —— 这是用户明确要求的统一，已同步 `docs/help/ui.doc.ts` 中英说明。
返工后复验：`pnpm run build` / `pnpm test` 304 全绿 / `pnpm run build:demo` / `pnpm run typecheck` / `koc-codelint` 六层全过。

## Conclusion

四项全部落地并随 `dist/` 与 demo `dist/` 入库：Picker `limit` / `keywords`、DateTimePicker `presets`（date math 子集 + 按值比对高亮 + 立即 emit 不关面板）、`width`；并按用户真机反馈完成复用核心 `Button` 与弹层左右分栏的返工。文档真源 `docs/help/ui.doc.ts` 及两个生成投影、demo 示例、中英字典、纯逻辑单测同步完成；全量自检与基础代码检查全绿。
未做：真机再次观感验证、外部事实单独落槽位文档、提交 / 打 tag（均需用户指令）。

## Execution Log

<!-- Maintained by the script: appended by new / claim / set / release / log / close. Do not edit.
     Backfill with: progress log --id 20261105-1440-2653-picker-与-datetimepicker-四项增强 --note "...". -->
- 2026-11-05 14:40:50 · new · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6 · created
- 2026-11-05 15:11:05 · claim · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6 · claimed → doing
- 2026-11-05 15:12:14 · log · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6 · 四轮方案定稿写入 Background/To Do/Next/Process：limit 按选项条数切片、keywords 只搜不渲染、presets 放弹层右列且立刻 emit 不关面板、选中态按值比对、短词只作配方不进 value（对齐 AntD presets / MUI getValue）、width 内联覆盖；外部事实已核 Grafana/Elastic/AntD/MUI 官方文档
- 2026-11-05 15:29:35 · log · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6 · 四项实现完成：sliceGroups/filterGroups(keywords)、resolvePresetExpr(date math 子集)、presets 弹层右列+按值比对+立即 emit 不关面板、width 内联覆盖；文档真源/生成投影/demo/中英字典/单测同步；build 干净、pnpm test 304 全绿、build:demo 出产物、typecheck 双配置干净、koc-codelint 六层全过。待真机观感验收；未提交未打 tag
- 2026-11-05 16:46:48 · log · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6 · 真机反馈返工：快捷按钮与两个端框改用核心 Button（去掉就地皮肤、圆角统一）；弹层改左右分栏（左=端框+两块日历上下对齐，右=竖列快捷档+竖线+溢出滚动）；demo「全部」改「清除」、second 精度实例也开 presets；文档真源同步。复验 build/test 304 全绿/build:demo/typecheck/codelint 全过
