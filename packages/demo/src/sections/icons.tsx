import { createElement as h, useEffect, useMemo, useState, type ReactNode } from 'react'
import { Input } from '../../../../dist/ui/index.js'
import {
  ICON_FONTS,
  Icon,
  loadIconFont,
  type IconFontId,
  type ParsedIconFont,
} from '../../../../dist/ui/display/Icon.js'
import { Official } from '../../../../dist/ui/official.js'
import { t } from '../i18n.js'

/**
 * 图标目录：官方 primitives 与我们各套字体图标同页。
 *
 * 两边都**不写死清单**：
 *  - 官方：从 `Official` 命名空间运行时枚举 `Icon*`，宿主升级自动多出来；
 *  - 字体：fetch 在线 CSS 原文解析 glyph 类名（`loadIconFont`），平台加图标/换链接刷新即见。
 */

interface OfficialIcon {
  name: string
  Comp: (props: { size?: number }) => ReturnType<typeof h>
}

const OFFICIAL_ICONS: OfficialIcon[] = Object.entries(Official as Record<string, unknown>)
  .filter(([name, value]) => /^Icon[A-Z]/.test(name) && typeof value === 'function')
  .map(([name, value]) => ({ name, Comp: value as OfficialIcon['Comp'] }))
  .sort((a, b) => a.name.localeCompare(b.name))

type FontState = ParsedIconFont | { error: string }

const CELL: Record<string, string | number> = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '6px',
  padding: '10px 6px',
  minHeight: '64px',
  border: '1px solid var(--dshpc-border)',
  borderRadius: 'var(--dshpc-radius-sm)',
  background: 'transparent',
  color: 'var(--dshpc-fg)',
  cursor: 'pointer',
  font: 'inherit',
}

const GRID: Record<string, string | number> = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(148px, 1fr))',
  gap: '6px',
  marginTop: '10px',
}

/** 复制出去的用法：官方写组件名、字体写 `库名:图标名`，同一个 Icon 组件。 */
const usage = (name: string): string =>
  `import { Icon } from 'dsh-plugin-core/ui/icons'\n<Icon name="${name}" />`

const NAME: Record<string, string | number> = {
  fontSize: '11px',
  color: 'var(--dshpc-fg-3)',
  wordBreak: 'break-all',
  textAlign: 'center',
}

function Section(props: { id: string; title: string; meta: ReactNode; children?: ReactNode }): ReturnType<typeof h> {
  return h(
    'section',
    { id: `icons-${props.id}`, style: { marginTop: '26px' } },
    h(
      'div',
      { style: { display: 'flex', alignItems: 'baseline', gap: '10px', flexWrap: 'wrap' } },
      h('h3', { style: { margin: 0, fontSize: '15px' } }, props.title),
      h('span', { style: { fontSize: '11px', color: 'var(--dshpc-fg-4)' } }, props.meta),
    ),
    props.children,
  )
}

function Cell(props: { glyph: ReactNode; name: string; copied: boolean; onPick: () => void }): ReturnType<typeof h> {
  return h(
    'button',
    {
      type: 'button',
      style: { ...CELL, borderColor: props.copied ? 'var(--dshpc-business)' : 'var(--dshpc-border)' },
      title: props.copied ? t('icCopied') : props.name,
      onClick: props.onPick,
    },
    props.glyph,
    h('span', { style: NAME }, props.copied ? t('icCopied') : props.name),
  )
}

export function IconsPage(): ReturnType<typeof h> {
  const [query, setQuery] = useState('')
  const [fonts, setFonts] = useState<Partial<Record<IconFontId, FontState>>>({})
  const [copied, setCopied] = useState('')
  const fontIds = useMemo(() => Object.keys(ICON_FONTS) as IconFontId[], [])

  // 每套库各拉一次在线 CSS；失败只报在该库那一节，不拖垮整页。
  useEffect(() => {
    let alive = true
    for (const id of fontIds) {
      loadIconFont(id).then(
        (parsed) => { if (alive) setFonts((prev) => ({ ...prev, [id]: parsed })) },
        (err: unknown) => { if (alive) setFonts((prev) => ({ ...prev, [id]: { error: String(err) } })) },
      )
    }
    return () => { alive = false }
  }, [fontIds])

  const pick = (text: string): void => {
    if (navigator.clipboard === undefined) return
    void navigator.clipboard.writeText(text).then(() => setCopied(text), () => setCopied(''))
  }

  const q = query.trim().toLowerCase()
  const match = (name: string): boolean => q === '' || name.toLowerCase().includes(q)
  const official = OFFICIAL_ICONS.filter((item) => match(item.name))

  return h(
    'div',
    null,
    h('p', { style: { margin: '0 0 12px', fontSize: '13px', lineHeight: '1.8', color: 'var(--dshpc-fg-3)' } }, t('icNote')),
    h(Input, { value: query, onChange: setQuery, placeholder: t('icSearch'), size: 'lg' }),

    h(
      Section,
      {
        id: 'official',
        title: t('icOfficial'),
        meta: `${official.length} / ${OFFICIAL_ICONS.length} · ${t('icOfficialHint')}`,
      },
      official.length === 0
        ? h('div', { style: { ...NAME, marginTop: '10px' } }, t('icEmpty'))
        : h(
          'div',
          { style: GRID },
          ...official.map((item) =>
            h(Cell, {
              key: item.name,
              name: item.name,
              copied: copied === usage(item.name),
              glyph: h(item.Comp, { size: 40 }),
              onPick: () => pick(usage(item.name)),
            }),
          ),
        ),
    ),

    ...fontIds.map((id) => {
      const face = ICON_FONTS[id]
      const state = fonts[id]
      const names = state !== undefined && 'names' in state ? state.names.filter(match) : []
      const total = state !== undefined && 'names' in state ? state.names.length : 0
      return h(
        Section,
        {
          key: id,
          id,
          title: id,
          meta: state === undefined
            ? t('icLoading')
            : 'error' in state
              ? `${t('icFailed')} ${state.error}`
              : `${names.length} / ${total} · ${face.url}`,
        },
        state !== undefined && 'error' in state
          ? null
          : names.length === 0
            ? h('div', { style: { ...NAME, marginTop: '10px' } }, state === undefined ? t('icLoading') : t('icEmpty'))
            : h(
              'div',
              { style: GRID },
              ...names.map((name) =>
                h(Cell, {
                  key: name,
                  name,
                  copied: copied === usage(`${id}:${name}`),
                  glyph: h(Icon, { name: `${id}:${name}`, size: 40 }),
                  onPick: () => pick(usage(`${id}:${name}`)),
                }),
              ),
            ),
      )
    }),
  )
}
