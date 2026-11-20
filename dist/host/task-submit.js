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
                const badRequest = () => {
                    res.writeHead(400, JSON_HEADERS);
                    // 所有 400 统一形状（解析失败 / 非对象 payload 都走这里），客户端可用一套逻辑解析。
                    res.end(JSON.stringify({ ok: false, error: 'bad-request', code: 'invalid-payload' }));
                };
                let payload;
                try {
                    const raw = await readBody(req);
                    const parsed = JSON.parse(raw);
                    // 边界形状校验：onSubmit 的公开契约是 Record<string,unknown>，JSON.parse 的 as 断言
                    // 只是编译期声明——null/数字/字符串/数组会绕过它直通 onSubmit。库里其它外部边界
                    // （isTaskRecord / isNotifyWire）都做运行时校验，这里补上同一道闸。
                    if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
                        badRequest();
                        return;
                    }
                    payload = parsed;
                }
                catch {
                    // 空 body / 非法 JSON：与非法 payload 同形状，不回显解析错误原文。
                    badRequest();
                    return;
                }
                let id;
                try {
                    id = await options.onSubmit(payload);
                }
                catch (error) {
                    // onSubmit 内部故障是服务端错误，不是客户端请求错误：回 500、不回显原文。
                    console.error('dsh-plugin-core: task submit onSubmit failed', error);
                    res.writeHead(500, JSON_HEADERS);
                    res.end(JSON.stringify({ ok: false, error: 'internal-error', code: 'submit-failed' }));
                    return;
                }
                // 成功响应单独一段：onSubmit 已成功就不再进 500 分支，避免已发头后二次 writeHead。
                res.writeHead(200, JSON_HEADERS);
                res.end(JSON.stringify({ ok: true, id }));
            },
        });
        off = () => { };
    });
    return () => { off?.(); };
}
//# sourceMappingURL=task-submit.js.map