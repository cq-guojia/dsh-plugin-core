# 20261024-1538-ui-新增-datetimepicker-单值-时间段-精度到秒-浮层内时分秒步-b2e8：ui 新增 DateTimePicker：单值/时间段、精度到秒、浮层内时分秒步进

> **创建**：2026-10-24 15:38:20（@GuoJia-Agent）
> **分类**：新功能 ｜ **标签**：ui、控件、日期

<!-- 「> **分类**：… ｜ **标签**：…」行由脚本按 new --category / --tags 插入；两者皆空则不写。 -->

## 背景

用户要日期时间选择控件，2026-10-24 需求定版：① 单值 + 时间段（起止两个独立框、点哪个亮哪个、同时展开，不用「一个框拖红选段」）；② 精度 day/hour/minute/second；③ 补全规则——day 精度下起始端 `00:00:00.000`、结束端 `23:59:59.999`，毫秒恒三位，数据库只收到秒时优雅退化；④ 浮层无遮罩、与 select 同机制；⑤ 按钮一律用核心 Button；⑥ 时分秒不能逐格点 60 分钟。

选型结论（用户拍板「自绘」）：react-day-picker 只有日期无时间；flatpickr / react-datepicker / @mui/x-date-pickers 功能全覆盖但样式体系与「运行时字符串注入 + dshpc token + body[data-ds-dark-theme]」硬约束冲突，且自带 CSS 文件宿主不加载，引入等于重画全套皮肤。蓝本：Picker.ts 浮层模式 + 兄弟项目 dsh-task-dispatch-table 的 `buildMonthCells`（DateTime.tsx:80-93，其 TimeField 的 60 项分钟列表正是「时间不好使」根因）+ flatpickr 式步进交互。

## 待办

待用户验收（demo「日期时间」页，2026-10-24 晚按用户反馈改过一轮后）：
- 四种用法：单值 day / 单值 minute / 区间 day / 区间 second，外加禁用态
- range 弹层 = 左右两块独立日历（左开始、右结束，各选各的、无跨度标记）
- 时分秒步进不强制先选日期：没选日期也能调，点「确定」没日期就不传数据（确定置灰）
- 快捷键：day 精度叫「今天」（只置日期）；带时分秒叫「现在」（日期 + 时间一起置）
- 键盘：方向键移日、PageUp/Down 换月、Home/End 月内首尾、Enter 选、Esc 丢弃草稿
- 区间起止颠倒时确定置灰 + 提示；day 精度结束端补 23:59:59.999

## 下一步

用户在 demo 预览站验收上述清单；有意见回到 `src/ui/DateTimePicker.ts` 改。验收通过后是否提交由用户明示（当前改动未 commit）。

## 过程

- `src/ui/datetime-logic.ts`：纯逻辑——本地 ISO 解析（Date 反向校验挡 2026-02-30）、6×7 周一起排月历（`buildMonthCells`）、`floorToPrecision` / `ceilToPrecision` 补全、`stepUnit` 循环步进、`rangeIsValid`；二轮加入草稿模型 `toEndDraft` / `partsOf`（没日期 ⇒ null）/ `nowTimeFor`
- `test/datetime-logic.test.mjs`：12 条全绿（闰月/补全规则/往返/键入收拢/草稿模型/nowTimeFor）
- `src/ui/DateTimePicker.ts`：组件。floating-ui 浮层复用 Picker 模式（portal + flip/shift + 点外关、无遮罩）；草稿态，「确定」才 onChange，Esc/点外丢弃
- `src/ui/controls/datetime.css` → `scripts/gen-css.mjs` MAP 接线 → `controls-css.ts` / `css.ts` 入 CONTROLS_CSS（置于 PICKER_CSS 后）
- `src/utils/i18n.ts`：14 个 key 中英（dtPlaceholder/dtStart/dtEnd/dtToday/dtNow/dtClear/dtHour/dtMinute/dtSecond/dtPrev*/dtNext*/dtInvalidRange）
- demo：`packages/demo/src/sections/controls.tsx` 加 `DateTimePage`，index.tsx 注册 `datetime` 小节；`docs/help/ui.doc.ts` 加 `datetime-picker` 章节（prose + api + 示例）
- 二轮（用户反馈）：① 时分秒步进不再要求先选日期（原 `disabled: activeParts === null` 删除，校验移到「确定」）；② 快捷键按精度改名（day「今天」/ 时分秒「现在」，`nowTimeFor` 按精度截断）；③ range 弹层由「单月历 + 亮端」改为两块独立日历（`views`/`focus`/`gridRefs` 按端各一份，去掉 `--in` 跨度浅底）；④ demo 录入页「开始时间/选择日期」示例改名「用户名」（顺带删掉 demo i18n 死 key `fieldHintDate`）
- 验证：`pnpm test` 116/116、`pnpm run build:demo` OK、koc-codelint 六层全过
- 踩坑（方法教训）：同一文件在一轮里并行发多个 `replace_in_file` 会互相覆盖（datetime-logic.ts 丢过一轮函数，tsc 报 no exported member 才发现）——同文件的多处编辑必须串行，一把一确认

## 结论

DateTimePicker 落地：`mode × precision` 覆盖全部诉求；补全规则「起 floor / 止 ceil 到精度单位边界」（hour ⇒ 止 `H:59:59.999`、minute ⇒ `H:M:59.999`、second 不动），毫秒恒三位、数据库截断优雅退化。交互按用户 10-24 反馈定稿：时间不强制先选日期、快捷键「今天/现在」双态、range 双独立日历不标跨度。遗留：未做 min/max 夹取、命令式 Promise API（YAGNI，用户未要求）。

## 执行记录

<!-- 本节由脚本维护：new / claim / set / release / log / close 自动追加，请勿手改。
     补记用 progress.py log --id <任务号> --note "一句话"。 -->
- 2026-10-24 15:38:20 · new · @GuoJia-Agent · 创建任务（doing）
- 2026-10-24 15:59:33 · log · @GuoJia-Agent · DateTimePicker 落地：logic+组件+css+i18n 13key+demo 页+ui.doc.ts 章节；pnpm test 114/114、codelint 六层过、build:demo OK；待用户 demo 验收
- 2026-10-24 16:23:28 · log · @GuoJia-Agent · 按用户反馈改：时分秒不强制先选日期（确定时没日期不传数据）、快捷键 day「今天」/时分秒「现在」、range 弹层改两块独立日历不标跨度、demo 录入页示例改名「用户名」；草稿模型纯函数化并补 2 条测试；pnpm test 116/116、codelint 六层过
- 2026-10-24 16:45:14 · log · @GuoJia-Agent · 修显示精度 bug（新增 utils formatDateTimePrecision：day 不出时分秒）+ range 触发器改双框框外杠（右框微蓝底、点哪个都整体展开）+ 弹层组行端框与时分秒同排不折行 + 触发器焦点改 Input 同款蓝框；pnpm test 117/117、codelint 六层过
- 2026-10-24 17:24:35 · log · @GuoJia-Agent · 回退第三轮全部改动（用户验收样式被改坏）：DateTimePicker.ts/datetime.css 还原到第二轮状态；根因是重写时单值模式漏挂 refs.setReference 导致浮层跑左上角；顺带撤掉 formatDateTimePrecision 及其测试/doc；pnpm test 116/116、codelint 六层过
- 2026-10-24 18:09:38 · log · @GuoJia-Agent · 按用户重申的需求补两针（不动布局）：① 显示改走 formatDateTimePrecision——day 只出日期不出 00:00、hour/minute 到分、second 出秒，触发器与 range 两个端框同步，数据仍完整 ISO；② 端框纵排改横排「开始：值｜结束：值」一行；pnpm test 117/117、codelint 六层过
- 2026-10-24 18:28:45 · log · @GuoJia-Agent · range 触发器改一个整条：两个日期区 + CSS 灰隔条（左右竖边）取代文本横杠与双按钮；点整条展开行为不变；恢复 Input 同款 :focus 蓝边（回退时弄丢的）；先提交了上一轮显示精度+端框横排（2215229）
- 2026-10-24 18:36:51 · log · @GuoJia-Agent · range 隔条改上下顶满 border（与边框连起、中间隔出一块），块内放「到」符号 ~（不选 -：紧挨日期会被看成日期一段）；pnpm test 117/117、codelint 六层过
- 2026-10-24 18:45:18 · log · @GuoJia-Agent · 隔条顶满修复（pair-group 加 align-self:stretch，此前组高=行高导致上下差 4px）；默认宽改按精度 ch 计算（day 10ch/时分 16ch/秒 19ch，range 乘 2 + 隔条图标间距），删掉拍脑袋的 min-width:220px；调用方 className 更宽仍自然撑开；pnpm test 117/117、codelint 六层过
- 2026-10-24 18:57:17 · log · @GuoJia-Agent · 隔条符号按用户拍板改 -；默认宽 min-width 改 width 固定（选中前后不跳，day 按占位 7 汉字 13ch 取大、range day 25ch 容两个占位）；两个日期区 flex:1 1 0 平分；pnpm test 117/117、codelint 六层过
- 2026-10-24 19:23:14 · log · @GuoJia-Agent · 宽度对标参考图实测值（纯 Python 解 PNG 量边框，2x 屏换算）：单值 day 134/时分 159.5、区间 day 275/秒 384，单值秒 180.8 与区间分 347.4 按同斜率插值；原实现四档全部偏窄 2~32px；占位 7 汉字仍不省略；pnpm test 117/117、codelint 六层过
- 2026-10-24 19:28:23 · log · @GuoJia-Agent · 六档宽度统一 -6px（用户：实测值留得偏多）：单值 128/153.2/174.8、区间 269/341.4/377.6；占位 7 汉字仍有 1px 余量不省略；pnpm test 117/117、codelint 六层过
- 2026-10-24 19:42:03 · log · @GuoJia-Agent · 收尾：宽度 -6px 与文档同步分两笔提交推送（1f02ba9/d52c6ee）；修文档三处——ui.doc 触发器描述改整条、requirements §2.2+§6 登记、structure 控件树补项；pnpm test 117/117、codelint 六层过
- 2026-10-24 19:50:09 · log · @GuoJia-Agent · demo 五个 DateTimePicker 示例去掉自定义 placeholder，统一走默认「请选择日期时间」（dtPlaceholder，可传 placeholder prop 覆盖）；已提交推送 47e7f91；测试/lint 全过
- 2026-10-24 20:01:25 · log · @GuoJia-Agent · demo 侧栏重构：底部固定栏（不随滚动）放明暗切换（翻 body data-ds-dark-theme + MutationObserver 同步）+ 版本号 + 编译码；编译码改时间戳 YYMMDD-HHmmss-SSS（261024-200021-098 实测）；提交推送 5ad335f
- 2026-10-24 20:07:52 · log · @GuoJia-Agent · 侧栏底栏修正：版本号拆 core/demo 两行（180px 一行放不下）、明暗切换手写 button 改核心 Button；提交推送；测试/lint 全过
