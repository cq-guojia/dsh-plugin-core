// 会话领域的一次「打开改动审阅」：locator → diff 的拼装留在这里，
// 调用方只给落点 + 改动身份。依赖方向 session → explorer 本就存在（反向不许）。
import { createElement as h } from 'react';
import { openFilePreview } from '../explorer/open.js';
import { ChangedFileDiff } from './mirror/ChangedFileDiff.js';
/**
 * 在右侧分栏打开某次改动的 diff（`ChangedFilesCard` → `onOpenReview` 的落点）。
 *
 * 面板、宽度、滚动、Esc 全归 core 的 dock；关闭钮由审阅头自己画（与换行钮同排，
 * 用户 2026-11-04）。调用方不挑组件、不塞节点、不补 ✕。
 */
export function openSessionReview(options) {
    const { locator, title, ...panel } = options;
    // 内容要拿得到 handle 才能关面板；content 在 openFilePreview 内同步渲染，
    // 那时 handle 还没赋值，但回调是点击时才读这个变量。
    let handle = null;
    handle = openFilePreview({
        ...panel,
        // 无头面板：标题只用于 aria-label，缺省用改动路径。
        title: title ?? locator.display,
        content: () => h(ChangedFileDiff, {
            sessionId: locator.sessionId,
            seq: locator.seq,
            index: locator.index,
            display: locator.display,
            variant: 'review',
            onClose: () => { handle?.close(); },
        }),
    });
    return handle;
}
//# sourceMappingURL=open-review.js.map