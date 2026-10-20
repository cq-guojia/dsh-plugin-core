/**
 * 停靠面板的状态逻辑（纯函数，零 React / 零 DOM）。
 *
 * 只记两件事：**哪些面板开着**、**每栏多宽**。内容与头部不在这里——
 * 那是调用方在页面里声明的东西（`<DockPanel id="…">…</DockPanel>`），
 * 与 Ant Design `Tabs` 的 `activeKey` + `<TabPane>` 同一分工：
 * **显隐归状态，结构归 children**。
 *
 * 口径（用户 2026-10-20 定案）：
 *   · 组名 = 窗口，一对一：`open('A')` 再 `open('A')` 只是重复打开，不新增一栏；
 *   · 未到上限 ⇒ 追加；到上限 ⇒ 返回 `{ ok: false, reason: 'limit' }`，不静默丢弃；
 *   · 关一栏即腾位，之后可以开新组名；
 *   · 没有多份同名、没有自动淘汰、没有 tab 切换。
 */
/** 默认窗口的保留名：`open()` 不传 id 时用它。 */
export const DEFAULT_PANEL_ID = 'default';
export function emptyDock() {
    return { ids: [], widths: {} };
}
/** 夹到 [min, max]；`max` 缺省表示不设上限。NaN / Infinity 一律落回 min。 */
export function clampWidth(value, min, max) {
    const wide = Number.isFinite(value) ? value : min;
    const capped = max === undefined || !Number.isFinite(max) ? wide : Math.min(wide, max);
    return Math.max(min, Math.round(capped));
}
export function isOpen(state, id) {
    return state.ids.includes(id);
}
/**
 * 打开一栏。已开 ⇒ 原样返回（`created: false`，位置不变）；
 * 未开且已满 ⇒ 返回失败结果，状态不动。
 */
export function openPanel(state, id, maxPanels) {
    if (isOpen(state, id))
        return { state, result: { ok: true, id, created: false } };
    if (state.ids.length >= maxPanels)
        return { state, result: { ok: false, id, reason: 'limit' } };
    return { state: { ids: [...state.ids, id], widths: state.widths }, result: { ok: true, id, created: true } };
}
/** 关一栏；不存在即原样返回（幂等）。宽度记忆随栏一起丢弃。 */
export function closePanel(state, id) {
    if (!isOpen(state, id))
        return state;
    const widths = { ...state.widths };
    delete widths[id];
    return { ids: state.ids.filter((item) => item !== id), widths };
}
/** 记某栏宽度（已夹过）；值没变时原样返回，避免无谓重渲染。 */
export function setPanelWidth(state, id, width) {
    if (!isOpen(state, id))
        return state;
    if (state.widths[id] === width)
        return state;
    return { ids: state.ids, widths: { ...state.widths, [id]: width } };
}
/** 其他栏宽度之和（算「这一栏最多能拖多宽」用）。 */
export function othersWidth(state, id, fallbackOf) {
    return state.ids.reduce((sum, item) => {
        if (item === id)
            return sum;
        return sum + (state.widths[item] ?? fallbackOf(item));
    }, 0);
}
//# sourceMappingURL=panel-dock-logic.js.map