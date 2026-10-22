/**
 * demo 的**真实**会话数据面：宿主 client 服务 `sessions`（@deepseek-ai/dsh-api-session-controller
 * 的 client 半侧）+ `uiConversation` + `uiWorkspace`。
 *
 * 事实（2026-10-22 解包 @deepseek-ai/dsh-api-session-controller@0.2.0-rc.2 逐条核实）：
 *  · `sessions.list` 是 observable 快照存储（getSnapshot + subscribe），快照
 *    `{ ids, byId, phase }`；`byId[id]` 带 `displayTitle`（durable title → 项目名 → session id
 *    三级回落）、`updatedAt`、`running`、`blank`、`cwd`。数据来自宿主 `session/list` RPC
 *    （ApiSessionList.list：「Read every visible attached and persisted Session **without
 *    activating an Agent**」，按活动序）⇒ 列会话 ≠ 打开会话，冷安全。
 *  · 预览数据链与本仓 `dist/session` 的 openSessionView 同一条：retain → binding →
 *    uiConversation.target('chat')（归档会话同样可读）。
 *  · fork = 官方 ISessions.fork；跳转 = 官方 uiWorkspace.openSession。
 *
 * 服务缺席时保持 unavailable，界面如实说「未就位」，绝不造假数据顶替（与文件数据面同口径）。
 */
import type { SessionViewTarget } from '../../../dist/session/index.js'
import { openSessionView } from '../../../dist/session/index.js'
import type { SessionsFace, UiConversationFace } from '../../../dist/session/index.js'
import { ARCHIVED_SESSIONS_PATH } from './paths.js'

// ── 本地结构化消费面（不引官方包类型；官方改契约时改这一处）──

/** 宿主 `sessions.list` 快照的一行（官方 SessionSummary 消费子集）。 */
export interface RealSessionRow {
  sessionId: string
  /** 三级回落的人话标题（durable title → 项目 basename → session id）。 */
  displayTitle: string
  updatedAt: number
  running: boolean
  /** 空会话（还没说过话）⇒ 列表隐藏，过滤责任在消费方。 */
  blank: boolean
  /** 已归档（宿主 workspaceRegistry.archivedSessionIds，经宿主路由取；取不到时 false）。 */
  archived: boolean
}

export interface RealSessionsState {
  status: 'unavailable' | 'ready'
  /** 按 updatedAt 降序（最近在前），已过滤 blank，最多 20 条。 */
  rows: readonly RealSessionRow[]
}

/** 最多列几条（用户口径：最近 20 条）。 */
const MAX_ROWS = 20

interface SessionListStateLike {
  ids: readonly string[]
  byId: Record<string, {
    id: string
    title?: string
    displayTitle: string
    updatedAt: number
    running: boolean
    blank: boolean
  }>
  phase: 'pending' | 'ready'
}

interface SessionsServiceLike {
  list?: { getSnapshot(): SessionListStateLike; subscribe(fn: () => void): () => void }
  binding?(id: string): unknown
  retain?(target: string, options: { source: string }): { release(): void }
  fork?(opts: { sessionId: string; increaseTitle: boolean; atSeq?: number }): Promise<string>
}

interface UiConversationLike {
  binding(source: unknown): { target(target: 'chat'): unknown }
}

interface UiWorkspaceLike {
  openSession?(id: string): void
}

// ── observable store（useSyncExternalStore 直接消费）──

class RealSessionsStore {
  private snapshot: RealSessionsState = { status: 'unavailable', rows: [] }
  private readonly listeners = new Set<() => void>()

  readonly getSnapshot = (): RealSessionsState => this.snapshot

  readonly subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener)
    return () => { this.listeners.delete(listener) }
  }

  private set(next: RealSessionsState): void {
    this.snapshot = next
    for (const listener of this.listeners) listener()
  }

  markReady(): void {
    if (this.snapshot.status === 'ready') return
    this.set({ status: 'ready', rows: [] })
  }

  setRows(rows: readonly RealSessionRow[]): void {
    this.set({ status: 'ready', rows })
  }
}

export const realSessions = new RealSessionsStore()

/** 已归档会话 id 集合（宿主路由取；路由缺席 /  fetch 失败 = 空集合，界面按「无归档」呈现）。 */
let archivedIds: ReadonlySet<string> = new Set()

/** 拉一遍归档集合并刷新行（list 快照每次变化也跟着刷新，保持两者一致）。 */
async function refreshArchived(): Promise<void> {
  try {
    const res = await fetch(ARCHIVED_SESSIONS_PATH, { cache: 'no-store' })
    if (!res.ok) return
    const value = await res.json() as unknown
    const archived = (value as { archived?: unknown } | null)?.archived
    if (!Array.isArray(archived)) return
    archivedIds = new Set(archived.filter((id): id is string => typeof id === 'string'))
  } catch {
    // 宿主路由未注册（根预览站 / 老宿主）：保持空集合，不造假
  }
  repullRows()
}

/** 用当前 list 快照 + 归档集合重算行（pull 的复用体）。 */
function repullRows(): void {
  const list = sessionsService?.list
  if (list === undefined || typeof list.getSnapshot !== 'function') return
  const snap = list.getSnapshot()
  if (snap.phase !== 'ready') { realSessions.markReady(); return }
  const rows: RealSessionRow[] = []
  for (const id of snap.ids) {
    const row = snap.byId[id]
    if (row === undefined || row.blank) continue
    rows.push({
      sessionId: id,
      displayTitle: row.displayTitle === '' ? id : row.displayTitle,
      updatedAt: row.updatedAt,
      running: row.running,
      blank: row.blank,
      archived: archivedIds.has(id),
    })
  }
  rows.sort((left, right) => right.updatedAt - left.updatedAt)
  realSessions.setRows(rows.slice(0, MAX_ROWS))
}

/** 插件 client 的最小 ctx 形状（与 connectHost / connectFileServices 同款）。 */
export interface SessionHostContext {
  inject: (deps: string[], cb: (sub: unknown) => void) => void
}

// ── 服务引用（注入就位后留着，点列表行时直接用）──

let sessionsService: SessionsServiceLike | null = null
let uiConversationService: UiConversationLike | null = null
let uiWorkspaceService: UiWorkspaceLike | null = null

/** retain source：写进宿主 retainedBy 的键（插件身份）。 */
const RETAIN_SOURCE = 'dsh-plugin-core-demo'

/** 打开真实只读视图（retain → binding → target）；服务未就位或会话不可解析时 null。 */
export function openRealSessionView(sessionId: string): SessionViewTarget | null {
  if (sessionsService === null || uiConversationService === null) return null
  return openSessionView(
    sessionsService as unknown as SessionsFace,
    uiConversationService as unknown as UiConversationFace,
    sessionId,
    RETAIN_SOURCE,
  )
}

/** 真实 fork（官方 ISessions.fork；不带 atSeq = 最新已完成 turn 前缀）。 */
export function realForkSession(sessionId: string, atSeq?: number): Promise<string> | null {
  const fork = sessionsService?.fork
  if (typeof fork !== 'function') return null
  return fork.call(sessionsService, atSeq === undefined
    ? { sessionId, increaseTitle: true }
    : { sessionId, increaseTitle: true, atSeq })
}

/** 真实跳转（官方 uiWorkspace.openSession：内部自己 retain('mainView')，我们不碰保留值）。 */
export function realOpenHostSession(sessionId: string): void {
  uiWorkspaceService?.openSession?.(sessionId)
}

/** 把宿主会话服务接进 demo（client `apply` 里调**一次**）。 */
export function connectRealSessions(ctx: SessionHostContext): void {
  ctx.inject(['sessions', 'uiConversation', 'uiWorkspace'], (sub: unknown) => {
    const rec = sub as Record<string, unknown>
    const sessions = rec.sessions as SessionsServiceLike | undefined
    const uiConversation = rec.uiConversation as UiConversationLike | undefined
    const uiWorkspace = rec.uiWorkspace as UiWorkspaceLike | undefined
    if (sessions !== undefined && uiConversation !== undefined) {
      sessionsService = sessions
      uiConversationService = uiConversation
      uiWorkspaceService = uiWorkspace ?? null
    }
    const list = sessions?.list
    if (list === undefined || typeof list.getSnapshot !== 'function' || typeof list.subscribe !== 'function') return
    // list 快照每次变化都重算行（含刚刷新的归档集合）；phase 'pending' = 首次拉取还没落地
    // （空数组 ≠ 没有会话），'ready' 才是权威。
    const pull = (): void => { repullRows() }
    pull()
    list.subscribe(pull)
    // 归档集合走宿主路由（client 读不到）；拉完再重算一次行。
    void refreshArchived()
  })
}
