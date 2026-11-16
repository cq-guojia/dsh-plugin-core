/**
 * 读任务的 React 入口：把池的快照接到组件上，并按分组过滤。
 *
 * 只读、不享任何状态 —— 想自己画页面就用它；不想自己画就用 `TaskBar`。
 * `connect()` 在首次订阅时由池自己完成，这里只是把它交出去，方便调用方在
 * 页面挂载时显式要一次 baseline（多标签页同步要靠它）。
 */
import { useSyncExternalStore } from 'react';
import { selectTaskNotifications, taskNotifications, } from './pool.js';
export function useTasks(options = {}) {
    const snapshot = useSyncExternalStore(taskNotifications.subscribe, taskNotifications.getSnapshot, taskNotifications.getServerSnapshot);
    const tasks = selectTaskNotifications(snapshot, options.groups, {
        ...(options.project === undefined ? {} : { project: options.project }),
        ...(options.includeHidden === true ? { includeHidden: true } : {}),
    });
    return { tasks, connect: taskNotifications.connect };
}
//# sourceMappingURL=useTasks.js.map