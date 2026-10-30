import { type CSSProperties, type ReactNode } from 'react';
import { type Translate } from '../utils/i18n.js';
import { type PageTotalRenderer, type PaginationAlign } from './pagination-logic.js';
/**
 * 分页控件 props。
 *
 * 只收「当前页 / 每页条数 / 总条数」三件事，总页数与省略窗口由控件算 —— 消费方不自己算页数、
 * 也不自己渲染页码（这是通行分页组件的共同约定，见 docs/help/ui）。
 */
export interface PaginationProps {
    /** 当前页（1 起）；越界会被夹回 `[1, 总页数]`。 */
    page: number;
    /** 总条数（不是总页数）。 */
    total: number;
    /** 每页条数，默认 10。 */
    pageSize?: number;
    /** 切页 / 切每页条数时触发；切换每页条数时页码一并回到第 1 页（与 antd / MUI 同口径）。 */
    onChange: (page: number, pageSize: number) => void;
    /** 页码条对齐，默认 right。 */
    align?: PaginationAlign;
    /** 当前页两侧各留几页，默认 1。 */
    siblingCount?: number;
    /** 首尾各固定几页，默认 1。 */
    boundaryCount?: number;
    /** 传了才出现「每页条数」下拉（如 `[10, 20, 50]`）。 */
    pageSizeOptions?: readonly number[];
    /** 总数文案：`true` 走内置字典，也可给函数自定义（收到总条数、起始行、结束行）。 */
    showTotal?: boolean | PageTotalRenderer;
    /** 只有一页时整条不渲染。 */
    hideOnSinglePage?: boolean;
    /** 简洁模式：只留 `‹ 2 / 36 ›`，不铺页码。 */
    simple?: boolean;
    /** 整条禁用。 */
    disabled?: boolean;
    /** 无障碍名，默认走内置字典「分页」。 */
    ariaLabel?: string;
    /** 覆盖内置文案翻译（插件自带 i18n 时用）。 */
    translate?: Translate;
    className?: string;
    style?: CSSProperties;
}
/**
 * Table 内建分页的配置：与 {@link PaginationProps} 同参数，只把 `total` 放宽为可选。
 *
 * 语义分叉就在 `total` 上：**不传 = 本地分页**（`rows` 是全量，Table 按当前页切片，
 * 总条数取 `rows.length`）；**传了 = 服务端分页**（`rows` 已是当前页的数据，Table 不再切片，
 * 总条数按传入值算页数）。两种用法都不会让调用方自己算页数。
 */
export interface TablePaginationConfig extends Omit<PaginationProps, 'total'> {
    total?: number;
}
/**
 * 分页（`‹ Previous  1 [2] 3 … 36  Next ›`）。
 *
 * 受控组件：页码由调用方持有，这里只发 `onChange(page, pageSize)`。
 * 样式只 import 自己那份 CSS（`PAGINATION_CSS`），引它就只打包这一份。
 */
export declare function Pagination(props: PaginationProps): ReactNode;
//# sourceMappingURL=Pagination.d.ts.map