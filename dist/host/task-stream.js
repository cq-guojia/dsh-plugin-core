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
                void (async () => {
                    // 阶段 1：鉴权。只有这一段失败回 401 —— 鉴权已过之后的任何故障都不是「未认证」。
                    let viewer;
                    try {
                        const got = await options.authorize(req);
                        if (got === null || got === '') {
                            console.error('dsh-plugin-core: task stream unauthorized');
                        }
                        else {
                            viewer = got;
                        }
                    }
                    catch (error) {
                        console.error('dsh-plugin-core: task stream authorize failed', error);
                    }
                    if (viewer === undefined) {
                        // 401 写入单独隔离：不在 authorize 的 try 里——否则 json 自身抛错（客户端已断）
                        // 会被那个 try 的 catch 再抓一次、二次 writeHead。与阶段 2 的收尾同样的理由。
                        try {
                            json(res, 401, { error: 'unauthorized' });
                        }
                        catch (writeError) {
                            console.error('dsh-plugin-core: task stream auth response failed', writeError);
                        }
                        return;
                    }
                    // 阶段 2：订阅 + 快照 + 推流。服务侧依赖（source）故障回 503，绝不写成 401，
                    // 否则客户端把「服务端临时故障」当「认证失败」处理（本仓客户端对 4xx/5xx 行为不同）。
                    let streaming = false;
                    let conn;
                    try {
                        // 三流都先订阅再取基线：窗口内的事件先进缓冲，基线写完再按序回放，消除丢事件窗口。
                        const buffered = [];
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
                        const thisConn = {
                            cleanup() {
                                if (closed)
                                    return;
                                closed = true;
                                // 先摘除集合、清掉 timer：这两步在本模块内、不会抛，且不依赖任何外部实现。
                                // 必须先做——否则任一外部 detach 抛错会让「已关闭」的连接永久留在集合里。
                                connections.delete(thisConn);
                                if (timer !== undefined)
                                    clearInterval(timer);
                                // 外部 source 的 unsubscribe 契约未禁止抛错：逐个隔离，一个失败不影响下一个。
                                for (const detach of [offTask, offNotice]) {
                                    if (detach === undefined)
                                        continue;
                                    try {
                                        detach();
                                    }
                                    catch (error) {
                                        console.error('dsh-plugin-core: task stream detach failed', error);
                                    }
                                }
                            },
                        };
                        conn = thisConn;
                        connections.add(thisConn);
                        // res.on 可选：没有 close 事件时靠 serve disposer 收口，不让 off/timer 永久泄漏。
                        res.on?.('close', () => { thisConn.cleanup(); });
                        // snapshot 放进 .then：它同步抛错也能被本阶段 catch 捕获（作为 rejected promise），
                        // 而不是冒泡到鉴权段被误判成 401。
                        const baseline = await Promise.resolve().then(() => options.source.snapshot(viewer));
                        if (closed)
                            return;
                        res.writeHead(200, {
                            'content-type': 'text/event-stream; charset=utf-8',
                            'cache-control': 'no-cache, no-transform',
                            connection: 'keep-alive',
                            'x-accel-buffering': 'no',
                        });
                        // 头一发出就置 streaming：此后任何 write 失败都只能 end()，不能再 writeHead 回 503，
                        // 否则 ERR_HTTP_HEADERS_SENT。标志必须紧跟 writeHead，而不是等基线帧写完。
                        streaming = true;
                        timer = setInterval(() => { if (!closed)
                            res.write(KEEP_ALIVE); }, keepAliveMs);
                        timer.unref?.();
                        // 快照只恢复列表；历史终态绝不在此弹卡（否则刷新就重弹）。
                        for (const task of baseline)
                            res.write(`event: task-snapshot\ndata: ${JSON.stringify(task)}\n\n`);
                        for (const frame of buffered)
                            res.write(frame);
                        buffered.length = 0;
                    }
                    catch (error) {
                        // 头未发：可安全回 503；头已发：只能 end()。收尾动作本身再隔离一层，
                        // 避免 res 已销毁时 end()/writeHead() 抛错逃出 async IIFE 变成未处理 rejection。
                        console.error('dsh-plugin-core: task stream failed', error);
                        try {
                            conn?.cleanup();
                        }
                        catch (cleanupError) {
                            console.error('dsh-plugin-core: task stream cleanup failed', cleanupError);
                        }
                        try {
                            if (!streaming)
                                json(res, 503, { error: 'service-unavailable' });
                            else
                                res.end();
                        }
                        catch (finishError) {
                            console.error('dsh-plugin-core: task stream finish failed', finishError);
                        }
                    }
                })().catch((error) => {
                    // 兜底：任何漏网的同步/异步异常都不能变成未处理 rejection。
                    console.error('dsh-plugin-core: task stream unhandled error', error);
                });
            },
        });
    });
    return () => {
        // 逐连接隔离：单个 cleanup 万一抛错不能中断其余连接的收口；clear 必须执行。
        try {
            for (const conn of [...connections]) {
                try {
                    conn.cleanup();
                }
                catch (error) {
                    console.error('dsh-plugin-core: task stream connection cleanup failed', error);
                }
            }
        }
        finally {
            connections.clear();
        }
    };
}
//# sourceMappingURL=task-stream.js.map