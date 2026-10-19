// explorer 样式。类名固定 dshpc-exp-*。
export const EXPLORER_CSS = `
.dshpc-exp{display:flex;flex-direction:column;height:100%;min-height:0;color:var(--dshpc-fg);font-size:13px}
.dshpc-exp__crumbs{
  display:flex;align-items:center;gap:2px;flex-wrap:wrap;padding:6px 8px;
  border-bottom:1px solid var(--dshpc-border-faint);
}
.dshpc-exp__crumb{
  background:none;border:none;padding:2px 4px;border-radius:4px;cursor:pointer;
  color:var(--dshpc-link);font:inherit;
}
.dshpc-exp__crumb--current{color:var(--dshpc-fg);font-weight:600;cursor:default}
.dshpc-exp__sep{color:var(--dshpc-fg-4)}
.dshpc-exp__tools{display:flex;gap:6px;margin-left:auto}
.dshpc-exp__body{display:flex;flex:1;min-height:0}
.dshpc-exp__tree{width:220px;flex:none;overflow:auto;border-right:1px solid var(--dshpc-border-faint)}
.dshpc-exp__item{
  display:flex;align-items:center;gap:6px;padding:4px 8px;cursor:pointer;white-space:nowrap;
}
.dshpc-exp__item:hover{background:var(--dshpc-surface-sunken)}
.dshpc-exp__item--active{background:var(--dshpc-open-bg)}
.dshpc-exp__icon{width:14px;flex:none;color:var(--dshpc-fg-3)}
.dshpc-exp__name{overflow:hidden;text-overflow:ellipsis}
.dshpc-exp__size{margin-left:auto;color:var(--dshpc-fg-4);font-size:11px}
.dshpc-exp__preview{flex:1;min-width:0;overflow:auto;padding:8px}
.dshpc-exp__note{padding:6px 8px;color:var(--dshpc-fg-3);font-size:11px}
.dshpc-exp__text{
  margin:0;padding:8px;border-radius:6px;background:var(--dshpc-code-surface);
  font:var(--dshpc-code-font);white-space:pre-wrap;word-break:break-all;
}
.dshpc-exp__image{max-width:100%;border-radius:6px;border:1px solid var(--dshpc-border-faint)}
`
