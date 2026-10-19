// Card / StripCard 样式（Chip 已独立到 chip-css.ts，勿再往这里加 chip 规则）。
// 类名固定 dsh-tdt-card*（与组件硬编码 className 对齐，见 css.ts 的 buildCss）；
// 颜色一律吃 token，深色由 design 的 token 深色段自动生效（不写死颜色值）。
export const CARD_CSS = `
.dsh-tdt-card{
  position:relative;padding:12px 14px;background:var(--tdt-surface-1);
  --card-accent:var(--tdt-business);
}
/* 档位 → token（照 records-timeline 的 tone 模式：一个变量切档，不写 5 套规则）。 */
.dsh-tdt-card--success{--card-accent:var(--tdt-success)}
.dsh-tdt-card--warning{--card-accent:var(--tdt-warning)}
.dsh-tdt-card--danger{--card-accent:var(--tdt-danger)}
.dsh-tdt-card--neutral{--card-accent:var(--tdt-fg-4)}

/* 外观一：圆角 + 1px 边框，色条上下留距（短条）。 */
.dsh-tdt-card--bordered{border-radius:8px;border:1px solid var(--tdt-border)}
.dsh-tdt-card--bordered .dsh-tdt-card__bar{top:8px;bottom:8px;border-radius:2px}

/* 外观二：无圆角无边框，色条通高。 */
.dsh-tdt-card--strip{border-radius:0;border:none}
.dsh-tdt-card--strip .dsh-tdt-card__bar{top:0;bottom:0;border-radius:0}

/* 色条：绝对定位 + top/bottom ⇒ 跟着内容高度自适应；上下是否留距由外观决定。 */
.dsh-tdt-card__bar{position:absolute;left:0;width:3px;background:var(--card-accent)}

.dsh-tdt-card__head{display:flex;align-items:flex-start;gap:8px;min-width:0}
.dsh-tdt-card__main{flex:1;min-width:0}
.dsh-tdt-card__side{display:flex;align-items:center;gap:6px;flex:none}
.dsh-tdt-card__toggle{
  display:inline-flex;align-items:center;justify-content:center;
  width:24px;height:24px;padding:0;background:none;border:none;border-radius:6px;
  color:var(--tdt-fg-3);cursor:pointer;
}
.dsh-tdt-card__toggle:hover{background:var(--tdt-surface-sunken);color:var(--tdt-fg)}
.dsh-tdt-card__caret{display:inline-block;font-size:10px;transition:transform .15s ease}
.dsh-tdt-card__caret.is-open{transform:rotate(180deg)}
.dsh-tdt-card__panel{margin-top:8px;padding-top:8px;border-top:1px solid var(--tdt-border-faint)}
`;
//# sourceMappingURL=card-css.js.map