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
        "zh": "提供文件浏览与选择；数据走宿主侧只读 FS 路由，**不限工作区**（工作区之外也能浏览）。界面与原版一致。",
        "en": "File browsing and picking **not limited to workspaces**: one root tree (workspace nodes + the real root), served by a host-side read-only FS route."
      },
      {
        "zh": "**接线归核心，但要两条**：宿主 `apply` 调 `serveFsRoute({ path })`，client `apply` 用同一个常量调 `connectFs({ path })`（`connectHost(ctx)` 照旧负责工作区快照）。浏览**不需要会话**。",
        "en": "**Core does the wiring, but with two calls**: `serveFsRoute({ path })` on the host side and `connectFs({ path })` with the same constant on the client side (`connectHost(ctx)` still covers the workspace snapshot). Browsing needs **no session**."
      },
      {
        "zh": "落点只给一个：页面里**包住主区**的那个（核心会补成 flex 行、让主区伸展，关闭时还原）。给元素或选择器（`'#page-row'`）都行，消费方不必存 ref；selector 解析不到就放弃本次打开（不会回落 body）。不要传 `document.body` 再自己套 fixed——那是浮层，不是分栏。",
        "en": "Give exactly one mount: the element wrapping the main area (core makes it a flex row and lets the main area stretch, restoring it on close). Either an element or a selector (`'#page-row'`) works, so no ref bookkeeping is needed; an unresolvable selector abandons the open (never falls back to `body`). Never pass `document.body` with your own fixed positioning — that is an overlay, not a split."
      },
      {
        "zh": "**关钮可退让**（2026-11-04 用户拍板）：dock 默认不在面板层画关钮 —— 文件模式用 `FileBrowser` 面包屑行尾那枚，`content` 模式由你给的内容自己画（无头面板画不画、画在哪，归调用方）；不想自己画就传 `opts.closeButton: 'floating'`。Esc 始终有效。`content` 与 `path` 二选一，同传时忽略 `path` 并 warn。",
        "en": "**The close button yields to the caller** (2026-11-04): by default the dock draws none at panel level — file mode uses the one at the end of the breadcrumb row, `content` mode draws its own (on a headerless panel that is the caller’s call); pass `opts.closeButton: 'floating'` if you would rather have the dock draw it. Esc always works. `content` and `path` are mutually exclusive — passing both ignores `path` with a warning."
      },
      {
        "zh": "面包屑口径不变：路径所属工作区名作根名，其下按相对层级展开。▾ 下拉**根层置顶**（其余仍列各工作区）：POSIX 是一条「根目录」，**Windows 没有根目录这东西，列的是盘符**（`C:/`、`D:/`…，由宿主 `op:roots` 探出来）。点其他工作区 = 直接列该区根目录（不需要会话）。",
        "en": "Inside a workspace the breadcrumb starts at its name and the ▾ menu nests it there; outside it starts at the real root (`/` or a drive). A workspace root still appears in the real path, tagged “Workspace”."
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
        "src": "import { connectFs, openFilePreview, pickWorkspaceFile } from 'dsh-plugin-core/adv/explorer'\nimport { serveFsRoute } from 'dsh-plugin-core/host'\nimport { FS_PATH } from './paths'   // 你自己的常量：宿主与 client 必须用同一个\n\n// ── 宿主半边（apply）：挂一条只读文件路由（不限工作区；读文件/列目录都在它上面） ──\nserveFsRoute(ctx, { path: FS_PATH })\n\n// ── client 半边（apply）：接一次（connectHost 照旧负责工作区快照） ──\nconnectHost(ctx)\nconnectFs({ path: FS_PATH })\n\n// 右侧分栏预览（占宽度、挤窄主区）：一个落点 + 一个路径就够\nopenFilePreview({ mount: pageRowEl, path: '/abs/ledger' })      // 文件夹 ⇒ 目录树；文件 ⇒ 直接预览\nopenFilePreview({ mount: '#page-row', path: 'docs/README.md' })  // 落点也可以给选择器；相对路径也收（相对谁见下）\nopenFilePreview({ mount: '#page-row' })                          // 不给路径 ⇒ 根节点（工作区清单 + 盘符）\n\n// 锚定弹窗选文件（Promise 返回**绝对路径**，不自己挂 dock）\nconst r = await pickWorkspaceFile({ anchor, filter: { exts: ['md'] } })\nconst dir = await pickWorkspaceFile({ anchor, filter: { dirs: true } })  // 只选文件夹\n\n// 展开方位：默认 auto（下方优先、不够翻上方）；按钮贴着定宽区右边界时改向左展开\nawait pickWorkspaceFile({ anchor, placement: 'bottom-end' })   // 下方、右缘对齐\nawait pickWorkspaceFile({ anchor, placement: 'left-start' })   // 左侧、顶边齐平"
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
              "zh": "在右侧分栏打开文件 / 文件夹预览，返回可关闭它的句柄。预览内容二选一：`path`（核心解析并渲染）或 `content`（由调用方给内容）。面板**默认不画关钮**：文件模式用面包屑行尾那枚，`content` 模式由内容自己画；不想自己画就传 `opts.closeButton`",
              "en": "Opens a file/folder preview in the right-side dock and returns a handle to close it. Body is one of two: `path` (resolved and rendered by core) or `content` (rendered from your own node). The panel draws **no close button by default**: file mode uses the one at the end of the breadcrumb row, `content` mode draws its own — pass `opts.closeButton` if you would rather have the dock draw it"
            }
          },
          {
            "name": "opts.mount",
            "type": "HTMLElement | string",
            "def": "—",
            "required": "是",
            "desc": {
              "zh": "页面里**包住主区**的那个元素，或指向它的选择器（`'#page-row'`）；不必自己写 flex（核心补成 flex 行并让主区伸展，关闭时还原）。选择器解析不到 ⇒ 返回 `null` 并 warn，不回落 body。不要传 `document.body`",
              "en": "The element wrapping the main area, or a selector pointing at it (`'#page-row'`); no flex needed (core turns it into a flex row, stretches the main area, and restores it on close). An unresolvable selector ⇒ `null` + a warning, never a `body` fallback. Never `document.body`"
            }
          },
          {
            "name": "opts.sessionId",
            "type": "string",
            "def": "—",
            "desc": {
              "zh": "**只在两种情况下需要**：① 相对路径的基准工作区；② Office 预览（转 PDF 要一条有效会话，缺省由核心取最近有会话的工作区）",
              "en": "Needed in exactly two cases: (1) the base workspace for a relative path; (2) Office preview (conversion needs one valid session; core falls back to the most recent workspace with one)"
            }
          },
          {
            "name": "opts.path",
            "type": "string",
            "def": "—",
            "desc": {
              "zh": "绝对路径或工作区相对路径（相对路径要有可解析的基准，否则返回 `null` 并 warn）；不传 ⇒ 根节点。与 `content` 二选一",
              "en": "Absolute or workspace-relative (a relative one needs a resolvable base, else `null` + a warning); omitted ⇒ the root node. Mutually exclusive with `content`"
            }
          },
          {
            "name": "opts.line",
            "type": "number",
            "def": "—",
            "desc": {
              "zh": "打开后定位到这一行（1 起；只对文本 / 源码态生效）。首屏没读到就自动续翻，最多 10 页；`content` 模式忽略。会话预览的 read 工具卡会把 `offset` 作为这一行传进来",
              "en": "Scroll to this line after opening (1-based; text/source view only). Auto-pages up to 10 pages when the line is beyond the first chunk; ignored in `content` mode. The session mirror passes a read tool’s `offset` here"
            }
          },
          {
            "name": "opts.content",
            "type": "() => ReactNode",
            "def": "—",
            "desc": {
              "zh": "自定义预览内容，塞进同一个右侧 dock；平时优先用领域入口（如 `openSessionReview`）。面板默认不出关钮 ⇒ 内容自己画 ✕（或用 `opts.closeButton` 让 dock 画）；与 `path` 二选一",
              "en": "Custom preview body rendered in the same dock; prefer a domain entry such as `openSessionReview` when one exists. No panel close button by default ⇒ the content draws its own ✕ (or use `opts.closeButton`); mutually exclusive with `path`"
            }
          },
          {
            "name": "opts.closeButton",
            "type": "'auto' | 'header' | 'floating' | 'none'",
            "def": "'none'",
            "desc": {
              "zh": "面板关钮位置。默认 `none` = 不在面板层画（文件模式用面包屑行尾、`content` 模式由内容画）；传 `floating` 让壳在右上角出一枚（占 28px，内容右上要让位）",
              "en": "Panel close-button placement. Default `none` = draw none at panel level (file mode uses the breadcrumb row, `content` mode draws its own); pass `floating` to have the dock put one at the top-right (occupies 28px — headerless content must leave room)"
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
            "type": "PickWorkspaceFileOptions => Promise<PickedPath | null>",
            "def": "—",
            "desc": {
              "zh": "锚定按钮弹出模态选文件，解析出 `{ path, isDir, workspaceRel?, workspace? }`；`path` 是**绝对路径**",
              "en": "Anchored modal picker resolving `{ path, isDir, workspaceRel?, workspace? }`; `path` is **absolute**"
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
              "zh": "`exts` 只要这些扩展名（目录仍可展开导航）；`dirs: true` 只允许选文件夹（文件不渲染）",
              "en": "`exts` limits files (folders still expand); `dirs: true` picks folders only (files hidden, plus a “Select this folder” action in the crumb bar)"
            }
          },
          {
            "name": "opts.placement",
            "type": "PickPlacement",
            "def": "'auto'",
            "desc": {
              "zh": "展开方位八档：`bottom-start` / `bottom-end`（下方，左缘 / 右缘对齐）、`top-start` / `top-end`（上方）、`right-start` / `right-end`（右侧，顶边 / 底边齐平）、`left-start` / `left-end`（左侧）；`auto` = 旧行为（下方优先、下方不够翻上方、横向夹紧）。方位是**优先**：该侧放得下就照它；放不下而对侧够 ⇒ **自动翻边**（bottom↔top、left↔right，对齐轴不变）；两侧都不够才夹紧进视口——按钮贴着定宽区右边界时用 `bottom-end` / `left-start`",
              "en": "Expansion side, eight values: `bottom-start` / `bottom-end` (below, left / right edge aligned), `top-start` / `top-end` (above), `right-start` / `right-end` (right of the trigger, top / bottom edge aligned), `left-start` / `left-end` (left of the trigger); `auto` = old behaviour (below first, flip above when short, clamp horizontally). The side is a **preference**: used when it fits; if it does not fit but the opposite side does, the panel **flips** (bottom↔top, left↔right, same start/end alignment); only when neither fits is it clamped into the viewport — use `bottom-end` / `left-start` when the trigger sits at the right edge of a fixed-width area"
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
        "zh": "归档态不需要调用方传：核心订阅官方 `workspaces.list` 快照的 `archivedSessionIds`（宿主 `domain/changed` → `workspace/follow` 增量推送），弹窗开着期间归档徽标与「继续对话」实时跟随；点击前还会用权威快照复核，不会直开已归档会话。前提是插件 client `apply` 调过一次 `connectHost(ctx)`。归档会话走同一条数据链，同样可读。",
        "en": "Archive state needs no prop: core subscribes to `archivedSessionIds` on the official `workspaces.list` snapshot (host `domain/changed` → `workspace/follow` increments), so the badge and \"Continue\" follow changes while the dialog stays open; the click re-checks the authoritative snapshot so an archived session is never opened directly. Call `connectHost(ctx)` once in the plugin client `apply`. Archived sessions use the same data chain and read fine."
      },
      {
        "zh": "「继续对话」始终保留：未归档是会话图标、点击直跳官方会话区；已归档换成开分支图标、点击先弹确认框（fork 出子会话再跳转）。按钮只在缺 `openHostSession` 时缺席；缺 `forkSession` 时确认框内如实说明能力未就位，不静默隐藏入口。",
        "en": "\"Continue\" is always kept: for an active session it shows the conversation icon and jumps straight to the official session; for an archived one it switches to the branch icon and opens a confirm dialog before forking into a child session. The button disappears only when `openHostSession` is absent; without `forkSession` the dialog states plainly that the capability is unavailable instead of silently hiding the entry."
      },
      {
        "zh": "新会话首轮：首个模型事件落盘前，用户提示词只在官方 `inbox` 投影与 `session.pendingSubmissions` 本地回显里，`chat.order` 还没有 user 节点。核心两路合并渲染（按 rpcId 去重），所以刚发完提示词就打开预览也能立刻看到自己发的话；投影与回显都缺席时不编造气泡。",
        "en": "First turn: before the first model event is durable, the user prompt lives only in the official `inbox` projection and the `session.pendingSubmissions` local echo — `chat.order` has no user node yet. Core merges both sources (deduped by rpcId), so opening the preview right after sending a prompt still shows what you wrote; nothing is invented when neither source is present."
      },
      {
        "zh": "快照只读，框内不能打字续聊。续聊 = `forkSession` 开分支 + `openHostSession` 跳官方会话区；暂存输入框的确定走 `onContinue`（fork + 发首轮 + 跳转）。",
        "en": "The snapshot is read-only, so you cannot type inside the dialog. Continuing means `forkSession` + `openHostSession`; the staging input’s confirm goes through `onContinue` (fork + first turn + navigate)."
      },
      {
        "zh": "**内容插槽**（都可选，都是 `ReactNode`，缺省不渲染 —— DOM 与不传时逐字一致）：`title` 换标题行（sessionId 副标题行仍在）；`header` 整块换左侧标题区（连 sessionId 行一起，归档徽标改挂动作区最前）；`headerActions` 追加在「继续对话」**左边**（继续对话与 ✕ 恒居右）；`bodyHeader` 落在会话滚动容器内最顶（自带固定下边距 `--dshpc-space-3`，不跟随相邻项的 margin）；`bodyFooter` 落在最后一条回复下方、交付文件 / 变更卡之后、复制 / 分支 / 用量操作行之上（末尾没有回复时退回流的末尾）。两个内容槽都随会话一起滚，加载中 / 空 / 出错 / 正常四态都渲染。槽内容由调用方自己渲染，核心不取数、不做数据注入；弹窗与调用方在同一文档内，槽里直接用 `--dshpc-*` token 与核心样式即可生效。标题是一整块 `ReactNode`，放链接 / 标签 / 按钮都行（点击不会冒泡关窗）；文字与徽标混排时用 `inline-flex` + `align-items:center` 包一层，否则徽标会贴基线显得下沉。",
        "en": "**Content slots** (all optional `ReactNode`s; absent means nothing is rendered — the DOM stays byte-identical): `title` replaces the title row (the sessionId subtitle stays); `header` replaces the whole left title area (including the sessionId row, moving the archived badge to the front of the header actions); `headerActions` is appended after \"Continue\" and before the close button; `bodyHeader` / `bodyFooter` sit at the very top / bottom inside the session scroller, scroll with the session, and render in all four states (loading / empty / error / normal). Slot content belongs to the caller — core fetches nothing and injects no data; the dialog shares the document, so `--dshpc-*` tokens and core styles just work inside a slot."
      },
      {
        "zh": "文件出口只有一个：工具卡路径、行内引用、交付卡都走 `onOpenFile`；不传则链接降级为纯文本（可以点但没有出口，不是坏了）。自己已有预览面的，在回调里调你自己的（核心一个 DOM 都不碰）；没有的，一行接上核心自带的右侧分栏：`onOpenFile: (path, sid) => openFilePreview({ mount: '#page-row', path, sessionId: sid })`——落点给元素或选择器都行，弹窗不需要任何遮罩参数。",
        "en": "There is exactly one file exit: tool-card paths, inline mentions and delivered cards all go through `onOpenFile`; without it links degrade to plain text (clickable-looking but no exit — not a break). If you already own a preview surface, call yours inside the callback (core touches no DOM); otherwise wire core’s dock in one line: `onOpenFile: (path, sid) => openFilePreview({ mount: '#page-row', path, sessionId: sid })` — the mount takes an element or a selector, and the dialog needs no mask props."
      },
      {
        "zh": "变更文件的审阅出口是 `onOpenReview`，落点用 `openSessionReview({ mount, locator })` 一行接上：`locator`（sessionId / seq / index / display）到 diff 的拼装归会话域，调用方不挑组件、不塞节点、不补 ✕。审阅面板是无头的，`openSessionReview` 已把关闭钮画在审阅头行尾（与换行钮同排），你什么都不用做。",
        "en": "The review exit for changed files is `onOpenReview`; wire it with one line, `openSessionReview({ mount, locator })`. Turning the locator (sessionId / seq / index / display) into a diff belongs to the session domain — pick no components, pass no nodes, add no ✕. The review panel is headerless, so `openSessionReview` already draws the close button at the end of the review header row (next to the wrap toggle); nothing left for you to do."
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
              "zh": "会话自身快照（加载态 / 是否翻尽 / 本地提交回显）",
              "en": "Snapshot of the session itself (loading state, paged-out, local submission echoes)"
            }
          },
          {
            "name": "inbox",
            "type": "SnapshotFace<unknown>",
            "def": "—",
            "desc": {
              "zh": "官方 `inbox` 投影订阅面（faceOf(\"inbox\")）；首轮等待期用户消息的 host 侧真源，由 openSessionView 接好，调用方零接线",
              "en": "Official `inbox` projection surface (faceOf(\"inbox\")); the host-side source of first-turn user messages, wired by openSessionView — no caller setup"
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
            "name": "title",
            "type": "ReactNode",
            "def": "「会话预览」",
            "required": "否",
            "desc": {
              "zh": "标题行；通常传宿主 sessions.list 的 displayTitle，也可放任意节点（后面跟标签 / 按钮）。会话 id 仍在下方副标题行（等宽小字），不受影响",
              "en": "Title row; usually the displayTitle from the host sessions.list, or any node (tags / buttons after it). The session id stays on the monospace subtitle line below, unaffected"
            }
          },
          {
            "name": "heading",
            "type": "string",
            "def": "—",
            "required": "否",
            "desc": {
              "zh": "0.34 的旧名，等价 `title`（只收字符串）；两者都给以 `title` 为准",
              "en": "Legacy name from 0.34, equal to `title` (string only); `title` wins when both are given"
            }
          },
          {
            "name": "header",
            "type": "ReactNode",
            "def": "—",
            "required": "否",
            "desc": {
              "zh": "整块替换左侧标题区（标题行 + sessionId 行）：传了则 `title` / `heading` 不生效，归档徽标改挂到右侧动作区最前；「继续对话」与关闭 ✕ 不受影响",
              "en": "Replaces the whole left title area (title row + sessionId row): `title` / `heading` stop applying, and the archived badge moves to the front of the header actions; \"Continue\" and ✕ are unaffected"
            }
          },
          {
            "name": "headerActions",
            "type": "ReactNode",
            "def": "—",
            "required": "否",
            "desc": {
              "zh": "头部右侧追加动作：排在核心「继续对话」**左边**（「继续对话」与关闭 ✕ 恒居最右）",
              "en": "Extra header actions, placed to the **left** of core \"Continue\" (Continue and ✕ always stay rightmost)"
            }
          },
          {
            "name": "bodyHeader",
            "type": "ReactNode",
            "def": "—",
            "required": "否",
            "desc": {
              "zh": "会话内容最顶端（滚动容器内、所有节点与「加载更早」之前），自带固定下边距（`--dshpc-space-3`）；随会话一起滚，加载中 / 空 / 出错 / 正常四态都渲染",
              "en": "Very top of the session content (inside the scroller, before all nodes and \"load earlier\"), with a fixed bottom gap (`--dshpc-space-3`); scrolls with the session and renders in all four states (loading / empty / error / normal)"
            }
          },
          {
            "name": "bodyFooter",
            "type": "ReactNode",
            "def": "—",
            "required": "否",
            "desc": {
              "zh": "最后一条回复下方、交付文件 / 变更卡**之后**、复制 / 分支 / 用量操作行**之上**（末尾没有回复或没有尾操作行时落在流的末尾）；随会话一起滚，四态都渲染",
              "en": "Below the last reply, after the delivered-files / changed-files cards and **above** the copy / branch / usage action row (falls to the end of the flow when there is no trailing reply or action row); scrolls with the session and renders in all four states"
            }
          },
          {
            "name": "forkSession",
            "type": "(sessionId, atSeq?) => Promise<string>",
            "def": "—",
            "desc": {
              "zh": "开分支并返回子会话 id；已归档会话的「继续对话」始终渲染，缺它时确认框内如实说明能力未就位",
              "en": "Fork and resolve the child session id; \"Continue\" stays rendered for archived sessions, and the dialog states plainly when this capability is missing"
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
            "type": "(path: string, sessionId: string, options?: { line?: number }) => void",
            "def": "—",
            "desc": {
              "zh": "文件打开出口（工具卡 fileLink / 行内引用 / 交付卡共用）；第二参是文件所属会话 id，别拿别的会话去定位；第三参可带 `line`（read 工具卡的 `offset`，直接转给 `openFilePreview` 的 `opts.line`）；缺省 = 链接纯文本",
              "en": "File-open exit shared by fileLinks, mentions and delivered cards; the second arg is the owning session id — locate the file there, not elsewhere; the third may carry `line` (a read call’s `offset`, forward it to `openFilePreview`’s `opts.line`); absent = plain text"
            }
          },
          {
            "name": "onOpenReview",
            "type": "(locator: ChangedFileReviewLocator) => void",
            "def": "—",
            "desc": {
              "zh": "变更文件的审阅出口（等价官方 openReview）；落点用 `openSessionReview({ mount, locator })` 一行接上；缺省 = 变更卡整张不可点",
              "en": "Review exit for changed files (equals official openReview); wire it with `openSessionReview({ mount, locator })`; absent = the change card is not clickable"
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
        "src": "import { openSessionView, openSessionReview, SessionViewModal } from 'dsh-plugin-core/adv/session'\n\n// 宿主服务由调用方注入：sessions ← dsh-api-session-controller、\n//   uiConversation ← dsh-client-ui-conversation\nconst view = openSessionView(sessions, uiConversation, sessionId, 'dsh-task-reminder')\nif (view !== null) {\n  h(SessionViewModal, {\n    sessionId,\n    view,\n    title: '镜像升级日报',                      // 标题行，缺省「会话预览」\n    // 插槽（都可选，缺省不渲染 —— DOM 与不传时一致）：\n    // 标题行加节点，sessionId 行仍在；文字与徽标混排要用 inline-flex，否则徽标贴基线会下沉\n    // title: h('span', { style: { display: 'inline-flex', alignItems: 'center', gap: '6px' } },\n    //   '日报', h(Chip, { size: 'xs' }, '运行中')),\n    // header: h(TaskHead, { taskId }),         // 整块换左侧标题区（含 sessionId 行；归档徽标改挂动作区最前）\n    // headerActions: h(Button, null, '导出'),   // 排在「继续对话」左边（继续对话与 ✕ 恒居右）\n    // bodyHeader: h(ContextBar),               // 会话滚动容器内最顶，随会话滚\n    // bodyFooter: h(SessionSummary),           // 交付文件之后、复制/分支/用量操作行之上；没回复则在最底\n    onClose: () => { view.dispose(); setOpen(false) },   // 关闭必须 dispose\n    // 续聊（可选）：fork 开分支 → 跳官方会话区；缺 openHostSession 才不渲染该入口\n    forkSession: (id, atSeq) => sessions.fork({ sessionId: id, increaseTitle: true, atSeq }),\n    openHostSession: (id) => uiWorkspace.openSession(id),\n    // 暂存输入框（可选）：由调用方 fork + 发首轮 + 跳转\n    onContinue: async (message) => {\n      const child = await forkSession(sessionId)\n      await hostContinue(child, message)\n      openHostSession(child)\n    },\n    // 文件打开出口：给一个落点即可（元素或选择器），核心自带右侧分栏\n    onOpenFile: (path, sid, opts) => openFilePreview({ mount: '#page-row', path, sessionId: sid, line: opts?.line }),\n    // 变更文件审阅：一行打开那次改动的 diff（面板 / 关闭钮全归核心）\n    onOpenReview: (locator) => openSessionReview({ mount: '#page-row', locator }),\n    // 归档态不用传：核心订阅官方 workspaces 快照（apply 里 connectHost 接线一次即可）\n    t,                                          // 可选，覆盖文案\n  })\n}"
      },
      {
        "id": "session-data-chain",
        "lang": "ts",
        "src": "// 数据链（越往上越早）：\n//   sessions.retain(id, { source })  物化 scope\n//     → sessions.binding(id)         取绑定\n//     → session.open()               幂等拉历史尾页\n//     → uiConversation.binding(binding).target('chat')\n//                                     拿 ChatSnapshot：order + nodes（keyed 流）\n//     → session.projections.faceOf('inbox')\n//                                     首轮等待期用户消息（host 投影，冷读也拿得到）\n// 用完必须 view.dispose()，否则会话 scope 不回收。"
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
        "zh": "语言默认跟随宿主：官方 locale 插件把生效语言写进 `<html lang>`（zh → `zh-CN`），本包直接读它 ⇒ 插件不必再接 locale 服务、也不必自己同步。`setLocale` 只是手动覆盖（测试 / 非宿主环境用），调过就不再跟随宿主，传 `null` 恢复跟随。",
        "en": "The language follows the host by default: the official locale plugin writes the active language into `<html lang>` (zh → `zh-CN`) and this package reads it directly, so a plugin needs neither the locale service nor its own sync. `setLocale` is only a manual override (tests / non-host environments); once called it stops following the host, and passing `null` resumes it."
      },
      {
        "zh": "可用 key 全集见 src/utils/i18n.ts 的 UtilMessageKey；要在宿主切语言时重渲组件，顶层调一次 `useLocale()`（ui 导出）。",
        "en": "Full key list: `UtilMessageKey` in `src/utils/i18n.ts`; to re-render on a host language switch, call `useLocale()` (exported from ui) once at the top of a component."
      }
    ],
    "api": [
      {
        "id": "utils-i18n",
        "rows": [
          {
            "name": "setLocale(locale)",
            "type": "('zh' | 'en' | null) => void",
            "def": "不调则跟随宿主",
            "desc": {
              "zh": "手动覆盖语言（测试 / 非宿主）；传 `null` 恢复跟随宿主 `<html lang>`",
              "en": "Manual override (tests / non-host); pass `null` to follow the host `<html lang>` again"
            }
          },
          {
            "name": "getLocale()",
            "type": "() => string",
            "def": "—",
            "desc": {
              "zh": "当前语言（默认跟随宿主）",
              "en": "Current locale (follows the host by default)"
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
        "zh": "§4 接文件浏览：`mount` 必填（预览面板是布局成员，占宽挤窄主区），传页面那层 flex 行——元素或选择器都行，解析不到就放弃、不回落 body；数据面要在宿主 `serveFsRoute` + client `connectFs` 用同一个 path 常量接上，浏览本身不需要会话。",
        "en": "§4 Wire file browsing: `mount` is required (the preview panel is a layout member that takes width); pass the page’s flex row — an element or a selector, and an unresolvable selector abandons the open instead of falling back to `body`. Wire the data face with the same path constant on both sides (`serveFsRoute` / `connectFs`) — browsing itself needs no session."
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
        "src": "// 插件 client 入口\nimport { createStyleKit } from 'dsh-plugin-core/design'\nimport { setStyleKit } from 'dsh-plugin-core/ui'\n\nconst kit = createStyleKit({ id: 'dsh-task-reminder-ui' })\nsetStyleKit(kit)\n// 只需这一行：控件首次渲染时自注入自己那份 CSS，token 也一并登记。"
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
        "src": "import { connectFs, openFilePreview, pickWorkspaceFile } from 'dsh-plugin-core/adv/explorer'\nimport { serveFsRoute } from 'dsh-plugin-core/host'\nimport { FS_PATH } from './paths'   // 自己的常量，宿主与 client 共用\n\n// 宿主 apply：挂只读文件路由（列目录 / 读文件都在它上面，不限工作区）\nserveFsRoute(ctx, { path: FS_PATH })\n// client apply：接同一个常量（connectHost(ctx) 照旧负责工作区快照）\nconnectFs({ path: FS_PATH })\n\n// 预览某文件：右侧分栏（挤窄 row 左边的主区，不是浮在上面）；绝对 / 相对都收\n// 落点给元素或选择器都行（openFilePreview({ mount: '#page-row' })），不必存 ref\nopenFilePreview({ mount: pageRowEl, path: '/abs/ws/docs/requirements.md' })\n\n// 让用户选：锚定按钮旁弹模态，Promise 返回 { path: 绝对路径, isDir, workspaceRel?, workspace? }\nconst picked = await pickWorkspaceFile({ anchor: btn, filter: { exts: ['ts'] } })\nconst folder = await pickWorkspaceFile({ anchor: btn, filter: { dirs: true } })   // 只选文件夹"
      },
      {
        "id": "integration-use-session",
        "lang": "tsx",
        "src": "import { openSessionView, SessionViewModal } from 'dsh-plugin-core/adv/session'\n\n// sessions / uiConversation 同样从 ctx 取出（懒得取就用官方 client 服务）\nconst view = openSessionView(sessions, uiConversation, sessionId, 'dsh-task-reminder')\nif (view !== null) {\n  h(SessionViewModal, {\n    sessionId, view,\n    // 关闭必须释放 retain 引用\n    onClose: () => { view.dispose(); setOpen(false) },\n    // 文件出口：已经点开的那条会话 id 会作为第二参传进来（相对路径 / Office 都按它定位）\n    onOpenFile: (path, sid, opts) => openFilePreview({ mount: pageRowEl, path, sessionId: sid, line: opts?.line }),\n  })\n}"
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
        "src": "import { createStyleKit } from 'dsh-plugin-core/design'\nimport { setStyleKit } from 'dsh-plugin-core/ui'\n\nsetStyleKit(createStyleKit({ id: 'dsh-task-reminder-ui' }))\n// 控件样式不用你挂：每个控件首次渲染时自注入自己那份 CSS（幂等），\n// 用不到的控件其 CSS 也不会进你的包。"
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
        "zh": "Button 18 档外观（实心 / 线框 / 无底）。hover / active 走 token 派生色（不用 opacity）。扩展八色（purple/pink/cyan/teal/orange/indigo/rose/slate）为实心面，与 Chip/Card 同源。",
        "en": "Button offers 18 variant tiers (solid / outline / bare). hover/active use token-derived colors (no opacity). The eight extended tiers (purple/pink/cyan/teal/orange/indigo/rose/slate) are solid faces, same source as Chip/Card."
      },
      {
        "zh": "IconButton：variant: plain|outline|danger（默认 plain，**无底色**）、size（默认 lg）、icon（必填）、label（必填，无障碍名兼 title）、color（图标色）、background（底色，不传即无底色）。",
        "en": "IconButton: variant plain|outline|danger (default plain, **no background**), size (default lg), icon (required), label (required, doubles as a11y name and title), color (icon colour), background (fill; omitted = no fill)."
      },
      {
        "zh": "`dense` 是两者共用的紧凑图标档：`size` / 高度一律不变，图标放大一档、内距收紧（Button 的 `--btn-pad` 从 10/12/14 收到 6，图标容器从 0.875em 到 1.25em；IconButton 把图标 `<svg>` 的 `width/height` 从 1em 提到 1.25em，正方形宽高不变、四周留白变小）。两者 dense 下图标都是 sm 15px / md·lg 16.25px。IconButton 的按钮显式 `padding:0`、图标 `flex:none`：svg 是 flex item，不禁止收缩会被内距压成窄条，此时改 `width` 或加 `!important` 都无效。给描边细、缩到 sm 看不清的图标用（如文件类型 / 语言图标）；默认 false，原有按钮外观不变。",
        "en": "`dense` is a shared compact-icon tier for both: `size` and height stay put while the icon grows one step and padding tightens (Button: `--btn-pad` 10/12/14 → 6, icon container 0.875em → 1.25em; IconButton: the icon `<svg>` goes from `width/height:1em` to `1.25em`, same square box, less breathing room). Both give sm 15px / md·lg 16.25px icons. An IconButton sets `padding:0` on itself and `flex:none` on the icon: the svg is a flex item, and without disabling shrinking the padding squeezes it into a narrow strip — changing `width` or adding `!important` cannot fix that. Use it for thin-stroke icons that vanish at `sm` (file-type / language glyphs). Defaults to false, so existing buttons are unchanged."
      },
      {
        "zh": "两者的 loading 语义一致：`onClick` 返回 Promise 就转圈（纯图标钮把图标位换成小圈，`aria-label` 不变、补 `aria-busy`），`onBusyChange` 把「在跑」报出去；受控 `loading` 与它取或 —— 别处刷新也能点亮同一颗按钮。转圈期间按钮自己的图标位（`icon` / `iconRight`）全部让位，只留转圈 + 文字。",
        "en": "Both share one loading semantics: a Promise-returning `onClick` spins (an icon button swaps its icon for the spinner, keeps `aria-label` and adds `aria-busy`), `onBusyChange` reports \"running\", and the controlled `loading` prop is OR-ed in — an external refresh lights the same button too. While spinning, the button’s own icon slots (`icon` / `iconRight`) all step aside: spinner plus label only."
      },
      {
        "zh": "loading 会把前置圈插进按钮：无 icon 的按钮因此宽出 18px（圈 12 + 间距 6），把旁边的按钮挤开。要完全不跳有两条路：给 `width` 定宽（按最长文案 + 18px 留），或传 `loadingText={false}` 让 loading 时只剩一圈。",
        "en": "Loading inserts the spinner into the button, so a button without an icon grows 18px (12px spinner + 6px gap) and shoves its neighbours. To keep it rock-steady, either set `width` (longest label + 18px) or pass `loadingText={false}` so only the spinner remains while loading."
      },
      {
        "zh": "Segmented：`items`（必填）支持单选 / 多选，`size`（默认 lg；三档总高 24 / 28 / 32）、`bordered`（1px 外框，总高不变）、`multiple`（多选）。外观只有一套：灰底轨道 + 白色选中片，选中片的描边环与阴影由宿主 elevation token 提供（离线兜底值没有那圈环）。选中片配色只经 `tone`：传内置色名（与 Chip 同名的 business / success / warning / danger / purple / pink / cyan / teal / orange / indigo / rose / slate）时底与字由核心定、深浅两主题各自成立；传 `{ bg, fg }` 时两个主题都用调用方这一对颜色（对比度由调用方负责）。段内 `icon` 是前置图标槽（官方图标组件 / 数组 / 自绘节点均可），`label` 也可传节点；顺序固定为 icon → label → count。只有图标（无文字 / 计数 / 角标）时该段自动变正方形（宽 = 段高），读屏名用 `ariaLabel`，缺省退回 `tooltip`。段内 `count`（弱化灰字，选中段内自动跟着选中片字色提亮）/ `badge`（红角标）接受 `number | string`：数字 ≤0 不显示，字符串原样显示（如 `1K` / `99+`）。",
        "en": "Segmented: `items` (required) supports single or multiple selection; `size` (default lg; totals 24 / 28 / 32), `bordered` (1px outer frame, same total height), `multiple` (multi-select). One look only: grey track + white selected pill; its stroke ring and shadow come from the host elevation token (the offline fallback has no ring). The selected pill’s colors go through `tone` only: a built-in color name (business / success / warning / danger / purple / pink / cyan / teal / orange / indigo / rose / slate, same names as Chip) lets the core pick background and text per theme; `{ bg, fg }` uses that pair verbatim in both themes (contrast is the caller’s call). An item’s leading `icon` takes any node (official icon component, array, or custom); `label` also accepts a node; order is always icon → label → count. With only an icon (no label / count / badge) the segment squares itself (width = segment height), and the accessible name comes from `ariaLabel`, falling back to `tooltip`. An item’s `count` (muted text; auto-lightened to follow the selected pill’s text color while selected) and `badge` (red pill) take `number | string`: numbers ≤0 render nothing, strings render as given (e.g. `'1K'` / `'99+'`)."
      },
      {
        "zh": "多选（`multiple`）时每段的最小宽度等于该档段高：最窄也是正方形，文案更长则自然撑成横向长方形，不会出现宽比高还小的竖条；`weekday` 与只有图标的固定方块也由这条下限兜住。",
        "en": "In `multiple` mode every segment has a minimum width equal to its own segment height: the narrowest case is a square, longer labels grow it into a landscape rectangle, and no segment is ever taller than it is wide. Fixed-width squares (`weekday`, icon-only) are clamped by this floor too."
      }
    ],
    "api": [
      {
        "id": "ui-button",
        "rows": [
          {
            "name": "variant",
            "type": "上表 18 档（primary/secondary/danger/success/warning/info/outline/danger-outline/ghost/link + 扩展 purple/pink/cyan/teal/orange/indigo/rose/slate）",
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
            "name": "dense",
            "type": "boolean",
            "def": "false",
            "desc": {
              "zh": "紧凑图标档：高度不变，图标放大、内距收紧（Button / IconButton 同名同义）",
              "en": "Compact-icon tier: same height, larger icon and tighter padding (same prop on Button and IconButton)"
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
              "zh": "受控 loading：文案前显示同色小圈并自动 disabled（别处刷新也能点亮它）；与「点击自动 loading」取或",
              "en": "Controlled loading: same-color spinner before the label plus auto-disable (an external refresh can light it up too); OR-ed with automatic click loading"
            }
          },
          {
            "name": "loadingText",
            "type": "boolean",
            "def": "true",
            "desc": {
              "zh": "传 false：loading 时清掉文案、把按钮锁在「有文案时」的宽度上、只留一枚居中的圈；settle 后文案与自适应宽度一起还原。文案清掉后读屏靠 aria-label（字符串 children 自动补），首帧就是 loading 时锁不到宽，改用 width",
              "en": "Pass false to drop the label while loading, freeze the button at its labelled width and show a single centred spinner; label and auto width come back on settle. Screen readers fall back to aria-label (auto-filled for string children); a button that starts out loading has no labelled width to freeze — set width instead"
            }
          },
          {
            "name": "onClick",
            "type": "(...) => unknown",
            "def": "—",
            "desc": {
              "zh": "**返回 Promise 即自动 loading**：转圈 + 禁用 + 防连点，settle 后自己恢复；reject 也恢复并把错误打到控制台。同步返回值 = 老行为",
              "en": "**Returning a Promise enables loading automatically**: spinner, disabled, no double-clicks, restored on settle; a rejection also restores and logs the error. Sync return values behave as before"
            }
          },
          {
            "name": "onBusyChange",
            "type": "(busy: boolean) => void",
            "def": "—",
            "desc": {
              "zh": "把「这个按钮正在跑」报出去（配合 `Modal` / `SideSheet` 的 `busy` 锁死关闭），不改变按钮自身行为",
              "en": "Reports \"this button is running\" outward (pair with `busy` on `Modal` / `SideSheet` to lock closing); does not change the button itself"
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
            "name": "width",
            "type": "number | string",
            "def": "—",
            "desc": {
              "zh": "固定宽（px 或任意 CSS 宽度）；与 minWidth / maxWidth 互斥，一旦设定后两者自动失效",
              "en": "Fixed width (px or any CSS width); mutually exclusive with minWidth/maxWidth — once set, the other two are ignored"
            }
          },
          {
            "name": "minWidth",
            "type": "number | string",
            "def": "—",
            "desc": {
              "zh": "最小宽：width 未设时生效，内容不足此宽时以它为准",
              "en": "Minimum width: applies only when width is unset; content shorter than this still takes this width"
            }
          },
          {
            "name": "maxWidth",
            "type": "number | string",
            "def": "—",
            "desc": {
              "zh": "最大宽：width 未设时生效，文字超出折叠成省略号，hover 以跑马灯展开全名",
              "en": "Maximum width: applies only when width is unset; overflowing text collapses to an ellipsis and marquees on hover"
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
              "zh": "type / disabled / title / aria-* 等原样透传（onClick 见上面那行）",
              "en": "type / disabled / title / aria-* and friends pass through (onClick is documented above)"
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
        "zh": "首屏分页：`limit` 按**选项条数**跨组切片，列表末尾「显示更多」（跟在最后一条后，像多一条选项）每点一次再追加 `limit` 条；搜索结果走同一套分页，换搜索词或重新展开都回到首屏。不传 `limit` 就是全量渲染。`PickerOption.keywords` 是可选的单个字符串（调用方自己拼），只和 `label` 拼起来参与大小写不敏感子串匹配，**绝不渲染**——适合任务 UUID 这种「用户能贴、但不该显示」的搜索词。纯逻辑另可单用 `sliceGroups`。",
        "en": "First-page paging: `limit` slices by **option count** across groups; \"Show more\" rendered as the last row of the list appends another `limit` each click. Search results use the same paging and reset to the first page on a new query or reopen. No `limit` means render everything. `PickerOption.keywords` is an optional single string (joined by the caller) that participates in case-insensitive substring matching together with `label` but is **never rendered** — for search terms like a task UUID that users paste but should not see. `sliceGroups` is also exported as pure logic."
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
            "name": "limit",
            "type": "number",
            "def": "—",
            "desc": {
              "zh": "首屏显示的选项条数（跨组计）；列表末尾「显示更多」每次再追加同样条数，搜索结果同样分页。不传 = 全量",
              "en": "Options shown on the first page (counted across groups); \"Show more\" appends the same amount each click, search results included. Omitted = all"
            }
          },
          {
            "name": "options[].keywords",
            "type": "string",
            "def": "—",
            "desc": {
              "zh": "只参与搜索、不渲染的额外关键词（单个字符串，调用方自行拼接）",
              "en": "Extra search-only keyword, never rendered (one string, joined by the caller)"
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
  "split-group": {
    "id": "split-group",
    "heading": {
      "zh": "SplitGroup（组合选择框）",
      "en": "SplitGroup (combined selectors)"
    },
    "prose": [
      {
        "zh": "只做一件事：把两个控件在**外观上**焊成一体——外框、圆角、两格之间那条 1px 分隔、整体聚焦圈都由外壳画；内件仍是原来的控件（它们把边框、底色、圆角交出来）。形态随便换：滑块 + 下拉、下拉 + 下拉，外壳不变。",
        "en": "Does one thing: welds two controls into one **visually** — outer frame, corner radius, the 1px divider between the cells and the shared focus ring all come from the shell; the inner controls stay the original ones (they hand over border, background and radius). Swap the cells freely: segmented + dropdown, dropdown + dropdown — the shell does not change."
      },
      {
        "zh": "外壳**不持状态、不出联动回调**：联动就是让左格自己的 `onChange` 去改右格的数据源，两个控件原本怎么用，拼起来还怎么用。固定两格，不做多格。",
        "en": "The shell holds **no state and emits no linking callback**: linking means the left cell’s own `onChange` updates the right cell’s data. Each control behaves exactly as it does on its own. Exactly two cells, never more."
      },
      {
        "zh": "高度不写死：内件按自己的 `size`（sm 24 / md 28 / lg 32）撑开，外壳跟着长，两格传**同一个 size** 才逐像素等高。下拉菜单 portal 到 body，不受外壳 `overflow:hidden` 裁剪。",
        "en": "Height is never hard-coded: each cell grows to its own `size` (sm 24 / md 28 / lg 32) and the shell follows; give both cells the **same size** for pixel-identical heights. Menus portal to body, so the shell’s `overflow:hidden` never clips them."
      }
    ],
    "api": [
      {
        "id": "ui-split-group",
        "rows": [
          {
            "name": "children",
            "type": "ReactNode",
            "def": "—",
            "desc": {
              "zh": "两格内容（左、右）；元素顺序即布局顺序",
              "en": "Two cells (left, right); order is layout order"
            }
          },
          {
            "name": "label",
            "type": "string",
            "def": "—",
            "desc": {
              "zh": "无障碍组名（role=group）",
              "en": "Accessible group name (role=group)"
            }
          },
          {
            "name": "id / className / style",
            "type": "string / string / CSSProperties",
            "def": "—",
            "desc": {
              "zh": "锚点 / 只补布局，不覆盖皮肤",
              "en": "Anchor / layout-only additions, never skin overrides"
            }
          }
        ]
      }
    ],
    "code": [
      {
        "id": "ui-splitgroup-example",
        "lang": "tsx",
        "src": "import { SplitGroup, Segmented, Picker } from 'dsh-plugin-core/ui'\n\n// 两格焊成一体：外框 / 圆角 / 中间 1px 分隔 / 整体聚焦圈都由外壳画\n// 联动不归外壳管 —— 左格选完，在它自己的 onChange 里改右格的数据\nh(SplitGroup, null,\n  h(Segmented, { size: 'md', items: periods, value: period, onChange: (v) => { setPeriod(v); setBucket('') } }),\n  h(Picker, { size: 'md', options: bucketsOf(period), value: bucket, onChange: setBucket, clearable: true }),\n)\n\n// 两个下拉同样只是换内件，外壳不变\nh(SplitGroup, null,\n  h(Picker, { size: 'md', options: scopes, value: scope, onChange: setScope }),\n  h(Picker, { size: 'md', options: membersOf(scope), value: member, onChange: setMember, searchable: true }),\n)"
      }
    ]
  },
  "input-group": {
    "id": "input-group",
    "heading": {
      "zh": "InputGroup（组合输入框）",
      "en": "InputGroup (input with actions)"
    },
    "prose": [
      {
        "zh": "输入框 + 后置按钮组焊成一体，外观与 SplitGroup 同一套口径（外框 / 圆角 / 相邻 1px 分隔 / 整体聚焦圈都由外壳画，内件把自己的边框、圆角交出来）。区别是这里**持状态**：值受控于调用方，提交点与撤销栈在控件内部。",
        "en": "An input and a trailing button group welded into one shell, using the same skin rules as SplitGroup (frame, radius, 1px dividers and the focus ring all come from the shell; inner controls hand over their border and radius). The difference: this one **holds state** — the value is controlled by the caller, while commit points and the undo stack live inside."
      },
      {
        "zh": "按钮可以是任意多枚（返回 + 确定、图标 / 图文 / 纯文字）；`label` 是前置标题，与输入框同格灰底。`size` 三档（sm 24 / md 28 / lg 32），要别的就传 `height`（px），内件跟着撑满。",
        "en": "Any number of buttons (back + confirm; icon / icon+text / text only); `label` is a leading title sharing the cell with a sunken background. Three sizes (sm 24 / md 28 / lg 32); pass `height` in px for anything else and the inner controls fill it."
      },
      {
        "zh": "撤销口径：Enter / 失焦 / 点任一动作 = 一次提交，提交前的值进栈；点撤销弹回栈顶、栈空时按钮禁用。父级直接改 `value`（如外部清空）不算编辑，不进栈。",
        "en": "Undo semantics: Enter / blur / clicking any action is one commit, and the value before it is pushed; the undo button pops the top and is disabled while the stack is empty. A `value` change made directly by the parent (such as an external clear) is not an edit and never enters the stack."
      }
    ],
    "api": [
      {
        "id": "ui-input-group",
        "rows": [
          {
            "name": "value / onChange(v)",
            "type": "string / (v: string) => void",
            "def": "—",
            "desc": {
              "zh": "受控值",
              "en": "Controlled value"
            }
          },
          {
            "name": "label",
            "type": "string",
            "def": "—",
            "desc": {
              "zh": "前置标题（同格灰底）；同时作为整组无障碍名的兜底",
              "en": "Leading title in the same cell (sunken background); also the fallback accessible name for the group"
            }
          },
          {
            "name": "actions",
            "type": "InputGroupAction[]",
            "def": "—",
            "desc": {
              "zh": "{ icon?, label?, variant?, disabled?, width?, loadingText?, ariaLabel?, onClick }；只给 icon 退化成正方形图标钮（ariaLabel 必给），给 label 走 Button；variant 默认 info，语义色就用 Button 现成的档（success / info / warning / danger），不另调色；**onClick 返回 Promise 时那枚按钮自动转圈禁用**，不用自己传 loading；转圈会把按钮撑宽并挤窄输入框，用 width 或 loadingText={false} 压住",
              "en": "{ icon?, label?, variant?, disabled?, width?, loadingText?, ariaLabel?, onClick }; icon-only degrades to a square icon button (pass ariaLabel), a label renders a Button; variant defaults to info — for a semantic colour pass Button’s own variant (success / info / warning / danger) instead of a custom colour; **a Promise-returning onClick spins and disables that button** — no loading prop to manage; spinning widens the button and squeezes the input, so hold it with width or loadingText={false}"
            }
          },
          {
            "name": "undoable / undoLabel",
            "type": "boolean / string",
            "def": "false / '撤销'",
            "desc": {
              "zh": "最前面加撤销钮，回到上一次提交前的值",
              "en": "Prepends an undo button returning to the value before the last commit"
            }
          },
          {
            "name": "size / height",
            "type": "'sm' | 'md' | 'lg' / number(px)",
            "def": "'lg' / —",
            "desc": {
              "zh": "height 给了就压过 size 档",
              "en": "height overrides the size preset"
            }
          },
          {
            "name": "error / disabled",
            "type": "boolean",
            "def": "—",
            "desc": {
              "zh": "error 描红整组；disabled 禁用输入与所有按钮",
              "en": "error turns the whole shell red; disabled disables the input and every button"
            }
          },
          {
            "name": "onSubmit(v)",
            "type": "(v: string) => void",
            "def": "—",
            "desc": {
              "zh": "Enter 提交（同时记一次撤销点）",
              "en": "Enter submit (also records an undo point)"
            }
          },
          {
            "name": "hint",
            "type": "string",
            "def": "—",
            "desc": {
              "zh": "整组后面挂标准 FieldHint",
              "en": "Attaches a standard FieldHint after the whole group"
            }
          },
          {
            "name": "placeholder / aria-label / id / className / style",
            "type": "string",
            "def": "—",
            "desc": {
              "zh": "占位 / 无障碍名 / 锚点 / 只补布局",
              "en": "Placeholder / accessible name / anchor / layout-only additions"
            }
          }
        ]
      }
    ],
    "code": [
      {
        "id": "ui-inputgroup-example",
        "lang": "tsx",
        "src": "import { InputGroup } from 'dsh-plugin-core/ui'\n\n// 输入框 + 按钮组焊成一体；label 是前置标题，undoable 在最前面加撤销钮\nh(InputGroup, {\n  label: '任务名',\n  value: name, onChange: setName,\n  undoable: true,\n  onSubmit: save,                       // Enter 提交（提交点也会进撤销栈）\n  actions: [\n    { label: '返回', variant: 'ghost', onClick: back },\n    { label: '确定', variant: 'success', onClick: save },   // 语义色直接传档，不自己调色\n  ],\n})\n\n// 按钮三形：纯图标（正方形，ariaLabel 给读屏）/ 图标 + 文字 / 纯文字；size 三档\nh(InputGroup, {\n  size: 'md', value: kw, onChange: setKw,\n  actions: [\n    { icon: h(IconRefreshOutlineRegular, { size: 14 }), ariaLabel: '重置', onClick: reset },\n    { icon: h(IconSearchOutlineRegular, { size: 14 }), label: '搜索', onClick: search },\n  ],\n})\n\n// 高度自定义：height 直接给 px，压过 size 档（内件跟着撑满）\nh(InputGroup, {\n  value: kw, onChange: setKw, height: 44,\n  actions: [{ label: '确定', onClick: save }],\n})"
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
      },
      {
        "zh": "`presets` 只在 range 生效：弹层拆成左区（两个端框 + 两块日历，同宽、上下对齐）与右侧一整列快捷按钮（从端框那行竖排到日历底部，一条竖线隔开，按钮多了自己滚）。**列宽固定容下英文缩写最长那档**（中文两字居中），列高严格等于左侧日历区，档位多了只在列内滚动、不把弹层撑高；按钮文字居中。快捷按钮（`size=\"sm\"`）与两个端框（`size=\"md\"`）**都复用核心 `Button`**（选中态走 `color` 轴），不另写皮肤、圆角与全站一致；`label` 由调用方给，给 `{ zh, en }` 双语对象即随 `setLocale` 自动切换（核心不内置文案）。`expr` 用 Grafana / Elasticsearch 的 date math 子集——`now/d` 今天、`now-1d/d` 昨天、`now/w` 本周、`now-1w/w` 上周、`now/M` 本月、`now-1M/M` 上月、`now/Q` 本季度、`now-1Q/Q` 上季度、`now/y` 今年、`now-1y/y` 去年（`Q` 季、`M` 月、`m` 分），`expr: null` 即清空起止。点一下只把两端填进弹层草稿、面板不关，当场看得见两端与日历一起变；**点「确定」才 onChange**（不点确定，外面那个触发器不变）。选中态只按当前起止与各项算出的起止逐一比对：撞上就亮，一个没撞上就整排不亮（不显示「自定义」）；每次渲染按当天重算，不用记状态。",
        "en": "`presets` applies to range only: the popup splits into a left zone (two end boxes + two calendars, same width and aligned) and one full-height shortcut column on the right (runs from the end-box row down past the calendars, separated by a vertical rule, scrolls when crowded). **Column width is fixed to fit the longest short English label** (two Chinese characters sit centered), its height exactly matches the left calendar zone, and extra items scroll inside the column without growing the popup; button text is centered. Shortcut buttons (`size=\"sm\"`) and both end boxes (`size=\"md\"`) **reuse the core `Button`** (active via the `color` axis) — no local skin, corner radius matches the rest of the kit; labels come from the caller, and a `{ zh, en }` object switches with `setLocale` (no built-in copy). `expr` uses the Grafana / Elasticsearch date math subset — `now/d` today, `now-1d/d` yesterday, `now/w` this week, `now-1w/w` last week, `now/M` this month, `now-1M/M` last month, `now/Q` this quarter, `now-1Q/Q` last quarter, `now/y` this year, `now-1y/y` last year (`Q` quarter, `M` month, `m` minute); `expr: null` clears both ends. A click only fills the draft inside the popup and keeps it open, so both ends and the calendars visibly jump together; **`onChange` fires on Confirm** (dismiss without confirming and the trigger stays as it was). The active state is pure value comparison against each preset’s resolved range: matches light up, no match leaves the whole column unlit (no \"Custom\" item). Ranges are recomputed against the current day on every render; no state is kept."
      },
      {
        "zh": "`value` 永远只放具体日期：短词只是「怎么算出这两个日期」的配方，不进值（与 Ant Design `presets` / MUI X `shortcuts` 同口径），因此不存在「这是时间点还是相对表达式」的字符串歧义。`width` 覆盖**整个触发器**（数字按 px、字符串按 CSS 长度原样），直接盖掉按 precision 写死的默认宽，核心不换算；两个日期区仍平分，过窄自动省略。不传 `presets` 就没有右侧快捷列与竖线；不传 `width` 时触发器仍按 precision 走默认宽。两个端框现已统一到核心 `Button` 皮肤，range 弹层外观与全站一致。",
        "en": "`value` always carries concrete dates only: the short expression is merely the recipe for computing those two dates and never enters the value (same shape as Ant Design `presets` / MUI X `shortcuts`), so there is no string ambiguity between an instant and a relative expression. `width` sizes the **whole trigger** (number = px, string = CSS length verbatim), overriding the precision-derived default with no conversion in core; the two date zones stay equally split and elide when too narrow. Without `presets` there is no shortcut column or rule; without `width` the trigger keeps its precision-derived default. Both end boxes now use the core `Button` skin, so the range popup matches the rest of the kit."
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
          },
          {
            "name": "presets",
            "type": "DateTimePreset[]（{ label: string | { zh, en }; expr: string | null }）",
            "def": "—",
            "desc": {
              "zh": "range 专用的弹层右侧竖列；列高严格等于左侧日历区，档位多了在列内滚动；label 给双语对象即随 setLocale 切换，**英文建议缩写**（如 `This Q`）以免撑宽弹层；expr 走 date math 子集（Q 季 / y 年），null = 清空；不传 = 无入口",
              "en": "Range-only right-hand shortcut column; its height equals the left calendar zone and extra items scroll inside the column; a bilingual label follows setLocale — **prefer short English labels** (e.g. `This Q`) so the popup stays narrow; expr uses the date math subset (Q quarter / y year), null clears; omitted = no entry"
            }
          },
          {
            "name": "width",
            "type": "number | string",
            "def": "按 precision 的默认宽",
            "desc": {
              "zh": "整个触发器总宽：数字 px / 字符串原样；覆盖默认宽、不做换算，过窄省略",
              "en": "Total trigger width: number = px, string = verbatim CSS length; overrides the default with no conversion, elides when narrow"
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
  "surface": {
    "id": "surface",
    "heading": {
      "zh": "Surface（区域容器）",
      "en": "Surface (region container)"
    },
    "prose": [
      {
        "zh": "纯框容器：底 / 边框 / 圆角 / 内距四根轴，无业务语义。圆角固定 12（与 Button 同档），是全站容器圆角的唯一来源——要「一块一块的面」就用它，不要再自己写 border + border-radius。",
        "en": "A plain frame: background / border / radius / padding, nothing else. Radius is fixed at 12 (same tier as Button) and is the single source of container radii — use it instead of hand-rolling border + border-radius."
      }
    ],
    "api": [
      {
        "id": "ui-surface",
        "rows": [
          {
            "name": "tone",
            "type": "'plain' | 'raised' | 'sunken' | 'subtle'",
            "def": "'plain'",
            "desc": {
              "zh": "底色档（surface-1 / raised / sunken / chip 底）",
              "en": "Background tier (surface-1 / raised / sunken / chip)"
            }
          },
          {
            "name": "border",
            "type": "true | 'faint' | 'none' | 'dashed'",
            "def": "true",
            "desc": {
              "zh": "none 保留 1px 透明占位，换外观不跳高；dashed 为虚线占位框",
              "en": "'none' keeps a transparent 1px placeholder so heights stay stable; 'dashed' draws a dashed placeholder frame"
            }
          },
          {
            "name": "radius",
            "type": "'sm' | 'md' | 'lg' | 'none'",
            "def": "'md'",
            "desc": {
              "zh": "md = 12，与控件同档",
              "en": "md = 12, same tier as controls"
            }
          },
          {
            "name": "padding",
            "type": "'none' | 'sm' | 'md' | 'lg'",
            "def": "'md'",
            "desc": {
              "zh": "内距档：0 / 8 / 12 / 16",
              "en": "Inner padding tiers: 0 / 8 / 12 / 16"
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
        "id": "ui-surface-example",
        "lang": "tsx",
        "src": "import { Surface, Card } from 'dsh-plugin-core/ui'\n\n// 纯框：底 / 边框 / 圆角 / 内距四根轴。圆角固定 12，与 Button 同档。\nh(Surface, { tone: 'sunken', padding: 'md' }, h('div', null, '任意内容'))\n\n// 下游自己建「一块面」时用它，不要再写 border + border-radius：\nh(Surface, { border: 'faint', padding: 'lg' }, h(Card, null, '框里再放卡'))\n\n// 虚线占位框也走它，不要自己写 1px dashed：\nh(Surface, { tone: 'sunken', border: 'dashed', padding: 'lg' }, '还没做的东西')"
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
        "zh": "两种外观，两个组件：Card = Surface 外框（底 + 1px 边框 + 圆角 12）+ 色条（方位与间距可配）；StripCard = 同色浅底 + 占位边框 + 方角 + 通高左缘色条。",
        "en": "Two appearances, two components: Card = Surface frame (background + 1px border + 12px radius) + rail (side and spacing configurable); StripCard = same-hue light background + placeholder border + square corners + full-height left rail."
      },
      {
        "zh": "头部整体垂直居中，`action` 里裸放一个元素即居中。颜色全走 token，明暗跟随宿主。",
        "en": "The header centers vertically as a whole; drop a bare element into `action` and it centers. Colors come from tokens, so light/dark follows the host."
      },
      {
        "zh": "`hoverable` 开启后悬停变色、同时把光标改成 `pointer`，统一吃 `--dshpc-card-hover`（亮 7% 蓝 / 暗 13% 蓝），默认关；`filled` 切底色，默认有底（Card = surface-1，StripCard = accent 浅底），`false` 时底透明但边框仍在。两根轴都只改 `--surface-bg`，插件不用再自己写 `:hover` 规则。",
        "en": "`hoverable` (default off) changes the fill on hover and switches the cursor to `pointer`, using `--dshpc-card-hover` (7% blue light / 13% blue dark). `filled` (default on) controls the background — Card uses surface-1, StripCard the accent tint; `false` makes it transparent but keeps the border. Both axes only rewrite `--surface-bg`, so plugins no longer need their own `:hover` rules."
      },
      {
        "zh": "展开的卡片用 `hoverScope` 选作用域，默认 `'head'`：根节点零内距并统一裁圆角，`__body` 作为「上面那一整块」独立承担内距、边到边变色；展开态不改内距，上下两圈留白对称，两块之间的间隔也属于头部区、跟着一起变色；`__panel` 是它的兄弟节点，不铺背景、不参与 hover，鼠标在展开区里操作时整卡都不触发。StripCard 的通高色条相对根节点定位，展开后仍贯穿整卡（包括展开区）。想要整卡含展开区一起变色，才显式传 `'card'`。**展开内容必须放进 `panel`**（`children` 属于头部区），核心才有分区信号。",
        "en": "For expandable cards, `hoverScope` selects the scope. The default `'head'` gives the root zero padding and clips the radius, while `__body` — the header block owning all padding — changes color edge to edge; expanding keeps its top and bottom padding symmetric, so the gap between the two blocks changes color too. `__panel` is a sibling with no background and never hovered, so operating inside the expanded area triggers nothing. The StripCard rail is positioned against the root and stays full-height across the expanded area. Pass `'card'` explicitly to include it. **Expandable content must go into `panel`**; `children` belongs to the header block."
      }
    ],
    "api": [
      {
        "id": "ui-card",
        "rows": [
          {
            "name": "accent",
            "type": "13 档 or 任意 CSS 色值（business/success/warning/danger/neutral + 扩展 purple/pink/cyan/teal/orange/indigo/rose/slate）",
            "def": "'business'",
            "desc": {
              "zh": "档位映射到 design 的 token；也可传 '#f59e0b' 这类自定义值",
              "en": "Tiers map to design tokens; also accepts custom values like '#f59e0b'"
            }
          },
          {
            "name": "bar",
            "type": "'left' | 'right' | 'top' | 'bottom' + size / inset / gap / length",
            "def": "side 'left'",
            "desc": {
              "zh": "色条方位与几何：inset = 距卡片边缘、gap = 距内容、length = 上下方位时的条长（默认跟内容同宽）",
              "en": "Rail side and geometry: inset = distance to card edge, gap = distance to content, length = rail length for top/bottom (defaults to content width)"
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
              "zh": "展开后才显示的额外内容；必须放这里，核心才能把展开区与头部区分开",
              "en": "Extra content shown only when expanded; must live here so the core can separate it from the header"
            }
          },
          {
            "name": "hoverable",
            "type": "boolean",
            "def": "'false'",
            "desc": {
              "zh": "悬停变色 + 光标变 pointer，统一 --dshpc-card-hover；默认关",
              "en": "Hover color plus a pointer cursor, using --dshpc-card-hover; default off"
            }
          },
          {
            "name": "hoverScope",
            "type": "'head' | 'card'",
            "def": "'head'",
            "desc": {
              "zh": "'head'（默认）只让上面头部区整块边到边变色、展开区不受影响；'card' 整卡含展开区一起变色。仅 hoverable 为 true 时生效",
              "en": "'head' (default) changes only the header block and leaves the expanded area untouched; 'card' includes it. Applies only when hoverable is true"
            }
          },
          {
            "name": "filled",
            "type": "boolean",
            "def": "'true'",
            "desc": {
              "zh": "是否带底色；false 时底透明、边框仍在。默认有底（Card = surface-1 / StripCard = accent 浅底）",
              "en": "Background fill; false makes it transparent while keeping the border. Default on (Card = surface-1 / StripCard = accent tint)"
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
        "src": "import { Card, Chip, StripCard } from 'dsh-plugin-core/ui'\n\nh(Card, {\n  accent: 'warning',\n  bar: { side: 'left', inset: 12, gap: 12 },   // 色条可放 left / right / top / bottom\n  hoverable: true,                             // 头部区整块悬停变色（默认关）\n  action: h(Button, { size: 'sm', variant: 'ghost' }, '跳过'),\n},\n  h('div', null, '标题'),\n  h(Chip, null, '#npm'),\n)\n\nh(StripCard, {\n  accent: 'success',\n  hoverable: true, filled: false,              // 底色关掉 = 透明（默认有底）\n  // hoverScope 默认 'head'：只有上面头部区变色，展开区完全不受影响\n  // 要连展开区一起变色才显式写 hoverScope: 'card'\n  expanded: open, onToggle: () => setOpen(!open),\n  panel: h('div', null, '展开详情'),           // 展开内容放 panel，别塞进 children\n}, h('div', null, '标题 + 元信息'))"
      }
    ]
  },
  "list-row": {
    "id": "list-row",
    "heading": {
      "zh": "ListRow（一行一条）",
      "en": "ListRow (one item per line)"
    },
    "prose": [
      {
        "zh": "一行代表一个可选 / 可点的对象（文件、任务、候选项）：常态就带底色，鼠标移上去按 Button 灰色档加深一档；选中换成 slate 的极浅蓝灰单色背景，不描边、不画竖条。左主内容、右侧一组小操作，点右侧不连带触发整行。底 / 边 / 圆角复用 Surface，颜色全走 token，插件不写第二套皮肤。",
        "en": "One line per selectable / clickable object (file, task, candidate): a visible background at rest that darkens one step on hover using the same grey tokens as Button; selected rows swap to a single pale slate-blue-grey background — no border, no rail. Main content on the left, a group of small actions on the right that never trigger the row. Background / border / radius come from Surface and colors from tokens, so plugins write no second skin."
      },
      {
        "zh": "默认中号（min-height 28，与 Button md 同档），不设 size 轴；四边内距 8px 等距；默认字号 13px / 行高 20px 由核心给（`--dshpc-font-md` / `--dshpc-line-md`，与 Table 同档），调用方不必自己设、可用内联 style 覆盖。`bordered` 切带边 / 不带边，无边档仍是 1px 透明占位，两档同高。`selected` 只改外观，状态由调用方管。",
        "en": "One medium tier by default (min-height 28, same as Button md); no size axis; equal 8px padding on all four sides. The core sets a default 13px / 20px type scale (`--dshpc-font-md` / `--dshpc-line-md`, same as Table) — callers need not set it and can override it inline. `bordered` switches the edge on/off — the borderless tier keeps a transparent 1px placeholder so heights stay equal. `selected` only changes appearance; the caller owns the state."
      },
      {
        "zh": "`hoverable` 默认跟随「整行可点」（可点行开、纯展示行关，与 Table 的 hover 口径一致），可显式开关；hover 取 `--dshpc-listrow-hover-bg`，只比常态深一点点（亮 9% 黑 / 暗 10% 白），不会把整行内容和文字对比度一起改掉；选中取 `--dshpc-listrow-selected-bg`（由 `--dshpc-slate` 派生，亮色 14% / 暗色 26% 两档，暗色不发黑）。整行不是 `<button>`：调用方要往里放 Button / IconButton，嵌 button 是非法 HTML；键盘走 Enter / Space，右侧操作槽挡住冒泡。",
        "en": "`hoverable` follows row clickability by default (on for clickable rows, off for static ones, matching Table), and can be forced on/off. Hover uses `--dshpc-listrow-hover-bg`, only a touch deeper than the resting row (9% black light / 10% white dark), so it does not repaint the whole row or shift text contrast; selected uses `--dshpc-listrow-selected-bg` (derived from `--dshpc-slate`, 14% light / 26% dark, so the dark theme never goes black). The row is not a `<button>`: callers put Buttons inside it and nested buttons are invalid HTML. Keyboard uses Enter / Space; the actions slot stops propagation."
      }
    ],
    "api": [
      {
        "id": "ui-list-row",
        "rows": [
          {
            "name": "children",
            "type": "ReactNode",
            "def": "—",
            "desc": {
              "zh": "主内容：图标 / 名字 / 标签 / 左右分区自己排",
              "en": "Main content: icons, labels, tags, left/right layout are yours"
            }
          },
          {
            "name": "actions",
            "type": "ReactNode",
            "def": "—",
            "desc": {
              "zh": "右侧操作槽；核心挡住事件冒泡，不连带整行",
              "en": "Right-side actions; the core stops propagation so the row is not triggered"
            }
          },
          {
            "name": "onClick",
            "type": "() => void",
            "def": "—",
            "desc": {
              "zh": "给了才让整行可点（role=button / tabIndex / Enter·Space）",
              "en": "Only makes the row clickable when provided (role=button / tabIndex / Enter·Space)"
            }
          },
          {
            "name": "selected",
            "type": "boolean",
            "def": "'false'",
            "desc": {
              "zh": "选中态：slate 极浅蓝灰单色背景（明暗各一档），不描边 / 不画竖条，压在 hover 之上",
              "en": "Selected: a single pale slate-blue-grey background (separate light / dark tiers), no border or rail, above hover"
            }
          },
          {
            "name": "bordered",
            "type": "boolean",
            "def": "'false'",
            "desc": {
              "zh": "带边 / 不带边，两档同高",
              "en": "Bordered / borderless; both tiers share the same height"
            }
          },
          {
            "name": "hoverable",
            "type": "boolean",
            "def": "自动",
            "desc": {
              "zh": "hover 灰态加深开关；默认跟随整行可点",
              "en": "Grey-state hover switch; defaults to row clickability"
            }
          },
          {
            "name": "className / style",
            "type": "—",
            "def": "—",
            "desc": {
              "zh": "追加类 / 样式，只允许补布局",
              "en": "Append class / style, layout patches only"
            }
          }
        ]
      }
    ],
    "code": [
      {
        "id": "ui-listrow-example",
        "lang": "tsx",
        "src": "import { ListRow, Button, Chip } from 'dsh-plugin-core/ui'\n\n// 一行一条：常态带底，点整行打开 / 选中，右侧小操作不连带触发整行\nh(ListRow, {\n  onClick: () => openFile(entry),\n  selected: entry.path === currentPath,\n  actions: h(Button, {\n    size: 'sm', variant: 'ghost', onClick: () => removeEntry(entry),\n  }, '移除'),\n},\n  h('div', { style: { display: 'flex', alignItems: 'center', gap: 8 } },\n    h(Chip, null, 'TS'),\n    h('span', null, entry.name),\n  ),\n)\n\n// 带边 / 关掉 hover / 纯展示（不可点）\nh(ListRow, { bordered: true, hoverable: false }, '只读的一行')"
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
    ],
    "api": [
      {
        "id": "ui-chip",
        "rows": [
          {
            "name": "tone",
            "type": "'neutral' | 'business' | 'success' | 'warning' | 'danger' | 'purple' | 'pink' | 'cyan' | 'teal' | 'orange' | 'indigo' | 'rose' | 'slate'",
            "def": "'neutral'",
            "desc": {
              "zh": "语义色（neutral 灰面，其余为实心信号面；扩展八色同上）",
              "en": "Semantic color (neutral grey; others are solid signal faces; eight extended tiers as above)"
            }
          },
          {
            "name": "size",
            "type": "'sm' | 'md' | 'xs'",
            "def": "'sm'",
            "desc": {
              "zh": "尺寸档",
              "en": "Size tier"
            }
          },
          {
            "name": "width",
            "type": "number | string",
            "def": "—",
            "desc": {
              "zh": "固定宽（px 或任意 CSS 宽度）；与 minWidth / maxWidth 互斥，一旦设定后两者自动失效",
              "en": "Fixed width (px or any CSS width); mutually exclusive with minWidth/maxWidth — once set, the other two are ignored"
            }
          },
          {
            "name": "minWidth",
            "type": "number | string",
            "def": "—",
            "desc": {
              "zh": "最小宽：width 未设时生效，内容不足此宽时以它为准",
              "en": "Minimum width: applies only when width is unset; content shorter than this still takes this width"
            }
          },
          {
            "name": "maxWidth",
            "type": "number | string",
            "def": "—",
            "desc": {
              "zh": "最大宽：width 未设时生效，文字超出折叠成省略号，hover 以跑马灯展开全名",
              "en": "Maximum width: applies only when width is unset; overflowing text collapses to an ellipsis and marquees on hover"
            }
          },
          {
            "name": "onClick",
            "type": "() => void",
            "def": "—",
            "desc": {
              "zh": "传了才渲染成 <button>（可点），否则是 <span>",
              "en": "When given, renders as <button> (clickable); otherwise a <span>"
            }
          },
          {
            "name": "className",
            "type": "string",
            "def": "—",
            "desc": {
              "zh": "追加 class（只允许补布局，不许覆盖皮肤）",
              "en": "Extra class (layout only, never overrides the skin)"
            }
          },
          {
            "name": "children",
            "type": "ReactNode",
            "def": "—",
            "desc": {
              "zh": "标签内容（maxWidth + 纯文字时自动接跑马灯）",
              "en": "Tag content (auto-marqueed when maxWidth + plain text)"
            }
          }
        ]
      }
    ]
  },
  "flip-text": {
    "id": "flip-text",
    "heading": {
      "zh": "FlipText（翻牌文本）",
      "en": "FlipText"
    },
    "prose": [
      {
        "zh": "一行文字，换一句翻一次牌：旧的上移出、新的从下进。**只给文本，动效自己放** —— `text` 变了就翻，没变不动（同一句重复设置不重播）。**空串 = 没有文案**：不渲染、不占位，同一块地方复用时靠它把上一句清干净；清空后再给值是直接出现，不从下方翻上来。",
        "en": "One line of text that flips on every change: the old line slides up and out, the new one comes in from below. **Give it text; it owns the motion** — a changed `text` flips, an unchanged one does nothing (setting the same line twice does not replay). **An empty string means no line at all**: nothing rendered, no space taken, which is how a reused spot gets cleared; the next value then appears outright instead of sliding in."
      },
      {
        "zh": "溢出与 MarqueeText 同一套：单行、放不下三点省略，鼠标移上去跑马灯（复用同一个实现，不重复测宽）。高度恒为一行，永不换行。",
        "en": "Overflow behaves exactly like MarqueeText: one line, an ellipsis when it does not fit, marquee on hover (same implementation, no second width measurement). Height stays at one line and it never wraps."
      },
      {
        "zh": "宽度三档同 Button / Chip：`width` 优先，`width` 未设时 `minWidth` / `maxWidth` 生效；三者都不传 = 随父容器（flex 子项自然伸缩，弹窗底栏就是这么用的）。要放进弹窗底栏左侧**不要自己包**，直接用 `Modal` / `ConfirmModal` / `AlertModal` / `SideSheet` 的 `notice`。",
        "en": "Widths follow Button / Chip: `width` wins; `minWidth` / `maxWidth` apply only when it is unset; none of the three means \"follow the parent\" (a flex child stretches naturally — that is how the dialog footer uses it). To put it on the left of a dialog footer, use the `notice` prop on `Modal` / `ConfirmModal` / `AlertModal` / `SideSheet` rather than wrapping it yourself."
      },
      {
        "zh": "`sweep` = 常驻扫光：一道斜光每 1.5s 从文字上扫过，扫到的字提亮，甚至文案一直不变也看得出「还在干活」。**默认关**；`Modal` / `SideSheet` 的 `notice` 默认打开（确认框与过程提示的场景）。光只落在字形上（`background-clip:text`），不会在底栏的空白区显出一条白光；`prefers-reduced-motion` 下与翻牌一起关掉。",
        "en": "`sweep` is a persistent sheen: a slanted highlight crosses the text every 1.5s, brightening the characters it passes, so an unchanged line still reads as \"still working\". **Off by default**; the `notice` prop on `Modal` / `SideSheet` turns it on (confirm dialogs and progress hints). The light is clipped to the glyphs (`background-clip:text`), so it never shows as a white bar across the empty part of a footer, and it is turned off together with the flip under `prefers-reduced-motion`."
      }
    ],
    "api": [
      {
        "id": "ui-flip-text",
        "rows": [
          {
            "name": "text",
            "type": "string",
            "def": "—（必填）",
            "desc": {
              "zh": "当前文本；变了就翻一次牌。**空串 = 没有文案**：不渲染、不占位（同一块地方复用靠它清场）；清空后再给值是直接出现，不从下方翻上来",
              "en": "Current text; a change flips it once. **An empty string means no line at all**: nothing rendered, no space taken (that is how a reused spot is cleared); the next value appears outright instead of sliding in"
            }
          },
          {
            "name": "width",
            "type": "number | string",
            "def": "—",
            "desc": {
              "zh": "固定宽（px 或任意 CSS 宽度）；与 minWidth / maxWidth 互斥，一旦设定后两者自动失效",
              "en": "Fixed width (px or any CSS width); mutually exclusive with minWidth/maxWidth — once set, the other two are ignored"
            }
          },
          {
            "name": "minWidth",
            "type": "number | string",
            "def": "—",
            "desc": {
              "zh": "最小宽：width 未设时生效",
              "en": "Minimum width: applies only when width is unset"
            }
          },
          {
            "name": "maxWidth",
            "type": "number | string",
            "def": "—",
            "desc": {
              "zh": "最大宽：width 未设时生效，文字超出折叠成省略号，hover 以跑马灯展开",
              "en": "Maximum width: applies only when width is unset; overflowing text collapses to an ellipsis and marquees on hover"
            }
          },
          {
            "name": "sweep",
            "type": "boolean",
            "def": "false",
            "desc": {
              "zh": "常驻扫光：每 1.5s 一道斜光扫过文字，文案不变也能看出在动。`Modal` / `SideSheet` 的 `notice` 默认传 true",
              "en": "Persistent sheen: a slanted highlight crosses the text every 1.5s so a static line still reads as active. The `notice` prop on `Modal` / `SideSheet` passes true by default"
            }
          },
          {
            "name": "className",
            "type": "string",
            "def": "—",
            "desc": {
              "zh": "追加 class（只补字体 / 颜色这类皮肤，布局归组件自己）",
              "en": "Extra class (font / colour skin only; layout belongs to the component)"
            }
          }
        ]
      }
    ],
    "code": [
      {
        "id": "ui-flip-text-example",
        "lang": "tsx",
        "src": "import { FlipText } from 'dsh-plugin-core/ui'\n\n// 换文案 = 改 text，动效自己放（旧的上移出、新的从下进）\nconst [step, setStep] = useState('正在扫描工作区…')\nh(FlipText, { text: step })\n\n// 溢出：放不下三点省略，hover 跑马灯\nh(FlipText, { text: step, maxWidth: 220 })\n\n// 宽度三档：width 优先，其次 minWidth / maxWidth\nh(FlipText, { text: step, width: 200 })\n\n// 常驻扫光：文字不变也在动（默认关；弹窗 / 抽屉底栏的 notice 默认开）\nh(FlipText, { text: step, sweep: true })"
      }
    ]
  },
  "table": {
    "id": "table",
    "heading": {
      "zh": "Table（表格）",
      "en": "Table"
    },
    "prose": [
      {
        "zh": "第一档外观 Plain：轻量表格 —— 表头默认是中性灰底（`--dshpc-surface-sunken`，与通栏同一层灰）+ 下边线，双行分组表头也清楚；通栏标题反而用更实的表面色（亮 #f6f8fa / 暗 #151b23）；数据行只保留极淡底线，**默认没有一条竖线**；可点行悬浮是极淡的中性灰（亮色 ≈1.5% 淡黑、暗色 ≈3% 淡白），选中行淡蓝底 + 左侧 3px 蓝条。",
        "en": "First skin, Plain: a lightweight table — the header defaults to a neutral grey (--dshpc-surface-sunken, the same wash the banner uses) with a bottom rule that keeps two-row grouped headers legible, while the banner title uses a firmer surface tone (light #f6f8fa / dark #151b23); data rows keep only a very faint bottom line and, by default, **no vertical lines at all**; clickable rows hover to an extremely faint neutral grey (a ~1.5% light black wash in light mode, a ~3% light white wash in dark), and the selected row gets a blue tint plus a 3px blue bar on the left."
      },
      {
        "zh": "三个表级开关：density 三档（compact / default / comfortable，改行高与水平内距 —— default 行高 44 / 48、水平内距 12px，compact 36 / 36 与 8px，comfortable 52 / 60 与 16px）、striped（偶数行淡底斑马纹）、borders（**默认 y**：只留上下两条、没有左右边；all 四边 = 带全框；x 只留左右两条；none 全不要）。",
        "en": "Three table-level switches: `density` (compact / default / comfortable — row height and horizontal padding; default is 44 / 48 rows with 12px padding, compact 36 / 36 with 8px, comfortable 52 / 60 with 16px), `striped` (a faint tint on even rows), and `borders` (**y by default**: top and bottom only, no left/right edges; all for a full frame; x for left+right only; none for nothing)."
      },
      {
        "zh": "列级配置：align 居中 / 右对齐，divider=true 才在该列左缘画竖线（**默认不画**，首列恒不画 —— 「列间不要线」是默认值，要线才开；分组列自己不写时跟随它第一个子列，组头与子列的竖线才连成一条），padding 单独调该列水平内距（px），headerTone 给该列表头换语义色（business / success / warning / danger / 扩展八色，全部映射 token，暗色自动跟随）。",
        "en": "Per-column config: `align` for centring / right alignment; `divider=true` draws the divider on that column’s left edge (**off by default**, and the first column never draws one — “no lines between columns” is the default, opt in for lines; a group column that omits it follows its first child, so the header and child dividers line up); `padding` adjusts that column’s horizontal padding in px; `headerTone` recolours that column’s header from the semantic palette (business / success / warning / danger and the eight extended tones — all mapped to tokens, so dark mode follows automatically)."
      },
      {
        "zh": "数据驱动、组件不取数：columns 可嵌套 children 形成多行分组表头（colSpan / rowSpan 由组件算）；rows 是 { key, cells }，cells 按叶子列 key 取内容。单元格有两种写法 —— 直接给任意 ReactNode（头像 + 姓名 + 编号这种多内容排版、状态胶囊、行尾按钮都由调用方塞），或给 { content, colSpan, rowSpan, align } 对象做跨列 / 跨行。跨行时下一行不要给该列 key（缺 key = 该格不渲染、让位给上一行；要空单元格请显式传 null）。传 onRowClick 才可点。",
        "en": "Data-driven, never self-fetching: columns may nest children for a multi-row grouped header (colSpan / rowSpan are computed); rows are { key, cells } looked up by leaf-column key. A cell is either any ReactNode (multi-line layouts such as avatar + name + ID, status pills, row-end buttons are all the caller’s) or a { content, colSpan, rowSpan, align } object for column/row spanning. When spanning rows, the next row must omit that column’s key (a missing key renders nothing and yields the slot to the previous row; pass null explicitly for an empty cell). Rows are clickable only with onRowClick."
      },
      {
        "zh": "通栏分组：传 groups（与 rows 二选一）就能在一个表格里放下多个板块 —— 每组渲染成「一行横跨所有列的通栏标题 → 这一组自己的表头 → 这一组的任务行」，组与组之间用一条实线隔开。典型场景是多个工作区的任务：仍是一张表，不会拆成两张、也不会出现两个互不相干的表头挤在一起；分组模式下没有 <thead>，表头跟着每组走。组内任务行与普通表一样，给 `selectedKeys` / `onRowClick` 就有选中与悬浮（不给就是静态表）。通栏标题由 `SectionHead` 装进通栏并带上它的固定标签（4px 圆头短竖线）：颜色用 `groupAccent` 换（内置语义色名映射 token、也可直接给 CSS 色值），传 `false` 整条不画。",
        "en": "Banner groups: pass groups (instead of rows) to hold several sections in one table — each group renders as a full-width banner row spanning every column → that group’s own header → that group’s rows, with a solid rule between groups. The canonical case is tasks across several workspaces: it stays one table rather than two tables with unrelated headers. Group mode has no thead; the header travels with each group. Rows inside a group behave like ordinary rows: pass `selectedKeys` / `onRowClick` for selection and hover (omit them for a static table). The banner title is rendered through `SectionHead`, carrying its fixed 4px rounded bar: recolour it with `groupAccent` (a built-in semantic name mapped to tokens, or a raw CSS colour), or pass `false` to drop it entirely."
      },
      {
        "zh": "外观分档 = 分组件 + 分文件，没有 variant：Table 只 import 自己那份皮肤 CSS；后续 TableGrid（网格线）/ TableZebra（斑马纹）是同族独立组件，各自 import 各自皮肤。消费方引哪个就只打包哪个 —— 引一个表格不会把另一档的 CSS 也带进包里。",
        "en": "Skins are separate components and separate files — no variant: Table imports only its own skin CSS; future TableGrid (grid lines) / TableZebra (zebra stripes) are sibling components importing their own skins. Importing one packs only that one — choosing a table never drags the other skin into the bundle."
      },
      {
        "zh": "边界：不负责取数 / 排序 / 虚拟滚动；横向滚动容器与圆角裁剪归调用方；表头不做吸顶（分组表头是多行，统一 top:0 会在滚动时互相盖住）。分页可选：给 `pagination` 就让表格自己切片并在表下摆页码（详见 Pagination 一节），不给就完全不分页。没有数据时显示内置空态（emptyText 可覆盖）。加载态两种，都只放图标、不显示文案：首屏一条数据都没有时用 `loading`（居中三块加载动画、最大号，较高占位，不遮挡已有数据），已有数据翻下一页时用 `loadingMore`（底部一行、中号三块动画；整行通栏，与上方数据行之间补一条实线，左右两条在 borders=all / x 时由表级外框兜住、y / none 本来就没有，且 y / none 时状态行下方那条表底线也一起去掉，只留上方一条实线）；滚动加载由 `onLoadMore` 本身当开关 —— 传了就监听底部、滚到附近自动调一次，到底（`hasMore: false`）显示「没有更多数据」（`noMoreText` 换文案 / `false` 不渲染）。滚动加载与 `pagination` 互斥；`groups` 模式可用，底部状态行与哨兵排在最后一组之后。",
        "en": "Boundaries: no fetching / sorting / virtual scrolling; the horizontal scroll container and rounded clipping are the caller’s; headers do not stick (the grouped header spans multiple rows, and a single top:0 would overlap itself while scrolling). Paging is optional: pass `pagination` and the table slices rows itself and renders the pager underneath (see the Pagination section); omit it and nothing pages. With no rows, a built-in empty state shows (override with emptyText). Two loading states, icon only with no visible copy: `loading` for a first load with no rows at all (centred three-block loader at the largest size, a taller placeholder that never covers existing rows), and `loadingMore` when appending the next page (one full-width bottom row with the middle-size three-block loader; a solid rule is added above it, while the left/right edges come from the table frame when borders=all / x and are absent for y / none — and for y / none the bottom table rule under the status row is dropped too, so only the rule above it remains). Scroll loading uses `onLoadMore` itself as the switch: pass it and the table watches the bottom and calls it once when you get near; at the end (`hasMore: false`) it shows “No more data” (`noMoreText` to change the copy / `false` to render nothing). Scroll loading is mutually exclusive with `pagination`; it works in `groups` mode, with the status row and sentinel placed after the last group."
      }
    ],
    "api": [
      {
        "id": "ui-table",
        "rows": [
          {
            "name": "columns",
            "type": "TableColumn[]",
            "def": "—",
            "required": "必填",
            "desc": {
              "zh": "列定义；children 非空即分组表头（自动算 colSpan / rowSpan），叶子 key 用来取单元格；width 数字按 px；align 对齐；divider=true 才画该列左竖线（默认不画）；padding 该列水平内距（px）；headerTone 该列表头语义色",
              "en": "Column definitions; non-empty children makes a group header (colSpan / rowSpan computed); leaf keys select cells; numeric width means px; align sets alignment; divider=true draws that column’s left divider (off by default); padding sets its horizontal padding (px); headerTone recolours its header"
            }
          },
          {
            "name": "rows",
            "type": "TableRow[]",
            "def": "—",
            "desc": {
              "zh": "行数据 { key, cells }（与 groups 二选一）：key 兼作选中标识与 React key；cells 按叶子列 key 给内容（ReactNode 或 { content, colSpan, rowSpan, align }）；缺 key = 不渲染、给上一行 rowSpan 让位",
              "en": "Row data { key, cells } (either this or groups): key doubles as selection id and React key; cells map leaf-column key to content (ReactNode or { content, colSpan, rowSpan, align }); a missing key renders nothing and yields to the previous row’s rowSpan"
            }
          },
          {
            "name": "groups",
            "type": "TableGroup[]",
            "def": "—",
            "desc": {
              "zh": "分组数据 { key, title, rows }（与 rows 二选一，传了就忽略 rows）：每组 = 一行横跨全部列的通栏标题 + 自己的表头 + 自己的数据行，多组连续排布、组间一条实线；用于「一个表格展示多个工作区 / 板块」",
              "en": "Group data { key, title, rows } (instead of rows; when given, rows is ignored): each group is a banner row spanning every column + its own header + its own rows, with groups stacked and separated by a solid rule — for showing several workspaces / sections in one table"
            }
          },
          {
            "name": "groupAccent",
            "type": "SectionHeadAccent | false",
            "def": "'default'",
            "desc": {
              "zh": "通栏标题前固定标签（4px 圆头短竖线，由 SectionHead 绘制）的颜色（只对 groups 生效）：内置语义色名映射 token，也可直接给 CSS 色值；不传 / default = 主题默认（浅色深灰、深色浅灰），false = 整条不画",
              "en": "Colour of the fixed bar before each banner title (4px rounded, drawn by SectionHead; groups only): a built-in semantic name maps to tokens, or pass any CSS colour; omitted / default = theme default (dark grey in light, light grey in dark), false = no bar"
            }
          },
          {
            "name": "density",
            "type": "'compact' | 'default' | 'comfortable'",
            "def": "'default'",
            "desc": {
              "zh": "行密度：行高与水平内距 —— default 44 / 48 与 12px，compact 36 / 36 与 8px，comfortable 52 / 60 与 16px",
              "en": "Row density: height and horizontal padding — default 44 / 48 with 12px, compact 36 / 36 with 8px, comfortable 52 / 60 with 16px"
            }
          },
          {
            "name": "striped",
            "type": "boolean",
            "def": "false",
            "desc": {
              "zh": "偶数行淡底斑马纹（hover / 选中仍优先）",
              "en": "Faint tint on even rows (hover / selection still win)"
            }
          },
          {
            "name": "borders",
            "type": "'all' | 'x' | 'y' | 'none'",
            "def": "'y'",
            "desc": {
              "zh": "外框范围：y 只上下（默认，左右没有边）/ all 四边全框 / x 只左右 / none 全不要",
              "en": "Outer border: y for top+bottom only (default, no left/right) / all for a full frame / x for left+right only / none for nothing"
            }
          },
          {
            "name": "selectedKeys",
            "type": "(string | number)[]",
            "def": "—",
            "desc": {
              "zh": "选中行 key 列表（高亮样式由皮肤决定）；有 rowSpan 跨行时，块内任一行的 key 都让整块高亮（不用调用方自己展开）",
              "en": "Keys of selected rows (the highlight is the skin’s call); with a rowSpan block, a key of any row in it highlights the whole block (no expansion needed on the caller side)"
            }
          },
          {
            "name": "onRowClick",
            "type": "(row, index) => void",
            "def": "—",
            "desc": {
              "zh": "传了行才可点：获得指针光标与 Enter / 空格激活",
              "en": "Only when given are rows interactive: pointer cursor plus Enter / Space activation"
            }
          },
          {
            "name": "emptyText",
            "type": "ReactNode",
            "def": "内置字典",
            "desc": {
              "zh": "空态文案；不传走核心字典（随 setLocale 中英切换）",
              "en": "Empty-state copy; defaults to the core dictionary (follows setLocale)"
            }
          },
          {
            "name": "pagination",
            "type": "TablePaginationConfig",
            "def": "—",
            "desc": {
              "zh": "内建分页（与 Pagination 同参数，total 可省）：不传 total = 本地切片，给了 total = 服务端分页（不切片）；groups 模式忽略本项",
              "en": "Built-in paging (same params as Pagination, total optional): omit total to slice locally; pass total for server-side paging (no slicing); ignored in groups mode"
            }
          },
          {
            "name": "loading",
            "type": "boolean",
            "def": "false",
            "desc": {
              "zh": "整表加载中（首屏一条数据都没有时用）：主体换成较高占位（居中三块加载动画，最大号，只有图标没有文案）；已有数据时不遮挡数据",
              "en": "Whole-table loading (first load with no rows): swaps the body for a taller placeholder (centred three-block loader at the largest size, icon only); never covers existing rows"
            }
          },
          {
            "name": "loadingHeight",
            "type": "number",
            "def": "160",
            "desc": {
              "zh": "整表加载占位区高度（px）",
              "en": "Height (px) of the whole-table loading placeholder"
            }
          },
          {
            "name": "loadingMore",
            "type": "boolean",
            "def": "false",
            "desc": {
              "zh": "底部「加载更多」中（已有数据、正在取下一页）：数据行下方插一行中号三块加载动画（只有图标没有文案），整行通栏并在上方补一条实线；只在给了 onLoadMore 时生效",
              "en": "Bottom “loading more” (rows exist, fetching the next page): inserts one full-width row with the middle-size three-block loader (icon only) and a solid rule above it; only effective when onLoadMore is given"
            }
          },
          {
            "name": "hasMore",
            "type": "boolean",
            "def": "true",
            "desc": {
              "zh": "是否还有下一页；false 时底部显示「没有更多数据」（noMoreText 可换，false 整行不渲染）。只在给了 onLoadMore 时生效",
              "en": "Whether another page exists; false shows “No more data” (change with noMoreText, false renders nothing). Only effective when onLoadMore is given"
            }
          },
          {
            "name": "noMoreText",
            "type": "ReactNode",
            "def": "内置字典",
            "desc": {
              "zh": "到底文案；不传走核心字典，传 false 则到底时整行不渲染",
              "en": "End-of-list copy; defaults to the core dictionary, false renders nothing at the end"
            }
          },
          {
            "name": "onLoadMore",
            "type": "() => void",
            "def": "—",
            "desc": {
              "zh": "滚动到底自动加载下一页：这个 props 本身就是开关 —— 传了就装底部哨兵并监听，不传完全不监听；加载中 / 到底不重复触发。与 pagination 互斥；groups 模式可用（状态行排在最后一组之后）",
              "en": "Auto-load the next page when scrolled near the bottom: this prop is the switch — pass it to install the sentinel and watch, omit it and nothing listens; guarded while loading or at the end. Mutually exclusive with pagination; works in groups mode (status row after the last group)"
            }
          },
          {
            "name": "ariaLabel",
            "type": "string",
            "def": "—",
            "desc": {
              "zh": "表格无障碍名（没有可见标题时请务必给）",
              "en": "Accessible name for the table (give it when there is no visible caption)"
            }
          },
          {
            "name": "translate",
            "type": "Translate",
            "def": "—",
            "desc": {
              "zh": "覆盖内置文案翻译（插件自带 i18n 时用）",
              "en": "Override built-in copy translation (for plugins with their own i18n)"
            }
          },
          {
            "name": "className / style",
            "type": "string / CSSProperties",
            "def": "—",
            "desc": {
              "zh": "只允许补布局，不许覆盖皮肤",
              "en": "Layout only; never override the skin"
            }
          }
        ]
      }
    ],
    "code": [
      {
        "id": "ui-table-example",
        "lang": "tsx",
        "src": "import { Table, Chip } from 'dsh-plugin-core/ui'\n\nconst columns = [\n  { key: 'id', title: 'Patient ID', width: 140 },\n  {\n    key: 'patient', title: 'Patient', headerTone: 'business',\n    children: [\n      // divider:true ⇒ 这一列左缘画竖线（默认不画 —— 表格默认只有横线）\n      // 分组列自己不写时跟随第一个子列 ⇒ 组头与子列的竖线连成一条\n      { key: 'name', title: 'Name', width: 200, padding: 12, divider: true },\n      { key: 'age', title: 'Age / Sex', width: 100, align: 'center', divider: true },\n    ],\n  },\n  { key: 'status', title: 'Status', width: 130, headerTone: 'success', divider: true },\n]\n\nconst rows = [{\n  key: 'S-2418',\n  cells: {\n    id: 'S-2418',\n    // 单元格可以装任意 ReactNode：头像 + 名字 + 编号的多行排版由调用方决定\n    name: h('div', null, h('strong', null, 'Chen, Wei'), h('div', null, 'MRN-88214')),\n    age: '62 / M',\n    status: h(Chip, { tone: 'success', size: 'xs' }, 'Reviewed'),\n  },\n}, {\n  // 跨列：对象写法占 id + name 两格\n  key: 'S-2420',\n  cells: { id: { content: 'S-2420 · escalated', colSpan: 2 }, age: null, status: 'Pending' },\n}]\n\nh(Table, {\n  columns, rows,\n  density: 'compact',   // compact / default / comfortable\n  striped: true,        // 偶数行淡底\n  borders: 'all',       // y 只上下（默认，无左右边）/ all 四边 / x 只左右 / none\n  selectedKeys: [picked],\n  onRowClick: (row) => setPicked(row.key),\n})\n\n// 通栏分组：一个表格里放多个工作区（groups 与 rows 二选一）\n// 每组 = 横跨全部列的通栏标题 → 这一组自己的表头 → 这一组的任务行，组间一条实线\nh(Table, {\n  columns: [\n    { key: 'task', title: 'Task', width: 260 },\n    { key: 'state', title: 'Status', width: 120, align: 'center' },\n  ],\n  groups: [\n    { key: 'ws-a', title: '工作区 A', rows: [\n      { key: 'a1', cells: { task: '修表格斑马纹', state: '进行中' } },\n    ] },\n    { key: 'ws-b', title: '工作区 B', rows: [\n      { key: 'b1', cells: { task: '补通栏文档', state: '已完成' } },\n    ] },\n  ],\n  // 通栏标题前的固定标签（短竖线）：由 SectionHead 绘制，4px 圆头、高 ≈ 字号；\n  // 默认随主题（浅色深灰 / 深色浅灰）；groupAccent 换色（内置色名或任意色值，如 '#7c3aed'），\n  // false 整条关掉。Table 只负责把标题装进通栏，样式走 SectionHead 那一份。\n  groupAccent: 'business',\n  // 组内任务行与普通表一样：给 selectedKeys / onRowClick 就有选中与悬浮\n  selectedKeys: [picked],\n  onRowClick: (row) => setPicked(row.key),\n  ariaLabel: 'Tasks by workspace',\n})\n\n// 第二档外观是另一个组件、另一份 CSS（预留）：引 TableGrid / TableZebra 时\n// 只打包它自己那份皮肤，不会把 Table 的皮肤一起带上。"
      }
    ]
  },
  "pagination": {
    "id": "pagination",
    "heading": {
      "zh": "Pagination（分页）",
      "en": "Pagination"
    },
    "prose": [
      {
        "zh": "通行口径（Ant Design / MUI / Element Plus 一致）：调用方只给 `page`（当前页，1 起）、`pageSize`（每页条数，默认 10）、`total`（总条数，不是总页数），总页数 `ceil(total / pageSize)` 与页码序列都由控件算 —— 消费方不自己算页数、不自己写渲染循环。受控组件：页码由调用方 state 持有，控件只发 `onChange(page, pageSize)`；越界的 page 会被夹回有效范围，不会渲染出空页。",
        "en": "Shared convention (Ant Design / MUI / Element Plus agree): you pass `page` (1-based current page), `pageSize` (default 10) and `total` (row count, not page count), and the control derives `ceil(total / pageSize)` plus the whole page sequence — you never compute pages or write a render loop. Fully controlled: your state owns the page; the control emits `onChange(page, pageSize)` and clamps out-of-range pages so an empty page is never rendered."
      },
      {
        "zh": "省略号窗口：首尾各固定 `boundaryCount` 页、当前页两侧各留 `siblingCount` 页（默认 1 / 1，最多 7 个位置，与 Element Plus 的 pager-count:7 等价）。间隔正好 1 页时直接显示那个页号、不画省略号（各家共同的细节，否则会出现「1 2 … 4」）。上一页 / 下一页恒在，到边界置灰而非隐藏。",
        "en": "Ellipsis window: `boundaryCount` pages pinned at each end and `siblingCount` pages around the current one (default 1 / 1 — at most 7 slots, equivalent to Element Plus pager-count:7). When the gap is exactly one page the number itself is shown instead of an ellipsis (a detail every library shares, otherwise you get “1 2 … 4”). Prev / Next are always present and grey out at the ends rather than disappearing."
      },
      {
        "zh": "四个可选能力都是开关（不传就不出现）：`pageSizeOptions` 出「每页条数」下拉（切换时页码回到第 1 页，与 antd / MUI 同口径）、`showTotal` 出总数文案（`true` 走内置字典，也可给函数自定义）、`hideOnSinglePage` 单页时整条不渲染、`simple` 只留「‹ 2 / 36 ›」。位置由 `align` 决定：left / center / right，**默认 right**。",
        "en": "Four optional bits are switches (omit them and they vanish): `pageSizeOptions` adds a rows-per-page select (changing it resets to page 1, same as antd / MUI), `showTotal` adds the total copy (`true` uses the built-in dictionary, or pass a renderer), `hideOnSinglePage` drops the whole bar when there is a single page, and `simple` keeps only “‹ 2 / 36 ›”. Placement comes from `align`: left / center / right, **right by default**."
      },
      {
        "zh": "无障碍：根节点是 `nav`（`aria-label` 默认走内置字典「分页」，可覆盖），当前页带 `aria-current=\"page\"`，每个页码按钮有「第 n 页」的可读名，上一页 / 下一页的文案与禁用态都由控件负责 —— 调用方不用补 aria。",
        "en": "Accessibility: the root is a `nav` (its `aria-label` defaults to the built-in “Pagination”, overridable), the current page carries `aria-current=\"page\"`, every page button has a readable “Page n” name, and prev/next labels plus disabled states are the control’s job — callers add no aria."
      },
      {
        "zh": "与 Table 两种接法：① 独立控件，自己摆在表格下方 / 工具栏（表格不传 `pagination`）；② 内建 —— 给 `Table` 传 `pagination`，它先按当前页切片 `rows` 再渲染，并把分页条排在表格下方（`total` 缺省 = `rows.length` 本地分页；给了 `total` 则不切片，按服务端分页只摆页码）。`groups` 通栏模式与分页互斥，传了 groups 就忽略 pagination。",
        "en": "Two ways to wire it to Table: ① standalone — place it yourself under the table or in a toolbar (Table gets no `pagination`); ② built in — pass `pagination` to Table and it slices `rows` by the current page before rendering, with the pager placed underneath (omit `total` for local paging where total = rows.length; pass `total` for server-side paging where rows are not sliced and only the pager is rendered). The `groups` banner mode is mutually exclusive: when groups are given, pagination is ignored."
      }
    ],
    "api": [
      {
        "id": "ui-pagination",
        "rows": [
          {
            "name": "page / total",
            "type": "number / number",
            "def": "—",
            "required": "必填",
            "desc": {
              "zh": "当前页（1 起，越界自动夹回）/ 总条数（不是总页数）",
              "en": "Current page (1-based, clamped) / row count (not page count)"
            }
          },
          {
            "name": "pageSize",
            "type": "number",
            "def": "10",
            "desc": {
              "zh": "每页条数；总页数由它算出来",
              "en": "Rows per page; the page count derives from it"
            }
          },
          {
            "name": "onChange",
            "type": "(page, pageSize) => void",
            "def": "—",
            "required": "必填",
            "desc": {
              "zh": "切页与切每页条数都走它；切条数时页码回到 1",
              "en": "Fires for page changes and rows-per-page changes; the latter resets to page 1"
            }
          },
          {
            "name": "align",
            "type": "'left' | 'center' | 'right'",
            "def": "'right'",
            "desc": {
              "zh": "分页条位置（默认放右边）",
              "en": "Pager placement (right by default)"
            }
          },
          {
            "name": "siblingCount / boundaryCount",
            "type": "number / number",
            "def": "1 / 1",
            "desc": {
              "zh": "当前页两侧页数 / 首尾固定页数；1/1 合计最多 7 个位置",
              "en": "Pages beside the current one / pages pinned at each end; 1/1 gives at most 7 slots"
            }
          },
          {
            "name": "pageSizeOptions",
            "type": "number[]",
            "def": "—",
            "desc": {
              "zh": "传了才出现「每页条数」下拉",
              "en": "Only then does the rows-per-page select appear"
            }
          },
          {
            "name": "showTotal",
            "type": "boolean | (total, from, to) => ReactNode",
            "def": "—",
            "desc": {
              "zh": "总数文案：不传 = 不显示（默认关），传 true 走内置字典，传函数可自定义",
              "en": "Total copy: omitted = hidden (off by default), true uses the dictionary, a renderer customises it"
            }
          },
          {
            "name": "hideOnSinglePage",
            "type": "boolean",
            "def": "false",
            "desc": {
              "zh": "只有一页时整条不渲染",
              "en": "Render nothing when there is a single page"
            }
          },
          {
            "name": "simple",
            "type": "boolean",
            "def": "false",
            "desc": {
              "zh": "简洁模式：只留「‹ 2 / 36 ›」",
              "en": "Simple mode: only “‹ 2 / 36 ›”"
            }
          },
          {
            "name": "disabled / ariaLabel / translate",
            "type": "boolean / string / Translate",
            "def": "false / 内置「分页」/ —",
            "desc": {
              "zh": "整条禁用 / 无障碍名 / 覆盖内置文案",
              "en": "Disable the bar / accessible name / override built-in copy"
            }
          },
          {
            "name": "Table · pagination",
            "type": "TablePaginationConfig",
            "def": "—",
            "desc": {
              "zh": "同上参数，total 可省：不传 = 本地切片，给了 = 服务端分页（不切片）",
              "en": "Same params, total optional: omit to slice locally, pass it for server-side paging (no slicing)"
            }
          }
        ]
      }
    ],
    "code": [
      {
        "id": "ui-pagination-example",
        "lang": "tsx",
        "src": "import { Pagination, Table } from 'dsh-plugin-core/ui'\n\n// 独立控件：只给当前页 / 每页条数 / 总条数 —— 总页数与省略窗口由控件算，\n// 消费方永远不自己算页数、也不自己渲染页码\nh(Pagination, {\n  page, pageSize, total: 86,\n  onChange: (nextPage, nextSize) => { setPage(nextPage); setPageSize(nextSize) },\n  align: 'right',                 // left / center / right（默认 right）\n  pageSizeOptions: [10, 20, 50],  // 传了才出现「每页条数」下拉\n  showTotal: true,                // 传了才出现「第 1-10 条，共 86 条」\n  siblingCount: 1,                // 当前页两侧留几页（默认 1）\n  boundaryCount: 1,               // 首尾各固定几页（默认 1；1/1 合计最多 7 个位置）\n  hideOnSinglePage: true,         // 只有一页时整条不渲染\n})\n\n// 简洁模式：只留上一页 / 下一页与「2 / 36」\nh(Pagination, { page, pageSize, total: 86, simple: true, onChange })\n\n// Table 内建：不传 total = 本地分页（rows 是全量，表格自己按当前页切片，页码排在表下）\nh(Table, {\n  columns, rows,\n  pagination: { page, pageSize, showTotal: true, onChange },\n})\n\n// 服务端分页：给了 total 就不切片（rows 只放当前页那几条），表格只负责摆页码\nh(Table, {\n  columns, rows: currentPageRows,\n  pagination: { page, pageSize, total: 86, onChange },\n})\n\n// 加载态（滚动加载，与分页二选一）：onLoadMore 本身就是开关 —— 传了就监听底部\nh(Table, {\n  columns, rows: [],\n  loading: true,                  // 首屏一条数据都没有：整表高占位（默认 160px）\n  loadingHeight: 160,\n})\n\nh(Table, {\n  columns, rows,\n  loadingMore: true,              // 正在取下一页：底部一行小转圈\n  hasMore: true,                  // false ⇒ 底部「没有更多数据」；noMoreText: false 可关\n  onLoadMore: () => fetchNextPage(),   // 滚到接近底部自动触发一次\n})"
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
        "zh": "`Loader` 是通用加载**图标**：只画图标，不带背景、不带内距、不带定位 —— 胶囊 / 圆角面这类背景、按钮内 / 标签内 / 漂浮这类位置，全归调用方自己包。两轴正交：`variant`（`ring` 默认开口弧旋转 / `blocks` 三块脉动）× `size`（`xs` 12 / `sm` 16 / `md` 24 / `lg` 32 / `xl` 48），几何画在 24×24 viewBox 里随尺寸等比缩放，描边与方块的视觉重量各档一致。颜色走 `currentColor`，跟着所在文字自动变色。默认 `aria-hidden`（纯装饰，语义由旁边文字或外层 `role=\"status\"` 承担）；要它自己播报就传 `label`。新形态加在库里（枚举 + 一段 CSS），不要在插件里另造一套转圈。",
        "en": "`Loader` is the generic loading **icon**: it draws the icon and nothing else — no background, no padding, no positioning. Pills / rounded surfaces belong to you, and so does placement (inside a button, inside a tag, floating). Two orthogonal axes: `variant` (`ring` default — a rotating open arc / `blocks` — three pulsing squares) × `size` (`xs` 12 / `sm` 16 / `md` 24 / `lg` 32 / `xl` 48). The geometry lives in a 24×24 viewBox and scales proportionally, so stroke and square weights match across tiers. Colour is `currentColor`, inheriting the surrounding text. It is `aria-hidden` by default (pure decoration — semantics come from nearby text or an outer `role=\"status\"`); pass `label` to have it announce itself. New variants go into the library (one enum value plus one CSS block), never a second spinner built in a plugin."
      },
      {
        "zh": "同族还有一个**具象** loading，边界与 `Loader` 一样（只画图形，背景与定位归调用方）：`LoaderBar` 是胶囊不定进度 —— 蓝色半截固定不动、只有它上面的细斜纹单向流动（0.55 秒走一个条纹周期），不表示任何百分比；尺寸档按**高度**给、宽固定 4:1。要停住（截图 / 打印）传 `animated={false}`。",
        "en": "One **concrete** loader in the same family, with the same boundary as `Loader` (graphics only — background and placement belong to the caller): `LoaderBar` is a capsule indeterminate bar — the blue half stays put while the thin stripes on it flow in one direction (one stripe period every 0.55s), encoding no percentage; sizes set the **height**, width is a fixed 4:1. Pass `animated={false}` to freeze it (screenshots / print)."
      },
      {
        "zh": "加载提示两种样式：`LoadingToast` 横排卡（转圈在左、文字在右，灰底与 notify 的 info 卡同色）、`LoadingBlock` 方块卡（转圈在上、文字在下，内距更大）。默认文案走内置字典「数据加载中」/「Loading」，传 `text` 覆盖。",
        "en": "Two loading styles: `LoadingToast` — a horizontal card (spinner left, text right, same grey as the notify info card) — and `LoadingBlock` — a square card (spinner above text, roomier padding). The default copy comes from the built-in dictionary (“数据加载中” / “Loading”); pass `text` to override."
      },
      {
        "zh": "命令式 `showLoading(opts)` 同样是 globalThis 单例（`Symbol.for('dsh-plugin-core/loading-host')`）：**屏幕上永远只有一张卡**，任何插件、任何屏位、多少次调用都一样 —— 后一次直接顶掉前一次，被顶掉那次的句柄再 `close()` 是空操作。**不自动消失**，收起只能自己调 `close()`。屏位默认 `bottom-center`（与 Toast 同屏位），`position` 可选 `top-left` / `top-center` / `top-right` / `center` / `bottom-left` / `bottom-center` / `bottom-right`。`mask` 默认 false（后面照常可点）；开了遮罩 `maskOpacity` 默认 0（全透明，但仍挡住点击）。要放进自己的空间（表格、卡片…）就就地渲染 `LoadingToast` / `LoadingBlock`——它们只管外观，位置与遮罩归调用方。",
        "en": "The imperative `showLoading(opts)` is another globalThis singleton (`Symbol.for('dsh-plugin-core/loading-host')`): **only one card ever exists** — across plugins, placements and call counts alike. A later call replaces the previous one, and the superseded handle’s `close()` is a no-op. It **never dismisses itself**; only your own `close()` removes it. Placement defaults to `bottom-center` (the Toast slot); `position` takes `top-left` / `top-center` / `top-right` / `center` / `bottom-left` / `bottom-center` / `bottom-right`. `mask` defaults to false (the page stays clickable); when enabled, `maskOpacity` defaults to 0 (fully transparent, still blocking clicks). To keep it inside your own area (table cell, card…), render `LoadingToast` / `LoadingBlock` in place — they are appearance only; placement and masking belong to the caller."
      },
      {
        "zh": "Modal 是自绘 overlay，不走 react-dom portal。",
        "en": "Modal is a self-drawn overlay, not a react-dom portal."
      },
      {
        "zh": "遮罩右边界读 `--dshpc-page-inset-right`（多个 dock 求和），自动让开右侧分栏，弹窗在**剩余区域**居中。弹窗无需任何遮罩参数；也别自己量分栏宽度（挂载异步，恒为 0）。",
        "en": "The mask’s right edge reads `--dshpc-page-inset-right` (summed across docks) and yields to the right column, centering the dialog in the **remaining** area. The dialog needs no mask props; never measure the column yourself (mounting is async, it always reads 0)."
      },
      {
        "zh": "命令式 `confirmModal(opts)` / `alertModal(opts)` 返回 Promise：前者 resolve `true`（确定）或 `false`（取消 / 遮罩 / Esc），后者关闭即 resolve。回调返回 Promise 时对应按钮自己转圈、整框锁死，settle 后才关。",
        "en": "The imperative `confirmModal(opts)` / `alertModal(opts)` return a Promise: the former resolves `true` (confirmed) or `false` (cancel / mask / Esc), the latter resolves on close. When a callback returns a Promise, its button spins and the dialog locks until it settles."
      },
      {
        "zh": "回调的返回值决定关不关：**只有 `false`**（同步返回，或 resolve 成 `false`）表示这次没成 —— 框留着让人重试；`true` / `undefined` / 其他返回值照常关；reject 也不关（错误打到控制台）。失败提示由回调自己出，调用点不必包 `try/catch`。",
        "en": "The callback’s return value decides whether it closes: **only `false`** (returned directly, or resolved to `false`) means it did not succeed — the dialog stays for a retry; `true` / `undefined` / anything else closes as usual; a rejection also keeps it open (the error is logged). The callback owns its failure message, so call sites need no `try/catch`."
      },
      {
        "zh": "**要「整框谁都别动」就传 `locked`**，别拿按钮 loading 顶替 —— 两者是两件事：loading 只管那一颗按钮转圈，`locked` 管整块面板。做法是**控件各自按自己的禁用态渲染**（Button / Input / Textarea / Checkbox / Segmented / Picker / 日期选择 / 分页 都会自己变灰并真的禁用，Tab 自然跳过），再盖一层**全透明**点击层兜住自绘元素与鼠标 —— 所以界面不会整体蒙灰（蒙灰会让人以为坏了），只有控件自己变灰 + 禁止手势。它**只做「或」、从不写回**任何 `disabled`：本来禁用的解锁后照样禁用，锁定期间你把某个控件改成能用 / 禁用，解锁后也照你的。声明式传 `locked={saving}` 即可；受控项，不传 = 未锁，关掉重开自然复位。命令式那两个函数的回调会收到 `ctl`（`{ setLocked(bool) }`）：`onConfirm: async (ctl) => { ctl.setLocked(true); await save(); ctl.setLocked(false) }`；框关掉之后再调是空操作。",
        "en": "**When the whole dialog must be untouchable, pass `locked`** — do not fake it with button loading: loading only spins that one button, while `locked` covers the whole panel. It works by letting **each control render its own disabled state** (Button / Input / Textarea / Checkbox / Segmented / Picker / date picker / pagination all dim themselves and are genuinely disabled, so Tab skips them), plus a **fully transparent** click layer that catches self-drawn elements and the pointer — so the surface is never dimmed as a whole (a veil reads as \"the app broke\"); only the controls dim and the cursor turns not-allowed. It **only ORs and never writes back** any `disabled`: already-disabled controls stay disabled after unlocking, and anything you flip mid-lock stays as you left it. Declaratively pass `locked={saving}`; it is controlled and stateless — omitted means unlocked, reopening starts clean. The imperative dialogs hand their callbacks a `ctl` (`{ setLocked(bool) }`): `onConfirm: async (ctl) => { ctl.setLocked(true); await save(); ctl.setLocked(false) }`. Calling it after the dialog closed is a no-op."
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
              "zh": "官方 Sonner 原味（轻量原生观感；demo 统一用 notify）。opts: `{ variant?, durationMs?, color?, onDismiss?, position? }`，6 向定位，明暗跟随宿主",
              "en": "Raw official Sonner flavour (lightweight, native look; the demo standardises on notify). opts `{ variant?, durationMs?, color?, onDismiss?, position? }`, 6-way placement, theme follows host"
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
              "zh": "宿主原生 Toast，走 `dsh-plugin-core/ui/host-toast` 子路径。opts: `{ tone?, holdMs?, actions?, onDismiss? }`",
              "en": "Host-native Toast from the `dsh-plugin-core/ui/host-toast` subpath. opts `{ tone?, holdMs?, actions?, onDismiss? }`"
            }
          },
          {
            "name": "showLoading(opts?)",
            "type": "",
            "def": "",
            "desc": {
              "zh": "全局加载提示（全局唯一一处），返回 `{ close() }`。opts: `{ text?, variant?: 'toast' | 'block', position?, mask?, maskOpacity?, translate? }`；position 默认 bottom-center",
              "en": "Global loading hint (one spot globally) returning `{ close() }`. opts `{ text?, variant?: 'toast' | 'block', position?, mask?, maskOpacity?, translate? }`; position defaults to bottom-center"
            }
          },
          {
            "name": "Loader({ variant?, size?, label?, className? })",
            "type": "",
            "def": "",
            "desc": {
              "zh": "通用加载图标：variant 两形态 × size 五档；无背景无定位，颜色走 currentColor",
              "en": "Generic loading icon: two variants × five sizes; no background or positioning, colour via currentColor"
            }
          },
          {
            "name": "LoaderBar({ size?, animated?, label?, className? })",
            "type": "",
            "def": "",
            "desc": {
              "zh": "胶囊不定进度：蓝色段固定、斜纹单向流动；尺寸按高度给，宽固定 4:1",
              "en": "Capsule indeterminate bar: the blue segment stays put while its stripes flow; sizes set height, width is a fixed 4:1"
            }
          },
          {
            "name": "LoadingToast({ text? })",
            "type": "",
            "def": "",
            "desc": {
              "zh": "就地渲染的横排加载卡（转圈在左）",
              "en": "In-place horizontal loading card (spinner left)"
            }
          },
          {
            "name": "LoadingBlock({ text? })",
            "type": "",
            "def": "",
            "desc": {
              "zh": "就地渲染的方块加载卡（转圈在上、文字在下）",
              "en": "In-place square loading card (spinner above text)"
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
            "name": "SectionHead({ icon?, title, right?, accent?, flush? })",
            "type": "",
            "def": "",
            "desc": {
              "zh": "分区标题：标签（可选，画出来的短竖线）/ icon + 标题 + 右侧控件。accent = 标签颜色（内置色名 / 任意色值 / default / false 不画）；flush = 去底边距",
              "en": "Section heading: optional drawn bar / icon + title + right controls. accent = bar colour (built-in name / raw value / default / false for none); flush = no bottom margin"
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
            "name": "useLocale()",
            "type": "",
            "def": "",
            "desc": {
              "zh": "当前语言，并在宿主切语言（`<html lang>` 变化）时重渲；内置文案本来就跟随宿主，这个 hook 只补「切完刷新」",
              "en": "Current locale, re-rendering when the host switches language (`<html lang>` change); built-in copy already follows the host, this hook only adds the post-switch refresh"
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
            "name": "busy",
            "type": "boolean",
            "def": "false",
            "desc": {
              "zh": "有异步在跑（footer 里的 `Button` 正在 loading）：遮罩 / Esc / ✕ 三条关闭路径一起失效，内容照常。否决项，不替代 closeOnMask / escClose",
              "en": "Async work in flight (a footer `Button` is loading): mask / Esc / ✕ all stop closing while content keeps rendering. A veto, not a replacement for closeOnMask / escClose"
            }
          },
          {
            "name": "locked",
            "type": "boolean",
            "def": "false",
            "desc": {
              "zh": "**锁死全部交互**（与 loading 解耦）：面板里的核心控件各自按**自己的禁用态**渲染（灰掉、点不动、Tab 跳过），再盖一层**全透明**点击层兜住自绘元素与鼠标（禁止手势）—— **不压任何灰色遮罩**；同时 Tab 键整个吃掉、锁定瞬间把面板里的活动焦点 blur 掉（自绘的 input 也打不了字）；三条关闭路径同时失效。自绘的原生表单元素会顺带**近似变灰**（一条特异性为 0 的规则，只写 opacity / cursor，被你自己任何一条规则或 `--dshpc-lock-dim: 1` 覆盖掉）。只做「或」、不写回调用方的 `disabled`：本来禁用的解锁后照样禁用，锁定期间改的也不被覆盖。受控项、不落内部 state（关掉重开自然回到未锁）",
              "en": "**Locks every interaction** (decoupled from loading): core controls inside render in **their own disabled state** (dimmed, unclickable, skipped by Tab), plus a **fully transparent** click layer that catches self-drawn elements and the pointer (not-allowed cursor) — **no dim veil at all**; Tab is swallowed outright and whatever was focused inside is blurred on lock (so a self-drawn input cannot be typed into); all three close paths stop working. Self-drawn native form elements get an **approximate dim** too (one zero-specificity rule writing only opacity / cursor, beaten by any rule of yours or by `--dshpc-lock-dim: 1`). It only ORs and never writes back a caller’s `disabled`: already-disabled controls stay disabled after unlocking, and mid-lock changes are not overwritten. Controlled and stateless (reopening starts unlocked)"
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
              "zh": "底栏（按钮区；上下内距相等、内容垂直居中）",
              "en": "Footer (button area; symmetric padding, vertically centred)"
            }
          },
          {
            "name": "notice",
            "type": "string",
            "def": "—",
            "desc": {
              "zh": "底栏**左侧**的一行过程提示：换文案即翻牌，**默认带常驻扫光**（不动也看得出在动），超长省略 + hover 跑马灯。不传 = 不占位、与以前完全一样；**传空字符串 = 清场**；footer 也可不给（它会自己撑起底栏）",
              "en": "One-line progress notice on the **left** of the footer: changing the string flips it, and it carries the **persistent sheen by default** (still reads as active when unchanged); overflow elides and marquees on hover. Omitted = nothing at all (unchanged behaviour); **an empty string clears it**; `footer` may be omitted too — the notice alone brings the footer up"
            }
          },
          {
            "name": "footerDivider",
            "type": "boolean",
            "def": "'true'",
            "desc": {
              "zh": "底栏上面的那条分隔线；传 false 关掉（sm 确认框本来就没有）",
              "en": "The divider above the footer; pass false to drop it (sm dialogs never have one)"
            }
          },
          {
            "name": "className",
            "type": "string",
            "def": "—",
            "desc": {
              "zh": "追加 class（只补布局 / 视觉修饰，别覆盖皮肤）",
              "en": "Extra class (layout / visual tweaks only; do not override the skin)"
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
      },
      {
        "id": "ui-confirm-dialog",
        "rows": [
          {
            "name": "title / message",
            "type": "ReactNode",
            "def": "—",
            "desc": {
              "zh": "标题 / 说明文字或任意内容；无标题时整条头部消失",
              "en": "Title / body text or any content; no title means no header row"
            }
          },
          {
            "name": "tone",
            "type": "'primary' | 'danger' | 'warning'",
            "def": "'primary'",
            "desc": {
              "zh": "确认钮语义档（决定按钮颜色）",
              "en": "Confirm button tone (sets its colour)"
            }
          },
          {
            "name": "confirmText / cancelText",
            "type": "string",
            "def": "内置字典「确定」/「取消」",
            "desc": {
              "zh": "按钮文案",
              "en": "Button labels"
            }
          },
          {
            "name": "confirmWidth / cancelWidth",
            "type": "number | string",
            "def": "—",
            "desc": {
              "zh": "两颗钮各自定宽（px 或任意 CSS 宽度）；loading 转圈会把按钮撑宽，定宽后不跳",
              "en": "Per-button fixed width (px or any CSS width); loading would otherwise widen the button and shift its neighbour"
            }
          },
          {
            "name": "loadingText",
            "type": "boolean",
            "def": "true",
            "desc": {
              "zh": "传 false：loading 时两颗钮清文案、锁住有文案的宽度、只留居中的圈（见 `Button.loadingText`）",
              "en": "Pass false: while loading, both buttons drop their labels, freeze at the labelled width and show a centred spinner (see `Button.loadingText`)"
            }
          },
          {
            "name": "onConfirm / onCancel",
            "type": "() => unknown",
            "def": "—",
            "desc": {
              "zh": "确认 / 取消回调；返回 Promise 时按钮转圈、整框锁死，settle 后恢复；返回 `false` 不关",
              "en": "Confirm / cancel callback; a Promise makes its button spin and locks the dialog until it settles; `false` keeps it open"
            }
          },
          {
            "name": "confirmLoading / cancelLoading",
            "type": "boolean",
            "def": "false",
            "desc": {
              "zh": "外部驱动对应按钮 loading，与按钮自身异步状态取或",
              "en": "External loading for that button, OR-ed with its own async state"
            }
          },
          {
            "name": "notice",
            "type": "string",
            "def": "—",
            "desc": {
              "zh": "底栏**左侧**的一行过程提示（loading 期间逐步换文案、换一句翻一次牌，超长省略 + hover 跑马灯）。不传 = 不占位；**传空字符串 = 清场**（同一块地方复用下一轮时用它把上一句清掉）",
              "en": "One-line progress notice on the **left** of the footer (swap the string while loading, each change flips; overflow elides and marquees on hover). Omitted = nothing at all; **an empty string clears it** (use it when the same spot is reused for the next round)"
            }
          },
          {
            "name": "closeOnMask",
            "type": "boolean",
            "def": "'true'",
            "desc": {
              "zh": "点遮罩关闭（等于取消）",
              "en": "Close on mask click (treated as cancel)"
            }
          },
          {
            "name": "size",
            "type": "ModalSize",
            "def": "'sm'",
            "desc": {
              "zh": "尺寸档",
              "en": "Size tier"
            }
          },
          {
            "name": "translate",
            "type": "Translate",
            "def": "内置字典",
            "desc": {
              "zh": "覆盖确定 / 取消文案",
              "en": "Override confirm / cancel copy"
            }
          }
        ]
      },
      {
        "id": "ui-alert-dialog",
        "rows": [
          {
            "name": "title / message",
            "type": "ReactNode",
            "def": "—",
            "desc": {
              "zh": "标题 / 说明文字或任意内容；无标题时整条头部消失",
              "en": "Title / body text or any content; no title means no header row"
            }
          },
          {
            "name": "severity",
            "type": "'info' | 'success' | 'warning' | 'error'",
            "def": "'info'",
            "desc": {
              "zh": "信号档：头部图标与配色由它决定",
              "en": "Signal tier: sets the header glyph and colour"
            }
          },
          {
            "name": "confirmText",
            "type": "string",
            "def": "内置字典「知道了」",
            "desc": {
              "zh": "按钮文案",
              "en": "Button label"
            }
          },
          {
            "name": "confirmWidth",
            "type": "number | string",
            "def": "—",
            "desc": {
              "zh": "确认钮定宽（px 或任意 CSS 宽度）；loading 转圈会把按钮撑宽，定宽后不跳",
              "en": "Fixed width for the confirm button (px or any CSS width); loading would otherwise widen it"
            }
          },
          {
            "name": "loadingText",
            "type": "boolean",
            "def": "true",
            "desc": {
              "zh": "传 false：loading 时清文案、锁住有文案的宽度、只留居中的圈（见 `Button.loadingText`）",
              "en": "Pass false: while loading, drop the label, freeze at the labelled width and show a centred spinner (see `Button.loadingText`)"
            }
          },
          {
            "name": "onConfirm",
            "type": "() => unknown",
            "def": "—",
            "desc": {
              "zh": "确认 / 遮罩 / Esc 的统一出口；返回 Promise 时转圈锁框，返回 `false` 不关",
              "en": "Single exit for confirm / mask / Esc; a Promise spins and locks it, `false` keeps it open"
            }
          },
          {
            "name": "confirmLoading",
            "type": "boolean",
            "def": "false",
            "desc": {
              "zh": "外部驱动按钮 loading，与按钮自身异步状态取或",
              "en": "External button loading, OR-ed with its own async state"
            }
          },
          {
            "name": "notice",
            "type": "string",
            "def": "—",
            "desc": {
              "zh": "底栏**左侧**的一行过程提示（loading 期间逐步换文案、换一句翻一次牌，超长省略 + hover 跑马灯）。不传 = 不占位；**传空字符串 = 清场**（同一块地方复用下一轮时用它把上一句清掉）",
              "en": "One-line progress notice on the **left** of the footer (swap the string while loading, each change flips; overflow elides and marquees on hover). Omitted = nothing at all; **an empty string clears it** (use it when the same spot is reused for the next round)"
            }
          },
          {
            "name": "closeOnMask",
            "type": "boolean",
            "def": "'true'",
            "desc": {
              "zh": "点遮罩关闭",
              "en": "Close on mask click"
            }
          },
          {
            "name": "size",
            "type": "ModalSize",
            "def": "'sm'",
            "desc": {
              "zh": "尺寸档",
              "en": "Size tier"
            }
          },
          {
            "name": "translate",
            "type": "Translate",
            "def": "内置字典",
            "desc": {
              "zh": "覆盖按钮文案",
              "en": "Override the button copy"
            }
          }
        ]
      },
      {
        "id": "ui-imperative-dialog",
        "rows": [
          {
            "name": "confirmModal(opts)",
            "type": "Promise<boolean>",
            "def": "—",
            "desc": {
              "zh": "命令式确认框；opts 同 `ConfirmModal`，另有 `skin`；`true` = 确定",
              "en": "Imperative confirm; opts match `ConfirmModal` plus `skin`; `true` = confirmed"
            }
          },
          {
            "name": "alertModal(opts)",
            "type": "Promise<void>",
            "def": "—",
            "desc": {
              "zh": "命令式警告框；opts 同 `AlertModal`，另有 `skin`；关闭即 resolve",
              "en": "Imperative alert; opts match `AlertModal` plus `skin`; resolves on close"
            }
          },
          {
            "name": "skin",
            "type": "'core' | 'host'",
            "def": "'core'",
            "desc": {
              "zh": "host 走宿主原生 Modal（需先引入适配层 `official.js`，未注册则回落 core 并告警）",
              "en": "host uses the host’s native Modal (requires the `official.js` adapter; falls back to core with a warning when unregistered)"
            }
          }
        ]
      }
    ]
  },
  "ui-sidesheet": {
    "id": "ui-sidesheet",
    "heading": {
      "zh": "SideSheet（侧边抽屉）",
      "en": "SideSheet (side drawer)"
    },
    "prose": [
      {
        "zh": "从屏幕左 / 右缘滑入的**覆盖式**浮层。皮肤与 `PanelDock` **一模一样**（同一份 `side-panel.css`：头部排版、拖拽条、关闭钮、边框、阴影、入场动画），宽度也能拖；差别只在**怎么占位**：分栏是 sticky 占宽、把主区挤窄（调用方必须给挂载点），抽屉是 absolute 盖上去（自铺遮罩，不需要挂载点）。",
        "en": "An **overlay** sliding in from the left or right edge. It shares the **exact same skin** as `PanelDock` (one `side-panel.css`: header layout, resize handle, close button, border, shadow, entrance animation) and resizes by dragging too; the only difference is **how it occupies space**: a dock is sticky and narrows the main area (caller must supply a mount), a sheet is absolute and covers it (lays its own mask, no mount needed)."
      },
      {
        "zh": "**没有收起**：抽屉没有收起钮、也没有收进去之后贴在边上的耳朵 —— 关就是关（用户 2026-11-02）。要「收起来还留着入口」那个形态，用 `PanelDock`。",
        "en": "**No collapse**: there is no collapse button and no edge ear to reopen from — closing means closing (decided 2026-11-02). For “collapse but keep an entry point”, use `PanelDock`."
      },
      {
        "zh": "开关行为与 `Modal` 一致：**渲染即显示**（`{open && <SideSheet … />}`）、点遮罩 / Esc / ✕ 三条关闭路径都在，且可分别关掉（`closeOnMask` / `escClose` / `closable`）。遮罩右边界照样让开右侧分栏（读 `--dshpc-page-inset-right`），分级走 drawer 档（低于 modal、高于 dock）。",
        "en": "Closing behaves exactly like `Modal`: **rendered means visible** (`{open && <SideSheet … />}`), with mask click / Esc / ✕ all wired and individually switchable (`closeOnMask` / `escClose` / `closable`). The mask still yields to the right column (`--dshpc-page-inset-right`) and sits on the drawer z-tier (below modal, above dock)."
      },
      {
        "zh": "宽度：初始 460px（与 PanelDock 同档）、下限 320、上限默认只受遮罩盒限制，都可调。**默认就能拖**（`resizable={false}` 关掉）；拖动期把面板自己那条边框染成蓝色渐变，与分栏同款（不在旁边另加一条线）。拖出来的宽度只活在组件内，下次打开回到初始值。",
        "en": "Width: starts at 460px (same as PanelDock), floor 320, ceiling defaults to the mask box — all adjustable. **Draggable by default** (`resizable={false}` to turn it off); while dragging, the panel’s own border becomes the blue gradient, same as the dock (never a second line beside it). A dragged width lives inside the component only — reopening starts from the initial value again."
      }
    ],
    "api": [
      {
        "id": "ui-sidesheet",
        "rows": [
          {
            "name": "side",
            "type": "'left' | 'right'",
            "def": "'left'",
            "desc": {
              "zh": "贴哪条边、从哪边滑入；拖拽条自动落到朝内那一侧",
              "en": "Which edge it hugs and slides from; the resize handle moves to the inner edge"
            }
          },
          {
            "name": "title / icon / extra",
            "type": "ReactNode",
            "def": "—",
            "desc": {
              "zh": "内置头的标题 / 标题前图标 / 标题右侧任意内容（与 PanelDock 同槽）",
              "en": "Built-in header: title / icon before it / anything to the right (same slots as PanelDock)"
            }
          },
          {
            "name": "header",
            "type": "ReactNode | null",
            "def": "—",
            "desc": {
              "zh": "整块替换头部；`null` = 不要头部（关闭钮浮到右上角）",
              "en": "Replace the whole header; `null` = no header (close button floats top-right)"
            }
          },
          {
            "name": "onClose / closable / closeIcon",
            "type": "() => void / boolean / ReactNode",
            "def": "— / 跟随 onClose / ✕",
            "desc": {
              "zh": "关闭回调；不传则不出关闭钮",
              "en": "Close handler; no close button if omitted"
            }
          },
          {
            "name": "open",
            "type": "boolean",
            "def": "true",
            "desc": {
              "zh": "受控开关：传 false 时先播收起动画再卸载（想有收起效果就常驻渲染它、只切这个布尔）",
              "en": "Controlled flag: false plays the collapse animation before unmounting (keep it mounted and toggle this to get the exit motion)"
            }
          },
          {
            "name": "closeOnMask / escClose",
            "type": "boolean",
            "def": "'true' / 'true'",
            "desc": {
              "zh": "点遮罩关闭 / Esc 关闭",
              "en": "Close on mask click / on Esc"
            }
          },
          {
            "name": "busy",
            "type": "boolean",
            "def": "false",
            "desc": {
              "zh": "有异步在跑（footer 里的 `Button` 正在 loading）：遮罩 / Esc / ✕ 三条关闭路径一起失效，内容照常。否决项，不替代 closeOnMask / escClose",
              "en": "Async work in flight (a footer `Button` is loading): mask / Esc / ✕ all stop closing while content keeps rendering. A veto, not a replacement for closeOnMask / escClose"
            }
          },
          {
            "name": "locked",
            "type": "boolean",
            "def": "false",
            "desc": {
              "zh": "锁死全部交互（含义同 `Modal.locked`）：核心控件各自按自己的禁用态渲染 + 全透明点击层 + 三条关闭路径失效；不压灰色遮罩、不写回任何 `disabled`",
              "en": "Lock every interaction (same as `Modal.locked`): core controls render in their own disabled state, a fully transparent click layer catches the rest, all three close paths stop working; no dim veil and no writing back to any `disabled`"
            }
          },
          {
            "name": "width / minWidth / maxWidth",
            "type": "number / number / number",
            "def": "460 / 320 / —",
            "desc": {
              "zh": "初始宽度 / 拖拽下限 / 拖拽上限（px；上限缺省 = 遮罩盒宽）",
              "en": "Initial width / resize floor / resize ceiling (px; ceiling defaults to the mask box)"
            }
          },
          {
            "name": "resizable",
            "type": "boolean",
            "def": "true",
            "desc": {
              "zh": "能否拖宽（关掉就没有拖拽条）",
              "en": "Whether it resizes by dragging (off = no handle)"
            }
          },
          {
            "name": "footer / children",
            "type": "ReactNode / ReactNode",
            "def": "— / —",
            "desc": {
              "zh": "底栏 / 主体（主体是唯一滚动容器）",
              "en": "Footer / body (the body is the only scroll container)"
            }
          },
          {
            "name": "notice",
            "type": "string",
            "def": "—",
            "desc": {
              "zh": "底栏**左侧**的一行过程提示（换文案即翻牌，**默认带常驻扫光**，超长省略 + hover 跑马灯）。不传 = 不占位；**传空字符串 = 清场**（抽屉常驻渲染，关掉再开时用它清上一轮）",
              "en": "One-line progress notice on the **left** of the footer (changing it flips; it carries the **persistent sheen by default**; overflow elides and marquees on hover). Omitted = nothing at all; **an empty string clears it** (the drawer stays mounted, so this is how the previous round is wiped)"
            }
          },
          {
            "name": "translate",
            "type": "Translate",
            "def": "内置字典",
            "desc": {
              "zh": "覆盖关闭 / 拖拽条的文案",
              "en": "Override close / resize copy"
            }
          }
        ]
      }
    ],
    "code": [
      {
        "id": "ui-sidesheet-example",
        "lang": "tsx",
        "src": "import { SideSheet } from 'dsh-plugin-core/ui'\n\n// 页面里常驻渲染，只切 open：关的时候宽度收回去（条件渲染会一卸载就没影）\nh(SideSheet, {\n  open,                                  // 传 false ⇒ 播完收起动画再卸载\n  title: '文件详情',\n  extra: h(Chip, null, '只读'),          // 标题右侧（与 PanelDock 同一个槽）\n  onClose: () => setOpen(false),\n  footer: h(Button, { variant: 'primary', onClick: () => setOpen(false) }, '知道了'),\n}, h(FileDetail))\n\n// 从右侧滑入、初始 720 宽、不许拖：side=\"right\" / width={720} / resizable={false}"
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
        "zh": "占宽契约：已开栏宽之和实时写进根元素 `--dshpc-page-inset-right`（拖拽逐帧更新，全关即移除），全屏遮罩据此让位；同页多个 dock 求和。滚动条与分隔线的 1px 缝隙不由 dock 让位（`--dshpc-dock-gap` 已删），由主区滚动容器自己的透明右边框提供。",
        "en": "Width contract: the sum of open widths goes to `--dshpc-page-inset-right` on the root element (every frame while dragging, removed when all close), and full-screen masks yield to it; multiple docks on one page are summed. The 1px gap between the scrollbar and the divider is no longer dock-provided (`--dshpc-dock-gap` is gone) — the main area’s own scroll container supplies it with a transparent right border."
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
              "zh": "关钮开关；位置 auto/header/floating/none。`floating` 钉在面板右上（6px 偏移、20×20），无头内容要给右上留 28px",
              "en": "Close-button toggle; position auto/header/floating/none. `floating` sits at the panel’s top-right (6px offset, 20×20) — headerless content must leave 28px there"
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
  },
  "quick-toolbar": {
    "id": "quick-toolbar",
    "heading": {
      "zh": "QuickToolbar（快捷工具栏）",
      "en": "QuickToolbar (quick toolbar)"
    },
    "prose": [
      {
        "zh": "右侧悬浮的一列独立圆钮：**纵向恒定**贴屏幕底边（默认 16px，从下往上排），**横向默认**贴屏幕右缘。传 `anchorId` / `anchor()` 时横向贴到那个控件的右缘外侧、同样留 16px；右侧再留 16px 后放不下就自动退回贴屏幕右缘。锚点控件找不到按「跟随窗口」处理，不报错。",
        "en": "A right-side floating column of standalone round buttons. Vertically it **always** hugs the viewport bottom (16px by default, stacking upward); horizontally it defaults to the viewport’s right edge. Pass `anchorId` / `anchor()` to sit outside that control’s right edge with the same 16px gap; if another 16px would overflow, it falls back to the viewport edge. A missing anchor is treated as “follow the window”, no error."
      },
      {
        "zh": "内置「回到顶部」默认开启：`when: 'scroll'`、阈值 320px，滚过才出现，点击平滑回顶（`prefers-reduced-motion` 下瞬时）。传 `backToTop: false` 关掉；传对象可调 `{ order, label, threshold }`。",
        "en": "The built-in back-to-top is on by default: `when: 'scroll'`, threshold 320px — it appears after scrolling and smoothly returns to the top (instant under `prefers-reduced-motion`). Pass `backToTop: false` to remove it, or an object to tune `{ order, label, threshold }`."
      },
      {
        "zh": "任意按钮显隐切换都带 0.2s 动画：出现时淡入并上移一小段，消失时先淡出再卸载（同一列的其它按钮不会瞬时跳位）；`prefers-reduced-motion` 下动画关闭。",
        "en": "Every visibility change is animated over 0.2s: a button fades in with a slight upward slide, and fades out before being unmounted (the rest of the column never jumps); animations are off under `prefers-reduced-motion`."
      },
      {
        "zh": "自定义项走 `items`：`icon` + `label` + `onClick`，单项的 `visible` / `when` / `order` / `threshold` / `color` / `fgColor` 都可配；点击后先调 `onClick`，再统一回调 `onAction(id, item)`。排序按 `order` 升序：回顶部默认 0 在最上，自定义项默认按数组下标 + 1 往下排。",
        "en": "Custom buttons go through `items`: `icon` + `label` + `onClick`, each with optional `visible` / `when` / `order` / `threshold` / `color` / `fgColor`. A click calls `onClick` first, then the shared `onAction(id, item)`. Sorting is ascending by `order`: back-to-top defaults to 0 (topmost), custom items default to array index + 1 below it."
      },
      {
        "zh": "边界：`position: fixed`，不占布局；滚动容器默认取工具栏最近的可纵向滚动祖先，也可显式给 `scrollContainer`。只做右侧；按钮尺寸 / 间距 / 贴边距离由 props 控制，样式自注入，不依赖调用方额外引 CSS。",
        "en": "Boundary: `position: fixed`, takes no layout space. The scroll container defaults to the nearest vertically scrollable ancestor, or pass `scrollContainer` explicitly. Right side only; size / gap / edge distance are props, and the component injects its own styles — callers need no extra CSS."
      }
    ],
    "api": [
      {
        "id": "ui-quick-toolbar",
        "rows": [
          {
            "name": "items",
            "type": "QuickToolbarItem[]",
            "def": "[]",
            "desc": {
              "zh": "自定义按钮列表，排在回顶部下面",
              "en": "Custom buttons, listed below back-to-top by default"
            }
          },
          {
            "name": "backToTop",
            "type": "boolean | QuickToolbarBackToTop",
            "def": "true",
            "desc": {
              "zh": "内置回顶部：false 关掉；对象可调 order / label / threshold",
              "en": "Built-in back-to-top: false to remove; object tunes order / label / threshold"
            }
          },
          {
            "name": "onAction",
            "type": "(id, item) => void",
            "def": "—",
            "desc": {
              "zh": "自定义项点击后的统一回调（在单项 onClick 之后）",
              "en": "Shared callback after a custom item’s own onClick"
            }
          },
          {
            "name": "offset",
            "type": "number",
            "def": "16",
            "desc": {
              "zh": "与右缘 / 屏幕底边的距离（px）",
              "en": "Distance to the right edge / viewport bottom (px)"
            }
          },
          {
            "name": "gap",
            "type": "number",
            "def": "12",
            "desc": {
              "zh": "相邻按钮的纵向间距（px）",
              "en": "Vertical gap between buttons (px)"
            }
          },
          {
            "name": "size",
            "type": "number",
            "def": "44",
            "desc": {
              "zh": "按钮直径（px）",
              "en": "Button diameter (px)"
            }
          },
          {
            "name": "anchorId",
            "type": "string",
            "def": "—",
            "desc": {
              "zh": "跟随这个 id 的控件；不传 = 跟随窗口",
              "en": "Follow the control with this id; omit to follow the window"
            }
          },
          {
            "name": "anchor",
            "type": "() => HTMLElement | null",
            "def": "—",
            "desc": {
              "zh": "动态锚点（优先于 anchorId）；返回 null 按跟随窗口",
              "en": "Dynamic anchor (wins over anchorId); null means follow the window"
            }
          },
          {
            "name": "scrollContainer",
            "type": "HTMLElement | () => HTMLElement | null",
            "def": "最近可滚动祖先",
            "desc": {
              "zh": "显式指定滚动容器",
              "en": "Explicit scroll container"
            }
          },
          {
            "name": "ariaLabel",
            "type": "string",
            "def": "内置字典「快捷工具栏」",
            "desc": {
              "zh": "工具栏无障碍名",
              "en": "Toolbar accessible name"
            }
          },
          {
            "name": "className",
            "type": "string",
            "def": "—",
            "desc": {
              "zh": "追加 class（只补布局）",
              "en": "Extra class (layout only)"
            }
          }
        ]
      },
      {
        "id": "ui-quick-toolbar-item",
        "rows": [
          {
            "name": "id",
            "type": "string",
            "def": "—",
            "required": "必填",
            "desc": {
              "zh": "唯一标识，onAction 原样回传",
              "en": "Unique id, echoed back by onAction"
            }
          },
          {
            "name": "icon",
            "type": "ReactNode",
            "def": "—",
            "required": "必填",
            "desc": {
              "zh": "按钮图标",
              "en": "Button icon"
            }
          },
          {
            "name": "label",
            "type": "string",
            "def": "—",
            "required": "必填",
            "desc": {
              "zh": "无障碍名，兼 title",
              "en": "Accessible name, doubles as title"
            }
          },
          {
            "name": "onClick",
            "type": "() => void",
            "def": "—",
            "desc": {
              "zh": "单项点击回调",
              "en": "Per-item click handler"
            }
          },
          {
            "name": "visible",
            "type": "boolean",
            "def": "true",
            "desc": {
              "zh": "false = 永久隐藏",
              "en": "false hides it permanently"
            }
          },
          {
            "name": "when",
            "type": "'always' | 'scroll'",
            "def": "'always'",
            "desc": {
              "zh": "scroll = 滚过阈值才出现",
              "en": "scroll shows it only past the threshold"
            }
          },
          {
            "name": "order",
            "type": "number",
            "def": "数组下标 + 1",
            "desc": {
              "zh": "越小越靠上",
              "en": "Smaller sorts higher"
            }
          },
          {
            "name": "threshold",
            "type": "number",
            "def": "320",
            "desc": {
              "zh": "when: scroll 的触发距离（px）",
              "en": "Trigger distance (px) for when: scroll"
            }
          },
          {
            "name": "color",
            "type": "string",
            "def": "主题 solid",
            "desc": {
              "zh": "覆盖按钮底色",
              "en": "Override button background"
            }
          },
          {
            "name": "fgColor",
            "type": "string",
            "def": "主题 on-solid",
            "desc": {
              "zh": "覆盖图标 / 文字色",
              "en": "Override icon / text colour"
            }
          }
        ]
      }
    ],
    "code": [
      {
        "id": "ui-quicktoolbar-example",
        "lang": "tsx",
        "src": "import { QuickToolbar } from 'dsh-plugin-core/ui'\n\n// 默认：贴屏幕右下角（纵向恒贴屏幕底边、横向贴右缘，各留 16px）\nh(QuickToolbar, {\n  onAction: (id) => console.log('点了', id),\n  items: [\n    { id: 'search', icon: <SearchIcon />, label: '搜索' },\n    { id: 'settings', icon: <SettingsIcon />, label: '设置' },\n  ],\n  // backToTop 默认开：滚过 320px 才出现；不想要就传 false\n})\n\n// 跟随某个控件：横向贴它的右缘外侧；右侧放不下自动退回屏幕右缘\nh(QuickToolbar, {\n  anchorId: 'my-content',\n  items: [...],\n  backToTop: { order: 2 },        // 回顶部排到第 3 位；默认 0 在最上\n})\n\n// 自定义项：显隐 / 排序 / 配色\nh(QuickToolbar, {\n  items: [\n    { id: 'search', icon: <SearchIcon />, label: '搜索', when: 'scroll', threshold: 480 },\n    { id: 'wide', icon: <WideIcon />, label: '宽屏', visible: wide },\n    { id: 'brand', icon: <BrandIcon />, label: '品牌', color: '#7c3aed', fgColor: '#fff' },\n  ],\n  scrollContainer: myScrollElement,\n})"
      }
    ]
  }
}
