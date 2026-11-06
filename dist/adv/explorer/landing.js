/**
 * 落地页主体（picker 刚打开、还没进任何目录时的那张表）：上面一排根层（「根目录」或盘符），
 * 下面全部工作区。行 = 进去，行尾钮 = 直接选这个目录。
 *
 * 2026-11-03 从 `FileBrowser.ts` 拆出：这里只有「怎么画」，状态与取数全在调用方。
 */
import { createElement as h } from 'react';
import { Button } from '../../ui/actions/Button.js';
import { IconFolderCloseRegular } from '../../ui/official.js';
import { ensureComponentStyles } from '../../ui/infra/css.js';
import { EXPLORER_CSS } from './explorer-css.js';
export function LandingBody(props) {
    ensureComponentStyles('explorer', EXPLORER_CSS);
    const { translate: tt, roots, anchors, pickable, onOpen, onPickDir } = props;
    const row = (key, label, target) => h('div', {
        key,
        className: 'dshpc-fb__row',
        role: 'button',
        tabIndex: 0,
        onClick: () => onOpen(target),
        onKeyDown: (event) => {
            if (event.key === 'Enter' || event.key === ' ')
                onOpen(target);
        },
    }, h('span', { className: 'dshpc-fb__row-icon' }, h(IconFolderCloseRegular, { size: 18 })), h('span', { className: 'dshpc-fb__row-name' }, label), 
    // 行 = 展开进去；行尾钮 = 直接选这个目录（根目录 / 盘符 / 工作区根本身都能选）。
    pickable
        ? h(Button, {
            variant: 'outline',
            size: 'sm',
            className: 'dshpc-fb__row-act',
            'aria-label': tt('explorerPickDirAria'),
            onClick: (event) => {
                event.stopPropagation();
                onPickDir(target);
            },
        }, tt('explorerPickDir'))
        : null);
    return h('div', { className: 'dshpc-fb__tree dshpc-scroll-thin dshpc-scroll-thin--both' }, roots.map((root) => row(`root:${root.path}`, root.label, root.path)), anchors
        .filter((item) => item.path !== undefined && item.path !== '')
        .map((item) => row(`ws:${item.title}`, item.title, item.path)));
}
//# sourceMappingURL=landing.js.map