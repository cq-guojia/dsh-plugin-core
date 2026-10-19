import { createStyleKit } from '../design/index.js';
import { BACK_TO_TOP_CSS, BUTTON_CSS, CSS_GUARD, DATETIME_CSS, FIELD_CSS, HINT_CSS, LOADING_CSS, SEGMENTED_CSS, SELECT_CSS, } from './controls-css.js';
import { PICKER_CSS } from './picker-css.js';
import { FEEDBACK_CSS } from './feedback-css.js';
import { CARD_CSS } from './card-css.js';
import { CHIP_CSS } from './chip-css.js';
import { EXPLORER_CSS } from '../explorer/explorer-css.js';
import { SESSION_CSS } from '../session/session-css.js';
export const CONTROLS_DOMAIN = 'controls';
const CONTROLS_CSS = [
    SEGMENTED_CSS,
    BUTTON_CSS,
    FIELD_CSS,
    DATETIME_CSS,
    SELECT_CSS,
    LOADING_CSS,
    BACK_TO_TOP_CSS,
    HINT_CSS,
    PICKER_CSS,
    FEEDBACK_CSS,
    EXPLORER_CSS,
    SESSION_CSS,
    CARD_CSS,
    CHIP_CSS,
].join('\n');
/**
 * 实际注入的控件样式 = **牺牲规则** + 全部控件 CSS（顺序不可调换）。
 *
 * 为什么必须有这条守卫：宿主会吃掉 token 块之后的第一条规则（详见 `CSS_GUARD` 注释与
 * `docs/design/external/dsh-host.md` §5）。守卫顶在最前面替真规则挨刀。
 * 导出仅供 `test/css-contract.test.mjs` 断言顺序，不作为对外 API。
 */
export const CONTROLS_CSS_WITH_GUARD = `${CSS_GUARD}\n${CONTROLS_CSS}`;
/**
 * 当前插件的样式设施。
 *
 * 为什么是模块级而不是 React Context：core 会被**内联进每个插件各自的 bundle**，
 * 模块级变量天然按插件隔离（不像共享运行时那样会互相踩）。
 * 插件启动时 `setStyleKit(createStyleKit({ id }))` 一次即可；不设就走默认 kit。
 */
let current = createStyleKit({ id: 'dsh-plugin-core-ui' });
export function setStyleKit(kit) {
    current = kit;
}
export function getStyleKit() {
    return current;
}
/** 登记 token + 控件样式并确保挂载（幂等）。 */
export function ensureControls(kit = current) {
    kit.registerStyle('tokens', kit.tokensCss);
    kit.applyStyle(CONTROLS_DOMAIN, CONTROLS_CSS_WITH_GUARD);
}
//# sourceMappingURL=css.js.map