import { createElement as h } from 'react';
import type { UtilMessageKey, Translate } from '../../utils/i18n.js';
export type ToolState = 'preparing' | 'running' | 'ok' | 'error' | 'stopped';
export type Variant = 'bash' | 'read' | 'search' | 'write' | 'edit' | 'code' | 'others';
export declare const classifyTool: (name: string) => Variant;
export declare const toolTitleKey: (name: string) => UtilMessageKey;
/** 官方 deriveSummary（tool client.js:221-233）。 */
export declare function deriveSummary(variant: Variant, argsRaw: string): string;
/** 官方 formatToolBody（tool client.js:255-264）：通用展开体的输入正文。 */
export declare function formatToolBody(variant: Variant, argsRaw: string): string | null;
/** 搜索结果卡两面（官方 searchCardModel 的返回；recovery = 截断时的完整结果正文）。 */
interface SearchFace {
    card: {
        kind: 'matches';
        files: SearchFile[];
        total: number;
        truncated: boolean;
    } | {
        kind: 'paths';
        paths: string[];
        total: number;
        truncated: boolean;
    };
    recovery?: string;
}
interface SearchFile {
    path: string;
    matches: {
        lineNumber: number;
        line: string;
    }[];
}
/**
 * 官方 searchCardModel（tool client.js:632-667）：结算成功 + meta.{truncated,total} 齐全才出卡，
 * 否则落回 ioCard 兜底（与官方 generic 路径一致）。
 */
export declare function searchCardModel(name: string, argsRaw: string, output: string, meta: unknown, isError: boolean, settled: boolean): SearchFace | null;
/** 网页卡两面（官方 webCardModel 直接返回的可展开体形状）。 */
type WebFace = {
    kind: 'search';
    answer?: string;
    sources: WebSource[];
    truncated: boolean;
} | {
    kind: 'fetch';
    url: string;
    statusCode: number;
    truncated: boolean;
};
interface WebSource {
    url: string;
    title?: string;
    snippet?: string;
    publishedAt?: string;
}
/** 官方 webCardModel（tool client.js:1070-1094）。 */
export declare function webCardModel(name: string, argsRaw: string, meta: unknown, isError: boolean, settled: boolean): WebFace | null;
/** 终端卡规格（官方 localizeTerminalCardModel 的 card 面；send 的命令/描述在组件侧词典化）。 */
export interface TerminalFace {
    command: string;
    cwd?: string;
    output?: string;
    exitCode?: number | null;
    signal?: string;
    running: boolean;
    /** send 卡：描述 = t('terminalSession', { sessionId })；shell 卡描述直接来自参数。 */
    sessionId?: string;
    description?: string;
}
/** 官方 shellCall（tool client.js:831-855）：无 description = persistent（结算走 generic）。 */
export declare function shellCall(name: string, args: Record<string, unknown>): {
    command: string;
    description: string;
    workdir?: string;
    persistent: boolean;
    background: boolean;
} | null;
/**
 * 官方 spill notice 识别（spill-policy notice.ts，tool client.js:660-703）：
 * 结尾 `)` + 「\n\n( Full formatted result stored at: 」段。超长输出被 spill 化的
 * bash 结果走 generic（官方 isSpilledShellCall 同向；此处放宽为字面匹配，宁滥勿漏）。
 */
export declare function hasSpillNotice(text: string): boolean;
/** 官方 terminalCardModel（tool client.js:929-968）：running 半截返回 running 卡。 */
export declare function terminalCardModel(name: string, argsRaw: string, output: string, isError: boolean, settled: boolean): TerminalFace | null;
/** 官方 terminalBlockLabels（tool client.js:708-737 的键面）。 */
export declare const terminalLabels: (t: Translate) => {
    commandLine: (line: number) => string;
    signal: (signal: string) => string;
    exitCode: (code: number) => string;
    noExitCode: string;
    running: string;
    failed: string;
    done: string;
    copy: string;
    copied: string;
    noOutput: string;
    collapseAria: string;
    collapse: string;
    expandAria: (hidden: number) => string;
    expand: (hidden: number) => string;
};
/** 官方 ExitCodeBadge（tool client.js:1517-1522）：中性胶囊 + 失败点 + 本地化退出状态。 */
export declare function ExitCodeBadge({ label }: {
    label: string;
}): ReturnType<typeof h>;
/**
 * 工具调用 / 命令卡（官方 GenericToolCard + ToolRow 镜像）。
 * 折叠行 = 图标 + 标题 [+ 分隔点 + 摘要（文件路径链接化）+ 后缀]；展开体按官方分发链。
 */
export declare function GenericCommandCard(props: {
    name: string;
    argsRaw: string;
    output: string;
    isError: boolean;
    errorName?: string;
    /** 官方 ToolResultNode.meta（tool-fs diffs / read 窗口；归档快照透传）。 */
    meta?: unknown;
    /** 上游是否已结算（keyed kind==='tool-result'）；缺省按已结算（legacy 节点）。 */
    settled?: boolean;
    /** running 半截的 phase（官方 Tool block.phase）。 */
    phase?: 'preparing' | 'start';
    /** root.error.code === 'interrupted' ⇒ 官方 stopped 态。 */
    interrupted?: boolean;
    /** 统一 openFile 入口：read/write/edit 摘要路径渲染成官方 fileLink。 */
    onOpenFile?: (path: string) => void;
    t: Translate;
}): ReturnType<typeof h>;
export {};
//# sourceMappingURL=GenericCommandCard.d.ts.map