import { createElement as h } from 'react';
export interface LoadingProps {
    /** 主内容容器 id，loading 贴到它的右下角；默认 `dsh-tdt-main`。 */
    anchorId?: string;
}
/** 浮动 Loading pill：三个脉动方块（无文案；基础抽象统一外观）。 */
export declare function Loading(props: LoadingProps): ReturnType<typeof h>;
/** 运行中状态用的三个脉动方块（无文案），颜色跟随 `currentColor`。 */
export declare function RunningBlocks(): ReturnType<typeof h>;
//# sourceMappingURL=Loading.d.ts.map