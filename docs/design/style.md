# 样式规范

token 口径、注入器、明暗判据、定制边界。规则依据见 `docs/design/architecture.md` §样式注入。

## 为什么样式只能运行时注入

客户端产物是 `window.__ModuleLoader__.load({ id, factory })` 的 CJS 闭包，
`import './x.css'` 只会产出独立 css 资源、**内核不加载它** ⇒ CSS 只能以 TS 字符串在运行时打进 `<style>`。

## 前缀规则

变量与类名**全生态统一 `dshpc`**，代码里直接写死，不存在按插件替换这回事。

| 名称 | 规则 |
|---|---|
| 变量 `--dshpc-*` | 直接使用；token 定义与控件样式都写这个前缀 |
| 类名 `dshpc-*` | 必须与控件里硬编码的 className 逐字一致，改一处就得全改 |

> **已知限制**：两个插件若引的 core 版本不同，`.dshpc-*` 规则会互相覆盖（同版本内容一致、无害）。
> 隔离靠 style 标签 id（`createStyleKit({ id })`）。

## 明暗判据（硬约束）

```ts
export const DARK_THEME_SELECTOR = 'body[data-ds-dark-theme]'
```

- 由**宿主启动脚本** `toggleAttribute` 写入 body，反映的是**用户在客户端里的选择**。
- **禁止用 `prefers-color-scheme`**：它跟的是系统，不是用户在宿主里的选择。
  两者会分叉——系统亮色 + 用户在 DSH 里选暗色时，跟 `prefers-color-scheme` 会显示成亮色，与宿主不一致。

## token 清单

token 原文提取自 `dsh-task-dispatch-table/src/client/ui/tokens.ts`，含深色覆盖段。
分类（命名口径保持原样，只换前缀）：

| 类别 | 例 |
|---|---|
| 前景 / 背景面 | `--dshpc-fg` `--dshpc-fg-3` `--dshpc-fg-4` `--dshpc-surface-1` `--dshpc-surface-2` `--dshpc-surface-sunken` `--dshpc-surface-menu` `--dshpc-surface-base` |
| 边框 | `--dshpc-border` `--dshpc-border-faint` |
| 间距 | `--dshpc-space-1` … `--dshpc-space-3` |
| 字号 / 行高 | `--dshpc-font-sm` `--dshpc-font-lg` `--dshpc-line-sm` `--dshpc-line-md` `--dshpc-line-lg` |
| 语义色 | `--dshpc-business` `--dshpc-success` `--dshpc-danger` `--dshpc-warning` `--dshpc-link` |
| 语义面 | `--dshpc-open-bg` `--dshpc-open-bg-soft` `--dshpc-chip-bg` `--dshpc-chip-bg-hover` |
| 代码 | `--dshpc-code-surface` `--dshpc-code-font` |

完整清单以 `src/design/tokens-css.ts` 为准（**真源在代码，不在这里抄第二份**）。
消费方查某个变量叫什么：`kit.cssVar('fg')` 或直接 grep `tokens-css.ts`。

## 三条硬规矩

1. 不许再有第二处 `document.createElement('style')` —— 一律走 kit。
2. 不许再出现第二套 style 标签 id —— 一个插件一套 kit。
3. 域内的规则只能消费 `var(--dshpc-*)`，颜色 / 尺寸 / 字号一律来自 token 层，不写死值。

## 定制边界

- **换肤**：给同一批变量名赋新值（在插件自己的样式域里覆盖），不需要 fork。
- **加域**：`kit.registerStyle('widget', css)`，同一域重复登记 = 覆盖。
- **`tokens` 域恒排最前**（变量定义必须先于消费它的规则），kit 内部已保证。
- 皮肤写在调用方自己的样式域里；组件只认 token，不认调用方的具体颜色。
