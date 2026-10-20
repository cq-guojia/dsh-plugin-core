import type { OfficeToPdfFace, PickFilter, RootCache, WorkspaceFilesFace } from './types.js';
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
    /** 关闭后回调（✕ / Esc / handle.close 都触发）。 */
    onClose?: () => void;
    /** 初始宽度（px，默认 460）。 */
    width?: number;
    /** 宽度下限（默认 320）。 */
    minWidth?: number;
    /** 工作区根缓存（与调用方共享时传）。 */
    rootCache?: RootCache;
}
/** 打开工作区文件/文件夹的停靠预览；重复打开会关掉上一个（同侧边栏位）。 */
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
    /** 锚点元素：弹窗在其左侧展开、下缘齐平；不传 = 屏幕居中。 */
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
}
/**
 * 弹出「选择工作区文件」模态弹窗，Promise 返回选中结果；取消（Esc / 点外部 / ✕）resolve `null`。
 * 关闭路径与 portal 浮层菜单不冲突：点外部用**整屏 backdrop** 接——官方 Menu 的 portal
 * 层级在 backdrop 之上，点菜单项不会误判为「点外部」（源实现自实现点外检测踩过的坑）。
 */
export declare function pickWorkspaceFile(options: PickWorkspaceFileOptions): Promise<PickedFile | null>;
//# sourceMappingURL=open.d.ts.map