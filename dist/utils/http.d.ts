/**
 * HTTP 骨架：超时 + 错误归一。
 *
 * 只做「取数」这件事的最小公共面 —— 插件自己的接口前缀 / 鉴权头自己传，
 * 这里不猜、也不碰宿主 API（utils 不得依赖 DOM / React / 宿主，见需求文档 §2.3）。
 */
export declare class HttpError extends Error {
    /** HTTP 状态码；`0` = 没拿到响应（网络失败 / 超时）。 */
    readonly status: number;
    readonly url: string;
    readonly body: string | undefined;
    constructor(url: string, status: number, message: string, body?: string);
}
export interface RequestOptions extends Omit<RequestInit, 'signal'> {
    /** 超时毫秒，缺省 10s。 */
    timeoutMs?: number;
}
/**
 * 发请求；非 2xx / 网络失败 / 超时一律抛 `HttpError`（不返回 null，避免调用方漏判）。
 */
export declare function request(url: string, options?: RequestOptions): Promise<Response>;
/** 发请求并按 JSON 解析；响应不是合法 JSON 也归成 `HttpError`。 */
export declare function requestJson<T>(url: string, options?: RequestOptions): Promise<T>;
//# sourceMappingURL=http.d.ts.map