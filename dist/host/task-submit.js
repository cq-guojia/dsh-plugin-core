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
                if (!(await options.authorize(req))) {
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