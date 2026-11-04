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
//# sourceMappingURL=pending-inputs.d.ts.map