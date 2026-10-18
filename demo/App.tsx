// 预览站骨架：顶栏（品牌 + 语言/主题）+ 分组侧栏 + 单节内容区。
// 主流组件库文档站的三段式布局；主题默认跟随系统，可手动切档（记忆在 localStorage）。
import { createElement as h, useEffect, useState } from 'react'
import { getLocale, setLocale } from '../dist/utils/index.js'
import { Picker } from '../dist/ui/index.js'
import { Sections, type SectionId } from './sections/index.js'
import { applyTheme, initialThemeMode, saveThemeMode, type ThemeMode } from './theme.js'

const NAV: { group: string; items: { id: SectionId; label: string }[] }[] = [
  { group: '指南', items: [{ id: 'design', label: '设计基础' }] },
  {
    group: '组件',
    items: [
      { id: 'buttons', label: '按钮与输入' },
      { id: 'pickers', label: '选择器' },
      { id: 'feedback', label: '弹窗与反馈' },
      { id: 'display', label: '卡片与展示' },
    ],
  },
  {
    group: '业务',
    items: [
      { id: 'explorer', label: '工作区浏览' },
      { id: 'session', label: '会话预览' },
    ],
  },
  { group: '工具', items: [{ id: 'utils', label: '通用方法' }] },
]

export function App(): ReturnType<typeof h> {
  const [locale, setLoc] = useState(getLocale())
  const [mode, setMode] = useState<ThemeMode>(initialThemeMode)
  const [active, setActive] = useState<SectionId>('design')

  // 切档：落到 body 属性 + 记忆。初始档已由 main.tsx 在挂载前 apply 过，这里接管后续变化。
  useEffect(() => {
    applyTheme(mode)
    saveThemeMode(mode)
  }, [mode])

  // 跟随系统档：系统明暗变化时实时同步
  useEffect(() => {
    if (mode !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = (): void => { applyTheme('system') }
    mq.addEventListener('change', onChange)
    return () => { mq.removeEventListener('change', onChange) }
  }, [mode])

  const navItem = (item: { id: SectionId; label: string }): ReturnType<typeof h> =>
    h(
      'button',
      {
        key: item.id,
        type: 'button',
        onClick: () => {
          setActive(item.id)
          window.scrollTo({ top: 0 })
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
    )

  return h(
    'div',
    { style: { minHeight: '100%' } },
    // ── 顶栏 ──────────────────────────────────────────────────────────
    h(
      'header',
      {
        style: {
          position: 'sticky', top: 0, zIndex: 20, height: '52px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 20px', borderBottom: '1px solid var(--tdt-border-faint)',
          background: 'var(--page-bg)',
        },
      },
      h(
        'div',
        { style: { display: 'flex', alignItems: 'baseline', gap: '10px' } },
        h('span', { style: { fontWeight: 700, fontSize: '15px' } }, 'dsh-plugin-core'),
        h('span', { style: { fontSize: '12px', color: 'var(--tdt-fg-3)' } }, '组件预览 · 效果即真实'),
      ),
      h(
        'div',
        { style: { display: 'flex', gap: '8px', alignItems: 'center' } },
        h(Picker, {
          options: [
            { value: 'zh', label: '中文' },
            { value: 'en', label: 'English' },
          ],
          value: locale,
          onChange: (v) => {
            const next = v as 'zh' | 'en'
            setLocale(next)
            setLoc(next)
          },
          ariaLabel: '语言',
        }),
        h(Picker, {
          options: [
            { value: 'system', label: '跟随系统' },
            { value: 'light', label: '亮色' },
            { value: 'dark', label: '暗色' },
          ],
          value: mode,
          onChange: (v) => setMode(v as ThemeMode),
          ariaLabel: '外观',
        }),
      ),
    ),
    // ── 主体：侧栏 + 内容 ─────────────────────────────────────────────
    h(
      'div',
      { style: { display: 'flex', alignItems: 'flex-start' } },
      h(
        'aside',
        {
          style: {
            width: '208px', flex: 'none', position: 'sticky', top: '52px',
            height: 'calc(100vh - 52px)', overflowY: 'auto', padding: '16px 10px',
            borderRight: '1px solid var(--tdt-border-faint)',
            background: 'var(--page-bg)',
          },
        },
        NAV.map((group) =>
          h(
            'div',
            { key: group.group, style: { marginBottom: '14px' } },
            h(
              'div',
              { style: { fontSize: '11px', color: 'var(--tdt-fg-4)', padding: '0 10px 6px' } },
              group.group,
            ),
            group.items.map(navItem),
          ),
        ),
      ),
      h(
        'main',
        { style: { flex: 1, minWidth: 0, padding: '8px 28px 80px' } },
        h(Sections, { active, onNavigate: setActive }),
      ),
    ),
  )
}
