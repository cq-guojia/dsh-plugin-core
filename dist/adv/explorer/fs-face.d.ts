/**
 * client 侧的**只读文件面**：fetch 宿主 `serveFsRoute` 挂的那条路由（`src/host/fs-route.ts`）。
 *
 * 返回体沿用官方 remote 的信封（成功是值本身，失败是 `{ ok:false, error }`），所以
 * `listingOf` / `textPageOf` / `bytesOf`（`./types.js`）原样能解析，不用再写一套。
 *
 * 与 `WorkspaceFilesFace` 的差别只有一个：**不吃 sessionId，路径一律绝对**。
 * 这也是「入口不传会话」成立的原因 —— 浏览完全不需要会话；只有 Office 预览还要。
 */
export interface FsFace {
    /** 列一层目录（绝对路径）。 */
    list(path: string, signal?: AbortSignal): Promise<unknown>;
    /** 文本分页读；`range` 为字节偏移。 */
    read(path: string, range: {
        offset?: number;
        limit?: number;
    }, signal?: AbortSignal): Promise<unknown>;
    /** 二进制读（`bytesOf` 直接吃）。 */
    readBytes(path: string, options: {
        range?: {
            offset?: number;
            length?: number;
        };
    }, signal?: AbortSignal): Promise<unknown>;
    /** 根节点清单：POSIX 只有 `/`，Windows 是盘符。 */
    roots?(): Promise<string[]>;
}
/** 造一个走 HTTP 的文件面。`basePath` 必须与宿主 `serveFsRoute({ path })` 同一个常量。 */
export declare function createHttpFsFace(basePath: string): FsFace;
/** 接上宿主 `serveFsRoute` 挂的那条路由（插件 client `apply` 里调一次）。 */
export declare function connectFs(options: {
    path: string;
}): void;
/** 当前已接上的文件面；没接（宿主没这能力 / 没调 connectFs）⇒ undefined。 */
export declare function getFsFace(): FsFace | undefined;
//# sourceMappingURL=fs-face.d.ts.map