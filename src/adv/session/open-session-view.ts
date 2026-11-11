// 只读会话视图的数据链（移植自兄弟项目 session-view.ts，决策 28 数据链）。
//
// 数据链（全部经源码核实，出处见 ./faces.ts 顶部注释）：
// 1. `sessions.retain(id, { source })` —— binding(id) 只查已物化 scope、从不创建
//    （0.1.7-rc.2 lib/client.js:3406）⇒ 归档 / 久未打开的会话返回 undefined。
//    正解 = retain → retainScope → materializeScope（3410/3472）物化 scope 并在内部触发
//    manager.get(id).open() 拉历史尾页；引用用完 release()（否则 scope 永不回收）。
//    **归档会话就在这条路上可读**（archiveSession 只藏显示面、不动存储，capabilities.md:26/32）。
// 2. `sessions.binding(id)` 取绑定；`uiConversation.binding(binding)` 校验归属
//    （非活跃会话抛 inactive session，ui-conversation lib/client.js:3083）⇒ retain 之后即通过。
// 3. `.target('chat')`：快照 = ChatSnapshot，**同时**带两份数据：
//      · `order` + `nodes`（keyed ChatNodeStore）= 官方 ChatView 真正渲染的那条流，
//        turn-trigger / turn-process / assistant-step / tool-call / turn-tail 都在这里；
//      · `legacy.nodes` = 官方兼容投影（老 kind 名，缺 turn-trigger / turn-process）。
//    渲染主路走 keyed 流；`legacy.nodes` 只作 order 为空时的兜底。
//
// ⛔ 已证伪、勿再尝试（兄弟项目真机实测）：
//    - 弹窗内渲染官方 ChatView：`ctx.slots.renderSlot` 只接受 key='root'（运行时强制）；
//    - `retain(source:'mainView')` 切官方视图：会锁死宿主会话导航（真机事故，已回退）；
//    - 冷读 RPC `$stream('session/follow')`：宿主 remote 只有 $stream/invoke，invoke 报
//      「无活动通道」⇒ 归档会话一律走上面的 retain 主路，不搞冷读。

import type {
  ChatViewFace,
  ImageAttachmentRefLike,
  MessageImageLoader,
  ProjectionStoreFace,
  SessionBindingFace,
  SessionSnapshotFace,
  SessionsFace,
  SnapshotFace,
  UiConversationFace,
} from './faces.js'
import { openPendingApproval, type PendingApprovalFace, type UiSessionFace } from './pending-approval.js'
import { openLiveQuestion, openPendingQuestions, type PendingQuestionFace, type PendingQuestionSet, type UserQuestionPanelsFace } from './pending-questions.js'

/** 弹窗数据源：已解析的 target 与向前翻页句柄；解析失败给 null。 */
export interface SessionViewTarget {
  readonly target: SnapshotFace<ChatViewFace | undefined>
  /** 向前翻一页更早的历史（官方 loadOlder；未 open / 翻尽时官方自行空转）。 */
  loadOlder(): void
  readonly session: SnapshotFace<SessionSnapshotFace>
  /** 官方 `inbox` 投影面（faceOf('inbox')）：首轮等待期用户消息的 host 侧真源。 */
  readonly inbox: SnapshotFace<unknown>
  /**
   * 图片 loader = 官方 `uiConversation.imageUrl` 绑本会话（图要授权，弹窗自己拿不到 URL）。
   * 缺席（老宿主没有该方法）= 图片块退回「[图片]」文本占位，不画空框。
   */
  readonly loadImage?: MessageImageLoader
  /**
   * 「等待审批」在线请求面（`uiSession.sessionStatus` 派生；见 pending-approval.ts）。
   * null = 调用方没给 uiSession / 宿主没这服务 ⇒ 弹窗不画审批卡。只在该会话**此刻真在等审批**时有值。
   */
  readonly pendingApproval: SnapshotFace<PendingApprovalFace | undefined> | null
  /**
   * 待答题卡的**活体**（`uiSession.sessionStatus.pendingInteraction`，kind = 'question'）。
   * 有值时题面板可作答（`answer()` 是官方面板同一条路）；null / 无值 ⇒ 退回下面的只读投影。
   */
  readonly pendingQuestion: SnapshotFace<PendingQuestionFace | undefined> | null
  /**
   * 「选择题卡」的只读兜底（官方 `userQuestions` 投影里的第一组待答问题）。
   * null = 宿主没注册该投影；只在活体缺席时用于按官方面板形态只读渲染（有选项、不可点）。
   */
  readonly pendingQuestions: SnapshotFace<PendingQuestionSet | null> | null
  /**
   * 把官方题面板放回 composer（官方 `userQuestionPanels.reveal`）：题卡被收起后，载体会从
   * `pendingInteraction` 上消失，调它一次就能回来，预览里的面板随之可作答。
   * null = 调用方没给 `userQuestionPanels` 服务。
   */
  readonly revealPendingQuestion: ((callId: string) => boolean) | null
  /** 释放 sessions.retain 引用（弹窗关闭时必调；否则会话 scope 永不回收）。 */
  dispose(): void
}

/** 默认 retain source（写进宿主 retainedBy；调用方可覆盖成自己的插件名）。 */
export const DEFAULT_RETAIN_SOURCE = 'dsh-plugin-core'

/** 投影面缺席时的稳定空快照：能力缺席按 undefined 呈现，不编造数据。 */
const NOOP_DISPOSE = (): void => {}
const EMPTY_INBOX_FACE: SnapshotFace<unknown> = {
  getSnapshot: () => undefined,
  subscribe: () => NOOP_DISPOSE,
}

/** 打开只读视图：物化 binding → 探测拉尾页 → 建 chat target。会话不可解析时返回 null。 */
export function openSessionView(
  sessions: SessionsFace,
  uiConversation: UiConversationFace,
  id: string,
  /** retain 引用记进宿主 retainedBy 的键；默认 'dsh-plugin-core'。 */
  retainSource: string = DEFAULT_RETAIN_SOURCE,
  /** 宿主 `uiSession` 服务：给了才会接「等待审批」那条链（缺席 = 不渲染审批卡）。 */
  uiSession?: UiSessionFace,
  /**
   * 宿主 `userQuestionPanels` 服务（外壳包 `ui-user-questions` 提供）。
   * 只用一个动作：`reveal(sessionId, callId)` —— 官方题面板被收起后，把那张卡重新放回 composer，
   * 顺便让它重新出现在 `sessionStatus.pendingInteraction` 上（于是预览里的面板就能作答）。
   */
  questionPanels?: UserQuestionPanelsFace,
): SessionViewTarget | null {
  const log = (level: 'warn' | 'info', msg: string, extra?: unknown): void => {
    if (level === 'warn') console.warn(`[dsh-plugin-core:session] ${msg}`, extra ?? '')
    else console.info(`[dsh-plugin-core:session] ${msg}`)
  }
  // retain 引用：用完必须 release（否则会话 scope 不会被回收）。
  let retainedRef: { release(): void } | null = null
  const releaseRef = (): void => {
    try { retainedRef?.release() } catch (err) { log('warn', `sessions.retain 引用释放失败（${id}）`, err) }
    retainedRef = null
  }
  let binding: SessionBindingFace
  try {
    const S0 = sessions as unknown as Record<string, unknown>
    const retainFn = S0.retain
    if (typeof retainFn === 'function') {
      try {
        retainedRef = (retainFn as (t: string, o: { source: string }) => { release(): void })
          .call(S0, id, { source: retainSource })
        log('info', `sessions.retain(${id}, { source: '${retainSource}' }) 成功：scope 已物化`)
      } catch (err) { log('warn', `sessions.retain(${id}) 抛错（未知会话？）`, err) }
    } else {
      log('warn', `sessions 无 retain 方法；归档 / 久未打开的会话将不可读。自身键=[${Object.keys(S0).join(',')}]`)
    }
    const found: SessionBindingFace | undefined = sessions.binding(id)
    if (found === undefined || found === null) {
      // 取证优先：把 sessions 服务真实方法面全打出来，下次不再猜。
      const S0d = sessions as unknown as Record<string, unknown>
      const allFn = ((): string[] => {
        const out = new Set<string>()
        let cur: unknown = S0d
        while (cur && (typeof cur === 'object' || typeof cur === 'function')) {
          for (const k of Object.getOwnPropertyNames(cur as object)) {
            const v = (cur as Record<string, unknown>)[k]
            if (typeof v === 'function' && k !== 'constructor') out.add(k)
          }
          cur = Object.getPrototypeOf(cur)
        }
        return [...out]
      })()
      log('warn', `sessions.binding(${id}) 为空（会话未就位，retain 也未物化）。sessions 方法全清单=[${allFn.join(',')}]；自身键=[${Object.keys(S0d).join(',')}]`)
      releaseRef()
      return null
    }
    binding = found
  } catch (err) {
    log('warn', `openSessionView 返回 null：sessions.binding(${id}) 抛错`, err)
    releaseRef()
    return null
  }
  const session = binding.session
  // 官方 ChatFlow 用 useProjection('inbox') 画等待期用户消息；其解析路径的公开面是
  // ProjectionValueStore.faceOf(key)（projection-store.d.ts）。运行时探测，缺席 = 能力缺席。
  const projections = (session as { projections?: ProjectionStoreFace }).projections
  const inbox: SnapshotFace<unknown> = projections?.faceOf?.('inbox') ?? EMPTY_INBOX_FACE
  // 数据闸门：官方 Session.open() 幂等拉历史尾页。类型未公开 ⇒ 探测调用；
  // 失败软着陆（界面显示空态与重试提示，不崩面板）。
  try {
    const opened = (session as { open?: () => Promise<void> }).open?.()
    if (opened !== undefined && typeof opened.catch === 'function') {
      opened.catch((err) => log('warn', `session.open(${id}) 失败（仅影响历史加载，不阻断弹窗）`, err))
    }
  } catch (err) { log('warn', `session.open(${id}) 抛错`, err) }
  let conversation: ReturnType<UiConversationFace['binding']>
  try {
    conversation = uiConversation.binding(binding)
  } catch (err) {
    log('warn', 'openSessionView 返回 null：uiConversation.binding 抛错（binding 已取得，断点在 uiConversation 装配）', err)
    return null
  }
  let target: SnapshotFace<ChatViewFace | undefined>
  try {
    target = conversation.target('chat')
  } catch (err) {
    log('warn', "openSessionView 返回 null：conversation.target('chat') 抛错", err)
    return null
  }
  log('info', `openSessionView 成功建立 target（${id}）；首屏 nodes 待订阅回填`)
  // 官方 ChatView 的 loadImage（ui-chat lib/client.js:15506）= uiConversation.imageUrl 绑会话；
  // 方法用 this.images，必须经服务对象调用，不能先解构出来。
  const imageUrl = uiConversation.imageUrl
  const peekImageUrl = uiConversation.peekImageUrl
  const loadImage: MessageImageLoader | undefined = imageUrl === undefined
    ? undefined
    : Object.assign(
        (attachment: ImageAttachmentRefLike) => imageUrl.call(uiConversation, id, attachment),
        { peek: (attachment: ImageAttachmentRefLike) => peekImageUrl?.call(uiConversation, id, attachment) },
      )
  // 两类「等用户表态」的卡最后接：都是只读公开面，缺席不影响上面的预览主路。
  const pendingApproval = openPendingApproval(uiSession, id)
  const pendingQuestion = openLiveQuestion(uiSession, id)
  const pendingQuestions = openPendingQuestions(projections)
  // 官方题面板被收起后只是「离座」，卡本身还在外壳里（waterfall 也没断）；`reveal` 是官方给的唯一回去的路。
  const revealPendingQuestion: SessionViewTarget['revealPendingQuestion'] = questionPanels === undefined
    ? null
    : (callId: string): boolean => {
        try {
          return questionPanels.reveal(id, callId) === true
        } catch (err) {
          log('warn', `userQuestionPanels.reveal(${id}, ${callId}) 抛错`, err)
          return false
        }
      }
  if (pendingQuestions === null) {
    log('warn', projections === undefined
      ? `题卡未接线：session.projections 不存在（会话 ${id}）`
      : `题卡未接线：projections 存在但 faceOf('userQuestions') 不可用（会话 ${id}）`)
  }
  return {
    target,
    session,
    inbox,
    pendingApproval,
    pendingQuestion,
    pendingQuestions,
    revealPendingQuestion,
    ...(loadImage === undefined ? {} : { loadImage }),
    dispose: releaseRef,
    loadOlder(): void {
      try {
        const page = (session as { loadOlder?: () => Promise<void> }).loadOlder?.()
        if (page !== undefined && typeof page.catch === 'function') {
          page.catch((err) => log('warn', `session.loadOlder(${id}) 失败`, err))
        }
      } catch (err) { log('warn', `session.loadOlder(${id}) 抛错`, err) }
    },
  }
}
