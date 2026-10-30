import { createElement as h, type CSSProperties, type ReactNode } from 'react';
import { type Translate } from '../utils/i18n.js';
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
    /** 追加 class（只允许补布局，不许覆盖皮肤）。 */
    className?: string;
    style?: CSSProperties;
    /** 覆盖内置文案翻译（如插件自带 i18n）。 */
    translate?: Translate;
}
/**
 * 表格共享渲染壳（**内部件，不进公开导出**）。
 *
 * 职责：基础层样式登记 + 语义化 `<table>` 结构 + 表头分组计算 + 行交互 + 列/单元格配置落地。
 * 外观（表头底色 / 分隔线 / 悬浮 / 选中）由调用方的皮肤 CSS 负责：每个公开组件
 * （`Table`、将来的 `TableGrid` / `TableZebra`）只 import 自己那份皮肤，并把自己的
 * modifier class 传进来。这样消费方引哪个就只打包哪个 —— 绝不用 `variant` 汇总多份皮肤。
 */
export declare function tableShell(skinClass: string, props: TableSharedProps): ReturnType<typeof h>;
//# sourceMappingURL=table-shared.d.ts.map