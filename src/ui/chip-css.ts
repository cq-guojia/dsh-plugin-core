// Chip（标签）样式 —— **chip 只有「胶囊标签」这一个语义**。
//
// 语义边界（2026-10-19 收敛）：只给图标的小按钮属于 `IconButton`
// （`.dshpc-iconbtn`，见 controls-css）；此前 `.dshpc-chip` 在 controls-css 里
// 被定义成 28×28 方角图标底板、在 card-css 里被定义成胶囊标签，两份皮肤同页注入
// ⇒ 后者覆盖前者：Chip 组件被锁成 28px 宽（文字挤压）、图标按钮被撑成胶囊。
// 现在只保留这一份。
//
// 类名固定 `dshpc-chip*`；
// 颜色一律吃 token，深色由 design 的 token 深色段自动生效。
export const CHIP_CSS = `
.dshpc-chip{
  display:inline-flex;align-items:center;justify-content:center;gap:4px;padding:1px 8px;
  box-sizing:border-box;border-radius:var(--dshpc-radius-pill,999px);border:none;
  background:var(--dshpc-chip-bg);color:var(--dshpc-fg);
  font-family:inherit;font-size:11px;line-height:18px;margin:0;
  /* 2026-10-18：chip 是 flex 行里的常用项，禁止被压缩换行（预览站出现过文字竖排、互相叠压的挤压）。 */
  white-space:nowrap;flex:none;
  appearance:none;-webkit-appearance:none;
}
/* 可点态：button 渲染（见 Chip.ts），光标 + hover 加深。 */
.dshpc-chip--clickable{cursor:pointer;transition:background-color var(--dshpc-dur-fast) var(--dshpc-ease);}
.dshpc-chip--clickable:hover:not(:disabled){background:var(--dshpc-chip-bg-hover)}
.dshpc-chip:focus-visible{outline:2px solid var(--dshpc-focus);outline-offset:1px}
.dshpc-chip:disabled{cursor:default;color:var(--dshpc-fg-3)}
@media (prefers-reduced-motion: reduce){.dshpc-chip{transition:none}}
`
