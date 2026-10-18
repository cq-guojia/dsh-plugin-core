# utils —— 通用方法

零 React、零 DOM、零 `design` 依赖。装的是「和界面无关的纯方法」。

## 日期（`date.ts`）

全部走**本机时区**；解析失败一律不抛错、按兜底返回，不编造时间。

| 函数 | 签名 | 边界行为 |
|---|---|---|
| `pad2` | `(value: number \| string) => string` | `9` ⇒ `'09'` |
| `formatDateTime` | `(iso, opts?: { seconds?, fallback? }) => string` | 解析失败 ⇒ `opts.fallback`，缺省**原串**；`seconds: true` 补 `:ss` |
| `formatYmd` | `(iso, opts?: { fallback? }) => string` | 解析失败 ⇒ `opts.fallback`，缺省 `—` |
| `formatClock` | `(iso: string \| null \| undefined, opts?: { fallback? }) => string` | 空值/解析失败 ⇒ `opts.fallback`，缺省 `-` |
| `formatDurationHms` | `(ms: number) => string` | 有小时 ⇒ `H:MM:SS`，否则 `MM:SS`；负数/NaN ⇒ `-` |
| `sameCalendarDay` | `(a: Date, b: Date) => boolean` | 本机时区比年月日 |
| `relativePast` | `(iso, nowMs, translate?) => string` | 过去时间 ⇒ 「3 分钟前」；未来/解析失败 ⇒ 「刚刚」 |
| `relativeFuture` | `(iso, nowMs, translate?) => string` | 未来时间 ⇒ 「3 分钟后」；解析失败回退 `formatYmd` |
| `formatRange` | `(fromIso, toIso, opts?: { seconds? }) => string` | 同天 ⇒ `09:00 – 10:30`；跨天两端带日期 |
| `overlaps` | `(aFrom, aTo, bFrom, bTo) => boolean` | 半开区间 `[from, to)`；NaN ⇒ 不重叠 |

> `relativePast` 与 `relativeFuture` 是**对偶**的：调度表这类展示未来时间的场景必须用
> `relativeFuture`——用 `relativePast` 会把「3 分钟后」显示成「刚刚」，直接丢语义。

## 字符串 / 数字

| 函数 | 签名 | 边界行为 |
|---|---|---|
| `baseNameOf` | `(path: string) => string` | 取末段；目录尾斜杠不会取成空串 |
| `safeTrim` | `(s: string) => string` | 去首尾空白 |
| `truncateBytes` | `(s: string, maxBytes: number) => string` | 按 **UTF-8 字节**截断，不切半个字 |
| `formatBytes` | `(bytes: number) => string` | `12 KB` / `3.4 MB`；0 与负数 ⇒ `—` |
| `formatCount` | `(n: number) => string` | 千分位 |

## HTTP

| 函数 | 签名 | 说明 |
|---|---|---|
| `request` | `(url, opts?: RequestOptions) => Promise<Response>` | 带超时（默认 10s）与 `AbortSignal` |
| `requestJson` | `<T>(url, opts?) => Promise<T>` | 自动解析 JSON |
| `HttpError` | `class extends Error` | 带 `status`；超时抛 `AbortError` |

`RequestOptions`：`{ timeoutMs?, signal?, method?, body?, headers? }`。

## 多语言（`i18n.ts`）

核心提供的固定提示语（控件错误、加载中、空态…）由本包内置中英字典管。

| 函数 | 说明 |
|---|---|
| `setLocale(locale)` | `'zh'`（默认）/ `'en'` |
| `getLocale()` | 当前语言 |
| `t(key, vars?)` | 取文案；`{n}` 占位由 `vars` 填 |
| `type Translate` | `(key, vars?) => string`，组件都收这个参数供覆盖 |

**边界**：插件自己界面的文案由插件自己管，本包不提供插件级 i18n 框架。
想覆盖某条文案：给组件传 `translate` prop，或给自己的场景直接用 `t` + 自定义字典。

可用 key 全集见 `src/utils/i18n.ts` 的 `UtilMessageKey`。

## 定制边界

- 这些是纯函数，**直接调用即可**，没有需要 fork 的场景。
- 时区口径固定本机时区（沿用三家现有口径）—— 要显式时区请在调用方转换后再传进来。
