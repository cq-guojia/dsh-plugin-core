/**
 * 停靠面板（PanelDock）—— 可停靠的右侧分栏容器。
 *
 * 形态：**布局成员，不是浮层**。占宽度、把主区挤窄，因此必须由调用方放进自己的
 * flex 根容器里；不能像 Modal 那样自挂 `document.body`（自挂只能遮盖、挤不窄）。
 *
 * 分工照成熟组件库的通行做法（Ant Design `Tabs` / `Drawer` 同一套）：
 *   · **结构写在调用点** —— `<PanelDock dock={dock}><DockPanel id="files">…</DockPanel></PanelDock>`；
 *   · **显隐归状态** —— `dock.open('files')` / `dock.close('files')`，只传 id，不传内容；
 *   · **头部可控** —— `title` / `icon` / `extra` 三件套；要更自由就 `header` 整块替换，`header={null}` 表示不要头部；
 *   · **关闭钮可退让** —— `closable={false}` 不出；`closeButton="floating"` 浮在右上角，不占头部布局。
 */
import { createElement as h, type ReactNode } from 'react';
import { type Translate } from '../utils/i18n.js';
import { type DockState, type OpenResult } from './panel-dock-logic.js';
/** 关闭钮位置：`auto` = 有头部就放头部行末、没头部就浮着。 */
export type DockCloseButton = 'auto' | 'header' | 'floating' | 'none';
/** 关闭来源：区分「用户点 ✕」与「代码关的」，拦截/清理时用得着。 */
export type DockCloseReason = 'button' | 'api';
export interface DockPanelProps {
    /** 组名（寻址键）；同名唯一。 */
    id: string;
    /** 标题；`header` 传了非 undefined 的值时它只用于无障碍名。 */
    title?: ReactNode;
    /** 标题前的图标位（可多个）。 */
    icon?: ReactNode;
    /** 标题**右侧**的任意内容（可以是按钮、标签、下拉、甚至是弹层触发器）。 */
    extra?: ReactNode;
    /**
     * 整块替换头部：
     *   · 不传 / `undefined` ⇒ 内置头（`icon` + `title` + `extra`）
     *   · `null` ⇒ 不要头部（此时关闭钮默认浮在右上角）
     *   · 其他 ReactNode ⇒ 你的头部，库不加内边距/边框/背景
     */
    header?: ReactNode | null;
    /** 是否显示关闭钮（默认 true）。 */
    closable?: boolean;
    /** 关闭钮位置（默认 `auto`）。 */
    closeButton?: DockCloseButton;
    /** 自定义关闭图标（默认 ✕）。 */
    closeIcon?: ReactNode;
    /** 首次打开时的宽度（px，默认 460）。 */
    width?: number;
    /** 可拖动的宽度下限（默认 320）。 */
    minWidth?: number;
    /** 可拖动的宽度上限；不传 = 只受视口与主区保底约束。 */
    maxWidth?: number;
    /** 无头部时的无障碍名（缺省退回 `title`，再退回 `id`）。 */
    ariaLabel?: string;
    children?: ReactNode;
}
/**
 * 声明一个面板。**它自己不渲染任何东西**——由父级 `<PanelDock>` 读它的 props 后统一画。
 * 因此必须作为 `<PanelDock>` 的**直接子元素**（可以条件渲染成 `null`）。
 */
export declare function DockPanel(_props: DockPanelProps): null;
export interface PanelDockOptions {
    /** 同时存在的栏数上限（默认 3）。 */
    maxPanels?: number;
    /** 新栏默认宽度（默认 460）。 */
    defaultWidth?: number;
    /** 新栏默认宽度下限（默认 320）。 */
    minWidth?: number;
    /** 宽度记忆前缀；传 `false` 关闭记忆（默认 `dshpc-dock`）。 */
    storageKey?: string | false;
    /** 新开一栏后触发（重复打开已存在的不触发）。 */
    onOpen?: (event: {
        id: string;
        created: boolean;
    }) => void;
    /** 关闭**之前**触发；返回 `false` 可取消（未保存内容拦截就靠它）。 */
    onBeforeClose?: (event: {
        id: string;
        reason: DockCloseReason;
    }) => boolean | undefined;
    /** 已经关掉之后触发。 */
    onClose?: (event: {
        id: string;
        reason: DockCloseReason;
    }) => void;
    /** 拖宽松手后触发。 */
    onResize?: (event: {
        id: string;
        width: number;
    }) => void;
    /** 到上限被拒时触发（库不弹提示、不抛异常）。 */
    onLimitReached?: (event: {
        id: string;
    }) => void;
}
export interface PanelDockController {
    open(id?: string): OpenResult;
    close(id?: string, reason?: DockCloseReason): void;
    toggle(id?: string): OpenResult;
    isOpen(id?: string): boolean;
    /** 收起：面板退出布局、变成右侧固定耳朵（宽度保留，展开还原）。 */
    collapse(id?: string): void;
    /** 展开：把耳朵收回、面板回到布局。已满栏时拒绝（触发 onLimitReached）。 */
    expand(id?: string): void;
    isCollapsed(id?: string): boolean;
    ids(): string[];
    setWidth(id: string, width: number): void;
    subscribe(listener: () => void): () => void;
    getSnapshot(): DockState;
    /** 归一化后的默认值（组件兜底用）。 */
    defaults: {
        maxPanels: number;
        defaultWidth: number;
        minWidth: number;
    };
}
/**
 * 造一个面板控制器。状态在它身上，组件用 `useSyncExternalStore` 订阅。
 *
 * 为什么状态不放在组件里：开门/关门常常发生在按钮 onClick、事件回调里（命令式），
 * 而**内容与头部仍在调用点声明**——这正是 Tabs 那种「状态 + children」的分工。
 */
export declare function createPanelDock(options?: PanelDockOptions): PanelDockController;
export interface PanelDockProps {
    /** `createPanelDock()` 的返回值。 */
    dock: PanelDockController;
    /** 由 `<DockPanel>` 直接子元素组成。 */
    children?: ReactNode;
    /** 追加 class（只补布局，不覆盖皮肤）。 */
    className?: string;
    /** 拖宽时给主区留的最小宽度（px，默认 480）。 */
    mainMinWidth?: number;
    translate?: Translate;
}
/** 停靠栏本体：只渲染「开着的」面板，结构取自对应的 `<DockPanel>`。 */
export declare function PanelDock(props: PanelDockProps): ReturnType<typeof h>;
//# sourceMappingURL=PanelDock.d.ts.map