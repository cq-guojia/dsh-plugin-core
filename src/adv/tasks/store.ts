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
  get(id: string): TaskRecord | undefined
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
   * 声明一次终态分发：同一结算键（project + key/id）只返回 true 一次，不看 settledAt；
   * 同业务键重新发起（running）会重置声明，让下一次结算能正常分发。
   */
  claimSettled(task: TaskRecord): boolean
  clear(): void
}

const STORE_KEY = Symbol.for('dsh-plugin-core/tasks/store/v1')

function sameRecord(a: TaskRecord, b: TaskRecord): boolean {
  return JSON.stringify(a) === JSON.stringify(b)
}

function createStore(): TaskStore {
  const tasks = new Map<string, TaskRecord>()
  const byKey = new Map<string, string>()
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
      const stored: TaskRecord = { ...task, id: targetId }
      tasks.set(targetId, stored)
      // byKey 永远指向存活 id；否则第三次同键 upsert 会按不存在的旧 id 判成新建，堆出重复行。
      if (composite !== undefined) byKey.set(composite, targetId)
      if (task.state === 'running') announced.delete(settlementKey(task))
      publish()
      return { created: !existed, task: stored }
    },
    merge(records) {
      const changed: TaskRecord[] = []
      for (const record of records) {
        const composite = keyOf(record)
        const priorId = composite !== undefined ? byKey.get(composite) : undefined
        const targetId = priorId ?? record.id
        const old = tasks.get(targetId)
        // 单调：本地已终态时，迟到的 running 投影直接丢弃，防乱序把终态复活。
        if (old !== undefined && old.settledAt !== undefined && record.state === 'running') continue
        // 双方都终态时保留先到的 settledAt：本地执行与服务端投影是同一次结算，不能各算一份时间戳。
        const settledAt =
          old?.settledAt !== undefined && record.settledAt !== undefined
            ? old.settledAt
            : record.settledAt
        // 消费方服务端未在 submit 回传 origin 时保留本地发起身份，避免 scope:'origin' 判定退化。
        const origin = record.origin ?? old?.origin
        const next: TaskRecord = {
          ...record,
          id: targetId,
          ...(settledAt === undefined ? {} : { settledAt }),
          ...(origin === undefined ? {} : { origin }),
        }
        if (composite !== undefined) byKey.set(composite, next.id)
        tasks.set(next.id, next)
        if (old === undefined || !sameRecord(old, next)) changed.push(next)
      }
      if (changed.length > 0) publish()
      return changed
    },
    get(id) {
      return tasks.get(id)
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
      // 按结算键去重，不看 settledAt（重放一律不重复分发）；
      // 重新发起（running）在 upsert 时删除声明，才会放行下一次结算。
      if (announced.has(key)) return false
      announced.set(key, task.settledAt ?? Date.now())
      return true
    },
    clear() {
      tasks.clear()
      byKey.clear()
      announced.clear()
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
