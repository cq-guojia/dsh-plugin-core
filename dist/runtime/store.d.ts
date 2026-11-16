export interface RuntimeStore<T> {
    getState(): T;
    /**
     * `replace = true` 时整块替换（调用方保证传的是完整的 `T`）。
     * 缺省走 zustand 的合并语义。
     */
    setState(next: T, replace?: boolean): void;
    subscribe(listener: () => void): () => void;
}
/**
 * `initialState` 可以是值或工厂：工厂形式让「模块级创建」不必在 import 期就求值，
 * 与 zustand 自身一致。
 */
export declare function createStore<T>(initialState: T | (() => T)): RuntimeStore<T>;
//# sourceMappingURL=store.d.ts.map