// 两个命令式能力 —— explorer 的对外入口：
//
//  · 方法 A `openFilePreview`：传文件/文件夹路径，打开右侧停靠预览（可拖宽、Esc 关）；
//  · 方法 B `pickWorkspaceFile`：Promise 返回选中的绝对路径（弹窗在锚点按钮旁弹出，
//    Esc / 点外部 / ✕ 关，选中即 resolve）。
//
// 两者共用同一套 FileBrowser 面板（用户 2026-10-20 拍板：同一套内容，两种展现形式）。
// 数据面 = 只读 FS 面（`src/host/fs-route.ts` 的 client 侧），**浏览不吃会话**；
// 会话只在两处出现：Office 预览（懒取一条）与相对路径的基准。
//
// ⚠️ 方法 A 的**侧边栏本体是核心 PanelDock**（用户 2026-10-21 拍板：不许自绘制外壳 + 拖拽条）。
// PanelDock 是布局成员（占宽度、挤窄主区），同 ui/modal-host.ts 的做法：自建 container 挂 + createRoot，
// 关闭即卸载回收，不残留空根；拖宽与关闭交给 PanelDock 自己的 resizer / header 关钮。
import { createElement as h, Fragment, type CSSProperties, type ReactNode } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { workspaceList } from '../ui/host-data.js'
import { DockPanel, PanelDock, createPanelDock } from '../ui/PanelDock.js'
import { type Translate } from '../utils/i18n.js'
import { FileBrowser } from './FileBrowser.js'
import { getFsFace } from './fs-face.js'
import { PICKER_MAX_H, PICKER_WIDTH, placePicker, type PickPlacement } from './picker-placement.js'
import { isAbsoluteish, normalizePath, workspaceOfPath } from './types.js'
import type { OfficeToPdfFace, PickedPath, PickFilter, WorkspaceAnchorItem } from './types.js'
import { ensureComponentStyles, getStyleKit } from '../ui/css.js'
import { PANEL_DOCK_CSS } from '../ui/panel-dock-css.js'
import { FEEDBACK_CSS } from '../ui/feedback-css.js'
import { OverlayMask } from '../ui/overlay.js'
import { PanelSurface } from '../ui/panel.js'

type Anchors = readonly WorkspaceAnchorItem[]

/**
 * 入参路径解析成**绝对路径**（`''` = 虚拟根）。用户 2026-11-03 定：绝对/相对都收。
 *
 * 相对路径必须有一个基准：显式 `sessionId` 所属工作区优先，其次「最近有会话的工作区」。
 * 解析不出 ⇒ `null`（调用方提示 `explorerNoBase`，不猜）。
 */
export function resolveStartPath(path: string, anchors: Anchors, sessionId?: string): string | null {
  if (path === '') return ''
  if (isAbsoluteish(path)) return normalizePath(path)
  const owner = sessionId === undefined
    ? undefined
    : anchors.find((item) => item.sessionIds?.includes(sessionId) === true && item.path !== undefined)
  const base = owner?.path ?? anchors.find((item) => item.path !== undefined)?.path
  if (base === undefined) return null
  return normalizePath(`${normalizePath(base)}/${path.replace(/^\/+/, '')}`)
}

/**
 * 给 `FileBrowser` 的 `rootPath`：路径所属工作区的真实根（dock 与 picker 共用这一份推导）。
 * 顺序 = 当前路径命中 > 指定会话所属 > 第一个带 path 的工作区（2026-11-03 从两处重复代码合并）。
 */
function rootPathOf(path: string, anchors: Anchors, sessionId?: string): string | undefined {
  return workspaceOfPath(path, anchors)?.path
    ?? (sessionId === undefined
      ? undefined
      : anchors.find((item) => item.sessionIds?.includes(sessionId) === true)?.path)
    ?? anchors.find((item) => item.path !== undefined)?.path
}

function warnNotWired(api: 'openFilePreview' | 'pickWorkspaceFile', filesMissing: boolean): void {
  console.warn(
    `[dsh-plugin-core/explorer] ${api}: `
    + (filesMissing
      ? '没有文件面（client apply 里没调 connectFs，或宿主没注册 serveFsRoute）'
      : '相对路径找不到工作区基准（宿主 workspaces 里没有带 path 的工作区）')
    + ' ⇒ 放弃本次操作',
  )
}

// ── 方法 A：侧边栏预览 ──

export interface FilePreviewHandle {
  /** 关闭预览（幂等）。 */
  close(): void
  /** 当前预览的路径（调用方传入值）。 */
  readonly path: string
}

export interface OpenFilePreviewOptions {
  /** 文件或文件夹路径：绝对 / 工作区相对都收；`''` = 从根节点（工作区清单 + 盘符）开。 */
  path?: string
  /**
   * 自定义审阅内容：传入则核心渲染它进右侧 dock，**替代**内置 FileBrowser（解耦用途——
   * 例如把「某次改动的 diff」当内容塞进来，核心本身不认识 changes）。与 `path` 二选一。
   */
  content?: () => ReactNode
  officeToPdf?: OfficeToPdfFace | null
  /** 相对路径的基准工作区（也是 Office 预览用的会话）。可省。 */
  sessionId?: string
  /** 工作区根显示名（面包屑第一段的兜底）。 */
  rootName?: string
  /** 相对路径 / 面包屑的基准目录；不传 = 按路径匹配出的工作区根。 */
  rootPath?: string
  /** ▾ 下拉顶部的工作区清单（显示名）；不传 = 宿主快照里的全部。 */
  workspaces?: readonly string[]
  /**
   * 宿主工作区清单（带绝对 path）：**可选覆盖**。不传 = 自动用宿主 workspaces 快照
   * （connectHost 注入的 workspaceList）——调用方零传参也能匹配、能切。
   */
  workspaceAnchors?: readonly WorkspaceAnchorItem[]
  /** 从 ▾ 下拉选择其他工作区（核心默认自己开，一般不用接）。 */
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

/** 预览侧边栏的挂载容器 id（全站唯一，重复打开先关旧的）。 */
const PREVIEW_HOST_ID = 'dshpc-file-preview-host'
/** dock 里的面板 id（本 container 里只有一个）。 */
const PREVIEW_PANEL_ID = 'file-preview'
/**
 * 挂载宿主行自动补的类：主区伸展 / 子项不收溢出的规则挂在它下面（`src/ui/panel-dock.css`）。
 * 消费方不必自己写 —— 打开时加、关闭时摘。
 */
const DOCK_HOST_CLASS = 'dshpc-dock-host'
/** 已打开的预览：再打开 = 换内容（必要时换位置），**不重建 DOM** ⇒ 不重播动效、不动宽度。 */
interface ActivePreview {
  /** 挂到哪个宿主行；换容器就地把挂载体搬过去（React 根不动）。 */
  adopt(mount: HTMLElement): void
  /** 换内容前把用户拖好的宽度钉回 dock 状态（重画不许把它改回默认值）。 */
  keepWidth(): void
  draw(options: OpenFilePreviewOptions, start: string): void
  close(): void
}
let activePreview: ActivePreview | null = null

/**
 * 打开工作区文件/文件夹的**停靠**预览（分栏：挤窄 `mount` 左边的兄弟，不是盖上去）。
 * 重复打开会关掉上一个（同侧边栏位）。
 *
 * 消费方最少写法（`connectHost(ctx)` + `connectFs({ path })` 已接线）：
 * `openFilePreview({ mount, path })` —— 路径解析、工作区匹配都由核心自己解。
 */
export function openFilePreview(options: OpenFilePreviewOptions): FilePreviewHandle | null {
  if (typeof document === 'undefined') return null
  const custom = options.content !== undefined
  const files = getFsFace()
  const anchors: Anchors = options.workspaceAnchors ?? workspaceList.getSnapshot()
  if (!custom && files === undefined) {
    warnNotWired('openFilePreview', true)
    return null
  }
  const start = custom ? '' : resolveStartPath(options.path ?? '', anchors, options.sessionId)
  if (!custom && start === null) {
    warnNotWired('openFilePreview', false)
    return null
  }
  // rootPath 的推导只有一份（`rootPathOf`）；调用方显式给了就听调用方的。
  const opts: OpenFilePreviewOptions = {
    ...options,
    rootPath: options.rootPath ?? rootPathOf(start ?? '', anchors, options.sessionId),
  }

  // 只允许一个预览。**已经开着 ⇒ 换内容**（用户 2026-10-28：侧栏已经在那了，点别的文件就该
  // 直接切 —— 不重播展开动效、也不改用户拖好的宽度）。换页面 / 换容器就地把挂载体搬过去。
  if (activePreview !== null) {
    activePreview.keepWidth()
    activePreview.adopt(opts.mount)
    activePreview.draw(opts, start ?? '')
    return { close: activePreview.close, path: opts.path ?? '' }
  }

  const container = document.createElement('div')
  container.id = PREVIEW_HOST_ID
  container.setAttribute('data-dshpc-file-preview', '')
  // display:contents ⇒ 容器自身不产生盒子，核心 .dshpc-dock 直接成为 mount 的 flex 子项
  // （这样才「挤」得动左边的兄弟；套一层真盒子会把 dock 变成 mount 的整行块）。
  container.style.cssText = 'display:contents'

  // 布局自愈：那行不必自己写成 flex —— 核心补（换位置 / 关闭时还原），只对「本来就是别的布局」不动手。
  let hostEl: HTMLElement | null = null
  let hostPrevDisplay = ''
  let hostHadClass = false
  const restoreHost = (): void => {
    if (hostEl === null) return
    hostEl.style.display = hostPrevDisplay
    if (!hostHadClass) hostEl.classList.remove(DOCK_HOST_CLASS)
    hostEl = null
  }
  const adopt = (next: HTMLElement): void => {
    if (next === hostEl) return
    restoreHost()
    // 唯一仍算错的是传 body（那是浮层，不是分栏），只留痕不改行为。
    if (next === document.body) {
      console.warn(
        '[dsh-plugin-core/explorer] openFilePreview: 不要传 document.body —— PanelDock 是布局成员'
        + '（停靠右侧 + 挤窄主区）。请传你页面里包住主区的那个元素。',
      )
    }
    hostPrevDisplay = next.style.display
    hostHadClass = next.classList.contains(DOCK_HOST_CLASS)
    next.classList.add(DOCK_HOST_CLASS)
    const display = typeof getComputedStyle === 'function' ? getComputedStyle(next).display : ''
    if (display !== 'flex' && display !== 'inline-flex') next.style.display = 'flex'
    // 已在文档里的节点 appendChild 就是「移动」，React 根不受影响。
    next.appendChild(container)
    hostEl = next
  }
  adopt(options.mount)

  const dock = createPanelDock({
    maxPanels: 1,
    defaultWidth: options.width ?? 460,
    minWidth: options.minWidth ?? 320,
    // 宽度按面板 id 记（用户 2026-10-28：拖过一次，下次弹出还是这个宽）。
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
    if (activePreview?.close === close) activePreview = null
    window.removeEventListener('keydown', onKeyDown)
    root.unmount()
    container.remove()
    // 还原 mount：只撤销我们自己加的那点，关掉后页面回到原样。
    restoreHost()
    options.onClose?.()
  }
  const onKeyDown = (event: KeyboardEvent): void => {
    if (event.key === 'Escape') close()
  }
  window.addEventListener('keydown', onKeyDown)

  ensureComponentStyles('panel-dock', PANEL_DOCK_CSS, getStyleKit())
  ensureComponentStyles('feedback', FEEDBACK_CSS, getStyleKit())
  // 宽度归用户：换内容前把当前渲染宽度钉回去（dock 状态里本该有，显式再钉一次；
  // 入场动效期间量到的是动画中间值，低于下限一律忽略，免得把栏钉窄）。
  let pinnedWidth: number | null = null
  const keepWidth = (): void => {
    const panel = container.querySelector<HTMLElement>('.dshpc-dock__panel')
    if (panel === null) return
    const width = Math.round(panel.getBoundingClientRect().width)
    if (width < (options.minWidth ?? 320)) return
    pinnedWidth = width
    dock.setWidth(PREVIEW_PANEL_ID, width)
  }
  // 画（可重画：同一个 dock 换内容时只重渲染，不重建 DOM ⇒ 不重播展开动效）。
  // ⚠️ 内层**不重挂**：以前 key 带序号，点一次文件整棵 FileBrowser 重来——
  // 目录树 / 展开态 / 滚动位置全丢，还多打一次 list。现在序号改走 revision prop。
  let openSeq = 0
  const draw = (o: OpenFilePreviewOptions, start: string): void => {
    // 用户把它收起来过 ⇒ 再点文件要自动弹回来（收着还换内容，等于点了没反应 —— 2026-10-28 真机）。
    if (dock.isCollapsed(PREVIEW_PANEL_ID)) dock.expand(PREVIEW_PANEL_ID)
    const revision = ++openSeq
    root.render(
      h(
        'div',
        // 高度吃调用方给的 --dshpc-dock-h（demo 的页面行给 100%）；退化成视口高是整页场景。
        { style: { display: 'contents', ['--dshpc-dock-h' as string]: '100%' } },
        h(
          PanelDock,
          { dock, mainMinWidth: o.mainMinWidth ?? 480, translate: o.translate },
          h(
            DockPanel,
            {
              id: PREVIEW_PANEL_ID,
              // 不要头部（用户 2026-10-21：核心的『无 header』那版）——上面不再多一条线。
              header: null,
              // 关闭钮不用核心浮动的（那是 absolute 固定偏移、不垂直居中）；关掉它的，
              // 改用 FileBrowser 自己的 ✕（和 pick 弹窗同一个 crumb-bar 钮，垂直居中）。
              closeButton: 'none',
              ariaLabel: o.title,
              // 重画时沿用用户拖出来的宽度（pinnedWidth），不回到默认值。
              width: pinnedWidth ?? o.width ?? 460,
              minWidth: o.minWidth ?? 320,
              maxWidth: o.maxWidth,
            },
            o.content !== undefined
              // 自定义内容保持旧语义：每次打开都重挂（内容自带状态时不会被上一次残留）。
              ? h(Fragment, { key: `custom:${revision}` }, o.content())
              : h(FileBrowser, {
                  files: getFsFace()!,
                  officeToPdf: o.officeToPdf ?? null,
                    path: start,
                  revision,
                  workspaces: o.workspaces,
                  workspaceAnchors: o.workspaceAnchors,
                  onSelectWorkspace: o.onSelectWorkspace,
                  translate: o.translate,
                  // 传 onClose ⇒ FileBrowser 在面包屑行尾渲染自己的 ✕（垂直居中，与 pick 一致）。
                  onClose: close,
                  style: { height: '100%', minHeight: 0 },
                }),
          ),
        ),
      ),
    )
  }
  draw(opts, start ?? '')
  activePreview = { adopt, keepWidth, draw, close }
  return { close, path: opts.path ?? '' }
}

// ── 方法 B：弹窗选择文件 ──

/** 兼容旧名：`PickedPath` 的前身（`path` 现在是绝对路径）。 */
export type PickedFile = PickedPath

export interface PickWorkspaceFileOptions {
  /** 锚点元素：弹窗贴着它弹（具体方位见 `placement`）；不传 = 屏幕居中。 */
  anchor?: HTMLElement | null
  /**
   * 展开方位（用户 2026-11-03 定），八档 + 默认 `'auto'`：
   *
   * | 值 | 面板落点 |
   * |---|---|
   * | `auto` | 旧行为：优先下方，下方不够翻上方，横向夹紧（不传就是它） |
   * | `bottom-start` / `bottom-end` | 按钮下方，左缘 / 右缘对齐 |
   * | `top-start` / `top-end` | 按钮上方，左缘 / 右缘对齐 |
   * | `right-start` / `right-end` | 按钮右侧，顶边 / 底边齐平 |
   * | `left-start` / `left-end` | 按钮左侧，顶边 / 底边齐平 |
   *
   * 方位是**优先**而非焊死（用户 2026-11-03）：该侧放得下就照它（按钮贴定宽区右边界时传
   * `bottom-end` / `left-start`，面板不会向右溢出）；该侧放不下、对侧放得下 ⇒ **自动翻边**
   * （bottom↔top、left↔right，对齐轴不变）；两侧都放不下 ⇒ 守原方位再夹紧进视口。
   */
  placement?: PickPlacement
  /** 过滤：exts = 只要这些扩展名（小写无点）；dirs = 只要文件夹；不传 = 不限。 */
  filter?: PickFilter
  officeToPdf?: OfficeToPdfFace | null
  /** 起步位置：绝对 / 相对路径都收；不传 = 根节点（工作区清单 + 盘符）。 */
  path?: string
  /** 相对路径的基准工作区（也是 Office 预览用的会话）。可省。 */
  sessionId?: string
  /** 工作区根显示名（面包屑第一段的兜底）。 */
  rootName?: string
  /** 相对路径 / 面包屑的基准目录；不传 = 按路径匹配出的工作区根。 */
  rootPath?: string
  /** ▾ 下拉的工作区清单（切换工作区浏览）。 */
  workspaces?: readonly string[]
  onSelectWorkspace?: (name: string) => void
  /** 取消回调（Esc / 点外部 / ✕）。 */
  onCancel?: () => void
  /**
   * 文案注入：调用时把自己的 `t` 传进来，面板里所有文字（就走你的字典）；不传则用核心内置中英字典。
   */
  translate?: Translate
}

/** 方位类型对外透出：消费方写 `placement` 时不必再 import 内部模块。 */
export type { PickPlacement }

/**
 * 弹出「选择文件」模态弹窗，Promise 返回选中结果；取消（Esc / 点外部 / ✕）resolve `null`。
 *
 * **面板内容与 `openFilePreview` 完完全全是同一个 `FileBrowser`**（不是复制一套）：
 * 差别只有 ① 承载（这里挂在锚点旁的弹窗面板里，那边挂在核心 PanelDock 分栏里）、
 * ② `picker` 形态参数（点文件即回传、行尾按钮变「选择」）。
 */
export function pickWorkspaceFile(options: PickWorkspaceFileOptions): Promise<PickedPath | null> {
  return new Promise<PickedPath | null>((resolve) => {
    if (typeof document === 'undefined') {
      resolve(null)
      return
    }
    const files = getFsFace()
    const anchors: Anchors = workspaceList.getSnapshot()
    if (files === undefined) {
      warnNotWired('pickWorkspaceFile', true)
      resolve(null)
      return
    }
    const start = resolveStartPath(options.path ?? '', anchors, options.sessionId)
    if (start === null) {
      warnNotWired('pickWorkspaceFile', false)
      resolve(null)
      return
    }
    let settled = false
    // 遮罩与面板都走浮层公共件（2026-11-03 皮肤统一）：遮罩 = `OverlayMask('plain')`，
    // 面板 = `PanelSurface('popover')`。这里只算**定位**（贴锚点、上下翻转、夹紧进视口），
    // 底色/描边/圆角/阴影归 panel.css —— 原来内联那套带 `#fff`/`#d0d7de` 兜底，换主题就脱节。
    const panelStyle: CSSProperties = {
      position: 'fixed',
      display: 'flex',
      flexDirection: 'column',
    }
    const anchor = options.anchor ?? null
    if (anchor !== null) {
      // 几何全在纯函数里（`picker-placement.ts`，可单测）：这里只把结果贴到 fixed 面板上。
      const box = placePicker(
        anchor.getBoundingClientRect(),
        { width: window.innerWidth, height: window.innerHeight },
        options.placement ?? 'auto',
      )
      panelStyle.left = box.left
      panelStyle.top = box.top
      panelStyle.width = box.width
      panelStyle.height = box.height
    } else {
      panelStyle.width = `min(${PICKER_WIDTH}px,calc(100vw - 24px))`
      panelStyle.height = PICKER_MAX_H
    }

    const finish = (result: PickedPath | null): void => {
      if (settled) return
      settled = true
      window.removeEventListener('keydown', onKeyDown)
      root.unmount()
      mount.remove()
      if (result === null) options.onCancel?.()
      resolve(result)
    }
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') finish(null)
    }
    window.addEventListener('keydown', onKeyDown)

    const mount = document.createElement('div')
    document.body.appendChild(mount)
    ensureComponentStyles('panel-dock', PANEL_DOCK_CSS, getStyleKit())
    ensureComponentStyles('feedback', FEEDBACK_CSS, getStyleKit())
    const root: Root = createRoot(mount)
    root.render(
      h(
        OverlayMask,
        { kind: 'plain', closeOnMask: true, onClose: () => finish(null), attrs: { 'data-dshpc-picker-backdrop': '' } },
        // `data-dshpc-picker-panel` / `data-dshpc-picker-backdrop` 是既有定位钩子，继续保留。
        h(
          PanelSurface,
          {
            tier: 'popover',
            role: 'dialog',
            attrs: { 'data-dshpc-picker-panel': '', 'aria-modal': 'true' },
            style: panelStyle,
            stopPropagation: true,
          },
          h(FileBrowser, {
            files,
            officeToPdf: options.officeToPdf ?? null,
            path: start,
            rootName: options.rootName,
            sessionId: options.sessionId,
            rootPath: rootPathOf(start, anchors, options.sessionId),
            workspaces: options.workspaces,
            onSelectWorkspace: options.onSelectWorkspace,
            picker: true,
            filter: options.filter,
            translate: options.translate,
            onPick: (picked: PickedPath) => finish(picked),
            onClose: () => finish(null),
            style: { flex: '1 1 auto', width: '100%', minWidth: 0, minHeight: 0 },
          }) as ReactNode,
        ),
      ),
    )
  })
}
