/**
 * 后台任务的提交端点：client 把「发起请求」POST 到这里，服务端建任务并异步执行。
 *
 * 与 serveTaskStream 成对：submit 负责「前端 → 服务端」的写入，stream 负责
 * 「服务端 → 前端」的状态投影。两条合起来，刷新页面后任务仍在服务端继续跑，
 * 客户端重连 SSE 从基线恢复显示（worklog 2026-11-18 第 140 行口径）。
 *
 * 宿主 webServer 不做 server-wide 鉴权，authorize 强制必填。
 */
import type { HostContextLike, HostHttpRequest, HostWebServerLike } from './index.js'

const JSON_HEADERS = { 'content-type': 'application/json; charset=utf-8' }

export interface TaskSubmitOptions {
  readonly path: string
  readonly authorize: (req: { headers?: Record<string, string | string[] | undefined> }) => boolean | Promise<boolean>
  /** 收到提交请求：payload 是 client startTask 的纯数据；返回任务 id（幂等由服务端负责）。 */
  readonly onSubmit: (payload: Readonly<Record<string, unknown>>) => string | Promise<string>
}

function readBody(req: HostHttpRequest): Promise<string> {
  return new Promise((resolve, reject) => {
    if (req.on === undefined || req.once === undefined) { reject(new Error('request body stream unavailable')); return }
    const chunks: Uint8Array[] = []
    req.on('data', (chunk) => { chunks.push(chunk) })
    req.once('end', () => { resolve(Buffer.concat(chunks).toString('utf8')) })
    req.once('error', reject)
  })
}

export function serveTaskSubmit(ctx: HostContextLike, options: TaskSubmitOptions): () => void {
  let off: (() => void) | undefined
  ctx.inject(['webServer'], (services) => {
    const webServer = services.webServer as HostWebServerLike | undefined
    if (webServer === undefined) return
    webServer.register({
      kind: 'exact',
      path: options.path,
      handler: async (req, res) => {
        // authorize 自身抛错（鉴权服务故障）也必须写回响应，否则请求永久挂死。
        // 独立于下面的业务 try：鉴权失败回 403，别混进 onSubmit 的 400。
        let allowed = false
        try {
          allowed = await options.authorize(req)
        } catch (error) {
          console.error('dsh-plugin-core: task submit authorize failed', error)
        }
        if (!allowed) {
          res.writeHead(403, JSON_HEADERS)
          res.end(JSON.stringify({ error: 'forbidden' }))
          return
        }
        const badRequest = (): void => {
          res.writeHead(400, JSON_HEADERS)
          // 所有 400 统一形状（解析失败 / 非对象 payload 都走这里），客户端可用一套逻辑解析。
          res.end(JSON.stringify({ ok: false, error: 'bad-request', code: 'invalid-payload' }))
        }
        let payload: Record<string, unknown>
        try {
          const raw = await readBody(req)
          const parsed: unknown = JSON.parse(raw)
          // 边界形状校验：onSubmit 的公开契约是 Record<string,unknown>，JSON.parse 的 as 断言
          // 只是编译期声明——null/数字/字符串/数组会绕过它直通 onSubmit。库里其它外部边界
          // （isTaskRecord / isNotifyWire）都做运行时校验，这里补上同一道闸。
          if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) { badRequest(); return }
          payload = parsed as Record<string, unknown>
        } catch {
          // 空 body / 非法 JSON：与非法 payload 同形状，不回显解析错误原文。
          badRequest()
          return
        }
        let id: string
        try {
          id = await options.onSubmit(payload)
        } catch (error) {
          // onSubmit 内部故障是服务端错误，不是客户端请求错误：回 500、不回显原文。
          console.error('dsh-plugin-core: task submit onSubmit failed', error)
          res.writeHead(500, JSON_HEADERS)
          res.end(JSON.stringify({ ok: false, error: 'internal-error', code: 'submit-failed' }))
          return
        }
        // 成功响应单独一段：onSubmit 已成功就不再进 500 分支，避免已发头后二次 writeHead。
        res.writeHead(200, JSON_HEADERS)
        res.end(JSON.stringify({ ok: true, id }))
      },
    })
    off = () => {}
  })
  return () => { off?.() }
}
