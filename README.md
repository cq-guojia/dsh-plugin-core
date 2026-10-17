# dsh-plugin-core

DSH（DeepSeek Harness）插件共享底座：把跨插件复用的样式、控件、通用方法、工作区浏览、
会话预览收敛到一处，写新插件时按文档 `npm i` 引用，不再一个个仓库抄。

**服务对象：以后要写的每一个 DSH 插件**（不是现有的某三个）。完整需求见 [`docs/requirements.md`](docs/requirements.md)。

> **状态**：🚧 可用但**未在真实插件里接入验证过**（见下方「还没做的事」）

## 安装

```bash
npm i dsh-plugin-core
```

包里带预编译 `dist`（宿主以 git/npm 装插件**不跑构建脚本**，产物必须随包发布）。
`react` 是 optional peer：只用 `utils` / `design` 的插件不必装。

## 快速开始

```ts
import { createStyleKit } from 'dsh-plugin-core/design'
import { Button, ensureControls, setStyleKit } from 'dsh-plugin-core/ui'

// 1) 领一套本插件专属的样式设施（id + 变量前缀都隔离）
setStyleKit(createStyleKit({ id: 'my-plugin-ui', prefix: 'myplugin' }))
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
