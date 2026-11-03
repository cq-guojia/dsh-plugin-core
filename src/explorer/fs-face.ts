/**
 * client 侧的**只读文件面**：fetch 宿主 `serveFsRoute` 挂的那条路由（`src/host/fs-route.ts`）。
 *
 * 返回体沿用官方 remote 的信封（成功是值本身，失败是 `{ ok:false, error }`），所以
 * `listingOf` / `textPageOf` / `bytesOf`（`./types.js`）原样能解析，不用再写一套。
 *
 * 与 `WorkspaceFilesFace` 的差别只有一个：**不吃 sessionId，路径一律绝对**。
 * 这也是「入口不传会话」成立的原因 —— 浏览完全不需要会话；只有 Office 预览还要。
 */

export interface FsFace {
  /** 列一层目录（绝对路径）。 */
  list(path: string, signal?: AbortSignal): Promise<unknown>
  /** 文本分页读；`range` 为字节偏移。 */
  read(path: string, range: { offset?: number; limit?: number }, signal?: AbortSignal): Promise<unknown>
  /** 二进制读（`bytesOf` 直接吃）。 */
  readBytes(path: string, options: { range?: { offset?: number; length?: number } }, signal?: AbortSignal): Promise<unknown>
  /** 根节点清单：POSIX 只有 `/`，Windows 是盘符。 */
  roots?(): Promise<string[]>
}

/** 路由没就位 / 网络失败时的统一回执。 */
function failure(message: string): { ok: false; error: { code: string; message: string } } {
  return { ok: false, error: { code: 'service-unavailable', message } }
}

type Reply = { ok?: boolean; value?: unknown; error?: unknown } | null

async function call(basePath: string, params: Record<string, string | number | undefined>, signal?: AbortSignal): Promise<unknown> {
  const query = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) query.set(key, String(value))
  }
  let reply: Reply
  try {
    const response = await fetch(`${basePath}?${query.toString()}`, { signal })
    reply = (await response.json()) as Reply
  } catch (error) {
    if (signal?.aborted === true) return failure('aborted')
    return failure(error instanceof Error ? error.message : 'fs route unreachable')
  }
  if (reply === null || typeof reply !== 'object') return failure('fs route returned a non-object')
  if (reply.ok === false) return reply
  return reply.value ?? reply
}

/** 造一个走 HTTP 的文件面。`basePath` 必须与宿主 `serveFsRoute({ path })` 同一个常量。 */
export function createHttpFsFace(basePath: string): FsFace {
  return {
    list: (path, signal) => call(basePath, { op: 'list', path }, signal),
    read: (path, range, signal) => call(basePath, { op: 'read', path, offset: range.offset, limit: range.limit }, signal),
    readBytes: async (path, options, signal) => {
      const value = await call(basePath, {
        op: 'readBytes',
        path,
        offset: options.range?.offset,
        limit: options.range?.length,
      }, signal)
      const data = (value as { data?: unknown } | null)?.data
      if (typeof data !== 'string') return value
      const raw = atob(data)
      const bytes = new Uint8Array(raw.length)
      for (let index = 0; index < raw.length; index++) bytes[index] = raw.charCodeAt(index)
      return { ...(value as object), data: bytes }
    },
    roots: async () => {
      const value = (await call(basePath, { op: 'roots' })) as { roots?: unknown } | null
      const list = value?.roots
      return Array.isArray(list) && list.every((item) => typeof item === 'string') ? (list as string[]) : ['/']
    },
  }
}

// ── 单例接线（同 ui/host-data 的做法：绑一次，调用方不必每次传） ──
let current: FsFace | undefined

/** 接上宿主 `serveFsRoute` 挂的那条路由（插件 client `apply` 里调一次）。 */
export function connectFs(options: { path: string }): void {
  current = createHttpFsFace(options.path)
}

/** 当前已接上的文件面；没接（宿主没这能力 / 没调 connectFs）⇒ undefined。 */
export function getFsFace(): FsFace | undefined {
  return current
}
