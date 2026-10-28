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
// ── 工作区文件服务 ──────────────────────────────────────────────────────
/**
 * 宿主 `remote.workspaceFiles`（explorer 的读文件通道）单例，由 `connectHost` 喂。
 *
 * 为什么核心要自己存一份：消费方写 `openFilePreview({ mount, path })` 就够了 —— 服务对象
 * 只能从插件的 ctx 里 inject 出来（库拿不到 ctx），所以它必须由**一次接线**交进来，
 * 而不是每次调用各传一遍（用户 2026-10-28 拍板：绑定能力归核心，调用方只管要什么）。
 */
let workspaceFiles;
/** 当前接到的文件服务；宿主没这能力 / 没调 connectHost ⇒ undefined。 */
export function getWorkspaceFiles() {
    return workspaceFiles;
}
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
    // 读文件通道：`explorer` 的预览靠它读字节，绑定归这里，调用方不必再传服务。
    // dotted 注入值优先，退回 `remote` 上的同名属性；探针 `list` 不在 ⇒ 判为没就位。
    ctx.inject(['remote', 'remote.workspaceFiles'], (sub) => {
        const rec = sub;
        const candidate = rec?.['remote.workspaceFiles'] ?? rec?.remote?.workspaceFiles;
        if (typeof candidate?.list === 'function') {
            workspaceFiles = candidate;
        }
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