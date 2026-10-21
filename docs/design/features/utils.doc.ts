// utils 子包的使用帮助 —— 真源（TS 数据模块）。内容全在此一处，demo 与 md 都从这份派生。
import type { DocTopic } from '../doc-format.js'

const doc: DocTopic = {
  title: { zh: 'utils —— 通用方法', en: 'utils — common helpers' },
  exports: [
    'pad2', 'formatDateTime', 'formatYmd', 'formatClock', 'formatDurationHms',
    'sameCalendarDay', 'relativePast', 'relativeFuture', 'formatRange', 'overlaps',
    'baseNameOf', 'safeTrim', 'truncateBytes', 'formatBytes', 'formatCount',
    'request', 'requestJson', 'HttpError', 'setLocale', 'getLocale', 't', 'type Translate',
  ],
  sections: [
    {
      id: 'utils-overview',
      heading: { zh: '概览', en: 'Overview' },
      prose: [
        {
          zh: '零 React、零 DOM、零 design 依赖。装的是「和界面无关的纯方法」。',
          en: 'Zero React, zero DOM, zero design dependency. Pure, UI-agnostic helpers.',
        },
      ],
    },
    {
      id: 'date',
      heading: { zh: '日期', en: 'Date' },
      prose: [
        {
          zh: '全部走本机时区；解析失败一律不抛错、按兜底返回，不编造时间。',
          en: 'All use the local timezone; parse failures never throw — they fall back as specified, never inventing a time.',
        },
        {
          zh: 'relativePast 与 relativeFuture 是对偶的：调度表这类展示未来时间的场景必须用 relativeFuture——用 relativePast 会把「3 分钟后」显示成「刚刚」，直接丢语义。',
          en: '`relativePast` and `relativeFuture` are duals: for future times (e.g. a schedule) you must use `relativeFuture`; using `relativePast` would render "in 3 minutes" as "just now", losing meaning.',
        },
      ],
      api: [
        {
          id: 'utils-date',
          rows: [
            { name: 'pad2', type: '(value: number | string) => string', def: '—', desc: { zh: '`9` ⇒ `\'09\'`', en: '`9` ⇒ `\'09\'`' } },
            { name: 'formatDateTime', type: '(iso, opts?: { seconds?, fallback? }) => string', def: '—', desc: { zh: '解析失败 ⇒ opts.fallback，缺省原串；seconds:true 补 :ss', en: 'On parse failure ⇒ opts.fallback (default: the original string); seconds:true appends :ss' } },
            { name: 'formatYmd', type: '(iso, opts?: { fallback? }) => string', def: '—', desc: { zh: '解析失败 ⇒ opts.fallback，缺省 —', en: 'On parse failure ⇒ opts.fallback (default —)' } },
            { name: 'formatClock', type: '(iso: string | null | undefined, opts?: { fallback? }) => string', def: '—', desc: { zh: '空值/解析失败 ⇒ opts.fallback，缺省 -', en: 'Null/parse failure ⇒ opts.fallback (default -)' } },
            { name: 'formatDurationHms', type: '(ms: number) => string', def: '—', desc: { zh: '有小时 ⇒ H:MM:SS，否则 MM:SS；负数/NaN ⇒ -', en: 'Has hours ⇒ H:MM:SS, else MM:SS; negative/NaN ⇒ -' } },
            { name: 'sameCalendarDay', type: '(a: Date, b: Date) => boolean', def: '—', desc: { zh: '本机时区比年月日', en: 'Compares year/month/day in local tz' } },
            { name: 'relativePast', type: '(iso, nowMs, translate?) => string', def: '—', desc: { zh: '过去时间 ⇒ 「3 分钟前」；未来/解析失败 ⇒ 「刚刚」', en: 'Past ⇒ "3 minutes ago"; future/parse failure ⇒ "just now"' } },
            { name: 'relativeFuture', type: '(iso, nowMs, translate?) => string', def: '—', desc: { zh: '未来时间 ⇒ 「3 分钟后」；解析失败回退 formatYmd', en: 'Future ⇒ "in 3 minutes"; parse failure falls back to formatYmd' } },
            { name: 'formatRange', type: '(fromIso, toIso, opts?: { seconds? }) => string', def: '—', desc: { zh: '同天 ⇒ 09:00 – 10:30；跨天两端带日期', en: 'Same day ⇒ 09:00 – 10:30; across days both ends show dates' } },
            { name: 'overlaps', type: '(aFrom, aTo, bFrom, bTo) => boolean', def: '—', desc: { zh: '半开区间 [from, to)；NaN ⇒ 不重叠', en: 'Half-open [from, to); NaN ⇒ no overlap' } },
          ],
        },
      ],
    },
    {
      id: 'text',
      heading: { zh: '字符串', en: 'String' },
      api: [
        {
          id: 'utils-text',
          rows: [
            { name: 'baseNameOf', type: '(path: string) => string', def: '—', desc: { zh: '取末段；目录尾斜杠不会取成空串', en: 'Last segment; a trailing slash never yields empty' } },
            { name: 'safeTrim', type: '(s: string) => string', def: '—', desc: { zh: '去首尾空白', en: 'Trim surrounding whitespace' } },
            { name: 'truncateBytes', type: '(s: string, maxBytes: number) => string', def: '—', desc: { zh: '按 UTF-8 字节截断，不切半个字', en: 'Truncate by UTF-8 bytes without splitting a char' } },
          ],
        },
      ],
    },
    {
      id: 'number',
      heading: { zh: '数字', en: 'Number' },
      api: [
        {
          id: 'utils-number',
          rows: [
            { name: 'formatBytes', type: '(bytes: number) => string', def: '—', desc: { zh: '`12 KB` / `3.4 MB`；0 与负数 ⇒ —', en: '`12 KB` / `3.4 MB`; 0 and negatives ⇒ —' } },
            { name: 'formatCount', type: '(n: number) => string', def: '—', desc: { zh: '千分位', en: 'Thousands separator' } },
          ],
        },
      ],
    },
    {
      id: 'http',
      heading: { zh: 'HTTP', en: 'HTTP' },
      api: [
        {
          id: 'utils-http',
          rows: [
            { name: 'request', type: '(url, opts?: RequestOptions) => Promise<Response>', def: '—', desc: { zh: '带超时（默认 10s）与 AbortSignal', en: 'With timeout (default 10s) and AbortSignal' } },
            { name: 'requestJson', type: '<T>(url, opts?) => Promise<T>', def: '—', desc: { zh: '自动解析 JSON', en: 'Parses JSON automatically' } },
            { name: 'HttpError', type: 'class extends Error', def: '—', desc: { zh: '带 status；超时抛 AbortError', en: 'Carries status; timeout throws AbortError' } },
          ],
        },
      ],
      prose: [
        {
          zh: 'RequestOptions：{ timeoutMs?, signal?, method?, body?, headers? }。',
          en: '`RequestOptions`: { timeoutMs?, signal?, method?, body?, headers? }.',
        },
      ],
    },
    {
      id: 'i18n',
      heading: { zh: '多语言', en: 'i18n' },
      prose: [
        {
          zh: '核心提供的固定提示语（控件错误、加载中、空态…）由本包内置中英字典管。',
          en: 'The fixed copy the core ships (control errors, loading, empty states…) is managed by this package’s built-in zh/en dictionary.',
        },
        {
          zh: '边界：插件自己界面的文案由插件自己管，本包不提供插件级 i18n 框架。想覆盖某条文案：给组件传 translate prop，或给自己的场景直接用 t + 自定义字典。',
          en: 'Boundary: a plugin’s own UI copy is the plugin’s responsibility; this package offers no plugin-level i18n framework. To override a string: pass a `translate` prop, or use `t` with your own dictionary.',
        },
        {
          zh: '可用 key 全集见 src/utils/i18n.ts 的 UtilMessageKey。',
          en: 'Full key list: `UtilMessageKey` in `src/utils/i18n.ts`.',
        },
      ],
      api: [
        {
          id: 'utils-i18n',
          rows: [
            { name: 'setLocale(locale)', type: "('zh' | 'en') => void", def: '—', desc: { zh: "'zh'（默认）/ 'en'", en: "'zh' (default) / 'en'" } },
            { name: 'getLocale()', type: '() => string', def: '—', desc: { zh: '当前语言', en: 'Current locale' } },
            { name: 't(key, vars?)', type: '(key, vars?) => string', def: '—', desc: { zh: '取文案；{n} 占位由 vars 填', en: 'Get copy; {n} placeholders filled by vars' } },
            { name: 'type Translate', type: '(key, vars?) => string', def: '—', desc: { zh: '组件都收这个参数供覆盖', en: 'Components accept this to override copy' } },
          ],
        },
      ],
    },
  ],
}

export default doc
