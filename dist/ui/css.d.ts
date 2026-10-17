import { type StyleKit } from '../design/index.js';
export declare const CONTROLS_DOMAIN = "controls";
/**
 * 把 CSS 模板里的 **变量前缀** `--tdt-` 换成当前插件的。
 *
 * ⚠️ 类名 `dsh-tdt-` **故意不换**：搬来的控件里 className 是硬编码的 `dsh-tdt-btn` 这类字面量
 * （模板字符串里也拼接了），只换 CSS 侧会让选择器与 className 对不上、样式整片失效。
 * 要连类名一起隔离，必须同步改造每个控件的 className —— 那是另一个任务。
 *
 * 已知限制：两个插件若引的 core 版本不同，`.dsh-tdt-*` 规则会互相覆盖（内容相同时无害）。
 * 主防线是 style 标签 id（`createStyleKit({ id })`）与变量前缀隔离。
 */
export declare function buildCss(template: string, prefix: string): string;
export declare function setStyleKit(kit: StyleKit): void;
export declare function getStyleKit(): StyleKit;
/** 登记 token + 控件样式并确保挂载（幂等）。 */
export declare function ensureControls(kit?: StyleKit): void;
//# sourceMappingURL=css.d.ts.map