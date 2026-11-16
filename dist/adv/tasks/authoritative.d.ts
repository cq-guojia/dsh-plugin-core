/**
 * 服务端权威任务的客户端调和器。
 *
 * 两条通道各司其职，绝不混用：
 *   A. 在跑投影——list/follow 只水合 running；tombstone 只更新本地终态门，不 emit、不 ack。
 *   B. 终态通知——listNotices/ackNotices 拉未确认通知，emit 后按连续成功前缀 ack。
 * 这样基线回放（含 tombstone）永远不会造成「任务结束」的重复通知。
 *
 * 真值、判死、时钟、命令执行全在消费方服务端；本模块只做投影、调和、通知投递。
 * 零 React / 零 DOM；transport 注入，Node 自检可用内存 fake。
 */
import type { TaskNotificationDetail } from './pool.js';
/** 服务端权威任务的状态。 */
export type ServerTaskState = 'running' | 'done' | 'failed';
/** 按钮的可跨端描述。handler 不存在客户端，执行权在服务端。 */
export interface ServerTaskAction {
    readonly id: string;
    readonly label?: string;
    readonly icon?: string;
    readonly color?: string;
    readonly enabled: boolean;
    /** 服务端下发的一次性令牌，绑定 (project,key,actionId,version)。 */
    readonly token: string;
    readonly expiresAt: number;
    /** 令牌所属版本；与记录版本不一致即禁用，防旧按钮在新状态上执行。 */
    readonly version?: number;
}
/** 一条服务端权威任务记录。所有时间戳均由服务端生成。 */
export interface ServerTaskRecord {
    readonly project: string;
    readonly key: string;
    readonly version: number;
    readonly state: ServerTaskState;
    readonly startedAt: number;
    readonly deadlineAt: number;
    readonly leaseExpiresAt: number;
    readonly updatedAt: number;
    readonly title: string;
    readonly group: string;
    readonly groupLabel?: string;
    readonly projectLabel?: string;
    readonly icon?: string;
    readonly iconSvg?: string;
    readonly hidden?: boolean;
    readonly detail?: TaskNotificationDetail;
    readonly actions: readonly ServerTaskAction[];
    readonly result?: TaskNotificationDetail;
    readonly reason?: string;
    /** 终态墓碑：保留到服务端 TTL 结束，阻止旧版本把它复活。 */
    readonly tombstone?: boolean;
}
/** 创建：服务端原子登记，unique(project,key) 决定 created。 */
export interface ServerCreateInput {
    readonly project: string;
    readonly key: string;
    readonly group: string;
    readonly title: string;
    readonly detail?: TaskNotificationDetail;
    readonly timeoutMs?: number;
    readonly leaseMs?: number;
    readonly maxDurationMs?: number;
}
export interface ServerCreateResult {
    readonly created: boolean;
    readonly record: ServerTaskRecord;
}
/** 基线分页。游标由服务端生成，keyset 语义，不做 offset 深翻页。 */
export interface ServerTaskPage {
    readonly rows: readonly ServerTaskRecord[];
    readonly nextCursor?: string;
    readonly snapshotVersion: number;
}
/** 增量事件，follow 流的一帧。notice-available 只提示「有未处理通知」，不携带通知本体。 */
export type ServerTaskEvent = {
    readonly kind: 'upsert';
    readonly rows: readonly ServerTaskRecord[];
} | {
    readonly kind: 'cursor';
    readonly cursor: string;
    readonly serverNow: number;
} | {
    readonly kind: 'notice-available';
};
/** 一条服务端终态通知。notificationId 由服务端生成且稳定，供去重与 ack。 */
export interface ServerNotice {
    readonly notificationId: string;
    readonly project: string;
    readonly record: ServerTaskRecord;
    /** 由服务端下发，核心不自拼；服务端按它判未确认项。 */
    readonly cursor: string;
}
export interface ServerNoticePage {
    readonly notices: readonly ServerNotice[];
    readonly nextCursor?: string;
}
export interface InvokeRequest {
    readonly project: string;
    readonly key: string;
    readonly actionId: string;
    readonly token: string;
    /** 客户端生成的唯一键；服务端按它缓存结果，ACK 丢失时重放返回同一结果。 */
    readonly idempotencyKey: string;
    readonly version: number;
}
export interface InvokeResult {
    readonly ok: boolean;
    readonly result?: TaskNotificationDetail;
    readonly reason?: string;
    /** 本次命令的幂等键，供 action 事件回传、迟到结果复查。 */
    readonly idempotencyKey?: string;
}
export interface AckRequest {
    readonly project: string;
    /** 通知确认推进到的游标（服务端下发的 cursor，核心不自拼）。 */
    readonly cursor: string;
}
/**
 * 消费方注入的后端能力。list/follow/listNotices/ackNotices/invoke/ack 全部必需：
 * 缺任一项就没有完整恢复与通知能力，注册时直接报错，不静默降级。
 */
export interface TaskBackend {
    create?(input: ServerCreateInput): Promise<ServerCreateResult>;
    list(project: string, cursor?: string): Promise<ServerTaskPage>;
    follow(projects: readonly string[], cursorByProject: Readonly<Record<string, string>>, onEvent: (project: string, event: ServerTaskEvent) => void, onError: (project: string, error: unknown) => void): () => void;
    poll?(keys: readonly string[]): Promise<readonly ServerTaskRecord[]>;
    /** 拉取未确认的终态通知（通道 B）。 */
    listNotices(projects: readonly string[], sinceCursor?: string): Promise<ServerNoticePage>;
    /** 按连续成功前缀推进确认游标，服务端幂等。 */
    ackNotices(projects: readonly string[], cursor: string): Promise<void>;
    invoke(request: InvokeRequest): Promise<InvokeResult>;
    ack(request: AckRequest): Promise<void>;
}
export interface AuthoritativeEngineOptions {
    readonly onChange: (records: readonly ServerTaskRecord[]) => void;
    /** 通道 B：一条未确认通知投递到前端。 emit 成功后才推进 ack 游标。 */
    readonly onNotice: (notice: ServerNotice) => void;
    readonly clientId: string;
    /** 重新基线的最小间隔，默认 5 秒；visibilitychange 去重。 */
    readonly rebaseMinMs?: number;
    /** 命令超时，默认 5000ms。 */
    readonly actionTimeoutMs?: number;
}
export declare function createAuthoritativeEngine(options: AuthoritativeEngineOptions): {
    attach(project: string, backend: TaskBackend): void;
    start(): void;
    visible(): void;
    refresh(project?: string): void;
    find(project: string, key: string): ServerTaskRecord | undefined;
    all(): readonly ServerTaskRecord[];
    runAction(project: string, key: string, actionId: string): Promise<InvokeResult>;
    /** 暴露幂等键供上层在 action 事件里回传，迟到结果由它抑制二次 emit。 */
    idempotencyKeyFor(project: string, key: string, actionId: string, version: number): string | undefined;
    acknowledge(request: AckRequest): Promise<void>;
    create(input: ServerCreateInput): Promise<ServerCreateResult | undefined>;
    has(project: string): boolean;
    stop(): void;
    dispose(): void;
};
export type AuthoritativeEngine = ReturnType<typeof createAuthoritativeEngine>;
//# sourceMappingURL=authoritative.d.ts.map