// 官方对照：ui-tool@0.2.1-rc.5 lib/client.js:2486-2607（BashRow）+ 2444-2467（bash-sample CSS 类）。
// bash / pwsh 专属卡：**不走 DisclosureRow**——root 自身 role=button、data-sample=bash、
// 折叠行 = 图标(+hover chevron) + 标题 + 分隔点 + 摘要 + 退出码徽章；展开体 = TerminalBlock
// （终端卡）或 ioCard（输入 / 分隔 / 输出，错误态输出红字）。
// 复用：终端/摘要模型全走 GenericCommandCard 的导出（terminalCardModel 等），样式走官方 bash-sample 类名。
import { Fragment, createElement as h, useMemo, useState } from 'react'
import type { KeyboardEvent as ReactKeyboardEvent } from 'react'
import {
  IconApiOutlineRegular,
  IconChevronDownOutlineRegular,
  IconChevronUpOutlineRegular,
  TerminalBlock,
  TextShimmer,
} from '../../../ui/official.js'
import { officialClass } from '../official-classes.js'
import type { Translate } from '../../../utils/i18n.js'
import {
  ExitCodeBadge,
  classifyTool,
  deriveSummary,
  formatToolBody,
  hasSpillNotice,
  shellCall,
  terminalCardModel,
  terminalLabels,
  toolTitleKey,
  type TerminalFace,
  type ToolState,
} from './GenericCommandCard.js'

/** 官方 BASH_ICON（tool client.js:2469）：终端图标 14px。 */
const BASH_ICON = h(IconApiOutlineRegular, { size: 14 })

const firstLine = (text: string): string => {
  const nl = text.indexOf('\n')
  return nl === -1 ? text : text.slice(0, nl)
}

/** 官方 terminalFailed（tool client.js:763-766）：成功结算但退出码非 0 / 有信号。 */
function terminalFailedOf(model: TerminalFace | null): boolean {
  return model !== null && model.running !== true
    && ((model.exitCode !== undefined && model.exitCode !== null && model.exitCode !== 0) || model.signal !== undefined)
}

/** bash / pwsh 行（官方 BashRow 镜像）。 */
export function BashRowMirror(props: {
  name: string
  argsRaw: string
  output: string
  isError: boolean
  settled?: boolean
  phase?: 'start' | 'preparing'
  interrupted?: boolean
  t: Translate
}): ReturnType<typeof h> {
  const { name, argsRaw, output, isError, settled = true, phase, interrupted, t } = props
  const [expanded, setExpanded] = useState(false)
  const variant = classifyTool(name)
  const titleKey = toolTitleKey(name)
  const state: ToolState = !settled
    ? (phase === 'preparing' ? 'preparing' : 'running')
    : interrupted ? 'stopped' : isError ? 'error' : 'ok'
  const args = useMemo(() => {
    try {
      const parsed: unknown = JSON.parse(argsRaw)
      return typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)
        ? parsed as Record<string, unknown>
        : null
    } catch { return null }
  }, [argsRaw])
  const shell = args === null ? null : shellCall(name, args)
  const background = shell?.background === true
  const persistent = shell?.persistent === true
  const spilled = hasSpillNotice(output)
  const terminalFace = useMemo(
    () => terminalCardModel(name, argsRaw, output, isError, settled),
    [name, argsRaw, output, isError, settled],
  )
  // 官方 localizeTerminalCardModel：send 命令空 =（发送输入），描述 = 终端 {sessionId}；shell 描述直接用参数。
  const terminal = useMemo(() => {
    if (terminalFace === null) return null
    return terminalFace.sessionId !== undefined
      ? { ...terminalFace, command: terminalFace.command === '' ? t('terminalSendInput') : terminalFace.command, description: t('terminalSession', { sessionId: terminalFace.sessionId }) }
      : terminalFace
  }, [terminalFace, t])
  const failedTerminal = terminalFailedOf(terminalFace)
  const rowState: ToolState = state === 'ok' && failedTerminal ? 'error' : state
  const running = rowState === 'running' || rowState === 'preparing'
  const generic = titleKey === 'toolTitleGeneric'
  const base = argsRaw === '' ? '' : deriveSummary(variant, argsRaw)
  const plainSummary = [generic ? name : '', base].filter(Boolean).join(' · ')
  const errorSummary = rowState === 'error' && output !== '' ? firstLine(output) : null
  const summaryText = (rowState === 'error' ? errorSummary ?? (terminal?.description ?? plainSummary) : null)
    ?? terminal?.description ?? plainSummary
  // 官方 terminalExitLabel：仅前台已失败（有退出码/信号）出徽章。
  const exitLabel = terminal !== null && terminalFailedOf(terminal) && !background
    ? terminal.signal !== undefined
      ? t('terminalSignal', { signal: terminal.signal })
      : terminal.exitCode === null || terminal.exitCode === undefined
        ? t('terminalNoExitCode')
        : t('terminalExitCode', { code: terminal.exitCode })
    : null
  const settlementLine = exitLabel !== null
    ? null
    : rowState === 'error' ? errorSummary ?? summaryText : rowState === 'stopped' ? t('rowStopped') : null
  const bodyRaw = formatToolBody(variant, argsRaw)
  const body = expanded && terminal === null && bodyRaw !== null ? bodyRaw : null
  const outputText = output === '' ? null : output
  // 官方 genericBody：终端卡缺失时，错误 / persistent / spilled / background 才走输入输出体。
  const genericBody = terminal === null && (rowState === 'error' || persistent || spilled || background)
    && (bodyRaw !== null || outputText !== null)
  const expandable = terminal !== null || genericBody
  const open = expanded && expandable
  const status = rowState === 'preparing' ? t('rowPreparing')
    : rowState === 'running' ? t('rowRunning')
      : rowState === 'error' ? t('rowFailed')
        : rowState === 'stopped' ? t('rowStopped')
          : null
  const summaryClassName = `${officialClass('bash-sample', 'summary') ?? ''}${
    exitLabel === null && rowState === 'error' ? ` ${officialClass('bash-sample', 'errorSummary') ?? ''}` : ''
  }${exitLabel === null && rowState === 'stopped' ? ` ${officialClass('bash-sample', 'stoppedSummary') ?? ''}` : ''}`
  const leading = open
    ? h(IconChevronUpOutlineRegular, { className: officialClass('bash-sample', 'chevron') ?? '' })
    : expandable
      ? h(Fragment, null,
          h('span', { className: officialClass('bash-sample', 'iconIdle') ?? '' }, BASH_ICON),
          h(IconChevronDownOutlineRegular, {
            className: `${officialClass('bash-sample', 'chevron') ?? ''} ${officialClass('bash-sample', 'chevronHover') ?? ''}`,
          }))
      : BASH_ICON
  const toggleFromKeyboard = (event: ReactKeyboardEvent<HTMLDivElement>): void => {
    if (!expandable || (event.key !== 'Enter' && event.key !== ' ')) return
    event.preventDefault()
    setExpanded(value => !value)
  }
  return h('div', { className: officialClass('bash-sample', 'card') ?? '' },
    h('div', {
      className: officialClass('bash-sample', 'root') ?? '',
      'data-sample': 'bash',
      'data-variant': 'bash',
      'data-state': rowState,
      'data-expandable': expandable || undefined,
      role: expandable ? 'button' : undefined,
      tabIndex: expandable ? 0 : undefined,
      'aria-expanded': expandable ? open : undefined,
      onClick: expandable ? () => { setExpanded(value => !value) } : undefined,
      onKeyDown: expandable ? toggleFromKeyboard : undefined,
    },
      h('span', { className: officialClass('bash-sample', 'leading') ?? '' }, leading),
      status !== null
        ? h('span', { className: officialClass('bash-sample', 'visuallyHidden') ?? '' }, status)
        : null,
      h(TextShimmer, { active: running },
        h(TextShimmer, { className: officialClass('bash-sample', 'title') ?? '' }, t(titleKey)),
        h('span', {
          className: officialClass('bash-sample', 'sep') ?? '',
          'data-shimmer-decoration': true,
          'aria-hidden': true,
        }),
        h('span', { className: summaryClassName }, h(TextShimmer, null, settlementLine ?? summaryText)),
        exitLabel !== null ? h(ExitCodeBadge, { label: exitLabel }) : null,
      ),
    ),
    open
      ? h('div', { className: officialClass('bash-sample', 'bodyWrap') ?? '' },
          terminal !== null
            ? h(TerminalBlock, {
                command: terminal.command,
                cwd: terminal.cwd,
                output: terminal.output,
                exitCode: terminal.exitCode,
                signal: terminal.signal,
                running: terminal.running,
                maxLines: Infinity,
                labels: terminalLabels(t),
                className: officialClass('bash-sample', 'terminal') ?? '',
              })
            : h('div', { className: officialClass('bash-sample', 'ioCard') ?? '' },
                body !== null
                  ? h('div', { className: officialClass('bash-sample', 'ioSection') ?? '' },
                      h('span', { className: officialClass('bash-sample', 'ioLabel') ?? '' }, t('toolInputLabel')),
                      h('span', { className: officialClass('bash-sample', 'ioText') ?? '' }, body))
                  : null,
                body !== null && outputText !== null
                  ? h('span', { className: officialClass('bash-sample', 'ioDivider') ?? '', 'aria-hidden': true })
                  : null,
                outputText !== null
                  ? h('div', { className: officialClass('bash-sample', 'ioSection') ?? '' },
                      h('span', { className: officialClass('bash-sample', 'ioLabel') ?? '' }, t('toolOutputLabel')),
                      h('span', {
                        className: officialClass('bash-sample', 'ioText') ?? '',
                        'data-error': rowState === 'error' || undefined,
                      }, outputText))
                  : null,
              ),
        )
      : undefined,
  )
}
