import { type Translate } from '../utils/i18n.js';
import type { OfficeToPdfFace, PickFilter, RootCache, WorkspaceAnchorItem, WorkspaceFilesFace } from './types.js';
export interface FilePreviewHandle {
    /** 关闭预览（幂等）。 */
    close(): void;
    /** 当前预览的路径（调用方传入值）。 */
    readonly path: string;
}
export interface OpenFilePreviewOptions {
    workspaceFiles: WorkspaceFilesFace;
    sessionId: string;
    /** 文件或文件夹路径。 */
    path: string;
    officeToPdf?: OfficeToPdfFace | null;
    /** 工作区根显示名（面包屑首段）。 */
    rootName?: string;
    /** ▾ 下拉顶部的工作区清单（当前工作区展开 + 其余罗列；不传 = 下拉只有路径层）。 */
    workspaces?: readonly string[];
    /**
     * 宿主工作区清单（带绝对 path）：**可选覆盖**。path 为绝对路径时核心按最长前缀匹配所属
     * 工作区、list 换该工作区的会话 id；▾ 下拉「切工作区」也由它驱动。
     * **不传 = 自动用宿主 workspaces 快照**（connectHost 注入的 workspaceList）——
     * 调用方零传参也能匹配、能切。仅在「覆盖快照 / 宿主未接线」时才需要显式传。
     */
    workspaceAnchors?: readonly WorkspaceAnchorItem[];
    /** 从 ▾ 下拉选择其他工作区（点当前工作区 = 回其根目录，不走这里）。 */
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
    /** 工作区根缓存（与调用方共享时传）。 */
    rootCache?: RootCache;
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
 */
export declare function openFilePreview(options: OpenFilePreviewOptions): FilePreviewHandle | null;
export interface PickedFile {
    /** 工作区相对路径。 */
    path: string;
    /** true = 选的是整个文件夹。 */
    isDir: boolean;
}
export interface PickWorkspaceFileOptions {
    workspaceFiles: WorkspaceFilesFace;
    sessionId: string;
    /** 锚点元素：弹窗左缘与之对齐、优先落在它**下方**（下方不够才翻到上方）；不传 = 屏幕居中。 */
    anchor?: HTMLElement | null;
    /** 过滤：exts = 只要这些扩展名（小写无点）；dirs = 只要文件夹；不传 = 不限。 */
    filter?: PickFilter;
    officeToPdf?: OfficeToPdfFace | null;
    /** 工作区根显示名。 */
    rootName?: string;
    /** ▾ 下拉的工作区清单（切换工作区浏览）。 */
    workspaces?: readonly string[];
    onSelectWorkspace?: (name: string) => void;
    /** 取消回调（Esc / 点外部 / ✕）。 */
    onCancel?: () => void;
    rootCache?: RootCache;
    /**
     * 文案注入：调用时把自己的 `t` 传进来，面板里所有文字（含「选择」「进入」、空态、错误文案）
     * 就走你的字典；不传则用核心内置中英字典。**与 openFilePreview 同一个 prop、同一套文案**。
     */
    translate?: Translate;
}
/**
 * 弹出「选择工作区文件」模态弹窗，Promise 返回选中结果；取消（Esc / 点外部 / ✕）resolve `null`。
 *
 * **面板内容与 `openFilePreview` 完完全全是同一个 `FileBrowser`**（不是复制一套）：
 * 差别只有 ① 承载（这里挂在锚点旁的弹窗面板里，那边挂在核心 PanelDock 分栏里）、
 * ② `picker` 形态参数（点文件即回传、行尾按钮变「选择」）。文案 / 根名 / 过滤都按调用时传的走。
 */
export declare function pickWorkspaceFile(options: PickWorkspaceFileOptions): Promise<PickedFile | null>;
//# sourceMappingURL=open.d.ts.map