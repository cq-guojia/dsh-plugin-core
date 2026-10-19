import { type StyleKit } from '../design/index.js';
export declare const CONTROLS_DOMAIN = "controls";
export declare function setStyleKit(kit: StyleKit): void;
export declare function getStyleKit(): StyleKit;
/** 登记 token + 控件样式并确保挂载（幂等）。 */
export declare function ensureControls(kit?: StyleKit): void;
//# sourceMappingURL=css.d.ts.map