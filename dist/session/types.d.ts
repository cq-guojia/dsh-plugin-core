export type SessionRole = 'user' | 'assistant' | 'tool' | 'system';
export interface SessionAttachment {
    name: string;
    /** 工作区内相对路径（用于「打开」）。 */
    path: string;
    bytes?: number;
}
export interface SessionMessage {
    id: string;
    role: SessionRole;
    /** 纯文本正文；富内容（工具卡 / 代码块）走 `renderMessage` 定制。 */
    text: string;
    createdAt?: string;
    attachments?: SessionAttachment[];
}
export interface SessionSource {
    /** 取消息列表（按时间正序）。 */
    listMessages(sessionId: string, signal?: AbortSignal): Promise<SessionMessage[]>;
    /** 下载附件（可选：宿主没这能力就不显示下载钮）。 */
    download?(sessionId: string, path: string, signal?: AbortSignal): Promise<Uint8Array>;
}
export declare const ROLE_LABEL_KEY: {
    readonly user: "sessionRoleUser";
    readonly assistant: "sessionRoleAssistant";
    readonly tool: "sessionRoleTool";
    readonly system: "sessionRoleTool";
};
//# sourceMappingURL=types.d.ts.map