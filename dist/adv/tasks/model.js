/** 分隔符写成转义，避免被裸中文检测当成界面文案。 */
const TITLE_SEPARATOR = '\u4E28';
export function isDisplayTitle(value) {
    if (value === null || typeof value !== 'object')
        return false;
    const candidate = value;
    return (typeof candidate.category === 'string' && candidate.category.trim() !== '' &&
        typeof candidate.description === 'string' && candidate.description.trim() !== '');
}
export function formatDisplayTitle(title) {
    return `${title.category}${TITLE_SEPARATOR}${title.description}`;
}
/** 形状校验：坏 progress 在边界被剥离（保留旧值），不让它畸形地进 store 或渲染层。 */
export function isTaskProgress(value) {
    if (value === null || typeof value !== 'object')
        return false;
    const v = value;
    const finite = (x) => typeof x === 'number' && Number.isFinite(x);
    return (typeof v.message === 'string' &&
        finite(v.updatedAt) &&
        (v.current === undefined || finite(v.current)) &&
        (v.total === undefined || finite(v.total)) &&
        (v.percent === undefined || finite(v.percent)));
}
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