import { type NotifyDetail } from '../../runtime/notify.js';
import { type CoordinatorHost, type TaskCoordinator } from './coordinator.js';
import type { StartTaskInput, TaskRecord } from './model.js';
/** 挂载选项：列表与 UI 接线共用同一组过滤条件与 handlers。 */
export interface MountTasksOptions {
    /** 字符串=只收该项目；null / 省略=跨项目收全部。 */
    project?: string | null;
    groups?: readonly string[];
    handlers: Readonly<Record<string, (task: TaskRecord) => void>>;
}
export interface MountTaskUIOptions extends MountTasksOptions {
    /** 终态回调：只给消费方刷自己的数据；成功失败都调。 */
    onSettled?: (task: TaskRecord, outcome: 'done' | 'failed') => void;
}
/** 一次接线：宿主把能力交进来（client apply 里调一次）。 */
export interface TaskCenterHost extends CoordinatorHost {
    /** SSE 流地址（服务端 serveTaskStream 的 basePath + /stream）；不传就不订阅（纯本地模式）。 */
    streamUrl?: string;
    /** 提交地址（服务端 serveTaskSubmit 的 path）；传了就由服务端执行，刷新后继续跑。 */
    submitUrl?: string;
    /** SSE / 提交请求头（鉴权 token 等）。 */
    headers?: () => Record<string, string>;
}
/** 宿主 client ctx 的最小形状：注入 layout 服务拿面板 id 与切面板。 */
export interface LayoutClientContext {
    inject?: (deps: string[], cb: (sub: unknown) => void) => void;
}
/** 最小形状校验：畸形 SSE 帧不能进 store 污染列表（startedAt 参与排序，缺了会乱）。 */
export declare function isTaskRecord(value: unknown): value is TaskRecord;
/**
 * 默认宿主适配：toast/notify 接到核心已有的提示层。
 *
 * toast/notify 的 `scope:'origin'` 用「发起标签页」判定（不是面板）：SSE 把同一条终态推给
 * 每个标签页，但只在发起它的那个标签页弹。`origin` 是页面级身份，随任务记录走；
 * `panelId` 只管点按钮时切回面板，不参与弹卡归属。
 * 任一侧缺 origin（服务端没透传 / 宿主没注入）时 fail-open 按「弹」处理——宁可多弹，绝不漏结果。
 * notify 只把通知发到总线上、不做任何 UI；范围由订阅侧 scope/project 决定。
 */
export declare function defaultTaskHost(originId?: () => string | undefined): CoordinatorHost;
/** 接线宿主能力。client apply 调一次；重复调用覆盖字段并重连 SSE，但不换 coordinator。 */
export declare function connectTaskCenter(host: TaskCenterHost): () => void;
/**
 * 从宿主 client ctx 接 layout：拿到 activePanelId（发起时记进任务）与 selectPanel（点按钮切回面板）。
 * 闸1（rc.3）核实：layout 服务由 ctx.inject(['layout']) 提供，activePanelId 在 panelInfo 快照里。
 */
export declare function connectTaskLayout(ctx: LayoutClientContext): void;
/** 发起一次后台任务。await 等登记成功，不等跑完。 */
export declare function startTask(input: StartTaskInput): Promise<TaskRecord>;
/** 本页接线一次：注册 handlers + 订阅终态。返回注销函数。 */
export declare function mountTaskUI(options: MountTaskUIOptions): () => void;
/** 点列表 / Toast 按钮：先切回发起面板，再执行本页 handler。 */
export declare function pressTaskButton(buttonId: string, taskId: string): boolean;
/** 服务端 SSE 投影入口（手动推送时用；自动接流由 connectTaskCenter 负责）。 */
export declare function projectTasks(records: readonly TaskRecord[]): void;
/** 列表控件读取用的 store 快照。 */
export declare const taskCenterStore: import("./store.js").TaskStore;
/**
 * 任务通知的广播监听出口：谁要响应谁自己订阅，核心不替消费方决定收到后干什么。
 * `scope: 'plugin'` 只收同项目；`'global'` 收所有项目。
 */
export type TaskNotificationListener = (message: {
    project: string;
    group: string;
    message: string;
    detail?: NotifyDetail;
    level: string;
}) => void;
export declare function subscribeTaskNotifications(options: {
    project?: string;
    scope: 'plugin' | 'global';
    handler: TaskNotificationListener;
}): () => void;
export type { TaskCoordinator };
//# sourceMappingURL=api.d.ts.map