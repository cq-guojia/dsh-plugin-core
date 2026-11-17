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
  has(key: string): boolean
  get(key: string): V | undefined
  set(key: string, value: V): void
  delete(key: string): void
  clear(): void
  readonly size: number
}

type CacheEntry<V> = { readonly value: V; readonly writtenAt: number }

/**
 * @param limit 容量上限（≥1 的整数），超过即淘汰最久未用项；非法值抛错。
 * @param ttlMs 写入后保留时长（必须 > 0）；默认 Infinity = 不按时间淘汰；非法值抛错。
 * @param now 时钟注入点，默认 Date.now；测试可用假时钟。
 */
export function createBoundedCache<V>(
  limit: number,
  ttlMs = Number.POSITIVE_INFINITY,
  now: () => number = Date.now,
): BoundedCache<V> {
  if (!Number.isInteger(limit) || limit < 1) {
    throw new Error('bounded cache limit must be a positive integer')
  }
  // NaN / 0 / 负数都会让时间轴静默失效或退化成「每次换键」，构造期直接拦下。
  if (!(ttlMs > 0)) {
    throw new Error('bounded cache ttl must be positive')
  }
  const entries = new Map<string, CacheEntry<V>>()
  const expired = (entry: CacheEntry<V>): boolean => now() - entry.writtenAt > ttlMs
  const dropIfExpired = (key: string, entry: CacheEntry<V>): boolean => {
    if (!expired(entry)) return false
    entries.delete(key)
    return true
  }
  const refreshOrder = (key: string, entry: CacheEntry<V>): void => {
    entries.delete(key)
    entries.set(key, entry)
  }
  return {
    has(key) {
      const entry = entries.get(key)
      if (entry === undefined) return false
      if (dropIfExpired(key, entry)) return false
      refreshOrder(key, entry)
      return true
    },
    get(key) {
      const entry = entries.get(key)
      if (entry === undefined) return undefined
      if (dropIfExpired(key, entry)) return undefined
      refreshOrder(key, entry)
      return entry.value
    },
    set(key, value) {
      entries.delete(key)
      entries.set(key, { value, writtenAt: now() })
      while (entries.size > limit) {
        const oldest = entries.keys().next()
        if (oldest.done) break
        entries.delete(oldest.value)
      }
    },
    delete(key) { entries.delete(key) },
    clear() { entries.clear() },
    get size() { return entries.size },
  }
}
