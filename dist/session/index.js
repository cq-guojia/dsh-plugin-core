// session —— 会话预览（镜像官方会话 UI 的完整业务模块）。
//
// 定位（2026-10-22 重建，替换 18-0610 的占位骨架）：
// 把「看一眼某个会话、看完即关」封装成与官方会话页同构的只读弹窗——
// 数据链走宿主官方服务（sessions.retain → binding → uiConversation.target('chat')），
// 渲染按官方文件名一一对应镜像（./mirror/），**归档会话同样可读**
// （retain 物化 scope 与归档正交；archiveSession 只藏显示面）。
//
// 续聊正道（底层 keyed 数组是只读快照，官方无写面，框内不可打字续聊）：
// fork 开分支 → uiWorkspace.openSession 跳官方会话区；底部暂存输入框的「确定」
// 经 onContinue 由调用方完成 fork + host 侧 agent.send 起轮次 + 跳转。
//
// 使用：
//   const view = openSessionView(sessions, uiConversation, sessionId, 'my-plugin')
//   if (view !== null) {
//     h(SessionViewModal, {
//       sessionId, view, onClose: () => { view.dispose(); setOpen(false) },
//       forkSession, openHostSession,           // 官方 ISessions.fork / uiWorkspace.openSession
//       onContinue: async (message) => { … },  // 暂存输入框：fork + host send + 跳转
//       onOpenFile: (path) => { … },           // 文件打开出口（缺省 = 链接降级纯文本）
//     })
//   }
export { SessionViewModal } from './SessionViewModal.js';
export { DEFAULT_RETAIN_SOURCE, openSessionView, } from './open-session-view.js';
//# sourceMappingURL=index.js.map