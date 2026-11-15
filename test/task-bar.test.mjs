import test from 'node:test'
import assert from 'node:assert/strict'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { TaskBar, notifyTask, setDefaultTaskProject, taskNotifications } from '../dist/ui/index.js'
import { TASK_BAR_CSS } from '../dist/ui/display/task-bar-css.js'
import { formatDurationHms } from '../dist/utils/index.js'

// 展示栏默认按「全局默认项目」取数，跟真实插件一样在入口设一次。
setDefaultTaskProject('dsh-plugin-core-test')

/** 空池下的静态渲染（`connect()` 在 effect 里，服务端不跑）。 */
function render(props) {
  return renderToStaticMarkup(createElement(TaskBar, props))
}

// 2026-11-15 用户：纯图标就是一个正方形，不能是长方形。
test('只图标形态是正方形：宽高同由尺寸档定死', () => {
  const html = render({ form: 'icon' })
  assert.match(html, /class="dshpc-taskbar__trigger dshpc-taskbar__trigger--icon dshpc-taskbar__trigger--md"/)
  assert.match(TASK_BAR_CSS, /\.dshpc-taskbar__trigger--icon\{justify-content:center;padding:0;width:28px;\}/)
  assert.match(TASK_BAR_CSS, /\.dshpc-taskbar__trigger--icon\.dshpc-taskbar__trigger--lg\{width:32px;\}/)
})

test('尺寸档 sm / md / lg 落到触发器上', () => {
  for (const size of ['sm', 'md', 'lg']) {
    assert.ok(render({ form: 'icon', size }).includes(`dshpc-taskbar__trigger--${size}`), `icon 缺 ${size}`)
    assert.ok(render({ size }).includes(`dshpc-taskbar__trigger--${size}`), `pill 缺 ${size}`)
  }
})

// 2026-11-15 用户：整体照下拉框的样子来，右边那颗三角别那么大。
test('触发器皮肤与下拉框同款，右侧三角 6px', () => {
  assert.match(TASK_BAR_CSS, /height:28px;padding:0 8px/)
  assert.match(TASK_BAR_CSS, /border:1px solid var\(--dshpc-border-heavy\)/)
  assert.ok(render({}).includes('font-size:6px'), '三角该是 Chevron size 6')
})

test('默认图标是后台执行的 CPU 字形', () => {
  assert.ok(render({ form: 'icon' }).includes('koc-i-common-base-cpu'))
})

test('没有任务时不呼吸、不出绿点', () => {
  const html = render({ form: 'icon' })
  assert.ok(!html.includes('dshpc-taskbar__iconwrap--busy'), '空池不该带呼吸类')
  assert.ok(!html.includes('dshpc-taskbar__dot'), '空池不该有绿点')
})

// 2026-11-15 用户：点开不要圆环套圆环 —— 面板一层框，行与行之间一条虚线。
test('面板只画一层框：行间一条虚线，行本身不再套 ListRow 的底 / 边', () => {
  assert.match(TASK_BAR_CSS, /\.dshpc-taskbar__item \+ \.dshpc-taskbar__item\{border-top:1px dashed/)
  assert.ok(!TASK_BAR_CSS.includes('dshpc-listrow'), '行不再复用 ListRow，CSS 不该引用它的类')
})

test('呼吸是 CSS 动画，且尊重 reduced-motion', () => {
  assert.ok(TASK_BAR_CSS.includes('animation:dshpc-taskbar-breathe'), '缺呼吸动画')
  assert.match(TASK_BAR_CSS, /prefers-reduced-motion:reduce\)\{\.dshpc-taskbar__iconwrap--busy/)
})

// 2026-11-15 用户：时间要「已执行 00:00:01」那种一直在跳的，不是「刚刚」。
test('已运行时长：padHours 打开后固定 HH:MM:SS，不随进位抖宽', () => {
  assert.equal(formatDurationHms(1_000, { padHours: true }), '00:00:01')
  assert.equal(formatDurationHms(61_000, { padHours: true }), '00:01:01')
  assert.equal(formatDurationHms(3_723_000, { padHours: true }), '01:02:03')
  // 默认口径不变，老调用方不受影响
  assert.equal(formatDurationHms(1_000), '00:01')
})

test('动作按钮能带自己的颜色，颜色进跨页 info', () => {
  const handle = notifyTask('row with actions', {
    group: 'test',
    actions: [
      { label: '查看', run: () => {} },
      { label: '取消', color: '#dc2626', run: () => {} },
    ],
  })
  const record = taskNotifications.getSnapshot().tasks.find((task) => task.id === handle.id)
  assert.equal(record.actions.length, 2)
  assert.equal(record.actions[0].color, undefined)
  assert.equal(record.actions[1].color, '#dc2626')
  handle.done()
})

test('动作颜色传空串直接拒掉，不静默吞', () => {
  assert.throws(
    () => notifyTask('bad color', { group: 'test', actions: [{ label: 'x', color: '  ', run: () => {} }] }),
    /action color/,
  )
})

// 2026-11-15 用户：动作按钮可以只传一个 icon，那时展示成正方形。
test('纯图标动作：只给 icon 也合法，icon 进跨页 info', () => {
  const handle = notifyTask('icon only action', {
    group: 'test',
    actions: [{ icon: 'common.base:shuaxin', run: () => {} }],
  })
  const record = taskNotifications.getSnapshot().tasks.find((task) => task.id === handle.id)
  assert.equal(record.actions[0].label, undefined)
  assert.equal(record.actions[0].icon, 'common.base:shuaxin')
  handle.done()
})

test('动作文案与图标都空：注册当场抛', () => {
  assert.throws(
    () => notifyTask('blank action', { group: 'test', actions: [{ run: () => {} }] }),
    /label or icon/,
  )
})


