/**
 * 跑马灯文本 —— **全站唯一实现**（L2，P6 从 editor-fields 迁入 ui）
 *
 * 默认超长省略号；hover 且确实放不下时，来回滚动展示全名。自实现原因：官方 primitives 无跑马灯组件。
 * 测宽用 ResizeObserver + 文本变化重测；滚动距离 0 时不启用 hover 动画（`.dsh-tdt-mq-run` 才有动画）。
 *
 * **双层结构**：外层 `.dsh-tdt-mq` 只负责裁剪（overflow:hidden），内层 `.dsh-tdt-mq-in` 才做
 * transform 滚动——文字永远在自己那一块里跑，不会压到相邻文字。皮肤在 `controls-css.ts`。
 */
import { type CSSProperties, type ReactElement } from 'react';
/** 跑马灯文本。 */
export declare function MarqueeText(props: {
    text: string;
    style?: CSSProperties;
    title?: string;
    /**
     * 追加在外层上的类名（**在 `.dsh-tdt-mq` 之后**，用于调用方自带字体 / 字号 / 字色等皮肤）。
     * 皮肤写在调用方自己的样式域里，本组件只管滚动；字体类挂外层即可（内层继承）。
     */
    className?: string;
}): ReactElement;
//# sourceMappingURL=MarqueeText.d.ts.map