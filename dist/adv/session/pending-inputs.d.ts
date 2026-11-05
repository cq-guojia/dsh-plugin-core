import type { ChatNodeFace, PendingSubmissionFace } from './faces.js';
/** 官方 observedInputs：durable user 节点 source.rpcId（本地回显被持久节点取代的判据）。 */
export declare function observedRpcIds(order: readonly string[], readNode: (key: string) => ChatNodeFace | undefined): ReadonlySet<string>;
/** 官方 visibleSubmissions：queued 不走回显气泡；已被 durable 节点取代的不重复画。 */
export declare function visiblePendingInputs(pending: readonly PendingSubmissionFace[] | undefined, observed: ReadonlySet<string>): readonly PendingSubmissionFace[];
/** 回显附件 → 附件卡数据（只取官方已有的真实名字/大小；图片预览需宿主 loadImage，不造）。 */
export declare function pendingFiles(item: PendingSubmissionFace): readonly {
    name: string;
    bytes: number;
}[];
/** 等待期用户气泡的统一渲染数据（host inbox 投影 + 本地回显合并后）。 */
export interface WaitingUserRow {
    readonly key: string;
    readonly text: string;
    readonly files: readonly {
        name: string;
        bytes: number;
    }[];
    /** 官方 data-pending-steering：host inbox 投影里的待处理用户消息。 */
    readonly pending: boolean;
    /** 官方 data-submission-echo：客户端本地提交回显。 */
    readonly echo: boolean;
}
/**
 * 官方 ChatFlow.pendingInputs（ui-chat 0.2.1-rc.5 lib/client.js:2815-2839）的等价合并：
 * host `inbox` 投影 + session.pendingSubmissions 本地回显，按 source.rpcId / requestId 去重。
 *
 * 为什么必须两路：本地回显只在客户端内存里，且 `observeSubmissionInbox()` 在 inbox 到达后
 * 会 retire 它；inbox 投影是 host 侧 durable 值（尾页 projections baseline 也会 seed），
 * 冷读 / 新打开预览时拿得到。只画回显 ⇒ 等待期整条用户消息被吞，只剩「深度求索中」。
 */
export declare function waitingUserRows(inbox: unknown, pending: readonly PendingSubmissionFace[] | undefined, observed: ReadonlySet<string>): readonly WaitingUserRow[];
//# sourceMappingURL=pending-inputs.d.ts.map