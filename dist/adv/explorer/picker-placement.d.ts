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
 * 关键口径（用户 2026-11-03 两轮拍板）：
 *
 * 1. 指定方位 = **优先方位**。该侧放得下就照它（按钮贴定宽区右边界时传 `bottom-end` /
 *    `left-start`，面板不会再向右溢出）；
 * 2. 该侧放不下、**对侧放得下 ⇒ 自动翻边**（bottom↔top、left↔right，对齐轴保持 start/end 不变）；
 * 3. 两侧都放不下 ⇒ 仍按所给方位落位，再**夹紧进视口**（绝不溢出）。
 */
/** 展开方位。 */
export type PickPlacement = 'auto' | 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end' | 'right-start' | 'right-end' | 'left-start' | 'left-end';
/** 锚点矩形（`getBoundingClientRect()` 的结构子集）。 */
export interface AnchorRect {
    left: number;
    top: number;
    right: number;
    bottom: number;
}
/** 视口尺寸（`window.innerWidth / innerHeight`）。 */
export interface Viewport {
    width: number;
    height: number;
}
/** 面板盒子（直接喂 `position: fixed` 的四个内联值）。 */
export interface PickerBox {
    left: number;
    top: number;
    width: number;
    height: number;
}
/** 弹窗宽度（源实现 480，用户 2026-09-29 微调定值）。 */
export declare const PICKER_WIDTH = 480;
/** 弹窗高度上限：空间全够时默认 480×480（用户 2026-11-03 定，原 660）。 */
export declare const PICKER_MAX_H = 480;
/** 判定「下方放得下」的最小高度：低于它就翻到上方（仅 `auto` 用）。 */
export declare const PICKER_MIN_H = 240;
/** 硬地板：锚点上下都极窄时也要给出一个能滚动的高度（此时以夹紧进视口优先）。 */
export declare const PICKER_MIN_FLOOR = 160;
/** 左右展开时的宽度地板（可用宽度再窄也要能看清内容）。 */
export declare const PICKER_MIN_W = 240;
/** 面板与锚点之间的间距。 */
export declare const PICKER_GAP = 12;
/** 面板与视口边缘的最小留白。 */
export declare const VIEWPORT_EDGE = 12;
/**
 * 算面板盒子。
 *
 * @param anchor 锚点矩形（按钮的 `getBoundingClientRect()`）。
 * @param viewport 视口尺寸。
 * @param placement 展开方位，默认 `'auto'`（= 旧行为，不破坏既有调用）。
 * @returns 四舍五入到整数像素的 `{ left, top, width, height }`。
 */
export declare function placePicker(anchor: AnchorRect, viewport: Viewport, placement?: PickPlacement): PickerBox;
//# sourceMappingURL=picker-placement.d.ts.map