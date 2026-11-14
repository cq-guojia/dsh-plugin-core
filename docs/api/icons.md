# 图标

> EN: Icons

本文件由 `scripts/gen-docs.mjs` 从同名 `.doc.ts` 生成，请勿手改。

导出：Icon、FontIcon、ICON_FONTS、ICON_SIZES、ensureIconFont、loadIconFont

## 图标

> EN: Icons

一个 `Icon` 组件同时管两类来源，尺寸因此能统一：**字体图标**（iconfont 托管，`库名:图标名`）与**官方 primitives 图标**（无冒号，直接写官方组件名）。字体文件与样式都不入包，运行时按库 id 挂一条 `<link>`，地址就在 `ICON_FONTS` 里；平台重新发布换了链接，改那一行即可，重复调用不会插出第二条。

> EN: One `Icon` component covers both sources so sizing stays uniform: **font icons** (hosted on iconfont, written as `library:name`) and **official primitives icons** (no colon, just the official component name). No font file and no style sheet ships with the package; at runtime one `<link>` per library id is mounted from `ICON_FONTS`, and republishing on the platform means editing that one line — repeated calls never add a second link.

**注册的库**（key 就是 `name` 里冒号前那整段，写法 `域.库名[.变体]`）：`common.base`、`common.base.color`、`common.logo`、`common.logo.color` 是跨所有开源框架共用的基础库；`dsh-plugin-core.base` 是本框架在 DSH 平台上对外提供的库。加库 = 往 `ICON_FONTS` 加一项（`url` / `family` / `baseClass` / `prefix`），组件与展示页都不用改。

> EN: **Registered libraries** (the key is the whole part before the colon in `name`, shaped `domain.library[.variant]`): `common.base`, `common.base.color`, `common.logo` and `common.logo.color` are shared across every open-source framework; `dsh-plugin-core.base` is the library this framework ships on the DSH platform. Adding a library means one more entry in `ICON_FONTS` (`url` / `family` / `baseClass` / `prefix`); neither the component nor the showcase page changes.

**组名不可省**：`common.base:shanchu` 里的 `common.base` 就是 `ICON_FONTS` 的 key，库名本身允许带点；不带组名的名字只按官方组件名去找（找不到就不渲染）。图标名本身照抄平台里的名字，本层不做语义别名 —— 改名的唯一真源是 iconfont 后台。`loadIconFont(id)` 会读在线 CSS 原文拿到该库全部图标名（跨域 CSSOM 读不到，只能读原文）。

> EN: **The library prefix is mandatory**: in `common.base:shanchu` the `common.base` part is the key of `ICON_FONTS` (library names may contain dots), and a name without a prefix is looked up as an official component name (rendered as nothing when absent). The icon name itself is copied from the platform; this layer adds no semantic aliases — renaming happens on the iconfont side. `loadIconFont(id)` reads the online CSS text to enumerate the library's names (cross-origin CSSOM is unreadable, so the text is the only source).

**多色库与深色**：`.color` 结尾的库是多色字体（iconfont 的 Color fonts），颜色随字形走、CSS `color` 改不动，所以 `ICON_FONTS` 里给它们标了 `color: true`。宿主切到深色时，组件会改用同名 `<图标名>-dark` 字形；库里没有这个变体就继续用原字形（说明该图标明暗通用）。判断依据是整库在线 CSS 的名字清单（CSS 无法表达「如果存在则覆盖」），清单到达前先按原字形渲染。单色库不受影响 —— 它们本来就跟 `color` 走。

> EN: **Color libraries and dark mode**: libraries ending in `.color` are multicolour fonts (iconfont Color fonts) whose colours live in the glyph, so CSS `color` cannot change them — `ICON_FONTS` marks them with `color: true`. When the host switches to dark, the component swaps to the same-named `<name>-dark` glyph; if that variant is absent it keeps the original glyph (meaning it works in both modes). The decision needs the library's name list from the online CSS (CSS cannot express "override if present"), and the original glyph is drawn until that list arrives. Monochrome libraries are unaffected — they already follow `color`.

**找不到就不渲染**，并在控制台告警一次：库名写错、平台改名、宿主升级删了某个官方图标，都是空位而不是「显示成别的图标」。也不跨库回落 —— 回落到别的库会显示一个错的字形，比空白更难查。

> EN: **An unknown name renders nothing** plus a single console warning: a mistyped library, a renamed glyph on the platform, or an official icon removed by a host upgrade all show as empty space rather than as some other icon. There is deliberately no cross-library fallback — falling back to another library would draw the wrong glyph, which is harder to trace than a gap.

尺寸默认 16px（`ICON_SIZES.md`），也可以传预设名，或直接给 px 数字。`size` 只收数字与预设名、不收 `em` 之类字符串 —— 官方组件的 props 是 `size?: number`，收 em 会让两类图标一半生效一半失效。需要跟所在文字字号联动时，把数字按调用点算好再传。

> EN: Size defaults to 16px (`ICON_SIZES.md`); pass a preset name or a raw px number. `size` accepts numbers and preset names only, never strings like `em` — official components take `size?: number`, so honouring em would make one source work and the other silently ignore it. When an icon must follow text size, compute the number at the call site.

传字符串的场合（例如 `taskNotifications` 的 `icon` 字段，核心只存不解释）直接用同一条协议：`'common.base:jian'`、`'common.logo:github'`、`'IconWrapLinesOutlineRegular'`，渲染端原样喂给 `<Icon name={…} />` 即可，不需要自己再拆冒号。

> EN: Where only a string travels (for example the `icon` field of `taskNotifications`, which the core stores but never interprets), the same convention applies: `'common.base:jian'`, `'common.logo:github'`, `'IconWrapLinesOutlineRegular'`. The renderer feeds it straight into `<Icon name={…} />`; nothing has to split on the colon itself.

**`Icon` 与 `FontIcon` 的分工**：`Icon` 两类来源都管，代价是它静态引官方 primitives；纯控件入口不许带这份重依赖（`test/entry-isolation.test.mjs`），所以库内部的控件画字体图标一律走 `FontIcon` —— 它只渲染字体字形，props 与 `Icon` 相同（库名不得省略）。插件界面按普通场景用 `Icon` 即可；只有在写「不该拖进官方包」的入口时才需要 `FontIcon`。

> EN: **`Icon` vs `FontIcon`**: `Icon` handles both sources, at the cost of statically importing the official primitives package. Pure-control entries must not carry that weight (`test/entry-isolation.test.mjs`), so controls inside this package draw font icons through `FontIcon` — same props as `Icon` (library prefix still mandatory), but it only renders font glyphs. Plugin UIs normally use `Icon`; `FontIcon` is for entries that must stay free of the official package.

| 参数 | 类型 | 默认 | 说明(zh) | 说明(en) |
|---|---|---|---|---|
| `Icon` | `(props: IconProps) => JSX.Element \| null` | — | 图标元素。props：`name`（必填，`库名:图标名` 或官方组件名）、`size`（预设名或 px，缺省 16）、`title`（无障碍名 + 原生 tooltip）、`className`、`style`。找不到图标时返回 `null` 并告警一次；多色库在深色下自动改用 `-dark` 字形 | The icon element. Props: `name` (required, `library:name` or an official component name), `size` (preset or px, defaults to 16), `title` (accessible name plus native tooltip), `className`, `style`. Returns `null` with a one-off warning when nothing matches; colour libraries switch to the `-dark` glyph in dark mode |
| `FontIcon` | `(props: FontIconProps) => JSX.Element \| null` | — | 只画字体图标的版本（props 同 `Icon`，`name` 必须是 `库名:图标名`）：**不吃官方 primitives**，供本包内的纯控件入口使用。插件界面一般用 `Icon` 就够 | Font-only variant (same props as `Icon`, but `name` must be `library:name`): it does **not** pull the official primitives package, so pure-control entries inside this package can draw font icons without it. Plugin UIs normally just use `Icon` |
| `ICON_FONTS` | `Record<string, IconFontFace>` | — | 库注册表（key 就是 `name` 里冒号前那段，如 `common.base`）：`url`（在线样式地址）、`family`、`baseClass`、`prefix`，多色库另有 `color: true`。加库只改这里 | Library registry (the key is the part before the colon in `name`, e.g. `common.base`): `url` (online style address), `family`, `baseClass`, `prefix`, plus `color: true` for multicolour libraries. Adding a library means editing this |
| `ICON_SIZES` | `{ sm: 14; md: 16; lg: 20; xl: 24 }` | — | 尺寸预设，`Icon` 的 `size` 可直接传 key | Size presets; `Icon` accepts the key directly |
| `ensureIconFont` | `(id: IconFontId) => void` | — | 按库 id 保证只挂一条 `<link>`；地址变了直接改 `href`。`Icon` 首次渲染时自动调用，非浏览器环境静默跳过；多色库同时预取名字清单（供深色换字形用） | Guarantees exactly one `<link>` per library id, rewriting `href` when the address changed. Called automatically on first `Icon` render and silently skipped outside a browser; colour libraries also prefetch the name list used for the dark swap |
| `loadIconFont` | `(id?: IconFontId) => Promise<ParsedIconFont>` | id = 'common.base' | 拉取并解析该库在线 CSS（同会话只请求一次，与深色字形判断共用缓存），返回 `family` / `baseClass` / `prefix` / `names`；结构不认识时抛错 | Fetches and parses the library's online CSS (once per session, sharing the cache with the dark-glyph lookup) and returns `family` / `baseClass` / `prefix` / `names`; throws when the structure is unrecognised |
| `parseFontCss` | `(css: string) => ParsedIconFont` | — | 纯函数解析器（`loadIconFont` 用的就是它），给需要自己解析的场景 | The pure parser behind `loadIconFont`, exported for callers that already hold the CSS text |

```tsx id="icons-usage"
import { Icon } from 'dsh-plugin-core/ui/icons'

// 字体图标：库名不可省，写法是「域.库名:图标名」
<Icon name="common.base:shanchu" />
<Icon name="common.base:shaixuan" size={18} />
<Icon name="common.logo:github" />

// 官方 primitives 图标：没有冒号，直接写组件名
<Icon name="IconWrapLinesOutlineRegular" />

// 尺寸：预设名或 px 数字，缺省 md（16）
<Icon name="common.base:guanbi" size="lg" />
<Icon name="common.base:guanbi" size={31} />

// 无障碍名（同时作原生 tooltip）；装饰性图标不传
<Icon name="common.base:guanbi" title="关闭" />
```

```ts id="icons-listing"
import { ICON_FONTS, ICON_SIZES, ensureIconFont, loadIconFont } from 'dsh-plugin-core/ui/icons'

// 尺寸预设
ICON_SIZES   // { sm: 14, md: 16, lg: 20, xl: 24 }

// 需要时手动挂一次（Icon 首次渲染也会自动挂，重复调用无副作用）
ensureIconFont('common.base')

// 列出某套库当前有哪些图标：读在线 CSS 原文，平台加图标后刷新即见
const { names, prefix } = await loadIconFont('common.base')
```

## 更新日志

本文件为生成投影，变更记录在同名 `.doc.ts` 真源与本仓 git 历史。
