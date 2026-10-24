# dsh-plugin-core

DSH（DeepSeek Harness）插件共享底座：把跨插件复用的样式、控件、通用方法、工作区浏览、
会话预览收敛到一处，写新插件时按文档 `npm i` 引用，不再一个个仓库抄。

**服务对象：以后要写的每一个 DSH 插件**（不是现有的某三个）。完整需求见 [`docs/requirements.md`](docs/requirements.md)。

> **状态**：🚧 可用但**未在真实插件里接入验证过**（见下方「还没做的事」）

## 预览（装在真实宿主里看）

控件**不在独立网页里预览**。仓库里的 `packages/demo/`（包名 `dsh-plugin-core-demo`）是装进 DSH 宿主的预览插件，在真实 harness 里渲染，明暗与 token 全部跟随宿主。用法见下方「组件预览插件（packages/demo/）」一节。

> 旧版「双击 HTML 的独立预览站」（`demo-dist/` + `demo:build` 脚本 + GitHub Pages 部署）已**废弃删除**：它不走宿主、语言 / 明暗靠自带选择器，与 harness 脱节。`explorer` / `session` 的宿主数据仍是 mock 的（现位于 `packages/demo/src/mock.ts`）。

## 文档在哪

| 我想… | 看哪 |
|---|---|
| **用这个包写插件** | [`docs/help/index.md`](docs/help/index.md)（**帮助索引**：按任务挑一份读） |
| 从零接入一个插件 | [`docs/help/integration.md`](docs/help/integration.md) |
| 改这个仓库本身 | `AGENTS.md` → [`docs/README.md`](docs/README.md)（槽位表） |
| 查为什么这么设计 | [`docs/requirements.md`](docs/requirements.md) |

文档分两区：**帮助侧** `docs/help/`（引用方看，随包发布）／**开发侧** `docs/design/`、`AGENTS.md`（维护者看）。
两区之间不交叉引用——**引用一律走根 README 这张表与 `docs/help/index.md`**。

## 安装

```bash
pnpm add dsh-plugin-core
```

（npm 也能用；推荐 pnpm。）
包里带预编译 `dist`（宿主以 git/npm 装插件**不跑构建脚本**，产物必须随包发布）。
`react` 是 optional peer：只用 `utils` / `design` 的插件不必装。

## 快速开始

```ts
import { createStyleKit } from 'dsh-plugin-core/design'
import { Button, ensureControls, setStyleKit } from 'dsh-plugin-core/ui'

// 1) 领一套本插件专属的样式设施：id 按插件唯一（多插件同页靠它互不覆盖）
setStyleKit(createStyleKit({ id: 'dsh-task-reminder-ui' }))
// 2) 挂上 token + 控件样式（幂等，可反复调）
ensureControls()

// 3) 直接用控件，不再自己写原生 input
const view = <Button variant="primary" onClick={save}>保存</Button>
```

**为什么必须先 `setStyleKit`**：样式只能以字符串在运行时注入 `<style>`（客户端产物是 JS 闭包，
`.css` 文件内核不加载）。固定 style id 在多插件同页时会互相覆盖，所以做成工厂，每个插件领一套自己的；
变量前缀则统一为 `dshpc`，不再按插件区分。

## 子包

| 引入路径 | 装什么 |
|---|---|
| `dsh-plugin-core/design` | token 变量表（含深色段）+ `createStyleKit` 注入器工厂 + 主题判据（**零 React**） |
| `dsh-plugin-core/ui` | 控件：Button / Input 家族 / Textarea / Checkbox / Segmented / Select / Picker / ModelPicker / Modal / toast / 空态 / 错误边界 / Loading … |
| `dsh-plugin-core/utils` | 纯方法：日期 / 字符串 / 字节 / 时间区间 / HTTP 取数 + 内置中英多语言 |
| `dsh-plugin-core/explorer` | 工作区浏览：`openFilePreview`（侧边栏预览）/ `pickWorkspaceFile`（弹窗选文件）/ `FileBrowser` 面板 |
| `dsh-plugin-core/explorer/preview` | 文件预览体（md / 代码高亮 / HTML / PDF / Office / 图片） |
| `dsh-plugin-core/session` | 会话预览（承载可换：弹窗 / 侧栏 / 整页） |

依赖方向单向：`design` ← `ui` ← `explorer` / `session`，`utils` 谁也不依赖。

**立包判据**（防止子包无限膨胀）：有实质内容、会持续长大的**功能模块**才配独立成包；
只是一个控件就进 `ui`。统一到「控件」粒度就够了，不要提整个页面。

## 几条硬规矩

- **不传整个 `ctx`**：只传需要的那一小块能力（`WorkspaceFilesFace` / `SessionSource`），
  宿主 breaking 时改的是插件「取出」的一行，包不用动。
- **明暗判据是 `body[data-ds-dark-theme]`**，不是 `prefers-color-scheme`（后者跟系统，
  不跟用户在宿主里的选择）。
- **多语言**：核心提供什么就负责它的多语言（包内固定提示语自带中英，`setLocale('zh' | 'en')` 切换）；
  插件自己界面的文案由插件自己管。
- **数据调用方给**：选工作区 / 选文件 / 会话预览都要数据 —— 那些数据要跨 host↔client 边界，
  通道是插件私有的，组件取不到。

## 多语言

```ts
import { setLocale } from 'dsh-plugin-core/utils'
setLocale('en') // 中文是默认
```

## 还没做的事

按重要性排：

1. **没在真实插件里接入验证过** —— 编译 + 27 条自检通过，但**一条渲染测试都没有**。
   浏览器里的真实外观、注入器挂载、控件交互都未验。
2. **会话预览只有最简渲染** —— `mirror/` 里那套官方会话 UI 镜像（工具卡 / 代码块 / 推理行等）
   还没搬进来，富内容要走 `renderMessage` 扩展点。
3. **文件预览只有文本 / 图片** —— 代码无语法高亮（不引 `@codemirror/*`），
   PDF / Office 显示「暂不支持预览」。
4. **类名未做版本隔离** —— CSS 类名统一 `dshpc-*`，两个插件若引的 core 版本不同会互相覆盖
   （同版本无害）。隔离靠 style 标签 id。
5. 设置页骨架没抽（等第二个消费者）。

## 发布（打 tag 即发布，无需人工 Promote）

核心与 demo 插件**共用同一个版本号**，一个 tag 同时发两个包：

```bash
# 1. 两个 package.json 的 version 改成同一个号（本地自检与 CI 都会校验）
# 2. 构建 + 提交（dist/ 必须入库）
pnpm run build && pnpm run build:demo
git add -A && git commit -m "发布 0.1.3" && git push
# 3. 打 tag 即触发 GitHub Actions 自动发布
git tag v0.1.3 && git push origin v0.1.3
```

| tag | 谁在发 | 发到哪 |
|---|---|---|
| `v0.1.3` | `.github/workflows/publish.yml` | `dsh-plugin-core` |
| 同上 | `.github/workflows/demo-publish.yml` | `dsh-plugin-core-demo` |

硬规则：`tag vX.Y.Z` == 根 `package.json` 的 `version` == `packages/demo/package.json` 的 `version`，
三者不一致时 workflow 直接失败，不会发布半套。**没有 `demo-v*` 这种独立 tag。**

一次性前置（npm 网页，两个包各做一遍）：Settings → Trusted Publisher 里允许的 actions 勾上 `npm publish`。

## 组件预览插件（packages/demo/）

库本身是**纯库**：只有六个子路径导出，没有 main、没有 dsh 字段、零运行时依赖。

预览用的插件是仓库里的**独立 npm 包** `packages/demo/`（包名 `dsh-plugin-core-demo`）：它把 core 的构建产物
打进自己的 bundle ⇒ 自包含、**不需要 core 先发 npm**，预览的也永远是当前这份代码。

```bash
pnpm run build        # 先构建库（demo 包引用 dist/）
pnpm run build:demo   # 构建预览插件 → packages/demo/dist/{index.js,client.js}
dsh plugin --profile web add dsh-plugin-core-demo
```

装好后：插件列表 → 本插件 → 设置页里的「组件预览」卡片 → 点开即整页预览（或点侧栏图标）。
插件在**真实宿主**里渲染，明暗与 token 全部跟随宿主。
