# dsh-plugin-core

DSH（DeepSeek Harness）插件共享底座：把跨插件复用的样式、控件、通用方法、工作区浏览、
会话预览收敛到一处，写新插件时按文档 `npm i` 引用，不再一个个仓库抄。

**服务对象：以后要写的每一个 DSH 插件**（不是现有的某三个）。完整需求见 [`docs/requirements.md`](docs/requirements.md)。

> **状态**：🚧 可用但**未在真实插件里接入验证过**（见下方「还没做的事」）

## 预览（双击 HTML，不起任何服务）

不想读文档？所有控件**实时可点**，右上角切明暗 / 中英。

```bash
pnpm install
pnpm run build        # 先出 dist（预览站消费的就是它）
pnpm run demo:build   # 生成静态文件到 demo-dist/
```

然后**用浏览器打开 `demo-dist/index.html`**（双击即可）。

产物是**单文件 IIFE + 相对路径**，所以 `file://` 能直接跑：
- 不用起 dev server、不占端口
- 目录可以随便挪，拷到别的机器上也能打开

> 已放到网上：仓库 Settings → Pages → Source 已选 **GitHub Actions**，`on: push` 自动部署，
> 地址 `https://cq-guojia.github.io/dsh-plugin-core/`，每次 push 自动更新。

预览站用的就是**同一份 `dist/` + 同一套样式注入代码**（`setStyleKit` + `ensureControls`），
与真实插件走同一条渲染路径——你在预览里看到的就是插件里得到的。
`explorer` / `session` 的宿主数据是 mock 的（`demo/mock.ts`）。

## 文档在哪

| 我想… | 看哪 |
|---|---|
| 知道每个包提供什么、怎么用 | [`docs/README.md`](docs/README.md)（槽位表）→ [`docs/design/features.md`](docs/design/features.md) |
| 从零接入一个插件 | [`docs/examples/integration.md`](docs/examples/integration.md) |
| 改这个仓库本身 | `AGENTS.md` |
| 查为什么这么设计 | [`docs/requirements.md`](docs/requirements.md) |

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

// 1) 领一套本插件专属的样式设施（id + 变量前缀都隔离）
//    id / prefix 的取值按项目规范定（多插件同页必须互不冲突）；
//    下面的 dsh-task-reminder / reminder 只是演示命名规律（前缀取插件名缩写）
setStyleKit(createStyleKit({ id: 'dsh-task-reminder-ui', prefix: 'reminder' }))
// 2) 挂上 token + 控件样式（幂等，可反复调）
ensureControls()

// 3) 直接用控件，不再自己写原生 input
const view = <Button variant="primary" onClick={save}>保存</Button>
```

**为什么必须先 `setStyleKit`**：样式只能以字符串在运行时注入 `<style>`（客户端产物是 JS 闭包，
`.css` 文件内核不加载）。固定 style id 与变量前缀在多插件同页时会互相覆盖，所以做成工厂，
每个插件领一套自己的。

## 子包

| 引入路径 | 装什么 |
|---|---|
| `dsh-plugin-core/design` | token 变量表（含深色段）+ `createStyleKit` 注入器工厂 + 主题判据（**零 React**） |
| `dsh-plugin-core/ui` | 控件：Button / Input 家族 / Textarea / Checkbox / Segmented / Select / Picker / ModelPicker / Modal / toast / 空态 / 错误边界 / Loading … |
| `dsh-plugin-core/utils` | 纯方法：日期 / 字符串 / 字节 / 时间区间 / HTTP 取数 + 内置中英多语言 |
| `dsh-plugin-core/explorer` | 工作区浏览面板 + 选工作区 + 选文件 |
| `dsh-plugin-core/explorer/preview` | 文件预览体 |
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
4. **类名没按插件隔离** —— CSS 类名仍是 `dsh-tdt-*`，两个插件若引的 core 版本不同会互相覆盖
   （同版本无害）。主防线是 style 标签 id 与变量前缀隔离。
5. 设置页骨架没抽（等第二个消费者）；发布流程（npm + OIDC）没配。

## 两种身份：npm 库 + DSH 插件

本包**同时**是「给插件用的基础库」和「可被 DSH 安装的组件预览插件」。两条线互不相干：

- **库（npm）**：消费端一律走子路径导出，插件身份不影响它们：

  ```ts
  import { ensureControls, setStyleKit } from 'dsh-plugin-core/ui'
  import { createStyleKit }            from 'dsh-plugin-core/design'
  import { formatTime }                from 'dsh-plugin-core/utils'
  ```

  零 runtime 依赖（react 是可选 peer），npm tarball 只含 `dist/`（**排除 `dist/client.js`**）与 `docs/`。

- **插件（DSH）**：`main` 指向 `dist/index.js`（插件 server 入口，只导出 `name/inject/apply`，
  **不 re-export 任何浏览器侧代码**），`exports['./client']` 指向 `dist/client.js`（预览页 bundle），
  加 `dsh` 清单 + `cordis.patch.yml`。安装：

  ```bash
  dsh plugin --profile web add git+https://github.com/cq-guojia/dsh-plugin-core.git
  ```

  装好后：插件列表 → 本插件 → 设置页里的「组件预览」卡片 → 点开即整页预览（或点侧栏图标）。
  预览页在**真实宿主**里渲染，明暗与 token 全部跟随宿主。

插件相关代码全部隔离在 `src/index.ts` + `src/plugin/`；将来若要彻底拆成独立仓，搬这两个即可。
`dist/` 随包入库（宿主安装不跑构建脚本），改 `src/` 必须 `pnpm run build` 后一起提交。
