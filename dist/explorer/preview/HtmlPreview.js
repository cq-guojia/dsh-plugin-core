// HTML 静态预览：官方同款安全处理（禁标签 / 禁属性 / CSP + sandbox=""）后 iframe 渲染；
// 源码态走 TextPreview 并按 256K 截断。降级路径（无 DOM 能力时）直接出错误态，不猜。
import { createElement as h, useEffect, useState } from 'react';
import { ensureControls } from '../../ui/css.js';
import { t } from '../../utils/i18n.js';
import { bytesOf, errView, SOURCE_MAX_BYTES } from '../types.js';
import { TextPreview } from './TextPreview.js';
/** 官方 CSP 原文（documentpreview lib/client.js 同款，不多开不少关）。 */
const HTML_CSP = "default-src 'none'; script-src 'none'; style-src 'unsafe-inline'; img-src data:; font-src data:; media-src data:";
/** 禁用标签（官方清单）。 */
const HTML_FORBID_TAGS = ['noscript', 'base', 'link', 'meta', 'iframe', 'frame', 'object', 'embed', 'set', 'animate', 'animatemotion', 'animatetransform'];
/** 禁用属性（官方清单）。 */
const HTML_FORBID_ATTRS = ['href', 'xlink:href'];
/**
 * 把 HTML 字节做成官方同款的静态预览文档：剔除禁用标签/属性、head 首项插 CSP。
 * 真正的兜底是 iframe `sandbox=""`（禁脚本执行）+ CSP（禁一切外链）。
 */
export function buildStaticHtml(data) {
    if (typeof DOMParser === 'undefined')
        return undefined;
    let source;
    try {
        source = new TextDecoder('utf-8', { fatal: false }).decode(data);
    }
    catch {
        return undefined;
    }
    let doc;
    try {
        doc = new DOMParser().parseFromString(source, 'text/html');
    }
    catch {
        return undefined;
    }
    for (const tag of HTML_FORBID_TAGS) {
        for (const el of Array.from(doc.querySelectorAll(tag)))
            el.remove();
    }
    // ⚠️ 禁用属性只能「遍历元素逐个 removeAttribute」，不能拼 `[${attr}]` 选择器：
    // `xlink:href` 带命名空间冒号，不是合法 CSS 选择器 —— querySelectorAll 会直接抛
    // SyntaxError（真机 2026-10-22：源码能读出来、预览区却报「加载失败」，就是它）。
    for (const el of Array.from(doc.querySelectorAll('*'))) {
        for (const attr of HTML_FORBID_ATTRS)
            el.removeAttribute(attr);
    }
    const csp = doc.createElement('meta');
    csp.setAttribute('http-equiv', 'Content-Security-Policy');
    csp.setAttribute('content', HTML_CSP);
    const head = doc.head ?? doc.documentElement;
    head.insertBefore(csp, head.firstChild);
    return `<!DOCTYPE html>\n${doc.documentElement.outerHTML}`;
}
export function HtmlPreview(props) {
    ensureControls();
    const tt = props.translate ?? t;
    const [doc, setDoc] = useState(null);
    const [failed, setFailed] = useState(null);
    useEffect(() => {
        if (props.sourceView)
            return;
        let alive = true;
        setDoc(null);
        setFailed(null);
        props.workspaceFiles
            .readBytes(props.sessionId, props.path, {})
            .then((res) => {
            const data = bytesOf(res);
            if (!alive)
                return;
            if (data === null) {
                // 形状不对要说「返回数据不符合预期」，不能混进「加载失败」——混了就永远查不出是谁的锅。
                console.warn('[dsh-plugin-core:explorer] readBytes 返回体无法解析为字节', props.path, res);
                setFailed({ key: 'previewBadPayload' });
                return;
            }
            if ('failed' in data) {
                setFailed(errView(data.failed));
                return;
            }
            const html = buildStaticHtml(data);
            if (html === undefined) {
                setFailed({ key: 'previewRenderFailed' });
                return;
            }
            setDoc(html);
        })
            .catch((error) => {
            if (alive)
                setFailed(errView(error));
        });
        return () => {
            alive = false;
        };
    }, [props.workspaceFiles, props.sessionId, props.path, props.sourceView]);
    if (props.sourceView) {
        return h(TextPreview, {
            workspaceFiles: props.workspaceFiles,
            sessionId: props.sessionId,
            path: props.path,
            markdown: false,
            sourceView: true,
            maxBytes: SOURCE_MAX_BYTES,
            translate: tt,
        });
    }
    if (failed !== null)
        return h('div', { className: 'dshpc-fb__note' }, tt(failed.key, failed.params));
    if (doc === null)
        return h('div', { className: 'dshpc-fb__note' }, tt('explorerLoading'));
    return h('div', { className: 'dshpc-fb__fill' }, h('iframe', { className: 'dshpc-fb__frame', sandbox: '', srcDoc: doc, title: props.path }));
}
//# sourceMappingURL=HtmlPreview.js.map