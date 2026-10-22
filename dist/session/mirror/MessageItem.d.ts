import { createElement as h } from 'react';
import type { Translate } from '../../utils/i18n.js';
/** 助手正文：官方 MarkdownText 渲染 + 官方 AssistantMarkdown.root 类（fallback 自绘）。
 * U11：fileMentions 词表就位时行内 code 文件引用渲成可点链接（官方语义：resolve 不出保持惰性 code）。 */
export declare function AssistantMarkdown(props: {
    text: string;
    fileMentions?: {
        resolve(value: string): {
            open(): void;
            label: string;
            title: string;
        } | undefined;
    };
}): ReturnType<typeof h>;
/** 用户消息里的官方附件（file 块）：`FileAttachmentRef` 只有 id / 名字 / 字节数，**没有路径**。 */
export interface UserFileFace {
    name: string;
    bytes: number;
}
/**
 * 用户消息：官方 MessageItem userRow > userStack > bubble（右对齐气泡）
 * + 气泡下方的 **attachmentRow / fileCard**（官方 MessageItem 的附件行）。
 *
 * 官方附件卡 = 图标 + 文件名 + 大小；**不可点开**——引用里没有路径，宿主也没给出
 * 「按 attachmentId 打开」的公开面 ⇒ 如实降级为只读展示，不伪造打开行为。
 */
export declare function UserMessage(props: {
    text: string;
    files?: readonly UserFileFace[];
}): ReturnType<typeof h>;
/** 重试节点消费面（官方 ModelRetryNode = LlmRetryEventData & {retryState}，records.d.ts:112）。 */
export interface RetryAttemptFace {
    retryState?: 'scheduled' | 'started' | 'cancelled';
    mode?: string;
    retry?: number;
    maxRetries?: number;
    delayMs?: number;
    failure?: {
        message?: string;
        code?: string;
    } | null;
}
/** 轮次失败节点消费面（官方 TurnErrorNode，records.d.ts:127）。 */
export interface TurnErrorFace {
    message?: string;
    code?: string;
}
/**
 * 重试行（官方 ModelRetryItem）：折叠 = 「已重试模型请求 (5/5) · 9s ⌄」摘要；
 * 展开 = 重试延迟 / 失败原因 两行。active（等待重试）时官方走 250ms 倒计时 + 渐隐 shimmer。
 */
export declare function ModelRetryItemMirror(props: {
    node: RetryAttemptFace;
    active: boolean;
    t: Translate;
}): ReturnType<typeof h>;
/** 轮次失败行（官方 TurnErrorItem）：红点 + 红标题「本轮运行失败」+ 灰原因 + 右侧机器码标签。 */
export declare function TurnErrorItemMirror(props: {
    node: TurnErrorFace;
    t: Translate;
}): ReturnType<typeof h>;
/** 限长行（官方 TurnMaxTokensItem）：黄点 + 警示标题 + 截断提示。 */
export declare function TurnMaxTokensItemMirror(props: {
    t: Translate;
}): ReturnType<typeof h>;
//# sourceMappingURL=MessageItem.d.ts.map