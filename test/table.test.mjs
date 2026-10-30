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
