// 会话预览自动贴底回归自检（2026-11-04，改了四次都没解决的那个 bug）。
//
// 用户口径（docs/requirements.md §2.5）：滚动条只有两种情况能跑到底 ——
//   ① 首次打开；② 有新内容且当时就在底部。
// 展开 / 折叠思考行、规划、历史分组只是**本地 state 改 DOM 高度**，不是新内容，
// 滚动条必须原地不动。这里用纯状态机 + 假 DOM 几何把四条验收钉死。
import test from 'node:test'
import assert from 'node:assert/strict'
import { createTailFollower, TAIL_STABLE_FRAMES } from '../dist/adv/session/tail-follow.js'

function harness(height = 1000, viewport = 300) {
  const m = { scrollTop: 0, scrollHeight: height, clientHeight: viewport }
  let queue = []
  let seq = 0
  const cancelled = []
  const tail = createTailFollower({
    metrics: () => ({ ...m }),
    setScrollTop: (top) => { m.scrollTop = top },
    frame: (fn) => { queue.push(fn); return ++seq },
    cancelFrame: (id) => { cancelled.push(id) },
  })
  const flush = (limit = 60) => {
    for (let i = 0; i < limit && queue.length > 0; i++) {
      const batch = queue
      queue = []
      for (const fn of batch) fn()
    }
  }
  const bottom = () => m.scrollHeight - m.clientHeight
  return { m, tail, flush, bottom, cancelled, pending: () => queue.length }
}

test('① 首次打开：立即到底，不开追尾动画', () => {
  const h = harness()
  h.tail.open()
  assert.equal(h.m.scrollTop, 700)
  assert.equal(h.pending(), 0)
})

test('② 展开思考 / 规划（只改 DOM 高度，无内容版本事件）⇒ 滚动条原地不动', () => {
  const h = harness()
  h.tail.open()
  // 模拟展开：内容变高 400px。浏览器可能顺带发一个 scroll 事件。
  h.m.scrollHeight = 1400
  h.tail.scrolled()
  h.flush()
  assert.equal(h.m.scrollTop, 700, '展开把视图拽到底了（旧 bug）')
  assert.equal(h.pending(), 0, '展开不应启动任何追尾动画')

  // 反复展开 / 折叠也不许动
  h.m.scrollHeight = 1000
  h.tail.scrolled()
  h.flush()
  assert.equal(h.m.scrollTop, 700)
})

test('②b 浏览器把首屏 scrollTop 钳到真实上限后，随后到达的 scroll 事件不失跟', () => {
  const m = { scrollTop: 0, scrollHeight: 1000, clientHeight: 300 }
  let queue = []
  let seq = 0
  const tail = createTailFollower({
    metrics: () => ({ ...m }),
    // 真实 DOM 会把越界写入钳到 scrollHeight - clientHeight，并可能少 1px。
    setScrollTop: (top) => { m.scrollTop = Math.min(top, m.scrollHeight - m.clientHeight - 1) },
    frame: (fn) => { queue.push(fn); return ++seq },
    cancelFrame: () => {},
  })
  tail.open()
  tail.scrolled() // 首屏 jump 触发的 scroll 事件
  m.scrollHeight = 1400
  tail.content()
  for (let i = 0; i < 60 && queue.length > 0; i++) {
    const batch = queue
    queue = []
    for (const fn of batch) fn()
  }
  assert.equal(m.scrollTop, 1099, '首屏 scroll 事件被误判成用户往上滚 ⇒ 后续内容失跟')
})

test('③ 有新内容且当时在底部 ⇒ 跟到新底；边渲染边长也跟得住', () => {
  const h = harness()
  h.tail.open()
  h.m.scrollHeight = 1400
  h.tail.content()
  // 分批渲染：每帧还在长高，step 每帧以最新 scrollHeight 为目标
  h.m.scrollHeight = 1800
  h.flush()
  assert.equal(h.m.scrollTop, 1500)
  assert.equal(h.pending(), 0, `窗口应在 ${TAIL_STABLE_FRAMES} 帧稳定后关闭`)
})

test('④ 窗口关闭后再展开（无新内容）⇒ 仍然不动', () => {
  const h = harness()
  h.tail.open()
  h.m.scrollHeight = 1400
  h.tail.content()
  h.flush()
  assert.equal(h.m.scrollTop, 1100)
  // 这里就是旧实现翻车的地方：contentBumpRef 残留导致 RO 把展开当新内容
  h.m.scrollHeight = 1900
  h.tail.scrolled()
  h.flush()
  assert.equal(h.m.scrollTop, 1100)
})

test('⑤ 用户往上滚过 ⇒ 后续新内容不把视图拽回；滚回底部恢复跟随', () => {
  const h = harness()
  h.tail.open()
  h.m.scrollTop = 100
  h.tail.scrolled()
  h.m.scrollHeight = 1400
  h.tail.content()
  h.flush()
  assert.equal(h.m.scrollTop, 100, '用户已往上滚过，不该被新内容拽走')

  h.m.scrollTop = h.bottom()
  h.tail.scrolled() // 手动滚回底部
  h.m.scrollHeight = 1700
  h.tail.content()
  h.flush()
  assert.equal(h.m.scrollTop, 1400, '滚回底部后应恢复跟随')
})

test('⑥ 程序自己向下滚触发的 scroll 事件不会自激追尾', () => {
  const h = harness()
  h.tail.open()
  const frames = []
  let seq = 0
  const tail = createTailFollower({
    metrics: () => ({ ...h.m }),
    setScrollTop: (top) => { h.m.scrollTop = top; tail.scrolled() },
    frame: (fn) => { frames.push(fn); return ++seq },
    cancelFrame: () => {},
  })
  tail.open()
  h.m.scrollHeight = 1300
  tail.content()
  for (let i = 0; i < 60 && frames.length > 0; i++) {
    const batch = frames.splice(0)
    for (const fn of batch) fn()
  }
  assert.equal(h.m.scrollTop, 1000)
  assert.equal(frames.length, 0, 'scroll 事件重新起了一条动画')
})

test('⑦ dispose 后不再产生任何滚动或动画', () => {
  const h = harness()
  h.tail.open()
  h.tail.dispose()
  h.m.scrollHeight = 2000
  h.tail.content()
  h.flush()
  assert.equal(h.m.scrollTop, 700)
  assert.equal(h.pending(), 0)
})
