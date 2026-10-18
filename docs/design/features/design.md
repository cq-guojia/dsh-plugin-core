# design —— 样式层

零 React、无组件。装的是「值 + 注入机制」：token 变量表、注入器工厂、主题判据。

只想统一配色/尺寸但自己写组件的插件，只引这一个就够。

## 导出

| 符号 | 说明 |
|---|---|
| `createStyleKit(options)` | 领一套本插件专属的样式设施（**必调**） |
| `buildTokensCss(prefix)` | 只生成替换过前缀的 token CSS（一般不用直接调） |
| `DARK_THEME_SELECTOR` | 明暗判据选择器常量 `body[data-ds-dark-theme]` |
| `type StyleKit` / `StyleKitOptions` | 类型 |

## `createStyleKit(options)`

| 参数 | 类型 | 必填 | 默认 | 说明 |
|---|---|---|---|---|
| `id` | `string` | 是 | — | `<style>` 标签 id，**多插件同页靠它互不覆盖**，必须插件内唯一。空串抛错 |
| `prefix` | `string` | 是 | — | CSS 变量前缀，如 `acme` ⇒ `--acme-fg`。必须字母开头、只含字母数字与连字符，否则抛错 |

返回的 `StyleKit`：

| 成员 | 说明 |
|---|---|
| `id` / `prefix` | 回显 |
| `tokensCss` | 已替换前缀的 token CSS 文本 |
| `cssVar(name)` | 拼变量名：`cssVar('fg')` ⇒ `--acme-fg` |
| `registerStyle(domain, css)` | 登记一个域的 CSS；同名重复登记 = 覆盖 |
| `ensureStyles()` | 确保标签已挂载且内容最新（幂等；无 document 静默跳过） |
| `applyStyle(domain, css)` | 登记 + 立刻挂载 |
| `dispose()` | 撤掉标签并清空登记域（插件卸载 / HMR 时用） |

## 最小可用

```ts
import { createStyleKit } from 'dsh-plugin-core/design'

const kit = createStyleKit({ id: 'my-plugin-ui', prefix: 'myplugin' })
kit.applyStyle('tokens', kit.tokensCss)
// 之后自己的样式域：
kit.applyStyle('my-widget', '.my-widget{color:var(--myplugin-fg)}')
```

## token 口径

token 来自 `dsh-task-dispatch-table/src/client/ui/tokens.ts` 的整段提取（颜色 / 尺寸 / 字号 /
层级），**含深色覆盖段**。取值一律走 `var(--<prefix>-*)`，不在规则里写死颜色值。

完整清单与命名口径见 [`../style.md`](../style.md)。

## 定制边界

- token 的**前缀**可参数化；token 的**内容**（有哪些变量、值是什么）是本包定的审美标准，
  消费方通过覆盖变量值来适配，不要改本包源码。
- 要整套换肤：给同一批变量名赋新值即可，不需要 fork。
