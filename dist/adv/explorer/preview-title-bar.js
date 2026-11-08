/**
 * 预览态的第二排：文件名 + 渲染⇄源码切换 / 复制路径 / 刷新。
 *
 * 2026-11-03 从 `FileBrowser.ts` 拆出。档位照兄弟项目调用点：Segmented `sm` + 图标钮 `md`
 * （核心 Segmented 高度由 CSS 定，不随档变）。
 */
import { createElement as h } from 'react';
import { IconButton } from '../../ui/actions/Button.js';
import { MarqueeText } from '../../ui/display/MarqueeText.js';
import { Segmented } from '../../ui/inputs/Segmented.js';
import { IconCheckOutlineRegular, IconCopyOutlineRegular, IconRefreshOutlineRegular, } from '../../ui/official.js';
import { ensureComponentStyles } from '../../ui/infra/css.js';
import { EXPLORER_CSS } from './explorer-css.js';
import { baseNameOfPath } from './types.js';
export function PreviewTitleBar(props) {
    ensureComponentStyles('explorer', EXPLORER_CSS);
    const { translate: tt, path, switchable, isMarkdown, sourceView, onSourceViewChange, copied, onCopyPath, onReload } = props;
    return h('div', { className: 'dshpc-fb__title' }, h(MarqueeText, {
        text: baseNameOfPath(path),
        className: 'dshpc-fb__title-inner',
        style: { flex: '1 1 auto', minWidth: 0 },
    }), h('div', { className: 'dshpc-fb__actions' }, switchable
        ? h(Segmented, {
            size: 'sm',
            label: isMarkdown ? tt('previewMdSwitchAria') : tt('previewHtmlSwitchAria'),
            value: sourceView ? 'source' : 'render',
            items: [
                { value: 'render', label: tt('previewRender') },
                { value: 'source', label: tt('previewSource') },
            ],
            onChange: (next) => onSourceViewChange(next === 'source'),
        })
        : null, h(IconButton, {
        variant: 'plain',
        size: 'md',
        icon: copied ? h(IconCheckOutlineRegular, { size: 14 }) : h(IconCopyOutlineRegular, { size: 14 }),
        label: tt('previewCopyPath'),
        onClick: onCopyPath,
    }), h(IconButton, {
        variant: 'plain',
        size: 'md',
        icon: h(IconRefreshOutlineRegular, { size: 14 }),
        label: tt('previewRefresh'),
        onClick: onReload,
    })));
}
//# sourceMappingURL=preview-title-bar.js.map