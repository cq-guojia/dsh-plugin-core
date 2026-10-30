import { createElement as h, useState } from 'react'
import { IconChevronDownOutlineRegular } from '@deepseek-ai/dsh-client-ui-primitives'
import { Chip, IconButton, Table, type TableColumn, type TableRow } from '../../../../dist/ui/index.js'
import { DocApi, DocCode, DocProse, Example } from '../doc.js'
import { t } from '../i18n.js'

/**
 * 主表示例：把「列级配置」全摆出来 —— 多色表头、无竖线列、居中 / 右对齐、
 * 头像 + 姓名 + 编号的多内容单元格、斑马纹、可点选中。
 * 「左边线缺一条」的旧问题已经由按列 data-divider 修掉，这里专门关掉 Age 列的 divider
 * 来演示「这几列之间不要线」。
 */
const COLUMNS: TableColumn[] = [
  { key: 'id', title: 'Patient ID', width: 120 },
  {
    key: 'patient',
    title: 'Patient',
    headerTone: 'business',
    children: [
      // 默认水平内距 12px；这一列显式收到 8px，演示列级 padding
      { key: 'name', title: 'Name', width: 210, padding: 8 },
      // divider:false ⇒ Age 与 Name 之间不画竖线（「贯穿」感就是这么来的）
      { key: 'age', title: 'Age / Sex', width: 100, align: 'center', divider: false },
    ],
  },
  {
    key: 'study',
    title: 'Latest study',
    children: [
      { key: 'date', title: 'Date', width: 110 },
      // 标签类内容：列级 padding 收窄，标签本身贴得紧一点（space-2 = 8px）
      { key: 'modality', title: 'Modality', width: 96, align: 'center', padding: 8 },
    ],
  },
  { key: 'flags', title: 'Flags', width: 132, padding: 8 },
  { key: 'status', title: 'Status', width: 120, headerTone: 'success' },
  { key: 'actions', title: '', width: 72, align: 'right' },
]

type Modality = 'CT' | 'MR' | 'US' | 'XR'

/** 模态 → 标签色（全部是 Chip 自带的语义色档，不写死 hex）。 */
const MODALITY_TONE = { CT: 'business', MR: 'purple', US: 'teal', XR: 'orange' } as const

type Person = {
  id: string
  name: string
  mrn: string
  age: string
  date: string
  modality: Modality
  flags: readonly string[]
  tone: 'success' | 'warning' | 'danger'
  state: string
}

const PEOPLE: readonly Person[] = [
  { id: 'S-2418', name: 'Chen, Wei', mrn: 'MRN-88214', age: '62 / M', date: '2026-10-24', modality: 'CT', flags: ['STAT'], tone: 'success', state: 'Reviewed' },
  { id: 'S-2419', name: 'Liu, Yan', mrn: 'MRN-77320', age: '47 / F', date: '2026-10-24', modality: 'MR', flags: ['Critical'], tone: 'warning', state: 'Pending' },
  { id: 'S-2420', name: 'Zhao, Ming', mrn: 'MRN-90118', age: '35 / M', date: '2026-10-23', modality: 'US', flags: [], tone: 'danger', state: 'Escalated' },
  { id: 'S-2421', name: 'Sun, Li', mrn: 'MRN-65402', age: '58 / F', date: '2026-10-23', modality: 'CT', flags: ['Repeat'], tone: 'success', state: 'Reviewed' },
  { id: 'S-2422', name: 'Wu, Hao', mrn: 'MRN-43961', age: '41 / M', date: '2026-10-22', modality: 'MR', flags: ['STAT', 'Critical'], tone: 'warning', state: 'Pending' },
  { id: 'S-2423', name: 'Xu, Jing', mrn: 'MRN-11288', age: '29 / F', date: '2026-10-22', modality: 'XR', flags: [], tone: 'success', state: 'Reviewed' },
  { id: 'S-2424', name: 'Ma, Rui', mrn: 'MRN-52874', age: '67 / M', date: '2026-10-21', modality: 'CT', flags: ['Critical'], tone: 'danger', state: 'Escalated' },
  { id: 'S-2425', name: 'Guo, Fang', mrn: 'MRN-33509', age: '52 / F', date: '2026-10-21', modality: 'US', flags: ['STAT'], tone: 'success', state: 'Reviewed' },
  { id: 'S-2426', name: 'He, Jun', mrn: 'MRN-77130', age: '44 / M', date: '2026-10-20', modality: 'MR', flags: [], tone: 'warning', state: 'Pending' },
  { id: 'S-2427', name: 'Lin, Xue', mrn: 'MRN-20457', age: '38 / F', date: '2026-10-20', modality: 'CT', flags: ['Repeat'], tone: 'success', state: 'Reviewed' },
  { id: 'S-2428', name: 'Tang, Bo', mrn: 'MRN-99013', age: '61 / M', date: '2026-10-19', modality: 'XR', flags: ['STAT'], tone: 'warning', state: 'Pending' },
  { id: 'S-2429', name: 'Deng, Qian', mrn: 'MRN-61248', age: '33 / F', date: '2026-10-19', modality: 'US', flags: [], tone: 'success', state: 'Reviewed' },
]

/** 头像 + 姓名 + 编号：单元格内容就是任意 ReactNode，排版由调用方决定（组件不内置业务样式）。 */
function personCell(person: Person): ReturnType<typeof h> {
  return h(
    'div',
    { style: { display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 } },
    h(
      'div',
      {
        style: {
          width: '28px',
          height: '28px',
          borderRadius: '50%',
          flex: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--dshpc-surface-sunken)',
          color: 'var(--dshpc-fg-2)',
          fontSize: 'var(--dshpc-font-sm)',
          fontWeight: 600,
        },
      },
      person.name.slice(0, 1),
    ),
    h(
      'div',
      { style: { display: 'flex', flexDirection: 'column', minWidth: 0 } },
      h('span', null, person.name),
      h(
        'span',
        { style: { fontSize: 'var(--dshpc-font-xs)', color: 'var(--dshpc-fg-3)' } },
        person.mrn,
      ),
    ),
  )
}

function rowsOf(): TableRow[] {
  const actions = h(IconButton, {
    icon: h(IconChevronDownOutlineRegular, { size: 16 }),
    label: 'Open study',
  })
  return PEOPLE.map((person) => ({
    key: person.id,
    cells: {
      id: person.id,
      name: personCell(person),
      age: person.age,
      date: person.date,
      modality: h(Chip, { tone: MODALITY_TONE[person.modality], size: 'xs' }, person.modality),
      // 多标签：标签之间的间距由调用方布局控制（这里 4px），列内距走列级 padding:8
      flags:
        person.flags.length === 0
          ? null
          : h(
              'div',
              { style: { display: 'flex', gap: '4px', flexWrap: 'wrap' } },
              ...person.flags.map((flag) =>
                h(
                  Chip,
                  {
                    key: flag,
                    size: 'xs',
                    tone: flag === 'Critical' ? 'danger' : flag === 'STAT' ? 'warning' : 'neutral',
                  },
                  flag,
                ),
              ),
            ),
      status: h(Chip, { tone: person.tone, size: 'xs' }, person.state),
      actions,
    },
  }))
}

/**
 * 第二表示例：密度 / 外框 / 跨列 / 跨行。
 * 跨行靠「下一行不给该列 key」让位；跨列用单元格对象 { content, colSpan }。
 */
const SPAN_COLUMNS: TableColumn[] = [
  { key: 'site', title: 'Site', width: 132 },
  { key: 'metric', title: 'Metric', width: 148 },
  { key: 'q1', title: 'Q1', width: 88, align: 'center' },
  { key: 'q2', title: 'Q2', width: 88, align: 'center' },
]

const SPAN_ROWS: TableRow[] = [
  {
    key: 'a',
    cells: {
      site: { content: 'Downtown', rowSpan: 2 },
      metric: 'Enrollment',
      q1: '1,204',
      q2: '1,388',
    },
  },
  // 不给 site：上一行的 rowSpan 已经占住这一格
  { key: 'b', cells: { metric: 'Screen failures', q1: '96', q2: '112' } },
  {
    key: 'c',
    cells: {
      site: { content: 'North clinic', colSpan: 2 },
      q1: '—',
      q2: '—',
    },
  },
]

export function TablePage(): ReturnType<typeof h> {
  const [selected, setSelected] = useState<string | number>('S-2418')
  return h(
    'div',
    null,
    h(DocProse, { id: 'table' }),
    // 表格较宽：示例区占满整栏（代码放页面底部），并在窄屏时横向滚动。
    // 空态不放成第二个示例 —— 直接接在主表下方，同一区块里展示「有数据 / 没数据」。
    h(
      Example,
      { title: 'Table', hint: t('tableHint') },
      h(
        'div',
        { style: { overflowX: 'auto' } },
        h(Table, {
          columns: COLUMNS,
          rows: rowsOf(),
          striped: true,
          selectedKeys: [selected],
          onRowClick: (row) => setSelected(row.key),
          ariaLabel: 'Surveillance studies',
          style: { minWidth: 960 },
        }),
      ),
      h(
        'div',
        { style: { overflowX: 'auto', marginTop: '16px' } },
        h(Table, {
          columns: COLUMNS,
          rows: [],
          ariaLabel: 'Surveillance studies (empty)',
          style: { minWidth: 960 },
        }),
      ),
    ),
    h(
      Example,
      { title: 'Density · borders · spans', hint: t('tableSpanHint') },
      h(
        'div',
        { style: { overflowX: 'auto' } },
        h(Table, {
          columns: SPAN_COLUMNS,
          rows: SPAN_ROWS,
          density: 'compact',
          borders: 'y',
          ariaLabel: 'Enrollment by site',
          style: { maxWidth: '560px' },
        }),
      ),
    ),
    h(DocApi, { id: 'table' }),
    h(DocCode, { id: 'table' }),
  )
}
