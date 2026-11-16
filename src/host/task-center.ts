/**
 * 服务端权威任务中心的宿主路由装配。
 *
 * 宿主不做 server-wide 鉴权（docs/dependencies/dsh-host.md §11.1.1），所以这里
 * **强制**提供 authorize；缺省即抛，不允许裸奔路由。持久化、判死、TTL、scope
 * 归属都由消费方的 TaskCenterStore 负责，本文件只做 HTTP 形状转换。
 */
import type { HostContextLike, HostHttpRequest, HostWebServerLike } from './index.js'
import type {
  AckRequest,
  InvokeRequest,
  ServerCreateInput,
  ServerTaskEvent,
  ServerTaskPage,
  ServerTaskRecord,
} from '../adv/tasks/authoritative.js'

/** follow 需要的响应面：官方给的是原始 ServerResponse，这里显式声明用到的部分。 */
type StreamingResponse = {
  writeHead: (status: number, headers: Record<string, string>) => void
  end: (body?: string) => void
  write: (chunk: string) => boolean
  on?: (event: string, listener: () => void) => void
}

export interface TaskCenterStore {
  create(input: ServerCreateInput, viewer?: string): Promise<{ created: boolean; record: ServerTaskRecord }>
  list(project: string, cursor?: string, viewer?: string): Promise<ServerTaskPage>
  invoke(request: InvokeRequest, viewer?: string): Promise<{ ok: boolean; result?: unknown; reason?: string }>
  ack(request: AckRequest, viewer?: string): Promise<void>
  /** 订阅增量；viewer 由服务端鉴权得出，回调里必须按它过滤归属。 */
  subscribe(listener: (project: string, event: ServerTaskEvent) => void, viewer?: string): () => void
}

export interface TaskCenterRouteOptions {
  readonly basePath: string
  /**
   * 强制鉴权：返回 viewer 标识；返回 null / 抛错即拒绝。
   * 不传直接抛——这是本模块的硬门槛，不是可选项。
   */
  readonly authorize: (req: HostHttpRequest) => string | null | Promise<string | null>
  readonly store: TaskCenterStore
}

function send(res: StreamingResponse, status: number, body: unknown): void {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' })
  res.end(JSON.stringify(body))
}

function readBody(req: HostHttpRequest): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    const request = req as unknown as { on?: (event: string, cb: (chunk?: unknown) => void) => void }
    if (typeof request.on !== 'function') { resolve({}); return }
    let raw = ''
    request.on('data', (chunk) => { raw += String(chunk ?? '') })
    request.on('end', () => {
      try { resolve(raw === '' ? {} : JSON.parse(raw) as Record<string, unknown>) }
      catch (error) { reject(error) }
    })
  })
}

export function serveTaskCenter(ctx: HostContextLike, options: TaskCenterRouteOptions): () => void {
  if (typeof options.authorize !== 'function') {
    throw new Error('serveTaskCenter requires authorize: host provides no server-wide auth')
  }
  const web = ctx.get?.('webServer') as HostWebServerLike | undefined
  if (web === undefined) throw new Error('webServer service is not available')
  const base = options.basePath.replace(/\/$/, '')
  const unsubs: Array<() => void> = []

  const route = (path: string, handler: (req: HostHttpRequest, res: StreamingResponse, viewer: string) => Promise<void>) => {
    web.register({
      kind: 'exact',
      path: `${base}${path}`,
      handler: (req, rawRes) => {
        const res = rawRes as unknown as StreamingResponse
        void Promise.resolve(options.authorize(req)).then((viewer) => {
          if (viewer === null) { send(res, 401, { error: 'unauthorized' }); return }
          return handler(req, res, viewer)
        }).catch(() => { send(res, 401, { error: 'unauthorized' }) })
      },
    })
  }

  route('/create', async (req, res, viewer) => {
    if (viewer === '') { send(res, 401, { error: 'unauthorized' }); return }
    const body = await readBody(req)
    // 归属校验由 store.create 在写入前做；这里绝不先写后判。
    const result = await options.store.create(body as unknown as ServerCreateInput, viewer)
    if (result.record.project === '') { send(res, 403, { error: 'forbidden' }); return }
    send(res, 200, result)
  })

  route('/list', async (req, res, viewer) => {
    const url = new URL(req.url ?? '', 'http://localhost')
    const project = url.searchParams.get('project') ?? ''
    const cursor = url.searchParams.get('cursor') ?? undefined
    if (project === '') { send(res, 400, { error: 'missing project' }); return }
    send(res, 200, await options.store.list(project, cursor, viewer))
  })

  route('/invoke', async (req, res, viewer) => {
    const body = await readBody(req)
    send(res, 200, await options.store.invoke(body as unknown as InvokeRequest, viewer))
  })

  route('/ack', async (req, res, viewer) => {
    const body = await readBody(req)
    await options.store.ack(body as unknown as AckRequest, viewer)
    send(res, 200, { ok: true })
  })

  web.register({
    kind: 'exact',
    path: `${base}/follow`,
    handler: (req, rawRes) => {
      const res = rawRes as unknown as StreamingResponse
      void Promise.resolve(options.authorize(req)).then((viewer) => {
        if (viewer === null || viewer === '') { send(res, 401, { error: 'unauthorized' }); return }
        const url = new URL(req.url ?? '', 'http://localhost')
        const projects = (url.searchParams.get('projects') ?? '').split(',').filter((item) => item !== '')
        if (projects.length === 0) { send(res, 400, { error: 'missing projects' }); return }
        res.writeHead(200, {
          'content-type': 'text/event-stream; charset=utf-8',
          'cache-control': 'no-cache',
          connection: 'keep-alive',
        })
        const off = options.store.subscribe((project, event) => {
          // 客户端传入的 projects 只是过滤器；真正的归属闸门在 store.subscribe(viewer)。
          if (!projects.includes(project)) return
          res.write(`data: ${JSON.stringify({ project, event })}\n\n`)
        }, viewer)
        unsubs.push(off)
        res.on?.('close', () => {
          off()
          const at = unsubs.indexOf(off)
          if (at >= 0) unsubs.splice(at, 1)
        })
      }).catch(() => { send(res, 401, { error: 'unauthorized' }) })
    },
  })

  return () => { for (const off of unsubs) off() }
}
