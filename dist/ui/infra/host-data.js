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
/** 稳定的空归档集合：官方快照缺席时用它，保证 getArchiveSnapshot 引用稳定。 */
const NO_ARCHIVED_SESSIONS = [];
/**
 * 工作区列表的 observable store：直接镜像官方 WorkspaceSource 的 `items` 与
 * `archivedSessionIds`（宿主权威快照，follow 流实时推 —— 源变我们就变，不自持第二份状态机）。
 * `getSnapshot` 保持原有的 items 形态（explorer 各调用方按数组消费），归档集合另给两种读法。
 */
class WorkspaceListStore {
    constructor() {
        this.items = [];
        this.archivedSessionIds = NO_ARCHIVED_SESSIONS;
        this.listeners = new Set();
        this.getSnapshot = () => this.items;
        /** 归档集合的稳定引用（直接喂 useSyncExternalStore，不需要额外 selector 缓存）。 */
        this.getArchiveSnapshot = () => this.archivedSessionIds;
        this.isSessionArchived = (sessionId) => this.archivedSessionIds.includes(sessionId);
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
            const snap = source.getSnapshot();
            this.items = snap.items;
            this.archivedSessionIds = snap.archivedSessionIds ?? NO_ARCHIVED_SESSIONS;
            for (const listener of this.listeners)
                listener();
        };
        pull();
        this.unsubscribe = source.subscribe(pull);
    }
}
/** 工作区列表单例（WorkspacePicker / 会话预览消费；connectHost 负责喂）。 */
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
/** 最近一次接线的模型目录路径（`refreshModelCatalog()` 不带参时用它）。 */
let boundModelsPath;
/** 进行中的目录请求：并发刷新合并成一次，避免连点发一串相同请求。 */
let catalogInFlight;
function loadModelCatalog(path) {
    if (catalogInFlight !== undefined)
        return catalogInFlight;
    const job = fetch(path, { cache: 'no-store' })
        .then((response) => (response.ok ? response.json() : Promise.reject(new Error(`HTTP ${response.status}`))))
        .then((data) => {
        const routes = data?.routes;
        if (!Array.isArray(routes))
            throw new Error('模型目录响应缺少 routes');
        modelCatalog.setRoutes(routes);
    })
        .catch((error) => {
        modelCatalog.setUnavailable(String(error));
    })
        .finally(() => {
        catalogInFlight = undefined;
    });
    catalogInFlight = job;
    return job;
}
/**
 * 重拉模型目录（供应商 / 模型有增减、或上一次取失败要重试时调）。
 *
 * 宿主路由每次请求现查，这里显式 `cache: 'no-store'`，避免浏览器把上次的目录缓存回来。
 * 不传 path 就用 `connectHost(ctx, { modelsPath })` 记下的那个；还没接线则 reject。
 * 返回 Promise：await 之后 `modelCatalog.getSnapshot()` 即本次结果。
 */
export async function refreshModelCatalog(path) {
    const target = path ?? boundModelsPath;
    if (target === undefined) {
        throw new Error('模型目录未接线：先调 connectHost(ctx, { modelsPath })');
    }
    await loadModelCatalog(target);
    return modelCatalog.getSnapshot();
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
    boundModelsPath = modelsPath;
    void loadModelCatalog(modelsPath);
}
//# sourceMappingURL=host-data.js.map