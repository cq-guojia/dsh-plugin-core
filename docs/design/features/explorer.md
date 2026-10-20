# explorer —— 工作区浏览

依赖 `ui` + `design` + `utils`。装的是「文件浏览」这个成品：**一个面板本体 + 两个命令式能力**。
选工作区在 `ui`（`WorkspacePicker`），不在这里。

2026-10-20 重做（移植自兄弟项目 `dsh-task-dispatch-table/src/client/file-browser.tsx`，
"抄"不是"复制"：组件全部换 core 体系，官方件只经 `ui/official` 子路径消费）。

## 两个命令式能力（对外主入口）

| 能力 | 签名要点 | 形态 |
|---|---|---|
| `openFilePreview(opts)` | `{ workspaceFiles, sessionId, path, officeToPdf?, rootName?, width?, maxWidth?, mainMinWidth?, title?, onClose? }` ⇒ `{ close(), path }` | 右侧停靠预览（拖宽、✕ 归核心 `PanelDock`；Esc / `close()` 也能关）；重复打开关旧的 |
| `pickWorkspaceFile(opts)` | `{ workspaceFiles, sessionId, anchor?, filter?, officeToPdf?, rootName?, workspaces? }` ⇒ `Promise<{ path, isDir } \| null>` | 锚定按钮旁的模态弹窗；Esc / 点外部 / ✕ 取消 resolve `null` |

- `path` 文件或文件夹都吃：`list(path)` 成功 ⇒ 目录树；报错 ⇒ 文件预览态（dir 取父目录，面包屑保留可返回）。
- `pickWorkspaceFile` 的 `filter`：`{ exts: ['ts'] }` 只要某扩展名 / `{ dirs: true }` 只要文件夹 / 不传不限。
- 选中回传**工作区相对路径**（口径同兄弟项目：绝对路径会被宿主附件 zod 拒；根由 `stat.absolutePath` 反推）。
- 两者共用同一 `FileBrowser` 面板（用户 2026-10-20 拍板：同一套内容，两种展现形式）。
- **浏览态的侧边栏本体是核心 `PanelDock`**（用户 2026-10-21 拍板）：`openFilePreview` 自建
  container + `createRoot` 挂载 `<PanelDock><DockPanel>{FileBrowser}</DockPanel></PanelDock>`，
  拖宽与关闭由 PanelDock 出（它的 resizer / header 关钮），FileBrowser **自己不画外壳也不画拖拽条**；
  宽度记忆按调用方的 `width` 走（本用例传 `storageKey: false`，预览是临时面板不继承上次落位）。

```ts
import { openFilePreview, pickWorkspaceFile } from 'dsh-plugin-core/explorer'

openFilePreview({ workspaceFiles, sessionId, path: 'docs/requirements.md' })

const picked = await pickWorkspaceFile({ workspaceFiles, sessionId, anchor: btn, filter: { exts: ['ts'] } })
```

## 面板本体 `FileBrowser`

`FileBrowser(props)`：`workspaceFiles` / `officeToPdf?` / `sessionId` / `path` / `onClose?` /
`rootName?` / `workspaces?` / `onSelectWorkspace?` / `rootCache?` / `style?` / `translate?`；
选择器态另加 `picker` + `onPick(path, isDir)` + `filter?`（浏览态不加任何形态参数——外壳归 PanelDock）。

**控件纪律（用户 2026-10-21 定）**：核心有控件的用核心 —— 面包屑 = `Button variant="ghost"`、
复制 / 刷新 / 关闭 / 展开开关 = `IconButton`、渲染 ⇄ 源码 = `Segmented`、文字 = `MarqueeText`、
行尾「进入 / 选择此文件夹」= `Button variant="outline"`；**第二排所有控件与 Segmented 同高度档（md = 28px）**。
唯一自写项是 **▾ 选层浮层**（核心没有「带缩进的选择层菜单」这类控件）⇒ 按兄弟项目
`.dsh-tdt-sv-crumbs-*`（`archive-session-css.ts`）逐像素照抄：backdrop + 菜单本体
（`padding:4px`、`max-height:240px` 后滚动、条目 `padding:4px 8px`、最大宽 280px、箭头位 11px、空态弱化）。
树行同口径：`gap:8px` / `padding:6px 8px` / 圆角 6px（一处定义 `--fb-radius`）。

提供：

- **面包屑**：超宽折叠为当前层名（隐藏测量条 + ResizeObserver，与可见态同构，不超长必还原）；
  行首 `▾` 选层下拉（自写浮层，条目 = 当前工作区置顶 + 路径层级缩进 + 其他工作区，点当前工作区回根）；
  根名不写死（调用方传 `rootName`，否则用反推根的末段）。
- **内联展开目录树**：行 = 就地展开/收起（两种形态统一），行尾核心按钮分派（选择器 = 选此文件夹，
  浏览 = 进入）且**悬停 / 聚焦该行才出现**（平时保留占位、出现时不顶动行内布局）；
  子项懒加载 + 缓存；截断提示；键盘可达（role/tabIndex/Enter/Space）。
- **文件态第二排**（仅预览态显示）：文件名跑马灯 + md/html「渲染 ⇄ 源码」切换 + 复制路径 + 刷新。
- **越界降级**：list 真实错误码 `outside-workspace` / `not-found` ⇒ 第一排换只读完整路径，不给会失败的入口。
- **工作区根反推**：`stat.absolutePath` 后缀匹配 + 有界 BFS（每层 ≤5 目录、≤3 层）⇒ 空目录/只含子目录也能拼绝对路径；
  缓存**可注入**（`rootCache`，调用方控制生命周期；不传内部自建随组件废弃——不用模块级 Map）。

## 宿主契约：`WorkspaceFilesFace` / `OfficeToPdfFace`

**由插件从 `ctx` 取出这一小块传进来**（不要传整个 `ctx`——那会把本包和宿主版本焊死）。

| 方法 | 签名要点 |
|---|---|
| `read` | `(sessionId, path, range, signal?)` —— ⚠️ `range` **必传**（官方按位置参数个数校验），读全量传 `{}` |
| `readBytes` | `(sessionId, path, options, signal?)` —— `options` 同样必传；不传 range 读全量 |
| `list` | `(sessionId, path, signal?)` ⇒ `{ path, entries, truncated }`；list 一个文件报 not-directory；空串根以 `'.'` 上线（0.2.0-rc.1 起官方拒空路径） |
| `stat?` | 可选；只认 regular file（目录抛）。用于工作区根反推 |
| `officeToPdf` | 不是 `WorkspaceFilesFace` 的槽位，是组件可选 prop；宿主没装 ⇒ Office 文件出「不可用」空态，不崩 |

纯逻辑层在 `types.ts`（零 React / 零官方件，node 单测直接引）：`previewInfoOf` / `errView` /
`listingOf` / `textPageOf` / `bytesOf` / `sortEntries` / `matchesFilter` / `learnRoot` /
`relativizeToRoot` / `absolutizeDir` / `findAnyFileAbs` / `pickWorkspaceAnchor` 等。

**`pickWorkspaceAnchor(items)`** —— 浏览锚点的唯一落点：`workspaceFiles` 是**会话作用域**服务
（list / read 都要 `sessionId`），「打开文件夹」必须先落到真会话上。入参 = 宿主 `workspaces`
服务快照的行（`{ title, sessionIds?, updatedAt? }`，见 `docs/design/external/dsh-host.md` §11），
返回最近更新且带会话的那个工作区的 `{ title, sessionId }`；都没有 ⇒ `null`（调用方如实显示「未就位」）。

## 单文件预览（`dsh-plugin-core/explorer/preview`）

`FilePreview({ workspaceFiles, sessionId, path, officeToPdf?, sourceView? })` —— 按扩展名分派：

| 类型 | 渲染 |
|---|---|
| md | 官方 `MarkdownText`（mdast + KaTeX，labels 从 core 字典构造） |
| 代码 / 文本 | 官方 `CodeBlock`（Shiki，`languageForPath` 判语言，默认换行）；read 分页 + 「加载更多」 |
| html | sandbox iframe + 官方同款 CSP/禁标签清单（`buildStaticHtml`）；源码态 256K 字节截断 |
| pdf / 图片 | `readBytes` → Blob → iframe / `<img>` |
| office（doc/docx/ppt/pptx） | 宿主 `officeToPdf` 转 PDF → iframe；未注入 ⇒ 不可用空态 |
| 其余 | 按文本读，read 抛 `not-text` ⇒ 「不是文本文件」空态（不本地猜二进制清单；xls/xlsx 按 2026-10-05 拍板暂不纳入） |

预览体可单独 import（会话附件、工具输出场景），不必搬整个面板。

## 移植时修掉的源实现问题

| 源实现问题 | 处理 |
|---|---|
| 模块级 `workspaceRoots` Map 永不清除 + `setRootNonce` hack | 改可注入 `RootCache`（`createRootCache()`），随组件/调用方废弃 |
| 复制路径复制当前形态（可能绝对路径）vs picker 回传相对 | 统一为工作区相对（`relativizeToRoot`） |
| `copyPath` 无 catch（剪贴板 reject = unhandled rejection） | 补 `.catch`，静默 |
| 自绘 menu 浮层 + backdrop + 点外关闭与官方 Menu portal 豁免坑 | 2026-10-21 反转为**自写浮层**（回流到源实现形态）：官方 Menu 的观感对不上「▾ 选层」这份特有的缩进菜单；改用兄弟项目同款度量 + 整屏透明 backdrop（层序 1200/1201 高于 picker 面板 1100 ⇒ 点面板也算「点外部」） |
| 死代码 `barRef` / `ListEntry.size`；`ensureRootLearned` 与 `absolutizeDir` 重复 | 删除 / 合并进挂载效应 |

## 已知限制（选型前必读）

- 代码高亮用官方 Shiki `CodeBlock`：大文件（万行级）整篇 DOM 重排在拖宽时可能卡——
  兄弟项目为此自绘过 CodeMirror 版，core 不引重依赖，真出现再议。
- 目录树无虚拟滚动，超大目录（官方上限 2000 条）一次渲染完。
- `learnRoot` 是 `endsWith` 启发式：symlink / 改名挂载可能学不出根（退化显示，不崩）。

## 定制边界

- 宿主能力接口稳定 ⇒ 换宿主版本通常只改插件侧「取出」那一行。
- 不要 fork 面板：内部与 `ui` 的样式域耦合，fork 后跟不上 token 调整。
- picker 弹窗的定位 / 关闭逻辑在 `open.ts`（core 包好）；要换形态（非锚定、多选）提需求进本包。
