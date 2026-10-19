// 控件样式。类名与变量统一使用 dshpc 前缀。
export const SEGMENTED_CSS = `
/* ── 分段控件（滑动块）P1 ────────────────────────────────────────────────
   结构一套 + 两个受控轴：size(sm|md|lg) × variant(default|inset)。
   变体**只覆盖两个颜色变量**（--seg-track 轨道底 / --seg-thumb 选中块），
   这正是「同一份样式、只重载颜色」的落地形态。 */
/* 两套基础样式（2026-10-01 用户拍板：保留「纯黑面」与「灰底面」两套，不可合并）：
   - default = 纯黑面：轨道=第二层面 + 外描边，选中=亮片底；
   - inset = 灰底面：抄「版本」开关观感（轨道=交互灰 hover 底、无外描边、选中=亮片底），用户觉得比原灰底那套好看。
   ⚠️ 高度对齐规则（2026-10-01 用户拍板，同日修正 +2）：有边 / 无边总高必须 == 控件 token，边框在内部补回，不许额外撑高。
   几何 = 段高 = token − 6px（上下各 2px padding + 1px 边框）；default 真边框 1px + padding 2px，
   inset 无边框故 padding 收 3px 把缺的 1px 补回，两种外观总高都 == token（24/28/32），不再多 +2px。
   以后 Button / Input 的有边 / 无边同此规则。 */
.dshpc-seg{display:inline-flex;align-items:center;gap:2px;padding:2px;border-radius:var(--dshpc-radius-md);background:var(--seg-track);}
/* 选中片 = --dshpc-solid（亮=白片 / 暗=黑片，2026-10-18 对齐真实插件截图）。
   原先取 surface-raised ⇒ 与卡片底（同为 bg-layer-1）同色，选中片在卡上隐形、只剩阴影圈。 */
.dshpc-seg--default{--seg-track:var(--dshpc-surface-2);--seg-thumb:var(--dshpc-solid);border:1px solid var(--dshpc-border);}
.dshpc-seg--inset{--seg-track:var(--dshpc-hover);--seg-thumb:var(--dshpc-solid);border:0;padding:3px;}

.dshpc-seg__item{appearance:none;display:inline-flex;align-items:center;gap:4px;box-sizing:border-box;
  height:calc(var(--dshpc-control-h-sm) - 6px);padding:0 12px;border:0;border-radius:var(--dshpc-radius-sm);
  background:transparent;color:var(--dshpc-fg-2);font-family:inherit;font-size:var(--dshpc-font-sm);line-height:var(--dshpc-line-sm);
  font-weight:400;white-space:nowrap;cursor:pointer;
  transition:color var(--dshpc-dur-fast) var(--dshpc-ease),background-color var(--dshpc-dur-fast) var(--dshpc-ease),box-shadow var(--dshpc-dur-fast) var(--dshpc-ease);}
.dshpc-seg--md .dshpc-seg__item{height:calc(var(--dshpc-control-h-md) - 6px);}
.dshpc-seg--lg .dshpc-seg__item{height:calc(var(--dshpc-control-h-lg) - 6px);}
.dshpc-seg__item:hover:not([aria-pressed='true']):not(:disabled){color:var(--dshpc-fg);}
.dshpc-seg__item[aria-pressed='true']{background:var(--seg-thumb);box-shadow:var(--dshpc-shadow-raised);color:var(--dshpc-fg);font-weight:600;}
.dshpc-seg__item:focus-visible{outline:2px solid var(--dshpc-focus);outline-offset:-2px;}
.dshpc-seg__item:disabled{cursor:default;opacity:.4;}

/* 段内角标（如「异常」的数量）：语义色实面 + 反白字，0 由组件侧不渲染。
   ⚠️ **必须是正圆**（用户 2026-10-03：「多位数给它撑开了，那不是圆的就没办法了」）：
   固定 16×16 + border-radius:50% + padding:0 + overflow:hidden ⇒ 一位数 / 两位数都是同一个圆，
   数字缩到 10px 塞得下；不再用 min-width + 左右 padding（那会让宽度随位数增长变椭圆）。 */
.dshpc-seg__badge{display:inline-flex;align-items:center;justify-content:center;flex:none;
  width:16px;height:16px;padding:0;overflow:hidden;
  border-radius:50%;background:var(--dshpc-danger);color:var(--dshpc-on-signal);
  font-size:10px;line-height:16px;font-weight:500;font-variant-numeric:tabular-nums;}

/* 段内中性计数（如筛选条「全部 11」）：**纯文字，无底、无边、无圆角**（对齐 task-ledger 2026-10-18
   拍板的 .dtl-seg__num：圆圈取了、字再小点）；0 由组件侧不渲染。danger 角标仍走 __badge。 */
.dshpc-seg__count{display:inline;flex:none;margin-left:3px;padding:0;border:0;border-radius:0;
  background:none;color:var(--dshpc-fg-3);font-size:10px;line-height:1;font-weight:400;font-variant-numeric:tabular-nums;}

/* block：撑满父宽（表单行用），各段等分 */
.dshpc-seg--block{display:flex;width:100%;}
.dshpc-seg--block .dshpc-seg__item{flex:1 1 auto;justify-content:center;}

/* weekday：星期多选方块（任务新增 / 编辑页）。基础插件的特殊化定制（用户 2026-10-01 明确要求：
   原 WeekdayPicker 即「蓝底 + 近似方形」，统一到 Segmented 后由这一修饰类补回两处差异）：
   - 每格做成正方形（宽 = 段高）；
   - 选中态用品牌蓝（--dshpc-business）、反白字，轨道用 hover 灰（与原自绘轨道一致）。
   皮肤集中在此、不内联；调用点只挂 .dshpc-seg--weekday 一个修饰类，符合「皮肤只在 controls-css」的规矩。 */
/* weekday：星期多选方块（任务新增 / 编辑页）。基础插件的特殊化定制（用户 2026-10-01 明确要求：
   原 WeekdayPicker 即「蓝底 + 近似方形」，统一到 Segmented 后由这一修饰类补回两处差异）：
   - 每格做成正方形（宽 = 段高）；
   - 选中态用品牌蓝（--dshpc-business）、反白字，轨道用 hover 灰（与原自绘轨道一致）。
   2026-10-18 用户重申（对齐真实截图）：**无外描边**（不管挂哪个 variant，这里一律撤边），
   且方块之间要有间距（gap 6px，不再 2px 挤成一坨）。 */
.dshpc-seg--weekday{--seg-track:var(--dshpc-hover);gap:6px;border:0;padding:3px;}
.dshpc-seg--weekday .dshpc-seg__item{width:calc(var(--dshpc-control-h-lg) - 6px);padding:0;justify-content:center;}
.dshpc-seg--weekday .dshpc-seg__item[aria-pressed='true']{background:var(--dshpc-business);color:var(--dshpc-fg-inverse);box-shadow:var(--dshpc-shadow-raised);}

@media (prefers-reduced-motion: reduce){.dshpc-seg__item{transition:none;}}
`;
export const BUTTON_CSS = `
/* ── 按钮 / 图标钮 P2 ───────────────────────────────────────────────────
   与 Segmented 同一条高度纪律：--dshpc-control-h-sm(24) / -md(28) / -lg(32)，
   有边框的 variant 用 1px 真边框 + 内部 padding 补回，**有边 / 无边同高**。
   variant 只换颜色，结构 / 尺寸 / 交互只此一份。 */
.dshpc-btn{appearance:none;display:inline-flex;align-items:center;justify-content:center;gap:var(--dshpc-space-1);
  box-sizing:border-box;border:1px solid transparent;border-radius:var(--dshpc-radius-md);
  background:transparent;color:var(--dshpc-fg);font-family:inherit;font-weight:500;white-space:nowrap;cursor:pointer;
  transition:background-color var(--dshpc-dur-fast) var(--dshpc-ease),border-color var(--dshpc-dur-fast) var(--dshpc-ease),color var(--dshpc-dur-fast) var(--dshpc-ease),opacity var(--dshpc-dur-fast) var(--dshpc-ease);}
.dshpc-btn--sm{height:var(--dshpc-control-h-sm);padding:0 10px;font-size:var(--dshpc-font-sm);line-height:var(--dshpc-line-sm);}
.dshpc-btn--md{height:var(--dshpc-control-h-md);padding:0 12px;font-size:var(--dshpc-font-md);line-height:var(--dshpc-line-md);}
.dshpc-btn--lg{height:var(--dshpc-control-h-lg);padding:0 14px;font-size:var(--dshpc-font-md);line-height:var(--dshpc-line-md);}
.dshpc-btn__icon{display:inline-flex;align-items:center;flex:none;}

.dshpc-btn--primary{background:var(--dshpc-accent);color:var(--dshpc-fg-inverse);}
.dshpc-btn--primary:hover:not(:disabled){opacity:.9;}
.dshpc-btn--outline{background:var(--dshpc-surface-1);border-color:var(--dshpc-border-strong);color:var(--dshpc-fg);}
.dshpc-btn--outline:hover:not(:disabled){background:var(--dshpc-hover);}
.dshpc-btn--ghost{color:var(--dshpc-fg-2);}
.dshpc-btn--ghost:hover:not(:disabled){background:var(--dshpc-hover);color:var(--dshpc-fg);}
.dshpc-btn--danger{background:var(--dshpc-danger);color:var(--dshpc-on-signal);}
.dshpc-btn--danger:hover:not(:disabled){opacity:.9;}
/* danger-ink：红字描边（破坏性次要操作，如卡片上的「删除」），挂与 outline 组合的修饰类 */
.dshpc-btn--danger-ink{border-color:var(--dshpc-danger);color:var(--dshpc-danger);}
.dshpc-btn--danger-ink:hover:not(:disabled){background:color-mix(in srgb,var(--dshpc-danger) 10%,transparent);color:var(--dshpc-danger);}
/* link：行内文字链接型（会话 / 产出文件名），无底无边、品牌蓝、hover 下划线 */
.dshpc-btn--link{height:auto;padding:0;border:0;background:none;color:var(--dshpc-link);font-weight:400;text-align:left;}
.dshpc-btn--link:hover:not(:disabled){background:none;color:var(--dshpc-link);text-decoration:underline;}
.dshpc-btn:focus-visible{outline:2px solid var(--dshpc-focus);outline-offset:2px;}
.dshpc-btn:disabled{cursor:default;opacity:.5;}

.dshpc-iconbtn{appearance:none;display:inline-flex;align-items:center;justify-content:center;box-sizing:border-box;
  border:1px solid transparent;border-radius:var(--dshpc-radius-sm);background:transparent;color:var(--dshpc-fg-2);
  font-family:inherit;cursor:pointer;flex:none;
  transition:background-color var(--dshpc-dur-fast) var(--dshpc-ease),border-color var(--dshpc-dur-fast) var(--dshpc-ease),color var(--dshpc-dur-fast) var(--dshpc-ease),opacity var(--dshpc-dur-fast) var(--dshpc-ease);}
.dshpc-iconbtn--sm{width:var(--dshpc-control-h-sm);height:var(--dshpc-control-h-sm);font-size:var(--dshpc-font-sm);}
.dshpc-iconbtn--md{width:var(--dshpc-control-h-md);height:var(--dshpc-control-h-md);font-size:var(--dshpc-font-md);}
.dshpc-iconbtn--lg{width:var(--dshpc-control-h-lg);height:var(--dshpc-control-h-lg);font-size:var(--dshpc-font-md);}
.dshpc-iconbtn--plain{color:var(--dshpc-fg-2);}
.dshpc-iconbtn--outline{background:var(--dshpc-surface-1);border-color:var(--dshpc-border);color:var(--dshpc-fg-2);}
.dshpc-iconbtn--danger{color:var(--dshpc-danger);}
.dshpc-iconbtn:hover:not(:disabled){background:var(--dshpc-hover);color:var(--dshpc-fg);}
.dshpc-iconbtn--danger:hover:not(:disabled){background:var(--dshpc-hover);color:var(--dshpc-danger);}
.dshpc-iconbtn:focus-visible{outline:2px solid var(--dshpc-focus);outline-offset:2px;}
.dshpc-iconbtn:disabled{cursor:default;opacity:.4;}

/* ── 行式文件按钮（图标 + 文件名）P2：**全站唯一实现**（2026-10-04 收编）──────────
   用途：「产出物 / 附件」那种**一行一个文件**的清单项（基础信息右栏产出物清单、附件区、
   执行记录页的展开区）。平时透明、**鼠标移上去才出浅底**（沿用用户 2026-10-03 定的观感）。
   两个形态修饰类：
     --block   撑满父宽（清单里一项一行）
     --inline  内容宽（跟在文字后头，如附件行）
   收编原因：这份皮肤此前只写在 task-list.tsx 的 TASK_LIST_CSS 里（旧名 .dshpc-info-out），
   执行记录页展开区要用同一种观感 ⇒ 上提基础层，避免再出现「各写一份外观」（同名不同皮的坑刚踩过）。 */
.dshpc-filechip{appearance:none;-webkit-appearance:none;border:0;border-radius:var(--dshpc-radius-xs);
  background:transparent;color:var(--dshpc-fg);font:inherit;text-align:left;cursor:pointer;min-width:0;
  transition:background-color var(--dshpc-dur) var(--dshpc-ease);}
.dshpc-filechip:hover:not(:disabled){background:var(--dshpc-chip-bg);}
.dshpc-filechip:focus-visible{outline:2px solid var(--dshpc-focus);outline-offset:1px;}
.dshpc-filechip:disabled{cursor:default;background:transparent;color:var(--dshpc-fg-3);}
.dshpc-filechip--block{display:flex;align-items:center;gap:6px;width:100%;box-sizing:border-box;
  padding:4px 6px;font-size:var(--dshpc-font-xs);}
.dshpc-filechip--inline{display:inline-flex;align-items:center;gap:4px;padding:2px 6px;font-size:var(--dshpc-font-sm);}

@media (prefers-reduced-motion: reduce){.dshpc-btn,.dshpc-iconbtn,.dshpc-filechip{transition:none;}}
`;
export const FIELD_CSS = `
/* ── 输入类 P3 ────────────────────────────────────────────────────────── */
.dshpc-input{box-sizing:border-box;border:1px solid var(--dshpc-border);border-radius:var(--dshpc-radius-md);
  background:var(--dshpc-surface-1);color:var(--dshpc-fg);font-family:inherit;outline:none;
  transition:border-color var(--dshpc-dur-fast) var(--dshpc-ease),box-shadow var(--dshpc-dur-fast) var(--dshpc-ease);}
.dshpc-input--sm{height:var(--dshpc-control-h-sm);padding:0 8px;font-size:var(--dshpc-font-sm);line-height:var(--dshpc-line-sm);}
.dshpc-input--md{height:var(--dshpc-control-h-md);padding:0 10px;font-size:var(--dshpc-font-md);line-height:var(--dshpc-line-md);}
.dshpc-input--lg{height:var(--dshpc-control-h-lg);padding:0 12px;font-size:var(--dshpc-font-md);line-height:var(--dshpc-line-md);}
.dshpc-input::placeholder{color:var(--dshpc-fg-dim);}
.dshpc-input:focus{border-color:var(--dshpc-focus);box-shadow:0 0 0 1px var(--dshpc-focus);}
.dshpc-input--error{border-color:var(--dshpc-danger);}
.dshpc-input:disabled{cursor:default;opacity:.5;}

.dshpc-pfx{display:inline-flex;align-items:center;box-sizing:border-box;overflow:hidden;
  border:1px solid var(--dshpc-border);border-radius:var(--dshpc-radius-md);background:var(--dshpc-surface-1);color:var(--dshpc-fg);}
.dshpc-pfx--sm{height:var(--dshpc-control-h-sm);}
.dshpc-pfx--md{height:var(--dshpc-control-h-md);}
.dshpc-pfx--lg{height:var(--dshpc-control-h-lg);}
/* md / lg 档字号跟档走（与同档下拉同字号）：此前写死 sm(12px)，同排下拉是 13px ⇒ 显得「input 字小」。 */
.dshpc-pfx--md .dshpc-pfx__label,.dshpc-pfx--lg .dshpc-pfx__label{font-size:var(--dshpc-font-md);line-height:var(--dshpc-line-md);}
.dshpc-pfx--md .dshpc-pfx__input,.dshpc-pfx--lg .dshpc-pfx__input{font-size:var(--dshpc-font-md);line-height:var(--dshpc-line-md);}
.dshpc-pfx--error{border-color:var(--dshpc-danger);}
.dshpc-pfx:focus-within{border-color:var(--dshpc-focus);box-shadow:0 0 0 1px var(--dshpc-focus);}
.dshpc-pfx__label{padding:0 8px;color:var(--dshpc-fg-2);font-size:var(--dshpc-font-sm);line-height:var(--dshpc-line-sm);white-space:nowrap;border-right:1px solid var(--dshpc-border);}
.dshpc-pfx__input{flex:1 1 auto;min-width:0;height:100%;padding:0 8px;border:0;background:transparent;color:var(--dshpc-fg);
  font-family:inherit;font-size:var(--dshpc-font-sm);line-height:var(--dshpc-line-sm);outline:none;}
.dshpc-pfx__input::placeholder{color:var(--dshpc-fg-dim);}

.dshpc-num{display:inline-flex;align-items:center;justify-content:space-between;box-sizing:border-box;overflow:hidden;
  border:1px solid var(--dshpc-border);border-radius:var(--dshpc-radius-md);background:var(--dshpc-surface-1);color:var(--dshpc-fg);}
/* 中段：数字 + 后缀成组居中；容器被消费端拉宽时吃掉全部余量，两端 − / + 因此钉死在左右边缘。 */
.dshpc-num__mid{display:flex;align-items:center;justify-content:center;flex:1 1 auto;min-width:0;}
.dshpc-num--sm{height:var(--dshpc-control-h-sm);}
.dshpc-num--md{height:var(--dshpc-control-h-md);}
.dshpc-num--lg{height:var(--dshpc-control-h-lg);}
.dshpc-num--md .dshpc-num__input,.dshpc-num--lg .dshpc-num__input{font-size:var(--dshpc-font-md);line-height:var(--dshpc-line-md);}
.dshpc-num--md .dshpc-num__suffix,.dshpc-num--lg .dshpc-num__suffix{font-size:var(--dshpc-font-md);}
.dshpc-num--disabled{opacity:.5;}
.dshpc-num__input{width:36px;height:100%;padding:0 2px;border:0;background:transparent;color:var(--dshpc-fg);
  font-family:inherit;font-size:var(--dshpc-font-sm);line-height:var(--dshpc-line-sm);text-align:center;outline:none;}
.dshpc-num__suffix{padding:0 6px;color:var(--dshpc-fg-2);font-size:var(--dshpc-font-sm);white-space:nowrap;}
.dshpc-num .dshpc-iconbtn{border-radius:0;color:var(--dshpc-fg-2);flex:none;}

/* 官方 Switch 包装统一：选中 = success 绿。
   （合并原先 task-editor-css / task-list 两处就地覆盖；选择器带包装类 + role，特异性高于官方。） */
.dshpc-switch button[role='switch'][aria-checked='true']{background:var(--dshpc-success);}

/* 多行文本输入（提示词等，P3）：卡内无边框（视觉重心在整张卡上），占位色走 dimmed；校验不通过描红盒。
   （从 task-editor-css 的 .dshpc-ed-prompt 上提而来；业务文件不再自写 textarea 皮肤。） */
.dshpc-textarea{display:block;width:100%;box-sizing:border-box;min-height:132px;padding:2px;border:none;outline:none;background:0 0;color:var(--dshpc-fg);font:inherit;font-size:var(--dshpc-font-lg);line-height:1.6;resize:vertical;}
.dshpc-textarea::placeholder{color:var(--dshpc-fg-dim);}
.dshpc-textarea--error{box-shadow:0 0 0 1px var(--dshpc-danger);}

/* 拖拽分隔条（编辑分栏 / 预览 dock 共用，U20 #3）：6px 命中区，col-resize，不画线，hover/按下浮出浅带。
   具体 z-index 由 .dshpc-ed-resizer / .dshpc-sv-resizer 各自补。 */
.dshpc-resizer{position:absolute;top:0;bottom:0;left:0;width:6px;cursor:col-resize;background:0 0;touch-action:none;user-select:none;}
.dshpc-resizer:hover,.dshpc-resizer:active{background:var(--dshpc-hover,rgba(38,49,72,.06));}

@media (prefers-reduced-motion: reduce){.dshpc-input,.dshpc-pfx{transition:none;}}
`;
export const DATETIME_CSS = `
/* ── 日期 / 时间 P4 ───────────────────────────────────────────────────── */
.dshpc-dtf-wrap{display:inline-flex;position:relative;min-width:0;}
/* ⚠️ 边框粗细 / 圆角必须与下拉锚点（dshpc-ed-field 的 fieldButtonStyle）完全一致
   （用户 2026-10-02 点名：同排的日期框与下拉框看着不是一套）⇒ 这里也是 0.5px + radius-md。 */
.dshpc-dtf{display:inline-flex;align-items:center;gap:6px;box-sizing:border-box;height:var(--dshpc-control-h-lg);
  min-width:0;max-width:100%;padding:0 8px;border:0.5px solid var(--dshpc-border-heavy);border-radius:var(--dshpc-radius-md);
  background:var(--dshpc-surface-1);color:var(--dshpc-fg);font:inherit;font-size:var(--dshpc-font-md);line-height:var(--dshpc-line-md);
  cursor:pointer;transition:background-color var(--dshpc-dur-fast) var(--dshpc-ease),border-color var(--dshpc-dur-fast) var(--dshpc-ease);}
/* 日期 / 时间锚点：三档高度（默认 lg=32）。base 已含 lg 高度作兜底，下面三档按 size 覆盖。 */
.dshpc-dtf--sm{height:var(--dshpc-control-h-sm);padding:0 6px;font-size:var(--dshpc-font-sm);line-height:var(--dshpc-line-sm);}
.dshpc-dtf--md{height:var(--dshpc-control-h-md);padding:0 8px;font-size:var(--dshpc-font-md);line-height:var(--dshpc-line-md);}
.dshpc-dtf--lg{height:var(--dshpc-control-h-lg);padding:0 8px;font-size:var(--dshpc-font-md);line-height:var(--dshpc-line-md);}
.dshpc-dtf:hover:not(:disabled){background:var(--dshpc-hover);}
.dshpc-dtf:focus-visible{outline:2px solid var(--dshpc-focus);outline-offset:2px;}
.dshpc-dtf:disabled{cursor:not-allowed;opacity:.6;}
.dshpc-dtf__label{flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-align:left;}
.dshpc-dtf__label--ph{color:var(--dshpc-fg-dim);}
.dshpc-dtf__icon{display:inline-flex;width:16px;height:16px;align-items:center;justify-content:center;flex:none;color:var(--dshpc-fg-3);}

.dshpc-layer{position:fixed;z-index:var(--dshpc-z-menu);box-sizing:border-box;padding:8px;background:var(--dshpc-surface-1);
  box-shadow:var(--dshpc-shadow-2);border-radius:var(--dshpc-radius-md);color:var(--dshpc-fg);font-size:var(--dshpc-font-md);}

.dshpc-cal__head{display:flex;align-items:center;justify-content:space-between;gap:4px;margin-bottom:4px;}
.dshpc-cal__title{flex:1 1 auto;text-align:center;font-size:var(--dshpc-font-md);font-weight:600;color:var(--dshpc-fg);}
.dshpc-cal__grid{display:grid;grid-template-columns:repeat(7,32px);gap:2px;}
.dshpc-cal__weekday{height:24px;display:flex;align-items:center;justify-content:center;font-size:var(--dshpc-font-sm);color:var(--dshpc-fg-3);}
.dshpc-cal__cell{width:32px;height:32px;padding:0;display:flex;align-items:center;justify-content:center;
  border:1px solid transparent;border-radius:var(--dshpc-radius-md);background:transparent;color:var(--dshpc-fg);
  font:inherit;font-size:var(--dshpc-font-md);cursor:pointer;
  transition:background-color var(--dshpc-dur-fast) var(--dshpc-ease),color var(--dshpc-dur-fast) var(--dshpc-ease);}
.dshpc-cal__cell--hover{background:var(--dshpc-hover);}
.dshpc-cal__cell--out{color:var(--dshpc-fg-dim);}
.dshpc-cal__cell--today{border-color:var(--dshpc-business);}
.dshpc-cal__cell[aria-pressed='true']{background:var(--dshpc-accent);color:var(--dshpc-fg-inverse);}
.dshpc-cal__foot{margin-top:6px;padding-top:6px;border-top:1px solid var(--dshpc-border);}

.dshpc-time__cols{display:flex;gap:4px;}
.dshpc-time__list{width:56px;max-height:196px;overflow-y:auto;display:flex;flex-direction:column;gap:2px;}
.dshpc-time__opt{padding:5px 0;border:0;border-radius:var(--dshpc-radius-sm);background:transparent;color:var(--dshpc-fg-2);
  font:inherit;font-size:var(--dshpc-font-md);cursor:pointer;transition:background-color var(--dshpc-dur-fast) var(--dshpc-ease),color var(--dshpc-dur-fast) var(--dshpc-ease);}
.dshpc-time__opt[aria-selected='true']{background:var(--dshpc-hover);color:var(--dshpc-fg);font-weight:600;}
.dshpc-time__foot{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:6px;padding-top:6px;border-top:1px solid var(--dshpc-border);}

@media (prefers-reduced-motion: reduce){.dshpc-dtf,.dshpc-cal__cell,.dshpc-time__opt{transition:none;}}
`;
export const SELECT_CSS = `
/* 下拉 / 日历 / 时分锚点：键盘可达性描边 + 校验描红（类名从业务层沿用，皮肤归位基础层） */
.dshpc-ed-field:focus-visible{outline:2px solid var(--dshpc-business);outline-offset:1px;}
.dshpc-ed-field--error{border-color:var(--dshpc-danger)!important;box-shadow:0 0 0 1px var(--dshpc-danger);}
/* 整行下拉：官方 Menu 的包装 span 是 inline-flex（shrink-to-fit），要连它一起撑满 */
.dshpc-ed-selectwrap{width:100%;}

/* 省略号三件套（ui-style-guide §三「待抽象 #1」的收敛点）：**新代码一律挂这个类**，不再各写一遍。
   ⚠️ 已有 19 处旧写法待逐步收编（2026-10-04 起新增的调用点不许再手写这三条属性）。 */
.dshpc-ellipsis{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}

/* 跑马灯文本（MarqueeText）：双层——外层只裁剪，内层才 transform 滚动；非 hover 内层自带省略号 */
.dshpc-mq{display:block;overflow:hidden;white-space:nowrap;}
.dshpc-mq .dshpc-mq-in{display:inline-block;white-space:nowrap;max-width:100%;overflow:hidden;text-overflow:ellipsis;vertical-align:top;}
/* ⚠️ 跑法（用户 2026-10-03 拍板）：**跑一遍、停在尾字**（播放 1 次 + forwards），不来回弹、不无限跑。
   滚距 = 精确溢出量 ⇒ 停下时最后一个字正好贴右缘，**不会跑进黑块**（黑块是旧手写版把
   内层盒子裁了、按「半截文本」平移导致的）。鼠标移开 ⇒ :hover 失效 ⇒ 自动复位回省略号态。 */
.dshpc-mq-run:hover .dshpc-mq-in{max-width:none;overflow:visible;animation:dshpc-mq-scroll var(--dshpc-mq-dur,6s) linear .4s 1 forwards;}
@keyframes dshpc-mq-scroll{from{transform:translateX(0)}to{transform:translateX(var(--dshpc-mq-dist,-40px))}}
`;
export const LOADING_CSS = `
/* 运行中 / loading 的活动指示：三个小方块依次脉动。 */
@keyframes dshpc-run-block { 0%, 80%, 100% { opacity: 0.25; transform: scale(0.8) } 40% { opacity: 1; transform: scale(1) } }
.dshpc-run-blocks { display: inline-flex; align-items: center; gap: 3px; }
.dshpc-run-blocks > i { width: 5px; height: 5px; border-radius: 1px; background: currentColor; animation: dshpc-run-block 1.2s ease-in-out infinite; }
.dshpc-run-blocks > i:nth-child(2) { animation-delay: 0.15s; }
.dshpc-run-blocks > i:nth-child(3) { animation-delay: 0.3s; }
@media (prefers-reduced-motion: reduce) { .dshpc-run-blocks > i { animation: none; opacity: 1; } }
`;
export const BACK_TO_TOP_CSS = `
/* 回到顶部悬浮钮：圆钮、实面、投影；默认隐身，滚过阈值加 .is-visible 才显形。
   横向 left 由组件按主内容列右缘实时算出（贴在其右侧外侧），不写死。 */
.dshpc-backtotop{
  position:fixed;
  bottom:var(--dshpc-space-4);
  z-index:var(--dshpc-z-dock);
  width:44px;height:44px;
  display:inline-flex;align-items:center;justify-content:center;
  padding:0;margin:0;
  box-sizing:border-box;
  border:1px solid var(--dshpc-border);
  border-radius:50%;
  background:var(--dshpc-solid);
  color:var(--dshpc-on-solid);
  box-shadow:var(--dshpc-shadow-2);
  cursor:pointer;
  opacity:0;
  transform:translateY(8px) scale(.92);
  transition:opacity var(--dshpc-dur) var(--dshpc-ease),
             transform var(--dshpc-dur) var(--dshpc-ease),
             background-color var(--dshpc-dur-fast) var(--dshpc-ease);
  pointer-events:none;
}
.dshpc-backtotop.is-visible{opacity:1;transform:translateY(0) scale(1);pointer-events:auto;}
.dshpc-backtotop:hover{background:var(--dshpc-hover);}
.dshpc-backtotop:active{background:var(--dshpc-active);}
.dshpc-backtotop:focus-visible{outline:2px solid var(--dshpc-focus);outline-offset:2px;}
@media (prefers-reduced-motion: reduce){
  .dshpc-backtotop{transition:opacity var(--dshpc-dur-fast) linear;transform:none;}
}
`;
export const HINT_CSS = `
/* ── 问号提示 P4（用户 2026-10-18：对齐真实插件 HelpButton——**带圈的问号图标**）──
   本体 16px 细圈 + 圈内 ?，颜色 fg-3、hover 只提亮不加底（与 dshpc-ed-help 同规矩）。
   纯 CSS tooltip：hover / 键盘聚焦浮出气泡，零 JS。独立组件，标题后、行尾随处可挂。 */
.dshpc-hint{position:relative;display:inline-flex;align-items:center;justify-content:center;flex:none;
  box-sizing:border-box;width:14px;height:14px;padding:0;border:1px solid currentColor;border-radius:50%;background:transparent;
  color:var(--dshpc-fg-3);font-family:inherit;font-size:8px;font-weight:600;line-height:12px;cursor:help;vertical-align:middle;
  transition:color var(--dshpc-dur-fast) var(--dshpc-ease);}
.dshpc-hint:hover,.dshpc-hint:focus-visible{color:var(--dshpc-fg);background:0 0;}
.dshpc-hint:focus-visible{outline:2px solid var(--dshpc-focus);outline-offset:1px;}
.dshpc-hint__bubble{position:absolute;bottom:calc(100% + 8px);left:50%;transform:translateX(-50%);
  box-sizing:border-box;width:max-content;max-width:280px;padding:8px 10px;
  border-radius:var(--dshpc-radius-sm);background:var(--dshpc-solid);color:var(--dshpc-on-solid);
  font-size:var(--dshpc-font-xs);line-height:1.7;text-align:left;white-space:normal;
  box-shadow:var(--dshpc-shadow-2);z-index:var(--dshpc-z-menu);
  opacity:0;visibility:hidden;pointer-events:none;
  transition:opacity var(--dshpc-dur-fast) var(--dshpc-ease);}
.dshpc-hint:hover .dshpc-hint__bubble,.dshpc-hint:focus-visible .dshpc-hint__bubble{opacity:1;visibility:visible;}
`;
//# sourceMappingURL=controls-css.js.map