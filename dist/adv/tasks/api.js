/**
 * 新任务体系的公开接线 API。
 *
 * 消费方写两处接线：mountTaskUI（注册 handlers + 终态）/ startTask（发起）；展示用 TaskBar。
 * 这里把 coordinator 与宿主能力（面板、toast、通知、SSE 投影）接到一起，对外只暴露这三件事。
 *
 * design：handler 在页面内存里（函数过不了进程边界），mountTaskUI 显式传 handlers，
 * handlers 与 Toast / TaskBar 共用同一份。状态真源在服务端，经 SSE 推 TaskRecord 进来由 coordinator 投影。
 */
import { notify as notifyCard } from '../../ui/feedback/notify.js';
import { t } from '../../utils/i18n.js';
import { defaultNotifyScope, notifyMessage, resolveProject, subscribeNotifications as subscribeNotifyBus, } from '../../runtime/notify.js';
import { createCoordinator } from './coordinator.js';
import { connectTaskStream } from './stream.js';
import { taskStore } from './store.js';
/**
 * 已处理通知 id 的去重（跨刷新不重弹的根）。
 *
 * 用 sessionStorage 而非 localStorage：刷新保留（outbox 重放的历史不重弹），但每个标签页
 * 独立、关页即清——`scope:'all'` 要求每个页面各弹一次，同源共享的 localStorage 会让先到的
 * 页面写 id、后到的页面读到后吞卡。node / 无存储环境退化为模块内存 Set（测试用）。
 * 有界：只留最近 512 个 id。
 */
const SEEN_NOTICE_KEY = 'dshpc:task-notices:seen';
const SEEN_NOTICE_LIMIT = 512;
const seenFallback = new Set();
function noticeStore() {
    try {
        return typeof sessionStorage === 'undefined' ? undefined : sessionStorage;
    }
    catch {
        return undefined;
    }
}
function loadSeenNotices() {
    const store = noticeStore();
    try {
        if (store === undefined)
            return seenFallback;
        const raw = store.getItem(SEEN_NOTICE_KEY);
        return new Set(raw === null ? [] : JSON.parse(raw));
    }
    catch {
        return seenFallback;
    }
}
function rememberNotice(id) {
    const seen = loadSeenNotices();
    if (seen.has(id))
        return false;
    seen.add(id);
    const trimmed = [...seen].slice(-SEEN_NOTICE_LIMIT);
    const store = noticeStore();
    try {
        if (store !== undefined)
            store.setItem(SEEN_NOTICE_KEY, JSON.stringify(trimmed));
        else {
            seenFallback.clear();
            for (const value of trimmed)
                seenFallback.add(value);
        }
    }
    catch {
        seenFallback.clear();
        for (const value of trimmed)
            seenFallback.add(value);
    }
    return true;
}
/**
 * onSettled 的过滤口径，与 store.select()（`store.ts`）逐字一致：
 * project 为 undefined/null = 跨项目收全部；groups 省略 = 不过滤。
 * 只作用于消费方回调，不影响核心列表刷新与 toast/notify 弹卡（scope:'all' 仍每页弹）。
 */
function matchesMount(task, project, groups) {
    if (project !== undefined && project !== null && task.project !== project)
        return false;
    if (groups !== undefined && !groups.includes(task.group))
        return false;
    return true;
}
/**
 * 宿主对象是稳定的一份：coordinator 持有它的引用，重复接线只改字段，不重建 coordinator。
 * 重建会连同「终态去重上下文 / 已注册 handlers」一起换掉，是重复弹卡的来源之一。
 */
const stableHost = {};
const coordinator = createCoordinator({ host: stableHost });
let streamConn;
/**
 * 任务帧形状校验（服务端帧与 projectTasks 入口共用的一道闸）：畸形帧不能进 store 污染列表。
 *
 * settledAt 按状态分支校验——终态(done/failed)必须有有限数结算时刻，否则拒收：
 * 展示层靠它算终态行的停留/退场（TaskBar settledAtOf），缺了就永不退场 + 假计时；
 * store 的单调防复活用「状态是否终态」（isSettled(state)）判据，不是有无 settledAt——
 * settledAt 是时钟，可能因重放/擦除而不在，拿它当状态标志会让 guard 静默失效。
 * running 帧不得带 settledAt（状态与时钟分离）。
 * 校验放在唯一入口，store 只负责合并，不再任何地方本地造时间冒充服务端真源。
 */
export function isTaskRecord(value) {
    if (value === null || typeof value !== 'object')
        return false;
    const v = value;
    const settledAtOk = typeof v.settledAt === 'number' && Number.isFinite(v.settledAt);
    return (typeof v.id === 'string' &&
        typeof v.project === 'string' &&
        typeof v.group === 'string' &&
        typeof v.title === 'string' &&
        (v.state === 'running' || v.state === 'done' || v.state === 'failed') &&
        typeof v.startedAt === 'number' && Number.isFinite(v.startedAt) &&
        (v.state === 'running'
            ? v.settledAt === undefined
            : settledAtOk));
}
/** 状态投影（基线 / 增量）：只恢复列表，**不弹卡**。 */
function ingestTask(raw) {
    if (!isTaskRecord(raw))
        return;
    coordinator.project([raw]);
}
function isTaskNotice(value) {
    if (value === null || typeof value !== 'object')
        return false;
    const v = value;
    return typeof v.id === 'string' && v.id !== '' && isTaskRecord(v.task);
}
/** 一次性完成通知：持久去重后交给 coordinator 弹卡；同一 id 跨刷新只弹一次。 */
function ingestNotice(raw) {
    if (!isTaskNotice(raw))
        return;
    if (!rememberNotice(raw.id))
        return;
    coordinator.deliverNotice(raw);
}
/**
 * 按钮点了没生效时的统一提示：任务条目已失效 / 注册 handler 的插件已卸载（找不到方法）。
 * Toast 按钮与 TaskBar 行按钮共用这一句，文案只走 t() 保持多语言一致。
 */
export function notifyTaskActionFailed() {
    notifyCard(t('taskbarActionFailed'));
}
/**
 * 默认宿主适配：toast/notify 接到核心已有的提示层。
 *
 * toast/notify 的 `scope:'origin'` 用「发起标签页」判定（不是面板）：SSE 把同一条终态推给
 * 每个标签页，但只在发起它的那个标签页弹。`origin` 是页面级身份，随任务记录走；
 * `panelId` 只管点按钮时切回面板，不参与弹卡归属。
 * 任一侧缺 origin（服务端没透传 / 宿主没注入）时 fail-open 按「弹」处理——宁可多弹，绝不漏结果。
 * notify 只把通知发到总线上、不做任何 UI；范围由订阅侧 scope/project 决定。
 */
export function defaultTaskHost(originId) {
    const isOrigin = (task) => {
        const current = originId?.();
        return current === undefined || task.origin === undefined || task.origin === current;
    };
    return {
        deliverToast(payload) {
            if (payload.scope === 'origin' && !isOrigin(payload.task))
                return;
            const opts = { variant: payload.task.state === 'failed' ? 'error' : 'success' };
            // 所有按钮在所有页都画、不隐藏不置灰：点了先 pressTaskButton → selectPanel(panelId) 跳回发起面板
            // 再执行 handler（用户 11-20 反复拍板，覆盖 11-18 定稿里「Toast 按钮只在发起页」的旧口径）。
            // 缺 handler（条目失效 / 发起插件卸载）时给一次统一提示，与 TaskBar 行按钮同口径。
            if (payload.buttonId !== undefined) {
                opts.actions = [{
                        text: payload.buttonText ?? payload.buttonId,
                        onClick: () => {
                            if (!pressTaskButton(payload.buttonId, payload.task.id))
                                notifyTaskActionFailed();
                        },
                    }];
            }
            notifyCard(payload.title, opts);
        },
        deliverNotify(payload) {
            if (payload.scope === 'origin' && !isOrigin(payload.task))
                return;
            // notify 只把通知发出去，核心不做任何 UI：弹不弹卡、弹 alert 都由订阅方自己决定。
            // （只有 toast 是明确要求弹卡的——见 deliverToast。）
            notifyMessage(payload.message, {
                project: payload.project,
                group: payload.group,
                level: payload.level,
                ...(payload.detail === undefined ? {} : { detail: payload.detail }),
            });
        },
    };
}
/** 接线宿主能力。client apply 调一次；重复调用覆盖字段并重连 SSE，但不换 coordinator。 */
export function connectTaskCenter(host) {
    // 只覆盖显式提供的字段：传 undefined 不该抹掉上一次接线得到的 streamUrl/submitUrl 等。
    const patch = {};
    for (const [key, value] of Object.entries(host)) {
        if (value !== undefined)
            patch[key] = value;
    }
    Object.assign(stableHost, patch);
    // 页面级身份：优先用消费方注入的 originId，缺省才取通知总线的标签页 origin。
    // startTask 记 origin、toast/notify 判归属必须同一个来源，否则注入自定义 originId 时判定错位。
    const pageOrigin = () => defaultNotifyScope().origin;
    if (stableHost.originId === undefined)
        stableHost.originId = pageOrigin;
    // toast / notify 两个默认层各自独立补齐：只配了其中一个，另一个仍要有默认，不能永久静默。
    // 传动态读取函数而非闭包捕获当前值：重复接线注入不同 originId 时，默认层始终跟随
    // stableHost.originId 的最新来源，避免 startTask 记的 origin 与 toast 判归属的 origin 双来源。
    const liveOrigin = () => stableHost.originId?.();
    const defaults = defaultTaskHost(liveOrigin);
    if (stableHost.deliverToast === undefined && defaults.deliverToast !== undefined) {
        stableHost.deliverToast = defaults.deliverToast;
    }
    if (stableHost.deliverNotify === undefined && defaults.deliverNotify !== undefined) {
        stableHost.deliverNotify = defaults.deliverNotify;
    }
    // 新接线先关掉上一条流（防双 SSE 双投影），但返回值只关「自己这条」：
    // A 接线、B 接线、A 卸载时不能把 B 的流关掉。
    streamConn?.close();
    streamConn = undefined;
    let ownConn;
    if (stableHost.streamUrl !== undefined) {
        ownConn = connectTaskStream({
            streamUrl: stableHost.streamUrl,
            headers: stableHost.headers,
            onGiveUp: stableHost.onGiveUp,
            onTask: (task) => { ingestTask(task); },
            onNotice: ingestNotice,
        });
        streamConn = ownConn;
    }
    return () => {
        ownConn?.close();
        if (streamConn === ownConn)
            streamConn = undefined;
    };
}
/**
 * 从宿主 client ctx 接 layout：拿到 activePanelId（发起时记进任务）与 selectPanel（点按钮切回面板）。
 * 闸1（rc.3）核实：layout 服务由 ctx.inject(['layout']) 提供，activePanelId 在 panelInfo 快照里。
 */
export function connectTaskLayout(ctx) {
    let layout;
    ctx.inject?.(['layout'], (sub) => {
        const candidate = sub?.layout ?? sub;
        if (candidate !== null && candidate !== undefined && typeof candidate === 'object')
            layout = candidate;
    });
    connectTaskCenter({
        activePanelId: () => layout?.panelInfo?.getSnapshot().activePanelId ?? undefined,
        selectPanel: (id) => layout?.selectPanel?.(id),
    });
}
/** 发起一次后台任务。await 等登记成功，不等跑完。 */
export async function startTask(input) {
    const origin = stableHost.originId?.();
    const panelId = stableHost.activePanelId?.();
    if (stableHost.submitUrl === undefined)
        return coordinator.start(input);
    // 服务端执行模式：POST 提交，真实记录由服务端经 SSE 推回并投影到本地 store。
    // origin（页面级归属）与 panelId（面板级切 UI）都随 payload 提交，供服务端回填到记录
    // ——两者都由核心自动记，不写进 StartTaskInput 公共契约。缺哪个就不带哪个。
    const extra = {
        ...(origin === undefined ? {} : { origin }),
        ...(panelId === undefined ? {} : { panelId }),
    };
    // 归一键是 (project,key)：乐观行与提交体必须用同一份补过缺省的 project/key，服务端回显后
    // 真源帧才能归一覆盖乐观行。缺省在此算一次、两处复用，避免各自补缺省失配留下幽灵 running 行。
    const project = input.project ?? 'default';
    const group = input.group ?? 'default';
    const key = input.key ?? `submit:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`;
    const optimisticId = `submit:${key}`;
    const optimistic = {
        id: optimisticId,
        key,
        project,
        group,
        title: input.title,
        state: 'running',
        startedAt: Date.now(),
        ...extra,
    };
    // 先落乐观行、再发请求：关闭「服务端已完成且 SSE 终态先到、随后乐观行把它覆回 running」的
    // 时序窗口。真源终态靠同 key 归一覆盖这条 running；本地这份不再在 await 之后二次写入。
    taskStore.upsert(optimistic);
    let res;
    try {
        res = await fetch(stableHost.submitUrl, {
            method: 'POST',
            headers: { 'content-type': 'application/json', ...stableHost.headers?.() },
            body: JSON.stringify({ ...input, project, group, key, ...extra }),
        });
    }
    catch (error) {
        taskStore.removeRunning(optimisticId); // 提交失败回滚：不留幽灵 running 行
        throw error;
    }
    if (!res.ok) {
        taskStore.removeRunning(optimisticId);
        throw new Error(`task submit failed: ${res.status}`);
    }
    return optimistic;
}
/** 本页接线一次：注册 handlers + 订阅终态。返回注销函数。 */
export function mountTaskUI(options) {
    const offHandlers = coordinator.registerHandlers(options.handlers, options.project);
    // 每次 mount 只注册自己这一个监听：不在共享集合里 fan-out，避免挂 N 次就放大 N 倍。
    const offSettled = options.onSettled === undefined
        ? () => { }
        : coordinator.onSettled(({ task, outcome }) => {
            if (!matchesMount(task, options.project, options.groups))
                return;
            options.onSettled?.(task, outcome);
        });
    return () => { offHandlers(); offSettled(); };
}
/** 点列表 / Toast 按钮：先切回发起面板，再执行本页 handler。 */
export function pressTaskButton(buttonId, taskId) {
    return coordinator.press(buttonId, taskId);
}
/**
 * 服务端投影入口（手动推送时用；自动接流由 connectTaskCenter 负责）。
 * 与 SSE 的 ingestTask 共用 isTaskRecord 这道闸——终态缺 settledAt 的帧在此拒收，
 * 否则会绕过校验进 store，导致终态行不消失、显示假计时（settledAt 契约的破口）。
 */
export function projectTasks(records) {
    coordinator.project(records.filter(isTaskRecord));
}
/** 列表控件读取用的 store 快照。 */
export const taskCenterStore = taskStore;
export function subscribeTaskNotifications(options) {
    const project = options.scope === 'plugin' ? resolveProject(options.project) : undefined;
    return subscribeNotifyBus((msg) => {
        if (options.scope === 'plugin' && msg.project !== project)
            return;
        options.handler({
            project: msg.project,
            group: msg.group,
            message: msg.title,
            ...(msg.detail === undefined ? {} : { detail: msg.detail }),
            level: msg.level,
        });
    });
}
//# sourceMappingURL=api.js.map