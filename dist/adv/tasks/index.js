// tasks —— 后台任务中心：开放执行器 + 任务编排 + 服务端 SSE 投影 + 核心列表控件。
// 纯数据契约在 model，共享状态在 store，编排在 coordinator，对外接线在 api。
export { connectTaskCenter, connectTaskLayout, defaultTaskHost, mountTaskUI, pressTaskButton, projectTasks, startTask, subscribeTaskNotifications, taskCenterStore, } from './api.js';
export { createCoordinator, } from './coordinator.js';
export { createExecutorRegistry, executors } from '../../runtime/executor.js';
export { buttonsForState, notifyForState, toastForState } from './model.js';
export { connectTaskStream, parseTaskFrames } from './stream.js';
export { connectSharedTaskStream } from './shared-stream.js';
//# sourceMappingURL=index.js.map