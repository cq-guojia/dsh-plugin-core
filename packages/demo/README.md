# dsh-plugin-core-demo

在 **真实 DSH 宿主**里预览 `dsh-plugin-core` 的控件与业务组件的插件。

它和库是完全分开的两个 npm 包（库是纯库，只有子路径导出；本包是插件）：

| | 包 | 用途 |
|---|---|---|
| 库 | `dsh-plugin-core` | 各插件按子路径引用（`/ui` `/utils` `/design` …） |
| 插件 | `dsh-plugin-core-demo`（本包） | 装进 DSH，宿主内预览 |

## 构建

```bash
# 在仓库根先构建库（本包引用 ../../dist/）
pnpm run build
# 再构建本包 → dist/index.js（server 壳）+ dist/client.js（预览页 bundle）
pnpm run build:demo
```

`dist/` 与 `src/` 一起入库：宿主安装插件时**不跑构建脚本**。

## 发布与安装

**不要在本目录手跑 `npm publish`。** 本包与核心共用同一个 `vX.Y.Z` tag，由
`.github/workflows/demo-publish.yml` 自动发布；版本必须与根 `package.json` 完全一致
（`test/version-sync.test.mjs` 与 CI 都校验，不一致直接失败）。

```bash
git tag v0.1.3 && git push origin v0.1.3      # 在仓库根：一次 tag 发库 + 本包
dsh plugin --profile web add dsh-plugin-core-demo
```

装好后：插件列表 → 本插件 → 设置页里的「组件预览」卡片 → 点开即整页预览；也可点侧栏图标。

## 实现要点

- client 侧只导出 `apply`；依赖一律 `ctx.inject([...], cb)` 内等待（顶层导出 `inject` 会卡死宿主启动）。
- 三块注册（`sidebar.panellist` / `main` / `settings.plugin.item`）各自 `ctx.inject`、自成一块；
  `settings.plugin.item` 与 `main` 的 key 必须 = 包名（宿主机制）。
- 变量前缀用本插件独有的 `dshpc`，**不占用 `--tdt-*`**（宿主里别的插件在用）；
  展示代码里的 `--tdt-*` 由 `src/client/token-alias.ts` 那层别名接过去。
- 零运行时依赖：不引内部 `@deepseek-ai/*`，故不声明 schemastery Config。
