import { createElement as h, useEffect, useState, useSyncExternalStore, } from 'react';
import { FloatingPortal, autoUpdate, flip, offset, shift, useFloating } from '@floating-ui/react';
import { Button, IconButton } from '../actions/Button.js';
import { FontIcon, resolveIconName } from './font-icon.js';
import { MarqueeText } from './MarqueeText.js';
import { Chevron } from '../infra/chevron.js';
import { PanelSurface } from '../infra/panel.js';
import { ensureComponentStyles } from '../infra/css.js';
import { useLocale } from '../infra/locale.js';
import { useNowMs } from '../infra/ticker.js';
import { t } from '../../utils/i18n.js';
import { formatDurationHms } from '../../utils/date.js';
import { selectTaskNotifications, taskNotifications, } from '../infra/task-notifications.js';
import { TASK_BAR_CSS } from './task-bar-css.js';
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
/**
 * 第二行小字：已运行多久（`已执行 00:00:01`，秒级跳动）。
 *
 * 只有这一小块订阅全站唯一心跳（`useNowMs` ⇒ `infra/ticker`），列表其余部分不跟着每秒重渲染
 * —— 别把 `useNowMs()` 提到 `TaskBar` 顶层，那会让整个展开面板每秒重渲一次。
 */
function Elapsed(props) {
    const nowMs = useNowMs();
    return h('span', { className: 'dshpc-taskbar__row-meta' }, t('taskbarElapsed', { time: formatDurationHms(Math.max(0, nowMs - props.since), { padHours: true }) }));
}
/**
 * 通知任务中心的通用展示栏：未展开时是一颗按钮，展开后列出后台正在跑的任务。
 *
 * 数据面全部来自池本身（`taskNotifications` + `selectTaskNotifications`），不接 props 里的任务数组；
 * 触发器是 `Button`（长条）/ `IconButton`（纯图标，正方形）两档，下拉容器复用 `PanelSurface`（menu 档）。
 * 有任务在跑时图标字形呼吸（大小循环），表示后台确实在动；只做 CSS 动画，不跑定时器。
 *
 * 面板里**只画一条外框**：行与行之间是一条虚线，不给每行再套底色 / 描边 / 圆角
 * （2026-11-15 用户：点开不要圆环套圆环）。
 *
 * 行右侧的按钮来自记录里的 `actions`：点它调 `runAction`，方法本体在创建这条任务的那一页，
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
    const { form = 'pill', size = 'md', groups, project, includeHidden, placement = 'down', defaultIcon = DEFAULT_ICON, width, minWidth, maxWidth, className, style, } = props;
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
    const [open, setOpen] = useState(false);
    const snapshot = useSyncExternalStore(taskNotifications.subscribe, taskNotifications.getSnapshot, taskNotifications.getServerSnapshot);
    useEffect(() => { taskNotifications.connect(); }, []);
    const tasks = selectTaskNotifications(snapshot, groups, {
        ...(project === undefined ? {} : { project }),
        ...(includeHidden === undefined ? {} : { includeHidden }),
    });
    const running = tasks.length;
    const busy = running > 0;
    const { refs, floatingStyles } = useFloating({
        open,
        onOpenChange: setOpen,
        placement: placement === 'up' ? 'top-end' : 'bottom-end',
        middleware: [offset(6), flip({ padding: 8 }), shift({ padding: 8 })],
        whileElementsMounted: autoUpdate,
    });
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
            setOpen(false);
        };
        const onKeyDown = (event) => {
            if (event.key === 'Escape')
                setOpen(false);
        };
        document.addEventListener('pointerdown', onPointerDown);
        document.addEventListener('keydown', onKeyDown);
        return () => {
            document.removeEventListener('pointerdown', onPointerDown);
            document.removeEventListener('keydown', onKeyDown);
        };
    }, [open, refs]);
    const icon = h('span', { className: `dshpc-taskbar__iconwrap${busy ? ' dshpc-taskbar__iconwrap--busy' : ''}` }, h(FontIcon, { name: defaultIcon }), busy ? h('span', { className: 'dshpc-taskbar__dot' }) : null);
    const toggle = () => { setOpen(!open); };
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
            ? h(MarqueeText, { text: t('taskbarLabel'), className: 'dshpc-taskbar__label' })
            : h('span', { className: 'dshpc-taskbar__label' }, t('taskbarLabel')), form === 'icon' || !busy
        ? null
        : h('span', { className: 'dshpc-taskbar__count' }, t('taskbarCount', { n: running })), form === 'icon' ? null : h(Chevron, { dir: open ? 'up' : 'down', size: 6, className: 'dshpc-taskbar__caret' }));
    function renderRow(task) {
        const actions = task.actions ?? [];
        return h('div', { key: task.id, className: 'dshpc-taskbar__item' }, h('span', { className: 'dshpc-taskbar__row-icon' }, h(FontIcon, { name: iconNameOf(task, defaultIcon) })), h('div', { className: 'dshpc-taskbar__row-main' }, h('span', { className: 'dshpc-taskbar__row-title', title: task.title }, task.title), h(Elapsed, { since: task.startedAt })), actions.length === 0
            ? null
            : h('div', {
                className: 'dshpc-taskbar__row-actions',
                onClick: (event) => { event.stopPropagation(); },
            }, 
            // 记录里带几颗就画几颗：不传色 = 中性灰底（secondary）；
            // 传了色 = 该色实心底（primary 的反色文字，深底浅字，两主题都读得清）。
            // 只有图标没有文案的那颗画成正方形图标钮（宽高相等），默认同样带灰底。
            actions.map((action, index) => {
                const label = action.label === undefined || action.label === '' ? undefined : action.label;
                const glyph = actionIconOf(action, defaultIcon);
                if (label === undefined) {
                    return h(IconButton, {
                        key: `${task.id}-${index}`,
                        size: actionSize,
                        icon: h(FontIcon, { name: glyph }),
                        label: glyph,
                        background: action.color ?? 'var(--dshpc-hover)',
                        onClick: () => { void taskNotifications.runAction(task.id, index); },
                    });
                }
                return h(Button, {
                    key: `${task.id}-${index}`,
                    size: actionSize,
                    variant: action.color === undefined ? 'secondary' : 'primary',
                    ...(action.color === undefined ? {} : { color: action.color }),
                    icon: h(FontIcon, { name: glyph }),
                    onClick: () => { void taskNotifications.runAction(task.id, index); },
                }, label);
            })));
    }
    return h('span', {
        ref: refs.setReference,
        className: className === undefined ? 'dshpc-taskbar' : `dshpc-taskbar ${className}`,
        style,
    }, trigger, open
        ? h(FloatingPortal, null, h('div', { ref: refs.setFloating, style: floatingStyles }, h(PanelSurface, { tier: 'menu', role: 'menu', className: 'dshpc-taskbar__panel' }, busy
            ? h('div', { className: 'dshpc-taskbar__list dshpc-scroll-thin' }, tasks.map(renderRow))
            : h('div', { className: 'dshpc-taskbar__empty' }, t('taskbarEmpty')))))
        : null);
}
//# sourceMappingURL=TaskBar.js.map