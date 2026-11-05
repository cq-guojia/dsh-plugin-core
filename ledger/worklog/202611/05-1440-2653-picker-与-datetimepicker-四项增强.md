# 20261105-1440-2653-picker-与-datetimepicker-四项增强: Picker 与 DateTimePicker 四项增强

- **Tags**: Picker, DateTimePicker, 搜索, 分页, 预设档
- **Status**: doing · 2026-11-05 15:12:14 · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6
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

- 四项实现 + `dist/` 产物入库。
- 自检：`pnpm run build`、`pnpm test`（含 pretest 的 gen-css/gen-docs --check 与 demo tsc）、`pnpm run build:demo`、`pnpm run typecheck`、`koc-codelint`。
- 真机（DSH 宿主）观感未验：弹层右列撑宽、暗色配色、200px 宽下省略表现。
- 外部事实是否单独落 `docs/design/external/` 待用户定（本轮先随 `ui.doc.ts` 引用）。

## Next

按 `src/ui/inputs/picker-logic.ts` → `Picker.ts` → `picker.css` → `datetime-logic.ts` → `DateTimePicker.ts` → `datetime.css` → `i18n.ts` → `ui/index.ts` → `ui.doc.ts` → demo `controls.tsx` → 测试的顺序落地，最后跑全量自检。

## Process

只读调研结论（2026-11-05）：`filterGroups` 只按 label 匹配且无分页（`picker-logic.ts:35-45`、`Picker.ts:173-174,300-343`）；菜单滚动容器 `.dshpc-picker__menu` 已有 max-height/overflow（`picker.css:20-24`），「显示更多」用 sticky 底栏可避免新增滚动容器、不必改 `test/quality.test.mjs` 白名单；键盘游标基于 `flattenOptions(shown)`，切片必须发生在它之前否则方向键走到不可见项。
DateTimePicker 默认宽是 6 个 CSS 类按精度写死（`datetime.css:39-44` + `DateTimePicker.ts:119-126,465`），内联样式优先级更高，可直接覆盖；`.dshpc-dt__pair-date` / `--trigger-label` 已带省略（`datetime.css:17,24`）；range 两日期区严格平分（`datetime.css:23-24`），日历图标是整条末尾独立元素（`DateTimePicker.ts:456,484`），不算进任一框 —— 用户提醒的「I 卡 = icon」已核。
底部「清除」= `emit(null); setOpen(false)`（`DateTimePicker.ts:322-325,695`），即立刻生效，与预设按钮行为一致。
周一起排是项目既定（`datetime-logic.ts:29-30,204`）；`floorToPrecision` / `ceilToPrecision`（`datetime-logic.ts:168,186`）供预设展开后端点补全复用；`commit()` 已按此产出（`DateTimePicker.ts:312-313`）。

## Conclusion

<!-- What got done, what got left behind -->

## Execution Log

<!-- Maintained by the script: appended by new / claim / set / release / log / close. Do not edit.
     Backfill with: progress log --id 20261105-1440-2653-picker-与-datetimepicker-四项增强 --note "...". -->
- 2026-11-05 14:40:50 · new · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6 · created
- 2026-11-05 15:11:05 · claim · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6 · claimed → doing
- 2026-11-05 15:12:14 · log · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6 · 四轮方案定稿写入 Background/To Do/Next/Process：limit 按选项条数切片、keywords 只搜不渲染、presets 放弹层右列且立刻 emit 不关面板、选中态按值比对、短词只作配方不进 value（对齐 AntD presets / MUI getValue）、width 内联覆盖；外部事实已核 Grafana/Elastic/AntD/MUI 官方文档
