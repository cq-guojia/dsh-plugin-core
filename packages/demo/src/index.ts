/**
 * demo 插件的 server 侧入口（最小壳）。
 *
 * ⚠️ 两条硬红线：
 *  1. **这里只允许出现插件契约**（name / inject / apply），**禁止 re-export 浏览器侧代码**：
 *     宿主服务端在 Node 下加载本文件，拖进 React / DOM 会炸。
 *  2. **零运行时依赖**：不引任何 `@deepseek-ai/*`（内部 registry，装不到），
 *     因此不声明 schemastery Config schema —— 本插件没有服务端配置。
 *
 * 全部展示逻辑在 client 侧（settings.plugin.item 入口卡片 + sidebar.panellist / main 整页）。
 */
import { serveArchivedSessions, serveModelCatalog, type HostContextLike } from '../../../dist/host/index.js'
import { ARCHIVED_SESSIONS_PATH, MODELS_PATH } from './paths.js'

export const name = 'dsh-plugin-core-demo'

/** 不声明式依赖任何宿主服务：模型目录路由用 apply 内 ctx.inject 延迟等待（缺服务 = 没路由）。 */
export const inject: readonly string[] = []

export function apply(ctx: HostContextLike): void {
  // 模型目录（供应商 → 模型）只有宿主侧 llm.listModels 拿得到，挂成只读路由给 client fetch。
  serveModelCatalog(ctx, { path: MODELS_PATH })
  // 已归档会话 id 集合：client 读不到（官方 UiWorkspace 公开面无此读口），宿主侧取数挂路由。
  serveArchivedSessions(ctx, { path: ARCHIVED_SESSIONS_PATH })
}
