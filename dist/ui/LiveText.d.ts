import { type ReactNode } from 'react';
/**
 * 每秒自刷新的一小块：只有它自己重渲染（`render` 永远取最新闭包，ref 转发）。
 * 2026-09-30（决策 54）：`render` 由「只能返回字符串」放宽为**可返回节点** —— 「到点未派发」
 * 时要在这里就地换成三个方块的活动指示（文案换不出来，只能给节点）。
 */
export declare function LiveText(props: {
    render: (nowMs: number) => ReactNode;
    style?: Record<string, string | number>;
}): import("react").DetailedReactHTMLElement<{
    style: Record<string, string | number> | undefined;
}, HTMLElement>;
//# sourceMappingURL=LiveText.d.ts.map