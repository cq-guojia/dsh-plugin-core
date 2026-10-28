// 本文件由 scripts/gen-docs.mjs 自动生成，请勿手改。来源：docs/**/*.doc.ts（按 section.id 扁平聚合）
export const docData = {
  "help-index": {
    "id": "help-index",
    "heading": {
      "zh": "按你要做的事挑一份",
      "en": "Pick the one you need"
    },
    "prose": [
      {
        "zh": "本索引只回答「读哪一份」。按你要做的事挑一行，跳过去读完就能写代码。",
        "en": "This index answers one question: which document to read. Pick the row matching your task."
      },
      {
        "zh": "文件都在同一目录（`docs/help/`）：`<主题>.md` 给人读，同名的 `.doc.ts` 是真源。改内容请改真源后重跑 `node scripts/gen-docs.mjs`，`.md` 由它生成。",
        "en": "Everything lives in `docs/help/`: `<topic>.md` is what you read, the `<topic>.doc.ts` beside it is the source. Edit the source, then rerun `node scripts/gen-docs.mjs` — the `.md` is generated."
      }
    ],
    "api": [
      {
        "id": "help-index-table",
        "rows": [
          {
            "name": "把这个包接进我的插件",
            "type": "integration.md",
            "def": "—",
            "desc": {
              "zh": "装包、初始化样式、最小可用控件与工具函数、清理，一条龙示例",
              "en": "Install, style init, minimal working controls and helpers, teardown — end to end"
            }
          },
          {
            "name": "用控件（按钮 / 输入 / 选择器 / 弹窗 / 右侧分栏）",
            "type": "ui.md",
            "def": "—",
            "desc": {
              "zh": "控件清单与全部 props；弹窗与 PanelDock 的布局约定在此",
              "en": "Control inventory and every prop; dialog and PanelDock layout contracts are here"
            }
          },
          {
            "name": "建 style kit、覆盖 token、多插件同页隔离",
            "type": "design.md",
            "def": "—",
            "desc": {
              "zh": "design 子包的 API：`createStyleKit` / `registerStyle` / 注入机制",
              "en": "The `design` subpackage API: `createStyleKit` / `registerStyle` / how injection works"
            }
          },
          {
            "name": "处理日期、字符串、字节、HTTP",
            "type": "utils.md",
            "def": "—",
            "desc": {
              "zh": "纯函数清单与参数，含每个函数的失败返回值",
              "en": "Pure helpers and their arguments, including each one’s failure return"
            }
          },
          {
            "name": "加工作区文件浏览与预览",
            "type": "explorer.md",
            "def": "—",
            "desc": {
              "zh": "右侧分栏预览与文件选择器；都要宿主提供的工作区快照",
              "en": "Right-dock preview and file picker; both need the host workspace snapshot"
            }
          },
          {
            "name": "把一次会话渲染成只读预览",
            "type": "session.md",
            "def": "—",
            "desc": {
              "zh": "会话数据链与弹窗 props；归档会话同样可读",
              "en": "The session data chain and dialog props; archived sessions read fine too"
            }
          },
          {
            "name": "查方法的统一口径（失败不抛错、兜底不编造）",
            "type": "methods.md",
            "def": "—",
            "desc": {
              "zh": "所有 utils 方法的共同行为约定，写调用代码前先看它",
              "en": "Shared behavior contract of every utils helper — read before writing call sites"
            }
          },
          {
            "name": "用 token、配色或定制皮肤",
            "type": "style.md",
            "def": "—",
            "desc": {
              "zh": "token 清单、明暗判据、能改什么改到哪为止",
              "en": "Token inventory, dark-mode predicate, and how far customization goes"
            }
          }
        ]
      }
    ]
  },
  "explorer": {
    "id": "explorer",
    "heading": {
      "zh": "概览",
      "en": "Overview"
    },
    "prose": [
      {
        "zh": "提供工作区文件浏览与选择，数据来自宿主提供的工作区文件快照。",
        "en": "Workspace file browsing and picking, driven by the host-provided workspace file snapshot."
      },
      {
        "zh": "**接线归核心**：client `apply` 里调一次 `connectHost(ctx)`，读文件服务、会话 id、工作区快照都由核心自己解，调用时只给容器和路径。",
        "en": "**Wiring belongs to core**: call `connectHost(ctx)` once in the client apply; the file service, session id and workspace snapshot are resolved by core — you only pass a container and a path."
      },
      {
        "zh": "落点只给一个元素：页面里**包住主区**的那个（核心会补成 flex 行、让主区伸展，关闭时还原），不要传 `document.body` 再自己套 fixed——那是浮层，不是分栏。",
        "en": "Pass one element: the one wrapping the main area. Core makes it a flex row and lets the main area stretch, restoring it on close. Never pass `document.body` with your own fixed positioning — that is an overlay, not a split."
      },
      {
        "zh": "绝对路径按最长前缀匹配所属工作区；落在任何工作区外时，文件照样能预览（官方 read 允许工作区外文件），只有目录树退化成只读路径栏。",
        "en": "Absolute paths are matched to their workspace by longest prefix. Outside every workspace the file still previews (official read allows it); only the directory tree degrades to a read-only path bar."
      }
    ]
  },
  "explorer-install": {
    "id": "explorer-install",
    "heading": {
      "zh": "0. 装包",
      "en": "0. Install"
    },
    "code": [
      {
        "id": "explorer-install-code",
        "lang": "bash",
        "src": "pnpm add dsh-plugin-core"
      }
    ]
  },
  "explorer-usage": {
    "id": "explorer-usage",
    "heading": {
      "zh": "1. 接入示例",
      "en": "1. Usage"
    },
    "prose": [
      {
        "zh": "`connectHost(ctx)` 只收这一小块，不把整个 ctx 传进核心。",
        "en": "`connectHost(ctx)` takes just that one slice; the whole ctx never enters core."
      }
    ],
    "code": [
      {
        "id": "explorer-usage-code",
        "lang": "tsx",
        "src": "import { openFilePreview, pickWorkspaceFile } from 'dsh-plugin-core/explorer'\n\n// 只在 client apply 里接线一次（接工作区快照 + 读文件服务），之后不用再碰服务\nconnectHost(ctx)\n\n// 右侧分栏预览（占宽度、挤窄主区）：一个容器 + 一个路径就够\nopenFilePreview({ mount, path: '/abs/ledger' })   // 文件夹 ⇒ 目录树；文件 ⇒ 直接预览\nopenFilePreview({ mount, path: 'docs/README.md' }) // 工作区相对路径也行\n\n// 覆盖项：指定工作区快照 / 指定会话 / Office 转 PDF / 与别处共用的根缓存\nopenFilePreview({ mount, path, workspaceAnchors, sessionId, officeToPdf, rootCache })\n\n// 锚定弹窗选文件（Promise 返回路径，不自己挂 dock）\nconst r = await pickWorkspaceFile({ anchor, filter: { exts: ['md'] } })"
      }
    ]
  },
  "explorer-api": {
    "id": "explorer-api",
    "heading": {
      "zh": "API",
      "en": "API"
    },
    "api": [
      {
        "id": "explorer-api-table",
        "rows": [
          {
            "name": "openFilePreview(opts)",
            "type": "OpenFilePreviewOptions => FilePreviewHandle",
            "def": "—",
            "desc": {
              "zh": "在右侧分栏打开文件 / 文件夹预览，返回可关闭它的句柄。预览内容二选一：`path`（核心解析并渲染）或 `content`（由调用方给内容）",
              "en": "Opens a file/folder preview in the right-side dock and returns a handle to close it. Body is one of two: `path` (resolved and rendered by core) or `content` (rendered from your own node)"
            }
          },
          {
            "name": "opts.mount",
            "type": "HTMLElement",
            "def": "—",
            "required": "是",
            "desc": {
              "zh": "页面里**包住主区**的那个元素；不必自己写 flex（核心补成 flex 行并让主区伸展，关闭时还原）。不要传 `document.body`",
              "en": "The element wrapping the main area; no flex needed (core turns it into a flex row, stretches the main area, and restores it on close). Never `document.body`"
            }
          },
          {
            "name": "opts.workspaceFiles",
            "type": "WorkspaceFilesFace",
            "def": "—",
            "desc": {
              "zh": "读文件服务。**一般不用传**：`connectHost(ctx)` 接线后核心自己持有；传了以传入为准。传 `content` 时可省",
              "en": "File service. **Usually unnecessary**: core holds it after `connectHost(ctx)`; when passed it wins. Optional when passing `content`"
            }
          },
          {
            "name": "opts.sessionId",
            "type": "string",
            "def": "—",
            "desc": {
              "zh": "该工作区的真实会话 id。**一般不用传**：按路径匹配所属工作区，匹配不出就取最近有会话的工作区；传 `content` 时可省",
              "en": "A real session id. **Usually unnecessary**: resolved from the path’s workspace, else the most recently updated workspace with a session; optional when passing `content`"
            }
          },
          {
            "name": "opts.path",
            "type": "string",
            "def": "—",
            "desc": {
              "zh": "工作区相对路径；绝对路径会自动按最长前缀匹配所属工作区。与 `content` 二选一",
              "en": "Workspace-relative path; absolute paths are matched to their workspace by longest prefix. Mutually exclusive with `content`"
            }
          },
          {
            "name": "opts.content",
            "type": "() => ReactNode",
            "def": "—",
            "desc": {
              "zh": "自定义预览内容，塞进同一个右侧 dock；传它时不需要 `path`",
              "en": "Custom preview body rendered in the same dock; no `path` needed when set"
            }
          },
          {
            "name": "opts.officeToPdf",
            "type": "OfficeToPdfFace",
            "def": "—",
            "desc": {
              "zh": "Office 转 PDF 能力；缺失则该格式走「不支持」而不是报错",
              "en": "Office→PDF capability; without it that format shows \"unsupported\" instead of erroring"
            }
          },
          {
            "name": "opts.rootName",
            "type": "string",
            "def": "—",
            "desc": {
              "zh": "兜底显示名（路径匹配不出工作区时用）",
              "en": "Fallback display name, used when no workspace matches the path"
            }
          },
          {
            "name": "pickWorkspaceFile(opts)",
            "type": "PickWorkspaceFileOptions => Promise<PickedFile>",
            "def": "—",
            "desc": {
              "zh": "锚定按钮弹出模态选文件，解析出 `{ path, isDir }`",
              "en": "Anchored modal picker that resolves `{ path, isDir }`"
            }
          },
          {
            "name": "opts.anchor",
            "type": "HTMLElement",
            "def": "—",
            "required": "是",
            "desc": {
              "zh": "模态贴着它弹",
              "en": "The modal anchors next to it"
            }
          },
          {
            "name": "opts.filter",
            "type": "PickFilter",
            "def": "—",
            "desc": {
              "zh": "按扩展名过滤 `{ exts: ['md'] }`；`dirs: true` 则只允许选文件夹",
              "en": "Filter by extension `{ exts: ['md'] }`; `dirs: true` restricts picking to folders"
            }
          }
        ]
      }
    ]
  },
  "foundation": {
    "id": "foundation",
    "heading": {
      "zh": "概览",
      "en": "Overview"
    },
    "prose": [
      {
        "zh": "零 React、无组件。装的是「值 + 注入机制」：token 变量表、注入器工厂、主题判据。",
        "en": "Zero React, no components. It ships values plus an injection mechanism: the token variable table, the injector factory, and the theme predicate."
      },
      {
        "zh": "只想统一配色/尺寸但自己写组件的插件，只引这一个就够。",
        "en": "A plugin that wants unified color/size but writes its own components needs only this subpath."
      }
    ]
  },
  "foundation-exports": {
    "id": "foundation-exports",
    "heading": {
      "zh": "导出",
      "en": "Exports"
    },
    "api": [
      {
        "id": "design-exports",
        "rows": [
          {
            "name": "createStyleKit(options)",
            "type": "",
            "def": "",
            "desc": {
              "zh": "领一套本插件专属的样式设施（必调）",
              "en": "Acquire a plugin-scoped styling kit (must call)"
            }
          },
          {
            "name": "DARK_THEME_SELECTOR",
            "type": "",
            "def": "",
            "desc": {
              "zh": "明暗判据选择器常量 `body[data-ds-dark-theme]`",
              "en": "Dark-mode predicate selector constant `body[data-ds-dark-theme]`"
            }
          },
          {
            "name": "type StyleKit / StyleKitOptions",
            "type": "",
            "def": "",
            "desc": {
              "zh": "类型",
              "en": "Types"
            }
          }
        ]
      }
    ]
  },
  "foundation-createStyleKit": {
    "id": "foundation-createStyleKit",
    "heading": {
      "zh": "createStyleKit(options)",
      "en": "createStyleKit(options)"
    },
    "api": [
      {
        "id": "createStyleKit-params",
        "rows": [
          {
            "name": "id",
            "type": "string",
            "required": "是",
            "def": "—",
            "desc": {
              "zh": "`<style>` 标签 id，多插件同页靠它互不覆盖，必须插件内唯一。空串抛错",
              "en": "The `<style>` tag id; on a page with multiple plugins it prevents overlaps and must be unique within the plugin. Empty string throws"
            }
          }
        ]
      }
    ]
  },
  "foundation-styleKit": {
    "id": "foundation-styleKit",
    "heading": {
      "zh": "返回的 StyleKit",
      "en": "Returned StyleKit"
    },
    "api": [
      {
        "id": "styleKit-members",
        "rows": [
          {
            "name": "id",
            "type": "string",
            "def": "—",
            "desc": {
              "zh": "回显",
              "en": "Echoed back"
            }
          },
          {
            "name": "tokensCss",
            "type": "string",
            "def": "—",
            "desc": {
              "zh": "已替换前缀的 token CSS 文本",
              "en": "Token CSS text with the prefix already substituted"
            }
          },
          {
            "name": "cssVar(name)",
            "type": "(name: string) => string",
            "def": "—",
            "desc": {
              "zh": "拼变量名：`cssVar('fg')` ⇒ `--acme-fg`",
              "en": "Build a var name: `cssVar('fg')` ⇒ `--acme-fg`"
            }
          },
          {
            "name": "registerStyle(domain, css)",
            "type": "(domain: string, css: string) => void",
            "def": "—",
            "desc": {
              "zh": "登记一个域的 CSS；同名重复登记 = 覆盖",
              "en": "Register a domain’s CSS; re-registering the same domain overwrites"
            }
          },
          {
            "name": "ensureStyles()",
            "type": "() => void",
            "def": "—",
            "desc": {
              "zh": "确保标签已挂载且内容最新（幂等；无 document 静默跳过）",
              "en": "Ensure the tag is mounted and current (idempotent; silently skips without document)"
            }
          },
          {
            "name": "applyStyle(domain, css)",
            "type": "(domain: string, css: string) => void",
            "def": "—",
            "desc": {
              "zh": "登记 + 立刻挂载",
              "en": "Register and mount immediately"
            }
          },
          {
            "name": "dispose()",
            "type": "() => void",
            "def": "—",
            "desc": {
              "zh": "撤掉标签并清空登记域（插件卸载 / HMR 时用）",
              "en": "Remove the tag and clear registered domains (on plugin unload / HMR)"
            }
          }
        ]
      }
    ]
  },
  "foundation-minimal": {
    "id": "foundation-minimal",
    "heading": {
      "zh": "最小可用",
      "en": "Minimal usage"
    },
    "code": [
      {
        "id": "design-minimal",
        "lang": "ts",
        "src": "import { createStyleKit } from 'dsh-plugin-core/design'\n\nconst kit = createStyleKit({ id: 'dsh-task-reminder-ui' })\nkit.applyStyle('tokens', kit.tokensCss)\n// 之后自己的样式域：\nkit.applyStyle('widget', '.widget{color:var(--dshpc-fg)}')"
      }
    ]
  },
  "foundation-tokens": {
    "id": "foundation-tokens",
    "heading": {
      "zh": "token 口径",
      "en": "Token conventions"
    },
    "prose": [
      {
        "zh": "token 覆盖颜色 / 尺寸 / 字号 / 层级，**含深色覆盖段**。取值一律走 `var(--dshpc-*)`，不在规则里写死颜色值。",
        "en": "Tokens cover color / size / font-size / elevation, **including the dark-mode override block**. Always read values via `var(--dshpc-*)`, never hard-code colors in rules."
      },
      {
        "zh": "完整清单与命名口径：前景 / 背景 / 边框 / 间距 / 字号 / 语义色七类，`--dshpc-` 前缀，含深色覆盖段。",
        "en": "Full inventory and naming: seven families (foreground / surface / border / spacing / font / semantic color / semantic surface), all `--dshpc-` prefixed, with a dark-mode override block."
      }
    ]
  },
  "foundation-customize": {
    "id": "foundation-customize",
    "heading": {
      "zh": "定制边界",
      "en": "Customization boundary"
    },
    "prose": [
      {
        "zh": "token 的**前缀固定 `dshpc`**（不参数化、不按插件改名）；token 的**内容**（有哪些变量、值是什么）是本包定的审美标准，消费方通过覆盖变量值来适配，不要改本包源码。",
        "en": "The token **prefix is fixed to `dshpc`** (not parameterized, not renamed per plugin); the token **content** (which variables exist, what values) is this package’s aesthetic standard — consumers adapt by overriding variable values, not by editing this package’s source."
      },
      {
        "zh": "要整套换肤：给同一批变量名赋新值即可，不需要 fork。",
        "en": "To reskin entirely: assign new values to the same variable names; no fork needed."
      }
    ]
  },
  "session": {
    "id": "session",
    "heading": {
      "zh": "会话预览",
      "en": "Session preview"
    },
    "prose": [
      {
        "zh": "把一次会话渲染成**只读弹窗**，观感与官方会话页一致。先用 `openSessionView` 建数据链得到 `view`（不可解析返回 `null`），再交给 `SessionViewModal`；**关闭时必须 `view.dispose()`**。",
        "en": "Renders one session as a **read-only dialog** that looks like the official session page. First `openSessionView` builds the chain and returns a `view` (`null` when unresolvable), then hand it to `SessionViewModal`; **call `view.dispose()` on close**."
      },
      {
        "zh": "数据全由调用方注入，组件不自己取。`archived` 从官方 `workspaces` 快照的 `archivedSessionIds` 读取并订阅刷新。归档会话走同一条链，同样可读。",
        "en": "All data is injected by the caller; the component fetches nothing. Read `archived` from `archivedSessionIds` on the official `workspaces` snapshot and keep it subscribed. Archived sessions travel the same chain and read fine."
      },
      {
        "zh": "快照只读，框内不能打字续聊。续聊 = `forkSession` 开分支 + `openHostSession` 跳官方会话区；暂存输入框的确定走 `onContinue`（fork + 发首轮 + 跳转）。",
        "en": "The snapshot is read-only, so you cannot type inside the dialog. Continuing means `forkSession` + `openHostSession`; the staging input’s confirm goes through `onContinue` (fork + first turn + navigate)."
      },
      {
        "zh": "文件出口只有一个：工具卡路径、行内引用、交付卡都走 `onOpenFile`；不传则链接降级为纯文本。预览由调用方开在**页面右侧**（`openFilePreview` 的 dock），弹窗不需要任何遮罩参数。",
        "en": "There is exactly one file exit: tool-card paths, inline mentions and delivered cards all go through `onOpenFile`; without it links degrade to plain text. The caller opens the preview as a **page-level right column** (the `openFilePreview` dock) — the dialog takes no mask props."
      },
      {
        "zh": "限制：官方样式未注入时回退自绘观感（功能不受影响）；长会话一次全渲染，用「加载更早记录」向前翻页；👍👎 反馈走官方 slots，弹窗没有该插槽。",
        "en": "Limits: without official styles injected, the self-drawn look applies (functionality unaffected); long sessions render whole, paged backward via \"load earlier\"; 👍👎 feedback goes through official slots, which this dialog lacks."
      }
    ],
    "api": [
      {
        "id": "session-view-target",
        "rows": [
          {
            "name": "openSessionView",
            "type": "(sessions, uiConversation, id, retainSource?) => SessionViewTarget | null",
            "def": "—",
            "required": "是",
            "desc": {
              "zh": "建数据链：retain → binding → open → target(chat)；不可解析返回 null",
              "en": "Builds the chain retain → binding → open → target(chat); null when unresolvable"
            }
          },
          {
            "name": "target",
            "type": "SnapshotFace<ChatViewFace | undefined>",
            "def": "—",
            "desc": {
              "zh": "chat 快照订阅面（供 useSyncExternalStore）",
              "en": "Chat snapshot surface (for useSyncExternalStore)"
            }
          },
          {
            "name": "session",
            "type": "SnapshotFace<SessionSnapshotFace>",
            "def": "—",
            "desc": {
              "zh": "会话自身快照（加载态 / 是否翻尽）",
              "en": "Snapshot of the session itself (loading state, paged-out)"
            }
          },
          {
            "name": "loadOlder",
            "type": "() => void",
            "def": "—",
            "desc": {
              "zh": "向前翻一页更早的历史",
              "en": "Page backward through older history"
            }
          },
          {
            "name": "dispose",
            "type": "() => void",
            "def": "—",
            "desc": {
              "zh": "释放 retain 引用；弹窗关闭必调",
              "en": "Release the retain reference; call on close"
            }
          }
        ]
      },
      {
        "id": "session-view-modal",
        "rows": [
          {
            "name": "sessionId",
            "type": "string",
            "def": "—",
            "required": "是",
            "desc": {
              "zh": "要预览的会话",
              "en": "The session to preview"
            }
          },
          {
            "name": "view",
            "type": "SessionViewTarget",
            "def": "—",
            "required": "是",
            "desc": {
              "zh": "openSessionView 的返回值",
              "en": "What openSessionView returned"
            }
          },
          {
            "name": "onClose",
            "type": "() => void",
            "def": "—",
            "required": "是",
            "desc": {
              "zh": "关闭回调；由调用方在里面调 view.dispose()",
              "en": "Close callback; the caller calls view.dispose() inside it"
            }
          },
          {
            "name": "heading",
            "type": "string",
            "def": "「会话预览」",
            "required": "否",
            "desc": {
              "zh": "弹窗标题，通常传宿主 sessions.list 的 displayTitle；会话 id 显示在标题下方副标题行（等宽小字）",
              "en": "Dialog title, usually the displayTitle from the host sessions.list; the session id sits on the monospace subtitle line below it"
            }
          },
          {
            "name": "archived",
            "type": "boolean",
            "def": "false",
            "required": "否",
            "desc": {
              "zh": "已归档时标题旁显示归档徽标，且「继续对话」先弹 fork 确认框；未归档则直跳官方会话页",
              "en": "When true an archive badge appears beside the title and \"Continue\" asks to fork first; when false it jumps straight to the official session page"
            }
          },
          {
            "name": "forkSession",
            "type": "(sessionId, atSeq?) => Promise<string>",
            "def": "—",
            "desc": {
              "zh": "开分支并返回子会话 id；缺 openHostSession 则不渲染「继续对话」",
              "en": "Fork and resolve the child session id; without openHostSession \"Continue\" does not render"
            }
          },
          {
            "name": "openHostSession",
            "type": "(sessionId: string) => void",
            "def": "—",
            "desc": {
              "zh": "跳官方会话区（uiWorkspace.openSession）",
              "en": "Jump into the official session area (uiWorkspace.openSession)"
            }
          },
          {
            "name": "onContinue",
            "type": "(message: string) => Promise<void>",
            "def": "—",
            "desc": {
              "zh": "暂存输入框的确定：调用方完成 fork + 发首轮 + 跳转；缺省 = 不渲染输入框",
              "en": "Staging input confirm: caller forks, sends the first turn, navigates; absent = no input rendered"
            }
          },
          {
            "name": "onOpenFile",
            "type": "(path: string, sessionId: string) => void",
            "def": "—",
            "desc": {
              "zh": "文件打开出口（工具卡 fileLink / 行内引用 / 交付卡共用）；第二参是文件所属会话 id，别拿别的会话去定位；缺省 = 链接纯文本",
              "en": "File-open exit shared by fileLinks, mentions and delivered cards; the second arg is the owning session id — locate the file there, not elsewhere; absent = plain text"
            }
          },
          {
            "name": "onOpenReview",
            "type": "(locator: ChangedFileReviewLocator) => void",
            "def": "—",
            "desc": {
              "zh": "变更文件的审阅出口（等价官方 openReview）；缺省 = 变更卡整张不可点",
              "en": "Review exit for changed files (equals official openReview); absent = the change card is not clickable"
            }
          },
          {
            "name": "t",
            "type": "Translate",
            "def": "内置",
            "desc": {
              "zh": "覆盖文案（内置字典已含全部会话文案，中英）",
              "en": "Override copy (the built-in dictionary has all session copy, zh+en)"
            }
          }
        ]
      }
    ],
    "code": [
      {
        "id": "session-usage",
        "lang": "tsx",
        "src": "import { openSessionView, SessionViewModal } from 'dsh-plugin-core/session'\n\n// 宿主服务由调用方注入：sessions ← dsh-api-session-controller、\n//   uiConversation ← dsh-client-ui-conversation\nconst view = openSessionView(sessions, uiConversation, sessionId, 'dsh-task-reminder')\nif (view !== null) {\n  h(SessionViewModal, {\n    sessionId,\n    view,\n    heading: '镜像升级日报',                    // 标题，缺省「会话预览」\n    onClose: () => { view.dispose(); setOpen(false) },   // 关闭必须 dispose\n    // 续聊（可选）：fork 开分支 → 跳官方会话区；两者缺一即不渲染该入口\n    forkSession: (id, atSeq) => sessions.fork({ sessionId: id, increaseTitle: true, atSeq }),\n    openHostSession: (id) => uiWorkspace.openSession(id),\n    // 暂存输入框（可选）：由调用方 fork + 发首轮 + 跳转\n    onContinue: async (message) => {\n      const child = await forkSession(sessionId)\n      await hostContinue(child, message)\n      openHostSession(child)\n    },\n    onOpenFile: (path) => openFilePreview(path), // 文件打开出口\n    archived,                                   // 是否已归档\n    t,                                          // 可选，覆盖文案\n  })\n}"
      },
      {
        "id": "session-data-chain",
        "lang": "ts",
        "src": "// 数据链（越往上越早）：\n//   sessions.retain(id, { source })  物化 scope\n//     → sessions.binding(id)         取绑定\n//     → session.open()               幂等拉历史尾页\n//     → uiConversation.binding(binding).target('chat')\n//                                     拿 ChatSnapshot：order + nodes（keyed 流）\n// 用完必须 view.dispose()，否则会话 scope 不回收。"
      }
    ]
  },
  "utils-overview": {
    "id": "utils-overview",
    "heading": {
      "zh": "概览",
      "en": "Overview"
    },
    "prose": [
      {
        "zh": "零 React、零 DOM、零 design 依赖。装的是「和界面无关的纯方法」。",
        "en": "Zero React, zero DOM, zero design dependency. Pure, UI-agnostic helpers."
      }
    ]
  },
  "date": {
    "id": "date",
    "heading": {
      "zh": "日期",
      "en": "Date"
    },
    "prose": [
      {
        "zh": "全部走本机时区；解析失败一律不抛错、按兜底返回，不编造时间。",
        "en": "All use the local timezone; parse failures never throw — they fall back as specified, never inventing a time."
      },
      {
        "zh": "relativePast 与 relativeFuture 是对偶的：调度表这类展示未来时间的场景必须用 relativeFuture——用 relativePast 会把「3 分钟后」显示成「刚刚」，直接丢语义。",
        "en": "`relativePast` and `relativeFuture` are duals: for future times (e.g. a schedule) you must use `relativeFuture`; using `relativePast` would render \"in 3 minutes\" as \"just now\", losing meaning."
      }
    ],
    "api": [
      {
        "id": "utils-date",
        "rows": [
          {
            "name": "pad2",
            "type": "(value: number | string) => string",
            "def": "—",
            "desc": {
              "zh": "`9` ⇒ `'09'`",
              "en": "`9` ⇒ `'09'`"
            }
          },
          {
            "name": "formatDateTime",
            "type": "(iso, opts?: { seconds?, fallback? }) => string",
            "def": "—",
            "desc": {
              "zh": "解析失败 ⇒ opts.fallback，缺省原串；seconds:true 补 :ss",
              "en": "On parse failure ⇒ opts.fallback (default: the original string); seconds:true appends :ss"
            }
          },
          {
            "name": "formatYmd",
            "type": "(iso, opts?: { fallback? }) => string",
            "def": "—",
            "desc": {
              "zh": "解析失败 ⇒ opts.fallback，缺省 —",
              "en": "On parse failure ⇒ opts.fallback (default —)"
            }
          },
          {
            "name": "formatClock",
            "type": "(iso: string | null | undefined, opts?: { fallback? }) => string",
            "def": "—",
            "desc": {
              "zh": "空值/解析失败 ⇒ opts.fallback，缺省 -",
              "en": "Null/parse failure ⇒ opts.fallback (default -)"
            }
          },
          {
            "name": "formatDurationHms",
            "type": "(ms: number) => string",
            "def": "—",
            "desc": {
              "zh": "有小时 ⇒ H:MM:SS，否则 MM:SS；负数/NaN ⇒ -",
              "en": "Has hours ⇒ H:MM:SS, else MM:SS; negative/NaN ⇒ -"
            }
          },
          {
            "name": "sameCalendarDay",
            "type": "(a: Date, b: Date) => boolean",
            "def": "—",
            "desc": {
              "zh": "本机时区比年月日",
              "en": "Compares year/month/day in local tz"
            }
          },
          {
            "name": "relativePast",
            "type": "(iso, nowMs, translate?) => string",
            "def": "—",
            "desc": {
              "zh": "过去时间 ⇒ 「3 分钟前」；未来/解析失败 ⇒ 「刚刚」",
              "en": "Past ⇒ \"3 minutes ago\"; future/parse failure ⇒ \"just now\""
            }
          },
          {
            "name": "relativeFuture",
            "type": "(iso, nowMs, translate?) => string",
            "def": "—",
            "desc": {
              "zh": "未来时间 ⇒ 「3 分钟后」；解析失败回退 formatYmd",
              "en": "Future ⇒ \"in 3 minutes\"; parse failure falls back to formatYmd"
            }
          },
          {
            "name": "formatRange",
            "type": "(fromIso, toIso, opts?: { seconds? }) => string",
            "def": "—",
            "desc": {
              "zh": "同天 ⇒ 09:00 – 10:30；跨天两端带日期",
              "en": "Same day ⇒ 09:00 – 10:30; across days both ends show dates"
            }
          },
          {
            "name": "overlaps",
            "type": "(aFrom, aTo, bFrom, bTo) => boolean",
            "def": "—",
            "desc": {
              "zh": "半开区间 [from, to)；NaN ⇒ 不重叠",
              "en": "Half-open [from, to); NaN ⇒ no overlap"
            }
          }
        ]
      }
    ]
  },
  "text": {
    "id": "text",
    "heading": {
      "zh": "字符串",
      "en": "String"
    },
    "api": [
      {
        "id": "utils-text",
        "rows": [
          {
            "name": "baseNameOf",
            "type": "(path: string) => string",
            "def": "—",
            "desc": {
              "zh": "取末段；目录尾斜杠不会取成空串",
              "en": "Last segment; a trailing slash never yields empty"
            }
          },
          {
            "name": "safeTrim",
            "type": "(s: string) => string",
            "def": "—",
            "desc": {
              "zh": "去首尾空白",
              "en": "Trim surrounding whitespace"
            }
          },
          {
            "name": "truncateBytes",
            "type": "(s: string, maxBytes: number) => string",
            "def": "—",
            "desc": {
              "zh": "按 UTF-8 字节截断，不切半个字",
              "en": "Truncate by UTF-8 bytes without splitting a char"
            }
          }
        ]
      }
    ]
  },
  "number": {
    "id": "number",
    "heading": {
      "zh": "数字",
      "en": "Number"
    },
    "api": [
      {
        "id": "utils-number",
        "rows": [
          {
            "name": "formatBytes",
            "type": "(bytes: number) => string",
            "def": "—",
            "desc": {
              "zh": "`12 KB` / `3.4 MB`；0 与负数 ⇒ —",
              "en": "`12 KB` / `3.4 MB`; 0 and negatives ⇒ —"
            }
          },
          {
            "name": "formatCount",
            "type": "(n: number) => string",
            "def": "—",
            "desc": {
              "zh": "千分位",
              "en": "Thousands separator"
            }
          }
        ]
      }
    ]
  },
  "http": {
    "id": "http",
    "heading": {
      "zh": "HTTP",
      "en": "HTTP"
    },
    "api": [
      {
        "id": "utils-http",
        "rows": [
          {
            "name": "request",
            "type": "(url, opts?: RequestOptions) => Promise<Response>",
            "def": "—",
            "desc": {
              "zh": "带超时（默认 10s）与 AbortSignal",
              "en": "With timeout (default 10s) and AbortSignal"
            }
          },
          {
            "name": "requestJson",
            "type": "<T>(url, opts?) => Promise<T>",
            "def": "—",
            "desc": {
              "zh": "自动解析 JSON",
              "en": "Parses JSON automatically"
            }
          },
          {
            "name": "HttpError",
            "type": "class extends Error",
            "def": "—",
            "desc": {
              "zh": "带 status；超时抛 AbortError",
              "en": "Carries status; timeout throws AbortError"
            }
          }
        ]
      }
    ],
    "prose": [
      {
        "zh": "RequestOptions：{ timeoutMs?, signal?, method?, body?, headers? }。",
        "en": "`RequestOptions`: { timeoutMs?, signal?, method?, body?, headers? }."
      }
    ]
  },
  "i18n": {
    "id": "i18n",
    "heading": {
      "zh": "多语言",
      "en": "i18n"
    },
    "prose": [
      {
        "zh": "核心提供的固定提示语（控件错误、加载中、空态…）由本包内置中英字典管。",
        "en": "The fixed copy the core ships (control errors, loading, empty states…) is managed by this package’s built-in zh/en dictionary."
      },
      {
        "zh": "边界：插件自己界面的文案由插件自己管，本包不提供插件级 i18n 框架。想覆盖某条文案：给组件传 translate prop，或给自己的场景直接用 t + 自定义字典。",
        "en": "Boundary: a plugin’s own UI copy is the plugin’s responsibility; this package offers no plugin-level i18n framework. To override a string: pass a `translate` prop, or use `t` with your own dictionary."
      },
      {
        "zh": "可用 key 全集见 src/utils/i18n.ts 的 UtilMessageKey。",
        "en": "Full key list: `UtilMessageKey` in `src/utils/i18n.ts`."
      }
    ],
    "api": [
      {
        "id": "utils-i18n",
        "rows": [
          {
            "name": "setLocale(locale)",
            "type": "('zh' | 'en') => void",
            "def": "—",
            "desc": {
              "zh": "'zh'（默认）/ 'en'",
              "en": "'zh' (default) / 'en'"
            }
          },
          {
            "name": "getLocale()",
            "type": "() => string",
            "def": "—",
            "desc": {
              "zh": "当前语言",
              "en": "Current locale"
            }
          },
          {
            "name": "t(key, vars?)",
            "type": "(key, vars?) => string",
            "def": "—",
            "desc": {
              "zh": "取文案；{n} 占位由 vars 填",
              "en": "Get copy; {n} placeholders filled by vars"
            }
          },
          {
            "name": "type Translate",
            "type": "(key, vars?) => string",
            "def": "—",
            "desc": {
              "zh": "组件都收这个参数供覆盖",
              "en": "Components accept this to override copy"
            }
          }
        ]
      }
    ]
  },
  "quickstart": {
    "id": "quickstart",
    "heading": {
      "zh": "从零接入",
      "en": "Integrate from scratch"
    },
    "prose": [
      {
        "zh": "从装包到用上各子包的完整路径，示例都是可直接粘贴的最小可用版。",
        "en": "The full path from install to every subpackage, with copy-paste-ready minimal examples."
      },
      {
        "zh": "§0 装包：`react` 是 optional peer，只用 `utils` / `design` 的插件不必装。",
        "en": "§0 Install: `react` is an optional peer — plugins using only `utils`/`design` need not install it."
      },
      {
        "zh": "§1 初始化样式（入口一次）：`id` 必须插件内唯一，多插件同页靠它互不覆盖；变量与类名固定 `dshpc` 前缀，不需传参。",
        "en": "§1 Initialize styles (once at entry): `id` must be unique within the plugin so co-mounted plugins don’t clobber; vars and classes use the fixed `dshpc` prefix, no parameter."
      },
      {
        "zh": "§2 用一个控件",
        "en": "§2 Use a control"
      },
      {
        "zh": "§3 用通用方法",
        "en": "§3 Use helpers"
      },
      {
        "zh": "§4 接工作区浏览：`mount` 必填（预览面板是布局成员，占宽挤窄主区），传页面那层 flex 行。`sessionId` 必须属于该工作区。",
        "en": "§4 Wire workspace browsing: `mount` is required (the preview panel is a layout member that takes width); pass the page’s flex row. `sessionId` must belong to that workspace."
      },
      {
        "zh": "§5 接会话预览：`openSessionView` 返回 `null` 表示该会话不可解析；拿到 view 后交给 `SessionViewModal`，关闭时记得 `dispose()`。",
        "en": "§5 Wire session preview: `openSessionView` returns `null` when the session cannot be resolved; hand the view to `SessionViewModal` and remember `dispose()` on close."
      },
      {
        "zh": "§6 卸载清理（可选）",
        "en": "§6 Teardown (optional)"
      }
    ],
    "code": [
      {
        "id": "integration-install",
        "lang": "bash",
        "src": "pnpm add dsh-plugin-core"
      },
      {
        "id": "integration-init-style",
        "lang": "ts",
        "src": "// 插件 client 入口\nimport { createStyleKit } from 'dsh-plugin-core/design'\nimport { ensureControls, setStyleKit } from 'dsh-plugin-core/ui'\n\nconst kit = createStyleKit({ id: 'dsh-task-reminder-ui' })\nsetStyleKit(kit)\nensureControls()"
      },
      {
        "id": "integration-use-control",
        "lang": "tsx",
        "src": "import { Button, Input, Picker, showToast } from 'dsh-plugin-core/ui'\n\nh(Input, { value: name, onChange: setName, placeholder: '任务名', error: nameError })\nh(Button, { variant: 'primary', onClick: save }, '保存')\nh(Picker, {\n  options: models,                 // [{ value, label }]\n  value: current,\n  onChange: (v) => setCurrent(v as string),\n  searchable: true,\n  clearable: true,\n})\nshowToast('已保存', { variant: 'success' })"
      },
      {
        "id": "integration-use-utils",
        "lang": "ts",
        "src": "import { formatDateTime, relativeFuture, formatBytes } from 'dsh-plugin-core/utils'\n\nformatDateTime(task.runAt, { seconds: true })   // 2026-10-18 09:30:05\nrelativeFuture(task.runAt, Date.now())          // 3 分钟后（未来时间用这个）\nformatBytes(file.size)                          // 12 KB"
      },
      {
        "id": "integration-use-explorer",
        "lang": "tsx",
        "src": "import { openFilePreview, pickWorkspaceFile } from 'dsh-plugin-core/explorer'\n\n// 从 ctx 取出这一小块（不要传整个 ctx）\nconst workspaceFiles = ctx.remote.workspaceFiles\n\n// 预览某文件：右侧分栏（挤窄 row 左边的主区，不是浮在上面）\nopenFilePreview({ mount: pageRowEl, workspaceFiles, sessionId, path: 'docs/requirements.md' })\n\n// 让用户选文件：锚定按钮旁弹模态，Promise 返回 { path, isDir }（工作区相对路径）\nconst picked = await pickWorkspaceFile({ workspaceFiles, sessionId, anchor: btn, filter: { exts: ['ts'] } })"
      },
      {
        "id": "integration-use-session",
        "lang": "tsx",
        "src": "import { openSessionView, SessionViewModal } from 'dsh-plugin-core/session'\n\n// sessions / uiConversation 同样从 ctx 取出（懒得取就用官方 client 服务）\nconst view = openSessionView(sessions, uiConversation, sessionId, 'dsh-task-reminder')\nif (view !== null) {\n  h(SessionViewModal, {\n    sessionId, view,\n    // 关闭必须释放 retain 引用\n    onClose: () => { view.dispose(); setOpen(false) },\n    onOpenFile: (path) => openFilePreview({ mount: pageRowEl, workspaceFiles, sessionId, path }),\n  })\n}"
      },
      {
        "id": "integration-cleanup",
        "lang": "ts",
        "src": "kit.dispose()   // 撤掉 <style> 标签并清空登记域（插件卸载 / HMR）"
      }
    ]
  },
  "reference": {
    "id": "reference",
    "heading": {
      "zh": "接入坑",
      "en": "Pitfalls"
    },
    "prose": [
      {
        "zh": "按踩频排序的常犯错误：",
        "en": "Common mistakes, ranked by frequency:"
      }
    ],
    "api": [
      {
        "id": "integration-pitfalls",
        "rows": [
          {
            "name": "忘了 setStyleKit 就渲染控件",
            "type": "现象：样式晚一帧或落到默认 style id",
            "def": "—",
            "desc": {
              "zh": "入口处先调，再渲染",
              "en": "Call it at entry, then render"
            }
          },
          {
            "name": "指望本包帮你引官方 @deepseek-ai/*",
            "type": "现象：Node 下 ERR_MODULE_NOT_FOUND",
            "def": "—",
            "desc": {
              "zh": "本包 ui 零官方依赖；要用官方件请自行处理平台模块",
              "en": "Our ui has zero official deps; handle platform modules yourself"
            }
          },
          {
            "name": "给 read 少传第三参 range",
            "type": "现象：远端拒：expected 3 business argument(s) … got 2",
            "def": "—",
            "desc": {
              "zh": "一律显式传 {}",
              "en": "Always pass {} explicitly"
            }
          },
          {
            "name": "用 relativePast 显示未来时间",
            "type": "现象：「3 分钟后」显示成「刚刚」",
            "def": "—",
            "desc": {
              "zh": "用 relativeFuture",
              "en": "Use relativeFuture"
            }
          },
          {
            "name": "想让组件自己取工作区 / 模型列表",
            "type": "现象：取不到（通道是插件私有的）",
            "def": "—",
            "desc": {
              "zh": "数据经 props 给，宿主能力经接口注入",
              "en": "Data via props, host capability via injected interface"
            }
          },
          {
            "name": "暗色不跟随宿主",
            "type": "现象：插件固守一种明暗",
            "def": "—",
            "desc": {
              "zh": "判据是 body[data-ds-dark-theme]，别用 prefers-color-scheme",
              "en": "Predicate is body[data-ds-dark-theme], not prefers-color-scheme"
            }
          }
        ]
      }
    ]
  },
  "ui-overview": {
    "id": "ui-overview",
    "heading": {
      "zh": "概览",
      "en": "Overview"
    },
    "prose": [
      {
        "zh": "依赖 design。装的是「用 token 搭出来的零件」，直接用，不再自己写原生控件。纯零件不自己取数：选项、当前值都经 props 给（数据通道是插件私有的）。",
        "en": "Depends on design. \"Parts built from tokens\" — use them instead of writing native controls. No self-fetching: options and value come via props (the data channel is plugin-private)."
      },
      {
        "zh": "入口零 `@deepseek-ai/*` 依赖（非宿主环境 import 不崩）。官方 primitives 走独立子路径 `dsh-plugin-core/ui/official`，封装一律从这条通路引。",
        "en": "The entry keeps zero `@deepseek-ai/*` deps (imports never crash outside the host). Official primitives come through the separate subpath `dsh-plugin-core/ui/official`; import them only from there."
      },
      {
        "zh": "定制边界：props 就是定制面，要改行为请组合 props，不要 fork 源码；追加 class/style 只允许补布局，皮肤走 token 覆盖；缺控件请先提需求。",
        "en": "Customization: props are the surface — compose them instead of forking source; appended class/style may only patch layout, skins go through token overrides; raise a request before writing a missing control yourself."
      }
    ],
    "code": [
      {
        "id": "ui-setup",
        "lang": "ts",
        "src": "import { createStyleKit } from 'dsh-plugin-core/design'\nimport { ensureControls, setStyleKit } from 'dsh-plugin-core/ui'\n\nsetStyleKit(createStyleKit({ id: 'dsh-task-reminder-ui' }))\nensureControls()"
      }
    ]
  },
  "button": {
    "id": "button",
    "heading": {
      "zh": "Button / IconButton / Segmented",
      "en": "Button / IconButton / Segmented"
    },
    "prose": [
      {
        "zh": "Button 10 档外观（实心 / 线框 / 无底）。hover / active 走 token 派生色（不用 opacity）。",
        "en": "Button offers 10 variant tiers (solid / outline / bare). hover/active use token-derived colors (no opacity)."
      },
      {
        "zh": "IconButton：variant: plain|outline|danger（默认 plain）、size（默认 lg）、icon（必填）、label（必填，无障碍名兼 title）。",
        "en": "IconButton: variant plain|outline|danger (default plain), size (default lg), icon (required), label (required, doubles as a11y name and title)."
      },
      {
        "zh": "Segmented：`items`（必填）支持单选 / 多选，`size`（默认 lg；三档总高 24 / 28 / 32）、`bordered`（1px 外框，总高不变）、`multiple`（多选）。外观只有一套：灰底轨道 + 白色选中片，选中片的描边环与阴影由宿主 elevation token 提供（离线兜底值没有那圈环）。段内 `count`（弱化灰字）/ `badge`（红角标）接受 `number | string`：数字 ≤0 不显示，字符串原样显示（如 `1K` / `99+`）。",
        "en": "Segmented: `items` (required) supports single or multiple selection; `size` (default lg; totals 24 / 28 / 32), `bordered` (1px outer frame, same total height), `multiple` (multi-select). One look only: grey track + white selected pill; its stroke ring and shadow come from the host elevation token (the offline fallback has no ring). An item’s `count` (muted text) and `badge` (red pill) take `number | string`: numbers ≤0 render nothing, strings render as given (e.g. `'1K'` / `'99+'`)."
      }
    ],
    "api": [
      {
        "id": "ui-button",
        "rows": [
          {
            "name": "variant",
            "type": "上表 10 档（primary/secondary/danger/success/warning/info/outline/danger-outline/ghost/link）",
            "def": "'outline'",
            "desc": {
              "zh": "外观档",
              "en": "Appearance tier"
            }
          },
          {
            "name": "size",
            "type": "'sm' | 'md' | 'lg'",
            "def": "'lg'",
            "desc": {
              "zh": "高度档（24 / 28 / 32，有边无边同高）",
              "en": "Height tier (24 / 28 / 32, same height with or without border)"
            }
          },
          {
            "name": "icon",
            "type": "ReactNode",
            "def": "—",
            "desc": {
              "zh": "前置图标（官方图标组件 / 字符串均可）",
              "en": "Leading icon (official icon component or string)"
            }
          },
          {
            "name": "iconRight",
            "type": "ReactNode",
            "def": "—",
            "desc": {
              "zh": "后置图标（展开箭头、外链）",
              "en": "Trailing icon (expand arrow, external link)"
            }
          },
          {
            "name": "color",
            "type": "string",
            "def": "—",
            "desc": {
              "zh": "自定义主色：实心档作底色，线框 / 无底档作主色",
              "en": "Custom main color: background for solid tiers, main color for outline/bare"
            }
          },
          {
            "name": "loading",
            "type": "boolean",
            "def": "'false'",
            "desc": {
              "zh": "文案前显示同色小圈，并自动 disabled",
              "en": "Shows a same-color spinner before the label and auto-disables"
            }
          },
          {
            "name": "block",
            "type": "boolean",
            "def": "'false'",
            "desc": {
              "zh": "撑满父宽",
              "en": "Fill parent width"
            }
          },
          {
            "name": "children",
            "type": "ReactNode",
            "def": "—",
            "desc": {
              "zh": "文案（由调用方按语言给：中文出中文、英文出英文，中英混排也支持）",
              "en": "Label (caller supplies per locale: zh shows zh, en shows en, mixed is supported)"
            }
          },
          {
            "name": "…rest",
            "type": "原生 button 属性",
            "def": "—",
            "desc": {
              "zh": "type / disabled / title / aria-* / onClick 原样透传",
              "en": "type / disabled / title / aria-* / onClick passed through"
            }
          }
        ]
      }
    ]
  },
  "input": {
    "id": "input",
    "heading": {
      "zh": "Input 家族（Field.ts）",
      "en": "Input family (Field.ts)"
    },
    "api": [
      {
        "id": "ui-input",
        "rows": [
          {
            "name": "Input",
            "type": "value onChange(v) size(默认 sm) error disabled type icon placeholder inputRef onKeyDown onBlur aria-label title hint",
            "def": "—",
            "desc": {
              "zh": "基础输入框；error 描红；hint 给字符串即自动挂标准问号提示；icon 是左侧图标槽（不吃点击，尺寸取 fieldMetricsOf(size).icon）；type=search 时聚焦且有内容才在右侧出清空钮",
              "en": "Basic input; error turns it red; passing hint as a string auto-attaches a standard question-mark hint; icon is the leading icon slot (does not swallow clicks; size from fieldMetricsOf(size).icon); with type=search a clear button appears on the right only while focused and non-empty"
            }
          },
          {
            "name": "PrefixedInput",
            "type": "同 Input + prefix: string",
            "def": "—",
            "desc": {
              "zh": "前置文案（https:// / C:\\）",
              "en": "Leading text (https:// / C:\\)"
            }
          },
          {
            "name": "NumberInput",
            "type": "value: number onChange(v) min max step(默认 1) inputWidth suffix label decreaseLabel increaseLabel hint",
            "def": "—",
            "desc": {
              "zh": "已 clamp；失焦回弹草稿",
              "en": "Already clamped; reverts to draft on blur"
            }
          },
          {
            "name": "Textarea",
            "type": "value onChange(v) placeholder error disabled rows spellCheck(默认关) aria-label hint",
            "def": "—",
            "desc": {
              "zh": "hint 的问号钉在右下角（单行控件则在行尾垂直居中）",
              "en": "hint’s question mark pins to the bottom-right (for single-line controls it centers at the row end)"
            }
          },
          {
            "name": "Checkbox",
            "type": "checked onChange(next) label accentColor disabled",
            "def": "—",
            "desc": {
              "zh": "—",
              "en": "—"
            }
          },
          {
            "name": "fieldMetricsOf(size)",
            "type": "→ { height, font, line, icon, gap }",
            "def": "—",
            "desc": {
              "zh": "自己搭同款输入框时对齐尺寸",
              "en": "Match dimensions when building your own same-style input"
            }
          }
        ]
      }
    ]
  },
  "picker": {
    "id": "picker",
    "heading": {
      "zh": "Picker / WorkspacePicker / ModelPicker",
      "en": "Picker / WorkspacePicker / ModelPicker"
    },
    "prose": [
      {
        "zh": "Picker：单 / 多选、上限、搜索、分组、空态，自绘。键盘：Esc 关、↑↓ 移游标、Enter 选。纯逻辑可单用：`toGroups` / `filterGroups` / `toggleValue`。触发器支持 width / minWidth / maxWidth 约束宽度：定宽忽略另两者；内容超长则省略号 + hover 跑马灯。菜单里的选项超长同样省略 + hover 跑马灯，不会把菜单撑出横向滚动条。",
        "en": "Picker: single/multiple selection, cap, search, grouping, empty state — self-drawn. Keyboard: Esc closes, ↑↓ move the cursor, Enter selects. Logic reusable standalone: `toGroups` / `filterGroups` / `toggleValue`."
      },
      {
        "zh": "WorkspacePicker：数据自带的领域选择器。在插件 apply 里调一次 `connectHost(ctx)`，组件即订阅官方 `workspaces` 快照。未接线 = 空态，不编造数据。",
        "en": "WorkspacePicker: a domain picker that brings its own data. Call `connectHost(ctx)` once in the plugin apply and it subscribes to the official `workspaces` snapshot. Unwired = empty state, never fabricated data."
      },
      {
        "zh": "ModelPicker：数据自带，`variant` 为 `grouped`（默认）/ `cascade`；`onChange` 一律发 `provider/id` 形式的模型 value。目录来自宿主 `serveModelCatalog`。",
        "en": "ModelPicker: brings its own data; `variant` is `grouped` (default) or `cascade`; `onChange` always emits the model value as `provider/id`. Catalog comes from the host `serveModelCatalog`."
      }
    ],
    "api": [
      {
        "id": "ui-picker",
        "rows": [
          {
            "name": "groups / options",
            "type": "PickerGroup[] / PickerOption[]",
            "def": "—",
            "desc": {
              "zh": "二选一；options 会被当成一个无标题组",
              "en": "One of the two; options is treated as a single untitled group"
            }
          },
          {
            "name": "value / defaultValue",
            "type": "string | string[]",
            "def": "—",
            "desc": {
              "zh": "给了 value 即受控；否则内部管",
              "en": "Passing value makes it controlled; otherwise it manages internally"
            }
          },
          {
            "name": "onChange",
            "type": "(v: string | string[]) => void",
            "def": "—",
            "desc": {
              "zh": "单选回 string，多选回 string[]",
              "en": "Single returns string, multiple returns string[]"
            }
          },
          {
            "name": "mode",
            "type": "'single' | 'multiple'",
            "def": "'single'",
            "desc": {
              "zh": "—",
              "en": "—"
            }
          },
          {
            "name": "max",
            "type": "number",
            "def": "—",
            "desc": {
              "zh": "多选上限；到上限其余项置灰 + 提示（不静默截断）",
              "en": "Multiple-select cap; at cap others grey out + a hint (no silent truncation)"
            }
          },
          {
            "name": "searchable",
            "type": "boolean",
            "def": "'false'",
            "desc": {
              "zh": "显示搜索框；展开菜单时自动聚焦搜索框",
              "en": "Shows a search box; auto-focuses it when the menu opens"
            }
          },
          {
            "name": "align",
            "type": "'left' | 'center'",
            "def": "'left'",
            "desc": {
              "zh": "触发器文字对齐",
              "en": "Trigger text alignment"
            }
          },
          {
            "name": "clearable",
            "type": "boolean",
            "def": "'false'",
            "desc": {
              "zh": "单选时列表顶部多一项「不选」",
              "en": "In single mode, adds a \"none\" item at the top of the list"
            }
          },
          {
            "name": "placeholder",
            "type": "string",
            "def": "内置「请选择」",
            "desc": {
              "zh": "—",
              "en": "—"
            }
          },
          {
            "name": "degraded",
            "type": "boolean",
            "def": "'false'",
            "desc": {
              "zh": "候选可能不完整 ⇒ 顶部如实提示，不编造",
              "en": "Candidates may be incomplete ⇒ honest top hint, no fabrication"
            }
          },
          {
            "name": "size",
            "type": "'sm' | 'md' | 'lg'",
            "def": "'md'",
            "desc": {
              "zh": "—",
              "en": "—"
            }
          },
          {
            "name": "placement",
            "type": "'down' | 'up'",
            "def": "'down'",
            "desc": {
              "zh": "触发器靠近视口底部时用 up",
              "en": "Use up when the trigger is near the viewport bottom"
            }
          },
          {
            "name": "closeOnSelect",
            "type": "boolean",
            "def": "多选 false / 单选恒关",
            "desc": {
              "zh": "选中后是否收起",
              "en": "Whether to collapse after selection"
            }
          },
          {
            "name": "showLabels",
            "type": "boolean",
            "def": "'true'",
            "desc": {
              "zh": "多选时触发器列出已选项，而非只显示「已选 N 项」",
              "en": "In multiple mode the trigger lists selected items instead of just \"N selected\""
            }
          },
          {
            "name": "icon",
            "type": "ReactNode",
            "def": "—",
            "desc": {
              "zh": "触发器文字前的图标",
              "en": "Icon before the trigger text"
            }
          },
          {
            "name": "hint",
            "type": "string",
            "def": "—",
            "desc": {
              "zh": "问号提示文字：自动在触发器后挂标准 FieldHint",
              "en": "Hint text: auto-attaches a standard FieldHint after the trigger"
            }
          },
          {
            "name": "className",
            "type": "string",
            "def": "—",
            "desc": {
              "zh": "定制宽度 / 外边距",
              "en": "Custom width / margin"
            }
          },
          {
            "name": "width",
            "type": "number | string",
            "def": "—",
            "desc": {
              "zh": "定宽（px 或任意 CSS 长度）；给了即忽略 minWidth / maxWidth，触发器锁定此宽；内容超长则省略 + hover 跑马灯",
              "en": "Fixed width (px or any CSS length); overrides minWidth/maxWidth and locks the trigger; overflow elides + hover marquee"
            }
          },
          {
            "name": "minWidth",
            "type": "number | string",
            "def": "120px（CSS 默认）",
            "desc": {
              "zh": "最小宽；内容不到此宽触发器也不更窄",
              "en": "Minimum width; trigger never narrower than this"
            }
          },
          {
            "name": "maxWidth",
            "type": "number | string",
            "def": "100%（CSS 默认）",
            "desc": {
              "zh": "最大宽；内容超过此宽则省略 + hover 跑马灯",
              "en": "Maximum width; overflow elides + hover marquee"
            }
          },
          {
            "name": "ariaLabel",
            "type": "string",
            "def": "—",
            "desc": {
              "zh": "无障碍名",
              "en": "Accessible name"
            }
          },
          {
            "name": "translate",
            "type": "Translate",
            "def": "内置",
            "desc": {
              "zh": "覆盖文案",
              "en": "Override copy"
            }
          }
        ]
      },
      {
        "id": "ui-workspace-picker",
        "rows": [
          {
            "name": "value / defaultValue / onChange",
            "type": "选中值为 workspaceId（不是 title）；'' = 「所有工作区」",
            "def": "—",
            "desc": {
              "zh": "不筛",
              "en": "No filter"
            }
          },
          {
            "name": "allowDefault / defaultLabel",
            "type": "「所有工作区」默认项：默认提供、置顶、只在单选出现；选中发 ''；false 关掉",
            "def": "—",
            "desc": {
              "zh": "文案可改",
              "en": "Text is customizable"
            }
          },
          {
            "name": "mode / max",
            "type": "单选 / 多选 / 上限（到上限已选项仍可反选）",
            "def": "—",
            "desc": {
              "zh": "—",
              "en": "—"
            }
          },
          {
            "name": "placeholder",
            "type": "string",
            "def": "默认「工作区」",
            "desc": {
              "zh": "想叫「选择工作区」就传它",
              "en": "Pass it if you want \"选择工作区\""
            }
          },
          {
            "name": "icon",
            "type": "ReactNode",
            "def": "—",
            "desc": {
              "zh": "触发器前置图标：不传 = 默认文件夹；null = 不显示；传元素 = 自定义",
              "en": "Leading trigger icon: omitted = default folder; null = hidden; element = custom"
            }
          }
        ]
      },
      {
        "id": "ui-model-picker",
        "rows": [
          {
            "name": "variant",
            "type": "'grouped' | 'cascade'",
            "def": "'grouped'",
            "desc": {
              "zh": "grouped = 一个下拉完全独立；cascade = 两个下拉联动（先选供应商，模型列表跟着筛；换供应商清空已选）",
              "en": "grouped = one standalone dropdown; cascade = two linked dropdowns (pick provider first, model list filters; switching provider clears selection)"
            }
          },
          {
            "name": "allowDefault / defaultLabel",
            "type": "「默认模型」选项：默认提供；false 关闭；选中发 ''",
            "def": "—",
            "desc": {
              "zh": "文案可传 defaultLabel",
              "en": "Pass defaultLabel for the text"
            }
          },
          {
            "name": "placeholder",
            "type": "string",
            "def": "默认「模型」",
            "desc": {
              "zh": "icon：不传 = 默认星形；null = 不显示；传元素 = 自定义",
              "en": "icon: omitted = default star; null = hidden; element = custom"
            }
          },
          {
            "name": "透传 Picker",
            "type": "value / defaultValue / onChange / clearable / searchable / hint / size / placement / className / disabled / degraded / translate",
            "def": "—",
            "desc": {
              "zh": "同 Picker 同名参数",
              "en": "Same-named params as Picker"
            }
          }
        ]
      }
    ],
    "code": [
      {
        "id": "ui-workspacepicker-example",
        "lang": "tsx",
        "src": "import { WorkspacePicker, connectHost } from 'dsh-plugin-core/ui'\n\n// apply(ctx) 里：connectHost(ctx)\nh(WorkspacePicker, { value: cur, onChange: setCur, clearable: true })"
      }
    ]
  },
  "datetime-picker": {
    "id": "datetime-picker",
    "heading": {
      "zh": "DateTimePicker（日期时间选择）",
      "en": "DateTimePicker (date & time)"
    },
    "prose": [
      {
        "zh": "一个控件覆盖全部诉求：`mode` 选 `single`（一个时刻）/ `range`（时间段——触发器是**一个整条**：两个日期区 + 中间样式画的灰隔条，点整条展开；弹层里左右两块独立日历分别选）；`precision` 选 `day` / `hour` / `minute` / `second`。值为本地 ISO（`YYYY-MM-DDTHH:mm:ss.SSS`），毫秒恒三位。",
        "en": "One control covers everything: `mode` picks `single` (one instant) or `range` (a span — the trigger is **one bar**: two date zones + a CSS-drawn grey separator, click anywhere to expand; two independent calendars side by side in the popup); `precision` picks `day` / `hour` / `minute` / `second`. Values are local ISO (`YYYY-MM-DDTHH:mm:ss.SSS`), milliseconds always three digits."
      },
      {
        "zh": "补全口径：起始端把未选单位归零（day ⇒ `00:00:00.000`），结束端拉满（day ⇒ `23:59:59.999`；hour ⇒ `H:59:59.999`；second 不动）。数据库只收到秒时 `23:59:59.999` 退化为「当天最后一秒」，语义不坏，无需特殊处理。",
        "en": "Fill rules: the start floors unselected units (day ⇒ `00:00:00.000`), the end ceils them (day ⇒ `23:59:59.999`; hour ⇒ `H:59:59.999`; second stays exact). If a DB stores seconds only, `23:59:59.999` degrades to \"last second of the day\" — semantics intact, nothing special to do."
      },
      {
        "zh": "显示口径：传出的数据恒是完整本地 ISO（到毫秒），但**显示只到 precision**——day 只出日期（不出现时分秒），hour / minute 到分，second 才出秒。调用方传的精度就是用户看到的精度。",
        "en": "Display rule: emitted data is always a complete local ISO (to milliseconds), but **display stops at the precision** — day shows the date only (no clock), hour/minute stop at minutes, second shows seconds. The precision you pass is exactly what the user sees."
      },
      {
        "zh": "弹层与 Picker 同机制（floating-ui 浮层、贴边翻转、点外关闭、无遮罩）：两个端框 + 两块独立月历（左开始、右结束，各选各的，不标跨度）+ 每端自己的时/分/秒步进（▲▼、直接键入、↑↓ 键——不用逐格点 60 分钟；**时间不强制先选日期**，「确定」时没选日期就不传数据）。快捷键：day 精度叫「今天」（只置日期），带时分秒的叫「现在」（日期 + 时间一起置，之后可再改）。草稿态，「确定」才 onChange；Esc / 点外 = 丢弃。日历键盘：方向键移动、PageUp/Down 换月、Home/End 月内首尾、Enter 选中。结束早于开始时「确定」置灰并提示。",
        "en": "The popup shares Picker’s mechanics (floating-ui layer, edge flip, outside-click close, no mask): two end boxes + two independent calendars (left = start, right = end, each picks its own, no span marking) + per-end hour/minute/second steppers (▲▼, direct typing, ↑↓ keys — no clicking through 60 minutes; **time never requires picking a date first** — on confirm, no date means no data emitted). Quick button: \"Today\" at day precision (date only), \"Now\" when hours/minutes/seconds are on (sets date + time together, editable afterwards). Draft state; onChange only on confirm; Esc / outside = discard. Calendar keys: arrows move, PageUp/Down change month, Home/End jump to month bounds, Enter selects. When end precedes start, confirm greys out with a hint."
      }
    ],
    "api": [
      {
        "id": "ui-datetime-picker",
        "rows": [
          {
            "name": "mode",
            "type": "'single' | 'range'",
            "def": "'single'",
            "desc": {
              "zh": "single = 一个时刻；range = 一个整条触发器（两个日期区 + 灰隔条）",
              "en": "single = one instant; range = one-bar trigger (two date zones + grey separator)"
            }
          },
          {
            "name": "precision",
            "type": "'day' | 'hour' | 'minute' | 'second'",
            "def": "'day'",
            "desc": {
              "zh": "时间精度；day 不显示时分秒步进",
              "en": "Time precision; day hides the steppers"
            }
          },
          {
            "name": "value / defaultValue",
            "type": "single: string | null；range: [start, end] | null",
            "def": "—",
            "desc": {
              "zh": "本地 ISO；给了 value 即受控",
              "en": "Local ISO; passing value makes it controlled"
            }
          },
          {
            "name": "onChange",
            "type": "(v: string | [string, string] | null) => void",
            "def": "—",
            "desc": {
              "zh": "「确定」时提交；「清除」发 null",
              "en": "Emitted on confirm; clear emits null"
            }
          },
          {
            "name": "disabled / size / placeholder",
            "type": "boolean / 'sm' | 'md' | 'lg' / string",
            "def": "false / 'md' / 内置「请选择日期时间」",
            "desc": {
              "zh": "与 Picker 同名参数对齐",
              "en": "Aligned with Picker’s same-named params"
            }
          },
          {
            "name": "hint / className / ariaLabel / translate",
            "type": "string / string / string / Translate",
            "def": "—",
            "desc": {
              "zh": "同 Picker 同名参数",
              "en": "Same-named params as Picker"
            }
          }
        ]
      }
    ],
    "code": [
      {
        "id": "ui-datetimepicker-example",
        "lang": "tsx",
        "src": "import { DateTimePicker } from 'dsh-plugin-core/ui'\n\n// 单个时刻，精确到分（起始端归零：14:30 ⇒ 14:30:00.000）\nh(DateTimePicker, { precision: 'minute', value: startAt, onChange: setStartAt })\n\n// 时间段：一个整条触发器（两个日期区 + 灰隔条 -），day 精度下结束端补到当天最后一刻\nh(DateTimePicker, {\n  mode: 'range',\n  precision: 'day',\n  value: range,\n  onChange: setRange, // → ['2026-10-24T00:00:00.000', '2026-10-24T23:59:59.999']\n})"
      }
    ]
  },
  "tooltip": {
    "id": "tooltip",
    "heading": {
      "zh": "FieldHint（问号提示）",
      "en": "FieldHint (hint)"
    },
    "prose": [
      {
        "zh": "独立组件，标题 / 输入框后随处可挂。气泡是官方 Tooltip 本体，启动时用 `setTooltipRenderer((p) => h(OfficialTooltip, p))` 注入，其余 props 透传。",
        "en": "Standalone — hang it after a title or input. The bubble is the official Tooltip, injected at startup via `setTooltipRenderer((p) => h(OfficialTooltip, p))`; other props pass through."
      },
      {
        "zh": "未注入 renderer 的环境只显示问号图标，不出气泡。",
        "en": "Without a renderer only the question-mark icon shows, no bubble."
      }
    ]
  },
  "card": {
    "id": "card",
    "heading": {
      "zh": "Card / StripCard",
      "en": "Card / StripCard"
    },
    "prose": [
      {
        "zh": "两种外观，两个组件：Card = surface 底 + 1px 边框 + 圆角（padding 14px，左 12 使竖条贴边）；StripCard = 同色浅底 + 占位边框 + 方角。",
        "en": "Two appearances, two components: Card = surface background + 1px border + rounded corners (padding 14px, left 12 so the strip hugs the edge); StripCard = same-hue light background + placeholder border + square corners."
      },
      {
        "zh": "头部整体垂直居中，`action` 里裸放一个元素即居中。颜色全走 token，明暗跟随宿主。",
        "en": "The header centers vertically as a whole; drop a bare element into `action` and it centers. Colors come from tokens, so light/dark follows the host."
      }
    ],
    "api": [
      {
        "id": "ui-card",
        "rows": [
          {
            "name": "accent",
            "type": "5 档 or 任意 CSS 色值（business/success/warning/danger/neutral）",
            "def": "'business'",
            "desc": {
              "zh": "档位映射到 design 的 token；也可传 '#f59e0b' 这类自定义值",
              "en": "Tiers map to design tokens; also accepts custom values like '#f59e0b'"
            }
          },
          {
            "name": "expanded",
            "type": "boolean",
            "def": "'false'",
            "desc": {
              "zh": "展开态（箭头朝向 + panel 显隐）",
              "en": "Expanded state (arrow direction + panel show/hide)"
            }
          },
          {
            "name": "onToggle",
            "type": "() => void",
            "def": "—",
            "desc": {
              "zh": "传了才显示右侧折叠箭头；展开状态由调用方管",
              "en": "Only shows the right collapse arrow if provided; caller owns the expanded state"
            }
          },
          {
            "name": "action",
            "type": "ReactNode",
            "def": "—",
            "desc": {
              "zh": "右上角操作区",
              "en": "Top-right action area"
            }
          },
          {
            "name": "children",
            "type": "ReactNode",
            "def": "—",
            "desc": {
              "zh": "主内容，排版随你",
              "en": "Main content, layout is yours"
            }
          },
          {
            "name": "panel",
            "type": "ReactNode",
            "def": "—",
            "desc": {
              "zh": "展开后才显示的额外内容",
              "en": "Extra content shown only when expanded"
            }
          },
          {
            "name": "className / style",
            "type": "—",
            "def": "—",
            "desc": {
              "zh": "追加类 / 样式",
              "en": "Append class / style"
            }
          }
        ]
      }
    ],
    "code": [
      {
        "id": "ui-card-example",
        "lang": "tsx",
        "src": "import { Card, Chip, StripCard } from 'dsh-plugin-core/ui'\n\nh(Card, {\n  accent: 'warning',\n  action: h(Button, { size: 'sm', variant: 'ghost' }, '跳过'),\n},\n  h('div', null, '标题'),\n  h(Chip, null, '#npm'),\n)\n\nh(StripCard, {\n  accent: 'success',\n  expanded: open, onToggle: () => setOpen(!open),\n  panel: h('div', null, '展开详情'),\n}, h('div', null, '标题 + 元信息'))"
      }
    ]
  },
  "chip": {
    "id": "chip",
    "heading": {
      "zh": "Chip",
      "en": "Chip"
    },
    "prose": [
      {
        "zh": "小标签。`tone`：neutral（默认）/ business / success / warning / danger；`size`：sm（默认）/ md（12px）。传 `onClick` 才可点。",
        "en": "A small tag. `tone`: neutral (default) / business / success / warning / danger; `size`: sm (default) / md (12px). Pass `onClick` to make it clickable."
      },
      {
        "zh": "边界：只做「胶囊标签」。纯图标的小按钮请用 IconButton，别拿 Chip 当图标底板。",
        "en": "Boundary: pill tags only. For an icon-only button use IconButton; never use Chip as an icon baseplate."
      }
    ]
  },
  "feedback": {
    "id": "feedback",
    "heading": {
      "zh": "反馈件",
      "en": "Feedback"
    },
    "prose": [
      {
        "zh": "底层是 Sonner。toast 宿主是 globalThis 单例（`Symbol.for('dsh-plugin-core/toast-host')`）：首个副本建容器，其余把 payload 交它渲染。",
        "en": "Backed by Sonner. The toast host is a singleton on globalThis (`Symbol.for('dsh-plugin-core/toast-host')`): the first copy mounts the container, the rest hand their payload to it."
      },
      {
        "zh": "三条取舍（照用别改）：① 样式取首个副本；② position 全局共享；③ 不做卸载回收。无 document 的环境静默跳过。",
        "en": "Three trade-offs (accept them): ① styling comes from the first copy; ② position is shared per screen; ③ no unload reclamation. Environments without document skip silently."
      },
      {
        "zh": "Modal 是自绘 overlay，不走 react-dom portal。",
        "en": "Modal is a self-drawn overlay, not a react-dom portal."
      },
      {
        "zh": "遮罩右边界读 `--dshpc-page-inset-right`（多个 dock 求和），自动让开右侧分栏，弹窗在**剩余区域**居中。弹窗无需任何遮罩参数；也别自己量分栏宽度（挂载异步，恒为 0）。",
        "en": "The mask’s right edge reads `--dshpc-page-inset-right` (summed across docks) and yields to the right column, centering the dialog in the **remaining** area. The dialog needs no mask props; never measure the column yourself (mounting is async, it always reads 0)."
      }
    ],
    "api": [
      {
        "id": "ui-feedback",
        "rows": [
          {
            "name": "showToast(message, opts?)",
            "type": "",
            "def": "",
            "desc": {
              "zh": "官方 Sonner 原生（对比 / demo 用）。opts: `{ variant?, durationMs?, color?, onDismiss?, position? }`，6 向定位，明暗跟随宿主",
              "en": "Raw official Sonner (comparison / demo). opts `{ variant?, durationMs?, color?, onDismiss?, position? }`, 6-way placement, theme follows host"
            }
          },
          {
            "name": "notify(message, opts?)",
            "type": "",
            "def": "",
            "desc": {
              "zh": "默认用这个。opts: `{ variant?, description?, durationMs?, position?, actions? }`，actions 用自带 Button（1–2 个）",
              "en": "Use this by default. opts `{ variant?, description?, durationMs?, position?, actions? }`, actions use our own Button (1–2)"
            }
          },
          {
            "name": "showHostToast(message, opts?)",
            "type": "",
            "def": "",
            "desc": {
              "zh": "宿主原生 Toast，走 `dsh-plugin-core/ui/host` 子路径。opts: `{ tone?, holdMs?, actions?, onDismiss? }`",
              "en": "Host-native Toast from the `dsh-plugin-core/ui/host` subpath. opts `{ tone?, holdMs?, actions?, onDismiss? }`"
            }
          },
          {
            "name": "Loading({ anchorId? })",
            "type": "",
            "def": "",
            "desc": {
              "zh": "贴到主内容容器右下角的加载指示；anchorId 默认 dshpc-main",
              "en": "Loading indicator pinned to the main container’s bottom-right; anchorId defaults to dshpc-main"
            }
          },
          {
            "name": "RunningBlocks()",
            "type": "",
            "def": "",
            "desc": {
              "zh": "运行中的占位块",
              "en": "Placeholder blocks while running"
            }
          },
          {
            "name": "SectionHead({ icon, title, right? })",
            "type": "",
            "def": "",
            "desc": {
              "zh": "分区标题",
              "en": "Section heading"
            }
          },
          {
            "name": "MarqueeText({ text, style?, title?, className? })",
            "type": "",
            "def": "",
            "desc": {
              "zh": "超长省略、hover 滚动",
              "en": "Ellipsis on overflow, scroll on hover"
            }
          },
          {
            "name": "LiveText({ render, style? })",
            "type": "",
            "def": "",
            "desc": {
              "zh": "定时重渲染（相对时间这类）",
              "en": "Periodic re-render (for relative time etc.)"
            }
          },
          {
            "name": "BackToTop({ anchorId? })",
            "type": "",
            "def": "",
            "desc": {
              "zh": "回到顶部，贴主容器右缘外侧",
              "en": "Back-to-top, outside the main container’s right edge"
            }
          },
          {
            "name": "startResizeLayoutWidth(opts)",
            "type": "",
            "def": "",
            "desc": {
              "zh": "拖拽调整布局宽度（root 不传则回落 #dshpc-root）",
              "en": "Drag to resize layout width (falls back to #dshpc-root if root omitted)"
            }
          }
        ]
      },
      {
        "id": "ui-modal",
        "rows": [
          {
            "name": "title",
            "type": "ReactNode",
            "def": "—",
            "desc": {
              "zh": "标题",
              "en": "Title"
            }
          },
          {
            "name": "subtitle",
            "type": "ReactNode",
            "def": "—",
            "desc": {
              "zh": "标题**下方**的副标题行（等宽小字；会话 id 这类标识放这里，别塞正文）",
              "en": "Subtitle line **under** the title (monospace caption; put identifiers such as a session id here, not in the body)"
            }
          },
          {
            "name": "headerExtra",
            "type": "ReactNode",
            "def": "—",
            "desc": {
              "zh": "标题**同一行**右侧的小块（徽标 / 计数）：紧跟标题，不跨标题与副标题两行居中",
              "en": "Small block (badge / count) on the **same line** as the title: it sits right after the title, never centered across the title and subtitle lines"
            }
          },
          {
            "name": "headerActions",
            "type": "ReactNode",
            "def": "—",
            "desc": {
              "zh": "头部右侧动作区（关闭钮之外）",
              "en": "Header actions area (besides the close button)"
            }
          },
          {
            "name": "onClose",
            "type": "() => void",
            "def": "—",
            "desc": {
              "zh": "不传则不显示关闭钮",
              "en": "No close button if omitted"
            }
          },
          {
            "name": "closeOnMask",
            "type": "boolean",
            "def": "'true'",
            "desc": {
              "zh": "点遮罩关闭；误触代价大的场景设 false",
              "en": "Close on mask click; set false where mis-clicks are costly"
            }
          },
          {
            "name": "escClose",
            "type": "boolean",
            "def": "'true'",
            "desc": {
              "zh": "Esc 关闭",
              "en": "Close on Esc"
            }
          },
          {
            "name": "maxWidth",
            "type": "string",
            "def": "按 size",
            "desc": {
              "zh": "任意 CSS 值，覆盖 size 的宽度上限；不要用 vw（遮罩已按右侧分栏让位）",
              "en": "Any CSS value, overriding the size’s max width; avoid vw (the mask already yielded to the right column)"
            }
          },
          {
            "name": "hideHeader",
            "type": "boolean",
            "def": "'false'",
            "desc": {
              "zh": "不渲染头部（沉浸式）",
              "en": "Skip header (immersive)"
            }
          },
          {
            "name": "footer",
            "type": "ReactNode",
            "def": "—",
            "desc": {
              "zh": "底栏（按钮区）",
              "en": "Footer (button area)"
            }
          },
          {
            "name": "children",
            "type": "ReactNode",
            "def": "—",
            "desc": {
              "zh": "主体",
              "en": "Body"
            }
          }
        ]
      }
    ]
  },
  "layout": {
    "id": "layout",
    "heading": {
      "zh": "PanelDock（停靠分栏）",
      "en": "PanelDock (dock)"
    },
    "prose": [
      {
        "zh": "右侧分栏的通用壳，是**布局成员**而非浮层：占宽挤窄主区，要由调用方放进自己的 flex 根。分工：结构写在调用点（children），显隐归状态（`open` / `close` 只传 id）。",
        "en": "A generic shell for right-side columns — a **layout member**, not an overlay: it takes width and narrows the main area, so the caller puts it in their own flex root. Split of work: structure at the call site (children), visibility in state (`open`/`close` take only an id)."
      },
      {
        "zh": "面板高度默认视口高；嵌在定高容器里时由调用方给 `--dshpc-dock-h`。不支持：同名多实例、tab 切换条、自动淘汰——标签切换请消费方在自己的面板内容里实现。（收起后的耳朵是独立 `fixed` 浮层，不是把面板变成浮层。）",
        "en": "Panel height defaults to viewport height; in a fixed-height container the caller sets `--dshpc-dock-h`. Not supported: same-name duplicates, tab bars, auto-eviction — tab switching belongs in the consumer’s own panel content. (The collapsed ear is a standalone `fixed` overlay; the panel itself never floats.)"
      },
      {
        "zh": "占宽契约：已开栏宽之和（外加开着时给主区滚动条留的 1px 缝，可用 `--dshpc-dock-gap` 调）实时写进根元素 `--dshpc-page-inset-right`（拖拽逐帧更新，全关即移除），全屏遮罩据此让位；同页多个 dock 求和。",
        "en": "Width contract: the sum of open widths plus a 1px scrollbar gutter while open (tunable via `--dshpc-dock-gap`) goes to `--dshpc-page-inset-right` on the root element (every frame while dragging, removed when all close), and full-screen masks yield to it; multiple docks on one page are summed."
      },
      {
        "zh": "收起 / 展开：`dock.collapse(id)` 让面板退出布局（立刻不占宽）、在右侧出一只固定耳朵；`dock.expand(id)` 把耳朵收回、按记忆宽度还原；`dock.isCollapsed(id)`。耳朵是垂直居中的小图标页签（不放文字），开合带滑入 / 收拢动效；耳朵是独立浮层，与分栏不是一体；`close` 不留耳朵。",
        "en": "Collapse / expand: `dock.collapse(id)` takes the panel out of the layout (it stops taking width) and shows a fixed ear at the right edge; `dock.expand(id)` pulls the ear back and restores the remembered width; `dock.isCollapsed(id)`. The ear is a small icon-only tab at the vertical center, with slide/collapse animations; it is a standalone overlay, not part of the dock; `close` leaves no ear."
      }
    ],
    "api": [
      {
        "id": "ui-paneldock-create",
        "rows": [
          {
            "name": "maxPanels",
            "type": "number",
            "def": "3",
            "desc": {
              "zh": "同时存在的栏数上限",
              "en": "Max simultaneous panels"
            }
          },
          {
            "name": "defaultWidth / minWidth",
            "type": "number",
            "def": "460 / 320",
            "desc": {
              "zh": "兜底宽度与下限（面板自己给了就以面板为准）",
              "en": "Fallback width and floor (panel’s own value wins if given)"
            }
          },
          {
            "name": "storageKey",
            "type": "string",
            "def": "'dshpc-dock'",
            "desc": {
              "zh": "宽度记忆前缀；传 false 关闭",
              "en": "Width-memory prefix; false disables"
            }
          }
        ]
      },
      {
        "id": "ui-paneldock-panel",
        "rows": [
          {
            "name": "id",
            "type": "string",
            "def": "—",
            "desc": {
              "zh": "组名（寻址键），同名唯一",
              "en": "Group name (address key), unique per name"
            }
          },
          {
            "name": "title / icon",
            "type": "ReactNode",
            "def": "—",
            "desc": {
              "zh": "内置头的标题与标题前图标",
              "en": "Built-in header title and icon before it"
            }
          },
          {
            "name": "extra",
            "type": "ReactNode",
            "def": "—",
            "desc": {
              "zh": "标题右侧的任意内容（不只是按钮）",
              "en": "Any content to the right of the title (not just buttons)"
            }
          },
          {
            "name": "header",
            "type": "ReactNode | null",
            "def": "—",
            "desc": {
              "zh": "整块替换头部：不传 = 内置头；null = 不要头部；其他 = 你的头",
              "en": "Whole-header replacement: omitted = built-in; null = no header; else = your header"
            }
          },
          {
            "name": "closable / closeButton / closeIcon",
            "type": "—",
            "def": "—",
            "desc": {
              "zh": "关钮开关；位置 auto/header/floating/none",
              "en": "Close-button toggle; position auto/header/floating/none"
            }
          },
          {
            "name": "width / minWidth / maxWidth",
            "type": "number",
            "def": "—",
            "desc": {
              "zh": "宽度与可拖动区间",
              "en": "Width and draggable range"
            }
          },
          {
            "name": "ariaLabel",
            "type": "string",
            "def": "—",
            "desc": {
              "zh": "无头部时的无障碍名",
              "en": "A11y name when no header"
            }
          }
        ]
      },
      {
        "id": "ui-paneldock-events",
        "rows": [
          {
            "name": "onOpen",
            "type": "({ id, created: true })",
            "def": "—",
            "desc": {
              "zh": "首次打开",
              "en": "First open"
            }
          },
          {
            "name": "onBeforeClose",
            "type": "({ id, reason: 'button' | 'api' }) => false?",
            "def": "—",
            "desc": {
              "zh": "关闭之前，返回 false 可取消",
              "en": "Before close; returning false cancels"
            }
          },
          {
            "name": "onClose",
            "type": "({ id, reason })",
            "def": "—",
            "desc": {
              "zh": "已关闭",
              "en": "Closed"
            }
          },
          {
            "name": "onResize",
            "type": "({ id, width })",
            "def": "—",
            "desc": {
              "zh": "拖宽松手",
              "en": "Drag released"
            }
          },
          {
            "name": "onLimitReached",
            "type": "({ id })",
            "def": "—",
            "desc": {
              "zh": "到上限被拒",
              "en": "Rejected at cap"
            }
          }
        ]
      }
    ],
    "code": [
      {
        "id": "ui-paneldock-example",
        "lang": "ts",
        "src": "const dock = createPanelDock({ maxPanels: 3 })   // 一次，挂在插件级\n\n// 页面里：结构就在这儿写，不塞进任何调用参数\nh('div', { style: { display: 'flex' } },\n  h(Main, null),                                  // flex:1 1 auto; min-width:0\n  h(PanelDock, { dock },\n    h(DockPanel, { id: 'files', title: '工作区' }, h(FilePanel)),\n    h(DockPanel, { id: 'preview', header: h(PreviewBar) }, h(PreviewBody)),\n    h(DockPanel, { id: 'raw', header: null, closeButton: 'floating' }, h(RawBody)),\n  ),\n)\n// 之后任何地方：dock.open('files') / dock.close('files')"
      }
    ]
  }
}
