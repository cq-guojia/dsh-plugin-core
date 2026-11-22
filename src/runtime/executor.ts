/**
 * 后台执行器注册表 —— 开放基础能力，不认识「任务」语义。
 *
 * 核心只提供「按 kind 找执行体并驱动」这一层：kind 是任意字符串，核心不枚举、
 * 不校验名字、不为某一种执行方式写死分支。宿主 agent、插件 host 脚本、shell
 * 都只是注册进来的一种 handler —— 谁要执行，谁注册。
 *
 * 与 task-notifications 池同一形态：同标签页所有插件副本共用一个注册表
 * （Symbol.for 收口），所以 A 插件注册的 handler，B 插件发起的同名任务也能调到。
 * 零 React、零宿主模块、零 DOM，可在 node 裸跑。
 */

/** 执行体回调：上报进度。纯数据，不携带函数过进程边界。 */
export interface ExecutorContext {
  /** 上报一段进度；核心负责把它投影到任务记录并推给订阅者。 */
  report(progress: ExecutorProgress): void
}

/** 进度载荷：最后更新一段话 + 可选数值。字段是正规字段，不塞进 detail。 */
export interface ExecutorProgress {
  readonly message: string
  readonly current?: number
  readonly total?: number
  readonly percent?: number
}

/** 执行结果：终态的成功 / 失败，携带可选的收尾进度说明。 */
export interface ExecutorResult {
  readonly outcome: 'done' | 'failed'
  readonly reason?: string
}

/** 执行体签名。args 是发起时的纯数据参数（结构化克隆安全）。 */
export type ExecutorHandler = (
  args: Readonly<Record<string, unknown>>,
  ctx: ExecutorContext,
) => Promise<ExecutorResult> | ExecutorResult

export interface ExecutorRegistration {
  readonly kind: string
  readonly handler: ExecutorHandler
}

export interface ExecutorRegistry {
  /** 注册一个 kind；同名重复注册抛错（先 dispose 旧的）。返回注销函数。 */
  register(kind: string, handler: ExecutorHandler): () => void
  /** 取执行体；没注册返回 undefined，不猜、不降级。 */
  get(kind: string): ExecutorHandler | undefined
  /** 列出已注册的 kind（调试 / 自检用，顺序即注册序）。 */
  list(): readonly string[]
  /** 注销某 kind（若存在），返回是否确实移除了。 */
  unregister(kind: string): boolean
  /** 清空本注册表（ dispose 用；测试之间隔离）。 */
  clear(): void
}

/** 与池一致的多副本收口键；版本号变化时所有副本一起换，不会读到半新半旧（现为 v2）。 */
const REGISTRY_KEY = Symbol.for('dsh-plugin-core/executors/v2')

interface GlobalWithExecutors {
  [REGISTRY_KEY]?: ExecutorRegistry
}

function createRegistry(): ExecutorRegistry {
  const handlers = new Map<string, ExecutorHandler>()
  /** 每次注册一个唯一 token：dispose 只认自己那一次，同名重注册后旧 dispose 绝不误删。 */
  const tokens = new Map<string, symbol>()
  return {
    register(kind, handler) {
      if (typeof kind !== 'string' || kind.trim() === '') {
        throw new Error('executor kind must be a non-empty string')
      }
      if (typeof handler !== 'function') {
        throw new Error('executor handler must be a function')
      }
      if (handlers.has(kind)) {
        throw new Error(`executor kind already registered: ${kind}`)
      }
      const token = Symbol(kind)
      handlers.set(kind, handler)
      tokens.set(kind, token)
      let disposed = false
      return () => {
        if (disposed) return
        disposed = true
        if (tokens.get(kind) === token) {
          handlers.delete(kind)
          tokens.delete(kind)
        }
      }
    },
    get(kind) {
      return handlers.get(kind)
    },
    list() {
      return [...handlers.keys()]
    },
    unregister(kind) {
      tokens.delete(kind)
      return handlers.delete(kind)
    },
    clear() {
      handlers.clear()
      tokens.clear()
    },
  }
}

/** 全局注册表（同标签页所有插件副本共用）。 */
export const executors: ExecutorRegistry = (() => {
  const holder = globalThis as unknown as GlobalWithExecutors
  const existing = holder[REGISTRY_KEY]
  if (existing !== undefined) return existing
  const created = createRegistry()
  holder[REGISTRY_KEY] = created
  return created
})()

/** 新建一个私有注册表（测试隔离 / 单个插件用自己的命名空间时用）。 */
export function createExecutorRegistry(): ExecutorRegistry {
  return createRegistry()
}
