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
/** 最小形状校验：畸形 SSE 帧不能进 store 污染列表（startedAt 参与排序，缺了会乱）。 */
export function isTaskRecord(value) {
    if (value === null || typeof value !== 'object')
        return false;
    const v = value;
    return (typeof v.id === 'string' &&
        typeof v.project === 'string' &&
        typeof v.group === 'string' &&
        typeof v.title === 'string' &&
        (v.state === 'running' || v.state === 'done' || v.state === 'failed') &&
        typeof v.startedAt === 'number' &&
        // settledAt 只在存在时校验类型：running 帧多数没这个字段，不能改成必填整条丢弃。
        (v.settledAt === undefined || (typeof v.settledAt === 'number' && Number.isFinite(v.settledAt))));
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
            // 按钮照画不隐藏：按用户 11-18 拍板「不屏蔽、不置灰、不提示（指不预警）」。
            // 找不到 handler（条目失效 / 发起插件卸载）时点了给一次统一提示，与 TaskBar 行按钮同口径。
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
    // toast / notify 两个默认层各自独立补齐：只配了其中一个，另一个仍要有默认，不能永久静默。
    const pageOrigin = () => defaultNotifyScope().origin;
    const defaults = defaultTaskHost(pageOrigin);
    if (stableHost.deliverToast === undefined && defaults.deliverToast !== undefined) {
        stableHost.deliverToast = defaults.deliverToast;
    }
    if (stableHost.deliverNotify === undefined && defaults.deliverNotify !== undefined) {
        stableHost.deliverNotify = defaults.deliverNotify;
    }
    // 页面级身份默认取通知总线的标签页 origin：startTask 本地/服务端两种模式都靠它记 TaskRecord.origin。
    if (stableHost.originId === undefined)
        stableHost.originId = pageOrigin;
    // 新接线先关掉上一条流（防双 SSE 双投影），但返回值只关「自己这条」：
    // A 接线、B 接线、A 卸载时不能把 B 的流关掉。
    streamConn?.close();
    streamConn = undefined;
    let ownConn;
    if (stableHost.streamUrl !== undefined) {
        ownConn = connectTaskStream({
            streamUrl: stableHost.streamUrl,
            headers: stableHost.headers,
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
    if (stableHost.submitUrl === undefined)
        return coordinator.start(input);
    // 服务端执行模式：POST 提交，真实记录由服务端经 SSE 推回并投影到本地 store。
    // origin 作为页面级身份随 payload 提交，供服务端回填到记录（不写进 StartTaskInput 公共契约）。
    const res = await fetch(stableHost.submitUrl, {
        method: 'POST',
        headers: { 'content-type': 'application/json', ...stableHost.headers?.() },
        body: JSON.stringify(origin === undefined ? input : { ...input, origin }),
    });
    if (!res.ok)
        throw new Error(`task submit failed: ${res.status}`);
    const ack = (await res.json());
    const optimistic = {
        id: ack.id ?? `submit:${Date.now()}`,
        project: input.project ?? 'default',
        group: input.group ?? 'default',
        title: input.title,
        state: 'running',
        startedAt: Date.now(),
        ...(origin === undefined ? {} : { origin }),
    };
    // 本地先落一条，SSE 到达后按同 id 覆盖；避免提交到推送之间的空窗看不到任务。
    taskStore.upsert(optimistic);
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
/** 服务端 SSE 投影入口（手动推送时用；自动接流由 connectTaskCenter 负责）。 */
export function projectTasks(records) {
    coordinator.project(records);
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