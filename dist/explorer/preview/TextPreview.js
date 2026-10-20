// 文本 / markdown / 代码预览体。
//
//  - md 且非源码态 ⇒ 官方 MarkdownText（mdast 管线 + KaTeX）；
//  - 其余（源码态 / 代码 / 纯文本）⇒ 官方 CodeBlock（Shiki，零 npm 依赖；
//    大文件拖宽卡顿问题若真出现再议，不为此引 CodeMirror 全家桶进共享底座）；
//  - read 分页累积，`!eof` 出「加载更多」；传了 maxBytes（HTML 源码态）则按字节截断、
//    不出按钮、顶部出横幅。
import { createElement as h, useCallback, useEffect, useRef, useState } from 'react';
import { CodeBlock, MarkdownText, languageForPath } from '../../ui/official.js';
import { ensureControls } from '../../ui/css.js';
import { Button } from '../../ui/Button.js';
import { EmptyState } from '../../ui/EmptyState.js';
import { t } from '../../utils/i18n.js';
import { errView, textPageOf } from '../types.js';
import { formatBytes } from '../../utils/number.js';
import { markdownLabels } from './md-labels.js';
/** read 分页单页行数（官方单页上限 5000 行）。 */
const PAGE_LINES = 5000;
export function TextPreview(props) {
    ensureControls();
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
            const parsed = textPageOf(await props.workspaceFiles.read(props.sessionId, props.path, { offset, limit: PAGE_LINES }));
            if (parsed === null || 'failed' in parsed) {
                setFailed(errView(parsed === null ? undefined : parsed.failed));
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
        return h(EmptyState, { text: tt(failed.key, failed.params), translate: tt });
    if (text === '' && loading)
        return h('div', { className: 'dshpc-fb__note' }, tt('explorerLoading'));
    const rendered = props.markdown && !props.sourceView;
    return h('div', { className: 'dshpc-fb__text' }, truncated
        ? h('div', { className: 'dshpc-fb__banner' }, tt('previewTruncated', { n: formatBytes(props.maxBytes ?? 0) }))
        : null, rendered
        ? h(MarkdownText, { text, labels: markdownLabels() })
        : h(CodeBlock, {
            code: text,
            lang: languageForPath(props.path),
            lineNumbers: false,
            wrap: true,
        }), nextOffset !== null && props.maxBytes === undefined
        ? h('div', { className: 'dshpc-fb__more' }, h(Button, { variant: 'outline', size: 'sm', loading: loading, onClick: () => void load(nextOffset, true) }, tt('previewLoadMore')))
        : null);
}
//# sourceMappingURL=TextPreview.js.map