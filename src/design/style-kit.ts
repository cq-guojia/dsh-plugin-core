import { TOKENS_CSS_TEMPLATE } from './tokens-css.js'

/** 明暗判据（宿主启动脚本 `toggleAttribute` 写入 body，是用户在客户端里的选择）。 */
export const DARK_THEME_SELECTOR = 'body[data-ds-dark-theme]'

/** token 原文里写死的前缀，生成时按调用方 prefix 整体替换。 */
const SOURCE_PREFIX = '--tdt-'

/** token 域固定名：变量定义必须先于消费它的规则出现。 */
const TOKENS_DOMAIN = 'tokens'

const PREFIX_RE = /^[a-zA-Z][a-zA-Z0-9-]*$/

export interface StyleKitOptions {
  /** `<style>` 标签 id —— 多插件同页靠它互不覆盖，必须插件内唯一。 */
  id: string
  /** CSS 变量前缀，如 `acme` ⇒ `--acme-fg`。 */
  prefix: string
}

export interface StyleKit {
  readonly id: string
  readonly prefix: string
  /** 已替换前缀的 token CSS（可直接 register 到 tokens 域）。 */
  readonly tokensCss: string
  /** 拼一个本插件的 CSS 变量名：`cssVar('fg')` ⇒ `--acme-fg`。 */
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

/** 把 token 原文的前缀换成调用方自己的。 */
export function buildTokensCss(prefix: string): string {
  assertPrefix(prefix)
  return TOKENS_CSS_TEMPLATE.split(SOURCE_PREFIX).join(`--${prefix}-`)
}

function assertPrefix(prefix: string): void {
  if (!PREFIX_RE.test(prefix)) {
    throw new Error(`dsh-plugin-core/design: prefix 必须是字母开头、只含字母数字与连字符，收到 ${JSON.stringify(prefix)}`)
  }
}

/**
 * 领一套本插件专属的样式设施。
 *
 * 为什么是工厂而不是模块级单例：单例只有一个固定 style id 与固定变量前缀，
 * 多个插件同处一页时会抢同一个 `<style>` 标签、变量互相覆盖（见需求文档 §5.2）。
 */
export function createStyleKit(options: StyleKitOptions): StyleKit {
  const { id, prefix } = options
  assertPrefix(prefix)
  if (id === '') throw new Error('dsh-plugin-core/design: id 不能为空')

  const tokensCss = buildTokensCss(prefix)
  const domains = new Map<string, string>()
  let tag: HTMLStyleElement | null = null
  let dirty = true

  const buildCss = (): string => {
    const entries = [...domains.entries()]
    entries.sort((a, b) => (a[0] === TOKENS_DOMAIN ? -1 : b[0] === TOKENS_DOMAIN ? 1 : 0))
    return entries.map(([, css]) => css).join('\n')
  }

  const flush = (): void => {
    if (tag === null) return
    tag.textContent = buildCss()
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
    if (tag !== null && tag.isConnected) flush()
  }

  const dispose = (): void => {
    if (tag !== null && tag.isConnected) tag.remove()
    tag = null
    domains.clear()
    dirty = true
  }

  return {
    id,
    prefix,
    tokensCss,
    cssVar: (name: string): string => `--${prefix}-${name}`,
    registerStyle,
    ensureStyles,
    dispose,
    applyStyle: (domain: string, css: string): void => {
      registerStyle(domain, css)
      ensureStyles()
    },
  }
}
