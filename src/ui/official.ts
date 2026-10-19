/**
 * L1 adapter —— 全仓**唯一** import 官方 primitives 平台模块的文件。
 *
 * 事实（对齐兄弟项目 dsh-task-dispatch-table）：
 *  - `@deepseek-ai/dsh-client-ui-primitives` 是 dsh 宿主内核提供的**平台模块**
 *    （见兄弟仓 tsdown.client.config.ts 的 PLATFORM_MODULES），运行时由宿主模块表 require() 解析，
 *    既不在本包 dependencies、也**不写进** dsh.client.inject。
 *  - 故本文件在库 `tsc` 下靠 `src/types/primitives.d.ts`（版本钉死的 ambient 声明）编译；
 *    在宿主里由 `__ModuleLoader__` 解析；下游打包（esbuild / tsdown / vite）必须把 `@deepseek-ai/*` 标 **external**。
 *
 * 收敛目的（本次重构硬要求：能抽象的一律往上抽）：
 *  全仓官方面只此一个 import 点 —— grep 即审计、stub / 替换只改一处、类型版本注释只一份、漂移告警统一。
 *  **任何控件都不许在别处 import 平台模块**，只从本文件消费。
 *
 * ⚠️ 非宿主消费面（Node 单测、根预览站）需另配 stub：本文件静态 import 平台模块，
 *    在 Node 里直接 import 会 `ERR_MODULE_NOT_FOUND` —— 这正是旧坑（SelectField 曾因依赖官方 Menu 被删）。
 *    该 stub loader 属 P0 待办，见 docs/requirements.md。
 */
import * as Official from '@deepseek-ai/dsh-client-ui-primitives'

export * from '@deepseek-ai/dsh-client-ui-primitives'

/** 官方命名空间：给运行时兜底 / 审计用；业务代码优先用上面的具名导出。 */
export { Official }

const warned = new Set<string>()

/**
 * 运行时取一个官方导出；缺失（宿主升级改名 / 老宿主没有）时**一次性**告警并回落到 `fallback`，
 * 不静默白屏。仅用于「官方可能漂移」的边角件；稳定常用件直接用具名导出即可。
 *
 * @param name - 官方导出名。
 * @param fallback - 缺失时的兜底（通常是保留的自绘实现）。
 */
export function pickOfficial<K extends keyof typeof Official>(
  name: K,
  fallback: (typeof Official)[K],
): (typeof Official)[K] {
  const value = Official[name]
  if (value === undefined) {
    if (!warned.has(name as string)) {
      warned.add(name as string)
      console.warn(`[dsh-plugin-core:official] 官方 primitive "${String(name)}" 缺失，回落到本地兜底`)
    }
    return fallback
  }
  return value
}
