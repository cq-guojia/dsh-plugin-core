// 会话预览的「选择题卡」数据面（官方 ask_user_question 的待答状态）。
//
// 官方对照：`@deepseek-ai/dsh-user-questions@0.2.2-rc.1`：
//  · lib/index.js:72-74 注册会话投影 `userQuestions`，视图 = `{ active: [...], settled: [...] }`；
//    :52-58 active 行 = `{ callId, questions: [{ id, question, detail?, header?, options?: [{ label, description? }],
//    multiSelect? }], state: 'open' | 'continued' }`。
//  · :709 待答的实时阻塞走宿主瀑布 `user-questions/request`，由官方题面板（未随 npm 发布的宿主外壳）应答。
//  · :560 `userQuestions.answer(agentId, callId, { answers })` 只接受 `state === 'continued'`
//    （定时 / 超时后补答）的问题，且答案是以 user 消息 steer 进去的。
// ⇒ 投影是公开只读面（本仓已用 `session.projections.faceOf('inbox')` 同一入口），所以**能渲染**；
//   `open` 态的作答只有官方面板那条路，弹窗不抢瀑布，故只渲染、不出按钮。
import type { ProjectionStoreFace, SnapshotFace } from './faces.js'

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
function firstActive(view: unknown): PendingQuestionSet | null {
  if (typeof view !== 'object' || view === null) return null
  const active = (view as { active?: unknown }).active
  if (!Array.isArray(active)) return null
  for (const row of active) {
    const parsed = questionSet(row)
    if (parsed !== null) return parsed
  }
  return null
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
