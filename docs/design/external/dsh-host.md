# 外部事实：DSH 宿主与官方包

真源在**本仓库之外**的已核实行为。带来源与适用版本；宿主升级后要复核这里。

## 1. 客户端产物形态

- 事实：插件 client 产物是 `window.__ModuleLoader__.load({ id, factory })` 的 CJS 闭包。
- 后果：`import './x.css'` 只产出独立 css 资源、**内核不加载** ⇒ 样式必须运行时注入。
- 来源：`dsh-task-dispatch-table` 的 `task-editor-css.ts` / `archive-session-css.ts` / `toast-css.ts` 三处注释结论 + `tsdown.client.config.ts`。

### 1.1 为什么不用 CSS Module / `.css` 文件

- CSS Module 是**构建期**方案：打包器把类名哈希化，产出一个 css 资源 + 一个 js 映射。
  但它同样要回答「css 资源谁来加载」——而内核不加载（见上），哈希类名对应的规则页面上根本不存在。
- 官方自己的做法也是运行时注入：官方 CSS module 由宿主注入 `<style data-plugin-css="…">`。
- ⇒ 本包把 CSS 以 **TS 字符串**分发、运行时注入。这不是偏好，是宿主产物形态决定的。
- 若将来宿主支持加载 css 资源，可回归 `.css` + CSS Module——那是破坏性变更，要发 major。
- 来源：同上（三处 css.ts 注释结论 + 官方 `official-classes.ts` 观察到的注入形态）。

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

## 9. 插件注入的 CSS 曾被自己的模板字符串污染（2026-10-19，已修复）

- ❌ **已作废的结论**：本项目曾长期认为「宿主会吃掉 token 块之后的**第一条** CSS 规则」，
  并据此在控件样式最前面加了一条 `.dshpc-css-guard{display:none}` 牺牲规则。**这是误判，
  官方没有这种行为。** 该牺牲规则机制已整体删除。
- **真因**：`src/design/tokens-css.ts` 模板字符串结尾多写了一个反斜杠（写成 `\`` 而非 `` ` ``），
  字符串内容里因此多出一个**字面反引号**。所有 CSS 拼成一份文本写进 `<style>` 时，反引号正好落在
  tokens 与控件样式的交界处；CSS 解析器把它当成不合格选择器的开头，一路吞到下一个 `{`，
  ⇒ **紧随其后的那条规则的整个选择器**被污染（`.dshpc-seg` → `` `.dshpc-seg ``），永远匹配不到元素。
- **后果**：规则仍在 CSSOM 里（所以按选择器名去查会误判为“规则不存在”），但永不生效。
  当时排首位的是 `.dshpc-seg{display:inline-flex;}` ⇒ 轨道退化成 `block` ⇒ `gap`/`padding`
  对 block 容器无效 ⇒ 星期方块挤成一坨。拆成多条单声明时「只有第一条失效」也是同一原因。
- **为什么长期没被发现**：CSS 天生容错（非法 token 走错误恢复，不抛错、不打日志）；TS 里
  `\`` 是**合法转义**（语法完全正确）；而当年的牺牲规则恰好排反引号之后替它挨刀，
  现象被“修好了”，反而加固了错误结论。
- **官方侧核实**（`github.com/deepseek-ai/deepseek-harness`）：插件 `<style>` 相关代码只有两处——
  `packages/client/modules/src/client/system.ts` 的 `claimStyles`（给 factory 执行期新增的、
  未标记的 `<style>` 打 `data-plugin` 并登记 `data-plugin-css`）与
  `packages/client/modules/src/client/entry-lifecycle.ts` 的 `removeOwnedStyles`（卸载时 `el.remove()`）。
  **没有任何代码改写 `textContent` 或操作 `cssRules`。**
  官方自己的注入顺序是 `textContent` 先、`appendChild` 后（`packages/client/tsdown.client.ts`），
  与本仓相反——但**该差异与本次事故无关**（用 `replaceSync` 即可复现，完全不经 DOM 插入）。
- **防再犯**：`test/css-contract.test.mjs` 现在断言——注入文本（tokens + 控件）不得含反引号/反斜杠、
  tokens 模板必须以 `}` 收尾、括号与注释平衡。
- ⚠️ **教训**：只凭现象推断的“谁吃了规则”，在读到对方源码前不要写成结论；先看拼接处的原始字节。
- 来源：`packages/demo/src/probes.ts` P27–P34 实测（2026-10-19，用户回传读数）+ 官方仓库源码 +
  本仓 `ledger/worklog/202610/19-1604-按钮与输入分区控件样式全面梳理与修复-823a.md`。
