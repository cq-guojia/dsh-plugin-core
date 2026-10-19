# AGENTS.md —— 给改这个仓库的 agent

本仓是 `dsh-plugin-core`：DSH 插件的共享底座（npm 包）。**你在这里是改底座的人**，
不是用底座的人——用底座的项目请读 `node_modules/dsh-plugin-core/docs/README.md`。

## 先读这些

1. `README.md` —— 项目是什么
2. `docs/README.md` —— 文档槽位表（**不知道文件在哪就看它**）
3. `docs/design/architecture.md` —— 五个子包怎么分层、依赖方向、不变量
4. `docs/requirements.md` —— 需求与已拍板的决策（**动手前先看，别重新论证已定的事**）

## 改代码前必须知道的事实

这些不是偏好，是**不遵守就会坏**的约束：

| 事实 | 出处 |
|---|---|
| **运行时**必须以 TS 字符串注入 `<style>`（`import './x.css'` 内核不加载）；**源码**写真的 `src/**/*.css`，由 `scripts/gen-css.mjs` 生成 `*.generated.ts`，改样式改 `.css` | `docs/design/architecture.md` §样式注入 |
| 多插件同页必须 `createStyleKit({ id })`，固定 style id 会互相覆盖 | 同上 |
| CSS 变量与类名统一 `dshpc` 前缀（`--dshpc-*` / `dshpc-*`），类名必须与控件硬编码的 className 逐字一致 | `docs/design/style.md` |
| 明暗判据是 `body[data-ds-dark-theme]`，**不是** `prefers-color-scheme` | 同上 |
| `ui` 必须零 `@deepseek-ai/*` 依赖（官方包只在宿主内可解析，依赖它会让整入口 import 失败） | `docs/design/external/dsh-host.md` |
| `utils` 不得依赖 `ui` / React / DOM / 宿主 | `docs/design/architecture.md` §依赖方向 |
| 组件**不自己取数**：数据由调用方经 props / 注入接口给 | `docs/requirements.md` §6 |
| 内置字典新增 key 必须被真正使用（有自检盯着） | `test/no-dead-keys.test.mjs` |
| 打 `vX.Y.Z` tag 即自动发 npm；**demo 与核心版本必须同号**，不允许 `demo-v*` 独立 tag | `test/version-sync.test.mjs` + `.github/workflows/*publish.yml` |

## 常用命令

```bash
pnpm run build        # tsc 出 ESM + d.ts 到 dist/（产物必须入库：宿主装插件不跑构建）
pnpm run build:demo   # demo 插件产物 → packages/demo/dist/（同样入库）
pnpm test             # 全部自检（条数以 test/ 下实际用例为准，不在此写死）
```

## 发版规则（硬约束）

**`tag vX.Y.Z` == 根 `package.json` 的 `version` == `packages/demo/package.json` 的 `version`。**

一个 tag 同时发两个包，两件事一起发生：

| tag | workflow | 发布物 |
|---|---|---|
| `vX.Y.Z` | `.github/workflows/publish.yml` | `dsh-plugin-core` |
| 同一个 | `.github/workflows/demo-publish.yml` | `dsh-plugin-core-demo` |

- **禁止** `demo-v*` 这类独立 tag，**禁止**两个包版本走岔——三处校验会拦住：`test/version-sync.test.mjs`（本地）、两个 workflow（CI）。
- 流程：改两个 `version` 为同一个号 → `pnpm run build && pnpm run build:demo` → commit（含 `dist/`）→ push → `git tag vX.Y.Z && git push origin vX.Y.Z`。
- tag push 触发 GitHub Actions **自动 `npm publish`**，不需要人工点 Run、也不需要去 npm Promote。
- 依赖两件事：npm 侧 Trusted Publisher 对**两个包**都允许 `npm publish`（一次性设置）；workflow 用 Node 22（OIDC 要求 npm CLI ≥ 11.5.1，Node 20 不满足）。

**demo 改动 = 必须发版**：凡是 demo 有改动、需要人看的，一律 bump 版本 + 打 `vX.Y.Z` tag 推送（tag 触发 demo 包自动发布到 npm）。
用户之后在 DSH 插件市场更新该插件即可测试，不必再问要不要发。

**调试期不发 tag**（用户 2026-10-19 定）：宿主真机调试阶段，改动直接 `commit + push` 到 `main` 即可
（`dist/` 随提交入库，git 安装的用户重装/pull 即得最新代码），**不 bump、不打 tag**——
tag 会触发 npm publish，调试期不需要走发布链。问题定位收敛、用户验收通过后，再走正式发版流程
（bump 两包同号 → build → commit → push → tag）。npm 渠道的用户只有 tag 才拿得到，调试期接受。

## 改完的 checklist

- [ ] `pnpm run build` 干净（`noUnusedLocals` / `strict` 全开）
- [ ] `node --test test/*.test.mjs` 全绿
- [ ] 新增导出是否进了对应 `index.ts`（曾漏过 `relativeFuture`）
- [ ] 新增文案 key 是否被使用（死 key 自检会红）
- [ ] 改的是文档 → 落位是否登记在 `docs/README.md`
- [ ] `dist/` 已随提交入库

## 目录速查

```
src/design/    token + createStyleKit（零 React）
src/ui/        控件 + 样式注入器（依赖 design）
src/utils/     纯方法（零 React / DOM）
src/explorer/  工作区浏览 + 预览 + 选工作区/文件
src/session/   会话预览
test/          node:test 自检
docs/          文档（见 docs/README.md）
dist/          构建产物（入库）
ledger/        任务台账（task-ledger skill 管，勿手改）
```
