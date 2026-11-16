function json(value) {
    return JSON.stringify(value);
}
export function createHttpTaskBackend(options) {
    const doFetch = options.fetchImpl ?? fetch;
    const base = options.basePath.replace(/\/$/, '');
    const headers = () => ({ 'content-type': 'application/json', ...(options.headers?.() ?? {}) });
    async function post(path, body) {
        const response = await doFetch(`${base}${path}`, { method: 'POST', headers: headers(), body: json(body) });
        if (!response.ok)
            throw new Error(`task backend ${path} failed: ${response.status}`);
        return await response.json();
    }
    function follow(projects, cursorByProject, onEvent, onError) {
        const controller = new AbortController();
        const query = new URLSearchParams();
        query.set('projects', projects.join(','));
        query.set('cursors', json(cursorByProject));
        void (async () => {
            try {
                const response = await doFetch(`${base}/follow?${query.toString()}`, {
                    method: 'GET',
                    headers: options.headers?.(),
                    signal: controller.signal,
                });
                if (!response.ok || response.body === null)
                    throw new Error(`task follow failed: ${response.status}`);
                const reader = response.body.getReader();
                const decoder = new TextDecoder();
                let buffer = '';
                for (;;) {
                    const { done, value } = await reader.read();
                    if (done)
                        break;
                    buffer += decoder.decode(value, { stream: true });
                    let cut = buffer.indexOf('\n\n');
                    while (cut >= 0) {
                        const frame = buffer.slice(0, cut);
                        buffer = buffer.slice(cut + 2);
                        const data = frame.split('\n').find((line) => line.startsWith('data:'))?.slice(5).trim();
                        if (data !== undefined) {
                            const parsed = JSON.parse(data);
                            onEvent(parsed.project, parsed.event);
                        }
                        cut = buffer.indexOf('\n\n');
                    }
                }
                if (!controller.signal.aborted)
                    onError(projects[0] ?? '', new Error('task follow stream ended'));
            }
            catch (error) {
                if (!controller.signal.aborted)
                    onError(projects[0] ?? '', error);
            }
        })();
        return () => controller.abort();
    }
    return {
        async create(input) {
            return post('/create', input);
        },
        async list(project, cursor) {
            const query = new URLSearchParams({ project });
            if (cursor !== undefined)
                query.set('cursor', cursor);
            const response = await doFetch(`${base}/list?${query.toString()}`, { headers: options.headers?.() });
            if (!response.ok)
                throw new Error(`task list failed: ${response.status}`);
            return await response.json();
        },
        follow,
        async poll(keys) {
            return post('/poll', { keys });
        },
        async invoke(request) {
            return post('/invoke', request);
        },
        async ack(request) {
            await post('/ack', request);
        },
    };
}
//# sourceMappingURL=http-backend.js.map