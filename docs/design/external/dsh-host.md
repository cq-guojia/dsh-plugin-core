# 外部事实：DSH 宿主与官方包

真源在**本仓库之外**的已核实行为。带来源与适用版本；宿主升级后要复核这里。

## 1. 客户端产物形态

- 事实：插件 client 产物是 `window.__ModuleLoader__.load({ id, factory })` 的 CJS 闭包。
- 后果：`import './x.css'` 只产出独立 css 资源、**内核不加载** ⇒ 样式必须运行时注入。
- 来源：`dsh-task-dispatch-table` 的 `task-editor-css.ts` / `archive-session-css.ts` / `toast-css.ts` 三处注释结论 + `tsdown.client.config.ts`。

## 2. 官方包只在宿主编解，Node / 非内核环境不可解析

- 事实：`@deepseek-ai/dsh-client-ui-primitives` 等是**平台模块**，运行时由内核模块表 `require()` 解析，
  不写进插件依赖。
- 后果：在 Node / 单测 / 任何非内核环境 `import` 它会 `ERR_MODULE_NOT_FOUND`，
  **一个控件依赖它就会让整个 `ui` 入口 import 失败**（实测过）。
- 处置：本包 `ui` **零官方依赖**（`BackToTop` 的图标改自绘、`SelectField` 因依赖官方 `Menu` 被删，
  由自绘 `Picker` 取代）。
- 来源：`dsh-task-dispatch-table/src/client/primitives.d.ts` 头部注释。

## 3. 宿主 API 的位置参数校验

- 事实：`WorkspaceFilesFace.read(sessionId, path, range, signal?)` 的第三参 `range` **必传**，
  官方按**位置参数个数**校验，少传直接被远端拒（`expected 3 business argument(s) … got 2`）。
  `readBytes` 的 `options` 同样必传。
- 后果：本包调用处一律显式传 `{}`。
- 来源：`dsh-task-dispatch-table/src/client/file-preview.tsx` 的 `WorkspaceFilesFace` 注释（真机 2026-10-03 踩坑记录）。

## 4. 明暗判据

- 事实：宿主启动脚本 `toggleAttribute` 往 body 写 `data-ds-dark-theme`，是**唯一**明暗判据，
  反映用户在客户端里的选择。
- 禁止：`prefers-color-scheme`（跟系统，不跟用户在宿主里的选择）。
- 来源：`dsh-task-dispatch-table/src/client/ui/tokens.ts:196-197`（注明宿主源码核实）。

## 5. 官方 CSS-module 类名发现

- 事实：官方 CSS module 由宿主运行时注入 `document.head`，形如
  `<style data-plugin="@deepseek-ai/dsh-client-ui-chat" data-plugin-css="…/ChatView.module.css">`，
  类名 = `<构建哈希>_<语义名>`。
- 后果：**哈希每次构建都可能变** ⇒ 写死类名会在某次宿主升级后集体失效，只能运行时按
  `data-plugin-css` 解析发现；取不到则回退自绘样式并告警。
- 来源：`dsh-task-dispatch-table/src/client/official-classes.ts` 头部（读 `@deepseek-ai/dsh-client-ui-chat@0.1.7-rc.2` 源码得出）。

## 6. 官方表单体系的能力缺口（影响「要不要抽设置页骨架」）

- 事实：官方 `SettingsForm` 只有 saveFailed 文案、**没有成功提示**；字段控件只有
  文本 / 数字 / 密钥三种、**没有下拉**。
- 后果：`dsh-session-title-pattern` 用官方 `Menu` + `Button` 原语自绘下拉；
  这也是「设置页骨架暂不抽」的原因之一（各家在官方体系里各自补缺口，形态差异大）。
- 来源：`dsh-session-title-pattern/src/client/config-panel.tsx` 与 `model-pair.tsx` 头部注释。

## 7. 工作区 / 模型列表的取数通路

- 事实：工作区列表由 **host 侧** `ctx.workspaceRegistry.list()` 取，再经**插件自己的** HTTP 通道
  送到 client；模型目录来自远端 `llm/listProviders` + 各 provider 设置文档的 `models` 数组。
- 后果：client 侧组件**无法自己取** ⇒ 本包所有选择器都「数据调用方给」。
- 来源：`dsh-task-dispatch-table/src/dispatch.ts:35`、`src/client/index.ts:937-960`；
  `dsh-session-title-pattern/src/client/model-pair.tsx` 头部注释。

## 8. 官方会话 UI 未开放

- 事实：官方**不开放**会话 UI 的复用（连样式都不给），插件只能照着官方实现逐行镜像。
- 后果：`dsh-task-dispatch-table/src/client/mirror/` 有 15 个逐行镜像官方 `ui-tool` 的文件；
  「会话预览要长得像官方」必须自己维护这套镜像，且**宿主升级就要跟着改**。
- 状态：本包 `session` **尚未搬入**这套镜像，只有最简渲染 + `renderMessage` 扩展点。
