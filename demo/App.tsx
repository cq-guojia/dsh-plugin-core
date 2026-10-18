// 预览站骨架：顶栏（品牌 + 语言/主题）+ 分组侧栏 + 单节内容区。
// 主流组件库文档站的三段式布局；主题默认跟随系统，可手动切档（记忆在 localStorage）。
import { createElement as h, useEffect, useRef, useState } from 'react'
import { getLocale, setLocale } from '../dist/utils/index.js'
import { Picker, Segmented } from '../dist/ui/index.js'
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

/**
 * 诊断面板（临时调参工具）：自带参照控件，直接打印浏览器「实际算出来」的样式值。
 * 用途：用户反馈「控件没变化」时，用面板里的数字区分两种情况——
 * ① 数字 = 预期值但观感不对 ⇒ 皮肤/对比度问题，改 CSS 值；
 * ② 数字 ≠ 预期值 ⇒ CSS 没生效（注入/级联/缓存问题），查环境。
 */
function Diagnostics(): ReturnType<typeof h> {
  const [open, setOpen] = useState(true)
  const [info, setInfo] = useState('读取中…')
  const segWrap = useRef<HTMLDivElement>(null)
  const weekWrap = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // 延一帧：等本帧样式注入与布局完成后再取 computed style
    requestAnimationFrame(() => {
      const seg = segWrap.current?.querySelector('.dsh-tdt-seg') as HTMLElement | null
      if (!seg) { setInfo('未找到参照控件'); return }
      const cs = getComputedStyle(seg)
      // ⚠️ demo 的 kit prefix 是 'dsh'，token 实际叫 --dsh-*（--tdt- 已被运行时替换）
      const lines = [
        `className = ${seg.className}`,
        `--seg-track(元素) = ${cs.getPropertyValue('--seg-track').trim() || '(空)'}`,
        `--dsh-hover(元素) = ${cs.getPropertyValue('--dsh-hover').trim() || '(空)'}`,
        `--dsh-radius-md(元素) = ${cs.getPropertyValue('--dsh-radius-md').trim() || '(空)'}`,
        `--dsh-radius-sm(元素) = ${cs.getPropertyValue('--dsh-radius-sm').trim() || '(空)'}`,
        `--dsw-radius-md(元素) = ${cs.getPropertyValue('--dsw-radius-md').trim() || '(空)'}`,
        `color-mix 支持 = ${CSS.supports('background', 'color-mix(in srgb,#fff 14%,transparent)') ? '是' : '否'}`,
        `基线：bg=${cs.backgroundColor} radius=${cs.borderTopLeftRadius}`,
      ]
      // 内联实验：inline 优先级最高。内联 var() 生效 ⇒ 之前是级联覆盖；仍失效 ⇒ var 链断。
      seg.style.background = 'var(--seg-track)'
      seg.style.borderRadius = 'var(--dsh-radius-md)'
      requestAnimationFrame(() => {
        const cs2 = getComputedStyle(seg)
        lines.push(
          `内联 var(--seg-track) ⇒ bg=${cs2.backgroundColor}`,
          `内联 var(--dsh-radius-md) ⇒ radius=${cs2.borderTopLeftRadius}`,
        )
        setInfo(lines.join('\n'))
        seg.style.background = ''
        seg.style.borderRadius = ''
      })
    })
  }, [])

  return h(
    'div',
    {
      style: {
        position: 'fixed', right: '16px', bottom: '16px', zIndex: 60, maxWidth: '340px',
        background: 'var(--tdt-surface-1)', border: '1px solid var(--tdt-border)',
        borderRadius: '8px', padding: '10px 12px', boxShadow: 'var(--tdt-shadow-2)', fontSize: '12px',
      },
    },
    h(
      'div',
      {
        onClick: () => { setOpen(!open) },
        style: { cursor: 'pointer', fontWeight: 600, userSelect: 'none' as never },
      },
      open ? '▾ 诊断（点我收起）' : '▸ 诊断',
    ),
    open
      ? h(
          'div',
          null,
          h('pre', {
            style: {
              margin: '6px 0 0', fontFamily: 'var(--tdt-font-mono)', fontSize: '11px',
              whiteSpace: 'pre-line', color: 'var(--tdt-fg-2)',
            },
          }, info),
          h('div', { ref: segWrap, style: { marginTop: '8px' } },
            h(Segmented, {
              variant: 'inset',
              value: 'week',
              onChange: () => {},
              items: [{ value: 'day', label: '日' }, { value: 'week', label: '周' }],
            })),
          h('div', { ref: weekWrap, style: { marginTop: '8px' } },
            h(Segmented, {
              multiple: true,
              className: 'dsh-tdt-seg--weekday',
              value: ['1', '2', '3'],
              onChange: () => {},
              items: [
                { value: '1', label: '一' }, { value: '2', label: '二' }, { value: '3', label: '三' },
                { value: '4', label: '四' }, { value: '5', label: '五' },
              ],
            })),
        )
      : null,
  )
}

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
        h(
          'span',
          { style: { fontSize: '11px', color: 'var(--tdt-fg-4)', fontFamily: 'var(--tdt-font-mono)' } },
          (window as unknown as { __DEMO_VERSION__?: string }).__DEMO_VERSION__ ?? '',
        ),
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
    // ── 诊断面板（临时）────────────────────────────────────────────────
    h(Diagnostics, null),
  )
}
