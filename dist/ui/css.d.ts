import { type StyleKit } from '../design/index.js';
export declare const CONTROLS_DOMAIN = "controls";
/**
 * 把 CSS 模板里的两处前缀换成当前插件的：
 * 类名 `dsh-tdt-` 与变量 `--tdt-`。
 *
 * 为什么两个都要换：只换变量的话，两个插件的 `.dsh-tdt-btn` 规则会落在同一个类名上互相覆盖。
 */
export declare function buildCss(template: string, prefix: string): string;
export declare function setStyleKit(kit: StyleKit): void;
export declare function getStyleKit(): StyleKit;
/** 登记 token + 控件样式并确保挂载（幂等）。 */
export declare function ensureControls(kit?: StyleKit): void;
//# sourceMappingURL=css.d.ts.map