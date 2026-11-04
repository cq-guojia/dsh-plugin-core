// 官方对照：ui-chat@0.2.1-rc.5 lib/client.js:2722-2736（observedInputs）、:2816-2839
//   （visibleSubmissions / pendingInputs）；字段契约 = api-session-controller@0.2.0-rc.1
//   lib/types/client/contract/snapshot.d.ts:36-48（PendingSubmission）。
//
// 为什么是独立一条链：新会话发出首条消息后、首个 durable 事件落盘前，用户消息只存在于
// SessionSnapshot.pendingSubmissions（本地回显），chat target 的 order 里还没有 user 节点。
// 只渲染 order 会把这段等待期的整条用户消息吞掉。
import type { ChatNodeFace, PendingSubmissionFace } from './faces.js'

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
