import { createStyleKit } from '../design/index.js';
import { BACK_TO_TOP_CSS, BUTTON_CSS, DATETIME_CSS, FIELD_CSS, LOADING_CSS, SEGMENTED_CSS, SELECT_CSS, } from './controls-css.js';
export const CONTROLS_DOMAIN = 'controls';
/**
 * 把 CSS 模板里的两处前缀换成当前插件的：
 * 类名 `dsh-tdt-` 与变量 `--tdt-`。
 *
 * 为什么两个都要换：只换变量的话，两个插件的 `.dsh-tdt-btn` 规则会落在同一个类名上互相覆盖。
 */
export function buildCss(template, prefix) {
    return template.split('dsh-tdt-').join(`dsh-${prefix}-`).split('--tdt-').join(`--${prefix}-`);
}
const CONTROLS_CSS = [
    SEGMENTED_CSS,
    BUTTON_CSS,
    FIELD_CSS,
    DATETIME_CSS,
    SELECT_CSS,
    LOADING_CSS,
    BACK_TO_TOP_CSS,
].join('\n');
/**
 * 当前插件的样式设施。
 *
 * 为什么是模块级而不是 React Context：core 会被**内联进每个插件各自的 bundle**，
 * 模块级变量天然按插件隔离（不像共享运行时那样会互相踩）。
 * 插件启动时 `setStyleKit(createStyleKit({ id, prefix }))` 一次即可；不设就走默认 kit。
 */
let current = createStyleKit({ id: 'dsh-plugin-core-ui', prefix: 'dsh' });
export function setStyleKit(kit) {
    current = kit;
}
export function getStyleKit() {
    return current;
}
/** 登记 token + 控件样式并确保挂载（幂等）。 */
export function ensureControls(kit = current) {
    kit.registerStyle('tokens', kit.tokensCss);
    kit.applyStyle(CONTROLS_DOMAIN, buildCss(CONTROLS_CSS, kit.prefix));
}
//# sourceMappingURL=css.js.map