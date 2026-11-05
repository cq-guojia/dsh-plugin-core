let renderer;
/** 注入官方 Tooltip（插件启动时调一次；传 undefined 撤销，回到自绘降级）。 */
export function setTooltipRenderer(fn) {
    renderer = fn;
}
/** 当前注入的 renderer；未注入返回 undefined（FieldHint 据此走降级路径）。 */
export function getTooltipRenderer() {
    return renderer;
}
//# sourceMappingURL=tooltip.js.map