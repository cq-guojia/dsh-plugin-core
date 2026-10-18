import { createElement as h, useState } from 'react'
import { Button, Card, Chip, LiveText, MarqueeText, SectionHead, StripCard } from '../../dist/ui/index.js'
import { Demo } from './index.js'

export function DisplaySection(): ReturnType<typeof h> {
  const [open, setOpen] = useState(false)

  return h(
    'div',
    null,
    h(
      Demo,
      { title: 'Card（圆角 + 边框 + 短色条）', hint: 'accent 五档或任意色值；色条上下留距、跟着高度自适应' },
      h(
        'div',
        { style: { display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '520px' } },
        (['business', 'success', 'warning', 'danger', 'neutral'] as const).map((a) =>
          h(Card, { key: a, accent: a },
            h('div', { style: { fontWeight: 600, marginBottom: '4px' } }, `accent="${a}"`),
            h('div', { style: { color: 'var(--tdt-fg-3)', fontSize: '12px' } },
              '标题 + 标签 + 元信息的排版完全由调用方决定。'),
          ),
        ),
      ),
    ),
    h(
      Demo,
      { title: 'StripCard（无边框 + 通高竖线）', hint: '同一个色条机制，外观是通高贴顶到底' },
      h(
        'div',
        { style: { maxWidth: '520px', background: 'var(--tdt-surface-sunken)', borderRadius: '8px', overflow: 'hidden' } },
        h(StripCard, { accent: 'success' },
          h('div', { style: { fontWeight: 600 } }, '执行成功'),
          h('div', { style: { color: 'var(--tdt-fg-3)', fontSize: '12px' } }, '耗时 12s · 3 个文件变更'),
        ),
        h(StripCard, { accent: 'warning' },
          h('div', { style: { fontWeight: 600 } }, '有警告'),
          h('div', { style: { color: 'var(--tdt-fg-3)', fontSize: '12px' } }, '耗时 8s · 1 个警告'),
        ),
        h(StripCard, {
          accent: 'business',
          expanded: open,
          onToggle: () => setOpen(!open),
          action: h(Button, { size: 'sm', variant: 'ghost' }, '查看会话'),
          panel: h('div', { style: { fontSize: '12px', color: 'var(--tdt-fg-3)' } }, '展开后的详情面板'),
        },
          h('div', { style: { fontWeight: 600 } }, '可折叠（点右侧箭头）'),
          h('div', { style: { color: 'var(--tdt-fg-3)', fontSize: '12px' } }, '右上角放操作、右侧放折叠箭头'),
        ),
      ),
    ),
    h(
      Demo,
      { title: 'Chip / SectionHead / MarqueeText / LiveText' },
      h(
        'div',
        { style: { display: 'flex', flexDirection: 'column', gap: '12px' } },
        h(
          'div',
          { style: { display: 'flex', gap: '6px', flexWrap: 'wrap' } },
          h(Chip, null, '#npm'),
          h(Chip, null, '#构建'),
          h(Chip, { onClick: () => showToast('点了 chip') }, '#可点'),
        ),
        h(SectionHead, { icon: '▸', title: '分区标题', right: h(Button, { size: 'sm' }, '操作') }),
        h('div', { style: { maxWidth: '200px' } },
          h(MarqueeText, { text: '这是一段很长的文字，放不下时 hover 会滚动展示全名' })),
        h(LiveText, { render: (nowMs: number) => new Date(nowMs).toLocaleTimeString() }),
      ),
    ),
  )
}
