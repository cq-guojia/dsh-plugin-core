/** 开始一次拖拽调宽（监听 window 的 pointermove / pointerup，松手自动清理）。 */
export function startResizeLayoutWidth(opts) {
    opts.startEvent.preventDefault?.();
    const body = document.body;
    const prevUserSelect = body.style.userSelect;
    body.style.userSelect = 'none';
    window.getSelection()?.removeAllRanges();
    const rootEl = opts.root ?? document.getElementById('dshpc-root');
    if (opts.rootClass !== undefined)
        rootEl?.classList.add(opts.rootClass);
    let frame = 0;
    let pendingX = 0;
    const emit = (clientX) => {
        const w = opts.compute(clientX);
        opts.onMove(w);
        return w;
    };
    const onMove = (event) => {
        if (opts.rafThrottle === true) {
            pendingX = event.clientX;
            if (frame !== 0)
                return;
            frame = requestAnimationFrame(() => { frame = 0; emit(pendingX); });
        }
        else {
            emit(event.clientX);
        }
    };
    const onUp = (event) => {
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
        if (frame !== 0)
            cancelAnimationFrame(frame);
        body.style.userSelect = prevUserSelect;
        if (opts.rootClass !== undefined)
            rootEl?.classList.remove(opts.rootClass);
        opts.onCommit(opts.compute(event.clientX));
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
}
//# sourceMappingURL=resizer.js.map