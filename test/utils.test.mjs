import test from 'node:test'
import assert from 'node:assert/strict'
import {
  baseNameOf,
  formatBytes,
  formatClock,
  formatCount,
  formatDateTime,
  formatDateTimePrecision,
  formatDurationHms,
  formatRange,
  formatYmd,
  getLocale,
  overlaps,
  pad2,
  relativePast,
  sameCalendarDay,
  setLocale,
  truncateBytes,
} from '../dist/utils/index.js'

const AT = new Date('2026-03-05T10:30:00').getTime()

test('pad2 / formatDateTime / formatYmd', () => {
  assert.equal(pad2(9), '09')
  assert.equal(pad2('9'), '09')
  assert.equal(formatDateTime('2026-03-05T10:30:00'), '2026-03-05 10:30')
  assert.equal(formatDateTime('2026-03-05T10:30:00', { seconds: true }), '2026-03-05 10:30:00')
  assert.equal(formatDateTime('not-a-date', { fallback: '—' }), '—')
  assert.equal(formatYmd('not-a-date'), '—')
})

test('formatDateTimePrecision：显示只到精度，day 不出现时分秒', () => {
  assert.equal(formatDateTimePrecision('2026-03-05T10:30:45.123', 'day'), '2026-03-05')
  assert.equal(formatDateTimePrecision('2026-03-05T10:30:45.123', 'hour'), '2026-03-05 10:30')
  assert.equal(formatDateTimePrecision('2026-03-05T10:30:45.123', 'minute'), '2026-03-05 10:30')
  assert.equal(formatDateTimePrecision('2026-03-05T10:30:45.123', 'second'), '2026-03-05 10:30:45')
  assert.equal(formatDateTimePrecision('bad', 'day', { fallback: '—' }), '—')
  assert.equal(formatDateTimePrecision('bad', 'day'), 'bad')
})

test('formatClock / formatDurationHms', () => {
  assert.equal(formatClock(null), '-')
  assert.equal(formatClock('bad'), '-')
  assert.equal(formatDurationHms(-1), '-')
  assert.equal(formatDurationHms(30_000), '00:30')
  assert.equal(formatDurationHms(330_000), '05:30')
  assert.equal(formatDurationHms(3_600_000 + 900_000), '1:15:00')
})

test('sameCalendarDay / formatRange / overlaps', () => {
  assert.ok(sameCalendarDay(new Date('2026-03-05T09:00'), new Date('2026-03-05T23:00')))
  assert.ok(!sameCalendarDay(new Date('2026-03-05T23:00'), new Date('2026-03-06T01:00')))
  assert.equal(formatRange('2026-03-05T09:00:00', '2026-03-05T10:30:00'), '09:00 – 10:30')
  assert.equal(formatRange('2026-03-05T09:00:00', '2026-03-06T10:30:00'), '03-05 09:00 – 03-06 10:30')
  assert.equal(formatRange('bad', '2026-03-05T10:30:00'), '—')
  assert.ok(overlaps(10, 20, 15, 25))
  assert.ok(!overlaps(10, 20, 20, 25))
  assert.ok(!overlaps(Number.NaN, 20, 15, 25))
})

test('relativePast 中英双语，可传自定义 t 覆盖', () => {
  setLocale('zh')
  assert.equal(getLocale(), 'zh')
  assert.equal(relativePast(new Date(AT - 30_000).toISOString(), AT), '刚刚')
  assert.equal(relativePast(new Date(AT - 5 * 60_000).toISOString(), AT), '5 分钟前')
  assert.equal(relativePast(new Date(AT - 3 * 3_600_000).toISOString(), AT), '3 小时前')
  assert.equal(relativePast(new Date(AT - 3 * 86_400_000).toISOString(), AT), '3 天前')
  setLocale('en')
  assert.equal(relativePast(new Date(AT - 5 * 60_000).toISOString(), AT), '5m ago')
  setLocale('zh')
  // 未来时刻不显示负数
  assert.equal(relativePast(new Date(AT + 60_000).toISOString(), AT), '刚刚')
  // 覆盖口子
  assert.equal(relativePast(new Date(AT - 5 * 60_000).toISOString(), AT, () => 'X'), 'X')
})

test('baseNameOf 目录尾斜杠不会取成空串', () => {
  assert.equal(baseNameOf('a/b/c.md'), 'c.md')
  assert.equal(baseNameOf('a/b/'), 'b')
  assert.equal(baseNameOf('c.md'), 'c.md')
  assert.equal(baseNameOf('a\\b\\c.md'), 'c.md')
})

test('truncateBytes 按 UTF-8 字节截断，不切半个字', () => {
  assert.equal(truncateBytes('abcdef', 5), 'ab…') // 2 + 省略号 3 字节
  assert.equal(truncateBytes('abcdef', 3), '…') // 只够放省略号
  assert.equal(truncateBytes('中文测试', 7, ''), '中文') // 6 字节 + 省略号放不下
  assert.ok(!truncateBytes('中文测试', 10).includes('�'))
  assert.equal(truncateBytes('ab', 10), 'ab')
})

test('formatBytes / formatCount', () => {
  assert.equal(formatBytes(0), '—')
  assert.equal(formatBytes(-1), '—')
  assert.equal(formatBytes(512), '512 B')
  assert.equal(formatBytes(12_288), '12 KB')
  assert.equal(formatCount(999), '999')
  assert.equal(formatCount(1234), '1.2K')
  assert.equal(formatCount(123_456), '123K')
})
