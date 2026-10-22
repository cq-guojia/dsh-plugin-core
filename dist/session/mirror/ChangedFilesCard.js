// 官方 ChangedFiles 卡（@deepseek-ai/dsh-client-ui-deliverables client.js:1351-1476，
// 0.2.1-rc.2 解包核实）镜像：
//   div.card[data-changed-files][data-single?]
//    ├─ header（button；单文件 = 打开该文件，多文件 = 静态头）：
//    │    tile（40×40 图标块）+ titles > title（已编辑 x / 已编辑 N 个文件）
//    │    + stat（计数 +N -M 常显上色 / 二进制 / 超限；hover 时换显「预览」提示）
//    ├─ ul.list > li > HoverCard > button.row（仅多文件）：路径（ellipsis）+ 每文件计数；
//    │    hover 500ms 出该文件的 diff 预览卡，点行 = 打开该文件
//    └─ button.toggle（files > COLLAPSED_ROWS=4 才出）：「全部 N 个文件 / 收起」+  Chevron
//  官方差异（有意）：① 官方点击 = openReview 开右侧 review 标签页，本包没有这个槽 ⇒ 走
//  调用方给的 onOpen（文件预览）；② hover 预览的 diff 数据走宿主只读路由 `api/changes.diff`
//  （官方走注入的 useChangesDiff 服务，本包拿同一个路由自己拉，见 ChangedFileDiff.ts）。
//  二进制 / 超限文件不显示计数，只出状态词（官方同）。
import { createElement as h, Fragment, useEffect, useRef, useState } from 'react';
import { HoverCard } from '../../ui/official.js';
import { IconChevronDownOutlineRegular, IconChevronUpOutlineRegular, } from '../../ui/official.js';
import { FileTypeIcon } from '../../ui/official.js';
import { baseNameOf } from '../../utils/index.js';
import { changesSummaryUrl, parseChangesSummary } from '../changes.js';
import { ChangedFileDiff } from './ChangedFileDiff.js';
/** 会话级缓存：同一 (sessionId, seq) 只拉一次（官方 ChangesSummaryStore 同语义）。 */
const cache = new Map();
/** 官方 COLLAPSED_ROWS（适配收尾消息的汇总高度）：超过才折叠 + 出 toggle。 */
const COLLAPSED_ROWS = 4;
/** 官方 Counts：added（成功色）+ deleted（错误色），常显不靠 hover。 */
function Counts(props) {
    const grouped = new Intl.NumberFormat('en-US');
    return h(Fragment, null, h('span', { className: 'dshpc-sv-changes-added' }, `+${grouped.format(props.added)}`), ' ', h('span', { className: 'dshpc-sv-changes-deleted' }, `-${grouped.format(props.deleted)}`));
}
/** 计数或状态词（官方 binary / oversized 顶替计数）。 */
function countsOf(file, t) {
    if (file.binary === true)
        return t('changesBinary');
    if (file.oversized === true)
        return t('changesOversized');
    return h(Counts, { added: file.added, deleted: file.deleted });
}
export function ChangedFilesCard(props) {
    const { sessionId, seq, onOpen, t } = props;
    const url = changesSummaryUrl(sessionId, seq);
    const [summary, setSummary] = useState(undefined);
    const [expanded, setExpanded] = useState(false);
    // 官方 cardRef：既定 preview 卡的宽度基准，也是 header / row hover 预览的定位锚。
    const cardRef = useRef(null);
    useEffect(() => {
        if (cache.has(url)) {
            setSummary(cache.get(url));
            return;
        }
        let alive = true;
        void (async () => {
            let next = null;
            try {
                const res = await fetch(url);
                next = res.ok ? parseChangesSummary(await res.json()) : null;
            }
            catch {
                next = null; // 路由缺席 / 网络失败 = 不渲染，不猜
            }
            cache.set(url, next);
            if (alive)
                setSummary(next);
        })();
        return () => { alive = false; };
    }, [url]);
    if (summary === undefined || summary === null || summary.total === 0 || summary.files.length === 0)
        return null;
    const single = summary.total === 1 ? summary.files[0] : undefined;
    // 图标：单文件取该文件路径；多文件取第一个（官方此处用 kind:'code'，但宿主安装的
    // primitives 版本 FileTypeIconProps 只有 path 形态，别为一个小图标引版本风险）。
    const [firstFile] = summary.files;
    const icon = firstFile === undefined
        ? null
        : h(FileTypeIcon, { path: single?.path ?? firstFile.path, size: 20 });
    const title = single === undefined
        ? t('changesMulti', { count: String(summary.total) })
        : t('changesSingle', { name: baseNameOf(single.path) });
    const foldable = summary.files.length > COLLAPSED_ROWS;
    const rows = foldable && !expanded ? summary.files.slice(0, COLLAPSED_ROWS) : summary.files;
    const headerBody = h(Fragment, null, h('span', { className: 'dshpc-sv-changes-tile' }, icon), h('span', { className: 'dshpc-sv-changes-titles' }, h('span', { className: 'dshpc-sv-changes-title' }, title), h('span', { className: 'dshpc-sv-changes-stat' }, h('span', { className: 'dshpc-sv-changes-statcounts' }, countsOf(single ?? summary, t)), 
    // 官方 previewHint：hover/focus 时替换计数显示（提示这张卡可以 hover 出 diff 预览）。
    h('span', { className: 'dshpc-sv-changes-previewhint' }, t('deliverPreviewHint')))));
    // 单文件 + 有打开出口 = 可点头（官方单文件点头也开 review）；多文件头静态（官方开 review 页，
    // 本包无此槽 ⇒ 不给假入口）。都没有 ⇒ 整行不可点。
    const headerNode = single !== undefined && onOpen !== undefined
        ? h('button', {
            type: 'button',
            className: 'dshpc-sv-changes-header',
            title: single.path,
            onClick: () => { onOpen(single.path); },
        }, headerBody)
        : h('div', { className: 'dshpc-sv-changes-header' }, headerBody);
    /** 官方 hover 预览卡（variant preview + dwell 500 + 宽度跟整卡）；content 挂上才取数。 */
    const previewOf = (index, display) => h(ChangedFileDiff, { sessionId, seq, index, display, t });
    const rowOf = (file, index) => {
        const body = h(Fragment, null, h('span', { className: 'dshpc-sv-changes-path' }, file.display), h('span', { className: 'dshpc-sv-changes-counts' }, countsOf(file, t)));
        const row = onOpen === undefined
            ? h('div', { className: 'dshpc-sv-changes-row', title: file.path }, body)
            : h('button', {
                type: 'button',
                className: 'dshpc-sv-changes-row',
                title: file.path,
                onClick: () => { onOpen(file.path); },
            }, body);
        return h(HoverCard, {
            key: file.display,
            variant: 'preview',
            widthAnchorRef: cardRef,
            openDelayMs: 500,
            anchor: row,
            content: previewOf(index, file.display),
        });
    };
    const list = single === undefined
        ? h('ul', { className: 'dshpc-sv-changes-list' }, rows.map((file, index) => h('li', { key: file.display }, rowOf(file, index))))
        : null;
    const toggle = foldable
        ? h('button', {
            type: 'button',
            className: 'dshpc-sv-changes-toggle',
            'aria-expanded': expanded,
            'aria-label': t(expanded ? 'deliverCollapseAria' : 'deliverExpandAria', { count: summary.files.length }),
            onClick: () => { setExpanded((value) => !value); },
        }, h('span', null, t(expanded ? 'changesCollapse' : 'changesAll', { count: summary.files.length })), expanded ? h(IconChevronUpOutlineRegular, {}) : h(IconChevronDownOutlineRegular, {}))
        : null;
    // 单文件：头本身就是那一个文件的预览锚（官方同）；多文件：锚在各行上。
    const header = single === undefined
        ? headerNode
        : h(HoverCard, {
            variant: 'preview',
            widthAnchorRef: cardRef,
            openDelayMs: 500,
            anchor: headerNode,
            content: previewOf(0, single.display),
        });
    return h('div', {
        ref: cardRef,
        className: 'dshpc-sv-changes',
        'data-changed-files': true,
        'data-single': single !== undefined || undefined,
    }, header, list, toggle);
}
//# sourceMappingURL=ChangedFilesCard.js.map