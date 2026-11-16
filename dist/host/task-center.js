function send(res, status, body) {
    res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(body));
}
function readBody(req) {
    return new Promise((resolve, reject) => {
        const request = req;
        if (typeof request.on !== 'function') {
            resolve({});
            return;
        }
        let raw = '';
        request.on('data', (chunk) => { raw += String(chunk ?? ''); });
        request.on('end', () => {
            try {
                resolve(raw === '' ? {} : JSON.parse(raw));
            }
            catch (error) {
                reject(error);
            }
        });
    });
}
export function serveTaskCenter(ctx, options) {
    if (typeof options.authorize !== 'function') {
        throw new Error('serveTaskCenter requires authorize: host provides no server-wide auth');
    }
    const web = ctx.get?.('webServer');
    if (web === undefined)
        throw new Error('webServer service is not available');
    const base = options.basePath.replace(/\/$/, '');
    const unsubs = [];
    const route = (path, handler) => {
        web.register({
            kind: 'exact',
            path: `${base}${path}`,
            handler: (req, rawRes) => {
                const res = rawRes;
                void Promise.resolve(options.authorize(req)).then((viewer) => {
                    if (viewer === null) {
                        send(res, 401, { error: 'unauthorized' });
                        return;
                    }
                    return handler(req, res, viewer);
                }).catch(() => { send(res, 401, { error: 'unauthorized' }); });
            },
        });
    };
    route('/create', async (req, res, viewer) => {
        if (viewer === '') {
            send(res, 401, { error: 'unauthorized' });
            return;
        }
        const body = await readBody(req);
        // 归属校验由 store.create 在写入前做；这里绝不先写后判。
        const result = await options.store.create(body, viewer);
        if (result.record.project === '') {
            send(res, 403, { error: 'forbidden' });
            return;
        }
        send(res, 200, result);
    });
    route('/list', async (req, res, viewer) => {
        const url = new URL(req.url ?? '', 'http://localhost');
        const project = url.searchParams.get('project') ?? '';
        const cursor = url.searchParams.get('cursor') ?? undefined;
        if (project === '') {
            send(res, 400, { error: 'missing project' });
            return;
        }
        send(res, 200, await options.store.list(project, cursor, viewer));
    });
    route('/invoke', async (req, res, viewer) => {
        const body = await readBody(req);
        send(res, 200, await options.store.invoke(body, viewer));
    });
    route('/ack', async (req, res, viewer) => {
        const body = await readBody(req);
        await options.store.ack(body, viewer);
        send(res, 200, { ok: true });
    });
    web.register({
        kind: 'exact',
        path: `${base}/follow`,
        handler: (req, rawRes) => {
            const res = rawRes;
            void Promise.resolve(options.authorize(req)).then((viewer) => {
                if (viewer === null || viewer === '') {
                    send(res, 401, { error: 'unauthorized' });
                    return;
                }
                const url = new URL(req.url ?? '', 'http://localhost');
                const projects = (url.searchParams.get('projects') ?? '').split(',').filter((item) => item !== '');
                if (projects.length === 0) {
                    send(res, 400, { error: 'missing projects' });
                    return;
                }
                res.writeHead(200, {
                    'content-type': 'text/event-stream; charset=utf-8',
                    'cache-control': 'no-cache',
                    connection: 'keep-alive',
                });
                const off = options.store.subscribe((project, event) => {
                    // 客户端传入的 projects 只是过滤器；真正的归属闸门在 store.subscribe(viewer)。
                    if (!projects.includes(project))
                        return;
                    res.write(`data: ${JSON.stringify({ project, event })}\n\n`);
                }, viewer);
                unsubs.push(off);
                res.on?.('close', () => {
                    off();
                    const at = unsubs.indexOf(off);
                    if (at >= 0)
                        unsubs.splice(at, 1);
                });
            }).catch(() => { send(res, 401, { error: 'unauthorized' }); });
        },
    });
    return () => { for (const off of unsubs)
        off(); };
}
//# sourceMappingURL=task-center.js.map