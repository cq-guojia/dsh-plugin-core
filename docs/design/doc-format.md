# 文档格式规范（.doc.ts 真源 + 双投影）

## 一句话

所有「既给 demo 展示、也给 Agent 读」的内容，**唯一真源**是 `docs/**/*.doc.ts`（typed 数据模块）。`scripts/gen-docs.mjs` 在构建期把它投影成两份：

- `docs/**/*.md` —— 给 Agent / 人读，随包发布（`files: ["dist","docs"]`）。
- `packages/demo/src/doc-data.generated.ts` —— 给 demo 零解析消费（入库、勿手改）。

本仓既有铁律「真源在别处就不抄第二份」（`docs/README.md` 三条硬约定）在此落为机制：demo 与 md 都从 `.doc.ts` 派生，绝不手写第二份内容。

## 为什么不是 MD 真源

- `md → 数据` 是解析，永远缺斤少甲：转义管道、列头校验、禁多行单元格……防不住子集外的写法。
- `数据 → md` 是渲染，容易且完备。
- TS 两头占：机器侧同 JSON 之强且**类型即 schema**（`tsc` 编译期校验），人侧 prose 走模板字符串（`src/utils/i18n.ts` 59KB 同款先例），零新依赖。
- JSON prose 满篇转义、YAML 要引解析器依赖或手搓子集（重回 fragile），均否。

## 文件组织

| 角色 | 落位 | 说明 |
|---|---|---|
| 真源（手写） | `docs/help/<主题>.doc.ts` | 一主题一文件（`index` / `integration` / `ui` / `design` / `utils` / `explorer` / `session`）；帮助侧唯一的输入 |
| 生成（引用方 / Agent 读） | `docs/help/<主题>.md` | 由 gen-docs 从 `.doc.ts` 生成，覆盖同名手写文件；**勿手改** |
| 生成（demo 消费） | `packages/demo/src/doc-data.generated.ts` | 按 `section.id` 扁平聚合；**勿手改** |

真源只放**帮助侧**（`docs/help/`）：开发侧文档（`requirements.md` / `architecture.md` / `structure.md` /
`external/**` / 本文件 / `copywriting.md`）保持手写 md，不进投影——demo 不展示、无漂移风险。
手写的 `.doc.ts` 若写在别处，必须在 `gen-docs.mjs` 的 `MAP` 里登记才会被处理。

## schema（权威定义在 `docs/design/doc-format.ts`）

```ts
export type Bilingual = { zh: string; en: string }
export type ApiRow = { name: string; type: string; def: string; required?: string; desc: Bilingual }
export type ApiTable = { id: string; rows: ApiRow[] }
export type CodeBlock = { id: string; lang: string; src: string }
export type Section = {
  id: string                         // 全局唯一，且 1:1 对应 demo 的 SectionId
  heading: Bilingual
  prose?: Bilingual[]
  api?: ApiTable[]                  // 一个 section 可有多张表，按数组顺序渲染
  code?: CodeBlock[]
}
export type DocTopic = {
  title: Bilingual
  topics?: string[]
  exports?: string[]
  display?: Record<string, Bilingual>
  sections: Section[]
}
```

## section.id 契约（解耦关键）

- 每个 `section.id` **全局唯一**，且 **1:1 对应** demo 的 `SectionId`（`packages/demo/src/sections/index.tsx`）。
- gen-docs 把所有 `.doc.ts` 的 `sections` **按 id 扁平聚合**成 `docData[id]`；demo 只写 `docData[sectionId]`，与「这段在哪个文件、属于哪个子包」无关。
- **重分类零成本**：拆文件 / 挪 group 只动 `MAP` 和文件内 section 摆放，demo 页（按 id 取）一行不动。
- 重 id → gen-docs 直接报错退出（闸）。`--check` 还会校验「每个 demo `SectionId` 都有对应 doc `section.id`」（见阶段4 测试）。

## 双语

所有用户可见文案都是 `{ zh, en }`。demo 的 `locale` 选对应字段；样式、组件、布局**不进真源**（已在仓库 CSS 生成链 `gen-css.mjs` 单独处理）。

## 类型闸与生成

| 命令 | 作用 |
|---|---|
| `pnpm typecheck:docs` | `tsc -p tsconfig.docs.json` 校验 `.doc.ts` 结构（schema 即闸） |
| `pnpm gen:docs` | 重新生成两份投影 |
| `pnpm gen:docs --check` | 比对已落盘的 `doc-data.generated.ts` 是否最新，不一致退出 1（挂 `pretest`） |

`build` 含 `gen:docs`；`pretest` 含 `gen:docs --check`；`prepublishOnly` 双保险（发布前 regen）。

## 随包与 Agent 读取

- core 包 `files: ["dist","docs"]` 同时发 `.md` 与 `.doc.ts`；Agent 的入口是
  `node_modules/dsh-plugin-core/docs/help/index.md`（按任务挑一份，不必全读）。
- 插件产物不含文档：bundler 不吃 `.md`/`.ts` 文档（无 md/text loader），文档不进 bundle。
- 消费方指引句（抄进各插件项目 `AGENTS.md`）见本仓 `docs/README.md` 阶段5 行。
