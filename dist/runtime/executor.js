/**
 * 后台执行器注册表 —— 开放基础能力，不认识「任务」语义。
 *
 * 核心只提供「按 kind 找执行体并驱动」这一层：kind 是任意字符串，核心不枚举、
 * 不校验名字、不为某一种执行方式写死分支。宿主 agent、插件 host 脚本、shell
 * 都只是注册进来的一种 handler —— 谁要执行，谁注册。
 *
 * 与 task-notifications 池同一形态：同标签页所有插件副本共用一个注册表
 * （Symbol.for 收口），所以 A 插件注册的 handler，B 插件发起的同名任务也能调到。
 * 零 React、零宿主模块、零 DOM，可在 node 裸跑。
 */
/** 与池一致的多副本收口键；版本号变化时所有副本一起换，不会读到半新半旧（现为 v2）。 */
const REGISTRY_KEY = Symbol.for('dsh-plugin-core/executors/v2');
function createRegistry() {
    const handlers = new Map();
    /** 每次注册一个唯一 token：dispose 只认自己那一次，同名重注册后旧 dispose 绝不误删。 */
    const tokens = new Map();
    return {
        register(kind, handler) {
            if (typeof kind !== 'string' || kind.trim() === '') {
                throw new Error('executor kind must be a non-empty string');
            }
            if (typeof handler !== 'function') {
                throw new Error('executor handler must be a function');
            }
            if (handlers.has(kind)) {
                throw new Error(`executor kind already registered: ${kind}`);
            }
            const token = Symbol(kind);
            handlers.set(kind, handler);
            tokens.set(kind, token);
            let disposed = false;
            return () => {
                if (disposed)
                    return;
                disposed = true;
                if (tokens.get(kind) === token) {
                    handlers.delete(kind);
                    tokens.delete(kind);
                }
            };
        },
        get(kind) {
            return handlers.get(kind);
        },
        list() {
            return [...handlers.keys()];
        },
        unregister(kind) {
            tokens.delete(kind);
            return handlers.delete(kind);
        },
        clear() {
            handlers.clear();
            tokens.clear();
        },
    };
}
/** 全局注册表（同标签页所有插件副本共用）。 */
export const executors = (() => {
    const holder = globalThis;
    const existing = holder[REGISTRY_KEY];
    if (existing !== undefined)
        return existing;
    const created = createRegistry();
    holder[REGISTRY_KEY] = created;
    return created;
})();
/** 新建一个私有注册表（测试隔离 / 单个插件用自己的命名空间时用）。 */
export function createExecutorRegistry() {
    return createRegistry();
}
//# sourceMappingURL=executor.js.map