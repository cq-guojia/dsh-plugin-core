let renderer;
/** 注入官方 Tooltip（插件启动时调一次；传 undefined 撤销，FieldHint 回到只画图标）。 */
export function setTooltipRenderer(fn) {
    renderer = fn;
}
/** 当前注入的 renderer；未注入返回 undefined（FieldHint 据此只画图标）。 */
export function getTooltipRenderer() {
    return renderer;
}
//# sourceMappingURL=tooltip.js.map