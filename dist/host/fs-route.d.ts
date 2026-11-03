import type { HostContextLike } from './index.js';
/** 单层目录最多回多少条（用户 2026-11-03 定：官方 2000 太粗，取四分之一）。 */
export declare const FS_PAGE_LIMIT = 500;
export interface FsRouteEntry {
    name: string;
    type: 'file' | 'directory' | 'other';
    size?: number;
}
export interface FsRouteListing {
    path: string;
    entries: FsRouteEntry[];
    truncated: boolean;
}
/** 归一绝对路径（Windows 反斜杠 → `/`，盘符大写），拒绝相对路径 —— 路由永不按 cwd 解析。 */
export declare function normalizeAbsPath(raw: string): string | null;
/**
 * 注册只读文件路由（插件宿主 `apply` 里调一次）。
 *
 * @param ctx 插件宿主 ctx（`webServer` 缺失 ⇒ 不注册，能力自然缺席）
 * @param options.path 路由前缀，客户端要用**同一个常量**去 fetch（如 `/api/x/fs`）
 */
export declare function serveFsRoute(ctx: HostContextLike, options: {
    path: string;
}): void;
//# sourceMappingURL=fs-route.d.ts.map