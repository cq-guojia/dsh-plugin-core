// 预览插件（packages/demo）界面文案自管（核心只保证单一 locale 状态，不提供插件级 i18n 框架）。
// 复用核心的 getLocale() 单一语言状态，字典与 key 由本插件自己维护；locale 由宿主 harness 驱动（见 client/index.tsx）。
import { getLocale } from '../../../dist/utils/index.js'

export type Locale = 'zh' | 'en'

/** demo 界面文案的 key（含六个分组名、25 个页面标题、各 Demo 块 hint、空页待补说明；演示数据/按钮文案不在内）。 */
export type DemoMessageKey =
  | 'grpStart'
  | 'grpInfra'
  | 'grpComponents'
  | 'grpBlocks'
  | 'grpUtils'
  | 'secHelpIndex'
  | 'secQuickstart'
  | 'secFoundation'
  | 'secTaskNotifications'
  | 'tnNote'
  | 'tnCrossPage'
  | 'tnOpsTitle'
  | 'tnOpsHint'
  | 'tnRegisterReminder'
  | 'tnRegisterLedger'
  | 'tnUpdate'
  | 'tnBackground'
  | 'tnDone'
  | 'tnFail'
  | 'tnRestore'
  | 'tnRefresh'
  | 'tnRefreshHint'
  | 'tnFilterAll'
  | 'tnFilterOne'
  | 'tnFilterTwo'
  | 'tnFilterAllProjects'
  | 'tnBroadcast'
  | 'tnOpsNote'
  | 'tnFinishAll'
  | 'tnSnapshotTitle'
  | 'tnSnapshotHint'
  | 'tnEventsTitle'
  | 'tnEventsHint'
  | 'tnEmptyTasks'
  | 'tnEmptyEvents'
  | 'tnCountLabel'
  | 'tnBadgeLocal'
  | 'tnBadgeRemote'
  | 'secReference'
  | 'secActions'
  | 'secInputs'
  | 'secDisplay'
  | 'secNavigation'
  | 'dateTimePickerHint'
  | 'tableHint'
  | 'tableSpanHint'
  | 'tableGroupHint'
  | 'paginationHint'
  | 'tablePagerHint'
  | 'tableLoadingHint'
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
  | 'tokensHint'
  | 'darkHint'
  | 'darkNow'
  | 'injectHint'
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
  | 'btnWidthTitle'
  | 'btnWidthHint'
  | 'btnIconMatrixTitle'
  | 'btnIconMatrixHint'
  | 'btnLabelSave'
  | 'btnLabelCancel'
  | 'btnLabelDelete'
  | 'btnLabelMixed'
  | 'btnIconOnly'
  | 'btnHintTitle'
  | 'btnHintHint'
  | 'inputHint'
  | 'inputGroupTitle'
  | 'inputGroupHint'
  | 'switchTip'
  | 'checkboxHint'
  | 'segToneTitle'
  | 'segToneHint'
  | 'pickerHint'
  | 'modelPickerHint'
  | 'workspacePickerHint'
  | 'splitGroupHint'
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
  | 'chipWidthTitle'
  | 'chipWidthHint'
  | 'chipStalled'
  | 'chipDone'
  | 'chipDoing'
  | 'marqueeTitle'
  | 'liveTitle'
  | 'flipTitle'
  | 'dockHint'
  | 'dockMainText'
  | 'dockPanelBody'
  | 'dockOpened'
  | 'dockCollapsed'
  | 'dockLimitWarn'
  | 'dockBtnOpenA'
  | 'dockBtnOpenB'
  | 'dockBtnOpenA2'
  | 'dockBtnCloseA'
  | 'dockBtnCollapseA'
  | 'dockBtnDefault'
  | 'dockBtnOpenC'
  | 'dockBtnReset'
  | 'dockPanelA'
  | 'dockPanelATag'
  | 'dockPanelC'
  | 'dockCustomHeadTitle'
  | 'dockCustomHeadHint'
  | 'explorerFilesNone'
  | 'explorerAnchorNone'
  | 'explorerAnchorLabel'
  | 'explorerSessionLabel'
  | 'explorerWorkspaces'
  | 'methodATitle'
  | 'methodAHint'
  | 'openRootPreview'
  | 'methodBTitle'
  | 'methodBHint'
  | 'pickAny'
  | 'pickDir'
  | 'pickNone'
  | 'pickResult'
  | 'pickJsMd'
  | 'sessionRealTitle'
  | 'sessionRealHint'
  | 'sessionSlotTitle'
  | 'sessionSlotAction'
  | 'sessionSlotHeader'
  | 'sessionSlotFooter'
  // 示例框架的标题 / 说明（原来硬编码中文，切英文不变 ⇒ 必须走字典）
  | 'exModelPickerTitle'
  | 'exWorkspacePickerTitle'
  | 'exSplitGroupTitle'
  | 'exSectionHeadHint'
  | 'exMarqueeHint'
  | 'exLiveHint'
  | 'exFlipHint'
  | 'exSmallModalTitle'
  | 'exSmallModalHint'
  | 'exLargeModalTitle'
  | 'exLargeModalHint'
  | 'exSideSheetTitle'
  | 'exSideSheetHint'
  | 'exHostModalTitle'
  | 'exHostModalHint'
  | 'exToastNotifyTitle'
  | 'exToastNotifyHint'
  | 'exLoaderTitle'
  | 'exLoaderHint'
  | 'exLoadingTitle'
  | 'exLoadingHint'
  | 'sessionListUnavailable'
  | 'sessionListEmpty'
  | 'sessionListRunning'
  | 'sessionListArchived'
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
  | 'themeToggle'
  | 'themeLight'
  | 'themeDark'
  | 'demoInputFamily'
  | 'demoSearchClear'
  | 'demoSearchClearHint'
  | 'demoTokenPalette'
  | 'demoStyleInject'
  | 'designInjectNote'
  | 'demoCardTitle'
  | 'demoStripTitle'
  | 'demoSurfaceTitle'
  | 'demoListRowTitle'
  | 'listRowHint'
  | 'demoBarTitle'
  | 'surfaceHint'
  | 'barHint'
  | 'segAll'
  | 'segDoing'
  | 'segClaimed'
  | 'segBlocked'
  | 'segStalled'
  | 'pluginTitle'
  | 'settingsIntro'
  | 'settingsEntryTitle'
  | 'settingsEntryHint'
  | 'settingsEntryOff'
  | 'settingsEntryFirst'
  | 'settingsEntryMore'
  | 'settingsEntryOffTip'
  | 'settingsEntryFirstTip'
  | 'settingsEntryMoreTip'
  | 'settingsOpenDemo'
  | 'settingsGithub'
  | 'settingsLoading'
  | 'settingsUnavailable'
  // 文档骨架（示例 / 代码 / 用法 / API 表）与按钮页的页级备注
  // 选择器 / 提示 / 卡片 / 标签四页
  // 反馈页（弹窗 + 提示）
  // 布局页（PanelDock）
  // 区块页（explorer / session）
  // 工具页（utils）
  // 起始/基础/参考页
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
    grpInfra: '基础设施',
    grpComponents: '控件',
    grpBlocks: '应用模块',
    grpUtils: '工具方法',

    secHelpIndex: '帮助索引',
    secQuickstart: '快速开始',
    secFoundation: '设计基础',
    secTaskNotifications: '通知任务中心',
    tnNote: '本页只演示数据面：状态池、订阅、事件总线、跨页同步与结束句柄。任务、条数、revision、时间与事件全部来自真实 API 调用，没有模拟数据、没有定时器、没有占位行。可收起弹窗与事件查看控件不在这里，由后续任务单独提供。',
    tnCrossPage: '跨页演示：在另一个同源标签页打开本页，两边各自注册或结束任务，列表与事件会即时同步；关掉其中一个标签页可看到 peer-left 事件。跨页条目能看不能点。',
    tnOpsTitle: '真实操作台',
    tnOpsHint: '每个按钮都调用真实 API；右侧是同一套调用的代码',
    tnRegisterReminder: '注册到 dsh-task-reminder',
    tnRegisterLedger: '注册到 dsh-task-ledger',
    tnUpdate: '更新详情',
    tnBackground: '收起（不结算）',
    tnDone: '结束 · done',
    tnFail: '结束 · fail',
    tnRestore: '请求还原（本页）',
    tnRefresh: '重新同步',
    tnRefreshHint: '平时会自动同步，只有怀疑状态不同步时才点',
    tnFilterAll: '不过滤',
    tnFilterOne: '只看 reminder',
    tnFilterTwo: '看两个组',
    tnFilterAllProjects: '全站（含跨项目）',
    tnBroadcast: '广播一条（不进列表）',
    tnOpsNote: '注册与过滤在这里；每条任务自己的收起 / 结束 / 还原按钮在下方列表的对应行里',
    tnFinishAll: '结束本页全部',
    tnSnapshotTitle: '状态快照',
    tnSnapshotHint: '三参 useSyncExternalStore，引用稳定；每行右侧是这条任务自己的操作',
    tnEventsTitle: '事件总线',
    tnEventsHint: '真实事件，只显示最近 8 条；历史不留存',
    tnEmptyTasks: '池里还没有任务：点上面的按钮注册一条真实任务',
    tnEmptyEvents: '还没有事件',
    tnCountLabel: '显示 / 全池',
    tnBadgeLocal: '本页创建 · 可还原',
    tnBadgeRemote: '跨页条目 · 能看不能点',
    secReference: '参考与约定',
    secActions: '动作',
    secInputs: '录入',
    secDisplay: '展示',
    secNavigation: '导航',
    tableHint: '全框外观：双行表头、斑马纹、点行选中',
    tableSpanHint: '无左右外框：跨行、跨列合并',
    tableGroupHint: '默认外观：groups 分组表，组间一条实线',
    paginationHint: '独立分页：对齐、简洁模式、总数可选',
    tablePagerHint: 'Table 内建分页：本地切片或服务端',
    tableLoadingHint: '加载态与空态切换',
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
    dockHint:
      '右侧停靠分栏，挂在整页上：结构写在页面里（DockPanel），open(id) 只管显隐。\n试一遍：开 A（图标 + 标题 + 右侧标签）→ 开 B（整块自定义头部）→ 开 C（无头部、关闭钮浮在右上角）→ 关 A 后再开新组名 → 满 3 栏再开会被拒绝。\n另：点分割线中间的 › 可把该栏收起成右侧耳朵（分栏消失、不占宽），点耳朵展开。',
    dockMainText: '分栏是布局成员：它把这一页的正文挤窄，而不是盖在上面。三个面板分别演示内置头、自定义头、无头 + 浮动关闭钮。',
    dockPanelA: '内置头：图标 + 标题 + 右侧内容',
    dockPanelATag: '新',
    dockPanelC: '无头面板',
    dockCustomHeadTitle: '自定义头部（本行及以下都由调用方画）',
    dockCustomHeadHint: '头部内容自定，库不加内距与边框',
    dockPanelBody: '这一栏的内容。再开同名面板会替换它，宽度与位置保持不变。',
    dockOpened: '当前窗口：',
    dockCollapsed: '已收起：',
    dockLimitWarn: '已满 3 栏，新组名被拒绝（open 返回 ok:false / reason:limit）',
    dockBtnOpenA: '打开 A',
    dockBtnOpenB: '打开 B',
    dockBtnOpenA2: '再开 A（不会多开）',
    dockBtnCloseA: '关闭 A',
    dockBtnCollapseA: '收起 A',
    dockBtnDefault: '打开默认窗口',
    dockBtnOpenC: '打开 C',
    dockBtnReset: '全部关闭',
    i18nNow: '当前 locale',
    a11yDesc:
      '待补：\n· 焦点环与键盘可达性\n· Tab 顺序与 Modal 的焦点陷阱\n· role / aria-* 语义的覆盖情况\n· 对比度与 prefers-reduced-motion 的处理',

    tokensHint: '颜色全部来自 token，切明暗跟着变',
    darkHint:
      '明暗判据是写死的：宿主在 body 上挂 data-ds-dark-theme 才切暗色，不读系统的 prefers-color-scheme。插件因此不需要、也不应该自带明暗开关——下面是当前实测值，切明暗后重开本页可见变化。',
    darkNow: '当前 body[data-ds-dark-theme]',
    injectHint: '入口调一次 setStyleKit，控件自注入 CSS',
    demoTokenPalette: 'token 色板',
    demoStyleInject: '样式注入机制',
    designInjectNote: '本预览插件自己就是这么做初始化的——预览与真实插件走同一条路。',

    btnTextTitle: '按钮文案与语言',
    btnTextHint: '文案由调用方给，随语言切换',
    btnVariantTitle: '外观档（10 档）',
    btnVariantHint: '实心 / 线框 / 无底三类档位',
    btnSizeTitle: '尺寸 / 图标 / block',
    btnSizeHint: 'sm 24 · md 28 · lg 32；icon 收 ReactNode',
    btnStateTitle: '状态',
    btnStateHint: 'disabled 半透明；loading 自动禁用',
    btnColorTitle: '自定义颜色',
    btnColorHint: 'color 传任意 CSS 色值，hover 自动混色',
    btnWidthTitle: '宽度（固定宽 / 最小宽 / 最大宽）',
    btnWidthHint: 'width / minWidth / maxWidth 三轴互斥',
    btnIconMatrixTitle: '图标按钮 · 尺寸 × 底色',
    btnIconMatrixHint: 'sm 24 / md 28 / lg 32；纯图标与图标+文字各有/无底色两组；dense 档图标更大、内距更小（高度不变）',












    referenceNote: '参考与约定：无障碍要点、明确不做的部分（与 docs/design/features.md 同源）、版本与构建产物信息。',
    btnLabelSave: '保存修改',
    btnLabelCancel: '取消',
    btnLabelDelete: '删除',
    btnLabelMixed: '保存 Save',
    btnIconOnly: 'icon only',
    btnHintTitle: '问号提示（FieldHint）',
    btnHintHint: '独立组件，放哪都行，悬停或聚焦浮出',

    demoInputFamily: 'Input 家族',
    inputHint: '四种输入件，都支持 error 与行尾问号提示',
    demoSearchClear: '搜索框清除钮',
    demoSearchClearHint: 'type="search" 且有内容时，鼠标移上去或聚焦都会显示尾部 ×，点一下即清空——不必先点输入框聚焦。',
    inputGroupTitle: 'InputGroup（组合输入框）',
    inputGroupHint: '输入框 + 后置按钮组焊成一体',
    switchTip: '官方 Switch（启用语义，不是勾选）+ Checkbox + Segmented',
    checkboxHint: '灰底轨道 + 白片；bordered 为外框款',
    segToneTitle: 'Segmented 选中片配色（tone）',
    segToneHint: '不传走主题亮片；也可传色名或 bg / fg',

    pickerHint: '单选 / 多选 / 搜索 / 分组 / 空态',
    dateTimePickerHint: 'single / range × 四种精度，浮层无遮罩',
    modelPickerHint: '分组 / 平铺 / 联动三种形态，目录来自宿主',
    workspacePickerHint: '列表来自宿主快照，值为 workspaceId',
    splitGroupHint: '把两个控件焊成一体，外壳画框与分隔',

    tooltipTitle: 'Tooltip（鼠标悬停提示）',
    tooltipHint: 'side × align 四向；长文本自动折行',
    tooltipAnchorText: '文字锚点',
    tooltipAnchorButton: '按钮锚点',
    tooltipLong: '长文本换行',
    tooltipName: '张三丰',
    tooltipRich: '富卡片',
    tooltipMultiline: '两段式',
    tooltipLongText: '这是一段足够长的提示文字：气泡遇到 maxWidth 会自动换行，而不会一路撑到半个屏幕宽， anchored 元素在边缘时官方还会自动把气泡收回视口内。',

    demoCardTitle: 'Card（边框 + 圆角 + 短色条）',
    demoStripTitle: 'StripCard（浅底 + 通高色条）',
    demoSurfaceTitle: 'Surface（区域容器）',
    demoListRowTitle: 'ListRow（一行一条 · 整行可点）',
    listRowHint: '常态带底 / 按钮灰态 hover / 带边 · 无边 / 选中浅蓝灰 slate / 右侧操作不连带 / 两槽自动垂直居中',
    demoBarTitle: '色条方位：上下左右',
    surfaceHint: '一块面：底 / 边框 / 圆角 / 内距四轴',
    barHint: '色条换边、距边、间距、长度都可调',
    cardHint: '复用 Surface 外框 + 6px 左缘色条 · 带底 / 透明四档 · hover 只作用头部区、展开区可选',
    stripHint: '同色系浅底 + 4px 左缘色条 · 带底 / 透明四档 · hover 只作用头部区、展开区可选',
    sectionHeadTitle: 'SectionHead 分区标题',
    chipHint: 'tone 语义色 × size 两轴',
    chipWidthTitle: '宽度（固定宽 / 最小宽 / 最大宽）',
    chipWidthHint: 'width / minWidth / maxWidth 三轴互斥',
    chipOverdue: '逾期',
    chipStalled: '停滞',
    chipDone: '已完成',
    chipDoing: '进行中',
    marqueeTitle: 'MarqueeText 跑马灯',
    liveTitle: 'LiveText 实时文本',
    flipTitle: 'FlipText 翻牌文本',


    explorerFilesNone: '未就位：宿主还没给出 remote.workspaceFiles（文件预览 / 选择都不可用，不造假数据）',
    explorerAnchorNone: '未就位：工作区清单里还没有带会话的工作区（先在宿主里开一个会话再回来看）',
    explorerAnchorLabel: '当前锚点：',
    explorerSessionLabel: '会话：',
    explorerWorkspaces: '工作区数：',
    methodATitle: '方法 A：openFilePreview 侧边栏预览',
    methodAHint: '传文件或文件夹路径，右侧分栏打开，主区被挤窄而不是盖上去',
    openRootPreview: '打开最近工作区的根目录',
    methodBTitle: '方法 B：pickWorkspaceFile 选择文件',
    methodBHint: '锚点旁弹模态，Promise 返回 { path, isDir }',
    pickAny: '选择文件（不限）',
    pickDir: '只要文件夹',
    pickNone: '还没选',
    pickJsMd: '仅 JS/MD',
    pickResult: '已选择',
    sessionRealTitle: '真实会话列表',
    exModelPickerTitle: 'ModelPicker（真实目录）',
    exWorkspacePickerTitle: 'WorkspacePicker（真实列表）',
    exSplitGroupTitle: 'SplitGroup（组合选择框）',
    exSectionHeadHint: '分区标题壳：标签 / icon / 标题 / 右侧操作',
    exMarqueeHint: '跑一遍停在尾字，移开复位成省略号',
    exLiveHint: '订阅内部节拍器，走时 UI 由调用方渲染',
    exFlipHint: '单行窗口换字：旧的出、新的进',
    exSmallModalTitle: '小型弹窗（自定义）',
    exSmallModalHint: 'AlertModal / ConfirmModal 与命令式版本',
    exLargeModalTitle: '大型弹窗（自定义）',
    exLargeModalHint: '内容弹窗：任意内容 + 可选 footer',
    exSideSheetTitle: '侧边抽屉（覆盖式）',
    exSideSheetHint: '左右滑入的覆盖层，宽度可拖',
    exHostModalTitle: '原生弹窗（宿主）',
    exHostModalHint: '宿主官方 Modal 皮肤，正文自定',
    exToastNotifyTitle: 'Toast · 我们封装 notify',
    exToastNotifyHint: 'notify()：四色 + 右侧自定义按钮',
    exLoaderTitle: '加载图标 · Loader',
    exLoaderHint: '只画图标：背景与位置归调用方',
    exLoadingTitle: '加载提示 · 两种样式',
    exLoadingHint: 'showLoading 不自动消失，需句柄 close',
    sessionRealHint: '宿主 sessions 快照 → ListRow 一行一条（整行可点 / 选中浅蓝）→ 点开真预览',
    sessionListUnavailable: '宿主会话服务未就位（sessions / uiConversation / uiWorkspace 缺席）——在真实 dsh profile 里安装本插件即可读到本机会话',
    sessionListEmpty: '宿主当前没有可显示的会话',
    sessionListRunning: '运行中',
    sessionListArchived: '已归档',
    sessionSlotTitle: '插槽示例',
    sessionSlotAction: '示例动作',
    sessionSlotHeader: '顶端槽：调用方自己的内容（随会话滚动）',
    sessionSlotFooter: '底端槽：本次会话的产出汇总',


    roadmapHint: '下面列的是明确不提供的能力',
    roadmapOut: '设置页骨架、i18n 框架（插件文案插件自管）、host 宿主类型面',
    roadmapMirror: '官方会话 UI 完整镜像（工具卡 / 代码块 / 推理行 / 折叠关系）——已于 2026-10-22 搬入 session 子包',
    roadmapPreview: '（已落地）md 渲染（官方 MarkdownText）/ 代码高亮（核心 CodeViewer）/ HTML / PDF / Office 预览',
    roadmapSkeleton: '（已落地）PanelDock——可停靠分栏：多面板、按名覆盖、上限 3',
    roadmapLayout: '红线：整合以前的.share(plugins/demo)',

    buildDesc: '版本不 bump 时，靠 build 编码判断是否最新产物',
    buildCore: 'core 版本',
    buildDemo: 'demo 版本',
    buildStamp: '本次 build 编码',
    themeToggle: '明暗切换',
    themeLight: '浅色',
    themeDark: '深色',

    segAll: '全部',
    segDoing: '进行中',
    segClaimed: '待认领',
    segBlocked: '阻塞',
    segStalled: '停滞',
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


    pluginTitle: '蓝鲸组件库',
    settingsIntro: '蓝鲸组件库是为 DeepSeek Harness 插件准备的共享 UI 底座，本包是它的组件预览插件：装进 DSH 宿主后，在设置里即可查看各基础控件与业务组件的真实运行表现。',
    settingsEntryTitle: '插件入口说明',
    settingsEntryHint: '选择本插件在左侧菜单栏的入口位置：关闭后仅能在「设置」中找到本插件。默认显示在「更多」。',
    settingsEntryOff: '关闭',
    settingsEntryFirst: '一级',
    settingsEntryMore: '更多',
    settingsEntryOffTip: '关闭插件入口后，左侧菜单栏首级与「更多」菜单均不再展示本插件入口；仅保留「设置」中的配置页，可随时重新启用。',
    settingsEntryFirstTip: '入口固定展示于左侧菜单栏首级，与内置功能并列；点击即进入组件预览整页。',
    settingsEntryMoreTip: '入口收纳于左侧菜单栏的「更多」菜单，不占用首级导航位；展开「更多」即可进入组件预览整页。',
    settingsOpenDemo: '查看 demo',
    settingsGithub: '访问 GitHub',
    settingsLoading: '正在读取设置…',
    settingsUnavailable: '宿主当前没有提供本插件的设置项',
  },
  en: {
    grpStart: 'Getting started',
    grpInfra: 'Infrastructure',
    grpComponents: 'Components',
    grpBlocks: 'App modules',
    grpUtils: 'Utilities',

    secHelpIndex: 'Help index',
    secQuickstart: 'Quick start',
    secFoundation: 'Foundations',
    secTaskNotifications: 'Task Notification Hub',
    tnNote: 'This page demos the data plane only: pool, subscription, event bus, cross-page sync and settlement handles. Rows, counts, revision, timestamps and events all come from real API calls — no mock data, no timers, no placeholder rows. Collapsible dialogs and the event-viewer control are not here; they arrive in separate tasks.',
    tnCrossPage: 'Cross-page demo: open this page in another same-origin tab. Register or settle a task on either side and both lists and event streams update immediately; close one tab to see a peer-left event. Cross-page rows are view-only.',
    tnOpsTitle: 'Live controls',
    tnOpsHint: 'Every button calls a real API; the code on the right is that same call',
    tnRegisterReminder: 'Register to dsh-task-reminder',
    tnRegisterLedger: 'Register to dsh-task-ledger',
    tnUpdate: 'Update detail',
    tnBackground: 'Collapse (no settle)',
    tnDone: 'Finish · done',
    tnFail: 'Finish · fail',
    tnRestore: 'Request restore (local)',
    tnRefresh: 'Resync',
    tnRefreshHint: 'Syncs automatically; click only if you suspect it drifted',
    tnFilterAll: 'No filter',
    tnFilterOne: 'Reminder only',
    tnFilterTwo: 'Both groups',
    tnFilterAllProjects: 'All projects',
    tnBroadcast: 'Broadcast one (not listed)',
    tnOpsNote: 'Register and filter here; each row has its own collapse / finish / restore actions',
    tnFinishAll: 'Finish all local tasks',
    tnSnapshotTitle: 'State snapshot',
    tnSnapshotHint: 'Three-argument useSyncExternalStore, stable references; each row owns its actions',
    tnEventsTitle: 'Event bus',
    tnEventsHint: 'Real events, latest 8 only; no history retained',
    tnEmptyTasks: 'No tasks yet: register a real one with a button above',
    tnEmptyEvents: 'No events yet',
    tnCountLabel: 'shown / total',
    tnBadgeLocal: 'Created here · restorable',
    tnBadgeRemote: 'Cross-page row · view only',
    secReference: 'Reference',
    secActions: 'Actions',
    secInputs: 'Inputs',
    secDisplay: 'Display',
    secNavigation: 'Navigation',
    tableHint: 'Full frame: grouped header, zebra, click-to-select',
    tableSpanHint: 'No side edges: row and column spans',
    tableGroupHint: 'Default look: grouped table, solid rule between groups',
    paginationHint: 'Standalone pager: align, simple, total',
    tablePagerHint: 'Built-in paging: local slice or server-side',
    tableLoadingHint: 'Loading and empty states',
    secFeedback: 'Feedback',
    secLayout: 'Layout',
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
    dockHint:
      'Right-side dock: a group name is one window; reopening the same name replaces its content in place (no extra column).\nTry it: open A → open B → reopen A (content replaced) → close A → open C (the freed slot is usable) → with 3 columns open, a new group name is rejected.\nTip: click › in the middle of the splitter to collapse that column into a right-edge ear (it leaves the layout); click the ear to expand.',
    dockMainText: 'The dock is a layout member: it squeezes the page content instead of covering it. The three panels demo a built-in header, a custom header, and a header-less panel with a floating close button.',
    dockPanelA: 'Built-in header: icon + title + right-side content',
    dockPanelATag: 'new',
    dockPanelC: 'Header-less panel',
    dockCustomHeadTitle: 'Custom header (everything from here down is yours)',
    dockCustomHeadHint: 'Custom head: no padding or border added',
    dockPanelBody: 'Content of this column. Reopening the same name replaces it; width and position stay put.',
    dockOpened: 'Open now: ',
    dockCollapsed: 'Collapsed: ',
    dockLimitWarn: 'All 3 columns are taken — the new group name was rejected (open returns ok:false / reason:limit)',
    dockBtnOpenA: 'Open A',
    dockBtnOpenB: 'Open B',
    dockBtnOpenA2: 'Reopen A (no duplicate)',
    dockBtnCloseA: 'Close A',
    dockBtnCollapseA: 'Collapse A',
    dockBtnDefault: 'Open default',
    dockBtnOpenC: 'Open C',
    dockBtnReset: 'Close all',
    i18nNow: 'Current locale',
    a11yDesc:
      'To be added:\n· Focus rings and keyboard reachability\n· Tab order and the Modal focus trap\n· Which role / aria-* semantics are covered\n· Contrast and prefers-reduced-motion handling',

    tokensHint: 'All colors from tokens; follows dark mode',
    darkHint:
      'The switch is hard-coded: dark applies only when the host sets data-ds-dark-theme on body — prefers-color-scheme is not read. A plugin therefore needs no theme toggle of its own. The value below is measured live; toggle the theme and reopen this page to see it change.',
    darkNow: 'Current body[data-ds-dark-theme]',
    injectHint: 'Call setStyleKit once; controls inject CSS',
    demoTokenPalette: 'Token palette',
    demoStyleInject: 'Style injection',
    designInjectNote: 'This preview plugin initializes itself exactly this way — preview and real plugin take the same path.',

    btnTextTitle: 'Button labels & language',
    btnTextHint: 'Copy comes from the caller, follows locale',
    btnVariantTitle: 'Variants (10)',
    btnVariantHint: 'Solid, outline and ghost variants',
    btnSizeTitle: 'Sizes / icons / block',
    btnSizeHint: 'sm 24 / md 28 / lg 32; icon takes a ReactNode',
    btnStateTitle: 'States',
    btnStateHint: 'disabled dims; loading disables automatically',
    btnColorTitle: 'Custom colors',
    btnColorHint: 'color takes any CSS color; hover blends it',
    btnWidthTitle: 'Width (fixed / min / max)',
    btnWidthHint: 'width / minWidth / maxWidth are exclusive',
    btnIconMatrixTitle: 'Icon buttons · size × background',
    btnIconMatrixHint: 'sm 24 / md 28 / lg 32; icon-only and icon+label, each with / without fill; dense grows the icon and tightens padding at the same height',












    referenceNote: 'Reference & conventions: accessibility notes, what is explicitly out of scope (same source as docs/design/features.md), and version/build artifact info.',

    btnLabelSave: 'Save changes',
    btnLabelCancel: 'Cancel',
    btnLabelDelete: 'Delete',
    btnLabelMixed: 'Save 保存',
    btnIconOnly: 'icon only',
    btnHintTitle: 'Question-mark hint (FieldHint)',
    btnHintHint: 'Standalone; hover or focus to reveal',

    demoInputFamily: 'Input family',
    inputHint: 'Four field types, all with error and hint',
    demoSearchClear: 'Search clear button',
    demoSearchClearHint: 'A type="search" field with content shows a trailing × on hover or focus; click it to clear — no need to focus the field first.',
    inputGroupTitle: 'InputGroup (input with actions)',
    inputGroupHint: 'Input plus trailing actions as one unit',
    switchTip: 'Official Switch (enable semantics, not a tick) + Checkbox + Segmented',
    checkboxHint: 'Track and knob; bordered adds a frame',
    segToneTitle: 'Segmented selected-pill colors (tone)',
    segToneHint: 'Default themed; or pass a color name or bg/fg',

    pickerHint: 'Single, multi, search, groups, empty',
    dateTimePickerHint: 'single or range at four precisions, no mask',
    modelPickerHint: 'Grouped, flat or cascaded; catalog from host',
    workspacePickerHint: 'List from host snapshot; value is workspaceId',
    splitGroupHint: 'Welds two controls; the shell draws the frame',

    tooltipTitle: 'Tooltip (hover hint)',
    tooltipHint: 'Four placements; long text wraps',
    tooltipAnchorText: 'Text anchor',
    tooltipAnchorButton: 'Button anchor',
    tooltipLong: 'Long label',
    tooltipName: 'Alex Chen',
    tooltipRich: 'Rich card',
    tooltipMultiline: 'Two-part',
    tooltipLongText: 'A deliberately long hint: the bubble wraps at maxWidth instead of stretching to half the viewport, and the official layer pulls it back inside the viewport near the edges.',

    demoCardTitle: 'Card (frame + radius + short rail)',
    demoStripTitle: 'StripCard (soft tint + full-height bar)',
    demoSurfaceTitle: 'Surface (region container)',
    demoListRowTitle: 'ListRow (one item per line, clickable row)',
    listRowHint: 'Resting fill / button-grey hover / bordered / pale slate selected / isolated right-side actions / both slots auto-centered',
    demoBarTitle: 'Rail side: top / right / bottom / left',
    surfaceHint: 'A surface: fill, border, radius, padding',
    barHint: 'Bar side, inset, gap and length',
    cardHint: 'Surface frame + 6px rail · filled / transparent / hover scoped to the header, expanded area opt-in',
    stripHint: 'Tinted fill + 4px rail · filled / transparent / hover scoped to the header, expanded area opt-in',
    sectionHeadTitle: 'SectionHead',
    chipHint: 'tone and size, two axes',
    chipWidthTitle: 'Width (fixed / min / max)',
    chipWidthHint: 'width / minWidth / maxWidth are exclusive',
    chipOverdue: 'Overdue',
    chipStalled: 'Stalled',
    chipDone: 'Done',
    chipDoing: 'In progress',
    marqueeTitle: 'MarqueeText',
    liveTitle: 'LiveText',
    flipTitle: 'FlipText',


    explorerFilesNone: 'Not ready: the host has not exposed remote.workspaceFiles yet (no preview, no picking — no fake data either)',
    explorerAnchorNone: 'Not ready: no workspace in the list owns a session yet (open a session in the host and come back)',
    explorerAnchorLabel: 'Anchor: ',
    explorerSessionLabel: 'session: ',
    explorerWorkspaces: 'workspaces: ',
    methodATitle: 'Method A: openFilePreview dock preview',
    methodAHint: 'Pass a path; a dock opens on the right and squeezes the main area',
    openRootPreview: 'Open the most recent workspace root',
    methodBTitle: 'Method B: pickWorkspaceFile',
    methodBHint: 'Modal by anchor; resolves to { path, isDir }',
    pickAny: 'Pick a file (any)',
    pickDir: 'Folders only',
    pickNone: 'Nothing picked yet',
    pickJsMd: 'JS/MD only',
    pickResult: 'Picked',
    sessionRealTitle: 'Real session list',
    exModelPickerTitle: 'ModelPicker (real catalog)',
    exWorkspacePickerTitle: 'WorkspacePicker (real list)',
    exSplitGroupTitle: 'SplitGroup (combined selectors)',
    exSectionHeadHint: 'Section head shell: tag, icon, title, actions',
    exMarqueeHint: 'Scrolls once; resets to ellipsis on leave',
    exLiveHint: 'Subscribes to a ticker; caller renders the time',
    exFlipHint: 'Single-line swap: old out, new in',
    exSmallModalTitle: 'Small dialogs (custom)',
    exSmallModalHint: 'AlertModal, ConfirmModal and imperative forms',
    exLargeModalTitle: 'Large dialogs (custom)',
    exLargeModalHint: 'Content modal: any body, optional footer',
    exSideSheetTitle: 'Side drawer (overlay)',
    exSideSheetHint: 'Slides in from either side; width draggable',
    exHostModalTitle: 'Native dialogs (host)',
    exHostModalHint: 'Host Modal skin with a custom body',
    exToastNotifyTitle: 'Toast · our notify wrapper',
    exToastNotifyHint: 'notify(): four tones plus a custom action',
    exLoaderTitle: 'Loader · icon only',
    exLoaderHint: 'Icon only; background and placement are yours',
    exLoadingTitle: 'Loading · two styles',
    exLoadingHint: 'showLoading stays until you close the handle',
    sessionRealHint: 'Host sessions snapshot → ListRow per session (clickable / pale slate selected) → real preview',
    sessionListUnavailable: 'Host session services not ready (sessions / uiConversation / uiWorkspace absent) — install this plugin into a real dsh profile to list and preview your sessions',
    sessionListEmpty: 'The host has no visible sessions right now',
    sessionListRunning: 'Running',
    sessionListArchived: 'Archived',
    sessionSlotTitle: 'slot demo',
    sessionSlotAction: 'Demo action',
    sessionSlotHeader: 'Top slot: your own content (scrolls with the session)',
    sessionSlotFooter: 'Bottom slot: summary of this session',


    roadmapHint: 'What is deliberately not provided',
    roadmapOut: 'A settings-page skeleton, an i18n framework (plugin copy is the plugin’s own job), a host typings surface',
    roadmapMirror: 'Full mirror of the official session UI (tool cards / code blocks / reasoning rows / fold relations) — ported into the session subpackage on 2026-10-22',
    roadmapPreview: '(shipped) md render (official MarkdownText) / code highlight (core CodeViewer) / HTML / PDF / Office preview',
    roadmapSkeleton: '(shipped) PanelDock — dockable split panes: multi-panel, replace-by-name, limit 3',
    roadmapLayout: 'Red line: consolidation of the old packages/demo',

    buildDesc: 'Without a version bump, the build stamp tells',
    buildCore: 'core version',
    buildDemo: 'demo version',
    buildStamp: 'build stamp',
    themeToggle: 'Light / dark',
    themeLight: 'Light',
    themeDark: 'Dark',

    segAll: 'All',
    segDoing: 'Doing',
    segClaimed: 'Open',
    segBlocked: 'Blocked',
    segStalled: 'Stalled',
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


    pluginTitle: 'Blue Whale Component Library',
    settingsIntro: 'Blue Whale Component Library is the shared UI foundation for DeepSeek Harness plugins. This package is its live preview: installed in a DSH host, it shows every base control and business component running for real.',
    settingsEntryTitle: 'Plugin entry',
    settingsEntryHint: 'Choose where this plugin appears in the sidebar menu: when off, it is only reachable from Settings. Defaults to More.',
    settingsEntryOff: 'Off',
    settingsEntryFirst: 'First level',
    settingsEntryMore: 'More',
    settingsEntryOffTip: 'When the entry is off, it appears neither at the first level of the sidebar nor in the More menu; only this settings page remains, and it can be re-enabled at any time.',
    settingsEntryFirstTip: 'The entry is pinned to the first level of the sidebar menu, alongside built-in features; clicking it opens the component preview page.',
    settingsEntryMoreTip: 'The entry is placed in the sidebar More menu, leaving the first level uncluttered; expanding More opens the same preview page.',
    settingsOpenDemo: 'View demo',
    settingsGithub: 'Visit GitHub',
    settingsLoading: 'Reading settings…',
    settingsUnavailable: 'The host is not serving this plugin’s settings',
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
