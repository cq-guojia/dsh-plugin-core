// 预览插件（packages/demo）界面文案自管（核心只保证单一 locale 状态，不提供插件级 i18n 框架）。
// 复用核心的 getLocale() 单一语言状态，字典与 key 由本插件自己维护；locale 由宿主 harness 驱动（见 client/index.tsx）。
import { getLocale } from '../../../dist/utils/index.js'

export type Locale = 'zh' | 'en'

/** demo 界面文案的 key（含六个分组名、25 个页面标题、各 Demo 块 hint、空页待补说明；演示数据/按钮文案不在内）。 */
export type DemoMessageKey =
  | 'grpStart'
  | 'grpComponents'
  | 'grpBlocks'
  | 'grpUtils'
  | 'grpReference'
  | 'secOverview'
  | 'secInstall'
  | 'secQuickstart'
  | 'secFoundation'
  | 'secWritePlugin'
  | 'secReference'
  | 'secNaming'
  | 'secButton'
  | 'secInput'
  | 'secPicker'
  | 'secTooltip'
  | 'secCard'
  | 'secChip'
  | 'secFeedback'
  | 'secLayout'
  | 'secExplorer'
  | 'secSession'
  | 'secDate'
  | 'secText'
  | 'secNumber'
  | 'secHttp'
  | 'secI18n'
  | 'secA11y'
  | 'secRoadmap'
  | 'secBuild'
  | 'phTodo'
  | 'inputMissingDesc'
  | 'pickerLogicDesc'
  | 'overviewDesc'
  | 'installDesc'
  | 'quickstartDesc'
  | 'tokensHint'
  | 'darkHint'
  | 'darkNow'
  | 'injectHint'
  | 'namingDesc'
  | 'btnTextTitle'
  | 'btnTextHint'
  | 'btnVariantTitle'
  | 'btnVariantHint'
  | 'btnSizeTitle'
  | 'btnSizeHint'
  | 'btnStateTitle'
  | 'btnStateHint'
  | 'btnColorTitle'
  | 'btnColorHint'
  | 'btnLabelSave'
  | 'btnLabelCancel'
  | 'btnLabelDelete'
  | 'btnLabelMixed'
  | 'btnIconOnly'
  | 'btnHintTitle'
  | 'btnHintHint'
  | 'inputHint'
  | 'fieldHintDate'
  | 'switchTip'
  | 'checkboxHint'
  | 'pickerHint'
  | 'modelPickerHint'
  | 'workspacePickerHint'
  | 'tooltipTitle'
  | 'tooltipHint'
  | 'tooltipAnchorText'
  | 'tooltipAnchorButton'
  | 'tooltipLong'
  | 'tooltipLongText'
  | 'tooltipName'
  | 'tooltipMultiline'
  | 'tooltipRich'
  | 'cardHint'
  | 'stripHint'
  | 'sectionHeadTitle'
  | 'chipHint'
  | 'chipOverdue'
  | 'chipStalled'
  | 'chipDone'
  | 'chipDoing'
  | 'emptyStateTitle'
  | 'marqueeTitle'
  | 'liveTitle'
  | 'feedbackModalHint'
  | 'feedbackToastHint'
  | 'loadingNote'
  | 'layoutDesc'
  | 'explorerHint'
  | 'previewBodyTitle'
  | 'previewBodyHint'
  | 'sessionHint'
  | 'dateHint'
  | 'numberHint'
  | 'textDesc'
  | 'httpDesc'
  | 'i18nDesc'
  | 'i18nNow'
  | 'a11yDesc'
  | 'roadmapHint'
  | 'roadmapOut'
  | 'roadmapMirror'
  | 'roadmapPreview'
  | 'roadmapSkeleton'
  | 'roadmapLayout'
  | 'buildDesc'
  | 'buildCore'
  | 'buildDemo'
  | 'buildStamp'
  | 'demoInputFamily'
  | 'demoTokenPalette'
  | 'demoStyleInject'
  | 'designInjectNote'
  | 'demoCardTitle'
  | 'demoStripTitle'
  | 'segDay'
  | 'segWeek'
  | 'segMonth'
  | 'segAll'
  | 'segDoing'
  | 'segClaimed'
  | 'segBlocked'
  | 'segStalled'
  | 'weekday1'
  | 'weekday2'
  | 'weekday3'
  | 'weekday4'
  | 'weekday5'
  | 'weekday6'
  | 'weekday7'
  | 'pluginTitle'
  | 'pluginCardDesc'
  | 'pluginCardOpen'

export const DICT: Record<Locale, Record<DemoMessageKey, string>> = {
  zh: {
    grpStart: '入门',
    grpComponents: '控件',
    grpBlocks: '业务模块',
    grpUtils: '通用方法',
    grpReference: '参考',

    secOverview: '概览',
    secInstall: '安装与初始化',
    secQuickstart: '快速开始',
    secFoundation: '设计基础',
    secWritePlugin: '写一个插件',
    secReference: '参考与约定',
    secNaming: '命名与前缀契约',
    secButton: '按钮',
    secInput: '录入',
    secPicker: '选择器',
    secTooltip: '提示',
    secCard: '卡片与容器',
    secChip: '标签 · 文本 · 状态',
    secFeedback: '反馈',
    secLayout: '布局与滚动',
    secExplorer: '工作区浏览',
    secSession: '会话预览',
    secDate: '日期与时间',
    secText: '字符串与路径',
    secNumber: '数字与字节',
    secHttp: 'HTTP 取数',
    secI18n: '多语言',
    secA11y: '无障碍与键盘',
    secRoadmap: '缺口与路线图',
    secBuild: '版本与构建',

    phTodo: '待补内容',
    inputMissingDesc:
      '本页尚未展示：\n· PrefixedInput（带前缀的输入框）—— demо 里还没有样例\n· Loading / RunningBlocks 虽属反馈，实际渲染会挂在容器右下角，见「反馈」页的说明',
    pickerLogicDesc:
      '本页尚未展示：\n· picker-logic 导出的纯函数 filterGroups / flattenOptions / groupOf / labelsOf / toGroups / toggleValue\n' +
      '—— 它们是选择题底层的取值逻辑，没有 UI，需要一张「输入 → 输出」的速查表才讲得清',
    overviewDesc:
      '待补：\n· 包的一句话定位：谁能用、解决什么\n· 五个子包各自回答什么问题（design / ui / utils / explorer / session）\n· 一张能力地图，直接跳到对应二级页\n· 不适用边界（不是 i18n 框架、不是设置页骨架）',
    installDesc:
      '待补：\n· 依赖声明怎么装（git 安装，宿主不跑构建脚本）\n· 入口必须做的两行：setStyleKit + ensureControls\n· 为什么 @deepseek-ai/* 必须标 external（不标打包会失败）\n· 宿主 slots 注册：sidebar.panellist / main / settings.plugin.item\n· 装不上的排查清单（先看 build 编码是否变了）',
    quickstartDesc:
      '待补：\n· 一个最小可跑插件的完整源码\n· 从建目录到在宿主里看见它的分步说明\n· 本预览插件自己就是样例，可对照 packages/demo/src',
    namingDesc:
      '待补：\n· 变量与类名统一 dshpc 前缀的理由\n· 类名必须与组件里硬编码的 className 逐字一致——不一致会整片失效\n· createStyleKit({ id }) 隔离到什么粒度\n· 注入顺序：同特异性时后注入者胜出\n· 明暗判据为什么是 body[data-ds-dark-theme] 而不是系统设置',
    layoutDesc:
      '待补：\n· BackToTop 回到顶部\n· startResizeLayoutWidth 拖拽改侧栏宽度\n· SidebarLayout / SplitPane —— 需求文档已记为待补，组件尚未实现\n· 为什么现在只有底层函数没有组件',
    textDesc:
      '待补：\n· baseNameOf / safeTrim / truncateBytes 的实际表现\n· crumbsOf / extOf / joinPath / mimeOf / parentOf\n· 共同口径：解析失败一律兜底、不抛错、不编造',
    httpDesc:
      '待补：\n· request / requestJson 的用法\n· HttpError 的字段与判错方式\n· 超时 / 重试 / 鉴权怎么传',
    i18nDesc:
      '待补：\n· getLocale / setLocale：单一语言状态\n· 核心自带的多语言是「组件的固定提示语」，不含插件界面文案\n· 插件自己的文案由插件自管——本预览插件的 DICT 就是样例\n· 语言由宿主驱动，插件不自带语言选择器',
    i18nNow: '当前 locale',
    a11yDesc:
      '待补：\n· 焦点环与键盘可达性\n· Tab 顺序与 Modal 的焦点陷阱\n· role / aria-* 语义的覆盖情况\n· 对比度与 prefers-reduced-motion 的处理',

    tokensHint: '颜色全部来自 design 的 token；切换右上角明暗，下面会跟着变',
    darkHint:
      '明暗判据是写死的：宿主在 body 上挂 data-ds-dark-theme 才切暗色，不读系统的 prefers-color-scheme。插件因此不需要、也不应该自带明暗开关——下面是当前实测值，切明暗后重开本页可见变化。',
    darkNow: '当前 body[data-ds-dark-theme]',
    injectHint: '控件渲染前调一次 setStyleKit + ensureControls，token 与控件 CSS 由 kit 注入 <head>',
    demoTokenPalette: 'token 色板',
    demoStyleInject: '样式注入机制',
    designInjectNote: '本预览插件自己就是这么做初始化的——预览与真实插件走同一条路。',

    btnTextTitle: '按钮文案与语言',
    btnTextHint: '文案由调用方给：中文环境出中文、英文环境出英文；中英并排的组合也支持（最右一颗）',
    btnVariantTitle: '外观档（10 档）',
    btnVariantHint: '实心：primary / secondary / danger / success / warning / info；线框：outline / danger-outline；无底：ghost / link',
    btnSizeTitle: '尺寸 / 图标 / block',
    btnSizeHint: 'sm 24 · md 28 · lg 32 同高；icon 收的是 ReactNode——官方图标组件、自绘 SVG、甚至一个字符都行，不是名字也不是 class（下面三颗分别是这三种）；iconRight 后置、block 撑满父宽',
    btnStateTitle: '状态',
    btnStateHint: 'disabled 半透明不可点；loading 前置同色小圈并自动禁用',
    btnColorTitle: '自定义颜色',
    btnColorHint: 'color 传任意 CSS 色值：实心档作底色、线框与文字档作主色；hover / 按下自动按该色混出',
    btnLabelSave: '保存修改',
    btnLabelCancel: '取消',
    btnLabelDelete: '删除',
    btnLabelMixed: '保存 Save',
    btnIconOnly: 'icon only',
    btnHintTitle: '问号提示（FieldHint）',
    btnHintHint: '独立组件，放哪都行：标题后 / 按钮后 / 一段文字后 / 输入框后；鼠标悬停或键盘聚焦浮出气泡',

    demoInputFamily: 'Input 家族',
    inputHint: 'Input / PrefixedInput / NumberInput / Textarea，都支持 error 描红；行尾可挂 FieldHint 问号提示',
    fieldHintDate: '任务自该日起开始执行。可提前创建任务，至该日自动开跑；「每 N 周」亦自该日起算首周。',
    switchTip: '官方 Switch（启用语义，不是勾选）+ Checkbox + Segmented',
    checkboxHint: '外观对齐真实插件：灰底 inset（无外描边）；带描边的 default 仅供特殊场合（最右，可点着玩）；星期方块是多选。文案随语言切换',

    pickerHint: '单选 / 多选 / 上限 / 搜索 / 分组 / 空态 / 降级——全部可用 props 控制',
    modelPickerHint: 'flat 一个下拉 / cascade 先选供应商再选模型——同一份数据两种形态',
    workspacePickerHint: '数据调用方给（要跨 host↔client 边界，组件取不到）',

    tooltipTitle: 'Tooltip（鼠标悬停提示）',
    tooltipHint: '官方 Tooltip：side 上 / 下 / 右 × align 居中 / 贴边；锚点可以是按钮或一段文字；长文本按 maxWidth 自动折行；最右一颗是「名字 + 正文」两段式——文本里的 \\n 就是真实换行',
    tooltipAnchorText: '文字锚点',
    tooltipAnchorButton: '按钮锚点',
    tooltipLong: '长文本换行',
    tooltipName: '张三丰',
    tooltipRich: '富卡片',
    tooltipMultiline: '两段式',
    tooltipLongText: '这是一段足够长的提示文字：气泡遇到 maxWidth 会自动换行，而不会一路撑到半个屏幕宽， anchored 元素在边缘时官方还会自动把气泡收回视口内。',

    demoCardTitle: 'Card（边框 + 圆角 + 短色条）',
    demoStripTitle: 'StripCard（浅底 + 通高色条）',
    cardHint: 'surface 底 + 1px 边框 + 圆角 + 行内 6×36 圆角短条；头部整体垂直居中——action 里裸放一个元素即居中，悬停浮出的按钮、一行两行都由调用方在框内自定；真实插件形态：标题行 + 右侧元信息 + chips 行；accent 五档见下方速览',
    stripHint: '同色系浅底 + 左缘 5px 通高方角色条（照兄弟项目执行记录块）；同样整体垂直居中——流水账排版：标题 + 元信息行 + 右侧时间/操作',
    sectionHeadTitle: 'SectionHead 分区标题',
    chipHint: 'chip 两轴可选：tone 语义色（neutral 灰面 / business / success / warning / danger 实心信号面）、size（sm / md）；宽度按文字撑开、不换行；文案随语言切换（中英示例）；最后一颗长文字若被压成 28px 竖排就是又混进了图标按钮的定宽规则',
    chipOverdue: '逾期',
    chipStalled: '停滞',
    chipDone: '已完成',
    chipDoing: '进行中',
    emptyStateTitle: 'EmptyState 空态',
    marqueeTitle: 'MarqueeText 跑马灯',
    liveTitle: 'LiveText 实时文本',

    feedbackModalHint: '自绘 overlay（不用 portal）；点遮罩 / Esc / ✕ 都能关。标题栏的 ✕ 是 24×24 图标位，不该出现边框或 120px 宽的底色块',
    feedbackToastHint: '命令式 showToast，不要求挂组件',
    loadingNote: 'Loading 是贴到主容器右下角的指示器（anchorId 默认 dshpc-main），此处不渲染以免遮挡。',

    explorerHint: '面包屑 + 目录树 + 预览；workspaceFiles 是 mock 的（真实插件从 ctx 取出后注入）',
    previewBodyTitle: 'FilePreview 预览体（可单独用）',
    previewBodyHint:
      '上面那块已经包含它——ExplorerPanel 内部渲染的就是 FilePreview。\n' +
      '它同时也是一条独立子路径 dsh-plugin-core/explorer/preview：只有一个文件要显示时（会话附件、工具输出）不必搬出整个面板。\n' +
      '⚠️ 本页不另挂一块单独渲染：预览体的 path / files 由父组件注入，要脱离面板展示得先准备一份自己的数据，属于待补。',
    sessionHint: '三种承载：modal / sidebar / page；source 是 mock 的；renderMessage 可接管富内容',

    dateHint: '解析失败不抛错、给兜底、不编造；所有函数无 UI 依赖，Node 里也能跑',
    numberHint: 'formatBytes 按 1024 进制、单位自动进位；formatCount 给大数加千分位',

    roadmapHint: '下面是「明确不提供」的部分——写在这里是为了让你不用猜，也让后来人知道边界在哪。',
    roadmapOut: '设置页骨架、i18n 框架（插件文案插件自管）、host 宿主类型面',
    roadmapMirror: '官方会话 UI 的完整镜像（工具卡 / 代码块 / 推理行）——session 目前只有最简渲染，富内容走 renderMessage 扩展点',
    roadmapPreview: '代码语法高亮 / PDF / Office 预览——explorer 的预览只有文本与图片',
    roadmapSkeleton: 'SidebarLayout / SplitPane——现只有底层 resizer 函数，组件待补',
    roadmapLayout: '红线：整合以前的.share(plugins/demo)',

    buildDesc: '版本号不 bump 时，判断宿主里跑的是不是最新产物，靠的是 build 编码——每次构建都变。',
    buildCore: 'core 版本',
    buildDemo: 'demo 版本',
    buildStamp: '本次 build 编码',

    segDay: '日',
    segWeek: '周',
    segMonth: '月',
    segAll: '全部',
    segDoing: '进行中',
    segClaimed: '待认领',
    segBlocked: '阻塞',
    segStalled: '停滞',
    weekday1: '一',
    weekday2: '二',
    weekday3: '三',
    weekday4: '四',
    weekday5: '五',
    weekday6: '六',
    weekday7: '日',
    pluginTitle: '组件预览',
    pluginCardDesc: '打开 dsh-plugin-core 的控件与业务组件展示页',
    pluginCardOpen: '打开 ›',
  },
  en: {
    grpStart: 'Getting started',
    grpComponents: 'Components',
    grpBlocks: 'Blocks',
    grpUtils: 'Utilities',
    grpReference: 'Reference',

    secOverview: 'Overview',
    secInstall: 'Install & init',
    secQuickstart: 'Quick start',
    secFoundation: 'Foundations',
    secWritePlugin: 'Write a plugin',
    secReference: 'Reference',
    secNaming: 'Naming & prefix contract',
    secButton: 'Button',
    secInput: 'Inputs',
    secPicker: 'Pickers',
    secTooltip: 'Tooltip',
    secCard: 'Cards & containers',
    secChip: 'Tags · text · states',
    secFeedback: 'Feedback',
    secLayout: 'Layout & scrolling',
    secExplorer: 'Workspace browsing',
    secSession: 'Session preview',
    secDate: 'Date & time',
    secText: 'String & path',
    secNumber: 'Number & bytes',
    secHttp: 'HTTP requests',
    secI18n: 'Internationalization',
    secA11y: 'Accessibility & keyboard',
    secRoadmap: 'Gaps & roadmap',
    secBuild: 'Version & build',

    phTodo: 'To be added',
    inputMissingDesc:
      'Not shown on this page yet:\n· PrefixedInput — no sample in this demo\n· Loading / RunningBlocks belong to feedback; they pin to the container’s bottom-right, see the note on the Feedback page',
    pickerLogicDesc:
      'Not shown on this page yet:\n· The pure helpers from picker-logic: filterGroups / flattenOptions / groupOf / labelsOf / toGroups / toggleValue\n' +
      '— they are the value logic under the pickers, no UI of their own; they need an input → output cheat sheet to explain',
    overviewDesc:
      'To be added:\n· One-line positioning: who it is for, what it solves\n· What each of the five subpackages answers (design / ui / utils / explorer / session)\n· A capability map linking straight to the pages below\n· The boundary: not an i18n framework, not a settings-page skeleton',
    installDesc:
      'To be added:\n· How to install (via git — the host does not run build scripts)\n· The two mandatory entry lines: setStyleKit + ensureControls\n· Why @deepseek-ai/* must stay external (otherwise bundling fails)\n· Registering host slots: sidebar.panellist / main / settings.plugin.item\n· Checklist when it does not load (start by checking the build stamp)',
    quickstartDesc:
      'To be added:\n· Full source of a minimal working plugin\n· Step-by-step from empty folder to visible panel\n· This preview plugin is itself the sample — see packages/demo/src',
    namingDesc:
      'To be added:\n· Why variables and class names share the dshpc prefix\n· Class names must match the hard-coded className character for character — any drift kills the whole block\n· How far createStyleKit({ id }) isolates\n· Injection order: at equal specificity the later one wins\n· Why the theme switch is body[data-ds-dark-theme] and not prefers-color-scheme',
    layoutDesc:
      'To be added:\n· BackToTop\n· startResizeLayoutWidth — drag to resize a sidebar\n· SidebarLayout / SplitPane — logged as pending in the requirements doc, component not built yet\n· Why only the low-level helper exists today',
    textDesc:
      'To be added:\n· What baseNameOf / safeTrim / truncateBytes actually return\n· crumbsOf / extOf / joinPath / mimeOf / parentOf\n· Shared rule: never throw on parse failure — fall back, never fabricate',
    httpDesc:
      'To be added:\n· Using request / requestJson\n· HttpError fields and how to detect failures\n· Passing timeouts, retries and auth',
    i18nDesc:
      'To be added:\n· getLocale / setLocale: a single language state\n· What ships in the core dictionary: fixed component prompts only, no plugin UI copy\n· Plugin copy is the plugin’s own job — this preview plugin’s DICT is the sample\n· Language is driven by the host; a plugin must not ship its own language picker',
    i18nNow: 'Current locale',
    a11yDesc:
      'To be added:\n· Focus rings and keyboard reachability\n· Tab order and the Modal focus trap\n· Which role / aria-* semantics are covered\n· Contrast and prefers-reduced-motion handling',

    tokensHint: 'All colors come from design tokens; switch light/dark at top-right and these update with it',
    darkHint:
      'The switch is hard-coded: dark applies only when the host sets data-ds-dark-theme on body — prefers-color-scheme is not read. A plugin therefore needs no theme toggle of its own. The value below is measured live; toggle the theme and reopen this page to see it change.',
    darkNow: 'Current body[data-ds-dark-theme]',
    injectHint: 'Call setStyleKit + ensureControls once before controls render; the kit injects tokens and control CSS into <head>',
    demoTokenPalette: 'Token palette',
    demoStyleInject: 'Style injection',
    designInjectNote: 'This preview plugin initializes itself exactly this way — preview and real plugin take the same path.',

    btnTextTitle: 'Button labels & language',
    btnTextHint: 'Labels come from the caller: Chinese in zh, English in en; a mixed zh+en label is fine too (rightmost)',
    btnVariantTitle: 'Variants (10)',
    btnVariantHint: 'Solid: primary / secondary / danger / success / warning / info; outlined: outline / danger-outline; flat: ghost / link',
    btnSizeTitle: 'Sizes / icons / block',
    btnSizeHint: 'sm 24 · md 28 · lg 32, same height; icon takes any ReactNode — an official icon component, your own SVG, even a single character (not a name, not a class); iconRight trails, block fills the parent',
    btnStateTitle: 'States',
    btnStateHint: 'disabled is dimmed and unclickable; loading shows a same-color spinner and disables itself',
    btnColorTitle: 'Custom colors',
    btnColorHint: 'Pass any CSS color as color: solid variants use it as fill, outlined/text variants as the accent; hover/press are mixed from it',
    btnLabelSave: 'Save changes',
    btnLabelCancel: 'Cancel',
    btnLabelDelete: 'Delete',
    btnLabelMixed: 'Save 保存',
    btnIconOnly: 'icon only',
    btnHintTitle: 'Question-mark hint (FieldHint)',
    btnHintHint: 'Standalone component, drop it anywhere: after a title, a button, a sentence, or an input; hover or keyboard-focus to reveal',

    demoInputFamily: 'Input family',
    inputHint: 'Input / PrefixedInput / NumberInput / Textarea, all support error highlighting; a FieldHint question-mark tip can hang at the row end',
    fieldHintDate: 'The task runs starting from this date. You can create it ahead of time and it auto-starts on that day; "every N weeks" also counts its first week from this date.',
    switchTip: 'Official Switch (enable semantics, not a tick) + Checkbox + Segmented',
    checkboxHint: 'Looks match the real plugin: grey inset background (no outer border); the bordered default (rightmost, clickable) is for special cases; the weekday squares are multi-select. Labels follow the locale',

    pickerHint: 'Single / multi / max / search / grouped / empty / degraded — all driven by props',
    modelPickerHint: 'flat: one dropdown / cascade: pick provider then model — same data, two shapes',
    workspacePickerHint: 'Data is supplied by the caller (crosses the host↔client boundary; the component cannot fetch it)',

    tooltipTitle: 'Tooltip (hover hint)',
    tooltipHint: 'Official Tooltip: side top / bottom / right x align center / end; anchor can be a button or a span of text; long labels wrap at maxWidth; the rightmost one is a two-part hint (name + body) where \\n in the text is a real line break',
    tooltipAnchorText: 'Text anchor',
    tooltipAnchorButton: 'Button anchor',
    tooltipLong: 'Long label',
    tooltipName: 'Alex Chen',
    tooltipRich: 'Rich card',
    tooltipMultiline: 'Two-part',
    tooltipLongText: 'A deliberately long hint: the bubble wraps at maxWidth instead of stretching to half the viewport, and the official layer pulls it back inside the viewport near the edges.',

    demoCardTitle: 'Card (frame + radius + short rail)',
    demoStripTitle: 'StripCard (soft tint + full-height bar)',
    cardHint: 'Surface + 1px border + radius + inline 6×36 rounded rail; the head is vertically centered as a whole — drop a bare element into action and it centers itself; hover-floating buttons, one or two rows are all up to the caller inside the frame; real-plugin shape: title row + right-side meta + chips row; five accent tiers below',
    stripHint: 'Same-hue soft tint + 5px full-height square accent bar at the left edge (mirrors the sibling record block); equally centered as a whole — record-stream layout: title + meta row + right-side time/actions',
    sectionHeadTitle: 'SectionHead',
    chipHint: 'Two optional axes: tone (neutral grey / business / success / warning / danger solid signal) and size (sm / md); width hugs the text, no wrap; labels follow the locale (zh & en examples); if the long-text chip at the end is squeezed into a 28px vertical stack, the icon-button fixed-width rule crept back in',
    chipOverdue: 'Overdue',
    chipStalled: 'Stalled',
    chipDone: 'Done',
    chipDoing: 'In progress',
    emptyStateTitle: 'EmptyState',
    marqueeTitle: 'MarqueeText',
    liveTitle: 'LiveText',

    feedbackModalHint: 'Hand-rolled overlay (no portal); click backdrop / Esc / ✕ all close it. The header ✕ is a 24×24 icon slot — no border or 120px-wide color block should appear',
    feedbackToastHint: 'Imperative showToast — no component mounting required',
    loadingNote: 'Loading is an indicator pinned to the bottom-right of the main container (anchorId defaults to dshpc-main); not rendered here to avoid covering content.',

    explorerHint: 'Breadcrumb + directory tree + preview; workspaceFiles is mocked (a real plugin reads it from ctx and injects)',
    previewBodyTitle: 'FilePreview (usable on its own)',
    previewBodyHint:
      'The block above already includes it — ExplorerPanel renders FilePreview inside.\n' +
      'It is also a separate subpath, dsh-plugin-core/explorer/preview: when there is only one file to show (a session attachment, a tool result) you do not need the whole panel.\n' +
      '⚠️ No standalone render here: the preview body takes its path and files from the parent, so showing it outside the panel needs its own data source — still to be added.',
    sessionHint: 'Three carriers: modal / sidebar / page; source is mocked; renderMessage can take over rich content',

    dateHint: 'No throw on parse failure — falls back gracefully and never fabricates; all functions are UI-free and run in Node too',
    numberHint: 'formatBytes is 1024-based with automatic unit scaling; formatCount adds thousands separators',

    roadmapHint: 'The list below is what this package explicitly does NOT provide — written down so nobody has to guess, and so the boundary stays visible.',
    roadmapOut: 'A settings-page skeleton, an i18n framework (plugin copy is the plugin’s own job), a host typings surface',
    roadmapMirror: 'A full mirror of the official session UI (tool cards / code blocks / reasoning rows) — session renders only the minimal shape today; rich content goes through the renderMessage hook',
    roadmapPreview: 'Syntax highlighting / PDF / Office preview — the explorer preview handles text and images only',
    roadmapSkeleton: 'SidebarLayout / SplitPane — only the low-level resizer exists; the components are pending',
    roadmapLayout: 'Red line: consolidation of the old packages/demo',

    buildDesc: 'When the version number does not change, the build stamp is what tells you whether the host is running the newest bundle — it changes on every build.',
    buildCore: 'core version',
    buildDemo: 'demo version',
    buildStamp: 'build stamp',

    segDay: 'Day',
    segWeek: 'Week',
    segMonth: 'Month',
    segAll: 'All',
    segDoing: 'Doing',
    segClaimed: 'Open',
    segBlocked: 'Blocked',
    segStalled: 'Stalled',
    weekday1: 'Mo',
    weekday2: 'Tu',
    weekday3: 'We',
    weekday4: 'Th',
    weekday5: 'Fr',
    weekday6: 'Sa',
    weekday7: 'Su',
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
