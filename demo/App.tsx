import { createElement as h, useState } from 'react'
import { getLocale, setLocale } from '../dist/utils/index.js'
import { Sections, type SectionId } from './sections/index.js'

const NAV: { id: SectionId; label: string }[] = [
  { id: 'design', label: '设计基础' },
  { id: 'buttons', label: '按钮与输入' },
  { id: 'pickers', label: '选择器' },
  { id: 'feedback', label: '弹窗与反馈' },
  { id: 'display', label: '卡片与展示' },
  { id: 'utils', label: '通用方法' },
  { id: 'explorer', label: '工作区浏览' },
  { id: 'session', label: '会话预览' },
]

export function App(): ReturnType<typeof h> {
  const [locale, setLoc] = useState(getLocale())
  const [dark, setDark] = useState(() => document.body.hasAttribute('data-ds-dark-theme'))
  const [active, setActive] = useState<SectionId>('design')

  const toggleLocale = (): void => {
    const next = getLocale() === 'zh' ? 'en' : 'zh'
    setLocale(next)
    setLoc(next)
  }

  const toggleDark = (): void => {
    const next = !dark
    setDark(next)
    if (next) document.body.setAttribute('data-ds-dark-theme', '')
    else document.body.removeAttribute('data-ds-dark-theme')
  }

  return h(
    'div',
    { style: { display: 'flex', minHeight: '100%' } },
    // 左侧分类导航（主流组件库文档站模式）
    h(
      'aside',
      {
        style: {
          width: '208px', flex: 'none', position: 'sticky', top: 0, height: '100vh',
          overflowY: 'auto', padding: '16px 10px',
          borderRight: '1px solid var(--tdt-border-faint)',
          background: 'var(--tdt-surface-1)',
        },
      },
      h('div', { style: { fontWeight: 600, padding: '0 8px 12px', fontSize: '15px' } }, 'dsh-plugin-core'),
      h(
        'div',
        { style: { fontSize: '11px', color: 'var(--tdt-fg-4)', padding: '0 8px 10px' } },
        '组件预览 · 效果即真实',
      ),
      NAV.map((item) =>
        h(
          'button',
          {
            key: item.id,
            type: 'button',
            onClick: () => {
              setActive(item.id)
              document.getElementById(`sec-${item.id}`)?.scrollIntoView({ block: 'start' })
            },
            style: {
              display: 'block', width: '100%', textAlign: 'left', border: 'none',
              background: active === item.id ? 'var(--tdt-open-bg)' : 'transparent',
              color: active === item.id ? 'var(--tdt-business)' : 'var(--tdt-fg)',
              padding: '7px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px',
              marginBottom: '2px',
            },
          },
          item.label,
        ),
      ),
    ),
    // 主内容
    h(
      'main',
      { style: { flex: 1, minWidth: 0, padding: '20px 28px 80px' } },
      // 右上角控制条
      h(
        'div',
        {
          style: {
            display: 'flex', gap: '8px', justifyContent: 'flex-end',
            position: 'sticky', top: 0, zIndex: 10, paddingBottom: '12px',
            background: 'var(--page-bg)',
          },
        },
        h(
          'button',
          {
            type: 'button', onClick: toggleLocale,
            style: pill(active === 'x'),
          },
          locale === 'zh' ? '中 / EN' : 'EN / 中',
        ),
        h(
          'button',
          { type: 'button', onClick: toggleDark, style: pill(false) },
          dark ? '☀ 亮色' : '☾ 暗色',
        ),
      ),
      h(Sections, { active, onNavigate: setActive }),
    ),
  )
}

function pill(_active: boolean): Record<string, string | number> {
  return {
    padding: '5px 12px', borderRadius: '999px', cursor: 'pointer', fontSize: '12px',
    border: '1px solid var(--tdt-border)', background: 'var(--tdt-surface-1)',
    color: 'var(--tdt-fg)',
  }
}
