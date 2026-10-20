/**
 * 领域选择器的宿主数据面 —— ModelPicker / WorkspacePicker 的「现成数据」。
 *
 * 用户 2026-10-20 拍板：这两个领域选择器**自己取数、自己显示**，消费方不再传数组
 * （反转 requirements §6 对领域选择器的旧口径；通用 `Picker` 仍是 props 进数据的纯零件）。
 *
 * 两条数据通路（均为真机验证过的口子）：
 * - 工作区：宿主 client 服务 `workspaces` 的快照（getSnapshot + subscribe，follow 流实时更新）。
 * - 模型目录：**插件宿主侧** `llm.listModels()` 现查 → `serveModelCatalog()` 挂成只读路由 →
 *   客户端 fetch（`@deepseek-ai/*` 的 `remote.llm` 只有 listProviders，**拿不到每个供应商的
 *   模型列表**，2026-10-20 真机定位后弃用该路径）。
 *
 * 接线：宿主 `apply` 调 `serveModelCatalog(ctx, { path })`，客户端 `apply` 调
 * `connectHost(ctx, { modelsPath: path })`——同一个 path 常量，消费方不碰数据本身。
 */
/** 一条路由：一个供应商 + 它的模型（与宿主侧 `ModelRouteData` 同形）。 */
export interface ModelRoute {
    provider: string;
    displayName: string;
    models: readonly {
        id: string;
        name?: string;
    }[];
}
export type ModelCatalogState = {
    status: 'loading';
} | {
    status: 'unavailable';
    reason: string;
} | {
    status: 'ready';
    routes: readonly ModelRoute[];
};
/** 模型目录的 observable store（useSyncExternalStore 直接消费）。 */
declare class ModelCatalogStore {
    private snapshot;
    private readonly listeners;
    readonly getSnapshot: () => ModelCatalogState;
    readonly subscribe: (listener: () => void) => (() => void);
    private update;
    setRoutes(routes: readonly ModelRoute[]): void;
    setUnavailable(reason: string): void;
}
/** 模型目录单例（ModelPicker 消费；connectHost 负责喂）。 */
export declare const modelCatalog: ModelCatalogStore;
/** 官方 `workspaces` client 服务的 `list`（WorkspaceSource 结构化子集）。 */
export interface HostWorkspaceSource {
    getSnapshot: () => {
        items: readonly {
            workspaceId: string;
            title: string;
        }[];
    };
    subscribe: (listener: () => void) => () => void;
}
/**
 * 工作区列表的 observable store：直接镜像官方 WorkspaceSource 的 `items`
 * （宿主权威快照，follow 流实时推 —— 源变我们就变，不自持第二份状态机）。
 */
declare class WorkspaceListStore {
    private items;
    private readonly listeners;
    private unsubscribe;
    /** 换源（仅 connectHost 调；重复调用换到新源）。 */
    setSource(source: HostWorkspaceSource): void;
    readonly getSnapshot: () => readonly {
        workspaceId: string;
        title: string;
    }[];
    readonly subscribe: (listener: () => void) => (() => void);
}
/** 工作区列表单例（WorkspacePicker 消费；connectHost 负责喂）。 */
export declare const workspaceList: WorkspaceListStore;
/** 插件 client 的最小 ctx 形状（cordis client context 的结构化子集）。 */
export interface HostClientContext {
    inject: (deps: string[], cb: (sub: unknown) => void) => void;
}
export interface ConnectHostOptions {
    /** 模型目录路由（宿主侧 `serveModelCatalog` 注册的同一个 path）；不传 = 不取模型目录。 */
    modelsPath?: string;
}
/**
 * 把宿主数据面接进核心（插件 client `apply` 里调**一次**）。
 *
 * 工作区走本地 client 服务注入；模型目录走宿主路由 fetch。哪条失败只影响那一块，
 * 选择器照常渲染空态 / 降级提示 —— 绝不让数据面拖住插件启动。
 */
export declare function connectHost(ctx: HostClientContext, options?: ConnectHostOptions): void;
export {};
//# sourceMappingURL=host-data.d.ts.map