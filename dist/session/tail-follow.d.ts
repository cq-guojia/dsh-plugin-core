/** 滚动容器的一次几何读数（组件侧从 `.dshpc-modal__body` 读取）。 */
export interface TailMetrics {
    scrollTop: number;
    scrollHeight: number;
    clientHeight: number;
}
/** 与宿主 DOM 的唯一接口：读一次几何、写一次 scrollTop、调度 / 取消一帧。 */
export interface TailHost {
    metrics(): TailMetrics;
    setScrollTop(top: number): void;
    frame(fn: () => void): number;
    cancelFrame(id: number): void;
}
export interface TailFollower {
    /** 首次打开：立即到底（instant，不做动画）。 */
    open(): void;
    /** 宿主快照内容版本变化 —— 唯一允许启动追尾的事件。 */
    content(): void;
    /** scroll 事件：只更新「用户是否想跟」的意图，不产生任何滚动。 */
    scrolled(): void;
    /** 卸载：停动画、断引用。 */
    dispose(): void;
}
/** 判定「当时就在底部」的容差（px）。 */
export declare const TAIL_NEAR_BOTTOM_PX = 24;
/** 内容版本窗口内，连续多少帧「已到底且高度不变」才认为这批内容渲染完。 */
export declare const TAIL_STABLE_FRAMES = 3;
export declare function createTailFollower(host: TailHost): TailFollower;
//# sourceMappingURL=tail-follow.d.ts.map