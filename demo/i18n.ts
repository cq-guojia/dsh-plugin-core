// demo 作为「正规 DSH 插件」的预览：界面文案自管（核心只保证单一 locale 状态，不提供插件级 i18n 框架）。
// 复用核心的 getLocale() 单一语言状态，字典与 key 由本 demo 自己维护。
import { getLocale } from '../dist/utils/index.js'

export type Locale = 'zh' | 'en'

/** demo 界面提示文案的 key（标题不在范围内，只管 hint / FieldHint 这类「提示」内容）。 */
export type DemoMessageKey =
  | 'sessionHint'
  | 'explorerHint'
  | 'utilsHint'
  | 'displayCardHint'
  | 'displayStripHint'
  | 'displayChipHint'
  | 'feedbackModalHint'
  | 'feedbackToastHint'
  | 'pickerHint'
  | 'modelPickerHint'
  | 'workspacePickerHint'
  | 'buttonHint'
  | 'inputHint'
  | 'checkboxHint'
  | 'designTokenHint'
  | 'designInjectHint'
  | 'fieldHintDate'
  | 'loadingNote'

const DICT: Record<Locale, Record<DemoMessageKey, string>> = {
  zh: {
    sessionHint: '三种承载：modal / sidebar / page；source 是 mock 的；renderMessage 可接管富内容',
    explorerHint: '面包屑 + 目录树 + 预览；workspaceFiles 是 mock 的（真实插件从 ctx 取出后注入）',
    utilsHint: '解析失败不抛错、给兜底、不编造；所有函数无 UI 依赖',
    displayCardHint: '排版完全由调用方决定——真实插件的形态：标题行 + 右侧元信息 + chips 行；accent 五档见下方速览',
    displayStripHint: '同一个色条机制，外观是通高贴顶到底——真实插件的形态：标题 + 元信息行 + 右侧时间/操作',
    displayChipHint: 'chip 只有「胶囊标签」一套皮肤：宽度按文字撑开、不换行；最后一颗是长文字，若被压成 28px 竖排就是又混进了图标按钮的定宽规则',
    feedbackModalHint: '自绘 overlay（不用 portal）；点遮罩 / Esc / ✕ 都能关。标题栏的 ✕ 是 24×24 图标位，不该出现边框或 120px 宽的底色块',
    feedbackToastHint: '命令式 showToast，不要求挂组件',
    pickerHint: '单选 / 多选 / 上限 / 搜索 / 分组 / 空态 / 降级——全部可用 props 控制',
    modelPickerHint: 'flat 一个下拉 / cascade 先选供应商再选模型——同一份数据两种形态',
    workspacePickerHint: '数据调用方给（要跨 host↔client 边界，组件取不到）',
    buttonHint: 'variant 四档 × size 三档',
    inputHint: 'Input / PrefixedInput / NumberInput / Textarea，都支持 error 描红；行尾可挂 FieldHint 问号提示',
    checkboxHint: '外观对齐真实插件：灰底 inset（无外描边）；带描边的 default 仅供特殊场合，见下',
    designTokenHint: '颜色全部来自 design 的 token；切换右上角明暗，下面会跟着变',
    designInjectHint: '控件渲染前调一次 setStyleKit + ensureControls，token 与控件 CSS 由 kit 注入 <head>',
    fieldHintDate: '任务自该日起开始执行。可提前创建任务，至该日自动开跑；「每 N 周」亦自该日起算首周。',
    loadingNote: 'Loading 是贴到主容器右下角的指示器（anchorId 默认 dsh-tdt-main），此处不渲染以免遮挡。',
  },
  en: {
    sessionHint: 'Three carriers: modal / sidebar / page; source is mocked; renderMessage can take over rich content',
    explorerHint: 'Breadcrumb + directory tree + preview; workspaceFiles is mocked (a real plugin reads it from ctx and injects)',
    utilsHint: 'No throw on parse failure — falls back gracefully and never fabricates; all functions are UI-free',
    displayCardHint: 'Layout is entirely up to the caller — the real-plugin shape: title row + right-side meta + chips row; five accent tiers below',
    displayStripHint: 'Same accent-bar mechanism, but full-height edge-to-edge — real-plugin shape: title + meta row + right-side time/actions',
    displayChipHint: 'Chip has one pill skin only: width hugs the text, no wrap; the last one is long text — if squeezed into a 28px vertical stack, the icon-button fixed-width rule crept back in',
    feedbackModalHint: 'Hand-rolled overlay (no portal); click backdrop / Esc / ✕ all close it. The header ✕ is a 24×24 icon slot — no border or 120px-wide color block should appear',
    feedbackToastHint: 'Imperative showToast — no component mounting required',
    pickerHint: 'Single / multi / max / search / grouped / empty / degraded — all driven by props',
    modelPickerHint: 'flat: one dropdown / cascade: pick provider then model — same data, two shapes',
    workspacePickerHint: 'Data is supplied by the caller (crosses the host↔client boundary; the component cannot fetch it)',
    buttonHint: 'Four variants × three sizes',
    inputHint: 'Input / PrefixedInput / NumberInput / Textarea, all support error highlighting; a FieldHint question-mark tip can hang at the row end',
    checkboxHint: 'Looks match the real plugin: grey inset background (no outer border); the bordered default is for special cases only, see below',
    designTokenHint: 'All colors come from design tokens; switch light/dark at top-right and these update with it',
    designInjectHint: 'Call setStyleKit + ensureControls once before controls render; the kit injects tokens and control CSS into <head>',
    fieldHintDate: 'The task runs starting from this date. You can create it ahead of time and it auto-starts on that day; "every N weeks" also counts its first week from this date.',
    loadingNote: 'Loading is an indicator pinned to the bottom-right of the main container (anchorId defaults to dsh-tdt-main); not rendered here to avoid covering content.',
  },
}

/** 用本 demo 字典翻译一个 key；未知 key 直接回退 zh，再不行回退 key 本身（不抛、不空白）。 */
export function t(key: DemoMessageKey, vars?: Record<string, number | string>): string {
  const template = DICT[getLocale()][key] ?? DICT.zh[key] ?? key
  if (vars === undefined) return template
  return template.replace(/\{(\w+)\}/g, (whole, name: string): string => {
    const value = vars[name]
    return value === undefined ? whole : String(value)
  })
}
