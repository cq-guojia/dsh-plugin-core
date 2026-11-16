/**
 * 服务端权威任务的 HTTP transport。
 *
 * 核心不直连任何宿主模块：这里只用 fetch / AbortController（Node 18+ 与浏览器都有），
 * 路由由消费方用 `webServer.register` 挂出。长连接按既定前提使用，不做轮询降级。
 */
import type {
  AckRequest,
  InvokeRequest,
  InvokeResult,
  ServerCreateInput,
  ServerCreateResult,
  ServerTaskEvent,
  ServerTaskPage,
  ServerTaskRecord,
  TaskBackend,
} from './authoritative.js'

export interface HttpTaskBackendOptions {
  /** 路由根，如 `/api/task-center`。 */
  readonly basePath: string
  /** 额外请求头；鉴权由消费方在服务端强制，这里只负责带过去。 */
  readonly headers?: () => Record<string, string>
  readonly fetchImpl?: typeof fetch
}

function json(value: unknown): string {
  return JSON.stringify(value)
}

export function createHttpTaskBackend(options: HttpTaskBackendOptions): TaskBackend {
  const doFetch = options.fetchImpl ?? fetch
  const base = options.basePath.replace(/\/$/, '')
  const headers = (): Record<string, string> => ({ 'content-type': 'application/json', ...(options.headers?.() ?? {}) })

  async function post<T>(path: string, body: unknown): Promise<T> {
    const response = await doFetch(`${base}${path}`, { method: 'POST', headers: headers(), body: json(body) })
    if (!response.ok) throw new Error(`task backend ${path} failed: ${response.status}`)
    return await response.json() as T
  }

  function follow(
    projects: readonly string[],
    cursorByProject: Readonly<Record<string, string>>,
    onEvent: (project: string, event: ServerTaskEvent) => void,
    onError: (project: string, error: unknown) => void,
  ): () => void {
    const controller = new AbortController()
    const query = new URLSearchParams()
    query.set('projects', projects.join(','))
    query.set('cursors', json(cursorByProject))
    void (async () => {
      try {
        const response = await doFetch(`${base}/follow?${query.toString()}`, {
          method: 'GET',
          headers: options.headers?.(),
          signal: controller.signal,
        })
        if (!response.ok || response.body === null) throw new Error(`task follow failed: ${response.status}`)
        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''
        for (;;) {
          const { done, value } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })
          let cut = buffer.indexOf('\n\n')
          while (cut >= 0) {
            const frame = buffer.slice(0, cut)
            buffer = buffer.slice(cut + 2)
            const data = frame.split('\n').find((line) => line.startsWith('data:'))?.slice(5).trim()
            if (data !== undefined) {
              const parsed = JSON.parse(data) as { project: string; event: ServerTaskEvent }
              onEvent(parsed.project, parsed.event)
            }
            cut = buffer.indexOf('\n\n')
          }
        }
      if (!controller.signal.aborted) onError(projects[0] ?? '', new Error('task follow stream ended'))
      } catch (error) {
        if (!controller.signal.aborted) onError(projects[0] ?? '', error)
      }
    })()
    return () => controller.abort()
  }

  return {
    async create(input: ServerCreateInput): Promise<ServerCreateResult> {
      return post<ServerCreateResult>('/create', input)
    },
    async list(project: string, cursor?: string): Promise<ServerTaskPage> {
      const query = new URLSearchParams({ project })
      if (cursor !== undefined) query.set('cursor', cursor)
      const response = await doFetch(`${base}/list?${query.toString()}`, { headers: options.headers?.() })
      if (!response.ok) throw new Error(`task list failed: ${response.status}`)
      return await response.json() as ServerTaskPage
    },
    follow,
    async poll(keys: readonly string[]): Promise<readonly ServerTaskRecord[]> {
      return post<readonly ServerTaskRecord[]>('/poll', { keys })
    },
    async invoke(request: InvokeRequest): Promise<InvokeResult> {
      return post<InvokeResult>('/invoke', request)
    },
    async ack(request: AckRequest): Promise<void> {
      await post<AckRequest>('/ack', request)
    },
  }
}
