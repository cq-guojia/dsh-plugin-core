import { type StyleKit } from '../design/index.js';
export declare const CONTROLS_DOMAIN = "controls";
/**
 * 实际注入的控件样式 = **牺牲规则** + 全部控件 CSS（顺序不可调换）。
 *
 * 为什么必须有这条守卫：宿主会吃掉 token 块之后的第一条规则（详见 `CSS_GUARD` 注释与
 * `docs/design/external/dsh-host.md` §5）。守卫顶在最前面替真规则挨刀。
 * 导出仅供 `test/css-contract.test.mjs` 断言顺序，不作为对外 API。
 */
export declare const CONTROLS_CSS_WITH_GUARD: string;
export declare function setStyleKit(kit: StyleKit): void;
export declare function getStyleKit(): StyleKit;
/** 登记 token + 控件样式并确保挂载（幂等）。 */
export declare function ensureControls(kit?: StyleKit): void;
//# sourceMappingURL=css.d.ts.map