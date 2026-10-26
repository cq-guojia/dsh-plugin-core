# 20261018-0302-工程骨架-exports-tsconfig-tsdown-出-dist-106e：工程骨架：exports + tsconfig + tsdown 出 dist

> **✅ 完成封卷**：2026-10-18 03:05:19（@GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6）
> **创建**：2026-10-18 03:02:52（@GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6）
> **分类**：建设 ｜ **标签**：打包、tsdown、骨架

## 背景

需求文档 `docs/requirements.md` 定稿后开工的第一个实施任务。无人值守模式：用户授权自行决策 +
自行 close。要求：一个子包一个任务，做完一个 close 一个。

## 待办

无（已做完）。后续任务见「下一步」。

## 下一步

建任务做 `design` 子包：token 表（前缀参数化，含 `body[data-ds-dark-theme]` 深色段）+
`createStyleKit({ id, prefix })` 注入器工厂。

## 过程

**关键裁决：本包是「库」，不是「插件」⇒ 产物形态跟兄弟仓不一样。**

- 兄弟仓 `dsh-task-dispatch-table/tsdown.client.config.ts:35-57`：产物是**单文件 CJS 闭包**，
  外面套 `window.__ModuleLoader__.load({ id, factory: (require) => { ... } })` —— 那是**插件入口**的契约。
- 本包被插件 `import` 后由插件的 tsdown 内联（`alwaysBundle` 会把非 PLATFORM_MODULES 全打进去），
  **不需要**也不能套 `__ModuleLoader__` 包装 ⇒ 产出**正常 ESM + `.d.ts`**。
- **因此不用 tsdown，用 `tsc`**：per-subpackage 输出 ESM + d.ts，目录结构与 exports 一一对应，
  且消费方 bundler 对 per-file ESM 的 tree-shaking 效果最好。零额外构建依赖。

**落地的东西**：

- `tsconfig.json`：ES2020 / DOM、module ESNext + moduleResolution Bundler、`rootDir: src` → `outDir: dist`、
  `declaration` + `declarationMap` + `sourceMap`、strict + `noUncheckedIndexedAccess`。
- `package.json`：
  - `exports` 六个子路径（`./design` `./ui` `./utils` `./explorer` `./explorer/preview` `./session`），
    每个都带 `types` + `default`。
  - `react` / `react-dom` / `@deepseek-ai/dsh-client-ui-primitives` 全部 **optional peer**
    （这样只用 `utils` / `design` 的插件不必装 React）。
  - `sideEffects: false`（前提是模块顶层不执行注入，由 design 保证）。
  - `files: ["dist"]`；dist **入库**（宿主装插件不跑构建脚本，产物必须随包发布）。
- `src/<子包>/index.ts` 占位 6 个，`npm run build` 跑通，dist 下 js/d.ts 齐全。

**踩坑**：无。装 typescript 5.9.3 时本仓无 node_modules，直接 `npm i -D` 成功。

## 结论

骨架通了：`npm run build` 出 dist（js + d.ts + sourcemap），六个子路径导出已声明。

留坑：
- 六个 `index.ts` 目前是占位（`export {}`），内容由后续子包任务逐个填充。
- 尚未验证「消费方 bundler 能否正确 tree-shake 按子路径引入」—— 要等第一个消费者接入任务验证。
- 还没写 smoke 测试（`npm test` 指向 `test/*.test.mjs`，目录已建但为空）。

## 执行记录

<!-- 本节由脚本维护：new / claim / set / release / log / close 自动追加，请勿手改。
     补记用 progress.py log --id <任务号> --note "一句话"。 -->
