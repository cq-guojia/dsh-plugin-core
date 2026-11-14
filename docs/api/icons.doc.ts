// 图标的使用帮助 —— 真源（TS 数据模块）。md 与 demo 文档体都从这份派生。
// 本文只讲「怎么接、名字怎么写、怎么加库」；官方 primitives 图标的宿主事实见 docs/dependencies/dsh-host.md。
import type { DocTopic } from '../development/doc-format.js'

const usageExample = `import { Icon } from 'dsh-plugin-core/ui/icons'

// 字体图标：库名不可省，写法是「域.库名:图标名」
<Icon name="common.base:shanchu" />
<Icon name="common.base:shaixuan" size={18} />
<Icon name="common.logo:github" />

// 官方 primitives 图标：没有冒号，直接写组件名
<Icon name="IconWrapLinesOutlineRegular" />

// 尺寸：不传 = 跟随所在文字字号；显式给预设名 / px 才是绝对尺寸（独立摆放、装饰小箭头）
<Icon name="common.base:guanbi" size="lg" />
<Icon name="common.base:guanbi" size={31} />

// 无障碍名（同时作原生 tooltip）；装饰性图标不传
<Icon name="common.base:guanbi" title="关闭" />`

const apiExample = `import { ICON_FONTS, ICON_SIZES, ensureIconFont, loadIconFont } from 'dsh-plugin-core/ui/icons'

// 尺寸预设
ICON_SIZES   // { sm: 14, md: 16, lg: 20, xl: 24 }

// 需要时手动挂一次（Icon 首次渲染也会自动挂，重复调用无副作用）
ensureIconFont('common.base')

// 列出某套库当前有哪些图标：读在线 CSS 原文，平台加图标后刷新即见
const { names, prefix } = await loadIconFont('common.base')`

const doc: DocTopic = {
  title: { zh: '图标', en: 'Icons' },
  exports: ['Icon', 'FontIcon', 'ICON_FONTS', 'ICON_SIZES', 'ensureIconFont', 'loadIconFont'],
  sections: [
    {
      id: 'icons',
      heading: { zh: '图标', en: 'Icons' },
      prose: [
        {
          zh: '一个 `Icon` 组件同时管两类来源，尺寸因此能统一：**字体图标**（iconfont 托管，`库名:图标名`）与**官方 primitives 图标**（无冒号，直接写官方组件名）。字体文件与样式都不入包，运行时按库 id 挂一条 `<link>`，地址就在 `ICON_FONTS` 里；平台重新发布换了链接，改那一行即可，重复调用不会插出第二条。',
          en: 'One `Icon` component covers both sources so sizing stays uniform: **font icons** (hosted on iconfont, written as `library:name`) and **official primitives icons** (no colon, just the official component name). No font file and no style sheet ships with the package; at runtime one `<link>` per library id is mounted from `ICON_FONTS`, and republishing on the platform means editing that one line — repeated calls never add a second link.',
        },
        {
          zh: '**注册的库**（key 就是 `name` 里冒号前那整段，写法 `域.库名[.变体]`）：`common.base`、`common.base.color`、`common.logo`、`common.logo.color` 是跨所有开源框架共用的基础库；`dsh-plugin-core.base` 是本框架在 DSH 平台上对外提供的库。加库 = 往 `ICON_FONTS` 加一项（`url` / `family` / `baseClass` / `prefix`），组件与展示页都不用改。',
          en: '**Registered libraries** (the key is the whole part before the colon in `name`, shaped `domain.library[.variant]`): `common.base`, `common.base.color`, `common.logo` and `common.logo.color` are shared across every open-source framework; `dsh-plugin-core.base` is the library this framework ships on the DSH platform. Adding a library means one more entry in `ICON_FONTS` (`url` / `family` / `baseClass` / `prefix`); neither the component nor the showcase page changes.',
        },
        {
          zh: '**组名不可省**：`common.base:shanchu` 里的 `common.base` 就是 `ICON_FONTS` 的 key，库名本身允许带点；不带组名的名字只按官方组件名去找（找不到就不渲染）。图标名本身照抄平台里的名字，本层不做语义别名 —— 改名的唯一真源是 iconfont 后台。`loadIconFont(id)` 会读在线 CSS 原文拿到该库全部图标名（跨域 CSSOM 读不到，只能读原文）。',
          en: '**The library prefix is mandatory**: in `common.base:shanchu` the `common.base` part is the key of `ICON_FONTS` (library names may contain dots), and a name without a prefix is looked up as an official component name (rendered as nothing when absent). The icon name itself is copied from the platform; this layer adds no semantic aliases — renaming happens on the iconfont side. `loadIconFont(id)` reads the online CSS text to enumerate the library\'s names (cross-origin CSSOM is unreadable, so the text is the only source).',
        },
        {
          zh: '**多色库与深色**：`.color` 结尾的库是多色字体（iconfont 的 Color fonts），颜色随字形走、CSS `color` 改不动，所以 `ICON_FONTS` 里给它们标了 `color: true`。宿主切到深色时，组件会改用同名 `<图标名>-dark` 字形；库里没有这个变体就继续用原字形（说明该图标明暗通用）。判断依据是整库在线 CSS 的名字清单（CSS 无法表达「如果存在则覆盖」），清单到达前先按原字形渲染。单色库不受影响 —— 它们本来就跟 `color` 走。',
          en: '**Color libraries and dark mode**: libraries ending in `.color` are multicolour fonts (iconfont Color fonts) whose colours live in the glyph, so CSS `color` cannot change them — `ICON_FONTS` marks them with `color: true`. When the host switches to dark, the component swaps to the same-named `<name>-dark` glyph; if that variant is absent it keeps the original glyph (meaning it works in both modes). The decision needs the library\'s name list from the online CSS (CSS cannot express "override if present"), and the original glyph is drawn until that list arrives. Monochrome libraries are unaffected — they already follow `color`.',
        },
        {
          zh: '**找不到就不渲染**，并在控制台告警一次：库名写错、平台改名、宿主升级删了某个官方图标，都是空位而不是「显示成别的图标」。也不跨库回落 —— 回落到别的库会显示一个错的字形，比空白更难查。',
          en: '**An unknown name renders nothing** plus a single console warning: a mistyped library, a renamed glyph on the platform, or an official icon removed by a host upgrade all show as empty space rather than as some other icon. There is deliberately no cross-library fallback — falling back to another library would draw the wrong glyph, which is harder to trace than a gap.',
        },
        {
          zh: '**尺寸跟文字，不跟控件档**（2026-11-14）：不传 `size` 时，字体图标的 `<i>` 继承父级 `font-size`，官方 SVG 由控件的 `svg{width:1em;height:1em}` 接管 —— 两类都是 1:1 跟着同一行文字。`size` 只收数字与预设名（不收 `em` 字符串，官方组件的 props 是 `size?: number`），传了就是绝对 px，属显式覆盖。',
          en: '**Size follows text, not the control size tier** (2026-11-14): with no `size`, the font `<i>` inherits its parent `font-size` and official SVGs are taken over by the control\'s `svg{width:1em;height:1em}` — both track the adjacent text 1:1. `size` accepts numbers and preset names only (no `em` strings, since official components take `size?: number`); passing one is an explicit absolute-px override.',
        },
        {
          zh: '**自有基础类 `dshpc-icon`**（2026-11-14）：iconfont 平台生成的在线 CSS 基础类会写死 `font-size:16px`，直接命中 `<i>`，继承值盖不住它。所以所有字体图标都带一个自有类，尺寸契约放在核心 `icon.css` 真源里（`i.dshpc-icon{font-size:inherit;line-height:1}`），只接管字号与行高；字形、`font-family`、颜色、深色 `-dark` 仍归平台基础类。成熟图标库同构：Font Awesome 的 `.fa` 与 Bootstrap Icons 的 `.bi` 基础类都不带 `font-size`，尺寸默认继承父级文字（Font Awesome Sizing Icons 文档：By default, icons inherit the font-size of their parent container）。平台类名由在线 CSS 动态解析、5 个库前缀还不统一，靠平台类名做尺寸规则必然漏库。',
          en: '**Own base class `dshpc-icon`** (2026-11-14): the iconfont platform CSS sets `font-size:16px` on its generated base class, which matches `<i>` directly and beats any inherited value. Every font icon therefore carries our own base class, and the size contract lives in the core `icon.css` source (`i.dshpc-icon{font-size:inherit;line-height:1}`), owning only font-size and line-height; glyph, font-family, colour and dark `-dark` variants stay with the platform base class. Mature icon libraries are built the same way: neither Font Awesome `.fa` nor Bootstrap Icons `.bi` sets font-size on its base class, so icons inherit the parent text size by default (Font Awesome Sizing Icons: "By default, icons inherit the font-size of their parent container"). Platform class names are parsed dynamically from remote CSS and the five libraries use different prefixes, so keying size rules off them would always miss a library.',
        },
        {
          zh: '**三类用法**：① 跟文字并排的语义图标（按钮里的勾、输入框的清除叉）一律不传 `size`，由 `sm|md|lg` 决定的文字字号自动带出图标尺寸（`sm` 12px 字 → 12px 图标，`md`/`lg` 13px 字 → 13px 图标）；② 装饰性微箭头（选择器 caret、折叠、面包屑）用显式小 px，它们不与文字等大；③ 独立摆放或图标展示页用 `ICON_SIZES` 的显式档。`dense` 是唯一的放大档，走 `1.25em` 系数而不是新档位。',
          en: '**Three cases**: (1) semantic icons next to text (a check in a button, the clear cross in an input) omit `size` and inherit the text size chosen by `sm|md|lg` (`sm` 12px text → 12px icon, `md`/`lg` 13px text → 13px icon); (2) decorative micro-arrows (picker caret, collapse, breadcrumbs) take an explicit small px value because they are deliberately smaller than text; (3) standalone icons and the showcase page use the explicit `ICON_SIZES` tiers. `dense` is the only magnification step, expressed as a `1.25em` ratio rather than a new tier.',
        },
        {
          zh: '传字符串的场合（例如 `taskNotifications` 的 `icon` 字段，核心只存不解释）直接用同一条协议：`\'common.base:jian\'`、`\'common.logo:github\'`、`\'IconWrapLinesOutlineRegular\'`，渲染端原样喂给 `<Icon name={…} />` 即可，不需要自己再拆冒号。',
          en: 'Where only a string travels (for example the `icon` field of `taskNotifications`, which the core stores but never interprets), the same convention applies: `\'common.base:jian\'`, `\'common.logo:github\'`, `\'IconWrapLinesOutlineRegular\'`. The renderer feeds it straight into `<Icon name={…} />`; nothing has to split on the colon itself.',
        },
        {
          zh: '**`Icon` 与 `FontIcon` 的分工**：`Icon` 两类来源都管，代价是它静态引官方 primitives；纯控件入口不许带这份重依赖（`test/entry-isolation.test.mjs`），所以库内部的控件画字体图标一律走 `FontIcon` —— 它只渲染字体字形，props 与 `Icon` 相同（库名不得省略）。插件界面按普通场景用 `Icon` 即可；只有在写「不该拖进官方包」的入口时才需要 `FontIcon`。',
          en: '**`Icon` vs `FontIcon`**: `Icon` handles both sources, at the cost of statically importing the official primitives package. Pure-control entries must not carry that weight (`test/entry-isolation.test.mjs`), so controls inside this package draw font icons through `FontIcon` — same props as `Icon` (library prefix still mandatory), but it only renders font glyphs. Plugin UIs normally use `Icon`; `FontIcon` is for entries that must stay free of the official package.',
        },
      ],
      code: [
        { id: 'icons-usage', lang: 'tsx', src: usageExample },
        { id: 'icons-listing', lang: 'ts', src: apiExample },
      ],
      api: [
        {
          id: 'icons-api',
          rows: [
            {
              name: 'Icon',
              type: '(props: IconProps) => JSX.Element | null',
              def: '—',
              desc: { zh: '图标元素。props：`name`（必填，`库名:图标名` 或官方组件名）、`size`（不传 = 跟随所在文字字号；预设名或 px = 显式绝对尺寸）、`title`（无障碍名 + 原生 tooltip）、`className`、`style`。找不到图标时返回 `null` 并告警一次；多色库在深色下自动改用 `-dark` 字形', en: 'The icon element. Props: `name` (required, `library:name` or an official component name), `size` (omit = follow the adjacent text size; preset or px = explicit absolute size), `title` (accessible name plus native tooltip), `className`, `style`. Returns `null` with a one-off warning when nothing matches; colour libraries switch to the `-dark` glyph in dark mode' },
            },
            {
              name: 'FontIcon',
              type: '(props: FontIconProps) => JSX.Element | null',
              def: '—',
              desc: { zh: '只画字体图标的版本（props 同 `Icon`，`name` 必须是 `库名:图标名`）：**不吃官方 primitives**，供本包内的纯控件入口使用。插件界面一般用 `Icon` 就够', en: 'Font-only variant (same props as `Icon`, but `name` must be `library:name`): it does **not** pull the official primitives package, so pure-control entries inside this package can draw font icons without it. Plugin UIs normally just use `Icon`' },
            },
            {
              name: 'ICON_FONTS',
              type: 'Record<string, IconFontFace>',
              def: '—',
              desc: { zh: '库注册表（key 就是 `name` 里冒号前那段，如 `common.base`）：`url`（在线样式地址）、`family`、`baseClass`、`prefix`，多色库另有 `color: true`。加库只改这里', en: 'Library registry (the key is the part before the colon in `name`, e.g. `common.base`): `url` (online style address), `family`, `baseClass`, `prefix`, plus `color: true` for multicolour libraries. Adding a library means editing this' },
            },
            {
              name: 'ICON_SIZES',
              type: '{ sm: 14; md: 16; lg: 20; xl: 24 }',
              def: '—',
              desc: { zh: '尺寸预设，`Icon` 的 `size` 可直接传 key', en: 'Size presets; `Icon` accepts the key directly' },
            },
            {
              name: 'ensureIconFont',
              type: '(id: IconFontId) => void',
              def: '—',
              desc: { zh: '按库 id 保证只挂一条 `<link>`；地址变了直接改 `href`。`Icon` 首次渲染时自动调用，非浏览器环境静默跳过；多色库同时预取名字清单（供深色换字形用）', en: 'Guarantees exactly one `<link>` per library id, rewriting `href` when the address changed. Called automatically on first `Icon` render and silently skipped outside a browser; colour libraries also prefetch the name list used for the dark swap' },
            },
            {
              name: 'loadIconFont',
              type: '(id?: IconFontId) => Promise<ParsedIconFont>',
              def: 'id = \'common.base\'',
              desc: { zh: '拉取并解析该库在线 CSS（同会话只请求一次，与深色字形判断共用缓存），返回 `family` / `baseClass` / `prefix` / `names`；结构不认识时抛错', en: 'Fetches and parses the library\'s online CSS (once per session, sharing the cache with the dark-glyph lookup) and returns `family` / `baseClass` / `prefix` / `names`; throws when the structure is unrecognised' },
            },
            {
              name: 'parseFontCss',
              type: '(css: string) => ParsedIconFont',
              def: '—',
              desc: { zh: '纯函数解析器（`loadIconFont` 用的就是它），给需要自己解析的场景', en: 'The pure parser behind `loadIconFont`, exported for callers that already hold the CSS text' },
            },
          ],
        },
      ],
    },
  ],
}

export default doc
