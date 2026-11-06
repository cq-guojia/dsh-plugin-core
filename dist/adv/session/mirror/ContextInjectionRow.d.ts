import { createElement as h } from 'react';
import type { Translate } from '../../../utils/i18n.js';
/** 官方 ContextNode 数据面（content / source / producer / form）。 */
export interface ContextFace {
    content?: readonly unknown[];
    source?: unknown;
    producer?: {
        role?: string;
        label?: string | null;
    } | null;
    form?: string | null;
}
/** 官方工具增删块（ContextNode content 里的 tool-addition / tool-removal）。 */
interface ToolChangeBlock {
    type?: string;
    toolName?: string;
}
/** 折叠行的标题 / 汇总事实（纯函数，冒烟可直接断言）。 */
export interface ContextRowFacts {
    /** 全部内容块都是工具增删块时给出的块集合。 */
    toolBlocks: readonly ToolChangeBlock[] | undefined;
    added: string[];
    removed: string[];
    /** 单块时的那一个（标题说清是哪个，行不可展开）。 */
    single: ToolChangeBlock | undefined;
    title: string;
    /** 折叠行的一行汇总：工具增删多条时有值。 */
    summary: string | null;
}
/** 官方 ContextInjectionRow 的标题与汇总口径（纯函数）。 */
export declare function contextRowFacts(content: readonly unknown[], producerRole: string | undefined, t: Translate): ContextRowFacts;
/** 系统注入上下文行（官方 ContextInjectionRow 镜像）。 */
export declare function ContextInjectionRowMirror(props: {
    node: ContextFace;
    t: Translate;
}): ReturnType<typeof h>;
export {};
//# sourceMappingURL=ContextInjectionRow.d.ts.map