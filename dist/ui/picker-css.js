// 选择器（Picker / ModelPicker）样式。
// 类名前缀固定 `dsh-tdt-picker`（与组件里硬编码的 className 对齐，见 css.ts 的 buildCss 说明）；
// 颜色尺寸一律吃 token 变量（--tdt-*），运行时按插件前缀替换。
export const PICKER_CSS = `
.dsh-tdt-picker{position:relative;display:inline-block;font-size:13px;line-height:20px}
.dsh-tdt-picker__trigger{
  display:inline-flex;align-items:center;justify-content:space-between;gap:6px;
  min-width:120px;max-width:100%;height:28px;padding:0 8px;
  color:var(--tdt-fg);background:var(--tdt-surface-1);
  border:1px solid var(--tdt-border);border-radius:6px;cursor:pointer;
}
.dsh-tdt-picker__trigger:disabled{color:var(--tdt-fg-dim);cursor:not-allowed;opacity:.7}
.dsh-tdt-picker__caret{color:var(--tdt-fg-3);font-size:10px}
.dsh-tdt-picker__menu{
  position:absolute;z-index:60;top:calc(100% + 4px);left:0;min-width:100%;
  max-height:280px;overflow:auto;padding:4px;
  background:var(--tdt-surface-menu);border:1px solid var(--tdt-border);
  border-radius:8px;box-shadow:0 8px 24px rgba(15,23,42,.12);
}
.dsh-tdt-picker__search{
  width:100%;height:28px;margin-bottom:4px;padding:0 8px;box-sizing:border-box;
  color:var(--tdt-fg);background:var(--tdt-surface-sunken);
  border:1px solid var(--tdt-border-faint);border-radius:6px;outline:none;
}
.dsh-tdt-picker__group-label{
  padding:6px 8px 2px;color:var(--tdt-fg-3);font-size:11px;
}
.dsh-tdt-picker__option{
  display:flex;align-items:center;gap:6px;padding:6px 8px;border-radius:6px;cursor:pointer;
  color:var(--tdt-fg);white-space:nowrap;
}
.dsh-tdt-picker__option:hover{background:var(--tdt-surface-sunken)}
.dsh-tdt-picker__option--active{background:var(--tdt-open-bg);color:var(--tdt-business)}
.dsh-tdt-picker__option--disabled{color:var(--tdt-fg-dim);cursor:not-allowed}
.dsh-tdt-picker__tick{width:12px;color:var(--tdt-business)}
.dsh-tdt-picker__empty{padding:8px;color:var(--tdt-fg-3);text-align:center}
.dsh-tdt-picker__degraded{
  padding:6px 8px;margin-bottom:4px;border-radius:6px;
  color:var(--tdt-warning-label);background:color-mix(in srgb,var(--tdt-warning) 12%,transparent);
  font-size:11px;
}
.dsh-tdt-picker__row{display:flex;align-items:center;gap:8px}
`;
//# sourceMappingURL=picker-css.js.map