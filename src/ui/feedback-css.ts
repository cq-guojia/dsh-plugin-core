// 反馈件（Modal / toast / 空态 / 错误边界）样式。
// 类名与 token 变量统一 dshpc 前缀。
export const FEEDBACK_CSS = `
.dshpc-modal-mask{
  position:fixed;inset:0;z-index:1070;display:flex;align-items:center;justify-content:center;
  background:rgba(15,23,42,.45);
}
.dshpc-modal{
  display:flex;flex-direction:column;max-width:min(960px,92vw);max-height:86vh;
  background:var(--dshpc-surface-base);border:1px solid var(--dshpc-border);
  border-radius:10px;box-shadow:0 16px 48px rgba(15,23,42,.24);overflow:hidden;
}
.dshpc-modal__head{
  display:flex;align-items:center;gap:8px;padding:12px 14px;
  border-bottom:1px solid var(--dshpc-border-faint);color:var(--dshpc-fg);font-size:14px;
}
.dshpc-modal__title{flex:1;min-width:0}
/* 关闭按钮：24×24 方角图标位，不借用 Picker 的触发器皮肤（那份带 min-width:120px）。 */
.dshpc-modal__close{
  display:inline-flex;align-items:center;justify-content:center;flex:none;
  width:24px;height:24px;padding:0;border:none;border-radius:var(--dshpc-radius-sm);
  background:transparent;color:var(--dshpc-fg-3);font-family:inherit;font-size:12px;line-height:1;cursor:pointer;
  transition:background-color var(--dshpc-dur-fast) var(--dshpc-ease),color var(--dshpc-dur-fast) var(--dshpc-ease);
}
.dshpc-modal__close:hover{background:var(--dshpc-hover);color:var(--dshpc-fg)}
.dshpc-modal__close:focus-visible{outline:2px solid var(--dshpc-focus);outline-offset:1px}
.dshpc-modal__body{flex:1;min-height:0;overflow:auto;padding:12px 14px}
.dshpc-modal__foot{
  display:flex;justify-content:flex-end;gap:8px;padding:10px 14px;
  border-top:1px solid var(--dshpc-border-faint);
}
.dshpc-toast-host{
  position:fixed;z-index:1090;left:50%;bottom:32px;transform:translateX(-50%);
  display:flex;flex-direction:column;gap:8px;align-items:center;pointer-events:none;
}
.dshpc-toast{
  padding:8px 14px;border-radius:8px;font-size:13px;color:var(--dshpc-fg);
  background:var(--dshpc-surface-menu);border:1px solid var(--dshpc-border);
  box-shadow:0 8px 24px rgba(15,23,42,.16);
}
.dshpc-toast--success{color:var(--dshpc-success);border-color:color-mix(in srgb,var(--dshpc-success) 40%,transparent)}
.dshpc-toast--error{color:var(--dshpc-danger);border-color:color-mix(in srgb,var(--dshpc-danger) 40%,transparent)}
.dshpc-empty{
  display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;
  padding:24px;color:var(--dshpc-fg-3);font-size:13px;text-align:center;
}
.dshpc-error{
  padding:12px 14px;border-radius:8px;font-size:13px;
  color:var(--dshpc-danger);background:color-mix(in srgb,var(--dshpc-danger) 10%,transparent);
  border:1px solid color-mix(in srgb,var(--dshpc-danger) 30%,transparent);
}
.dshpc-error__retry{
  margin-top:8px;color:var(--dshpc-link);cursor:pointer;background:none;border:none;padding:0;
}
`
