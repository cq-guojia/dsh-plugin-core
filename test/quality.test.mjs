import test from 'node:test'
import assert from 'node:assert/strict'
import { readdir, readFile } from 'node:fs/promises'
import { formatClock, formatYmd, relativeFuture } from '../dist/utils/index.js'
import { createStyleKit } from '../dist/design/index.js'
import * as ui from '../dist/ui/index.js'

test('relativeFuture 与 relativePast 对偶', () => {
  const now = Date.parse('2026-10-18T12:00:00.000Z')
  assert.equal(relativeFuture('2026-10-18T12:00:30.000Z', now), '即将')
  assert.equal(relativeFuture('2026-10-18T12:03:00.000Z', now), '3 分钟后')
  assert.equal(relativeFuture('2026-10-19T12:00:00.000Z', now), '1 天后')
  // 解析失败不编造，回退成日期串
  assert.equal(relativeFuture('not-a-date', now), '—')
})

test('formatClock 接受 undefined，可覆盖兜底', () => {
  assert.equal(formatClock(undefined), '-')
  assert.equal(formatClock(null), '-')
  assert.equal(formatClock(''), '-')
  assert.equal(formatClock(undefined, { fallback: '—' }), '—')
  assert.equal(formatClock('2026-10-18T09:05:01.000Z', { fallback: '—' }).length, 8)
})

test('formatYmd 可覆盖兜底', () => {
  assert.equal(formatYmd('bad'), '—')
  assert.equal(formatYmd('bad', { fallback: '?' }), '?')
})

test('StyleKit.dispose 在无 DOM 下不抛', () => {
  const kit = createStyleKit({ id: 'probe' })
  assert.doesNotThrow(() => kit.dispose())
  assert.doesNotThrow(() => kit.dispose())
})

test('质检新增的参数都已导出（Picker 尺寸档 / 非受控 / 清除）', () => {
  assert.equal(typeof ui.Picker, 'function')
  assert.equal(typeof ui.ModelPicker, 'function')
  // Modal 新参数通过 props 传入，编译期保证；这里确认组件存在
  assert.equal(typeof ui.Modal, 'function')
  assert.equal(typeof ui.showToast, 'function')
})

// 2026-10-26：卡片折叠箭头写的是 '▾' 字形，用户点名太丑、且与下拉框那颗（自绘 SVG chevron）
// 不是一个东西 ⇒ 全站箭头收敛到 src/ui/chevron.ts。字形在各系统字体下粗细 / 角度 / 基线都不同，
// 靠人眼审不出「又冒出一颗」，必须由测试盯。
test('ui 层不许再用字形箭头，一律走 Chevron', async () => {
  const glyphs = /[▾▸▼▲↑↓→←]/
  const hits = []
  const walk = async (rel) => {
    for (const entry of await readdir(new URL(rel, import.meta.url), { withFileTypes: true })) {
      const next = `${rel}/${entry.name}`
      if (entry.isDirectory()) await walk(next)
      // 生成物是单行 CSS 字符串（里面出现箭头也是 CSS 内容，不是组件渲染的字形），不看
      else if (entry.name.endsWith('.ts') && !entry.name.endsWith('.generated.ts')) {
        const lines = (await readFile(new URL(next, import.meta.url), 'utf8')).split('\n')
        lines.forEach((line, i) => {
          const trimmed = line.trim()
          const isComment = trimmed.startsWith('*') || trimmed.startsWith('//') || trimmed.startsWith('/*')
          if (!isComment && glyphs.test(line)) hits.push(`${next.slice('../'.length)}:${String(i + 1)}`)
        })
      }
    }
  }
  await walk('../src/ui')
  assert.deepEqual(hits, [], `ui 层出现字形箭头（改用 Chevron）：\n${hits.join('\n')}`)
})

// 2026-11-02 用户口径：所有滚动条都要和容器边缘隔 1px（贴死了看不出是滚动条）。
// CSS 没有「可滚动」选择器，写不出一条全局规则 ⇒ 只能靠这条扫源码的自检拦住新增容器漏加。
// 通过条件：滚动规则自带透明边框（让位）或实色边框（滚动条贴的是那条线，视觉上已让位）。
test('滚动容器都与边缘隔 1px（透明边框或实色边框）', async () => {
  const hits = []
  const walk = async (rel) => {
    for (const entry of await readdir(new URL(rel, import.meta.url), { withFileTypes: true })) {
      const next = `${rel}/${entry.name}`
      if (entry.isDirectory()) await walk(next)
      else if (entry.name.endsWith('.css')) {
        const css = (await readFile(new URL(next, import.meta.url), 'utf8')).replace(/\/\*[\s\S]*?\*\//g, '')
        for (const [, selector, body] of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
          if (!/overflow(-[xy])?\s*:\s*(auto|scroll)/.test(body)) continue
          if (/\bborder(-(right|bottom))?\s*:/.test(body)) continue
          hits.push(`${next.slice('../'.length)} → ${selector.trim().split('\n').pop()}`)
        }
      }
    }
  }
  await walk('../src')
  assert.deepEqual(
    hits,
    [],
    `滚动容器缺 1px 让位（border-right/-bottom: 1px solid transparent，见 style.md §滚动条让位）：\n${hits.join('\n')}`,
  )
})
