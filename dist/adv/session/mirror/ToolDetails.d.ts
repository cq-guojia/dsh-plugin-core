import { type ReactElement } from 'react';
import { type Translate } from '../../../utils/i18n.js';
export interface DetailField {
    label: string;
    value: string;
}
export interface DetailItemModel {
    title?: string;
    subtitle?: string;
    description?: string;
    fields: DetailField[];
    lines?: readonly string[];
    status?: {
        value: 'completed' | 'in_progress' | 'pending';
        label: string;
    };
    badge?: {
        tone?: string;
        label: string;
    };
    location?: {
        path: string;
        line?: number;
    };
    change?: {
        value?: 'added' | 'removed' | 'updated';
        label: string;
    };
    previousStatus?: string;
    markdown?: string;
    code?: {
        text: string;
        language?: string;
    };
    groups?: {
        label: string;
        items: DetailItemModel[];
    }[];
}
export interface ToolDetailsModel {
    items: DetailItemModel[];
    summary?: string;
    empty?: string;
    caption?: string;
    unchanged?: {
        label: string;
        items: DetailItemModel[];
    };
}
/**
 * 官方 detailsCardModel（3985-4029）的「目标 / 定时任务」子集。
 * 结算成功且结果为合法 JSON 才出详情卡；其余一律 null ⇒ 调用方走 ioCard 兜底。
 */
export declare function detailsCardModel(name: string, argsRaw: string, output: string, settled: boolean, isError: boolean, t: Translate): ToolDetailsModel | null;
/** 官方 DetailsRow 的摘要优先级（4080）：summary → 第一项 title → empty → 原摘要。 */
export declare function detailsSummary(model: ToolDetailsModel): string | undefined;
/** 官方 ToolDetails（1458-1492）：caption + 空态 / 列表 + 可折叠的「未变更」组。 */
export declare function ToolDetailsView({ model, t, onOpenFile }: {
    model: ToolDetailsModel;
    t: Translate;
    onOpenFile?: (path: string, options?: {
        line?: number;
    }) => void;
}): ReactElement;
//# sourceMappingURL=ToolDetails.d.ts.map