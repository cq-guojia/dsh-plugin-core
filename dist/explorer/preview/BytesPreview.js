// 二进制预览体：图片（<img>）/ PDF（iframe 原生渲染）。
// readBytes 读全量（受部署 maxFileBytes 封顶，超出抛 too-large ⇒ 错误态）。
import { createElement as h, useEffect, useState } from 'react';
import { t } from '../../utils/i18n.js';
import { bytesOf, errView } from '../types.js';
import { ensureComponentStyles } from '../../ui/css.js';
import { EXPLORER_CSS } from '../explorer-css.js';
export function BytesPreview(props) {
    ensureComponentStyles('explorer', EXPLORER_CSS);
    const tt = props.translate ?? t;
    const [url, setUrl] = useState(null);
    const [failed, setFailed] = useState(null);
    useEffect(() => {
        let alive = true;
        let objectUrl = null;
        setUrl(null);
        setFailed(null);
        props.workspaceFiles
            .readBytes(props.sessionId, props.path, {})
            .then((res) => {
            const data = bytesOf(res);
            if (!alive)
                return;
            if (data === null) {
                console.warn('[dsh-plugin-core:explorer] readBytes 返回体无法解析为字节', props.path, res);
                setFailed({ key: 'previewBadPayload' });
                return;
            }
            if ('failed' in data) {
                setFailed(errView(data.failed));
                return;
            }
            // 复制一份：TS 5.9 下 Uint8Array<ArrayBufferLike> 不是合法的 BlobPart
            const blob = new Blob([new Uint8Array(data)], { type: props.mime });
            objectUrl = URL.createObjectURL(blob);
            setUrl(objectUrl);
        })
            .catch((error) => {
            if (alive)
                setFailed(errView(error));
        });
        return () => {
            alive = false;
            if (objectUrl !== null)
                URL.revokeObjectURL(objectUrl);
        };
    }, [props.workspaceFiles, props.sessionId, props.path, props.mime]);
    if (failed !== null)
        return h('div', { className: 'dshpc-fb__note' }, tt(failed.key, failed.params));
    if (url === null)
        return h('div', { className: 'dshpc-fb__note' }, tt('explorerLoading'));
    if (props.kind === 'image') {
        return h('img', { className: 'dshpc-fb__image', src: url, alt: props.path });
    }
    return h('div', { className: 'dshpc-fb__fill' }, h('iframe', { className: 'dshpc-fb__frame', src: url, title: props.path }));
}
//# sourceMappingURL=BytesPreview.js.map