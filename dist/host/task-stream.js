function json(res, status, body) {
    res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(body));
}
/** SSE 保活帧：注释行，客户端 EventSource/fetch 都不会当成事件数据。 */
const KEEP_ALIVE = ': keep-alive\n\n';
export function serveTaskStream(ctx, options) {
    if (typeof options.authorize !== 'function') {
        throw new Error('serveTaskStream requires authorize: host provides no server-wide auth');
    }
    const base = options.basePath.replace(/\/$/, '');
    const keepAliveMs = options.keepAliveMs ?? 25000;
    /** 每条连接各自持有 off + timer；serve 的 disposer 统一收口，连接关闭只清自己那条。 */
    const connections = new Set();
    // webServer 一律走 inject 等待，与 serveModelCatalog / serveFsRoute / serveTaskSubmit 一致。
    // strict ctx.get 只认当前 active 的 provider fiber；插件 apply 执行时 webServer 常未 active，
    // 同步 get 拿到 undefined 若在 apply 栈里抛错，会让整条插件 fiber 失败，连带同一 apply 里
    // 那几条 inject 子插件一起被 dispose（cordis effect.disposeAfter）—— 所有路由一起 404。
    // 服务未就位时自然缺席、不抛，不拖累其它路由。
    ctx.inject(['webServer'], (services) => {
        const web = services.webServer;
        if (web === undefined)
            return;
        web.register({
            kind: 'exact',
            path: `${base}/stream`,
            handler: (req, rawRes) => {
                const res = rawRes;
                // 同步抛也要抓住：Promise.resolve(fn()) 在 fn 同步抛时根本进不了 .then/.catch。
                Promise.resolve()
                    .then(() => options.authorize(req))
                    .then((viewer) => {
                    if (viewer === null || viewer === '') {
                        json(res, 401, { error: 'unauthorized' });
                        return;
                    }
                    // 三流都先订阅再取基线：窗口内的事件先进缓冲，基线写完再按序回放，消除丢事件窗口。
                    const buffered = [];
                    let streaming = false;
                    const push = (event, payload) => {
                        const frame = `event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`;
                        if (streaming)
                            res.write(frame);
                        else
                            buffered.push(frame);
                    };
                    const sendTask = (task) => { push('task', task); };
                    const sendNotice = (notice) => { push('task-notice', notice); };
                    const offTask = options.source.subscribe(sendTask, viewer);
                    const offNotice = options.source.subscribeNotices?.(sendNotice, viewer);
                    // 保活 timer 必须在 writeHead 之后再启动：快照慢于 keepAliveMs 时，
                    // 提前 setInterval 的第一次 res.write 会隐式发头，随后的 writeHead(200) 抛
                    // ERR_HTTP_HEADERS_SENT，这条流直接废掉。快照期间没有头可写，本就不该发保活。
                    let timer;
                    let closed = false;
                    const conn = {
                        cleanup() {
                            closed = true;
                            if (timer !== undefined)
                                clearInterval(timer);
                            offTask();
                            offNotice?.();
                            connections.delete(conn);
                        },
                    };
                    connections.add(conn);
                    // res.on 可选：没有 close 事件时靠 serve disposer 收口，不让 off/timer 永久泄漏。
                    res.on?.('close', () => { conn.cleanup(); });
                    void Promise.resolve(options.source.snapshot(viewer)).then((baseline) => {
                        if (closed)
                            return;
                        res.writeHead(200, {
                            'content-type': 'text/event-stream; charset=utf-8',
                            'cache-control': 'no-cache, no-transform',
                            connection: 'keep-alive',
                            'x-accel-buffering': 'no',
                        });
                        timer = setInterval(() => { if (!closed)
                            res.write(KEEP_ALIVE); }, keepAliveMs);
                        timer.unref?.();
                        // 快照只恢复列表；历史终态绝不在此弹卡（否则刷新就重弹）。
                        for (const task of baseline)
                            res.write(`event: task-snapshot\ndata: ${JSON.stringify(task)}\n\n`);
                        streaming = true;
                        for (const frame of buffered)
                            res.write(frame);
                        buffered.length = 0;
                    }).catch((error) => {
                        // 快照失败发生在 writeHead 之前：头未发，可安全结束；不写 401 是因为鉴权已过。
                        console.error('dsh-plugin-core: task stream baseline failed', error);
                        conn.cleanup();
                        res.end();
                    });
                })
                    .catch(() => { json(res, 401, { error: 'unauthorized' }); });
            },
        });
    });
    return () => { for (const conn of [...connections])
        conn.cleanup(); connections.clear(); };
}
//# sourceMappingURL=task-stream.js.map