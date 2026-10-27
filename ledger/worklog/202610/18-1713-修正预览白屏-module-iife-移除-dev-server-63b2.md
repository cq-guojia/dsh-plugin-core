# 20261018-1713-修正预览白屏-module-iife-移除-dev-server-63b2：修正预览白屏：module→IIFE，移除 dev server

- **标签**：缺陷修复、demo、构建
- **状态**：closed · 2026-10-18 17:14:03 · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6
- **创建**：2026-10-18 17:13:54 · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6
- **封卷**：2026-10-18 17:14:03 · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6

<!-- 头部四行由脚本维护，顺序固定：标签 → 状态 → 创建 → 封卷。
     「- **标签**：…」按 new --tags 插在最上面，没有标签就不写（分类只进台账与历史，不进本文档）；
     「- **封卷**：…」在结案时加在最后。 -->

## 背景

用户双击 `demo-dist/index.html` 得到**白屏**；GitHub Pages 404、workflow 报
`configure-pages` 拿不到 Pages 站点。并明确要求：**不要本地起进程、不要留莫名其妙的东西**。

## 待办

无。

## 下一步

用户双击验证；若要 Pages，按 README 启用后手动触发 workflow。

## 过程

**白屏根因**：Vite 的 HTML 插件把入口脚本固定输出成
`<script type="module" crossorigin src="./assets/index.js">`。
浏览器在 **`file://` 协议下拒绝加载 ES module 脚本**（CORS 限制）⇒ 什么都不执行 ⇒ 白屏。
与路径无关（`base: './'` 已生效），是 module 本身在 `file://` 下不可用。

**修法**：绕开 Vite 出产物，改用自写 `demo/build.mjs` 调 **esbuild**：
`format: 'iife'` + `globalName` + `inlineDynamicImports` ⇒ 单文件普通 script，
产物 `<script defer src="./assets/index.js">`，双击即开。

**按用户要求移除 dev server**：
- 删 `demo` 脚本（`vite` dev server）
- 删依赖 `vite` / `@vitejs/plugin-react`，devDep 只留 `esbuild`
- 删 `vite.config.ts`
- 清理残留进程与 `/tmp/demo.log`

**Pages 报错处置**：`configure-pages` 失败是因为仓库**没有启用 Pages**（Not Found），
非配置错误。workflow 改为**仅 `workflow_dispatch`**（不再每次 push 报红），
并加 `enablement: true`——手动运行时尝试自动启用；用户也可在
Settings → Pages → Source 选 "GitHub Actions"。

## 结论

| 项 | 结果 |
|---|---|
| 预览产物 | 单文件 IIFE 329 KB，`node --check` 语法通过 |
| script 标签 | `<script defer src="./assets/index.js">`（非 module）|
| dev server | 已移除（脚本/依赖/配置全删，0 残留进程）|
| 主包构建 / 自检 | 0 error / 35 条全过 |
| Pages | 改手动触发 + enablement，未启用时不再报红 |

留坑：
- **未在真实浏览器里双击验证**（环境无 GUI 浏览器），只做了产物结构与语法检查。
- `ledger` 里旧任务 worklog（`18-1625`）仍写着「pnpm run demo 起 5180」——那是当时的事实记录，
  按台账规矩不改历史；以本任务为准。

## 执行记录

<!-- 本节由脚本维护：new / claim / set / release / log / close 自动追加，请勿手改。
     补记用 progress.py log --id <任务号> --note "一句话"。 -->
