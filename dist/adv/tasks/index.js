// tasks —— 后台任务中心（一整块功能：池 + React 读取入口 + 任务条）。
// 通知广播的实做在 `runtime/notify`，这里只转发；对外入口见 package.json 的 `./adv/tasks`。
export { TaskBar } from './TaskBar.js';
export { useTasks } from './useTasks.js';
export { TASK_NOTIFICATIONS_CHANNEL, TASK_NOTIFICATIONS_EVENTS_KEY, TASK_NOTIFICATIONS_KEY, TASK_NOTIFICATIONS_LOCK_PREFIX, TASK_NOTIFICATIONS_PROJECT_KEY, TASK_NOTIFICATIONS_PROTOCOL, TaskNotificationConflictError, claimTaskNotificationEvents, claimTaskNotifications, createTaskNotificationEventBus, createTaskNotificationPool, emitTaskNotificationEvent, getDefaultTaskProject, notifyMessage, notifyTask, selectTaskNotifications, setDefaultTaskProject, subscribeTaskNotificationEvents, taskKey, taskNotificationEvents, taskNotifications, } from './pool.js';
//# sourceMappingURL=index.js.map