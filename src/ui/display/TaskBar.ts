import {
  createElement as h, useEffect, useState, useSyncExternalStore,
  type CSSProperties, type ReactNode,
} from 'react'
import { FloatingPortal, autoUpdate, flip, offset, shift, useFloating } from '@floating-ui/react'
import { Button } from '../actions/Button.js'
import { FontIcon } from './font-icon.js'
import { ListRow } from './ListRow.js'
import { PanelSurface } from '../infra/panel.js'
import { ensureComponentStyles } from '../infra/css.js'
import { useLocale } from '../infra/locale.js'
import { t } from '../../utils/i18n.js'
import { relativePast } from '../../utils/date.js'
import {
  selectTaskNotifications,
  taskNotifications,
  type TaskNotificationGroupFilter,
  type TaskNotificationRecord,
} from '../infra/task-notifications.js'
import { TASK_BAR_CSS } from './task-bar-css.js'

/** 展示形态：只图标 / 图标 + 文字长条。 */
export type TaskBarForm = 'icon' | 'pill'

export interface TaskBarProps {
  /** `icon` = 只有图标（有任务在跑时右上角带绿点）；`pill` = 图标 + 文字长条。默认 `pill`。 */
  form?: TaskBarForm
  /** 与 `selectTaskNotifications` 同口径：不传 = 默认项目全部二级；数组 = 这几个二级；`'*'` = 全站。 */
  groups?: TaskNotificationGroupFilter
  /** 换项目看；`null` = 不限项目。默认取全局默认项目。 */
  project?: string | null
  /** 连 `hidden` 任务一起列（默认不列）。 */
  includeHidden?: boolean
  /** 面板首选展开方向，默认向下；空间不够会自动翻。 */
  placement?: 'down' | 'up'
  /** 任务没带图标时用的默认图标（`库名:图标名`）。 */
  defaultIcon?: string
  /** 追加 class（只补布局）。 */
  className?: string
  style?: CSSProperties
}

/** 本栏自己的图标：任务没传图标时用它，传了但名字不合法也回落到它。 */
const DEFAULT_ICON = 'common.base:info'

/**
 * 字体图标必须写 `库名:图标名`；写错或没写都回落到默认图标。
 * （`Icon` / `FontIcon` 找不到时返回 null 并在控制台告警，回落由调用方决定，这是有意的。）
 */
function iconNameOf(task: TaskNotificationRecord, fallback: string): string {
  return task.icon?.includes(':') === true ? task.icon : fallback
}

/** 第二行小字：已运行多久。不跑定时器，重渲时才重算（与全站「无定时器」口径一致）。 */
function metaOf(task: TaskNotificationRecord): string {
  return relativePast(new Date(task.startedAt).toISOString(), Date.now())
}

/**
 * 通知任务中心的通用展示栏：未展开时是一颗按钮，展开后列出后台正在跑的任务。
 *
 * 数据面全部来自池本身（`taskNotifications` + `selectTaskNotifications`），不接 props 里的任务数组；
 * 触发器复用 `Button`、每一行复用 `ListRow`、下拉容器复用 `PanelSurface`（menu 档），
 * 本文件只排布局与那枚绿点。行右侧的按钮来自记录里的 `actions`：点它调 `runAction`，
 * 方法本体在创建这条任务的那一页，这里只拿得到文案与下标。
 *
 * ```tsx
 * h(TaskBar, { form: 'pill', groups: ['scan'] })
 * h(TaskBar, { form: 'icon' })   // 只给一个带绿点的图标
 * ```
 */
export function TaskBar(props: TaskBarProps): ReactNode {
  ensureComponentStyles('task-bar', TASK_BAR_CSS)
  // 切语言要重渲，否则计数与空态文字停在旧语种。
  useLocale()
  const {
    form = 'pill', groups, project, includeHidden, placement = 'down',
    defaultIcon = DEFAULT_ICON, className, style,
  } = props

  const [open, setOpen] = useState(false)
  const snapshot = useSyncExternalStore(
    taskNotifications.subscribe,
    taskNotifications.getSnapshot,
    taskNotifications.getServerSnapshot,
  )
  useEffect(() => { taskNotifications.connect() }, [])

  const tasks = selectTaskNotifications(snapshot, groups, {
    ...(project === undefined ? {} : { project }),
    ...(includeHidden === undefined ? {} : { includeHidden }),
  })
  const running = tasks.length

  const { refs, floatingStyles } = useFloating({
    open,
    onOpenChange: setOpen,
    placement: placement === 'up' ? 'top-end' : 'bottom-end',
    middleware: [offset(6), flip({ padding: 8 }), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
  })

  // 点外部 / Esc 关闭：与 Picker 同一口径，不引入遮罩。
  useEffect(() => {
    if (!open || typeof document === 'undefined') return
    const onPointerDown = (event: Event): void => {
      const target = event.target as Node | null
      if (target === null) return
      // 引用元素可能是 floating-ui 的 virtual element，不保证有 contains。
      const reference = refs.reference.current as { contains?: (node: Node) => boolean } | null
      const floating = refs.floating.current as { contains?: (node: Node) => boolean } | null
      if (reference?.contains?.(target) === true) return
      if (floating?.contains?.(target) === true) return
      setOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open, refs])

  const icon = h(
    'span',
    { className: 'dshpc-taskbar__iconwrap' },
    h(FontIcon, { name: defaultIcon }),
    running > 0 ? h('span', { className: 'dshpc-taskbar__dot' }) : null,
  )

  const trigger = form === 'icon'
    ? h(Button, {
        variant: 'outline',
        size: 'md',
        icon,
        'aria-label': t('taskbarLabel'),
        'aria-expanded': open,
        onClick: () => { setOpen(!open) },
      })
    : h(
        Button,
        {
          variant: 'outline',
          size: 'md',
          icon,
          'aria-expanded': open,
          onClick: () => { setOpen(!open) },
        },
        h('span', null, t('taskbarLabel')),
        running > 0
          ? h('span', { className: 'dshpc-taskbar__count' }, t('taskbarCount', { n: running }))
          : null,
      )

  function renderRow(task: TaskNotificationRecord): ReactNode {
    const action = task.actions?.[0]
    return h(
      ListRow,
      {
        key: task.id,
        bordered: true,
        actions: action === undefined
          ? undefined
          : h(
              Button,
              {
                size: 'sm',
                variant: 'ghost',
                onClick: () => { void taskNotifications.runAction(task.id, 0) },
              },
              action.label,
            ),
      },
      h(
        'div',
        { className: 'dshpc-taskbar__row' },
        // shortcut: iconSvg 暂不渲染（要过清洗才能 injected）；需要时在这里补 sanitize 分支。
        h('span', { className: 'dshpc-taskbar__row-icon' }, h(FontIcon, { name: iconNameOf(task, defaultIcon) })),
        h(
          'div',
          { className: 'dshpc-taskbar__row-main' },
          h('span', { className: 'dshpc-taskbar__row-title', title: task.title }, task.title),
          h('span', { className: 'dshpc-taskbar__row-meta' }, metaOf(task)),
        ),
      ),
    )
  }

  return h(
    'span',
    {
      ref: refs.setReference,
      className: className === undefined ? 'dshpc-taskbar' : `dshpc-taskbar ${className}`,
      style,
    },
    trigger,
    open
      ? h(
          FloatingPortal,
          null,
          h(
            'div',
            { ref: refs.setFloating, style: floatingStyles },
            h(
              PanelSurface,
              { tier: 'menu', role: 'menu', className: 'dshpc-taskbar__panel' },
              running === 0
                ? h('div', { className: 'dshpc-taskbar__empty' }, t('taskbarEmpty'))
                : h(
                    'div',
                    { className: 'dshpc-taskbar__list dshpc-scroll-thin' },
                    tasks.map(renderRow),
                  ),
            ),
          ),
        )
      : null,
  )
}
