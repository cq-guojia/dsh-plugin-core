import { createElement as h, useCallback, useEffect, useRef, useState, useSyncExternalStore, } from 'react';
import { FloatingPortal, autoUpdate, flip, offset, shift, useFloating } from '@floating-ui/react';
import { Button } from '../../ui/actions/Button.js';
import { Chip } from '../../ui/display/Chip.js';
import { FontIcon, resolveIconName } from '../../ui/display/font-icon.js';
import { FlipText } from '../../ui/display/FlipText.js';
import { MarqueeText } from '../../ui/display/MarqueeText.js';
import { Chevron } from '../../ui/infra/chevron.js';
import { PanelSurface } from '../../ui/infra/panel.js';
import { ensureComponentStyles } from '../../ui/infra/css.js';
import { useDismissOnForegroundOverlay } from '../../ui/infra/overlay.js';
import { useLocale } from '../../ui/infra/locale.js';
import { useNowMs } from '../../ui/infra/ticker.js';
import { t } from '../../utils/i18n.js';
import { formatDurationHms } from '../../utils/date.js';
import { notifyTaskActionFailed, pressTaskButton, taskCenterStore } from './api.js';
import { formatDisplayTitle } from './model.js';
import { TASK_BAR_CSS } from './task-bar-css.js';
import { isSettled } from './store.js';
/** 本栏自己的图标：后台正在跑的任务，用 CPU 字形表示「机器在干活」。 */
const DEFAULT_ICON = 'common.base:cpu';
/**
 * 记录里的 `icon` 是消费端的标识（如 `base:shijian1`），**不保证**是字体图标名。
 * 只有能解析成已注册库的字形才拿来画，否则回落默认图标 —— 否则每行都会是空图标 + 一条告警。
 */
function iconNameOf(task, fallback) {
    const name = task.icon;
    return name === undefined || resolveIconName(name) === undefined ? fallback : name;
}
/**
 * 动作按钮的图标：与任务图标同一口径 —— 传了且解析得出就用它，否则回落本栏默认的 CPU。
 * 每颗按钮都有图标位，文字起点才对得齐（2026-11-15 用户：没传 icon 时文字往左跑了）。
 */
function actionIconOf(action, fallback) {
    const name = action.icon;
    return name === undefined || resolveIconName(name) === undefined ? fallback : name;
}
export function decideOpenState(current, next, controlled, lastEmitted) {
    if (current === next)
        return { kind: 'noop' };
    if (!controlled)
        return { kind: 'setInternal', value: next };
    // 受控分支只发回调、不写内部 state；父组件尚未回写时连续两次 false 只发一次。
    if (lastEmitted === next)
        return { kind: 'noop' };
    return { kind: 'emit', value: next };
}
/**
 * 第二行小字。运行中 = `MM:SS - 披露文字`（满小时 `HH:MM:SS - …`），秒级跳动；
 * 终态（`until` 有值）= 时间位置换成「已完成」小标签，后面仍可跟最后一段披露文字。
 *
 * - 时间只有数字与冒号，不写「已执行」；不足一小时 `MM:SS`，到一小时 `HH:MM:SS`。
 * - 有 `progress.message` 就跟一个 ` - ` 再显示它；没有就只显示时间 / 标签。
 * - 披露文字用 `FlipText(sweep)`：换字翻牌 + 常驻扫光，超长三点省略、hover 跑马灯都由它内层的
 *   `MarqueeText` 负责（与弹窗 notice 同一套，见 Modal / dsh-task-ledger）。
 *
 * 只有这一小块订阅全站唯一心跳（`useNowMs` ⇒ `infra/ticker`），列表其余部分不跟着每秒重渲染
 * —— 别把 `useNowMs()` 提到 `TaskBar` 顶层，那会让整个展开面板每秒重渲一次。
 * 终态不再订阅心跳（`until` 已冻结）。
 */
function Elapsed(props) {
    const settled = props.until !== undefined;
    const tick = useNowMs(); // hook 必须无条件调；终态下取 until，tick 变化不会用到
    const nowMs = props.until ?? tick;
    const leading = settled
        ? h(Chip, { tone: 'success', size: 'xs' }, t('taskbarDone'))
        : formatDurationHms(Math.max(0, nowMs - props.since));
    const message = props.progress;
    return h('span', { className: 'dshpc-taskbar__row-meta' }, leading, message === undefined || message === ''
        ? null
        : h('span', { className: 'dshpc-taskbar__row-detail' }, h('span', { className: 'dshpc-taskbar__row-sep' }, '-'), h(FlipText, { text: message, sweep: true })));
}
/** 终态行默认停留时长：给 `when: done/failed` 的行按钮留点击窗口，到点才退场。 */
const DEFAULT_SETTLE_RETAIN_MS = 60000;
/** 退场动画时长，与 task-bar.css 的 dshpc-taskbar-row-out 对齐。 */
const EXIT_ANIM_MS = 200;
/**
 * 终态行阶段：从 settledAt 与 now 的差值算，不存组件 state。
 * - 运行中 / 没带 settledAt ⇒ 不归本函数管（调用方单独处理）。
 * - rest = 停留期；leaving = 退场动画期（retainMs 前 EXIT_ANIM_MS）；gone = 已消失。
 */
export function rowSettlePhase(settledAt, now, retainMs) {
    const age = now - settledAt;
    if (age < retainMs - EXIT_ANIM_MS)
        return 'rest';
    if (age < retainMs)
        return 'leaving';
    return 'gone';
}
function settledAtOf(task) {
    return isSettled(task.state) ? task.settledAt : undefined;
}
/**
 * 终态行的「停留 + 退场」调度。
 *
 * 每条终态**各自一个定时器链**：rest→leaving→gone，到点只推进自己那一格。
 * 这样不同 settledAt 的任务在各自时刻退场，不会被一个共享时钟「一次跳变」批量带走
 * （用户 2026-11-19：5 个不同时间完成的任务同时消失 = 共享 now 被定时器节流后跳变所致；
 *  而且跳过 leaving 阶段 ⇒ 看不到退场动画）。
 *
 * 阶段存在 state Map，但**初值按 settledAt + Date.now() 现算**：组件重挂时已过期的直接
 * 判 gone、不再显示，不会「消失后又恢复」；未到期的从正确阶段接着走。
 * 依赖用 `settledSig`（id@settledAt 串）而非 all 数组引用：store 里进度更新不会让
 * effect 重跑、重置定时器（此前依赖新数组 = 「一直蹦」）。
 */
function useSettledRows(all, retainMs) {
    const [phases, setPhases] = useState(() => {
        const now = Date.now();
        const m = new Map();
        for (const task of all) {
            const at = settledAtOf(task);
            if (at !== undefined)
                m.set(task.id, rowSettlePhase(at, now, retainMs));
        }
        return m;
    });
    const settledSig = all
        .filter((t) => settledAtOf(t) !== undefined)
        .map((t) => `${t.id}@${String(t.settledAt)}`)
        .sort()
        .join('|');
    // SIG 变化（新终态 / 重结算 / 清理）：补齐或重置阶段，已过期的从当前时间判为 gone。
    useEffect(() => {
        setPhases((prev) => {
            const now = Date.now();
            const next = new Map();
            let changed = prev.size === 0;
            for (const task of all) {
                const at = settledAtOf(task);
                if (at === undefined)
                    continue;
                const phase = rowSettlePhase(at, now, retainMs);
                next.set(task.id, phase);
                if (prev.get(task.id) !== phase)
                    changed = true;
            }
            return changed ? next : prev;
        });
    }, [settledSig, retainMs]);
    // 每条终态按自己当前阶段挂下一个定时器：rest→leaving（到 retain-EXIT），leaving→gone（到 retain）。
    useEffect(() => {
        const cleanups = [];
        const now = Date.now();
        for (const task of all) {
            const at = settledAtOf(task);
            if (at === undefined)
                continue;
            const phase = phases.get(task.id) ?? rowSettlePhase(at, now, retainMs);
            if (phase === 'gone')
                continue;
            const boundary = at + retainMs - (phase === 'rest' ? EXIT_ANIM_MS : 0);
            const delay = Math.max(0, boundary - Date.now());
            if (phase === 'rest' && delay === 0) {
                setPhases((p) => { const n = new Map(p); n.set(task.id, 'leaving'); return n; });
                continue;
            }
            const timer = window.setTimeout(() => {
                setPhases((p) => {
                    const n = new Map(p);
                    const cur = n.get(task.id);
                    if (cur === undefined)
                        return p;
                    n.set(task.id, cur === 'rest' ? 'leaving' : 'gone');
                    return n;
                });
            }, delay);
            cleanups.push(() => window.clearTimeout(timer));
        }
        return () => { for (const off of cleanups)
            off(); };
    }, [settledSig, phases, retainMs]);
    const leavingIds = new Set();
    const rows = all.filter((task) => {
        if (settledAtOf(task) === undefined)
            return true;
        const phase = phases.get(task.id) ?? 'gone';
        if (phase === 'leaving')
            leavingIds.add(task.id);
        return phase !== 'gone';
    });
    // 最新在最上：store 按 startedAt 升序，这里倒序（同刻按 id 稳定兜底）。
    rows.sort((a, b) => b.startedAt - a.startedAt || (a.id < b.id ? 1 : a.id > b.id ? -1 : 0));
    return { rows, leavingIds };
}
/**
 * 后台任务中心的通用展示栏：未展开时是一颗按钮，展开后列出后台正在跑的任务。
 *
 * 数据面来自共享任务池（`taskCenterStore`），不接 props 里的任务数组；
 * 触发器是 `Button`（长条）/ 纯图标（自动正方形）两档，下拉容器复用 `PanelSurface`（menu 档）。
 * 有任务在跑时图标字形呼吸（大小循环），表示后台确实在动；只做 CSS 动画，不跑定时器。
 *
 * 面板里**只画一条外框**：行与行之间是一条虚线，不给每行再套底色 / 描边 / 圆角
 * （2026-11-15 用户：点开不要圆环套圆环）。
 *
 * 行右侧的按钮来自记录里的 `rowButtons`：点它走 `pressTaskButton`，方法本体在创建这条任务的那一页，
 * 这里只拿得到文案与下标。
 *
 * ```tsx
 * h(TaskBar, { form: 'pill', size: 'md', groups: ['scan'] })
 * h(TaskBar, { form: 'icon', size: 'sm' })   // 24×24 的正方形，带绿点与呼吸
 * ```
 */
export function TaskBar(props) {
    ensureComponentStyles('task-bar', TASK_BAR_CSS);
    // 切语言要重渲，否则计数与空态文字停在旧语种。
    useLocale();
    const { form = 'pill', size = 'md', groups, project, onActionFailure, placement = 'down', defaultIcon = DEFAULT_ICON, width, minWidth, maxWidth, className, style, settleRetainMs = DEFAULT_SETTLE_RETAIN_MS, open: controlledOpen, onOpenChange, closeOnAction = true, } = props;
    // 行内动作按钮一律最小号：面板里的动作是次要操作，不跟着触发器尺寸变（2026-11-15 用户）。
    const actionSize = 'sm';
    // 宽度三轴与 Button 同口径：固定宽优先，min / max 只在 width 未设时生效。
    // 只图标形态的宽高由 CSS 定死相等 ⇒ 一律不套，免得画出长方形。
    const triggerWidth = {};
    if (form === 'pill') {
        if (width !== undefined)
            triggerWidth.width = width;
        else {
            if (minWidth !== undefined)
                triggerWidth.minWidth = minWidth;
            if (maxWidth !== undefined)
                triggerWidth.maxWidth = maxWidth;
        }
    }
    // 只有被宽度约束（定宽或给了上限）才需要「省略号 + hover 跑马灯」；否则别多套一层测宽组件。
    const truncatable = form === 'pill' && (width !== undefined || maxWidth !== undefined);
    const [internalOpen, setInternalOpen] = useState(false);
    const open = controlledOpen ?? internalOpen;
    // 受控分支只发回调，绝不替父组件改 state；ref 记录上次发出的值，避免父组件尚未重渲时重复发 false。
    // props.open 变化时复位 ref —— 否则父组件先回写 false 再打开 true 后，下一次关闭会被去重吞掉。
    const lastEmitted = useRef(open);
    useEffect(() => { lastEmitted.current = open; }, [open]);
    const warnedControlled = useRef(false);
    useEffect(() => {
        if (controlledOpen === undefined || onOpenChange !== undefined || warnedControlled.current)
            return;
        warnedControlled.current = true;
        console.warn('[dsh-plugin-core] TaskBar: open requires onOpenChange; close paths will only emit the callback');
    }, [controlledOpen, onOpenChange]);
    const setOpenState = useCallback((next) => {
        const decision = decideOpenState(controlledOpen ?? internalOpen, next, controlledOpen !== undefined, lastEmitted.current);
        if (decision.kind === 'noop')
            return;
        if (decision.kind === 'emit') {
            lastEmitted.current = decision.value;
            onOpenChange?.(decision.value);
            return;
        }
        setInternalOpen(decision.value);
    }, [controlledOpen, internalOpen, onOpenChange]);
    useSyncExternalStore(taskCenterStore.subscribe, taskCenterStore.getSnapshot, taskCenterStore.getSnapshot);
    // 新体系没有 hidden / 跨站开关：project=null 收全部，groups='*' 也收全部。
    const scopeProject = project === undefined ? null : project;
    const scopeGroups = groups === '*' ? undefined : groups;
    // 展示栏列运行中任务 + 停留期 / 退场期的终态（停留给 when=done/failed 按钮点击窗口）。
    const selected = taskCenterStore.select(scopeProject, scopeGroups);
    const { rows: tasks, leavingIds } = useSettledRows(selected, settleRetainMs);
    // 触发器计数与呼吸只看真正运行中的任务，终态停留不算「在跑」。
    const running = tasks.filter((task) => !isSettled(task.state)).length;
    const busy = running > 0;
    const { refs, floatingStyles } = useFloating({
        open,
        onOpenChange: setOpenState,
        placement: placement === 'up' ? 'top-end' : 'bottom-end',
        middleware: [offset(6), flip({ padding: 8 }), shift({ padding: 8 })],
        whileElementsMounted: autoUpdate,
    });
    // 前台主浮层（Modal / SideSheet / 选文件弹窗）一出现就收起本面板；不自动恢复。
    const closeOnForeground = useCallback(() => { setOpenState(false); }, [setOpenState]);
    useDismissOnForegroundOverlay(closeOnForeground);
    // 点外部 / Esc 关闭：与 Picker 同一口径，不引入遮罩。
    useEffect(() => {
        if (!open || typeof document === 'undefined')
            return;
        const onPointerDown = (event) => {
            const target = event.target;
            if (target === null)
                return;
            // 引用元素可能是 floating-ui 的 virtual element，不保证有 contains。
            const reference = refs.reference.current;
            const floating = refs.floating.current;
            if (reference?.contains?.(target) === true)
                return;
            if (floating?.contains?.(target) === true)
                return;
            setOpenState(false);
        };
        const onKeyDown = (event) => {
            if (event.key === 'Escape')
                setOpenState(false);
        };
        document.addEventListener('pointerdown', onPointerDown);
        document.addEventListener('keydown', onKeyDown);
        return () => {
            document.removeEventListener('pointerdown', onPointerDown);
            document.removeEventListener('keydown', onKeyDown);
        };
    }, [open, refs, setOpenState]);
    const icon = h('span', { className: `dshpc-taskbar__iconwrap${busy ? ' dshpc-taskbar__iconwrap--busy' : ''}` }, h(FontIcon, { name: defaultIcon }), busy ? h('span', { className: 'dshpc-taskbar__dot' }) : null);
    const toggle = () => { setOpenState(!open); };
    // 被宽度约束时把「后台任务 + N 个运行中」并成**一段**文字：只留一个可收缩槽，
    // 计数不再作为 flex:none 的独立元素把箭头顶出边框；省略号与 hover 跑马灯都由这同一段负责。
    const labelText = t('taskbarLabel');
    const countText = busy ? t('taskbarCount', { n: running }) : '';
    const compactText = `${labelText}${countText === '' ? '' : ` ${countText}`}`;
    // 触发器照下拉框（Picker）那套皮：同高度档、同描边、同圆角，右侧一颗 6px 三角。
    // 纯图标档宽高相等（永远是正方形），不画文字与箭头。
    const trigger = h('button', {
        type: 'button',
        className: `dshpc-taskbar__trigger dshpc-taskbar__trigger--${form} dshpc-taskbar__trigger--${size}`,
        ...(form === 'icon' ? { 'aria-label': t('taskbarLabel') } : {}),
        'aria-expanded': open,
        'aria-haspopup': 'menu',
        onClick: toggle,
        style: triggerWidth,
    }, icon, 
    // 长条的文字吃剩余宽：定宽 / 上限时折叠省略号、hover 跑马灯（全站唯一实现 MarqueeText）。
    form === 'icon'
        ? null
        : truncatable
            ? h(MarqueeText, { text: compactText, className: 'dshpc-taskbar__label' })
            : h('span', { className: 'dshpc-taskbar__label' }, labelText), form === 'icon' || !busy || truncatable
        ? null
        : h('span', { className: 'dshpc-taskbar__count' }, countText), form === 'icon' ? null : h(Chevron, { dir: open ? 'up' : 'down', size: 6, className: 'dshpc-taskbar__caret' }));
    function renderRow(task) {
        // 原 UI 画记录自带的动作；新内核里动作叫 rowButtons，按 when 过滤当前状态。
        const actions = (task.rowButtons ?? []).filter((b) => b.when === undefined || b.when === 'always' || b.when === task.state);
        return h('div', {
            key: task.id,
            className: `dshpc-taskbar__item${leavingIds.has(task.id) ? ' dshpc-taskbar__item--leaving' : ''}`,
        }, h('span', { className: 'dshpc-taskbar__row-icon' }, h(FontIcon, { name: iconNameOf(task, defaultIcon) })), h('div', { className: 'dshpc-taskbar__row-main' }, h(MarqueeText, { text: formatDisplayTitle(task.title), className: 'dshpc-taskbar__row-title' }), h(Elapsed, { since: task.startedAt, until: task.settledAt, progress: task.progress?.message })), actions.length === 0
            ? null
            : h('div', {
                className: 'dshpc-taskbar__row-actions',
                onClick: (event) => { event.stopPropagation(); },
            }, 
            // 记录里带几颗就画几颗：不传色 = 中性灰底（secondary）；
            // 传了色 = 该色实心底（primary 的反色文字，深底浅字，两主题都读得清）。
            // 没有文案的那颗 Button 自己变正方形，label 顶上无障碍名 —— 分支与带文字的完全一致。
            actions.map((action, index) => {
                const label = action.text === undefined || action.text === '' ? undefined : action.text;
                const glyph = actionIconOf(action, defaultIcon);
                return h(Button, {
                    key: `${task.id}-${index}`,
                    size: actionSize,
                    variant: action.color === undefined ? 'secondary' : 'primary',
                    ...(action.color === undefined ? {} : { color: action.color }),
                    icon: h(FontIcon, { name: glyph }),
                    ...(label === undefined ? { label: glyph } : {}),
                    onClick: () => {
                        // 通用菜单「点项即收」：先关面板，再派发动作；失败仍按原口径报告。
                        if (closeOnAction)
                            setOpenState(false);
                        const ok = pressTaskButton(action.id, task.id);
                        if (ok)
                            return;
                        // 没生效一律要吭声：有回调交回调，否则走与 Toast 按钮共用的一次提示。
                        if (onActionFailure !== undefined)
                            onActionFailure({ task, index, ...(label === undefined ? {} : { label }) });
                        else
                            notifyTaskActionFailed();
                    },
                }, label);
            })));
    }
    return h('span', {
        ref: refs.setReference,
        className: className === undefined ? 'dshpc-taskbar' : `dshpc-taskbar ${className}`,
        style,
    }, trigger, open
        ? h(FloatingPortal, null, h('div', 
        // 浮动层自身必须带 z-index：floatingStyles 的 transform 会给它建 stacking context，
        // 把 z-index 写在 PanelSurface 上会被困在内部，盖不住同页 z-index≥1 的元素。
        { ref: refs.setFloating, style: floatingStyles, className: 'dshpc-taskbar__float' }, h(PanelSurface, { tier: 'menu', role: 'menu', className: 'dshpc-taskbar__panel' }, 
        // 空态只看「有没有可显示的行」，不看 busy（=有无运行中任务）：
        // 终态行在停留期也是有效行，最后一个运行任务结算时不能被一起撤掉。
        tasks.length > 0
            ? h('div', { className: 'dshpc-taskbar__list dshpc-scroll-thin' }, tasks.map(renderRow))
            : h('div', { className: 'dshpc-taskbar__empty' }, t('taskbarEmpty')))))
        : null);
}
//# sourceMappingURL=TaskBar.js.map