# utils —— 通用方法

> EN: utils — common helpers

本文件由 `scripts/gen-docs.mjs` 从同名 `.doc.ts` 生成，请勿手改。

导出：pad2、formatDateTime、formatYmd、formatClock、formatDurationHms、sameCalendarDay、relativePast、relativeFuture、formatRange、overlaps、baseNameOf、safeTrim、truncateBytes、formatBytes、formatCount、request、requestJson、HttpError、setLocale、getLocale、t、type Translate

## 概览

> EN: Overview

零 React、零 DOM、零 design 依赖。装的是「和界面无关的纯方法」。

> EN: Zero React, zero DOM, zero design dependency. Pure, UI-agnostic helpers.

## 日期

> EN: Date

全部走本机时区；解析失败一律不抛错、按兜底返回，不编造时间。

> EN: All use the local timezone; parse failures never throw — they fall back as specified, never inventing a time.

relativePast 与 relativeFuture 是对偶的：调度表这类展示未来时间的场景必须用 relativeFuture——用 relativePast 会把「3 分钟后」显示成「刚刚」，直接丢语义。

> EN: `relativePast` and `relativeFuture` are duals: for future times (e.g. a schedule) you must use `relativeFuture`; using `relativePast` would render "in 3 minutes" as "just now", losing meaning.

| 参数 | 类型 | 默认 | 说明(zh) | 说明(en) |
|---|---|---|---|---|
| `pad2` | `(value: number \| string) => string` | — | `9` ⇒ `'09'` | `9` ⇒ `'09'` |
| `formatDateTime` | `(iso, opts?: { seconds?, fallback? }) => string` | — | 解析失败 ⇒ opts.fallback，缺省原串；seconds:true 补 :ss | On parse failure ⇒ opts.fallback (default: the original string); seconds:true appends :ss |
| `formatYmd` | `(iso, opts?: { fallback? }) => string` | — | 解析失败 ⇒ opts.fallback，缺省 — | On parse failure ⇒ opts.fallback (default —) |
| `formatClock` | `(iso: string \| null \| undefined, opts?: { fallback? }) => string` | — | 空值/解析失败 ⇒ opts.fallback，缺省 - | Null/parse failure ⇒ opts.fallback (default -) |
| `formatDurationHms` | `(ms: number) => string` | — | 有小时 ⇒ H:MM:SS，否则 MM:SS；负数/NaN ⇒ - | Has hours ⇒ H:MM:SS, else MM:SS; negative/NaN ⇒ - |
| `sameCalendarDay` | `(a: Date, b: Date) => boolean` | — | 本机时区比年月日 | Compares year/month/day in local tz |
| `relativePast` | `(iso, nowMs, translate?) => string` | — | 过去时间 ⇒ 「3 分钟前」；未来/解析失败 ⇒ 「刚刚」 | Past ⇒ "3 minutes ago"; future/parse failure ⇒ "just now" |
| `relativeFuture` | `(iso, nowMs, translate?) => string` | — | 未来时间 ⇒ 「3 分钟后」；解析失败回退 formatYmd | Future ⇒ "in 3 minutes"; parse failure falls back to formatYmd |
| `formatRange` | `(fromIso, toIso, opts?: { seconds? }) => string` | — | 同天 ⇒ 09:00 – 10:30；跨天两端带日期 | Same day ⇒ 09:00 – 10:30; across days both ends show dates |
| `overlaps` | `(aFrom, aTo, bFrom, bTo) => boolean` | — | 半开区间 [from, to)；NaN ⇒ 不重叠 | Half-open [from, to); NaN ⇒ no overlap |

## 字符串

> EN: String

| 参数 | 类型 | 默认 | 说明(zh) | 说明(en) |
|---|---|---|---|---|
| `baseNameOf` | `(path: string) => string` | — | 取末段；目录尾斜杠不会取成空串 | Last segment; a trailing slash never yields empty |
| `safeTrim` | `(s: string) => string` | — | 去首尾空白 | Trim surrounding whitespace |
| `truncateBytes` | `(s: string, maxBytes: number) => string` | — | 按 UTF-8 字节截断，不切半个字 | Truncate by UTF-8 bytes without splitting a char |

## 数字

> EN: Number

| 参数 | 类型 | 默认 | 说明(zh) | 说明(en) |
|---|---|---|---|---|
| `formatBytes` | `(bytes: number) => string` | — | `12 KB` / `3.4 MB`；0 与负数 ⇒ — | `12 KB` / `3.4 MB`; 0 and negatives ⇒ — |
| `formatCount` | `(n: number) => string` | — | 千分位 | Thousands separator |

## HTTP

> EN: HTTP

RequestOptions：{ timeoutMs?, signal?, method?, body?, headers? }。

> EN: `RequestOptions`: { timeoutMs?, signal?, method?, body?, headers? }.

| 参数 | 类型 | 默认 | 说明(zh) | 说明(en) |
|---|---|---|---|---|
| `request` | `(url, opts?: RequestOptions) => Promise<Response>` | — | 带超时（默认 10s）与 AbortSignal | With timeout (default 10s) and AbortSignal |
| `requestJson` | `<T>(url, opts?) => Promise<T>` | — | 自动解析 JSON | Parses JSON automatically |
| `HttpError` | `class extends Error` | — | 带 status；超时抛 AbortError | Carries status; timeout throws AbortError |

## 多语言

> EN: i18n

核心提供的固定提示语（控件错误、加载中、空态…）由本包内置中英字典管。

> EN: The fixed copy the core ships (control errors, loading, empty states…) is managed by this package’s built-in zh/en dictionary.

边界：插件自己界面的文案由插件自己管，本包不提供插件级 i18n 框架。想覆盖某条文案：给组件传 translate prop，或给自己的场景直接用 t + 自定义字典。

> EN: Boundary: a plugin’s own UI copy is the plugin’s responsibility; this package offers no plugin-level i18n framework. To override a string: pass a `translate` prop, or use `t` with your own dictionary.

语言默认跟随宿主：官方 locale 插件把生效语言写进 `<html lang>`（zh → `zh-CN`），本包直接读它 ⇒ 插件不必再接 locale 服务、也不必自己同步。`setLocale` 只是手动覆盖（测试 / 非宿主环境用），调过就不再跟随宿主，传 `null` 恢复跟随。

> EN: The language follows the host by default: the official locale plugin writes the active language into `<html lang>` (zh → `zh-CN`) and this package reads it directly, so a plugin needs neither the locale service nor its own sync. `setLocale` is only a manual override (tests / non-host environments); once called it stops following the host, and passing `null` resumes it.

可用 key 全集见 src/utils/i18n.ts 的 UtilMessageKey；要在宿主切语言时重渲组件，顶层调一次 `useLocale()`（ui 导出）。

> EN: Full key list: `UtilMessageKey` in `src/utils/i18n.ts`; to re-render on a host language switch, call `useLocale()` (exported from ui) once at the top of a component.

| 参数 | 类型 | 默认 | 说明(zh) | 说明(en) |
|---|---|---|---|---|
| `setLocale(locale)` | `('zh' \| 'en' \| null) => void` | 不调则跟随宿主 | 手动覆盖语言（测试 / 非宿主）；传 `null` 恢复跟随宿主 `<html lang>` | Manual override (tests / non-host); pass `null` to follow the host `<html lang>` again |
| `getLocale()` | `() => string` | — | 当前语言（默认跟随宿主） | Current locale (follows the host by default) |
| `t(key, vars?)` | `(key, vars?) => string` | — | 取文案；{n} 占位由 vars 填 | Get copy; {n} placeholders filled by vars |
| `type Translate` | `(key, vars?) => string` | — | 组件都收这个参数供覆盖 | Components accept this to override copy |

## 更新日志

本文件为生成投影，变更记录在同名 `.doc.ts` 真源与本仓 git 历史。
