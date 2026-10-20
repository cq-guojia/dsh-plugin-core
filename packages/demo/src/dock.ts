// demo 的共享分栏：控制器 + 三个面板声明。
//
// 用法示范的就是规范形态 —— **结构写在页面里**（`<DockPanel` 声明），
// `open()/close()` 只负责显隐，不把内容塞进调用里。
import { createElement as h } from 'react'
import {
  Chip,
  DockPanel,
  createPanelDock,
  type DockPanelProps,
} from '../../../dist/ui/index.js'
import {
  IconClockOutlineRegular,
  IconSparkleRegular,
} from '@deepseek-ai/dsh-client-ui-primitives'
import { t } from './i18n.js'

export const demoDock = createPanelDock({ maxPanels: 3 })

function Body(props: { id: string }): ReturnType<typeof h> {
  return h(
    'div',
    { style: { padding: '12px 14px', fontSize: '13px', lineHeight: '1.9' } },
    h('div', { style: { fontWeight: 600 } }, props.id),
    h('div', { style: { color: 'var(--dshpc-fg-3)' } }, t('dockPanelBody')),
  )
}

/** 自定义头部：两行、带选择器，高度由调用方自己定（库不加任何内边距/边框）。 */
function CustomHead(): ReturnType<typeof h> {
  return h(
    'div',
    { style: { padding: '10px 12px', borderBottom: '1px solid var(--dshpc-border-faint)' } },
    h(
      'div',
      { style: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600 } },
      h(IconSparkleRegular, null),
      t('dockCustomHeadTitle'),
    ),
    h(
      'div',
      { style: { marginTop: '6px', fontSize: '12px', color: 'var(--dshpc-fg-3)' } },
      t('dockCustomHeadHint'),
    ),
  )
}

const PANELS: DockPanelProps[] = [
  {
    id: 'A',
    title: t('dockPanelA'),
    icon: h(
      'span',
      { style: { display: 'inline-flex', gap: '4px' } },
      h(IconSparkleRegular, null),
      h(IconClockOutlineRegular, null),
    ),
    // 标题右侧：任意内容，不只按钮。
    extra: h(Chip, { tone: 'business', size: 'sm' }, t('dockPanelATag')),
    minWidth: 300,
    maxWidth: 620,
  },
  {
    id: 'B',
    header: h(CustomHead, null),
    minWidth: 320,
  },
  {
    id: 'C',
    // 不要头部：关钮自动浮到右上角。
    header: null,
    ariaLabel: t('dockPanelC'),
    minWidth: 280,
  },
]

/** 组装成 `<PanelDock>` 的子元素（页面级只调这一处）。 */
export function demoPanels(): ReturnType<typeof h>[] {
  return PANELS.map((pane) =>
    h(DockPanel, { ...pane, key: pane.id }, h(Body, { id: pane.id })),
  )
}
