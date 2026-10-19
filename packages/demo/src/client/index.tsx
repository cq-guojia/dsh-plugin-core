/**
 * demo 插件的 client 侧：注册「组件预览」整页 + 设置页入口卡片。
 *
 * ⚠️ 红线（兄弟仓血泪，见 dsh-task-dispatch-table/src/client/index.ts:6）：
 *  client 侧**顶层不得导出 inject**，等待一律写 ctx.inject([...], cb) 内，否则 entry 一直 pending、
 *  卡死整个 dsh 启动。本文件只导出 apply。
 *
 * 身份隔离：本插件领一套自己的 kit（prefix 'dshpc'）——与 --dshpc-*（兄弟插件）、--dsw-* 和 --dsh-*
 * （宿主官方）都分开；demo 展示代码里直接用 --dshpc-*，不再做任何跨前缀别名。
 */
import { createElement as h, useEffect, useState } from 'react'
// ⚠️ 从**仓库内 dsh-plugin-core 的构建产物**引入（不是源码），构建时打进本包：
//    这样本包自包含（发布不依赖 core 先发版），且预览的就是当前这份代码。
import { createStyleKit } from '../../../../dist/design/index.js'
import { ensureControls, setStyleKit } from '../../../../dist/ui/index.js'
import { setLocale as coreSetLocale } from '../../../../dist/utils/index.js'
import { ALL_SECTIONS, Sections, type SectionId } from '../sections/index.js'
import { DICT, setDemoTranslate, t } from '../i18n.js'

/** 侧栏条目 id / 主面板 key / 设置命名空间：三者必须逐字一致，且 = package.json 的 name。 */
const PANEL_ID = 'dsh-plugin-core-demo'

/** 宿主 locale 服务的结构类型（不引入宿主包，按接口使用）。 */
interface LocaleRuntimeLike {
  getLocale(): { active: string }
  subscribe(fn: () => void): () => void
  register(ns: string, locale: string, dict: Record<string, string>): () => void
  bind(ns: string): (key: string, vars?: Record<string, number | string>) => string
}

/** 由 apply 的 ctx.inject(['locale']) 赋值；预览页据此随语言切换重渲。 */
let localeRuntime: LocaleRuntimeLike | undefined

/** 订阅宿主 locale 变化，强制预览页重渲（核心内置组件读 getLocale，需重渲才刷新）。 */
function useLocaleTick(): void {
  const [, setTick] = useState(0)
  useEffect(() => {
    const rt = localeRuntime
    if (rt === undefined) return
    return rt.subscribe(() => { setTick((v) => v + 1) })
  }, [])
}

/** 整页：左侧目录 + 右侧当前小节（套用 demo 的展示内容）。 */
function DemoPage(): ReturnType<typeof h> {
  useLocaleTick()
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
      h('div', { style: { fontWeight: 600, fontSize: '14px' } }, t('pluginTitle')),
      h('div', { style: { color: 'var(--dshpc-fg-3)', fontSize: '12px', marginTop: '2px' } },
        t('pluginCardDesc')),
    ),
    h('span', { style: { color: 'var(--dshpc-business)', fontSize: '13px' } }, t('pluginCardOpen')),
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
  const kit = createStyleKit({ id: 'dsh-plugin-core-plugin' })
  setStyleKit(kit)
  ensureControls(kit)
  kit.ensureStyles()

  // 跳整页：宿主 layout 服务（拿不到就降级为不跳转，绝不让插件起不来）
  let jump: (id: string) => void = () => {}
  ctx.inject(['layout'], (sub: unknown) => {
    const select = (sub as { layout?: { selectPanel?: (id: string) => void } } | null)?.layout?.selectPanel
    if (typeof select === 'function') jump = (id) => { select(id) }
  })

  // 宿主语言：注册本插件字典 + 绑定 t；切换时同步核心 setLocale，内置组件随之切换
  ctx.inject(['locale'], (sub: unknown) => {
    const loc = (sub as { locale?: LocaleRuntimeLike } | null)?.locale
    if (loc === undefined) return
    localeRuntime = loc
    try {
      loc.register(PANEL_ID, 'zh', { ...DICT.zh })
      loc.register(PANEL_ID, 'en', { ...DICT.en })
      setDemoTranslate(loc.bind(PANEL_ID))
    } catch {
      // 注册冲突（如热重载）时保持核心 getLocale 回退，不影响启动
    }
    const sync = (): void => {
      coreSetLocale(loc.getLocale().active === 'en' ? 'en' : 'zh')
    }
    sync()
    loc.subscribe(sync)
  })

  // ⚠️ 三块注册各自 ctx.inject、自成一块：嵌进别的注入块会无声消失（兄弟仓注释原话）
  ctx.inject(['slots'], (sub: unknown) => {
    const slots = (sub as { slots?: { inject: (name: string, cb: () => void) => void; register: (meta: unknown, comp: unknown) => unknown } }).slots
    if (slots === undefined) return
    slots.inject('sidebar.panellist', () => {
      slots.register(
        { name: 'sidebar.panellist', id: PANEL_ID, order: 90, label: () => t('pluginTitle') },
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
