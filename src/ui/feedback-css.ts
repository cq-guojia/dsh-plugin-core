// 反馈件（Modal / toast / 空态 / 错误边界）样式。
// 类名固定 `dsh-tdt-*`（与组件硬编码 className 对齐，见 css.ts 的 buildCss 说明）；
// 颜色尺寸吃 token 变量（--tdt-*），运行时按插件前缀替换。
export const FEEDBACK_CSS = `
.dsh-tdt-modal-mask{
  position:fixed;inset:0;z-index:1070;display:flex;align-items:center;justify-content:center;
  background:rgba(15,23,42,.45);
}
.dsh-tdt-modal{
  display:flex;flex-direction:column;max-width:min(960px,92vw);max-height:86vh;
  background:var(--tdt-surface-base);border:1px solid var(--tdt-border);
  border-radius:10px;box-shadow:0 16px 48px rgba(15,23,42,.24);overflow:hidden;
}
.dsh-tdt-modal__head{
  display:flex;align-items:center;gap:8px;padding:12px 14px;
  border-bottom:1px solid var(--tdt-border-faint);color:var(--tdt-fg);font-size:14px;
}
.dsh-tdt-modal__title{flex:1;min-width:0}
/* 关闭按钮：24×24 方角图标位，不借用 Picker 的触发器皮肤（那份带 min-width:120px）。 */
.dsh-tdt-modal__close{
  display:inline-flex;align-items:center;justify-content:center;flex:none;
  width:24px;height:24px;padding:0;border:none;border-radius:var(--tdt-radius-sm);
  background:transparent;color:var(--tdt-fg-3);font-family:inherit;font-size:12px;line-height:1;cursor:pointer;
  transition:background-color var(--tdt-dur-fast) var(--tdt-ease),color var(--tdt-dur-fast) var(--tdt-ease);
}
.dsh-tdt-modal__close:hover{background:var(--tdt-hover);color:var(--tdt-fg)}
.dsh-tdt-modal__close:focus-visible{outline:2px solid var(--tdt-focus);outline-offset:1px}
.dsh-tdt-modal__body{flex:1;min-height:0;overflow:auto;padding:12px 14px}
.dsh-tdt-modal__foot{
  display:flex;justify-content:flex-end;gap:8px;padding:10px 14px;
  border-top:1px solid var(--tdt-border-faint);
}
.dsh-tdt-toast-host{
  position:fixed;z-index:1090;left:50%;bottom:32px;transform:translateX(-50%);
  display:flex;flex-direction:column;gap:8px;align-items:center;pointer-events:none;
}
.dsh-tdt-toast{
  padding:8px 14px;border-radius:8px;font-size:13px;color:var(--tdt-fg);
  background:var(--tdt-surface-menu);border:1px solid var(--tdt-border);
  box-shadow:0 8px 24px rgba(15,23,42,.16);
}
.dsh-tdt-toast--success{color:var(--tdt-success);border-color:color-mix(in srgb,var(--tdt-success) 40%,transparent)}
.dsh-tdt-toast--error{color:var(--tdt-danger);border-color:color-mix(in srgb,var(--tdt-danger) 40%,transparent)}
.dsh-tdt-empty{
  display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;
  padding:24px;color:var(--tdt-fg-3);font-size:13px;text-align:center;
}
.dsh-tdt-error{
  padding:12px 14px;border-radius:8px;font-size:13px;
  color:var(--tdt-danger);background:color-mix(in srgb,var(--tdt-danger) 10%,transparent);
  border:1px solid color-mix(in srgb,var(--tdt-danger) 30%,transparent);
}
.dsh-tdt-error__retry{
  margin-top:8px;color:var(--tdt-link);cursor:pointer;background:none;border:none;padding:0;
}
`
