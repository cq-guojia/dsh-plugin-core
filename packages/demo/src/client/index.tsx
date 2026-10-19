/**
 * demo 插件的 client 侧：注册「组件预览」整页 + 设置页入口卡片。
 *
 * ⚠️ 红线（兄弟仓血泪，见 dsh-task-dispatch-table/src/client/index.ts:6）：
 *  client 侧**顶层不得导出 inject**，等待一律写 ctx.inject([...], cb) 内，否则 entry 一直 pending、
 *  卡死整个 dsh 启动。本文件只导出 apply。
 *
 * 身份隔离：本插件领一套自己的 kit（prefix 'dshpc'）——**不能占用 --tdt-***，宿主里别的插件
 * 也在用这个前缀；demo 展示代码里的内联 --tdt-* 由 token-alias 那层接到 --dshpc-* 上。
 */
import { createElement as h, useState } from 'react'
// ⚠️ 从**仓库内 dsh-plugin-core 的构建产物**引入（不是源码），构建时打进本包：
//    这样本包自包含（发布不依赖 core 先发版），且预览的就是当前这份代码。
import { createStyleKit } from '../../../../dist/design/index.js'
import { ensureControls, setStyleKit } from '../../../../dist/ui/index.js'
import { ALL_SECTIONS, Sections, type SectionId } from '../sections/index.js'
import { t } from '../i18n.js'
import { ALIAS_TOKEN_NAMES } from './token-alias.js'

/** 侧栏条目 id / 主面板 key / 设置命名空间：三者必须逐字一致，且 = package.json 的 name。 */
const PANEL_ID = 'dsh-plugin-core-demo'
/** 本插件的变量前缀：与 --tdt-*（其他插件在用）隔离。 */
const PREFIX = 'dshpc'

/** --tdt-* → --dshpc-* 别名层：让 demo 展示代码的内联样式零改动复用。 */
function aliasCss(): string {
  const decls = ALIAS_TOKEN_NAMES.map((n) => `--tdt-${n}:var(--${PREFIX}-${n})`)
  return `body{${decls.join(';')}}`
}

/** 整页：左侧目录 + 右侧当前小节（套用 demo 的展示内容）。 */
function DemoPage(): ReturnType<typeof h> {
  const [active, setActive] = useState<SectionId>(ALL_SECTIONS[0].id)
  return h(
    'div',
    { style: { display: 'flex', alignItems: 'flex-start', height: '100%', minHeight: 0 } },
    h(
      'aside',
      {
        style: {
          width: '180px', flex: 'none', padding: '14px 10px', overflowY: 'auto',
          borderRight: '1px solid var(--dshpc-border-faint)', fontFamily: 'var(--dshpc-font-md)',
        },
      },
      ALL_SECTIONS.map((s) =>
        h(
          'button',
          {
            key: s.id,
            type: 'button',
            onClick: () => { setActive(s.id) },
            style: {
              display: 'block', width: '100%', textAlign: 'left', border: 'none', cursor: 'pointer',
              background: active === s.id ? 'var(--dshpc-open-bg)' : 'transparent',
              color: active === s.id ? 'var(--dshpc-business)' : 'var(--dshpc-fg)',
              padding: '7px 10px', borderRadius: '6px', fontSize: '13px', marginBottom: '2px',
            },
          },
          t(s.titleKey),
        ),
      ),
    ),
    h(
      'main',
      { style: { flex: 1, minWidth: 0, overflowY: 'auto', padding: '12px 22px 60px' } },
      h(Sections, { active, onNavigate: setActive }),
    ),
  )
}

/** 设置页里的入口卡片：点一下跳整页预览。 */
function OpenPreviewCard(props: { open?: () => void }): ReturnType<typeof h> {
  return h(
    'div',
    {
      role: 'button',
      onClick: () => { props.open?.() },
      style: {
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer',
        padding: '12px 14px', borderRadius: 'var(--dshpc-radius-md)',
        border: '1px solid var(--dshpc-border)', background: 'var(--dshpc-surface-1)',
      },
    },
    h(
      'div',
      null,
      h('div', { style: { fontWeight: 600, fontSize: '14px' } }, '组件预览'),
      h('div', { style: { color: 'var(--dshpc-fg-3)', fontSize: '12px', marginTop: '2px' } },
        '打开 dsh-plugin-core 的控件与业务组件展示页'),
    ),
    h('span', { style: { color: 'var(--dshpc-business)', fontSize: '13px' } }, '打开 ›'),
  )
}

/** 侧栏图标（纯字符，避免引入图标依赖）。 */
function PanelIcon(): ReturnType<typeof h> {
  return h(
    'span',
    { style: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px' } },
    '◧',
  )
}

export function apply(ctx: {
  inject: (deps: string[], cb: (sub: unknown) => void) => void
}): void {
  // 领一套自己的 kit 并注入 token + 控件样式（与库在宿主里的用法完全一致）
  const kit = createStyleKit({ id: 'dsh-plugin-core-plugin', prefix: PREFIX })
  setStyleKit(kit)
  ensureControls(kit)
  kit.registerStyle('tdt-alias', aliasCss())
  kit.ensureStyles()

  // 跳整页：宿主 layout 服务（拿不到就降级为不跳转，绝不让插件起不来）
  let jump: (id: string) => void = () => {}
  ctx.inject(['layout'], (sub: unknown) => {
    const select = (sub as { layout?: { selectPanel?: (id: string) => void } } | null)?.layout?.selectPanel
    if (typeof select === 'function') jump = (id) => { select(id) }
  })

  // ⚠️ 三块注册各自 ctx.inject、自成一块：嵌进别的注入块会无声消失（兄弟仓注释原话）
  ctx.inject(['slots'], (sub: unknown) => {
    const slots = (sub as { slots?: { inject: (name: string, cb: () => void) => void; register: (meta: unknown, comp: unknown) => unknown } }).slots
    if (slots === undefined) return
    slots.inject('sidebar.panellist', () => {
      slots.register(
        { name: 'sidebar.panellist', id: PANEL_ID, order: 90, label: () => '组件预览' },
        PanelIcon,
      )
    })
    slots.inject('main', () => {
      slots.register({ name: 'main', key: PANEL_ID }, DemoPage)
    })
    slots.inject('settings.plugin.item', () => {
      slots.register(
        {
          name: 'settings.plugin.item',
          key: PANEL_ID,
          // 由宿主把「跳整页」的 open 回注给卡片组件
          inject: () => ({ open: () => { jump(PANEL_ID) } }),
        },
        (props: { open?: () => void }) => h(OpenPreviewCard, { open: props?.open ?? (() => { jump(PANEL_ID) }) }),
      )
    })
  })
}
