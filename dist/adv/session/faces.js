// 会话预览的宿主服务消费面 —— **本地结构化声明**，不引官方包类型。
//
// 为什么本地声明：本包被各插件按子路径 npm 引用，引官方 `@deepseek-ai/dsh-*` 类型会把
// 本包和宿主版本焊死（兄弟项目同款惯例：src/client/primitives.d.ts）。这里只复述
// 我们用到的字段，宿主升级改契约时改这一处。
//
// 事实来源（源码核实，兄弟项目 docs/design/external/dsh-capabilities.md）：
//  · sessions.binding(id) = scopes.get(id)?.binding —— 只查已物化 scope、从不创建
//    （api-session-controller 0.1.7-rc.2 lib/client.js:3406）⇒ 归档 / 久未打开的会话
//    返回 undefined；正解 = 先 retain(id, { source }) 物化 scope（3409/3472），
//    内部触发 manager.get(id).open() 拉历史尾页；引用用完必须 release()。
//  · uiConversation.binding(binding) 校验 binding 归属，非活跃会话抛 inactive session
//    （ui-conversation lib/client.js:3083）⇒ 必须先 retain 再 binding。
//  · .target('chat') 快照同时带 order + nodes（keyed 流，官方 ChatView 真正渲染的那条）
//    与 legacy.nodes（兼容投影，老 kind 名，仅作 order 为空时的兜底）。
export {};
//# sourceMappingURL=faces.js.map