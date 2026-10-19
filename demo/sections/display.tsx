import { createElement as h, useState } from 'react'
import { Button, Card, Chip, LiveText, MarqueeText, SectionHead, showToast, StripCard } from '../../dist/ui/index.js'
import { Demo } from './index.js'

export function DisplaySection(): ReturnType<typeof h> {
  const [open, setOpen] = useState(false)

  return h(
    'div',
    null,
    h(
      Demo,
      { title: 'Card（圆角 + 边框 + 短色条）', hint: '排版完全由调用方决定——真实插件的形态：标题行 + 右侧元信息 + chips 行；accent 五档见下方速览' },
      h(
        'div',
        { style: { display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '640px' } },
        // 真实形态示例（任务卡同款排版）
        h(Card, { accent: 'business' },
          h('div', { style: { display: 'flex', alignItems: 'baseline', gap: '8px' } },
            h('div', { style: { fontWeight: 600, flex: '1 1 auto', minWidth: 0, fontSize: 'var(--tdt-font-md)' } },
              '将 OpenSSH 上所有 NPM 安装迁移到 PNPM'),
            h('div', { style: { color: 'var(--tdt-fg-3)', fontSize: 'var(--tdt-font-xs)', flex: 'none' } }, '2026-10-18 创建'),
          ),
          h('div', { style: { display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', flexWrap: 'wrap' } },
            h(Chip, null, 'NAS-Docker'),
            h(Chip, null, '#npm'),
            h(Chip, null, '#pnpm'),
            h(Chip, null, '#OpenSSH'),
            h(Chip, null, '#迁移'),
          ),
        ),
        // accent 速览：单行紧凑卡，只看色条档位
        h(
          'div',
          { style: { display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' } },
          (['business', 'success', 'warning', 'danger', 'neutral'] as const).map((a) =>
            h(Card, { key: a, accent: a, style: { padding: '8px 12px' } },
              h('div', { style: { fontSize: 'var(--tdt-font-sm)', color: 'var(--tdt-fg-2)' } }, `accent="${a}"`),
            ),
          ),
        ),
      ),
    ),
    h(
      Demo,
      { title: 'StripCard（无边框 + 通高竖线）', hint: '同一个色条机制，外观是通高贴顶到底——真实插件的形态：标题 + 元信息行 + 右侧时间/操作' },
      h(
        'div',
        { style: { maxWidth: '640px', background: 'var(--tdt-surface-sunken)', borderRadius: '8px', overflow: 'hidden' } },
        h(StripCard, {
          accent: 'business',
          action: h('span', { style: { color: 'var(--tdt-fg-3)', fontSize: 'var(--tdt-font-xs)', flex: 'none' } }, '2026-10-18 开始 · 今天'),
        },
          h('div', { style: { fontWeight: 600, fontSize: 'var(--tdt-font-md)' } }, 'DAY:1 - Docker 镜像版本检查器'),
          h('div', { style: { display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', flexWrap: 'wrap' } },
            h(Chip, null, 'NAS-Docker'),
            h('span', { style: { color: 'var(--tdt-fg-3)', fontSize: 'var(--tdt-font-xs)' } },
              '计划 02:00 · 实际 02:00 · 时长 04:02 · 2.4M'),
          ),
        ),
        h(StripCard, { accent: 'success' },
          h('div', { style: { fontWeight: 600, fontSize: 'var(--tdt-font-md)' } }, '执行成功'),
          h('div', { style: { color: 'var(--tdt-fg-3)', fontSize: 'var(--tdt-font-xs)', marginTop: '4px' } }, '耗时 12s · 3 个文件变更'),
        ),
        h(StripCard, {
          accent: 'warning',
          expanded: open,
          onToggle: () => setOpen(!open),
          action: h(Button, { size: 'sm', variant: 'ghost' }, '查看会话'),
          panel: h('div', { style: { fontSize: '12px', color: 'var(--tdt-fg-3)' } }, '展开后的详情面板'),
        },
          h('div', { style: { fontWeight: 600, fontSize: 'var(--tdt-font-md)' } }, '有警告（可折叠，点右侧箭头）'),
          h('div', { style: { color: 'var(--tdt-fg-3)', fontSize: 'var(--tdt-font-xs)', marginTop: '4px' } }, '耗时 8s · 1 个警告'),
        ),
      ),
    ),
    h(
      Demo,
      {
        title: 'Chip / SectionHead / MarqueeText / LiveText',
        hint: 'chip 只有「胶囊标签」一套皮肤：宽度按文字撑开、不换行；最后一颗是长文字，若被压成 28px 竖排就是又混进了图标按钮的定宽规则',
      },
      h(
        'div',
        { style: { display: 'flex', flexDirection: 'column', gap: '12px' } },
        h(
          'div',
          { style: { display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' } },
          h(Chip, null, '#npm'),
          h(Chip, null, '#构建'),
          h(Chip, { onClick: () => showToast('点了 chip') }, '#可点'),
          h(Chip, null, '一整段比较长的标签文字，宽度应该跟着文字走'),
        ),
        h(SectionHead, { icon: '▸', title: '分区标题', right: h(Button, { size: 'sm' }, '操作') }),
        h('div', { style: { maxWidth: '200px' } },
          h(MarqueeText, { text: '这是一段很长的文字，放不下时 hover 会滚动展示全名' })),
        h(LiveText, { render: (nowMs: number) => new Date(nowMs).toLocaleTimeString() }),
      ),
    ),
  )
}
