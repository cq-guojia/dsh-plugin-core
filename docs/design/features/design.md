<!-- 本文件由 scripts/gen-docs.mjs 自动生成，请勿手改；改对应的 .doc.ts 后重跑 node scripts/gen-docs.mjs -->

# design —— 样式层

> EN: design — styling layer

导出：createStyleKit、DARK_THEME_SELECTOR、StyleKit、StyleKitOptions

## 概览

> EN: Overview

零 React、无组件。装的是「值 + 注入机制」：token 变量表、注入器工厂、主题判据。

> EN: Zero React, no components. It ships values plus an injection mechanism: the token variable table, the injector factory, and the theme predicate.

只想统一配色/尺寸但自己写组件的插件，只引这一个就够。

> EN: A plugin that wants unified color/size but writes its own components needs only this subpath.

## 导出

> EN: Exports

| 参数 | 类型 | 默认 | 说明(zh) | 说明(en) |
|---|---|---|---|---|
| `createStyleKit(options)` | `` |  | 领一套本插件专属的样式设施（必调） | Acquire a plugin-scoped styling kit (must call) |
| `DARK_THEME_SELECTOR` | `` |  | 明暗判据选择器常量 `body[data-ds-dark-theme]` | Dark-mode predicate selector constant `body[data-ds-dark-theme]` |
| `type StyleKit / StyleKitOptions` | `` |  | 类型 | Types |

## createStyleKit(options)

> EN: createStyleKit(options)

| 参数 | 类型 | 必填 | 默认 | 说明(zh) | 说明(en) |
|---|---|---|---|---|---|
| `id` | `string` | 是 | — | `<style>` 标签 id，多插件同页靠它互不覆盖，必须插件内唯一。空串抛错 | The `<style>` tag id; on a page with multiple plugins it prevents overlaps and must be unique within the plugin. Empty string throws |

## 返回的 StyleKit

> EN: Returned StyleKit

| 参数 | 类型 | 默认 | 说明(zh) | 说明(en) |
|---|---|---|---|---|
| `id` | `string` | — | 回显 | Echoed back |
| `tokensCss` | `string` | — | 已替换前缀的 token CSS 文本 | Token CSS text with the prefix already substituted |
| `cssVar(name)` | `(name: string) => string` | — | 拼变量名：`cssVar('fg')` ⇒ `--acme-fg` | Build a var name: `cssVar('fg')` ⇒ `--acme-fg` |
| `registerStyle(domain, css)` | `(domain: string, css: string) => void` | — | 登记一个域的 CSS；同名重复登记 = 覆盖 | Register a domain’s CSS; re-registering the same domain overwrites |
| `ensureStyles()` | `() => void` | — | 确保标签已挂载且内容最新（幂等；无 document 静默跳过） | Ensure the tag is mounted and current (idempotent; silently skips without document) |
| `applyStyle(domain, css)` | `(domain: string, css: string) => void` | — | 登记 + 立刻挂载 | Register and mount immediately |
| `dispose()` | `() => void` | — | 撤掉标签并清空登记域（插件卸载 / HMR 时用） | Remove the tag and clear registered domains (on plugin unload / HMR) |

## 最小可用

> EN: Minimal usage

```ts id="design-minimal"
import { createStyleKit } from 'dsh-plugin-core/design'

const kit = createStyleKit({ id: 'dsh-task-reminder-ui' })
kit.applyStyle('tokens', kit.tokensCss)
// 之后自己的样式域：
kit.applyStyle('widget', '.widget{color:var(--dshpc-fg)}')
```

## token 口径

> EN: Token conventions

token 覆盖颜色 / 尺寸 / 字号 / 层级，**含深色覆盖段**。取值一律走 `var(--dshpc-*)`，不在规则里写死颜色值。

> EN: Tokens cover color / size / font-size / elevation, **including the dark-mode override block**. Always read values via `var(--dshpc-*)`, never hard-code colors in rules.

完整清单与命名口径见 [`../style.md`](../style.md)。

> EN: Full list and naming conventions: [`../style.md`](../style.md).

## 定制边界

> EN: Customization boundary

token 的**前缀固定 `dshpc`**（不参数化、不按插件改名）；token 的**内容**（有哪些变量、值是什么）是本包定的审美标准，消费方通过覆盖变量值来适配，不要改本包源码。

> EN: The token **prefix is fixed to `dshpc`** (not parameterized, not renamed per plugin); the token **content** (which variables exist, what values) is this package’s aesthetic standard — consumers adapt by overriding variable values, not by editing this package’s source.

要整套换肤：给同一批变量名赋新值即可，不需要 fork。

> EN: To reskin entirely: assign new values to the same variable names; no fork needed.
