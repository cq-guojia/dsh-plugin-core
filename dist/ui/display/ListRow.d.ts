import { createElement as h, type CSSProperties, type ReactNode } from 'react';
export interface ListRowProps {
    /** 主内容：图标、名字、标签、左右分区都由调用方自己排。 */
    children?: ReactNode;
    /** 右侧操作槽：核心在此槽外层挡住事件冒泡，点里面的按钮不会连带触发整行。 */
    actions?: ReactNode;
    /** 给了才让整行可点（挂 role=button / tabIndex / Enter·Space）。 */
    onClick?: () => void;
    /** 选中态外观（组件不改状态，由调用方管）。 */
    selected?: boolean;
    /** 带边 / 不带边：无边档仍是 1px 透明占位，两档同高。默认 false。 */
    bordered?: boolean;
    /** hover 提亮开关；默认跟随「整行可点」（可点行开、纯展示行关），显式 true 强制开。 */
    hoverable?: boolean;
    /** 追加 class（只允许补布局，不许覆盖皮肤）。 */
    className?: string;
    style?: CSSProperties;
}
/**
 * 一行一条的列表条目：常态带底、整行可点、右侧挂一组小操作。
 *
 * 外框（底 / 边 / 圆角 / 内距）复用 `Surface`，颜色全走 token；本控件只补
 * 「行」独有的：高度档、两槽布局、行级 hover、选中态。
 *
 * 整行刻意**不渲染成 `<button>`**：调用方要在里面放 Button / IconButton，
 * 嵌 button 是非法 HTML。改用 `div[role=button] + tabIndex + Enter/Space`，
 * 与 `src/adv/explorer/landing.ts` 的既有口径一致。
 *
 * ```tsx
 * h(ListRow, {
 *   onClick: () => open(file),
 *   selected: file.path === current,
 *   actions: h(IconButton, { size: 'sm', icon: ..., label: '移除', onClick: () => remove(file) }),
 * }, h('span', null, file.name))
 * ```
 */
export declare function ListRow(props: ListRowProps): ReturnType<typeof h>;
//# sourceMappingURL=ListRow.d.ts.map