import { createElement as h, useEffect, useState } from 'react';
import { ensureControls } from '../ui/css.js';
import { Modal } from '../ui/Modal.js';
import { EmptyState } from '../ui/EmptyState.js';
import { t } from '../utils/i18n.js';
import { formatBytes } from '../utils/number.js';
import { ROLE_LABEL_KEY } from './types.js';
export function SessionPreview(props) {
    ensureControls();
    const tt = props.translate ?? t;
    const variant = props.variant ?? 'modal';
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [failed, setFailed] = useState(false);
    const [nonce, setNonce] = useState(0);
    useEffect(() => {
        let alive = true;
        setLoading(true);
        setFailed(false);
        props.source
            .listMessages(props.sessionId)
            .then((list) => {
            if (alive) {
                setMessages(list);
                setLoading(false);
            }
        })
            .catch(() => {
            if (alive) {
                setMessages([]);
                setFailed(true);
                setLoading(false);
            }
        });
        return () => {
            alive = false;
        };
    }, [props.sessionId, props.source, nonce]);
    const body = loading
        ? h('div', { className: 'dsh-tdt-ses__note' }, tt('sessionLoading'))
        : failed
            ? h(EmptyState, {
                text: tt('sessionFailed'),
                translate: tt,
                action: h('button', { type: 'button', className: 'dsh-tdt-error__retry', onClick: () => setNonce(nonce + 1) }, tt('errorRetry')),
            })
            : messages.length === 0
                ? h(EmptyState, { text: tt('sessionEmpty'), translate: tt })
                : h('div', { className: 'dsh-tdt-ses__list' }, messages.map((m) => props.renderMessage !== undefined
                    ? h('div', { key: m.id }, props.renderMessage(m))
                    : h('div', { key: m.id, className: `dsh-tdt-ses__msg dsh-tdt-ses__msg--${m.role}` }, h('div', { className: 'dsh-tdt-ses__head' }, tt(ROLE_LABEL_KEY[m.role])), h('pre', { className: 'dsh-tdt-ses__text' }, m.text), (m.attachments ?? []).length === 0
                        ? null
                        : h('div', { className: 'dsh-tdt-ses__atts' }, (m.attachments ?? []).map((a) => h('button', {
                            key: a.path,
                            type: 'button',
                            className: 'dsh-tdt-ses__att',
                            onClick: () => props.onOpenFile?.(a.path),
                        }, a.name, a.bytes === undefined ? null : ` ${formatBytes(a.bytes)}`))))));
    if (variant === 'modal') {
        return h(Modal, {
            title: props.title ?? props.sessionId,
            onClose: props.onClose,
            children: h('div', { className: 'dsh-tdt-ses', style: { minWidth: 'min(720px, 88vw)' } }, body),
        });
    }
    return h('div', { className: `dsh-tdt-ses dsh-tdt-ses--${variant}` }, props.onClose === undefined
        ? null
        : h('div', { className: 'dsh-tdt-ses__head' }, h('button', { type: 'button', className: 'dsh-tdt-exp__crumb', onClick: props.onClose }, '✕')), body);
}
export { ROLE_LABEL_KEY } from './types.js';
//# sourceMappingURL=index.js.map