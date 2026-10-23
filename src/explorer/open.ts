// 两个命令式能力（用户 2026-10-20 定义）—— explorer 的对外入口：
//
//  · 方法 A `openFilePreview`：传文件/文件夹路径，打开右侧停靠预览（可拖宽、Esc 关）；
//  · 方法 B `pickWorkspaceFile`：Promise 返回选中的工作区相对路径（弹窗在锚点按钮旁弹出，
//    Esc / 点外部 / ✕ 关，选中即 resolve）。
//
// 两者共用同一套 FileBrowser 面板（用户拍板：同一套内容，两种展现形式）。
//
// ⚠️ 方法 A 的**侧边栏本体是核心 PanelDock**（用户 2026-10-21 拍板：不许自绘制外壳 + 拖拽条）。
// PanelDock 是布局成员（占宽度、挤窄主区），同 ui/modal-host.ts 的做法：自建 container 挂 + createRoot，
// 关闭即卸载回收，不残留空根；拖宽与关闭交给 PanelDock 自己的 resizer / header 关钮。
import { createElement as h, useState, useSyncExternalStore, type ReactNode } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { ensureControls, getStyleKit } from '../ui/css.js'
import { workspaceList } from '../ui/host-data.js'
import { DockPanel, PanelDock, createPanelDock } from '../ui/PanelDock.js'
import { type Translate } from '../utils/i18n.js'
import { FileBrowser } from './FileBrowser.js'
import { anchorSessionForTitle, workspaceAnchorForPath } from './types.js'
import type { OfficeToPdfFace, PickFilter, RootCache, WorkspaceAnchorItem, WorkspaceFilesFace } from './types.js'

// ── 方法 A：侧边栏预览 ──

export interface FilePreviewHandle {
  /** 关闭预览（幂等）。 */
  close(): void
  /** 当前预览的路径（调用方传入值）。 */
  readonly path: string
}

export interface OpenFilePreviewOptions {
  /**
   * 工作区文件服务（文件预览要用）。传了 `content` 时（自定义审阅内容，例如变更 diff），
   * 这一组文件定位参数都可省略——核心只负责把 `content` 渲染进同一个右侧 dock，不解析路径。
   */
  workspaceFiles?: WorkspaceFilesFace
  sessionId?: string
  /** 文件或文件夹路径。与 `content` 二选一：传 `content` 时本字段可省略。 */
  path?: string
  /**
   * 自定义审阅内容：传入则核心渲染它进右侧 dock，**替代**内置 FileBrowser（解耦用途——
   * 例如把「某次改动的 diff」当内容塞进来，核心本身不认识 changes）。与 `path` 二选一。
   */
  content?: () => ReactNode
  officeToPdf?: OfficeToPdfFace | null
  /** 工作区根显示名（面包屑首段）。 */
  rootName?: string
  /** ▾ 下拉顶部的工作区清单（当前工作区展开 + 其余罗列；不传 = 下拉只有路径层）。 */
  workspaces?: readonly string[]
  /**
   * 宿主工作区清单（带绝对 path）：**可选覆盖**。path 为绝对路径时核心按最长前缀匹配所属
   * 工作区、list 换该工作区的会话 id；▾ 下拉「切工作区」也由它驱动。
   * **不传 = 自动用宿主 workspaces 快照**（connectHost 注入的 workspaceList）——
   * 调用方零传参也能匹配、能切。仅在「覆盖快照 / 宿主未接线」时才需要显式传。
   */
  workspaceAnchors?: readonly WorkspaceAnchorItem[]
  /** 从 ▾ 下拉选择其他工作区（点当前工作区 = 回其根目录，不走这里）。 */
  onSelectWorkspace?: (name: string) => void
  /** 关闭后回调（✕ / Esc / handle.close 都触发）。 */
  onClose?: () => void
  /** 初始宽度（px，默认 460）。 */
  width?: number
  /** 宽度下限（默认 320）。 */
  minWidth?: number
  /** 宽度上限；不传 = 只受视口与主区保底约束。 */
  maxWidth?: number
  /** 拖宽时给主区留的最小宽度（px，默认 480）。 */
  mainMinWidth?: number
  /** 面板无障碍名（没有头部，只用于 aria-label）。 */
  title?: string
  /** 工作区根缓存（与调用方共享时传）。 */
  rootCache?: RootCache
  translate?: Translate
  /**
   * **必填**：挂进哪个布局容器（`PanelDock` 是布局成员 —— 占宽度、把左边挤窄）。
   *
   * 传入的应当是**你自己的 flex 行**（页面主区 + 侧栏那一层）：核心 dock 会成为它的
   * 最后一个 flex 子项，于是主区被真正挤窄。**不要**传 `document.body` 再自己套 fixed
   * —— 那是浮层，不是分栏（用户 2026-10-21 明确否决）。
   */
  mount: HTMLElement
}

/**
 * 预览体：`openFilePreview` 的 FileBrowser 包裹层。职责只有一个——**切工作区**：
 * ▾ 下拉点工作区 ⇒ 换该工作区的锚点会话、key 重挂载、path 回根。
 * 机制同兄弟项目 `dsh-task-dispatch-table/src/client/task-editor.tsx:2496-2508`：
 * list 的根来自 sessionId ⇒ 必须换会话 + 重挂载，只换 rootName 等于没切。
 * 没会话的工作区不进 ▾ 列表、点了也不切（宿主列不出文件，不给假入口）。
 *
 * 工作区清单：调用方显式传的 `workspaceAnchors` 优先；否则用宿主 workspaces 快照
 * （connectHost 注入的 workspaceList）——**调用方什么都不传也照常能切**。
 *
 * 「当前工作区」必须与面包屑根名同源（`workspaceAnchorForPath` 匹配优先，其次 rootName）：
 * 曾经这里直接拿 `rootName` 当初始状态，而 ▾ 菜单把 anchorMatch.title 当当前区；两者不一致时
 * 点 rootName 那个工作区 = setState 成同一个值 ⇒ React bail out ⇒ **点了完全没反应**（2026-10-23 真机）。
 * 同理「切没切」不能用「名字变没变」判断：点回入口工作区会把 path 又还原成入口文件，
 * 看起来就是「跳回第一个工作区」。现在改成「点过 = 进浏览态」，任何工作区（含入口那个）都回根。
 */
function PreviewBody(props: { options: OpenFilePreviewOptions; onClose: () => void }): ReactNode {
  const options = props.options
  const hostWorkspaces = useSyncExternalStore(workspaceList.subscribe, workspaceList.getSnapshot)
  // HostWorkspaceItem 结构兼容 WorkspaceAnchorItem（多一个 workspaceId 无害）⇒ 统一注解收敛联合类型。
  const anchors: readonly WorkspaceAnchorItem[] = options.workspaceAnchors ?? hostWorkspaces
  // 入口工作区：与 FileBrowser 的面包屑根名同源（两边口径必须一致，见上方注释）。
  const entryTitle = workspaceAnchorForPath(options.path ?? '', anchors)?.title ?? options.rootName ?? ''
  // null = 还在入口态（path 用调用方给的那个文件）；非 null = 用户点过工作区，从它的根开始列。
  const [picked, setPicked] = useState<string | null>(null)
  const wsTitle = picked ?? entryTitle
  const sessionId = anchorSessionForTitle(anchors, wsTitle) ?? options.sessionId!
  const switchable = anchors.filter((a) => (a.sessionIds?.length ?? 0) > 0).map((a) => a.title)
  return h(FileBrowser, {
    // key 带工作区+会话 ⇒ 切换即重挂载（FileBrowser 的 dir/listing/学根全属于旧工作区）。
    key: `${wsTitle}:${sessionId}`,
    workspaceFiles: options.workspaceFiles!,
    officeToPdf: options.officeToPdf ?? null,
    sessionId,
    // 点过工作区就从它的根列（原 path 属于旧工作区，带着只会 404 / 跳回入口文件）。
    path: picked === null ? options.path! : '',
    rootName: wsTitle === '' ? options.rootName : wsTitle,
    workspaces: switchable.length > 0 ? switchable : options.workspaces,
    onSelectWorkspace: (name: string) => {
      // 没会话的工作区列不出文件 ⇒ 不切（宿主能力边界，不给假入口）。
      if (anchorSessionForTitle(anchors, name) === null) return
      setPicked(name)
    },
    // 空数组别传：会把 FileBrowser 内部「回落快照」的兜底挡住（空 ≠ 未传）。
    workspaceAnchors: anchors.length > 0 ? anchors : undefined,
    rootCache: options.rootCache,
    translate: options.translate,
    // 传 onClose ⇒ FileBrowser 在面包屑行尾渲染自己的 ✕（垂直居中，与 pick 一致）。
    onClose: props.onClose,
    style: { height: '100%', minHeight: 0 },
  })
}

/** 预览侧边栏的挂载容器 id（全站唯一，重复打开先关旧的）。 */
const PREVIEW_HOST_ID = 'dshpc-file-preview-host'
/** dock 里的面板 id（本 container 里只有一个）。 */
const PREVIEW_PANEL_ID = 'file-preview'
/** 当前打开着的预览的 close（重复打开时走它，保证 React 根被真正卸载）。 */
let activePreviewClose: (() => void) | null = null

/**
 * 打开工作区文件/文件夹的**停靠**预览（分栏：挤窄 `mount` 左边的兄弟，不是盖上去）。
 * 重复打开会关掉上一个（同侧边栏位）。
 */
export function openFilePreview(options: OpenFilePreviewOptions): FilePreviewHandle | null {
  if (typeof document === 'undefined') return null
  // 布局契约自检：PanelDock 是布局成员，mount 必须是 flex 行，否则 dock 不停右侧、高度也塌。
  // 只 dev 期警告、不改行为——消费方传错时至少留痕，别静默破相。
  if (typeof getComputedStyle === 'function') {
    const cs = getComputedStyle(options.mount)
    if (cs.display !== 'flex' && cs.display !== 'inline-flex') {
      console.warn(
        '[dsh-plugin-core/explorer] openFilePreview: mount 不是 flex 行 —— PanelDock 是布局成员'
        + '（停靠右侧 + 挤窄主区）。请传你页面「主区 + 侧栏」那一层 flex 容器，'
        + '不要传 document.body 或无定高的窄容器。',
      )
    }
  }
  // 同位置只允许一个预览：先**关**旧的（不是 remove 掉挂载体）。
  // 直接 remove 会把 React 根的卸载清理一起跳过 ⇒ PanelDock 永远不回收它发布的宽度，
  // 遮罩从此卡在让位状态（2026-10-22 真机：点第二个文件链接后再关，遮罩不回弹）。
  activePreviewClose?.()

  const container = document.createElement('div')
  container.id = PREVIEW_HOST_ID
  container.setAttribute('data-dshpc-file-preview', '')
  // display:contents ⇒ 容器自身不产生盒子，核心 .dshpc-dock 直接成为 mount 的 flex 子项
  // （这样才「挤」得动左边的兄弟；套一层真盒子会把 dock 变成 mount 的整行块）。
  container.style.cssText = 'display:contents'
  options.mount.appendChild(container)

  const dock = createPanelDock({
    maxPanels: 1,
    defaultWidth: options.width ?? 460,
    minWidth: options.minWidth ?? 320,
    // 每次打开都从默认宽度起步（预览是临时面板，不继承上次的落位）。
    storageKey: false,
    // 关钮被点 ⇒ 整个挂载体回收（close 内部幂等，不受 onClose 回调顺序影响）。
    onClose: () => {
      close()
    },
  })
  dock.open(PREVIEW_PANEL_ID)

  let closed = false
  const root: Root = createRoot(container)
  const close = (): void => {
    if (closed) return
    closed = true
    if (activePreviewClose === close) activePreviewClose = null
    window.removeEventListener('keydown', onKeyDown)
    root.unmount()
    container.remove()
    options.onClose?.()
  }
  const onKeyDown = (event: KeyboardEvent): void => {
    if (event.key === 'Escape') close()
  }
  window.addEventListener('keydown', onKeyDown)

  ensureControls(getStyleKit())
  // 总是走 PreviewBody：调用方没自接 onSelectWorkspace 时，▾ 下拉「切工作区」由核心接管
  // （anchors 为空 ⇒ 回调空转，行为与旧版一致）。自接了 ⇒ 原样透传给 FileBrowser。
  const internalSwitch = options.onSelectWorkspace === undefined
  root.render(
    h(
      'div',
      // 高度吃调用方给的 --dshpc-dock-h（demo 的页面行给 100%）；退化成视口高是整页场景。
      { style: { display: 'contents', ['--dshpc-dock-h' as string]: '100%' } },
      h(
        PanelDock,
        { dock, mainMinWidth: options.mainMinWidth ?? 480, translate: options.translate },
        h(
          DockPanel,
          {
            id: PREVIEW_PANEL_ID,
            // 不要头部（用户 2026-10-21：核心的『无 header』那版）——上面不再多一条线。
            header: null,
            // 关闭钮不用核心浮动的（那是 absolute 固定偏移、不垂直居中）；关掉它的，
            // 改用 FileBrowser 自己的 ✕（和 pick 弹窗同一个 crumb-bar 钮，垂直居中）。
            closeButton: 'none',
            ariaLabel: options.title,
            width: options.width ?? 460,
            minWidth: options.minWidth ?? 320,
            maxWidth: options.maxWidth,
          },
          options.content !== undefined
            ? options.content()
            : internalSwitch
              ? h(PreviewBody, { options, onClose: close })
              : h(FileBrowser, {
                workspaceFiles: options.workspaceFiles!,
                officeToPdf: options.officeToPdf ?? null,
                sessionId: options.sessionId!,
                path: options.path!,
                rootName: options.rootName,
                workspaces: options.workspaces,
                workspaceAnchors: options.workspaceAnchors,
                onSelectWorkspace: options.onSelectWorkspace,
                rootCache: options.rootCache,
                translate: options.translate,
                // 传 onClose ⇒ FileBrowser 在面包屑行尾渲染自己的 ✕（垂直居中，与 pick 一致）。
                onClose: close,
                style: { height: '100%', minHeight: 0 },
              }),
        ),
      ),
    ),
  )
  activePreviewClose = close
  return { close, path: options.path ?? '' }
}

// ── 方法 B：弹窗选择文件 ──

export interface PickedFile {
  /** 工作区相对路径。 */
  path: string
  /** true = 选的是整个文件夹。 */
  isDir: boolean
}

export interface PickWorkspaceFileOptions {
  workspaceFiles: WorkspaceFilesFace
  sessionId: string
  /** 锚点元素：弹窗左缘与之对齐、优先落在它**下方**（下方不够才翻到上方）；不传 = 屏幕居中。 */
  anchor?: HTMLElement | null
  /** 过滤：exts = 只要这些扩展名（小写无点）；dirs = 只要文件夹；不传 = 不限。 */
  filter?: PickFilter
  officeToPdf?: OfficeToPdfFace | null
  /** 工作区根显示名。 */
  rootName?: string
  /** ▾ 下拉的工作区清单（切换工作区浏览）。 */
  workspaces?: readonly string[]
  onSelectWorkspace?: (name: string) => void
  /** 取消回调（Esc / 点外部 / ✕）。 */
  onCancel?: () => void
  rootCache?: RootCache
  /**
   * 文案注入：调用时把自己的 `t` 传进来，面板里所有文字（含「选择」「进入」、空态、错误文案）
   * 就走你的字典；不传则用核心内置中英字典。**与 openFilePreview 同一个 prop、同一套文案**。
   */
  translate?: Translate
}

/** 弹窗宽度（源实现 480，用户 2026-09-29 微调定值）。 */
const PICKER_WIDTH = 480
/** 弹窗高度上限 / 保底。 */
const PICKER_MAX_H = 660
/** 判定「下方放得下」的最小高度：低于它就翻到上方。 */
const PICKER_MIN_H = 240
/** 硬地板：锚点上下都极窄时也要给出一个能滚动的高度（此时以夹紧进视口优先）。 */
const PICKER_MIN_FLOOR = 160

/**
 * 弹出「选择工作区文件」模态弹窗，Promise 返回选中结果；取消（Esc / 点外部 / ✕）resolve `null`。
 *
 * **面板内容与 `openFilePreview` 完完全全是同一个 `FileBrowser`**（不是复制一套）：
 * 差别只有 ① 承载（这里挂在锚点旁的弹窗面板里，那边挂在核心 PanelDock 分栏里）、
 * ② `picker` 形态参数（点文件即回传、行尾按钮变「选择」）。文案 / 根名 / 过滤都按调用时传的走。
 */
export function pickWorkspaceFile(options: PickWorkspaceFileOptions): Promise<PickedFile | null> {
  return new Promise<PickedFile | null>((resolve) => {
    if (typeof document === 'undefined') {
      resolve(null)
      return
    }
    let settled = false
    const backdrop = document.createElement('div')
    backdrop.setAttribute('data-dshpc-picker-backdrop', '')
    // 右边界读 PanelDock 发布的 --dshpc-page-inset-right，与 .dshpc-modal-mask 同款：
    // 不把右侧分栏（openFilePreview 的 dock）连同它的分隔线一起压暗（2026-10-23 真机）。
    backdrop.style.cssText = 'position:fixed;inset:0 var(--dshpc-page-inset-right,0px) 0 0;z-index:1099;background:rgba(0,0,0,0.28)'

    const panel = document.createElement('div')
    panel.setAttribute('data-dshpc-picker-panel', '')
    panel.setAttribute('role', 'dialog')
    panel.setAttribute('aria-modal', 'true')
    const anchor = options.anchor ?? null
    if (anchor !== null) {
      const rect = anchor.getBoundingClientRect()
      const GAP = 12
      const vw = window.innerWidth
      const vh = window.innerHeight
      const width = Math.min(PICKER_WIDTH, vw - 2 * GAP)
      // 垂直：先量锚点上下各自还剩多少，再决定往哪边展——高度必须跟着所选那侧的空间走
      // （旧实现先按「上方空间」定高，锚点靠顶时算出个矮条，还硬往上方塞）。
      const availBelow = vh - GAP - rect.bottom - GAP
      const availAbove = rect.top - GAP - GAP
      const below = availBelow >= PICKER_MIN_H || availBelow >= availAbove
      const height = Math.max(Math.min(PICKER_MAX_H, below ? availBelow : availAbove), PICKER_MIN_FLOOR)
      // 水平：与锚点左缘对齐（下拉式），右侧放不下就整体左移，最后夹紧进视口——绝不溢出屏幕
      // （旧实现先往左展、再往右翻，弹窗会横着跑到离按钮很远的地方；改成左缘对齐后
      //  永远贴在所点按钮的正下方，第三方锚点靠左靠右都不会被推出屏外）。
      const left = Math.max(GAP, Math.min(rect.left, vw - GAP - width))
      // 垂直：**优先落在锚点下方**（下缘 + 间距），下方不够才翻到上方（上缘 - 间距 - 高）；
      // 最后再夹紧进视口——绝不溢出，也绝不因为锚点靠顶就默认往上弹。
      const top = below
        ? Math.min(rect.bottom + GAP, Math.max(GAP, vh - GAP - height))
        : Math.max(GAP, rect.top - GAP - height)
      panel.style.cssText =
        'position:fixed;z-index:1100;display:flex;flex-direction:column;overflow:hidden;' +
        `left:${Math.round(left)}px;top:${Math.round(top)}px;` +
        `width:${Math.round(width)}px;height:${Math.round(height)}px;` +
        'background:var(--dshpc-surface-2,#fff);border:1px solid var(--dshpc-border,#d0d7de);' +
        'border-radius:8px;box-shadow:var(--dshpc-shadow-2,none)'
    } else {
      panel.style.cssText =
        'position:fixed;z-index:1100;display:flex;flex-direction:column;overflow:hidden;' +
        `width:min(${PICKER_WIDTH}px,calc(100vw - 24px));height:${PICKER_MAX_H}px;` +
        'background:var(--dshpc-surface-2,#fff);border:1px solid var(--dshpc-border,#d0d7de);' +
        'border-radius:8px;box-shadow:var(--dshpc-shadow-2,none)'
    }

    const finish = (result: PickedFile | null): void => {
      if (settled) return
      settled = true
      window.removeEventListener('keydown', onKeyDown)
      backdrop.remove()
      root.unmount()
      panel.remove()
      if (result === null) options.onCancel?.()
      resolve(result)
    }
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') finish(null)
    }
    backdrop.addEventListener('click', () => finish(null))
    window.addEventListener('keydown', onKeyDown)

    document.body.appendChild(backdrop)
    document.body.appendChild(panel)
    ensureControls(getStyleKit())
    const root: Root = createRoot(panel)
    root.render(
      h(FileBrowser, {
        workspaceFiles: options.workspaceFiles,
        officeToPdf: options.officeToPdf ?? null,
        sessionId: options.sessionId,
        path: '',
        rootName: options.rootName,
        rootCache: options.rootCache,
        workspaces: options.workspaces,
        onSelectWorkspace: options.onSelectWorkspace,
        picker: true,
        filter: options.filter,
        translate: options.translate,
        onPick: (path: string, isDir: boolean) => finish({ path, isDir }),
        onClose: () => finish(null),
        style: { flex: '1 1 auto', width: '100%', minWidth: 0, minHeight: 0 },
      }) as ReactNode,
    )
  })
}
