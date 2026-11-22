/**
 * 后台任务的共享状态中心。
 *
 * 同标签页所有插件副本共用一个 store（Symbol.for 收口）——A 插件发起的任务、注册的 handler，
 * B 插件的同页副本也看得到。这正是「在 B 页面点 A 的按钮，本页直接执行 A 的 handler」的基础。
 *
 * 纯数据 + 纯逻辑，零 React / 零宿主 / 零 DOM。React 侧用 useSyncExternalStore 接 getSnapshot/subscribe。
 * 这里不判死、不算租约、不轮询：状态由服务端经 SSE 投影进来，本地只负责存与分发。
 *
 * 「终态只分发一次」的去重状态放在这里，不放 coordinator 实例里：coordinator 重接、客户端重连
 * 推基线、同页多副本都会重新投影同一条终态，只有共享的 store 才能挡住重复 toast/notify/onSettled。
 */
import type {
  TaskRecord,
  TaskRowButton,
  TaskSettlement,
  TaskState,
} from './model.js'

export type TaskHandler = (task: TaskRecord) => void
export type TaskSettledListener = (settlement: TaskSettlement) => void

interface TaskStoreState {
  readonly tasks: readonly TaskRecord[]
  readonly revision: number
}

export interface TaskStore {
  readonly getSnapshot: () => TaskStoreState
  readonly subscribe: (listener: () => void) => () => void
  /** 幂等 upsert：同 (project,key) 就地更新，返回是否新建。 */
  upsert(task: TaskRecord): { created: boolean; task: TaskRecord }
  /** 服务端投影一批增量（upsert 语义）；返回真正有变化的记录（id 已归一到存活 id）。 */
  merge(records: readonly TaskRecord[]): readonly TaskRecord[]
  /**
   * 基线专用（权威快照）：与 merge 同语义——真源能覆盖本地陈旧行。
   * 单调守卫（旧终态不被新 running 复活）+ carryIdentity（保留 origin/panelId/结算时刻）
   * 已在 merge 内，基线不能绕过，否则 gap 重拉 / owner 首快照无法纠正本地旧状态。
   * 本地乐观行在真源 running / done 到达时本就该被归一覆盖，不需要「只填不覆盖」兜。
   */
  mergeBaseline(records: readonly TaskRecord[]): void
  /**
   * 跨标签基线专用视图：排除本地乐观行。
   * 乐观行是「本标签 POST 在飞」的临时状态，没有服务端 ack、也没有真源 id；
   * 一旦随 owner 基线发给别的标签，对端就会拿到一条永远不会被真源纠正的幽灵 running
   * （POST 失败只在本标签回滚，BC 没有删除帧）。乐观行只留在发起标签本地。
   */
  getBaseline(): readonly TaskRecord[]
  get(id: string): TaskRecord | undefined
  /**
   * 删除一条仍在运行中的乐观行（提交失败回滚用）。
   * 只删「ident 对应且仍是 running」的记录：真源已改写（终态或别的运行行）时不删，
   * 避免回滚误伤真实进度。同步清幂等键，publish 通知列表。
   */
  removeRunning(id: string): boolean
  /** 按 project / group 过滤；project 为 null 表示跨项目收全部。 */
  select(project: string | null, groups?: readonly string[]): readonly TaskRecord[]
  /**
   * 注册按钮 handlers（可增量多次调用）。project 作命名空间：同 id 不同项目互不覆盖；
   * project 省略 / null 时落裸 id（跨项目兜底）。返回注销函数。
   */
  registerHandlers(map: Readonly<Record<string, TaskHandler>>, project?: string | null): () => void
  /** 先按 (project,id) 精确查，未命中回退裸 id 兜底。 */
  getHandler(id: string, project?: string): TaskHandler | undefined
  /** 订阅终态。 */
  onSettled(listener: TaskSettledListener): () => void
  /** 广播终态给订阅者；单个坏监听者不影响其它监听者。 */
  emitSettled(settlement: TaskSettlement): void
  /**
   * 声明一次终态分发：同一结算键（project + key/id）+ 同一运行实例（startedAt）只返回 true 一次。
   * 同键更大 startedAt 视为新运行，放行新的结算；重新发起（running）也会重置声明。
   */
  claimSettled(task: TaskRecord): boolean
  /**
   * 按运行身份守卫判断一条记录是否陈旧（比当前存活记录更早的一次运行）。
   * deliverNotice 用它挡掉「旧运行的迟到 notice」——状态 merge 会被守卫丢弃，但 notice 是
   * 一次性事件、另有 announce/upsert 路径，必须在入口统一判定，否则旧终态会覆盖新 running。
   */
  isStale(task: TaskRecord): boolean
  /**
   * 全清：任务记录、幂等键、终态声明与已注册的按钮 handlers 一并清空。
   * 清掉 handlers 后需重新 mountTaskUI 才会再注册；只清列表不要用这个。
   */
  clearAll(): void
}

// 与单飞协议 v2 / notify v2 对齐：同页混版插件不得共享同一 store（消费方第二轮封口 #1）。
const STORE_KEY = Symbol.for('dsh-plugin-core/tasks/store/v2')

function sameRecord(a: TaskRecord, b: TaskRecord): boolean {
  return JSON.stringify(a) === JSON.stringify(b)
}

/**
 * 就地更新时保留权威身份字段 + 维护结算时钟不变量。
 *
 * origin / panelId：服务端漏发时保留本地发起身份（first-wins）。
 * settledAt 严格按状态派生，不靠「谁带了字段」：
 *   - running：显式清空结算时刻——重新发起/迟到 running 不得继承旧终态时间戳，
 *     否则 TaskBar 的停留/退场时钟会被复活的运行行污染。
 *   - 终态：只认服务端权威时间；两个合法时间并存时保留先到的那份（同一次结算不各算时间戳），
 *     绝不用本地 Date.now() 补——本地造时会盖住后到的真源时间且让重放签名漂移。
 * 入口 isTaskRecord 已保证终态必带有限数 settledAt，这里只做合并，不再补时。
 */
function carryIdentity(next: TaskRecord, old: TaskRecord | undefined): TaskRecord {
  const origin = next.origin ?? old?.origin
  const panelId = next.panelId ?? old?.panelId
  // settledAt 的 first-wins 只在「同一次运行」内成立：state 帧与 notice 帧各带自己的时间时，
  // 保留先到的那份（同一次结算不各算时间戳）。跨运行（startedAt 不同）必须取新值，
  // 否则断网重跑只见到新终态时，新行会被打上旧运行的结算时刻 → TaskBar 判为早已过期（消费方 #3）。
  const sameRun = old !== undefined && old.startedAt === next.startedAt
  const settledAt = isSettled(next.state)
    ? (sameRun && old !== undefined && isSettled(old.state) && old.settledAt !== undefined
        ? old.settledAt : next.settledAt)
    : undefined
  const base = { ...next }
  // running 必须不带 settledAt：显式删除，不能因 spread 旧键而残留。
  if (!isSettled(next.state)) delete base.settledAt
  return {
    ...base,
    ...(origin === undefined ? {} : { origin }),
    ...(panelId === undefined ? {} : { panelId }),
    ...(settledAt === undefined ? {} : { settledAt }),
  }
}

function createStore(): TaskStore {
  const tasks = new Map<string, TaskRecord>()
  const byKey = new Map<string, string>()
  /** 结算声明：结算键 → 该次运行的 startedAt（作为运行实例身份，重放同值被吞、新值放行）。 */
  const announced = new Map<string, number>()
  const handlers = new Map<string, TaskHandler>()
  const snapshotListeners = new Set<() => void>()
  const settledListeners = new Set<TaskSettledListener>()
  let snapshot: TaskStoreState = Object.freeze({ tasks: Object.freeze([]), revision: 0 })

  function keyOf(task: TaskRecord): string | undefined {
    return task.key === undefined ? undefined : `${task.project}\u0000${task.key}`
  }

  function settlementKey(task: TaskRecord): string {
    return keyOf(task) ?? `${task.project}\u0000id\u0000${task.id}`
  }

  function publish(): void {
    const rows = [...tasks.values()].sort((a, b) => a.startedAt - b.startedAt)
    snapshot = Object.freeze({ tasks: Object.freeze(rows), revision: snapshot.revision + 1 })
    for (const listener of [...snapshotListeners]) listener()
  }

  /**
   * 本地乐观行（startTask 先落的 running）记号，按结算键。真源任何帧（running 或终态）
   * 到达即清除——此后该键才允许被权威基线覆盖。没有它，重连时「POST 已受理但 SSE
   * snapshot 尚旧」的窗口里，旧终态基线会盖掉新发起的乐观行，随后的真 running 又被
   * 单调守卫挡住，任务永久卡在旧终态（一致性专家 #1）。
   */
  const optimistic = new Set<string>()
  /** 乐观行 id → 结算键：回滚时按 id 反查清标记（归一到别的 targetId 时也能清）。 */
  const optimisticById = new Map<string, string>()

  /** 清一个结算键的乐观标记及所有指向它的乐观行 id 映射。 */
  function clearOptimistic(sKey: string): void {
    optimistic.delete(sKey)
    for (const [id, key] of optimisticById) if (key === sKey) optimisticById.delete(id)
  }

  /**
   * 运行身份守卫（单一真源，merge 与 deliverNotice 共用）：一条记录相对当前存活行是否陈旧。
   *   1. 仍是本地乐观行（optimistic 标记在）时放行——本地 Date.now() 与服务端 startedAt
   *      时钟基准不同，不能拿它比新旧。**只用标记判断，绝不用 id 的 submit: 前缀**：
   *      乐观行归一到真源后 id 永久带此前缀、标记却被首个真源帧清掉，前缀短路会让守卫
   *      在此后所有重跑里永久失效（陈旧 notice 覆盖新 running 的根因）。
   *   2. 有 key：key 是业务身份，startedAt 区分运行实例。更早运行的任何帧（含旧终态
   *      基线）丢弃；新运行的帧放行覆盖并清结算声明，让重跑能再次结算（#4/#5）。
   *   3. 无 key：id 即运行身份，同 id 的终态是最终事实，任何 running 都是迟到回放。
   */
  function isStaleAgainst(record: TaskRecord, old: TaskRecord | undefined, composite: string | undefined, stillOptimistic: boolean): boolean {
    if (old === undefined || stillOptimistic) return false
    if (record.startedAt < old.startedAt) return true
    const lateRunning = isSettled(old.state) && !isSettled(record.state)
    return lateRunning && (record.startedAt === old.startedAt || composite === undefined)
  }

  /** 增量与基线共用同一合并语义：单调守卫 + 身份/时钟归一 + 结算声明复位。 */
  function mergeInto(records: readonly TaskRecord[], baseline: boolean): readonly TaskRecord[] {
    const changed: TaskRecord[] = []
    for (const record of records) {
      const composite = keyOf(record)
      const sKey = settlementKey(record)
      const priorId = composite !== undefined ? byKey.get(composite) : undefined
      const targetId = priorId ?? record.id
      const old = tasks.get(targetId)
      // 基线不得覆盖「本地已发起、真源尚未确认」的乐观行；真源帧（baseline=false）到达时
      // 无条件让位覆盖——这正是 #4/#5 要的「真源能纠正本地陈旧行」。
      // 必须在 clearOptimistic 前记住标记：真源帧一到就清标记并让位，之后一律走运行身份守卫。
      const wasOptimistic = optimistic.has(sKey)
      if (baseline && wasOptimistic) continue
      clearOptimistic(sKey)
      if (isStaleAgainst(record, old, composite, wasOptimistic)) continue
      const next = carryIdentity({ ...record, id: targetId }, old)
      if (composite !== undefined) byKey.set(composite, next.id)
      tasks.set(next.id, next)
      if (next.state === 'running') announced.delete(settlementKey(next))
      if (old === undefined || !sameRecord(old, next)) changed.push(next)
    }
    if (changed.length > 0) publish()
    return changed
  }

  return {
    getSnapshot: () => snapshot,
    subscribe(listener) {
      snapshotListeners.add(listener)
      return () => { snapshotListeners.delete(listener) }
    },
    upsert(task) {
      const composite = keyOf(task)
      let existingId: string | undefined
      if (composite !== undefined) {
        const priorId = byKey.get(composite)
        if (priorId !== undefined && priorId !== task.id) existingId = priorId
      }
      const targetId = existingId ?? task.id
      const existed = tasks.has(targetId)
      const stored = carryIdentity({ ...task, id: targetId }, tasks.get(targetId))
      tasks.set(targetId, stored)
      // byKey 永远指向存活 id；否则第三次同键 upsert 会按不存在的旧 id 判成新建，堆出重复行。
      if (composite !== undefined) byKey.set(composite, targetId)
      const sKey = settlementKey(stored)
      if (task.state === 'running') {
        announced.delete(sKey)
        if (task.id.startsWith('submit:')) {
          optimistic.add(sKey)
          optimisticById.set(task.id, sKey)
        }
      } else {
        clearOptimistic(sKey)
      }
      publish()
      return { created: !existed, task: stored }
    },
    merge(records) {
      return mergeInto(records, false)
    },
    mergeBaseline(records) {
      mergeInto(records, true)
    },
    getBaseline() {
      return snapshot.tasks.filter((task) => !optimistic.has(settlementKey(task)))
    },
    get(id) {
      return tasks.get(id)
    },
    removeRunning(id) {
      // 无论行归一到哪个 targetId，都按乐观行 id 反查清标记（复查 A 边界）。
      const mapped = optimisticById.get(id)
      if (mapped !== undefined) clearOptimistic(mapped)
      const current = tasks.get(id)
      if (current === undefined || isSettled(current.state)) return false
      tasks.delete(id)
      const composite = keyOf(current)
      if (composite !== undefined && byKey.get(composite) === id) byKey.delete(composite)
      optimistic.delete(settlementKey(current))
      publish()
      return true
    },
    select(project, groups) {
      const rows = snapshot.tasks
      if (project === null) return groups === undefined ? rows : rows.filter((t) => groups.includes(t.group))
      return rows.filter(
        (t) => t.project === project && (groups === undefined || groups.includes(t.group)),
      )
    },
    registerHandlers(map, project) {
      const registered: Array<[string, TaskHandler]> = []
      for (const [id, handler] of Object.entries(map)) {
        const key = project === undefined || project === null ? id : `${project}\u0000${id}`
        handlers.set(key, handler)
        registered.push([key, handler])
      }
      return () => {
        for (const [key, handler] of registered) {
          if (handlers.get(key) === handler) handlers.delete(key)
        }
      }
    },
    getHandler(id, project) {
      return handlers.get(`${project}\u0000${id}`) ?? handlers.get(id)
    },
    onSettled(listener) {
      settledListeners.add(listener)
      return () => { settledListeners.delete(listener) }
    },
    emitSettled(settlement) {
      for (const listener of [...settledListeners]) {
        try {
          listener(settlement)
        } catch (error) {
          console.error('dsh-plugin-core: task settled listener failed', error)
        }
      }
    },
    claimSettled(task) {
      const key = settlementKey(task)
      const priorAt = announced.get(key)
      // announced 记的是运行身份 startedAt，不是结算时刻 settledAt：
      //   - 同一运行重放（startedAt <= 已声明值）：吞掉，不重复分发；
      //   - 更大 startedAt：断网期间已完成一次重跑、只见到新终态（没见到新 running）时，
      //     也要让新通知放行，否则断线重连后新结算会被旧声明吞掉。
      // running 到达时删除声明（见 upsert/mergeInto）仍保留，属正常重跑路径。
      if (priorAt !== undefined && task.startedAt <= priorAt) return false
      announced.set(key, task.startedAt)
      return true
    },
    isStale(task) {
      const composite = keyOf(task)
      const priorId = composite !== undefined ? byKey.get(composite) : undefined
      const targetId = priorId ?? task.id
      // 归一后的乐观行 id 带 submit: 前缀但标记已清，必须走守卫（不能当前缀短路）。
      return isStaleAgainst(task, tasks.get(targetId), composite, optimistic.has(settlementKey(task)))
    },
    clearAll() {
      tasks.clear()
      byKey.clear()
      announced.clear()
      optimistic.clear()
      optimisticById.clear()
      handlers.clear()
      publish()
    },
  }
}

/** 全局 store（同标签页共用）。 */
export const taskStore: TaskStore = (() => {
  const holder = globalThis as unknown as { [STORE_KEY]?: TaskStore }
  const existing = holder[STORE_KEY]
  if (existing !== undefined) return existing
  const created = createStore()
  holder[STORE_KEY] = created
  return created
})()

/** 新建私有 store（测试隔离）。 */
export function createTaskStore(): TaskStore {
  return createStore()
}

/** 终态状态判定。 */
export function isSettled(state: TaskState): boolean {
  return state === 'done' || state === 'failed'
}

/** 取一条任务当前状态下要显示的按钮（含 handler 存在性由调用方决定）。 */
export function visibleButtons(task: TaskRecord): readonly TaskRowButton[] {
  const when = (b: { when?: string }): boolean =>
    b.when === undefined || b.when === 'always' || b.when === task.state
  return (task.rowButtons ?? []).filter(when)
}
