# 20261020-1603-选择器-picker-ui-改版-e0bb：选择器（Picker）UI 改版

> **创建**：2026-10-20 16:03:53（@GuoJia-Agent）
> **分类**：界面 ｜ **标签**：选择器、Picker、样式

<!-- 「> **分类**：… ｜ **标签**：…」行由脚本按 new --category / --tags 插入；两者皆空则不写。 -->

## 背景

用户 2026-10-20 看 demo 选择器页后提的整批需求（原话口径）：

1. 所有下拉触发器右侧箭头符号不对，要换成截图里的 chevron（官方 ⌄ 形）。
2. 所有下拉框支持前面带 icon；选项最好也支持前面的 icon；demo 里要演示。
3. 下拉里的搜索框要有配置（可要可不要）。
4. ModelPicker 做两种形态：联动（选厂商→选模型）与分组（厂商做组头、模型列下面），消费者自选；关注两种形态的返回数据是否一致。
5. 删掉 FilePicker（文件选择框，没有用）。
6. 多选 bug：到上限后已选项无法取消（`Picker.ts` 的 `atMax` 把已选项也置灰了）。
7. demo 的模型 / 工作区数据不要 mock，直接读宿主真实数组（demo 是宿主端插件）。
8. 讨论：要不要给 Input/Select/Textarea 这类组件内置 `hint` 参数（自动挂 FieldHint 问号），还是让调用方自己组合。

## 待办

- [x] Picker 触发器箭头改内联 SVG chevron（`Picker.ts` 触发器重排为 icon/summary/svg）。
- [x] `PickerOption.icon` + `Picker` 触发器 `icon`（CSS：`.dshpc-picker__icon` / `.dshpc-picker__option-icon`）。
- [x] `searchable` 语义统一：核心与包装器默认全关，要就传 true。
- [x] ModelPicker：`flat` 改名 `grouped`（分组渲染，厂商做组头）；两种形态 onChange 口径统一（都发最终模型 value，级联换厂商先发 `''`）；默认变更为 grouped。
- [x] 修多选上限 bug：atMax 时已选项保持可点（取消），未选项置灰（`Picker.ts` 选项渲染处）。
- [x] 删 `FilePicker`（组件 / 导出 / demo 全清）。
- [x] 新增 `src/ui/host-data.ts`：`connectHost(ctx)` 一次接线，`modelCatalog`（抄 stp DirectoryStore）+ `workspaceList`（镜像官方 `workspaces` 服务快照）；ModelPicker/WorkspacePicker 改 `useSyncExternalStore` 自取数，`groups` 参数仅作覆盖。
- [x] hint 内置：`Input` / `NumberInput` / `Textarea` / `Picker` 加 `hint?: string`，内部走 `withHint()` 挂标准 FieldHint（CSS `.dshpc-fieldwrap`）；FieldHint 本体保留可单独用。
- [x] demo：PickerPage 重排（icon/搜索开关/分组/多选可反选/hint）、ModelPicker+WorkspacePicker 吃真实目录与真实工作区列表、client apply 调 `connectHost(ctx)`、i18n 文案同步。
- [x] 文档同变更集：requirements §2.2/§6、architecture §数据从哪来、features/ui.md（Picker/Input/ModelPicker/WorkspacePicker 章节）、features.md、structure.md、features/explorer.md、external/dsh-host.md 新增 §11（本次核实的宿主 client 数据面）。
- [x] 新增 `test/host-data.test.mjs`（5 项：目录组装/空壳剔除/失败降级/两阶段幂等/换源镜像）。
- [x] build + 产物入库（dist/ 与 demo dist/ 均已更新）；`node --test` 65 项全绿；typecheck 干净；koc-codelint 六层全过（2 轮修完 2 条 biome 警告）。

## 下一步

- 用户在宿主真机更新 demo 插件验收：搜索框自动聚焦、默认图标 / 自定义初始文字、ModelPicker 真实目录、Textarea 右下角问号、NumberInput 焦点蓝框。
- 若模型目录仍空：看选择器顶部是否有「候选可能不完整」降级条——有 = 目录读到但 0 条路由（要么 listProviders 空、要么 provider profile 无 models），无 = 注入线没到。

## 过程（第三轮：模型目录真因与改道，2026-10-20）

- **前两轮的判断都错了**：① 补 `dsh.client.inject` 的 `@deepseek-ai/dsh-api-remotes` —— 该模块只影响
  remote 装配，而 `remote.llm` **根本没有「某 provider 的模型列表」**（只有 listProviders /
  listConfigurableProviders / discoverModels，见 `dsh-llm/lib/typert.remote-client.d.ts:10-12`）；
  ② 「读设置镜像 profile.models」在真机读出 0 个供应商。两条都不成立。
- **真因（读兄弟仓实现得出）**：模型只能宿主侧 `llm.listModels(providerId)` 取
  （`dsh-task-dispatch-table/src/dispatch.ts:81-88`、`src/host.ts:227-232`），再经插件自己的
  `webServer.register({ kind:'exact', path, handler })` 挂路由给 client fetch
  （`dsh-task-ledger/packages/plugin/src/host/routes.ts:20-44`）。demo 有宿主入口（`dist/index.js`），
  但之前是空壳，从来没挂过路由。
- **改道**：
  - 新增 `src/host/index.ts`（`./host` 子路径）：`buildModelRoutes(llm)` 现查目录 +
    `serveModelCatalog(ctx, { path })` 注册只读路由；单 provider 抛错局部跳过。
  - `src/ui/host-data.ts`：删掉 remote.llm / configForms / loadModelDirectory，模型目录改成
    `connectHost(ctx, { modelsPath })` fetch 宿主路由；`modelCatalog.setRoutes/setUnavailable`。
  - demo：`src/paths.ts` 单一 path 常量、宿主入口 `apply` 调 `serveModelCatalog`、client 传
    `modelsPath`；撤掉 `@deepseek-ai/dsh-api-remotes` 声明（不再用 remote）。
  - `external/dsh-host.md §11/§11.1` 改写并标注两条已废弃结论；architecture / requirements / ui.md 同步。
- 测试随改：`test/host-data.test.mjs` 改为 buildModelRoutes + 两个 store（64 项全绿）。

## 过程（第二轮：真机反馈修复，2026-10-20）

- 搜索框自动聚焦：`Picker.ts` 加 `searchRef` + open 时 `focus()`。
- 模型目录空：原过滤要求 provider 的 profile 在设置文档**用户层**被写过（照抄 stp），改成「已注册 + profile 里有非空 models」——`user` 层在 describe 快照里不一定存在，按它过滤会把全部供应商滤空。**这是根据工作区有数据 / 模型全空的现象推断的成因，待真机复验**。
- 领域选择器默认图标 + 初始文字：`picker-icons.ts`（自绘文件夹 / 星），`icon` 三态（不传=默认 / null=无 / 元素=自定义），`placeholder` 可传（默认「工作区」/「模型」）。
- Textarea 的 hint 改右下角：`.dshpc-fieldwrap--block` 绝对定位，textarea 加 `padding-bottom:24px`。
- NumberInput 焦点态：`.dshpc-num:focus-within` 与 Input 同款蓝框（内层 input 无边框，状态画在外框）。
- hint 口径确认：**单参数**（传字符串才显示，不传不显示，默认隐藏）——用户选的第二种方式，无需改 API。

## 过程

<!-- 踩坑与证据：带 revision + 文件:行号 或符号名 -->

## 结论

<!-- 做成了什么、留了什么坑 -->

## 执行记录

<!-- 本节由脚本维护：new / claim / set / release / log / close 自动追加，请勿手改。
     补记用 progress.py log --id <任务号> --note "一句话"。 -->
- 2026-10-20 16:03:53 · new · @GuoJia-Agent · 创建任务（doing）
- 2026-10-20 16:27:00 · log · @GuoJia-Agent · 需求入库：worklog 记 8 条（chevron/icon/搜索可配/双形态/删FilePicker/多选上限bug/真实数据/hint讨论），待对齐工作区取数通路
- 2026-10-20 16:56:38 · log · @GuoJia-Agent · 交付：chevron/icon/hint内置/双形态改名grouped/多选反选bug/删FilePicker/host-data自取数(connectHost)+5项新测试；65测试+typecheck+codelint全过，产物入库待真机验收
- 2026-10-20 17:24:35 · log · @GuoJia-Agent · 第二轮：搜索自动聚焦/模型目录改按models过滤(推断user层缺失致滤空)/领域选择器默认icon+可自定义文案/Textarea问号右下/NumberInput焦点态；65测试+codelint全过
- 2026-10-20 17:27:56 · log · @GuoJia-Agent · 根因1：demo 的 dsh.client.inject 缺 @deepseek-ai/dsh-api-remotes ⇒ remote.llm 不挂载(已补)；根因2：fieldwrap 让位规则把 textarea 缩窄(已还宽度)；已记 external §11.1
- 2026-10-20 17:39:45 · log · @GuoJia-Agent · 第三轮真因：remote.llm 无模型列表，改宿主 llm.listModels + serveModelCatalog 路由(./host) + client fetch；删 configForms/remote 路径；需重装 demo 让宿主入口生效
