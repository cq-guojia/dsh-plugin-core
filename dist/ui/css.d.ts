import { type StyleKit } from '../design/index.js';
export declare const CONTROLS_DOMAIN = "controls";
/**
 * 全部控件样式（数组顺序不可调换：同特异性规则后注入者胜出）。
 * 导出仅供 `test/css-contract.test.mjs` 做文本自检，不作为对外 API。
 */
export declare const CONTROLS_CSS: string;
export declare function setStyleKit(kit: StyleKit): void;
export declare function getStyleKit(): StyleKit;
/** 登记 token + 控件样式并确保挂载（幂等）。 */
export declare function ensureControls(kit?: StyleKit): void;
//# sourceMappingURL=css.d.ts.map