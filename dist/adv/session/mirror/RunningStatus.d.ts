import { createElement as h } from 'react';
import type { Translate } from '../../../utils/i18n.js';
/**
 * 运行中状态行：会话流末尾一行「深度求索中，用时 N 秒 ···」（蓝色 shimmer）。
 * @param startTime - 当前 turn 开始时间；undefined = 尚未起轮（只显示「深度求索中」）。
 * @param t - 翻译席位。
 */
export declare function RunningStatusMirror(props: {
    startTime: number | undefined;
    t: Translate;
}): ReturnType<typeof h>;
//# sourceMappingURL=RunningStatus.d.ts.map