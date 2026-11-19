/**
 * 解析一段 SSE buffer，返回剩余未完整帧。三类 event 分流：
 * `task-snapshot` → onTask(_, true)；`task` → onTask(_, false)；`task-notice` → onNotice。
 * 坏帧（畸形 JSON）与消费方回调异常都只影响该帧：丢掉继续，绝不拆掉整条流——
 * 否则一条坏基线会让客户端每次重连都在同一处抛错，永远收不到好任务。
 */
export function parseTaskFrames(buffer, onTask, onNotice) {
    let rest = buffer;
    for (;;) {
        const cut = rest.indexOf('\n\n');
        if (cut < 0)
            break;
        const frame = rest.slice(0, cut);
        rest = rest.slice(cut + 2);
        const lines = frame.split('\n');
        const event = lines.find((line) => line.startsWith('event:'))?.slice(6).trim();
        const data = lines.find((line) => line.startsWith('data:'))?.slice(5).trim();
        if (data === undefined)
            continue;
        try {
            const payload = JSON.parse(data);
            if (event === 'task-snapshot')
                onTask(payload, true);
            else if (event === 'task')
                onTask(payload, false);
            else if (event === 'task-notice')
                onNotice?.(payload);
        }
        catch (error) {
            console.error('dsh-plugin-core: task stream frame dropped', error);
        }
    }
    return rest;
}
export function connectTaskStream(options) {
    const doFetch = options.fetchImpl ?? fetch;
    const delays = options.retryDelaysMs ?? [1000, 2000, 4000];
    let controller;
    let closed = false;
    void (async () => {
        let retry = 0;
        while (!closed) {
            controller = new AbortController();
            try {
                const response = await doFetch(options.streamUrl, {
                    method: 'GET',
                    headers: options.headers?.(),
                    signal: controller.signal,
                });
                if (!response.ok || response.body === null)
                    throw new Error(`task stream failed: ${response.status}`);
                retry = 0;
                const reader = response.body.getReader();
                const decoder = new TextDecoder();
                let buffer = '';
                for (;;) {
                    const { done, value } = await reader.read();
                    if (done) {
                        // flush decoder 尾部残留，避免最后半帧被吞。
                        if (buffer.length > 0)
                            parseTaskFrames(buffer + decoder.decode(), options.onTask, options.onNotice);
                        break;
                    }
                    buffer = parseTaskFrames(buffer + decoder.decode(value, { stream: true }), options.onTask, options.onNotice);
                }
            }
            catch {
                // 主动关闭不重试。
            }
            if (closed)
                return;
            const delay = delays[Math.min(retry, delays.length - 1)] ?? 4000;
            retry += 1;
            await new Promise((resolve) => setTimeout(resolve, delay));
        }
    })();
    return {
        close() {
            closed = true;
            controller?.abort();
        },
    };
}
//# sourceMappingURL=stream.js.map