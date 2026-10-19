import { Component, createElement as h, type ErrorInfo, type ReactNode } from 'react'
import { ensureControls } from './css.js'
import { t, type Translate } from '../utils/i18n.js'

export interface ErrorBoundaryProps {
  children?: ReactNode
  /** 兜底渲染；不传就用内置错误块（带「重试」）。 */
  fallback?: (error: Error, retry: () => void) => ReactNode
  onError?: (error: Error, info: ErrorInfo) => void
  translate?: Translate
}

interface State {
  error: Error | null
}

/** 错误边界：子组件渲染抛错时不让整个插件白屏。 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, State> {
  override state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    this.props.onError?.(error, info)
  }

  private readonly retry = (): void => {
    this.setState({ error: null })
  }

  override render(): ReactNode {
    const err = this.state.error
    if (err === null) return this.props.children ?? null
    ensureControls()
    if (this.props.fallback !== undefined) return this.props.fallback(err, this.retry)
    const tt = this.props.translate ?? t
    return h(
      'div',
      { className: 'dshpc-error' },
      h('div', null, `${tt('errorTitle')}：${err.message}`),
      h(
        'button',
        { type: 'button', className: 'dshpc-error__retry', onClick: this.retry },
        tt('errorRetry'),
      ),
    )
  }
}
