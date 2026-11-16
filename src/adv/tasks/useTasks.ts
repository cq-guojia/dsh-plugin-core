/**
 * 读任务的 React 入口：把池的快照接到组件上，并按分组过滤。
 *
 * 只读、不享任何状态 —— 想自己画页面就用它；不想自己画就用 `TaskBar`。
 * `connect()` 在首次订阅时由池自己完成，这里只是把它交出去，方便调用方在
 * 页面挂载时显式要一次 baseline（多标签页同步要靠它）。
 */
import { useSyncExternalStore } from 'react'
import {
  selectTaskNotifications,
  taskNotifications,
  type TaskNotificationGroupFilter,
  type TaskNotificationRecord,
} from './pool.js'

export interface UseTasksOptions {
  /** 二级分组过滤；缺省 = 当前项目的全部分组。`'*'` = 全部项目全部分组。 */
  groups?: TaskNotificationGroupFilter
  /** 一级分组；缺省取全局默认项目，`null` = 不按项目过滤。 */
  project?: string | null
  /** 默认 false：`hidden` 的任务不进列表。 */
  includeHidden?: boolean
}

export interface UseTasksResult {
  /** 当前可见任务，按 `startedAt` 排序；同一快照内引用稳定。 */
  readonly tasks: readonly TaskNotificationRecord[]
  /** 主动连一次跨页通道（多标签页同步需要它；幂等）。 */
  connect(): void
}

export function useTasks(options: UseTasksOptions = {}): UseTasksResult {
  const snapshot = useSyncExternalStore(
    taskNotifications.subscribe,
    taskNotifications.getSnapshot,
    taskNotifications.getServerSnapshot,
  )
  const tasks = selectTaskNotifications(snapshot, options.groups, {
    ...(options.project === undefined ? {} : { project: options.project }),
    ...(options.includeHidden === true ? { includeHidden: true } : {}),
  })
  return { tasks, connect: taskNotifications.connect }
}
