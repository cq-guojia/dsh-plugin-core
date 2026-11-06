import { type ReactNode } from 'react';
import type { Translate } from '../../../utils/i18n.js';
import type { ImageAttachmentRefLike, MessageImageLoader } from '../faces.js';
/** 官方两档版式：单图（长边 240 按原比例）、多图方砖 64。 */
type ImageVariant = 'single' | 'tile';
/** 单张消息图片（官方 MessageImage）：先 peek 同步出图，否则按 loader 拉；失败给可点重试。 */
export declare function MessageImageMirror(props: {
    attachment: ImageAttachmentRefLike;
    load: MessageImageLoader;
    variant: ImageVariant;
    t: Translate;
}): ReactNode;
/** 图片组（官方 ImageGallery）：单图大幅、多图方砖；`align` = 用户侧 end / 助手侧 start。 */
export declare function ImageGalleryMirror(props: {
    images: readonly {
        attachment: ImageAttachmentRefLike;
    }[];
    load: MessageImageLoader;
    align: 'start' | 'end';
    t: Translate;
}): ReactNode;
export {};
//# sourceMappingURL=MessageImage.d.ts.map