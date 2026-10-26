/**
 * 全站唯一的箭头：**自绘 chevron**（就是下拉框右侧那颗）。
 *
 * 为什么自绘：`ui` 层零官方依赖（官方图标只在宿主内可解析），官方件在这个包里 import 不到。
 * 为什么不再写字形：'▾' / '↑' 这类字符在各系统字体下粗细、角度、基线都不一样，
 * 同一套界面里会出现两种箭头 —— 2026-10-26 用户点名 ▾ 太丑 ⇒ 一律换成这颗 chevron。
 *
 * 用法：`h(Chevron, { dir: 'up', size: 18 })`；要动画就在外层套一个带 transform 的类
 * （如卡片折叠的 `.dshpc-card__caret.is-open`），不要给每个方向另画一条路径。
 */
import { createElement as h } from 'react';
/** 箭头方向：同一个图形转出来，四向共用一条路径。 */
export type ChevronDir = 'down' | 'up' | 'left' | 'right';
export declare function Chevron(props: {
    /** 方向（默认 down）。 */
    dir?: ChevronDir;
    /** 边长 px（默认 12）。 */
    size?: number;
    /** 追加类名（皮肤 / 定位）。 */
    className?: string;
}): ReturnType<typeof h>;
//# sourceMappingURL=chevron.d.ts.map