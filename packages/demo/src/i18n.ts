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
  | 'secHelpIndex'
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
  | 'dockHint'
  | 'dockMainText'
  | 'dockPanelBody'
  | 'dockOpened'
  | 'dockLimitWarn'
  | 'dockBtnOpenA'
  | 'dockBtnOpenB'
  | 'dockBtnOpenA2'
  | 'dockBtnCloseA'
  | 'dockBtnDefault'
  | 'dockBtnOpenC'
  | 'dockBtnReset'
  | 'dockPanelA'
  | 'dockPanelATag'
  | 'dockPanelC'
  | 'dockCustomHeadTitle'
  | 'dockCustomHeadHint'
  | 'explorerDataTitle'
  | 'explorerDataHint'
  | 'explorerFilesNone'
  | 'explorerAnchorNone'
  | 'explorerAnchorLabel'
  | 'explorerSessionLabel'
  | 'explorerWorkspaces'
  | 'methodATitle'
  | 'methodAHint'
  | 'openRootPreview'
  | 'openSamplesDir'
  | 'sampleMd'
  | 'sampleHtml'
  | 'sampleJs'
  | 'sampleCss'
  | 'samplesNotFound'
  | 'methodBTitle'
  | 'methodBHint'
  | 'pickAny'
  | 'pickTs'
  | 'pickDir'
  | 'pickFolder'
  | 'pickNone'
  | 'pickResult'
  | 'previewBodyTitle'
  | 'previewBodyHint'
  | 'pickJsMd'
  | 'openedPath'
  | 'sessionRealTitle'
  | 'sessionRealHint'
  // 示例框架的标题 / 说明（原来硬编码中文，切英文不变 ⇒ 必须走字典）
  | 'exModelPickerTitle'
  | 'exWorkspacePickerTitle'
  | 'exSectionHeadHint'
  | 'exMarqueeHint'
  | 'exLiveHint'
  | 'exEmptyHint'
  | 'exSmallModalTitle'
  | 'exSmallModalHint'
  | 'exLargeModalTitle'
  | 'exLargeModalHint'
  | 'exHostModalTitle'
  | 'exHostModalHint'
  | 'exToastNotifyTitle'
  | 'exToastNotifyHint'
  | 'exToastHostTitle'
  | 'exToastHostHint'
  | 'exToastSonnerTitle'
  | 'exToastSonnerHint'
  | 'sessionListUnavailable'
  | 'sessionListEmpty'
  | 'sessionListRunning'
  | 'sessionListArchived'
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
  // 文档骨架（示例 / 代码 / 用法 / API 表）与按钮页的页级备注
  // 选择器 / 提示 / 卡片 / 标签四页
  // 反馈页（弹窗 + 提示）
  // 布局页（PanelDock）
  // 区块页（explorer / session）
  | 'blocksNote'
  // 工具页（utils）
  | 'utilsNote'
  // 起始/基础/参考页
  | 'startNote'
  | 'foundationNote'
  | 'referenceNote'
  | 'docNote'
  | 'docPreview'
  | 'docCode'
  | 'docUsage'
  | 'docApi'
  | 'docApiName'
  | 'docApiType'
  | 'docApiDefault'
  | 'docApiDesc'

export const DICT: Record<Locale, Record<DemoMessageKey, string>> = {
  zh: {
    grpStart: '入门',
    grpComponents: '控件',
    grpBlocks: '业务模块',
    grpUtils: '通用方法',
    grpReference: '参考',

    secOverview: '概览',
    secHelpIndex: '帮助索引',
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
    dockHint:
      '右侧停靠分栏，挂在整页上：结构写在页面里（DockPanel），open(id) 只管显隐。\n试一遍：开 A（图标 + 标题 + 右侧标签）→ 开 B（整块自定义头部）→ 开 C（无头部、关闭钮浮在右上角）→ 关 A 后再开新组名 → 满 3 栏再开会被拒绝。',
    dockMainText: '分栏是布局成员：它把这一页的正文挤窄，而不是盖在上面。三个面板分别演示内置头、自定义头、无头 + 浮动关闭钮。',
    dockPanelA: '内置头：图标 + 标题 + 右侧内容',
    dockPanelATag: '新',
    dockPanelC: '无头面板',
    dockCustomHeadTitle: '自定义头部（本行及以下都由调用方画）',
    dockCustomHeadHint: '库不加内边距、不加边框 —— 多高、几行、放什么弹层都随你',
    dockPanelBody: '这一栏的内容。再开同名面板会替换它，宽度与位置保持不变。',
    dockOpened: '当前窗口：',
    dockLimitWarn: '已满 3 栏，新组名被拒绝（open 返回 ok:false / reason:limit）',
    dockBtnOpenA: '打开 A',
    dockBtnOpenB: '打开 B',
    dockBtnOpenA2: '再开 A（不会多开）',
    dockBtnCloseA: '关闭 A',
    dockBtnDefault: '打开默认窗口',
    dockBtnOpenC: '打开 C',
    dockBtnReset: '全部关闭',
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








    blocksNote: '工作区浏览两块演示：① Explorer——右侧停靠预览（openFilePreview，占宽度、把主区挤窄）与锚定弹窗选文件（pickWorkspaceFile，Promise 返回工作区相对路径）。② Session——会话预览（SessionPreview，variant modal/inline）。本页不用任何 mock：样例文件是仓库真文件，取数走宿主 workspaceFiles，探不到就如实说「没找到」。',


    utilsNote: 'utils 组是纯函数工具：日期时间格式化、数字/体积格式化、多语言。全部走当前 locale（由宿主驱动，切宿主语言即变）。',


    startNote: '快速开始：原「概览 / 安装与初始化 / 写一个插件」三条并成一页，每块仍是独立卡片。先看一眼能从本包拿到什么，再照安装与样式注入两段把环境搭起来。',
    foundationNote: '设计基础：Token 色板（全部消费 --dshpc-* 变量，明暗交给 token）、暗色主题判据（渲染时读 body[data-ds-dark-theme]）、样式注入（createStyleKit + setStyleKit，每个插件用固定 id）、命名契约（dshpc- 前缀）。',
    referenceNote: '参考与约定：无障碍要点、明确不做的部分（与 docs/design/features.md 同源）、版本与构建产物信息。',
    btnLabelSave: '保存修改',
    btnLabelCancel: '取消',
    btnLabelDelete: '删除',
    btnLabelMixed: '保存 Save',
    btnIconOnly: 'icon only',
    btnHintTitle: '问号提示（FieldHint）',
    btnHintHint: '独立组件，放哪都行：标题后 / 按钮后 / 一段文字后 / 输入框后；鼠标悬停或键盘聚焦浮出气泡',

    demoInputFamily: 'Input 家族',
    inputHint: 'Input / PrefixedInput / NumberInput / Textarea，都支持 error 描红；传 hint 参数即自动在行尾挂标准问号提示（FieldHint 本体仍可单独用）',
    fieldHintDate: '任务自该日起开始执行。可提前创建任务，至该日自动开跑；「每 N 周」亦自该日起算首周。',
    switchTip: '官方 Switch（启用语义，不是勾选）+ Checkbox + Segmented',
    checkboxHint: '外观对齐真实插件：灰底 inset（无外描边）；带描边的 default 仅供特殊场合（最右，可点着玩）；星期方块是多选。文案随语言切换',

    pickerHint: '单选 / 多选 / 上限 / 搜索（searchable 开关）/ 分组 / 空态 / 降级；触发器与选项都支持前置 icon；文字默认居左（align="center" 才居中）；多选到上限后已选项仍可点选取消',
    modelPickerHint: 'grouped 分组（一个下拉、厂商做组头、完全独立）/ cascade 联动（供应商、模型两个下拉联动）——两种形态 onChange 都发最终模型 value；「默认模型」选项默认提供（选中发空串，关闭传 allowDefault: false）；目录自动来自宿主',
    workspacePickerHint: '工作区列表自动来自宿主快照（connectHost 接线，follow 流实时更新），选中值为 workspaceId',

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
    cardHint: 'surface 底 + 1px 边框 + 圆角 + 行内 6px 圆角短条（高度随内容）；头部整体垂直居中——action 里裸放一个元素即居中，悬停浮出的按钮、一行两行都由调用方在框内自定；真实插件形态：标题行 + 右侧元信息 + chips 行；accent 五档见下方速览',
    stripHint: '同色系浅底 + 左缘 4px 通高方角色条（照兄弟项目执行记录块）；同样整体垂直居中——流水账排版：标题 + 元信息行 + 右侧时间/操作',
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

    explorerDataTitle: '数据来源（真数据，无 mock）',
    explorerDataHint:
      '文件服务取宿主的 remote.workspaceFiles（dotted 注入），工作区清单取官方 workspaces 服务快照；' +
      '「最近会话所属工作区」= 更新过的最新且带会话的那个工作区（pickWorkspaceAnchor）——list / read 都要 sessionId，锚点必须先落到一个真会话上。',
    explorerFilesNone: '未就位：宿主还没给出 remote.workspaceFiles（文件预览 / 选择都不可用，不造假数据）',
    explorerAnchorNone: '未就位：工作区清单里还没有带会话的工作区（先在宿主里开一个会话再回来看）',
    explorerAnchorLabel: '当前锚点：',
    explorerSessionLabel: '会话：',
    explorerWorkspaces: '工作区数：',
    methodATitle: '方法 A：openFilePreview 侧边栏预览',
    methodAHint:
      '传文件或文件夹路径，右侧**分栏**打开（核心 PanelDock，header=null 那版：没有头部那条线，✕ 浮在右上角）——' +
      '它被塞进整页这层 flex 行，所以主区被挤窄，不是盖上去。拖宽由 PanelDock 负责，面板自己不画外壳。' +
      '样例按钮指向仓库里 packages/demo/src/samples/ 的真文件（目录是按内容探出来的，不写死路径）。',
    openRootPreview: '打开最近工作区的根目录',
    openSamplesDir: '浏览样例目录',
    sampleMd: '预览 README.md',
    sampleHtml: '预览 demo.html',
    sampleJs: '预览 sample.js',
    sampleCss: '预览 sample.css',
    samplesNotFound: '没找到样例目录（当前锚定的工作区里没有 packages/demo/src/samples）',
    methodBTitle: '方法 B：pickWorkspaceFile 选择文件',
    methodBHint: '在锚点按钮旁弹出模态弹窗；Promise 返回 { path, isDir }（path 为工作区相对路径）；Esc / 点外部 / ✕ 取消返回 null',
    pickAny: '选择文件（不限）',
    pickTs: '只要 .ts',
    pickDir: '只要文件夹',
    pickFolder: '文件夹',
    pickNone: '还没选',
    pickJsMd: '仅 JS/MD',
    openedPath: '已打开：',
    pickResult: '已选择',
    previewBodyTitle: 'FilePreview 预览体（可单独用）',
    previewBodyHint:
      '上面那块已经包含它——FileBrowser 内部渲染的就是 FilePreview。\n' +
      '它同时也是一条独立子路径 dsh-plugin-core/explorer/preview：只有一个文件要显示时（会话附件、工具输出）不必搬出整个面板。',
    sessionRealTitle: '真实会话列表',
    exModelPickerTitle: 'ModelPicker（真实目录）',
    exWorkspacePickerTitle: 'WorkspacePicker（真实列表）',
    exSectionHeadHint: '分区标题：icon + 标题 + 右侧操作区三段式——纯排版壳，icon/标题/右侧都调用方自定；下示 3 组：不同图标 / 标题后缀（计数·彩色标签·小字说明）/ 两种右侧组合',
    exMarqueeHint: '双层结构：外层裁剪、内层滚动；跑一遍停在尾字，鼠标移开复位成省略号',
    exLiveHint: '订阅内部节拍器，走时 Ui 由调用方渲染',
    exEmptyHint: '业务空态：无数据时的占位，可挂一个操作按钮',
    exSmallModalTitle: '小型弹窗（自定义）',
    exSmallModalHint: '我们的标准小框：AlertModal（单按钮 + severity 图标）/ ConfirmModal（双按钮 + 语义档），以及命令式 alertModal()/confirmModal()（Promise）。名字带 Modal 后缀，不覆盖宿主原生。',
    exLargeModalTitle: '大型弹窗（自定义）',
    exLargeModalHint: '我们的内容弹窗：Modal（size md/lg），承载任意内容，不是「确定/取消」命令式。三张示例：默认 md / 带 footer / 无 footer（内容自定义），头部排法可不同。',
    exHostModalTitle: '原生弹窗（宿主）',
    exHostModalHint: '宿主内核官方 Modal：遮罩/头部/关闭叉全归宿主管；正文区塞任意内容，footer 任意按钮组合。命令式用 confirmModal/alertModal 加 skin:"host"，与 core 互不覆盖。',
    exToastNotifyTitle: 'Toast · 我们封装 notify',
    exToastNotifyHint: 'notify()：统一灰/绿/红/黄 + 右侧我们自己的按钮',
    exToastHostTitle: 'Toast · 宿主原生',
    exToastHostHint: 'showHostToast()：直接包 @deepseek-ai 官方 Toast（顶部横幅）',
    exToastSonnerTitle: 'Toast · 官方 Sonner',
    exToastSonnerHint: 'showToast()：第三方库原味，对比用',
    sessionRealHint: '宿主 sessions.list 快照（冷安全，不激活 Agent）→ 点开真预览；fork 与跳转都是官方口子',
    sessionListUnavailable: '宿主会话服务未就位（sessions / uiConversation / uiWorkspace 缺席）——在真实 dsh profile 里安装本插件即可读到本机会话',
    sessionListEmpty: '宿主当前没有可显示的会话',
    sessionListRunning: '运行中',
    sessionListArchived: '已归档',

    dateHint: '解析失败不抛错、给兜底、不编造；所有函数无 UI 依赖，Node 里也能跑',
    numberHint: 'formatBytes 按 1024 进制、单位自动进位；formatCount 给大数加千分位',

    roadmapHint: '下面是「明确不提供」的部分——写在这里是为了让你不用猜，也让后来人知道边界在哪。',
    roadmapOut: '设置页骨架、i18n 框架（插件文案插件自管）、host 宿主类型面',
    roadmapMirror: '官方会话 UI 完整镜像（工具卡 / 代码块 / 推理行 / 折叠关系）——已于 2026-10-22 搬入 session 子包',
    roadmapPreview: '（已落地）md 渲染（官方 MarkdownText）/ 代码高亮（核心 CodeViewer）/ HTML / PDF / Office 预览',
    roadmapSkeleton: '（已落地）PanelDock——可停靠分栏：多面板、按名覆盖、上限 3',
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
    // 文档骨架：示例 / 代码 / 用法 / API 表的栏位名与表头
    docNote: '说明',
    docPreview: '示例',
    docCode: '代码',
    docUsage: '怎么用',
    docApi: 'API',
    docApiName: '属性',
    docApiType: '类型',
    docApiDefault: '默认值',
    docApiDesc: '说明',


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
    secHelpIndex: 'Help index',
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
    dockHint:
      'Right-side dock: a group name is one window; reopening the same name replaces its content in place (no extra column).\nTry it: open A → open B → reopen A (content replaced) → close A → open C (the freed slot is usable) → with 3 columns open, a new group name is rejected.',
    dockMainText: 'The dock is a layout member: it squeezes the page content instead of covering it. The three panels demo a built-in header, a custom header, and a header-less panel with a floating close button.',
    dockPanelA: 'Built-in header: icon + title + right-side content',
    dockPanelATag: 'new',
    dockPanelC: 'Header-less panel',
    dockCustomHeadTitle: 'Custom header (everything from here down is yours)',
    dockCustomHeadHint: 'No padding, no border from the library — height, rows and popovers are up to you',
    dockPanelBody: 'Content of this column. Reopening the same name replaces it; width and position stay put.',
    dockOpened: 'Open now: ',
    dockLimitWarn: 'All 3 columns are taken — the new group name was rejected (open returns ok:false / reason:limit)',
    dockBtnOpenA: 'Open A',
    dockBtnOpenB: 'Open B',
    dockBtnOpenA2: 'Reopen A (no duplicate)',
    dockBtnCloseA: 'Close A',
    dockBtnDefault: 'Open default',
    dockBtnOpenC: 'Open C',
    dockBtnReset: 'Close all',
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








    blocksNote: 'Two workspace-browsing demos: ① Explorer — right-dock preview (openFilePreview, takes width and squeezes the main area) and anchor-popover file picking (pickWorkspaceFile, Promise returns the workspace-relative path). ② Session — session preview (SessionPreview, variant modal/inline). This page uses no mock: sample files are real repo files, data comes from the host workspaceFiles, and if probing fails it says "not found" honestly.',


    utilsNote: 'The utils group is pure-function tooling: date/time formatting, number/byte formatting, and i18n. All honor the current locale (driven by the host; switch host language and it changes).',


    startNote: 'Quick start: the original three (overview / install & init / write a plugin) are merged into one page, each still an independent card. First see what this package gives you, then set up the environment with the install and style-injection snippets.',
    foundationNote: 'Design foundations: the Token palette (all consume --dshpc-* variables; light/dark is the token’s job), the dark-theme predicate (read body[data-ds-dark-theme] at render time), style injection (createStyleKit + setStyleKit, each plugin uses a fixed id), and the naming contract (dshpc- prefix).',
    referenceNote: 'Reference & conventions: accessibility notes, what is explicitly out of scope (same source as docs/design/features.md), and version/build artifact info.',

    btnLabelSave: 'Save changes',
    btnLabelCancel: 'Cancel',
    btnLabelDelete: 'Delete',
    btnLabelMixed: 'Save 保存',
    btnIconOnly: 'icon only',
    btnHintTitle: 'Question-mark hint (FieldHint)',
    btnHintHint: 'Standalone component, drop it anywhere: after a title, a button, a sentence, or an input; hover or keyboard-focus to reveal',

    demoInputFamily: 'Input family',
    inputHint: 'Input / PrefixedInput / NumberInput / Textarea, all support error highlighting; pass a hint string and the standard FieldHint is attached automatically (FieldHint still works standalone)',
    fieldHintDate: 'The task runs starting from this date. You can create it ahead of time and it auto-starts on that day; "every N weeks" also counts its first week from this date.',
    switchTip: 'Official Switch (enable semantics, not a tick) + Checkbox + Segmented',
    checkboxHint: 'Looks match the real plugin: grey inset background (no outer border); the bordered default (rightmost, clickable) is for special cases; the weekday squares are multi-select. Labels follow the locale',

    pickerHint: 'Single / multi / max / search (searchable switch) / grouped / empty / degraded; trigger and options both take a leading icon; label is left-aligned by default (align="center" to center); multi-select at max still allows deselecting picked items',
    modelPickerHint: 'grouped (one dropdown, vendor headers, fully independent) / cascade (vendor and model dropdowns linked) — both emit the same final model value; a "default model" option is provided by default (emits an empty string, disable with allowDefault: false); the catalog comes from the host automatically',
    workspacePickerHint: 'Workspace list comes from the host snapshot automatically (wired via connectHost, live follow stream); selected value is the workspaceId',

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
    cardHint: 'Surface + 1px border + radius + inline 6px rounded rail (height follows content); the head is vertically centered as a whole — drop a bare element into action and it centers itself; hover-floating buttons, one or two rows are all up to the caller inside the frame; real-plugin shape: title row + right-side meta + chips row; five accent tiers below',
    stripHint: 'Same-hue soft tint + 4px full-height square accent bar at the left edge (mirrors the sibling record block); equally centered as a whole — record-stream layout: title + meta row + right-side time/actions',
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

    explorerDataTitle: 'Where the data comes from (real data, no mocks)',
    explorerDataHint:
      'File services come from the host remote.workspaceFiles (dotted injection); the workspace list is the official workspaces snapshot. ' +
      'The "most recent workspace" is the newest updated one that owns a session (pickWorkspaceAnchor) — list / read all need a sessionId, so browsing must land on a real session first.',
    explorerFilesNone: 'Not ready: the host has not exposed remote.workspaceFiles yet (no preview, no picking — no fake data either)',
    explorerAnchorNone: 'Not ready: no workspace in the list owns a session yet (open a session in the host and come back)',
    explorerAnchorLabel: 'Anchor: ',
    explorerSessionLabel: 'session: ',
    explorerWorkspaces: 'workspaces: ',
    methodATitle: 'Method A: openFilePreview dock preview',
    methodAHint:
      'Pass a file or folder path and a dock opens on the right (core PanelDock, the header=null variant: no head line, ✕ floats top-right) — ' +
      'it is inserted into the page flex row, so the main area is squeezed rather than covered. Resizing belongs to PanelDock. ' +
      'The sample buttons point at real files under packages/demo/src/samples/ (the directory is probed by content, never hardcoded).',
    openRootPreview: 'Open the most recent workspace root',
    openSamplesDir: 'Browse the sample directory',
    sampleMd: 'Preview README.md',
    sampleHtml: 'Preview demo.html',
    sampleJs: 'Preview sample.js',
    sampleCss: 'Preview sample.css',
    samplesNotFound: 'Sample directory not found (the anchored workspace has no packages/demo/src/samples)',
    methodBTitle: 'Method B: pickWorkspaceFile',
    methodBHint: 'A modal pops up beside the anchor button; the promise resolves { path, isDir } (path is workspace-relative); Esc / click-outside / ✕ cancels with null',
    pickAny: 'Pick a file (any)',
    pickTs: '.ts only',
    pickDir: 'Folders only',
    pickFolder: 'folder',
    pickNone: 'Nothing picked yet',
    pickJsMd: 'JS/MD only',
    openedPath: 'Opened: ',
    pickResult: 'Picked',
    previewBodyTitle: 'FilePreview (usable on its own)',
    previewBodyHint:
      'The block above already includes it — FileBrowser renders FilePreview inside.\n' +
      'It is also a separate subpath, dsh-plugin-core/explorer/preview: when there is only one file to show (a session attachment, a tool result) you do not need the whole panel.',
    sessionRealTitle: 'Real session list',
    exModelPickerTitle: 'ModelPicker (real catalog)',
    exWorkspacePickerTitle: 'WorkspacePicker (real list)',
    exSectionHeadHint: 'Section header: icon + title + right-side actions in three slots — a pure layout shell; icon, title and right side are all caller-defined. Three groups below: different icons / title suffixes (count, coloured tag, caption) / two right-side combos',
    exMarqueeHint: 'Two layers: the outer clips, the inner scrolls; one pass stops at the last character, and on mouse-out it resets to an ellipsis',
    exLiveHint: 'Subscribes to an internal ticker; the running clock UI is rendered by the caller',
    exEmptyHint: 'Business empty state: a placeholder when there is no data, optionally with one action button',
    exSmallModalTitle: 'Small dialogs (custom)',
    exSmallModalHint: 'Our standard small dialogs: AlertModal (single button + severity icon) / ConfirmModal (two buttons + tone), plus the imperative alertModal()/confirmModal() (Promise-based). The Modal suffix keeps them from shadowing the host’s own.',
    exLargeModalTitle: 'Large dialogs (custom)',
    exLargeModalHint: 'Our content dialog: Modal (size md/lg) carrying arbitrary content — not a confirm/cancel primitive. Three samples: default md / with footer / without footer (custom content); the header layout may differ.',
    exHostModalTitle: 'Native dialogs (host)',
    exHostModalHint: 'The host kernel’s own Modal: mask, header and close button all belong to the host; the body takes arbitrary content and the footer any button set. Imperative use goes through confirmModal/alertModal with skin:"host"; neither shadows the other.',
    exToastNotifyTitle: 'Toast · our notify wrapper',
    exToastNotifyHint: 'notify(): uniform grey/green/red/yellow plus our own button on the right',
    exToastHostTitle: 'Toast · host native',
    exToastHostHint: 'showHostToast(): wraps the official @deepseek-ai Toast (top banner)',
    exToastSonnerTitle: 'Toast · Sonner',
    exToastSonnerHint: 'showToast(): the third-party library as-is, for comparison',
    sessionRealHint: 'Host sessions.list snapshot (cold-safe, no Agent activation) → click for a real preview; fork and navigation are official APIs',
    sessionListUnavailable: 'Host session services not ready (sessions / uiConversation / uiWorkspace absent) — install this plugin into a real dsh profile to list and preview your sessions',
    sessionListEmpty: 'The host has no visible sessions right now',
    sessionListRunning: 'Running',
    sessionListArchived: 'Archived',

    dateHint: 'No throw on parse failure — falls back gracefully and never fabricates; all functions are UI-free and run in Node too',
    numberHint: 'formatBytes is 1024-based with automatic unit scaling; formatCount adds thousands separators',

    roadmapHint: 'The list below is what this package explicitly does NOT provide — written down so nobody has to guess, and so the boundary stays visible.',
    roadmapOut: 'A settings-page skeleton, an i18n framework (plugin copy is the plugin’s own job), a host typings surface',
    roadmapMirror: 'Full mirror of the official session UI (tool cards / code blocks / reasoning rows / fold relations) — ported into the session subpackage on 2026-10-22',
    roadmapPreview: '(shipped) md render (official MarkdownText) / code highlight (core CodeViewer) / HTML / PDF / Office preview',
    roadmapSkeleton: '(shipped) PanelDock — dockable split panes: multi-panel, replace-by-name, limit 3',
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
    // Documentation skeleton: labels for the example / code / usage / API table
    docNote: 'Note',
    docPreview: 'Example',
    docCode: 'Code',
    docUsage: 'Usage',
    docApi: 'API',
    docApiName: 'Prop',
    docApiType: 'Type',
    docApiDefault: 'Default',
    docApiDesc: 'Description',


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
