import test from 'node:test'
import assert from 'node:assert/strict'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { TaskBar, notifyTask, setDefaultTaskProject, taskNotifications } from '../dist/adv/tasks/index.js'
import { TASK_BAR_CSS } from '../dist/adv/tasks/task-bar-css.js'
import { TOKENS_CSS } from '../dist/design/tokens-css.js'
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

// 2026-11-15 用户：行 hover 给一层极淡的蓝（跟表格选中同色系、更浅就行），行本身仍然不可点。
test('行 hover 只换极淡蓝底，不给点击语义', () => {
  const css = TASK_BAR_CSS.replace(/\/\*[\s\S]*?\*\//g, '')
  assert.match(css, /\.dshpc-taskbar__item:hover\{background:var\(--dshpc-taskbar-row-hover\);\}/)
  assert.ok(!/\.dshpc-taskbar__item[^{]*\{[^}]*cursor:/.test(css), '行不该给 cursor（不可点）')
  assert.ok(!/\.dshpc-taskbar__item[^{]*:focus/.test(css), '行不给焦点环（没有键盘交互）')
  assert.match(css, /prefers-reduced-motion:reduce\)\{\.dshpc-taskbar__item\{transition:none\}\}/)
})

test('行 hover token：明暗各一档，且都比表格选中（14% / 26%）更淡', () => {
  const darkAt = TOKENS_CSS.indexOf('body[data-ds-dark-theme]{')
  assert.ok(darkAt > 0, '暗色段必须存在')
  const light = TOKENS_CSS.slice(0, darkAt)
  const dark = TOKENS_CSS.slice(darkAt)
  assert.match(light, /--dshpc-taskbar-row-hover:color-mix\(in srgb,var\(--dshpc-slate\) 8%,transparent\)/)
  assert.match(dark, /--dshpc-taskbar-row-hover:color-mix\(in srgb,var\(--dshpc-slate\) 16%,transparent\)/)
})

// 2026-11-15 用户：宽度要像 Button 那样能定宽 / 最小 / 最大，放不下就三个点 + hover 跑马灯。
test('宽度三轴与 Button 同口径：定宽优先，min / max 次之', () => {
  assert.ok(render({ width: 200 }).includes('width:200px'), '定宽该落到触发器')
  const both = render({ width: 200, minWidth: 120, maxWidth: 300 })
  assert.ok(both.includes('width:200px'), '定宽在')
  assert.ok(!both.includes('min-width') && !both.includes('max-width'), '定宽时另两者失效')
  const limited = render({ minWidth: 160, maxWidth: 240 })
  assert.ok(limited.includes('min-width:160px') && limited.includes('max-width:240px'), 'min / max 各自生效')
})

test('定宽或给了上限 ⇒ 文字叠跑马灯；只有下限 / 没约束不叠', () => {
  assert.ok(render({ maxWidth: 140 }).includes('dshpc-mq'), 'maxWidth 该叠 MarqueeText')
  assert.ok(render({ width: 140 }).includes('dshpc-mq'), '定宽同样要截断')
  assert.ok(!render({}).includes('dshpc-mq'), '没有宽度约束不该多套一层')
  assert.ok(!render({ minWidth: 140 }).includes('dshpc-mq'), '只有下限不会截断，不必测宽')
  const css = TASK_BAR_CSS.replace(/\/\*[\s\S]*?\*\//g, '')
  assert.match(css, /\.dshpc-taskbar__label\{flex:0 1 auto;min-width:0;white-space:nowrap;\}/, '文字槽要能收缩')
})

// 2026-11-16 用户截图：三角被计数挤出定宽边框，且定宽时没有贴到最右。
test('定宽 / 上限时三角贴右，计数并入同一段跑马灯', () => {
  const css = TASK_BAR_CSS.replace(/\/\*[\s\S]*?\*\//g, '')
  assert.match(css, /\.dshpc-taskbar__caret\{flex:none;color:var\(--dshpc-fg-3\);margin-left:auto;\}/)
  assert.match(css, /\.dshpc-taskbar__trigger\{[^}]*overflow:hidden;/)
  // 服务端渲染走 getServerSnapshot（空快照），这里验的是结构：受约束时只有一段文字槽 + 三角。
  const html = render({ maxWidth: 110 })
  assert.ok(html.includes('dshpc-taskbar__caret'), '三角不能丢')
  assert.ok(!html.includes('dshpc-taskbar__count"'), '计数不能作为独立 flex:none 元素再占宽')
  assert.match(html, /dshpc-mq-in/, '文字仍由跑马灯承载，文本拼接在组件里完成')
})

test('只图标形态恒为正方形：宽度三轴一律忽略', () => {
  const html = render({ form: 'icon', width: 200, maxWidth: 300 })
  assert.ok(!html.includes('width:200px') && !html.includes('max-width'), '图标档不能被拉成长方形')
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


