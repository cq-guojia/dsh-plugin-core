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
    /** 终态对外分发：toast + notify + onSettled，各一次；单项失败不影响其它项。 */
    function announce(task, state, reason) {
        const final = {
            ...task,
            state,
            ...(reason === undefined ? {} : { reason }),
            settledAt: task.settledAt ?? Date.now(),
        };
        // 单页内去重：同一 notice 被 outbox 重复推、或本地执行与服务端投影撞车时只弹一次。
        // 跨刷新的一次性由客户端持久 notice id 保证（见 api.ts）。
        if (!store.claimSettled(final))
            return;
        store.upsert(final);
        const toast = toastForState(final.toast, state);
        if (toast !== undefined) {
            safeCall('toast', () => host.deliverToast?.({
                title: toast.title,
                ...(toast.button === undefined ? {} : { buttonId: toast.button.id, buttonText: toast.button.text }),
                scope: toast.scope ?? 'origin',
                task: final,
            }));
        }
        const notice = notifyForState(final.notify, state);
        if (notice !== undefined) {
            safeCall('notify', () => host.deliverNotify?.({
                project: final.project,
                group: final.group,
                message: notice.message,
                ...(notice.detail === undefined ? {} : { detail: notice.detail }),
                level: state === 'done' ? 'success' : 'error',
                scope: notice.scope ?? 'origin',
                ...(notice.broadcast === undefined ? {} : { broadcast: notice.broadcast }),
                task: final,
            }));
        }
        store.emitSettled({ outcome: state, task: final });
    }
    /** 本地执行一条任务。 */
    function run(task) {
        if (task.kind === undefined)
            return;
        const handler = registry.get(task.kind);
        if (handler === undefined) {
            announce(task, 'failed', `executor not registered: ${task.kind}`);
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
            .then(() => handler(task.args ?? {}, ctx))
            .then((result) => announce(store.get(task.id) ?? task, result.outcome, result.reason))
            .catch((error) => announce(store.get(task.id) ?? task, 'failed', String(error)));
    }
    return {
        start(input) {
            const panelId = host.activePanelId?.();
            const record = {
                id: nextId(),
                ...(input.key === undefined ? {} : { key: input.key }),
                project: input.project ?? 'default',
                group: input.group ?? 'default',
                title: input.title,
                state: 'running',
                startedAt: Date.now(),
                ...(panelId === undefined ? {} : { panelId }),
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
            // 服务端推送的终态先投影进列表（同 id 覆盖乐观记录）；弹卡由 claimSettled 单页内去重。
            const final = {
                ...task,
                ...(task.settledAt === undefined ? { settledAt: Date.now() } : {}),
            };
            announce(final, outcome, final.reason);
        },
        press(buttonId, taskId) {
            const task = store.get(taskId);
            if (task === undefined)
                return false;
            const handler = store.getHandler(buttonId);
            // 没 handler 就是死按钮：不切面板（避免无意义跳走），直接告知失败。
            if (handler === undefined)
                return false;
            if (task.panelId !== undefined)
                host.selectPanel?.(task.panelId);
            handler(task);
            return true;
        },
        registerHandlers: (map) => store.registerHandlers(map),
        onSettled: (listener) => store.onSettled(listener),
    };
}
//# sourceMappingURL=coordinator.js.map