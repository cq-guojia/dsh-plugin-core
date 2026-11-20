/**
 * demo 的服务端任务源（Node 侧）：内存任务表 + 服务端执行器。
 *
 * 状态与执行都活在这里（模块级内存），不随 client 页面刷新而消失 —— 用来演示
 * 「刷新后任务继续执行」：client 只 POST 提交 + 订阅 SSE，刷新后重连从 snapshot 恢复。
 */
import { serveTaskStream, serveTaskSubmit, type HostContextLike, type TaskStreamSource } from '../../../dist/host/index.js'
import type { TaskNotice, TaskRecord } from '../../../dist/adv/tasks/model.js'
import { TASK_PATH } from './paths.js'

const VIEWER = 'demo-viewer'
const tasks = new Map<string, TaskRecord>()
const listeners = new Set<(task: TaskRecord) => void>()
/** 一次性通知 outbox：只在终态跃迁时写入；订阅时回放，支撑断线期间结算的通知补发。 */
const notices: TaskNotice[] = []
const noticeListeners = new Set<(notice: TaskNotice) => void>()
const NOTICE_LIMIT = 200

function emit(task: TaskRecord): void {
  tasks.set(task.id, task)
  for (const listener of listeners) listener(task)
}

/** 终态跃迁那一刻产出一次性通知：状态 emit 与通知 emit 物理隔离。 */
function emitNotice(task: TaskRecord): void {
  const notice: TaskNotice = { id: `${task.id}@${String(task.settledAt ?? Date.now())}`, task }
  notices.push(notice)
  if (notices.length > NOTICE_LIMIT) notices.splice(0, notices.length - NOTICE_LIMIT)
  for (const listener of noticeListeners) listener(notice)
}

/** 服务端执行器：按 seconds 真跑，steps>0 时每步上报进度（带 label 的可读文案），fail 结算失败。 */
function execute(id: string, seconds: number, steps: number, fail: boolean, label: string, base: TaskRecord): void {
  const total = steps > 0 ? steps : 10
  const tick = (seconds * 1000) / total
  let i = 0
  const step = (): void => {
    if (tasks.get(id) === undefined) return
    i += 1
    if (steps > 0) {
      emit({ ...base, progress: {
        message: `${label} · 执行到 ${i}/${total}（${Math.round(i * 100 / total)}%）`,
        current: i, total, updatedAt: Date.now(),
      } })
    }
    if (i < total) { setTimeout(step, tick); return }
    const terminal: TaskRecord = {
      ...base,
      state: fail ? 'failed' : 'done',
      reason: fail ? '演示失败' : undefined,
      settledAt: Date.now(),
    }
    emit(terminal)      // 状态流：更新列表（可重放，不弹卡）
    emitNotice(terminal) // 通知流：一次性事件（才弹卡）
  }
  setTimeout(step, tick)
}

const source: TaskStreamSource = {
  snapshot: () => [...tasks.values()],
  subscribe: (listener) => { listeners.add(listener); return () => { listeners.delete(listener) } },
  subscribeNotices: (listener) => {
    // 回放 outbox（断线期间结算的补发）；客户端按 id 持久去重，已见过的会自动跳过。
    for (const notice of notices) listener(notice)
    noticeListeners.add(listener)
    return () => { noticeListeners.delete(listener) }
  },
}

/** 宿主侧调一次：注册「提交」与「SSE 推送」两条路由。 */
export function serveDemoTasks(ctx: HostContextLike): void {
  serveTaskSubmit(ctx, {
    path: `${TASK_PATH}/submit`,
    authorize: () => true,
    onSubmit: (payload) => {
      const id = `task:${Date.now().toString(36)}:${Math.random().toString(36).slice(2, 7)}`
      // startTask 把整份 input POST 过来，执行参数在 input.args 里（不是顶层）。
      const args = (typeof payload.args === 'object' && payload.args !== null ? payload.args : {}) as Record<string, unknown>
      const seconds = Number(args.seconds) || 10
      const steps = Number(args.steps) || 0
      const fail = args.fail === true
      const base: TaskRecord = {
        id,
        project: String(payload.project ?? 'dsh-plugin-core-demo'),
        group: String(payload.group ?? 'demo-jobs'),
        title: String(payload.title ?? '后台任务'),
        state: 'running',
        startedAt: Date.now(),
        // 发起页身份由 client 随 submit 提交：回填到记录后，服务端 notice 才能按 scope:'origin' 只在发起页弹。
        ...(typeof payload.origin === 'string' ? { origin: payload.origin } : {}),
        ...(typeof payload.toast === 'object' && payload.toast !== null ? { toast: payload.toast as TaskRecord['toast'] } : {}),
        ...(typeof payload.notify === 'object' && payload.notify !== null ? { notify: payload.notify as TaskRecord['notify'] } : {}),
        ...(typeof payload.rowButtons === 'object' && payload.rowButtons !== null ? { rowButtons: payload.rowButtons as TaskRecord['rowButtons'] } : {}),
      }
      emit(base)
      execute(id, seconds, steps, fail, String(args.label ?? ''), base)
      return id
    },
  })
  serveTaskStream(ctx, {
    basePath: TASK_PATH,
    authorize: () => VIEWER,
    source,
    keepAliveMs: 25_000,
  })
}
