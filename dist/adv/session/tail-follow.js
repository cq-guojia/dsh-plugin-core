// 会话区自动贴底：纯状态机（零 DOM / 零 React / 零宿主）。
//
// 口径（docs/features/scope.md §2.5，用户 2026-11-04 二次拍板）：只有两种情况允许把视图拉到底 ——
//   ① 首次打开（open）；② 宿主快照有新内容且当时就在底部（content）。
// 本地展开 / 折叠（思考行、工具卡、历史分组）只改 DOM 高度，**不是新内容**，不许把视图拽走。
//
// 历次复发的根因：早先由 ResizeObserver 的「高度变了」反推原因，但高度变化的原因无从分辨
// （展开、异步渲染、新内容都会改高度），而 contentBumpRef 只在「高度稳定」那次 RO 回调里清，
// RO 稳定后根本不再回调 ⇒ 窗口永久敞开，任何一次展开都被当成新内容。
// 这里把原因**显式化**：贴底只由调用方在宿主快照版本变化时调用 content() 触发；
// 窗口由事件打开、由「连续 N 帧已到底且高度不变」关闭，绝不用 DOM 高度反推原因。
// scroll 事件只更新用户意图，绝不启动追尾（程序自己往下滚也发 scroll，在这里追尾就是自激）。
// 流式「边渲染边长」由连续到达的快照事件不断续上同一条 rAF：step 每帧以最新 scrollHeight 为目标。
/** 判定「当时就在底部」的容差（px）。 */
export const TAIL_NEAR_BOTTOM_PX = 24;
/** 内容版本窗口内，连续多少帧「已到底且高度不变」才认为这批内容渲染完。 */
export const TAIL_STABLE_FRAMES = 3;
export function createTailFollower(host) {
    let following = true;
    let lastTop = host.metrics().scrollTop;
    let lastHeight = host.metrics().scrollHeight;
    let stableFrames = 0;
    let windowOpen = false;
    let animating = false;
    let raf = 0;
    let disposed = false;
    const targetOf = () => {
        const m = host.metrics();
        return Math.max(0, m.scrollHeight - m.clientHeight);
    };
    const nearBottom = () => {
        const m = host.metrics();
        return m.scrollHeight - m.scrollTop - m.clientHeight <= TAIL_NEAR_BOTTOM_PX;
    };
    const stop = () => {
        if (animating)
            host.cancelFrame(raf);
        animating = false;
        windowOpen = false;
        stableFrames = 0;
    };
    const step = () => {
        if (disposed || !following || !windowOpen) {
            stop();
            return;
        }
        const m = host.metrics();
        const target = Math.max(0, m.scrollHeight - m.clientHeight);
        const delta = target - m.scrollTop;
        // 指数缓出：每帧以**最新** scrollHeight 为目标，内容边渲染边长也不会停在半路。
        if (delta > 1)
            host.setScrollTop(m.scrollTop + Math.max(1, delta * 0.28));
        else
            host.setScrollTop(target);
        stableFrames = m.scrollHeight === lastHeight && delta <= 1 ? stableFrames + 1 : 0;
        lastHeight = m.scrollHeight;
        if (stableFrames >= TAIL_STABLE_FRAMES) {
            stop();
            return;
        }
        raf = host.frame(step);
    };
    return {
        open() {
            if (disposed)
                return;
            host.setScrollTop(targetOf());
            // 记**写入后的实际读数**：浏览器会把 scrollTop 钳到真实可滚上限，理论值差 1px
            // 就会让随后到达的 scroll 事件被误判成「用户往上滚」，首屏后直接失跟。
            lastTop = host.metrics().scrollTop;
            lastHeight = host.metrics().scrollHeight;
        },
        content() {
            // 用户已经往上滚过 ⇒ 这次新内容也不许把视图拽走。
            if (disposed || !following)
                return;
            windowOpen = true;
            stableFrames = 0;
            lastHeight = host.metrics().scrollHeight;
            if (animating)
                return; // 已在追尾，只续窗口，不重启动画
            animating = true;
            raf = host.frame(step);
        },
        scrolled() {
            if (disposed)
                return;
            const top = host.metrics().scrollTop;
            // 程序只往下滚 ⇒ 「往上滚」是可靠的用户意图判据；手动滚回底部恢复跟随。
            if (top < lastTop - 1) {
                following = false;
                stop();
            }
            else if (nearBottom())
                following = true;
            lastTop = top;
        },
        dispose() {
            if (disposed)
                return;
            disposed = true;
            stop();
        },
    };
}
//# sourceMappingURL=tail-follow.js.map