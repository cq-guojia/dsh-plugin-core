// 会话预览的「等待审批」数据面（只读宿主公开快照，不自己插队瀑布）。
//
// 官方对照：`@deepseek-ai/dsh-client-ui-approval@0.2.2-rc.1`：
//  · lib/client.js:475-477 `ctx.remote.$on('approval/request', …)` —— 审批是**内存在线**请求：
//    宿主会往会话日志追加 `approval/asked` + `approval/decided` 审计事件
//    （`@deepseek-ai/dsh-user-approval` lib/index.js:155-171），但**没有投影出「未决」状态**
//    （同文件 :52-70 的投影只有 `{policy, turnOpen}`）⇒ 客户端唯一可读的待审批面是在线注册。
//  · :393-402 `answerApproval` 用 `ctx.sessions.scopeOf(owner)` 定位会话 —— 本客户端 retain 过的
//    会话才收得到那个 request。
//  · :458 注册 pending-interaction 域 → ui-session client.js:892-909 / :996-1007 汇总成
//    `uiSession.sessionStatus`：`Map<sessionId, { running, pendingInteraction, completionUnread }>`；
//    官方 composer 取的就是它（ui-conversation lib/client.js:20484 `useSessionStatus(...)`）。
// ⇒ 正道只有两条：**读** `sessionStatus`，**答**调该对象自己的 `answer()`（官方两个按钮同一调用）。
//   不要另注册 `$on('approval/request')` —— 那是在官方瀑布里抢答。
import type { SnapshotFace } from './faces.js'

/** 官方 `ApprovalDecision`（ui-approval contract/slots.d.ts:62）只有两档；「始终允许」属权限预设。 */
export type ApprovalDecision = 'allowed-once' | 'rejected'

/** `PendingApproval` 的消费面（只复述渲染 / 作答要用的字段）。 */
export interface PendingApprovalFace {
  readonly key: string
  readonly kind: string
  readonly sessionId?: string
  readonly toolName: string
  readonly callId?: string
  readonly reason?: string
  /** 请求方给的本地化文案表（`{ en, zh, … }`），官方按当前 UI 语言挑。 */
  readonly displayReason?: Readonly<Record<string, string>>
  readonly answerable: boolean
  answer(outcome: ApprovalDecision): Promise<void>
}

/** `uiSession` 服务的消费面（只取根状态快照）。 */
export interface UiSessionFace {
  readonly sessionStatus?: SnapshotFace<ReadonlyMap<string, { readonly pendingInteraction?: unknown }>>
}

/**
 * 订阅某个会话的待审批请求。能力缺席（没有 uiSession / 没 active 快照面）返回 null ⇒ 弹窗不画卡。
 * @param uiSession - 宿主 client 服务 `uiSession`。
 * @param sessionId - 预览中的会话 id。
 */
export function openPendingApproval(
  uiSession: UiSessionFace | undefined,
  sessionId: string,
): SnapshotFace<PendingApprovalFace | undefined> | null {
  const status = uiSession?.sessionStatus
  if (status === undefined || typeof status.getSnapshot !== 'function' || typeof status.subscribe !== 'function') return null
  // 快照值 = 官方对象本身（引用稳定、answerable 是 getter）⇒ getSnapshot 可直接给 React。
  const read = (): PendingApprovalFace | undefined => {
    try {
      return approvalFace(status.getSnapshot().get(sessionId)?.pendingInteraction)
    } catch {
      return undefined
    }
  }
  return { getSnapshot: read, subscribe: (onChange) => status.subscribe(onChange) }
}

/** 只认 `kind === 'approval'` 且真能作答的域值（别的 pending-interaction 域一律当没有）。 */
function approvalFace(value: unknown): PendingApprovalFace | undefined {
  if (typeof value !== 'object' || value === null) return undefined
  const record = value as Record<string, unknown>
  if (record.kind !== 'approval' || typeof record.key !== 'string' || typeof record.toolName !== 'string') return undefined
  if (typeof record.answer !== 'function') return undefined
  return value as PendingApprovalFace
}
