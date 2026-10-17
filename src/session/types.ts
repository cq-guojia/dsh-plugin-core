// 会话预览的数据契约。
//
// 为什么是「注入能力」而不是「传数据」：会话预览**内部有交互**（附件下载 / 打开文件），
// 光有一堆静态消息流不够用，它必须能回调宿主（需求文档 §6）。
// 插件从 ctx 取出这一小块传进来 —— 不传整个 ctx，避免把本包和宿主版本焊死（§5.5）。

export type SessionRole = 'user' | 'assistant' | 'tool' | 'system'

export interface SessionAttachment {
  name: string
  /** 工作区内相对路径（用于「打开」）。 */
  path: string
  bytes?: number
}

export interface SessionMessage {
  id: string
  role: SessionRole
  /** 纯文本正文；富内容（工具卡 / 代码块）走 `renderMessage` 定制。 */
  text: string
  createdAt?: string
  attachments?: SessionAttachment[]
}

export interface SessionSource {
  /** 取消息列表（按时间正序）。 */
  listMessages(sessionId: string, signal?: AbortSignal): Promise<SessionMessage[]>
  /** 下载附件（可选：宿主没这能力就不显示下载钮）。 */
  download?(sessionId: string, path: string, signal?: AbortSignal): Promise<Uint8Array>
}

export const ROLE_LABEL_KEY = {
  user: 'sessionRoleUser',
  assistant: 'sessionRoleAssistant',
  tool: 'sessionRoleTool',
  system: 'sessionRoleTool',
} as const
