import type { ReactElement } from 'react';
import { type Translate } from '../../../utils/i18n.js';
import type { ChatNodeFace } from '../faces.js';
import type { PendingApprovalFace } from '../pending-approval.js';
/**
 * 官方 ApprovalPanel.tsx:11 `reason = displayReason === undefined ? approval.reason : resolveReason(displayReason)`，
 * :14 `title: reason ?? t('escalation', {toolName})`。两处都是 `??`：空串是合法标题，不回落。
 * `resolveReason` 由注入方给的是 `ctx.locale.resolveText`（index.ts:104 的语言回退链）；
 * 本仓缺省用自有 getLocale() → en 回退链，同样不排除空串、不伪造语言。
 * 返回 `string | undefined` 只表达「语言表里中英都没有」这一种缺数据情形：
 * 该情形走官方 :14 的 `?? t('escalation')` 回落路径，与官方 `reason === undefined` 同义。
 */
export type ApprovalReasonResolver = (shown: Readonly<Record<string, string>>) => string | undefined;
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
    /** 官方 ApprovalCard.tsx:68-71 的可选 subject（应用授权卡复用路径）；工具审批不传。 */
    subject?: {
        name: string;
        icon?: string;
    };
    /** 官方 ApprovalCard.tsx:76 的可选 description；工具审批不传。 */
    description?: string;
    /** 宿主 `ctx.locale.resolveText`（index.ts:104）注入口；缺省用自有 getLocale() → en 回退链。 */
    resolveReason?: ApprovalReasonResolver;
    t: Translate;
}): ReactElement;
//# sourceMappingURL=ApprovalPanel.d.ts.map