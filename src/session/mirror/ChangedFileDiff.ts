// 官方 ChangedFilePreview + FileDiff（@deepseek-ai/dsh-client-ui-deliverables client.js:828-1507，
// 0.2.1-rc.2 解包核实）镜像：路径头 + hunk 头（`@@ -a,b +c,d @@`）+ 行（旧行号 / 新行号 / 符号 /
// 文本，grid 四列）。状态机（loading / missing / error+重试 / binary / oversized）、
// 行号计算、hunk 头、note（新建 / 删除 / 无变化）逐值照抄官方。
//
// 数据面：`api/changes.diff`（与 changes.summary 同一个宿主服务，client.js:15/103-110）。
// 承载：官方 HoverCard 的 preview 卡（client.js:1402-1435）—— content 只在 open 时挂载，
// 故每行不会预先发请求（primitives lib/index.js 已核实：card = open && pos !== null && …）。
//
// 高亮：官方 `useCodeHighlighter`（primitive hook）+ 官方 highlightedSide 映射口径
// （按一侧收集文本 → 整段高亮 → 按行号回表）；语法未知 / 语法树未加载返回 undefined ⇒ 纯文本回落。
import { createElement as h, useCallback, useEffect, useMemo, useState, type CSSProperties, type ReactNode } from 'react'
import { Button, languageForPath, useCodeHighlighter, type HighlightSpan } from '../../ui/official.js'
import {
  DIFF_MAX_RENDERED_LINES,
  changesDiffUrl,
  diffNoteKey,
  hunkHeader,
  hunkRows,
  parseChangesDiff,
  type ChangesDiff,
  type DiffHunk,
  type DiffRow,
} from '../changes.js'
import { t as defaultT, type Translate } from '../../utils/i18n.js'

/** 会话级缓存：同一 (sessionId, seq, index) 只拉一次（官方 ChangesDiffStore 同语义）。 */
const cache = new Map<string, ChangesDiff | null>()

/** 官方 highlightedSide：一侧收集 → 整段高亮 → 按行号回表。 */
function highlightedSide(
  rows: readonly DiffRow[],
  side: 'old' | 'new',
  highlighter: (code: string) => HighlightSpan[][] | undefined,
): Map<number, readonly HighlightSpan[]> | undefined {
  const source = rows.flatMap((row) => (row[side] === undefined ? [] : [{ no: row[side] as number, text: row.text }]))
  if (source.length === 0) return new Map()
  const highlighted = highlighter(source.map((line) => line.text).join('\n'))
  if (highlighted === undefined) return undefined
  return new Map(source.map((line, index) => [line.no, highlighted[index] ?? []]))
}

/** 官方 DiffText：有高亮 spans 就逐段上色，否则纯文本。 */
function DiffText(props: { text: string; spans: readonly HighlightSpan[] | undefined }): ReactNode {
  const { text, spans } = props
  return h('span', { className: 'dshpc-sv-diff-text', 'data-diff-code': spans === undefined ? undefined : '' },
    spans === undefined
      ? text
      : spans.map((span, index) => h('span', { key: index, style: span.style as CSSProperties }, span.text)))
}

/** 官方 FileDiff 的行：grid 四列（旧号 / 新号 / 符号 / 文本）。 */
function DiffLine(props: { row: DiffRow; oldSpans?: readonly HighlightSpan[]; newSpans?: readonly HighlightSpan[] }): ReactNode {
  const { row } = props
  const kindClass = row.kind === 'add' ? 'dshpc-sv-diff-add' : row.kind === 'del' ? 'dshpc-sv-diff-del' : 'dshpc-sv-diff-context'
  const spans = row.kind === 'del' ? props.oldSpans : props.newSpans
  return h('div', { className: `dshpc-sv-diff-line ${kindClass}`, 'data-diff-line': row.kind },
    h('span', { className: 'dshpc-sv-diff-number' }, row.old ?? ''),
    h('span', { className: 'dshpc-sv-diff-number' }, row.new ?? ''),
    h('span', { className: 'dshpc-sv-diff-sign' }, row.kind === 'add' ? '+' : row.kind === 'del' ? '-' : ' '),
    h(DiffText, { text: row.text, spans }),
  )
}

/** 一个变更文件的 diff 体（状态机 + unified 行渲染）。 */
export function ChangedFileDiff(props: {
  sessionId: string
  seq: number
  index: number
  /** 官方 display（工作区相对路径，作卡头）。 */
  display: string
  /** 文案翻译；缺省用核心字典（demo 自带字典不认 changes/diff 这些 key）。 */
  t?: Translate
  /**
   * 渲染变体（官方两套壳）：
   * - `preview`（默认）= hover 预览，`ChangedFiles.preview` 紧凑壳：限高、隐 note / hunk 头；
   * - `review` = 点开后的完整 FileDiff：hunk 头（`@@ -a,b +c,d @@`）与 note 正常显示。
   * 之前一律用 preview 壳，导致审阅视图里 hunk 头被 CSS 隐掉（用户截图对照官方）。
   */
  variant?: 'preview' | 'review'
}): ReactNode {
  const { sessionId, seq, index, display, t = defaultT, variant = 'preview' } = props
  const url = changesDiffUrl(sessionId, seq, index)
  const [state, setState] = useState<ChangesDiff | null | undefined | 'error'>(undefined)
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    if (cache.has(url)) {
      setState(cache.get(url))
      return
    }
    let alive = true
    void (async () => {
      let next: ChangesDiff | null = null
      try {
        const res = await fetch(url)
        // 官方口径（client.js:227）：404 = missing（这轮的改动内容已不可用），其余非 2xx = error。
        if (res.ok) next = parseChangesDiff(await res.json())
        else if (res.status !== 404) {
          if (alive) setState('error')
          return
        }
      } catch {
        // 路由缺席 / 网络失败 = 明确报「无法读取」，并给官方同款重试钮，不猜内容
        if (alive) setState('error')
        return
      }
      cache.set(url, next)
      if (alive) setState(next)
    })()
    return () => { alive = false }
  }, [url, attempt])
  const retry = useCallback(() => { setAttempt((value) => value + 1) }, [])
  const path = state === undefined || state === 'error' || state === null ? undefined : state.path
  const highlighter = useCodeHighlighter(path === undefined ? undefined : languageForPath(path))

  const body = useMemo((): ReactNode => {
    if (state === undefined) return h('p', { className: 'dshpc-sv-diff-status', role: 'status' }, t('diffLoading'))
    if (state === 'error') {
      // 官方 error 态 = 文案 + 官方 sm 按钮重试（client.js:837-845）。
      return h('div', { className: 'dshpc-sv-diff-status' },
        h('span', null, t('diffError')),
        h(Button, { size: 'sm', onClick: retry }, t('errorRetry')),
      )
    }
    if (state === null) return h('p', { className: 'dshpc-sv-diff-status' }, t('diffMissing'))
    if (state.kind === 'binary') return h('p', { className: 'dshpc-sv-diff-status' }, t('diffBinary'))
    if (state.kind === 'oversized') return h('p', { className: 'dshpc-sv-diff-status' }, t('diffOversized'))

    const note = diffNoteKey(state)
    const hunks = state.hunks ?? []
    // 官方 renderedHunks：行数预算耗尽即停（防巨型对比把预览卡死）。
    let budget = DIFF_MAX_RENDERED_LINES
    const kept: DiffHunk[] = []
    let truncated = false
    for (const hunk of hunks) {
      if (budget <= 0) {
        truncated = true
        break
      }
      if (hunk.lines.length > budget) {
        kept.push({ ...hunk, lines: hunk.lines.slice(0, budget) })
        budget = 0
        truncated = true
        break
      }
      kept.push(hunk)
      budget -= hunk.lines.length
    }
    return h('div', { className: 'dshpc-sv-diff-body', 'data-review-view': 'unified' },
      note === undefined ? null : h('p', {
        className: 'dshpc-sv-diff-note',
        'data-diff-note': hunks.length === 0 ? 'empty' : 'metadata',
      }, t(note)),
      state.coarse === true
        ? h('p', { className: 'dshpc-sv-diff-note', 'data-diff-coarse': true }, t('diffCoarse'))
        : null,
      truncated
        ? h('p', { className: 'dshpc-sv-diff-note', 'data-diff-truncated': true },
            t('diffTruncated', { count: String(DIFF_MAX_RENDERED_LINES) }))
        : null,
      kept.map((hunk, position) => {
        const rows = hunkRows(hunk)
        const oldSpans = highlightedSide(rows, 'old', highlighter)
        const newSpans = highlightedSide(rows, 'new', highlighter)
        return h('section', { key: position, className: 'dshpc-sv-diff-hunk' },
          h('div', { className: 'dshpc-sv-diff-hunkheader', 'data-diff-hunk-header': true }, hunkHeader(hunk)),
          rows.map((row, at) => h(DiffLine, {
            key: at,
            row,
            oldSpans: oldSpans?.get(row.old ?? -1),
            newSpans: newSpans?.get(row.new ?? -1),
          })),
        )
      }),
    )
  }, [state, highlighter, t, retry])

  // 官方两套壳：hover 预览 = ChangedFiles.preview（限高、隐 note / hunk 头）；
  // 审阅视图 = 完整 FileDiff.root（hunk 头 + note 正常渲染）。
  const preview = variant !== 'review'
  return h('div', {
    className: preview ? 'dshpc-sv-diff dshpc-sv-changes-preview' : 'dshpc-sv-diff',
    'data-changes-hover-preview': preview ? true : undefined,
  },
    h('div', { className: 'dshpc-sv-diff-header' },
      h('span', { className: 'dshpc-sv-changes-previewpath', 'data-changes-preview-path': true }, display),
    ),
    body,
  )
}
