/**
 * 全局浮动 Loading 指示器（UI 基础层 · P1）。
 *
 * 用法：
 *   <Loading />
 *
 * 行为：
 * - fixed 定位在主内容容器右下角，**不占布局空间**；
 * - 右侧贴齐主内容容器右边缘（`anchorId` 默认 `dshpc-main`），底部留 16px；
 * - **三个小方块依次脉动，无任何文案**（基础抽象统一外观，禁止加字；用户 2026-10-06）；
 * - 监听窗口 resize / scroll / 内容盒 resize，自动跟住内容宽度。
 *
 * 配套 also 导出 `<RunningBlocks />`：同样的三个脉动方块（无文案），
 * 用于表格单元格里的「运行中」状态指示。
 *
 * 文档登记：docs/design/ui-foundation.md §二「唯一实现表」。
 */
import { createElement as h } from 'react';
import { type Translate } from '../utils/i18n.js';
import { type LoadingHandle, type LoadingPosition, type LoadingVariant } from './loading-host.js';
export interface LoadingProps {
    /** 主内容容器 id，loading 贴到它的右下角；默认 `dshpc-main`。 */
    anchorId?: string;
}
/** 浮动 Loading pill：三个脉动方块（无文案；基础抽象统一外观）。 */
export declare function Loading(props: LoadingProps): ReturnType<typeof h>;
/** 运行中状态用的三个脉动方块（无文案），颜色跟随 `currentColor`。 */
export declare function RunningBlocks(): ReturnType<typeof h>;
/** 两种加载提示共用的 props。 */
export interface LoadingViewProps {
    /** 文案，默认内置字典 `loadingDefault`（数据加载中 / Loading）。 */
    text?: string;
    /** 文案翻译函数，默认用内置字典。 */
    translate?: Translate;
}
export interface LoadingOptions extends LoadingViewProps {
    /** `toast` = 横排卡（默认）；`block` = 方块卡。 */
    variant?: LoadingVariant;
    /** 屏幕方位，默认 `bottom-center`（与 Toast 同屏位）；`center` 为正中。 */
    position?: LoadingPosition;
    /** 铺全屏遮罩挡住后面的一切点击，默认 false（不挡，随点随走）。 */
    mask?: boolean;
    /** 遮罩浓度 0–1，默认 0（全透明，但仍挡住点击）。 */
    maskOpacity?: number;
}
/** 样式一：横排提示卡（转圈在左、文字在右），灰色底与 notify 的 info 卡同色。就地渲染，位置随调用方。 */
export declare function LoadingToast(props: LoadingViewProps): ReturnType<typeof h>;
/** 样式二：方块卡（转圈在上、文字在下，内距更大）。就地渲染，位置随调用方。 */
export declare function LoadingBlock(props: LoadingViewProps): ReturnType<typeof h>;
/**
 * 命令式加载提示（全局唯一浮层，**不自动消失**）。所有插件、所有位置调用都落在**同一处**
 * （默认屏幕下方居中，与 Toast 同屏位），且屏幕上永远只有一张卡 —— 后一次调用直接顶掉
 * 前一次，被顶掉那次的句柄再 `close()` 是空操作。收起只能靠自己调 `close()`。
 *
 * ```ts
 * const loading = showLoading({ text: '正在保存…', mask: true, maskOpacity: 0.3 })
 * await save()
 * loading.close()
 * ```
 *
 * 无 `document` 时静默返回空句柄（Node 单测 / SSR 不炸）。
 */
export declare function showLoading(opts?: LoadingOptions): LoadingHandle;
//# sourceMappingURL=Loading.d.ts.map