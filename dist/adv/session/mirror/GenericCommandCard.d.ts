import { createElement as h } from 'react';
import type { UtilMessageKey, Translate } from '../../../utils/i18n.js';
import type { ContentBlockLike, ImageAttachmentRefLike, MessageImageLoader } from '../faces.js';
export type ToolState = 'preparing' | 'running' | 'ok' | 'error' | 'stopped';
export type Variant = 'bash' | 'read' | 'search' | 'write' | 'edit' | 'code' | 'others';
export declare const classifyTool: (name: string) => Variant;
export declare const toolTitleKey: (name: string) => UtilMessageKey;
/** 官方 deriveSummary（tool client.js:221-233）。 */
export declare function deriveSummary(variant: Variant, argsRaw: string): string;
/** 官方 readCallLine（tool client.js:432-436）：read 的 offset（1 起）就是落点行，参数非法则无行。 */
export declare function readCallLine(name: string, argsRaw: string): number | undefined;
/** 官方 formatToolBody（tool client.js:255-264）：通用展开体的输入正文。 */
export declare function formatToolBody(variant: Variant, argsRaw: string): string | null;
/** `read_image` 卡面（官方 imageCardModel，tool client.js:2965-2986）。 */
export interface ImageCardFace {
    path: string;
    images: readonly {
        attachment: ImageAttachmentRefLike;
    }[];
    /** 结果里 envelope 之外的文本（官方 extraTexts）；没有 = null。 */
    extraText: string | null;
}
/**
 * 官方 imageCardModel：read_image + 已结算 + 非错误 + 参数里有 file_path + 结果里既有
 * IMAGE_ENVELOPE 文本又有 image 块的附件引用，才出图片卡；任一不满足都回通用卡。
 * @param content - 已结算结果的内容块（图片引用与 envelope 的唯一真源）。
 */
export declare function imageCardFace(name: string, argsRaw: string, content: readonly ContentBlockLike[] | undefined, meta: unknown, isError: boolean, settled: boolean): ImageCardFace | null;
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
/**
 * 官方 ExitCodeBadge（ui-tool@0.2.2-rc.1 lib/client.js:1519-1555）：
 * 官方 Tag 原语 tone="neutral" + badge/dot 两个类。胶囊的底色、圆角、11px 字号全在
 * Tag.module.css 的 .tag[data-tone='neutral'] 里；badge 类只管 flex/gap/margin，
 * 所以只搬 CSS 类而不用 Tag 会丢掉整个胶囊。
 */
export declare function ExitCodeBadge({ label }: {
    label: string;
}): ReturnType<typeof h>;
/**
 * 工具调用 / 命令卡（官方 GenericToolCard + ToolRow 镜像）。
 * 折叠行 = 图标 + 标题 [+ 分隔点 + 摘要（文件路径链接化）+ 后缀]；展开体按官方分发链。
 */
/** 官方 tool-call-model.ts:149-165：摘要分隔符 / 移动符 / 逐文件目标结构。 */
export declare const FILE_TARGET_SEPARATOR = ", ";
export declare const FILE_TARGET_MOVE = " \u2192 ";
export interface ToolRowFileTargetFace {
    readonly id: number;
    readonly from?: string;
    readonly label: string;
    readonly filePath: string | undefined;
}
/**
 * 官方 tool-call-model.ts:380 `patch = toolName === 'apply_patch' ? patchSummary(block.args, …)`：
 * patch 原文只来自 apply_patch 的 `input` 参数（`block.args.text('input')`），且只在参数完整时成立。
 * 本仓 argsRaw 是参数 JSON 文本，流式半截 / 非法 JSON 一律按官方 `args.complete('input') === false` 处理。
 */
export declare function patchInputOf(name: string, argsRaw: string): string | undefined;
/** 官方 `@deepseek-ai/dsh-util-workspace-path` src/index.ts:17-19 的等价判定（POSIX / Windows 盘符 / UNC）。 */
export declare function isAbsoluteWorkspacePath(path: string): boolean;
/**
 * 官方 tool-call-model.ts:311-330 `patchSummary` 的等价复刻：parsePatch 的文件头操作 → 摘要目标。
 * parsePatch 实现体属宿主 `@deepseek-ai/dsh-fs-patch`（lib/client.js 内），本仓只复刻其文件头解析；
 * malformed patch 与官方一样返回空目标（PatchParseError ⇒ operations=[]）。
 * shortcut: 官方 display() 按 cwd / home 缩写路径，只读预览无这两个上下文，直接显示原始路径。
 */
export declare function patchFileTargets(patch: string | undefined): readonly ToolRowFileTargetFace[];
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
    /** root.error.code（ASK_CANCELLED / ASK_ABORTED / …）。 */
    errorCode?: string;
    /** 官方 ToolRow.tsx:274 的宿主文件右键菜单通道；不传则不展开，不伪造。 */
    fileTargetContextMenuProps?: (path: string) => Record<string, unknown> | undefined;
    /** 统一 openFile 入口：read/write/edit 摘要路径渲染成官方 fileLink（read 带 offset 落点行）。 */
    onOpenFile?: (path: string, options?: {
        line?: number;
    }) => void;
    /** `read_image` 的图片卡面（imageCardFace 的结果）；undefined = 走通用卡。 */
    image?: ImageCardFace;
    /** 图片 loader（view.loadImage）；缺席 = 只出路径与尺寸文字，不画图。 */
    loadImage?: MessageImageLoader;
    t: Translate;
}): ReturnType<typeof h>;
export {};
//# sourceMappingURL=GenericCommandCard.d.ts.map