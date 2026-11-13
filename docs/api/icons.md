# 图标

> EN: Icons

本文件由 `scripts/gen-docs.mjs` 从同名 `.doc.ts` 生成，请勿手改。

导出：Icon、ICON_FONTS、ensureIconFont、loadIconFont

## 字体图标

> EN: Font icons

图标字形托管在 iconfont 平台：本包**只承诺「在线样式 + 类名拼装」这一层**，样式与字体文件都不入包、不进产物。运行时按库 id 挂一条 `<link>`，地址就在 `ICON_FONTS` 里；平台重新发布换了链接，改那一行即可，重复调用不会插出第二条。

> EN: Glyphs are hosted on the iconfont platform: this package owns only the styling link plus class-name assembly. No style sheet and no font file is shipped. At runtime one `<link>` per library id is mounted, with the address kept in `ICON_FONTS`; republishing on the platform means editing that one line, and repeated calls never add a second link.

**图标名就是平台里的名字**，本层不做语义别名 —— 改名的唯一真源是 iconfont 后台。加一套库（社交 / 办公 …）只需往 `ICON_FONTS` 加一项（`url` / `family` / `baseClass` / `prefix`），组件与展示页都不用改；`loadIconFont(id)` 会实时读在线 CSS 原文拿到该库全部图标名（跨域 CSSOM 读不到，只能读原文）。

> EN: **The icon name is the platform name**; this layer adds no semantic aliases — renaming happens on the iconfont side. Adding another library (social, office …) is one more entry in `ICON_FONTS` (`url` / `family` / `baseClass` / `prefix`); neither the component nor the showcase page changes. `loadIconFont(id)` reads the online CSS text to enumerate that library's names (cross-origin CSSOM is unreadable, so the text is the only source).

尺寸默认 `1em`，跟随所在文字字号；要放大传 `size`（数字按 px，字符串原样）。单色字形吃 `color`，明暗随主题。官方 primitives 的图标**不走这里**，直接 `import { IconXxxRegular } from 'dsh-plugin-core/ui/official'` —— 两边是两套机制：这里是字体，官方是 SVG 组件。

> EN: Size defaults to `1em` so an icon follows the surrounding text; pass `size` to override (numbers as px, strings verbatim). Monochrome glyphs take `color` and follow the theme. Official primitives icons are **not** part of this layer: import them from `dsh-plugin-core/ui/official` — the two are different mechanisms, a font here and SVG components there.

演示站「图标」页把两边放在同一页：官方那组从宿主命名空间实时枚举，字体那组从在线 CSS 实时解析，因此宿主升级或平台加图标后刷新即见，仓库里没有需要手工同步的清单。

> EN: The demo site's Icons page puts both on one page: the official group is enumerated from the host namespace at runtime and the font groups are parsed from the online CSS at runtime, so a host upgrade or a platform upload shows up on refresh — the repository keeps no list that has to be synced by hand.

| 参数 | 类型 | 默认 | 说明(zh) | 说明(en) |
|---|---|---|---|---|
| `Icon` | `(props: IconProps) => JSX.Element` | — | 字体图标元素。props：`name`（必填，平台名）、`set`（库 id，缺省 `base`）、`size`（缺省 `1em`）、`title`（无障碍名 + 原生 tooltip）、`className`、`style` | The icon element. Props: `name` (required, platform name), `set` (library id, defaults to `base`), `size` (defaults to `1em`), `title` (accessible name plus native tooltip), `className`, `style` |
| `ICON_FONTS` | `Record<string, IconFontFace>` | — | 库注册表：`url`（在线样式地址）、`family`、`baseClass`、`prefix`。加库只改这里 | Library registry: `url` (online style address), `family`, `baseClass`, `prefix`. Adding a library means editing this |
| `ensureIconFont` | `(id?: IconFontId) => void` | id = 'base' | 按 id 保证该库只挂一条 `<link>`；地址变了直接改 `href`。`Icon` 首次渲染时自动调用，非浏览器环境静默跳过 | Guarantees exactly one `<link>` per library id; if the address changed it rewrites `href`. Called automatically on first `Icon` render, silently skipped outside a browser |
| `loadIconFont` | `(id?: IconFontId) => Promise<ParsedIconFont>` | id = 'base' | 拉取并解析该库在线 CSS（同会话只请求一次），返回 `family` / `baseClass` / `prefix` / `names`；结构不认识时抛错 | Fetches and parses the library's online CSS (once per session) and returns `family` / `baseClass` / `prefix` / `names`; throws when the structure is unrecognised |
| `parseFontCss` | `(css: string) => ParsedIconFont` | — | 纯函数解析器（`loadIconFont` 用的就是它），给需要自己解析的场景 | The pure parser behind `loadIconFont`, exported for callers that already hold the CSS text |

```tsx id="icons-usage"
import { Icon } from 'dsh-plugin-core/ui/icons'

// 名字就是 iconfont 里的名字（不带类名前缀）
<Icon name="shanchu" />
<Icon name="shaixuan" size={18} />
<Icon name="guanbi" title="关闭" />

// 以后有多套库时，用 set 指定；缺省 base
<Icon set="social" name="github" />
```

```ts id="icons-listing"
import { ICON_FONTS, ensureIconFont, loadIconFont } from 'dsh-plugin-core/ui/icons'

// 需要时手动挂一次（Icon 首次渲染也会自动挂，重复调用无副作用）
ensureIconFont('base')

// 列出某套库当前有哪些图标：读在线 CSS 原文，平台加图标后刷新即见
const { names, prefix } = await loadIconFont('base')
```

## 更新日志

本文件为生成投影，变更记录在同名 `.doc.ts` 真源与本仓 git 历史。
