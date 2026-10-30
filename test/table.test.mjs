// 表格表头分组的纯逻辑自检：分组表头的 colSpan / rowSpan 算错，
// 浏览器不会报错，只会画出一张错位的表 —— 必须由测试盯住。
import test from 'node:test'
import assert from 'node:assert/strict'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { headerRows, isTableCellSpec, leafColumns, tableDepth } from '../dist/ui/table-logic.js'
import { Table } from '../dist/ui/index.js'

const flat = [
  { key: 'id', title: 'ID' },
  { key: 'name', title: 'Name' },
  { key: 'status', title: 'Status' },
]

test('扁平列：一行表头，每格竖跨整张表头', () => {
  const rows = headerRows(flat)
  assert.equal(rows.length, 1)
  assert.deepEqual(
    rows[0].map((c) => [c.column.key, c.colSpan, c.rowSpan]),
    [['id', 1, 1], ['name', 1, 1], ['status', 1, 1]],
  )
})

test('两层分组：分组跨列、叶子竖跨两行', () => {
  const columns = [
    { key: 'id', title: 'ID' },
    {
      key: 'patient',
      title: 'Patient',
      children: [
        { key: 'name', title: 'Name' },
        { key: 'age', title: 'Age / Sex' },
      ],
    },
    { key: 'status', title: 'Status' },
  ]
  const rows = headerRows(columns)
  assert.equal(rows.length, 2)
  assert.deepEqual(
    rows[0].map((c) => [c.column.key, c.colSpan, c.rowSpan]),
    [['id', 1, 2], ['patient', 2, 1], ['status', 1, 2]],
  )
  assert.deepEqual(
    rows[1].map((c) => [c.column.key, c.colSpan, c.rowSpan]),
    [['name', 1, 1], ['age', 1, 1]],
  )
  // 分组表头覆盖的叶子必须与叶子列顺序一致
  assert.deepEqual(rows[0][1].leafKeys, ['name', 'age'])
})

test('三层分组：表头行数 = 列树深度，分组逐层展开', () => {
  const columns = [
    {
      key: 'study',
      title: 'Study',
      children: [
        { key: 'date', title: 'Date' },
        {
          key: 'read',
          title: 'Reading',
          children: [
            { key: 'modality', title: 'Modality' },
            { key: 'body', title: 'Body part' },
          ],
        },
      ],
    },
    { key: 'status', title: 'Status' },
  ]
  const rows = headerRows(columns)
  assert.equal(rows.length, 3)
  assert.deepEqual(
    rows[0].map((c) => [c.column.key, c.colSpan, c.rowSpan]),
    [['study', 3, 1], ['status', 1, 3]],
  )
  assert.deepEqual(
    rows[1].map((c) => [c.column.key, c.colSpan, c.rowSpan]),
    [['date', 1, 2], ['read', 2, 1]],
  )
  assert.deepEqual(
    rows[2].map((c) => [c.column.key, c.colSpan, c.rowSpan]),
    [['modality', 1, 1], ['body', 1, 1]],
  )
})

test('叶子列按深度优先顺序展开（= 数据格顺序）', () => {
  const columns = [
    { key: 'id', title: 'ID' },
    { key: 'group', title: 'Group', children: [{ key: 'a', title: 'A' }, { key: 'b', title: 'B' }] },
    { key: 'tail', title: 'Tail' },
  ]
  assert.deepEqual(
    leafColumns(columns).map((c) => c.key),
    ['id', 'a', 'b', 'tail'],
  )
})

test('列树深度与表头行数一致', () => {
  assert.equal(tableDepth(flat), 1)
  assert.equal(
    tableDepth([{ key: 'g', title: 'G', children: [{ key: 'x', title: 'X' }] }]),
    2,
  )
})

// 跨行（rowSpan）把几行连成一个视觉块：块里任意一行被选中，整块都该是选中态，
// 不能只高亮跨行格所在的那一行（那样跨行格下半截会留在「未选中」的底色上）。
test('跨行选中：块内任意一行被选中，整块行都标记选中', () => {
  const columns = [
    { key: 'site', title: 'Site' },
    { key: 'metric', title: 'Metric' },
  ]
  const rows = [
    { key: 'a', cells: { site: { content: 'Downtown', rowSpan: 2 }, metric: 'Enrollment' } },
    { key: 'b', cells: { metric: 'Screen failures' } },
    { key: 'c', cells: { site: 'North clinic', metric: '—' } },
  ]
  const renderWith = (selectedKeys) =>
    renderToStaticMarkup(createElement(Table, { columns, rows, selectedKeys, onRowClick: () => {} }))
  const selectedCount = (html) => (html.match(/data-selected="true"/g) ?? []).length
  // 选中块的第一行 / 块内第二行，都是整块 2 行选中
  assert.equal(selectedCount(renderWith(['a'])), 2)
  assert.equal(selectedCount(renderWith(['b'])), 2)
  // 块外的行只选中它自己
  assert.equal(selectedCount(renderWith(['c'])), 1)
})

// 单元格既可以给任意 ReactNode，也可以给 { content, colSpan, rowSpan } 对象。
// 判别必须把「React 元素」和「配置对象」分开 —— 否则一个普通元素会被当成配置、
// content 取成 undefined，格子里就空了。React 元素靠 $$typeof 识别，这条钉住它。
test('单元格对象判别：React 元素不算配置对象', () => {
  assert.equal(isTableCellSpec({ content: 'x' }), true)
  assert.equal(isTableCellSpec({ content: 'x', colSpan: 2, rowSpan: 3, align: 'center' }), true)
  assert.equal(isTableCellSpec('x'), false)
  assert.equal(isTableCellSpec(42), false)
  assert.equal(isTableCellSpec(null), false)
  assert.equal(
    isTableCellSpec({ $$typeof: Symbol('react.element'), type: 'span', props: { content: 'x' } }),
    false,
  )
})

// 通栏标题前的固定标签（短竖线）：由 SectionHead 绘制（4px 圆头），默认画、颜色可换
// （内置色名 / 直接色值）、也能整条关掉。
const groupedTable = (extra = {}) => createElement(Table, {
  columns: [{ key: 'task', title: 'Task' }],
  groups: [{ key: 'g1', title: 'Workspace A', rows: [{ key: 'r1', cells: { task: 'x' } }] }],
  ...extra,
})

test('通栏固定标签：默认画一条，颜色交给主题 token', () => {
  const html = renderToStaticMarkup(groupedTable())
  assert.match(html, /class="dshpc-section-head__bar"/)
  assert.doesNotMatch(html, /section-head__bar"[^>]*style=/)
})

test('通栏固定标签：内置色名映射到对应 token', () => {
  const html = renderToStaticMarkup(groupedTable({ groupAccent: 'success' }))
  assert.match(html, /style="background:var\(--dshpc-success\)"/)
})

test('通栏固定标签：直接给色值原样落地', () => {
  const html = renderToStaticMarkup(groupedTable({ groupAccent: '#7c3aed' }))
  assert.match(html, /#7c3aed/)
})

test('通栏固定标签：groupAccent:false 整条不画；非分组表本来就没有', () => {
  assert.doesNotMatch(renderToStaticMarkup(groupedTable({ groupAccent: false })), /section-head__bar/)
  assert.doesNotMatch(
    renderToStaticMarkup(createElement(Table, {
      columns: [{ key: 'task', title: 'Task' }],
      rows: [{ key: 'r1', cells: { task: 'x' } }],
      groupAccent: 'success',
    })),
    /section-head__bar/,
  )
})

// 加载态：整表 loading（无数据时的高占位）/ 底部加载更多（一行中号图标）/ 到底文案。
const oneColumn = [{ key: 'task', title: 'Task' }]
const oneRow = [{ key: 'r1', cells: { task: 'x' } }]

test('整表 loading：没数据时渲染高占位行（最大号三块动画、无可见文案），空态被替代', () => {
  const html = renderToStaticMarkup(createElement(Table, { columns: oneColumn, rows: [], loading: true }))
  assert.match(html, /dshpc-table__state--full/)
  assert.match(html, /dshpc-loader--blocks/)
  assert.match(html, /dshpc-loader--xl/)
  // 文案只进无障碍名（aria-label），不渲染可见文字
  assert.doesNotMatch(html, /dshpc-table__state-text/)
  assert.match(html, /aria-label="正在加载/)
  assert.doesNotMatch(html, /dshpc-table__empty/)
})

test('整表 loading：已有数据时不遮挡数据', () => {
  const html = renderToStaticMarkup(createElement(Table, {
    columns: oneColumn,
    rows: oneRow,
    loading: true,
  }))
  assert.doesNotMatch(html, /dshpc-table__state--full/)
  assert.match(html, /dshpc-table__row/)
})

test('加载更多：loadingMore 在底部渲染中号三块动画（无可见文案、通栏补顶线）；没给 onLoadMore 时不渲染', () => {
  assert.match(
    renderToStaticMarkup(createElement(Table, { columns: oneColumn, rows: oneRow, onLoadMore: () => {}, loadingMore: true })),
    /dshpc-table__state-row/,
  )
  const html = renderToStaticMarkup(createElement(Table, { columns: oneColumn, rows: oneRow, onLoadMore: () => {}, loadingMore: true }))
  assert.match(html, /dshpc-loader--blocks/)
  assert.match(html, /dshpc-loader--md/)
  assert.match(html, /dshpc-table__state-row--footer/)
  assert.doesNotMatch(html, /dshpc-table__state-text/)
  assert.doesNotMatch(
    renderToStaticMarkup(createElement(Table, { columns: oneColumn, rows: oneRow, loadingMore: true })),
    /dshpc-table__state-row/,
  )
})

test('底部状态行的外框：没有左右外框时连表底线一起去掉，有外框时保留', () => {
  const base = { columns: oneColumn, rows: oneRow, onLoadMore: () => {} }
  // borders 默认 y（无左右边）⇒ 底部状态行下方不再画表底线
  assert.match(renderToStaticMarkup(createElement(Table, { ...base, hasMore: false })), /dshpc-table--foot-no-bottom/)
  assert.match(renderToStaticMarkup(createElement(Table, { ...base, loadingMore: true })), /dshpc-table--foot-no-bottom/)
  // 有左右外框时底边属于外框，保留
  assert.doesNotMatch(
    renderToStaticMarkup(createElement(Table, { ...base, borders: 'all', hasMore: false })),
    /dshpc-table--foot-no-bottom/,
  )
  // 没有底部状态行（还在加载下一页）时不动表底线
  assert.doesNotMatch(renderToStaticMarkup(createElement(Table, base)), /dshpc-table--foot-no-bottom/)
})

test('到底文案：hasMore:false 默认显示内置文案，noMoreText 可换、false 不渲染', () => {
  const base = { columns: oneColumn, rows: oneRow, onLoadMore: () => {} }
  assert.match(renderToStaticMarkup(createElement(Table, { ...base, hasMore: false })), /没有更多数据/)
  assert.match(renderToStaticMarkup(createElement(Table, { ...base, hasMore: false, noMoreText: 'ALL DONE' })), /ALL DONE/)
  assert.doesNotMatch(
    renderToStaticMarkup(createElement(Table, { ...base, hasMore: false, noMoreText: false })),
    /dshpc-table__state-row/,
  )
})

test('底部哨兵：传了 onLoadMore 才渲染，到底后不再渲染', () => {
  const base = { columns: oneColumn, rows: oneRow }
  assert.match(renderToStaticMarkup(createElement(Table, { ...base, onLoadMore: () => {} })), /dshpc-table__sentinel/)
  assert.doesNotMatch(
    renderToStaticMarkup(createElement(Table, { ...base, onLoadMore: () => {}, hasMore: false })),
    /dshpc-table__sentinel/,
  )
})

test('分页与滚动加载互斥：分页模式下不渲染底部加载行与哨兵', () => {
  const html = renderToStaticMarkup(createElement(Table, {
    columns: oneColumn,
    rows: oneRow,
    pagination: { page: 1, pageSize: 10 },
    onLoadMore: () => {},
    loadingMore: true,
    hasMore: false,
  }))
  assert.doesNotMatch(html, /dshpc-table__state-row/)
  assert.doesNotMatch(html, /dshpc-table__sentinel/)
})
