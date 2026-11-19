/** 按 when 过滤某状态下要显示的列表按钮；always 恒显示。 */
export function buttonsForState(buttons, state) {
    if (buttons === undefined)
        return [];
    return buttons.filter((button) => {
        const when = button.when ?? 'always';
        return when === 'always' || when === state;
    });
}
/** 某终态要不要弹卡 / 发通知：整态配置不存在就是不做。 */
export function toastForState(config, state) {
    return state === 'done' ? config?.success : state === 'failed' ? config?.failure : undefined;
}
export function notifyForState(config, state) {
    return state === 'done' ? config?.success : state === 'failed' ? config?.failure : undefined;
}
//# sourceMappingURL=model.js.map