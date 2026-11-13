# 结构规范

本文件回答三个问题：

1. **控件怎么归类** —— 一个新控件该放哪，按固定顺序判定，不用开会。
2. **代码怎么分** —— 每个目录放什么、谁依赖谁。
3. **预览插件（packages/demo）左侧怎么分** —— 与代码同构的两级目录。

> 运行逻辑（样式注入机制、数据流、触发关系）的真源在 `docs/design/architecture.md`，本文不重复。
> 2026-11-05 用户拍板：分类改用**业界通名**（对齐 Ant Design / Element Plus / MUI / Mantine / Chakra 的菜单），
> 并且**结构优先于兼容** —— 消费方该改就改，不为保持旧 import 而选不合理结构。

## 一、三级：区 → 类 → 控件

| 级 | 是什么 | 举例 |
|---|---|---|
| **区** | 能力域，导航一级 | 入门 / 设计 / 控件 / 应用模块 / 工具方法 |
| **类** | 控件按用途归的类，导航二级 + 目录一级 | 动作 / 录入 / 展示 / 反馈 / 布局 / 导航 |
| **控件** | 一个导出件 = 目录里的一个文件 | `Button.ts` / `Picker.ts` / `Table.ts` |

「区」只存在于**导航与文档**里；代码目录只有类和控件。两棵树不是同一棵树，别互相找。

## 二、控件归类：三步判定

拿一个新控件，从上往下走，走到哪停就放哪：

1. **import React 或 DOM 吗？** 不 import → 它不是控件：落 `src/utils/`（纯方法）或 `src/design/`（值 / 注入机制）。
2. **必须拿到业务对象（工作区 / 会话 / 文件 / 模型）才能工作吗？** → 落 `src/adv/`，不进 `ui`。
3. **按「用户拿它做什么」选类**：

| 类 | 判据 | 成员（2026-11-11） |
|---|---|---|
| **动作** `actions` | 点它触发一次操作，本身不产生值 | Button、IconButton |
| **录入** `inputs` | 产生或修改一个值 | Input、NumberInput、PrefixedInput、Textarea、Checkbox、Segmented、Picker、DateTimePicker、WorkspacePicker、ModelPicker、InputGroup、CodeEditor |
| **展示** `display` | 只呈现内容，不改变状态 | Card、StripCard、Surface、Chip、Table、ListRow、CodeViewer、MarqueeText、FlipText、LiveText、SectionHead、FieldHint |
| **反馈** `feedback` | 表达「正在进行 / 刚完成 / 出错了」 | Modal、SideSheet、AlertModal、ConfirmModal、alertModal、confirmModal、Toast、host-toast、Loader、LoaderBar、Loading |
| **布局** `layout` | 只决定内部元素怎么摆、怎么拼 | SplitGroup、PanelDock、QuickToolbar、resizer |
| **导航** `navigation` | 在多个视图 / 页之间移动 | Pagination |
| **基础设施** `infra` | **不是控件**：宿主桥、注入器、纯逻辑、跨类共用底座 | official、css、locale、tooltip、host-data、modal-host、loading-host、toast-host、overlay、panel、thenable、ticker、chevron（皮肤各归控件自己的 `*-css.generated.ts`） |

三条边界裁决（按顺序用）：

1. **同时持有「值」和「操作」** → 归布局（它其实是两个控件焊在一起），或者直接拆成两个。
2. **内部元素位置由它决定** → 布局；**只加一层外观、位置全由调用方给** → 展示（Card / Surface 属展现外壳）。
3. **跨类说不清** → 按**多数派**：查 AntD / Element / MUI / Mantine / Chakra 的菜单，装得多的那类胜出，并在本文登记结果。

**新增第 8 个类要用户拍板**，agent 一律不自建 —— 这是防「又冒出一个新空间」的闸门。
拿不准时归现有 6 类，宁可挤一点也不另开。

## 三、代码分层

```
src/
├── design/                 ① 设计层 —— 只放「值」和「注入机制」，零 React
│   ├── tokens                 颜色 / 字号 / 间距 / 圆角 / 层级（别名官方 --dsw-alias-*）
│   └── style-kit              运行时注入 <style>，createStyleKit({ id })
│
├── ui/                     ② 控件（依赖 design）
│   ├── index.ts               整包入口（纯 re-export 转发表，不复制实现）
│   ├── official.ts            L1 官方 adapter —— 全仓唯一 import 官方 primitives 的地方
│   ├── actions/               Button · IconButton（+ button.css / generated）
│   ├── inputs/                Field（Input/NumberInput/PrefixedInput）· Textarea · Checkbox
│   │                          Segmented · Picker（+ picker-logic / picker-icons）
│   │                          DateTimePicker（+ datetime-logic）· InputGroup
│   │                          WorkspacePicker · ModelPicker · CodeEditor
│   ├── display/               Card · StripCard · Surface · Chip · Table · ListRow（+ table-logic / table-shared）
│   │                          CodeViewer（+ code-viewer-lang / -theme / 子路径入口 code-viewer）
│   │                          MarqueeText · FlipText · LiveText · SectionHead · FieldHint
│   ├── feedback/              Modal · SideSheet · AlertModal · ConfirmModal（+ modal-host）
│   │                          Toast（界面，唯一 import sonner）· notify（发送 API，纯 TS）
│   │                          （+ toast-queue 纯类型与本页队列 / notify-bridge 广播适配 / toast-host 宿主单例）
│   │                          host-toast · Loader · LoaderBar · Loading
│   ├── layout/                SplitGroup · PanelDock（+ panel-dock-logic）· QuickToolbar
│   │                          （+ quick-toolbar-logic）· resizer
│   ├── navigation/            Pagination（+ pagination-logic）
│   └── infra/                 css · locale · tooltip · host-data
│                              overlay / panel（跨类共用浮层底座 + 皮肤）· thenable · ticker · chevron
│                              code-mirror-surface（只读 / 可编辑共用的渲染底座）
│                              task-notifications（通知中心：任务池 + 事件总线 + 跨页广播，零 UI）
│
├── utils/                  ③ 纯方法 —— 零 React / 零 DOM（谁都能用，它不依赖谁）
│   ├── date                   日期 / 相对时间 / 时间区间
│   ├── i18n                   内置中英字典
│   ├── path                   joinPath / parentOf / crumbsOf / extOf / mimeOf
│   └── number / string / http 暂缓（不对外承诺，但代码在）
│
├── adv/                    ④ 应用模块 —— ui + utils 拼出来的成品
│   ├── explorer/              文件浏览：FileBrowser · openFilePreview · pickWorkspaceFile · 预览体家族
│   └── session/               会话记录：SessionPreview
│
└── host/                      宿主接口类型（无运行时）
```

**一个控件的四份东西放同一个目录**：`X.ts` + `X-logic.ts`（若有）+ `X.css`（真源）+ `X-css.generated.ts`（生成物）。
CSS 真源位置改动要同步 `scripts/gen-css.mjs` 的 `MAP`（显式清单，刻意保留摩擦）。

## 四、依赖方向（单向，不许反向）

```
design ──▶ ui ──▶ adv/explorer · adv/session
utils（谁都不依赖，谁都可以用）
```

- `utils` 不得 import `ui` / `design` / React / DOM / 宿主 API。
- `design` 不得依赖 `ui`（否则「只想要 token 的插件」被迫拖进 React）。
- `ui` 不得依赖 `adv/*`（反向成环）。
- `adv/*` 只从 `ui` / `utils` 的公开导出消费，不直接 import 官方平台模块（要包先过 `ui/official.ts`）。

## 五、立包判据

**有实质内容、会持续长大的功能模块才独立成区；只是一个控件就进 `ui`。**
统一到「控件」粒度，不提整个页面。

## 六、对外入口

**一个 npm 包、一个版本、一次安装不变。** 变的是门牌：整包一张清单，单块各自直达真源。

| 子路径 | 用途 | 为什么单独开 |
|---|---|---|
| `dsh-plugin-core/ui` | 整包：全部控件 + 通知任务中心 | 纯 re-export 转发表（零实现、不复制）；想全引就用它，接受产物变大 |
| `dsh-plugin-core/ui/<控件>` | 单块：如 `/ui/button` `/ui/input` `/ui/picker` `/ui/table` | 一条 `exports` 指向一个独立 `dist/ui/**.js`；打包器从哪个文件进就只带那个文件及其 import 闭包 |
| `dsh-plugin-core/ui/official` | L1 官方 adapter | `adv/*` 要直接取官方件，属结构性第二入口 |
| `dsh-plugin-core/ui/code-viewer` | CodeViewer（只读）· CodeEditor（可编辑） | 直接引 `@uiw/react-codemirror`，重依赖必须可选；两个控件共用 `infra/code-mirror-surface`，不另开导出口 |
| `dsh-plugin-core/ui/host-toast` | 宿主原生 Toast | 入口静态 import 官方件会让 Node 单测崩（旧坑） |
| `dsh-plugin-core/adv/explorer` | 文件浏览 | 应用模块独立子路径 |
| `dsh-plugin-core/adv/session` | 会话预览 | 同上 |

**真源唯一**：`src/ui/index.ts` 与整包产物 `dist/ui/index.js` 只做转发，每个控件的实现只在自己那个 `.js` 里（如 `inputs/Field.js` 是 Input / NumberInput / PrefixedInput 的全站唯一实现）；每份 CSS 字符串常量也只有一个 `*-css.generated.js`，多个入口 import 同一个文件，打包器按路径去重。不存在复制出去的第二份。

**新增子路径的判据**：旧条款「不再新增子路径」针对的是「按分类开入口」—— 分类仍归目录，不归导出口。但**一个控件一个入口属物理切割，不是分类**，故按控件开放。新增控件必须同时登记 `package.json` 的 `exports` 与 `test/entry-surface.test.mjs` 的清单，漏一个自检即红；`test/entry-isolation.test.mjs` 再对每个入口验产物闭包，防聚合点回潮。

对标 MUI：`@mui/material` 的根入口同样是纯 re-export 转发表，官方默认写法是 `@mui/material/Button` 这类按组件路径导入；Rad UI 的《Barrel export policy》禁止 mega-barrel。本仓与之同构。

只读 / 可编辑是同一份 CodeMirror 能力的两种用法，属分类不属新依赖，故共用 `ui/code-viewer` 一条子路径：可编辑件归 `inputs`、只读件归 `display`，两个控件都不进主入口（否则重依赖会拖进所有插件的包）。

**样式链路不变**：`src/**/*.css` → `scripts/gen-css.mjs` 编译成 `*.generated.ts` 字符串常量 → tsc → 运行时注入。控件直引自己那份生成物，不再经 `infra/controls-css.ts` 这类聚合 barrel（已删除）。

## 七、demo 展示分区（两级，18 页）

侧栏与右侧共用 `packages/demo/src/sections/index.tsx` 的 `ALL_SECTIONS`（单一事实源）。

```
① 入门        start     帮助索引 / 快速开始 / 参考
② 基础设施  infra      设计基础（token · 明暗） / 通知任务中心（状态池 · 事件 · 跨页）
③ 控件        components
   ├─ 动作    actions       Button · IconButton
   ├─ 录入    inputs        Input · NumberInput · PrefixedInput · Textarea · Checkbox
   │                        Segmented · Picker · DateTimePicker · WorkspacePicker
   │                        ModelPicker · InputGroup
   ├─ 展示    display       Card · StripCard · Surface · Chip · Table · ListRow · CodeViewer
   │                        MarqueeText · FlipText · LiveText · SectionHead · FieldHint
   ├─ 反馈    feedback      Modal · SideSheet · AlertModal · ConfirmModal
   │                        Toast · Loader · LoaderBar · Loading
   ├─ 布局    layout        SplitGroup · PanelDock · QuickToolbar
   └─ 导航    navigation    Pagination
④ 应用模块    blocks      文件浏览 / 会话预览
⑤ 工具方法    utils       日期时间 / 文本 / 数字 / HTTP / 多语言
```

合并后的页按旧页面的顺序串联，控件之间的分节就是各 `Example` 块自己的标题（不再额外加一层小标题）。

## 八、对应表：导航 ↔ 代码 ↔ 文档

| 导航项 | 代码 | 文档 |
|---|---|---|
| ① 入门 | （无，讲述型） | `docs/help/index.md` + `integration.md` |
| ② 基础设施 | `src/design/` | `docs/help/design.md` |
| ② 基础设施 · 通知任务中心 | `src/ui/infra/task-notifications.ts` | `docs/help/task-notifications.md` |
| ③ 控件 · 动作 | `src/ui/actions/` | `docs/help/ui.md` |
| ③ 控件 · 录入 | `src/ui/inputs/` | 同上 |
| ③ 控件 · 展示 | `src/ui/display/` | 同上 |
| ③ 控件 · 反馈 | `src/ui/feedback/` | 同上 |
| ③ 控件 · 布局 | `src/ui/layout/` | 同上 |
| ③ 控件 · 导航 | `src/ui/navigation/` | 同上 |
| （无导航项） | `src/ui/infra/` | 只在「入门 · 接入」讲一句 |
| ④ 应用模块 | `src/adv/explorer/`、`src/adv/session/` | `docs/help/explorer.md`、`session.md` |
| ⑤ 工具方法 | `src/utils/` | `docs/help/methods.md` |

## 九、未落地项

- ~~**分类表 + 自检**~~ → **已落地**（2026-11-05）：`test/ui-taxonomy.test.mjs` 盯三件事 —— `src/ui` 根只许 `index.ts` / `official.ts`、类目录只有登记过的 7 个、`*.css` 与 `*-css.generated.ts` 必须同目录成对。
- **暂缓项**：`utils/string`、`utils/number`、`utils/http`、`ui/feedback/Loading`（只标注，未删代码）。
- **库里没有的**：
  - Switch 开关 —— 官方 primitives 有，归「包官方」批次；
  - Select 下拉 —— 用 `Picker` 代替（`SelectField` 曾因依赖官方 Menu 被删，属已反转的旧决策）。

## 更新日志

- 2026-11-08 23:34:49：按文档库规范建立版本元数据与统一目录索引
- 2026-11-13：对外入口改为「整包 + 按控件单块」两类；删除 CSS 聚合 barrel，控件直引各自生成物；写明真源唯一与新增登记闸门
