import { type CSSProperties, type ReactNode } from 'react';
import { type TaskNotificationGroupFilter } from '../infra/task-notifications.js';
/** 展示形态：只图标 / 图标 + 文字长条。 */
export type TaskBarForm = 'icon' | 'pill';
export interface TaskBarProps {
    /** `icon` = 只有图标（有任务在跑时右上角带绿点）；`pill` = 图标 + 文字长条。默认 `pill`。 */
    form?: TaskBarForm;
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
    /** 追加 class（只补布局）。 */
    className?: string;
    style?: CSSProperties;
}
/**
 * 通知任务中心的通用展示栏：未展开时是一颗按钮，展开后列出后台正在跑的任务。
 *
 * 数据面全部来自池本身（`taskNotifications` + `selectTaskNotifications`），不接 props 里的任务数组；
 * 触发器复用 `Button`、每一行复用 `ListRow`、下拉容器复用 `PanelSurface`（menu 档），
 * 本文件只排布局与那枚绿点。行右侧的按钮来自记录里的 `actions`：点它调 `runAction`，
 * 方法本体在创建这条任务的那一页，这里只拿得到文案与下标。
 *
 * ```tsx
 * h(TaskBar, { form: 'pill', groups: ['scan'] })
 * h(TaskBar, { form: 'icon' })   // 只给一个带绿点的图标
 * ```
 */
export declare function TaskBar(props: TaskBarProps): ReactNode;
//# sourceMappingURL=TaskBar.d.ts.map