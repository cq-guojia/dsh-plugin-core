/**
 * 宿主 ↔ client 共用的路由常量（两边都从这里引，避免各写一份字符串走岔）。
 * 宿主 `serveModelCatalog` 注册它、client `connectHost` fetch 它。
 */
export const MODELS_PATH = '/api/dsh-plugin-core-demo/models'

/** 宿主 `serveArchivedSessions` 注册、client `real-sessions` fetch：已归档会话 id 集合。 */
export const ARCHIVED_SESSIONS_PATH = '/api/dsh-plugin-core-demo/archived-sessions'
