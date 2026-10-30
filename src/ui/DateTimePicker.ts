import {
  createElement as h,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import {
  FloatingPortal,
  autoUpdate,
  flip,
  offset,
  shift,
  size as floatingSize,
  useFloating,
} from '@floating-ui/react'
import { Chevron } from './chevron.js'
import { Button } from './Button.js'
import { FieldHint } from './FieldHint.js'
import { getLocale, t, type Translate } from '../utils/i18n.js'
import { formatDateTimePrecision } from '../utils/date.js'
import {
  buildMonthCells,
  ceilToPrecision,
  clampUnit,
  floorToPrecision,
  formatDateTimeIso,
  monthCaption,
  nowParts,
  nowTimeFor,
  parseDateTime,
  partsOf,
  rangeIsValid,
  stepUnit,
  toEndDraft,
  weekdayLabels,
  type DateTimeParts,
  type DateTimePrecision,
  type DayCell,
  type DayRef,
  type EndDraft,
  type StepUnit,
  type TimeParts,
} from './datetime-logic.js'
import { ensureComponentStyles } from './css.js'
import { DATETIME_CSS, FIELD_CSS } from './controls-css.js'

export type { DateTimePrecision } from './datetime-logic.js'

/** 触发器高度档（与 Picker 对齐）。 */
export type DateTimeSize = 'sm' | 'md' | 'lg'

/**
 * 传出值：本地 ISO（`YYYY-MM-DDTHH:mm:ss.SSS`）或 null。
 * single 模式传 `string | null`；range 模式传 `[start, end] | null`。
 */
export type DateTimeOutput = string | [string, string] | null

export interface DateTimePickerProps {
  /** single = 选一个时刻（默认）；range = 选时间段（起 / 止两个独立框，弹层里两块独立日历）。 */
  mode?: 'single' | 'range'
  /** 时间精度：day 只选日期；hour / minute / second 依次多一级（默认 day）。 */
  precision?: DateTimePrecision
  /** 受控值（single 传 `string | null`；range 传 `[start, end] | null`）。给了它就受控。 */
  value?: DateTimeOutput
  /** 非受控模式下的初始值。 */
  defaultValue?: DateTimeOutput
  onChange?: (value: DateTimeOutput) => void
  disabled?: boolean
  size?: DateTimeSize
  placeholder?: string
  /** 问号提示文字：给了就在触发器后面挂标准 FieldHint（排版收进组件）。 */
  hint?: string
  className?: string
  ariaLabel?: string
  translate?: Translate
}

interface Draft {
  start: EndDraft
  end: EndDraft
}

interface ViewMonth {
  year: number
  month: number // 1-12
}

type Side = 'start' | 'end'

const UNIT_LABEL: Record<StepUnit, 'dtHour' | 'dtMinute' | 'dtSecond'> = {
  hour: 'dtHour',
  minute: 'dtMinute',
  second: 'dtSecond',
}

const UNITS_OF: Record<Exclude<DateTimePrecision, 'day'>, StepUnit[]> = {
  hour: ['hour'],
  minute: ['hour', 'minute'],
  second: ['hour', 'minute', 'second'],
}

const SIZE_CLASS: Record<DateTimeSize, string> = {
  sm: 'dshpc-dt__trigger--sm',
  md: '',
  lg: 'dshpc-dt__trigger--lg',
}

/**
 * 默认宽度类：宽**固定**（选中前后不跳），数值对照参考图实测（2x 屏换算 CSS px）
 * 后统一 -6px（用户 2026-10-24：实测值留得偏多）：
 * 单值 day 128 / 时·分 153.2 / 秒 174.8；区间 day 269 / 分 341.4 / 秒 377.6。
 * 日期数字 tabular-nums 等宽，ch 即 "0" 宽，故写成 Nch + 常数；常数同时兜住默认占位不省略。
 * 调用方传更宽的 className 会自然撑开。
 */
const WIDTH_CLASS = (rangeMode: boolean, precision: DateTimePrecision): string => {
  if (rangeMode) {
    if (precision === 'day') return 'dshpc-dt__trigger--wr-day'
    return precision === 'second' ? 'dshpc-dt__trigger--wr-second' : 'dshpc-dt__trigger--wr-minute'
  }
  if (precision === 'day') return 'dshpc-dt__trigger--w-day'
  return precision === 'second' ? 'dshpc-dt__trigger--w-second' : 'dshpc-dt__trigger--w-minute'
}

function draftOf(value: DateTimeOutput): Draft {
  const empty: EndDraft = { day: null, time: { hour: 0, minute: 0, second: 0, ms: 0 } }
  if (value === null || value === undefined) return { start: empty, end: empty }
  if (Array.isArray(value)) return { start: toEndDraft(value[0]), end: toEndDraft(value[1]) }
  return { start: toEndDraft(value), end: empty }
}

function dayIso(d: { year: number; month: number; day: number }): string {
  return `${String(d.year).padStart(4, '0')}-${String(d.month).padStart(2, '0')}-${String(d.day).padStart(2, '0')}`
}

/** 显示一律按精度截断：day 只出日期，hour/minute 到分，second 才出秒（数据侧仍是完整 ISO）。 */
function fmtParts(p: DateTimeParts, precision: DateTimePrecision): string {
  return formatDateTimePrecision(formatDateTimeIso(p), precision)
}

/** 内联 SVG 图标（ui 零官方依赖，与 Picker 的 caret 同口径自绘）。 */
function icon(paths: string[], size: number): ReturnType<typeof h> {
  return h(
    'svg',
    { width: size, height: size, viewBox: '0 0 16 16', fill: 'none', 'aria-hidden': true },
    ...paths.map((d) =>
      h('path', {
        d,
        stroke: 'currentColor',
        'stroke-width': 1.5,
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
      }),
    ),
  )
}

const ICON_CAL = icon(
  [
    'M2 4.5A1.5 1.5 0 0 1 3.5 3h9A1.5 1.5 0 0 1 14 4.5V6H2V4.5z',
    'M2 6h12v8.5A1.5 1.5 0 0 1 12.5 16h-9A1.5 1.5 0 0 1 2 14.5V6z',
    'M2 9.5h12',
    'M5.5 1.5v3M10.5 1.5v3',
  ],
  14,
)
const ICON_PREV_YEAR = icon(['M9 5L5.5 8 9 11', 'M12.5 5L9 8l3.5 3'], 14)
const ICON_PREV_MONTH = icon(['M9.5 5L6 8l3.5 3'], 14)
const ICON_NEXT_MONTH = icon(['M6.5 5L10 8l-3.5 3'], 14)
const ICON_NEXT_YEAR = icon(['M7 5l3.5 3L7 11', 'M3.5 5L7 8l-3.5 3'], 14)
const ICON_UP = h(Chevron, { dir: 'up', size: 12 })
const ICON_DOWN = h(Chevron, { size: 12 })

/**
 * 日期时间选择器：单值 / 时间段，精度可控（日 / 时 / 分 / 秒）。
 *
 * **纯零件，不自己取数** —— 值由调用方受控传入；弹层内是草稿态，「确定」才提交 onChange。
 * 浮层与 Picker 同机制（floating-ui portal + 贴边翻转 + 点外关闭，**无遮罩**）。
 *
 * 交互口径：
 *  - 时间**不强制先选日期**——步进随时可调；「确定」时没选日期就不传数据。
 *  - 快捷键：day 精度叫「今天」（只置日期）；带时分秒的叫「现在」（日期 + 时间一起置）。
 *  - range 弹层 = 两块独立日历（左开始、右结束），各选各的，不标跨度。
 *  - 补全：起始端把未选单位归零（day ⇒ `00:00:00.000`），结束端拉满（day ⇒ `23:59:59.999`）；
 *    毫秒恒三位输出，数据库只收到秒时优雅退化为「当天最后一秒」。
 */
export function DateTimePicker(props: DateTimePickerProps): ReturnType<typeof h> {
  ensureComponentStyles('datetime', DATETIME_CSS)
  ensureComponentStyles('field', FIELD_CSS)
  const tt = props.translate ?? t
  const mode = props.mode ?? 'single'
  const rangeMode = mode === 'range'
  const precision = props.precision ?? 'day'
  const size = props.size ?? 'md'
  const locale = getLocale()
  const placeholder = props.placeholder ?? tt('dtPlaceholder')

  const controlled = props.value !== undefined
  const [inner, setInner] = useState<DateTimeOutput>(() => props.defaultValue ?? null)
  const current: DateTimeOutput = controlled ? (props.value ?? null) : inner

  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<Draft>(() => draftOf(current))
  const [views, setViews] = useState<{ start: ViewMonth; end: ViewMonth }>(() => {
    const d = draftOf(current)
    const n = nowParts()
    const monthOf = (e: EndDraft): ViewMonth =>
      e.day === null ? { year: n.year, month: n.month } : { year: e.day.year, month: e.day.month }
    return { start: monthOf(d.start), end: monthOf(d.end) }
  })
  const [active, setActive] = useState<Side>('start')
  const [focus, setFocus] = useState<{ start: string | null; end: string | null }>({ start: null, end: null })
  /** 步进输入框的键入中间态（失焦 / 回车才收拢成合法值，免得打 "14" 被 "1" 截断）。 */
  const [typing, setTyping] = useState<{ side: Side; unit: StepUnit; text: string } | null>(null)

  const rootRef = useRef<HTMLDivElement | null>(null)
  const gridRefs = useRef<{ start: HTMLDivElement | null; end: HTMLDivElement | null }>({ start: null, end: null })

  // 浮层定位：与 Picker 同一套（portal 到 body + viewport 相对 + 自动翻转贴边）。
  const { refs, floatingStyles } = useFloating({
    open,
    onOpenChange: setOpen,
    placement: 'bottom-start',
    middleware: [
      offset(4),
      flip(),
      shift({ padding: 8 }),
      floatingSize({
        apply({ elements, rects, availableHeight }) {
          Object.assign(elements.floating.style, {
            minWidth: `${rects.reference.width}px`,
            maxHeight: `${Math.max(240, Math.min(520, (availableHeight ?? 520) - 8))}px`,
          })
        },
      }),
    ],
    whileElementsMounted: autoUpdate,
    strategy: 'fixed',
  })

  const emit = useCallback(
    (value: DateTimeOutput): void => {
      if (!controlled) setInner(value)
      props.onChange?.(value)
    },
    [controlled, props.onChange],
  )

  const openPop = useCallback((): void => {
    if (props.disabled === true) return
    const d = draftOf(current)
    const n = nowParts()
    const monthOf = (e: EndDraft): ViewMonth =>
      e.day === null ? { year: n.year, month: n.month } : { year: e.day.year, month: e.day.month }
    setDraft(d)
    setViews({ start: monthOf(d.start), end: monthOf(d.end) })
    setActive('start')
    setFocus({ start: null, end: null })
    setTyping(null)
    setOpen(true)
  }, [current, props.disabled])

  // 点外面收起（认 root 与浮层两棵子树；菜单 portal 到 body 后不在 root 内）。
  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent): void => {
      const root = rootRef.current
      const floatingEl = refs.floating.current
      if (root?.contains(e.target as Node)) return
      if (floatingEl?.contains(e.target as Node)) return
      setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [open, refs.floating])

  // 键盘游标移动后把焦点真正搬进对应格子（两块日历各自认各自那棵）。
  useEffect(() => {
    if (!open) return
    const sides: Side[] = ['start', 'end']
    for (const side of sides) {
      const iso = focus[side]
      if (iso === null) continue
      const el = gridRefs.current[side]?.querySelector<HTMLButtonElement>(`[data-iso="${CSS.escape(iso)}"]`)
      el?.focus()
    }
  }, [open, focus])

  const units: StepUnit[] = precision === 'day' ? [] : UNITS_OF[precision]

  const setSide = (side: Side, next: EndDraft): void => {
    setDraft((d) => (side === 'end' ? { ...d, end: next } : { ...d, start: next }))
    setActive(side)
  }

  const commit = (): void => {
    const s = partsOf(draft.start)
    if (s === null) return // 没选日期 ⇒ 不传数据
    if (rangeMode) {
      const e = partsOf(draft.end)
      if (e === null) return
      const si = formatDateTimeIso(floorToPrecision(s, precision))
      const ei = formatDateTimeIso(ceilToPrecision(e, precision))
      if (!rangeIsValid(si, ei)) return
      emit([si, ei])
    } else {
      emit(formatDateTimeIso(floorToPrecision(s, precision)))
    }
    setOpen(false)
  }

  const clear = (): void => {
    emit(null)
    setOpen(false)
  }

  const applyNow = (): void => {
    const n = nowParts()
    const day: DayRef = { year: n.year, month: n.month, day: n.day }
    const time = nowTimeFor(precision)
    setSide(active, { day, time })
    setViews((v) => (active === 'end' ? { ...v, end: { year: n.year, month: n.month } } : { ...v, start: { year: n.year, month: n.month } }))
  }

  const pickDay = (side: Side, cell: DayCell): void => {
    setSide(side, { day: { year: cell.year, month: cell.month, day: cell.day }, time: draft[side].time })
    setFocus((f) => ({ ...f, [side]: cell.iso }))
  }

  const shiftUnit = (side: Side, unit: StepUnit, delta: number): void => {
    const prev = draft[side]
    const time: TimeParts =
      unit === 'hour'
        ? { ...prev.time, hour: stepUnit(prev.time.hour, unit, delta) }
        : unit === 'minute'
          ? { ...prev.time, minute: stepUnit(prev.time.minute, unit, delta) }
          : { ...prev.time, second: stepUnit(prev.time.second, unit, delta) }
    setSide(side, { ...prev, time })
    setTyping(null)
  }

  /** 键入收拢：只留数字、clamp 到该单位上限（NaN 归 0）。 */
  const commitTyping = (side: Side, unit: StepUnit, text: string): void => {
    const digits = text.replace(/\D/g, '')
    if (digits === '') {
      setTyping(null)
      return
    }
    const value = clampUnit(Number(digits), unit)
    const prev = draft[side]
    const time: TimeParts =
      unit === 'hour'
        ? { ...prev.time, hour: value }
        : unit === 'minute'
          ? { ...prev.time, minute: value }
          : { ...prev.time, second: value }
    setSide(side, { ...prev, time })
    setTyping(null)
  }

  const shiftMonth = (side: Side, delta: number): void => {
    setViews((v) => {
      const cur = v[side]
      const d = new Date(cur.year, cur.month - 1 + delta, 1)
      return side === 'end' ? { ...v, end: { year: d.getFullYear(), month: d.getMonth() + 1 } } : { ...v, start: { year: d.getFullYear(), month: d.getMonth() + 1 } }
    })
  }

  const focusDay = (side: Side, iso: string): void => {
    setFocus((f) => ({ ...f, [side]: iso }))
    const d = parseDateTime(`${iso}T00:00:00.000`)
    if (d !== null) setViews((v) => (side === 'end' ? { ...v, end: { year: d.year, month: d.month } } : { ...v, start: { year: d.year, month: d.month } }))
  }

  const onGridKeyDown = (side: Side, e: { key: string; preventDefault: () => void }): void => {
    const cells = buildMonthCells(views[side].year, views[side].month)
    const cur = focus[side] === null ? null : (cells.find((c) => c.iso === focus[side]) ?? null)
    const base = cur ?? cells.find((c) => c.inMonth) ?? cells[0]
    if (base === undefined) return
    const move = (days: number): void => {
      const d = new Date(base.year, base.month - 1, base.day + days)
      focusDay(
        side,
        `${String(d.getFullYear()).padStart(4, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`,
      )
    }
    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault()
        move(-1)
        return
      case 'ArrowRight':
        e.preventDefault()
        move(1)
        return
      case 'ArrowUp':
        e.preventDefault()
        move(-7)
        return
      case 'ArrowDown':
        e.preventDefault()
        move(7)
        return
      case 'PageUp':
        e.preventDefault()
        shiftMonth(side, -1)
        return
      case 'PageDown':
        e.preventDefault()
        shiftMonth(side, 1)
        return
      case 'Home': {
        e.preventDefault()
        const first = cells.find((c) => c.inMonth)
        if (first !== undefined) focusDay(side, first.iso)
        return
      }
      case 'End': {
        e.preventDefault()
        const last = [...cells].reverse().find((c) => c.inMonth)
        if (last !== undefined) focusDay(side, last.iso)
        return
      }
    }
  }

  const onPopKeyDown = (e: { key: string; preventDefault: () => void }): void => {
    if (e.key === 'Escape') {
      e.preventDefault()
      setOpen(false) // 取消语义：丢弃草稿，不提交
    }
  }

  // ── 触发器 ──
  // range = 一个整条（不是两个框）：两个日期区 + 中间样式画出来的灰隔条（左右两条竖边），
  // 视觉上把两个日期隔开；点整条都展开同一个浮层。
  const currentDraft = draftOf(current)
  const startValue = partsOf(currentDraft.start)
  const endValue = rangeMode ? partsOf(currentDraft.end) : null
  const dateZone = (key: string, value: DateTimeParts | null): ReturnType<typeof h> =>
    h(
      'span',
      { key, className: `dshpc-dt__pair-date${value === null ? ' dshpc-dt__pair-date--empty' : ''}` },
      value === null ? placeholder : fmtParts(value, precision),
    )
  const calIcon = h('span', { className: 'dshpc-dt__cal' }, ICON_CAL)
  const trigger = h(
    'button',
    {
      type: 'button',
      'aria-label': props.ariaLabel,
      'aria-expanded': open,
      ref: refs.setReference,
      disabled: props.disabled === true,
      className: `dshpc-dt__trigger ${SIZE_CLASS[size]} ${WIDTH_CLASS(rangeMode, precision)}`.trim(),
      onClick: openPop,
    },
    rangeMode
      ? h(
          'span',
          { key: 'group', className: 'dshpc-dt__pair-group' },
          dateZone('start', startValue),
          h('span', { key: 'sep', className: 'dshpc-dt__pair-sep', 'aria-hidden': true }, '-'),
          dateZone('end', endValue),
        )
      : h(
          'span',
          {
            key: 'label',
            className: `dshpc-dt__trigger-label${startValue === null ? ' dshpc-dt__trigger-label--empty' : ''}`,
          },
          startValue === null ? placeholder : fmtParts(startValue, precision),
        ),
    calIcon,
  )
  const triggerRow =
    props.hint === undefined
      ? trigger
      : h(
          'span',
          { className: 'dshpc-fieldwrap dshpc-fieldwrap--inline' },
          trigger,
          h(FieldHint, { text: props.hint }),
        )

  // ── 弹层 ──
  const endBox = (side: Side, label: string): ReturnType<typeof h> => {
    const p = partsOf(draft[side])
    return h(
      'button',
      {
        key: side,
        type: 'button',
        className: `dshpc-dt__end${active === side ? ' dshpc-dt__end--active' : ''}`,
        'aria-pressed': active === side,
        onClick: () => setActive(side),
      },
      h('span', { className: 'dshpc-dt__end-label' }, `${label}：`),
      h(
        'span',
        { className: `dshpc-dt__end-value${p === null ? ' dshpc-dt__end-value--empty' : ''}` },
        p === null ? placeholder : fmtParts(p, precision),
      ),
    )
  }

  /** 一块日历面板：导航 + 月历 + 时:分[:秒] 步进（该端自己的，互不影响）。 */
  const panel = (side: Side): ReturnType<typeof h> => {
    const view = views[side]
    const end = draft[side]
    const selIso = end.day === null ? null : dayIso(end.day)
    const cells = buildMonthCells(view.year, view.month)
    const today = nowParts()
    return h(
      'div',
      { className: 'dshpc-dt__panel', key: side },
      h(
        'div',
        { className: 'dshpc-dt__nav' },
        h(
          'div',
          { className: 'dshpc-dt__nav-group' },
          h(
            'button',
            { type: 'button', className: 'dshpc-dt__nav-btn', 'aria-label': tt('dtPrevYear'), onClick: () => shiftMonth(side, -12) },
            ICON_PREV_YEAR,
          ),
          h(
            'button',
            { type: 'button', className: 'dshpc-dt__nav-btn', 'aria-label': tt('dtPrevMonth'), onClick: () => shiftMonth(side, -1) },
            ICON_PREV_MONTH,
          ),
        ),
        h('span', { className: 'dshpc-dt__caption' }, monthCaption(view.year, view.month, locale)),
        h(
          'div',
          { className: 'dshpc-dt__nav-group' },
          h(
            'button',
            { type: 'button', className: 'dshpc-dt__nav-btn', 'aria-label': tt('dtNextMonth'), onClick: () => shiftMonth(side, 1) },
            ICON_NEXT_MONTH,
          ),
          h(
            'button',
            { type: 'button', className: 'dshpc-dt__nav-btn', 'aria-label': tt('dtNextYear'), onClick: () => shiftMonth(side, 12) },
            ICON_NEXT_YEAR,
          ),
        ),
      ),
      h(
        'div',
        {
          className: 'dshpc-dt__grid',
          role: 'grid',
          'aria-label': monthCaption(view.year, view.month, locale),
          ref: (el: HTMLDivElement | null): void => {
            gridRefs.current[side] = el
          },
          onKeyDown: (e: { key: string; preventDefault: () => void }) => onGridKeyDown(side, e),
        },
        ...weekdayLabels(locale).map((w) => h('span', { key: `wd-${w}`, className: 'dshpc-dt__wd', role: 'columnheader' }, w)),
        ...cells.map((c) =>
          h(
            'button',
            {
              key: c.iso,
              type: 'button',
              role: 'gridcell',
              className:
                'dshpc-dt__cell' +
                (c.inMonth ? '' : ' dshpc-dt__cell--out') +
                (selIso !== null && c.iso === selIso ? ' dshpc-dt__cell--sel' : '') +
                (c.year === today.year && c.month === today.month && c.day === today.day ? ' dshpc-dt__cell--today' : ''),
              'data-iso': c.iso,
              tabIndex: c.iso === focus[side] ? 0 : -1,
              'aria-label':
                locale === 'zh'
                  ? `${String(c.year)}年${String(c.month)}月${String(c.day)}日`
                  : `${weekdayLabels('en')[c.weekday]}, ${String(c.year)}-${String(c.month).padStart(2, '0')}-${String(c.day).padStart(2, '0')}`,
              'aria-selected': selIso !== null && c.iso === selIso,
              onClick: () => pickDay(side, c),
            },
            String(c.day),
          ),
        ),
      ),
      units.length === 0
        ? null
        : h(
            'div',
            { className: 'dshpc-dt__time' },
            ...units.flatMap((unit, i) => {
              const labelKey = UNIT_LABEL[unit]
              const value = end.time[unit]
              const shown =
                typing !== null && typing.side === side && typing.unit === unit
                  ? typing.text
                  : String(value).padStart(2, '0')
              return [
                i > 0 ? h('span', { key: `sep-${unit}`, className: 'dshpc-dt__sep' }, ':') : null,
                h(
                  'div',
                  { key: unit, className: 'dshpc-dt__unit' },
                  h('span', { className: 'dshpc-dt__unit-label' }, tt(labelKey)),
                  h(
                    'button',
                    {
                      type: 'button',
                      className: 'dshpc-dt__step-btn',
                      'aria-label': `${tt(labelKey)} +1`,
                      onClick: () => shiftUnit(side, unit, 1),
                    },
                    ICON_UP,
                  ),
                  h('input', {
                    className: 'dshpc-dt__step-val',
                    inputMode: 'numeric',
                    maxLength: 2,
                    value: shown,
                    onChange: (e: { target: { value: string } }) =>
                      setTyping({ side, unit, text: e.target.value.replace(/\D/g, '').slice(0, 2) }),
                    onBlur: (e: { target: { value: string } }) => commitTyping(side, unit, e.target.value),
                    onKeyDown: (e: { key: string; preventDefault: () => void }) => {
                      if (e.key === 'ArrowUp') {
                        e.preventDefault()
                        shiftUnit(side, unit, 1)
                      } else if (e.key === 'ArrowDown') {
                        e.preventDefault()
                        shiftUnit(side, unit, -1)
                      } else if (e.key === 'Enter') {
                        e.preventDefault()
                        commitTyping(side, unit, shown)
                      }
                    },
                  }),
                  h(
                    'button',
                    {
                      type: 'button',
                      className: 'dshpc-dt__step-btn',
                      'aria-label': `${tt(labelKey)} -1`,
                      onClick: () => shiftUnit(side, unit, -1),
                    },
                    ICON_DOWN,
                  ),
                ),
              ]
            }),
          ),
    )
  }

  const invalidRange =
    rangeMode &&
    partsOf(draft.start) !== null &&
    partsOf(draft.end) !== null &&
    !rangeIsValid(formatDateTimeIso(partsOf(draft.start)!), formatDateTimeIso(partsOf(draft.end)!))
  const canCommit = rangeMode
    ? partsOf(draft.start) !== null && partsOf(draft.end) !== null && !invalidRange
    : partsOf(draft.start) !== null

  const pop = h(
    'div',
    { className: 'dshpc-dt__pop', ref: refs.setFloating, style: floatingStyles, onKeyDown: onPopKeyDown },
    rangeMode
      ? h(
          'div',
          { className: 'dshpc-dt__ends' },
          endBox('start', tt('dtStart')),
          endBox('end', tt('dtEnd')),
        )
      : null,
    h(
      'div',
      { className: 'dshpc-dt__panels' },
      panel('start'),
      rangeMode ? panel('end') : null,
    ),
    h(
      'div',
      { className: 'dshpc-dt__foot' },
      h(
        'div',
        { className: 'dshpc-dt__foot-side' },
        h(Button, { variant: 'ghost', size: 'sm', onClick: applyNow }, precision === 'day' ? tt('dtToday') : tt('dtNow')),
        h(Button, { variant: 'ghost', size: 'sm', onClick: clear }, tt('dtClear')),
      ),
      h(
        'div',
        { className: 'dshpc-dt__foot-side' },
        invalidRange ? h('span', { className: 'dshpc-dt__warn' }, tt('dtInvalidRange')) : null,
        h(Button, { variant: 'outline', size: 'sm', onClick: () => setOpen(false) }, tt('cancel')),
        h(Button, { variant: 'primary', size: 'sm', disabled: !canCommit, onClick: commit }, tt('confirm')),
      ),
    ),
  )

  return h(
    'div',
    {
      className: `dshpc-dt${props.className === undefined ? '' : ` ${props.className}`}`,
      ref: rootRef,
    },
    triggerRow,
    open ? h(FloatingPortal, null, pop) : null,
  )
}
