/**
 * 插件壳（server 侧入口）—— 本包的**第二种身份**：可被 DSH 直接安装的「组件预览」插件。
 *
 * ⚠️ 两条硬红线：
 *  1. **这里只允许出现插件契约**（name / inject / apply），**禁止 re-export `./ui`、`./design`
 *     等浏览器侧代码**：宿主服务端在 Node 下加载本文件，拖进 React / DOM 会炸；且 npm 消费者走
 *     `dsh-plugin-core/ui` 这类**子路径导出**，根本不经过本文件 —— 两种身份互不干扰。
 *  2. **零运行时依赖**：不引任何 `@deepseek-ai/*`（内部 registry，npm 消费者装不上），
 *     因此这里不声明 schemastery Config schema；插件无服务端配置，展示全在 client 侧。
 *
 * npm 供应线：本包对外的能力面仍是 `./design ./ui ./utils ./explorer ./session` 六个子路径，
 * 与插件身份无关；`main` 指向本文件只是给宿主一个入口。
 */
export const name = 'dsh-plugin-core'

/** 无宿主服务依赖：预览插件不碰会话 / 定时器 / 工作区等能力。 */
export const inject: readonly string[] = []

/**
 * 服务端无逻辑：整页预览与设置入口都由 client 侧注册
 * （`settings.plugin.item` 卡片 + `sidebar.panellist` / `main` 槽）。
 */
export function apply(): void {}
