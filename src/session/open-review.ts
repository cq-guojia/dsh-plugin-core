// 会话领域的一次「打开改动审阅」：locator → diff 的拼装留在这里，
// 调用方只给落点 + 改动身份。依赖方向 session → explorer 本就存在（反向不许）。
import { createElement as h } from 'react'
import { openFilePreview, type FilePreviewHandle, type OpenFilePreviewOptions } from '../explorer/open.js'
import { ChangedFileDiff } from './mirror/ChangedFileDiff.js'
import type { ChangedFileReviewLocator } from './mirror/ChangedFilesCard.js'

export type OpenSessionReviewOptions = Omit<OpenFilePreviewOptions, 'path' | 'content'> & {
  locator: ChangedFileReviewLocator
}

/**
 * 在右侧分栏打开某次改动的 diff（`ChangedFilesCard` → `onOpenReview` 的落点）。
 *
 * 面板、宽度、滚动、Esc 与关闭钮全归 core 的 dock；调用方**不挑组件、不塞节点、不补 ✕**。
 * 关闭后用返回的 handle 或面板 ✕，与 `openFilePreview` 一致。
 */
export function openSessionReview(options: OpenSessionReviewOptions): FilePreviewHandle | null {
  const { locator, title, ...panel } = options
  return openFilePreview({
    ...panel,
    // 无头面板：标题只用于 aria-label，缺省用改动路径。
    title: title ?? locator.display,
    content: () => h(ChangedFileDiff, {
      sessionId: locator.sessionId,
      seq: locator.seq,
      index: locator.index,
      display: locator.display,
      variant: 'review',
    }),
  })
}
