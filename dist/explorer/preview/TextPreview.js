// 文本 / markdown / 代码预览体。
//
//  - md 且非源码态 ⇒ 官方 MarkdownText（mdast 管线 + KaTeX）；
//  - 其余（源码态 / 代码 / 纯文本）⇒ 官方 CodeBlock（Shiki，零 npm 依赖；
//    大文件拖宽卡顿问题若真出现再议，不为此引 CodeMirror 全家桶进共享底座）；
//  - read 分页累积，`!eof` 出「加载更多」；传了 maxBytes（HTML 源码态）则按字节截断、
//    不出按钮、顶部出横幅。
//
// ⚠️ read 的第三个参数（range）口径：**首页 `{}`、翻页 `{offset}`，绝不带 `limit`**。
//   远端对 range 按值校验，多塞 limit 会被拒（表现 = 每种文件都「加载失败」）；
//   兄弟项目 dsh-task-dispatch-table 与本仓文档（types.ts / dsh-host.md / features/explorer.md）
//   同为 `{}` + `{offset}` 两态，分页步长由远端定，不在这里猜。
import { createElement as h, useCallback, useEffect, useRef, useState } from 'react';
import { MarkdownText } from '../../ui/official.js';
import { CodeViewer } from '../../ui/CodeViewer.js';
import { Button } from '../../ui/Button.js';
import { t } from '../../utils/i18n.js';
import { errView, textPageOf } from '../types.js';
import { formatBytes } from '../../utils/number.js';
import { markdownLabels } from './md-labels.js';
import { ensureComponentStyles } from '../../ui/css.js';
import { EXPLORER_CSS } from '../explorer-css.js';
export function TextPreview(props) {
    ensureComponentStyles('explorer', EXPLORER_CSS);
    const tt = props.translate ?? t;
    const [text, setText] = useState('');
    const [truncated, setTruncated] = useState(false);
    const [nextOffset, setNextOffset] = useState(null);
    const [loading, setLoading] = useState(false);
    const [failed, setFailed] = useState(null);
    // 累计文本放 ref：翻页/截断判定要读「这一页加上之后的全文」，闭包 state 会是旧值。
    const accRef = useRef('');
    const load = useCallback(async (offset, append) => {
        setLoading(true);
        try {
            // range 只两态：首页 `{}`、翻页 `{offset}`（见文件头口径说明）。
            const parsed = textPageOf(await props.workspaceFiles.read(props.sessionId, props.path, offset > 0 ? { offset } : {}));
            if (parsed === null) {
                // 形状不对要说「返回数据不符合预期」，不能混进「加载失败」——混了就永远查不出是谁的锅。
                console.warn('[dsh-plugin-core:explorer] read 返回体无法解析为文本页', props.path);
                setFailed({ key: 'previewBadPayload' });
                return;
            }
            if ('failed' in parsed) {
                setFailed(errView(parsed.failed));
                return;
            }
            setFailed(null);
            const full = append ? accRef.current + parsed.text : parsed.text;
            accRef.current = full;
            setText(full);
            if (props.maxBytes !== undefined) {
                // 有上限：按 UTF-8 实字节（Blob.size）判超限，超了截断不出翻页钮。
                if (parsed.eof) {
                    setNextOffset(null);
                }
                else if (new Blob([full]).size >= props.maxBytes) {
                    setTruncated(true);
                    setNextOffset(null);
                }
                else {
                    setNextOffset(parsed.offset + parsed.lines);
                }
                return;
            }
            setNextOffset(parsed.eof ? null : parsed.offset + parsed.lines);
        }
        catch (error) {
            setFailed(errView(error));
        }
        finally {
            setLoading(false);
        }
    }, [props.workspaceFiles, props.sessionId, props.path, props.maxBytes]);
    useEffect(() => {
        accRef.current = '';
        setText('');
        setTruncated(false);
        setNextOffset(null);
        setFailed(null);
        void load(0, false);
    }, [load]);
    if (failed !== null)
        return h('div', { className: 'dshpc-fb__note' }, tt(failed.key, failed.params));
    if (text === '' && loading)
        return h('div', { className: 'dshpc-fb__note' }, tt('explorerLoading'));
    const rendered = props.markdown && !props.sourceView;
    return h('div', { className: 'dshpc-fb__text', style: { display: 'flex', flexDirection: 'column', ...(rendered ? { padding: '12px 14px' } : {}) } }, truncated
        ? h('div', { className: 'dshpc-fb__banner' }, tt('previewTruncated', { n: formatBytes(props.maxBytes ?? 0) }))
        : null, rendered
        ? h(MarkdownText, { text, labels: markdownLabels() })
        : h('div', { style: { flex: '1 1 auto', minHeight: 0, display: 'flex' } }, h(CodeViewer, { text, path: props.path, t: tt })), nextOffset !== null && props.maxBytes === undefined
        ? h('div', { className: 'dshpc-fb__more' }, h(Button, { variant: 'outline', size: 'sm', loading: loading, onClick: () => void load(nextOffset, true) }, tt('previewLoadMore')))
        : null);
}
//# sourceMappingURL=TextPreview.js.map