/**
 * 后台任务的客户端 SSE 订阅。
 *
 * 只用 fetch / AbortController（浏览器与 Node 18+ 都有），不碰任何宿主模块。
 * 断线退避重连。三条 event 分流（用户 2026-11-19，参照 ledger 的通道 A/B 不变量）：
 *   - `task-snapshot`（基线）/ `task`（状态增量）→ onTask：只投影列表，**不弹卡**。
 *   - `task-notice`（一次性完成通知）→ onNotice：只有它弹卡，客户端按 notice.id 持久去重。
 * 状态可安全重放；通知的一次性由服务端 id + 客户端持久去重保证，不靠 event 名猜新旧。
 */
export interface TaskStreamOptions {
  /** 路由根，如 `/api/task-center`（服务端 serveTaskStream 的 basePath + /stream）。 */
  readonly streamUrl: string
  /** 状态投影（基线快照 + 实时增量）：交给 coordinator 投影进 store，不弹卡。 */
  readonly onTask: (task: unknown, snapshot: boolean) => void
  /** 一次性完成通知：只有它触发 toast / notify。 */
  readonly onNotice?: (notice: unknown) => void
  readonly headers?: () => Record<string, string>
  readonly fetchImpl?: typeof fetch
  /** 重连退避档（毫秒），默认 1s/2s/4s；用完停在最大档。 */
  readonly retryDelaysMs?: readonly number[]
}

export interface TaskStreamConnection {
  /** 主动断开（页面卸载时调）。 */
  close(): void
}

/**
 * 解析一段 SSE buffer，返回剩余未完整帧。三类 event 分流：
 * `task-snapshot` → onTask(_, true)；`task` → onTask(_, false)；`task-notice` → onNotice。
 * 坏帧（畸形 JSON）与消费方回调异常都只影响该帧：丢掉继续，绝不拆掉整条流——
 * 否则一条坏基线会让客户端每次重连都在同一处抛错，永远收不到好任务。
 */
export function parseTaskFrames(
  buffer: string,
  onTask: (task: unknown, snapshot: boolean) => void,
  onNotice?: (notice: unknown) => void,
): string {
  let rest = buffer
  for (;;) {
    const cut = rest.indexOf('\n\n')
    if (cut < 0) break
    const frame = rest.slice(0, cut)
    rest = rest.slice(cut + 2)
    const lines = frame.split('\n')
    const event = lines.find((line) => line.startsWith('event:'))?.slice(6).trim()
    const data = lines.find((line) => line.startsWith('data:'))?.slice(5).trim()
    if (data === undefined) continue
    try {
      const payload = JSON.parse(data) as unknown
      if (event === 'task-snapshot') onTask(payload, true)
      else if (event === 'task') onTask(payload, false)
      else if (event === 'task-notice') onNotice?.(payload)
    } catch (error) {
      console.error('dsh-plugin-core: task stream frame dropped', error)
    }
  }
  return rest
}

export function connectTaskStream(options: TaskStreamOptions): TaskStreamConnection {
  const doFetch = options.fetchImpl ?? fetch
  const delays = options.retryDelaysMs ?? [1000, 2000, 4000]
  let controller: AbortController | undefined
  let closed = false

  void (async () => {
    let retry = 0
    while (!closed) {
      controller = new AbortController()
      try {
        const response = await doFetch(options.streamUrl, {
          method: 'GET',
          headers: options.headers?.(),
          signal: controller.signal,
        })
        if (!response.ok || response.body === null) throw new Error(`task stream failed: ${response.status}`)
        retry = 0
        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''
        for (;;) {
          const { done, value } = await reader.read()
          if (done) {
            // flush decoder 尾部残留，避免最后半帧被吞。
            if (buffer.length > 0) parseTaskFrames(buffer + decoder.decode(), options.onTask, options.onNotice)
            break
          }
          buffer = parseTaskFrames(buffer + decoder.decode(value, { stream: true }), options.onTask, options.onNotice)
        }
      } catch {
        // 主动关闭不重试。
      }
      if (closed) return
      const delay = delays[Math.min(retry, delays.length - 1)] ?? 4000
      retry += 1
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  })()

  return {
    close() {
      closed = true
      controller?.abort()
    },
  }
}
