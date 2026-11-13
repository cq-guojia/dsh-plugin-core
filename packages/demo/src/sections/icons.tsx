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
import { Example } from '../doc.js'
import { t } from '../i18n.js'

/**
 * 图标目录：官方 primitives 与我们各套字体图标同页。
 *
 * 两边都**不写死清单**：
 *  - 官方：从 `Official` 命名空间运行时枚举 `Icon*`，宿主升级自动多出来；
 *  - 字体：fetch 在线 CSS 原文解析 glyph 类名（`loadIconFont`），平台加图标/换链接刷新即见。
 *
 * 排布照 Token 色板：一套库一个块，块内一格一个正方形图标卡（图标 + 全名，名字就在框里）。
 * 点格子复制的是**名字本身**（`common.logo:wechat` / 官方组件名），提示 1.5s 后自动还原；
 * 完整用法在页面最后。
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

/** 一格一个图标：整格是正方形，图标与名字都在框内，长名字省略不撑破。 */
const GRID: Record<string, string | number> = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '10px',
}

const CELL: Record<string, string | number> = {
  width: '100px',
  height: '100px',
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '6px',
  padding: '8px',
  border: '1px solid var(--dshpc-border-faint)',
  borderRadius: 'var(--dshpc-radius-sm)',
  background: 'transparent',
  color: 'var(--dshpc-fg)',
  cursor: 'pointer',
  font: 'inherit',
  textAlign: 'center',
}

const GLYPH: Record<string, string | number> = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  lineHeight: 1,
}

/** 格子下面那一行灰字：就是复制出去的全名；复制成功换文案，一会儿自动还原。 */
const NAME: Record<string, string | number> = {
  width: '100%',
  fontSize: '10px',
  color: 'var(--dshpc-fg-4)',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
}

/** 空态 / 加载文案。 */
const HINT: Record<string, string | number> = {
  fontSize: '11px',
  color: 'var(--dshpc-fg-3)',
}

const USAGE_CODE = `import { Icon } from 'dsh-plugin-core/ui/icons'

// 字体图标：库名不可省（库名 = ICON_FONTS 的 key）
<Icon name="common.base:jia" />
<Icon name="common.logo:github" size={20} />

// 官方 primitives 图标：没有冒号，直接写组件名
<Icon name="IconWrapLinesOutlineRegular" />

// 多色库：深色下自动改用「名字-dark」字形（库里没有就仍用这个名字）
<Icon name="common.logo.color:github" size={24} />`

function Cell(props: {
  glyph: ReactNode
  /** 格里显示的名字（字体库不带前缀 —— 块标题已经是库名，每格再挂一遍纯噪音）。 */
  label: string
  /** 复制出去的全名（字体库是 `库名:图标名`）。 */
  full: string
  copied: boolean
  onPick: () => void
}): ReturnType<typeof h> {
  return h(
    'button',
    {
      type: 'button',
      style: props.copied ? { ...CELL, borderColor: 'var(--dshpc-business)' } : CELL,
      title: props.copied ? t('icCopied') : props.full,
      onClick: props.onPick,
    },
    h('span', { style: GLYPH }, props.glyph),
    h(
      'span',
      { style: props.copied ? { ...NAME, color: 'var(--dshpc-business)' } : NAME },
      props.copied ? t('icCopied') : props.label,
    ),
  )
}

export function IconsPage(): ReturnType<typeof h> {
  const [query, setQuery] = useState('')
  const [fonts, setFonts] = useState<Partial<Record<IconFontId, FontState>>>({})
  const [copied, setCopied] = useState('')
  const fontIds = useMemo(() => Object.keys(ICON_FONTS) as IconFontId[], [])

  // 每套库各拉一次在线 CSS；失败只报在该库那一块，不拖垮整页。
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

  const pick = (name: string): void => {
    if (navigator.clipboard === undefined) return
    void navigator.clipboard.writeText(name).then(() => setCopied(name), () => setCopied(''))
  }

  // 「已复制」过一会儿自己还原，不必再点别处。
  useEffect(() => {
    if (copied === '') return
    const timer = window.setTimeout(() => { setCopied('') }, 1500)
    return () => { window.clearTimeout(timer) }
  }, [copied])

  const q = query.trim().toLowerCase()
  const match = (name: string): boolean => q === '' || name.toLowerCase().includes(q)
  const official = OFFICIAL_ICONS.filter((item) => match(item.name))

  return h(
    'div',
    null,
    h('p', { style: { margin: '0 0 12px', fontSize: '13px', lineHeight: '1.8', color: 'var(--dshpc-fg-3)' } }, t('icNote')),
    h(Input, { value: query, onChange: setQuery, placeholder: t('icSearch'), size: 'lg' }),

    h(
      'div',
      { style: { marginTop: '14px' } },
      h(
        Example,
        {
          title: t('icOfficial'),
          hint: `${official.length} / ${OFFICIAL_ICONS.length} · ${t('icOfficialHint')}`,
        },
        official.length === 0
          ? h('div', { style: HINT }, t('icEmpty'))
          : h(
            'div',
            { style: GRID },
            ...official.map((item) =>
              h(Cell, {
                key: item.name,
                label: item.name,
                full: item.name,
                copied: copied === item.name,
                glyph: h(item.Comp, { size: 33 }),
                onPick: () => pick(item.name),
              }),
            ),
          ),
      ),
    ),

    ...fontIds.map((id) => {
      const face = ICON_FONTS[id]
      const state = fonts[id]
      const names = state !== undefined && 'names' in state ? state.names.filter(match) : []
      const total = state !== undefined && 'names' in state ? state.names.length : 0
      return h(
        'div',
        { key: id, style: { marginTop: '10px' } },
        h(
          Example,
          {
            title: id,
            hint: state === undefined
              ? t('icLoading')
              : 'error' in state
                ? `${t('icFailed')} ${state.error}`
                : `${names.length} / ${total} · ${'color' in face ? t('icColorLib') : face.url}`,
          },
          state !== undefined && 'error' in state
            ? null
            : names.length === 0
              ? h('div', { style: HINT }, state === undefined ? t('icLoading') : t('icEmpty'))
              : h(
                'div',
                { style: GRID },
                ...names.map((name) =>
                  h(Cell, {
                    key: name,
                    label: name,
                    full: `${id}:${name}`,
                    copied: copied === `${id}:${name}`,
                    glyph: h(Icon, { name: `${id}:${name}`, size: 33 }),
                    onPick: () => pick(`${id}:${name}`),
                  }),
                ),
              ),
        ),
      )
    }),

    h(
      'div',
      { style: { marginTop: '10px' } },
      h(Example, { title: t('icUsageTitle'), hint: t('icUsageHint'), code: USAGE_CODE }, null),
    ),
  )
}
