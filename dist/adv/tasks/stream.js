/**
 * 解析一段 SSE buffer，返回剩余未完整帧。三类 event 分流：
 * `task-snapshot` → onTask(_, true)；`task` → onTask(_, false)；`task-notice` → onNotice。
 * 坏帧（畸形 JSON）与消费方回调异常都只影响该帧：丢掉继续，绝不拆掉整条流——
 * 否则一条坏基线会让客户端每次重连都在同一处抛错，永远收不到好任务。
 */
export function parseTaskFrames(buffer, onTask, onNotice) {
    let rest = buffer;
    for (;;) {
        // 帧分隔兼容 LF(`\n\n`) 与 CRLF(`\r\n\r\n`)：取更早出现的那个；
        // 逐帧处理时不整段归一 \r，避免 chunk 边界把 \r\n 拆成两片后再也对不上。
        const lf = rest.indexOf('\n\n');
        const crlf = rest.indexOf('\r\n\r\n');
        const cut = crlf >= 0 && (lf < 0 || crlf < lf) ? crlf : lf;
        if (cut < 0)
            break;
        const sep = cut === crlf && crlf >= 0 ? 4 : 2;
        const frame = rest.slice(0, cut);
        rest = rest.slice(cut + sep);
        // 按行拆时去掉每行行尾的 \r；多行 data 按 SSE 规范用 \n 拼接。
        const lines = frame.split(/\r?\n/);
        const event = lines.find((line) => line.startsWith('event:'))?.slice(6).trim();
        const data = lines
            .filter((line) => line.startsWith('data:'))
            .map((line) => line.slice(5).trimStart())
            .join('\n');
        if (data === '')
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
/** 可取消的退避等待：shutdown abort 时立即 resolve，不让 close 后还挂满 delay。 */
function sleep(ms, signal) {
    return new Promise((resolve) => {
        if (signal.aborted) {
            resolve();
            return;
        }
        const onAbort = () => { clearTimeout(timer); resolve(); };
        const timer = setTimeout(() => {
            signal.removeEventListener('abort', onAbort);
            resolve();
        }, ms);
        signal.addEventListener('abort', onAbort, { once: true });
    });
}
export function connectTaskStream(options) {
    const doFetch = options.fetchImpl ?? fetch;
    const delays = options.retryDelaysMs ?? [1000, 2000, 4000];
    let controller;
    let closed = false;
    // 连接级关闭信号：与每轮的 fetch controller 分开，专门用来打断退避等待。
    const shutdown = new AbortController();
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
            await sleep(delay, shutdown.signal);
        }
    })();
    return {
        close() {
            closed = true;
            controller?.abort();
            shutdown.abort();
        },
    };
}
//# sourceMappingURL=stream.js.map