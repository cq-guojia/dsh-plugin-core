/**
 * 分段控件（滑动块）—— **全站唯一实现**（L2 组件皮肤，P1）
 *
 * 它是「同一份结构 + 两个受控轴」的样板：
 *  - `size`：`sm`(24) / `md`(28) / `lg`(32) —— **离散三档**，调用点**不许**自己写高度
 *    （真不够用才允许在调用点本地覆盖 `--dshpc-control-h-*`，属例外而非常态）；
 *  - `bordered`（默认 false）：最外再包一圈 1px 描边；总高与无框版逐像素一致
 *    （border 由 padding 抵消），两种模式整行混排不跳高。
 *
 * 外观只有一套（灰底轨道 + 白色选中片，阴影来自宿主 elevation token）。
 * 唯一的配色入口是 `tone`（2026-10-29）：传内置色名则由核心定底 / 字（两主题各自成立），
 * 传 `{ bg, fg }` 则两个主题都用调用方这一对颜色。
 * 2026-10-26 删掉 `variant` 轴（原 default / inset 两档在 CSS 里只差 1px 内距，
 * 且 default 比 `size` 承诺矮 2px，下游照 demo 对图时反复查不出原因 —— 见 docs/design/style.md）。
 *
 * 用法：
 *   // 单选
 *   h(Segmented<'a' | 'b'>, { value: v, size: 'md', items: [{ value: 'a', label: '甲' }], onChange: setV })
 *   // 多选（如星期）
 *   h(Segmented<'1' | '2'>, { multiple: true, value: vs, items: [...], onChange: setVs })
 *
 * ⚠️ 不许在任何使用点就地写分段样式；要多一档高度 / 多一个外观 ⇒ 走
 * docs/design/ui-style-guide.md §五 的流程（改基础层，一处改全站生效）。
 */
import { ensureControls } from './css.js';
import { createElement as h, useCallback, useLayoutEffect, useRef, useState, } from 'react';
import { getTooltipRenderer } from './tooltip.js';
/**
 * 角标 / 计数要不要显示，返回要显示的文本。
 * 数字 ≤0 是「没东西可数」的老口径；字符串（`'1K'` / `'99+'`）由调用方决定，原样显示，空串不显示。
 */
function countText(value) {
    if (value === undefined)
        return null;
    if (typeof value === 'number')
        return value > 0 ? String(value) : null;
    return value === '' ? null : value;
}
/**
 * 渲染一个分段控件（单选 / 多选同体）。
 *
 * @param props 见 {@link SegmentedProps}。
 * @returns 分段控件元素。
 */
export function Segmented(props) {
    // 幂等：token 层 + 控件皮肤（首次渲染时挂上，之后是空转）
    ensureControls();
    ensureControls();
    const size = props.size ?? 'lg';
    const multiple = props.multiple === true;
    const value = props.value;
    const onChange = props.onChange;
    // 单选：选中底由一块共用「滑动块」承担，点选后从旧段滑到新段（多选每段各自着色，没有唯一滑块可滑）。
    const sliding = !multiple && props.items.length > 1;
    const rootRef = useRef(null);
    const [thumb, setThumb] = useState(null);
    // 量选中段的位置：容器 width 由内容决定，段宽又随文案 / 角标变，只能读一次布局。
    const measure = useCallback(() => {
        const sel = rootRef.current?.querySelector('.dshpc-seg__item[aria-pressed="true"]');
        if (sel === undefined || sel === null) {
            setThumb(null);
            return;
        }
        const next = { left: sel.offsetLeft, top: sel.offsetTop, width: sel.offsetWidth, height: sel.offsetHeight };
        // 尺寸没变就不 set，免得 ResizeObserver 与渲染互相打转。
        setThumb((cur) => cur !== null && cur.left === next.left && cur.top === next.top && cur.width === next.width && cur.height === next.height
            ? cur
            : next);
    }, []);
    useLayoutEffect(() => {
        if (!sliding) {
            setThumb(null);
            return;
        }
        measure();
        const root = rootRef.current;
        // 容器被布局改宽（block / 换行 / webfont 到位）时重测；首帧 thumb 是插入的新元素，不触发过渡。
        if (root === null || typeof ResizeObserver === 'undefined')
            return;
        const ro = new ResizeObserver(measure);
        ro.observe(root);
        return () => ro.disconnect();
    }, [sliding, measure, value, size, props.items, props.bordered, props.block]);
    // 核心 Tooltip 渲染器（宿主启动注入官方 Tooltip；未注入则段级提示降级为无）。
    const renderer = getTooltipRenderer();
    // tone：内置色名走 CSS 类（底 / 字配对在 segmented.css，两主题各自成立）；
    // 自定义一对颜色只能内联写根节点那两条局部变量（内联恒胜，两主题同值）。
    const tone = props.tone;
    const toneClass = typeof tone === 'string' ? ` dshpc-seg--tone-${tone}` : '';
    const toneStyle = tone !== undefined && typeof tone !== 'string'
        ? { '--seg-thumb': tone.bg, '--seg-on': tone.fg }
        : undefined;
    return h('div', {
        role: 'group',
        'aria-label': props.label,
        id: props.id,
        ref: rootRef,
        // 结构一套、皮肤只在 controls-css 里；此处只拼「轴」类名，不写任何颜色 / 尺寸字面值。
        className: `dshpc-seg dshpc-seg--${size}${sliding ? ' dshpc-seg--slide' : ''}${props.block === true ? ' dshpc-seg--block' : ''}${props.bordered === true ? ' dshpc-seg--bordered' : ''}${toneClass}${props.className !== undefined ? ` ${props.className}` : ''}`,
        style: toneStyle === undefined ? props.style : { ...toneStyle, ...props.style },
    }, [
        sliding && thumb !== null
            ? h('span', {
                key: '__thumb__',
                className: 'dshpc-seg__thumb',
                'aria-hidden': true,
                style: {
                    left: `${String(thumb.left)}px`,
                    top: `${String(thumb.top)}px`,
                    width: `${String(thumb.width)}px`,
                    height: `${String(thumb.height)}px`,
                },
            })
            : null,
        ...props.items.map(item => {
            const on = multiple ? value.includes(item.value) : value === item.value;
            const disabled = item.disabled === true || props.disabled === true;
            const handle = () => {
                if (disabled)
                    return;
                if (multiple) {
                    const arr = value;
                    const next = arr.includes(item.value) ? arr.filter(v => v !== item.value) : [...arr, item.value];
                    onChange(next);
                }
                else {
                    ;
                    onChange(item.value);
                }
            };
            const count = countText(item.count);
            const badge = countText(item.badge);
            const itemButton = h('button', {
                key: item.value,
                type: 'button',
                className: 'dshpc-seg__item',
                // 选中态用 aria-pressed 表达 ⇒ 读屏可读，皮肤也只认这一个选择器
                'aria-pressed': on,
                disabled,
                onClick: handle,
            }, item.label, count === null ? null : h('span', { className: 'dshpc-seg__count' }, count), badge === null ? null : h('span', { className: 'dshpc-seg__badge' }, badge));
            // 段级悬停提示：走注入的官方 Tooltip（与 FieldHint 同一条路），不破坏分段布局。
            if (item.tooltip !== undefined && renderer !== undefined) {
                return renderer({ label: item.tooltip, side: 'top', children: itemButton });
            }
            return itemButton;
        }),
    ]);
}
//# sourceMappingURL=Segmented.js.map