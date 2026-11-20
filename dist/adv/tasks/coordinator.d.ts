/**
 * 后台任务编排中枢：把「登记 → 执行 → 进度 → 终态 → 通知」串成一条线。
 *
 * 纯逻辑，零 React / 零宿主 / 零 DOM —— 宿主能力（layout 面板、toast、通知、执行器）都以
 * 小接口注入，node 自检可用内存 fake。真实接线由 `api.ts` / host 侧完成。
 *
 * 没有 pull 心跳、没有状态源、没有双时钟租约、没有 tombstone 判死：终态由执行器结果
 * 或服务端投影直接驱动一次，进度由执行器 report 上报，本地只做投影与分发。
 */
import { executors } from '../../runtime/executor.js';
import type { NotifyDetail, NotifyLevel } from '../../runtime/notify.js';
import { type StartTaskInput, type TaskNotice, type TaskRecord, type TaskSettlement } from './model.js';
import { type TaskHandler, type TaskStore } from './store.js';
/** 宿主能力注入点。全部可缺省：没接就是纯本地内存模式（测试 / 预览站）。 */
export interface CoordinatorHost {
    /** 当前激活面板 id；startTask 时自动记进记录。 */
    activePanelId?(): string | undefined;
    /**
     * 当前标签页 id（页面级身份）；startTask 时自动记进 TaskRecord.origin，
     * 供 scope:'origin' 判定「只在发起页弹卡」。与 panelId（面板级、只管切 UI）是两个维度。
     */
    originId?(): string | undefined;
    /** 切回面板；点按钮时先调它，再执行 handler。 */
    selectPanel?(panelId: string): void;
    /** 终态通知（notify 通道）：由调用方决定怎么弹、怎么广播。 */
    deliverNotify?(payload: {
        project: string;
        group: string;
        message: string;
        detail?: NotifyDetail;
        level: NotifyLevel;
        scope: 'all' | 'origin';
        broadcast?: 'plugin' | 'global';
        task: TaskRecord;
    }): void;
    /** 终态 toast：由调用方决定怎么画卡。 */
    deliverToast?(payload: {
        title: string;
        buttonId?: string;
        buttonText?: string;
        scope: 'all' | 'origin';
        task: TaskRecord;
    }): void;
}
export interface CoordinatorOptions {
    readonly store?: TaskStore;
    readonly host?: CoordinatorHost;
    /** 执行器注册表；缺省用全局那份。测试可注入私有表。 */
    readonly registry?: typeof executors;
}
export interface TaskCoordinator {
    /** 登记一条任务并异步驱动执行。等的是登记成功，不是跑完。 */
    start(input: StartTaskInput): TaskRecord;
    /** 服务端状态投影入口：把外部状态/进度/终态并进本地 store。**只投影，不弹卡**（状态可重放）。 */
    project(records: readonly TaskRecord[]): void;
    /** 一次性完成通知入口：只有它触发 toast / notify / onSettled。 */
    deliverNotice(notice: TaskNotice): void;
    /** 点按钮：先切回发起面板（同页），再找本页 handler 执行。返回是否找到 handler。 */
    press(buttonId: string, taskId: string): boolean;
    registerHandlers(map: Readonly<Record<string, TaskHandler>>, project?: string | null): () => void;
    onSettled(listener: (s: TaskSettlement) => void): () => void;
}
export declare function createCoordinator(options?: CoordinatorOptions): TaskCoordinator;
//# sourceMappingURL=coordinator.d.ts.map