/**
 * 长生命周期页面通用的有界缓存：容量上限（LRU 淘汰）+ 可选写入 TTL（过期即删）。
 *
 * 参照成熟缓存的通行做法：Java LinkedHashMap 的 access-order + removeEldestEntry、
 * Caffeine 的 maximumSize + expireAfterWrite。TTL 从写入时刻算；get / has 只刷新
 * LRU 顺序、不续命 —— 幂等键必须按第一次写入的时间窗过期，避免持续点击把窗口拖长。
 *
 * 零依赖、零 DOM，Node 自检可直接 import。
 */
export interface BoundedCache<V> {
    has(key: string): boolean;
    get(key: string): V | undefined;
    set(key: string, value: V): void;
    delete(key: string): void;
    clear(): void;
    readonly size: number;
}
/**
 * @param limit 容量上限（≥1 的整数），超过即淘汰最久未用项；非法值抛错。
 * @param ttlMs 写入后保留时长（必须 > 0）；默认 Infinity = 不按时间淘汰；非法值抛错。
 * @param now 时钟注入点，默认 Date.now；测试可用假时钟。
 */
export declare function createBoundedCache<V>(limit: number, ttlMs?: number, now?: () => number): BoundedCache<V>;
//# sourceMappingURL=bounded-cache.d.ts.map