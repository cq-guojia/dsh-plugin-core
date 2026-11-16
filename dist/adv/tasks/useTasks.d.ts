import { type TaskNotificationGroupFilter, type TaskNotificationRecord } from './pool.js';
export interface UseTasksOptions {
    /** 二级分组过滤；缺省 = 当前项目的全部分组。`'*'` = 全部项目全部分组。 */
    groups?: TaskNotificationGroupFilter;
    /** 一级分组；缺省取全局默认项目，`null` = 不按项目过滤。 */
    project?: string | null;
    /** 默认 false：`hidden` 的任务不进列表。 */
    includeHidden?: boolean;
}
export interface UseTasksResult {
    /** 当前可见任务，按 `startedAt` 排序；同一快照内引用稳定。 */
    readonly tasks: readonly TaskNotificationRecord[];
    /** 主动连一次跨页通道（多标签页同步需要它；幂等）。 */
    connect(): void;
}
export declare function useTasks(options?: UseTasksOptions): UseTasksResult;
//# sourceMappingURL=useTasks.d.ts.map