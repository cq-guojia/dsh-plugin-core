# 样式（怎么用 `design`）

> EN: Styles (using `design`)

本包的样式是**运行时注入**的 TS 字符串：核心提供一套 token 与注入器，控件只认 token。
你这一侧要做的就是建一个 kit、必要时换肤。

EN: Styles ship as **runtime-injected TS strings**: core provides tokens plus an injector, and controls read
tokens only. On your side this means creating one kit and optionally reskinning it.

## 前缀规则

> EN: Prefix rules

变量与类名**全生态统一 `dshpc`**，固定不变，不存在按插件替换这回事。

EN: Both variables and class names are fixed as `dshpc` across the whole ecosystem; there is no per-plugin rename.

| 名称 | 规则 |
|---|---|
| 变量 `--dshpc-*` | 直接使用；token 定义与控件样式都写这个前缀 |
| 类名 `dshpc-*` | 与控件硬编码的 className 一致，改动需两边同步 |

EN: Variables `--dshpc-*` are used directly; class names `dshpc-*` mirror the hardcoded classNames in controls.

> **已知限制**：两种用法都不影响——多个插件引不同版本的 core 时，同名规则会互相覆盖，因此用 `createStyleKit({ id })` 隔离。
> EN: **Known limit**: plugins on different core versions share identical rule names and overwrite each other;
> isolation comes from the style tag id (`createStyleKit({ id })`).

## 明暗判据（硬约束）

> EN: Dark-mode predicate (hard constraint)

```ts
export const DARK_THEME_SELECTOR = 'body[data-ds-dark-theme]'
```

- 由**宿主启动脚本**写入 body，反映**用户在客户端里的选择**。
- **不要用 `prefers-color-scheme`**：它跟的是系统，不是用户在宿主里的选择。系统亮色 + 用户在 DSH 里选暗色时，
  跟 `prefers-color-scheme` 会显示成亮色，与宿主不一致。

EN: The host bootstrap writes that attribute; it tracks the user’s in-client choice. Never use
`prefers-color-scheme` — it tracks the OS, which can disagree with the host and render the wrong theme.

## token 清单

> EN: Token inventory

分类（命名口径稳定，token 名原样使用）：

EN: Categories below; token names are stable and used as-is.

| 类别 | 例 |
|---|---|
| 前景 / 背景面 | `--dshpc-fg` `--dshpc-fg-3` `--dshpc-fg-4` `--dshpc-surface-1` `--dshpc-surface-2` `--dshpc-surface-sunken` `--dshpc-surface-menu` `--dshpc-surface-base` |
| 边框 | `--dshpc-border` `--dshpc-border-faint` |
| 间距 | `--dshpc-space-1` … `--dshpc-space-3` |
| 字号 / 行高 | `--dshpc-font-sm` `--dshpc-font-lg` `--dshpc-line-sm` `--dshpc-line-md` `--dshpc-line-lg` |
| 语义色 | `--dshpc-business` `--dshpc-success` `--dshpc-danger` `--dshpc-warning` `--dshpc-link` |
| 语义面 | `--dshpc-open-bg` `--dshpc-open-bg-soft` `--dshpc-chip-bg` `--dshpc-chip-bg-hover` |
| 代码 | `--dshpc-code-surface` `--dshpc-code-font` |

完整清单以 `src/design/tokens-css.ts` 为准（真源在代码，不在这里抄第二份）。
查某个变量叫什么：`kit.cssVar('fg')` 或直接 grep `tokens-css.ts`。

EN: The authoritative list lives in `src/design/tokens-css.ts`. Look up a variable with `kit.cssVar('fg')`
or by grepping `tokens-css.ts`.

## 定制边界

> EN: Customization surface

- **换肤**：给同一批变量名赋新值（在你自己域名下覆盖），不需要 fork。
- **加域**：`kit.registerStyle('widget', css)`；同一域重复登记 = 覆盖。
- **`tokens` 域恒排最前**（变量定义必须先于消费它的规则），kit 内部已保证顺序。
- 皮肤写在调用方自己的样式域里；组件只认 token，不认调用方的具体颜色。

EN: Reskin by reassigning the same variables inside your own style domain (no fork needed). Add a domain with
`kit.registerStyle('widget', css)`; re-registering a domain overwrites it. The `tokens` domain always comes
first — core maintains that ordering. Skin lives in the caller’s domain; components only read tokens.
