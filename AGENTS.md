# AGENTS.md —— 给改这个仓库的 agent

本仓是 `dsh-plugin-core`：DSH 插件的共享底座（npm 包）。你在这里是改底座的人，不是用底座的人
——用底座的项目读 `node_modules/dsh-plugin-core/docs/README.md`。

上层注入的公用 / 开发类 / DSH 插件类规则优先。本文分两节：**禁止**每条都挂着会红的闸（跑 `pnpm test`
就会撞上），**约定**没有闸、靠判断。

## 禁止

- `@deepseek-ai/*` 只许 `src/ui/official.ts` 静态 import。官方包是宿主内核的平台模块，宿主外
  （node 自检、根预览站）解析不到 —— 别处 import 会让整个入口崩；其余文件一律经 `official.ts` 消费。
  （`test/dependency-guards.test.mjs`）
- `utils` 不得依赖 React / 宿主模块 / `ui`：它要能在 node 里裸跑，只许同层 `./` 与 node 内置。
  DOM 只许带 `typeof` 守卫的只读探测（现状唯一一处是 `utils/i18n.ts` 读 `<html lang>` 定语言）。
  （同上）
- 不得新增未被使用的内置字典 key（`test/no-dead-keys.test.mjs`）。
- 核心与 demo 版本必须同号：`test/version-sync.test.mjs` + 两个 publish workflow 各自校验
  tag / core / demo 三同号。
- 不得手改生成物 —— 改它要么被覆盖、要么直接被拦：
  - `dist/**`：`pnpm run build` 会重写，手改等于没改。
  - `*-css.generated.ts`、`packages/demo/src/doc-data.generated.ts`：`gen-css --check` /
    `gen-docs --check` 挂在 `pretest` 上报错。
  - `docs/api/*.md`、`docs/guides/*.md`：手改会被 `gen-docs` **无条件重写且不报错**（`--check` 只比对
    doc-data）。要改文档就改同名 `.doc.ts`。
- 色值只许写在 `src/design/tokens.css`（例外须同行标 `token-ok`）；界面中文只许走 `t()`；
  新增 `.css` 必须登记 `scripts/gen-css.mjs` 的 MAP，并与 `*-css.generated.ts` 同目录成对。
  （`test/css-discipline.test.mjs` / `test/no-hardcoded-copy.test.mjs` / `test/css-contract.test.mjs` /
  `test/ui-taxonomy.test.mjs`）
- 新增控件必须同时登记 `scripts/ui-entries.mjs` 与 `package.json` 的 `exports`（禁通配）；
  `sideEffects` 保留 `./dist/ui/official.js`。（`test/entry-surface.test.mjs`）

## 约定（没有闸，靠判断）

- 取数主体别搞混：通用控件只吃 props；`ModelPicker` / `WorkspacePicker` / `openFilePreview` /
  `pickWorkspaceFile` 自取。判据表在 `docs/architecture/overview.md` §数据从哪来，本文不复述。
  （`FileBrowser` 的 `workspaceAnchors` 是 props 优先、宿主快照只作缺省，不算自取。）
- 发版只打 `v<version>`。两个 workflow 的 tag trigger 都是 `v*`，打 `demo-v*` 既不会发布也不会报错
  —— 打错了要自己删 tag。

## 改完必做

- `pnpm run build` → `pnpm test` → `pnpm run typecheck` → `pnpm run build:demo`。
- 一律 `pnpm test`，不要 `node --test`：`pretest` 串了 `gen-css --check` / `gen-docs --check` / 两遍 tsc，
  直连 node 会静默跳过它们。`test/*.test.mjs` 一律 import `dist/`，先 build 才有产物
  （`pretest` 的 tsc 是 emit）。
