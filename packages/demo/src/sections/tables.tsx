import { createElement as h, useState } from 'react'
import { IconChevronDownOutlineRegular } from '@deepseek-ai/dsh-client-ui-primitives'
import {
  Checkbox,
  Chip,
  IconButton,
  Pagination,
  Segmented,
  Table,
  type TableColumn,
  type TableGroup,
  type TableRow,
} from '../../../../dist/ui/index.js'
import { DocApi, DocCode, DocProse, Example } from '../doc.js'
import { t } from '../i18n.js'

/**
 * 主表示例（外观一：带全框）：把「列级配置」全摆出来 —— 多色表头、全框 + 列间竖线、
 * 居中 / 右对齐、头像 + 姓名 + 编号的多内容单元格、斑马纹、可点选中。
 * Age 列不给 divider ⇒ 演示「这两列之间不要线」。
 */
const COLUMNS: TableColumn[] = [
  { key: 'id', title: 'Patient ID', width: 120 },
  {
    key: 'patient',
    title: 'Patient',
    headerTone: 'business',
    children: [
      // 默认水平内距 12px；这一列显式收到 8px，演示列级 padding
      { key: 'name', title: 'Name', width: 210, padding: 8, divider: true },
      // divider 不给 ⇒ Age 与 Name 之间不画竖线（「这几列之间不要线」）
      { key: 'age', title: 'Age / Sex', width: 100, align: 'center', divider: false },
    ],
  },
  {
    key: 'study',
    title: 'Latest study',
    children: [
      { key: 'date', title: 'Date', width: 110, divider: true },
      // 标签类内容：列级 padding 收窄，标签本身贴得紧一点（space-2 = 8px）
      { key: 'modality', title: 'Modality', width: 96, align: 'center', padding: 8, divider: true },
    ],
  },
  { key: 'flags', title: 'Flags', width: 132, padding: 8, divider: true },
  { key: 'status', title: 'Status', width: 120, headerTone: 'success', divider: true },
  { key: 'actions', title: '', width: 72, align: 'right', divider: true },
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
  { key: 'metric', title: 'Metric', width: 148, divider: true },
  { key: 'q1', title: 'Q1', width: 88, align: 'center', divider: true },
  { key: 'q2', title: 'Q2', width: 88, align: 'center', divider: true },
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

/**
 * 通栏分组示例：一个表格里并排展示多个工作区的任务。
 * 每组自带一行横跨全部列的通栏标题 + 自己的表头 + 自己的任务行，多组垂直连续排布。
 */
const GROUP_COLUMNS: TableColumn[] = [
  { key: 'task', title: 'Task', width: 280 },
  { key: 'owner', title: 'Owner', width: 140 },
  { key: 'state', title: 'Status', width: 120, align: 'center' },
  { key: 'updated', title: 'Updated', width: 120, align: 'right' },
]

type Task = {
  key: string
  title: string
  owner: string
  state: string
  tone: 'success' | 'warning' | 'danger'
  updated: string
}

const WORKSPACES: readonly { key: string; title: string; tasks: readonly Task[] }[] = [
  {
    key: 'ws-core',
    title: 'Workspace A · dsh-plugin-core',
    tasks: [
      { key: 'a1', title: 'Table skin plain', owner: 'Chen, Wei', state: 'Done', tone: 'success', updated: '2026-10-30' },
      { key: 'a2', title: 'Grouped banner rows', owner: 'Liu, Yan', state: 'Doing', tone: 'warning', updated: '2026-10-30' },
      { key: 'a3', title: 'Token contrast audit', owner: 'Ma, Rui', state: 'Blocked', tone: 'danger', updated: '2026-10-29' },
    ],
  },
  {
    key: 'ws-demo',
    title: 'Workspace B · demo preview',
    tasks: [
      { key: 'b1', title: 'Table section copy', owner: 'Sun, Li', state: 'Done', tone: 'success', updated: '2026-10-29' },
      { key: 'b2', title: 'Sidebar entry setting', owner: 'Wu, Hao', state: 'Doing', tone: 'warning', updated: '2026-10-28' },
    ],
  },
]

const GROUPS: TableGroup[] = WORKSPACES.map((workspace) => ({
  key: workspace.key,
  title: workspace.title,
  rows: workspace.tasks.map((task) => ({
    key: task.key,
    cells: {
      task: task.title,
      owner: task.owner,
      state: h(Chip, { tone: task.tone, size: 'xs' }, task.state),
      updated: task.updated,
    },
  })),
}))

export function TablePage(): ReturnType<typeof h> {
  /** null = 当前没有选中行；再点一次已选中的行就是取消（由调用方决定 toggle 语义）。 */
  const [selected, setSelected] = useState<string | number | null>('S-2418')
  // 第二 / 第三个表也演示行态：选中与可点由调用方给，不给就是静态表（这里三张表都开着）。
  const [spanSelected, setSpanSelected] = useState<string | number | null>('c')
  const [groupSelected, setGroupSelected] = useState<string | number | null>('a2')
  // 通栏标题前竖线：颜色（内置色名 / 直接色值）与开关
  const [groupAccentOn, setGroupAccentOn] = useState(true)
  const [groupAccent, setGroupAccent] = useState<'default' | 'business' | 'success' | '#7c3aed'>('default')
  // 分页：独立控件与 Table 内建各一份 state（页码 / 每页条数都归调用方持有）。
  const [pagerPage, setPagerPage] = useState(1)
  const [pagerSize, setPagerSize] = useState(10)
  const [demoPage, setDemoPage] = useState(2)
  const [demoSize, setDemoSize] = useState(10)
  const [demoAlign, setDemoAlign] = useState<'left' | 'center' | 'right'>('right')
  // 总数文案（「第 1-10 条，共 86 条」）的开关：showTotal 默认关，示例里两个分页共用这一个开关
  const [demoShowTotal, setDemoShowTotal] = useState(true)
  const pagerOnChange = (page: number, size: number): void => {
    setPagerPage(page)
    setPagerSize(size)
  }
  const demoOnChange = (page: number, size: number): void => {
    setDemoPage(page)
    setDemoSize(size)
  }
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
          borders: 'all',
          selectedKeys: selected === null ? [] : [selected],
          // 再点一次已选中的行 = 取消选中
          onRowClick: (row) => setSelected((prev) => (prev === row.key ? null : row.key)),
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
          borders: 'all',
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
          selectedKeys: spanSelected === null ? [] : [spanSelected],
          onRowClick: (row) => setSpanSelected((prev) => (prev === row.key ? null : row.key)),
          ariaLabel: 'Enrollment by site',
          style: { maxWidth: '560px' },
        }),
      ),
    ),
    h(
      Example,
      { title: 'Groups · 通栏', hint: t('tableGroupHint') },
      h(
        'div',
        { style: { display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' } },
        h(Segmented<'default' | 'business' | 'success' | '#7c3aed'>, {
          size: 'sm',
          items: [
            { value: 'default', label: '默认' },
            { value: 'business', label: 'business' },
            { value: 'success', label: 'success' },
            { value: '#7c3aed', label: '#7c3aed' },
          ],
          value: groupAccent,
          onChange: setGroupAccent,
        }),
        h(Checkbox, { checked: groupAccentOn, onChange: setGroupAccentOn, label: 'groupAccent' }),
      ),
      h(
        'div',
        { style: { overflowX: 'auto', marginTop: '12px' } },
        h(Table, {
          columns: GROUP_COLUMNS,
          groups: GROUPS,
          groupAccent: groupAccentOn ? groupAccent : false,
          selectedKeys: groupSelected === null ? [] : [groupSelected],
          onRowClick: (row) => setGroupSelected((prev) => (prev === row.key ? null : row.key)),
          ariaLabel: 'Tasks by workspace',
          style: { minWidth: 660 },
        }),
      ),
    ),
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
          value: demoAlign,
          onChange: setDemoAlign,
        }),
        h(Checkbox, { checked: demoShowTotal, onChange: setDemoShowTotal, label: 'showTotal' }),
      ),
      h(
        'div',
        { style: { marginTop: '12px' } },
        h(Pagination, {
          page: demoPage,
          pageSize: demoSize,
          total: 86,
          align: demoAlign,
          pageSizeOptions: [10, 20, 50],
          showTotal: demoShowTotal,
          hideOnSinglePage: true,
          onChange: demoOnChange,
          ariaLabel: 'Demo pagination',
        }),
      ),
      h(
        'div',
        { style: { marginTop: '12px' } },
        h(Pagination, {
          page: demoPage,
          pageSize: demoSize,
          total: 86,
          align: demoAlign,
          simple: true,
          onChange: demoOnChange,
          ariaLabel: 'Demo pagination (simple)',
        }),
      ),
    ),
    h(
      Example,
      { title: 'Table · 分页', hint: t('tablePagerHint') },
      h(
        'div',
        { style: { overflowX: 'auto' } },
        h(Table, {
          columns: COLUMNS,
          // 不传 pagination.total ⇒ 本地分页：这里是全量 12 行，Table 自己按当前页切片
          rows: rowsOf(),
          borders: 'all',
          pagination: {
            page: pagerPage,
            pageSize: pagerSize,
            onChange: pagerOnChange,
            pageSizeOptions: [5, 10, 20],
            showTotal: demoShowTotal,
          },
          ariaLabel: 'Paginated surveillance studies',
          style: { minWidth: 960 },
        }),
      ),
    ),
    h(DocApi, { id: 'table' }),
    h(DocCode, { id: 'table' }),
  )
}
