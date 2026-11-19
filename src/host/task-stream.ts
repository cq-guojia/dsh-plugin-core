/**
 * 后台任务的 SSE 推送端点（新体系）。
 *
 * 服务端是状态真源：任务执行、进度推进、终态判定都在服务端。三条流物理隔离（用户 2026-11-19
 * 定，参照 ledger 的通道 A/B 不变量）：
 *   - 快照 `event: task-snapshot`：全量历史，只恢复列表 / 行按钮，**永不弹卡**。
 *   - 状态 `event: task`：连接期间的进度 / 终态投影，只更新列表，**永不弹卡**。
 *   - 通知 `event: task-notice`：终态跃迁那一刻的一次性事件（带 id），**只有它弹卡**。
 * 这样状态可任意重放（刷新 / 重连 / 基线）都不会重弹；通知是一次性事件，客户端按 id 持久去重。
 *
 * 宿主 webServer 不提供 server-wide 鉴权（dsh-host.md §11.1.1），所以 authorize 强制必填。
 */
import type { HostContextLike, HostHttpRequest, HostWebServerLike } from './index.js'
import type { TaskNotice, TaskRecord } from '../adv/tasks/model.js'

type StreamingResponse = {
  writeHead: (status: number, headers: Record<string, string>) => void
  end: (body?: string) => void
  write: (chunk: string) => boolean
  on?: (event: string, listener: () => void) => void
}

/**
 * 服务端任务源：状态流（基线 + 订阅）与通知流（一次性事件）分开提供。
 * viewer 由鉴权得出，归属过滤在服务端做。
 */
export interface TaskStreamSource {
  /** 一次性基线：当前所有可见任务（含历史终态）；只用于恢复列表，不弹卡。 */
  snapshot(viewer: string): Promise<readonly TaskRecord[]> | readonly TaskRecord[]
  /** 订阅状态变更（整条 TaskRecord 的 upsert：进度 / 终态）；只更新列表，不弹卡。 */
  subscribe(listener: (task: TaskRecord) => void, viewer: string): () => void
  /**
   * 订阅一次性完成通知。source 应在订阅时回放 outbox 里未过期的通知（断线期间结算的），
   * 之后每次终态跃迁再推一条；客户端按 notice.id 持久去重，重推也不会重复弹。
   * 不提供 = 该服务端选择不弹卡（纯状态投影）。
   */
  subscribeNotices?(listener: (notice: TaskNotice) => void, viewer: string): () => void
}

export interface TaskStreamOptions {
  readonly basePath: string
  readonly authorize: (req: HostHttpRequest) => string | null | Promise<string | null>
  readonly source: TaskStreamSource
  /** SSE 保活注释帧间隔（毫秒），默认 25000；只保活连接，不是业务心跳。 */
  readonly keepAliveMs?: number
}

function json(res: StreamingResponse, status: number, body: unknown): void {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' })
  res.end(JSON.stringify(body))
}

/** SSE 保活帧：注释行，客户端 EventSource/fetch 都不会当成事件数据。 */
const KEEP_ALIVE = ': keep-alive\n\n'

export function serveTaskStream(ctx: HostContextLike, options: TaskStreamOptions): () => void {
  if (typeof options.authorize !== 'function') {
    throw new Error('serveTaskStream requires authorize: host provides no server-wide auth')
  }
  const base = options.basePath.replace(/\/$/, '')
  const keepAliveMs = options.keepAliveMs ?? 25_000
  /** 每条连接各自持有 off + timer；serve 的 disposer 统一收口，连接关闭只清自己那条。 */
  const connections = new Set<{ cleanup(): void }>()

  // webServer 一律走 inject 等待，与 serveModelCatalog / serveFsRoute / serveTaskSubmit 一致。
  // strict ctx.get 只认当前 active 的 provider fiber；插件 apply 执行时 webServer 常未 active，
  // 同步 get 拿到 undefined 若在 apply 栈里抛错，会让整条插件 fiber 失败，连带同一 apply 里
  // 那几条 inject 子插件一起被 dispose（cordis effect.disposeAfter）—— 所有路由一起 404。
  // 服务未就位时自然缺席、不抛，不拖累其它路由。
  ctx.inject(['webServer'], (services) => {
    const web = services.webServer as HostWebServerLike | undefined
    if (web === undefined) return

    web.register({
      kind: 'exact',
      path: `${base}/stream`,
      handler: (req, rawRes) => {
        const res = rawRes as unknown as StreamingResponse
        // 同步抛也要抓住：Promise.resolve(fn()) 在 fn 同步抛时根本进不了 .then/.catch。
        Promise.resolve()
          .then(() => options.authorize(req))
          .then((viewer) => {
            if (viewer === null || viewer === '') { json(res, 401, { error: 'unauthorized' }); return }

            // 三流都先订阅再取基线：窗口内的事件先进缓冲，基线写完再按序回放，消除丢事件窗口。
            const buffered: string[] = []
            let streaming = false
            const push = (event: string, payload: unknown): void => {
              const frame = `event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`
              if (streaming) res.write(frame)
              else buffered.push(frame)
            }
            const sendTask = (task: TaskRecord): void => { push('task', task) }
            const sendNotice = (notice: TaskNotice): void => { push('task-notice', notice) }
            const offTask = options.source.subscribe(sendTask, viewer)
            const offNotice = options.source.subscribeNotices?.(sendNotice, viewer)

            const timer = setInterval(() => { res.write(KEEP_ALIVE) }, keepAliveMs)
            ;(timer as unknown as { unref?: () => void }).unref?.()

            const conn = {
              cleanup(): void {
                clearInterval(timer)
                offTask()
                offNotice?.()
                connections.delete(conn)
              },
            }
            connections.add(conn)
            // res.on 可选：没有 close 事件时靠 serve disposer 收口，不让 off/timer 永久泄漏。
            res.on?.('close', () => { conn.cleanup() })

            void Promise.resolve(options.source.snapshot(viewer)).then((baseline) => {
              res.writeHead(200, {
                'content-type': 'text/event-stream; charset=utf-8',
                'cache-control': 'no-cache, no-transform',
                connection: 'keep-alive',
                'x-accel-buffering': 'no',
              })
              // 快照只恢复列表；历史终态绝不在此弹卡（否则刷新就重弹）。
              for (const task of baseline) res.write(`event: task-snapshot\ndata: ${JSON.stringify(task)}\n\n`)
              streaming = true
              for (const frame of buffered) res.write(frame)
              buffered.length = 0
            }).catch((error: unknown) => {
              // 200 头已发，不能再写 401（ERR_HTTP_HEADERS_SENT）；只结束连接并清理。
              console.error('dsh-plugin-core: task stream baseline failed', error)
              conn.cleanup()
              res.end()
            })
          })
          .catch(() => { json(res, 401, { error: 'unauthorized' }) })
      },
    })
  })

  return () => { for (const conn of [...connections]) conn.cleanup(); connections.clear() }
}
