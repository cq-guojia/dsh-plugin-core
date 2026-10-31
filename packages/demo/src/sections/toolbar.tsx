import { createElement as h, useState } from 'react'
import { QuickToolbar, Segmented } from '../../../../dist/ui/index.js'
import {
  IconCopyOutlineRegular,
  IconSearchOutlineRegular,
  IconSparkleRegular,
} from '@deepseek-ai/dsh-client-ui-primitives'
import { DocApi, DocProse, Example } from '../doc.js'

const ANCHOR_ID = 'dshpc-demo-quick-toolbar-anchor'

const CODE_TOOLBAR = `import { QuickToolbar } from 'dsh-plugin-core/ui'

h(QuickToolbar, {
  anchorId: 'my-content',          // 不传 = 跟随屏幕右缘
  items: [
    { id: 'search', icon: <SearchIcon />, label: '搜索', onClick: search },
    { id: 'copy', icon: <CopyIcon />, label: '复制' },
  ],
  onAction: (id) => console.log(id),
  backToTop: { threshold: 320 },   // 默认即是 320；false 可关掉
})`

/**
 * 快捷工具栏：右侧浮动的实时演示。
 * 渲染在本页内、`position: fixed`；滚动容器自动取最近的 `<main>`。
 * 可切换「跟随控件 / 跟随窗口」，直观看到横向位置的两种来源。
 */
export function ToolbarPage(): ReturnType<typeof h> {
  const [mode, setMode] = useState<'box' | 'window'>('box')
  const [last, setLast] = useState('—')

  return h(
    'div',
    null,
    h(DocProse, { id: 'quick-toolbar' }),
    h(
      Example,
      {
        title: 'QuickToolbar（右侧浮动）',
        hint: '纵向恒贴屏幕底边；切换锚点可看横向位置变化。向下滚动，回顶部按钮会出现。',
        code: CODE_TOOLBAR,
      },
      h(
        'div',
        { style: { display: 'flex', flexDirection: 'column', gap: '14px' } },
        h(Segmented<'box' | 'window'>, {
          items: [
            { value: 'box', label: '跟随控件' },
            { value: 'window', label: '跟随窗口' },
          ],
          value: mode,
          onChange: setMode,
          label: '横向锚点',
        }),
        h(
          'div',
          {
            id: ANCHOR_ID,
            style: {
              width: 'min(560px, 100%)', padding: '16px 18px', boxSizing: 'border-box',
              border: '1px dashed var(--dshpc-border)', borderRadius: '8px',
              background: 'var(--dshpc-surface-sunken)',
            },
          },
          h('div', { style: { fontWeight: 600, fontSize: '13px' } }, '锚定控件'),
          h(
            'div',
            { style: { marginTop: '6px', color: 'var(--dshpc-fg-3)', fontSize: '12px', lineHeight: '1.8' } },
            '工具栏会贴在这个框的右缘外侧；窗口窄到放不下时自动退回屏幕右缘。',
          ),
        ),
        h(
          'div',
          {
            style: {
              height: '55vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1px dashed var(--dshpc-border)', borderRadius: '8px',
              color: 'var(--dshpc-fg-4)', fontSize: '13px',
            },
          },
          '向下滚动，回顶部按钮会出现',
        ),
        h('div', { style: { color: 'var(--dshpc-fg-3)', fontSize: '12px' } }, `最近一次点击：${last}`),
      ),
    ),
    h(DocApi, { id: 'quick-toolbar' }),
    h(QuickToolbar, {
      anchorId: mode === 'box' ? ANCHOR_ID : undefined,
      onAction: (id) => setLast(id),
      items: [
        { id: 'search', icon: h(IconSearchOutlineRegular, { size: 18 }), label: '搜索' },
        { id: 'copy', icon: h(IconCopyOutlineRegular, { size: 18 }), label: '复制' },
        {
          id: 'sparkle',
          icon: h(IconSparkleRegular, { size: 18 }),
          label: 'AI 助手',
          color: 'var(--dshpc-business)',
          fgColor: '#fff',
        },
      ],
    }),
  )
}
