// 跨副本 loading 宿主（多插件同页只留一处加载提示）。
//
// core 被打进每个插件的 bundle，模块级状态各副本一份 ⇒ 若各自建浮层，两个空间同时加载
// 会在两处各冒一个。这里与 toast-host 同一手法：globalThis 上用 Symbol.for 的单例，
// 先到场的副本建浮层，其余副本把请求交给它 —— 所有调用落在**同一个屏幕位置**。
// 纯逻辑、零 DOM / React 依赖 ⇒ Node 单测可直接断言单例语义。
/** 全局注册表键：Symbol.for 跨 bundle 副本天然共享同一个符号。 */
export const LOADING_HOST_KEY = Symbol.for('dsh-plugin-core/loading-host');
/** 全局单例：已注册则直接返回（不触发 create），否则建一个并注册。 */
export function claimLoadingHost(create) {
    const g = globalThis;
    const existing = g[LOADING_HOST_KEY];
    if (existing !== undefined)
        return existing;
    const created = create();
    g[LOADING_HOST_KEY] = created;
    return created;
}
/** 浮层定位类名（`center` 走基础规则，不需要修饰类）。 */
export function loadingOverlayClass(position) {
    return `dshpc-loading-overlay dshpc-loading-overlay--${position}`;
}
/**
 * 全局**只有一个槽位**：任何一次 `show` 都顶掉上一条，屏幕上永远最多一张加载卡
 * （N 种样式、N 个插件、连点多少次都一样）。被顶掉那次的句柄再 `close()` 是空操作，
 * 不会误关后一张。
 */
export function createLoadingSlot() {
    let seq = 0;
    let current = null;
    return {
        current: () => current,
        show(request) {
            const id = ++seq;
            current = { id, request };
            let closed = false;
            return {
                close() {
                    // 已经不是自己的那一次了 ⇒ 不动（否则先前的定时器会把后一张关掉）。
                    if (closed || current?.id !== id)
                        return;
                    closed = true;
                    current = null;
                },
            };
        },
    };
}
//# sourceMappingURL=loading-host.js.map