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
export { CHIP_CSS } from './chip-css.generated.js';
//# sourceMappingURL=chip-css.js.map