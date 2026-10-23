// 官方 ChangedFiles 卡（@deepseek-ai/dsh-client-ui-deliverables client.js:1351-1476，
// 0.2.1-rc.2 解包核实）镜像：
//   div.card[data-changed-files][data-single?]
//    ├─ header（button；单文件 = 打开该文件，多文件 = 静态头）：
//    │    tile（40×40 图标块）+ titles > title（已编辑 x / 已编辑 N 个文件）
//    │    + stat（计数 +N -M 常显上色 / 二进制 / 超限；hover 时换显「预览」提示）
//    ├─ ul.list > li > HoverCard > button.row（仅多文件）：路径（ellipsis）+ 每文件计数；
//    │    hover 500ms 出该文件的 diff 预览卡，点行 = 打开该文件
//    └─ button.toggle（files > COLLAPSED_ROWS=4 才出）：「全部 N 个文件 / 收起」+  Chevron
//  官方差异（有意）：① 图标单文件 = FileTypeIcon(path)，多文件 = FileTypeIcon(kind:'code')
//  （渲染成「文件带尖括号」代码图标）；② 官方点击 = openReview 开右侧 review 标签页（宿主
//  ctx.sidebarRight.openResource），本包无该槽 ⇒ 点击改走调用方给的 onOpen（文件预览核心入口，
//  见 SessionViewModal 的 onOpenFile → openFilePreview），不在本卡里自绘弹窗；③ hover 预览的 diff
//  数据走宿主只读路由 `api/changes.diff`（官方走注入的 useChangesDiff 服务，本包拿同一路由自己拉）。
//  二进制 / 超限文件不显示计数，只出状态词（官方同）。
import { createElement as h, Fragment, useEffect, useRef, useState, type ReactNode } from 'react'
import { HoverCard } from '../../ui/official.js'
import {
  IconChevronDownOutlineRegular,
  IconChevronUpOutlineRegular,
} from '../../ui/official.js'
import { FileTypeIcon } from '../../ui/official.js'
import { baseNameOf } from '../../utils/index.js'
import { officialClass } from '../official-classes.js'
import { changesSummaryUrl, parseChangesSummary, type ChangesSummary } from '../changes.js'
import { ChangedFileDiff } from './ChangedFileDiff.js'
import type { Translate } from '../../utils/i18n.js'

/** 官方 ChangedFiles 模块类（ui-deliverables；取不到 = 空类，不白屏）。 */
const C = (semantic: string): string => officialClass('ChangedFiles', semantic) ?? ''

/** 会话级缓存：同一 (sessionId, seq) 只拉一次（官方 ChangesSummaryStore 同语义）。 */
const cache = new Map<string, ChangesSummary | null>()

/** 官方 COLLAPSED_ROWS（适配收尾消息的汇总高度）：超过才折叠 + 出 toggle。 */
const COLLAPSED_ROWS = 4

/** 官方 Counts：added（成功色）+ deleted（错误色），常显不靠 hover。 */
function Counts(props: { added: number; deleted: number }): ReactNode {
  const grouped = new Intl.NumberFormat('en-US')
  return h(Fragment, null,
    h('span', { className: C('added') }, `+${grouped.format(props.added)}`),
    ' ',
    h('span', { className: C('deleted') }, `-${grouped.format(props.deleted)}`),
  )
}

/** 计数或状态词（官方 binary / oversized 顶替计数）。 */
function countsOf(file: { added: number; deleted: number; binary?: true; oversized?: true }, t: Translate): ReactNode {
  if (file.binary === true) return t('changesBinary')
  if (file.oversized === true) return t('changesOversized')
  return h(Counts, { added: file.added, deleted: file.deleted })
}

/** 点变更文件出去的出口载荷：带「改动身份」，调用方据此开审阅（本包走文件预览 dock 的 content 槽）。 */
export interface ChangedFileReviewLocator {
  readonly sessionId: string
  readonly seq: number
  readonly index: number
  /** 工作区相对路径（作审阅头）。 */
  readonly display: string
}

export function ChangedFilesCard(props: {
  sessionId: string
  seq: number
  /** 点击出口：官方 openReview(index) 的等价物，带改动身份。无则整张卡不可点。 */
  onOpenReview?: (locator: ChangedFileReviewLocator) => void
  t: Translate
}): ReturnType<typeof h> | null {
  const { sessionId, seq, onOpenReview, t } = props
  const url = changesSummaryUrl(sessionId, seq)
  const [summary, setSummary] = useState<ChangesSummary | null | undefined>(undefined)
  const [expanded, setExpanded] = useState(false)
  // 官方 cardRef：既定 preview 卡的宽度基准，也是 header / row hover 预览的定位锚。
  const cardRef = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    if (cache.has(url)) {
      setSummary(cache.get(url))
      return
    }
    let alive = true
    void (async () => {
      let next: ChangesSummary | null = null
      try {
        const res = await fetch(url)
        next = res.ok ? parseChangesSummary(await res.json()) : null
      } catch {
        next = null // 路由缺席 / 网络失败 = 不渲染，不猜
      }
      cache.set(url, next)
      if (alive) setSummary(next)
    })()
    return () => { alive = false }
  }, [url])
  if (summary === undefined || summary === null || summary.total === 0 || summary.files.length === 0) return null
  const single = summary.total === 1 ? summary.files[0] : undefined
  // 图标：单文件 = FileTypeIcon(path)；多文件 = FileTypeIcon(kind:'code')（官方渲染「文件带尖括号」）。
  const icon = single !== undefined
    ? h(FileTypeIcon, { path: single.path, size: 20 })
    : h(FileTypeIcon, { kind: 'code', size: 20 })
  const title = single === undefined
    ? t('changesMulti', { count: String(summary.total) })
    : t('changesSingle', { name: baseNameOf(single.path) })
  const foldable = summary.files.length > COLLAPSED_ROWS
  const rows = foldable && !expanded ? summary.files.slice(0, COLLAPSED_ROWS) : summary.files

  const headerBody = h(Fragment, null,
    h('span', { className: C('tile') }, icon),
    h('span', { className: C('titles') },
      h('span', { className: C('title') }, title),
      h('span', { className: C('stat') },
        h('span', { className: C('statCounts') }, countsOf(single ?? summary, t)),
        // 官方 previewHint：hover/focus 时替换计数显示（提示这张卡可以 hover 出 diff 预览）。
        h('span', { className: C('previewHint') }, t('deliverPreviewHint')),
      ),
    ),
  )
  // 官方 header 永远是 button → openReview(0)；本包无 review 槽 ⇒ 走 onOpenReview（带改动身份）。
  // 多文件头代表整组变更，官方 openReview(0) 开第一份 ⇒ 这里传 index 0。无 onOpenReview 则不可点。
  const headerLocator: ChangedFileReviewLocator = {
    sessionId,
    seq,
    index: 0,
    display: single?.display ?? summary.files[0]!.display,
  }
  const headerNode = onOpenReview === undefined
    ? h('div', { className: C('header') }, headerBody)
    : h('button', {
        type: 'button',
        className: C('header'),
        title: headerLocator.display,
        onClick: () => { onOpenReview(headerLocator) },
      }, headerBody)

  /** 官方 hover 预览卡（variant preview + dwell 500 + 宽度跟整卡）；content 挂上才取数。 */
  const previewOf = (index: number, display: string): ReactNode =>
    h(ChangedFileDiff, { sessionId, seq, index, display, t })

  const rowOf = (file: (typeof summary.files)[number], index: number): ReactNode => {
    const body = h(Fragment, null,
      h('span', { className: C('path') }, file.display),
      h('span', { className: C('counts') }, countsOf(file, t)),
    )
    // 官方行点击 = openReview(index)：带改动身份出去，调用方开审阅。无 onOpenReview 则不可点。
    const locator: ChangedFileReviewLocator = { sessionId, seq, index, display: file.display }
    const row = onOpenReview === undefined
      ? h('div', { className: C('row'), title: file.path }, body)
      : h('button', {
          type: 'button',
          className: C('row'),
          title: file.path,
          onClick: () => { onOpenReview(locator) },
        }, body)
    return h(HoverCard, {
      key: file.display,
      variant: 'preview',
      widthAnchorRef: cardRef,
      openDelayMs: 500,
      anchor: row,
      content: previewOf(index, file.display),
    })
  }
  const list = single === undefined
    ? h('ul', { className: C('list') },
        rows.map((file) => {
          // 折叠视图下 rows 是子集，必须用 summary.files 的真实下标（changes.diff 的 index 语义）。
          const index = summary.files.indexOf(file)
          return h('li', { key: file.display }, rowOf(file, index))
        }))
    : null
  const toggle = foldable
    ? h('button', {
        type: 'button',
        className: C('toggle'),
        'aria-expanded': expanded,
        'aria-label': t(expanded ? 'deliverCollapseAria' : 'deliverExpandAria', { count: summary.files.length }),
        onClick: () => { setExpanded((value) => !value) },
      },
        h('span', null, t(expanded ? 'changesCollapse' : 'changesAll', { count: summary.files.length })),
        expanded ? h(IconChevronUpOutlineRegular, {}) : h(IconChevronDownOutlineRegular, {}),
      )
    : null
  // 单文件：头本身就是那一个文件的预览锚（官方同）；多文件：锚在各行上。
  const header = single === undefined
    ? headerNode
    : h(HoverCard, {
        variant: 'preview',
        widthAnchorRef: cardRef,
        openDelayMs: 500,
        anchor: headerNode,
        content: previewOf(0, single.display),
      })
  return h('div', {
    ref: cardRef,
    className: C('card'),
    'data-changed-files': true,
    'data-single': single !== undefined || undefined,
  }, header, list, toggle)
}
