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
import { type TaskRecord, type TaskRowButton, type TaskSettlement, type TaskState } from './model.js';
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
    /**
     * 基线专用（权威快照）：与 merge 同语义——真源能覆盖本地陈旧行。
     * 单调守卫（旧终态不被新 running 复活）+ carryIdentity（保留 origin/panelId/结算时刻）
     * 已在 merge 内，基线不能绕过，否则 gap 重拉 / owner 首快照无法纠正本地旧状态。
     * 本地乐观行在真源 running / done 到达时本就该被归一覆盖，不需要「只填不覆盖」兜。
     */
    mergeBaseline(records: readonly TaskRecord[]): void;
    /**
     * 跨标签基线专用视图：排除本地乐观行。
     * 乐观行是「本标签 POST 在飞」的临时状态，没有服务端 ack、也没有真源 id；
     * 一旦随 owner 基线发给别的标签，对端就会拿到一条永远不会被真源纠正的幽灵 running
     * （POST 失败只在本标签回滚，BC 没有删除帧）。乐观行只留在发起标签本地。
     */
    getBaseline(): readonly TaskRecord[];
    get(id: string): TaskRecord | undefined;
    /**
     * 按业务幂等键读存活行（归一后的 id），供 progress / 状态披露按 (project,key) 定位，
     * 不必自己遍历快照再按 key 找一遍。命中乐观行与命中真源行一视同仁。
     */
    getByKey(project: string, key: string): TaskRecord | undefined;
    /**
     * 删除一条仍在运行中的乐观行（提交失败回滚用）。
     * 只删「ident 对应且仍是 running」的记录：真源已改写（终态或别的运行行）时不删，
     * 避免回滚误伤真实进度。同步清幂等键，publish 通知列表。
     */
    removeRunning(id: string): boolean;
    /** 按 project / group 过滤；project 为 null 表示跨项目收全部。 */
    select(project: string | null, groups?: readonly string[]): readonly TaskRecord[];
    /**
     * 注册按钮 handlers（可增量多次调用）。project 作命名空间：同 id 不同项目互不覆盖；
     * project 省略 / null 时落裸 id（跨项目兜底）。返回注销函数。
     */
    registerHandlers(map: Readonly<Record<string, TaskHandler>>, project?: string | null): () => void;
    /** 先按 (project,id) 精确查，未命中回退裸 id 兜底。 */
    getHandler(id: string, project?: string): TaskHandler | undefined;
    /** 订阅终态。 */
    onSettled(listener: TaskSettledListener): () => void;
    /** 广播终态给订阅者；单个坏监听者不影响其它监听者。 */
    emitSettled(settlement: TaskSettlement): void;
    /**
     * 声明一次终态分发：同一结算键（project + key/id）+ 同一运行实例（startedAt）只返回 true 一次。
     * 同键更大 startedAt 视为新运行，放行新的结算；重新发起（running）也会重置声明。
     */
    claimSettled(task: TaskRecord): boolean;
    /**
     * 按运行身份守卫判断一条记录是否陈旧（比当前存活记录更早的一次运行）。
     * deliverNotice 用它挡掉「旧运行的迟到 notice」——状态 merge 会被守卫丢弃，但 notice 是
     * 一次性事件、另有 announce/upsert 路径，必须在入口统一判定，否则旧终态会覆盖新 running。
     */
    isStale(task: TaskRecord): boolean;
    /**
     * 全清：任务记录、幂等键、终态声明与已注册的按钮 handlers 一并清空。
     * 清掉 handlers 后需重新 mountTaskUI 才会再注册；只清列表不要用这个。
     */
    clearAll(): void;
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