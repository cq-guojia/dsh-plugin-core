/**
 * LoaderBar —— 胶囊不定进度 loading（Loader 家族成员）。
 *
 * 图形来源：设计出的「轨道 + 蓝色段 + 斜纹」胶囊条。动画是**不定进度**语义：
 * 蓝色那半截**固定不动**，只有它上面的一道道细斜纹单向流动（0.55 秒走一个条纹周期），
 * 看着像条纹在转，不表示任何百分比。要「确定进度」别改这个控件 —— 它是固定加载态，
 * 不是进度条 API。
 *
 * 尺寸轴按**高度**给（宽固定 4:1）：图形本身是横条，套方形的尺寸轴没意义。
 *
 * 实现要点：外层 `<g clip-path>` 静止、只让内层的蓝色段动。若把 `clip-path` 与
 * `transform` 放在同一层，裁剪框会跟着平移，等于没裁，蓝段会跑出胶囊外。
 * clipPath 的 id 由 `useId` 生成（同一页面可能有多个实例，写死 id 会互相抢）。
 *
 * 边界同 `Loader`：不带背景、不带内距、不带定位。
 *
 * ⚠️ 图形数据在 `loader-bar-art.ts`（源 SVG 一次性转录），别手改坐标。
 */
import { createElement as h, useId } from 'react'
import { ensureComponentStyles } from './css.js'
import { LOADER_BAR_CSS } from './controls-css.js'
import { BAR_PATHS, type LogoPath } from './loader-bar-art.js'
import type { LoaderSize } from './Loader.js'

/** 源图三条路径的固定顺序：轨道 / 蓝色段 / 斜纹。 */
const TRACK_INDEX = 0
const FILL_INDEX = 1
const STRIPE_INDEX = 2

/**
 * 斜纹的横向重复周期（用户单位）：源图相邻斜线的间距。
 * 平移整整一个周期后与原图重合 ⇒ 循环无缝。
 * ⚠️ 必须与 `loader-bar.css` 里 `translateX(85.333px)` 保持一致。
 */
const STRIPE_PERIOD = 85.333

/** 取第 index 条路径：转录不全就当场抛，别静默少画一块。 */
function pathAt(paths: readonly LogoPath[], index: number): LogoPath {
  const path = paths[index]
  if (path === undefined) {
    throw new Error(`loader-bar-art 缺少第 ${String(index)} 条路径`)
  }
  return path
}

export interface LoaderBarProps {
  /** 尺寸档（按高度），默认 `md`（96×24）。 */
  size?: LoaderSize
  /** 是否播放动画，默认 `true`；`false` 时蓝段停在左侧原位。 */
  animated?: boolean
  /** 无障碍文案。不传 = 纯装饰（`aria-hidden`）；传了 = `role="status"` 由它播报。 */
  label?: string
  /** 追加 class（只允许补布局，不许覆盖外观）。 */
  className?: string
}

/**
 * 渲染胶囊不定进度 loading。
 *
 * @param props 见 {@link LoaderBarProps}。
 * @returns `<svg>` 元素。
 */
export function LoaderBar(props: LoaderBarProps): ReturnType<typeof h> {
  ensureComponentStyles('loader-bar', LOADER_BAR_CSS)
  const { size = 'md', animated = true, label, className } = props
  // useId 返回形如 `:r0:` 的串，冒号放进 url(#…) 需要转义，这里直接剔掉。
  const clipId = `dshpc-loader-bar-clip-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`
  const track = pathAt(BAR_PATHS, TRACK_INDEX)
  const fill = pathAt(BAR_PATHS, FILL_INDEX)
  const stripe = pathAt(BAR_PATHS, STRIPE_INDEX)
  const classes = ['dshpc-loader-bar', `dshpc-loader-bar--${size}`]
  if (animated === false) classes.push('dshpc-loader-bar--still')
  if (className !== undefined && className !== '') classes.push(className)
  return h(
    'svg',
    {
      className: classes.join(' '),
      viewBox: '0 384 1024 256',
      role: label === undefined ? undefined : 'status',
      'aria-label': label,
      'aria-hidden': label === undefined ? true : undefined,
      focusable: 'false',
    },
    h(
      'defs',
      null,
      // 裁到「蓝色段」本身：条纹平移时不会跑到灰色轨道上
      h(
        'clipPath',
        { id: clipId },
        h('rect', { x: 128, y: 426.667, width: 554.667, height: 170.667, rx: 85.333 }),
      ),
    ),
    h('path', { d: track.d, fill: track.fill }),
    h('path', { d: fill.d, fill: fill.fill }),
    h(
      'g',
      { clipPath: `url(#${clipId})` },
      h(
        'g',
        { className: 'dshpc-loader-bar__stripe' },
        h('path', { d: stripe.d, fill: stripe.fill }),
        // 往左再画一份同样的条纹：平移一个周期时左边界不会露空
        h(
          'g',
          { transform: `translate(${String(-STRIPE_PERIOD)} 0)` },
          h('path', { d: stripe.d, fill: stripe.fill }),
        ),
      ),
    ),
  )
}
