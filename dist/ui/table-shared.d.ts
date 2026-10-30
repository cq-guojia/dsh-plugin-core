import { createElement as h, type CSSProperties, type ReactNode } from 'react';
import { type Translate } from '../utils/i18n.js';
import type { TablePaginationConfig } from './Pagination.js';
import { type SectionHeadAccent } from './SectionHead.js';
import { type TableBorders, type TableColumn, type TableDensity, type TableGroup, type TableRow } from './table-logic.js';
/**
 * 表格外观的公共 props。**对外组件各自继承它，不要直接把本接口给消费方**：
 * 消费方看到的是 `TableProps` 这类具名类型，外观由「引哪个组件」决定。
 */
export interface TableSharedProps {
    /** 列定义；`children` 非空即分组表头（组件自动算 colSpan / rowSpan）。 */
    columns: readonly TableColumn[];
    /**
     * 行数据；`key` 兼作选中标识，`cells` 按叶子列 key 取内容。
     * 值可以是任意 ReactNode，也可以是 `{ content, colSpan, rowSpan, align }` 对象；
     * 某列 key 缺省（undefined）= 该格不渲染，给上一行的 rowSpan 让位。
     */
    rows?: readonly TableRow[];
    /**
     * 分组数据：每组带一行通栏标题 + 自己的表头 + 自己的数据行，多组连续排布。
     * 与 `rows` 二选一；传了 `groups` 就忽略 `rows`（用于「一个表里多个工作区 / 板块」）。
     */
    groups?: readonly TableGroup[];
    /**
     * 通栏标题前的固定标签（画出来的短竖线）颜色（只对 `groups` 模式生效）：内置语义色名
     * （business / success / warning / danger / purple / pink / cyan / teal / orange / indigo /
     * rose / slate）或任意 CSS 色值；`'default'` / 不传 = 主题默认（浅色深灰、深色浅灰）；
     * `false` = 不画这条竖线。绘制与样式归 `SectionHead`，Table 只把标题装进通栏。
     */
    groupAccent?: SectionHeadAccent | false;
    /** 行密度（行高 + 水平内距），默认 default。 */
    density?: TableDensity;
    /** 斑马纹（偶数行淡底），默认 false。 */
    striped?: boolean;
    /** 外框范围：y 只上下两条（默认，无左右边）/ all 四边 / x 只左右两条 / none 全不要。 */
    borders?: TableBorders;
    /** 选中行（高亮 + 左侧竖条由皮肤决定）。 */
    selectedKeys?: readonly (string | number)[];
    /** 传了才可点：行获得指针 / 键盘（Enter、空格）激活能力。 */
    onRowClick?: (row: TableRow, index: number) => void;
    /** 空数据文案；不传走内置字典（中英随 `setLocale`）。 */
    emptyText?: ReactNode;
    /** 无障碍名（表格没有可见标题时请务必给）。 */
    ariaLabel?: string;
    /**
     * 内建分页（**只在 `Table` 上生效**，`tableShell` 自己不读它）：给出即按当前页切片 `rows`
     * 并在表格下方渲染分页条；`total` 缺省 = `rows.length`（本地分页），给了就按服务端分页处理
     * （不切片）。`groups` 模式不分页 —— 传了 `groups` 就忽略本项。
     */
    pagination?: TablePaginationConfig;
    /**
     * 整表加载中（首屏还没有任何数据时用）：表格主体换成一块较高的占位区（居中三块加载动画，最大号，无文案）。
     * 已有数据时不遮挡数据 —— 追加下一页请用 `loadingMore`。
     */
    loading?: boolean;
    /** 整表加载占位区的高度（px），默认 160。 */
    loadingHeight?: number;
    /**
     * 底部「加载更多」中（已有数据、正在取下一页）：在数据行下方插一行中号三块加载动画（无文案）。
     * 只在给了 `onLoadMore` 时生效。
     */
    loadingMore?: boolean;
    /**
     * 是否还有下一页，默认 true。`false` 时底部显示「没有更多数据」；
     * 文案可用 `noMoreText` 换，给 `false` 整行不渲染。只在给了 `onLoadMore` 时生效。
     */
    hasMore?: boolean;
    /** 到底文案；不传走内置字典（中英随 `setLocale`）。 */
    noMoreText?: ReactNode;
    /**
     * 滚动到底自动加载下一页：**这个 props 本身就是开关** —— 传了就装底部哨兵并监听，
     * 不传完全不监听、也不触发。正在加载（`loading` / `loadingMore`）或已到底（`hasMore: false`）
     * 时不会重复触发。与 `pagination` / `groups` 同时给时忽略（一个表里两套翻页说不清）。
     */
    onLoadMore?: () => void;
    /** 追加 class（只允许补布局，不许覆盖皮肤）。 */
    className?: string;
    style?: CSSProperties;
    /** 覆盖内置文案翻译（如插件自带 i18n）。 */
    translate?: Translate;
}
/** `tableShell` 的渲染选项（内部参数，不进公开 props）。 */
interface TableShellOptions {
    /**
     * 底部哨兵元素的 ref：给了才渲染哨兵行（供调用方挂 IntersectionObserver）。
     * 不给 = 不做滚动监听（`onLoadMore` 仍可透传，但不会自动触发）。
     */
    sentinelRef?: (node: HTMLTableRowElement | null) => void;
}
/**
 * 表格共享渲染壳（**内部件，不进公开导出**）。
 *
 * 职责：基础层样式登记 + 语义化 `<table>` 结构 + 表头分组计算 + 行交互 + 列/单元格配置落地。
 * 外观（表头底色 / 分隔线 / 悬浮 / 选中）由调用方的皮肤 CSS 负责：每个公开组件
 * （`Table`、将来的 `TableGrid` / `TableZebra`）只 import 自己那份皮肤，并把自己的
 * modifier class 传进来。这样消费方引哪个就只打包哪个 —— 绝不用 `variant` 汇总多份皮肤。
 */
export declare function tableShell(skinClass: string, props: TableSharedProps, options?: TableShellOptions): ReturnType<typeof h>;
export {};
//# sourceMappingURL=table-shared.d.ts.map