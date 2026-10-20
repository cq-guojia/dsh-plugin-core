import { extOf, mimeOf } from '../utils/path.js';
import type { UtilMessageKey } from '../utils/i18n.js';
export interface WorkspaceFilesFace {
    /** 文本分页读。⚠️ `range` **必传**（官方按位置参数个数校验，省了会被远端拒），读全量传 `{}`。 */
    read(sessionId: string, path: string, range: {
        offset?: number;
        limit?: number;
    }, signal?: AbortSignal): Promise<{
        offset: number;
        text: string;
        lines: number;
        eof: boolean;
        absolutePath?: string;
        version?: number | string;
        bytes?: number;
    }>;
    /** 二进制读（`options` 同样必传，不传 range 即读全量）。 */
    readBytes(sessionId: string, path: string, options: {
        range?: {
            offset?: number;
            length?: number;
        };
    }, signal?: AbortSignal): Promise<{
        offset: number;
        data: Uint8Array;
        eof: boolean;
        bytes?: number;
    }>;
    /** 列举直接子项；list 一个文件会报 not-directory。 */
    list(sessionId: string, path: string, signal?: AbortSignal): Promise<{
        path: string;
        entries: ReadonlyArray<{
            name: string;
            type: 'file' | 'directory' | 'other';
            size?: number;
        }>;
        truncated: boolean;
    }>;
    /** 单文件 stat（可选：宿主过旧没有此方法时降级）。只认普通文件，目录会抛。 */
    stat?(sessionId: string, path: string, signal?: AbortSignal): Promise<{
        absolutePath: string;
        version?: number | string;
        bytes?: number;
    }>;
}
/**
 * 官方 `remote.officeToPdf` 的消费面（本地结构化声明，零 npm 依赖，同 WorkspaceFilesFace 做法）。
 * 运行时服务由宿主提供（宿主装了 @deepseek-ai/dsh-office-to-pdf 才有）；未装 ⇒ 调用方传 null ⇒
 * Office 文件呈现「预览不可用」，不发起请求、不崩。
 */
export interface OfficeToPdfFace {
    render(sessionId: string, path: string, priority: 'foreground' | 'background', signal?: AbortSignal): Promise<unknown>;
}
export interface DirEntry {
    name: string;
    type: 'file' | 'directory' | 'other';
    size?: number;
}
export interface Listing {
    path: string;
    entries: DirEntry[];
    truncated: boolean;
}
export type PreviewKind = 'image' | 'pdf' | 'md' | 'html' | 'office' | 'text';
export interface PreviewInfo {
    kind: PreviewKind;
    ext: string;
    mime?: string;
}
/** HTML 静态预览的扩展名（与官方 htmlBodyDefinition 同款）。 */
export declare const HTML_KINDS: readonly string[];
/**
 * Office 预览扩展名（官方 remote.officeToPdf 转 PDF 后再渲染）。
 * ⚠️ 官方 OfficeExtension 还含 xls / xlsx，按兄弟项目 2026-10-05 拍板「Excel 向后讨论」不纳入。
 */
export declare const OFFICE_KINDS: readonly string[];
/** 源码态读取上限（256K，UTF-8 边界安全由截断处处理）。 */
export declare const SOURCE_MAX_BYTES: number;
/**
 * 按扩展名分发预览类型。**没有 unsupported 档**：认不出的扩展名一律按 text 走，
 * 由 read 抛 not-text 落「不是文本文件」空态——官方 read 才是真源，不本地猜二进制清单。
 */
export declare function previewInfoOf(path: string): PreviewInfo;
/** 只要 kind（兼容旧用法）；要 ext/mime 用 previewInfoOf。 */
export declare function previewKindOf(path: string): PreviewKind;
type Envelope = {
    kind: 'ok';
    payload: unknown;
} | {
    kind: 'error';
    error: unknown;
};
export declare function unwrapEnvelope(result: unknown): Envelope;
/** 失败分支判空（TS 收窄用）。 */
export declare function isFailed(value: unknown): value is {
    failed: unknown;
};
export type Listed = Listing | {
    failed: unknown;
};
/** `list` 结果防御解析：返回 Listing 或失败/非法信封。 */
export declare function listingOf(result: unknown): Listed | null;
export type TextPage = {
    text: string;
    offset: number;
    lines: number;
    eof: boolean;
} | {
    failed: unknown;
} | null;
/** `read` 结果防御解析：page.text 必须是字符串，否则错误态（防渲染器内部抛错整页黑屏）。 */
export declare function textPageOf(result: unknown): TextPage;
export type BytesRead = Uint8Array | {
    failed: unknown;
} | null;
/** `readBytes` 结果防御解析：data 必须是 Uint8Array，否则错误态。 */
export declare function bytesOf(result: unknown): BytesRead;
/** `stat` 结果防御解析：只取 absolutePath（信封剥壳同款；stat 仅认 regular file）。 */
export declare function absolutePathOf(result: unknown): string | null;
/** 剥 wire 命名空间前缀（如 `workspace-file/not-found` ⇒ `not-found`）。 */
export declare function bareCode(raw: unknown): string;
/** 错误视图：文案键 + 占位参数。 */
export interface ErrView {
    key: UtilMessageKey;
    params?: Record<string, string | number>;
}
/** 任意抛错/reject ⇒ 文案键。官方 code 分支 + 未知回落，绝不按消息文本猜。 */
export declare function errView(error: unknown): ErrView;
/** 子项排序：目录在前，文件在后，各自按名称（不区分大小写）升序。 */
export declare function sortEntries(entries: readonly DirEntry[]): DirEntry[];
/**
 * 0.2.0-rc.1 起官方 list **拒绝空路径** ⇒ 空串（= 工作区根）一律以 `'.'` 上线
 * （`'.'` 按 cwd = 工作区根归一解析为根本身；响应里根的 path 仍是 `''`）。
 */
export declare function listPathOf(dir: string): string;
export interface RootCache {
    get(sessionId: string): string | undefined;
    set(sessionId: string, root: string): void;
}
export declare function createRootCache(): RootCache;
/** 宿主绝对路径形态（/ 开头或 Windows 盘符）。 */
export declare function isAbsoluteish(p: string): boolean;
/** 工作区相对拼接（根下直接 name，不补前导 /）。 */
export declare function relJoin(dir: string, name: string): string;
/** 由「相对路径 + 该文件宿主绝对路径」反推工作区根并写入缓存；学不出返回 null。 */
export declare function learnRoot(cache: RootCache, sessionId: string, relativePath: string, absolutePath: string): string | null;
/** 把宿主绝对路径剥回工作区相对（根未知或不在根下 ⇒ 原样返回，退化）。 */
export declare function relativizeToRoot(cache: RootCache, sessionId: string, dir: string): string;
/**
 * 在相对目录树里找**任意一个文件**并 stat（广度优先、有界：每层最多 5 个目录、最多 3 层）。
 * 用于目标目录本身没有文件子项（空目录 / 只有子目录）时反推工作区根。
 */
export declare function findAnyFileAbs(workspaceFiles: WorkspaceFilesFace, sessionId: string, startDir: string): Promise<{
    absolutePath: string;
    relativePath: string;
} | null>;
/**
 * 把「工作区相对名」的目录解析成宿主绝对路径（面包屑才能从工作区根往下列）。
 * 优先级：① 根已缓存 ⇒ 根 + '/' + 规范相对路径（覆盖空目录 / 只有子目录）；
 * ② 目录里有文件子项 ⇒ stat 它反推根；③ 有界 BFS 找任一文件反推根。
 * 全部失败 ⇒ 退回入参，浏览不受影响。
 */
export declare function absolutizeDir(cache: RootCache, workspaceFiles: WorkspaceFilesFace, sessionId: string, dir: string, canonical: string, entries: readonly DirEntry[]): Promise<string>;
/** 选择器过滤：`exts` = 只要这些扩展名（小写无点）；`dirs` = 只要文件夹；都不传 = 不限。 */
export interface PickFilter {
    exts?: readonly string[];
    dirs?: boolean;
}
export declare function matchesFilter(path: string, isDir: boolean, filter: PickFilter | undefined): boolean;
/** 面包屑段：把目录路径拆成可点层级（绝对路径保留前导 /）。 */
export declare function crumbsOfDir(dir: string): {
    label: string;
    path: string;
}[];
/** 文件/目录的显示名（末段）。 */
export declare function baseNameOfPath(p: string): string;
/** 父目录（无父 = 空串）。 */
export declare function dirnameOf(p: string): string;
/** 路径拼接（处理根与绝对/相对；沿用 utils/path 的 joinPath 语义）。 */
export { joinPath } from '../utils/path.js';
/** mimeOf 再导出（预览体要用，避免各自 import utils）。 */
export { extOf, mimeOf };
//# sourceMappingURL=types.d.ts.map