/**
 * 后台任务的客户端 SSE 订阅。
 *
 * 只用 fetch / AbortController（浏览器与 Node 18+ 都有），不碰任何宿主模块。
 * 断线退避重连。三条 event 分流（用户 2026-11-19，参照 ledger 的通道 A/B 不变量）：
 *   - `task-snapshot`（基线）/ `task`（状态增量）→ onTask：只投影列表，**不弹卡**。
 *   - `task-notice`（一次性完成通知）→ onNotice：只有它弹卡，客户端按 notice.id 持久去重。
 * 状态可安全重放；通知的一次性由服务端 id + 客户端持久去重保证，不靠 event 名猜新旧。
 */
/** 放弃连接的原因：status=0 网络故障；permanent=true 为不可重试（如 401，需刷新凭证后显式重连）。 */
export interface TaskStreamGiveUpReason {
  readonly status: number
  readonly permanent: boolean
}

export interface TaskStreamOptions {
  /** 路由根，如 `/api/task-center`（服务端 serveTaskStream 的 basePath + /stream）。 */
  readonly streamUrl: string
  /** 状态投影（基线快照 + 实时增量）：交给 coordinator 投影进 store，不弹卡。 */
  readonly onTask: (task: unknown, snapshot: boolean) => void
  /** 一次性完成通知：只有它触发 toast / notify。 */
  readonly onNotice?: (notice: unknown) => void
  readonly headers?: () => Record<string, string>
  readonly fetchImpl?: typeof fetch
  /**
   * 重连退避档（毫秒），默认 1s/2s/4s。用完即放弃——不再无限重连：
   * 服务端持续故障或鉴权失效时无限退避只会空刷请求、且不给人任何信号。
   */
  readonly retryDelaysMs?: readonly number[]
  /** 放弃连接时回调（退避次数用尽 / 不可重试错误）。401 用它触发 token 刷新后显式重连。 */
  readonly onGiveUp?: (reason: TaskStreamGiveUpReason) => void
}

export interface TaskStreamConnection {
  /** 主动断开（页面卸载时调）。 */
  close(): void
}

/**
 * 是否值得重试：5xx / 429 / 网络失败(0) 是暂时故障，退避重试；
 * 其余 4xx（401/403/404…）是永久错误，同一 headers 重连无意义，立即放弃。
 * 401 由 onGiveUp 上报，让应用刷新 token 后显式重连（headers 是函数，天然支持换凭证）。
 */
function isRetryableStatus(status: number): boolean {
  return status === 0 || status === 429 || (status >= 500 && status < 600)
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
    // 帧分隔兼容 LF(`\n\n`) 与 CRLF(`\r\n\r\n`)：取更早出现的那个；
    // 逐帧处理时不整段归一 \r，避免 chunk 边界把 \r\n 拆成两片后再也对不上。
    const lf = rest.indexOf('\n\n')
    const crlf = rest.indexOf('\r\n\r\n')
    const cut = crlf >= 0 && (lf < 0 || crlf < lf) ? crlf : lf
    if (cut < 0) break
    const sep = cut === crlf && crlf >= 0 ? 4 : 2
    const frame = rest.slice(0, cut)
    rest = rest.slice(cut + sep)
    // 按行拆时去掉每行行尾的 \r；多行 data 按 SSE 规范用 \n 拼接。
    const lines = frame.split(/\r?\n/)
    const event = lines.find((line) => line.startsWith('event:'))?.slice(6).trim()
    const data = lines
      .filter((line) => line.startsWith('data:'))
      .map((line) => line.slice(5).trimStart())
      .join('\n')
    if (data === '') continue
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

/** 可取消的退避等待：shutdown abort 时立即 resolve，不让 close 后还挂满 delay。 */
function sleep(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    if (signal.aborted) { resolve(); return }
    const onAbort = (): void => { clearTimeout(timer); resolve() }
    const timer = setTimeout(() => {
      signal.removeEventListener('abort', onAbort)
      resolve()
    }, ms)
    signal.addEventListener('abort', onAbort, { once: true })
  })
}

export function connectTaskStream(options: TaskStreamOptions): TaskStreamConnection {
  const doFetch = options.fetchImpl ?? fetch
  const delays = options.retryDelaysMs ?? [1000, 2000, 4000]
  let controller: AbortController | undefined
  let closed = false
  // 连接级关闭信号：与每轮的 fetch controller 分开，专门用来打断退避等待。
  const shutdown = new AbortController()

  const giveUp = (status: number): void => {
    if (closed) return
    closed = true
    // 回调是消费方代码，抛错不得逃逸成未处理 rejection。
    try { options.onGiveUp?.({ status, permanent: !isRetryableStatus(status) }) } catch (error) {
      console.error('dsh-plugin-core: task stream onGiveUp failed', error)
    }
  }

  void (async () => {
    let retry = 0
    while (!closed) {
      controller = new AbortController()
      // status 只在「HTTP 层响应非 ok」时是真实状态码（供 4xx 停流 / 5xx 退避分类）。
      // 0 = 网络失败，或「已连上后读流中断」——两者都按暂态退避处理。
      // 关键：拿到 200 后不能把 status 留成 200，否则断线会被误判成永久错误、永不重连。
      let status = 0
      let gotFrame = false // 本轮是否真正传过数据帧——区分「真连接断开」与「连上就 EOF 的假连接」。
      try {
        const response = await doFetch(options.streamUrl, {
          method: 'GET',
          headers: options.headers?.(),
          signal: controller.signal,
        })
        // body 缺失（204 / 某些 fetch 实现）按暂态处理，不当永久错误。
        if (!response.ok) {
          status = response.status
          throw new Error(`task stream failed: ${status}`)
        }
        if (response.body === null) throw new Error('task stream: empty body')
        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''
        for (;;) {
          const { done, value } = await reader.read()
          if (done) {
            // flush decoder 尾部残留，避免最后半帧被吞。
            if (buffer.length > 0) { gotFrame = true; parseTaskFrames(buffer + decoder.decode(), options.onTask, options.onNotice) }
            break
          }
          if (value !== undefined && value.byteLength > 0) gotFrame = true
          buffer = parseTaskFrames(buffer + decoder.decode(value, { stream: true }), options.onTask, options.onNotice)
        }
      } catch {
        // 主动关闭不重试；其余按上面的 status 分类。
      } finally {
        // 只有真正传过数据的连接才算「成功连上」：无论以 EOF 正常收尾还是 read() reject
        // 收尾，只要本轮读到过字节（含保活）就算有进展，断线是新的一次故障、退避归零。
        // 放在 finally 而非 try 末尾，才能覆盖 reject 出口；否则「收到帧后异常断线」会
        // 累积 retry、几次后就 giveUp。若 200 后立即 EOF（gotFrame=false）则不归零，
        // 否则每轮从 delays[0] 重来、永不 giveUp，形成无限空刷。
        if (gotFrame) retry = 0
      }
      if (closed) return
      // 不可重试（4xx，含 401/403）立即停；可重试的走有上限退避，次数用尽也停。
      if (!isRetryableStatus(status)) { giveUp(status); return }
      const delay = delays[retry]
      if (delay === undefined) { giveUp(status); return }
      retry += 1
      await sleep(delay, shutdown.signal)
    }
  })()

  return {
    close() {
      closed = true
      controller?.abort()
      shutdown.abort()
    },
  }
}
