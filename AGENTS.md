# AGENTS.md —— 给改这个仓库的 agent

本仓是 `dsh-plugin-core`：DSH 插件的共享底座（npm 包）。**你在这里是改底座的人**，
不是用底座的人——用底座的项目请读 `node_modules/dsh-plugin-core/docs/README.md`。

上层注入的公用 / 开发类 / DSH 插件类规则优先。本文只写本仓特有、**不遵守就会坏**的事，不复述上层规则。

## 先读哪里

- 项目是什么：根 `README.md`；文档槽位与阅读顺序：`docs/README.md`（唯一索引）。
- 架构与不变量：`docs/design/architecture.md`；需求与已拍板决策：`docs/requirements.md`。
- 代码分层、目录、对外入口判据：`docs/design/structure.md`（唯一真源，本文不复述目录）。

## 禁止

- 禁止 `ui` 依赖 `@deepseek-ai/*`：官方包只在宿主内可解析，会让整入口 import 失败。
- 禁止 `utils` 依赖 `ui` / React / DOM / 宿主。
- 禁止组件自己取数：数据一律由调用方经 props / 注入接口给。
- 禁止新增未使用的内置字典 key：`test/no-dead-keys.test.mjs` 会红。
- 禁止 `demo-v*` 独立 tag，禁止两包版本走岔：`test/version-sync.test.mjs` 与两个 publish workflow 会拦。
- 禁止只跑 `node --test`：会跳过 `pretest` 的 `gen-css --check` / `gen-docs --check` 与两遍 tsc，一律 `pnpm test`。
- 禁止手改生成物：`*-css.generated.ts`、`docs/help/*.md`、`packages/demo/src/doc-data.generated.ts` 由脚本生成。

## 改完必做

- `pnpm run build` → `pnpm test` → `pnpm run typecheck` → `pnpm run build:demo`；`dist/` 随提交入库。
- 新增控件登记 `scripts/ui-entries.mjs` 与 `package.json` 的 `exports`：`test/entry-surface.test.mjs` 会拦漏项。
- 改文档按 `koc-code-docwriter` skill 记日志并跑 `check`；落位登记在 `docs/README.md`。
- 发版规则与发布链细节见根 `README.md` 与 `.github/workflows/*publish.yml`。
