/**
 * 后台任务编排中枢：把「登记 → 执行 → 进度 → 终态 → 通知」串成一条线。
 *
 * 纯逻辑，零 React / 零宿主 / 零 DOM —— 宿主能力（layout 面板、toast、通知、执行器）都以
 * 小接口注入，node 自检可用内存 fake。真实接线由 `api.ts` / host 侧完成。
 *
 * 没有 pull 心跳、没有状态源、没有双时钟租约、没有 tombstone 判死：终态由执行器结果
 * 或服务端投影直接驱动一次，进度由执行器 report 上报，本地只做投影与分发。
 */
import { executors } from '../../runtime/executor.js';
import { notifyForState, toastForState, } from './model.js';
import { taskStore } from './store.js';
let seq = 0;
function nextId() {
    seq += 1;
    return `task:${Date.now().toString(36)}:${seq.toString(36)}`;
}
function safeCall(label, fn) {
    try {
        fn();
    }
    catch (error) {
        console.error(`dsh-plugin-core: task ${label} failed`, error);
    }
}
export function createCoordinator(options = {}) {
    const store = options.store ?? taskStore;
    const host = options.host ?? {};
    const registry = options.registry ?? executors;
    /**
     * 终态对外分发：toast + notify + onSettled，各一次；单项失败不影响其它项。
     *
     * 不在这里补 settledAt：本地执行是真的执行者、时间由 run() 注入（本地是那份终态的真源）；
     * 服务端 notice 的时间由服务端给、经 isTaskRecord 校验必带。若在此无条件 Date.now()，
     * 本地假时会盖住服务端真源、且重放签名漂移。store.carryIdentity 只做 first-wins 合并。
     */
    function announce(task, state, reason) {
        const final = {
            ...task,
            state,
            ...(reason === undefined ? {} : { reason }),
        };
        // 单页内去重：同一 notice 被 outbox 重复推、或本地执行与服务端投影撞车时只弹一次。
        // 跨刷新的一次性由客户端持久 notice id 保证（见 api.ts）。
        if (!store.claimSettled(final))
            return;
        // 以 upsert 返回的「归一 id + 身份兜底」记录为对外载荷：store 在 (project,key) 命中时
        // 会把 id 归一到存活行、并保住本地发起记录的 origin/panelId/settledAt。
        // 不能直接用入参 task——同 key 不同服务端 id 时它没有本地身份，整块写会抹掉已投影的字段。
        const stored = store.upsert(final).task;
        const toast = toastForState(stored.toast, state);
        if (toast !== undefined) {
            safeCall('toast', () => host.deliverToast?.({
                title: toast.title,
                ...(toast.button === undefined ? {} : { buttonId: toast.button.id, buttonText: toast.button.text }),
                scope: toast.scope ?? 'origin',
                task: stored,
            }));
        }
        const notice = notifyForState(stored.notify, state);
        if (notice !== undefined) {
            safeCall('notify', () => host.deliverNotify?.({
                project: stored.project,
                group: stored.group,
                message: notice.message,
                ...(notice.detail === undefined ? {} : { detail: notice.detail }),
                level: state === 'done' ? 'success' : 'error',
                scope: notice.scope ?? 'origin',
                ...(notice.broadcast === undefined ? {} : { broadcast: notice.broadcast }),
                task: stored,
            }));
        }
        store.emitSettled({ outcome: state, task: stored });
    }
    /** 本地执行一条任务。本地执行器是终态的真源，结算时刻在这里生成一次。 */
    function run(task) {
        if (task.kind === undefined)
            return;
        const handler = registry.get(task.kind);
        // 本地终态的唯一补时点：run 真的跑了执行器，本地时钟就是这份终态的真源。
        const settle = (final, outcome, reason) => {
            announce({ ...final, settledAt: final.settledAt ?? Date.now() }, outcome, reason);
        };
        if (handler === undefined) {
            settle(task, 'failed', `executor not registered: ${task.kind}`);
            return;
        }
        const ctx = {
            report(progress) {
                const current = store.get(task.id);
                if (current === undefined || current.state === 'done' || current.state === 'failed')
                    return;
                store.upsert({ ...current, progress: { ...progress, updatedAt: Date.now() } });
            },
        };
        Promise.resolve()
            // args 输入侧放宽成 object（消费方的 interface 可直接传）；到执行器边界收敛回索引签名。
            .then(() => handler((task.args ?? {}), ctx))
            .then((result) => settle(store.get(task.id) ?? task, result.outcome, result.reason))
            .catch((error) => settle(store.get(task.id) ?? task, 'failed', String(error)));
    }
    return {
        start(input) {
            const panelId = host.activePanelId?.();
            const origin = host.originId?.();
            const record = {
                id: nextId(),
                ...(input.key === undefined ? {} : { key: input.key }),
                project: input.project ?? 'default',
                group: input.group ?? 'default',
                title: input.title,
                state: 'running',
                startedAt: Date.now(),
                ...(panelId === undefined ? {} : { panelId }),
                ...(origin === undefined ? {} : { origin }),
                ...(input.kind === undefined ? {} : { kind: input.kind }),
                ...(input.args === undefined ? {} : { args: input.args }),
                ...(input.detail === undefined ? {} : { detail: input.detail }),
                ...(input.icon === undefined ? {} : { icon: input.icon }),
                ...(input.toast === undefined ? {} : { toast: input.toast }),
                ...(input.notify === undefined ? {} : { notify: input.notify }),
                ...(input.rowButtons === undefined ? {} : { rowButtons: input.rowButtons }),
            };
            const { task } = store.upsert(record);
            run(task);
            return task;
        },
        project(records) {
            // 状态投影只恢复列表 / 进度 / 终态快照，**绝不弹卡**：状态会被基线、重连、重推反复重放，
            // 弹卡一旦挂在这里，刷新就重弹（用户 2026-11-19 的根因）。通知只走 deliverNotice。
            store.merge(records);
        },
        deliverNotice(notice) {
            const task = notice.task;
            if (task.state !== 'done' && task.state !== 'failed')
                return;
            const outcome = task.state; // 上面已收窄
            // 先把终态投影进列表（可能早于 notice 到达的 task 帧已投影过，这里幂等）。
            // 不补 settledAt：服务端是这份终态的真源，时间由它给、经 isTaskRecord 校验必带；
            // 归一 id 与身份兜底由 announce 内的 upsert 负责，且不依赖 merge 的 changed 返回值。
            store.merge([task]);
            announce(task, outcome, task.reason);
        },
        press(buttonId, taskId) {
            const task = store.get(taskId);
            if (task === undefined)
                return false;
            const handler = store.getHandler(buttonId, task.project);
            // 没 handler 就是死按钮：不切面板（避免无意义跳走），直接告知失败。
            if (handler === undefined)
                return false;
            if (task.panelId !== undefined) {
                const pid = task.panelId;
                safeCall('selectPanel', () => host.selectPanel?.(pid));
            }
            // 找到并调用了 handler 就返回 true；handler 自己内部抛错是它的责任，我们只记录、
            // 不让异常冒泡打断核心的点击事件（职责分清：我们是联络点，不替被调方修 bug）。
            safeCall('button handler', () => handler(task));
            return true;
        },
        registerHandlers: (map, project) => store.registerHandlers(map, project),
        onSettled: (listener) => store.onSettled(listener),
    };
}
//# sourceMappingURL=coordinator.js.map