import { type ReactNode } from 'react';
import { type Translate } from '../utils/i18n.js';
import { type PickPlacement } from './picker-placement.js';
import type { OfficeToPdfFace, PickedPath, PickFilter, WorkspaceAnchorItem } from './types.js';
type Anchors = readonly WorkspaceAnchorItem[];
/**
 * 入参路径解析成**绝对路径**（`''` = 虚拟根）。用户 2026-11-03 定：绝对/相对都收。
 *
 * 相对路径必须有一个基准：显式 `sessionId` 所属工作区优先，其次「最近有会话的工作区」。
 * 解析不出 ⇒ `null`（调用方提示 `explorerNoBase`，不猜）。
 */
export declare function resolveStartPath(path: string, anchors: Anchors, sessionId?: string): string | null;
export interface FilePreviewHandle {
    /** 关闭预览（幂等）。 */
    close(): void;
    /** 当前预览的路径（调用方传入值）。 */
    readonly path: string;
}
export interface OpenFilePreviewOptions {
    /** 文件或文件夹路径：绝对 / 工作区相对都收；`''` = 从根节点（工作区清单 + 盘符）开。 */
    path?: string;
    /**
     * 自定义审阅内容：传入则核心渲染它进右侧 dock，**替代**内置 FileBrowser（解耦用途——
     * 例如把「某次改动的 diff」当内容塞进来，核心本身不认识 changes）。与 `path` 二选一。
     */
    content?: () => ReactNode;
    officeToPdf?: OfficeToPdfFace | null;
    /** 相对路径的基准工作区（也是 Office 预览用的会话）。可省。 */
    sessionId?: string;
    /** 工作区根显示名（面包屑第一段的兜底）。 */
    rootName?: string;
    /** 相对路径 / 面包屑的基准目录；不传 = 按路径匹配出的工作区根。 */
    rootPath?: string;
    /** ▾ 下拉顶部的工作区清单（显示名）；不传 = 宿主快照里的全部。 */
    workspaces?: readonly string[];
    /**
     * 宿主工作区清单（带绝对 path）：**可选覆盖**。不传 = 自动用宿主 workspaces 快照
     * （connectHost 注入的 workspaceList）——调用方零传参也能匹配、能切。
     */
    workspaceAnchors?: readonly WorkspaceAnchorItem[];
    /** 从 ▾ 下拉选择其他工作区（核心默认自己开，一般不用接）。 */
    onSelectWorkspace?: (name: string) => void;
    /** 关闭后回调（✕ / Esc / handle.close 都触发）。 */
    onClose?: () => void;
    /** 初始宽度（px，默认 460）。 */
    width?: number;
    /** 宽度下限（默认 320）。 */
    minWidth?: number;
    /** 宽度上限；不传 = 只受视口与主区保底约束。 */
    maxWidth?: number;
    /** 拖宽时给主区留的最小宽度（px，默认 480）。 */
    mainMinWidth?: number;
    /** 面板无障碍名（没有头部，只用于 aria-label）。 */
    title?: string;
    translate?: Translate;
    /**
     * **必填**：挂进哪个布局容器（`PanelDock` 是布局成员 —— 占宽度、把左边挤窄）。
     *
     * 传入的应当是**你自己的 flex 行**（页面主区 + 侧栏那一层）：核心 dock 会成为它的
     * 最后一个 flex 子项，于是主区被真正挤窄。**不要**传 `document.body` 再自己套 fixed
     * —— 那是浮层，不是分栏（用户 2026-10-21 明确否决）。
     */
    mount: HTMLElement;
}
/**
 * 打开工作区文件/文件夹的**停靠**预览（分栏：挤窄 `mount` 左边的兄弟，不是盖上去）。
 * 重复打开会关掉上一个（同侧边栏位）。
 *
 * 消费方最少写法（`connectHost(ctx)` + `connectFs({ path })` 已接线）：
 * `openFilePreview({ mount, path })` —— 路径解析、工作区匹配都由核心自己解。
 */
export declare function openFilePreview(options: OpenFilePreviewOptions): FilePreviewHandle | null;
/** 兼容旧名：`PickedPath` 的前身（`path` 现在是绝对路径）。 */
export type PickedFile = PickedPath;
export interface PickWorkspaceFileOptions {
    /** 锚点元素：弹窗贴着它弹（具体方位见 `placement`）；不传 = 屏幕居中。 */
    anchor?: HTMLElement | null;
    /**
     * 展开方位（用户 2026-11-03 定），八档 + 默认 `'auto'`：
     *
     * | 值 | 面板落点 |
     * |---|---|
     * | `auto` | 旧行为：优先下方，下方不够翻上方，横向夹紧（不传就是它） |
     * | `bottom-start` / `bottom-end` | 按钮下方，左缘 / 右缘对齐 |
     * | `top-start` / `top-end` | 按钮上方，左缘 / 右缘对齐 |
     * | `right-start` / `right-end` | 按钮右侧，顶边 / 底边齐平 |
     * | `left-start` / `left-end` | 按钮左侧，顶边 / 底边齐平 |
     *
     * **指定方位后不再自动翻边**（说往左就往左），只在真的超出视口时夹紧——按钮贴着
     * 定宽区右边界时传 `bottom-end` / `left-start` 之类，面板就不会向右溢出。
     */
    placement?: PickPlacement;
    /** 过滤：exts = 只要这些扩展名（小写无点）；dirs = 只要文件夹；不传 = 不限。 */
    filter?: PickFilter;
    officeToPdf?: OfficeToPdfFace | null;
    /** 起步位置：绝对 / 相对路径都收；不传 = 根节点（工作区清单 + 盘符）。 */
    path?: string;
    /** 相对路径的基准工作区（也是 Office 预览用的会话）。可省。 */
    sessionId?: string;
    /** 工作区根显示名（面包屑第一段的兜底）。 */
    rootName?: string;
    /** 相对路径 / 面包屑的基准目录；不传 = 按路径匹配出的工作区根。 */
    rootPath?: string;
    /** ▾ 下拉的工作区清单（切换工作区浏览）。 */
    workspaces?: readonly string[];
    onSelectWorkspace?: (name: string) => void;
    /** 取消回调（Esc / 点外部 / ✕）。 */
    onCancel?: () => void;
    /**
     * 文案注入：调用时把自己的 `t` 传进来，面板里所有文字（就走你的字典）；不传则用核心内置中英字典。
     */
    translate?: Translate;
}
/** 方位类型对外透出：消费方写 `placement` 时不必再 import 内部模块。 */
export type { PickPlacement };
/**
 * 弹出「选择文件」模态弹窗，Promise 返回选中结果；取消（Esc / 点外部 / ✕）resolve `null`。
 *
 * **面板内容与 `openFilePreview` 完完全全是同一个 `FileBrowser`**（不是复制一套）：
 * 差别只有 ① 承载（这里挂在锚点旁的弹窗面板里，那边挂在核心 PanelDock 分栏里）、
 * ② `picker` 形态参数（点文件即回传、行尾按钮变「选择」）。
 */
export declare function pickWorkspaceFile(options: PickWorkspaceFileOptions): Promise<PickedPath | null>;
//# sourceMappingURL=open.d.ts.map