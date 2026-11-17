import { createContext, createElement as h, useContext, type ReactNode } from 'react'
import { t, type Translate } from '../../utils/i18n.js'
import { ensureComponentStyles } from '../infra/css.js'
import { FEEDBACK_CSS } from './feedback-css.js'
import { OverlayHead, OverlayLockExempt, OverlayLockedProvider, OverlayMask, useEscapeClose, useLockGuards } from '../infra/overlay.js'
import { PanelSurface } from '../infra/panel.js'
import { FlipText } from '../display/FlipText.js'

/** 弹窗尺寸档：sm≈确认框 / md(默认) / lg 大窗。 */
export type ModalSize = 'sm' | 'md' | 'lg'

export interface ModalProps {
  /** 头部左侧图标位（可不传）。 */
  icon?: ReactNode
  title?: ReactNode
  /**
   * 标题**下方**的副标题行（等宽小字；会话预览的 sessionId 就放这里 —— 用户 2026-10-22：
   * 标识属于标题区，不占正文）。与标题同宽、可换行。
   */
  subtitle?: ReactNode
  /** 标题右侧小块：数字 / 标签（ReactNode；demo 用 Chip 演示）。 */
  headerExtra?: ReactNode
  /**
   * 整块替换头部**左侧标题区**（`icon` + `title` + `subtitle` + `headerExtra` 那一块）：
   *   · 不传 ⇒ 内置标题区
   *   · `null` ⇒ 不画标题区（`headerActions` 与 ✕ 照旧）
   *   · 其他 ReactNode ⇒ 你的标题区，库只给一层布局容器，不加内边距 / 字号 / 字重
   */
  header?: ReactNode | null
  /** 头部右侧动作区：关闭钮之外的更多按钮（ReactNode）。 */
  headerActions?: ReactNode
  /** 关闭回调；不传则 ✕ 不显示（必须自己给关闭路径）。 */
  onClose?: () => void
  /** 是否显示右上角 ✕（默认 = `onClose` 是否传入）。确认框传 false 即可去掉小叉。 */
  closable?: boolean
  /** 点遮罩是否关闭（默认 true；误触代价大的场景设 false）。 */
  closeOnMask?: boolean
  /** 按 Esc 是否关闭（默认 true）。 */
  escClose?: boolean
  /**
   * 有异步在跑（如 footer 里的 `Button` 正在 loading）：为真时遮罩 / Esc / ✕ **三条关闭路径全失效**，
   * 内容照常渲染。与 `closeOnMask` / `escClose` / `closable` 是"与"关系 —— 它是否决项，不替代它们。
   */
  busy?: boolean
  /**
   * **锁死全部交互**（与 loading 解耦：按钮转不转圈是另一回事）。为真时：
   *  · 面板内的核心控件各自按**自己的禁用态**渲染（灰掉、点不动、Tab 跳过）；
   *  · 面板整块关掉**指针命中**（`pointer-events:none`），自绘元素也点不动，鼠标是禁止手势；
   *    命中落到遮罩上 —— 锁定时遮罩不是关闭路径，点它既不关窗也不穿透页面（根因解，不靠透明点击层压层级）；
   *  · 遮罩 / Esc / ✕ 三条关闭路径同时失效。
   *
   * 一律只做「或」，**永不写回调用方的 `disabled`**：本来禁用的解锁后照样禁用，锁定期间你把它改成
   * 能用 / 禁用，解锁后也照你的。不压任何灰色遮罩 —— 整块蒙一层会让人以为界面坏了。
   * 受控项，不落内部 state：关掉重开自然回到未锁。
   */
  locked?: boolean
  /**
   * 锁定期间的例外控件（1~N 个任意 ReactNode）：整窗锁死时**只有这一块**仍可点、可 Tab，
   * 核心控件在其中也不自我禁用；其余按钮、三条关闭路径照旧封死。不传则 locked 仍是一刀切。
   *
   * 本 prop 渲染在**面板末尾**（footer 之后）。要放到头部 / footer / 正文等其他位置，用同包导出的
   * `ModalLockExempt` 就地包裹：`<ModalLockExempt><Button … /></ModalLockExempt>`，同一套机制。
   */
  lockExceptions?: ReactNode
  /** 收起出口：例外控件调用它请求收起。核心只发事件、不结算、不隐藏 —— 隐藏由 `backgrounded` 受控。 */
  onBackground?: () => void
  /**
   * 受控收起态（默认 false）。true = 整窗从界面隐藏但**不卸载**（输入 / 进度 / 滚动原样保留），
   * 同时撤掉 Tab / Esc 监听，避免看不见的弹窗吞键或被 Esc 关掉。还原 = 置回 false。
   */
  backgrounded?: boolean
  /** 尺寸档：sm=小确认框家族 / md·lg=大弹窗家族；也可用 width/height 精确覆盖。 */
  size?: ModalSize
  /** 面板宽度（默认随 size：sm 360px / md 720px / lg 1120px，均带视口兜底）。 */
  width?: string
  /** 面板高度（默认仅 lg 有：calc(100% - 80px)，同兄弟项目大弹窗）。 */
  height?: string
  /** 面板最大宽度 / 最大高度覆盖（不传走 size 默认）。 */
  maxWidth?: string
  maxHeight?: string
  /** 不渲染头部（沉浸式 / 无标题场景）。 */
  hideHeader?: boolean
  footer?: ReactNode
  /**
   * footer **左侧**的一行过程提示（换字即翻牌，太长省略、hover 跑马灯）。
   * 不传 = 不占位、与以前完全一样；传了就自动出现（footer 也可不给，它会自己撑起底栏）。
   * 换文案只改这个值，动效由 `FlipText` 负责。
   */
  notice?: string
  /** footer 上面那条分隔线（默认 true）。传 false 关闭；sm 确认框家族本来就没有。 */
  footerDivider?: boolean
  /** 追加 class（只允许补布局 / 视觉修饰，不许覆盖皮肤）。 */
  className?: string
  children?: ReactNode
  translate?: Translate
}

/** 收起出口的 Context：让例外控件深处也能拿到 `onBackground`，不必逐层透传。 */
const BackgroundContext = createContext<(() => void) | undefined>(undefined)

/** 在 `lockExceptions` 子树里取收起出口；无 `onBackground` 时返回 undefined（调用方可据此不渲染收起钮）。 */
export function useModalBackground(): (() => void) | undefined {
  return useContext(BackgroundContext)
}

/**
 * 模态弹窗（自绘 overlay，**不用 react-dom 的 portal**，避免多一个必需依赖）。
 *
 * 定位：它是**呈现方式**，不是内容 —— 会话预览这类功能模块要用弹窗时用它来承载（需求文档 §4）。
 */
export function Modal(props: ModalProps): ReturnType<typeof h> {
  ensureComponentStyles('feedback', FEEDBACK_CSS)
  const tt = props.translate ?? t
  // busy / locked / backgrounded 都是否决项：三条关闭路径一起封死（✕ 见下面 showClose）。
  // locked 比 busy 多管一层：面板整块不可交互（pointer-events）。
  const busy = props.busy === true
  const locked = props.locked === true
  const backgrounded = props.backgrounded === true
  const denyClose = busy || locked || backgrounded
  const closeOnMask = !denyClose && props.closeOnMask !== false
  // 收起后整窗隐藏，Tab/Esc 监听一起撤掉 —— 否则看不见的弹窗还吞键、还能被 Esc 关掉。
  useEscapeClose(!denyClose && props.escClose !== false, denyClose ? undefined : props.onClose)
  useLockGuards(locked && !backgrounded)
  // 空串等同于没给：底栏那块地方复用给下一轮时，传 "" 就把上一句清干净、不留占位。
  const notice = props.notice === '' ? undefined : props.notice

  // 默认宽高（兄弟项目真值：小框 360px（task-list.tsx:457）/ 大弹窗 min(1120px,100vw-32px) × calc(100%-80px)（archive-session-css.ts:42））。
  // 宽度用 `100%`（相对遮罩盒）而不是 `100vw`：遮罩已按右侧分栏让位（见 feedback.css），
  // 用 `100vw` 算出来的宽在分栏在场时会溢出到分栏上，等于白让（用户 2026-10-22）。
  const sizeStyle: Record<ModalSize, { width: string; maxWidth?: string; maxHeight?: string; height?: string }> = {
    sm: { width: '360px', maxWidth: 'calc(100% - 48px)' },
    md: { width: 'min(720px, calc(100% - 32px))', maxHeight: '86vh' },
    lg: { width: 'min(1120px, calc(100% - 32px))', height: 'calc(100% - 80px)' },
  }
  const s = sizeStyle[props.size ?? 'md']
  const showClose = props.closable !== false && props.onClose !== undefined && !denyClose
  const showHeader =
    props.hideHeader !== true &&
    (props.icon !== undefined ||
      props.title !== undefined ||
      props.subtitle !== undefined ||
      props.headerExtra !== undefined ||
      props.header !== undefined ||
      props.headerActions !== undefined ||
      showClose)

  return h(
    OverlayMask,
    {
      kind: 'center',
      closeOnMask,
      onClose: denyClose ? undefined : props.onClose,
      // 面板锁定与整窗收起都标在遮罩上：前者控禁止手势，后者整窗隐藏但保树。
      attrs: {
        ...(locked ? { 'data-dshpc-locked': '' } : {}),
        ...(backgrounded ? { 'data-dshpc-backgrounded': '' } : {}),
      },
    },
    h(
      BackgroundContext.Provider,
      { value: props.onBackground },
      h(
        OverlayLockedProvider,
        { value: locked },
        // 表面（底色/描边/圆角/阴影）来自 panel.css 的 modal 档；`.dshpc-modal` 只剩家族布局，
        // 且继续作为既有类名别名存在（消费方写在它上面的覆盖不受影响）。
        h(
          PanelSurface,
          {
            tier: 'modal',
            className: `dshpc-modal${props.size ? ` dshpc-modal--${props.size}` : ''}${locked ? ' dshpc-modal--locked dshpc-locked' : ''}${props.className !== undefined && props.className !== '' ? ` ${props.className}` : ''}`,
            style: {
              width: props.width ?? s.width,
              maxWidth: props.maxWidth ?? s.maxWidth,
              maxHeight: props.maxHeight ?? s.maxHeight,
              height: props.height ?? s.height,
            },
            stopPropagation: true,
          },
          // 头部与遮罩都是浮层公共件（overlay.ts），SideSheet 用的是同一套。
          showHeader
            ? h(OverlayHead, {
                icon: props.icon,
                title: props.title,
                subtitle: props.subtitle,
                extra: props.headerExtra,
                header: props.header,
                actions: props.headerActions,
                closeLabel: tt('modalClose'),
                onClose: showClose ? props.onClose : undefined,
              })
            : null,
          // body 是**唯一滚动容器**：内距归它、滚动条归它、滚动条贴面板右缘；
          // 内容只管按流排，不许自己定高、不许自己再开滚动条（用户 2026-10-22 定的口径）。
          h('div', { className: 'dshpc-modal__body dshpc-scroll-thin' }, props.children ?? null),
          props.footer === undefined && notice === undefined
            ? null
            : h(
                'div',
                { className: `dshpc-modal__foot${props.footerDivider === false ? ' dshpc-modal__foot--bare' : ''}` },
                notice === undefined ? null : h(FlipText, { text: notice, className: 'dshpc-modal__notice', sweep: true }),
                props.footer,
              ),
          // 锁定期间的例外控件：整窗指针锁死时，唯独这一块仍可点、可 Tab。
          // 放在 catcher 原来的位置（面板最后一个子节点），不依赖 DOM 顺序或 z-index。
          props.lockExceptions === undefined ? null : h(OverlayLockExempt, null, props.lockExceptions),
        ),
      ),
    ),
  )
}
