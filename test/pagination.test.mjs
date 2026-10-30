// 分页自检：总页数 / 越界夹取 / 行区间 / 省略窗口 + 渲染骨架。
// 省略窗口算错，浏览器不会报错，只会画出「1 2 … 4」这种错页码 —— 必须由测试盯住。
import test from 'node:test'
import assert from 'node:assert/strict'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { Pagination, clampPage, pageCountOf, pageItems, pageRange } from '../dist/ui/index.js'

test('pageCountOf：空数据也算 1 页，向上取整，非法 pageSize 落 1', () => {
  assert.equal(pageCountOf(0, 10), 1)
  assert.equal(pageCountOf(1, 10), 1)
  assert.equal(pageCountOf(10, 10), 1)
  assert.equal(pageCountOf(11, 10), 2)
  assert.equal(pageCountOf(86, 10), 9)
  assert.equal(pageCountOf(10, 3), 4)
  assert.equal(pageCountOf(-5, 10), 1)
  assert.equal(pageCountOf(86, 0), 86) // pageSize 非法 ⇒ 按 1 条/页
})

test('clampPage：NaN / 越界 / 小数一律夹回合法页', () => {
  assert.equal(clampPage(0, 5), 1)
  assert.equal(clampPage(-3, 5), 1)
  assert.equal(clampPage(Number.NaN, 5), 1)
  assert.equal(clampPage(Number.POSITIVE_INFINITY, 5), 1)
  assert.equal(clampPage(2.7, 5), 2)
  assert.equal(clampPage(99, 5), 5)
  assert.equal(clampPage(1, 0), 1)
})

test('pageRange：1 起闭区间，末页截到总数，空数据给 [0,0]', () => {
  assert.deepEqual(pageRange(1, 10, 86), [1, 10])
  assert.deepEqual(pageRange(9, 10, 86), [81, 86])
  assert.deepEqual(pageRange(2, 10, 0), [0, 0])
  assert.deepEqual(pageRange(0, 10, 15), [1, 10]) // 越界先夹回第 1 页
  assert.deepEqual(pageRange(99, 10, 15), [11, 15])
})

test('pageItems：默认 1/1 窗口，最多 7 个位置', () => {
  assert.deepEqual(pageItems(1, 1), [1])
  assert.deepEqual(pageItems(1, 2), [1, 2])
  // 7 页以内不出现省略号
  assert.deepEqual(pageItems(1, 7), [1, 2, 3, 4, 5, 6, 7])
  assert.deepEqual(pageItems(4, 7), [1, 2, 3, 4, 5, 6, 7])
  // 36 页：首尾 1 页 + 当前页两侧各 1 页，其余收成省略号
  assert.deepEqual(pageItems(1, 36), [1, 2, 3, 4, 5, 'gap', 36])
  assert.deepEqual(pageItems(2, 36), [1, 2, 3, 4, 5, 'gap', 36])
  assert.deepEqual(pageItems(20, 36), [1, 'gap', 19, 20, 21, 'gap', 36])
  assert.deepEqual(pageItems(36, 36), [1, 'gap', 32, 33, 34, 35, 36])
})

test('pageItems：间隔恰好 1 页时直接显示页号，不画省略号', () => {
  // 5 页时 1..5 中间没有缺口
  assert.deepEqual(pageItems(1, 5), [1, 2, 3, 4, 5])
  // 6 页：第 2 页与末尾之间恰好只隔 1 页 ⇒ 显示 5 而不是「…」
  assert.deepEqual(pageItems(1, 6), [1, 2, 3, 4, 5, 6])
})

test('pageItems：窗口可配（sibling / boundary）', () => {
  // 两侧各 2 页
  assert.deepEqual(pageItems(20, 36, 2, 1), [1, 'gap', 18, 19, 20, 21, 22, 'gap', 36])
  // 首尾各 2 页
  assert.deepEqual(pageItems(2, 36, 1, 2), [1, 2, 3, 4, 5, 6, 'gap', 35, 36])
  // 两侧各 0 页 ⇒ 只剩首尾 + 当前页
  assert.deepEqual(pageItems(20, 36, 0, 1), [1, 'gap', 20, 'gap', 36])
})

const html = (props) => renderToStaticMarkup(createElement(Pagination, props))

test('Pagination 渲染：nav + 默认右对齐 + 当前页 aria-current', () => {
  const markup = html({ page: 2, pageSize: 10, total: 86, onChange() {} })
  assert.match(markup, /<nav /)
  assert.match(markup, /dshpc-pagination--right/)
  assert.match(markup, /aria-label="分页"/)
  // 页码按钮是核心 Button：当前页 = info 实心蓝，其余 = ghost
  assert.match(markup, /dshpc-btn--info/)
  assert.match(markup, /dshpc-btn--ghost/)
  assert.match(markup, /aria-current="page"/)
  assert.match(markup, /aria-label="第 2 页"/)
})

test('Pagination 渲染：首页上一页置灰、末页下一页置灰', () => {
  const first = html({ page: 1, pageSize: 10, total: 86, onChange() {} })
  assert.match(first, /aria-label="上一页"[^>]*disabled/)
  const last = html({ page: 9, pageSize: 10, total: 86, onChange() {} })
  assert.match(last, /aria-label="下一页"[^>]*disabled/)
})

test('Pagination 渲染：可选项按需生效', () => {
  // 只有一页 + hideOnSinglePage ⇒ 整条不渲染
  assert.equal(html({ page: 1, pageSize: 10, total: 5, hideOnSinglePage: true, onChange() {} }), '')
  // simple ⇒ 只留「2 / 36」，不铺页码
  const simple = html({ page: 2, pageSize: 10, total: 86, simple: true, onChange() {} })
  assert.match(simple, /2 \/ 9/)
  assert.doesNotMatch(simple, /dshpc-pagination__ellipsis/)
  // 传了 pageSizeOptions 才出现下拉（用核心 Picker，不是原生 select）
  const withSizes = html({ page: 1, pageSize: 10, total: 86, pageSizeOptions: [10, 20], onChange() {} })
  assert.match(withSizes, /dshpc-picker__trigger/)
  assert.match(withSizes, /aria-label="每页条数"/)
  // 没传就只有页码，没有下拉
  assert.doesNotMatch(html({ page: 1, pageSize: 10, total: 86, onChange() {} }), /dshpc-picker__trigger/)
  // showTotal ⇒ 出现总数文案
  assert.match(html({ page: 1, pageSize: 10, total: 86, showTotal: true, onChange() {} }), /第 1-10 条，共 86 条/)
})
