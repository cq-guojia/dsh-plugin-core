/**
 * demo 插件的 server 侧入口。
 *
 * ⚠️ 硬红线：
 *  1. **这里只允许出现插件契约**（name / inject / apply / Config），**禁止 re-export 浏览器侧代码**：
 *     宿主服务端在 Node 下加载本文件，拖进 React / DOM 会炸。
 *  2. 唯一的外部 import 是 `@deepseek-ai/schemastery`（官方 schema 库，兄弟项目同口径的普通依赖）——
 *     `Config` schema 是 0.1.7 起「插件配置由宿主托管」的唯一入口，没有别的路。它保持 external，
 *     由宿主 profile 解析（详见下面 loadSchemastery 的兜底说明）。
 *
 * `Config` 的作用（见 dsh-settings `describe()`）：settings 服务按**活跃 entry**自动派生
 * 「Schema-derived plugin configuration forms」——
 *   · 命名空间 = 本 entry 的 id（`cordis.patch.yml` 那条 insert 的 id，= 包名）；
 *   · **只有 `.volatile()` 字段会进表单**（`volatileForm()` 逐个过滤），非 volatile 字段在
 *     设置页里既不可见也不可写；
 *   · 写入走 profile patch 文档，**宿主负责持久化**；插件不自己落盘、不碰 localStorage。
 */
import { serveModelCatalog, type HostContextLike } from '../../../dist/host/index.js'
import { MODELS_PATH } from './paths.js'

export const name = 'dsh-plugin-core-demo'

/** 不声明式依赖任何宿主服务：模型目录路由用 apply 内 ctx.inject 延迟等待（缺服务 = 没路由）。 */
export const inject: readonly string[] = []

/**
 * 取官方 schema 库。
 *
 * 动态 import + 兜底而不是静态 import 的理由：一旦某个 profile 没装上这个依赖，静态 import 会让
 * **整个 server entry 加载失败**，插件管理页就把它标成「异常」（2026-10-25 的实际事故，当时入口里
 * 一句会抛的调用就是这个下场）。留成 undefined 则退化成「详情页没有配置区」——入口卡片没了，
 * 但侧栏与整页预览照常可用，比整插件挂掉强得多。正常安装一定能解析，这条只是保险。
 */
async function loadSchemastery(): Promise<typeof import('@deepseek-ai/schemastery').default | undefined> {
  try {
    const mod = await import('@deepseek-ai/schemastery')
    return mod.default ?? (mod as unknown as typeof import('@deepseek-ai/schemastery').default)
  } catch {
    return undefined
  }
}

const z = await loadSchemastery()

/**
 * 本插件的设置 schema（`undefined` = schema 库没就位，见上）。
 *
 * **刻意不带 `z<Config>` 类型标注**（`.volatile()` 会改推导类型，带上标注反而 TS2322）。
 * `entryMode`：入口位置（`off`=不显示 / `first`=左侧第一级 / `more`=更多菜单），默认 `more`。
 */
export const Config =
  z === undefined
    ? undefined
    : z.object({
        entryMode: z.string().default('more').volatile(),
      })

export function apply(ctx: HostContextLike): void {
  // 模型目录（供应商 → 模型）只有宿主侧 llm.listModels 拿得到，挂成只读路由给 client fetch。
  serveModelCatalog(ctx, { path: MODELS_PATH })
}
