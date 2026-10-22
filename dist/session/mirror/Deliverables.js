// 官方对照：packages/client/ui-deliverables/src/client/{PresentRow,PresentedFileCard,Deliverables}.tsx
// （0.1.7-rc.2 lib/client.js：PresentRow 488-560、PresentedFileCard 1529-1600、Deliverables 1632-1710）
//
// 官方产出物层的两个用户可见面，逐值镜像：
//   ① 交付文件行 = `present` 工具调用的专属渲染（官方经 tool.call.toolview 槽位 key='present'
//      挂 PresentRow）：标题「交付文件」+ IconDeliverDocRegular，折叠摘要 = 状态词（已交付…）
//      + 文件路径列表（官方纯文本**不可点**），展开体 = 工具结果原文（pre.output）。
//   ② 交付文件卡网格 = turnTail 槽位挂 DeliverablesTail：每轮被交付成功的文件画成卡片
//      （FileTypeIcon + 文件名 + 简介），**整卡可点 → 预览**；>4 张折叠 +「全部 N 个文件」。
//      官方另有原生打开（桌面 Host）的状态行/重试行——本弹窗无原生层，不渲染。
// 数据真源 = 会话 keyed 流里的 present 工具调用 / turn 级 deliverables.presented（真实取数，禁模拟）。
import { createElement as h, useState } from 'react';
import { DisclosureRow, FileTypeIcon, IconChevronDownOutlineRegular, IconChevronUpOutlineRegular, IconDeliverDocRegular, fileExtension, } from '../../ui/official.js';
import { ocOr } from '../official-classes.js';
const basename = (path) => path.slice(Math.max(path.lastIndexOf('/'), path.lastIndexOf('\\')) + 1);
/** 官方 fileNames（PresentRow.tsx）：argsRaw.files[].path 逗号连接；解析不出回原样。 */
function fileNames(raw) {
    let args;
    try {
        args = JSON.parse(raw);
    }
    catch {
        return raw;
    }
    if (typeof args !== 'object' || args === null || !('files' in args) || !Array.isArray(args.files))
        return raw;
    return args.files
        .flatMap((file) => (typeof file === 'object' && file !== null && 'path' in file && typeof file.path === 'string' ? [file.path] : []))
        .join(', ');
}
/** 官方 PresentRow：present 工具调用的状态行（折叠 = 状态词 + 路径；展开 = 结果原文）。 */
export function PresentRowMirror(props) {
    const { block, t } = props;
    const b = (block ?? {});
    const settled = typeof b.kind === 'string';
    const state = !settled
        ? (b.phase === 'preparing' ? 'preparing' : 'running')
        : b.error?.code === 'interrupted' ? 'stopped' : b.isError ? 'error' : 'ok';
    const argsRaw = (settled ? b.call?.argsRaw : b.argsRaw) ?? '';
    const details = settled
        ? ((b.content ?? []).map((item) => item.type === 'text' ? item.text ?? '' : JSON.stringify(item)).join('\n')
            || (b.error ? `${b.error.name ?? ''}: ${b.error.code ?? ''}` : ''))
        : '';
    const [expanded, setExpanded] = useState(false);
    const statusKey = state === 'preparing' ? 'deliverRowPreparing'
        : state === 'running' ? 'deliverRowRunning'
            : state === 'error' ? 'deliverRowError'
                : state === 'stopped' ? 'deliverRowStopped'
                    : 'deliverRowOk';
    return h('div', {
        className: ocOr('ToolRow', 'root', 'dshpc-sv-tool'),
        'data-tool': 'present',
        'data-state': state,
    }, h(DisclosureRow, {
        icon: h(IconDeliverDocRegular, { size: 14 }),
        title: t('deliverRowTitle'),
        open: expanded && details !== '',
        expandable: details !== '',
        expandOnRowClick: true,
        keepContentWhenOpen: true,
        onToggle: () => { setExpanded((value) => !value); },
        running: state === 'running' || state === 'preparing',
        rowClassName: ocOr('ToolRow', 'row', 'dshpc-sv-tool-row'),
        leadingClassName: ocOr('ToolRow', 'leading', 'dshpc-sv-tool-leading'),
        titleClassName: ocOr('ToolRow', 'title', 'dshpc-sv-tool-title'),
        chevronClassName: ocOr('ToolRow', 'chevron', 'dshpc-sv-tool-chevron'),
        collapsedContent: h('span', { className: ocOr('PresentRow', 'summary', 'dshpc-sv-deliv-rowsummary') }, h('span', null, t(statusKey)), h('span', { className: ocOr('PresentRow', 'paths', 'dshpc-sv-deliv-rowpaths') }, fileNames(argsRaw))),
        children: details !== '' && expanded
            ? h('pre', { className: ocOr('PresentRow', 'output', 'dshpc-sv-deliv-rowoutput') }, details)
            : null,
    }));
}
/** 官方 COLLAPSED_PRESENTED_COUNT（Deliverables.tsx）：超过 4 张折叠。 */
const COLLAPSED_DELIVERED_COUNT = 4;
/** 官方 cardDescription：简介去尾部括注后为空则回退扩展名大写（再退「文件」）。 */
function cardDescription(description, fallback) {
    const trimmed = description?.replace(/\s*(?:\([^()]*\)|（[^（）]*）)\s*$/u, '').trim();
    return trimmed === undefined || trimmed === '' ? fallback : trimmed;
}
/** 官方 PresentedFileCard：整卡可点 → onPreview（官方 = 右栏预览，本弹窗 = 调用方 openFile）。 */
function DeliveredFileCard(props) {
    const { file, onPreview, t } = props;
    const name = basename(file.path);
    const metadata = fileExtension(name).toUpperCase() || t('deliverFileLabel');
    return h('div', {
        className: ocOr('Deliverables', 'file', 'dshpc-sv-deliv-file'),
        'data-presented-file': true,
    }, onPreview !== undefined
        ? h('button', {
            type: 'button',
            className: ocOr('Deliverables', 'cardPreview', 'dshpc-sv-deliv-cardpreview'),
            title: file.path,
            'aria-label': t('deliverPreviewCard', { name: file.path }),
            onClick: (event) => { event.stopPropagation(); onPreview(); },
        })
        : null, h('span', { className: ocOr('Deliverables', 'fileIcon', 'dshpc-sv-deliv-icon') }, h(FileTypeIcon, { path: file.path, size: 20 })), h('div', { className: ocOr('Deliverables', 'fileBody', 'dshpc-sv-deliv-body') }, h('div', { className: ocOr('Deliverables', 'details', 'dshpc-sv-deliv-details') }, h('span', { className: ocOr('Deliverables', 'fileName', 'dshpc-sv-deliv-name') }, name), h('span', { className: ocOr('Deliverables', 'description', 'dshpc-sv-deliv-desc'), 'data-presented-description': true }, h('span', { className: ocOr('Deliverables', 'secondaryText', 'dshpc-sv-deliv-secondary') }, cardDescription(file.description, metadata)), onPreview !== undefined
        ? h('span', { className: ocOr('Deliverables', 'previewHint', 'dshpc-sv-deliv-hint') }, t('deliverPreviewHint'))
        : null))));
}
/**
 * 官方 DeliverablesTail 的 presented 网格（FileTypeIcon + 文件名 + 简介，整卡可点 → 预览）。
 * 「已编辑文件」卡（ChangedFiles）不在这里：它走宿主 api/changes.summary，见
 * mirror/ChangedFilesCard.ts。数据真源 = turn 级 `deliverables.presented`
 * （官方 TurnLocation.data.get('deliverables')，见 changes.ts）。
 */
export function DeliverablesGridMirror(props) {
    const { files, onOpen, t } = props;
    const [expanded, setExpanded] = useState(false);
    if (files.length === 0)
        return null;
    const collapsible = files.length > COLLAPSED_DELIVERED_COUNT;
    const shown = collapsible && !expanded ? files.slice(0, COLLAPSED_DELIVERED_COUNT) : files;
    return h('div', {
        className: ocOr('Deliverables', 'root', 'dshpc-sv-deliv'),
        'data-presented-files-grid': true,
    }, h('div', {
        className: ocOr('Deliverables', 'presented', 'dshpc-sv-deliv-grid'),
        'data-presented-files-row': true,
    }, shown.map((file, index) => h(DeliveredFileCard, {
        key: `${file.path}:${index}`,
        file,
        onPreview: onOpen === undefined ? undefined : () => { onOpen(file.path); },
        t,
    }))), collapsible
        ? h('button', {
            type: 'button',
            className: ocOr('Deliverables', 'toggle', 'dshpc-sv-deliv-toggle'),
            'aria-expanded': expanded,
            'aria-label': t(expanded ? 'deliverCollapseAria' : 'deliverExpandAria', { count: files.length }),
            onClick: () => { setExpanded((value) => !value); },
        }, h('span', null, t(expanded ? 'deliverCollapse' : 'deliverAll', { count: files.length })), expanded ? h(IconChevronUpOutlineRegular, {}) : h(IconChevronDownOutlineRegular, {}))
        : null);
}
//# sourceMappingURL=Deliverables.js.map