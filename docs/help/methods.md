# 方法规范（`utils`）

> EN: Helper conventions (`utils`)

`utils` 的口径：**解析失败不抛错、给兜底、不编造**。每个方法都按这一页的口径行事，
你可以据此预期它们的返回值。
EN: Every helper behaves as follows: **never throws on bad input, returns a fallback, never invents data**.
Rely on these guarantees when calling them.

## 总口径

> EN: Core contract

| 情形 | 统一行为 |
|---|---|
| 输入解析失败（日期 / 数字） | **不抛错**，返回兜底；兜底可传则传，不可传用固定占位 |
| 固定占位 | 日期类 `—`，时刻类 `-`，体积类 `—`；可用 `opts.fallback` 覆盖 |
| 空值（`null` / `undefined` / 空串） | 与解析失败同口径，不特殊崩 |
| 边界值（0 / 负数 / NaN） | 明确处理，不静默通过 |
| 时区 | 一律**本机时区**；要显式时区请在调用方转换后再传 |

EN: Parse failure → no throw, fallback instead; placeholders `—` / `-`, overridable via `opts.fallback`;
null/undefined/empty treated like parse failure; edge values handled explicitly; always local timezone.

## 为什么解析失败不抛错

> EN: Why no throw on bad input

这些方法大量用在渲染路径上（列表每一行都调）。一个坏数据让整页崩，不如显示一个占位符。
**但兜底不编造**：不知道就不显示，绝不猜一个时间。
EN: These run in render paths, so one bad row should not take the page down. **The fallback never invents data**:
if the value is unknown it stays blank, never a guessed time.

## 分模块口径

> EN: Per-module behavior

- **日期**：每个函数的失败返回值都列在它自己的参数表里。
  `relativePast` / `relativeFuture` 是对偶的，别用错。
- **字符串**：`truncateBytes` 按 **UTF-8 字节**截断，不切半个字（中文场景必须）。
  `baseNameOf` 处理目录尾斜杠，不会取成空串。
- **数字**：`formatBytes` 对 0 与负数返回 `—`，不显示「0 B」这种假精确。
- **HTTP**：默认 10s 超时；超时抛 `AbortError`，非 2xx 抛带 `status` 的 `HttpError`。

EN: Dates: each function’s failure return is listed in its own parameter table; `relativePast`/`relativeFuture`
are duals. Strings: `truncateBytes` cuts by UTF-8 bytes. Numbers: `formatBytes` returns `—` for 0 and
negatives. HTTP: 10s timeout, `AbortError` on timeout, `HttpError` with `status` on non-2xx.

## 多语言口径

> EN: Localization

- 本包自带的固定提示语：**内置中英**，`setLocale` 切换。
- 需要文案的 API 一律可传 `translate: Translate` 覆盖；不传走内置。
- 插件自己界面的文案由插件自管——本包不提供插件级 i18n 框架。

EN: Built-in prompts ship with zh/en (`setLocale` to switch); any API that renders text takes
`translate: Translate` to override; your plugin’s own UI copy is yours to manage.
