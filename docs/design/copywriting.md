# 文案撰写规范（.doc.ts 真源里的用户可见文案）

适用：`docs/**/*.doc.ts` 里的 `heading` / `prose` / `api[].desc` / `code[].src`。
由 `scripts/gen-docs.mjs` 投影成两份：`docs/**/*.md`（Agent / 人读，随包发布）与
`doc-data.generated.ts`（demo 站读），所以**一份文案同时喂两个读者**，标准必须两头都成立。
EN: Copy rules for every user-visible string in `docs/**/*.doc.ts`. One source feeds two projections
(`docs/**/*.md` for agents/humans, `doc-data.generated.ts` for the demo site), so each rule must hold for both readers.

## 读者定性

**第一读者是 Agent。** demo 站是同一份文案的人类视图。
Agent 打开文档只问三件事：**这是什么 / 怎么用 / 每个参数是什么**。答完即止。
EN: The primary reader is an agent; the demo site is the human view of the same text. An agent asks only
three things: what is it / how do I use it / what is each argument. Answer those and stop.

## R1 · 禁止过程叙事 · No process narrative

文档记录**现在是什么**，不记录**怎么变成这样**。

| 禁写 | 改写成 |
|---|---|
| 日期、`2026-10-22 解包核实`、`unpack xxx@0.2.0-rc.2` | 直接给结论（结论要溯源就指 `external/` 里的核实文档） |
| `拍板` / `定` / `二次拍板` / `ivc用户接受，不要自行优化` | 写成约束句：`必须 X` / `不要 Y` |
| `推翻此前结论` / `此前以为…后来发现…` | 只写当前成立的事实 |
| `已证伪、勿再尝试` / `某某方案已删` / `备选方案 ` | 删掉。若某写法确实危险，写成约束：`不要用 X（会 Y）` |
| `已接上` / `已对齐官方结构` / `已上线` | 删掉，直接描述当前能力 |

判据：一句话里如果出现了「曾经的另一个状态」，它就是过程，删。
EN: Never record dates, who decided what,推翻/已删/已对齐, or any earlier state. Write the current fact only.
Test: if a sentence contains a previous state of anything, it is process — delete it.

## R2 · 一段一事、一段两句 · One fact per paragraph

- 每段 ≤ 2 句，每段 ≤ 110 字（zh）；每句 ≤ 40 字。
  **反引号内的 API 标识符不计入**（代码块、参数名不是散文，按字数惩罚它们会把有用信息砍掉）。
- 一个 section 的 `prose` ≤ 5 段。写不下 = 拆 section，不是堆段。
- 段首不用「另外 / 同时 / 值得一提」起句。
- 例外：**步骤清单型**（一段一个整数编号步骤、几乎无标点扩充）不受段数限制，它是
  「有一个以上代码块等待处、每步对应一句」的导航条，不是散文。`quickstart` 是例子。
EN: ≤ 2 sentences and ≤ 110 characters (zh) per paragraph. A section carries ≤ 5 prose paragraphs; overflow
means split the section. Exception: **stepped lists** (one numbered step per paragraph, each indexed against
the code blocks below) are navigation, not prose, so the count limit does not apply — `quickstart` is the example.

## R3 · 表格只装参数 · API cells are not essays

`desc` 一格 = 一句话动词短语，写**是什么 / 不给会怎样**：

| 差的写法 | 好的写法 |
|---|---|
| `本包 ui 已零官方依赖；要用官方件就在插件侧自己处理平台模块` | `本包 ui 不依赖官方件；要用请自行处理平台模块` |
| `造型太花时间：因为右侧分栏在场时遮罩已让位，100vw 会溢出到分栏上` | `宽度用遮罩盒的 100%，不要用 100vw（会溢出到右侧分栏）` |
| `归档 = 开分支确认框，未归档 = 直跳官方会话页，当然归档会话不进主视图` | `true = 开分支确认框；false = 直跳官方会话页` |

- 默认值写进 `def`，不写进 `desc`。
- 背景与动机写进 `prose`，不写进表格。
EN: `desc` is one verb phrase stating what it is or what happens without it. Defaults go in `def`, rationale goes in `prose`.

## R4 · 三处不许重复 · Say it once

同一事实只能在 `prose` / `api.desc` / `code` 注释里出现**一次**。
能在表里说清的，不进散文；能在代码里看懂的，不进表。
EN: A fact appears exactly once, in the cheapest slot: table beats prose, code beats table.

## R5 · 保留不变式，丢掉考古 · Keep invariants, drop archaeology

保留：必填项、默认值、失败/降级行为、禁写顾忌、必须成对出现的参数。
删除：调查路径、版本解包、被否方案、工作量描述（「无额外开发」这类）。
EN: Keep required/default/failure behaviour and constraints. Drop investigation paths and rejected alternatives.

## R6 · 双语对译 · Bilingual parity

- `zh` / `en` 是**同一信息的两种语言**，不是翻译腔。术语表固定：`token`、`selector`、`invoke`、`dock`、`snapshot`、`fallback`、`mask`（EN 侧统一拼写，不用 Modal/弹出）。
- 两个字段的段数、句数、信息量相同 —— `en` 不得比 `zh` 少半句或多一整段背景。
- 代码块里的注释跟着 `lang` 走：代码块本身不双语，注释用英文。
EN: `zh`/`en` carry identical information in identical shape — same count of paragraphs and facts.
Code comments are English-only.

## R7 · 格式与字段不变 · Format is frozen

`id` / `heading` / `prose` / `api` / `code` 字段与 `section.id` 一律不动（demo 站按 id 取值）。
本次只改文案内容，不改结构。新增/删除 section 是另一次变更。
EN: Field names and `section.id` values are frozen — the demo reads entries by id. Only copy changes here.

## 自检

改完跑：

```bash
pnpm gen:docs && pnpm typecheck:docs
```

复审清单：① 全文搜 `\d{4}-\d{2}-\d{2}` 应零命中；② 搜 `拍板|推翻|证伪|已删|改造|当前不同的是` 应零命中；
③ 任一 section 的 prose 段数 ≤ 4；④ 抽 3 条 desc，确认「一句话说得清」。
EN: After editing run `pnpm gen:docs && pnpm typecheck:docs`. Review checklist: zero date hits, zero process-word hits,
≤ 4 prose paragraphs per section, three sampled `desc` values readable in one breath.
