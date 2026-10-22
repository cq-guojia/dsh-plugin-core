// 本文件由 scripts/gen-docs.mjs 自动生成，请勿手改。来源：docs/**/*.doc.ts（按 section.id 扁平聚合）
export const docData = {
  "explorer": {
    "id": "explorer",
    "heading": {
      "zh": "概览",
      "en": "Overview"
    },
    "prose": [
      {
        "zh": "explorer 提供工作区文件浏览与选择能力，依赖宿主提供的工作区文件快照。",
        "en": "explorer provides workspace file browsing and picking, driven by the host-provided workspace file snapshot."
      },
      {
        "zh": "浏览态停靠是布局成员（占宽度、把主区挤窄），不要挂在 document.body 上自己套 fixed。",
        "en": "The browse dock is a layout member (takes width, narrows the main area); do not mount it on document.body with your own fixed positioning."
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
        "zh": "从 ctx 取出工作区快照，传给能力接口；不要传整个 ctx。",
        "en": "Pull the workspace snapshot out of ctx and pass it to the capability APIs; do not pass the whole ctx."
      }
    ],
    "code": [
      {
        "id": "explorer-usage-code",
        "lang": "tsx",
        "src": "import { openFilePreview, pickWorkspaceFile } from 'dsh-plugin-core/explorer'\nimport { SessionPreview } from 'dsh-plugin-core/session'\n\n// 右侧分栏预览（占宽度、挤窄主区）\nopenFilePreview({ mount, workspaceFiles, officeToPdf, sessionId, path, rootName })\n\n// 锚定弹窗选文件（Promise 返回路径，不自己挂 dock）\nconst r = await pickWorkspaceFile({ workspaceFiles, sessionId, anchor, rootName })\n\n// 会话预览\n<SessionPreview sessionId=\"...\" source={source} variant=\"modal\" />"
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
            "name": "openFilePreview",
            "type": "({ mount, workspaceFiles, sessionId, path, rootName, officeToPdf? }) => PreviewHandle",
            "def": "—",
            "desc": {
              "zh": "右侧分栏预览文件/文件夹，mount 为必填的 flex 行",
              "en": "Preview a file/folder in a right-side dock; mount is the required flex row"
            }
          },
          {
            "name": "pickWorkspaceFile",
            "type": "({ workspaceFiles, sessionId, anchor, filter? }) => Promise<{ path, isDir }>",
            "def": "—",
            "desc": {
              "zh": "锚定按钮旁弹模态选文件，Promise 返回工作区相对路径",
              "en": "Open a modal anchored to a button and resolve with the workspace-relative path"
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
        "zh": "token 来自 `dsh-task-dispatch-table/src/client/ui/tokens.ts` 的整段提取（颜色 / 尺寸 / 字号 / 层级），**含深色覆盖段**。取值一律走 `var(--<prefix>-*)`，不在规则里写死颜色值。",
        "en": "Tokens are extracted wholesale from `dsh-task-dispatch-table/src/client/ui/tokens.ts` (color / size / font-size / elevation), **including the dark-mode override block**. Always read values via `var(--<prefix>-*)`, never hard-code colors in rules."
      },
      {
        "zh": "完整清单与命名口径见 [`../style.md`](../style.md)。",
        "en": "Full list and naming conventions: [`../style.md`](../style.md)."
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
        "zh": "依赖 ui。把「看一眼某个会话、看完即关」封装成与官方会话页同构的只读弹窗：自动执行的任务想回看这次会话，不想开新窗口（回来还得找）。",
        "en": "Depends on ui. Wraps the \"peek at a session and close when done\" flow into a read-only dialog isomorphic to the official session page: for auto-run tasks you want to review this run without opening a new window."
      },
      {
        "zh": "弹窗只是当前的呈现方式，不是这个包的定义。「纯 Modal 控件」在 ui 里，这里装的是「会话预览」这个功能。",
        "en": "A modal is only the current presentation, not the definition of the package. The bare Modal lives in ui; this package owns the \"session preview\" feature."
      },
      {
        "zh": "渲染 = 「官方零件 + 自绘容器」：mirror/ 下 15 个组件按官方文件名一一对应（ChatView / ChatNodeSeat / MessageItem / GenericCommandCard / ReasoningRow / Turn×NodeView / MessageIconActions / TurnUsagePanel / StatDialog / Deliverables / ChatGroupSeat…），逐值镜像官方 UI；官方 CSS module 类名运行时发现（official-classes.ts），未命中回退自绘样式（session.css），不崩不白屏。",
        "en": "Rendering = \"official parts + self-drawn chrome\": the 15 components under mirror/ map one-to-one to official file names (ChatView / ChatNodeSeat / MessageItem / GenericCommandCard / ReasoningRow / Turn×NodeView / MessageIconActions / TurnUsagePanel / StatDialog / Deliverables / ChatGroupSeat…), mirroring the official UI value-by-value. Official CSS-module class names are discovered at runtime (official-classes.ts); on a miss, self-drawn fallback styles apply (session.css) — no crash, no blank screen."
      },
      {
        "zh": "归档会话同样可读：archiveSession 只把会话藏出显示面、不动存储；sessions.retain 物化 scope 与归档正交 ⇒ 预览归档会话走的是同一条数据链，无额外开发。",
        "en": "Archived sessions are readable too: archiveSession only hides a session from grouping surfaces and never touches storage; sessions.retain materializes the scope regardless of archive status ⇒ previewing an archived session uses the same data chain, with no extra work."
      },
      {
        "zh": "文件显示逻辑全量移植：用户消息官方 file 块 → 附件卡；工具卡 read/write/edit 摘要路径 = 可点 fileLink；tool-fs meta.diffs 路径进词表；markdown 行内文件引用 → fileMentions 解析成链接（resolve 不出保持惰性 code，永不猜）；交付文件（present / turn 级 deliverables.presented 同源）→ 整卡可点预览。统一出口 = onOpenFile。",
        "en": "File display logic is fully ported: official file blocks in user messages → attachment cards; read/write/edit tool-card summary paths are clickable fileLinks; tool-fs meta.diffs paths feed the mention vocabulary; inline markdown file references resolve through fileMentions (unresolved stays inert code — never guessed); delivered files (present / turn-level deliverables.presented, same source) → whole-card clickable preview. Single exit = onOpenFile."
      },
      {
        "zh": "续聊正道（重要）：底层 keyed 数组（order + nodes）是只读快照，官方没有「往预览 binding 发消息」的写面 ⇒ 框内不可打字续聊。正道 = fork 开分支（sessions.fork）→ uiWorkspace.openSession 跳官方会话区；底部暂存输入框的「确定」经 onContinue 由调用方完成 fork + host 侧 agent.send 起轮次 + 跳转（官方派发同款路，无歪门邪道）。",
        "en": "The sanctioned way to continue (important): the underlying keyed array (order + nodes) is a read-only snapshot; the host exposes no write surface for sending into a preview binding ⇒ you cannot type inside the dialog. The sanctioned path = fork a branch (sessions.fork) → uiWorkspace.openSession to jump into the official session area; the bottom staging input’s \"Confirm\" goes through onContinue, where the caller forks + sends the first turn via host-side agent.send + navigates (the same official dispatch path — no hacks)."
      },
      {
        "zh": "「继续对话」按钮按归档状态分化（调用方经 `archived` prop 注入）：已归档 ⇒ 开分支图标 + 确认框（fork 出子会话再跳官方区；官方策略归档会话不进主视图）；未归档 / 未提供 ⇒ 会话图标，点击直跳官方会话页。弹窗标题 = 会话自己的标题（`heading`，通常传宿主 sessions.list 的 displayTitle），已归档时标题旁带官方归档图标 + 「已归档」。",
        "en": "The \"Continue\" button forks by archive state (injected by the caller via the `archived` prop): archived ⇒ branch icon + confirmation (fork a child, then jump to the official area — official policy keeps archived sessions out of the main view); not archived / not provided ⇒ session icon, one click jumps straight to the official session page. The dialog title is the session’s own title (`heading`, usually the host sessions.list displayTitle); when archived, the official archive icon + \"Archived\" appears beside it."
      },
      {
        "zh": "归档状态**客户端读得到**（2026-10-22 解包 @deepseek-ai/dsh-api-workspace-controller@0.2.0-rc.2 核实，推翻此前「只有宿主侧读得到、要走 serveArchivedSessions 路由」的结论）：官方 client 服务 `workspaces` 的 `list` 快照带 `archivedSessionIds`，是 **registry-global 归档集合**（不是每工作区一份），由宿主 follow 流 baseline / `archived` 增量持续替换 ⇒ 注入 `workspaces` → `list.getSnapshot().archivedSessionIds` + `list.subscribe` 实时刷新，传给 `archived`。无需宿主路由。",
        "en": "Archive state IS readable client-side (verified 2026-10-22 by unpacking @deepseek-ai/dsh-api-workspace-controller@0.2.0-rc.2 — overturns the earlier conclusion that only the host could read it, via a serveArchivedSessions route): the official client service `workspaces` exposes a `list` snapshot carrying `archivedSessionIds` — the registry-global archive set (not one per workspace), continuously replaced by the host follow stream’s baseline / `archived` increments ⇒ inject `workspaces` → `list.getSnapshot().archivedSessionIds` + `list.subscribe` for live refresh, then pass it as `archived`. No host route needed."
      },
      {
        "zh": "标题区三段固定（用户 2026-10-22 拍板）：第一行 = 标题（调用方给的人话标题，缺省「会话预览」）+ 「已归档」徽标（**紧跟标题**，不跨两行居中）；第二行 = 副标题（会话 id，等宽小字，走 Modal 的 `subtitle`）；右侧 = 「继续对话」/ 关闭。会话 id 是标识，不进正文。",
        "en": "The header has three fixed parts (decided 2026-10-22): line 1 = the title (caller-supplied human title, default \"Session preview\") plus the **Archived** badge directly after the title (not centered across both lines); line 2 = the subtitle (session id, monospace caption, via the Modal `subtitle` prop); right side = \"Continue\" / close. The session id is an identifier and never goes into the body."
      },
      {
        "zh": "滚动与内距归核心（用户 2026-10-22 拍板）：Modal 的 body 是**唯一滚动容器**，内距也归它 —— 内容（本模块）只按流排版，不写 `height:100%`、不自己开滚动条。所以会话区里的官方 ChatView.frame / scroll 的 `overflow` / 高度 / 内距一律归零（见 session.css 的双类名钩子）；真需要「左右两栏各自滚」时不用内容自管，而是把右侧那列放到**页面层**（见下条）。",
        "en": "Scrolling and padding belong to the core (decided 2026-10-22): the Modal body is the **only scroll container**, and it owns the padding — this module just lays out flow content, never `height:100%`, never its own scrollbar. That is why the inner ChatView.frame / scroll `overflow`, height and padding are all zeroed (see the double-class hooks in session.css). If two panes must scroll independently, do not let the content manage height — put the right column at the **page level** (next item)."
      },
      {
        "zh": "文件链接（工具卡 fileLink / md 行内引用 / 交付卡）统一走 `onOpenFile`。接法（用户 2026-10-22 定）：预览开在**页面右侧**（核心 `openFilePreview` 的 dock，挤窄主区），不在弹窗里分栏。弹窗这边**什么都不用传**：dock 把占宽发布成 `--dshpc-page-inset-right`，遮罩按它让位 ⇒ 分栏不被压暗、照常可点，弹窗在左边剩余区域居中（用户 2026-10-22 二次拍板，撤掉了 `insetRight` 那条量宽度的路子）。工作区文件服务缺席时不给 `onOpenFile`，链接自然是纯文本，不假装能点。",
        "en": "Every file link (tool-card fileLink / md mentions / delivered cards) exits through `onOpenFile`. Wiring (decided 2026-10-22): the preview opens as a **page-level right column** (the core `openFilePreview` dock, squeezing the main area) — never as a split inside the dialog. The dialog passes **nothing** for this: the dock publishes its occupied width as `--dshpc-page-inset-right` and the mask yields by it, so the column stays bright and clickable while the dialog centers in the remaining left area (re-decided 2026-10-22, dropping the width-measuring `insetRight` route). When the workspace file service is absent, pass no `onOpenFile` so links stay plain text instead of pretending to be clickable."
      },
      {
        "zh": "已知限制：官方样式未注入时回退自绘观感（功能不受影响）；长会话一次全渲染（翻页靠「加载更早记录」按钮，官方 loadOlder）；系统提示 / 上下文注入行按决策 28 过滤（官方 ContextInjectionRow 待实施）；👍👎 反馈按钮官方走 slots，弹窗无该插槽。",
        "en": "Known limits: when official styles are not injected, the self-drawn look applies (functionality unaffected); long sessions render all at once (paging via the \"load earlier\" button, official loadOlder); system-prompt / context-injection rows are filtered per decision 28 (official ContextInjectionRow pending); thumbs up/down go through official slots, which the dialog does not have."
      },
      {
        "zh": "配套的官方会话列表（demo 预览站「真实会话列表」在用）：宿主 client 服务 `sessions`（@deepseek-ai/dsh-api-session-controller client 半侧，0.2.0-rc.2 解包核实）暴露 `list` 快照存储——`{ ids, byId, phase }`，每行带 `displayTitle`（durable title → 项目 basename → session id 三级回落）/ `updatedAt` / `running` / `blank`；数据来自宿主 `session/list` RPC（ApiSessionList.list：「Read every visible attached and persisted Session without activating an Agent」，按活动序）⇒ **列会话 ≠ 打开会话，冷安全，归档会话也在列**。demo 页面按 updatedAt 降序取前 20 条，点行 → openSessionView 真预览。",
        "en": "The companion official session list (used by the demo preview site’s \"real session list\"): the host client service `sessions` (the client half of @deepseek-ai/dsh-api-session-controller, verified by unpacking 0.2.0-rc.2) exposes a `list` snapshot store — `{ ids, byId, phase }`, each row carrying `displayTitle` (durable title → project basename → session id, three-level fallback) / `updatedAt` / `running` / `blank`; the data comes from the host `session/list` RPC (ApiSessionList.list: \"Read every visible attached and persisted Session without activating an Agent\", ordered by activity) ⇒ listing sessions ≠ opening them — cold-safe, and archived sessions are listed too. The demo page takes the 20 most recent by updatedAt; clicking a row → openSessionView for a real preview."
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
              "zh": "建数据链：retain 物化 → binding → open 拉尾页 → target(chat)；不可解析返回 null",
              "en": "Builds the data chain: retain materialize → binding → open tail → target(chat); null when unresolvable"
            }
          },
          {
            "name": "target",
            "type": "SnapshotFace<ChatViewFace | undefined>",
            "def": "—",
            "desc": {
              "zh": "chat 快照订阅面（useSyncExternalStore 用）",
              "en": "Chat snapshot subscription surface (for useSyncExternalStore)"
            }
          },
          {
            "name": "loadOlder",
            "type": "() => void",
            "def": "—",
            "desc": {
              "zh": "向前翻一页更早的历史（官方 loadOlder）",
              "en": "Page backward through older history (official loadOlder)"
            }
          },
          {
            "name": "dispose",
            "type": "() => void",
            "def": "—",
            "desc": {
              "zh": "释放 retain 引用；弹窗关闭必调",
              "en": "Release the retain reference; must be called when the dialog closes"
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
              "zh": "openSessionView 的产物",
              "en": "The result of openSessionView"
            }
          },
          {
            "name": "heading",
            "type": "string",
            "def": "sessionHeading（会话预览）",
            "required": "否",
            "desc": {
              "zh": "弹窗标题 = 会话自己的标题（宿主 sessions.list 的 displayTitle，可自定义）；会话 id 是标识，固定显示在标题下方副标题行（等宽小字），不占正文",
              "en": "Dialog title = the session’s own title (host sessions.list displayTitle — fully customisable); the session id is an identifier and always sits on the subtitle line **under** the title (monospace caption), never in the body"
            }
          },
          {
            "name": "archived",
            "type": "boolean",
            "def": "—",
            "desc": {
              "zh": "是否已归档（调用方从官方 client 服务 `workspaces` 快照的 `archivedSessionIds` 取）；分化「继续对话」：归档=开分支确认框，未归档=直跳官方会话页",
              "en": "Whether archived (caller reads it from the official client service `workspaces` snapshot field `archivedSessionIds`); differentiates \"Continue\": archived = fork confirmation, not archived = direct jump to the official session page"
            }
          },
          {
            "name": "onClose",
            "type": "() => void",
            "def": "—",
            "required": "是",
            "desc": {
              "zh": "关闭回调（调用方负责 view.dispose()）",
              "en": "Close callback (the caller owns view.dispose())"
            }
          },
          {
            "name": "forkSession",
            "type": "(sessionId, atSeq?) => Promise<string>",
            "def": "—",
            "desc": {
              "zh": "fork 源会话（官方 ISessions.fork）；与 openHostSession 缺一即不渲染「继续对话」",
              "en": "Fork the source session (official ISessions.fork); without openHostSession the \"Continue\" button does not render"
            }
          },
          {
            "name": "openHostSession",
            "type": "(sessionId: string) => void",
            "def": "—",
            "desc": {
              "zh": "官方导航跳转（uiWorkspace.openSession）",
              "en": "Official navigation jump (uiWorkspace.openSession)"
            }
          },
          {
            "name": "onContinue",
            "type": "(message: string) => Promise<void>",
            "def": "—",
            "desc": {
              "zh": "暂存输入框「确定」：调用方完成 fork + host 侧 agent.send 起轮次 + 跳转；缺省 = 不渲染输入框",
              "en": "Staging input \"Confirm\": the caller forks + sends the first turn via host-side agent.send + navigates; absent = the input is not rendered"
            }
          },
          {
            "name": "onOpenFile",
            "type": "(path: string) => void",
            "def": "—",
            "desc": {
              "zh": "文件打开出口（工具卡 fileLink / md mention / 交付卡共用）；缺省 = 链接降级纯文本",
              "en": "File-open exit (shared by tool-card fileLink / md mentions / delivered cards); absent = links degrade to plain text"
            }
          },
          {
            "name": "t",
            "type": "Translate",
            "def": "内置",
            "desc": {
              "zh": "覆盖文案（核心字典自带全部会话文案，中英）",
              "en": "Override copy (the built-in dictionary carries all session copy, zh+en)"
            }
          }
        ]
      }
    ],
    "code": [
      {
        "id": "session-usage",
        "lang": "tsx",
        "src": "import { openSessionView, SessionViewModal } from 'dsh-plugin-core/session'\n\n// 1. 宿主服务（插件从 ctx 取出后注入；sessions ← dsh-api-session-controller、\n//    uiConversation ← dsh-client-ui-conversation，inject 边决定装配顺序）\nconst view = openSessionView(sessions, uiConversation, sessionId, 'my-plugin')\nif (view !== null) {\n  h(SessionViewModal, {\n    sessionId,\n    view,\n    heading: '镜像升级日报',              // 可选标题\n    onClose: () => { view.dispose(); setOpen(false) },   // 关闭必须释放 retain 引用\n    // 续聊（可选服务）：fork → 跳官方会话区\n    forkSession: (id, atSeq) => sessions.fork({ sessionId: id, increaseTitle: true, atSeq }),\n    openHostSession: (id) => uiWorkspace.openSession(id),\n    // 暂存输入框（可选）：确定后由调用方 fork + host 侧 agent.send 起轮次 + 跳转\n    onContinue: async (message) => {\n      const child = await forkSession(sessionId)\n      await hostContinue(child, message)   // 插件 host 半侧：agents.create + agent.send\n      openHostSession(child)\n    },\n    onOpenFile: (path) => openFilePreview(path),   // 文件打开出口\n    t,                                        // 可选，覆盖文案\n  })\n}"
      },
      {
        "id": "session-data-chain",
        "lang": "ts",
        "src": "// 数据链（决策 28，全部经官方源码核实）：\n//   sessions.retain(id, { source })  物化 scope（归档 / 久未打开的会话也能读）\n//     → sessions.binding(id)         取绑定\n//     → session.open()               幂等拉历史尾页\n//     → uiConversation.binding(binding).target('chat')\n//                                     拿 ChatSnapshot：order + nodes（keyed 流）\n// 用完 view.dispose() 释放引用（否则会话 scope 永不回收）。\n//\n// 已证伪、勿再尝试：弹窗内挂官方 ChatView（renderSlot 只认 key='root'）；\n//    自己 retain('mainView')（锁死宿主会话导航）；冷读 RPC session/follow（无活动通道）。"
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
        "zh": "一个插件从装包到用上各子包的完整路径。复制粘贴级别的最小可用示例。",
        "en": "The full path from installing the package to using each subpackage. Copy-paste-level minimal example."
      },
      {
        "zh": "§0 装包：react 是 optional peer——只用 utils / design 的插件不必装。包里带预编译 dist（宿主以 git/npm 装插件不跑构建脚本，产物必须随包发布）。",
        "en": "§0 Install: `react` is an optional peer — plugins using only utils/design need not install it. The package ships prebuilt dist (hosts install plugins without running build scripts, so artifacts must be published)."
      },
      {
        "zh": "§1 初始化样式（一次）：id 必须插件内唯一（多插件同页靠它互不覆盖）；变量与类名统一使用 dshpc 前缀，不需要传参。",
        "en": "§1 Initialize styles (once): `id` must be unique within the plugin (multiple plugins on one page rely on it to avoid clobbering); variables and class names uniformly use the `dshpc` prefix, no param needed."
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
        "zh": "§4 接工作区浏览（要宿主能力）：mount 是必填——PanelDock 是布局成员（占宽度、把主区挤窄），没有布局位置就只能遮盖，所以要传你页面里那一层 flex 行，不要传 document.body 再自己套 fixed。浏览态停靠就是 FileBrowser 套在核心 PanelDock 里（openFilePreview 已经这么做了，面板用 header={null}：没有头部那条线，✕ 浮在右上角）。",
        "en": "§4 Wire workspace browsing (needs host capability): `mount` is required — PanelDock is a layout member (takes width, narrows the main area), so without a layout slot it can only overlay; pass your page’s flex row, not `document.body` with your own fixed positioning. Browse-dock is FileBrowser inside the core PanelDock (openFilePreview already does this, with header={null}: no header line, ✕ floats top-right)."
      },
      {
        "zh": "sessionId 不是随便填的：workspaceFiles 是会话作用域服务，必须给属于该工作区的真实会话 id。从宿主工作区快照挑锚点用 pickWorkspaceAnchor(items)（ui 的 workspaceList 快照可直接喂进去）。",
        "en": "`sessionId` is not arbitrary: workspaceFiles is a session-scoped service, so you must pass a real session id belonging to that workspace. Pick an anchor from the host workspace snapshot via pickWorkspaceAnchor(items) (ui’s workspaceList snapshot feeds in directly)."
      },
      {
        "zh": "§5 接会话预览",
        "en": "§5 Wire session preview"
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
        "src": "import { openFilePreview, pickWorkspaceFile } from 'dsh-plugin-core/explorer'\n\n// 从 ctx 取出这一小块（不要传整个 ctx）\nconst workspaceFiles = ctx.remote.workspaceFiles\n\n// 预览某文件/文件夹：右侧分栏（挤窄 row 左边的主区，不是浮在上面）\nopenFilePreview({ mount: pageRowEl, workspaceFiles, sessionId, path: 'docs/requirements.md' })\n\n// 让用户选文件：锚定按钮旁弹模态，Promise 返回 { path, isDir }（工作区相对路径）\nconst picked = await pickWorkspaceFile({ workspaceFiles, sessionId, anchor: btn, filter: { exts: ['ts'] } })"
      },
      {
        "id": "integration-use-session",
        "lang": "tsx",
        "src": "import { SessionPreview } from 'dsh-plugin-core/session'\n\nconst source = {\n  listMessages: async (id) => (await api.get(`/sessions/${id}/messages`)).data,\n  download: async (id, path) => api.getBytes(`/sessions/${id}/file?path=${path}`),\n}\n\nh(SessionPreview, { sessionId, source, variant: 'modal', onClose: close })"
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
            "name": "直接 import 官方 @deepseek-ai/* 并指望本包帮你引",
            "type": "现象：Node 下 ERR_MODULE_NOT_FOUND",
            "def": "—",
            "desc": {
              "zh": "本包 ui 已零官方依赖；要用官方件就在插件侧自己处理平台模块",
              "en": "Our ui has zero official deps; handle platform modules on the plugin side"
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
        "zh": "依赖 design。装的是「用 token 搭出来的零件」——直接用，不再自己写原生控件。纯零件，不自己取数：选项、当前值都经 props 给（数据要跨 host↔client 边界，通道是插件私有的）。",
        "en": "Depends on design. Ships \"parts built from tokens\" — use them directly instead of writing native controls. Pure parts, no self-fetching: options and current value come via props (data crosses the host↔client boundary over the plugin’s private channel)."
      },
      {
        "zh": "官方件通路：ui 入口保持零 @deepseek-ai/* 依赖（Node 单测 / 非宿主环境 import 不崩）；官方 primitives 经 src/ui/official.ts 以独立子路径 dsh-plugin-core/ui/official 透出。要消费官方件（FileTypeIcon / MarkdownText / CodeBlock / Menu / writeClipboard / Tooltip …）的封装从这条通路引，不许在别处 import 平台模块。",
        "en": "Official-component path: the ui entry stays free of @deepseek-ai/* deps (so Node unit tests / non-host imports don’t crash); official primitives are exposed via src/ui/official.ts through the separate subpath dsh-plugin-core/ui/official. Wrappers that consume official parts (FileTypeIcon / MarkdownText / CodeBlock / Menu / writeClipboard / Tooltip …) must import from this path — never import platform modules elsewhere."
      },
      {
        "zh": "定制边界：props 就是定制面，要改行为请组合 props，不要 fork 源码；「追加 class/style」只允许补布局，皮肤一律走 token 覆盖；缺控件时先提需求，实在要自己写请按 style.md 口径用同一套 token，并考虑提到本包。",
        "en": "Customization: props are the customization surface — compose props to change behavior, don’t fork; \"append class/style\" may only patch layout, skins always go through token overrides; if a control is missing, raise a request first; if you must write your own, follow style.md with the same tokens and consider upstreaming it."
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
        "zh": "Segmented：items（必填）+ 单选或多选；另有 size（默认 lg）、variant: default|inset、block、label、id、disabled。选中片 = --dshpc-surface-raised + 1px 描边 + 浮起阴影。",
        "en": "Segmented: items (required) + single or multiple selection; also size (default lg), variant default|inset, block, label, id, disabled. Selected segment = --dshpc-surface-raised + 1px border + lift shadow."
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
            "type": "value onChange(v) size(默认 sm) error disabled type placeholder inputRef onKeyDown onBlur aria-label title hint",
            "def": "—",
            "desc": {
              "zh": "基础输入框；error 描红；hint 给字符串即自动挂标准问号提示",
              "en": "Basic input; error turns it red; passing hint as a string auto-attaches a standard question-mark hint"
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
        "zh": "Picker：单选 / 多选 / 上限 / 搜索 / 分组 / 空态 / 降级，自绘（不依赖官方 Menu）。键盘：Esc 关、↑↓ 移游标、Enter 选。纯逻辑也可单用：toGroups / flattenOptions / filterGroups / toggleValue / labelsOf / groupOf。",
        "en": "Picker: single/multiple/max/search/grouping/empty/degrade, self-drawn (no official Menu). Keyboard: Esc closes, ↑↓ move cursor, Enter selects. Pure logic is also usable standalone: toGroups / flattenOptions / filterGroups / toggleValue / labelsOf / groupOf."
      },
      {
        "zh": "WorkspacePicker：领域选择器，数据自带的现成组件（FilePicker 已删）。数据自动来自宿主：插件 apply 里调一次 connectHost(ctx)，组件即订住官方 workspaces 服务的快照。不接线 = 空态（如实，不编数据）。",
        "en": "WorkspacePicker: a domain picker, a ready-made data-backed component (FilePicker removed). Data comes automatically from the host: call connectHost(ctx) once in the plugin apply, and the component subscribes to the official workspaces service snapshot. No wiring = empty state (honest, no fabricated data)."
      },
      {
        "zh": "ModelPicker：数据自带的现成组件 + variant: grouped|cascade（默认 grouped）。两种形态返回口径一致：onChange 都发最终模型 value（${provider}/${id}）。目录自动来自宿主（serveModelCatalog + connectHost）。",
        "en": "ModelPicker: a ready-made data-backed component + variant grouped|cascade (default grouped). Both forms return consistently: onChange emits the final model value (${provider}/${id}). Catalog comes automatically from the host (serveModelCatalog + connectHost)."
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
  "tooltip": {
    "id": "tooltip",
    "heading": {
      "zh": "FieldHint（问号提示）",
      "en": "FieldHint (hint)"
    },
    "prose": [
      {
        "zh": "独立组件，不属于 Input 家族——标题后、按钮后、文字后、输入框后随处可挂。气泡 = 官方 Tooltip 本体：插件启动时 setTooltipRenderer((props) => h(OfficialTooltip, props)) 把官方组件交给 core，side / align / maxWidth 可透传。不做降级兜底——未注入 renderer 的非宿主环境（node 自检）只出问号图标、没有气泡。",
        "en": "A standalone component, not part of the Input family — attachable after titles, buttons, text, or inputs anywhere. The bubble IS the official Tooltip: at plugin startup, setTooltipRenderer((props) => h(OfficialTooltip, props)) hands the official component to core; side / align / maxWidth pass through. No fallback — a non-host environment that didn’t inject a renderer (node self-check) shows only the question-mark icon, no bubble."
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
        "zh": "两种卡片外观，两个独立组件：Card = surface 底 + 1px 边框 + 圆角，padding 14px（左 12 使竖条贴边）；StripCard = 同色系浅底 + 1px 不可见占位边框 + 方角。头部整体垂直居中，调用方在 action 里裸放一个元素即垂直居中。颜色全走 token ⇒ 亮暗自动跟随宿主。",
        "en": "Two card appearances, two separate components: Card = surface background + 1px border + rounded corners, padding 14px (left 12 so the strip hugs the edge); StripCard = same-hue light background + 1px invisible placeholder border + square corners. The header is vertically centered as a whole; drop a bare element in action and it centers. Colors come from tokens ⇒ light/dark follows the host automatically."
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
        "zh": "小标签。两条可选轴：tone（neutral 默认灰面 / business / success / warning / danger——非 neutral 为实心信号面）；size（sm 默认 / md = font-size:12px，卡片元信息行用）。传 onClick 才是可点的。语义边界：Chip 只管「胶囊标签」这一件事；只给图标的小按钮请用 IconButton，不要拿 Chip 当图标底板（同一个类名两套皮肤会互相覆盖）。",
        "en": "A small tag. Two optional axes: tone (neutral default gray / business / success / warning / danger — non-neutral is a solid signal surface); size (sm default / md = font-size:12px, for card meta rows). Pass onClick to make it clickable. Boundary: Chip only does \"pill tag\"; for an icon-only small button use IconButton — don’t use Chip as an icon baseplate (one class name with two skins would overwrite each other)."
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
        "zh": "showToast / notify 等底层仍是 Sonner（动画/定位/堆叠）。跨副本 toast 宿主：core 被打进每个插件 bundle，旧实现 N 个插件同页会挂 N 个同 id 容器；现改为 globalThis 上 Symbol.for('dsh-plugin-core/toast-host') 单例，先到场的副本建唯一容器与 Toaster，其余副本把 ToastPayload 交给宿主渲染。",
        "en": "showToast / notify etc. are still backed by Sonner (animation/positioning/stacking). Cross-bundle toast host: core is bundled into every plugin, and the old impl would mount N same-id containers on one page; now a globalThis Symbol.for('dsh-plugin-core/toast-host') singleton makes the first bundle create the unique container and Toaster, and later bundles hand their ToastPayload to the host for rendering."
      },
      {
        "zh": "三条取舍（用户拍板接受，不要自行\"优化\"）：① 样式由第一个副本决定；② position 全局共享（一个屏幕一个区）；③ 不做卸载回收 / 引用计数。无 document 的环境静默跳过、不注册。",
        "en": "Three trade-offs (accepted by the user, don’t \"optimize\"): ① styling is decided by the first bundle; ② position is shared globally (one zone per screen); ③ no unload reclamation / ref counting. Environments without document silently skip and don’t register."
      },
      {
        "zh": "Modal：自绘 overlay，不用 react-dom 的 portal（避免多一个必需依赖）。",
        "en": "Modal: self-drawn overlay, not react-dom’s portal (avoids an extra required dependency)."
      },
      {
        "zh": "遮罩自动让位页面级分栏（用户 2026-10-22 拍板）：Mask 的右边界读 `--dshpc-page-inset-right`（由 PanelDock 发布，多 dock 求和），所以分栏不被压暗、照常可点，弹窗在**剩下那块区域**里居中。弹窗因此**不需要任何遮罩参数**，调用方也不用去量分栏宽度——量宽度那一版已删（异步挂载导致恒为 0，且属越界）。",
        "en": "The mask yields to a page-level right column automatically (decided 2026-10-22): its right edge reads `--dshpc-page-inset-right` (published by PanelDock, summed across docks), so the column stays bright and clickable and the dialog centers in the **remaining** area. The dialog therefore needs **no mask props**, and callers no longer measure the column — the measuring version was deleted (it read 0 because mounting is async, and it was the content deciding the mask’s geometry)."
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
              "zh": "官方 Sonner 原生（对比 / demo 用）。opts: { variant?, durationMs?, color?, onDismiss?, position? }；color 整条自定义背景色；position 6 向（默认 bottom-center）；暗色跟随宿主",
              "en": "Raw official Sonner (for comparison / demo). opts: { variant?, durationMs?, color?, onDismiss?, position? }; color sets the whole background; position 6-way (default bottom-center); dark follows host"
            }
          },
          {
            "name": "notify(message, opts?)",
            "type": "",
            "def": "",
            "desc": {
              "zh": "项目内推荐：我们封装好的提示。opts: { variant?, description?, durationMs?, position?, actions? }；右侧 actions?: { text, variant?, onClick }[]（1–2 个，用我们自己的 Button）；底层仍是 Sonner",
              "en": "Recommended in-project: our wrapped toast. opts: { variant?, description?, durationMs?, position?, actions? }; right-side actions?: { text, variant?, onClick }[] (1–2, using our own Button); still Sonner underneath"
            }
          },
          {
            "name": "showHostToast(message, opts?)",
            "type": "",
            "def": "",
            "desc": {
              "zh": "宿主原生 Toast（子路径 dsh-plugin-core/ui/host）。opts: { tone?, holdMs?, actions?, onDismiss? }；独立子路径导出，隔离平台模块",
              "en": "Host-native Toast (subpath dsh-plugin-core/ui/host). opts: { tone?, holdMs?, actions?, onDismiss? }; exported via a separate subpath to isolate platform modules"
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
            "name": "EmptyState({ text?, icon?, action?, translate? })",
            "type": "",
            "def": "",
            "desc": {
              "zh": "统一空态",
              "en": "Unified empty state"
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
            "def": "sm: calc(100% - 48px)；md/lg 不设",
            "desc": {
              "zh": "宽度用 `100%`（相对遮罩盒）而非 `100vw`：右侧分栏在场时遮罩已让位，`100vw` 会溢出到分栏上",
              "en": "Widths are `100%` of the mask box, not `100vw`: with a right column present the mask has already yielded, and `100vw` would spill onto it"
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
        "zh": "「右侧分栏」从业务里剥出来的通用壳。它是布局成员，不是浮层：占宽度、把主区挤窄，不是盖上去。因此必须由调用方放进自己的 flex 根里。分工照成熟组件库的通行做法：结构写在调用点（children），显隐归状态（open/close 只传 id）。",
        "en": "A generic shell extracted from the business layer for \"right-side panels\". It is a layout member, not an overlay: it takes width and narrows the main area, not covering it. So the caller must place it inside its own flex root. Following common component-library practice: structure is written at the call site (children), visibility is state (open/close only passes an id)."
      },
      {
        "zh": "面板高度默认视口高；嵌在定高容器里时由调用方给 --dshpc-dock-h。不做的事（拍板留档）：多份同名（multi）、tab 切换条、自动淘汰、浮动层——标签切换由消费方在自己的面板内容里实现。两条实现约束：面板是 position:sticky + height:100vh 的 flex 成员，刻意不设 z-index；拖动期给 iframe 让出指针事件。",
        "en": "Panel height defaults to viewport height; when nested in a fixed-height container, the caller sets --dshpc-dock-h. Deliberately not done (on record): multi same-name, tab-switch bar, auto-eviction, floating layer — tab switching is the consumer’s job inside their own panel content. Two impl constraints: panels are position:sticky + height:100vh flex members with no z-index; during drag, yield pointer events to iframes."
      },
      {
        "zh": "占宽契约（用户 2026-10-22 拍板）：dock 把「所有开着的栏宽之和」实时发布到根元素的 `--dshpc-page-inset-right`（拖拽中逐帧更新，全关/卸载即移除），全屏遮罩据此让位。同页多个 dock 按实例求和 —— 这不是可选优化：demo 自己就有「整页 dock + 文件预览 dock」两个，各写同一个变量会互相覆盖。之所以挂在根元素而不是 mount 上，是因为遮罩不保证是那块 flex 行的后代。",
        "en": "Width contract (decided 2026-10-22): the dock publishes the sum of its open panel widths to `--dshpc-page-inset-right` on the root element (updated every frame while dragging, removed when all panels close / on unmount), and full-screen masks yield by it. Multiple docks on one page are summed per instance — not an optional nicety: the demo itself has two (page dock + file-preview dock) and a single shared variable would let them overwrite each other. It lives on the root element rather than on the mount because the mask is not guaranteed to be a descendant of that flex row."
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
