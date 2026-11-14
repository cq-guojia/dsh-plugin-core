/**
 * 领域选择器的默认前置图标（2026-10-20 用户：默认就带一个 icon，可换、可去掉）。
 *
 * 2026-11-14 起直接用图标库字形（原先自绘 SVG）：工作区 = `gongzuoqu`、模型 = `AIdamoxing`。
 * 走 `FontIcon` 而不是 `Icon`：控件层不许把官方 primitives 拖进产物闭包
 * （`test/entry-isolation.test.mjs`）。
 *
 * 用法：不传 `icon` ⇒ 默认这颗；传 `null` ⇒ 不显示；传任意 ReactNode ⇒ 换成它。
 */
import { createElement as h } from 'react';
/** 工作区：文件夹 */
export declare function folderIcon(): ReturnType<typeof h>;
/** 模型：四角星 */
export declare function sparkleIcon(): ReturnType<typeof h>;
//# sourceMappingURL=picker-icons.d.ts.map