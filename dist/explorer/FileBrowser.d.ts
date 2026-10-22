import { createElement as h, type CSSProperties } from 'react';
import { type Translate } from '../utils/i18n.js';
import { type OfficeToPdfFace, type PickFilter, type RootCache, type WorkspaceAnchorItem, type WorkspaceFilesFace } from './types.js';
export interface FileBrowserProps {
    workspaceFiles: WorkspaceFilesFace;
    /** 官方 remote.officeToPdf；未就位传 null ⇒ Office 文件出「不可用」空态。 */
    officeToPdf?: OfficeToPdfFace | null;
    sessionId: string;
    /** 起始路径：目录 ⇒ 直接列；文件 ⇒ 预览态（dir 取父目录，面包屑保留可返回）。 */
    path: string;
    /** 关闭回调（✕ 与越界只读态共用）。 */
    onClose?: () => void;
    /** 工作区根显示名（picker = 调用方选的工作区名）；不传 = 用缓存根的末段。 */
    rootName?: string;
    /** ▾ 下拉顶部的工作区清单；不传 = 不显示工作区段。 */
    workspaces?: readonly string[];
    /**
     * 宿主工作区清单（带绝对 path，`workspaces` 服务快照的消费子集）——**路径 → 会话解析用**：
     * props.path 是绝对路径时，按最长前缀匹配工作区，list 换用该工作区名下的会话 id
     * （官方 list 按 sessionId 解析工作区根，默认 sessionId 的根不含该路径就会被官方判越界）。
     * **可选覆盖**：不传 = 自动用宿主 workspaces 快照（connectHost 注入的 workspaceList）；
     * 快照也没数据（未接线 / 宿主没给）⇒ 不匹配，一切 list 回落 props.sessionId。
     */
    workspaceAnchors?: readonly WorkspaceAnchorItem[];
    /** 从 ▾ 下拉选择其他工作区（点当前工作区 = 回其根目录）。 */
    onSelectWorkspace?: (name: string) => void;
    /** 工作区根缓存（可注入；不传 = 内部自建，随组件废弃——不用模块级 Map）。 */
    rootCache?: RootCache;
    /** 外部容器样式（嵌入浮层时撑满高度用）。 */
    style?: CSSProperties;
    translate?: Translate;
    /** 选择器态：点文件即 onPick（不进预览）；不传 = 浏览态。 */
    picker?: boolean;
    /** 选择器选中回调：path 为**工作区相对**路径，isDir = 选的是整个文件夹。 */
    onPick?: (path: string, isDir: boolean) => void;
    /** 选择器过滤（exts = 只要这些扩展名；dirs = 只要文件夹；不传 = 不限）。 */
    filter?: PickFilter;
}
/** 目录浏览器面板。详见 {@link FileBrowserProps}。 */
export declare function FileBrowser(props: FileBrowserProps): ReturnType<typeof h>;
//# sourceMappingURL=FileBrowser.d.ts.map