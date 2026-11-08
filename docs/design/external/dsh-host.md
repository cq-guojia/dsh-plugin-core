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
- ⚠️ 这条只约束**产物**：源码自 2026-10-19 起就是真的 `.css` 文件（`src/**/*.css`），
  由 `scripts/gen-css.mjs` 在构建期转成 `*.generated.ts`（见 `docs/design/architecture.md` §样式注入）。
  两者不冲突——真源享受编辑器的高亮/括号匹配/格式化，产物仍是一段字符串。
- 若将来宿主支持加载 css 资源，可让产物也回归 `.css` + CSS Module——那是破坏性变更，要发 major。
- 来源：同上（三处 css.ts 注释结论 + 官方 `official-classes.ts` 观察到的注入形态）。

## 2. 官方包只在宿主编解，Node / 非内核环境不可解析

- 事实：`@deepseek-ai/dsh-client-ui-primitives` 等是**平台模块**，运行时由内核模块表 `require()` 解析，
  不写进插件依赖。
- 后果：在 Node / 单测 / 任何非内核环境 `import` 它会 `ERR_MODULE_NOT_FOUND`，
  **一个控件依赖它就会让整个 `ui` 入口 import 失败**（实测过）。
- 处置：本包 `ui` **零官方依赖**（`QuickToolbar` 的图标由调用方传入、内部回顶箭头自绘，
  `SelectField` 因依赖官方 `Menu` 被删，由自绘 `Picker` 取代）。
- 来源：`dsh-task-dispatch-table/src/client/primitives.d.ts` 头部注释。

## 3. 宿主 API 的位置参数校验

- 事实：`WorkspaceFilesFace.read(sessionId, path, range, signal?)` 的第三参 `range` **必传**，
  官方按**位置参数个数**校验，少传直接被远端拒（`expected 3 business argument(s) … got 2`）。
  `readBytes` 的 `options` 同样必传。
- 后果：本包调用处一律显式传 `{}`。
- 来源：`dsh-task-dispatch-table/src/client/file-preview.tsx` 的 `WorkspaceFilesFace` 注释（真机 2026-10-03 踩坑记录）。

## 3.1 `read` / `readBytes` 参数的**取值**约束（2026-10-21 读官方源码核实）

- 版本：`@deepseek-ai/dsh-api-workspace-files@0.2.1-rc.2`（`lib/index.js` / `lib/typert.remote-client.js`）。
- `read` 的 `range = { offset?, limit? }`：`offset` **从 1 起算**（`resolvePage` 里
  `integerAtLeast(range.offset, 1)`，缺省 1）；`limit` 缺省 `maxLines`，**超过即抛
  `gateway/bad-request`**（部署默认 `maxLines = 5000`）。⇒ 首页传 `{}`、翻页传 `{ offset }`，
  **不要自己塞 limit**（曾经塞 `limit: 5000` 且 `offset: 0`，所有文件一律「加载失败」）。
- `readBytes` 的 `options` 是 **strictObject**，只认 `range` / `baseFile` 两个键，
  `{}` 合法；不带 `range` = 读全量，上限是部署 `maxFileBytes`（默认 32MiB），超出抛
  `workspace-file/too-large`。
- 两者成功体都在信封 payload：`read → { offset, text, lines, eof, absolutePath, version, bytes? }`，
  `readBytes → { offset, data: Uint8Array, eof, absolutePath, version, bytes? }`。
- 定位共用 `locateFile`：`path` 为空抛 `gateway/bad-request`，不存在抛 `workspace-file/not-found`，
  非普通文件抛 `workspace-file/not-regular-file`。
- 来源：官方包 `lib/index.js:427/447/536/546/589`、`lib/typert.remote-client.js:44-76`。

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

## 10. 官方 HoverCard 的 compact 变体不设文字色（2026-10-19 实测）

- **事实**：`HoverCard` 的默认 `variant` 就是 `'compact'`，走 `.card`。该变体**只写背景、不写 `color`**：

  | 变体 | 背景 | 文字色 |
  |---|---|---|
  | `.card`（compact，默认） | `--dsw-hovercard-bg: #2C2C2E`（**硬编码，不随明暗变**） | **无声明** |
  | `.preview` | `--dsw-alias-bg-layer-1`（跟随主题） | `--dsw-alias-label-primary` |

  卡片最终 `createPortal(card, document.body)` ⇒ 挂在 `body` 直下 ⇒ 文字色退化为**继承**。
- **后果**：亮色主题下继承到 body 的前景色（实测 `rgb(15,17,21)` ≈ `#0f1115`），压在 `#2C2C2E` 深底上
  ⇒ **黑字看不清**；暗色下继承到近白，看起来正常。**只有亮色暴露。**
- **为什么官方自己不暴露**：`.card` 的 `content` 收任意 ReactNode，宿主自己传的都是官方组件（自带 color）。
  传裸 `div` / 纯文本就会踩到。本仓 demo 正是这么踩到的（已修）。
- **修法**：由**调用方自己给内容色**。因为背景恒为 `#2C2C2E`（官方写死的深色），内容就该恒亮——
  用官方在同场景（Tooltip 深底）使用的常量 `--dsw-static-neutral-bluish-00`（`#fff`）。
  ⚠️ 别用 `--dsw-alias-label-primary`：它在亮色下是近黑，压深底正好复现这个 bug。
- **对照：官方 Tooltip 没有这个问题**——`.bubble` 两条声明齐全
  （`background: var(--dsw-alias-tooltip-bg)` + `color: var(--dsw-static-neutral-bluish-00)`），
  实测亮/暗都正常。气泡带 `role="tooltip"`，需要选中它时可用该属性（不要用 CSS-module 哈希类名）。
- 来源：`@deepseek-ai/dsh-client-ui-primitives@0.2.1-rc.2`
  · `lib/HoverCard.module.css` 的 `.card` / `.preview`
  · `lib/index.js` 的 `function HoverCard({ …, variant = "compact", … })`
  · 真机实测 2026-10-19（宿主**亮色**）：浮层类名 `_card_38jqx_9`、`role: null`、
    父节点 `BODY`、`color: rgb(15,17,21)`、`background: rgb(44,44,46)`。

## 11. client 侧现成数据面：`workspaces` 服务与 `remote.llm`（2026-10-20 核实）

- 事实 1（工作区）：官方 client 挂了 cordis 服务 **`workspaces`**（`IWorkspaces`），
  其 `list` 是 observable 快照源（`getSnapshot()` + `subscribe()`）；
  快照 `items: readonly WorkspaceView[]`，每行含 `workspaceId` / `path` / `title` /
  `sessionIds` / `createdAt` / `updatedAt`；数据由宿主 `workspace/follow` 流实时推送。
- 事实 2（模型）：client remote 命名空间 **`llm`** 有 `listProviders()`（已注册路由，
  `{id, name}`）与 `listConfigurableProviders()`（可配置目录，带 `settingsNs` /
  `settingsPath`）。**各 provider 的已配模型不在 remote 里**——要读设置镜像
  （`configForms.describe()`）里该 provider profile 的 `models` 数组，且只认用户层
  真正写过的（空壳 profile 不算）。写法照 `dsh-session-title-pattern` 的 DirectoryStore。
- 事实 3（归档集合，2026-10-22 解包 `0.2.0-rc.2` 核实）：`workspaces.list` 快照**还带**
  `archivedSessionIds: readonly SessionId[]` —— **registry-global** 归档集合（宿主
  `workspaceRegistry.archivedSessionIds` 那一份，**不是每工作区一份**），由 follow 流的
  baseline / `archived` 增量整体替换（`client/model.js` `installArchived`、
  `client/index.js` `accept.replaceArchived`）。某会话是否已归档 = `archivedSessionIds` 里有它。
  - ⚠️ **推翻的旧结论（2026-10-22）**：曾以为「归档集合 client 读不到，只能宿主侧读
    `workspaceRegistry` 挂只读路由」，且误按**每个工作区实体**的 `archivedSessionIds` 取数
    （实体的这个字段根本不存在；`types.d.ts` 里它只出现在 `WorkspaceArchiveValue` /
    `WorkspaceBaseline` / follow 增量上）⇒ 集合恒为空，已归档会话一个都标不出来。
    那条宿主路由（`serveArchivedSessions`）已删除，改走 `workspaces` 快照。
- 后果：工作区在 client 侧 `ctx.inject(['workspaces'])` 即可自取（本包 `workspaceList` 就是它的镜像）。
- ⚠️ **模型不能只靠 client**：`remote.llm` 只有 `listProviders` / `listConfigurableProviders` /
  `discoverModels`，**没有「某 provider 的模型列表」**；模型只能宿主侧
  `llm.listModels(providerId)` 取（`dsh-task-dispatch-table/src/dispatch.ts:81-88` 实测用法）。
  ⇒ 要模型就得插件 host 半侧挂一条只读路由（本包 `src/host/index.ts` 的 `serveModelCatalog`）。
- ❌ **已废弃的结论（2026-10-20）**：曾以为「读设置镜像 `configForms.describe()` 里各 provider
  profile 的 `models`」能拿全（照抄 dsh-session-title-pattern 的 DirectoryStore）。真机上 demo
  按此路子读出来是 0 个供应商（describe 快照里的命名空间不保证含 provider 模型）。别再走它。
- 来源：`@deepseek-ai/dsh-api-workspace-controller@0.2.0-rc.1`
  · `lib/types/client/index.d.ts:19`（`workspaces: IWorkspaces`）、`lib/types/client/index.js:8`
  （client 模块 inject = `['remote','remote.workspace']`）、`lib/types/client/service.d.ts:38`
  · `@deepseek-ai/dsh-llm` `lib/typert.remote-client.d.ts:10-12`
  · `dsh-session-title-pattern/src/client/model-pair.tsx:32-217`（模型目录组装口径）

### 11.1 插件宿主侧数据面：`llm.listModels` + `webServer.register`（2026-10-20 核实）

- 事实（`@deepseek-ai/dsh-llm` 宿主服务）：`listProviders()` 同步返回已注册 provider
  `{id,name}`；`listModels(providerId)` **异步**返回该 provider 可发现的模型
  （advisory，未列出 ≠ 不可用）。单个 provider 抛错要局部跳过，不整表失败。
- 事实（`webServer` 服务）：`register({ kind:'exact' | 'prefix', path, handler(req,res) })`；
  客户端同源相对路径 `fetch('/api/xxx')` 即可取（`dsh-task-ledger` / `dsh-task-dispatch-table` 同款）。
- 口径：**模型目录必须走宿主 → 路由 → client**；client 侧 remote 只够列供应商名字。
  本包 `src/host/index.ts` 的 `serveModelCatalog()` 封装了这条链路，`connectHost(ctx, { modelsPath })`
  在 client 侧 fetch 同一个 path。
- 来源：`dsh-task-dispatch-table/src/host.ts:214-232`（`HostLlm` 面）、`src/dispatch.ts:81-88`（listModels 用法）、
  `dsh-task-ledger/packages/plugin/src/host/routes.ts:20-44`（webServer.register + sendJson）。

### 11.2 归档变更的官方推送链与打开判据（2026-11-04 解包核实）

版本：`@deepseek-ai/dsh-workspace@0.2.1-rc.5`、`@deepseek-ai/dsh-api-workspace-controller@0.2.1-rc.5`、`@deepseek-ai/dsh-client-ui-workspace@0.2.1-rc.5`（§13 记录的宿主当前线；§11 事实 3 的 0.2.0-rc.2 结论在此版本仍成立）。

| 环节 | 事实 |
|---|---|
| 写口 | `dsh-workspace/lib/index.js:526-541` `archiveSession()` 把 id 写进 `workspaceDomainState.archivedSessionIds`（schema `:240-248`），经 `setState()`（`:938-941`）落盘；`unarchiveSession()` 同路（`:553-561`）。**这是唯一写口**：绕过 registry 直改磁盘文件不会发领域变更事件 |
| 推送 | `dsh-api-workspace-controller/lib/index.js:54-56` `WorkspaceFeed` 监听 `ctx.on("domain/changed")`；`:115-122` 归档集合变了才 `publish({type:"archived", archivedSessionIds})`；`:78-91 / :711` 经 `Remote({mode:"stream"})` 的 `follow()` 长连流下发（先 baseline 后增量） |
| 客户端 | 同包 `lib/client.js:473-489 / :491-513` `case "archived"` → `replaceArchived`（`:212-215`）→ `installArchived`（`:269-273` 内容相同直接 return）→ `notifySubscribers`（`:331-335`）；`:245-267` 标准 `getSnapshot()` / `subscribe()`；`:388-392` 服务名 `workspaces`、`list` 即该模型 |
| 官方 UI 同款用法 | `dsh-client-ui-workspace/lib/client.js:1597` `workspaces.list.subscribe(reconcile)`；`:1639-1643` `clearArchivedCurrent()`；`:5067-5068` `derive(...)` 派生归档集合；`:5168-5174` `openForkSource()` 打开前读 `getSnapshot().archivedSessionIds`，已归档则 `notify({kind:"archivedNotOpenable"})` 不跳（文案 `:4813`「已归档对话暂时无法查看，请取消归档后查看」） |

⇒ 官方为归档态提供的正式通道就是「host 领域事件 → follow 流增量 → client 可观察快照 → 订阅」，**没有轮询，也没有独立的归档事件 API**。本仓处置：`connectHost` 已订阅同一份 `workspaces.list`，`src/ui/infra/host-data.ts` 的 `WorkspaceListStore` 镜像 `archivedSessionIds`，`SessionViewModal` 用 `useSyncExternalStore` 实时跟随；点击「继续对话」按官方 `openForkSource` 判据复核。零新增连接 / RPC / 定时器。

## 12. workspaceFiles.list / read 的路径语义与越界判定（2026-10-22 解包核实）

- 版本：`@deepseek-ai/dsh-api-workspace-files@0.2.1-rc.2`（npm 拉包读 `lib/index.js`；0.2.0-rc.2 / 0.2.1-rc.1 的 confine 逻辑一致）。
- **list 的 path 绝对/相对都收**（jsDoc `index.js:491` "absolute or relative to the workspace root"）：`inspect`
  用 `lstat(path, { cwd: workspaceRoot })`（`index.js:563-571`），空 path 抛 `gateway/bad-request`
  （本仓 `listPathOf('') → '.'` 的由来），不存在抛 `workspace-file/not-found`，非目录抛 `not-directory`。
- **目录列举限会话工作区内**：`confine`（`index.js:576-583`）`resolve` 后
  `contains(root, target)` 为假 ⇒ 抛 `workspace-file/outside-workspace`。**这是 list 专属**。
- **read / readBytes 允许工作区外文件**（jsDoc `index.js:421` / `480` "files outside it are allowed"），
  无 contains 检查 ⇒ 绝对路径直读任何 OS 可达文件。**后果**：同一绝对路径，read 成功而 list(父目录)
  被拒是官方设计的不对称，不是 bug——表现为「文件预览正常、路径栏/目录树退化成只读」。
- **list 是会话作用域服务**：`workspaceFileScope.workspaceRoot` 按 sessionId 派生（`index.js:563`；
  兄弟项目 `dsh-task-dispatch-table/src/host.ts:177` 注释同结论：「list 以 sessionId 解析工作区根，
  必须有属于该工作区的会话才能列其文件」）。⇒ 调用方只给绝对路径时，默认 sessionId 的根未必含它。
- **错误码全集（0.2.1-rc.2）**：`gateway/bad-request`、`workspace-file/not-found`、`not-directory`、
  `not-regular-file`、`outside-workspace`、`too-large`、`not-text`、`invocation-unavailable`、
  `service-unavailable`。⚠️ **没有 `lookup-not-found`**（本仓 `errView` / `noteOutside` 曾误引，
  2026-10-22 移除，来源为初版 commit eca3f25，无官方依据）。
- **对照**（`github.com/omdsh-dev/DSH-better-sidebar`，2026-10-22 读）：它的文件树**不走**官方
  `workspaceFiles.list`，走自建 host 路由 `fs.tree`（host 直接 fs）；且 v0.23.0 起删掉了自己的
  workspace fence（README 原话：「fs 路由不做 workspace 包含检查……调用方不得把这些路由当作有栅栏的」）
  ⇒ 它那里「跨工作区随便逛」是绕开官方 confinement 的结果，**不代表官方 API 贯通**。
- 处置（本仓）：`workspaceAnchorForPath`（`src/adv/explorer/types.ts`）按最长前缀把绝对路径解析到
  宿主工作区清单里的所属工作区，list 换该工作区名下的会话 id；`openFilePreview({ workspaceAnchors })`
  透传；匹配不到 ⇒ 回落 `props.sessionId` + `crumbBarPlain` 的 hint 说破原因。
- 来源：官方包 `lib/index.js:489-512 / 563-583 / 421 / 480`；`dsh-task-dispatch-table/src/host.ts:174-187`；
  `dsh-better-sidebar` README + `docs/plans/2026-08-29-workspace-fence-toggle-design.md` + `src/client/use-session-root.ts`。

> ⚠️ 上面这条「处置（本仓）」是 2026-10-22 的做法，已被下面的 §13 取代（浏览不再吃会话）。

## 13. 跨工作区浏览：官方能力边界与本仓自建只读路由（2026-11-03 解包核实）

解包版本：`dsh-api-workspace-files@0.2.1-rc.5`、`dsh-office-to-pdf@0.2.1-rc.5`、`dsh-fs@0.2.1-rc.5`、
`dsh-api-workspace-controller@0.2.1-rc.5`、`dsh-host-directory-picker@0.2.1-rc.5`、
`dsh-client-ui-workspace@0.2.1-rc.5`。

### 13.1 会话到底绑在哪一步（修正 §12 的粗判）

- **只有 `list` 被栅栏卡住**：`list` 走 `inspect` + `confine`（`workspace-files/lib/index.js:495-505 / 576-583`）。
- **`inspect` 不做 contains**：`read` / `readBytes` / `stat` 走 `locateFile → inspect`（`index.js:563-574 / 589-605`），
  `inspect` 只 `fs.lstat(path, { cwd: workspaceRoot })`（注释原文：目录包含检查是 `list` 的事）。
  ⇒ **相对路径按会话根解析，绝对路径任意文件都能读，与会话所属工作区无关**。
- **`officeToPdf` 的会话只用来做授权探针**：`renderFile` 先 `files.readBytes(scope, path, {range:{0,1}})`
  与 `files.stat(scope, path)`，真正的字节走宿主 `fs` 服务（`office-to-pdf/lib/index.js:519-560`，`this.ctx.get('fs')`）。
  因为上一条，探针不会因「文件在工作区外」失败 ⇒ **任意一条有效会话就够，不必按路径匹配所属工作区**。
- PDF / 图片 / 文本**不走 officeToPdf**：`.pdf` 走 `readBytes`（本仓 `preview/index.ts` → `BytesPreview`），
  只有 doc/docx/ppt/pptx 走 `OfficePreview`。

### 13.2 官方别处的目录能力：`remote.directoryPicker`（能列任意目录，但只回目录）

| 事实 | 证据 |
|---|---|
| 宿主 Remote 服务，namespace `directoryPicker`，verb = `pick` / `list` / `createDirectory` | `api-workspace-controller/lib/types/directory-picker.d.ts:36-60`；`.js` 里 `Remote('pick'/'list'/'createDirectory')` |
| `list(path?)` 列**任意绝对路径**（不传 = 家目录），回 `{ path, home, crumbs, entries, truncated }` | `host-directory-picker/lib/types/types.d.ts` |
| `entries` 是 **direct child directories**（`{name, path, hidden}`）——**不含文件** | 同上，类型注释 |
| `crumbs` 直接给祖先链 | 同上 |
| 能力两档：`native`（桌面端弹系统框）/ `browse`（网页端只能逐层列）；不匹配的 verb 抛 `directory-picker/unavailable` | `host-directory-picker/lib/types/index.d.ts` + `controller/lib/types/directory-picker.js:130` |
| 错误码：`directory-picker/{unavailable,unreadable,exists,create-failed}` | `controller/lib/types/directory-picker.js:140-145` |
| 官方「添加工作区」就走它 | `dsh-client-ui-workspace/lib/client.js:5011 / 5039 / 1560-1573` |

⇒ **「列任意目录」官方本来就有**（我早先「官方做不到系统根」只对 `workspaceFiles.list` 成立）；
但**文件**它给不了，所以本仓不用它，自建一条只读路由。

### 13.3 宿主 `ctx.fs` 服务（自建路由可以复用的那层）

`dsh-fs/lib/types/index.d.ts:94-208`：`resolve` / `lstat` / `stat` / `listDir` / `readBytes` / `readByteRange` /
`contains` / `fileUrl` / `processPath`。第一方插件这样用（`office-to-pdf` 的 `this.ctx.get('fs')`）。

本仓**不依赖**它：第三方插件宿主半边能否 inject `fs` 未验证，且插件宿主进程本来就有磁盘权限，
`node:fs` 只多几十行、不引入跨版本耦合。

### 13.4 本仓自建路由契约（`src/host/fs-route.ts` + `src/adv/explorer/fs-face.ts`）

| 项 | 值 |
|---|---|
| 端点 | `GET {path}?op=list\|read\|readBytes\|roots&path=<绝对路径>&offset&limit` |
| 只读 | 只有这 4 个 op，没有任何写/删/改入口 |
| 鉴权 | 不加 token：宿主 HTTP 面本来就能调 `remote.workspaceFiles.read`（允许工作区外绝对路径），本路由不引入新暴露面；静态 token 写在同一个 bundle 里是装饰 |
| 每层上限 | 500 条（`FS_PAGE_LIMIT`），服务端先按名排序再切片，翻页不重复/不漏 |
| 文本分页 | **按行**：`offset` 是 1 起行号、`limit` 是行数（对齐官方 `read`，客户端下一页偏移 = `offset + lines`） |
| 二进制 | 单文件上限 32MB（超出 `too-large`），回 base64 |
| 错误码 | 复用官方词表：`not-found` / `not-directory` / `not-regular-file` / `too-large` / `not-text` / `service-unavailable`；`errView` 的兜底分支接不认识的码 |
| 根节点 | POSIX `['/']`；Windows 逐个 `X:\` 探（Node 无盘符枚举 API） |
| 超时 | 列目录 8s（`ETIMEDOUT` → `timeout`），网络挂载盘上不会挂死 |

树模型、路径语义（绝对/相对都收、相对要 base）、返回值形状与 500 条上限的决策来龙去脉见
`ledger/worklog/202611/03-0053-12d5-选择器支持只选文件夹与非工作区目录.md`。

## 14. 宿主当前语言写在 `<html lang>`（2026-11-03 解包核实）

- 版本：`@deepseek-ai/dsh-client-locale@0.2.0-rc.1`（`lib/client.js`）。
- 事实：`syncDocumentLanguage(snapshot)` —— `document.documentElement.lang` 被写成**当前生效语言**
  （`zh` 落成 `zh-CN`，其余按语言 id）；它挂在 `locale.subscribe` 上，`apply` 里先 `sync()` 一次
  ⇒ **启动即有值，切语言即时改写**。浏览器兜底语言取自 `navigator.languages` / `navigator.language`，
  检测不到时默认 `en`。
- 后果：插件**不需要**接 `ctx.inject(['locale'])` 才能知道自己该说哪种语言——读 `<html lang>` 即可。
  本包 `getLocale()` 就是这么取默认值（`setLocale` 只作手动覆盖）；组件要「切完立即刷新」再调
  `useLocale()`（观察 `lang` 属性变化）。
- 注意：宿主同时提供 `ctx.locale`（`getLocale` / `getSnapshot` / `subscribe` / `register` / `bind`），
  那是给**插件自己的文案**用的，与本包的跟随机制不冲突。
- 来源：`dsh-client-locale/lib/client.js`（`syncDocumentLanguage`、`detectBrowserLocale`、
  `apply` 里的 `ctx.effect(() => locale.subscribe(sync))`、`register(COMMON_NS, { zh, en })`）。

## 15. 会话首轮等待期：本地回显 + host `inbox` 投影（2026-11-04 解包核实，当日补充修正）

- 版本：`@deepseek-ai/dsh-api-session-controller@0.2.0-rc.1`（`lib/client.js`、
  `lib/types/client/contract/snapshot.d.ts`）；`@deepseek-ai/dsh-client-ui-chat@0.2.1-rc.5`（`lib/client.js`）。
- 事实：`beginSubmission()` 在真正发 prompt **之前**就把
  `{requestId, placement, time, text, attachments}` 写进 `SessionSnapshot.pendingSubmissions`
  （`lib/client.js:1685-1690`）；`finishSubmission()` 在 durable 事件到达后移除（`:2254-2258`）。
  快照另有 `running`、`awaitingFirstTurn`（"首个已接受 prompt 尚未到达 durable `turn/start`"）。
  **回显只在客户端内存里**（`contract/snapshot.d.ts:36-48` 注释），重载 / 重连后由 durable 事件重建
  ⇒ 冷读归档会话拿不到本地回显。
- 官方 `ChatFlow`（ui-chat `lib/client.js:2816-2839`、`:5686-5706`）：`pendingInputs` 由
  `PendingSubmissionBubble` 画成用户气泡（带 `data-submission-echo` / `data-pending-steering`），
  顺序 = `rows` → `pendingRows` → `RunningStatus`；`placement === 'queued'` 不画；
  `observedInputs(order, nodes)` 用 durable `user` 节点的 `source.rpcId` 判回显是否已被取代
  （`:2722-2736`）。`RunningStatus` 挂不挂由 `session.running` 决定（`:5645/:5704`），
  `startTime` 才从流末尾 open turn 取。
- 后果：只渲染 `chat` target 的 `order`，新会话首轮在首个模型事件落盘前**完全没有用户消息**，
  只剩运行态行；durable 节点到达时才把 user + assistant 一起显示。本包
  `src/adv/session/pending-inputs.ts` 补这条链，`SessionViewModal` 按官方顺序挂回显气泡。
- 补充修正（2026-11-04，版本同上；旧结论「只补本地回显这一路」不完整，插件真机首条提示词仍不显示）：
  · `beginSubmission()` 的 placement = `this.running ? (mode === 'steer' ? 'steering' : 'queued') : 'transcript'`
    （controller `lib/client.js:1686`）；运行中发出的普通提交标成 `queued`，官方 `visibleSubmissions` 也不画。
  · 本地回显会被 host 投影 retire：`observeSubmissionInbox()`（`:2216-2226`）在 inbox 到达后
    `retireAdmittedSubmission`，`scheduleObservedRetirement()`（`:2231-2245`）延一帧移除 ⇒ 等待期不能只靠
    `pendingSubmissions`。
  · `inbox` 是 host 侧 durable 投影：`projections.values.inbox` 含 `next-turn` / `next-step` 两队列
    （`:2101`），由 `agent/inbox/spliced` 事件驱动；历史尾页的 `projections` baseline 会 seed（`:2094`），
    **冷读 / 新打开会话也拿得到**。消息形态 `{ id, source: { kind, rpcId }, content }`；content 块由
    `attachmentRefsIn()`（`:2316-2325`）核实为 `{type:'text',text}` 与
    `{type:'image'|'file',attachment:{name,bytes}}`。
  · 读它的公开面 = `ProjectionValueStore.faceOf(key)`（`lib/types/client/sessions/projection-store.d.ts`
    的方法声明；实现 `:942` / `:1051-1059`），返回 `{ getSnapshot, subscribe }` 的 observable face；
    官方 `useProjection('inbox')` 走同一解析路径（ui-chat `lib/client.js:2757` 取 `inboxSteering`）。
  · 官方 `ChatFlow` 只从 `next-step` 取 steering（`:2815`），但首轮唤醒新 turn 的消息落在 `next-turn`
    （`:9846-9849` 的 inbox 定义）⇒ 插件两条队列都要读。
  · 本包落地：`openSessionView` 把 `faceOf('inbox')` 接进 `SessionViewTarget.inbox`；
    `src/adv/session/pending-inputs.ts` 的 `waitingUserRows` 按官方 `pendingInputs` 口径合并两路、按 rpcId 去重。
- 来源：上列两包 `lib/client.js` / `contract/snapshot.d.ts` / `projection-store.d.ts` 的实现本体（非按 `.d.ts` 推测）。

## 16. 宿主 0.2.2-rc.1：会话预览官方样式变化（2026-11-05 解包核实）

解包版本：`@deepseek-ai/dsh-client-ui-chat@0.2.2-rc.1`、`-tool`、`-deliverables`、
`-sidebar-documentpreview`、`-primitives`、`-conversation`、`dsh-client-ui-theme`；
对照组为同样七个包的 `0.2.1-rc.5`（§13/§15 记的宿主上一线）。

| 事实 | 证据 |
|---|---|
| 官方 CSS module 注入形态**未变**：`<style data-plugin="…" data-plugin-css="@deepseek-ai/dsh-client-ui-chat/ChatView.module.css">`，类名仍 `<构建哈希>_<语义名>`；§5 的 4 个包前缀照旧 | ui-chat `lib/client.js:3384-3387`（`css$16` / `tagId$16` 与 `document.head.appendChild`）；ui-tool / ui-deliverables / ui-sidebar-documentpreview 同款 |
| `MessageItem.bubble` 从 ui-chat 的 CSS 里**删除**；用户气泡改由**新增官方原语** `UserMessageBubble` 渲染，带 `data-message-bubble=""` 与 `data-text-interaction-source=""` | ui-chat `lib/client.js:9393`（对照 0.2.1-rc.5 `:7364` 还是 `div.MessageItem_module_css_default.bubble`）；primitives `lib/types/UserMessageBubble.d.ts`（props = 原生 div）、`lib/UserMessageBubble.module.css` 的 `.bubble`；0.2.1-rc.5 的 primitives 无此导出 |
| primitives 的 CSS **不走** `data-plugin-css` 注入（`lib/index.js` 仍是 `import css from "./X.module.css"`）⇒ 运行时类名发现拿不到也不该拿，直接用官方组件 | primitives `lib/index.js:3,76-86` |
| 语义名变化：`ChatView` 加 `textInteraction`；`MessageItem` 去 `bubble`；`TextPreview` 用 `content` / `lineMark` 取代 `lineTarget`（本仓未取用）。本仓 172 个 `officialClass` 语义对在新版**只有 `bubble` 一处取不到** | 逐模块比对两版 CSS 文本（CSS 字符串会 `+ require.asset(…)` 拼接图片资源，只取首段会误判） |
| ChatView 间距规则改写：默认 `--dsh-chat-flow-gap` 6px→4px，新增 `:not(.textInteraction)` / `[data-chat-steering-batch]` / `[data-pending-steering]` 等选择器；`runningContent` 增 4px 上边距与固定高度；ChatGroupSeat / ToolRow / TurnUsagePanel 等把 `:is(:hover,:focus-visible)` 拆开并包 `@media (hover:hover)` | ui-chat / ui-tool / ui-deliverables 两版 `css$N` 文本比对 |
| 主题 token 基本未动：删 `--dsw-specific-sidebar-nav-item-hover`、加 12 个、改 1 个值（`--dsw-menu-surface-fill`）；本仓 `tokens.css` 引用的 49 个 `--dsw-*` 全在。明暗判据仍是 `body[data-ds-dark-theme]`；`uiConversation.target(target)` 实现未变 | ui-theme 两版 `lib/*.js`；ui-conversation 两版 `lib/client.js` 的 `target(target)` 段落 |
| `skill` 工具调用有**独立官方包** `@deepseek-ai/dsh-client-ui-skill`，通过 `tool.call.toolview` 槽位按 `key: "skill"` 注册专属 `SkillRow`（0.2.1-rc.5 起就有，不在 ui-tool 的 `TOOL_TITLE_KEYS` 里，故通用卡永远查不到）。收起行 = `IconSkillOutlineRegular` + 标题 `row.title`（zh「加载技能」/ en「Skill」）+ 分隔点 + 只取 `args.name` 的摘要；展开体 = `instructionsCard`（带 `row.instructions`「说明」头 + `<pre class=instructions>` 原样呈现持久化输出、260px 限高），不是把 skill 正文当 Markdown 铺出来；`inspect` 按钮仅在槽位给了回调时才渲染。CSS module 走 `data-plugin-css="@deepseek-ai/dsh-client-ui-skill/SkillRow.module.css"` | ui-skill `lib/client.js:69-96`（CSS 与类名表）、`:98-267`（`skillRowModel` / `SkillRow` / `StartedSkillRow`）、`:310-325`（zh/en 词典）、`:432-437`（keyed 注册）；`README.zh.md` §skill 工具行 |
| **用户消息气泡内容是纯文本，不是 Markdown**：`conversation.user.text` 的默认 slot 是 `PlainUserText` → 官方原语 `UserTextRun`（`<span class=plainRun>{text}</span>`，`font/line-height: inherit`，不解析任何 Markdown）；`UserMessageBubble.module.css` 的 `.bubble` 自带 `white-space:pre-wrap` + 14px/22px，负责保留换行。助手正文才走 `MarkdownText`，且 DOM 是 `AssistantMarkdown.root > body > MarkdownText`（`body` 管 flex-column / 块间 gap 16px / 宽表格） | ui-conversation `lib/client.js:22558-22581`（slot 注册）、`:4291`（`PlainUserText`）、`:4221`（`UserText.module.css`）；primitives `lib/index.js:5603`、`lib/user-text.module.css`、`lib/UserMessageBubble.module.css`；ui-chat `lib/client.js:8370-8378`。0.2.1-rc.5 同款，非本次升级新增 |
| 工具行「退出码 N」胶囊 = 官方原语 **`Tag tone="neutral"`** + `ExitCodeBadge.module.css` 的 `badge` / `dot` 两类。胶囊底色 / 999px 圆角 / 11px 字号全在 `Tag.module.css` 的 `.tag[data-tone='neutral']`；`badge` 类只有 `flex/gap/margin-left`，`dot` 只有红点几何 ⇒ **只搬 CSS 类不用 Tag 会丢掉整个胶囊**。0.2.1-rc.5 同款，非本次升级新增 | ui-tool `lib/client.js:1519-1555`（`ExitCodeBadge` 函数体 `jsx(primitives.Tag, …)`）；primitives `lib/index.js:3009-3016`、`lib/Tag.module.css`、`lib/types/Tag.d.ts` |
| **过程组默认收起**（`ChatGroupSeat`）：`grouped = stepGrouping === "collapsed" \|\| stepGrouping === "history" && turnLocation?.status !== "open" && !deferCollapse`，`collapsed` 短路 ⇒ **不看 turn 状态、不看 `deferCollapse`**。默认 `compact` / `standard` 都是 `collapsed`，默认 `collapseTiming = "completion"` ⇒ `deferCollapse` 恒 false ⇒ 所有过程组一律带 `ProcessGroupHeader` 汇总行收起（`processTitle` 按活动类别出「执行了命令」等），点开才展开组内条目。`useChatNodeBottom(firstKey)` 只参与一级 `outerHidden` / `storedOpen` 判定，**不影响 grouped**；把「视口底部节点」误读成「每轮最后一组保持平铺」会连汇总行都不画。0.2.1-rc.5 同款，非本次升级新增 | ui-chat `lib/client.js:4935`（grouped）、`:4877-4920`（`ProcessGroupHeader`）、`:3590` + `:14788`（deferCollapse / 默认时机）、`:14837-14860`（`POLICIES`）；0.2.1-rc.5 `:4157` / `:12657` 同款 |

处置（本仓）：`src/adv/session/mirror/MessageItem.ts` 用 `UserMessageBubble` 取代已删类名，
用户气泡内容改走官方纯文本 `UserTextRun`（此前误用 `MarkdownText`，把 `##` 渲成大标题、`**` 渲成粗体、
反引号渲成 code chip，并引入 h2/p 的 32px/16px margin —— 2026-11-05 真机对比截图即此），
助手正文补回官方 `AssistantMarkdown.body` 层；
`src/adv/session/mirror/SkillRow.ts` 新增 ui-skill 专属卡并在 `SessionViewModal.ts` 按 `name === 'skill'`
分派（此前落到通用卡 ⇒ 标题「工具调用」、图标错、展开把 skill 正文铺出来），
`official-classes.ts` 的 `CSS_PKG_PREFIXES` 补 `@deepseek-ai/dsh-client-ui-skill/`；
`src/adv/session/mirror/GenericCommandCard.ts` 的 `ExitCodeBadge` 补上官方 `Tag`（此前只搬了 CSS 类，
胶囊几何与底色全丢 —— 2026-11-05 真机反馈「退出码 1 没有这个样式」即此）；
`src/adv/session/official-classes.ts` 的发现缓存改按官方 style 标签数失效，防多个官方包分批注入时只缓存到第一批；
`src/adv/session/mirror/ChatView.ts` 删掉「每轮最后一组平铺」的 `flatKeys`（误读 `useChatNodeBottom` 所致），
按官方默认 `collapsed` 策略让所有过程组 `grouped: true`（2026-11-05 真机反馈「官方收起来的，我们两个都展开」即此）。
其余 CSS 规则变化由 `officialClass()` 挂官方类自动跟随，**不写自绘兜底**（§8 长期口径）。

## 17. 宿主消息图片：官方包、槽位与 loader（2026-11-06 核实 `0.2.2-rc.1`）

解包：`npm pack @deepseek-ai/dsh-client-ui-attachment@0.2.2-rc.1`（该包**不在** §16 那 9 个包里，
`dist-tags.latest` 还停在老版本 `0.0.1-rc.2`，要按宿主同号取 `next`）。

| 事实 | 证据 |
|---|---|
| 消息图片的渲染方是该包的 **client 半区**（`lib/client.js`）：它往三个槽位注册同一组组件 —— `conversation.chat.user.images` / `conversation.chat.message.images` / `tool.call.images`（都 `priority: 100`），另有 `conversation.input.attachments` 与 `conversation.trajectory.images` | ui-attachment `lib/client.js:2380-2395`（`apply(ctx)` 里的 `slots.inject`）；`lib/index.js` 只导出宿主半区的空 `apply()` |
| 图片组件的真身：`ImageGallery`（`data-align=start\|end`，多图 ≥2 走 64px 方砖、单图按 singleFit）+ `MessageImage`（peek 同步出图 → loader 拉 → 失败给可点重试 → 点开 `ImageLightbox`） | 同包 `lib/client.js:2196-2325` |
| singleFit 口径：长边 240px、显示比夹在 `[0.25, 4]`、**不放大超过原图**（`scale = min(1, w/boxW, h/boxH)`），裁切锚点偏上 / 偏左 | 同包 `:2168-2192` |
| CSS 由该包**自己注入**：`<style data-plugin-css="@deepseek-ai/dsh-client-ui-attachment/MessageImage.module.css">`，类名 `<hash>_gallery / frame / loading / error / spinner`（实测 `R_Yw7q_*`） | 同包 `:2139-2159` |
| URL 只能经官方服务拿：`UiConversation.imageUrl(sessionId, attachment: ImageAttachmentRef): Promise<string>` 与 `peekImageUrl(...): string \| undefined`（按会话缓存，URL 存活到 binding 释放）；官方 ChatView 就是这么接的 `loadImage = (a) => ctx.uiConversation.imageUrl(sessionId, a)` + `.peek` | ui-conversation `lib/types/client/conversation/assembly.d.ts:72,79`；ui-chat `lib/client.js:15506` |
| 图片块的字段是 `ImageAttachmentRef`（来自 `@deepseek-ai/dsh-attachment`，含 `attachmentId` 与原图 `width`/`height`），内容块里是 `{ type: 'image', attachment }` | ui-conversation `contract/records.d.ts:35`；ui-chat `lib/client.js:6012-6029` |
| 纯图片消息**不画气泡**：`showBubble = text !== '' \|\| extraBlocks.length > 0`，图片只进附件行 | ui-chat `lib/client.js:9360-9370` |

处置（本仓）：`src/adv/session/mirror/MessageImage.ts` 按上述 DOM / 类名直画（弹窗不走槽机制），
`faces.ts` 给 `UiConversationFace` 加可选的 `imageUrl` / `peekImageUrl`，
`open-session-view.ts` 把它们绑成 `SessionViewTarget.loadImage`（`this` 必须经服务对象调用），
`official-classes.ts` 的前缀表补 `@deepseek-ai/dsh-client-ui-attachment/`；
用户消息与助手内联图片都改为真图，loader 缺席时才退回「[图片]」文本占位。
未接：`tool.call.images`（`read_image` 工具卡内的图片区，官方 = `imageBody` + 槽 + `imageMeta` 路径/尺寸）。

## 更新日志

- 2026-11-08 23:34:50：按文档库规范建立版本元数据与统一目录索引
