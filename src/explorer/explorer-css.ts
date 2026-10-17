// explorer 样式。类名固定 dsh-tdt-exp-*（与组件硬编码 className 对齐，见 css.ts 的 buildCss）。
export const EXPLORER_CSS = `
.dsh-tdt-exp{display:flex;flex-direction:column;height:100%;min-height:0;color:var(--tdt-fg);font-size:13px}
.dsh-tdt-exp__crumbs{
  display:flex;align-items:center;gap:2px;flex-wrap:wrap;padding:6px 8px;
  border-bottom:1px solid var(--tdt-border-faint);
}
.dsh-tdt-exp__crumb{
  background:none;border:none;padding:2px 4px;border-radius:4px;cursor:pointer;
  color:var(--tdt-link);font:inherit;
}
.dsh-tdt-exp__crumb--current{color:var(--tdt-fg);font-weight:600;cursor:default}
.dsh-tdt-exp__sep{color:var(--tdt-fg-4)}
.dsh-tdt-exp__tools{display:flex;gap:6px;margin-left:auto}
.dsh-tdt-exp__body{display:flex;flex:1;min-height:0}
.dsh-tdt-exp__tree{width:220px;flex:none;overflow:auto;border-right:1px solid var(--tdt-border-faint)}
.dsh-tdt-exp__item{
  display:flex;align-items:center;gap:6px;padding:4px 8px;cursor:pointer;white-space:nowrap;
}
.dsh-tdt-exp__item:hover{background:var(--tdt-surface-sunken)}
.dsh-tdt-exp__item--active{background:var(--tdt-open-bg)}
.dsh-tdt-exp__icon{width:14px;flex:none;color:var(--tdt-fg-3)}
.dsh-tdt-exp__name{overflow:hidden;text-overflow:ellipsis}
.dsh-tdt-exp__size{margin-left:auto;color:var(--tdt-fg-4);font-size:11px}
.dsh-tdt-exp__preview{flex:1;min-width:0;overflow:auto;padding:8px}
.dsh-tdt-exp__note{padding:6px 8px;color:var(--tdt-fg-3);font-size:11px}
.dsh-tdt-exp__text{
  margin:0;padding:8px;border-radius:6px;background:var(--tdt-code-surface);
  font:var(--tdt-code-font);white-space:pre-wrap;word-break:break-all;
}
.dsh-tdt-exp__image{max-width:100%;border-radius:6px;border:1px solid var(--tdt-border-faint)}
`
