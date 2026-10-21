# 20261021-1151-core-文档随包分发-agent-可读文档机制-demo-与-docs-真源统-ebe3：core 文档随包分发：Agent 可读文档机制 + demo 与 docs 真源统一

> **创建**：2026-10-21 11:51:26（@GuoJia-Agent）
> **分类**：基建 ｜ **标签**：文档、分发、demo、Agent、真源

<!-- 「> **分类**：… ｜ **标签**：…」行由脚本按 new --category / --tags 插入；两者皆空则不写。 -->

## 背景

<!-- 为什么做：触发它的原话 / 现象 / 链接 -->

## 待办

<!-- 还没做的、没验证的、等别人给东西的 -->

## 下一步

<!-- 下一个具体动作（文件:行号 级别），不要写「继续推进」 -->

## 过程

<!-- 踩坑与证据：带 revision + 文件:行号 或符号名 -->

## 结论

<!-- 做成了什么、留了什么坑 -->

## 执行记录

<!-- 本节由脚本维护：new / claim / set / release / log / close 自动追加，请勿手改。
     补记用 progress.py log --id <任务号> --note "一句话"。 -->
- 2026-10-21 11:51:26 · new · @GuoJia-Agent · 创建任务（doing）
- 2026-10-21 11:52:29 · log · @GuoJia-Agent · 三专家调研完成：docs 已在 npm files 内且 bundler 不吃 md（产物不带文档已成立）；demo 13 处写死内容与 docs 同源；docs 零 frontmatter 无机器可读索引；demo 双语 vs docs 纯中文有冲突。已产出 A/B/C 三方案待用户选型（推荐 B：MD 真源 + frontmatter 索引 + gen-docs.mjs 生成 + --check 闸）。
- 2026-10-21 12:04:55 · log · @GuoJia-Agent · 用户否决最省式折中，定单一真源硬标准：demo 每字每表在 demo 源码无第二份、demo 只管显示。定稿方向：md 真源（frontmatter display{zh,en}+五列 API 表+带 id 代码块）→ gen-docs.mjs 生成 → demo 删 DICT 与硬编码改纯渲染；skill 列二期。注意 ledger log 前拉远端会覆盖未提交正文（本轮已被覆盖一次，已重写补回）。
