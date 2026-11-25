/**
 * 后台任务的纯数据模型 —— 一个「任务」在核心里到底是什么。
 *
 * 这是新任务体系的数据契约中心：零 React、零宿主、零 DOM，全是结构化克隆安全的纯数据。
 * 设计口径（用户 2026-11-18 拍板）：
 * - 任务 = 一次交给后端执行的工作 + 它要怎么通知 + 列表上有哪些按钮。配置全是纯数据，跟着记录走，
 *   所以任何页面看到同一条任务都按同一份配置渲染，不需要发起页在场。
 * - 状态真源、心跳、判死都在服务端；这里只存服务端投影下来的事实与配置，不设租约、不算时钟。
 * - 进度是正规字段（updatedAt / lastMessage / progress），不塞进 detail。
 */
import type { NotifyDetail } from '../../runtime/notify.js'

export type TaskState = 'running' | 'done' | 'failed'

/**
 * 对外显示的标题：**分类 + 说明**两段，core 统一拼成 `分类丨说明`。
 * 分类建议中文 2–4 字 / 英文最多 2 个单词（软约定，代码不判字数）；整串过长由跑马灯处理。
 */
export interface DisplayTitle {
  readonly category: string
  readonly description: string
}

/** 分隔符写成转义，避免被裸中文检测当成界面文案。 */
const TITLE_SEPARATOR = '\u4E28'

export function isDisplayTitle(value: unknown): value is DisplayTitle {
  if (value === null || typeof value !== 'object') return false
  const candidate = value as Partial<DisplayTitle>
  return (
    typeof candidate.category === 'string' && candidate.category.trim() !== '' &&
    typeof candidate.description === 'string' && candidate.description.trim() !== ''
  )
}

export function formatDisplayTitle(title: DisplayTitle): string {
  return `${title.category}${TITLE_SEPARATOR}${title.description}`
}

/** 通知范围：all = 每个页面都处理；origin = 只发起页处理。 */
export type TaskScope = 'all' | 'origin'
/** 广播范围：plugin = 同项目消费者；global = 同宿主所有插件。 */
export type TaskBroadcast = 'plugin' | 'global'

/** 终态按钮：id 对应消费方 handlers；跨项目时由核心决定是否显示。 */
export interface TaskButton {
  readonly id: string
  readonly text: string
  /** 可选字体图标名；展示栏画在文字左侧，没传回落默认图标。 */
  readonly icon?: string
  /** 可选底色；展示栏据此换主色按钮，没传就是中性灰。 */
  readonly color?: string
}

/** 一个终态（success / failure）的 toast 配置。整态不写 = 该态不弹卡。 */
export interface TaskToastState {
  /** 显示为 `分类丨说明` 的结构化标题，由调用方给。 */
  readonly title: DisplayTitle
  readonly button?: TaskButton
  readonly scope?: TaskScope
}

export interface TaskToastConfig {
  readonly success?: TaskToastState
  readonly failure?: TaskToastState
}

/** 一个终态的通知配置。与 toast 是两件事，各自可配 scope 与 broadcast。 */
export interface TaskNotifyState {
  readonly message: string
  readonly detail?: NotifyDetail
  readonly scope?: TaskScope
  readonly broadcast?: TaskBroadcast
}

export interface TaskNotifyConfig {
  readonly success?: TaskNotifyState
  readonly failure?: TaskNotifyState
}

/** 列表行按钮的显示时机。 */
export type TaskWhen = 'running' | 'done' | 'failed' | 'always'

/** 列表行按钮声明：文案与时机跟着记录走，画面由核心控件画。 */
export interface TaskRowButton extends TaskButton {
  readonly when?: TaskWhen
}

/** 进度：最后更新时间 + 最后一段话 + 可选数值。正规字段，不进 detail。 */
export interface TaskProgress {
  readonly message: string
  /** 真源分配的单调递增时刻（Date.now() 级别）。同 key 服务端须严格递增；仅用于排序，不用于展示。 */
  readonly updatedAt: number
  readonly current?: number
  readonly total?: number
  readonly percent?: number
}

/** 形状校验：坏 progress 在边界被剥离（保留旧值），不让它畸形地进 store 或渲染层。 */
export function isTaskProgress(value: unknown): value is TaskProgress {
  if (value === null || typeof value !== 'object') return false
  const v = value as Record<string, unknown>
  const finite = (x: unknown): boolean => typeof x === 'number' && Number.isFinite(x)
  return (
    typeof v.message === 'string' &&
    finite(v.updatedAt) &&
    (v.current === undefined || finite(v.current)) &&
    (v.total === undefined || finite(v.total)) &&
    (v.percent === undefined || finite(v.percent))
  )
}

/**
 * 一条任务记录。所有字段都是服务端下发或调用方给的纯数据，跨页克隆安全、无函数。
 */
export interface TaskRecord {
  readonly id: string
  /** 业务键：同一 (project, key) 同时最多一条。 */
  readonly key?: string
  readonly project: string
  readonly group: string
  /** 显示为 `分类丨说明` 的结构化标题，由调用方给。 */
  readonly title: DisplayTitle
  readonly state: TaskState
  readonly startedAt: number
  /** 发起面板 id：点击按钮时先切回这个面板再执行 handler。核心自动记，调用方不传。 */
  readonly panelId?: string
  /**
   * 发起页的页面级（标签页）id。核心自动记，调用方不传。
   * 兼作 `scope:'origin'` 的归属判定：通知只在发起它的那个标签页弹。
   * `panelId` 只管切 UI，不参与弹卡归属——同标签页换面板不影响 origin。
   */
  readonly origin?: string
  /** 执行器种类（开放字符串）+ 纯数据参数。 */
  readonly kind?: string
  /** 纯数据：JSON 安全值（普通对象/数组/基本类型），禁 class 实例 / Map / Set / 函数。 */
  readonly args?: object
  readonly detail?: NotifyDetail
  readonly icon?: string
  /** 最后进度；服务端上报，核心投影。 */
  readonly progress?: TaskProgress
  readonly toast?: TaskToastConfig
  readonly notify?: TaskNotifyConfig
  readonly rowButtons?: readonly TaskRowButton[]
  readonly reason?: string
  /** 终态结算时刻（done/failed）；留存窗口由展示层决定。 */
  readonly settledAt?: number
}

/** 消费方 handlers / handler 参数用的记录别名（沿用旧类型名，字段与 TaskRecord 完全一致）。 */
export type TaskNotificationRecord = TaskRecord

/** startTask 的输入。 panelId 由核心从 layout 自动填，不在此声明。 */
export interface StartTaskInput {
  readonly project?: string
  readonly group?: string
  /** 显示为 `分类丨说明` 的结构化标题，由调用方给。 */
  readonly title: DisplayTitle
  readonly key?: string
  readonly kind: string
  /** 纯数据：JSON 安全值（普通对象/数组/基本类型），禁 class 实例 / Map / Set / 函数。 */
  readonly args?: object
  readonly detail?: NotifyDetail
  readonly icon?: string
  readonly toast?: TaskToastConfig
  readonly notify?: TaskNotifyConfig
  readonly rowButtons?: readonly TaskRowButton[]
}

/**
 * 一次性完成通知：服务端在终态跃迁那一刻产出，带全局唯一 id。
 *
 * 与 TaskRecord（可反复重放的状态）物理隔离——这是「刷新/重连不重弹」的根：
 * 状态投影（基线 / 增量）永不触发弹卡，只有收到本事件才弹，且按 id 持久去重。
 */
export interface TaskNotice {
  /** 全局唯一通知身份：用完即永久去重，重连/刷新重推同一条也不会再弹。 */
  readonly id: string
  /** 结算后的任务快照（含 toast / notify / rowButtons 配置）。 */
  readonly task: TaskRecord
}

/** 终态回调：只给消费方刷自己的数据，核心列表刷新不靠它。 */
export interface TaskSettlement {
  readonly outcome: 'done' | 'failed'
  readonly task: TaskRecord
}

/** 按 when 过滤某状态下要显示的列表按钮；always 恒显示。 */
export function buttonsForState(
  buttons: readonly TaskRowButton[] | undefined,
  state: TaskState,
): readonly TaskRowButton[] {
  if (buttons === undefined) return []
  return buttons.filter((button) => {
    const when = button.when ?? 'always'
    return when === 'always' || when === state
  })
}

/** 某终态要不要弹卡 / 发通知：整态配置不存在就是不做。 */
export function toastForState(config: TaskToastConfig | undefined, state: TaskState): TaskToastState | undefined {
  return state === 'done' ? config?.success : state === 'failed' ? config?.failure : undefined
}

export function notifyForState(config: TaskNotifyConfig | undefined, state: TaskState): TaskNotifyState | undefined {
  return state === 'done' ? config?.success : state === 'failed' ? config?.failure : undefined
}
