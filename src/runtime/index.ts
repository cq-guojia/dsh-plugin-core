// runtime —— 运行时底座（零 React / 零界面）：跨页通知 + 状态容器。
// 只想用通知或状态、不想拖进控件时引这里；对外入口见 package.json 的 `./runtime`。
export {
  NOTIFY_CHANNEL,
  NOTIFY_EVENTS_KEY,
  NOTIFY_PROJECT_KEY,
  NOTIFY_PROTOCOL,
  claimEventBus,
  createEventBus,
  createNotifyScope,
  defaultNotifyScope,
  getDefaultTaskProject,
  getTabOrigin,
  isEventBusLike,
  normalizeGroup,
  notifyMessage,
  resolveProject,
  setDefaultTaskProject,
  subscribeNotifications,
  type EventBus,
  type NotifyDetail,
  type NotifyLevel,
  type NotifyListener,
  type NotifyMessage,
  type NotifyMessageOptions,
  type NotifyScope,
  type NotifyScopeOptions,
} from './notify.js'
export { createStore, type RuntimeStore } from './store.js'
export {
  createExecutorRegistry,
  executors,
  type ExecutorContext,
  type ExecutorHandler,
  type ExecutorProgress,
  type ExecutorRegistry,
  type ExecutorResult,
} from './executor.js'
