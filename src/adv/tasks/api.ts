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
import { t } from '../../utils/i18n.js'
import {
  defaultNotifyScope,
  notifyMessage,
  resolveProject,
  subscribeNotifications as subscribeNotifyBus,
  type NotifyDetail,
} from '../../runtime/notify.js'
import { createCoordinator, type CoordinatorHost, type TaskCoordinator } from './coordinator.js'
import type { StartTaskInput, TaskNotice, TaskRecord } from './model.js'
import { connectSharedTaskStream, type SharedLifecycle } from './shared-stream.js'
import { connectTaskStream, type TaskStreamConnection, type TaskStreamGiveUpReason } from './stream.js'
import { taskStore } from './store.js'

/**
 * 已处理通知 id 的去重（跨刷新不重弹的根）。
 *
 * 用 sessionStorage 而非 localStorage：刷新保留（outbox 重放的历史不重弹），但每个标签页
 * 独立、关页即清——`scope:'all'` 要求每个页面各弹一次，同源共享的 localStorage 会让先到的
 * 页面写 id、后到的页面读到后吞卡。node / 无存储环境退化为模块内存 Set（测试用）。
 * 有界：只留最近 512 个 id；另按 project 记已见通知的最大 settledAt 水位——
 * 服务端 outbox 超过 512 条时最早那批 id 会被挤出集合，只靠 id 会重弹；
 * 水位按时间兜底，`settledAt < 水位` 的老回放直接吞（同毫秒用 `<` 不误伤，靠 id 去重）。
 */
const SEEN_NOTICE_KEY = 'dshpc:task-notices:seen'
const SEEN_NOTICE_LIMIT = 512
interface SeenNotices { ids: string[]; watermark: Record<string, number> }
const emptySeen = (): SeenNotices => ({ ids: [], watermark: {} })
const seenFallback = emptySeen()
function noticeStore(): Storage | undefined {
  try { return typeof sessionStorage === 'undefined' ? undefined : sessionStorage } catch { return undefined }
}
function loadSeenNotices(): SeenNotices {
  const store = noticeStore()
  if (store === undefined) return seenFallback
  try {
    const raw = store.getItem(SEEN_NOTICE_KEY)
    if (raw === null) return emptySeen()
    const parsed = JSON.parse(raw) as SeenNotices | string[]
    // 兼容旧格式（纯 id 数组）：升级后首次读取不会把历史去重状态丢掉。
    return Array.isArray(parsed)
      ? { ids: parsed, watermark: {} }
      : { ids: Array.isArray(parsed.ids) ? parsed.ids : [], watermark: parsed.watermark ?? {} }
  } catch { return seenFallback }
}
function saveSeenNotices(seen: SeenNotices): void {
  const trimmed = seen.ids.slice(-SEEN_NOTICE_LIMIT)
  const store = noticeStore()
  if (store === undefined) {
    seenFallback.ids = trimmed
    seenFallback.watermark = seen.watermark
    return
  }
  try { store.setItem(SEEN_NOTICE_KEY, JSON.stringify({ ids: trimmed, watermark: seen.watermark })) }
  catch {
    seenFallback.ids = trimmed
    seenFallback.watermark = seen.watermark
  }
}
function rememberNotice(id: string, settledAt?: number, project?: string): boolean {
  const seen = loadSeenNotices()
  if (settledAt !== undefined && Number.isFinite(settledAt) && project !== undefined) {
    const prior = seen.watermark[project]
    if (prior !== undefined && settledAt < prior) return false
    if (prior === undefined || settledAt > prior) seen.watermark[project] = settledAt
  }
  if (seen.ids.includes(id)) return false
  seen.ids.push(id)
  saveSeenNotices(seen)
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

/**
 * onSettled 的过滤口径，与 store.select()（`store.ts`）逐字一致：
 * project 为 undefined/null = 跨项目收全部；groups 省略 = 不过滤。
 * 只作用于消费方回调，不影响核心列表刷新与 toast/notify 弹卡（scope:'all' 仍每页弹）。
 */
function matchesMount(
  task: TaskRecord,
  project: string | null | undefined,
  groups: readonly string[] | undefined,
): boolean {
  if (project !== undefined && project !== null && task.project !== project) return false
  if (groups !== undefined && !groups.includes(task.group)) return false
  return true
}

/** 一次接线：宿主把能力交进来（client apply 里调一次）。 */
export interface TaskCenterHost extends CoordinatorHost {
  /** SSE 流地址（服务端 serveTaskStream 的 basePath + /stream）；不传就不订阅（纯本地模式）。 */
  streamUrl?: string
  /** 提交地址（服务端 serveTaskSubmit 的 path）；传了就由服务端执行，刷新后继续跑。 */
  submitUrl?: string
  /** SSE / 提交请求头（鉴权 token 等）。 */
  headers?: () => Record<string, string>
  /** SSE 重连退避档（默认 1s/2s/4s）；透传给单飞协调器。 */
  retryDelaysMs?: readonly number[]
  /**
   * SSE 放弃回调（退避用尽 / 不可重试错误，如 401）。permanent（401）会让单飞协调器
   * 进入 halted（让出锁、停重申请，杜绝无限轮转）；消费方在此刷新凭证后，再次调用
   * connectTaskCenter 会触发 resume 重新申请锁（headers 是函数，新 lease 取新 token）。
   * visibilitychange / online 也会自动唤醒。不传则静默。
   */
  onGiveUp?: (reason: TaskStreamGiveUpReason) => void
  /**
   * 是否把 online 事件当作停机唤醒源（默认 true）。设为 false 后不会因网络恢复自动用旧
   * headers 重试——适合"凭证刷新完成后才显式 resume"的应用。visibilitychange/pageshow/
   * resume 仍按可见性闸门恢复；要完全仅显式恢复，请同时不接入页面生命周期（Node 模式）。
   */
  autoRecoverOnOnline?: boolean
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
/** 按 streamUrl 收口的单飞连接：同 key 只建一条，多引用靠 refcount 配平。 */
interface SharedConn {
  readonly key: string
  refs: number
  readonly dispose: () => void
  /** permanent giveUp 后恢复；内部自行判断是否真停机，正常接线是 no-op。 */
  readonly resume: () => void
}
let sharedConn: SharedConn | undefined

/**
 * 页面生命周期适配器：freeze/resume/visibilitychange 派发在 document，
 * pagehide/pageshow/online 派发在 window（原 #3：不能全挂 window）。
 * 只在浏览器环境构造，Node 测试不碰 DOM。
 */
function createPageLifecycle(): SharedLifecycle {
  const docEvents = new Set(['freeze', 'resume', 'visibilitychange'])
  const target = (type: string): Window | Document => docEvents.has(type) ? document : window
  return {
    // 惰性读取 document，保持零 DOM at import time（Node 不会构造这个适配器）。
    isVisible: () => document.visibilityState === 'visible',
    // 建流时读取接线配置：同 key 重复接线不重建（也就不会重绑监听），首次接线的值生效。
    autoRecoverOnOnline: () => stableHost.autoRecoverOnOnline !== false,
    addEventListener(type, listener) {
      target(type).addEventListener(type, listener as EventListener)
    },
    removeEventListener(type, listener) {
      target(type).removeEventListener(type, listener as EventListener)
    },
  }
}

/**
 * 任务帧形状校验（服务端帧与 projectTasks 入口共用的一道闸）：畸形帧不能进 store 污染列表。
 *
 * settledAt 按状态分支校验——终态(done/failed)必须有有限数结算时刻，否则拒收：
 * 展示层靠它算终态行的停留/退场（TaskBar settledAtOf），缺了就永不退场 + 假计时；
 * store 的单调防复活用「状态是否终态」（isSettled(state)）判据，不是有无 settledAt——
 * settledAt 是时钟，可能因重放/擦除而不在，拿它当状态标志会让 guard 静默失效。
 * running 帧不得带 settledAt（状态与时钟分离）。
 * 校验放在唯一入口，store 只负责合并，不再任何地方本地造时间冒充服务端真源。
 */
export function isTaskRecord(value: unknown): value is TaskRecord {
  if (value === null || typeof value !== 'object') return false
  const v = value as Record<string, unknown>
  const settledAtOk = typeof v.settledAt === 'number' && Number.isFinite(v.settledAt)
  return (
    typeof v.id === 'string' &&
    typeof v.project === 'string' &&
    typeof v.group === 'string' &&
    typeof v.title === 'string' &&
    (v.state === 'running' || v.state === 'done' || v.state === 'failed') &&
    typeof v.startedAt === 'number' && Number.isFinite(v.startedAt) &&
    (v.state === 'running'
      ? v.settledAt === undefined
      : settledAtOk)
  )
}

/** 状态投影（基线 / 增量）：只恢复列表，**不弹卡**。基线与增量同语义——真源可归一覆盖本地旧行（含乐观行），但单调守卫挡住旧终态复活。 */
function ingestTask(raw: unknown, snapshot = false): void {
  if (!isTaskRecord(raw)) return
  if (snapshot) taskStore.mergeBaseline([raw])
  else coordinator.project([raw])
}

function isTaskNotice(value: unknown): value is TaskNotice {
  if (value === null || typeof value !== 'object') return false
  const v = value as Record<string, unknown>
  return typeof v.id === 'string' && v.id !== '' && isTaskRecord(v.task)
}

/** 一次性完成通知：持久去重后交给 coordinator 弹卡；同一 id 跨刷新只弹一次。 */
function ingestNotice(raw: unknown): void {
  if (!isTaskNotice(raw)) return
  const notice = raw as TaskNotice
  if (!rememberNotice(notice.id, notice.task.settledAt, notice.task.project)) return
  coordinator.deliverNotice(notice)
}

/**
 * 按钮点了没生效时的统一提示：任务条目已失效 / 注册 handler 的插件已卸载（找不到方法）。
 * Toast 按钮与 TaskBar 行按钮共用这一句，文案只走 t() 保持多语言一致。
 */
export function notifyTaskActionFailed(): void {
  notifyCard(t('taskbarActionFailed'))
}

/**
 * 默认宿主适配：toast/notify 接到核心已有的提示层。
 *
 * toast/notify 的 `scope:'origin'` 用「发起标签页」判定（不是面板）：SSE 把同一条终态推给
 * 每个标签页，但只在发起它的那个标签页弹。`origin` 是页面级身份，随任务记录走；
 * `panelId` 只管点按钮时切回面板，不参与弹卡归属。
 * 任一侧缺 origin（服务端没透传 / 宿主没注入）时 fail-open 按「弹」处理——宁可多弹，绝不漏结果。
 * notify 只把通知发到总线上、不做任何 UI；范围由订阅侧 scope/project 决定。
 */
export function defaultTaskHost(originId?: () => string | undefined): CoordinatorHost {
  const warnedMissingOrigin = new Set<string>()
  const isOrigin = (task: TaskRecord): boolean => {
    const current = originId?.()
    if (current !== undefined && task.origin === undefined) {
      // 服务端没回显 origin 时 fail-open 按「弹」处理（不漏结果），但必须可诊断——
      // 否则配置错误表现为「每个标签都弹」，消费方无从定位（专家评判 #3）。
      const key = `${task.project}\u0000${task.id}`
      if (!warnedMissingOrigin.has(key)) {
        warnedMissingOrigin.add(key)
        console.warn('dsh-plugin-core: task.origin missing, origin-scoped toast falls open', task.project, task.id)
      }
    }
    return current === undefined || task.origin === undefined || task.origin === current
  }

  return {
    deliverToast(payload) {
      if (payload.scope === 'origin' && !isOrigin(payload.task)) return
      const opts: NotifyOptions = { variant: payload.task.state === 'failed' ? 'error' : 'success' }
      // 所有按钮在所有页都画、不隐藏不置灰：点了先 pressTaskButton → selectPanel(panelId) 跳回发起面板
      // 再执行 handler（用户 11-20 反复拍板，覆盖 11-18 定稿里「Toast 按钮只在发起页」的旧口径）。
      // 缺 handler（条目失效 / 发起插件卸载）时给一次统一提示，与 TaskBar 行按钮同口径。
      if (payload.buttonId !== undefined) {
        opts.actions = [{
          text: payload.buttonText ?? payload.buttonId,
          onClick: () => {
            if (!pressTaskButton(payload.buttonId as string, payload.task.id)) notifyTaskActionFailed()
          },
        }]
      }
      notifyCard(payload.title, opts)
    },
    deliverNotify(payload) {
      if (payload.scope === 'origin' && !isOrigin(payload.task)) return
      // notify 只把通知发出去，核心不做任何 UI：弹不弹卡、弹 alert 都由订阅方自己决定。
      // （只有 toast 是明确要求弹卡的——见 deliverToast。）
      notifyMessage(payload.message, {
        project: payload.project,
        group: payload.group,
        level: payload.level,
        ...(payload.detail === undefined ? {} : { detail: payload.detail as NotifyDetail }),
      })
    },
  }
}

/**
 * 接线宿主能力。client apply 调一次；同 streamUrl 重复调用按 refcount 累加引用，不重复建流。
 *
 * 消费方契约（core 不代劳，详见 docs/guides/background-task-center.md「第二轮封口」）：
 * - 依赖必须与本包同号；钉旧版则 v2 协议修复全部不生效
 * - TaskNotice.id 要跨宿主重启全局唯一（UUID / 持久化计数），不能只用内存 ++seq
 * - onSubmit 与所有 SSE 帧 / 通知回显 origin / panelId，否则 scope:'origin' 与面板跳回失效
 * - 同 key 的 startedAt 严格递增；core 用它认运行实例，撞号时新运行会被当重放吞掉
 * - 401 停机后请在 onGiveUp 里同步刷新凭证再重接线；连续两次 permanent 失败后 core 进入
 *   冷却窗口，窗口内 resume / 在线唤醒 no-op（成功建流清零），同步刷新后重接线仍立即生效
 * - online 默认唤醒停机，失败再次停机（有界）；严格「仅显式恢复」应用设
 *   autoRecoverOnOnline:false，凭证就绪后显式调 resume
 */
export function connectTaskCenter(host: TaskCenterHost): () => void {
  // 只覆盖显式提供的字段：传 undefined 不该抹掉上一次接线得到的 streamUrl/submitUrl 等。
  const patch: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(host)) {
    if (value !== undefined) patch[key] = value
  }
  Object.assign(stableHost, patch)
  // 页面级身份：优先用消费方注入的 originId，缺省才取通知总线的标签页 origin。
  // startTask 记 origin、toast/notify 判归属必须同一个来源，否则注入自定义 originId 时判定错位。
  const pageOrigin = (): string => defaultNotifyScope().origin
  if (stableHost.originId === undefined) stableHost.originId = pageOrigin
  // toast / notify 两个默认层各自独立补齐：只配了其中一个，另一个仍要有默认，不能永久静默。
  // 传动态读取函数而非闭包捕获当前值：重复接线注入不同 originId 时，默认层始终跟随
  // stableHost.originId 的最新来源，避免 startTask 记的 origin 与 toast 判归属的 origin 双来源。
  const liveOrigin = (): string | undefined => stableHost.originId?.()
  const defaults = defaultTaskHost(liveOrigin)
  if (stableHost.deliverToast === undefined && defaults.deliverToast !== undefined) {
    stableHost.deliverToast = defaults.deliverToast
  }
  if (stableHost.deliverNotify === undefined && defaults.deliverNotify !== undefined) {
    stableHost.deliverNotify = defaults.deliverNotify
  }
  // 按合并后的 streamUrl 收口：同 key 绝不 close 重建（否则 layout 二次接线会掐掉真流，
  // refcount 也形同虚设）；只有 key 变化才释放旧协调器。这是跨标签单飞的入口不变量。
  const key = stableHost.streamUrl
  if (sharedConn !== undefined && sharedConn.key !== key) {
    sharedConn.dispose()
    sharedConn = undefined
  }
  if (key === undefined) return () => {}
  if (sharedConn === undefined) {
    const lifecycle = typeof window === 'undefined' ? undefined : createPageLifecycle()
    // Node / 测试环境没有 Web Locks 与多标签：直连保证既有测试语义（浏览器缺锁时协调器显式告警不开流）。
    if (lifecycle === undefined) {
      let direct: TaskStreamConnection | undefined
      let directHalted = false
      let directStreak = 0
      let lastPermanentAt = 0
      const openDirect = (): void => {
        direct = connectTaskStream({
          streamUrl: key,
          headers: stableHost.headers,
          retryDelaysMs: stableHost.retryDelaysMs,
          onGiveUp: (reason) => {
            if (reason.permanent) {
              directHalted = true
              directStreak += 1
              lastPermanentAt = Date.now()
            }
            stableHost.onGiveUp?.(reason)
          },
          onTask: (task, snapshot) => { ingestTask(task, snapshot) },
          onNotice: ingestNotice,
        })
      }
      openDirect()
      sharedConn = {
        key, refs: 0,
        dispose: () => direct?.close(),
        // 直连没有 Web Locks，401 后底层流已 closed：只有真停机时才重建（headers 取新凭证）。
        // 连续 permanent 失败且凭证未刷新时冷却，与单飞路径同一"有界"语义。
        resume: () => {
          if (!directHalted) return
          if (directStreak >= 2 && Date.now() - lastPermanentAt < 3_000) return
          directHalted = false
          directStreak = 0
          direct?.close()
          openDirect()
        },
      }
    } else {
      const handle = connectSharedTaskStream({
        streamUrl: key,
        // 动态读取：接线更新 stableHost 后，新 owner 建流时取到最新 headers/回调（原 #10）。
        headers: () => stableHost.headers?.() ?? {},
        retryDelaysMs: stableHost.retryDelaysMs,
        onGiveUp: (reason) => { stableHost.onGiveUp?.(reason) },
        onTask: (task, snapshot) => { ingestTask(task, snapshot) },
        onNotice: ingestNotice,
        // 只把「真源已确认」的行当基线：本地乐观行随 POST 在飞，回滚只在本标签发生，
        // 发出去会让别的标签留下永不消失的幽灵 running（消费方复查 #6）。
        getState: () => taskStore.getBaseline() as unknown[],
        applyBaseline: (tasks) => {
          const valid = tasks.filter((task): task is TaskRecord => isTaskRecord(task))
          taskStore.mergeBaseline(valid)
        },
        lifecycle: lifecycle as unknown as SharedLifecycle,
      })
      sharedConn = { key, refs: 0, dispose: handle, resume: handle.resume }
    }
  }
  const mine = sharedConn
  mine.refs += 1
  // 重复接线（如 layout 二次 apply）触发恢复：仅真停机时生效，正常接线不掐流（#2/#10）。
  mine.resume()
  let released = false
  return () => {
    if (released) return
    released = true
    mine.refs -= 1
    if (mine.refs > 0) return
    if (sharedConn === mine) sharedConn = undefined
    mine.dispose()
  }
}

/**
 * 从宿主 client ctx 接 layout：拿到 activePanelId（发起时记进任务）与 selectPanel（点按钮切回面板）。
 * 闸1（rc.3）核实：layout 服务由 ctx.inject(['layout']) 提供，activePanelId 在 panelInfo 快照里。
 */
export function connectTaskLayout(ctx: LayoutClientContext): () => void {
  let layout: LayoutService | undefined
  ctx.inject?.(['layout'], (sub) => {
    const candidate = (sub as { layout?: LayoutService } | null)?.layout ?? (sub as LayoutService | null)
    if (candidate !== null && candidate !== undefined && typeof candidate === 'object') layout = candidate
  })
  return connectTaskCenter({
    activePanelId: () => layout?.panelInfo?.getSnapshot().activePanelId ?? undefined,
    selectPanel: (id) => layout?.selectPanel?.(id),
  })
}

/** 发起一次后台任务。await 等登记成功，不等跑完。 */
export async function startTask(input: StartTaskInput): Promise<TaskRecord> {
  const origin = stableHost.originId?.()
  const panelId = stableHost.activePanelId?.()
  if (stableHost.submitUrl === undefined) return coordinator.start(input)
  // 服务端执行模式：POST 提交，真实记录由服务端经 SSE 推回并投影到本地 store。
  // origin（页面级归属）与 panelId（面板级切 UI）都随 payload 提交，供服务端回填到记录
  // ——两者都由核心自动记，不写进 StartTaskInput 公共契约。缺哪个就不带哪个。
  const extra = {
    ...(origin === undefined ? {} : { origin }),
    ...(panelId === undefined ? {} : { panelId }),
  }
  // 归一键是 (project,key)：乐观行与提交体必须用同一份补过缺省的 project/key，服务端回显后
  // 真源帧才能归一覆盖乐观行。缺省在此算一次、两处复用，避免各自补缺省失配留下幽灵 running 行。
  const project = input.project ?? 'default'
  const group = input.group ?? 'default'
  const key = input.key ?? `submit:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`
  const optimisticId = `submit:${key}`
  const optimistic: TaskRecord = {
    id: optimisticId,
    key,
    project,
    group,
    title: input.title,
    state: 'running',
    startedAt: Date.now(),
    ...extra,
  }
  // 先落乐观行、再发请求：关闭「服务端已完成且 SSE 终态先到、随后乐观行把它覆回 running」的
  // 时序窗口。真源终态靠同 key 归一覆盖这条 running；本地这份不再在 await 之后二次写入。
  taskStore.upsert(optimistic)
  let res: Response
  try {
    res = await fetch(stableHost.submitUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...stableHost.headers?.() },
      body: JSON.stringify({ ...input, project, group, key, ...extra }),
    })
  } catch (error) {
    taskStore.removeRunning(optimisticId) // 提交失败回滚：不留幽灵 running 行
    throw error
  }
  if (!res.ok) {
    taskStore.removeRunning(optimisticId)
    throw new Error(`task submit failed: ${res.status}`)
  }
  return optimistic
}

/** 本页接线一次：注册 handlers + 订阅终态。返回注销函数。 */
export function mountTaskUI(options: MountTaskUIOptions): () => void {
  const offHandlers = coordinator.registerHandlers(options.handlers, options.project)
  // 每次 mount 只注册自己这一个监听：不在共享集合里 fan-out，避免挂 N 次就放大 N 倍。
  const offSettled = options.onSettled === undefined
    ? () => {}
    : coordinator.onSettled(({ task, outcome }) => {
        if (!matchesMount(task, options.project, options.groups)) return
        options.onSettled?.(task, outcome)
      })
  return () => { offHandlers(); offSettled() }
}

/** 点列表 / Toast 按钮：先切回发起面板，再执行本页 handler。 */
export function pressTaskButton(buttonId: string, taskId: string): boolean {
  return coordinator.press(buttonId, taskId)
}

/**
 * 服务端投影入口（手动推送时用；自动接流由 connectTaskCenter 负责）。
 * 与 SSE 的 ingestTask 共用 isTaskRecord 这道闸——终态缺 settledAt 的帧在此拒收，
 * 否则会绕过校验进 store，导致终态行不消失、显示假计时（settledAt 契约的破口）。
 */
export function projectTasks(records: readonly TaskRecord[]): void {
  coordinator.project(records.filter(isTaskRecord))
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
  const project = options.scope === 'plugin' ? resolveProject(options.project) : undefined
  return subscribeNotifyBus((msg) => {
    if (options.scope === 'plugin' && msg.project !== project) return
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
