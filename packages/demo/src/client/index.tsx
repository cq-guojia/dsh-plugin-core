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
import {
  IconLinkOutlineRegular,
  IconPlayOutlineRegular,
  MenuItemButton,
  Tooltip,
} from '@deepseek-ai/dsh-client-ui-primitives'
import type { SettingsFormScope } from '@deepseek-ai/dsh-client-ui-primitives'
// ⚠️ 从**仓库内 dsh-plugin-core 的构建产物**引入（不是源码），构建时打进本包：
//    这样本包自包含（发布不依赖 core 先发版），且预览的就是当前这份代码。
import { createStyleKit } from '../../../../dist/design/index.js'
import { Button, Card, PanelDock, Segmented, connectHost, ensureControls, setStyleKit, setTooltipRenderer } from '../../../../dist/ui/index.js'
import { connectFileServices } from '../host-files.js'
import { connectRealSessions } from '../real-sessions.js'
import { demoDock, demoPanels } from '../dock.js'
import { pageRow } from '../layout-mount.js'
import { setLocale as coreSetLocale } from '../../../../dist/utils/index.js'
import { ALL_SECTIONS, SECTION_GROUPS, Sections, type SectionId } from '../sections/index.js'
import { DICT, setDemoTranslate, t } from '../i18n.js'
import { DEMO_CSS } from '../demo-css.generated.js'
import { MODELS_PATH } from '../paths.js'

/** 侧栏条目 id / 主面板 key / 设置命名空间 / 详情页槽位 key：四者必须逐字一致，且 = package.json 的 name。
 *  命名空间这条尤其硬：settings 服务的命名空间 = **profile entry id**（`cordis.patch.yml` 那条
 *  insert 的 id），写岔了 `configForms.get(ns)` 拿不到任何东西。 */
const PANEL_ID = 'dsh-plugin-core-demo'

/** 插件详情页的配置区槽位（dsh 0.1.7+；旧的 `settings.plugin.item` 已随该版本删除）。 */
const BUNDLE_CONFIG_SLOT = 'plugins.bundle.config'

/** Config schema 里那个字段名（server 侧 `Config` 与这里的 spec 必须同名）。 */
const ENTRY_MODE_FIELD = 'entryMode'

/** slots 服务本文件用到的切片（宿主类型本地结构化声明，不 import 宿主包）。 */
interface SlotsLike {
  inject: (name: string, cb: () => void) => void
  register: (meta: unknown, comp: unknown) => (() => void)
}

/** 官方设置表单服务的最小面（`ctx.configForms`；由 @deepseek-ai/dsh-client-ui-settings 提供）。 */
interface ConfigFormsLike {
  get: <T>(entryId: string) => SettingsFormScope<T>
  /** 列出宿主实际登记（served）的设置命名空间——cordis.patch.yml 的 id 未必等于宿主内部命名空间。 */
  describe: () => { getSnapshot: () => { view?: { namespaces?: ReadonlyArray<{ ns: string }> } } }
}

/** 取宿主实际登记的本插件设置命名空间；取不到就退回包名（tdt 同款 servedEntryId 思路）。 */
function resolveServedEntryId(forms: ConfigFormsLike): string {
  let served: readonly string[] | undefined
  try {
    served = forms.describe().getSnapshot().view?.namespaces?.map((n) => n.ns)
  } catch {
    served = undefined
  }
  if (served === undefined) return PANEL_ID
  return served.find((ns) => ns === PANEL_ID) ?? PANEL_ID
}

/** 本插件在设置里的可编辑项（server 侧 `Config` 的客户端镜像；schema 默认值兜底后一定齐全）。 */
interface PluginConfig {
  /** 入口位置：off=不显示（仅设置中可见）/ first=左侧第一级 / more=更多菜单（默认）。 */
  entryMode?: 'off' | 'first' | 'more'
}

/** slots 服务引用（apply 时赋值）：开关切换后重注册侧栏条目要用。 */
let slotsRef: SlotsLike | null = null
/** 当前侧栏条目的 disposer（slots.register 的返回值）：关开关即时摘除、开开关即时注册。 */
let sidebarDisposer: (() => void) | null = null
/** 入口位置（由官方设置文档快照驱动；服务未就位时按默认「更多」）。 */
let entryMode: 'off' | 'first' | 'more' = 'more'
/** 跳整页：宿主 layout.selectPanel（拿不到就降级为不跳转，绝不让插件起不来）。 */
let jump: (id: string) => void = () => {}

/**
 * 把侧栏条目注册成 / 摘成 `entryMode` 说的样子。
 *
 * ⚠️ 两个注入块的到达顺序不定（slots 与 configForms 谁先谁后没有保证），所以把「当前值」
 * 存在模块级变量里：谁先到都按同一份值注册，后到的块只会重幂等一遍。
 */
/**
 * 按 `entryMode` 注册侧栏入口：
 *  - 'off'：不注册任何入口（仅「设置」里可见）；
 *  - 'first'：注册到第一级侧栏（sidebar.panellist）；
 *  - 'more'（默认）：注册到「更多」菜单（sidebar.panellist.actions）。
 * 两个槽的 inject 句柄各自带「当前 mode 校验 + 已注册即跳过」双保险，
 * 切换模式时旧槽句柄不会把已摘除的行又挂回来。
 */
function applySidebarEntry(): void {
  const slots = slotsRef
  if (slots === null) return
  if (sidebarDisposer !== null) { sidebarDisposer(); sidebarDisposer = null }
  if (entryMode === 'off') return
  if (entryMode === 'first') {
    // 入口注册到左侧第一级侧栏（sidebar.panellist）：与官方功能并列，点开跳整页。
    slots.inject('sidebar.panellist', () => {
      if (sidebarDisposer !== null) return
      if (entryMode !== 'first') return
      sidebarDisposer = slots.register(
        { name: 'sidebar.panellist', id: PANEL_ID, order: 90, label: () => t('pluginTitle') },
        PanelIcon,
      )
    })
  } else {
    // 默认（more）：入口收进「更多」菜单（sidebar.panellist.actions），不占第一级位置，点开跳整页。
    slots.inject('sidebar.panellist.actions', () => {
      if (sidebarDisposer !== null) return
      if (entryMode !== 'more') return
      sidebarDisposer = slots.register(
        { name: 'sidebar.panellist.actions', id: `${PANEL_ID}-more`, order: 90, locale: PANEL_ID },
        MoreMenuRow,
      )
    })
  }
}

/** 「更多」菜单里的一行：点开跳 demo 整页，并收起菜单。 */
function MoreMenuRow(props: { onDismiss: () => void }): ReturnType<typeof h> {
  return h(
    MenuItemButton,
    {
      icon: h(PanelIcon, { size: 16 }),
      onSelect: () => { props.onDismiss(); jump(PANEL_ID) },
    },
    t('pluginTitle'),
  )
}

// 构建时由 packages/demo/build.mjs 的 define 注入（读两份 package.json）。
// 侧栏底部常驻显示 —— 更没更新、装的是哪版，一眼可查，不靠猜。
declare const __CORE_VERSION__: string
declare const __DEMO_VERSION__: string
// 构建唯一编码（build.mjs 每次构建生成）：版本号不 bump 时，靠它确认宿主里跑的是不是刚 build 的产物。
declare const __BUILD_STAMP__: string

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

/**
 * 明暗皮肤：直接翻 body 的 `data-ds-dark-theme`（宿主亮度判据，见 docs/design/style.md）——
 * 做界面要来回切换，去系统设置改太绕。MutationObserver 同步宿主侧自己改的主题
 * （宿主自己的切换器 / 跟随系统），按钮状态不打架。
 */
function useHostDark(): { dark: boolean; toggle: () => void } {
  const read = (): boolean => document.body.hasAttribute('data-ds-dark-theme')
  const [dark, setDark] = useState(read)
  useEffect(() => {
    const obs = new MutationObserver(() => { setDark(read()) })
    obs.observe(document.body, { attributes: true, attributeFilter: ['data-ds-dark-theme'] })
    return () => { obs.disconnect() }
  }, [])
  return {
    dark,
    toggle: () => {
      document.body.toggleAttribute('data-ds-dark-theme')
      setDark(read())
    },
  }
}

/** 整页：左侧两级目录 + 右侧当前页（套用 demo 的展示内容）。 */
function DemoPage(): ReturnType<typeof h> {
  useLocaleTick()
  const { dark, toggle } = useHostDark()
  const [active, setActive] = useState<SectionId>(ALL_SECTIONS[0].id)

  // 侧栏：第一层是能力域的纯标题（不可点），第二层是可点的页。
  // 底部固定栏（不随导航滚动）：明暗切换 + 版本号 + 编译码时间戳——2026-10-24 用户：
  // 做界面要来回切明暗、并要一眼看出跑的是哪次 build，从「参考」页挪回侧栏底部。
  const nav: ReturnType<typeof h>[] = []
  SECTION_GROUPS.forEach((group, gi) => {
    nav.push(
      h(
        'div',
        {
          key: `group-${group.id}`,
          style: {
            fontSize: '11px', fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase',
            color: 'var(--dshpc-fg-4)',
            padding: gi === 0 ? '0 10px 6px' : '16px 10px 6px',
          },
        },
        t(group.titleKey),
      ),
    )
    for (const section of ALL_SECTIONS.filter((s) => s.group === group.id)) {
      nav.push(
        h(
          'button',
          {
            key: section.id,
            type: 'button',
            onClick: () => { setActive(section.id) },
            style: {
              display: 'block', width: '100%', textAlign: 'left', border: 'none', cursor: 'pointer',
              background: active === section.id ? 'var(--dshpc-open-bg)' : 'transparent',
              color: active === section.id ? 'var(--dshpc-business)' : 'var(--dshpc-fg)',
              padding: '7px 10px', borderRadius: '6px', fontSize: '13px', marginBottom: '2px',
            },
          },
          t(section.titleKey),
        ),
      )
    }
  })

  // ⚠️ 高度必须两端一起给：
  //   · alignItems 必须是 stretch（默认）；写 flex-start 会让两侧高度退化成内容高 ⇒ main 的
  //     overflowY:auto 失去可滚高度，超出部分被宿主容器裁掉、连滚动条都不出现（2026-10-19 真踩过：
  //     用户滚不到「滑动块」那一节）。
  //   · main 自己再给 height:100% + minHeight:0（flex 子项的默认 min-height:auto 会撑破容器）。
  return h(
    'div',
    {
      // 分栏挂载点：explorer 的 openFilePreview 要把 dock 塞进这一行，主区才被挤窄。
      ref: (element: HTMLElement | null) => {
        pageRow.element = element
      },
      style: {
        display: 'flex', alignItems: 'stretch', height: '100%', minHeight: 0, overflow: 'hidden',
        // 分栏是页面级布局成员：高度吃这个变量（默认 100vh 是给整页场景的，这里是宿主页面区）。
        ['--dshpc-dock-h' as string]: '100%',
      },
    },
    h(
      'aside',
      {
        style: {
          width: '180px', flex: 'none', height: '100%', boxSizing: 'border-box',
          display: 'flex', flexDirection: 'column',
          borderRight: '1px solid var(--dshpc-border-faint)', fontFamily: 'var(--dshpc-font-md)',
        },
      },
      // 导航区：唯一滚动容器；底部操作/版本区固定不动
      h('div', { style: { flex: 1, minHeight: 0, overflowY: 'auto', padding: '14px 10px' } }, nav),
      // 固定底栏：明暗切换 + 版本号 + 编译码（时间戳，一眼看出编译时刻）
      h(
        'div',
        {
          style: {
            flex: 'none', padding: '10px', borderTop: '1px solid var(--dshpc-border-faint)',
            display: 'flex', flexDirection: 'column', gap: '8px',
          },
        },
        // 明暗切换：核心 Segmented 滑动分段（左亮右暗，图标进 label），不手写按钮
        h(Segmented<'light' | 'dark'>, {
          items: [
            { value: 'light', label: `☀ ${t('themeLight')}` },
            { value: 'dark', label: `☾ ${t('themeDark')}` },
          ],
          value: dark ? 'dark' : 'light',
          onChange: (v: 'light' | 'dark') => { if ((v === 'dark') !== dark) toggle() },
          size: 'sm',
          block: true,
          label: t('themeToggle'),
        }),
        // 版本号 + 编译码：180px 侧栏放不下一行 ⇒ core / demo 各一行；编译码小一号、与上面隔开
        h(
          'div',
          {
            style: {
              display: 'flex', flexDirection: 'column', gap: '1px', padding: '0 2px',
              color: 'var(--dshpc-fg-3)', fontFamily: 'var(--dshpc-font-mono)', fontSize: '10px', lineHeight: '14px',
            },
          },
          h('span', null, `core v${__CORE_VERSION__}`),
          h('span', null, `demo v${__DEMO_VERSION__}`),
          h('span', { style: { marginTop: '4px', fontSize: '9px' } }, __BUILD_STAMP__),
        ),
      ),
    ),
    h(
      'main',
      { style: { flex: 1, minWidth: 0, minHeight: 0, height: '100%', boxSizing: 'border-box', overflowY: 'auto', padding: '12px 22px 60px' } },
      h(Sections, { active }),
    ),
    // 分栏挂在**整页**右侧（真实用法），不是塞进某一节里：任何一页点开都挤窄 main。
    // 内容与头部在 demoPanels() 里声明（DockPanel），这里只管显隐。
    h(PanelDock, { dock: demoDock }, ...demoPanels()),
  )
}

/** 槽位组件收到的 props：框架按 `inject()` 的返回值给齐（这里直接给设置文档 + 跳转动作）。 */
interface ConfigPanelProps {
  view: 'summary' | 'page'
  /** 宿主托管的设置文档（`configForms.get(ns)`）：读快照、原子 mutate，插件不落盘。 */
  form: SettingsFormScope<PluginConfig>
  openDemo: () => void
}

/**
 * 插件详情页的配置面板（`plugins.bundle.config`）。
 *
 * 交互口径（用户 2026-10-25）：**没有「保存」按钮，选项一拨即写**——直接调官方
 * `configForms` 的原子 `mutate`（带 revision 围栏），宿主持久化到 profile。
 *
 * 入口位置用核心 `Segmented`（滑动栏，单选）控制：关闭 = 灰 / 有入口 = 绿；说明在左、控件在右。
 * ⚠️ 介绍只写「这个插件是干嘛的」，不列功能、不写代码——功能会随版本变，介绍不跟着维护。
 */
function ConfigPanel(props: ConfigPanelProps): ReturnType<typeof h> {
  const form = props.form
  const [, rerender] = useState(0)
  // 订阅设置文档：宿主写入成功 / 外部变更后重渲（开关态与卡片色条跟着走）。
  // ⚠️ hooks 必须在任何 return 之前调（视图可能在 page/summary 间切换，不能改动 hook 顺序）。
  useEffect(() => form.subscribe(() => { rerender((n) => n + 1) }), [form])

  // 详情页只渲染 `page` 视图；`summary`（列表摘要位）不出内容。
  if (props.view !== 'page') return h('div', { style: { display: 'none' } })
  const snap = form.getSnapshot()
  const storedMode = snap.value?.entryMode
  const mode: 'off' | 'first' | 'more' = storedMode === 'off' || storedMode === 'first' || storedMode === 'more' ? storedMode : 'more'
  const ready = snap.status === 'ready'

  return h(
    'div',
    { style: { display: 'flex', flexDirection: 'column', gap: '14px' } },
    // 一句话说明「这个插件是干嘛的」——标题由详情页自己画，这里只补定位
    h('div', { style: { color: 'var(--dshpc-fg-3)', fontSize: '12px', lineHeight: '18px' } }, t('settingsIntro')),
    // 设置行：滑动栏在右、说明在左；左缘圆角短条有入口=绿 / 关闭=灰（核心 Card 框式）
    ready
      ? h(
          Card,
          {
            accent: mode === 'off' ? 'neutral' : 'success',
            action: h(Segmented<'off' | 'first' | 'more'>, {
              size: 'sm',
              value: mode,
              disabled: !snap.writable,
              onChange: (next) => {
                // 拨动即写：官方原子 mutate（revision 围栏），宿主持久化，不需要「保存」
                void form.mutate(
                  [{ op: 'set', path: [ENTRY_MODE_FIELD], value: next }],
                  snap.revision,
                )
              },
              items: ([
                { value: 'off', label: t('settingsEntryOff'), tooltip: t('settingsEntryOffTip') },
                { value: 'more', label: t('settingsEntryMore'), tooltip: t('settingsEntryMoreTip') },
                { value: 'first', label: t('settingsEntryFirst'), tooltip: t('settingsEntryFirstTip') },
              ] as const),
            }),
          },
          h(
            'div',
            null,
            h('div', { style: { fontSize: '13px', fontWeight: 500 } }, t('settingsEntryTitle')),
            h('div', { style: { color: 'var(--dshpc-fg-3)', fontSize: '12px', marginTop: '2px' } },
              t('settingsEntryHint')),
          ),
        )
      : h(
          'div',
          { style: { color: 'var(--dshpc-fg-3)', fontSize: '12px' } },
          t(snap.status === 'loading' ? 'settingsLoading' : 'settingsUnavailable'),
        ),
    h(
      'div',
      { style: { display: 'flex', gap: '8px' } },
      h(
        Button,
        { size: 'md', variant: 'primary', icon: h(IconPlayOutlineRegular, { size: 16 }), onClick: props.openDemo },
        t('settingsOpenDemo'),
      ),
      h(
        Button,
        {
          size: 'md', variant: 'outline',
          icon: h(IconLinkOutlineRegular, { size: 16 }),
          onClick: () => { window.open('https://github.com/cq-guojia/dsh-plugin-core', '_blank', 'noopener') },
        },
        t('settingsGithub'),
      ),
    ),
  )
}

/**
 * 侧栏图标：用户 2026-10-24 给的「子表控件」SVG 原样移植（5 个 path 一字未改，
 * 源文件存 assets/icon-components.svg 供 package.json icon 字段用）。
 * 「黑白反色」= 两档色都走 currentColor（辅档 38% 透明度）——亮主题显黑、暗主题显白，
 * 且跟随侧栏行的选中态（兄弟项目 tdt TaskPanelIcon 同款口径）。
 * size 由侧栏传入：宽栏 16 / 折叠栏 18。
 */
function PanelIcon(props: { size?: number }): ReturnType<typeof h> {
  const size = props.size ?? 18
  return h(
    'svg',
    { width: size, height: size, viewBox: '0 0 1024 1024', 'aria-hidden': true },
    h('path', { d: 'M960 896H64c-38.4 0-64-25.6-64-64V192c0-38.4 25.6-64 64-64h896c38.4 0 64 25.6 64 64v640c0 38.4-25.6 64-64 64zM96 800h832v-576h-832v576z', fill: 'currentColor' }),
    h('path', { d: 'M64 64h256c38.4 0 64 25.6 64 64v768c0 38.4-25.6 64-64 64H64c-38.4 0-64-25.6-64-64V128c0-38.4 25.6-64 64-64z', fill: 'currentColor', opacity: 0.38 }),
    h('path', { d: 'M640 268.8h192v96h-192z', fill: 'currentColor' }),
    h('path', { d: 'M832 563.2h-192V460.8h192v102.4z', fill: 'currentColor', opacity: 0.38 }),
    h('path', { d: 'M640 652.8h192v96h-192zM512 883.2c-25.6 0-51.2-19.2-51.2-51.2V192c0-25.6 19.2-51.2 51.2-51.2s51.2 25.6 51.2 51.2v640c0 25.6-25.6 51.2-51.2 51.2zM128 268.8h128v96H128zM128 460.8h128v96H128zM128 652.8h128v96H128z', fill: 'currentColor' }),
  )
}

export function apply(ctx: {
  inject: (deps: string[], cb: (sub: unknown) => void) => void
  /** 效果存活期 = 本插件的存活期；卸载/unload 时自动跑 disposer（可选：没有就不回收，不致命）。 */
  effect?: (body: () => (() => void) | undefined) => void
}): void {
  // 领一套自己的 kit 并注入 token + 控件样式（与库在宿主里的用法完全一致）
  const kit = createStyleKit({ id: 'dsh-plugin-core-plugin' })
  setStyleKit(kit)
  ensureControls(kit)
  // 文档骨架样式（示例/代码双栏等）是 demo 自己的，不进库；仍走同一个 kit、同一个 style 标签
  kit.registerStyle('demo', DEMO_CSS)
  kit.ensureStyles()

  // 把官方 Tooltip 交给 core：此后 FieldHint（问号提示）的气泡就是官方组件本体，
  // 与 Tooltip 展示区里的是同一个（core 零官方依赖 ⇒ 只能由插件侧注入，见 src/ui/tooltip.ts）。
  setTooltipRenderer((props) => h(Tooltip, props as never))

  // 跳整页：宿主 layout 服务（拿不到就降级为不跳转，绝不让插件起不来）。
  // ⚠️ 必须保留 `layout` 对象再调它的方法：`selectPanel` 是 class 方法，抽出来单存会丢 this，
  //    宿主内部 `this.hasMainPanel(...)` 直接抛 "Cannot read properties of undefined"（真机踩过）。
  // jump 见模块级声明，这里只赋值。
  ctx.inject(['layout'], (sub: unknown) => {
    const layout = (sub as { layout?: { selectPanel?: (id: string | null) => void } } | null)?.layout
    if (layout?.selectPanel === undefined) return
    jump = (id) => { layout.selectPanel?.(id) }
  })

  // 领域选择器的数据面（工作区列表 / 模型目录）：core 自己订数，这里只递一次 ctx。
  // 模型目录走宿主路由（server 侧 serveModelCatalog 注册的同一个 path）。
  connectHost(ctx, { modelsPath: MODELS_PATH })
  // explorer 的数据面（remote.workspaceFiles / remote.officeToPdf）：同样是真服务，缺席即停在未就位态。
  connectFileServices(ctx)
  connectRealSessions(ctx)

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

  // ⚠️ 两块注册各自 ctx.inject、自成一块：嵌进别的注入块会无声消失（兄弟仓注释原话）
  ctx.inject(['slots'], (sub: unknown) => {
    const slots = (sub as { slots?: SlotsLike }).slots
    if (slots === undefined) return
    slotsRef = slots
    applySidebarEntry()
    slots.inject('main', () => {
      slots.register({ name: 'main', key: PANEL_ID }, DemoPage)
    })
  })

  // 设置：**宿主托管的插件配置**（server 侧 `Config` schema ⇒ settings 服务按 entry 自动登记命名空间）。
  //  ─ 持久化在 profile patch 文档里，宿主负责写入与重载时的生效，插件不自己落盘；
  //  ─ 侧栏入口跟着设置文档的快照走（订阅），所以「打开详情页之前」也按持久化值生效；
  //  ─ `whileServed` 保证宿主没登记这个命名空间时（比如 entry 被禁用）详情页不留任何痕迹。
  ctx.inject(['slots', 'configForms'], (sub: unknown) => {
    const view = sub as { slots?: SlotsLike; configForms?: ConfigFormsLike }
    const slots = view.slots
    const forms = view.configForms
    if (slots === undefined || forms === undefined) return

    const entryId = resolveServedEntryId(forms)
    const form = forms.get<PluginConfig>(entryId)

    // 侧栏入口：设置文档一变就重算（选项一拨即写，立刻摘除/挂回入口，不需要重开插件）
    const syncSidebar = (): void => {
      const value = form.getSnapshot().value
      const stored = value?.entryMode
      entryMode = stored === 'off' || stored === 'first' || stored === 'more' ? stored : 'more'
      applySidebarEntry()
    }
    syncSidebar()
    ctx.effect?.(() => form.subscribe(syncSidebar))

    // 直接注册详情页配置区（key = 包名 ⇒ 宿主 ledger.bundles.has(pkg.name) 命中、必出配置区）。
    // 不裹 whileServed：命名空间若未按 PANEL_ID 命中（或镜像未就绪）会导致整段永远不注册、
    // 配置区消失——tdt 也是直接注册。命名空间用宿主实际 served 的那个（resolveServedEntryId）。
    slots.inject(BUNDLE_CONFIG_SLOT, () => {
      slots.register(
        {
          name: BUNDLE_CONFIG_SLOT,
          // keyed 槽位：key 必须与包名逐字相同（详情页按 `ledger.bundles.has(pkg.name)` 决定是否出配置区）。
          key: PANEL_ID,
          locale: PANEL_ID,
          // `form`（设置文档）与 `openDemo`（跳整页）作为普通 props 透传进面板组件。
          inject: () => ({
            form,
            openDemo: () => { jump(PANEL_ID) },
          }),
        },
        ConfigPanel,
      )
    })
  })
}
