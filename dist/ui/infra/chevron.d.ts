/**
 * 全站唯一的箭头：现在就是图标库的 `move-*` 字形（2026-11-14 用户定：图标统一走新图标库，
 * 自绘那条路径删掉）。四向各有一颗字形，不再旋转同一个图形。
 *
 * 用法不变：`h(Chevron, { dir: 'up' })`（默认 12px）。要动画就在外层套一个带 transform 的类
 * （如卡片折叠的 `.dshpc-card__caret.is-open`），不要在组件里写死。
 *
 * 为什么用 `FontIcon` 而不是 `Icon`：控件层不许把官方 primitives 拖进产物闭包
 * （`test/entry-isolation.test.mjs`），字体那条路本来也不需要它。
 */
import { createElement as h } from 'react';
/** 箭头方向：一个方向一颗字形。 */
export type ChevronDir = 'down' | 'up' | 'left' | 'right';
/** 箭头。 */
export declare function Chevron(props: {
    /** 方向（默认 down）。 */
    dir?: ChevronDir;
    /** 字号 px（默认 12）。 */
    size?: number;
    /** 追加类名（皮肤 / 定位）。 */
    className?: string;
}): ReturnType<typeof h>;
//# sourceMappingURL=chevron.d.ts.map