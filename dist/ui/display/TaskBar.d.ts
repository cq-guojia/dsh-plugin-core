import { type CSSProperties, type ReactNode } from 'react';
import { type ButtonSize } from '../actions/Button.js';
import { type TaskNotificationGroupFilter } from '../infra/task-notifications.js';
/** 展示形态：只图标 / 图标 + 文字长条。 */
export type TaskBarForm = 'icon' | 'pill';
export interface TaskBarProps {
    /** `icon` = 只有图标（有任务在跑时右上角带绿点）；`pill` = 图标 + 文字长条。默认 `pill`。 */
    form?: TaskBarForm;
    /**
     * 触发器尺寸档：`sm`(24) / `md`(28) / `lg`(32)，默认 `md`。
     * 只图标形态宽高恒等（纯图标钮就是正方形），长条形态只改高度与字号。
     */
    size?: ButtonSize;
    /** 与 `selectTaskNotifications` 同口径：不传 = 默认项目全部二级；数组 = 这几个二级；`'*'` = 全站。 */
    groups?: TaskNotificationGroupFilter;
    /** 换项目看；`null` = 不限项目。默认取全局默认项目。 */
    project?: string | null;
    /** 连 `hidden` 任务一起列（默认不列）。 */
    includeHidden?: boolean;
    /** 面板首选展开方向，默认向下；空间不够会自动翻。 */
    placement?: 'down' | 'up';
    /** 任务没带图标时用的默认图标（`库名:图标名`）。 */
    defaultIcon?: string;
    /**
     * 触发器的宽（px 或任意 CSS 宽度值）。三轴与 `Button` 同口径：固定宽优先，
     * 一旦设定 `minWidth` / `maxWidth` 自动失效。只图标形态宽高恒等（正方形），**忽略这三个参数**。
     */
    width?: number | string;
    /** 最小宽：`width` 未设时生效，内容不足此宽时以它为准。 */
    minWidth?: number | string;
    /** 最大宽：`width` 未设时生效；文字放不下折叠成省略号，hover 跑马灯展开（同 `Button`）。 */
    maxWidth?: number | string;
    /** 追加 class（只补布局）。 */
    className?: string;
    style?: CSSProperties;
}
/**
 * 通知任务中心的通用展示栏：未展开时是一颗按钮，展开后列出后台正在跑的任务。
 *
 * 数据面全部来自池本身（`taskNotifications` + `selectTaskNotifications`），不接 props 里的任务数组；
 * 触发器是 `Button`（长条）/ `IconButton`（纯图标，正方形）两档，下拉容器复用 `PanelSurface`（menu 档）。
 * 有任务在跑时图标字形呼吸（大小循环），表示后台确实在动；只做 CSS 动画，不跑定时器。
 *
 * 面板里**只画一条外框**：行与行之间是一条虚线，不给每行再套底色 / 描边 / 圆角
 * （2026-11-15 用户：点开不要圆环套圆环）。
 *
 * 行右侧的按钮来自记录里的 `actions`：点它调 `runAction`，方法本体在创建这条任务的那一页，
 * 这里只拿得到文案与下标。
 *
 * ```tsx
 * h(TaskBar, { form: 'pill', size: 'md', groups: ['scan'] })
 * h(TaskBar, { form: 'icon', size: 'sm' })   // 24×24 的正方形，带绿点与呼吸
 * ```
 */
export declare function TaskBar(props: TaskBarProps): ReactNode;
//# sourceMappingURL=TaskBar.d.ts.map