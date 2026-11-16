/**
 * 服务端权威任务的客户端调和器。
 *
 * 真值在消费方服务端：时钟、判死、枚举、命令执行都不在页面里。本模块只做三件事：
 * 1. 开页时把服务端在跑任务水合成投影；
 * 2. 按单调 version 合并增量（含终态墓碑），过滤迟到与乱序；
 * 3. 按钮按 actionId + 服务端下发的 token 发命令，不依赖任何页面闭包。
 *
 * 零 React / 零 DOM；transport 由调用方注入，Node 自检可直接用内存 fake。
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
/** 增量事件，follow 流的一帧。 */
export type ServerTaskEvent = {
    readonly kind: 'upsert';
    readonly rows: readonly ServerTaskRecord[];
} | {
    readonly kind: 'cursor';
    readonly cursor: string;
    readonly serverNow: number;
};
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
}
export interface AckRequest {
    readonly project: string;
    readonly key: string;
    readonly version: number;
    /** 通知类别：settled / failed 等。 */
    readonly kind: string;
    /** 客户端持久游标，重开后保持不变。 */
    readonly cursor: string;
}
/**
 * 消费方注入的后端能力。`list` / `follow` / `invoke` / `ack` 是必需的：
 * 缺任一项就没有完整恢复能力，注册时直接报错，不静默降级。
 */
export interface TaskBackend {
    create?(input: ServerCreateInput): Promise<ServerCreateResult>;
    list(project: string, cursor?: string): Promise<ServerTaskPage>;
    follow(projects: readonly string[], cursorByProject: Readonly<Record<string, string>>, onEvent: (project: string, event: ServerTaskEvent) => void, onError: (project: string, error: unknown) => void): () => void;
    poll?(keys: readonly string[]): Promise<readonly ServerTaskRecord[]>;
    invoke(request: InvokeRequest): Promise<InvokeResult>;
    ack(request: AckRequest): Promise<void>;
}
export interface AuthoritativeEngineOptions {
    readonly onChange: (records: readonly ServerTaskRecord[]) => void;
    readonly onTerminal?: (record: ServerTaskRecord) => void;
    readonly clientId: string;
    /** 重新基线的最小间隔，默认 5 秒；visibilitychange 去重。 */
    readonly rebaseMinMs?: number;
}
export declare function createAuthoritativeEngine(options: AuthoritativeEngineOptions): {
    attach(project: string, backend: TaskBackend): void;
    start(): void;
    visible(): void;
    refresh(project?: string): void;
    find(project: string, key: string): ServerTaskRecord | undefined;
    all(): readonly ServerTaskRecord[];
    runAction(project: string, key: string, actionId: string): Promise<InvokeResult>;
    acknowledge(request: AckRequest): Promise<void>;
    create(input: ServerCreateInput): Promise<ServerCreateResult | undefined>;
    has(project: string): boolean;
    /** 停止连接但保留后端与已水合状态；pool.dispose → connect 后可重新 follow。 */
    stop(): void;
    dispose(): void;
};
export type AuthoritativeEngine = ReturnType<typeof createAuthoritativeEngine>;
//# sourceMappingURL=authoritative.d.ts.map