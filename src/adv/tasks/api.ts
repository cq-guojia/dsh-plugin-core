/**
 * 新任务体系的公开接线 API。
 *
 * 消费方写两处接线：mountTaskUI（注册 handlers + 终态）/ startTask（发起）；展示用 TaskBar。
 * 这里把 coordinator 与宿主能力（面板、toast、通知、SSE 投影）接到一起，对外只暴露这三件事。
 *
 * design：handler 在页面内存里（函数过不了进程边界），mountTaskUI 显式传 handlers，
 * handlers 与 Toast / TaskBar 共用同一份。状态真源在服务端，经 SSE 推 TaskRecord 进来由 coordinator 投影。
 */
import { notify as notifyCard, type NotifyOptions } from '../../ui/feedback/notify.js'
import {
  notifyMessage,
  subscribeNotifications as subscribeNotifyBus,
  type NotifyDetail,
} from '../../runtime/notify.js'
import { createCoordinator, type CoordinatorHost, type TaskCoordinator } from './coordinator.js'
import type { StartTaskInput, TaskNotice, TaskRecord } from './model.js'
import { connectTaskStream, type TaskStreamConnection } from './stream.js'
import { taskStore } from './store.js'

/**
 * 已处理通知 id 的去重（跨刷新不重弹的根）。
 *
 * 用 sessionStorage 而非 localStorage：刷新保留（outbox 重放的历史不重弹），但每个标签页
 * 独立、关页即清——`scope:'all'` 要求每个页面各弹一次，同源共享的 localStorage 会让先到的
 * 页面写 id、后到的页面读到后吞卡。node / 无存储环境退化为模块内存 Set（测试用）。
 * 有界：只留最近 512 个 id。
 */
const SEEN_NOTICE_KEY = 'dshpc:task-notices:seen'
const SEEN_NOTICE_LIMIT = 512
const seenFallback = new Set<string>()
function noticeStore(): Storage | undefined {
  try { return typeof sessionStorage === 'undefined' ? undefined : sessionStorage } catch { return undefined }
}
function loadSeenNotices(): Set<string> {
  const store = noticeStore()
  try {
    if (store === undefined) return seenFallback
    const raw = store.getItem(SEEN_NOTICE_KEY)
    return new Set(raw === null ? [] : (JSON.parse(raw) as string[]))
  } catch { return seenFallback }
}
function rememberNotice(id: string): boolean {
  const seen = loadSeenNotices()
  if (seen.has(id)) return false
  seen.add(id)
  const trimmed = [...seen].slice(-SEEN_NOTICE_LIMIT)
  const store = noticeStore()
  try {
    if (store !== undefined) store.setItem(SEEN_NOTICE_KEY, JSON.stringify(trimmed))
    else { seenFallback.clear(); for (const value of trimmed) seenFallback.add(value) }
  } catch { seenFallback.clear(); for (const value of trimmed) seenFallback.add(value) }
  return true
}

/** 挂载选项：列表与 UI 接线共用同一组过滤条件与 handlers。 */
export interface MountTasksOptions {
  /** 字符串=只收该项目；null / 省略=跨项目收全部。 */
  project?: string | null
  groups?: readonly string[]
  handlers: Readonly<Record<string, (task: TaskRecord) => void>>
}

export interface MountTaskUIOptions extends MountTasksOptions {
  /** 终态回调：只给消费方刷自己的数据；成功失败都调。 */
  onSettled?: (task: TaskRecord, outcome: 'done' | 'failed') => void
}

/** 一次接线：宿主把能力交进来（client apply 里调一次）。 */
export interface TaskCenterHost extends CoordinatorHost {
  /** SSE 流地址（服务端 serveTaskStream 的 basePath + /stream）；不传就不订阅（纯本地模式）。 */
  streamUrl?: string
  /** 提交地址（服务端 serveTaskSubmit 的 path）；传了就由服务端执行，刷新后继续跑。 */
  submitUrl?: string
  /** SSE / 提交请求头（鉴权 token 等）。 */
  headers?: () => Record<string, string>
}

/** 宿主 client ctx 的最小形状：注入 layout 服务拿面板 id 与切面板。 */
export interface LayoutClientContext {
  inject?: (deps: string[], cb: (sub: unknown) => void) => void
}

interface LayoutService {
  /** 闸1 rc.3 核实：activePanelId 在 panelInfo observable 里，不是顶层字段。 */
  panelInfo?: { getSnapshot(): { activePanelId?: string | null } }
  selectPanel?(id: string | null): void
}

/**
 * 宿主对象是稳定的一份：coordinator 持有它的引用，重复接线只改字段，不重建 coordinator。
 * 重建会连同「终态去重上下文 / 已注册 handlers」一起换掉，是重复弹卡的来源之一。
 */
const stableHost: TaskCenterHost = {}
const coordinator: TaskCoordinator = createCoordinator({ host: stableHost })
let streamConn: TaskStreamConnection | undefined

/** 最小形状校验：畸形 SSE 帧不能进 store 污染列表（startedAt 参与排序，缺了会乱）。 */
function isTaskRecord(value: unknown): value is TaskRecord {
  if (value === null || typeof value !== 'object') return false
  const v = value as Record<string, unknown>
  return (
    typeof v.id === 'string' &&
    typeof v.project === 'string' &&
    typeof v.group === 'string' &&
    typeof v.title === 'string' &&
    (v.state === 'running' || v.state === 'done' || v.state === 'failed') &&
    typeof v.startedAt === 'number'
  )
}

/** 状态投影（基线 / 增量）：只恢复列表，**不弹卡**。 */
function ingestTask(raw: unknown): void {
  if (!isTaskRecord(raw)) return
  coordinator.project([raw])
}

function isTaskNotice(value: unknown): value is TaskNotice {
  if (value === null || typeof value !== 'object') return false
  const v = value as Record<string, unknown>
  return typeof v.id === 'string' && v.id !== '' && isTaskRecord(v.task)
}

/** 一次性完成通知：持久去重后交给 coordinator 弹卡；同一 id 跨刷新只弹一次。 */
function ingestNotice(raw: unknown): void {
  if (!isTaskNotice(raw)) return
  if (!rememberNotice(raw.id)) return
  coordinator.deliverNotice(raw)
}

/**
 * 默认宿主适配：toast/notify 接到核心已有的提示层。
 *
 * toast 的 scope 用「发起面板」判定：SSE 把同一条终态推给每个页面，每页都收到，
 * 但 `origin` 只在发起面板弹卡——按钮也只在那页显示（别页没有本页 handler，不画死按钮）。
 * notify 的 broadcast 走通知总线发一条纯数据消息，scope 决定发不发；按 project 过滤由订阅侧做。
 */
export function defaultTaskHost(activePanelId?: () => string | undefined): CoordinatorHost {
  const isOrigin = (task: TaskRecord): boolean =>
    task.panelId === undefined || task.panelId === activePanelId?.()

  return {
    deliverToast(payload) {
      if (payload.scope === 'origin' && !isOrigin(payload.task)) return
      const opts: NotifyOptions = { variant: payload.task.state === 'failed' ? 'error' : 'success' }
      if (payload.buttonId !== undefined && taskStore.getHandler(payload.buttonId) !== undefined) {
        opts.actions = [{
          text: payload.buttonText ?? payload.buttonId,
          onClick: () => { pressTaskButton(payload.buttonId as string, payload.task.id) },
        }]
      }
      notifyCard(payload.title, opts)
    },
    deliverNotify(payload) {
      if (payload.scope === 'origin' && !isOrigin(payload.task)) return
      if (payload.broadcast === undefined) {
        notifyCard(payload.message, {
          ...(payload.detail === undefined ? {} : { description: JSON.stringify(payload.detail) }),
        })
        return
      }
      notifyMessage(payload.message, {
        project: payload.project,
        group: payload.group,
        level: payload.level,
        ...(payload.detail === undefined ? {} : { detail: payload.detail as NotifyDetail }),
      })
    },
  }
}

/** 接线宿主能力。client apply 调一次；重复调用覆盖字段并重连 SSE，但不换 coordinator。 */
export function connectTaskCenter(host: TaskCenterHost): () => void {
  const hadDefault = stableHost.deliverToast !== undefined || stableHost.deliverNotify !== undefined
  Object.assign(stableHost, host)
  // 第一次接线时补默认提示层，之后消费方仍可用自己的 deliverToast/deliverNotify 覆盖。
  if (!hadDefault && stableHost.deliverToast === undefined && stableHost.deliverNotify === undefined) {
    const defaults = defaultTaskHost(() => stableHost.activePanelId?.())
    Object.assign(stableHost, defaults)
  }
  streamConn?.close()
  streamConn = undefined
  if (stableHost.streamUrl !== undefined) {
    streamConn = connectTaskStream({
      streamUrl: stableHost.streamUrl,
      headers: stableHost.headers,
      onTask: (task) => { ingestTask(task) },
      onNotice: ingestNotice,
    })
  }
  return () => { streamConn?.close(); streamConn = undefined }
}

/**
 * 从宿主 client ctx 接 layout：拿到 activePanelId（发起时记进任务）与 selectPanel（点按钮切回面板）。
 * 闸1（rc.3）核实：layout 服务由 ctx.inject(['layout']) 提供，activePanelId 在 panelInfo 快照里。
 */
export function connectTaskLayout(ctx: LayoutClientContext): void {
  let layout: LayoutService | undefined
  ctx.inject?.(['layout'], (sub) => {
    const candidate = (sub as { layout?: LayoutService } | null)?.layout ?? (sub as LayoutService | null)
    if (candidate !== null && candidate !== undefined && typeof candidate === 'object') layout = candidate
  })
  connectTaskCenter({
    activePanelId: () => layout?.panelInfo?.getSnapshot().activePanelId ?? undefined,
    selectPanel: (id) => layout?.selectPanel?.(id),
  })
}

/** 发起一次后台任务。await 等登记成功，不等跑完。 */
export async function startTask(input: StartTaskInput): Promise<TaskRecord> {
  if (stableHost.submitUrl === undefined) return coordinator.start(input)
  // 服务端执行模式：POST 提交，真实记录由服务端经 SSE 推回并投影到本地 store。
  const res = await fetch(stableHost.submitUrl, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...stableHost.headers?.() },
    body: JSON.stringify(input),
  })
  if (!res.ok) throw new Error(`task submit failed: ${res.status}`)
  const ack = (await res.json()) as { id?: string }
  const optimistic: TaskRecord = {
    id: ack.id ?? `submit:${Date.now()}`,
    project: input.project ?? 'default',
    group: input.group ?? 'default',
    title: input.title,
    state: 'running',
    startedAt: Date.now(),
  }
  // 本地先落一条，SSE 到达后按同 id 覆盖；避免提交到推送之间的空窗看不到任务。
  taskStore.upsert(optimistic)
  return optimistic
}

/** 本页接线一次：注册 handlers + 订阅终态。返回注销函数。 */
export function mountTaskUI(options: MountTaskUIOptions): () => void {
  const offHandlers = coordinator.registerHandlers(options.handlers)
  // 每次 mount 只注册自己这一个监听：不在共享集合里 fan-out，避免挂 N 次就放大 N 倍。
  const offSettled = options.onSettled === undefined
    ? () => {}
    : coordinator.onSettled(({ task, outcome }) => { options.onSettled?.(task, outcome) })
  return () => { offHandlers(); offSettled() }
}

/** 点列表 / Toast 按钮：先切回发起面板，再执行本页 handler。 */
export function pressTaskButton(buttonId: string, taskId: string): boolean {
  return coordinator.press(buttonId, taskId)
}

/** 服务端 SSE 投影入口（手动推送时用；自动接流由 connectTaskCenter 负责）。 */
export function projectTasks(records: readonly TaskRecord[]): void {
  coordinator.project(records)
}

/** 列表控件读取用的 store 快照。 */
export const taskCenterStore = taskStore

/**
 * 任务通知的广播监听出口：谁要响应谁自己订阅，核心不替消费方决定收到后干什么。
 * `scope: 'plugin'` 只收同项目；`'global'` 收所有项目。
 */
export type TaskNotificationListener = (
  message: { project: string; group: string; message: string; detail?: NotifyDetail; level: string },
) => void

export function subscribeTaskNotifications(options: {
  project?: string
  scope: 'plugin' | 'global'
  handler: TaskNotificationListener
}): () => void {
  return subscribeNotifyBus((msg) => {
    if (options.scope === 'plugin' && msg.project !== options.project) return
    options.handler({
      project: msg.project,
      group: msg.group,
      message: msg.title,
      ...(msg.detail === undefined ? {} : { detail: msg.detail }),
      level: msg.level,
    })
  })
}

export type { TaskCoordinator }
