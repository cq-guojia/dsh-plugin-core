import { createElement as h } from 'react';
import { type Translate } from '../utils/i18n.js';
import { type WorkspaceFilesFace } from './types.js';
export interface ExplorerPanelProps {
    /** 宿主能力面，由插件从 ctx 取出后注入（本包不抓宿主全局）。 */
    workspaceFiles: WorkspaceFilesFace;
    sessionId: string;
    /** 起始路径；`''` = 工作区根。 */
    path?: string;
    /** 选中文件时回调（点目录也会清空选中后进入）。 */
    onSelect?: (path: string | null) => void;
    onOpenFile?: (path: string) => void;
    /** 空目录文案；不传用内置。 */
    emptyText?: string;
    translate?: Translate;
}
/**
 * 工作区浏览面板：面包屑 + 目录树 + 文件预览。
 *
 * 与源实现（dispatch `file-browser.tsx`）的差别：**不搬 CodeMirror 代码预览与 Office/PDF 预览**
 * —— 那两个会引入 `@codemirror/*` 与宿主 `officeToPdf` 两个重依赖，不符合「零必需依赖」。
 * 这里只做文本 / 图片 / 不支持三类，其它类型给明确兜底而不是硬撑。
 */
export declare function ExplorerPanel(props: ExplorerPanelProps): ReturnType<typeof h>;
//# sourceMappingURL=ExplorerPanel.d.ts.map