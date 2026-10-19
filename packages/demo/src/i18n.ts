// 预览插件（packages/demo）界面文案自管（核心只保证单一 locale 状态，不提供插件级 i18n 框架）。
// 复用核心的 getLocale() 单一语言状态，字典与 key 由本插件自己维护；locale 由宿主 harness 驱动（见 client/index.tsx）。
import { getLocale } from '../../../dist/utils/index.js'

export type Locale = 'zh' | 'en'

/** demo 界面文案的 key（含菜单分类名、各 Demo 块标题、hint / FieldHint 说明；演示数据/按钮文案不在内）。 */
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
  | 'secDesign'
  | 'secButtons'
  | 'secPickers'
  | 'secFeedback'
  | 'secDisplay'
  | 'secUtils'
  | 'secExplorer'
  | 'secSession'
  | 'demoTokenPalette'
  | 'demoStyleInject'
  | 'demoInputFamily'
  | 'demoUtilsTitle'
  | 'demoCardTitle'
  | 'demoStripTitle'
  | 'designInjectNote'
  | 'pluginTitle'
  | 'pluginCardDesc'
  | 'pluginCardOpen'

export const DICT: Record<Locale, Record<DemoMessageKey, string>> = {
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
    loadingNote: 'Loading 是贴到主容器右下角的指示器（anchorId 默认 dshpc-main），此处不渲染以免遮挡。',
    secDesign: '设计基础',
    secButtons: '按钮与输入',
    secPickers: '选择器',
    secFeedback: '弹窗与反馈',
    secDisplay: '卡片与展示',
    secUtils: '通用方法',
    secExplorer: '工作区浏览',
    secSession: '会话预览',
    demoTokenPalette: 'token 色板',
    demoStyleInject: '样式注入机制',
    demoInputFamily: 'Input 家族',
    demoUtilsTitle: '日期 / 字符串 / 字节',
    demoCardTitle: 'Card（圆角 + 边框 + 短色条）',
    demoStripTitle: 'StripCard（无边框 + 通高竖线）',
    designInjectNote: '本预览插件自己就是这么做初始化的——预览与真实插件走同一条路。',
    pluginTitle: '组件预览',
    pluginCardDesc: '打开 dsh-plugin-core 的控件与业务组件展示页',
    pluginCardOpen: '打开 ›',
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
    loadingNote: 'Loading is an indicator pinned to the bottom-right of the main container (anchorId defaults to dshpc-main); not rendered here to avoid covering content.',
    secDesign: 'Design basics',
    secButtons: 'Buttons & inputs',
    secPickers: 'Pickers',
    secFeedback: 'Modal & feedback',
    secDisplay: 'Cards & display',
    secUtils: 'Utilities',
    secExplorer: 'Workspace browsing',
    secSession: 'Session preview',
    demoTokenPalette: 'Token palette',
    demoStyleInject: 'Style injection',
    demoInputFamily: 'Input family',
    demoUtilsTitle: 'Date / String / Bytes',
    demoCardTitle: 'Card (rounded + border + accent bar)',
    demoStripTitle: 'StripCard (borderless + full-height stripe)',
    designInjectNote: 'This preview plugin initializes itself exactly this way — preview and real plugin take the same path.',
    pluginTitle: 'Component preview',
    pluginCardDesc: 'Open the showcase of dsh-plugin-core controls and business components',
    pluginCardOpen: 'Open ›',
  },
}

/** 宿主 locale 绑定的翻译函数（apply 里 ctx.locale.bind 注入）；未注入时回退核心 getLocale。 */
let boundT: ((key: string, vars?: Record<string, number | string>) => string) | undefined

export function setDemoTranslate(fn: ((key: string, vars?: Record<string, number | string>) => string) | undefined): void {
  boundT = fn
}

/** 用本 demo 字典翻译一个 key；未知 key 直接回退 zh，再不行回退 key 本身（不抛、不空白）。 */
export function t(key: DemoMessageKey, vars?: Record<string, number | string>): string {
  if (boundT !== undefined) return boundT(key, vars)
  const template = DICT[getLocale()][key] ?? DICT.zh[key] ?? key
  if (vars === undefined) return template
  return template.replace(/\{(\w+)\}/g, (whole, name: string): string => {
    const value = vars[name]
    return value === undefined ? whole : String(value)
  })
}
