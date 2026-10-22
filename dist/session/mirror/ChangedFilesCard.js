// 官方 ChangedFiles 卡（@deepseek-ai/dsh-client-ui-deliverables client.js:1351-1476）镜像：
// 头 = FileTypeIcon（单文件取 path、多文件取 kind:"code"）+ 标题（单 = 「已编辑 {basename}」，
// 多 = 「已编辑 {count} 个文件」）+ 计数（+N -M，hover 才上色，同官方）。
// 单文件点头 = onOpenFile(path)（官方开右侧 review 标签页；本包对外的文件打开口只有这一个）。
// 二进制 / 超限文件不显示计数，只出状态词（官方同）。
import { createElement as h, useEffect, useState } from 'react';
import { FileTypeIcon } from '../../ui/official.js';
import { baseNameOf } from '../../utils/index.js';
import { changesSummaryUrl, parseChangesSummary } from '../changes.js';
/** 会话级缓存：同一 (sessionId, seq) 只拉一次（官方 ChangesSummaryStore 同语义）。 */
const cache = new Map();
export function ChangedFilesCard(props) {
    const { sessionId, seq, onOpen, t } = props;
    const url = changesSummaryUrl(sessionId, seq);
    const [summary, setSummary] = useState(undefined);
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
    const stat = single?.binary === true
        ? t('changesBinary')
        : single?.oversized === true
            ? t('changesOversized')
            : h('span', { className: 'dshpc-sv-changes-counts' }, h('span', { className: 'dshpc-sv-changes-added' }, `+${summary.added}`), ' ', h('span', { className: 'dshpc-sv-changes-removed' }, `-${summary.deleted}`));
    const body = h('span', { className: 'dshpc-sv-changes-icon' }, icon, h('span', { className: 'dshpc-sv-changes-body' }, h('span', { className: 'dshpc-sv-changes-title' }, title), h('span', { className: 'dshpc-sv-changes-stat' }, stat)));
    // 单文件 + 有打开出口 = 可点头；多文件不猜用户想开哪个（官方开 review 页，本包无此槽）。
    if (single === undefined || onOpen === undefined) {
        return h('div', { className: 'dshpc-sv-changes', 'data-changed-files': true }, body);
    }
    return h('button', {
        type: 'button',
        className: 'dshpc-sv-changes dshpc-sv-changes--open',
        'data-changed-files': true,
        title: single.path,
        onClick: () => { onOpen(single.path); },
    }, body);
}
//# sourceMappingURL=ChangedFilesCard.js.map