/**
 * 停靠面板的状态逻辑（纯函数，零 React / 零 DOM）。
 *
 * 只记三件事：**哪些面板开着**、**每栏多宽**、**哪些收起成了耳朵**。
 * 内容与头部不在这里——那是调用方在页面里声明的东西（`<DockPanel id="…">…</DockPanel>`），
 * 与 Ant Design `Tabs` 的 `activeKey` + `<TabPane>` 同一分工：
 * **显隐归状态，结构归 children**。
 *
 * 口径（用户 2026-10-20 定案）：
 *   · 组名 = 窗口，一对一：`open('A')` 再 `open('A')` 只是重复打开，不新增一栏；
 *   · 未到上限 ⇒ 追加；到上限 ⇒ 返回 `{ ok: false, reason: 'limit' }`，不静默丢弃；
 *   · 关一栏即腾位，之后可以开新组名；
 *   · 没有多份同名、没有自动淘汰、没有 tab 切换。
 *
 * 收起（用户 2026-10-28 定案）= **面板退出布局、换成一只独立的固定耳朵**，不是把栏宽缩细：
 *   · `collapsePanel` 把组名从 `ids` 移到 `collapsed`，**宽度留着**（展开要回到原宽）；
 *   · 耳朵是另一块 fixed 浮层，不在这里表达布局——这里只记「谁收起了」。
 */

/** 默认窗口的保留名：`open()` 不传 id 时用它。 */
export const DEFAULT_PANEL_ID = 'default'

export interface DockState {
  /** 打开顺序即数组顺序（稳定，不随重开变化）。 */
  ids: string[]
  /** 每栏宽度（px）；没有记录的栏由组件用它的 `width` 兜底。 */
  widths: Record<string, number>
  /** 已收起（变成右侧浮动耳朵）的组名，按收起顺序；宽度仍在 `widths` 里等展开还原。 */
  collapsed: string[]
}

export type OpenResult =
  | { ok: true; id: string; created: boolean }
  | { ok: false; id: string; reason: 'limit' }

export function emptyDock(): DockState {
  return { ids: [], widths: {}, collapsed: [] }
}

/** 夹到 [min, max]；`max` 缺省表示不设上限。NaN / Infinity 一律落回 min。 */
export function clampWidth(value: number, min: number, max?: number): number {
  const wide = Number.isFinite(value) ? value : min
  const capped = max === undefined || !Number.isFinite(max) ? wide : Math.min(wide, max)
  return Math.max(min, Math.round(capped))
}

export function isOpen(state: DockState, id: string): boolean {
  return state.ids.includes(id)
}

export function isCollapsed(state: DockState, id: string): boolean {
  return state.collapsed.includes(id)
}

/**
 * 打开一栏。已开 ⇒ 原样返回（`created: false`，位置不变）；
 * 未开且已满 ⇒ 返回失败结果，状态不动。打开即撤销同名耳朵。
 */
export function openPanel(
  state: DockState,
  id: string,
  maxPanels: number,
): { state: DockState; result: OpenResult } {
  if (isOpen(state, id)) return { state, result: { ok: true, id, created: false } }
  if (state.ids.length >= maxPanels) return { state, result: { ok: false, id, reason: 'limit' } }
  return {
    state: {
      ids: [...state.ids, id],
      widths: state.widths,
      collapsed: state.collapsed.filter((item) => item !== id),
    },
    result: { ok: true, id, created: true },
  }
}

/**
 * 关一栏；不存在即原样返回（幂等）。宽度记忆随栏一起丢弃。
 * 对已收起的耳朵也生效 —— 「关闭」= 彻底不留，耳朵一起抹掉（用户 2026-10-28 口径）。
 */
export function closePanel(state: DockState, id: string): DockState {
  const open = isOpen(state, id)
  const ear = isCollapsed(state, id)
  if (!open && !ear) return state
  const widths = { ...state.widths }
  delete widths[id]
  return {
    ids: open ? state.ids.filter((item) => item !== id) : state.ids,
    widths,
    collapsed: ear ? state.collapsed.filter((item) => item !== id) : state.collapsed,
  }
}

/** 记某栏宽度（已夹过）；值没变时原样返回，避免无谓重渲染。 */
export function setPanelWidth(state: DockState, id: string, width: number): DockState {
  if (!isOpen(state, id)) return state
  if (state.widths[id] === width) return state
  return { ids: state.ids, widths: { ...state.widths, [id]: width }, collapsed: state.collapsed }
}

/**
 * 收起一栏：退出布局（从 `ids` 移除，**立即不占宽**），转入耳朵列表。
 * 宽度**不删**——耳朵展开时要回到原宽。只对开着的栏生效。
 */
export function collapsePanel(state: DockState, id: string): DockState {
  if (!isOpen(state, id)) return state
  return {
    ids: state.ids.filter((item) => item !== id),
    widths: state.widths,
    collapsed: state.collapsed.includes(id) ? state.collapsed : [...state.collapsed, id],
  }
}

/** 展开耳朵：移出耳朵列表、回到打开列表末尾；宽度照旧（`collapsePanel` 没删）。 */
export function expandPanel(state: DockState, id: string): DockState {
  if (!isCollapsed(state, id)) return state
  return {
    ids: state.ids.includes(id) ? state.ids : [...state.ids, id],
    widths: state.widths,
    collapsed: state.collapsed.filter((item) => item !== id),
  }
}

/** 其他栏宽度之和（算「这一栏最多能拖多宽」用）。 */
export function othersWidth(state: DockState, id: string, fallbackOf: (panelId: string) => number): number {
  return state.ids.reduce((sum, item) => {
    if (item === id) return sum
    return sum + (state.widths[item] ?? fallbackOf(item))
  }, 0)
}
