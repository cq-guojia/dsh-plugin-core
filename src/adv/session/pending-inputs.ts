// 官方对照：ui-chat@0.2.1-rc.5 lib/client.js:2722-2736（observedInputs）、:2816-2839
//   （visibleSubmissions / pendingInputs）；字段契约 = api-session-controller@0.2.0-rc.1
//   lib/types/client/contract/snapshot.d.ts:36-48（PendingSubmission）。
//
// 为什么是独立一条链：新会话发出首条消息后、首个 durable 事件落盘前，用户消息只存在于
// SessionSnapshot.pendingSubmissions（本地回显），chat target 的 order 里还没有 user 节点。
// 只渲染 order 会把这段等待期的整条用户消息吞掉。
import type { ChatNodeFace, InboxMessageFace, InboxProjectionFace, PendingSubmissionFace } from './faces.js'

/** 官方 observedInputs：durable user 节点 source.rpcId（本地回显被持久节点取代的判据）。 */
export function observedRpcIds(
  order: readonly string[],
  readNode: (key: string) => ChatNodeFace | undefined,
): ReadonlySet<string> {
  const ids = new Set<string>()
  for (const key of order) {
    const source = (readNode(key)?.data as { source?: unknown } | undefined)?.source
    if (typeof source !== 'object' || source === null) continue
    const face = source as { kind?: unknown; rpcId?: unknown }
    if (face.kind === 'user' && typeof face.rpcId === 'string') ids.add(face.rpcId)
  }
  return ids
}

/** 官方 visibleSubmissions：queued 不走回显气泡；已被 durable 节点取代的不重复画。 */
export function visiblePendingInputs(
  pending: readonly PendingSubmissionFace[] | undefined,
  observed: ReadonlySet<string>,
): readonly PendingSubmissionFace[] {
  if (pending === undefined) return []
  return pending.filter(item => item.placement !== 'queued' && !observed.has(item.requestId))
}

/** 回显附件 → 附件卡数据（只取官方已有的真实名字/大小；图片预览需宿主 loadImage，不造）。 */
export function pendingFiles(item: PendingSubmissionFace): readonly { name: string; bytes: number }[] {
  const out: { name: string; bytes: number }[] = []
  for (const attachment of item.attachments ?? []) {
    const value = attachment.value
    if (typeof value?.name !== 'string' || value.name === '') continue
    out.push({ name: value.name, bytes: typeof value.bytes === 'number' ? value.bytes : 0 })
  }
  return out
}

/** 等待期用户气泡的统一渲染数据（host inbox 投影 + 本地回显合并后）。 */
export interface WaitingUserRow {
  readonly key: string
  readonly text: string
  readonly files: readonly { name: string; bytes: number }[]
  /** 官方 data-pending-steering：host inbox 投影里的待处理用户消息。 */
  readonly pending: boolean
  /** 官方 data-submission-echo：客户端本地提交回显。 */
  readonly echo: boolean
}

const EMPTY_FILES: readonly { name: string; bytes: number }[] = []

/** inbox 投影里的用户消息：官方只看 next-step，首轮唤醒新 turn 的消息在 next-turn ⇒ 两条队列都要。 */
function inboxUserMessages(inbox: unknown): readonly InboxMessageFace[] {
  if (typeof inbox !== 'object' || inbox === null) return []
  const rec = inbox as InboxProjectionFace
  const out: InboxMessageFace[] = []
  for (const target of ['next-turn', 'next-step'] as const) {
    const list: unknown = rec[target]
    if (!Array.isArray(list)) continue
    for (const item of list) {
      if (typeof item !== 'object' || item === null) continue
      const msg = item as InboxMessageFace
      if (msg.source?.kind !== 'user') continue
      out.push(msg)
    }
  }
  return out
}

/** content 块 → 文本 / 附件：只取官方真实字段，字段缺席不编造。 */
function inboxContent(msg: InboxMessageFace): { text: string; files: readonly { name: string; bytes: number }[] } {
  if (!Array.isArray(msg.content)) return { text: '', files: EMPTY_FILES }
  const texts: string[] = []
  const files: { name: string; bytes: number }[] = []
  for (const block of msg.content) {
    if (typeof block !== 'object' || block === null) continue
    const part = block as { type?: unknown; text?: unknown; attachment?: unknown }
    if (part.type === 'text' && typeof part.text === 'string') { texts.push(part.text); continue }
    if (part.type !== 'image' && part.type !== 'file') continue
    if (typeof part.attachment !== 'object' || part.attachment === null) continue
    const value = part.attachment as { name?: unknown; bytes?: unknown }
    if (typeof value.name !== 'string' || value.name === '') continue
    files.push({ name: value.name, bytes: typeof value.bytes === 'number' ? value.bytes : 0 })
  }
  return { text: texts.join(''), files }
}

function fromSubmission(item: PendingSubmissionFace): WaitingUserRow {
  return {
    key: item.requestId,
    text: item.text ?? '',
    files: pendingFiles(item),
    pending: item.placement === 'steering',
    echo: item.placement !== 'steering',
  }
}

/**
 * 官方 ChatFlow.pendingInputs（ui-chat 0.2.1-rc.5 lib/client.js:2815-2839）的等价合并：
 * host `inbox` 投影 + session.pendingSubmissions 本地回显，按 source.rpcId / requestId 去重。
 *
 * 为什么必须两路：本地回显只在客户端内存里，且 `observeSubmissionInbox()` 在 inbox 到达后
 * 会 retire 它；inbox 投影是 host 侧 durable 值（尾页 projections baseline 也会 seed），
 * 冷读 / 新打开预览时拿得到。只画回显 ⇒ 等待期整条用户消息被吞，只剩「深度求索中」。
 */
export function waitingUserRows(
  inbox: unknown,
  pending: readonly PendingSubmissionFace[] | undefined,
  observed: ReadonlySet<string>,
): readonly WaitingUserRow[] {
  const local = new Map(visiblePendingInputs(pending, observed).map(item => [item.requestId, item]))
  const rows: WaitingUserRow[] = []
  const messages = inboxUserMessages(inbox)
  for (const [i, msg] of messages.entries()) {
    const rpcId = msg.source?.rpcId
    if (rpcId !== undefined) {
      const echo = local.get(rpcId)
      if (echo !== undefined) {
        rows.push(fromSubmission(echo))
        local.delete(rpcId)
        continue
      }
      if (observed.has(rpcId)) continue
    }
    const content = inboxContent(msg)
    if (content.text === '' && content.files.length === 0) continue
    rows.push({
      key: msg.id ?? `inbox-${String(i)}`,
      text: content.text,
      files: content.files,
      pending: true,
      echo: false,
    })
  }
  for (const item of local.values()) {
    const row = fromSubmission(item)
    if (row.text === '' && row.files.length === 0) continue
    rows.push(row)
  }
  return rows
}
