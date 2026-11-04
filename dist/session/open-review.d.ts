import { type FilePreviewHandle, type OpenFilePreviewOptions } from '../explorer/open.js';
import type { ChangedFileReviewLocator } from './mirror/ChangedFilesCard.js';
export type OpenSessionReviewOptions = Omit<OpenFilePreviewOptions, 'path' | 'content'> & {
    locator: ChangedFileReviewLocator;
};
/**
 * 在右侧分栏打开某次改动的 diff（`ChangedFilesCard` → `onOpenReview` 的落点）。
 *
 * 面板、宽度、滚动、Esc 与关闭钮全归 core 的 dock；调用方**不挑组件、不塞节点、不补 ✕**。
 * 关闭后用返回的 handle 或面板 ✕，与 `openFilePreview` 一致。
 */
export declare function openSessionReview(options: OpenSessionReviewOptions): FilePreviewHandle | null;
//# sourceMappingURL=open-review.d.ts.map