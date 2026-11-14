// 官方对照：`@deepseek-ai/dsh-client-ui-approval@0.2.2-rc.1`：
//  · lib/client.js:20-32（ApprovalPanel.module.css 类名表：root / card / strip / body / headline /
//    command / actionRow / reject / subject / description / withSubject）
//  · :41-165（ApprovalCard：strip=StateDot+「等待审批」、body=headline[+description][+command]、
//    actionRow=拒绝(outline)+允许一次(primary)，`disabled: answered`）
//  · :302-310（zh 词表；本包同文案走自有 i18n 字典）
//  · ui-chat :151-172（ApprovalCommand）：命令文本 = 按 callId 找 tool-call 起始节点的 args.command
// 弹窗不走官方槽位（`conversation.approval.card` 只能由槽宿主渲染），故按官方 DOM / 类名 1:1 直画。
import { createElement as h, useRef, useState } from 'react'
import type { ReactElement } from 'react'
import { Button, StateDot } from '../../../ui/official.js'
import { officialClass } from '../official-classes.js'
import { getLocale, type Translate } from '../../../utils/i18n.js'
import type { ChatNodeFace } from '../faces.js'
import type { ApprovalDecision, PendingApprovalFace } from '../pending-approval.js'

const cls = (semantic: string): string => officialClass('ApprovalPanel', semantic) ?? ''

/**
 * 官方 ApprovalPanel.tsx:11 `reason = displayReason === undefined ? approval.reason : resolveReason(displayReason)`，
 * :14 `title: reason ?? t('escalation', {toolName})`。两处都是 `??`：空串是合法标题，不回落。
 * `resolveReason` 由注入方给的是 `ctx.locale.resolveText`（index.ts:104 的语言回退链）；
 * 本仓缺省用自有 getLocale() → en 回退链，同样不排除空串、不伪造语言。
 * 返回 `string | undefined` 只表达「语言表里中英都没有」这一种缺数据情形：
 * 该情形走官方 :14 的 `?? t('escalation')` 回落路径，与官方 `reason === undefined` 同义。
 */
export type ApprovalReasonResolver = (shown: Readonly<Record<string, string>>) => string | undefined

function defaultResolveReason(shown: Readonly<Record<string, string>>): string | undefined {
  return shown[getLocale()] ?? shown.en
}

function headline(
  approval: PendingApprovalFace,
  t: Translate,
  resolveReason: ApprovalReasonResolver,
): string {
  const reason = approval.displayReason === undefined
    ? approval.reason
    : resolveReason(approval.displayReason)
  return reason ?? t('approvalEscalation', { toolName: approval.toolName })
}

/** 官方 ApprovalCommand（ui-chat lib/client.js:151-172）：callId → tool-call 起始节点的 args.command。 */
export function approvalCommand(
  order: readonly string[],
  read: (key: string) => ChatNodeFace | undefined,
  callId: string | undefined,
): string | undefined {
  if (callId === undefined) return undefined
  for (const key of order) {
    const node = read(key)
    if (node === undefined || node.kind !== 'tool-call') continue
    const root = node.data?.root
    if (typeof root !== 'object' || root === null) continue
    const call = root as { callId?: unknown; phase?: unknown; argsRaw?: unknown }
    if (call.callId !== callId || call.phase !== 'start' || typeof call.argsRaw !== 'string') continue
    try {
      const args: unknown = JSON.parse(call.argsRaw)
      const command = typeof args === 'object' && args !== null ? (args as Record<string, unknown>).command : undefined
      return typeof command === 'string' ? command : undefined
    } catch {
      return undefined
    }
  }
  return undefined
}

/**
 * 待审批卡（官方 ApprovalPanel）。作答直接调 `pendingInteraction.answer()`——官方两个按钮的同一调用，
 * 答完官方 publish 会让 pendingInteraction 变空 ⇒ 卡自行消失。
 * shortcut: 未移植官方 root 上的 Enter/Esc 快捷键（要求焦点在卡内），需要键盘作答时补。
 */
export function ApprovalPanelMirror(props: {
  approval: PendingApprovalFace
  /** 关联工具调用的命令行（官方 approval.detail 槽的等价物；取不到 = 不画那行）。 */
  command?: string
  /** 官方 ApprovalCard.tsx:68-71 的可选 subject（应用授权卡复用路径）；工具审批不传。 */
  subject?: { name: string; icon?: string }
  /** 官方 ApprovalCard.tsx:76 的可选 description；工具审批不传。 */
  description?: string
  /** 宿主 `ctx.locale.resolveText`（index.ts:104）注入口；缺省用自有 getLocale() → en 回退链。 */
  resolveReason?: ApprovalReasonResolver
  t: Translate
}): ReactElement {
  const { approval, command, subject, description, t } = props
  const resolveReason = props.resolveReason ?? defaultResolveReason
  const [answered, setAnswered] = useState(false)
  const waiting = useRef(false)
  const answer = (outcome: ApprovalDecision): void => {
    if (waiting.current || !approval.answerable) return
    waiting.current = true
    setAnswered(true)
    // 失败（请求已失效 / 传输断了）⇒ 恢复可点，别把按钮永久卡死。
    void approval.answer(outcome).catch(() => {
      waiting.current = false
      setAnswered(false)
    })
  }
  return h('div', { className: cls('root'), 'data-approval-key': approval.key, 'aria-busy': answered },
    h('div', { className: subject === undefined ? cls('card') : `${cls('card')} ${cls('withSubject')}` },
      h('div', { className: cls('strip') },
        h(StateDot, { state: answered ? 'ongoing' : 'warning' }),
        t('approvalWaiting'),
      ),
      h('div', {
        className: cls('body'),
        'data-approval-scroll': '',
        tabIndex: 0,
        role: 'group',
        'aria-label': t('approvalDetailAria'),
      },
        subject === undefined
          ? null
          : h('div', { className: cls('subject') },
              subject.icon === undefined
                ? null
                : h('img', { src: subject.icon, alt: '', width: 40, height: 40, draggable: false }),
              h('strong', null, subject.name)),
        h('div', { className: cls('heading') },
          h('div', { className: cls('headline') }, headline(approval, t, resolveReason))),
        description === undefined ? null : h('p', { className: cls('description') }, description),
        command === undefined ? null : h('div', { className: cls('command') }, command),
      ),
      h('div', { className: cls('actionRow') },
        h(Button, {
          variant: 'outline',
          className: cls('reject'),
          disabled: answered,
          onClick: () => { answer('rejected') },
        }, t('approvalReject')),
        h(Button, {
          variant: 'primary',
          disabled: answered,
          onClick: () => { answer('allowed-once') },
        }, t('approvalAllowOnce')),
      ),
    ),
  )
}
