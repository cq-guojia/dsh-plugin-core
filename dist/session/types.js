// 会话预览的数据契约。
//
// 为什么是「注入能力」而不是「传数据」：会话预览**内部有交互**（附件下载 / 打开文件），
// 光有一堆静态消息流不够用，它必须能回调宿主（需求文档 §6）。
// 插件从 ctx 取出这一小块传进来 —— 不传整个 ctx，避免把本包和宿主版本焊死（§5.5）。
export const ROLE_LABEL_KEY = {
    user: 'sessionRoleUser',
    assistant: 'sessionRoleAssistant',
    tool: 'sessionRoleTool',
    system: 'sessionRoleTool',
};
//# sourceMappingURL=types.js.map