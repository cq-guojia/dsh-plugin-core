/**
 * 后台任务的共享状态中心。
 *
 * 同标签页所有插件副本共用一个 store（Symbol.for 收口）——A 插件发起的任务、注册的 handler，
 * B 插件的同页副本也看得到。这正是「在 B 页面点 A 的按钮，本页直接执行 A 的 handler」的基础。
 *
 * 纯数据 + 纯逻辑，零 React / 零宿主 / 零 DOM。React 侧用 useSyncExternalStore 接 getSnapshot/subscribe。
 * 这里不判死、不算租约、不轮询：状态由服务端经 SSE 投影进来，本地只负责存与分发。
 *
 * 「终态只分发一次」的去重状态放在这里，不放 coordinator 实例里：coordinator 重接、客户端重连
 * 推基线、同页多副本都会重新投影同一条终态，只有共享的 store 才能挡住重复 toast/notify/onSettled。
 */
import type { TaskRecord, TaskRowButton, TaskSettlement, TaskState } from './model.js';
export type TaskHandler = (task: TaskRecord) => void;
export type TaskSettledListener = (settlement: TaskSettlement) => void;
interface TaskStoreState {
    readonly tasks: readonly TaskRecord[];
    readonly revision: number;
}
export interface TaskStore {
    readonly getSnapshot: () => TaskStoreState;
    readonly subscribe: (listener: () => void) => () => void;
    /** 幂等 upsert：同 (project,key) 就地更新，返回是否新建。 */
    upsert(task: TaskRecord): {
        created: boolean;
        task: TaskRecord;
    };
    /** 服务端投影一批增量（upsert 语义）；返回真正有变化的记录（id 已归一到存活 id）。 */
    merge(records: readonly TaskRecord[]): readonly TaskRecord[];
    get(id: string): TaskRecord | undefined;
    /** 按 project / group 过滤；project 为 null 表示跨项目收全部。 */
    select(project: string | null, groups?: readonly string[]): readonly TaskRecord[];
    /** 注册按钮 handlers（可增量多次调用，重复 id 覆盖）。返回注销函数。 */
    registerHandlers(map: Readonly<Record<string, TaskHandler>>): () => void;
    getHandler(id: string): TaskHandler | undefined;
    /** 订阅终态。 */
    onSettled(listener: TaskSettledListener): () => void;
    /** 广播终态给订阅者；单个坏监听者不影响其它监听者。 */
    emitSettled(settlement: TaskSettlement): void;
    /**
     * 声明一次终态分发：同一结算（project + key/id + settledAt）只返回 true 一次；
     * 同业务键重新发起（running）会重置声明，让下一次结算能正常分发。
     */
    claimSettled(task: TaskRecord): boolean;
    clear(): void;
}
/** 全局 store（同标签页共用）。 */
export declare const taskStore: TaskStore;
/** 新建私有 store（测试隔离）。 */
export declare function createTaskStore(): TaskStore;
/** 终态状态判定。 */
export declare function isSettled(state: TaskState): boolean;
/** 取一条任务当前状态下要显示的按钮（含 handler 存在性由调用方决定）。 */
export declare function visibleButtons(task: TaskRecord): readonly TaskRowButton[];
export {};
//# sourceMappingURL=store.d.ts.map