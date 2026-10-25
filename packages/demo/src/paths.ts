/**
 * 宿主 ↔ client 共用的常量（两边都从这里引，避免各写一份字符串走岔）。
 * ─ MODELS_PATH：宿主 `serveModelCatalog` 注册它、client `connectHost` fetch 它。
 */
export const MODELS_PATH = '/api/dsh-plugin-core-demo/models'
