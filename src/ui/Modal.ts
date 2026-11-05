import { createElement as h, type ReactNode } from 'react'
import { t, type Translate } from '../utils/i18n.js'
import { ensureComponentStyles } from './css.js'
import { FEEDBACK_CSS } from './feedback-css.js'
import { OverlayHead, OverlayLockedProvider, OverlayMask, useEscapeClose } from './overlay.js'
import { PanelSurface } from './panel.js'
import { FlipText } from './FlipText.js'

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
   * **锁死全部交互**（与 loading 解耦：按钮转不转圈是另一回事）。为真时整块面板 `inert` ——
   * 里面任何控件（自绘滑块、原生 input、按钮、下拉）既点不到、Tab 也进不去；遮罩 / Esc / ✕
   * 三条关闭路径同时失效；面板压一层灰 + 鼠标变禁止手势。受控项，不落内部 state：
   * 关掉重开自然回到未锁。它只改交互环境，**不碰任何子控件的 `disabled`** —— 原本禁用的解锁后照样禁用。
   *
   * shortcut: `inert` 会把整块面板从无障碍树摘掉，读屏用户此刻也读不到内容；
   * 要保住朗读得改成逐控件 disabled，等真有读屏用户反馈再升级。
   */
  locked?: boolean
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

/**
 * 模态弹窗（自绘 overlay，**不用 react-dom 的 portal**，避免多一个必需依赖）。
 *
 * 定位：它是**呈现方式**，不是内容 —— 会话预览这类功能模块要用弹窗时用它来承载（需求文档 §4）。
 */
export function Modal(props: ModalProps): ReturnType<typeof h> {
  ensureComponentStyles('feedback', FEEDBACK_CSS)
  const tt = props.translate ?? t
  // busy / locked 都是否决项：三条关闭路径一起封死（✕ 见下面 showClose）。
  // locked 比 busy 多管一层：面板整块不可交互（inert）。
  const busy = props.busy === true
  const locked = props.locked === true
  const denyClose = busy || locked
  const closeOnMask = !denyClose && props.closeOnMask !== false
  useEscapeClose(!denyClose && props.escClose !== false, denyClose ? undefined : props.onClose)
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
      props.headerActions !== undefined ||
      showClose)

  return h(
    OverlayMask,
    {
      kind: 'center',
      closeOnMask,
      onClose: denyClose ? undefined : props.onClose,
      // inert 子树不参与命中测试，鼠标落到遮罩上 —— 禁止手势得挂在遮罩这层才看得见。
      attrs: locked ? { 'data-dshpc-locked': '' } : undefined,
    },
    h(
      OverlayLockedProvider,
      { value: locked },
      // 表面（底色/描边/圆角/阴影）来自 panel.css 的 modal 档；`.dshpc-modal` 只剩家族布局，
      // 且继续作为既有类名别名存在（消费方写在它上面的覆盖不受影响）。
      h(
        PanelSurface,
        {
          tier: 'modal',
          className: `dshpc-modal${props.size ? ` dshpc-modal--${props.size}` : ''}${locked ? ' dshpc-modal--locked' : ''}${props.className !== undefined && props.className !== '' ? ` ${props.className}` : ''}`,
          // `inert` 一次封住点击 + Tab 焦点 + 输入：比逐控件塞 disabled 更彻底，也不碰控件自己的状态。
          // 写成空串而不是 true —— React 18 的类型与运行时都不认布尔 inert（会告警）。
          attrs: locked ? { inert: '' } : undefined,
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
              actions: props.headerActions,
              closeLabel: tt('modalClose'),
              onClose: showClose ? props.onClose : undefined,
            })
          : null,
        // body 是**唯一滚动容器**：内距归它、滚动条归它、滚动条贴面板右缘；
        // 内容只管按流排，不许自己定高、不许自己再开滚动条（用户 2026-10-22 定的口径）。
        h('div', { className: 'dshpc-modal__body' }, props.children ?? null),
        props.footer === undefined && notice === undefined
          ? null
          : h(
              'div',
              { className: `dshpc-modal__foot${props.footerDivider === false ? ' dshpc-modal__foot--bare' : ''}` },
              notice === undefined ? null : h(FlipText, { text: notice, className: 'dshpc-modal__notice', sweep: true }),
              props.footer,
            ),
      ),
    ),
  )
}
