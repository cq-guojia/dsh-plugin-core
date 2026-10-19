import { Component, createElement as h } from 'react';
import { ensureControls } from './css.js';
import { t } from '../utils/i18n.js';
/** 错误边界：子组件渲染抛错时不让整个插件白屏。 */
export class ErrorBoundary extends Component {
    constructor() {
        super(...arguments);
        this.state = { error: null };
        this.retry = () => {
            this.setState({ error: null });
        };
    }
    static getDerivedStateFromError(error) {
        return { error };
    }
    componentDidCatch(error, info) {
        this.props.onError?.(error, info);
    }
    render() {
        const err = this.state.error;
        if (err === null)
            return this.props.children ?? null;
        ensureControls();
        if (this.props.fallback !== undefined)
            return this.props.fallback(err, this.retry);
        const tt = this.props.translate ?? t;
        return h('div', { className: 'dshpc-error' }, h('div', null, `${tt('errorTitle')}：${err.message}`), h('button', { type: 'button', className: 'dshpc-error__retry', onClick: this.retry }, tt('errorRetry')));
    }
}
//# sourceMappingURL=ErrorBoundary.js.map