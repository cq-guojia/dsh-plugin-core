import { createElement as h, useState } from 'react'
import { Checkbox, Pagination, Segmented } from '../../../../dist/ui/index.js'
import { Example } from '../doc.js'
import { t } from '../i18n.js'

/** 导航 · 分页：独立控件（Table 内建分页留在表格页）。 */
export function PaginationPage(): ReturnType<typeof h> {
  const [page, setPage] = useState(2)
  const [size, setSize] = useState(10)
  const [align, setAlign] = useState<'left' | 'center' | 'right'>('right')
  const [showTotal, setShowTotal] = useState(true)
  const onChange = (nextPage: number, nextSize: number): void => {
    setPage(nextPage)
    setSize(nextSize)
  }
  return h(
    'div',
    null,
    h(
      Example,
      { title: 'Pagination', hint: t('paginationHint') },
      h(
        'div',
        { style: { display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' } },
        h(Segmented<'left' | 'center' | 'right'>, {
          size: 'sm',
          items: [
            { value: 'left', label: '左' },
            { value: 'center', label: '中' },
            { value: 'right', label: '右' },
          ],
          value: align,
          onChange: setAlign,
        }),
        h(Checkbox, { checked: showTotal, onChange: setShowTotal, label: 'showTotal' }),
      ),
      h(
        'div',
        { style: { marginTop: '12px' } },
        h(Pagination, {
          page,
          pageSize: size,
          total: 86,
          align,
          pageSizeOptions: [10, 20, 50],
          showTotal,
          hideOnSinglePage: true,
          onChange,
          ariaLabel: 'Demo pagination',
        }),
      ),
      h(
        'div',
        { style: { marginTop: '12px' } },
        h(Pagination, {
          page,
          pageSize: size,
          total: 86,
          align,
          simple: true,
          onChange,
          ariaLabel: 'Demo pagination (simple)',
        }),
      ),
    ),
  )
}
