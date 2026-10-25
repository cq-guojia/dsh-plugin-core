# dsh-plugin-core

DSH（DeepSeek Harness）插件共享底座：把跨插件复用的样式、控件、通用方法、工作区浏览、会话预览收敛到一处，写新插件时按文档 `npm i` 引用，不再一个个仓库抄。

服务对象：以后要写的每一个 DSH 插件（不只是现有的几个）。

## 先看效果：装上预览插件

最快的方式——直接把预览插件装进 DSH 宿主，看真实渲染（明暗、token 全部跟随宿主，**不走任何独立网页**）：

```bash
dsh plugin --profile web add dsh-plugin-core-demo
```

装好后：插件列表 → 找到 `dsh-plugin-core-demo` → 进插件详情页就有「组件预览」入口，点开即整页预览；详情页下方还有配置区（侧栏入口开关、查看 demo、访问 GitHub）。

> 预览插件是仓库里的独立包 `packages/demo/`（包名 `dsh-plugin-core-demo`）。它把 core 的构建产物打进自己的 bundle，自包含、不需要 core 先发 npm，预览的永远是当前这份代码。

## 用这个包写插件

```bash
pnpm add dsh-plugin-core
```

（npm 也行；推荐 pnpm。）包里带预编译 `dist`——宿主以 git/npm 装插件不跑构建脚本，产物必须随包发布。`react` 是 optional peer：只用 `utils` / `design` 的插件不必装。

```ts
import { createStyleKit } from 'dsh-plugin-core/design'
import { Button, ensureControls, setStyleKit } from 'dsh-plugin-core/ui'

setStyleKit(createStyleKit({ id: 'dsh-task-reminder-ui' })) // 1) 领本插件专属样式设施（id 按插件唯一）
ensureControls()                                          // 2) 挂 token + 控件样式（幂等）
const view = <Button variant="primary" onClick={save}>保存</Button> // 3) 直接用控件
```

为什么必须先 `setStyleKit`：样式只能以字符串在运行时注入 `<style>`（客户端产物是 JS 闭包，`.css` 不加载）。固定 style id 在多插件同页时会互相覆盖，所以做成工厂，每个插件领一套自己的；变量前缀统一 `dshpc`，不再按插件区分。

## 子包

| 引入路径 | 装什么 |
|---|---|
| `dsh-plugin-core/design` | token 变量表（含深色段）+ `createStyleKit` 注入器工厂 + 主题判据（零 React） |
| `dsh-plugin-core/ui` | 控件：Button / Input 家族 / Textarea / Checkbox / Segmented / Select / Picker / ModelPicker / DateTimePicker / Modal / toast / 空态 / 错误边界 / Loading … |
| `dsh-plugin-core/utils` | 纯方法：日期 / 字符串 / 字节 / 时间区间 / HTTP 取数 + 内置中英多语言 |
| `dsh-plugin-core/explorer` | 工作区浏览：`openFilePreview` / `pickWorkspaceFile` / `FileBrowser` 面板 |
| `dsh-plugin-core/explorer/preview` | 文件预览体（md / 代码高亮 / HTML / PDF / Office / 图片） |
| `dsh-plugin-core/session` | 会话预览（承载可换：弹窗 / 侧栏 / 整页） |

依赖方向单向：`design` ← `ui` ← `explorer` / `session`，`utils` 谁也不依赖。

立包判据：有实质内容、会持续长大的功能模块才独立成包；只是一个控件就进 `ui`。

## 几条硬规矩

- 不传整个 `ctx`：只传需要的那一小块能力，宿主 breaking 时改的是插件「取出」的一行。
- 明暗判据是 `body[data-ds-dark-theme]`，不是 `prefers-color-scheme`。
- 多语言：核心自带中英（`setLocale('zh' | 'en')` 切换），插件自己界面的文案由插件自己管。
- 数据调用方给：选工作区 / 选文件 / 会话预览的数据要跨 host↔client 边界，组件取不到。

## 多语言

```ts
import { setLocale } from 'dsh-plugin-core/utils'
setLocale('en') // 默认中文
```

## 文档

| 我想… | 看哪 |
|---|---|
| 用这个包写插件 | [`docs/help/index.md`](docs/help/index.md) |
| 从零接入一个插件 | [`docs/help/integration.md`](docs/help/integration.md) |
| 查为什么这么设计 | [`docs/requirements.md`](docs/requirements.md) |
| 改这个仓库本身 | `AGENTS.md` → [`docs/README.md`](docs/README.md) |

## 组件预览插件（packages/demo/）

库本身是纯库：只有六个子路径导出，没有 main、没有 dsh 字段、零运行时依赖。预览用的插件是仓库里的独立 npm 包 `packages/demo/`（包名 `dsh-plugin-core-demo`）。

本地改了 core 想看效果：

```bash
pnpm run build        # 先构建库
pnpm run build:demo   # 构建预览插件 → packages/demo/dist/{index.js,client.js}
dsh plugin --profile web add dsh-plugin-core-demo   # 本地路径安装即预览当前代码
```

> 旧版「双击 HTML 的独立预览站」（`demo-dist/` + `demo:build` + GitHub Pages）已废弃删除：它不走宿主，与 harness 脱节。`explorer` / `session` 的宿主数据仍是 mock 的（`packages/demo/src/mock.ts`）。

## 发布（打 tag 即发布）

核心与 demo 共用同一个版本号，一个 tag 同时发两个包：

```bash
# 1. 两个 package.json 的 version 改成同一个号
# 2. 构建 + 提交（dist/ 必须入库）
pnpm run build && pnpm run build:demo
git add -A && git commit -m "发布 0.3.0" && git push
# 3. 打 tag 即触发 GitHub Actions 自动发布
git tag v0.3.0 && git push origin v0.3.0
```

| tag | 谁在发 | 发到哪 |
|---|---|---|
| `v0.3.0` | `.github/workflows/publish.yml` | `dsh-plugin-core` |
| 同上 | `.github/workflows/demo-publish.yml` | `dsh-plugin-core-demo` |

硬规则：`tag vX.Y.Z` == 根 `package.json` 的 `version` == `packages/demo/package.json` 的 `version`，三者不一致时 workflow 直接失败。**没有 `demo-v*` 这种独立 tag。** 一次性前置：npm 网页 Settings → Trusted Publisher 勾上 `npm publish`。
