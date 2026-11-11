// 会话预览的「选择题卡」数据面（官方 ask_user_question 的待答状态）。
//
// 官方对照（**读源码本体核实**，`deepseek-ai/deepseek-harness` tag `dsh-v0.2.2-rc.1`）：
//  · 服务端 `@deepseek-ai/dsh-user-questions@0.2.2-rc.1`：lib/index.js:72-74 注册会话投影 `userQuestions`，
//    视图 = `{ active: [...], settled: [...] }`；:52-58 active 行 =
//    `{ callId, questions: [{ id, question, detail?, header?, options?: [{ label, description? }], multiSelect? }],
//    state: 'open' | 'continued' }`。投影是公开只读面，**没有作答通道**。
//  · 客户端面板 `@deepseek-ai/dsh-client-ui-user-questions`（宿主外壳包，**未发 npm**，源码在公开仓库
//    `packages/client/ui-user-questions/`）：src/client/index.ts:371-374
//    `ctx.uiSession.registerPendingInteraction<PendingQuestion>(…)` —— 题卡和审批卡是同一个
//    pending-interaction 注册表里的两个域；carrier 本体带 `questions` / `snapshot()` / `answer()` / `dismiss()`。
//    ⇒ 待答题卡的**活体**就在 `uiSession.sessionStatus.get(id).pendingInteraction` 上（kind = 'question'），
//      这是唯一能作答的公开面：`answer({ answers })` 内部按 `waterfall`（open，实时阻塞）或 `rpc`（continued，补答）走。
//  · 投影仍保留为兜底：宿主没装该外壳包 / 载体已被移除时，至少按投影把题与选项画出来（只读）。
import type { ChatNodeFace, ProjectionStoreFace, SnapshotFace } from './faces.js'
import type { UiSessionFace } from './pending-approval.js'

/** 官方 questionSchema 里的一个选项。 */
export interface PendingQuestionOption {
  readonly label: string
  readonly description?: string
}

/** 官方 active 行里的一道题。 */
export interface PendingQuestionItem {
  readonly id: string
  readonly question: string
  readonly header?: string
  readonly detail?: string
  readonly options?: readonly PendingQuestionOption[]
  readonly multiSelect?: boolean
}

/** 官方 active 行：`state === 'open'` 正在阻塞等答；`'continued'` 是已超时、可补答。 */
export interface PendingQuestionSet {
  readonly callId: string
  readonly state: 'open' | 'continued'
  readonly questions: readonly PendingQuestionItem[]
}

/**
 * 官方 `ctx.userQuestionPanels`（外壳包 `ui-user-questions` 用 `ctx.reflect.provide` 提供，
 * `uqs_index.ts:376-379`）。本仓只用到 `reveal` 一个动作：官方题面板被收起后，卡还在外壳的私有表里，
 * 只有这个动作能把它放回 composer 座位（顺带重新出现在 `sessionStatus.pendingInteraction` 上）。
 */
export interface UserQuestionPanelsFace {
  /**
   * 把某次调用的作答面板放回 composer，排在其它待答之前。
   * @param sessionId - 这个 call 所属会话。
   * @param callId - `ask_user_question` 的工具调用 id。
   * @returns 那张卡还在、能放回来时为 true。
   */
  reveal(sessionId: string, callId: string): boolean
}

/**
 * 从 chat 快照直接读「还没结算的 ask_user_question 调用」——投影缺席或暂时为空时的等价来源。
 * 官方 tool 卡就是这么判 pending 的（`model.state === 'running'`，ui-tool lib/client.js:2369），
 * 问题与选项都记在调用参数里，所以卡片能连选项一起画。
 * @param order - chat 快照的节点键顺序。
 * @param read - 按 key 读节点。
 * @returns 最后一组未结算的提问；没有则 null。
 */
export function pendingQuestionsFromNodes(
  order: readonly string[],
  read: (key: string) => ChatNodeFace | undefined,
): PendingQuestionSet | null {
  const started = new Map<string, { argsRaw: string }>()
  const ended = new Set<string>()
  for (const key of order) {
    const node = read(key)
    if (node === undefined || node.kind !== 'tool-call') continue
    const root = node.data?.root
    if (typeof root !== 'object' || root === null) continue
    const call = root as { name?: unknown; phase?: unknown; callId?: unknown; argsRaw?: unknown }
    if (typeof call.callId !== 'string' || call.callId === '') continue
    if (call.phase === 'end') { ended.add(call.callId); continue }
    if (call.phase !== 'start' || call.name !== 'ask_user_question' || typeof call.argsRaw !== 'string') continue
    started.set(call.callId, { argsRaw: call.argsRaw })
  }
  let pending: PendingQuestionSet | null = null
  for (const [callId, { argsRaw }] of started) {
    if (ended.has(callId)) continue
    const questions = questionsOf(argsRaw)
    if (questions === null) continue
    pending = { callId, state: 'open', questions }
  }
  return pending
}

/** 官方 toolArgumentsSchema 的子集：questions[].options[] 用 `multi_select` 拼法（dsh-user-questions :113-129）。 */
function questionsOf(argsRaw: string): PendingQuestionItem[] | null {
  let parsed: unknown
  try {
    parsed = JSON.parse(argsRaw)
  } catch {
    return null
  }
  if (typeof parsed !== 'object' || parsed === null) return null
  const raw = (parsed as { questions?: unknown }).questions
  if (!Array.isArray(raw) || raw.length === 0) return null
  const items: PendingQuestionItem[] = []
  for (const entry of raw) {
    if (typeof entry !== 'object' || entry === null) continue
    const q = entry as Record<string, unknown>
    if (typeof q.id !== 'string' || typeof q.question !== 'string') continue
    const options = Array.isArray(q.options)
      ? q.options.flatMap((option): PendingQuestionOption[] => {
          if (typeof option !== 'object' || option === null) return []
          const o = option as Record<string, unknown>
          return typeof o.label === 'string'
            ? [{ label: o.label, ...(typeof o.description === 'string' ? { description: o.description } : {}) }]
            : []
        })
      : undefined
    items.push({
      id: q.id,
      question: q.question,
      ...(typeof q.header === 'string' ? { header: q.header } : {}),
      ...(typeof q.detail === 'string' ? { detail: q.detail } : {}),
      ...(options === undefined || options.length === 0 ? {} : { options }),
      ...(q.multi_select === true || q.multiSelect === true ? { multiSelect: true } : {}),
    })
  }
  return items.length === 0 ? null : items
}

/**
 * 订阅该会话当前待答的一组问题（官方一次只展示一组：`ahead of any other pending question`）。
 * 能力缺席（宿主没注册该投影）返回 null ⇒ 不画题卡。
 * @param projections - `session.projections`（与 inbox 同一入口）。
 */
export function openPendingQuestions(
  projections: ProjectionStoreFace | undefined,
): SnapshotFace<PendingQuestionSet | null> | null {
  const face = projections?.faceOf?.('userQuestions')
  if (face === undefined || face === null || typeof face.getSnapshot !== 'function' || typeof face.subscribe !== 'function') return null
  // 投影每次 publish 都换引用；缓存映射结果，React 的 getSnapshot 才稳定。
  let raw: unknown
  let mapped: PendingQuestionSet | null = null
  let primed = false
  const read = (): PendingQuestionSet | null => {
    let next: unknown
    try {
      next = face.getSnapshot()
    } catch {
      return null
    }
    if (primed && next === raw) return mapped
    primed = true
    raw = next
    mapped = firstActive(next)
    return mapped
  }
  return { getSnapshot: read, subscribe: (onChange) => face.subscribe(onChange) }
}

/** 形状校验后取第一条 active（官方的 active 行必须 questions 非空、callId 非空）。 */
/** 形状不符只提示一次（避免每次 publish 刷屏）。 */
let shapeWarned = false

function firstActive(view: unknown): PendingQuestionSet | null {
  if (typeof view !== 'object' || view === null) return null
  const record = view as Record<string, unknown>
  // 投影的 wire 视图是 `{ active, settled }`（dsh-user-questions lib/index.js:288-291 `wire.view = state => state.questions`）；
  // 若拿到的是未 map 的 state（`{ inheritedEventCount, timed, questions:{ active, settled } }`）也认。
  const active = Array.isArray(record.active)
    ? record.active
    : typeof record.questions === 'object' && record.questions !== null
      ? (record.questions as { active?: unknown }).active
      : undefined
  if (!Array.isArray(active)) {
    if (!shapeWarned) {
      shapeWarned = true
      console.info(`[dsh-plugin-core:session] userQuestions 快照形状未识别，键=[${Object.keys(record).join(',')}]`)
    }
    return null
  }
  for (const row of active) {
    const parsed = questionSet(row)
    if (parsed !== null) return parsed
  }
  return null
}

/** 一条作答（官方 `AskUserQuestionAnswerItem`）：选中项标签 + 可选自定义文本。 */
export interface PendingQuestionAnswerItem {
  readonly id: string
  readonly selected: readonly string[]
  readonly custom?: string
}

/** 题卡的活体态（官方 `QuestionCardSnapshot` 的消费子集）。 */
export interface PendingQuestionCardState {
  readonly state: 'open' | 'continued'
  /** 前台倒计时（请求没带 deadline 时缺席）。 */
  readonly countdown?: { readonly remainingMs: number; readonly running: boolean }
  /** 当前有没有活通道（官方 `canSubmit = card.channel !== 'none'`）；`cancel` 型关闭要求它是活的。 */
  readonly channel?: 'waterfall' | 'rpc' | 'none'
}

/**
 * 官方 `PendingQuestion` 载体的消费面（`ui-user-questions` 注册进 `uiSession` 的
 * pending-interaction 域值）。`answer()` 是官方面板自己那条作答路径，内部按
 * waterfall（open）/ rpc（continued）择一。
 */
export interface PendingQuestionFace {
  readonly key: string
  readonly kind: string
  readonly questions: readonly PendingQuestionItem[]
  /** 已结算调用的回放（只读审阅卡）才有；活体请求没有。 */
  readonly review?: readonly PendingQuestionAnswerItem[]
  /**
   * 关闭面板的语义：`hide` 只是离座（可从工具调用重新打开，请求仍在）；
   * `cancel` 会真把请求取消掉。预览只对 `hide` 给关闭钮。
   */
  readonly dismissal?: 'hide' | 'cancel'
  snapshot(): PendingQuestionCardState
  /** 卡片态变化（倒计时 / open↔continued）的订阅面。 */
  subscribe?(listener: () => void): () => void
  answer(answer: { answers: readonly PendingQuestionAnswerItem[] }): Promise<void>
  dismiss?(): Promise<void>
}

/**
 * 官方 `QuestionComposer.parseRecommendedLabel`：把选项标签里的「(推荐) / (recommended)」尾缀
 * 拆出来做徽标，作答值仍用原标签。
 * @param label - 选项原始标签。
 * @returns 展示用标签 + 是否推荐。
 */
export function parseRecommendedLabel(label: string): { label: string; recommended: boolean } {
  const suffix = /\s*(?:\((?:recommended|推荐)\)|（(?:recommended|推荐)）)\s*$/i
  return suffix.test(label)
    ? { label: label.replace(suffix, ''), recommended: true }
    : { label, recommended: false }
}

/**
 * 官方 `recommendedOptions`：单选取「标记了推荐的第一项」，多选取全部推荐项（隐式草稿）。
 * @param question - 一道题。
 * @returns 该题默认勾选的标签。
 */
export function recommendedOptions(question: PendingQuestionItem): string[] {
  const labels = (question.options ?? []).map(option => option.label)
  const candidates = question.multiSelect === true ? labels : labels.slice(0, 1)
  return candidates.filter(label => parseRecommendedLabel(label).recommended)
}

/** 弹窗交给 `QuestionPanel` 的作答入参（活体在就有，缺席就一个都不给 = 只读）。 */
export interface QuestionPanelWiring {
  answer?: (answers: readonly PendingQuestionAnswerItem[]) => Promise<void>
  dismiss?: () => void | Promise<void>
  dismissal?: 'hide' | 'cancel'
  subscribeCard?: (listener: () => void) => () => void
  readCard?: () => PendingQuestionCardState
}

/**
 * 由活体载体推出面板的作答入参。**作答与关闭钮是两件事**：两种 `dismissal` 官方都给关闭钮，
 * 只是语义不同 —— `hide`（有 callId）= 收起面板、可从工具调用重开；`cancel`（无 callId）= 放弃整组问题。
 * 所以这里永远给 `answer`，`dismiss` 只要载体有就给，语义交给 `dismissal` 区分。
 * @param live - 活体载体；undefined = 载体缺席 ⇒ 返回空对象，面板走只读。
 */
export function questionPanelWiring(live: PendingQuestionFace | undefined): QuestionPanelWiring {
  if (live === undefined) return {}
  return {
    answer: async (answers) => { await live.answer({ answers }) },
    subscribeCard: live.subscribe,
    readCard: live.snapshot,
    dismissal: live.dismissal,
    // `dismiss()` 是原型方法（内部读 this.dismissal），必须经对象调用，不能直接传引用。
    ...(live.dismiss === undefined ? {} : { dismiss: (): Promise<void> | undefined => live.dismiss?.() }),
  }
}

/**
 * 订阅某个会话此刻的题卡活体（`uiSession.sessionStatus.pendingInteraction`，kind = 'question'）。
 * 能力缺席（没有 uiSession / 宿主没装题面板外壳包）返回 null ⇒ 题卡退回只读投影渲染。
 * @param uiSession - 宿主 client 服务 `uiSession`。
 * @param sessionId - 预览中的会话 id。
 */
export function openLiveQuestion(
  uiSession: UiSessionFace | undefined,
  sessionId: string,
): SnapshotFace<PendingQuestionFace | undefined> | null {
  const status = uiSession?.sessionStatus
  if (status === undefined || typeof status.getSnapshot !== 'function' || typeof status.subscribe !== 'function') return null
  const read = (): PendingQuestionFace | undefined => {
    try {
      return questionFace(status.getSnapshot().get(sessionId)?.pendingInteraction)
    } catch {
      return undefined
    }
  }
  return { getSnapshot: read, subscribe: (onChange) => status.subscribe(onChange) }
}

/** 只认题卡域（`kind === 'question'`）且真能作答的载体；计划审阅走自己的呈现，这里不当题卡。 */
function questionFace(value: unknown): PendingQuestionFace | undefined {
  if (typeof value !== 'object' || value === null) return undefined
  const record = value as Record<string, unknown>
  if (record.kind !== 'question') return undefined
  if (typeof record.key !== 'string' || !Array.isArray(record.questions) || record.questions.length === 0) return undefined
  if (typeof record.answer !== 'function' || typeof record.snapshot !== 'function') return undefined
  return value as PendingQuestionFace
}

function questionSet(row: unknown): PendingQuestionSet | null {
  if (typeof row !== 'object' || row === null) return null
  const record = row as Record<string, unknown>
  if (typeof record.callId !== 'string' || record.callId === '') return null
  const state = record.state === 'continued' ? 'continued' : record.state === 'open' ? 'open' : undefined
  if (state === undefined || !Array.isArray(record.questions) || record.questions.length === 0) return null
  const questions: PendingQuestionItem[] = []
  for (const item of record.questions) {
    if (typeof item !== 'object' || item === null) return null
    const q = item as Record<string, unknown>
    if (typeof q.id !== 'string' || typeof q.question !== 'string') return null
    const options = Array.isArray(q.options)
      ? q.options.flatMap((option): PendingQuestionOption[] => {
          if (typeof option !== 'object' || option === null) return []
          const o = option as Record<string, unknown>
          return typeof o.label === 'string'
            ? [{ label: o.label, ...(typeof o.description === 'string' ? { description: o.description } : {}) }]
            : []
        })
      : undefined
    questions.push({
      id: q.id,
      question: q.question,
      ...(typeof q.header === 'string' ? { header: q.header } : {}),
      ...(typeof q.detail === 'string' ? { detail: q.detail } : {}),
      ...(options === undefined || options.length === 0 ? {} : { options }),
      ...(q.multiSelect === true ? { multiSelect: true } : {}),
    })
  }
  return { callId: record.callId, state, questions }
}
