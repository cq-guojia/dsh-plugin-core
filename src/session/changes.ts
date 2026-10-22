// 官方「已编辑文件」卡（ChangedFiles）的数据契约。
//
// 事实（解包 @deepseek-ai/dsh-client-ui-deliverables@0.2.1-rc.2 lib/client.js）：
//   · turn 级 `deliverables.changes = { seq }` 由 `workspace/changes` 事件写进**同一份**
//     turn.data Map（presented 也在里面，见 SessionViewModal.turnDeliverablesPresented）；
//   · 卡内容走宿主只读路由 `GET api/changes.summary?sessionId&seq`（官方
//     ChangesSummaryStore 用裸 fetch，鉴权随宿主会话，插件同样拿得到）；
//   · 载荷校验逐字段复刻官方 isChangesSummary / isChangedFile（client.js:34-53）——
//     拿不到 / 不合规 = 不渲染，不猜数据、不造假。

/** 一个被改的文件（官方 isChangedFile）。 */
export interface ChangedFile {
  readonly path: string
  readonly display: string
  readonly added: number
  readonly deleted: number
  readonly binary?: true
  readonly oversized?: true
}

/** 一轮的改动汇总（官方 isChangesSummary）。 */
export interface ChangesSummary {
  readonly turn: number
  readonly total: number
  readonly added: number
  readonly deleted: number
  readonly files: readonly ChangedFile[]
}

/** 官方 changesSummaryUrl（client.js:90-96）：文档相对路由。 */
export function changesSummaryUrl(sessionId: string, seq: number): string {
  return `api/changes.summary?${new URLSearchParams({ sessionId, seq: String(seq) })}`
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const isInt = (value: unknown): value is number =>
  typeof value === 'number' && Number.isSafeInteger(value)

/** 官方 isChangedFile（client.js:34-42）。 */
function isChangedFile(value: unknown): value is ChangedFile {
  if (!isRecord(value)) return false
  const { path, display, added, deleted, binary, oversized } = value
  return typeof path === 'string' && path.length > 0
    && typeof display === 'string' && display.length > 0
    && isInt(added) && isInt(deleted)
    && (binary === undefined || binary === true)
    && (oversized === undefined || oversized === true)
}

/** 官方 isChangesSummary（client.js:49-53）：不合规返回 null（官方按 missing 处理）。 */
export function parseChangesSummary(value: unknown): ChangesSummary | null {
  if (!isRecord(value)) return null
  const { turn, files, total, added, deleted } = value
  if (!isInt(turn) || turn < 1) return null
  if (!isInt(total) || !isInt(added) || !isInt(deleted)) return null
  if (!Array.isArray(files) || !files.every(isChangedFile)) return null
  return { turn, total, added, deleted, files: files as readonly ChangedFile[] }
}

/**
 * 读某 turn 的 turn 级业务值（官方 `TurnLocation.data`：`ConversationLocationDataStore`，
 * 用 `.get(key)` 读，**不是 Map 也不是普通对象** —— conversation.d.ts:87-95）。
 * 兼容 Map / 纯对象两种形态只为容忍宿主改版；官方契约就是 `.get`。
 */
export function turnDeliverablesValue(face: unknown, key: string): unknown {
  const data = (face as { data?: unknown } | undefined)?.data
  if (data === undefined || data === null) return undefined
  const get = (data as { get?: unknown }).get
  if (typeof get === 'function') return (get as (k: string) => unknown).call(data, key)
  if (data instanceof Map) return data.get(key)
  return (data as Record<string, unknown>)[key]
}

/**
 * 某 turn 的 `workspace/changes` 事件 seq（官方 changesForClosing：读 turn.data 的
 * `deliverables.changes`）。没有公告 = null（官方此时不挂卡）。
 */
export function turnDeliverablesChangesSeq(face: unknown): number | null {
  const changes = (turnDeliverablesValue(face, 'deliverables') as { changes?: unknown } | undefined)?.changes
  const seq = (changes as { seq?: unknown } | undefined)?.seq
  return isInt(seq) ? seq : null
}
