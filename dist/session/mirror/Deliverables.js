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
import { officialClass } from '../official-classes.js';
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
/** 官方 PreparingPresentRow：瘦行（只标题+图标、不可展开、running），root 无类名。 */
function PreparingPresentRow(props) {
    const { t } = props;
    return h('div', {
        'data-tool': 'present',
        'data-state': 'preparing',
        'aria-label': t('deliverRowPreparing'),
    }, h(DisclosureRow, {
        title: t('deliverRowTitle'),
        icon: h(IconDeliverDocRegular, { size: 14 }),
        open: false,
        expandable: false,
        onToggle: () => { },
        running: true,
    }));
}
/** 官方 PresentRow：present 工具调用的状态行（折叠 = 状态词 + 路径；展开 = 结果原文）。 */
export function PresentRowMirror(props) {
    const { block, t } = props;
    const b = (block ?? {});
    const settled = typeof b.kind === 'string';
    if (!settled && b.phase === 'preparing')
        return h(PreparingPresentRow, { t });
    const state = !settled
        ? 'running'
        : b.error?.code === 'interrupted' ? 'stopped' : b.isError ? 'error' : 'ok';
    const argsRaw = (settled ? b.call?.argsRaw : b.argsRaw) ?? '';
    const details = settled
        ? ((b.content ?? []).map((item) => item.type === 'text' ? item.text ?? '' : JSON.stringify(item)).join('\n')
            || (b.error ? `${b.error.name ?? ''}: ${b.error.code ?? ''}` : ''))
        : '';
    const [expanded, setExpanded] = useState(false);
    const statusKey = state === 'running' ? 'deliverRowRunning'
        : state === 'error' ? 'deliverRowError'
            : state === 'stopped' ? 'deliverRowStopped'
                : 'deliverRowOk';
    return h('div', {
        // 官方 StartedPresentRow 的 root 不挂任何类（只 data-tool / data-state）。
        'data-tool': 'present',
        'data-state': state,
    }, h(DisclosureRow, {
        title: t('deliverRowTitle'),
        icon: h(IconDeliverDocRegular, { size: 14 }),
        open: expanded && details !== '',
        expandable: details !== '',
        expandOnRowClick: true,
        keepContentWhenOpen: true,
        onToggle: () => { setExpanded((value) => !value); },
        collapsedContent: h('span', { className: officialClass('PresentRow', 'summary') ?? '' }, h('span', null, t(statusKey)), h('span', { className: officialClass('PresentRow', 'paths') ?? '' }, fileNames(argsRaw))),
        // 官方 children 是数组且 pre.output **恒在**（空字符串也渲染）。
        children: [h('pre', { key: 'output', className: officialClass('PresentRow', 'output') ?? '' }, details)],
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
        className: officialClass('Deliverables', 'file') ?? '',
        'data-presented-file': true,
    }, 
    // 官方 cardPreview 按钮**恒在**（弹窗无预览出口时点击无副作用）。
    h('button', {
        type: 'button',
        className: officialClass('Deliverables', 'cardPreview') ?? '',
        title: file.path,
        'aria-label': t('deliverPreviewCard', { name: file.path }),
        onClick: (event) => {
            event.stopPropagation();
            onPreview?.();
        },
    }), h('span', { className: officialClass('Deliverables', 'fileIcon') ?? '' }, h(FileTypeIcon, { path: file.path, size: 20 })), h('div', { className: officialClass('Deliverables', 'fileBody') ?? '' }, h('div', { className: officialClass('Deliverables', 'details') ?? '' }, h('span', { className: officialClass('Deliverables', 'fileName') ?? '' }, name), h('span', { className: officialClass('Deliverables', 'description') ?? '', 'data-presented-description': true }, h('span', { className: officialClass('Deliverables', 'secondaryText') ?? '' }, cardDescription(file.description, metadata)), h('span', { className: officialClass('Deliverables', 'previewHint') ?? '' }, t('deliverPreviewHint'))))));
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
        className: officialClass('Deliverables', 'root') ?? '',
        'data-after-changes': true,
        'data-presented-files-grid': true,
    }, h('div', {
        className: officialClass('Deliverables', 'presented') ?? '',
        'data-presented-files-row': true,
        // 官方单文件整行铺满（CSS 依赖 data-single）。
        'data-single': files.length === 1 || undefined,
    }, shown.map((file, index) => h(DeliveredFileCard, {
        key: `${file.path}:${index}`,
        file,
        onPreview: onOpen === undefined ? undefined : () => { onOpen(file.path); },
        t,
    }))), collapsible
        ? h('button', {
            type: 'button',
            className: officialClass('Deliverables', 'toggle') ?? '',
            'aria-expanded': expanded,
            'aria-label': t(expanded ? 'deliverCollapseAria' : 'deliverExpandAria', { count: files.length }),
            onClick: () => { setExpanded((value) => !value); },
        }, h('span', null, t(expanded ? 'deliverCollapse' : 'deliverAll', { count: files.length })), expanded ? h(IconChevronUpOutlineRegular, {}) : h(IconChevronDownOutlineRegular, {}))
        : null);
}
//# sourceMappingURL=Deliverables.js.map