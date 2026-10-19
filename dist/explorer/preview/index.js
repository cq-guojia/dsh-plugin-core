import { createElement as h, useEffect, useState } from 'react';
import { ensureControls } from '../../ui/css.js';
import { EmptyState } from '../../ui/EmptyState.js';
import { t } from '../../utils/i18n.js';
import { mimeOf } from '../../utils/path.js';
import { previewKindOf } from '../types.js';
/** 单文件预览：文本 / 图片 / 不支持（明确兜底，不硬撑）。 */
export function FilePreview(props) {
    ensureControls();
    const tt = props.translate ?? t;
    const kind = previewKindOf(props.path);
    const [text, setText] = useState(null);
    const [imageUrl, setImageUrl] = useState(null);
    const [failed, setFailed] = useState(false);
    useEffect(() => {
        let alive = true;
        let url = null;
        setText(null);
        setImageUrl(null);
        setFailed(false);
        const run = async () => {
            if (kind === 'text') {
                const res = await props.workspaceFiles.read(props.sessionId, props.path, {});
                if (alive)
                    setText(res.text);
                return;
            }
            if (kind === 'image') {
                const res = await props.workspaceFiles.readBytes(props.sessionId, props.path, {});
                const mime = mimeOf(props.path) ?? 'application/octet-stream';
                // 复制一份：TS 5.9 下 Uint8Array<ArrayBufferLike> 不是合法的 BlobPart
                const blob = new Blob([new Uint8Array(res.data)], { type: mime });
                url = URL.createObjectURL(blob);
                if (alive)
                    setImageUrl(url);
                return;
            }
        };
        run().catch(() => {
            if (alive)
                setFailed(true);
        });
        return () => {
            alive = false;
            if (url !== null)
                URL.revokeObjectURL(url);
        };
    }, [props.path, props.sessionId, props.workspaceFiles, kind]);
    if (kind === 'unsupported') {
        return h(EmptyState, { text: tt('explorerUnsupported'), translate: tt });
    }
    if (failed)
        return h(EmptyState, { text: tt('explorerFailed'), translate: tt });
    if (kind === 'image') {
        return imageUrl === null
            ? h('div', { className: 'dshpc-exp__note' }, tt('explorerLoading'))
            : h('img', { className: 'dshpc-exp__image', src: imageUrl, alt: props.path });
    }
    return text === null
        ? h('div', { className: 'dshpc-exp__note' }, tt('explorerLoading'))
        : h('pre', { className: 'dshpc-exp__text' }, text);
}
//# sourceMappingURL=index.js.map