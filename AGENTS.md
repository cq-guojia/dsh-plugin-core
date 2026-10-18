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
| 样式只能以 TS 字符串在运行时注入 `<style>`，`import './x.css'` 内核不加载 | `docs/design/architecture.md` §样式注入 |
| 多插件同页必须 `createStyleKit({ id, prefix })`，固定 id / 前缀会互相覆盖 | 同上 |
| CSS **只换变量前缀** `--tdt-`，类名 `dsh-tdt-*` 必须与控件里硬编码的 className 一致 | `docs/design/style.md` |
| 明暗判据是 `body[data-ds-dark-theme]`，**不是** `prefers-color-scheme` | 同上 |
| `ui` 必须零 `@deepseek-ai/*` 依赖（官方包只在宿主内可解析，依赖它会让整入口 import 失败） | `docs/design/external/dsh-host.md` |
| `utils` 不得依赖 `ui` / React / DOM / 宿主 | `docs/design/architecture.md` §依赖方向 |
| 组件**不自己取数**：数据由调用方经 props / 注入接口给 | `docs/requirements.md` §6 |
| 内置字典新增 key 必须被真正使用（有自检盯着） | `test/no-dead-keys.test.mjs` |

## 常用命令

```bash
pnpm run build        # tsc 出 ESM + d.ts 到 dist/（产物必须入库：宿主装插件不跑构建）
pnpm test             # 全部自检（当前 33 条）
```

## 本机 pnpm 环境（硬链接要生效的前提）

本机 `/code` 与 `/opt/node-persist` 是**两个独立挂载点**（FUSE），硬链接跨不过去
（实测 `ln` 报 `Invalid cross-device link`；`stat -c %d` 显示同设备号是假象）。
故 store 已迁到与项目同一挂载点：

| 项 | 值 |
|---|---|
| store 目录 | `/code/dsh-plugins/.pnpm-store`（三仓共用） |
| 配置位置 | `/root/.config/pnpm/config.yaml` 的 `storeDir`（**机器级，未进仓**） |
| 硬链接生效比例 | 97.6%（inode 对账实测） |

换机器 / 重装环境后要重设一次：

```bash
pnpm config set store-dir /code/dsh-plugins/.pnpm-store
```

不设的后果：pnpm 会把 store 放回 `/opt/node-persist`，硬链接静默降级为 copy，
多仓共享省空间的好处消失（单仓体积也会涨约 30%）。

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
