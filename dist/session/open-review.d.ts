import { type FilePreviewHandle, type OpenFilePreviewOptions } from '../explorer/open.js';
import type { ChangedFileReviewLocator } from './mirror/ChangedFilesCard.js';
export type OpenSessionReviewOptions = Omit<OpenFilePreviewOptions, 'path' | 'content'> & {
    locator: ChangedFileReviewLocator;
};
/**
 * 在右侧分栏打开某次改动的 diff（`ChangedFilesCard` → `onOpenReview` 的落点）。
 *
 * 面板、宽度、滚动、Esc 全归 core 的 dock；关闭钮由审阅头自己画（与换行钮同排，
 * 用户 2026-11-04）。调用方不挑组件、不塞节点、不补 ✕。
 */
export declare function openSessionReview(options: OpenSessionReviewOptions): FilePreviewHandle | null;
//# sourceMappingURL=open-review.d.ts.map