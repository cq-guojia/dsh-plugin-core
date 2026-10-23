import { createElement as h } from 'react';
import type { Translate } from '../utils/i18n.js';
import type { SessionViewTarget } from './open-session-view.js';
import { type ChangedFileReviewLocator } from './mirror/ChangedFilesCard.js';
export interface SessionViewModalProps {
    t?: Translate;
    /** 弹窗标题：**会话自己的标题**（宿主 sessions.list 的 displayTitle）；缺省用「会话预览」。 */
    heading?: string;
    sessionId: string;
    view: SessionViewTarget;
    onClose: () => void;
    /**
     * 会话是否已归档（由调用方注入：官方 client 服务 `workspaces` 的快照字段 `archivedSessionIds`，
     * registry-global、随 follow 流实时更新，见 docs/design/external/dsh-host.md §11）。
     * 分化「继续对话」行为：已归档 = 开分支图标 + 确认框（fork 后跳官方区）；
     * 未归档 / 未提供 = 会话图标，点击直跳官方会话页。undefined = 调用方不知道，按未归档处理。
     */
    archived?: boolean;
    /** fork 源会话：`sessions.fork({ sessionId, increaseTitle: true })`，解析为子会话 id。 */
    forkSession?: (sessionId: string, atSeq?: number) => Promise<string>;
    /** 官方导航跳转：`uiWorkspace.openSession(id)`（会话区打开目标会话）。 */
    openHostSession?: (sessionId: string) => void;
    /**
     * 暂存输入框的「确定」：调用方完成 fork + host 侧 agent.send 起轮次 + 跳官方视图。
     * 缺省 = 不渲染暂存输入框（插件未接线续聊能力时功能降级，不影响预览）。
     */
    onContinue?: (message: string) => Promise<void>;
    /** 文件打开出口（工具卡 fileLink / md 行内 mention / 交付卡共用）；缺省 = 链接降级纯文本。
     *  第二个参数带「文件所属的会话 id」（本视图自己在 props.sessionId 上，自动透传），
     *  消费方据此在正确的工作区会话作用域里定位文件，避免用错会话导致 not-found。 */
    onOpenFile?: (path: string, sessionId: string) => void;
    /** 变更文件点击出口（官方 openReview 等价）：带「改动身份」(sessionId+seq+index)，
     *  消费方据此开审阅（本包走 openFilePreview 的 content 槽）。缺省 = 变更卡整张不可点。 */
    onOpenReview?: (locator: ChangedFileReviewLocator) => void;
}
/**
 * 面板内只读会话弹窗：只读、不可在框内续聊（底层 keyed 数组是只读快照，官方无写面）。
 * 续聊正道 = 头部「继续对话（开分支）」/ 消息行分支 icon（fork → openSession），
 * 以及底部暂存输入框（打字 → 确定 → onContinue 带话开分支并起轮次）。
 */
export declare function SessionViewModal(props: SessionViewModalProps): ReturnType<typeof h>;
//# sourceMappingURL=SessionViewModal.d.ts.map