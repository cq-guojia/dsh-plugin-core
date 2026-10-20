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
/** 模型目录的 observable store（useSyncExternalStore 直接消费）。 */
class ModelCatalogStore {
    constructor() {
        this.snapshot = { status: 'loading' };
        this.listeners = new Set();
        this.getSnapshot = () => this.snapshot;
        this.subscribe = (listener) => {
            this.listeners.add(listener);
            return () => {
                this.listeners.delete(listener);
            };
        };
    }
    update(next) {
        this.snapshot = next;
        for (const listener of this.listeners)
            listener();
    }
    setRoutes(routes) {
        this.update({ status: 'ready', routes });
    }
    setUnavailable(reason) {
        this.update({ status: 'unavailable', reason });
    }
}
/** 模型目录单例（ModelPicker 消费；connectHost 负责喂）。 */
export const modelCatalog = new ModelCatalogStore();
/**
 * 工作区列表的 observable store：直接镜像官方 WorkspaceSource 的 `items`
 * （宿主权威快照，follow 流实时推 —— 源变我们就变，不自持第二份状态机）。
 */
class WorkspaceListStore {
    constructor() {
        this.items = [];
        this.listeners = new Set();
        this.getSnapshot = () => this.items;
        this.subscribe = (listener) => {
            this.listeners.add(listener);
            return () => {
                this.listeners.delete(listener);
            };
        };
    }
    /** 换源（仅 connectHost 调；重复调用换到新源）。 */
    setSource(source) {
        this.unsubscribe?.();
        const pull = () => {
            this.items = source.getSnapshot().items;
            for (const listener of this.listeners)
                listener();
        };
        pull();
        this.unsubscribe = source.subscribe(pull);
    }
}
/** 工作区列表单例（WorkspacePicker 消费；connectHost 负责喂）。 */
export const workspaceList = new WorkspaceListStore();
function isWorkspaceSource(value) {
    if (value === null || typeof value !== 'object')
        return false;
    const rec = value;
    return typeof rec.getSnapshot === 'function' && typeof rec.subscribe === 'function';
}
/**
 * 把宿主数据面接进核心（插件 client `apply` 里调**一次**）。
 *
 * 工作区走本地 client 服务注入；模型目录走宿主路由 fetch。哪条失败只影响那一块，
 * 选择器照常渲染空态 / 降级提示 —— 绝不让数据面拖住插件启动。
 */
export function connectHost(ctx, options = {}) {
    ctx.inject(['workspaces'], (sub) => {
        const source = sub?.workspaces?.list;
        if (isWorkspaceSource(source))
            workspaceList.setSource(source);
    });
    const modelsPath = options.modelsPath;
    if (modelsPath === undefined)
        return;
    void fetch(modelsPath)
        .then((response) => (response.ok ? response.json() : Promise.reject(new Error(`HTTP ${response.status}`))))
        .then((data) => {
        const routes = data?.routes;
        if (!Array.isArray(routes))
            throw new Error('模型目录响应缺少 routes');
        modelCatalog.setRoutes(routes);
    })
        .catch((error) => {
        modelCatalog.setUnavailable(String(error));
    });
}
//# sourceMappingURL=host-data.js.map