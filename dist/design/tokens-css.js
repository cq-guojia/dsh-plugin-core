// token 变量表。变量前缀全生态统一 --dshpc-。
// 明暗判据必须是 body[data-ds-dark-theme]（宿主启动脚本写入，是用户在客户端里的选择）；
// 禁止 prefers-color-scheme —— 它跟系统，不跟用户在宿主里的选择。
export const TOKENS_CSS_TEMPLATE = `
/* ── 文字（宿主 label 四档 + 反色面用字）────────────────────────────── */
body{
  --dshpc-fg:var(--dsw-alias-label-primary,#1f2328);
  --dshpc-fg-2:var(--dsw-alias-label-secondary,#5c6370);
  --dshpc-fg-3:var(--dsw-alias-label-tertiary,#767d87);
  --dshpc-fg-4:var(--dsw-alias-label-caption,#9aa1ab);
  --dshpc-fg-dim:var(--dsw-alias-label-dimmed,#b9bfc7);
  /* 反色面上的字（实心钮 / 角标）：暗色下是 bluish-1000，故用 -foreground 而非 -inverted */
  --dshpc-fg-inverse:var(--dsw-alias-label-primary-foreground,#fff);

  /* ── 面（宿主 bg-layer 三档 + 下沉轨道底）──────────────────────────── */
  --dshpc-surface-1:var(--dsw-alias-bg-layer-1,#fff);
  --dshpc-surface-2:var(--dsw-alias-bg-layer-2,#fff);
  --dshpc-surface-3:var(--dsw-alias-bg-layer-3,#fff);
  /* 「选中亮片」的底盘色（配 --dshpc-shadow-raised 用） */
  --dshpc-surface-raised:var(--dsw-alias-bg-layer-1,#fff);
  /* 轨道 / 下沉底（官方分段控件轨道用的就是这条） */
  --dshpc-surface-sunken:var(--dsw-alias-interactive-bg-hover,rgba(38,49,72,.06));
  /* 整页 / 编辑器底（bg-base） */
  --dshpc-surface-base:var(--dsw-alias-bg-base,#fff);
  /* 自绘浮层 / 菜单卡的不透明底（= base；不要用半透明的 specific-menu） */
  --dshpc-surface-menu:var(--dshpc-surface-base);
  /* markdown 代码块面 / 字体（会话镜像里用到） */
  --dshpc-code-surface:var(--dsw-alias-markdown-code-block,rgba(128,128,128,.10));
  --dshpc-code-font:var(--dsw-font-markdown-code-block-small,12px/18px var(--ds-font-family-code,monospace));
  /* 警告文字色（宿主 state-warn-label） */
  --dshpc-warning-label:var(--dsw-alias-state-warn-label,#f5a623);
  /* 固定中性实面（自绘浮层、深色主题下必须自己变的那几个）——只有它需要暗色覆盖 */
  --dshpc-solid:var(--dsw-static-neutral-00,#fff);
  --dshpc-on-solid:var(--dsw-alias-label-primary,#1f2328);
  /* 交付文件卡那种「浅底盘 + hover 加深」两拍 */
  --dshpc-plate:var(--dsw-static-neutral-50,#fafafa);
  --dshpc-plate-hover:var(--dsw-static-neutral-100,#f5f5f5);
  /* ⚠️ 这些**固定中性面一律用 rgba 字面量**（2026-10-19 真机教训）：不要写成
     「rgba 回退行 + 嵌 --dsw-static-* 的 color-mix 行」两条同名声明——自定义属性**后者恒胜**，
     哪怕它的值在宿主里算不出来（static 变量 invalid）⇒ 整条 token 作废、rgba 兜底一起被废，
     0.2.6 里 Segmented 轨道全透明就是这么来的。要跟宿主主题联动的面用 alias token（那些实测有效）。 */
  --dshpc-icon-plate:rgba(255,255,255,.5);
  /* 表头底：浅色主题**偏深**，且必须**比斑马纹（--dshpc-plate）再深一档**——
     两者不能撞色（用户 2026-10-02：表头跟斑马纹一模一样）。 */
  --dshpc-head-bg:var(--dsw-static-neutral-100,#f5f5f5);
  /* 图标小底板（产出物）：浅色下要**看得见**（原先取 plate ⇒ 在白底上等于没有）；hover 加倍。 */
  --dshpc-chip-bg:rgba(15,15,15,.07);
  --dshpc-chip-bg-hover:rgba(15,15,15,.14);
  /* 展开行：**带透明度的蓝**——不是灰、也不是纯色，透出卡片底色，一眼看出「这是展开的」
     （用户 2026-10-02：灰色跟斑马纹分不出来）。内容区再淡一档，形成「行深 / 内容浅」的区隔。 */
  --dshpc-open-bg:rgba(37,99,235,.10);
  --dshpc-open-bg-soft:rgba(37,99,235,.05);
  --dshpc-card-hover:rgba(37,99,235,.07);

  /* ── 描边四档（宿主真值：l1 4% / l2 10% / l3 12% / l4 16%）────────── */
  --dshpc-border-faint:var(--dsw-alias-border-l1,#0000000a);
  --dshpc-border:var(--dsw-alias-border-l2,#0000001a);
  --dshpc-border-strong:var(--dsw-alias-border-l3,#0000001f);
  --dshpc-border-heavy:var(--dsw-alias-border-l4,#00000029);

  /* ── 品牌 / 语义色 ────────────────────────────────────────────────── */
  /* 品牌「面」色：明色近黑、暗色近白（官方 Switch 选中态即此），**不是蓝色** */
  --dshpc-accent:var(--dsw-alias-brand-primary,#0f1115);
  /* 蓝色：强调 / 选中 / 焦点，一律走这条 */
  --dshpc-business:var(--dsw-alias-state-business-primary,#3b5bdb);
  --dshpc-success:var(--dsw-alias-state-success-primary,#22c55e);
  /* ⚠️ 是 state-warn（不是 state-warning，后者宿主无此定义） */
  --dshpc-warning:var(--dsw-alias-state-warn-primary,#f59e0b);
  --dshpc-danger:var(--dsw-alias-state-error-primary,#ec1313);
  --dshpc-link:var(--dsw-alias-link,#3b5bdb);
  /* 语义色**实面**上的字（角标 / 实心提示）：宿主红绿黄三色都是中调 ⇒ 白字两个主题都可读，
     故这是一条与主题无关的常量；不要拿 --dshpc-fg-inverse 顶——它在暗色下是近黑，压在红底上看不清。 */
  --dshpc-on-signal:#fff;
  /* 黄底上的字：黄色是中高明度，白字看不清 ⇒ 固定深色（与主题无关）。 */
  --dshpc-on-warning:#1f2328;

  /* ── 实心按钮的 hover / active 派生态（2026-10-19 用户点名）─────────────────
     原实现是 :hover 直接压 opacity .9：黑底压 10% 几乎看不出来，用户原话「完全感觉不到颜色变了」。
     ⇒ 改成对底色做**明确的混色**（压 22% / 34%），不用 opacity：
       · 亮色主题：黑底（--dshpc-accent）掺白提亮；红 / 绿 / 黄 / 蓝底掺黑压深；
       · 暗色主题：反过来（暗底掺白、亮底掺黑）。
     混色对象是**固定中性色字面量**（#fff / #000），不依赖宿主 static-neutral 是否存在；
     旧内核不认 color-mix 时整条声明作废 ⇒ 回落各档原色（可接受：仍可点，只是没有 hover 反馈）。 */
  --dshpc-accent-hover:color-mix(in srgb,var(--dshpc-accent) 78%,#ffffff);
  --dshpc-accent-active:color-mix(in srgb,var(--dshpc-accent) 64%,#ffffff);
  --dshpc-danger-hover:color-mix(in srgb,var(--dshpc-danger) 78%,#000000);
  --dshpc-danger-active:color-mix(in srgb,var(--dshpc-danger) 64%,#000000);
  --dshpc-success-hover:color-mix(in srgb,var(--dshpc-success) 78%,#000000);
  --dshpc-success-active:color-mix(in srgb,var(--dshpc-success) 64%,#000000);
  --dshpc-warning-hover:color-mix(in srgb,var(--dshpc-warning) 78%,#000000);
  --dshpc-warning-active:color-mix(in srgb,var(--dshpc-warning) 64%,#000000);
  --dshpc-business-hover:color-mix(in srgb,var(--dshpc-business) 78%,#000000);
  --dshpc-business-active:color-mix(in srgb,var(--dshpc-business) 64%,#000000);
  /* 语义色**浅底**：状态色系的「一块底色」——执行记录页每条流水账的块底就是它
     （用户 2026-10-04：正常态给同色系很浅的透明底、失败用红底透出来）。
     用 「color-mix」 现算而不写死 rgba：状态色本身跟随宿主 alias，主题一换自动成立。
     ⚠️ **深色下要更淡**：用户 2026-10-04「深色风格的绿色和红色好像都有点深」⇒ dark 段
     把这四条压到 5%（更贴近面板底、存在感更弱）；浅色段维持 8%。两端各自给值，不共用一条曲线。
     命名收在 tokens.ts 单点（本仓硬规矩：业务文件不许自造 --dshpc-*）。 */
  --dshpc-success-soft:color-mix(in srgb,var(--dshpc-success) 8%,transparent);
  --dshpc-warning-soft:color-mix(in srgb,var(--dshpc-warning) 8%,transparent);
  --dshpc-danger-soft:color-mix(in srgb,var(--dshpc-danger) 8%,transparent);
  --dshpc-business-soft:color-mix(in srgb,var(--dshpc-business) 8%,transparent);

  /* ⚠️ 2026-10-18 用户拍板：宿主 alias 的 hover（暗色白 8% / 亮色 6%）**太弱**，
     「移上去要仔细看才看得出来」⇒ 不再委托宿主 hover 别名，改为自掺中性色并加重：
     亮色掺黑 10%、暗色掺白 14%（active 再加一档）。按钮 / 分段轨道 / 各类 hover 底同时受益。
     ⚠️ 必须保留 rgba 兜底行在前（本文件惯例，见 icon-plate 注释）：掺的是**固定中性色**
     （neutral-900=#0f0f0f / neutral-00=#fff），预计算无损；旧内核不认 color-mix 时走兜底，
     否则整条 background:var(--seg-track) 作废 ⇒ 分段轨道透明（真踩过：预览站轨道消失）。 */
  --dshpc-hover:rgba(15,15,15,.10);
  --dshpc-active:rgba(15,15,15,.18);
  /* 分段控件轨道底：专用 token（rgba 字面量、不借 --dshpc-hover 中转）——
     2026-10-19 教训：变量链中间任何一环 invalid ⇒ background 整条作废、轨道全透明。
     亮色：黑 7%（比 hover 的 10% 淡一档，选中白片才跳得出）。 */
  --dshpc-seg-track:rgba(15,15,15,.07);
  --dshpc-mask:var(--dsw-alias-bg-mask-1,#0000003d);
  /* 「选中面」（2026-10-06，任务日程页首创）= 当前底色**朝更深掺 12% 文字色**：
     浅色主题下文字色是黑 ⇒ 选中面比常态底色**深一档**。深色分支见 body[data-ds-dark-theme]（朝背景色掺）。
     语义：标记「正在看的东西」，比常态明显、又不许盖住内容（不许用半透明叠状态色）。 */
  --dshpc-selected-bg:color-mix(in srgb,var(--dshpc-surface-1) 88%,var(--dshpc-fg));
  /* 任务日程页本月格默认底（2026-10-06 → 续2）：浅色下给**淡蓝**（business 8% 透白底）——
     参照用户参考稿里未选中日程块 / Tuesday 列的那种蓝、再浅一点点；
     相邻月补位格仍走 --dshpc-surface-2（更灰），不受影响。
     深色段维持 #23262e（用户：深色 UI 已差不多，不动）。 */
  --dshpc-cal-cell-bg:color-mix(in srgb,var(--dshpc-business) 8%,var(--dshpc-surface-1));
  /* 任务日程页「点开某天」展开的面板底（2026-10-06 续）：浅色下**无限接近白、只带一丁点灰**
     （neutral-50 = #fafafa）——面板里装半透明执行记录列表，底再深整片就发糊发灰；
     深色段沿用原 selected-bg 暗值，保持不动。 */
  --dshpc-cal-panel-bg:var(--dsw-static-neutral-50,#fafafa);
  /* 任务日程页本月格 hover 底（浅色段，2026-10-06 续3）：不再走灰色通用交互底——
     鼠标移上去应是「更亮一点点的蓝」（与深色段同语义：hover = 提亮的蓝，不是灰下去）。
     浓度**介于**表头蓝（14%）与未选中格蓝（8%）之间、略偏表头一侧：business 12% 透白底
     （比表头浅一点、比未选中格深一点）。 */
  --dshpc-cal-cell-hover:color-mix(in srgb,var(--dshpc-business) 12%,var(--dshpc-surface-1));

  /* ── 投影 / 焦点 ──────────────────────────────────────────────────── */
  --dshpc-shadow-1:var(--dsw-elevation-soft,0 4px 16px 0 #00000008);
  /* 亮片自带的浮起感（选中态用；与 --dshpc-surface-raised 配对） */
  --dshpc-shadow-raised:var(--dsw-elevation-soft,0 4px 16px 0 #00000008);
  --dshpc-shadow-2:var(--dsw-shadow-lv3,0 12px 32px 0 #00000014);
  /* 键盘焦点环。⚠️ 不用宿主 --dsw-focus-ring-color：它默认值是 transparent（兜底不生效、会隐身） */
  --dshpc-focus:var(--dsw-alias-state-business-primary,#3b5bdb);

  /* ── 圆角（宿主真值 4 / 8 / 12 / 16 / 20 / 28）─────────────────────── */
  --dshpc-radius-xs:var(--dsw-radius-xs,4px);
  --dshpc-radius-sm:var(--dsw-radius-sm,8px);
  --dshpc-radius-md:var(--dsw-radius-md,12px);
  --dshpc-radius-lg:var(--dsw-radius-lg,16px);
  --dshpc-radius-xl:var(--dsw-radius-xl,20px);
  --dshpc-radius-panel:var(--dsw-radius-panel,28px);
  /* 全圆（胶囊标签）：宿主的 radius 档最大只有 28px，撑不满 24px 高的 chip */
  --dshpc-radius-pill:999px;

  /* ── 间距四拍（只许用这四档，不许出现 5 / 7 / 9px）────────────────── */
  --dshpc-space-1:4px;
  --dshpc-space-2:8px;
  --dshpc-space-3:12px;
  --dshpc-space-4:16px;

  /* ── 控件高度：离散三档（控件用 size="sm|md|lg" 选；调用点不许自定义高度，
       真不够用才允许在调用点本地覆盖 --dshpc-control-h-*，属例外而非常态）── */
  --dshpc-control-h-sm:24px;
  --dshpc-control-h-md:28px;
  --dshpc-control-h-lg:32px;

  /* ── 字号 / 行高：直绑宿主字号族（宿主真值 11 / 12 / 13 / 14 / 16）───── */
  --dshpc-font-xs:var(--dsw-font-xxxs-11-font-size,11px);
  --dshpc-font-sm:var(--dsw-font-xxs-12-font-size,12px);
  --dshpc-font-md:var(--dsw-font-xs-13-font-size,13px);
  --dshpc-font-lg:var(--dsw-font-s-14-font-size,14px);
  --dshpc-font-xl:var(--dsw-font-base-16-font-size,16px);
  --dshpc-line-xs:var(--dsw-font-xxxs-11-line-height,14px);
  --dshpc-line-sm:var(--dsw-font-xxs-12-line-height,18px);
  --dshpc-line-md:var(--dsw-font-xs-13-line-height,20px);
  --dshpc-line-lg:var(--dsw-font-s-14-line-height,22px);
  --dshpc-line-xl:var(--dsw-font-base-16-line-height,24px);
  --dshpc-font-mono:var(--ds-font-family-code,monospace);

  /* ── 层级阶梯（业务文件不许再写裸 z-index）───────────────────────── */
  /* 页面级预览分栏 → 抽屉（新建/编辑）→ 弹窗/确认框 → 浮层菜单 → 浮层提示 */
  /* 内容层吸顶（天标签 / 表头这类「跟着滚但压住同层内容」的元素）：只压同层兄弟，
     必须低于下面所有浮层档 —— 所以它不是「开新浮层档」，而是内容层内部的排序位。 */
  --dshpc-z-sticky:10;
  --dshpc-z-dock:1030;
  --dshpc-z-drawer:1040;
  --dshpc-z-modal:1070;
  --dshpc-z-menu:1100;
  --dshpc-z-tip:1200;

  /* ── 动效 ─────────────────────────────────────────────────────────── */
  --dshpc-dur:var(--ds-transition-duration,.2s);
  --dshpc-dur-fast:var(--ds-transition-duration-fast,.12s);
  --dshpc-ease:var(--ds-ease-in-out,cubic-bezier(.4,0,.2,1));
  /* 运行中状态的脉动时长（2026-10-06 统一前后两端：任务配置里的绿呼吸 → 蓝、放慢；
     执行记录里的蓝闪 → 放慢一点。两者用同一个值，动画形状本就一致）。 */
  --dshpc-dur-run:500ms;
}

/* ── 明暗差异的**唯一**落点 ──────────────────────────────────────────────
   判据 = body[data-ds-dark-theme]（宿主 0.2.0-rc.2 源码核实：启动脚本 toggleAttribute 写入，
   唯一明暗判据；插件禁止用 prefers-color-scheme —— 它跟的是系统、不是用户在宿主里的选择）。
   下面只放 alias 表达不了的「固定中性面」；颜色若能靠 alias 自动跟随，一律不要写在这里。 */
body[data-ds-dark-theme]{
  --dshpc-solid:var(--dsw-static-neutral-900,#0f0f0f);
  --dshpc-on-solid:var(--dsw-static-neutral-00,#fff);
  /* 实心按钮 hover / active（暗色版）：黑底（浅色主题的近黑 → 暗色下的近白）掺黑压深；
     红 / 绿 / 黄 / 蓝掺白提亮。与亮色段方向相反，保证两种主题下「一眼看出变了」。 */
  --dshpc-accent-hover:color-mix(in srgb,var(--dshpc-accent) 80%,#000000);
  --dshpc-accent-active:color-mix(in srgb,var(--dshpc-accent) 66%,#000000);
  --dshpc-danger-hover:color-mix(in srgb,var(--dshpc-danger) 78%,#ffffff);
  --dshpc-danger-active:color-mix(in srgb,var(--dshpc-danger) 64%,#ffffff);
  --dshpc-success-hover:color-mix(in srgb,var(--dshpc-success) 78%,#ffffff);
  --dshpc-success-active:color-mix(in srgb,var(--dshpc-success) 64%,#ffffff);
  --dshpc-warning-hover:color-mix(in srgb,var(--dshpc-warning) 78%,#ffffff);
  --dshpc-warning-active:color-mix(in srgb,var(--dshpc-warning) 64%,#ffffff);
  --dshpc-business-hover:color-mix(in srgb,var(--dshpc-business) 78%,#ffffff);
  --dshpc-business-active:color-mix(in srgb,var(--dshpc-business) 64%,#ffffff);
  /* 暗色 hover 掺白 14% / active 24%（对齐上面 2026-10-18 的加重拍板）。rgba 兜底行同上。 */
  --dshpc-hover:rgba(255,255,255,.14);
  --dshpc-active:rgba(255,255,255,.24);
  /* 分段轨道（暗色版）：白 10%——比 hover 淡一档，选中亮片才跳得出。 */
  --dshpc-seg-track:rgba(255,255,255,.10);
  --dshpc-plate:var(--dsw-static-neutral-850,#212123);
  --dshpc-plate-hover:var(--dsw-static-neutral-800,#292929);
  --dshpc-icon-plate:rgba(255,255,255,.05);
  /* 暗色主题**反过来**：表头要比卡片面**亮**、比斑马纹再**浅一档**（用户：纯黑背景没法看）。 */
  --dshpc-head-bg:var(--dshpc-surface-2);
  /* 暗色底板**微亮**；hover **更亮**（原先 hover 取 plate-hover 反而更淡 ⇒ 鼠标移上去就没了）。 */
  --dshpc-chip-bg:rgba(255,255,255,.08);
  --dshpc-chip-bg-hover:rgba(255,255,255,.16);
  /* 暗色下蓝色要更亮、透明度略高才压得住深底。 */
  --dshpc-open-bg:rgba(96,165,250,.18);
  --dshpc-open-bg-soft:rgba(96,165,250,.08);
  --dshpc-card-hover:rgba(96,165,250,.13);
  /* 语义色**浅底**（深色版）：用户嫌深色的绿 / 红「有点深」⇒ 压到 **5%**（浅色段是 8%），
     更贴近面板底色、存在感更弱；块底与状态色竖条仍同源（竖条是实色，不受这条影响）。 */
  --dshpc-success-soft:color-mix(in srgb,var(--dshpc-success) 5%,transparent);
  --dshpc-warning-soft:color-mix(in srgb,var(--dshpc-warning) 5%,transparent);
  --dshpc-danger-soft:color-mix(in srgb,var(--dshpc-danger) 5%,transparent);
  --dshpc-business-soft:color-mix(in srgb,var(--dshpc-business) 5%,transparent);
  /* 「选中面」（深色版，2026-10-06）：掺 **~40% 背景色**（--dshpc-surface-base）⇒ 无限接近页面背景的黑、
     只比背景略深一点点（用户：深色下展开区压着任务透明绿会发灰，底色要尽量贴近背景才不显灰）。
     ⚠️ 深色下不能掺文字色 —— 那是白，会变亮，选中反而比本月日期浅。 */
  --dshpc-selected-bg:color-mix(in srgb,var(--dshpc-surface-1) 60%,var(--dshpc-surface-base));
  /* 任务日程页本月格的默认底（深色版，2026-10-06）：深的、带点灰蓝的暗色（用户给的参考图 ≈ #23262e），
     比原来的卡片面更沉、更偏蓝灰；选中格仍走 --dshpc-selected-bg（更暗一档），层级不变。 */
  --dshpc-cal-cell-bg:#23262e;
  /* 任务日程页本月格 hover 底（深色段，2026-10-06）：原先走 --dshpc-hover（宿主浅色叠加）在深底上显得
     「灰发亮」，不好看 ⇒ 换成更贴底的蓝调微亮（与 open-bg-soft 同族），hover 时不刺眼、又有反馈。 */
  --dshpc-cal-cell-hover:rgba(96,165,250,.12);
  /* 任务日程页展开面板底（深色段，2026-10-06 续）：与原 selected-bg 暗值一致，深色 UI 不动 */
  --dshpc-cal-panel-bg:color-mix(in srgb,var(--dshpc-surface-1) 60%,var(--dshpc-surface-base));
}
\``;
//# sourceMappingURL=tokens-css.js.map