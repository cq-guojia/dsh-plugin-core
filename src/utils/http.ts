/**
 * HTTP 骨架：超时 + 错误归一。
 *
 * 只做「取数」这件事的最小公共面 —— 插件自己的接口前缀 / 鉴权头自己传，
 * 这里不猜、也不碰宿主 API（utils 不得依赖 DOM / React / 宿主，见需求文档 §2.3）。
 */

export class HttpError extends Error {
  /** HTTP 状态码；`0` = 没拿到响应（网络失败 / 超时）。 */
  readonly status: number
  readonly url: string
  readonly body: string | undefined

  constructor(url: string, status: number, message: string, body?: string) {
    super(message)
    this.name = 'HttpError'
    this.url = url
    this.status = status
    this.body = body
  }
}

export interface RequestOptions extends Omit<RequestInit, 'signal'> {
  /** 超时毫秒，缺省 10s。 */
  timeoutMs?: number
}

const DEFAULT_TIMEOUT_MS = 10_000

/**
 * 发请求；非 2xx / 网络失败 / 超时一律抛 `HttpError`（不返回 null，避免调用方漏判）。
 */
export async function request(url: string, options: RequestOptions = {}): Promise<Response> {
  const { timeoutMs = DEFAULT_TIMEOUT_MS, ...init } = options
  // 不用 AbortSignal.timeout：Chrome 99 才有 AbortController，signal.timeout 要 103+
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url, { ...init, signal: controller.signal })
    if (!res.ok) {
      let body: string | undefined
      try {
        body = await res.text()
      } catch {
        body = undefined
      }
      throw new HttpError(url, res.status, `HTTP ${res.status} ${res.statusText}`.trim(), body)
    }
    return res
  } catch (err) {
    if (err instanceof HttpError) throw err
    const reason = err instanceof Error ? err.message : String(err)
    throw new HttpError(url, 0, `请求失败（网络或超时）：${reason}`)
  } finally {
    clearTimeout(timer)
  }
}

/** 发请求并按 JSON 解析；响应不是合法 JSON 也归成 `HttpError`。 */
export async function requestJson<T>(url: string, options?: RequestOptions): Promise<T> {
  const res = await request(url, options)
  try {
    return (await res.json()) as T
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err)
    throw new HttpError(url, res.status, `响应不是合法 JSON：${reason}`)
  }
}
