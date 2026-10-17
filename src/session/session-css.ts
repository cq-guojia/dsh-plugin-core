// 会话预览样式。类名固定 dsh-tdt-ses-*（与组件硬编码 className 对齐，见 css.ts 的 buildCss）。
export const SESSION_CSS = `
.dsh-tdt-ses{display:flex;flex-direction:column;min-height:0;color:var(--tdt-fg);font-size:13px}
.dsh-tdt-ses--sidebar{height:100%;border-left:1px solid var(--tdt-border-faint);background:var(--tdt-surface-base)}
.dsh-tdt-ses--page{height:100%;background:var(--tdt-surface-base)}
.dsh-tdt-ses__list{flex:1;min-height:0;overflow:auto;padding:8px 12px;display:flex;flex-direction:column;gap:10px}
.dsh-tdt-ses__msg{padding:8px 10px;border-radius:8px;background:var(--tdt-surface-2);border:1px solid var(--tdt-border-faint)}
.dsh-tdt-ses__msg--user{background:var(--tdt-open-bg-soft)}
.dsh-tdt-ses__head{display:flex;align-items:center;gap:6px;margin-bottom:4px;color:var(--tdt-fg-3);font-size:11px}
.dsh-tdt-ses__text{margin:0;white-space:pre-wrap;word-break:break-word;line-height:1.6}
.dsh-tdt-ses__atts{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px}
.dsh-tdt-ses__att{
  display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:999px;
  background:var(--tdt-chip-bg);color:var(--tdt-fg);cursor:pointer;border:none;font:inherit;font-size:12px;
}
.dsh-tdt-ses__att:hover{background:var(--tdt-chip-bg-hover)}
.dsh-tdt-ses__note{padding:12px;color:var(--tdt-fg-3);text-align:center}
`
