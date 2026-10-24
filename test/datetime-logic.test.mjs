import test from 'node:test'
import assert from 'node:assert/strict'
import {
  buildMonthCells,
  ceilToPrecision,
  clampUnit,
  floorToPrecision,
  formatDateTimeIso,
  monthCaption,
  nowTimeFor,
  parseDateTime,
  partsOf,
  partsToMs,
  rangeIsValid,
  sameLocalDay,
  stepMax,
  stepUnit,
  toEndDraft,
  weekdayLabels,
} from '../dist/ui/index.js'

const at = (h, m = 30, s = 15, ms = 123) =>
  `2026-10-24T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}.${String(ms).padStart(3, '0')}`

test('parseDateTime / formatDateTimeIso 往返一致', () => {
  assert.deepEqual(parseDateTime('2026-10-24T14:30:15.123'), {
    year: 2026, month: 10, day: 24, hour: 14, minute: 30, second: 15, ms: 123,
  })
  assert.equal(formatDateTimeIso(parseDateTime('2026-10-24T14:30:15.123')), '2026-10-24T14:30:15.123')
})

test('parseDateTime 容忍省略时间段 / 一位毫秒，拒绝不存在的日期', () => {
  assert.deepEqual(parseDateTime('2026-10-24'), {
    year: 2026, month: 10, day: 24, hour: 0, minute: 0, second: 0, ms: 0,
  })
  assert.equal(parseDateTime('2026-10-24T00:00:00.5').ms, 500)
  assert.equal(parseDateTime('2026-02-30'), null) // 2 月没有 30 日
  assert.equal(parseDateTime('2026-13-01'), null) // 13 月会被 Date 卷成次年 1 月 ⇒ 校验拦下
  assert.equal(parseDateTime('not-a-date'), null)
  assert.equal(parseDateTime(''), null)
})

test('floorToPrecision：起始端归零（含 day ⇒ 00:00:00.000）', () => {
  const p = parseDateTime(at(14))
  assert.equal(formatDateTimeIso(floorToPrecision(p, 'day')), '2026-10-24T00:00:00.000')
  assert.equal(formatDateTimeIso(floorToPrecision(p, 'hour')), '2026-10-24T14:00:00.000')
  assert.equal(formatDateTimeIso(floorToPrecision(p, 'minute')), '2026-10-24T14:30:00.000')
  assert.equal(formatDateTimeIso(floorToPrecision(p, 'second')), '2026-10-24T14:30:15.000')
})

test('ceilToPrecision：结束端拉满（含 day ⇒ 23:59:59.999；second 不动）', () => {
  const p = parseDateTime(at(14))
  assert.equal(formatDateTimeIso(ceilToPrecision(p, 'day')), '2026-10-24T23:59:59.999')
  assert.equal(formatDateTimeIso(ceilToPrecision(p, 'hour')), '2026-10-24T14:59:59.999')
  assert.equal(formatDateTimeIso(ceilToPrecision(p, 'minute')), '2026-10-24T14:30:59.999')
  assert.equal(formatDateTimeIso(ceilToPrecision(p, 'second')), '2026-10-24T14:30:15.123')
  // 毫秒被数据库截断时退化为 23:59:59，仍是当天最后一秒
  assert.equal(formatDateTimeIso(ceilToPrecision(p, 'day')).slice(0, 19), '2026-10-24T23:59:59')
})

test('floor ≤ 原值 ≤ ceil', () => {
  const p = parseDateTime(at(9, 5, 3, 7))
  const t = partsToMs(p)
  assert.ok(partsToMs(floorToPrecision(p, 'day')) <= t)
  assert.ok(t <= partsToMs(ceilToPrecision(p, 'day')))
  assert.ok(partsToMs(floorToPrecision(p, 'hour')) <= t)
  assert.ok(t <= partsToMs(ceilToPrecision(p, 'hour')))
})

test('buildMonthCells：6×7 周一起排，2026-10-01 是周四', () => {
  const cells = buildMonthCells(2026, 10)
  assert.equal(cells.length, 42)
  assert.equal(cells[0].iso, '2026-09-28') // 周一，补上位
  assert.equal(cells[0].inMonth, false)
  assert.equal(cells[3].iso, '2026-10-01')
  assert.equal(cells[3].inMonth, true)
  assert.equal(cells[3].weekday, 3) // 周四
  assert.equal(cells.filter((c) => c.inMonth).length, 31)
  assert.equal(cells[41].iso, '2026-11-08')
  assert.equal(cells.every((c, i) => c.weekday === i % 7), true)
})

test('buildMonthCells：闰月与大小月', () => {
  assert.equal(buildMonthCells(2028, 2).filter((c) => c.inMonth).length, 29) // 2028 闰 2 月
  assert.equal(buildMonthCells(2026, 2).filter((c) => c.inMonth).length, 28)
  assert.equal(buildMonthCells(2026, 4).filter((c) => c.inMonth).length, 30)
})

test('stepUnit / clampUnit / stepMax：步进循环与键入收拢', () => {
  assert.equal(stepUnit(0, 'minute', -1), 59)
  assert.equal(stepUnit(59, 'minute', 1), 0)
  assert.equal(stepUnit(23, 'hour', 1), 0)
  assert.equal(stepUnit(0, 'second', -1), 59)
  assert.equal(stepMax('hour'), 23)
  assert.equal(clampUnit(99, 'minute'), 59)
  assert.equal(clampUnit(-5, 'hour'), 0)
  assert.equal(clampUnit(NaN, 'second'), 0)
})

test('toEndDraft / partsOf：日期时间分离，没日期 ⇒ null（时间可先于日期选）', () => {
  assert.deepEqual(toEndDraft(null), { day: null, time: { hour: 0, minute: 0, second: 0, ms: 0 } })
  assert.deepEqual(toEndDraft('bad'), { day: null, time: { hour: 0, minute: 0, second: 0, ms: 0 } })
  const e = toEndDraft('2026-10-24T14:30:15.123')
  assert.deepEqual(e.day, { year: 2026, month: 10, day: 24 })
  assert.deepEqual(e.time, { hour: 14, minute: 30, second: 15, ms: 123 })
  assert.deepEqual(partsOf(e), {
    year: 2026, month: 10, day: 24, hour: 14, minute: 30, second: 15, ms: 123,
  })
  // 只调了时分秒、没选日期 ⇒ partsOf 给 null，「确定」据此不传数据
  assert.equal(partsOf({ day: null, time: { hour: 9, minute: 0, second: 0, ms: 0 } }), null)
})

test('nowTimeFor：「现在」按精度截断；day 全零', () => {
  assert.deepEqual(nowTimeFor('day'), { hour: 0, minute: 0, second: 0, ms: 0 })
  const h = nowTimeFor('hour')
  assert.equal(h.minute, 0)
  assert.equal(h.second, 0)
  assert.equal(h.ms, 0)
  const m = nowTimeFor('minute')
  assert.equal(m.second, 0)
  assert.equal(m.ms, 0)
  const s = nowTimeFor('second')
  assert.ok(s.ms >= 0 && s.ms <= 999)
})

test('rangeIsValid：起 ≤ 止才成立', () => {
  assert.equal(rangeIsValid('2026-10-24T00:00:00.000', '2026-10-24T23:59:59.999'), true)
  assert.equal(rangeIsValid('2026-10-24T10:00:00.000', '2026-10-24T10:00:00.000'), true)
  assert.equal(rangeIsValid('2026-10-24T23:59:59.999', '2026-10-24T00:00:00.000'), false)
  assert.equal(rangeIsValid('2026-10-24T10:00:00.000', 'bad'), false)
  assert.equal(rangeIsValid('bad', '2026-10-24T10:00:00.000'), false)
})

test('sameLocalDay / monthCaption / weekdayLabels', () => {
  const a = parseDateTime('2026-10-24T01:00:00.000')
  const b = parseDateTime('2026-10-24T23:00:00.000')
  const c = parseDateTime('2026-10-25T01:00:00.000')
  assert.equal(sameLocalDay(a, b), true)
  assert.equal(sameLocalDay(a, c), false)
  assert.equal(monthCaption(2026, 10, 'zh'), '2026年10月')
  assert.equal(monthCaption(2026, 10, 'en'), 'October 2026')
  assert.equal(weekdayLabels('zh')[0], '一')
  assert.equal(weekdayLabels('en')[0], 'Mon')
  assert.equal(weekdayLabels('zh').length, 7)
})
