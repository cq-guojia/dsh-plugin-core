const JSON_HEADERS = { 'content-type': 'application/json; charset=utf-8' };
function readBody(req) {
    return new Promise((resolve, reject) => {
        if (req.on === undefined || req.once === undefined) {
            reject(new Error('request body stream unavailable'));
            return;
        }
        const chunks = [];
        req.on('data', (chunk) => { chunks.push(chunk); });
        req.once('end', () => { resolve(Buffer.concat(chunks).toString('utf8')); });
        req.once('error', reject);
    });
}
export function serveTaskSubmit(ctx, options) {
    let off;
    ctx.inject(['webServer'], (services) => {
        const webServer = services.webServer;
        if (webServer === undefined)
            return;
        webServer.register({
            kind: 'exact',
            path: options.path,
            handler: async (req, res) => {
                // authorize 自身抛错（鉴权服务故障）也必须写回响应，否则请求永久挂死。
                // 独立于下面的业务 try：鉴权失败回 403，别混进 onSubmit 的 400。
                let allowed = false;
                try {
                    allowed = await options.authorize(req);
                }
                catch (error) {
                    console.error('dsh-plugin-core: task submit authorize failed', error);
                }
                if (!allowed) {
                    res.writeHead(403, JSON_HEADERS);
                    res.end(JSON.stringify({ error: 'forbidden' }));
                    return;
                }
                try {
                    const raw = await readBody(req);
                    const payload = JSON.parse(raw);
                    const id = await options.onSubmit(payload);
                    res.writeHead(200, JSON_HEADERS);
                    res.end(JSON.stringify({ ok: true, id }));
                }
                catch (error) {
                    res.writeHead(400, JSON_HEADERS);
                    res.end(JSON.stringify({ ok: false, error: String(error) }));
                }
            },
        });
        off = () => { };
    });
    return () => { off?.(); };
}
//# sourceMappingURL=task-submit.js.map