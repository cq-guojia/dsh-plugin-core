// 官方 ChangedFiles 卡（@deepseek-ai/dsh-client-ui-deliverables client.js:1351-1476，
// 0.2.1-rc.2 解包核实）镜像：
//   div.card[data-changed-files][data-single?]
//    ├─ header（button；单文件 = 打开该文件，多文件 = 静态头）：
//    │    tile（40×40 图标块）+ titles > title（已编辑 x / 已编辑 N 个文件）
//    │    + stat（计数 +N -M 常显上色 / 二进制 / 超限；hover 时换显「预览」提示）
//    ├─ ul.list > li > button.row（仅多文件）：路径（ellipsis）+ 每文件计数；点行 = 打开该文件
//    └─ button.toggle（files > COLLAPSED_ROWS=4 才出）：「全部 N 个文件 / 收起」+  Chevron
//  官方差异（有意）：① 官方 header/row 的 hover 预览卡（ChangedFilePreview diff）依赖宿主
//  useChangesDiff 服务，本包无此数据面 ⇒ 不做假预览，行的 title 给完整路径；
//  ② 官方点击 = openReview 开右侧 review 标签页，本包对外的文件打开口只有 onOpen ⇒ 走文件预览。
//  二进制 / 超限文件不显示计数，只出状态词（官方同）。
import { createElement as h, Fragment, useEffect, useState, type ReactNode } from 'react'
import {
  IconChevronDownOutlineRegular,
  IconChevronUpOutlineRegular,
} from '../../ui/official.js'
import { FileTypeIcon } from '../../ui/official.js'
import { baseNameOf } from '../../utils/index.js'
import { changesSummaryUrl, parseChangesSummary, type ChangesSummary } from '../changes.js'
import type { Translate } from '../../utils/i18n.js'

/** 会话级缓存：同一 (sessionId, seq) 只拉一次（官方 ChangesSummaryStore 同语义）。 */
const cache = new Map<string, ChangesSummary | null>()

/** 官方 COLLAPSED_ROWS（适配收尾消息的汇总高度）：超过才折叠 + 出 toggle。 */
const COLLAPSED_ROWS = 4

/** 官方 Counts：added（成功色）+ deleted（错误色），常显不靠 hover。 */
function Counts(props: { added: number; deleted: number }): ReactNode {
  const grouped = new Intl.NumberFormat('en-US')
  return h(Fragment, null,
    h('span', { className: 'dshpc-sv-changes-added' }, `+${grouped.format(props.added)}`),
    ' ',
    h('span', { className: 'dshpc-sv-changes-deleted' }, `-${grouped.format(props.deleted)}`),
  )
}

/** 计数或状态词（官方 binary / oversized 顶替计数）。 */
function countsOf(file: { added: number; deleted: number; binary?: true; oversized?: true }, t: Translate): ReactNode {
  if (file.binary === true) return t('changesBinary')
  if (file.oversized === true) return t('changesOversized')
  return h(Counts, { added: file.added, deleted: file.deleted })
}

export function ChangedFilesCard(props: {
  sessionId: string
  seq: number
  /** 单文件卡的打开出口（调用方的文件预览口子）。 */
  onOpen?: (path: string) => void
  t: Translate
}): ReturnType<typeof h> | null {
  const { sessionId, seq, onOpen, t } = props
  const url = changesSummaryUrl(sessionId, seq)
  const [summary, setSummary] = useState<ChangesSummary | null | undefined>(undefined)
  const [expanded, setExpanded] = useState(false)
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
  // 图标：单文件取该文件路径；多文件取第一个（官方此处用 kind:'code'，但宿主安装的
  // primitives 版本 FileTypeIconProps 只有 path 形态，别为一个小图标引版本风险）。
  const [firstFile] = summary.files
  const icon = firstFile === undefined
    ? null
    : h(FileTypeIcon, { path: single?.path ?? firstFile.path, size: 20 })
  const title = single === undefined
    ? t('changesMulti', { count: String(summary.total) })
    : t('changesSingle', { name: baseNameOf(single.path) })
  const foldable = summary.files.length > COLLAPSED_ROWS
  const rows = foldable && !expanded ? summary.files.slice(0, COLLAPSED_ROWS) : summary.files

  const headerBody = h(Fragment, null,
    h('span', { className: 'dshpc-sv-changes-tile' }, icon),
    h('span', { className: 'dshpc-sv-changes-titles' },
      h('span', { className: 'dshpc-sv-changes-title' }, title),
      h('span', { className: 'dshpc-sv-changes-stat' },
        h('span', { className: 'dshpc-sv-changes-statcounts' }, countsOf(single ?? summary, t)),
        // 官方 previewHint：hover/focus 时替换计数显示（我们没有 diff 预览 ⇒ 只做文案提示）。
        h('span', { className: 'dshpc-sv-changes-previewhint' }, t('deliverPreviewHint')),
      ),
    ),
  )
  // 单文件 + 有打开出口 = 可点头（官方单文件点头也开 review）；多文件头静态（官方开 review 页，
  // 本包无此槽 ⇒ 不给假入口）。都没有 ⇒ 整行不可点。
  const header = single !== undefined && onOpen !== undefined
    ? h('button', {
        type: 'button',
        className: 'dshpc-sv-changes-header',
        title: single.path,
        onClick: () => { onOpen(single.path) },
      }, headerBody)
    : h('div', { className: 'dshpc-sv-changes-header' }, headerBody)

  const rowOf = (file: (typeof summary.files)[number]): ReactNode => {
    const body = h(Fragment, null,
      h('span', { className: 'dshpc-sv-changes-path' }, file.display),
      h('span', { className: 'dshpc-sv-changes-counts' }, countsOf(file, t)),
    )
    return onOpen === undefined
      ? h('div', { className: 'dshpc-sv-changes-row', key: file.display, title: file.path }, body)
      : h('button', {
          type: 'button',
          className: 'dshpc-sv-changes-row',
          key: file.display,
          title: file.path,
          onClick: () => { onOpen(file.path) },
        }, body)
  }
  const list = single === undefined
    ? h('ul', { className: 'dshpc-sv-changes-list' }, rows.map((file) => h('li', { key: file.display }, rowOf(file))))
    : null
  const toggle = foldable
    ? h('button', {
        type: 'button',
        className: 'dshpc-sv-changes-toggle',
        'aria-expanded': expanded,
        'aria-label': t(expanded ? 'deliverCollapseAria' : 'deliverExpandAria', { count: summary.files.length }),
        onClick: () => { setExpanded((value) => !value) },
      },
        h('span', null, t(expanded ? 'changesCollapse' : 'changesAll', { count: summary.files.length })),
        expanded ? h(IconChevronUpOutlineRegular, {}) : h(IconChevronDownOutlineRegular, {}),
      )
    : null
  return h('div', {
    className: 'dshpc-sv-changes',
    'data-changed-files': true,
    'data-single': single !== undefined || undefined,
  }, header, list, toggle)
}
