import test from 'node:test'
import assert from 'node:assert/strict'
import {
  DEFAULT_SCROLL_THRESHOLD,
  isToolbarEntryVisible,
  resolveToolbarLeft,
  sortToolbarEntries,
} from '../dist/ui/quick-toolbar-logic.js'

test('无锚点：贴视口右缘，留 offset', () => {
  assert.equal(resolveToolbarLeft({ viewportWidth: 1200, offset: 16, size: 44 }, null), 1140)
})

test('有锚点且放得下：贴锚点右缘外侧', () => {
  // 800 + 16 = 816；816 + 44 + 16 = 876 < 1200 ⇒ 成立
  assert.equal(resolveToolbarLeft({ viewportWidth: 1200, offset: 16, size: 44 }, 800), 816)
})

test('有锚点但右侧放不下：退回贴视口右缘', () => {
  // 850 + 16 + 44 + 16 = 926 > 900 ⇒ 退回 900 - 16 - 44
  assert.equal(resolveToolbarLeft({ viewportWidth: 900, offset: 16, size: 44 }, 850), 840)
})

test('视口窄过按钮本身：左缘钳到 0，不出现负坐标', () => {
  assert.equal(resolveToolbarLeft({ viewportWidth: 40, offset: 16, size: 44 }, null), 0)
})

test('锚点坐标不是有限值：按无锚点处理', () => {
  assert.equal(resolveToolbarLeft({ viewportWidth: 1200, offset: 16, size: 44 }, Number.NaN), 1140)
})

test('排序：order 优先；同 order 内置回顶部在前、自定义按数组顺序', () => {
  const entries = [
    { id: 'c1', kind: 'custom', order: 1, index: 1 },
    { id: 'bt', kind: 'backtop', order: 0, index: 0 },
    { id: 'c2', kind: 'custom', order: 2, index: 2 },
    { id: 'tie', kind: 'custom', order: 0, index: 3 },
  ]
  assert.deepEqual(
    sortToolbarEntries(entries).map((entry) => entry.id),
    ['bt', 'tie', 'c1', 'c2'],
  )
  // 不修改入参
  assert.equal(entries[0].id, 'c1')
})

test('显隐：默认一直显示；visible=false 永久隐藏', () => {
  assert.equal(isToolbarEntryVisible({}, 0), true)
  assert.equal(isToolbarEntryVisible({ visible: false, when: 'scroll' }, 9999), false)
})

test('显隐：scroll 只在滚过阈值后出现', () => {
  assert.equal(isToolbarEntryVisible({ when: 'scroll' }, DEFAULT_SCROLL_THRESHOLD), false)
  assert.equal(isToolbarEntryVisible({ when: 'scroll' }, DEFAULT_SCROLL_THRESHOLD + 1), true)
  assert.equal(isToolbarEntryVisible({ when: 'scroll', threshold: 80 }, 81), true)
})
