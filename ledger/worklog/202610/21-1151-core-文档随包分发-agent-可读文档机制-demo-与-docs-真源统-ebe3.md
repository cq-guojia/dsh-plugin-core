# 20261021-1151-core-文档随包分发-agent-可读文档机制-demo-与-docs-真源统-ebe3：core 文档随包分发：Agent 可读文档机制 + demo 与 docs 真源统一

> **创建**：2026-10-21 11:51:26（@GuoJia-Agent）
> **分类**：基建 ｜ **标签**：文档、分发、demo、Agent、真源

<!-- 「> **分类**：… ｜ **标签**：…」行由脚本按 new --category / --tags 插入；两者皆空则不写。 -->

## 背景

用户 2026-10-21 提出：demo 是给人看的，还需要一套给 Agent 看的开发文档；希望文档随 core 包分发（插件项目引用 core 时 Agent 能读到，但插件打包产物不带文档）。想法：① 一主题一文件、Agent 按需读；② 保留原文件；③ 格式 MD 还是 TS 待定；「原数据」用途：demo 写死的文档性文案按格式从文档读取，改文档 demo 自动跟随。当天中午用户二次反馈（否决「最省」式折中）：**单一真源是硬标准**——demo 上每个字/每张表/每段示例在 demo 源码里不许有第二份；demo 只管显示不管内容；文档组织方式是核心；Agent 读取由消费方自己的规则解决（我们无法注入别人的会话）；并提出二期设想：core 包自带 skill，消费方装 core 后把 skill 交给自己的 Agent。

## 待办

- [x] 阶段0：定稿 doc-format.ts schema + gen-docs 按 section.id 扁平聚合 + --check 闸（2026-10-21 晚，见过程 11）
- [ ] 阶段1：转 demo 消费的 6 份文档为 .doc.ts（ui/utils/session/explorer/design/integration）；requirements/architecture/external 保持手写 md
- [ ] 阶段2：package.json 接 build 含 gen:docs + pretest 加 gen:docs --check + 补 prepublishOnly
- [ ] 阶段3：demo 接线——删 src/i18n.ts DICT、sections/* 的 *_API/CODE_* 硬编码，改读 docData[sectionId]，locale 接 zh/en（13 处，最重）
- [ ] 阶段4：test/doc-contract.test.mjs（生成同步 + MAP⇄磁盘 + demo 零硬编码 + SectionId↔doc id 契约）
- [ ] 阶段5：docs/README.md 写消费方标准指引句；二期 skill/ 随包分发
- [x] 用户拍板方案 + ship md+.doc.ts（不排除 .doc.ts，Agent 能读即留包内，见过程 10）

## 下一步

阶段0 已完成（doc-format.md 规范 + gen-docs 扁平聚合 + --check 闸，typecheck 通过，见过程 11）。下一动作 = 阶段1：把 features/ui、features/utils、features/session、features/explorer、features/design、examples/integration 共 6 份转成 .doc.ts（填全内容，section.id 对齐 demo SectionId），并在 gen-docs 的 MAP 登记；每转一份重跑 gen-docs 比对生成 md 与原手写无遗漏。requirements/architecture/external 保持手写 md 不动。

## 过程

三专家并行调研（code-explorer，只读）关键结论：

1. **分发链路（专家 A）**：docs 已在 npm 发布内容里（package.json:60-63 `files: ["dist","docs"]`）；git 克隆同样带 docs。三个兄弟项目（dsh-session-title-pattern / dsh-task-dispatch-table / dsh-task-ledger）bundler（tsdown/esbuild）均无 md/text loader、产物目录 0 个 .md ⇒ **「随包分发 + 产物不带」机制上已成立**。真缺口：兄弟项目目前根本没装 core（node_modules 无 core），且其 AGENTS.md 无读 core 文档的指引——只有 core AGENTS.md:4 一句话外溢。
2. **demo 重复（专家 B）**：13 处写死内容与 docs 同源，最典型：sections/start.tsx:6-15 CODE_START_USAGE ↔ docs/examples/integration.md；controls.tsx:210-220 BUTTON_API ↔ features/ui.md:33-51；i18n.ts:655-663 api* 说明 ↔ features 各表；reference.tsx:11-12 OUT_OF_SCOPE ↔ features.md「不提供什么」。既有「读文件→生成 TS」先例两条：scripts/gen-css.mjs（MAP + generated.ts + --check + css-contract 测试）与 build.mjs:37-42 define。
3. **文档现状（专家 C）**：docs/ 14 个 .md 零 frontmatter、无机器可读索引，docs/README.md 槽位表是人工索引；「一主题一文件」在 features/<包名>.md 已成立；test/ 15 个测试无一看 docs 本身；src/utils/i18n.ts 是「TS 常量文档内容」先例但与 docs 不重复。
4. **冲突点（专家 B）**：demo 双语（i18n.ts DICT.zh/en，2026-10-19 任务落地「所有用户可见文本随 harness 语言」），docs 纯中文 ⇒ 长文说明不能直接烧进 demo；语言中性列（API 表 name/type/def）可走生成物，desc 列需保留 DICT 或 docs 补 desc.zh/desc.en。
5. **用户中午反馈后定稿方向**：单一真源不打折——真源 = md（一主题一文件），格式定死为「核心的格式」（frontmatter 含 display:{key:{zh,en}} + 固定五列 API 表 参数/类型/默认/说明/EN + 带 id 的围栏代码块）；scripts/gen-docs.mjs 照 gen-css 三件套生成 packages/demo/src/doc-data.generated.ts；demo 改纯渲染器（删 src/i18n.ts DICT 双字典与 *_API/CODE_* 硬编码，en 文案取自文档 EN 列/display.en）；新增 test/doc-contract.test.mjs 守生成同步 + MAP⇄磁盘 + demo 源码零硬编码文案；页面↔文档映射留 demo sections/index.tsx（属显示结构）。skill 二期。
6. **ledger 机制坑**：progress.py 写前会拉远端并覆盖未提交的 worklog 正文（2026-10-21 上午实际发生两次，执行记录不丢、正文回骨架；同日下午复测未复现——疑与远端有无新提交有关）。规避：正文放在本轮最后一次 log 之后改；根治需提交 ledger 文件（待用户「提交」指令）。
7. **解析可行性实测（2026-10-21 下午，node 内联原型跑全 docs）**：42 个表格全部列数表内自洽 + 第二行均为分隔行；单元格内 `\|`（如 features/ui.md:44 `'sm' \| 'md' \| 'lg'`）按转义正确切分；25 个代码围栏全部闭合；0 个多行单元格；frontmatter 现状 0 个无冲突。demo 侧数据形状与文档表格 1:1：`ApiRow{name,type,def,descKey}`（packages/demo/src/doc.tsx:13-18）← 表格 参数/类型/默认/说明；`CodeOnly{labelKey,code}`（doc.tsx:38）← 围栏块。**发现真实漂移实证**：Button 表 docs 侧（features/ui.md:41-51）有 `…rest` 无 `disabled`，demo 侧（controls.tsx:210-220）有 `disabled` 无 `…rest`——正是单一真源要消的东西。
8. **方案转向（2026-10-21 下午晚些，用户质疑「md 不算太好」并问 JSON 类是否更易读）**：重评后否掉 md 真源，定稿 **TS 数据模块真源**。真因：md 方案做的是「困难方向」——解析 md→数据永远缺斤少甲、无 schema、双语笨拙；而「数据→md」是渲染，容易且完备。JSON 被否（prose 满篇转义）、YAML 被否（要引解析器依赖或手搓子集，重回 fragile）；TS 两头占：机器侧同 JSON 之强且带类型（tsc 即 schema 闸），人侧 prose 走模板字符串（src/utils/i18n.ts 59KB 同款先例），零新依赖。架构：`docs/**/*.doc.ts` 手写 typed 真源（一主题一文件；根 tsconfig.json:23 只含 src/**，需独立 tsconfig.docs.json --noEmit 守 schema）→ scripts/gen-docs.mjs（esbuild 打包 .doc.ts → data: URL import → 渲染；显式 MAP；--check 闸）生成双投影：docs/**/*.md（给 Agent/人读，随包发布，勿手改头）+ packages/demo/src/doc-data.generated.ts（demo import 零解析；对齐 gen-css.mjs:46 把 demo-css.generated.ts 写进 demo/src 的先例）。范围：只转 demo 消费的文档（features 五份 + integration + style/design 的 API/token）；requirements/architecture/external 保持手写 md（demo 不展示、无漂移风险）。demo 仍要改 13 处接线（最重的活，躲不掉）。
9. **样板跑通（2026-10-21 晚，用户「做个样板我看一眼」）**：端到端验证 TS 真源方案可行。新建 docs/design/doc-format.ts（DocTopic 类型 schema）+ docs/design/features/explorer.doc.ts（真源，含 openFilePreview/pickWorkspaceFile/SessionPreview 接入代码与 API 表，双语 {zh,en}）+ scripts/gen-docs.mjs（esbuild 打包 .doc.ts → 临时文件 import → 渲染双投影）+ tsconfig.docs.json（--noEmit 类型闸）+ package.json 加 gen:docs / typecheck:docs 脚本。运行结果：生成 docs/design/features/explorer.generated.md 与 packages/demo/src/doc-data.generated.ts 两份投影；`pnpm typecheck:docs`（tsc -p tsconfig.docs.json）通过（首跑因 NodeNext 要求相对导入显式 .js 扩展名报 TS2835，已修）。证明链路成立：真源改一处 → 两投影自动跟随，demo 零解析。demo 尚未接线（纯渲染改造留全量阶段）。
10. **用户拍板开工（2026-10-21 晚，讨论澄清 Q1-Q3 后）**：方案批准（TS 数据模块唯一真源 + 双投影 + 构建期生成入库 + pretest --check + 按 section.id 扁平聚合解耦 demo 与文件）。ship 决策：core 包 docs/ 同时发 .md 与 .doc.ts（不排除 .doc.ts，Agent 能读即留包内，用户原话「他能读增员就不用去管了，就直接放在里面就行了」）。直接进入阶段 0。
11. **阶段0 完成（2026-10-21 晚）**：定稿 docs/design/doc-format.md（登记进 docs/README.md 槽位表，把「各功能」拆为真源/生成两行）+ doc-format.ts 补 section.id 契约注释 + gen-docs.mjs 重写为按 section.id 扁平聚合（docData[id]，重 id 报错退出）+ 加 --check 闸（比对 doc-data.generated.ts 是否最新）+ MAP 暂只列 explorer。验证：`node gen-docs.mjs` 生成双投影、`--check` 绿、`pnpm typecheck:docs` 通过；生成物确认已扁平（docData["overview"] 等按 id 取）。阶段1（转 ui/utils/session/design/integration 6 份）待启动。

## 结论

**实施中（阶段0 完成，阶段1 启动）**：**TS 数据模块唯一真源**——`docs/**/*.doc.ts` 手写 typed（tsconfig.docs.json 守 schema），gen-docs.mjs 按 section.id 扁平聚合生成双投影（`*.md` 给 Agent/人读 + `packages/demo/src/doc-data.generated.ts` 给 demo 零解析），`pnpm typecheck:docs` 与 `gen:docs --check` 双重闸。ship md+.doc.ts（不排除）。全量迁移 + demo 接线 + doc-contract 测试按阶段 1-5 推进。

## 执行记录

<!-- 本节由脚本维护：new / claim / set / release / log / close 自动追加，请勿手改。
     补记用 progress.py log --id <任务号> --note "一句话"。 -->
- 2026-10-21 11:51:26 · new · @GuoJia-Agent · 创建任务（doing）
- 2026-10-21 11:52:29 · log · @GuoJia-Agent · 三专家调研完成：docs 已在 npm files 内且 bundler 不吃 md（产物不带文档已成立）；demo 13 处写死内容与 docs 同源；docs 零 frontmatter 无机器可读索引；demo 双语 vs docs 纯中文有冲突。已产出 A/B/C 三方案待用户选型（推荐 B：MD 真源 + frontmatter 索引 + gen-docs.mjs 生成 + --check 闸）。
- 2026-10-21 12:04:55 · log · @GuoJia-Agent · 用户否决最省式折中，定单一真源硬标准：demo 每字每表在 demo 源码无第二份、demo 只管显示。定稿方向：md 真源（frontmatter display{zh,en}+五列 API 表+带 id 代码块）→ gen-docs.mjs 生成 → demo 删 DICT 与硬编码改纯渲染；skill 列二期。注意 ledger log 前拉远端会覆盖未提交正文（本轮已被覆盖一次，已重写补回）。
- 2026-10-21 16:30:14 · log · @GuoJia-Agent · 原型解析实测（node 内联跑全 docs）：42 个表全部列数自洽+分隔行齐全、转义管道 \| 正确切分、25 个代码围栏全闭合、0 个多行单元格；demo ApiRow(name/type/def/descKey) 与文档表格 1:1；发现真实漂移：Button 表 docs 有 …rest 无 disabled、demo 反之。定规范：demo 消费的表用前置标记注释定位（不按行号），围栏加 id。
- 2026-10-21 16:38:56 · log · @GuoJia-Agent · 用户质疑 md 真源方案，重评定稿 TS 数据模块真源：docs/**/*.doc.ts 手写 typed（tsconfig.docs.json --noEmit 守 schema，根 tsconfig 只含 src/** 需独立配置），gen-docs.mjs 生成双投影（docs md 给 Agent 读 + packages/demo/src/doc-data.generated.ts 给 demo 零解析消费，对齐 gen-css 把生成物写进 demo/src 的先例）。md 被否真因：解析是困难方向且无 schema、双语笨拙；data→md 渲染是容易方向。只转 demo 消费的文档，requirements/architecture/external 保持手写 md。
- 2026-10-21 16:52:47 · log · @GuoJia-Agent · 样板跑通（端到端验证 TS 真源方案可行）：docs/design/doc-format.ts(类型 schema) + features/explorer.doc.ts(真源) → scripts/gen-docs.mjs(esbuild 打包 .doc.ts→import→渲染) 生成双投影 docs/design/features/explorer.generated.md + packages/demo/src/doc-data.generated.ts；tsc -p tsconfig.docs.json 类型闸通过。新增 tsconfig.docs.json、gen:docs/typecheck:docs 脚本。待用户看样板后决定全量迁移 + demo 接线。
- 2026-10-21 17:05:05 · log · @GuoJia-Agent · 讨论澄清分类与发布（用户问 demo 分类 + Q1-Q3）：demo 页面 SectionId(button/input/...) 即文档 section.id，gen-docs 聚合为按 id 扁平 docData、demo 按 id 取与文件无关，重分类只改 MAP/文件、demo 不动，--check 校验 id 契约；Q1 区分 gen-docs.mjs(工具在 scripts/) 与 .doc.ts(内容真源在 docs/)；Q2 沿用仓库惯例——生成物入库、build 含 gen:docs、pretest 加 gen:docs --check，发包前/release CI 编译不靠 push 自动发；Q3 core 包 docs/ 发 md+.doc.ts(可选 npmignore 仅 md)，生成器与 demo 的 .generated.ts 不在 core 包内。
- 2026-10-21 17:11:50 · log · @GuoJia-Agent · 用户拍板开工：方案批准（TS 数据模块唯一真源 + 双投影 + 构建期生成入库 + pretest --check + 按 section.id 扁平聚合解耦 demo 与文件）。ship md+.doc.ts（不排除 .doc.ts，Agent 能读即留包内）。直接进入阶段 0：定稿 doc-format.ts + gen-docs 扁平聚合 + --check 闸。
- 2026-10-21 17:21:58 · log · @GuoJia-Agent · 阶段1 启动（design 转换）：design.md → design.doc.ts；schema 的 ApiRow 加可选 required? 以忠实表达源表「必填」列，gen-docs 按是否有 required 条件加列。--check 闸当场拦下 explorer/design 的 overview 撞 id，改全局唯一稳定 id（页面主段=SectionId、子段加前缀）后通过——证明 id 契约有效且能防漂移。design 为 6 份中第 1 份；手写的 design.md 暂保留，阶段1 收尾再覆盖。验证：gen+check+typecheck 全绿。
