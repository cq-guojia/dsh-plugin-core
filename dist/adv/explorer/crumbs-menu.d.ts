/**
 * ▾ 选层下拉的**条目构造**（picker 与 dock 共用同一段代码，差别只在入参 —— 源实现用户 2026-09-29
 * 点名提炼，严禁两处各写一份）。
 *
 *  - 根层常驻最上面：POSIX 一条「根目录」，Windows 是一排盘符（用户 2026-11-03）；
 *  - 当前工作区排第一（打开文件夹图标 + 加粗），**其下路径紧跟**（每层一个右箭头位缩进），
 *    再列其他工作区（关合图标 + 灰）—— 「打开哪个就跟在哪个下面」；点当前工作区 = 回到其根目录；
 *  - 当前工作区未知（rootName 空或不在清单）时路径段置顶、全部工作区按「其他」罗列；
 *  - workspaces 为空（宿主还没给工作区快照）= 只出路径段（根无箭头、其下逐层缩进）。
 *
 * 条目是**自写浮层**（核心没有「带缩进的选择层菜单」这类控件 ⇒ 按兄弟项目
 * dsh-task-dispatch-table 的 .dsh-tdt-sv-crumbs-menu* 逐条照抄间距）：backdrop + 菜单本体 +
 * `-item`（4px 8px / 最大宽 280 / 超出滚动 / 空态）。
 *
 * 2026-11-03 从 FileBrowser.ts 拆出来（原来单文件 1000+ 行、五个职责）：这里只有「菜单里放什么」，
 * 浮层外壳与表皮在 FileBrowser（`panel.css` 的 menu 档），互不掺。
 */
import { type ReactNode } from 'react';
export interface CrumbsMenuEntryParams {
    workspaces: readonly string[];
    /** 根层条目：POSIX 只有「根目录」；Windows 是盘符清单（用户 2026-11-03）。 */
    roots: ReadonlyArray<{
        label: string;
        path: string;
    }>;
    rootName: string;
    rootFallbackLabel: string;
    crumbs: ReadonlyArray<{
        label: string;
        path: string;
    }>;
    onPickWorkspace?: (name: string) => void;
    onLoadDir?: (path: string) => void;
}
/** 菜单条目（根层 → 当前工作区 + 其下路径 → 其他工作区）。 */
export declare function crumbsMenuEntries(params: CrumbsMenuEntryParams): ReactNode[];
//# sourceMappingURL=crumbs-menu.d.ts.map