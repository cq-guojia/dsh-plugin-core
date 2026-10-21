# 20261021-1151-core-文档随包分发-agent-可读文档机制-demo-与-docs-真源统-ebe3：core 文档随包分发：Agent 可读文档机制 + demo 与 docs 真源统一

> **创建**：2026-10-21 11:51:26（@GuoJia-Agent）
> **分类**：基建 ｜ **标签**：文档、分发、demo、Agent、真源

<!-- 「> **分类**：… ｜ **标签**：…」行由脚本按 new --category / --tags 插入；两者皆空则不写。 -->

## 背景

用户 2026-10-21 提出：demo 是给人看的，还需要一套给 Agent 看的开发文档；希望文档随 core 包分发（插件项目引用 core 时 Agent 能读到，但插件打包产物不带文档）。想法：① 一主题一文件、Agent 按需读；② 保留原文件；③ 格式 MD 还是 TS 待定；「原数据」用途：demo 写死的文档性文案按格式从文档读取，改文档 demo 自动跟随。当天中午用户二次反馈（否决「最省」式折中）：**单一真源是硬标准**——demo 上每个字/每张表/每段示例在 demo 源码里不许有第二份；demo 只管显示不管内容；文档组织方式是核心；Agent 读取由消费方自己的规则解决（我们无法注入别人的会话）；并提出二期设想：core 包自带 skill，消费方装 core 后把 skill 交给自己的 Agent。

## 待办

- [ ] 用户拍板格式选型：真源用 md（推荐）vs TS 数据模块——推荐 md（原文件即 Agent 直读那份、存量 14 份文档近零迁移、demo 吃生成物）
- [ ] 用户确认：demo 全部用户可见文案（含 src/i18n.ts 134 key 双字典）迁入 docs，demo 源码零硬编码文案（机器可检）
- [ ] 实施：docs/design/doc-format.md 格式规范（登记进 docs/README.md 槽位表）→ scripts/gen-docs.mjs → demo 改纯渲染器 → test/doc-contract.test.mjs
- [ ] 消费方标准指引句写进 docs/README.md（抄进各插件项目 AGENTS.md 由用户执行）
- [ ] 二期（本期不做）：包内 skill/ 随包分发，消费方装 core 后把 skill 交给自己的 Agent

## 下一步

等用户对「md 真源 + demo 纯渲染 + 文案全进 docs」拍板；通过后先写 docs/design/doc-format.md 与 scripts/gen-docs.mjs（照 scripts/gen-css.mjs:29-47,94-104,135-142 三件套），再改 packages/demo/src/sections/* 的 *_API/CODE_* 与 src/i18n.ts。

## 过程

三专家并行调研（code-explorer，只读）关键结论：

1. **分发链路（专家 A）**：docs 已在 npm 发布内容里（package.json:60-63 `files: ["dist","docs"]`）；git 克隆同样带 docs。三个兄弟项目（dsh-session-title-pattern / dsh-task-dispatch-table / dsh-task-ledger）bundler（tsdown/esbuild）均无 md/text loader、产物目录 0 个 .md ⇒ **「随包分发 + 产物不带」机制上已成立**。真缺口：兄弟项目目前根本没装 core（node_modules 无 core），且其 AGENTS.md 无读 core 文档的指引——只有 core AGENTS.md:4 一句话外溢。
2. **demo 重复（专家 B）**：13 处写死内容与 docs 同源，最典型：sections/start.tsx:6-15 CODE_START_USAGE ↔ docs/examples/integration.md；controls.tsx:210-220 BUTTON_API ↔ features/ui.md:33-51；i18n.ts:655-663 api* 说明 ↔ features 各表；reference.tsx:11-12 OUT_OF_SCOPE ↔ features.md「不提供什么」。既有「读文件→生成 TS」先例两条：scripts/gen-css.mjs（MAP + generated.ts + --check + css-contract 测试）与 build.mjs:37-42 define。
3. **文档现状（专家 C）**：docs/ 14 个 .md 零 frontmatter、无机器可读索引，docs/README.md 槽位表是人工索引；「一主题一文件」在 features/<包名>.md 已成立；test/ 15 个测试无一看 docs 本身；src/utils/i18n.ts 是「TS 常量文档内容」先例但与 docs 不重复。
4. **冲突点（专家 B）**：demo 双语（i18n.ts DICT.zh/en，2026-10-19 任务落地「所有用户可见文本随 harness 语言」），docs 纯中文 ⇒ 长文说明不能直接烧进 demo；语言中性列（API 表 name/type/def）可走生成物，desc 列需保留 DICT 或 docs 补 desc.zh/desc.en。
5. **用户中午反馈后定稿方向**：单一真源不打折——真源 = md（一主题一文件），格式定死为「核心的格式」（frontmatter 含 display:{key:{zh,en}} + 固定五列 API 表 参数/类型/默认/说明/EN + 带 id 的围栏代码块）；scripts/gen-docs.mjs 照 gen-css 三件套生成 packages/demo/src/doc-data.generated.ts；demo 改纯渲染器（删 src/i18n.ts DICT 双字典与 *_API/CODE_* 硬编码，en 文案取自文档 EN 列/display.en）；新增 test/doc-contract.test.mjs 守生成同步 + MAP⇄磁盘 + demo 源码零硬编码文案；页面↔文档映射留 demo sections/index.tsx（属显示结构）。skill 二期。
6. **ledger 机制坑**：progress.py 写前会拉远端并覆盖未提交的 worklog 正文（本轮实际发生两次，执行记录不丢、正文回骨架）。规避：正文放在本轮最后一次 log 之后改；根治需提交 ledger 文件（待用户「提交」指令）。

## 结论

设计定稿（待用户最终确认后实施）：md 单一真源 + gen-docs.mjs 构建期生成 + demo 纯渲染器；demo 双语文案随 docs 的 EN 列 / frontmatter display.en 走，DICT 删除。未实施。

## 执行记录

<!-- 本节由脚本维护：new / claim / set / release / log / close 自动追加，请勿手改。
     补记用 progress.py log --id <任务号> --note "一句话"。 -->
- 2026-10-21 11:51:26 · new · @GuoJia-Agent · 创建任务（doing）
- 2026-10-21 11:52:29 · log · @GuoJia-Agent · 三专家调研完成：docs 已在 npm files 内且 bundler 不吃 md（产物不带文档已成立）；demo 13 处写死内容与 docs 同源；docs 零 frontmatter 无机器可读索引；demo 双语 vs docs 纯中文有冲突。已产出 A/B/C 三方案待用户选型（推荐 B：MD 真源 + frontmatter 索引 + gen-docs.mjs 生成 + --check 闸）。
- 2026-10-21 12:04:55 · log · @GuoJia-Agent · 用户否决最省式折中，定单一真源硬标准：demo 每字每表在 demo 源码无第二份、demo 只管显示。定稿方向：md 真源（frontmatter display{zh,en}+五列 API 表+带 id 代码块）→ gen-docs.mjs 生成 → demo 删 DICT 与硬编码改纯渲染；skill 列二期。注意 ledger log 前拉远端会覆盖未提交正文（本轮已被覆盖一次，已重写补回）。
- 2026-10-21 16:30:14 · log · @GuoJia-Agent · 原型解析实测（node 内联跑全 docs）：42 个表全部列数自洽+分隔行齐全、转义管道 \| 正确切分、25 个代码围栏全闭合、0 个多行单元格；demo ApiRow(name/type/def/descKey) 与文档表格 1:1；发现真实漂移：Button 表 docs 有 …rest 无 disabled、demo 反之。定规范：demo 消费的表用前置标记注释定位（不按行号），围栏加 id。
