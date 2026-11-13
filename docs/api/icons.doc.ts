// 图标的使用帮助 —— 真源（TS 数据模块）。md 与 demo 文档体都从这份派生。
// 本文只讲「怎么接、名字怎么写、怎么加库」；官方 primitives 图标的宿主事实见 docs/dependencies/dsh-host.md。
import type { DocTopic } from '../development/doc-format.js'

const usageExample = `import { Icon } from 'dsh-plugin-core/ui/icons'

// 字体图标：组名不可省（组名 = ICON_FONTS 的 key）
<Icon name="base:shanchu" />
<Icon name="base:shaixuan" size={18} />
<Icon name="social:jian" />

// 官方 primitives 图标：没有冒号，直接写组件名
<Icon name="IconWrapLinesOutlineRegular" />

// 尺寸：预设名或 px 数字，缺省 md（16）
<Icon name="base:guanbi" size="lg" />
<Icon name="base:guanbi" size={31} />

// 无障碍名（同时作原生 tooltip）；装饰性图标不传
<Icon name="base:guanbi" title="关闭" />`

const apiExample = `import { ICON_FONTS, ICON_SIZES, ensureIconFont, loadIconFont } from 'dsh-plugin-core/ui/icons'

// 尺寸预设
ICON_SIZES   // { sm: 14, md: 16, lg: 20, xl: 24 }

// 需要时手动挂一次（Icon 首次渲染也会自动挂，重复调用无副作用）
ensureIconFont('base')

// 列出某套库当前有哪些图标：读在线 CSS 原文，平台加图标后刷新即见
const { names, prefix } = await loadIconFont('base')`

const doc: DocTopic = {
  title: { zh: '图标', en: 'Icons' },
  exports: ['Icon', 'ICON_FONTS', 'ICON_SIZES', 'ensureIconFont', 'loadIconFont'],
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
          zh: '**组名不可省**：`base:shanchu` 里的 `base` 就是 `ICON_FONTS` 的 key，不带组名的名字只按官方组件名去找（找不到就不渲染）。图标名本身照抄平台里的名字，本层不做语义别名 —— 改名的唯一真源是 iconfont 后台。加一套库（社交 / 办公 …）只需往 `ICON_FONTS` 加一项（`url` / `family` / `baseClass` / `prefix`），组件与展示页都不用改；`loadIconFont(id)` 会读在线 CSS 原文拿到该库全部图标名（跨域 CSSOM 读不到，只能读原文）。',
          en: '**The library prefix is mandatory**: in `base:shanchu` the `base` part is the key of `ICON_FONTS`, and a name without a prefix is looked up as an official component name (rendered as nothing when absent). The icon name itself is copied from the platform; this layer adds no semantic aliases — renaming happens on the iconfont side. Adding another library (social, office …) is one more entry in `ICON_FONTS` (`url` / `family` / `baseClass` / `prefix`); neither the component nor the showcase page changes. `loadIconFont(id)` reads the online CSS text to enumerate the library\'s names (cross-origin CSSOM is unreadable, so the text is the only source).',
        },
        {
          zh: '**找不到就不渲染**，并在控制台告警一次：库名写错、平台改名、宿主升级删了某个官方图标，都是空位而不是「显示成别的图标」。也不跨库回落 —— 回落到 base 会显示一个错的字形，比空白更难查。',
          en: '**An unknown name renders nothing** plus a single console warning: a mistyped library, a renamed glyph on the platform, or an official icon removed by a host upgrade all show as empty space rather than as some other icon. There is deliberately no cross-library fallback — falling back to base would draw the wrong glyph, which is harder to trace than a gap.',
        },
        {
          zh: '尺寸默认 16px（`ICON_SIZES.md`），也可以传预设名，或直接给 px 数字。`size` 只收数字与预设名、不收 `em` 之类字符串 —— 官方组件的 props 是 `size?: number`，收 em 会让两类图标一半生效一半失效。需要跟所在文字字号联动时，把数字按调用点算好再传。',
          en: 'Size defaults to 16px (`ICON_SIZES.md`); pass a preset name or a raw px number. `size` accepts numbers and preset names only, never strings like `em` — official components take `size?: number`, so honouring em would make one source work and the other silently ignore it. When an icon must follow text size, compute the number at the call site.',
        },
        {
          zh: '传字符串的场合（例如 `taskNotifications` 的 `icon` 字段，核心只存不解释）直接用同一条协议：`\'base:jian\'`、`\'social:jian\'`、`\'IconWrapLinesOutlineRegular\'`，渲染端原样喂给 `<Icon name={…} />` 即可，不需要自己再拆冒号。',
          en: 'Where only a string travels (for example the `icon` field of `taskNotifications`, which the core stores but never interprets), the same convention applies: `\'base:jian\'`, `\'social:jian\'`, `\'IconWrapLinesOutlineRegular\'`. The renderer feeds it straight into `<Icon name={…} />`; nothing has to split on the colon itself.',
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
              desc: { zh: '图标元素。props：`name`（必填，`库名:图标名` 或官方组件名）、`size`（预设名或 px，缺省 16）、`title`（无障碍名 + 原生 tooltip）、`className`、`style`。找不到图标时返回 `null` 并告警一次', en: 'The icon element. Props: `name` (required, `library:name` or an official component name), `size` (preset or px, defaults to 16), `title` (accessible name plus native tooltip), `className`, `style`. Returns `null` with a one-off warning when nothing matches' },
            },
            {
              name: 'ICON_FONTS',
              type: 'Record<string, IconFontFace>',
              def: '—',
              desc: { zh: '库注册表（key 就是 `name` 里冒号前那段）：`url`（在线样式地址）、`family`、`baseClass`、`prefix`。加库只改这里', en: 'Library registry (the key is the part before the colon in `name`): `url` (online style address), `family`, `baseClass`, `prefix`. Adding a library means editing this' },
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
              desc: { zh: '按库 id 保证只挂一条 `<link>`；地址变了直接改 `href`。`Icon` 首次渲染时自动调用，非浏览器环境静默跳过', en: 'Guarantees exactly one `<link>` per library id, rewriting `href` when the address changed. Called automatically on first `Icon` render and silently skipped outside a browser' },
            },
            {
              name: 'loadIconFont',
              type: '(id?: IconFontId) => Promise<ParsedIconFont>',
              def: 'id = \'base\'',
              desc: { zh: '拉取并解析该库在线 CSS（同会话只请求一次），返回 `family` / `baseClass` / `prefix` / `names`；结构不认识时抛错', en: 'Fetches and parses the library\'s online CSS (once per session) and returns `family` / `baseClass` / `prefix` / `names`; throws when the structure is unrecognised' },
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
