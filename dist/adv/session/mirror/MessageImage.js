// 官方 `@deepseek-ai/dsh-client-ui-attachment@0.2.2-rc.1` 的 MessageImage / ImageGallery 镜像：
// 组件 client.js:2196-2325、样式 2139-2159（该包自行以
// `data-plugin-css="@deepseek-ai/dsh-client-ui-attachment/MessageImage.module.css"` 注入，
// 故 officialClass('MessageImage', …) 只要前缀表里有这个包就能挂上官方类）。
// 官方由 `conversation.chat.user.images` / `conversation.chat.message.images` / `tool.call.images`
// 三个槽位复用同一组组件；弹窗不走槽机制，按同一 DOM / 类名直画。
//
// 差异（有意）：官方图片走 primitives 的 DraggableImage（原图拖拽，要宿主 fileDrag 服务），
// 弹窗没有该服务 ⇒ 用等价 <img>，alt / object-position 与官方一致。
import { Fragment, createElement as h, useEffect, useState } from 'react';
import { ImageLightbox } from '../../../ui/official.js';
import { officialClass } from '../official-classes.js';
/** 官方 singleFit（client.js:2168-2184）：长边 240px，显示比夹在 [0.25, 4]，且不放大超过原图。 */
function singleFit(dimensions) {
    const natural = dimensions.width / dimensions.height;
    const ratio = Math.min(4, Math.max(0.25, natural));
    const box = ratio >= 1 ? { width: 240, height: 240 / ratio } : { width: 240 * ratio, height: 240 };
    const scale = Math.min(1, dimensions.width / box.width, dimensions.height / box.height);
    return {
        width: Math.max(1, Math.round(box.width * scale)),
        height: Math.max(1, Math.round(box.height * scale)),
        objectPosition: natural < 0.25 ? 'center top' : natural > 4 ? 'left center' : 'center',
    };
}
/** 官方 dimensionsOf（client.js:2186-2192）：宽高都给了才用，否则 240×240 方框。 */
function fitOf(attachment) {
    const { width, height } = attachment;
    return typeof width === 'number' && typeof height === 'number' && width > 0 && height > 0
        ? singleFit({ width, height })
        : { width: 240, height: 240, objectPosition: 'center' };
}
/** 单张消息图片（官方 MessageImage）：先 peek 同步出图，否则按 loader 拉；失败给可点重试。 */
export function MessageImageMirror(props) {
    const { attachment, load, variant, t } = props;
    const [loaded, setLoaded] = useState(() => load.peek?.(attachment) ?? null);
    const [error, setError] = useState(false);
    const [open, setOpen] = useState(false);
    const [attempt, setAttempt] = useState(0);
    useEffect(() => {
        let live = true;
        setError(false);
        setLoaded(load.peek?.(attachment) ?? null);
        load(attachment).then((url) => {
            if (live)
                setLoaded(url);
        }).catch(() => {
            if (live)
                setError(true);
        });
        return () => { live = false; };
    }, [attachment, load, attempt]);
    const label = attachment.name ?? t('sessionImage');
    if (error) {
        return h('button', {
            type: 'button',
            className: officialClass('MessageImage', 'error') ?? '',
            'data-variant': variant,
            onClick: () => { setAttempt(current => current + 1); },
        }, t('sessionImageLoadFailed'));
    }
    const fit = variant === 'single' ? fitOf(attachment) : undefined;
    return h(Fragment, null, h('button', {
        type: 'button',
        className: officialClass('MessageImage', 'frame') ?? '',
        'data-variant': variant,
        style: fit === undefined ? undefined : { width: fit.width, height: fit.height },
        'aria-label': loaded === null
            ? t('sessionImageLoading')
            : t('sessionImageOpenNamed', { label }),
        'aria-busy': loaded === null || undefined,
        onClick: () => { if (loaded !== null)
            setOpen(true); },
    }, loaded === null
        ? h('span', { className: officialClass('MessageImage', 'loading') ?? '' }, t('sessionImageLoading'))
        : h('img', {
            src: loaded,
            alt: label,
            style: fit === undefined ? undefined : { objectPosition: fit.objectPosition },
        })), open && loaded !== null
        ? h(ImageLightbox, {
            src: loaded,
            alt: label,
            labels: { dialog: t('sessionImagePreview'), close: t('sessionImageClosePreview') },
            onClose: () => { setOpen(false); },
        })
        : null);
}
/** 图片组（官方 ImageGallery）：单图大幅、多图方砖；`align` = 用户侧 end / 助手侧 start。 */
export function ImageGalleryMirror(props) {
    const { images, load, align, t } = props;
    if (images.length === 0)
        return null;
    const variant = images.length > 1 ? 'tile' : 'single';
    return h('div', {
        className: officialClass('MessageImage', 'gallery') ?? '',
        'data-align': align,
    }, images.map((image, index) => h(MessageImageMirror, {
        key: `${image.attachment.attachmentId ?? 'image'}:${index}`,
        attachment: image.attachment,
        load,
        variant,
        t,
    })));
}
//# sourceMappingURL=MessageImage.js.map