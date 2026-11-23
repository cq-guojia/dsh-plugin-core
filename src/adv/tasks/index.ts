// tasks —— 后台任务中心：开放执行器 + 任务编排 + 服务端 SSE 投影 + 核心列表控件。
// 纯数据契约在 model，共享状态在 store，编排在 coordinator，对外接线在 api。

export {
  connectTaskCenter,
  connectTaskLayout,
  defaultTaskHost,
  mountTaskUI,
  pressTaskButton,
  projectTasks,
  startTask,
  subscribeTaskNotifications,
  taskCenterStore,
  type MountTaskUIOptions,
  type MountTasksOptions,
  type TaskCenterHost,
  type TaskCoordinator,
  type TaskNotificationListener,
} from './api.js'
export {
  createCoordinator,
  type CoordinatorHost,
  type CoordinatorOptions,
  type TaskCoordinator as CoordinatorInstance,
} from './coordinator.js'
export type { TaskActionFailure, TaskBarForm, TaskBarProps } from './TaskBar.js'
export { createExecutorRegistry, executors } from '../../runtime/executor.js'
export type {
  ExecutorContext,
  ExecutorHandler,
  ExecutorProgress,
  ExecutorResult,
} from '../../runtime/executor.js'
export type {
  DisplayTitle,
  StartTaskInput,
  TaskBroadcast,
  TaskButton,
  TaskNotifyConfig,
  TaskNotifyState,
  TaskProgress,
  TaskRecord,
  TaskRowButton,
  TaskScope,
  TaskSettlement,
  TaskState,
  TaskToastConfig,
  TaskToastState,
  TaskWhen,
  TaskNotificationRecord,
} from './model.js'
export { buttonsForState, formatDisplayTitle, isDisplayTitle, notifyForState, toastForState } from './model.js'
export { connectTaskStream, parseTaskFrames } from './stream.js'
export type { TaskStreamConnection, TaskStreamGiveUpReason, TaskStreamOptions } from './stream.js'
export { connectSharedTaskStream } from './shared-stream.js'
export type {
  SharedChannelFactory,
  SharedChannelLike,
  SharedLifecycle,
  SharedLockFactory,
  SharedLockLike,
  SharedLockManager,
  SharedStreamOptions,
} from './shared-stream.js'
