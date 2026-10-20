import { createElement as h, type CSSProperties, type ReactNode } from 'react';
import { type Translate } from '../utils/i18n.js';
/** 色条档位（映射到 design 的 token，不新增 token；也接受任意 CSS 颜色值）。 */
export declare const CARD_ACCENTS: readonly ["business", "success", "warning", "danger", "neutral"];
export type CardAccent = (typeof CARD_ACCENTS)[number];
export interface CardSharedProps {
    /** 左侧色条档位或任意 CSS 颜色值（如 `'#f59e0b'`）。 */
    accent?: CardAccent | string;
    /** 展开态（决定箭头朝向与 `panel` 显隐）。 */
    expanded?: boolean;
    /** 传了才显示右侧折叠箭头；由调用方管展开状态。 */
    onToggle?: () => void;
    /** 右上角操作区（如「跳过」「查看会话」）。 */
    action?: ReactNode;
    /** 主内容：想写几行、左边右边随你。 */
    children?: ReactNode;
    /** 展开后才显示的额外内容。 */
    panel?: ReactNode;
    className?: string;
    style?: CSSProperties;
    translate?: Translate;
}
/**
 * 卡片（框式）：surface 底 + 1px 边框 + 圆角，左缘行内 6px 圆角短条（高度随内容）。
 * 头部整体垂直居中；悬停浮出的按钮、一行两行由调用方在框内自定。
 *
 * ```tsx
 * h(Card, {
 *   accent: 'warning',
 *   action: h(Button, { size: 'sm', variant: 'ghost' }, '跳过'),
 * }, h('div', null, '标题 + 内容'))
 * ```
 */
export declare function Card(props: CardSharedProps): ReturnType<typeof h>;
/**
 * 条带卡片（浅底式）：同色系浅底 + 1px 不可见占位边框 + 方角 + 左缘 4px 通高方角色条（贴左缘）。
 * 与 `Card` 同一份 props，头部同样整体垂直居中。
 *
 * ```tsx
 * h(StripCard, {
 *   accent: 'success',
 *   expanded: open, onToggle: () => setOpen(!open),
 *   panel: h('div', null, '展开详情'),
 * }, h('div', null, '标题 + 元信息'))
 * ```
 */
export declare function StripCard(props: CardSharedProps): ReturnType<typeof h>;
//# sourceMappingURL=Card.d.ts.map