import { createElement as h, type ReactNode } from 'react';
import { type Translate } from '../utils/i18n.js';
import { type SessionMessage, type SessionSource } from './types.js';
/**
 * 承载方式 —— 弹窗只是**当前**的呈现方式，将来也可能是侧栏或整页（需求文档 §2.5）。
 */
export type SessionPreviewVariant = 'modal' | 'sidebar' | 'page';
export interface SessionPreviewProps {
    sessionId: string;
    /** 取数能力，由插件从宿主取出后注入。 */
    source: SessionSource;
    variant?: SessionPreviewVariant;
    title?: ReactNode;
    onClose?: () => void;
    /** 定制扩展点：自定义单条消息渲染（富内容 / 工具卡走这里）。 */
    renderMessage?: (message: SessionMessage) => ReactNode;
    /** 点附件「打开」时的回调（通常是把路径交给 explorer）。 */
    onOpenFile?: (path: string) => void;
    translate?: Translate;
}
export declare function SessionPreview(props: SessionPreviewProps): ReturnType<typeof h>;
export { ROLE_LABEL_KEY } from './types.js';
export type { SessionAttachment, SessionMessage, SessionRole, SessionSource } from './types.js';
//# sourceMappingURL=index.d.ts.map