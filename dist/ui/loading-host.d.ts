import type { Translate } from '../utils/i18n.js';
/** 全局注册表键：Symbol.for 跨 bundle 副本天然共享同一个符号。 */
export declare const LOADING_HOST_KEY: unique symbol;
/** 全局单例：已注册则直接返回（不触发 create），否则建一个并注册。 */
export declare function claimLoadingHost<T>(create: () => T): T;
/** 样式一 `toast` = 横排卡；样式二 `block` = 方块卡。 */
export type LoadingVariant = 'toast' | 'block';
/** 七向定位：与 Toast 的六向同名，另加 `center`。默认 `bottom-center`。 */
export type LoadingPosition = 'top-left' | 'top-center' | 'top-right' | 'center' | 'bottom-left' | 'bottom-center' | 'bottom-right';
/** 浮层定位类名（`center` 走基础规则，不需要修饰类）。 */
/**
 * 为什么这里要自注入 `LOADING_CSS`：拿这个类名的调用方通常是**自己画**浮层
 * （否则直接渲染 `Loading` 组件即可），那时 core 里没有任何组件被渲染 ⇒ 没人登记这份 CSS
 * ⇒ 浮层会裸奔。类名出口处登记一次，任何拿类名自绘的路径都有样式（幂等）。
 */
export declare function loadingOverlayClass(position: LoadingPosition): string;
export interface LoadingRequest {
    /** 文案；不传走内置字典 `loadingDefault`（数据加载中 / Loading）。 */
    text?: string;
    variant: LoadingVariant;
    position: LoadingPosition;
    /** 是否铺全屏遮罩（挡住后面的一切点击），默认 false。 */
    mask: boolean;
    /** 遮罩浓度 0–1，默认 0（全透明但仍挡点击）。 */
    maskOpacity: number;
    /** 文案翻译函数，默认用内置字典。 */
    translate?: Translate;
}
export interface LoadingHandle {
    /** 关掉这一次加载提示（重复调用无副作用）。 */
    close(): void;
}
export interface LoadingHost {
    show(request: LoadingRequest): LoadingHandle;
}
export interface LoadingSlotState {
    id: number;
    request: LoadingRequest;
}
/**
 * 全局**只有一个槽位**：任何一次 `show` 都顶掉上一条，屏幕上永远最多一张加载卡
 * （N 种样式、N 个插件、连点多少次都一样）。被顶掉那次的句柄再 `close()` 是空操作，
 * 不会误关后一张。
 */
export declare function createLoadingSlot(): {
    current(): LoadingSlotState | null;
    show(request: LoadingRequest): LoadingHandle;
};
//# sourceMappingURL=loading-host.d.ts.map