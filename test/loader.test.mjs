import test from 'node:test'
import assert from 'node:assert/strict'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { Loader, LoaderBar } from '../dist/ui/index.js'
import { LOADER_CSS } from '../dist/ui/controls/loader-css.generated.js'
import { LOADER_BAR_CSS } from '../dist/ui/controls/loader-bar-css.generated.js'

const SIZES = ['xs', 'sm', 'md', 'lg', 'xl']
const VARIANTS = ['ring', 'blocks']

/** 渲染成静态 HTML（无 DOM 依赖，node 里直接跑）。 */
const html = (props) => renderToStaticMarkup(createElement(Loader, props))
const htmlOf = (component, props) => renderToStaticMarkup(createElement(component, props))

test('Loader 默认是 ring + md', () => {
  const out = html({})
  assert.match(out, /class="dshpc-loader dshpc-loader--ring dshpc-loader--md"/)
  assert.match(out, /<circle /)
})

test('Loader 两形态各出各的几何（不是同一个图标换名字）', () => {
  assert.match(html({ variant: 'ring' }), /stroke-dasharray/)
  assert.equal((html({ variant: 'blocks' }).match(/<rect /g) ?? []).length, 3)
  // 脉动节点必须挂上动画钩子类，否则 CSS 里的 nth-child 延迟无从命中
  assert.equal((html({ variant: 'blocks' }).match(/dshpc-loader__node/g) ?? []).length, 3)
  // 三点形态已按用户要求删除（2026-10-30），别让它偷偷回潮
  assert.ok(!LOADER_CSS.includes('dshpc-loader--dots'))
})

test('Loader 五档尺寸都落在类名上，且 CSS 有对应宽度', () => {
  for (const size of SIZES) {
    assert.match(html({ size }), new RegExp(`dshpc-loader--${size}(?=")`))
    assert.ok(LOADER_CSS.includes(`.dshpc-loader--${size} {`), `${size} 档缺 CSS 规则`)
  }
})

test('Loader 只画图标：不带背景 / 内距 / 定位，颜色走 currentColor', () => {
  const out = html({ variant: 'blocks' })
  assert.match(out, /fill="currentColor"/)
  assert.doesNotMatch(out, /style=/)
  assert.doesNotMatch(LOADER_CSS, /\.dshpc-loader[^{]*\{[^}]*background:/)
  assert.doesNotMatch(LOADER_CSS, /\.dshpc-loader[^{]*\{[^}]*position:/)
  assert.doesNotMatch(LOADER_CSS, /\.dshpc-loader[^{]*\{[^}]*padding:/)
})

test('无障碍：默认 aria-hidden（装饰），传 label 才自己播报', () => {
  const decorative = html({})
  assert.match(decorative, /aria-hidden="true"/)
  assert.doesNotMatch(decorative, /role="status"/)

  const semantic = html({ label: '加载中' })
  assert.match(semantic, /role="status"/)
  assert.match(semantic, /aria-label="加载中"/)
  assert.doesNotMatch(semantic, /aria-hidden/)
})

test('CSS：两形态都有动画，且降低动效时停在全可见态', () => {
  for (const variant of VARIANTS) {
    assert.ok(LOADER_CSS.includes(`.dshpc-loader--${variant}`), `${variant} 缺样式`)
  }
  assert.ok(LOADER_CSS.includes('prefers-reduced-motion'))
  assert.ok(LOADER_CSS.includes('transform-box: fill-box'))
  // 旧的「按钮自己画一份环」不该再回来
  assert.ok(!LOADER_CSS.includes('dshpc-btn'))
})

// ── LoaderBar ────────────────────────────────────────────────────────────

test('LoaderBar：轨道 / 蓝段 / 斜纹三层齐全，裁剪层与动画层分开', () => {
  const out = htmlOf(LoaderBar, {})
  // 轨道 1 + 蓝段 1 + 斜纹 3（原图 + 左移一周期 + 左移两周期，保证左端不露空）
  assert.equal((out.match(/fill="#455A64"/g) ?? []).length, 1)
  assert.equal((out.match(/fill="#2196F3"/g) ?? []).length, 1)
  assert.equal((out.match(/fill="#42A5F5"/g) ?? []).length, 3)
  assert.match(out, /<clipPath id="dshpc-loader-bar-clip-[^"]*"/)
  assert.match(out, /clip-path="url\(#dshpc-loader-bar-clip-[^)]*\)"/)
  assert.match(out, /class="dshpc-loader-bar__stripe"/)
  // 蓝色段固定不动：它必须出现在条纹组之前，不在动画层里
  assert.ok(out.indexOf('M128 426.666667') < out.indexOf('dshpc-loader-bar__stripe'))
  // 若 clip-path 与动画层同一层，裁剪框会跟着平移，等于没裁
  assert.doesNotMatch(out, /class="dshpc-loader-bar__stripe"[^>]*clip-path/)
})

test('LoaderBar：同页多个实例的 clipPath id 不撞（撞了后面那个不显示）', () => {
  // 必须在**同一个 root** 里渲染才能体现 —— 两次独立 renderToStaticMarkup 各自从 R0 起号，
  // 它们本来就分处不同的文档片段，id 相同也无害。
  const markup = renderToStaticMarkup(
    createElement('div', null, createElement(LoaderBar, {}), createElement(LoaderBar, {})),
  )
  const ids = [...markup.matchAll(/<clipPath id="([^"]+)"/g)].map((m) => m[1])
  assert.equal(ids.length, 2)
  assert.notEqual(ids[0], ids[1])
})

test('LoaderBar：尺寸按高度给，宽度固定 4:1', () => {
  for (const size of SIZES) {
    assert.match(htmlOf(LoaderBar, { size }), new RegExp(`dshpc-loader-bar--${size}(?=")`))
    assert.ok(LOADER_BAR_CSS.includes(`.dshpc-loader-bar--${size}`), `${size} 档缺 CSS`)
  }
  assert.match(LOADER_BAR_CSS, /\.dshpc-loader-bar--md \{ width: 96px; height: 24px; \}/)
  assert.match(htmlOf(LoaderBar, { animated: false }), /dshpc-loader-bar--still/)
})
