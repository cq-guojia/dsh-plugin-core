/** 订阅全局秒级心跳；返回退订。**第一个订阅者才起 interval，最后一个退订即停**。 */
export declare function subscribeTicker(cb: () => void): () => void;
/**
 * 每秒拿到「现在」（需要**时间值本身**时用，如悬浮文案）；与 `LiveText` 共用同一条心跳。
 * 不适合整列表用（每次 tick 会 setState 一次）——只在真正需要时间的小块里调。
 */
export declare function useNowMs(): number;
//# sourceMappingURL=ticker.d.ts.map