// 官方对照：ui-tool `toolviews/ask-question-row` + `AskQuestionCard`（lib/client.js:1285-1318、2138-2272）。
//
// 官方靠宿主投影 `userQuestions`（active / settled）判定态；弹窗拿不到投影 ⇒ 只保留可移植的部分：
// 错误码（ASK_CANCELLED / ASK_ABORTED）、未结算、结算结果里的 answers JSON。
// 拿不到的分支（TOOL_OUTCOME_UNKNOWN 的 pending/closed、事后补答）一律落回通用卡，不猜。
import { createElement as h, type ReactElement } from 'react'
import { officialClass } from '../official-classes.js'
import type { Translate } from '../../../utils/i18n.js'

interface QuestionEntry { id: string; question: string }
interface AnswerEntry { id: string; selected: string[]; custom?: string }

/** 官方 AskQuestionCard 只两态：有答案（dl/dt/dd）与无答案（verdict + 问题清单）。 */
export interface AskCardFace {
  kind: 'answered' | 'unanswered'
  questions: { id: string; question: string; answers?: string[] }[]
  verdict?: string
  skippedLabel?: string
}

/** 行面：摘要在行上，卡在展开体里；`state` 覆盖官方那两处强制态。 */
export interface AskFace {
  summary: string
  card?: AskCardFace
  state?: 'ok' | 'stopped'
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

function parseJson(text: string): unknown {
  try {
    return JSON.parse(text)
  } catch {
    return undefined
  }
}

/** 官方 questionEntries（2194-2213）：id 与问题文本必须齐全且 id 不重复。 */
function questionEntries(argsRaw: string): QuestionEntry[] | null {
  const parsed = parseJson(argsRaw)
  if (!isRecord(parsed) || !Array.isArray(parsed.questions) || parsed.questions.length === 0) return null
  const questions: QuestionEntry[] = []
  const ids = new Set<string>()
  for (const question of parsed.questions) {
    if (!isRecord(question) || typeof question.id !== 'string' || typeof question.question !== 'string') return null
    if (ids.has(question.id)) return null
    ids.add(question.id)
    questions.push({ id: question.id, question: question.question })
  }
  return questions
}

/** 官方 answerEntries（2149-2164）：结果 JSON 里的 answers，形状不对整体作废。 */
function answerEntries(text: string): AnswerEntry[] | null {
  const parsed = parseJson(text)
  if (!isRecord(parsed) || !Array.isArray(parsed.answers) || !parsed.answers.every(isRecord)) return null
  const entries: AnswerEntry[] = []
  for (const answer of parsed.answers) {
    if (typeof answer.id !== 'string' || !Array.isArray(answer.selected)) return null
    if (!answer.selected.every(item => typeof item === 'string')) return null
    if (answer.custom !== undefined && typeof answer.custom !== 'string') return null
    entries.push({
      id: answer.id,
      selected: [...answer.selected] as string[],
      ...(answer.custom === undefined ? {} : { custom: answer.custom }),
    })
  }
  return entries
}

/** 官方 pairAnswers（2215-2233）：按回显 id 配对，数量或 id 对不上就整批作废。 */
function pairAnswers(questions: QuestionEntry[], answers: AnswerEntry[]): AskCardFace['questions'] | null {
  if (questions.length !== answers.length) return null
  const byId = new Map<string, AnswerEntry>()
  for (const answer of answers) {
    if (byId.has(answer.id)) return null
    byId.set(answer.id, answer)
  }
  const paired: AskCardFace['questions'] = []
  for (const question of questions) {
    const answer = byId.get(question.id)
    if (answer === undefined) return null
    paired.push({
      id: question.id,
      question: question.question,
      answers: [...answer.selected, ...(answer.custom === undefined || answer.custom === '' ? [] : [answer.custom])],
    })
  }
  return paired
}

/**
 * 可移植的 ask_user_question 行模型（官方 AskQuestionRow 2285-2360 的子集）。
 * @param name - 工具名（非 ask_user_question 一律 null）。
 * @param argsRaw - 调用参数 JSON。
 * @param output - 结算结果正文。
 * @param errorCode - root.error.code。
 * @param settled - 上游是否已结算。
 * @param t - 文案。
 * @returns 行面；条件不足返回 null（调用方落回通用卡）。
 */
export function askCardModel(
  name: string,
  argsRaw: string,
  output: string,
  errorCode: string | undefined,
  settled: boolean,
  t: Translate,
): AskFace | null {
  if (name !== 'ask_user_question') return null
  const questions = questionEntries(argsRaw)
  if (errorCode === 'ASK_CANCELLED') {
    return {
      summary: t('askCancelled'),
      state: 'ok',
      ...(questions === null ? {} : { card: { kind: 'unanswered', questions, verdict: t('askCancelledDetail') } }),
    }
  }
  if (errorCode === 'ASK_ABORTED') {
    return {
      summary: t('askInterrupted'),
      state: 'stopped',
      ...(questions === null ? {} : { card: { kind: 'unanswered', questions, verdict: t('askInterruptedDetail') } }),
    }
  }
  if (!settled) return { summary: t('askWaiting') }
  const answers = answerEntries(output)
  if (answers === null) return null
  const answered = answers.filter(answer => answer.selected.length > 0 || (answer.custom ?? '') !== '').length
  const paired = questions === null ? null : pairAnswers(questions, answers)
  return {
    summary: t('askAnswered', { answered, total: answers.length }),
    ...(paired === null ? {} : { card: { kind: 'answered', questions: paired, skippedLabel: t('askSkipped') } }),
  }
}

/** 官方 AskQuestionCard（1285-1318）：无答案 = 判定语 + 问题清单；有答案 = 一问一答的 dl。 */
export function AskQuestionCardView({ card }: { card: AskCardFace }): ReactElement {
  const cls = (semantic: string): string => officialClass('AskQuestionCard', semantic) ?? ''
  if (card.kind === 'unanswered') {
    return h('div', { className: cls('card') },
      h('p', { className: cls('verdict') }, card.verdict),
      h('ul', { className: cls('questionList') },
        card.questions.map(question => h('li', { key: question.id, className: cls('unansweredQuestion') }, question.question))),
    )
  }
  return h('dl', { className: cls('card') },
    card.questions.map(question => {
      const answers = question.answers ?? []
      return h('div', { key: question.id, className: cls('item') },
        h('dt', { className: cls('question') }, question.question),
        h('dd', { className: cls('answer') },
          answers.length === 0
            ? h('span', { className: cls('skipped') }, card.skippedLabel)
            : answers.map((answer, index) => h('span', { key: `${question.id}-${index}`, className: cls('answerLine') }, answer)),
        ),
      )
    }),
  )
}
