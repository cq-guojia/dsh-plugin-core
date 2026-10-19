import { TOKENS_CSS_TEMPLATE } from './tokens-css.js'

/** 明暗判据（宿主启动脚本 `toggleAttribute` 写入 body，是用户在客户端里的选择）。 */
export const DARK_THEME_SELECTOR = 'body[data-ds-dark-theme]'

/** 全生态统一的 CSS 变量前缀。 */
const CSS_PREFIX = 'dshpc'

/** token 域固定名：变量定义必须先于消费它的规则出现。 */
const TOKENS_DOMAIN = 'tokens'

export interface StyleKitOptions {
  /** `<style>` 标签 id —— 多插件同页靠它互不覆盖，必须插件内唯一。 */
  id: string
}

export interface StyleKit {
  readonly id: string
  /** token CSS（可直接 register 到 tokens 域）。 */
  readonly tokensCss: string
  /** 拼一个 CSS 变量名：`cssVar('fg')` ⇒ `--dshpc-fg`。 */
  cssVar(name: string): string
  /** 登记一个域的 CSS（同名重复登记 = 覆盖）。 */
  registerStyle(domain: string, css: string): void
  /** 确保标签已挂载且内容最新（幂等；无 document 时静默跳过）。 */
  ensureStyles(): void
  /** 登记 + 立刻确保挂载。 */
  applyStyle(domain: string, css: string): void
  /** 卸载清理：撤掉挂载的 `<style>` 标签并清空登记域（插件卸载 / HMR 时用）。 */
  dispose(): void
}

/**
 * 领一套本插件专属的样式设施。
 *
 * 为什么是工厂而不是模块级单例：单例只有一个固定 style id，
 * 多个插件同处一页时会抢同一个 `<style>` 标签、后挂载的覆盖先挂载的（见需求文档 §5.2）。
 */
export function createStyleKit(options: StyleKitOptions): StyleKit {
  const { id } = options
  if (id === '') throw new Error('dsh-plugin-core/design: id 不能为空')

  const tokensCss = TOKENS_CSS_TEMPLATE
  const domains = new Map<string, string>()
  let tag: HTMLStyleElement | null = null
  let dirty = true

  const composeCss = (): string => {
    const entries = [...domains.entries()]
    entries.sort((a, b) => (a[0] === TOKENS_DOMAIN ? -1 : b[0] === TOKENS_DOMAIN ? 1 : 0))
    return entries.map(([, css]) => css).join('\n')
  }

  const flush = (): void => {
    if (tag === null) return
    tag.textContent = composeCss()
    dirty = false
  }

  const ensureStyles = (): void => {
    if (typeof document === 'undefined') return
    if (tag === null || !tag.isConnected) {
      const head = document.head
      if (head === null) return
      const found = document.getElementById(id)
      if (found !== null) tag = found as unknown as HTMLStyleElement
      else {
        const el = document.createElement('style')
        el.id = id
        head.appendChild(el)
        tag = el
      }
      dirty = true
    }
    if (dirty) flush()
  }

  const registerStyle = (domain: string, css: string): void => {
    if (domains.get(domain) === css) return
    domains.set(domain, css)
    dirty = true
    if (tag?.isConnected === true) flush()
  }

  const dispose = (): void => {
    if (tag?.isConnected === true) tag.remove()
    tag = null
    domains.clear()
    dirty = true
  }

  return {
    id,
    tokensCss,
    cssVar: (name: string): string => `--${CSS_PREFIX}-${name}`,
    registerStyle,
    ensureStyles,
    dispose,
    applyStyle: (domain: string, css: string): void => {
      registerStyle(domain, css)
      ensureStyles()
    },
  }
}
