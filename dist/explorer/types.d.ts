export interface WorkspaceFilesFace {
    /** 文本分页读。⚠️ `range` **必传**（官方按位置参数个数校验，省了会被远端拒）。 */
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
/** 预览类型（决定用哪个预览体）。 */
export type PreviewKind = 'text' | 'image' | 'unsupported';
/** 按扩展名猜预览类型；猜不出就 `unsupported`（不硬撑，交给调用方决定兜底）。 */
export declare function previewKindOf(path: string): PreviewKind;
//# sourceMappingURL=types.d.ts.map