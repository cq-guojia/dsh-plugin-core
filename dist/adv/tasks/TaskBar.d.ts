import { type CSSProperties, type ReactNode } from 'react';
import { type ButtonSize } from '../../ui/actions/Button.js';
import { type TaskNotificationRecord, type TaskState } from './model.js';
/** 展示形态：只图标 / 图标 + 文字长条。 */
export type TaskBarForm = 'icon' | 'pill';
/**
 * 动作没执行成功时的载荷。三种来源：条目已不在 / 已过回收窗口、下标越界、
 * 创建这条任务的页面没了（跨页 2s 等不到 ack）—— 核心都自愈不了，只能报出来。
 */
export interface TaskActionFailure {
    task: TaskNotificationRecord;
    /** 可见动作（当前状态按 `when` 过滤后的 `rowButtons`）中的序号，非 `task.rowButtons` 原始下标。 */
    index: number;
    /** 动作上的文案；没配就没有。 */
    label?: string;
}
export interface TaskBarProps {
    /** `icon` = 只有图标（有任务在跑时右上角带绿点）；`pill` = 图标 + 文字长条。默认 `pill`。 */
    form?: TaskBarForm;
    /**
     * 触发器尺寸档：`sm`(24) / `md`(28) / `lg`(32)，默认 `md`。
     * 只图标形态宽高恒等（纯图标钮就是正方形），长条形态只改高度与字号。
     */
    size?: ButtonSize;
    /** 分组过滤：数组 = 只看这几个 group；`'*'` 或不传 = 不限分组。跨项目由下面 `project` 决定，省略则不限。 */
    groups?: readonly string[] | '*';
    /** 只收该项目的任务；省略 / `null` = 不限项目、跨项目全收。 */
    project?: string | null;
    /**
     * 行内按钮点了但没生效时调它（条目已失效 / 方法在别页且等不到 ack / 下标越界）。
     * 不传就由本栏弹一次核心自带提示 —— 「点了没反应」不该是静默的。
     */
    onActionFailure?: (failure: TaskActionFailure) => void;
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
    /**
     * 受控展开态。传了就必须同时传 `onOpenChange` 并回写，否则点外部 / Esc / 行按钮 / 前台浮层
     * 四条关闭路径只会发回调、DOM 不会真的收起。运行中不要切换受控 / 非受控。
     */
    open?: boolean;
    /** 展开态变化。自动收起发 `false`，触发器点开发 `true`；受控时必须回写到 `open`。 */
    onOpenChange?: (open: boolean) => void;
    /** 点行按钮后是否收起面板，默认 `true`（通用菜单「点项即收」）。传 `false` 可保持面板。 */
    closeOnAction?: boolean;
    /**
     * 终态行在列表里停留多久再退场（毫秒），默认 60000 —— 给 `when: done/failed` 的行按钮留点击窗口。
     * 到点先播退场动画再移除；传 0 则终态即时退场。
     */
    settleRetainMs?: number;
    /** 追加 class（只补布局）。 */
    className?: string;
    style?: CSSProperties;
}
/** 展开态变更的纯判定：抽出来是为了在无 jsdom 的 node 自检里覆盖受控 / 非受控与去重边界。 */
export type OpenStateDecision = {
    readonly kind: 'noop';
} | {
    readonly kind: 'setInternal';
    readonly value: boolean;
} | {
    readonly kind: 'emit';
    readonly value: boolean;
};
export declare function decideOpenState(current: boolean, next: boolean, controlled: boolean): OpenStateDecision;
/**
 * 只有点在面板 / 触发器之外，且 pointerdown 与 click 两个时刻都不在模态中才收起。
 * 关弹窗的那一下：pointerdown 时模态还在，click 时已卸载，不能把面板一起收掉。
 */
export declare function shouldCloseOnOutsideClick(targetInside: boolean, modalOpenAtPointerDown: boolean, modalOpenAtClick: boolean): boolean;
/** 终态标签：状态可信时区分成功 / 失败；认不出来就中性「完成」，不假成功。 */
export declare function settledChipOf(state: TaskState | undefined): {
    readonly tone: 'success' | 'danger' | 'neutral';
    readonly key: 'taskbarSucceeded' | 'taskbarFailed' | 'taskbarDone';
};
/** 一条终态行在时刻 now 的展示阶段（纯派生，组件重挂也从 settledAt 重算，不会「恢复」）。 */
export type RowSettlePhase = 'rest' | 'leaving' | 'gone';
/**
 * 终态行阶段：从 settledAt 与 now 的差值算，不存组件 state。
 * - 运行中 / 没带 settledAt ⇒ 不归本函数管（调用方单独处理）。
 * - rest = 停留期；leaving = 退场动画期（retainMs 前 EXIT_ANIM_MS）；gone = 已消失。
 */
export declare function rowSettlePhase(settledAt: number, now: number, retainMs: number): RowSettlePhase;
/**
 * 后台任务中心的通用展示栏：未展开时是一颗按钮，展开后列出后台正在跑的任务。
 *
 * 数据面来自共享任务池（`taskCenterStore`），不接 props 里的任务数组；
 * 触发器是 `Button`（长条）/ 纯图标（自动正方形）两档，下拉容器复用 `PanelSurface`（menu 档）。
 * 有任务在跑时图标字形呼吸（大小循环），表示后台确实在动；只做 CSS 动画，不跑定时器。
 *
 * 面板里**只画一条外框**：行与行之间是一条虚线，不给每行再套底色 / 描边 / 圆角
 * （2026-11-15 用户：点开不要圆环套圆环）。
 *
 * 行右侧的按钮来自记录里的 `rowButtons`：点它走 `pressTaskButton`，方法本体在创建这条任务的那一页，
 * 这里只拿得到文案与下标。
 *
 * ```tsx
 * h(TaskBar, { form: 'pill', size: 'md', groups: ['scan'] })
 * h(TaskBar, { form: 'icon', size: 'sm' })   // 24×24 的正方形，带绿点与呼吸
 * ```
 */
export declare function TaskBar(props: TaskBarProps): ReactNode;
//# sourceMappingURL=TaskBar.d.ts.map