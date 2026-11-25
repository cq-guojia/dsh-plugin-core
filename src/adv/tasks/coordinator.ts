/**
 * 后台任务编排中枢：把「登记 → 执行 → 进度 → 终态 → 通知」串成一条线。
 *
 * 纯逻辑，零 React / 零宿主 / 零 DOM —— 宿主能力（layout 面板、toast、通知、执行器）都以
 * 小接口注入，node 自检可用内存 fake。真实接线由 `api.ts` / host 侧完成。
 *
 * 没有 pull 心跳、没有状态源、没有双时钟租约、没有 tombstone 判死：终态由执行器结果
 * 或服务端投影直接驱动一次，进度由执行器 report 上报，本地只做投影与分发。
 */
import { executors, type ExecutorContext, type ExecutorProgress } from '../../runtime/executor.js'
import type { NotifyDetail, NotifyLevel } from '../../runtime/notify.js'
import {
  formatDisplayTitle,
  notifyForState,
  toastForState,
  type StartTaskInput,
  type TaskNotice,
  type TaskRecord,
  type TaskSettlement,
} from './model.js'
import { taskStore, type TaskHandler, type TaskStore } from './store.js'

/** 宿主能力注入点。全部可缺省：没接就是纯本地内存模式（测试 / 预览站）。 */
export interface CoordinatorHost {
  /** 当前激活面板 id；startTask 时自动记进记录。 */
  activePanelId?(): string | undefined
  /**
   * 当前标签页 id（页面级身份）；startTask 时自动记进 TaskRecord.origin，
   * 供 scope:'origin' 判定「只在发起页弹卡」。与 panelId（面板级、只管切 UI）是两个维度。
   */
  originId?(): string | undefined
  /** 切回面板；点按钮时先调它，再执行 handler。 */
  selectPanel?(panelId: string): void
  /** 终态通知（notify 通道）：由调用方决定怎么弹、怎么广播。 */
  deliverNotify?(payload: {
    project: string
    group: string
    message: string
    detail?: NotifyDetail
    level: NotifyLevel
    scope: 'all' | 'origin'
    broadcast?: 'plugin' | 'global'
    task: TaskRecord
  }): void
  /** 终态 toast：由调用方决定怎么画卡。 */
  deliverToast?(payload: {
    title: string
    buttonId?: string
    buttonText?: string
    scope: 'all' | 'origin'
    task: TaskRecord
  }): void
}

export interface CoordinatorOptions {
  readonly store?: TaskStore
  readonly host?: CoordinatorHost
  /** 执行器注册表；缺省用全局那份。测试可注入私有表。 */
  readonly registry?: typeof executors
}

let seq = 0
function nextId(): string {
  seq += 1
  return `task:${Date.now().toString(36)}:${seq.toString(36)}`
}

export interface TaskCoordinator {
  /** 登记一条任务并异步驱动执行。等的是登记成功，不是跑完。 */
  start(input: StartTaskInput): TaskRecord
  /** 服务端状态投影入口：把外部状态/进度/终态并进本地 store。**只投影，不弹卡**（状态可重放）。 */
  project(records: readonly TaskRecord[]): void
  /** 一次性完成通知入口：只有它触发 toast / notify / onSettled。 */
  deliverNotice(notice: TaskNotice): void
  /**
   * 点按钮：发起面板未激活时先暂存意图再切回，等该页 handler 重注册后补发；
   * 面板已激活则同步执行。true = 已执行或已受理（要求消费方 handler 随面板生命周期注册/注销）。
   */
  press(buttonId: string, taskId: string): boolean
  registerHandlers(map: Readonly<Record<string, TaskHandler>>, project?: string | null): () => void
  onSettled(listener: (s: TaskSettlement) => void): () => void
}

function safeCall(label: string, fn: () => void): void {
  try {
    fn()
  } catch (error) {
    console.error(`dsh-plugin-core: task ${label} failed`, error)
  }
}

/**
 * 延后按钮意图：core 被内联进每个插件 bundle，模块级变量不共享，故挂 globalThis。
 * key 含 (project, buttonId, panelId, startedAt)，覆盖写天然去重；上限 32 防无界增长。
 */
const PENDING_KEY = Symbol.for('dsh-plugin-core/tasks/pending/v1')
const PENDING_TTL = 8_000
const PENDING_CAP = 32
interface PendingAction {
  buttonId: string
  taskId: string
  panelId: string
  startedAt: number
  enqueuedAt: number
}
type PendingMap = Map<string, PendingAction>
function pendingMap(): PendingMap {
  const holder = globalThis as unknown as { [PENDING_KEY]?: PendingMap }
  let map = holder[PENDING_KEY]
  if (map === undefined) {
    map = new Map()
    holder[PENDING_KEY] = map
  }
  return map
}

export function createCoordinator(options: CoordinatorOptions = {}): TaskCoordinator {
  const store = options.store ?? taskStore
  const host = options.host ?? {}
  const registry = options.registry ?? executors

  /**
   * 补发暂存的按钮意图。两个触发点：发起页 registerHandlers（新 handler 刚可用），
   * 以及 press 暂存后的下一 macrotask（handler 本就常驻在 app 级、不需要重注册也能兑现）。
   * - 每条重读 store.get，记录已被归一 id / 终态改写则丢弃。
   * - activePanelId 不符只跳过不删除：面板可能尚未激活，等后续 drain；超时另有定时器清。
   * - claim-once：先删再调，防重复执行；safeCall 包裹，坏 handler 不打断消费方 mount。
   */
  function drainPending(): void {
    const map = pendingMap()
    const now = Date.now()
    for (const [key, pending] of map) {
      if (now - pending.enqueuedAt > PENDING_TTL) {
        map.delete(key)
        continue
      }
      const active = host.activePanelId?.()
      if (active !== undefined && active !== pending.panelId) continue
      const current = store.get(pending.taskId)
      // 同键已被新一次运行接管（startedAt 变）：旧 toast 的意图不再兑现。
      if (current === undefined || current.startedAt !== pending.startedAt) {
        map.delete(key)
        continue
      }
      const handler = store.getHandler(pending.buttonId, current.project)
      if (handler === undefined) continue
      map.delete(key)
      safeCall('deferred button handler', () => handler(current))
    }
  }

  /**
   * 终态对外分发：toast + notify + onSettled，各一次；单项失败不影响其它项。
   *
   * 不在这里补 settledAt：本地执行是真的执行者、时间由 run() 注入（本地是那份终态的真源）；
   * 服务端 notice 的时间由服务端给、经 isTaskRecord 校验必带。若在此无条件 Date.now()，
   * 本地假时会盖住服务端真源、且重放签名漂移。store.carryIdentity 只做 first-wins 合并。
   */
  function announce(task: TaskRecord, state: 'done' | 'failed', reason?: string): void {
    const final: TaskRecord = {
      ...task,
      state,
      ...(reason === undefined ? {} : { reason }),
    }
    // 单页内去重：同一 notice 被 outbox 重复推、或本地执行与服务端投影撞车时只弹一次。
    // 跨刷新的一次性由客户端持久 notice id 保证（见 api.ts）。
    if (!store.claimSettled(final)) return
    // 以 upsert 返回的「归一 id + 身份兜底」记录为对外载荷：store 在 (project,key) 命中时
    // 会把 id 归一到存活行、并保住本地发起记录的 origin/panelId/settledAt。
    // 不能直接用入参 task——同 key 不同服务端 id 时它没有本地身份，整块写会抹掉已投影的字段。
    const stored = store.upsert(final).task

    const toast = toastForState(stored.toast, state)
    if (toast !== undefined) {
      safeCall('toast', () => host.deliverToast?.({
        // 宿主契约是 string，结构化标题只到这一层；跨页 notify 协议也不改。
        title: formatDisplayTitle(toast.title),
        ...(toast.button === undefined ? {} : { buttonId: toast.button.id, buttonText: toast.button.text }),
        scope: toast.scope ?? 'origin',
        task: stored,
      }))
    }
    const notice = notifyForState(stored.notify, state)
    if (notice !== undefined) {
      safeCall('notify', () => host.deliverNotify?.({
        project: stored.project,
        group: stored.group,
        message: notice.message,
        ...(notice.detail === undefined ? {} : { detail: notice.detail }),
        level: state === 'done' ? 'success' : 'error',
        scope: notice.scope ?? 'origin',
        ...(notice.broadcast === undefined ? {} : { broadcast: notice.broadcast }),
        task: stored,
      }))
    }
    store.emitSettled({ outcome: state, task: stored })
  }

  /** 本地执行一条任务。本地执行器是终态的真源，结算时刻在这里生成一次。 */
  function run(task: TaskRecord): void {
    if (task.kind === undefined) return
    const handler = registry.get(task.kind)
    // 本地终态的唯一补时点：run 真的跑了执行器，本地时钟就是这份终态的真源。
    const settle = (final: TaskRecord, outcome: 'done' | 'failed', reason?: string): void => {
      announce({ ...final, settledAt: final.settledAt ?? Date.now() }, outcome, reason)
    }
    if (handler === undefined) {
      settle(task, 'failed', `executor not registered: ${task.kind}`)
      return
    }
    const ctx: ExecutorContext = {
      report(progress: ExecutorProgress): void {
        const current = store.get(task.id)
        if (current === undefined || current.state === 'done' || current.state === 'failed') return
        // 本地时钟只作这份进度的排序键：取 max(now, old+1) 保证多次上报严格递增，
        // 与服务端时钟不同源也不影响——store 的 LWW 只在同一次运行内比较 updatedAt。
        const prior = current.progress?.updatedAt
        const updatedAt = Math.max(Date.now(), prior === undefined ? 0 : prior + 1)
        store.upsert({ ...current, progress: { ...progress, updatedAt } })
      },
    }
    Promise.resolve()
      // args 输入侧放宽成 object（消费方的 interface 可直接传）；到执行器边界收敛回索引签名。
      .then(() => handler((task.args ?? {}) as Readonly<Record<string, unknown>>, ctx))
      .then((result) => settle(store.get(task.id) ?? task, result.outcome, result.reason))
      .catch((error: unknown) => settle(store.get(task.id) ?? task, 'failed', String(error)))
  }

  return {
    start(input) {
      const panelId = host.activePanelId?.()
      const origin = host.originId?.()
      const record: TaskRecord = {
        id: nextId(),
        ...(input.key === undefined ? {} : { key: input.key }),
        project: input.project ?? 'default',
        group: input.group ?? 'default',
        title: input.title,
        state: 'running',
        startedAt: Date.now(),
        ...(panelId === undefined ? {} : { panelId }),
        ...(origin === undefined ? {} : { origin }),
        ...(input.kind === undefined ? {} : { kind: input.kind }),
        ...(input.args === undefined ? {} : { args: input.args }),
        ...(input.detail === undefined ? {} : { detail: input.detail }),
        ...(input.icon === undefined ? {} : { icon: input.icon }),
        ...(input.toast === undefined ? {} : { toast: input.toast }),
        ...(input.notify === undefined ? {} : { notify: input.notify }),
        ...(input.rowButtons === undefined ? {} : { rowButtons: input.rowButtons }),
      }
      const { task } = store.upsert(record)
      run(task)
      return task
    },
    project(records) {
      // 状态投影只恢复列表 / 进度 / 终态快照，**绝不弹卡**：状态会被基线、重连、重推反复重放，
      // 弹卡一旦挂在这里，刷新就重弹（用户 2026-11-19 的根因）。通知只走 deliverNotice。
      store.merge(records)
    },
    deliverNotice(notice) {
      const task = notice.task
      if (task.state !== 'done' && task.state !== 'failed') return
      // 陈旧 notice 属于更早的一次运行：必须先于任何写入丢弃。否则 announce 内的
      // upsert（按归一 id 整行写、不带运行身份守卫）会把新 running 盖回旧终态，并误弹
      // 一次过期结算。状态 merge 虽有守卫，但 notice 走的是另一条 announce 路径。
      if (store.isStale(task)) return
      const outcome: 'done' | 'failed' = task.state // 上面已收窄
      // 先把终态投影进列表（可能早于 notice 到达的 task 帧已投影过，这里幂等）。
      // 不补 settledAt：服务端是这份终态的真源，时间由它给、经 isTaskRecord 校验必带；
      // 归一 id 与身份兜底由 announce 内的 upsert 负责，且不依赖 merge 的 changed 返回值。
      store.merge([task])
      announce(task, outcome, task.reason)
    },
    press(buttonId, taskId) {
      const task = store.get(taskId)
      if (task === undefined) return false
      const panelId = task.panelId
      const active = host.activePanelId?.()
      // 发起页未激活：宿主在会话页时 activePanelId 为 null（被接线转成 undefined），
      // 也算离开发起页。此时即使查到 handler 也可能是正在卸载的旧闭包，一律先暂存意图
      // 再切回，等该页重注册 handler 后补发，避免调到旧实例。
      // 无 layout 接线（selectPanel 缺席）时同步执行，不暂存——否则没有切回能力,
      // 暂存就成死信。会话页（active undefined）由 active !== panelId 覆盖。
      const away = panelId !== undefined && active !== panelId && host.selectPanel !== undefined
      if (away && panelId !== undefined) {
        const map = pendingMap()
        const key = `${task.project}\u0000${buttonId}\u0000${panelId}\u0000${task.startedAt}`
        map.delete(key)
        map.set(key, { buttonId, taskId, panelId, startedAt: task.startedAt, enqueuedAt: Date.now() })
        if (map.size > PENDING_CAP) {
          const oldest = map.keys().next().value
          if (oldest !== undefined) map.delete(oldest)
        }
        safeCall('selectPanel', () => host.selectPanel?.(panelId))
        return true
      }
      // 面板已激活 / 无面板身份：同步执行。没 handler 就是死按钮，不切面板，直接告知失败。
      const handler = store.getHandler(buttonId, task.project)
      if (handler === undefined) return false
      if (panelId !== undefined) {
        const pid = panelId
        safeCall('selectPanel', () => host.selectPanel?.(pid))
      }
      safeCall('button handler', () => handler(task))
      return true
    },
    registerHandlers: (map, project) => {
      const off = store.registerHandlers(map, project)
      // microtask 保证 onSettled 订阅等本次 mount 的同步代码先完成；补发不占消费方的调用栈。
      queueMicrotask(drainPending)
      return off
    },
    onSettled: (listener) => store.onSettled(listener),
  }
}
