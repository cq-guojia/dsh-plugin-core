// Office 预览体：宿主 remote.officeToPdf 转 PDF ⇒ iframe 渲染。
// officeToPdf 未注入（宿主没装 dsh-office-to-pdf）⇒ 「预览不可用」空态，不发起请求、不崩。
import { createElement as h, useEffect, useState } from 'react';
import { ensureControls } from '../../ui/css.js';
import { EmptyState } from '../../ui/EmptyState.js';
import { t } from '../../utils/i18n.js';
import { bytesOf, errView } from '../types.js';
export function OfficePreview(props) {
    ensureControls();
    const tt = props.translate ?? t;
    const [url, setUrl] = useState(null);
    const [failed, setFailed] = useState(null);
    useEffect(() => {
        let alive = true;
        let objectUrl = null;
        setUrl(null);
        setFailed(null);
        const face = props.officeToPdf;
        if (face === null)
            return;
        face
            .render(props.sessionId, props.path, 'foreground')
            .then((res) => {
            const data = bytesOf(res);
            if (!alive)
                return;
            if (data === null || 'failed' in data) {
                setFailed(errView(data === null ? undefined : data.failed));
                return;
            }
            const blob = new Blob([new Uint8Array(data)], { type: 'application/pdf' });
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
    }, [props.officeToPdf, props.sessionId, props.path]);
    if (props.officeToPdf === null) {
        return h(EmptyState, { text: tt('previewOfficeUnavailable'), translate: tt });
    }
    if (failed !== null)
        return h(EmptyState, { text: tt(failed.key, failed.params), translate: tt });
    if (url === null)
        return h('div', { className: 'dshpc-fb__note' }, tt('explorerLoading'));
    return h('iframe', { className: 'dshpc-fb__frame', src: url, title: props.path });
}
//# sourceMappingURL=OfficePreview.js.map