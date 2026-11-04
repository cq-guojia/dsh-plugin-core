// 工作区文件浏览器（U11）：面包屑 + ▾ 选层 + 内联展开目录树 + 文件预览。
//
// 源实现 = 兄弟项目 dsh-task-dispatch-table/src/client/file-browser.tsx（868 行）——本文件是它的
// core 重实现（"抄"不是"复制"）：组件全部换 core 自己的体系，官方件只经 ui/official 消费；
// 修掉源实现的已知问题：根缓存改可注入（原模块级 Map 永不清除）、复制路径补 catch、
// 复制/选中路径口径统一为工作区相对、去掉死代码。
//
// 两个消费场景共用本组件（用户 2026-10-20 拍板：同一套内容，两种展现形式）：
//  · 浏览（dock）：由 **核心 PanelDock** 承载（openFilePreview），拖宽与关闭都由它负责，
//    本组件不再自绘拖拽条 / 侧边栏外壳；
//  · 选择（picker）：`picker` + `onPick(picked)`（`path` 是**绝对路径**，另带工作区归属），点文件即回调。
//
// 控件纪律：能用核心控件的一律核心（ghost 面包屑 / IconButton / Segmented / MarqueeText）；
// 核心没有的那一项 = ▾ 选层浮层，按兄弟项目 dsh-task-dispatch-table 的 `.dsh-tdt-sv-crumbs-*`
// 逐像素照抄（间距 / 圆角 / 最大高度 / 空态），不自创度量。
import {
  createElement as h,
  Fragment,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type ReactNode,
} from 'react'
import {
  IconChevronRightOutlineRegular,
  writeClipboard,
  FileTypeIcon,
} from '../ui/official.js'
import { Button, IconButton } from '../ui/Button.js'
import { workspaceList } from '../ui/host-data.js'
import { useLocale } from '../ui/locale.js'
import { t, type Translate } from '../utils/i18n.js'
import { FilePreview } from './preview/index.js'
import {
  bareCode,
  baseNameOfPath,
  crumbsOfDir,
  createRequestGate,
  dirnameOf,
  errView,
  isAborted,
  isAbsoluteish,
  isFailed,
  joinPath,
  listingOf,
  matchesFilter,
  relativizeToDir,
  sortEntries,
  normalizePath,
  workspaceOfPath,
  type DirEntry,
  type OfficeToPdfFace,
  type PickFilter,
  type PickedPath,
  type RequestGate,
  type WorkspaceAnchorItem,
} from './types.js'
import type { FsFace } from './fs-face.js'
import { ensureComponentStyles } from '../ui/css.js'
import { PANEL_CSS } from '../ui/panel-css.js'
import { EXPLORER_CSS } from './explorer-css.js'
import { crumbsMenuEntries } from './crumbs-menu.js'
import { CrumbNav, PlainNav } from './crumb-nav.js'
import { LandingBody } from './landing.js'
import { PreviewTitleBar } from './preview-title-bar.js'

/**
 * 「根」在 POSIX 上的落点 `/`。Windows 没有这一个根 —— 根层是盘符清单，由宿主 `op:'roots'` 给出
 * （见下面 `roots` 状态），本常量只在 POSIX / 探不到盘符时用。
 */
const FS_ROOT = '/'

/** 子项拉取状态。 */
type ChildData =
  | { status: 'loading' }
  | { status: 'ready'; entries: readonly DirEntry[]; truncated: boolean }
  | { status: 'error'; error: ReturnType<typeof errView> }

export interface FileBrowserProps {
  /** 只读文件面（绝对路径；列目录 / 读文件都走它）。 */
  files: FsFace
  /** 官方 remote.officeToPdf；未就位传 null ⇒ Office 文件出「不可用」空态。 */
  officeToPdf?: OfficeToPdfFace | null
  /** 相对路径的基准目录（工作区根）；不传 ⇒ 只认绝对路径。 */
  rootPath?: string
  /** 只用来判断「默认落哪个工作区」；浏览本身不需要它。 */
  sessionId?: string
  /** 起始路径：目录 ⇒ 直接列；文件 ⇒ 预览态（dir 取父目录，面包屑保留可返回）。 */
  path: string
  /**
   * 重开令牌（`openFilePreview` 每次调用递增）：**同一 path 再点一次**也要回到该文件 /
   * 重读内容，所以初始 effect 依赖它；它只触发重跑，**不重挂组件**（目录树、展开态、滚动位置保留）。
   */
  revision?: number
  /**
   * 关闭回调：**只给没有自己关闭钮的容器**（picker 弹窗）用，第一排才补一枚 ✕。
   * PanelDock 场景不传 —— 面板关闭归壳（用户 2026-11-04 定），内容不承担关闭。
   */
  onClose?: () => void
  /** 工作区根显示名（picker = 调用方选的工作区名）；不传 = 用缓存根的末段。 */
  rootName?: string
  /**
   * ▾ 下拉顶部的工作区清单（可选覆盖）；不传 = 用宿主快照里的工作区标题
   * （picker 与 dock 同一份清单，用户 2026-11-03：两处显示必须一致）。
   */
  workspaces?: readonly string[]
  /**
   * 宿主工作区清单（带绝对 path，`workspaces` 服务快照的消费子集）——**路径 → 会话解析用**：
   * props.path 是绝对路径时，按最长前缀匹配工作区，list 换用该工作区名下的会话 id
   * （官方 list 按 sessionId 解析工作区根，默认 sessionId 的根不含该路径就会被官方判越界）。
   * **可选覆盖**：不传 = 自动用宿主 workspaces 快照（connectHost 注入的 workspaceList）；
   * 快照也没数据（未接线 / 宿主没给）⇒ 不匹配，一切 list 回落 props.sessionId。
   */
  workspaceAnchors?: readonly WorkspaceAnchorItem[]
  /** 从 ▾ 下拉选择其他工作区（点当前工作区 = 回其根目录）。 */
  onSelectWorkspace?: (name: string) => void
  /** 工作区根缓存（可注入；不传 = 内部自建，随组件废弃——不用模块级 Map）。 */
  /** 外部容器样式（嵌入浮层时撑满高度用）。 */
  style?: CSSProperties
  translate?: Translate

  // ── 形态 ──
  /** 选择器态：点文件即 onPick（不进预览）；不传 = 浏览态。 */
  picker?: boolean
  /** 选择器选中回调：path 为**工作区相对**路径，isDir = 选的是整个文件夹。 */
  onPick?: (picked: PickedPath) => void
  /** 选择器过滤（exts = 只要这些扩展名；dirs = 只要文件夹；不传 = 不限）。 */
  filter?: PickFilter
}

/** 目录浏览器面板。详见 {@link FileBrowserProps}。 */
export function FileBrowser(props: FileBrowserProps): ReturnType<typeof h> {
  ensureComponentStyles('explorer', EXPLORER_CSS)
  // ▾ 选层用浮层 menu 档（panel.css）：跟弹窗同一套底色/描边/圆角/阴影。
  ensureComponentStyles('panel', PANEL_CSS)
  // 宿主切语言 ⇒ 重渲（标签文案默认已跟随 `<html lang>`，这里只补「切换后刷新」）。
  useLocale()
  const tt = props.translate ?? t
  const picker = props.picker === true

  // mode：加载/目录树/文件预览/列举错误。viewing 非空 ⇒ 在 dir 树内预览文件。
  const [mode, setMode] = useState<'loading' | 'dir' | 'file' | 'error'>('loading')
  const [dir, setDir] = useState<string>('')
  const [listing, setListing] = useState<readonly DirEntry[] | null>(null)
  const [truncated, setTruncated] = useState(false)
  const [viewing, setViewing] = useState<string | null>(null)
  const [listErr, setListErr] = useState<ReturnType<typeof errView> | null>(null)
  // 面包屑折叠（超宽时只显示当前层名；行首 ▾ 选层常驻）。
  const [crumbsOverflow, setCrumbsOverflow] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const regionRef = useRef<HTMLDivElement>(null)
  const measureRef = useRef<HTMLSpanElement>(null)
  // 预览态：md/html 渲染⇄源码 + 刷新自增（触发预览体重读）。
  const [sourceView, setSourceView] = useState(false)
  const [reloadNonce, setReloadNonce] = useState(0)
  const [copied, setCopied] = useState(false)
  // 内联展开：openDirs = 已展开目录路径集合；childCache = 各展开目录拉到的子项。
  const [openDirs, setOpenDirs] = useState<ReadonlySet<string>>(new Set())
  const [childCache, setChildCache] = useState<Record<string, ChildData>>({})
  // 当前目录在会话工作区之外（官方 list 限工作区内，越界即报 outside-workspace）。
  // 依据 = list 的**真实错误码**，不靠缓存猜（根学不出时会误判成"在区内"）。
  const [outside, setOutside] = useState(false)
  // picker 且路径/会话都没给 ⇒ 落地页：主窗体先列「根目录 + 各工作区」让用户自己选（用户 2026-11-03 定）。
  const [landing, setLanding] = useState(
    props.picker === true && props.path === '' && props.sessionId === undefined,
  )
  const landingRef = useRef(landing)
  useLayoutEffect(() => {
    landingRef.current = landing
  }, [landing])
  const revision = props.revision ?? 0

  // 请求闸门（latest-wins）：顶层列举 / 补学根 各一口；内联展开每个目录一口。
  // begin() 先 abort 上一次，回调用 token.current() 判新旧 ⇒ 连续切换只认最后一次，
  // 旧请求在 wire 上被取消（官方 remote 的 cancellation 形参），不再白读。
  const listGateRef = useRef<RequestGate | null>(null)
  if (listGateRef.current === null) listGateRef.current = createRequestGate()
  const listGate = listGateRef.current
  const childAbortsRef = useRef(new Map<string, AbortController>())
  const abortChildren = useCallback((): void => {
    for (const controller of childAbortsRef.current.values()) controller.abort()
    childAbortsRef.current.clear()
  }, [])
  // 当前已提交的 dir / listing（初始 effect 判「同目录换文件」用 ref，避免把它们加进依赖）。
  const dirRef = useRef('')
  const listingRef = useRef<readonly DirEntry[] | null>(null)
  useLayoutEffect(() => {
    dirRef.current = dir
    listingRef.current = listing
  }, [dir, listing])

  // 路径 → 工作区匹配：props.path 是绝对路径时按最长前缀找出所属工作区，面包屑根名与
  // 相对化就用它（路径本来就在 FS 面里，不需要再「反推工作区根」）。
  // 匹配不到 ⇒ 回落 props.rootName（调用方给的显示名）。
  // 工作区清单来源（优先级从高到低）：① props.workspaceAnchors（调用方显式给，可覆盖）；
  // ② 宿主 workspaces 快照（connectHost 注入的 workspaceList，官方 WorkspaceView 镜像）。
  // 快照异步到达时会重算 + 重跑初始 effect（rootBase 在其依赖里）⇒ 自愈，无感。
  const hostWorkspaces = useSyncExternalStore(workspaceList.subscribe, workspaceList.getSnapshot)
  const anchors = props.workspaceAnchors ?? hostWorkspaces
  // 根层清单：问宿主要（`op:'roots'`）。POSIX 回 `['/']`；Windows 回盘符 —— **Windows 没有「根目录」
  // 这一个东西，根就是盘符清单**（用户 2026-11-03）。拿不到（文件面没这能力）⇒ 按 POSIX 单根。
  const [roots, setRoots] = useState<readonly string[]>([FS_ROOT])
  useEffect(() => {
    const ask = props.files.roots
    if (ask === undefined) return
    let alive = true
    void Promise.resolve()
      .then(() => ask.call(props.files))
      .then((list) => {
        if (!alive || list.length === 0) return
        // 内容相同就不换引用：调用方每次渲染都给新的 files 对象时，否则会「effect → setState → 渲染 → effect」空转。
        setRoots((prev) => (prev.length === list.length && prev.every((item, index) => item === list[index]) ? prev : list))
      })
      .catch(() => { /* 探不到盘符就保持单根，不弹错 */ })
    return () => { alive = false }
  }, [props.files])
  const anchorMatch = useMemo(() => workspaceOfPath(props.path, anchors), [props.path, anchors])
  /** 相对路径的基准目录（工作区根）：匹配出的工作区 > 调用方给的 > 无（只认绝对路径）。 */
  const sessionAnchor =
    props.sessionId === undefined
      ? null
      : anchors.find((item) => item.sessionIds?.includes(props.sessionId as string) === true) ?? null
  const rootBase =
    anchorMatch?.path ?? props.rootPath ?? sessionAnchor?.path ?? anchors.find((item) => item.path !== undefined)?.path
  /** 任意入参 → 绝对路径（FS 面只认绝对路径）。 */
  const absOf = useCallback(
    (p: string): string => {
      if (isAbsoluteish(p)) return normalizePath(p)
      // '' = 「根」：有工作区基准就是该工作区根，没有就是文件系统根（`/`；Windows 上是当前盘根）。
      if (rootBase === undefined || rootBase === '') return p === '' ? FS_ROOT : p
      return p === '' ? normalizePath(rootBase) : normalizePath(`${rootBase}/${p.replace(/^\/+/, '')}`)
    },
    [rootBase],
  )
  /** 面板回传（绝对路径 + 工作区归属）。 */
  const toPicked = useCallback(
    (p: string, isDir: boolean): PickedPath => {
      const abs = absOf(p)
      const owner = workspaceOfPath(abs, anchors)
      return owner === null
        ? { path: abs, isDir }
        : { path: abs, isDir, workspaceRel: relativizeToDir(abs, owner.path ?? null), workspace: owner.title }
    },
    [absOf, anchors],
  )

  /** 记一次 list 结果的"是否越界"（outside-workspace / not-found 均视为不可浏览）。 */
  const noteOutside = useCallback((parsed: ReturnType<typeof listingOf>): void => {
    if (parsed === null || parsed === undefined) return
    if (!isFailed(parsed)) {
      setOutside(false)
      return
    }
    const code = bareCode(parsed.failed)
    if (code === 'outside-workspace' || code === 'not-found') setOutside(true)
  }, [])

  /** 列举某目录并展示（清空 viewing；收起下拉）。 */
  const fetchDir = useCallback(
    (targetDir: string): void => {
      const token = listGate.begin()
      abortChildren()
      const absTarget = absOf(targetDir)
      setDir(absTarget)
      setViewing(null)
      setListErr(null)
      setMenuOpen(false)
      setMode('loading')
      // 切换顶层目录：清空内联展开态（展开树只属于当前这一层）。
      setOpenDirs(new Set())
      setChildCache({})
      props.files
        .list(absTarget, token.signal)
        .then((result) => {
          if (!token.current()) return
          const parsed = listingOf(result)
          noteOutside(parsed)
          if (isFailed(parsed)) {
            setListErr(errView(parsed.failed))
            setMode('error')
            return
          }
          if (parsed === null) {
            setListErr({ key: 'previewBadPayload' })
            setMode('error')
            return
          }
          setListing(parsed.entries)
          setTruncated(parsed.truncated)
          setMode('dir')
        })
        .catch((error: unknown) => {
          if (isAborted(token.signal, error)) return
          setListErr(errView(error))
          setMode('error')
        })
    },
    [abortChildren, absOf, listGate, noteOutside, props.files],
  )

  /** 进入某目录；点到当前目录本身 = 重列本层（刷新）。 */
  const loadDir = useCallback(
    (targetDir: string): void => {
      // 落地页上点 ▾ 选根目录 / 工作区：必须先退出落地页，否则主体还是落地页那张表，
      // 点了跟没点一样（用户 2026-11-03 真机："选里面的任何一个都没有任何效果"）。
      if (landingRef.current) setLanding(false)
      fetchDir(targetDir)
    },
    [fetchDir],
  )

  // 初次进入（path 可能是文件或目录）：
  // list(path) 成功 ⇒ 目录树（dir 尽量取宿主绝对路径 ⇒ 面包屑从工作区根往下列）；
  // 报错 ⇒ 文件预览态（dir = 父目录，面包屑保留可返回）。
  // ⚠️ 切勿改用服务端 list 返回的 path 当面包屑：那是 workspacePathOf 的工作区**相对**形式，
  //    会丢掉根以下的前导段，面包屑只剩最近一层（源实现 2026-09-29 踩过 ⇒ 已回退为入参路径）。
  useEffect(() => {
    // 落地页（还没选根目录/工作区）：什么都不列，等用户点。
    // 用 ref 读、**不进依赖**：否则从落地页点进目录那一刻 landing 变 false 会重跑本 effect，
    // 又把目录拉回 absOf('') = 第一个工作区（真机 2026-11-03）。
    if (landingRef.current) return
    // 同目录换文件（侧栏连点 / 重开同一文件）：只换 viewing——目录树、展开态、滚动位置保留，
    // 也不再额外触发一次 list。旧目录列举已由上一轮 effect 的清理函数 abort。
    // 判据用 listingRef（不是 props.path 的类型）：只有「当前已列出的这一层里确实有这个文件」
    // 才走捷径，目录路径/相对名对不上时照旧走完整初始流程（不改变既有语义）。
    const parent = dirnameOf(props.path)
    const name = baseNameOfPath(props.path)
    const knownFile = listingRef.current?.some((entry) => entry.name === name && entry.type === 'file') === true
    if (props.path !== '' && dirRef.current !== '' && parent === dirRef.current && knownFile) {
      setViewing(absOf(props.path))
      setMode('file')
      setSourceView(false)
      // 同路径再点一次也要重读内容（对齐旧版「每次打开都重读」；不重挂只换 key）。
      setReloadNonce((n) => n + 1)
      setListErr(null)
      setMenuOpen(false)
      return
    }

    const token = listGate.begin()
    abortChildren()
    setMode('loading')
    setListErr(null)
    setViewing(null)
    setSourceView(false)
    setReloadNonce(0)
    setMenuOpen(false)
    setOpenDirs(new Set())
    setChildCache({})

    const entry = absOf(props.path)

    props.files
      .list(entry, token.signal)
      .then((result) => {
        if (!token.current()) return
        const parsed = listingOf(result)
        if (!isFailed(parsed) && parsed !== null) {
          setOutside(false)
          setDir(entry)
          setListing(parsed.entries)
          setTruncated(parsed.truncated)
          setMode('dir')
          return
        }
        // 不是目录 ⇒ 当作文件预览，dir 取父目录，尽量把父树也列出来。
        const parentDir = dirnameOf(entry)
        setDir(parentDir)
        setViewing(entry)
        setMode('file')
        props.files
          .list(parentDir, token.signal)
          .then((pres) => {
            if (!token.current()) return
            const pl = listingOf(pres)
            noteOutside(pl)
            if (!isFailed(pl) && pl !== null) {
              setListing(pl.entries)
              setTruncated(pl.truncated)
            }
          })
          .catch(() => {
            /* 父树列不出不影响文件预览（取消同样静默） */
          })
      })
      .catch((error: unknown) => {
        if (!token.current() || isAborted(token.signal, error)) return
        // 传输层失败：仍尝试按文件预览（预览体内部会给出错误态）。
        setDir(dirnameOf(entry))
        setViewing(entry)
        setMode('file')
      })
    return () => {
      listGate.abort()
    }
    // ⚠️ 这里**不** abort 内联展开的子请求：同目录换文件时它们仍然有效（树也保留着）。
    // 子请求只在「换顶层目录」（fetchDir）与卸载时取消。
  }, [abortChildren, absOf, listGate, noteOutside, props.files, props.path, revision])

  // 卸载时把内联展开的在途请求一起取消（依赖为空 ⇒ 只有卸载才跑清理）。
  useEffect(() => () => abortChildren(), [abortChildren])

  /** ▾ 里点别的工作区：调用方没接管就直接列该工作区根（不需要会话）。 */
  const switchWorkspace = useCallback(
    (name: string): void => {
      if (props.onSelectWorkspace !== undefined) {
        props.onSelectWorkspace(name)
        return
      }
      const target = anchors.find((item) => item.title === name)
      if (target?.path !== undefined) loadDir(target.path)
    },
    [anchors, loadDir, props.onSelectWorkspace],
  )

  // 面包屑溢出测量：隐藏测量条渲染与可见态完全相同的 crumb 按钮（含 padding/max-width），
  // 使溢出判定与真实排版一致——不超长时必定还原完整路径。ResizeObserver 同时覆盖
  // dock 宽度变化 / 初次布局。
  useLayoutEffect(() => {
    const region = regionRef.current
    const measure = measureRef.current
    if (region === null || measure === null) return
    const recompute = (): void => {
      setCrumbsOverflow(measure.scrollWidth > region.clientWidth + 1)
    }
    recompute()
    const ro = new ResizeObserver(recompute)
    ro.observe(region)
    return () => ro.disconnect()
  // 依赖要带上「根反推完成」「越界态变化」：这两样会让面包屑从超长绝对路径相对化成
  // 短路径，但若不重算，crumbsOverflow 会卡在首帧的 true（只显示末段），直到下次导航才复原
  // （2026-10-28 真机：打开工作区内的绝对路径，面包屑只剩末段，点一下目录才恢复）。
  }, [dir, viewing, mode, listing, outside])

  const reload = useCallback((): void => {
    if (viewing !== null) {
      setReloadNonce((n) => n + 1)
      return
    }
    loadDir(dir)
  }, [viewing, dir, loadDir])

  const copyPath = useCallback((): void => {
    // 口径统一：复制**工作区相对**路径（与 picker onPick 一致；绝对形态对用户无意义）。
    const target = viewing ?? dir
    if (target === '') return
    const rel = relativizeToDir(target, rootBase ?? null)
    writeClipboard(rel)
      .then((ok) => {
        if (ok) {
          setCopied(true)
          window.setTimeout(() => setCopied(false), 1500)
        }
      })
      .catch(() => {
        /* 剪贴板不可用（非安全上下文等）：静默，不弹错 */
      })
  }, [viewing, dir, rootBase])

  /** 内联展开/收起某目录（点 ▸）：只切展开态，不导航；首次展开才拉子项。 */
  const toggleDir = useCallback(
    (path: string): void => {
      setOpenDirs((prev) => {
        const next = new Set(prev)
        if (next.has(path)) next.delete(path)
        else next.add(path)
        return next
      })
      if (!(path in childCache)) {
        childAbortsRef.current.get(path)?.abort()
        const controller = new AbortController()
        childAbortsRef.current.set(path, controller)
        setChildCache((prev) => ({ ...prev, [path]: { status: 'loading' } }))
        props.files
          .list(absOf(path), controller.signal)
          .then((result) => {
            if (controller.signal.aborted) return
            const parsed = listingOf(result)
            setChildCache((prev) => ({
              ...prev,
              [path]:
                isFailed(parsed) || parsed === null
                  ? { status: 'error', error: errView(isFailed(parsed) ? parsed.failed : undefined) }
                  : { status: 'ready', entries: parsed.entries, truncated: parsed.truncated },
            }))
          })
          .catch((error: unknown) => {
            if (isAborted(controller.signal, error)) return
            setChildCache((prev) => ({ ...prev, [path]: { status: 'error', error: errView(error) } }))
          })
          .finally(() => {
            if (childAbortsRef.current.get(path) === controller) childAbortsRef.current.delete(path)
          })
      }
    },
    [absOf, childCache, props.files],
  )

  // 过滤点名了扩展名 ⇒ 要的是**文件**：目录只作导航（点行就地展开），不给「选择」、也回传不了 isDir。
  // （旧实现「目录永远保留且永远带选择钮」，于是「仅 JS/MD」下出现「文件夹旁边有选择、
  //   MD 文件旁边反而没有」，选中还回传一个文件夹——与过滤语义直接打架。）
  const extsOnly =
    picker && props.filter !== undefined && props.filter.dirs !== true && (props.filter.exts?.length ?? 0) > 0
  /** 选择器里目录是否可选：不限 或 明说 dirs:true 才可选；扩展名过滤下不可选。 */
  const dirPickable = picker && props.onPick !== undefined && !extsOnly

  /** 递归渲染目录树（内联展开）。file = 点开预览（picker = 选中）；dir = ▸ 切展开、行尾钮分派。 */
  const renderTree = useCallback(
    (entries: readonly DirEntry[], baseDir: string): ReactNode =>
      sortEntries(entries).map((entry) => {
        const childPath = joinPath(baseDir, entry.name)
        const isDir = entry.type === 'directory'
        // 选择器过滤：不匹配的文件不渲染（目录永远保留——里面可能有匹配的）。
        if (!isDir && picker && !matchesFilter(childPath, false, props.filter)) return null
        if (!isDir) {
          const pick = (): void => {
            if (picker && props.onPick !== undefined) {
              // 回传绝对路径 + 工作区归属（用户 2026-11-03 定 `PickedPath`）。
              props.onPick(toPicked(childPath, false))
              return
            }
            // 逐层展开后选中文件：面包屑要跟随到该文件所在目录。
            const parent = dirnameOf(childPath)
            if (parent !== dir) loadDir(parent)
            setViewing(childPath)
            setReloadNonce(0)
            setSourceView(false)
          }
          return h(
            'div',
            {
              key: childPath,
              className: `dshpc-fb__row${picker ? ' dshpc-fb__row--pick' : ''}`,
              role: 'button',
              tabIndex: 0,
              title: picker ? tt('explorerPickFile') : childPath,
              onClick: pick,
              onKeyDown: (event: { key: string }) => {
                if (event.key === 'Enter' || event.key === ' ') pick()
              },
            },
            h('span', { className: 'dshpc-fb__row-icon' }, h(FileTypeIcon, { path: childPath, size: 18 })),
            h('span', { className: 'dshpc-fb__row-name' }, entry.name),
            // 选择器里文件行也给一枚「选择」钮，与目录行的操作位对齐（目录没有时它仍在，
            // 「点行 = 选中」的旧默契保持不变，外显入口不再缺）。
            picker && props.onPick !== undefined
              ? h(
                  Button,
                  {
                    variant: 'outline',
                    size: 'sm',
                    className: 'dshpc-fb__row-act',
                    'aria-label': tt('explorerPickFile'),
                    onClick: (event: { stopPropagation: () => void }) => {
                      event.stopPropagation()
                      pick()
                    },
                  },
                  tt('explorerPickDir'),
                )
              : null,
          )
        }
        const cached: ChildData | undefined = childCache[childPath]
        const isOpen = openDirs.has(childPath)
        // 目录行点击 = 就地展开/收起（两种形态统一，源实现用户 2026-10-10 拍板）；
        // 主动作挪到行尾小按钮：选择器 = 选择此文件夹，浏览 = 进入该目录。
        // 目录行不渲染文件夹图标——行首已有展开小尖号，再摆一个是重复。
        const rowAction = (): void => {
          toggleDir(childPath)
        }
        const actThisDir = (event: { stopPropagation: () => void }): void => {
          event.stopPropagation()
          if (picker) {
            // 扩展名过滤下这里不该被触发（目录行根本不渲染这枚钮）；兜住是为了语义不被绕过。
            if (!extsOnly && props.onPick !== undefined) props.onPick(toPicked(childPath, true))
            return
          }
          loadDir(childPath)
        }
        return h(
          Fragment,
          { key: childPath },
          h(
            'div',
            {
              className: 'dshpc-fb__row',
              role: 'button',
              tabIndex: 0,
              title: childPath,
              onClick: rowAction,
              onKeyDown: (event: { key: string }) => {
                if (event.key === 'Enter' || event.key === ' ') rowAction()
              },
            },
            // 展开 / 收起：核心 IconButton，20×20 命中位 + 展开时转 90°（与兄弟 .dsh-tdt-sv-tree-toggle 同款）。
            h(IconButton, {
              variant: 'plain',
              size: 'sm',
              className: `dshpc-fb__row-toggle${isOpen ? ' dshpc-fb__row-toggle--open' : ''}`,
              icon: h(IconChevronRightOutlineRegular, { size: 16 }),
              label: isOpen ? tt('explorerCollapse') : tt('explorerExpand'),
              'aria-expanded': isOpen,
              onClick: (event: { stopPropagation: () => void }) => {
                event.stopPropagation()
                toggleDir(childPath)
              },
            }),
            h('span', { className: 'dshpc-fb__row-name' }, entry.name),
            // picker：仅目录可选时才出「选择」（扩展名过滤下没有，目录只作导航）；
            // 浏览态：出「进入」。
            picker
              ? dirPickable
                ? h(
                    Button,
                    {
                      variant: 'outline',
                      size: 'sm',
                      className: 'dshpc-fb__row-act',
                      'aria-label': tt('explorerPickDirAria'),
                      onClick: actThisDir,
                    },
                    tt('explorerPickDir'),
                  )
                : null
              : h(
                  Button,
                  {
                    variant: 'outline',
                    size: 'sm',
                    className: 'dshpc-fb__row-act',
                    'aria-label': tt('explorerEnter'),
                    onClick: actThisDir,
                  },
                  tt('explorerEnter'),
                ),
          ),
          isOpen
            ? h(
                'div',
                { className: 'dshpc-fb__row-children' },
                // 硬性规定：不新建 Loading、不写加载文案 ⇒ 还在拉就空着（源实现用户 2026-10-05）。
                cached === undefined || cached.status === 'loading'
                  ? null
                  : cached.status === 'error'
                    ? h('div', { className: 'dshpc-fb__row-err' }, tt(cached.error.key, cached.error.params))
                    : h(
                        Fragment,
                        null,
                        renderTree(cached.entries, childPath),
                        cached.truncated ? h('div', { className: 'dshpc-fb__row-note' }, tt('explorerTruncated')) : null,
                      ),
              )
            : null,
        )
      }),
    [childCache, openDirs, picker, dirPickable, extsOnly, props.filter, props.onPick, toPicked, dir, loadDir, tt],
  )

  // 根层条目：有盘符（Windows）就一条一档；否则单条「根目录」（POSIX）。
  // 两者都是**可选目标**（用户 2026-11-03：Linux 的 `/` 也可以选；Windows 至少能选盘）。
  const drives = roots.filter((root) => root !== FS_ROOT)
  const rootRows: ReadonlyArray<{ label: string; path: string }> = drives.length > 0
    ? drives.map((path) => ({ label: path.replace(/\/+$/, ''), path }))
    : [{ label: tt('explorerRootDir'), path: FS_ROOT }]

  // 面包屑（用户 2026-11-03 定）：**按当前目录**去比所有工作区。
  // 命中 ⇒ 第一段是工作区名，其下按相对层级；没命中 ⇒ 第一段是根（「根目录」或盘符），其下逐层。
  // 判据只看 `dir`（不比 props.path）：浏览途中切进别的工作区也要立刻跟着切根。
  const owner = workspaceOfPath(dir, anchors)
  const rootLabel = owner?.title ?? ''
  const crumbs: { label: string; path: string }[] = owner === null
    ? (/^[a-zA-Z]:/.test(normalizePath(dir))
        // 盘符路径：根段由 crumbsOfDir 自己出（`C:`），再补一段「根目录」就重复了。
        ? crumbsOfDir(dir)
        : [{ label: rootRows[0]?.label ?? tt('explorerRootDir'), path: FS_ROOT }, ...crumbsOfDir(dir)])
    : [{ label: rootLabel, path: '' }, ...crumbsOfDir(relativizeToDir(dir, owner.path ?? null))]
  // md / html 都出「渲染 ⇄ 源码」切换（默认渲染）。
  const viewingIsMd = viewing !== null && /\.(md|markdown)$/i.test(viewing)
  const viewingIsHtml = viewing !== null && /\.(html|htm)$/i.test(viewing)
  const switchable = viewingIsMd || viewingIsHtml

  // 工作区清单：调用方没传就用宿主快照里的（picker 与 dock 同一条逻辑 —— 用户 2026-11-03：
  // 两处显示必须一致，不能 dock 有清单、picker 只有一个根目录）。
  const menuItems = crumbsMenuEntries({
    workspaces: props.workspaces ?? anchors.map((item) => item.title),
    roots: rootRows,
    rootName: rootLabel,
    rootFallbackLabel: tt('explorerRootName'),
    crumbs,
    onPickWorkspace: switchWorkspace,
    onLoadDir: loadDir,
  })

  // 选择器的「选当前目录」入口（用户 2026-11-03：进到某一层之后，行上没有它自己，
  // 树里也点不到「当前这层」⇒ 在 ✕ 左边给一枚按钮）。落地页还没进任何目录、扩展名过滤下
  // 目录不是合法结果 —— 这两种情况不出按钮。
  const pickNow: ReactNode = picker && props.onPick !== undefined && !landing && dirPickable && dir !== ''
    ?       h(
        Button,
        {
          // 描边（outline）：ghost 在这一排**看不出来是按钮**——它无底无边，与面板同色，
          // 用户 2026-11-03 实测「就像没有背景一样」，于是改回有 border 的一档（覆盖当天早些的 ghost 结论）。
          variant: 'outline',
          size: 'sm',
          className: 'dshpc-fb__pick',
          'aria-label': tt('explorerPickDirAria'),
          onClick: () => props.onPick?.(toPicked(dir, true)),
        },
        tt('explorerPickDir'),
      )
    : null

  const nav: ReactNode = outside
    ? h(PlainNav, { translate: tt, path: dir, pickNow, onClose: props.onClose })
    : h(CrumbNav, {
        translate: tt,
        landing,
        crumbs,
        overflow: crumbsOverflow,
        menuItems,
        menuOpen,
        onToggleMenu: () => setMenuOpen((v) => !v),
        onCloseMenu: () => setMenuOpen(false),
        onLoadDir: loadDir,
        pickNow,
        onClose: props.onClose,
        regionRef,
        measureRef,
      })

  const titleBar: ReactNode = viewing === null
    ? null
    : h(PreviewTitleBar, {
        translate: tt,
        path: viewing,
        switchable,
        isMarkdown: viewingIsMd,
        sourceView,
        onSourceViewChange: setSourceView,
        copied,
        onCopyPath: copyPath,
        onReload: reload,
      })
  // ── 主体 ──
  let body: ReactNode
  if (landing) {
    body = h(LandingBody, {
      translate: tt,
      roots: rootRows,
      anchors,
      pickable: picker && props.onPick !== undefined && !extsOnly,
      onOpen: loadDir,
      onPickDir: (target: string) => props.onPick?.(toPicked(target, true)),
    })
  } else if (viewing !== null) {
    body = h(FilePreview, {
      key: `${viewing}:${reloadNonce}`,
      files: props.files,
      officeToPdf: props.officeToPdf ?? null,
      path: viewing,
      sourceView,
      translate: tt,
    })
  } else if (mode === 'error' && listErr !== null) {
    // 列举失败（如 outside-workspace）：只给错误文案；关闭（✕）即退出。
    body = h('div', { className: 'dshpc-fb__body' }, h('div', { className: 'dshpc-fb__err' }, tt(listErr.key, listErr.params)))
  } else if (listing !== null) {
    const visible = listing.filter((entry) => entry.type === 'directory' || matchesFilter(joinPath(dir, entry.name), false, picker ? props.filter : undefined))
    body =
      visible.length === 0
        ? h('div', { className: 'dshpc-fb__body' }, h('div', { className: 'dshpc-fb__note' }, tt('explorerEmptyDir')))
        : h(
            'div',
            { className: 'dshpc-fb__tree' },
            renderTree(visible, dir),
            truncated ? h('div', { className: 'dshpc-fb__row-note' }, tt('explorerTruncated')) : null,
          )
  } else {
    // 不动 Loading、不写加载文案 ⇒ 空着（源实现硬性规定）。
    body = h('div', { className: 'dshpc-fb__body' })
  }

  return h(
    'div',
    {
      className: 'dshpc-fb',
      style: props.style ?? undefined,
    },
    nav,
    titleBar,
    body,
  )
}

