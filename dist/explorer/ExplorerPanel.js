import { createElement as h, useEffect, useState } from 'react';
import { ensureControls } from '../ui/css.js';
import { EmptyState } from '../ui/EmptyState.js';
import { t } from '../utils/i18n.js';
import { formatBytes } from '../utils/number.js';
import { FilePreview } from './preview/index.js';
import { crumbsOf, joinPath, parentOf } from '../utils/path.js';
/**
 * 工作区浏览面板：面包屑 + 目录树 + 文件预览。
 *
 * 与源实现（dispatch `file-browser.tsx`）的差别：**不搬 CodeMirror 代码预览与 Office/PDF 预览**
 * —— 那两个会引入 `@codemirror/*` 与宿主 `officeToPdf` 两个重依赖，不符合「零必需依赖」。
 * 这里只做文本 / 图片 / 不支持三类，其它类型给明确兜底而不是硬撑。
 */
export function ExplorerPanel(props) {
    ensureControls();
    const tt = props.translate ?? t;
    const [dir, setDir] = useState(props.path ?? '');
    const [entries, setEntries] = useState([]);
    const [truncated, setTruncated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [failed, setFailed] = useState(false);
    const [selected, setSelected] = useState(null);
    const [nonce, setNonce] = useState(0);
    useEffect(() => {
        let alive = true;
        setLoading(true);
        setFailed(false);
        props.workspaceFiles
            .list(props.sessionId, dir === '' ? '.' : dir)
            .then((res) => {
            if (!alive)
                return;
            setEntries([...res.entries]);
            setTruncated(res.truncated);
            setLoading(false);
        })
            .catch(() => {
            if (!alive)
                return;
            setEntries([]);
            setFailed(true);
            setLoading(false);
        });
        return () => {
            alive = false;
        };
    }, [dir, props.sessionId, props.workspaceFiles, nonce]);
    const crumbs = crumbsOf(dir);
    const goto = (next) => {
        setSelected(null);
        props.onSelect?.(null);
        setDir(next);
    };
    const crumbBar = h('div', { className: 'dsh-tdt-exp__crumbs' }, h('button', { type: 'button', className: 'dsh-tdt-exp__crumb', onClick: () => goto('') }, tt('explorerRoot')), crumbs.map((c, i) => {
        const isLast = i === crumbs.length - 1;
        const upto = crumbs.slice(0, i + 1).join('/');
        return h('span', { key: upto }, h('span', { className: 'dsh-tdt-exp__sep' }, ' / '), h('button', {
            type: 'button',
            className: `dsh-tdt-exp__crumb${isLast ? ' dsh-tdt-exp__crumb--current' : ''}`,
            onClick: () => goto(upto),
        }, c));
    }), h('span', { className: 'dsh-tdt-exp__tools' }, h('button', {
        type: 'button',
        className: 'dsh-tdt-exp__crumb',
        disabled: dir === '',
        onClick: () => goto(parentOf(dir)),
    }, tt('explorerUp')), h('button', { type: 'button', className: 'dsh-tdt-exp__crumb', onClick: () => setNonce(nonce + 1) }, tt('explorerRefresh'))));
    const tree = loading
        ? h('div', { className: 'dsh-tdt-exp__note' }, tt('explorerLoading'))
        : failed
            ? h(EmptyState, { text: tt('explorerFailed'), translate: tt })
            : entries.length === 0
                ? h('div', { className: 'dsh-tdt-exp__note' }, props.emptyText ?? tt('explorerEmptyDir'))
                : h('div', { className: 'dsh-tdt-exp__tree' }, [...entries]
                    .sort((a, b) => {
                    if (a.type !== b.type)
                        return a.type === 'directory' ? -1 : 1;
                    return a.name.localeCompare(b.name);
                })
                    .map((e) => {
                    const full = joinPath(dir, e.name);
                    const isDir = e.type === 'directory';
                    return h('div', {
                        key: full,
                        className: `dsh-tdt-exp__item${selected === full ? ' dsh-tdt-exp__item--active' : ''}`,
                        onClick: () => {
                            if (isDir)
                                goto(full);
                            else {
                                setSelected(full);
                                props.onSelect?.(full);
                                props.onOpenFile?.(full);
                            }
                        },
                    }, h('span', { className: 'dsh-tdt-exp__icon' }, isDir ? '▸' : '·'), h('span', { className: 'dsh-tdt-exp__name' }, e.name), e.size === undefined
                        ? null
                        : h('span', { className: 'dsh-tdt-exp__size' }, formatBytes(e.size)));
                }), truncated
                    ? h('div', { className: 'dsh-tdt-exp__note' }, tt('explorerTruncated'))
                    : null);
    return h('div', { className: 'dsh-tdt-exp' }, crumbBar, h('div', { className: 'dsh-tdt-exp__body' }, tree, h('div', { className: 'dsh-tdt-exp__preview' }, selected === null
        ? null
        : h(FilePreview, {
            workspaceFiles: props.workspaceFiles,
            sessionId: props.sessionId,
            path: selected,
            translate: tt,
        }))));
}
//# sourceMappingURL=ExplorerPanel.js.map