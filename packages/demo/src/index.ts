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
export const name = 'dsh-plugin-core-demo'

/** 无宿主服务依赖：不碰会话 / 定时器 / 工作区等能力。 */
export const inject: readonly string[] = []

export function apply(): void {}
