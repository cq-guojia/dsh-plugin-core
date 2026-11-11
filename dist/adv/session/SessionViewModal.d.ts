import { createElement as h, type ReactNode } from 'react';
import { type Translate } from '../../utils/i18n.js';
import type { SessionViewTarget } from './open-session-view.js';
import { type ChangedFileReviewLocator } from './mirror/ChangedFilesCard.js';
import { type TranscriptViewMode } from './mirror/process-groups.js';
export interface SessionViewModalProps {
    t?: Translate;
    /**
     * 官方「对话呈现」模式（决定过程区要不要分组）：`detailed`（宿主默认）在轮次还开着时**不分组**、
     * 条目平铺；`compact` / `standard` 恒分组；`verbose` 从不分组。缺省 = `detailed`。
     */
    presentationMode?: TranscriptViewMode;
    /**
     * 标题行（第一级）：核心画在标题位，下方 sessionId 副标题行与归档徽标不受影响。
     * 想在标题后跟标签 / 按钮 / 自己的一段节点，塞进这里。
     * 缺省 = `heading`，再缺省 =「会话预览」。
     */
    title?: ReactNode;
    /** @deprecated 0.34 的旧名（只收字符串），等价 `title`；两者都给时以 `title` 为准。 */
    heading?: string;
    /**
     * 整块替换左侧标题区（第二级：标题行 + sessionId 行 + 归档徽标）。传了则 `title` / `heading` 不生效；
     * 归档徽标改挂到右侧动作区最前（归档是数据事实，不能因为自定义标题就消失）。
     * 右侧「继续对话」与关闭 ✕ 不受影响。
     */
    header?: ReactNode;
    /** 头部右侧追加动作：排在核心「继续对话」之后、关闭 ✕ 之前。 */
    headerActions?: ReactNode;
    /** 会话内容最顶端（滚动容器内、所有节点与「加载更早」之前）；随会话一起滚。 */
    bodyHeader?: ReactNode;
    /** 会话内容最底端（滚动容器内、最后一条内容与运行中行之后）；随会话一起滚。 */
    bodyFooter?: ReactNode;
    sessionId: string;
    view: SessionViewTarget;
    onClose: () => void;
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
    onOpenFile?: (path: string, sessionId: string, options?: {
        line?: number;
    }) => void;
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