/**
 * 选文件弹窗的锚定定位（**纯函数、零 DOM**）：给定锚点矩形 + 视口 + 方位，算出面板盒子。
 *
 * 八档方位 + `auto`（用户 2026-11-03 定，8 档就是他点的规格）：
 *
 * | 值 | 面板落点 |
 * |---|---|
 * | `bottom-start` | 下方，左缘对齐（默认那档「向右下」） |
 * | `bottom-end`   | 下方，右缘对齐（向左下） |
 * | `top-start`    | 上方，左缘对齐（向右上） |
 * | `top-end`      | 上方，右缘对齐（向左上） |
 * | `right-start`  | 按钮右侧，**顶边与按钮顶边齐平**（向右展开） |
 * | `right-end`    | 按钮右侧，**底边与按钮底边齐平**（向右展开、底部对齐） |
 * | `left-start`   | 按钮左侧，顶边齐平（向左展开） |
 * | `left-end`     | 按钮左侧，底边齐平（向左展开、底部对齐） |
 * | `auto`         | 旧行为：优先下方，下方不够翻上方，横向夹紧 |
 *
 * 关键口径：**指定方位后不再自动翻边**。用户要的是「说往左就往左」——按钮贴在定宽区
 * 最右边时传 `bottom-end` / `left-start`，面板就不会再向右溢出；只有真的超出视口才夹紧。
 */

/** 展开方位。 */
export type PickPlacement =
  | 'auto'
  | 'bottom-start' | 'bottom-end'
  | 'top-start' | 'top-end'
  | 'right-start' | 'right-end'
  | 'left-start' | 'left-end'

/** 锚点矩形（`getBoundingClientRect()` 的结构子集）。 */
export interface AnchorRect {
  left: number
  top: number
  right: number
  bottom: number
}

/** 视口尺寸（`window.innerWidth / innerHeight`）。 */
export interface Viewport {
  width: number
  height: number
}

/** 面板盒子（直接喂 `position: fixed` 的四个内联值）。 */
export interface PickerBox {
  left: number
  top: number
  width: number
  height: number
}

/** 弹窗宽度（源实现 480，用户 2026-09-29 微调定值）。 */
export const PICKER_WIDTH = 480
/** 弹窗高度上限：空间全够时默认 480×480（用户 2026-11-03 定，原 660）。 */
export const PICKER_MAX_H = 480
/** 判定「下方放得下」的最小高度：低于它就翻到上方（仅 `auto` 用）。 */
export const PICKER_MIN_H = 240
/** 硬地板：锚点上下都极窄时也要给出一个能滚动的高度（此时以夹紧进视口优先）。 */
export const PICKER_MIN_FLOOR = 160
/** 左右展开时的宽度地板（可用宽度再窄也要能看清内容）。 */
export const PICKER_MIN_W = 240
/** 面板与锚点之间的间距。 */
export const PICKER_GAP = 12
/** 面板与视口边缘的最小留白。 */
export const VIEWPORT_EDGE = 12

function clamp(value: number, low: number, high: number): number {
  // high 可能小于 low（视口比面板还小时）：以 low 为准，宁可贴边也不反向。
  return Math.min(Math.max(value, low), Math.max(low, high))
}

/**
 * 算面板盒子。
 *
 * @param anchor 锚点矩形（按钮的 `getBoundingClientRect()`）。
 * @param viewport 视口尺寸。
 * @param placement 展开方位，默认 `'auto'`（= 旧行为，不破坏既有调用）。
 * @returns 四舍五入到整数像素的 `{ left, top, width, height }`。
 */
export function placePicker(
  anchor: AnchorRect,
  viewport: Viewport,
  placement: PickPlacement = 'auto',
): PickerBox {
  const vw = viewport.width
  const vh = viewport.height
  const GAP = PICKER_GAP
  const EDGE = VIEWPORT_EDGE
  const fullWidth = Math.min(PICKER_WIDTH, Math.max(vw - 2 * EDGE, 0))

  if (placement === 'auto') {
    // 旧行为逐字保留：先量上下剩余空间决定展向，高度跟着所选那侧走，横向夹紧。
    const availBelow = vh - EDGE - (anchor.bottom + GAP)
    const availAbove = anchor.top - GAP - EDGE
    const below = availBelow >= PICKER_MIN_H || availBelow >= availAbove
    const height = Math.max(Math.min(PICKER_MAX_H, below ? availBelow : availAbove), PICKER_MIN_FLOOR)
    const left = clamp(anchor.left, EDGE, vw - EDGE - fullWidth)
    const top = below
      ? clamp(Math.min(anchor.bottom + GAP, vh - EDGE - height), EDGE, vh - EDGE - height)
      : clamp(anchor.top - GAP - height, EDGE, vh - EDGE - height)
    return round({ left, top, width: fullWidth, height })
  }

  const vertical = placement.startsWith('bottom') || placement.startsWith('top')
  if (vertical) {
    const below = placement.startsWith('bottom')
    const startAligned = placement.endsWith('start')
    const avail = below
      ? vh - EDGE - (anchor.bottom + GAP)
      : anchor.top - GAP - EDGE
    const height = Math.max(Math.min(PICKER_MAX_H, avail), PICKER_MIN_FLOOR)
    const rawLeft = startAligned ? anchor.left : anchor.right - fullWidth
    const left = clamp(rawLeft, EDGE, vw - EDGE - fullWidth)
    const rawTop = below ? anchor.bottom + GAP : anchor.top - GAP - height
    const top = clamp(rawTop, EDGE, vh - EDGE - height)
    return round({ left, top, width: fullWidth, height })
  }

  // 左右展开：宽度跟着那一侧的实际空间走，高度取视口高度（上下各留 EDGE）。
  const toRight = placement.startsWith('right')
  const startAligned = placement.endsWith('start')
  const availW = toRight ? vw - EDGE - (anchor.right + GAP) : anchor.left - GAP - EDGE
  const width = Math.max(Math.min(PICKER_WIDTH, availW), Math.min(PICKER_MIN_W, Math.max(vw - 2 * EDGE, 0)))
  const height = Math.min(PICKER_MAX_H, Math.max(vh - 2 * EDGE, 0))
  const rawLeft = toRight ? anchor.right + GAP : anchor.left - GAP - width
  const left = clamp(rawLeft, EDGE, vw - EDGE - width)
  const rawTop = startAligned ? anchor.top : anchor.bottom - height
  const top = clamp(rawTop, EDGE, vh - EDGE - height)
  return round({ left, top, width, height })
}

function round(box: PickerBox): PickerBox {
  return {
    left: Math.round(box.left),
    top: Math.round(box.top),
    width: Math.round(box.width),
    height: Math.round(box.height),
  }
}
