# 20261019-1132-控件层重构-改继承官方-primitives-l0-l4-分层-逐控件包裹-eb12：控件层重构：改继承官方 primitives（L0-L4 分层 + 逐控件包裹）

> **创建**：2026-10-19 11:32:47（@GuoJia-Agent）
> **分类**：建设 ｜ **标签**：重构、控件、官方原语、分层

## 背景

用户 2026-10-19 凌晨把 demo 插件装进真实宿主后反馈："界面上来了但还是不对"——自绘控件和真宿主长得不一样。定位结论（对照兄弟项目 `dsh-task-dispatch-table`）：

- 兄弟项目是**混合分工**：能官方的一律 `import { Button, Switch, Input, Modal, Toast, Pill, Menu, Icon*… } from '@deepseek-ai/dsh-client-ui-primitives'`（宿主平台模块，运行时 `require()` 解析），宿主没有的才自绘且只吃官方 token（`--dsw-alias-*`）。
- 本仓是 **100% 自绘**：每个控件配一个 `*-css.ts`，类名 `dsh-tdt-*`，token 虽已别名到官方但几何/皮肤是重新演绎，必然有差。

用户拍板（2026-10-19 01:36 原话要点）："字号/皮肤继承官方（包一层官方 primitives），在上面做定制，而不是重造"；两条硬要求：**能抽象的一律往上抽、架构做健壮**；**该删的外部引用删干净**。

专家团（三路：架构对标 / 落地树 / 批判评审）结论已写入 `docs/refactor-work-log.md` §12：canonical 分层 **tokens → platform → components（含 layouts）→ headless → utils → features**，对用户初版"扩展空间/抽象方法区独立成层"提出两处反对（违反本仓"等第二个消费者再抽"自订规矩；官方 Modal 本身就是 modal base）。

**本任务的由来**：上述会话在 10-19 02:18（UTC）停在"等用户拍板 3 件事"后中断，**台账里没建任务**，台面只剩过时的 `20261018-1124-文档补全` 任务。本任务补登记该工作线。

**已落地未登记的地基**（两个 commit）：
- `8904ac4` 重构地基(P0)：删死脚本 `scripts/plugin-client-build.mjs`；`src/types/primitives.d.ts` 从 any-stub 换成版本钉死真类型；新建 `src/ui/official.ts`（L1 adapter，全仓唯一官方 import 点 + `pickOfficial` 漂移兜底）；typecheck/build/35 测试全绿
- `5f9f378` docs：`docs/refactor-work-log.md`（模式/分层树/专家结论/待拍板）

## 待办

**① 等用户拍板**（`docs/refactor-work-log.md` §13，专家团遗留 3 决策）：
1. ③「扩展空间」④「抽象方法区」接受不独立成层（③→`components/layouts` 复合控件、④→并入 `./utils`），还是坚持独立 tier？
2. 趁无外部消费者换 canonical 名（`./tokens` / `./platform` / `./components` / `./headless`），还是保留现名（`./design` / `./ui` / `./utils`）？
3. 平台类型进 dist 方案：(a) `primitives.d.ts` 随包发布成公开契约 + (b) 公开 API 对平台类型 opaque？

**② P0 拆雷 + 清算**（无视觉回归，动第一个 wrap 前的硬伤）：
- Node 单测 stub：`pnpm test` 在 Node 里 import 组件，一沾官方模块就 `ERR_MODULE_NOT_FOUND`——用 `module.register` 把 `@deepseek-ai/*` 映射到测试 stub（几行，只为命令不崩；用户已确认"无数组环境能否跑不重要"）
- 根 `demo/` 拆分：`demo/sections/` 被 `packages/demo` 共用（`import '../../../../demo/sections/index.js'`），须先挪进 `packages/demo` 再删坏的预览站外壳（App/main/index.html/build.mjs/mock.ts）+ `demo:build` 脚本
- 文档不变量改写：`AGENTS.md` / `docs/design/architecture.md` / `docs/design/external/dsh-host.md` 里"ui 零 `@deepseek-ai/*` 依赖"硬约束 → 改为"官方平台模块经 L1 adapter 消费"；`docs/requirements.md` 记录"反转 SelectField 旧决策"（`18-0425` 任务当年因官方 Menu 依赖被删）
- `scripts/gen-token-alias.mjs` 被引用但不存在；alias hack 已漂移（`surface-3`/`surface-raised` 不在别名表，静默失效）→ 删 hack，不补生成器
- CSS 类名 `dsh-tdt-*` 全局命名空间不隔离（`tdt` 是兄弟项目缩写）→ 趁重构类名前缀化
- 默认 kit 固定 id/prefix，忘了 `setStyleKit` 的插件会互相覆盖 → 工厂默认值处理
- 反向依赖违规：`src/ui/css.ts` import 了 `explorer`/`session` 的 CSS

**③ P1 抽象收敛**（用户硬要求"往上抽"）：尺寸三档 / focus ring（重复 ~11 处）/ hover / transition 三连 / `prefers-reduced-motion`（6 处）/ 语义色 tint / 单一下拉锚点（现 3-4 处分叉，Modal 关闭钮在蹭 picker 类）/ 省略号——抽成共享基 + 工具类 + token。

**④ P2 逐个包裹官方 + 删自绘**（有视觉变化，一次一个可回归）：
- wrap 官方（L3）：Modal、Toast、Chip→Pill/Tag、Switch、Input、FieldHint→Tooltip、MarqueeText、Picker 下拉→Menu+hook、图标、MarkdownText/CodeBlock/ReadBlock
- 自绘留用（L4，复刻兄弟项目重砌到共享基）：Button/IconButton、Segmented、Checkbox、Textarea、Card/StripCard、Field、SectionHead、Loading、EmptyState、BackToTop、LiveText、ErrorBoundary
- 删：孤儿 CSS（`DATETIME_CSS`、`SELECT_CSS` 的 `.dsh-tdt-ed-*`、`.dsh-tdt-switch`、重复的 `.dsh-tdt-chip`）+ 被官方取代的自绘实现

**⑤ 收尾**：每个 wrap 完成后 `pnpm run build` + `pnpm test` + 装进宿主看真实观感（用户：测试就是装进宿主看，没有 HTML 测试）。

## 下一步

等用户对 §13 三件事拍板（用户回"照推荐"= ③④不独立成层、换 canonical 名、类型进 dist）。拍板后从 P0 起手：先补 Node 测试 stub loader（这是动任何控件 import `official.ts` 的前置），再拆根 `demo/`，再改文档不变量。

## 过程

**2026-10-19 11:32** 补建本任务。核实：会话中断前的地基（`8904ac4`、`5f9f378`）已在 main；`src/ui/official.ts` 存在（2412B）；`docs/refactor-work-log.md` 存在，§13 三条待拍板原样未动；`ledger/progress.json` 在办任务只有过时的 `20261018-1124-文档补全`（其 worklog 自记"等用户确认后 close"，未结案）。

## 结论

<!-- 收尾时填 -->
