import type { ReactElement } from 'react';
import { type Translate } from '../../../utils/i18n.js';
import type { ChatNodeFace } from '../faces.js';
import type { PendingApprovalFace } from '../pending-approval.js';
/** 官方 ApprovalCommand（ui-chat lib/client.js:151-172）：callId → tool-call 起始节点的 args.command。 */
export declare function approvalCommand(order: readonly string[], read: (key: string) => ChatNodeFace | undefined, callId: string | undefined): string | undefined;
/**
 * 待审批卡（官方 ApprovalPanel）。作答直接调 `pendingInteraction.answer()`——官方两个按钮的同一调用，
 * 答完官方 publish 会让 pendingInteraction 变空 ⇒ 卡自行消失。
 * shortcut: 未移植官方 root 上的 Enter/Esc 快捷键（要求焦点在卡内），需要键盘作答时补。
 */
export declare function ApprovalPanelMirror(props: {
    approval: PendingApprovalFace;
    /** 关联工具调用的命令行（官方 approval.detail 槽的等价物；取不到 = 不画那行）。 */
    command?: string;
    t: Translate;
}): ReactElement;
//# sourceMappingURL=ApprovalPanel.d.ts.map