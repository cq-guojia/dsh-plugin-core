/**
 * 状态容器：全仓唯一接触 `zustand` 的地方。
 *
 * 为什么要有这一层：上层只认这里导出的 `RuntimeStore`，将来换掉 zustand（或换版本、
 * 或换成自研）只改这一个文件，`adv/*` 与 `ui/*` 的 import 一行不动。这与
 * `ui/official.ts` 收口官方包是同一条原则 —— 区别只是那边是「必须」（宿主平台模块），
 * 这边是「选择」（隔离第三方实现）。
 *
 * 接口故意只有四个方法，不给 selector / 中间件 / devtools：一暴露，上层就依赖 zustand
 * 的具体形态，收口就白做了。需要派生数据在调用方算（并有自己的缓存策略）。
 *
 * 零 React：React 侧由消费方自己接（现成的例子是 `adv/tasks/TaskBar.ts` 里的
 * `useSyncExternalStore` 三参），和 `zustand/vanilla` + `zustand` 的分法一致。
 */
import { createStore as createZustandStore } from 'zustand/vanilla'

export interface RuntimeStore<T> {
  getState(): T
  /**
   * `replace = true` 时整块替换（调用方保证传的是完整的 `T`）。
   * 缺省走 zustand 的合并语义。
   */
  setState(next: T, replace?: boolean): void
  subscribe(listener: () => void): () => void
}

/**
 * `initialState` 可以是值或工厂：工厂形式让「模块级创建」不必在 import 期就求值，
 * 与 zustand 自身一致。
 */
export function createStore<T>(initialState: T | (() => T)): RuntimeStore<T> {
  const resolve = (): T =>
    typeof initialState === 'function' ? (initialState as () => T)() : initialState
  const store = createZustandStore<T>(() => resolve())
  return {
    getState: () => store.getState(),
    setState: (next, replace) => {
      // zustand 的 setState 是重载，`replace` 只能是字面量 true 或省略，必须分支调用。
      if (replace === true) store.setState(next, true)
      else store.setState(next)
    },
    subscribe: (listener) => store.subscribe(listener),
  }
}
