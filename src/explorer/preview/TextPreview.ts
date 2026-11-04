// 文本 / markdown / 代码预览体。
//
//  - md 且非源码态 ⇒ 官方 MarkdownText（mdast 管线 + KaTeX）；
//  - 其余（源码态 / 代码 / 纯文本）⇒ 官方 CodeBlock（Shiki，零 npm 依赖；
//    大文件拖宽卡顿问题若真出现再议，不为此引 CodeMirror 全家桶进共享底座）；
//  - read 分页累积，`!eof` 出「加载更多」；传了 maxBytes（HTML 源码态）则按字节截断、
//    不出按钮、顶部出横幅。
//
// ⚠️ read 的第三个参数（range）口径：**首页 `{}`、翻页 `{offset}`，绝不带 `limit`**。
//   远端对 range 按值校验，多塞 limit 会被拒（表现 = 每种文件都「加载失败」）；
//   兄弟项目 dsh-task-dispatch-table 与本仓文档（types.ts / dsh-host.md / features/explorer.md）
//   同为 `{}` + `{offset}` 两态，分页步长由远端定，不在这里猜。
import { createElement as h, useCallback, useEffect, useRef, useState } from 'react'
import { MarkdownText } from '../../ui/official.js'
import { CodeViewer } from '../../ui/CodeViewer.js'
import { Button } from '../../ui/Button.js'
import { t, type Translate } from '../../utils/i18n.js'
import { errView, isAborted, textPageOf } from '../types.js'
import type { FsFace } from '../fs-face.js'
import { formatBytes } from '../../utils/number.js'
import { markdownLabels } from './md-labels.js'
import { ensureComponentStyles } from '../../ui/css.js'
import { EXPLORER_CSS } from '../explorer-css.js'

export interface TextPreviewProps {
  files: FsFace
  path: string
  /** 是否 md（决定默认渲染态）。 */
  markdown: boolean
  /** true = 源码态（md/html 由面板工具条切换）。 */
  sourceView: boolean
  /** 字节上限：超出即截断 + 横幅，且不出「加载更多」（HTML 源码态用）。 */
  maxBytes?: number
  /** 打开即定位到这一行（1 起）：首屏没读到就自动续翻，最多 {@link FOCUS_MAX_PAGES} 页。 */
  focusLine?: number
  translate?: Translate
}

/** 定位到行时最多自动续翻的页数（远处行号不值得为它打一整圈往返；用户仍可手动「加载更多」）。 */
const FOCUS_MAX_PAGES = 10

export function TextPreview(props: TextPreviewProps): ReturnType<typeof h> {
  ensureComponentStyles('explorer', EXPLORER_CSS)
  const tt = props.translate ?? t
  const [text, setText] = useState('')
  const [truncated, setTruncated] = useState(false)
  const [nextOffset, setNextOffset] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [failed, setFailed] = useState<ReturnType<typeof errView> | null>(null)
  // 累计文本放 ref：翻页/截断判定要读「这一页加上之后的全文」，闭包 state 会是旧值。
  const accRef = useRef('')
  // 当前这一次读（含翻页）：新的一次开始 / 换文件 / 卸载都先 abort 上一次，迟到的结果不落状态。
  const abortRef = useRef<AbortController | null>(null)

  const load = useCallback(
    async (offset: number, append: boolean): Promise<number | null> => {
      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller
      setLoading(true)
      try {
        // range 只两态：首页 `{}`、翻页 `{offset}`（见文件头口径说明）。
        const parsed = textPageOf(
          await props.files.read(props.path, offset > 0 ? { offset } : {}, controller.signal),
        )
        if (controller.signal.aborted) return null
        if (parsed === null) {
          // 形状不对要说「返回数据不符合预期」，不能混进「加载失败」——混了就永远查不出是谁的锅。
          console.warn('[dsh-plugin-core:explorer] read 返回体无法解析为文本页', props.path)
          setFailed({ key: 'previewBadPayload' })
          return null
        }
        if ('failed' in parsed) {
          setFailed(errView(parsed.failed))
          return null
        }
        setFailed(null)
        const full = append ? accRef.current + parsed.text : parsed.text
        accRef.current = full
        setText(full)
        const next = parsed.eof ? null : parsed.offset + parsed.lines
        if (props.maxBytes !== undefined) {
          // 有上限：按 UTF-8 实字节（Blob.size）判超限，超了截断不出翻页钮。
          if (parsed.eof) {
            setNextOffset(null)
          } else if (new Blob([full]).size >= props.maxBytes) {
            setTruncated(true)
            setNextOffset(null)
          } else {
            setNextOffset(next)
          }
          return null
        }
        setNextOffset(next)
        return next
      } catch (error: unknown) {
        if (isAborted(controller.signal, error)) return null
        setFailed(errView(error))
        return null
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    },
    [props.files, props.path, props.maxBytes],
  )

  useEffect(() => {
    accRef.current = ''
    setText('')
    setTruncated(false)
    setNextOffset(null)
    setFailed(null)
    void (async () => {
      let next = await load(0, false)
      // 目标行不在首屏 ⇒ 续读到覆盖它（或到 eof / 上限）。
      for (let page = 0; next !== null && props.focusLine !== undefined && page < FOCUS_MAX_PAGES
        && accRef.current.split('\n').length < props.focusLine; page += 1) {
        next = await load(next, true)
      }
    })()
    return () => {
      abortRef.current?.abort()
    }
    // focusLine 变了 = 同一文件换个落点，重新从首页读一遍。
  }, [load, props.focusLine])

  if (failed !== null) return h('div', { className: 'dshpc-fb__note' }, tt(failed.key, failed.params))
  if (text === '' && loading) return h('div', { className: 'dshpc-fb__note' }, tt('explorerLoading'))

  const rendered = props.markdown && !props.sourceView
  return h(
    'div',
    { className: 'dshpc-fb__text', style: { display: 'flex', flexDirection: 'column', ...(rendered ? { padding: 'var(--dshpc-space-3)' } : {}) } },
    truncated
      ? h('div', { className: 'dshpc-fb__banner' }, tt('previewTruncated', { n: formatBytes(props.maxBytes ?? 0) }))
      : null,
    rendered
      ? h(MarkdownText, { text, labels: markdownLabels() })
      : h(
          'div',
          { style: { flex: '1 1 auto', minHeight: 0, display: 'flex' } },
          h(CodeViewer, { text, path: props.path, t: tt, focusLine: props.focusLine }),
        ),
    nextOffset !== null && props.maxBytes === undefined
      ? h(
          'div',
          { className: 'dshpc-fb__more' },
          h(Button, { variant: 'outline', size: 'sm', loading: loading, onClick: () => void load(nextOffset, true) }, tt('previewLoadMore')),
        )
      : null,
  )
}
