import { createElement as h, type CSSProperties, type ReactNode } from 'react'
import { t, type Translate } from '../utils/i18n.js'
import { ensureComponentStyles } from './css.js'
import { PAGINATION_CSS } from './controls-css.js'
import { Picker } from './Picker.js'
import { Button } from './Button.js'
import { Chevron } from './chevron.js'
import {
  clampPage,
  pageCountOf,
  pageItems,
  pageRange,
  type PageTotalRenderer,
  type PaginationAlign,
} from './pagination-logic.js'

/**
 * 分页控件 props。
 *
 * 只收「当前页 / 每页条数 / 总条数」三件事，总页数与省略窗口由控件算 —— 消费方不自己算页数、
 * 也不自己渲染页码（这是通行分页组件的共同约定，见 docs/help/ui）。
 */
export interface PaginationProps {
  /** 当前页（1 起）；越界会被夹回 `[1, 总页数]`。 */
  page: number
  /** 总条数（不是总页数）。 */
  total: number
  /** 每页条数，默认 10。 */
  pageSize?: number
  /** 切页 / 切每页条数时触发；切换每页条数时页码一并回到第 1 页（与 antd / MUI 同口径）。 */
  onChange: (page: number, pageSize: number) => void
  /** 页码条对齐，默认 right。 */
  align?: PaginationAlign
  /** 当前页两侧各留几页，默认 1。 */
  siblingCount?: number
  /** 首尾各固定几页，默认 1。 */
  boundaryCount?: number
  /** 传了才出现「每页条数」下拉（如 `[10, 20, 50]`）。 */
  pageSizeOptions?: readonly number[]
  /** 总数文案：`true` 走内置字典，也可给函数自定义（收到总条数、起始行、结束行）。 */
  showTotal?: boolean | PageTotalRenderer
  /** 只有一页时整条不渲染。 */
  hideOnSinglePage?: boolean
  /** 简洁模式：只留 `‹ 2 / 36 ›`，不铺页码。 */
  simple?: boolean
  /** 整条禁用。 */
  disabled?: boolean
  /** 无障碍名，默认走内置字典「分页」。 */
  ariaLabel?: string
  /** 覆盖内置文案翻译（插件自带 i18n 时用）。 */
  translate?: Translate
  className?: string
  style?: CSSProperties
}

/**
 * Table 内建分页的配置：与 {@link PaginationProps} 同参数，只把 `total` 放宽为可选。
 *
 * 语义分叉就在 `total` 上：**不传 = 本地分页**（`rows` 是全量，Table 按当前页切片，
 * 总条数取 `rows.length`）；**传了 = 服务端分页**（`rows` 已是当前页的数据，Table 不再切片，
 * 总条数按传入值算页数）。两种用法都不会让调用方自己算页数。
 */
export interface TablePaginationConfig extends Omit<PaginationProps, 'total'> {
  total?: number
}

/**
 * 分页（`‹ Previous  1 [2] 3 … 36  Next ›`）。
 *
 * 受控组件：页码由调用方持有，这里只发 `onChange(page, pageSize)`。
 * 样式只 import 自己那份 CSS（`PAGINATION_CSS`），引它就只打包这一份。
 */
export function Pagination(props: PaginationProps): ReactNode {
  ensureComponentStyles('pagination', PAGINATION_CSS)
  const tt = props.translate ?? t
  const pageSize = Math.max(1, Math.floor(props.pageSize ?? 10))
  const total = Math.max(0, Math.floor(props.total))
  const count = pageCountOf(total, pageSize)
  const page = clampPage(props.page, count)

  if (props.hideOnSinglePage === true && count <= 1) return null

  const disabled = props.disabled === true
  const [from, to] = pageRange(page, pageSize, total)

  const go = (next: number): void => {
    if (disabled) return
    const target = clampPage(next, count)
    if (target !== page) props.onChange(target, pageSize)
  }

  const navClass = [
    'dshpc-pagination',
    `dshpc-pagination--${props.align ?? 'right'}`,
    props.simple === true ? 'dshpc-pagination--simple' : '',
    props.className ?? '',
  ]
    .filter((s) => s !== '')
    .join(' ')

  const totalNode = ((): ReactNode => {
    const showTotal = props.showTotal
    if (showTotal === undefined || showTotal === false) return null
    if (typeof showTotal === 'function') return showTotal(total, from, to)
    return total === 0
      ? tt('paginationTotalZero')
      : tt('paginationTotal', { from, to, total })
  })()

  // 页码 / 上下页一律用核心 Button（ghost 档；当前页用 info = business 实心蓝），
  // 箭头用全站唯一的 Chevron —— 不在分页里另写一套按钮外观与字形箭头。
  const pageButton = (n: number): ReturnType<typeof h> =>
    h(
      Button,
      {
        key: n,
        variant: n === page ? 'info' : 'ghost',
        size: 'md',
        className: 'dshpc-pagination__page',
        'aria-current': n === page ? 'page' : undefined,
        'aria-label': tt('paginationPage', { n }),
        disabled,
        onClick: () => go(n),
      },
      n,
    )

  const navButton = (direction: 'prev' | 'next'): ReturnType<typeof h> => {
    const isPrev = direction === 'prev'
    const label = isPrev ? tt('paginationPrev') : tt('paginationNext')
    return h(
      Button,
      {
        variant: 'ghost',
        size: 'md',
        className: 'dshpc-pagination__nav',
        icon: isPrev ? h(Chevron, { dir: 'left', size: 14 }) : undefined,
        iconRight: isPrev ? undefined : h(Chevron, { dir: 'right', size: 14 }),
        'aria-label': label,
        disabled: disabled || (isPrev ? page <= 1 : page >= count),
        onClick: () => go(isPrev ? page - 1 : page + 1),
      },
      h('span', { className: 'dshpc-pagination__text' }, label),
    )
  }

  const middle: ReactNode[] =
    props.simple === true
      ? [h('span', { key: 'simple', className: 'dshpc-pagination__simple' }, `${String(page)} / ${String(count)}`)]
      : pageItems(page, count, props.siblingCount, props.boundaryCount).map((item, index) =>
          item === 'gap'
            ? h(
                'span',
                { key: `gap-${String(index)}`, className: 'dshpc-pagination__ellipsis', 'aria-hidden': 'true' },
                '…',
              )
            : pageButton(item),
        )

  // 每页条数下拉不再手搓原生 select（浏览器默认箭头与全站 Chevron 不一致）——直接用核心 Picker。
  const options = props.pageSizeOptions ?? []
  const sizeNode =
    options.length === 0
      ? null
      : h(Picker, {
          className: 'dshpc-pagination__size',
          minWidth: 'auto',
          mode: 'single',
          options: options.map((size) => ({
            value: String(size),
            label: tt('paginationPageSizeOption', { n: size }),
          })),
          value: String(pageSize),
          disabled,
          ariaLabel: tt('paginationPageSizeAria'),
          onChange: (value: string | string[]) => {
            const next = Number(value)
            if (!Number.isFinite(next) || next < 1) return
            props.onChange(1, next)
          },
        })

  return h(
    'nav',
    {
      className: navClass,
      style: props.style,
      'aria-label': props.ariaLabel ?? tt('paginationAria'),
    },
    totalNode === null ? null : h('span', { className: 'dshpc-pagination__total' }, totalNode),
    h('div', { className: 'dshpc-pagination__pages' }, navButton('prev'), ...middle, navButton('next')),
    sizeNode,
  )
}
