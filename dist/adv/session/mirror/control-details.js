import { detailT as dt } from './detail-i18n.js';
const isRecord = (value) => typeof value === 'object' && value !== null && !Array.isArray(value);
const arg = (args, key) => typeof args[key] === 'string' ? args[key] : '';
function detailJson(text) {
    try {
        return JSON.parse(text);
    }
    catch {
        return undefined;
    }
}
const STATUS_KEYS = {
    running: 'detail.status.running', idle: 'detail.status.idle', ready: 'detail.status.ready',
    inactive: 'detail.status.inactive', provisioning: 'detail.status.provisioning',
    failed: 'detail.status.failed', error: 'detail.status.failed',
    completed: 'detail.status.completed', complete: 'detail.status.completed', done: 'detail.status.completed',
    pending: 'detail.todo.pending', in_progress: 'detail.todo.in_progress',
    deleted: 'detail.status.deleted', killed: 'detail.status.killed',
    blocked: 'detail.goal.blocked', accepted: 'detail.status.accepted', queued: 'detail.status.queued',
};
const FIELD_KEYS = {
    id: 'detail.field.id', revision: 'detail.field.revision', platform: 'detail.field.platform',
    provider: 'detail.field.provider', model: 'detail.field.model', role: 'detail.field.role',
    context: 'detail.field.context', ownerName: 'detail.field.owner', ready: 'detail.field.ready',
    blockedBy: 'detail.field.dependencies', writeScopes: 'detail.field.writeScopes',
    writeScopeWarnings: 'detail.field.warnings', diagnostics: 'detail.field.diagnostics',
    methods: 'detail.field.methods', inputSchema: 'detail.field.inputSchema',
    outputSchema: 'detail.field.outputSchema', currentPackageId: 'detail.field.currentPackage',
    nextPackageId: 'detail.field.nextPackage', latestRun: 'detail.field.latestRun',
    packages: 'detail.field.packages', registrations: 'detail.field.registrations',
    props: 'detail.field.props', data: 'detail.field.data', source: 'detail.field.source',
    arguments: 'row.input', content: 'detail.field.content', message: 'detail.field.message',
    messageId: 'detail.field.messageId', status: 'detail.state', root: 'detail.field.root',
    pid: 'detail.field.pid', type: 'detail.field.type', time: 'detail.field.time',
    seq: 'detail.field.seq', turn: 'detail.field.turn', step: 'detail.field.step',
    callId: 'detail.field.callId', agentsStarted: 'detail.field.agents',
    output: 'row.output', result: 'detail.field.result',
};
const TRACE_FIELDS = {
    Created: 'detail.field.time', Availability: 'detail.field.availability',
    Parent: 'detail.field.parent', 'Best match': 'detail.field.bestMatch',
    Target: 'detail.field.target', 'Replaced by': 'detail.trace.replacedBy',
    'Replacement chain': 'detail.trace.replacementChain',
    'Events replaced by target': 'detail.trace.replaces',
    'Events cited directly as sources': 'detail.trace.sources',
    'Direct derived events': 'detail.trace.derived',
};
const INSPECTION_KEY_ORDER = ['subject', 'title', 'name', 'pluginId', 'packageId', 'id', 'summary'];
const INSPECTION_DETAIL_KEYS = ['description', 'purpose'];
const MAX_INSPECTION_ITEMS = 40;
const OUTPUT_TRUNCATED = '\n[output truncated]';
/** 官方 detailBadge（3036-3058）：状态名未登记时原样显示，tone 按语义分。 */
function detailBadge(status, t) {
    const key = STATUS_KEYS[status];
    const tone = ['completed', 'complete', 'done', 'accepted'].includes(status) ? 'success'
        : ['failed', 'error'].includes(status) ? 'error'
            : ['blocked', 'killed', 'pending', 'queued', 'inactive'].includes(status) ? 'warning'
                : ['running', 'in_progress', 'provisioning'].includes(status) ? 'info' : 'neutral';
    return { label: key === undefined ? status : dt(key, t), tone };
}
const detailLabel = (key, t) => {
    const label = FIELD_KEYS[key];
    return label === undefined ? key : dt(label, t);
};
function scalar(value, t) {
    if (value === null)
        return dt('detail.none', t);
    if (typeof value === 'boolean')
        return dt(value ? 'detail.yes' : 'detail.no', t);
    return typeof value === 'string' ? value : JSON.stringify(value);
}
function detailList(items, summary, t) {
    return { items, summary, caption: dt('detail.recordedResult', t), empty: dt('detail.empty', t) };
}
function receipt(title, badge, t, fields = [], description) {
    return {
        ...detailList([{ title, badge, fields, ...(description === undefined ? {} : { description }) }], `${title} · ${badge.label}`, t),
    };
}
/** 官方 inspectionItems（3134-3204）：任意 JSON → 标题 / 字段 / 可折叠组 / 代码块。 */
function inspectionItems(value, t, depth = 0) {
    if (depth > 4 && value !== null && typeof value === 'object') {
        return [{ code: { text: JSON.stringify(value, null, 2), language: 'json' }, fields: [] }];
    }
    if (Array.isArray(value)) {
        const items = value.slice(0, MAX_INSPECTION_ITEMS).flatMap(entry => inspectionItems(entry, t, depth + 1));
        if (value.length > MAX_INSPECTION_ITEMS) {
            items.push({ description: dt('detail.moreInInspect', t, { count: value.length - MAX_INSPECTION_ITEMS }), fields: [] });
        }
        return items.length === 0 ? [{ description: dt('detail.empty', t), fields: [] }] : items;
    }
    if (!isRecord(value))
        return [{ description: scalar(value, t), fields: [] }];
    const titleKey = INSPECTION_KEY_ORDER.find(key => typeof value[key] === 'string' && value[key] !== '');
    const descriptionKey = INSPECTION_DETAIL_KEYS.find(key => typeof value[key] === 'string' && value[key] !== '');
    const title = titleKey === undefined ? undefined : String(value[titleKey]);
    const fields = [];
    const groups = [];
    for (const [key, field] of Object.entries(value)) {
        if (key === titleKey || key === descriptionKey || (key === 'status' && typeof field === 'string'))
            continue;
        if (key === 'inputSchema' || key === 'outputSchema') {
            groups.push({ label: detailLabel(key, t), items: [{ fields: [], code: { text: JSON.stringify(field, null, 2), language: 'json' } }] });
            continue;
        }
        if (Array.isArray(field) && field.length === 0)
            continue;
        if (key === 'arguments' && typeof field === 'string') {
            const parsed = detailJson(field);
            if (isRecord(parsed)) {
                groups.push({ label: detailLabel(key, t), items: inspectionItems(parsed, t, depth + 1) });
                continue;
            }
        }
        if (field !== null && typeof field === 'object')
            groups.push({ label: detailLabel(key, t), items: inspectionItems(field, t, depth + 1) });
        else
            fields.push({ label: detailLabel(key, t), value: scalar(field, t) });
    }
    return [{
            ...(title === undefined && typeof value.status !== 'string' ? {} : { title: title ?? dt('detail.field.result', t) }),
            ...(descriptionKey === undefined ? {} : { description: String(value[descriptionKey]) }),
            ...(typeof value.status === 'string' ? { badge: detailBadge(value.status, t) } : {}),
            fields,
            ...(groups.length === 0 ? {} : { groups }),
        }];
}
/** 官方 agentList / jobList / terminalList（3238-3317）。 */
function agentList(text, json, t) {
    if (Array.isArray(json))
        return detailList(inspectionItems(json, t), dt('detail.agents.count', t, { count: json.length }), t);
    if (text === '(no subagents)')
        return detailList([], dt('detail.agents.count', t, { count: 0 }), t);
    const items = [];
    for (const line of text.split('\n')) {
        const match = /^(\S+) \[([^\]]+)\](?: parent=(\S+) depth=(\d+))?(?: — (.*))?$/u.exec(line);
        if (match === null)
            return null;
        const [, id, state, parent, depth, title] = match;
        if (id === undefined || state === undefined)
            return null;
        items.push({
            title: title ?? id,
            ...(title === undefined ? {} : { subtitle: id }),
            badge: detailBadge(state, t),
            fields: parent === undefined ? [] : [
                { label: dt('detail.field.parent', t), value: parent },
                { label: dt('detail.field.depth', t), value: depth ?? '' },
            ],
        });
    }
    return detailList(items, dt('detail.agents.count', t, { count: items.length }), t);
}
function jobList(text, t) {
    if (text === '(no background jobs)')
        return detailList([], dt('detail.jobs.count', t, { count: 0 }), t);
    const items = [];
    for (const line of text.split('\n')) {
        const match = /^(\S+) \[([^\]]+)\] (\S+) — (.*)$/u.exec(line);
        if (match === null)
            return null;
        const [, id, kind, state, title] = match;
        if (id === undefined || kind === undefined || state === undefined || title === undefined)
            return null;
        items.push({ title, subtitle: id, badge: detailBadge(state, t), fields: [{ label: dt('detail.field.type', t), value: kind }] });
    }
    return detailList(items, dt('detail.jobs.count', t, { count: items.length }), t);
}
function terminalList(text, t) {
    if (text === '(no terminal sessions)')
        return detailList([], dt('detail.terminals.count', t, { count: 0 }), t);
    const items = [];
    for (const line of text.split('\n')) {
        const match = /^(\S+)(?: \((.*?)\))? \[([^\]]+)\] (running|exited code=(\S+) signal=(\S+))(?: pid=(\d+))?$/u.exec(line);
        if (match === null)
            return null;
        const [, id, name, type, state, exitCode, signal, pid] = match;
        if (id === undefined || type === undefined || state === undefined)
            return null;
        const fields = [{ label: dt('detail.field.type', t), value: type }];
        if (pid !== undefined)
            fields.push({ label: dt('detail.field.pid', t), value: pid });
        if (exitCode !== undefined)
            fields.push({ label: dt('detail.field.exitCode', t), value: exitCode });
        if (signal !== undefined && signal !== 'null')
            fields.push({ label: dt('detail.field.signal', t), value: signal });
        items.push({
            title: name ?? id,
            ...(name === undefined ? {} : { subtitle: id }),
            badge: state === 'running' ? detailBadge('running', t) : { label: dt('detail.status.exited', t), tone: exitCode === '0' ? 'success' : 'neutral' },
            fields,
        });
    }
    return detailList(items, dt('detail.terminals.count', t, { count: items.length }), t);
}
/** 官方 lspDetails（3318-3362）：hover 出 Markdown，其余逐行出可点位置。 */
function lspDetails(args, text, t) {
    const file = arg(args, 'file_path');
    const operation = arg(args, 'operation');
    if (file === '' || typeof args.line !== 'number' || typeof args.character !== 'number')
        return null;
    const source = `${file}:${args.line}:${args.character}`;
    if (operation === 'hover') {
        return detailList([{ title: source, location: { path: file, line: args.line }, markdown: text, fields: [] }], source, t);
    }
    if (text === 'No results.')
        return detailList([], dt('detail.locations.count', t, { count: 0 }), t);
    const items = [];
    for (const line of text.split('\n')) {
        if (line.startsWith('… ')) {
            items.push({ description: line, fields: [] });
            continue;
        }
        const match = /^(.*):(\d+):(\d+)$/u.exec(line);
        if (match === null)
            return null;
        const [, path, row, column] = match;
        if (path === undefined || row === undefined || column === undefined)
            return null;
        const isUri = /^[a-z][a-z\d+.-]*:/iu.test(path) && !/^[a-z]:[\\/]/iu.test(path);
        items.push({
            title: path,
            subtitle: dt('detail.location', t, { line: row, column }),
            fields: [],
            ...(isUri ? {} : { location: { path, line: Number(row) } }),
        });
    }
    const found = items.filter(item => item.title !== undefined).length;
    return detailList(items, `${file} · ${dt('detail.locations.count', t, { count: found })}`, t);
}
/** 官方 cordisDetails / workflowDetails / textFields / searchDetails / eventRead / trace（3562-3776）。 */
function cordisDetails(name, args, value, t) {
    if (!isRecord(value))
        return null;
    if (name === 'cordis_inspect_list') {
        if (!Array.isArray(value.providers))
            return null;
        return detailList(inspectionItems(value.providers, t), dt('detail.providers.count', t, { count: value.providers.length }), t);
    }
    if (name === 'cordis_inspect_query') {
        if (!('data' in value) || typeof value.provider !== 'string' || typeof value.method !== 'string')
            return null;
        return detailList(inspectionItems(value.data, t), `${value.provider}.${value.method}`, t);
    }
    if (name === 'cordis_inspect_self') {
        if (Array.isArray(value.plugins))
            return detailList(inspectionItems(value.plugins, t), dt('detail.plugins.count', t, { count: value.plugins.length }), t);
        return detailList(inspectionItems(value, t), String(args.pluginId ?? args.packageId ?? value.mode), t);
    }
    return null;
}
function workflowDetails(name, args, text, t) {
    if (name === 'workflow') {
        const match = /^workflow "([\s\S]*?)" completed \((\d+) agents?\)\.\nReturn value:\n([\s\S]*)$/u.exec(text);
        if (match === null || match[1] === undefined || match[2] === undefined || match[3] === undefined)
            return null;
        const value = detailJson(match[3]);
        if (value === undefined)
            return null;
        return detailList([{
                title: match[1],
                badge: { label: dt('detail.status.completed', t), tone: 'success' },
                fields: [{ label: dt('detail.field.agents', t), value: match[2] }],
                ...(typeof args.code === 'string' ? { groups: [{ label: dt('detail.workflow.script', t), items: [{ fields: [], code: { text: args.code, language: 'javascript' } }] }] } : {}),
            }, ...inspectionItems(value, t)], match[1], t);
    }
    const split = text.indexOf('\nFinal report:\n');
    if (split < 0)
        return null;
    const header = text.slice(0, split);
    const rounds = /\b(\d+) rounds?\b/u.exec(header)?.[1];
    const report = detailJson(text.slice(split + 15));
    if (!isRecord(report) || typeof report.summary !== 'string' || !Array.isArray(report.evidence)
        || !report.evidence.every(item => typeof item === 'string') || !Array.isArray(report.nextSteps)
        || !report.nextSteps.every(item => typeof item === 'string') || typeof report.blocker !== 'string')
        return null;
    const badge = header.startsWith('Ralph worker reported completion ')
        ? { label: dt('detail.ralph.reportedComplete', t), tone: 'success' }
        : header.startsWith('Ralph worker reported a blocker ')
            ? { label: dt('detail.ralph.reportedBlocker', t), tone: 'warning' }
            : header.startsWith('Ralph reached its ') ? { label: dt('detail.ralph.limit', t), tone: 'warning' } : undefined;
    if (badge === undefined)
        return null;
    const groups = [];
    if (report.nextSteps.length > 0)
        groups.push({ label: dt('detail.report.nextSteps', t), items: [{ fields: [], lines: report.nextSteps }] });
    if (typeof args.objective === 'string')
        groups.push({ label: dt('detail.field.task', t), items: [{ fields: [], description: args.objective }] });
    const fields = rounds === undefined ? [] : [{ label: dt('detail.goal.rounds', t), value: rounds }];
    if (report.blocker !== '')
        fields.push({ label: dt('detail.goal.reason', t), value: report.blocker });
    return detailList([{
            title: report.summary, badge, fields,
            ...(report.evidence.length === 0 ? {} : { lines: report.evidence }),
            groups,
        }], report.summary, t);
}
function dateText(value) {
    const date = new Date(value);
    if (!Number.isFinite(date.getTime()))
        return String(value);
    try {
        return new Intl.DateTimeFormat(getDateLocale(), { dateStyle: 'medium', timeStyle: 'short' }).format(date);
    }
    catch {
        return String(value);
    }
}
function getDateLocale() {
    if (typeof document === 'undefined')
        return 'zh-CN';
    return document.documentElement.lang || 'zh-CN';
}
function textFields(text, t) {
    const fields = [];
    for (const line of text.split('\n')) {
        const match = /^\s*([^:]+): (.+)$/u.exec(line);
        if (match === null || match[1] === undefined || match[2] === undefined)
            continue;
        const key = TRACE_FIELDS[match[1]];
        if (key === undefined)
            continue;
        fields.push({
            label: dt(key, t),
            value: match[1] === 'Created' ? dateText(match[2]) : match[2] === 'none' ? dt('detail.none', t) : match[2],
        });
    }
    return fields;
}
function searchDetails(name, text, t) {
    if (text === 'No prior session matches found.' || text.endsWith('\n\nNo prior event matches found.')) {
        return detailList([], dt('detail.matches.count', t, { count: 0 }), t);
    }
    const blocks = text.split(/\n(?=\d+\. )/u).filter(block => /^\d+\. /u.test(block));
    if (blocks.length === 0)
        return null;
    const items = [];
    for (const block of blocks) {
        const snippet = /\n\s*Snippet: ([\s\S]*?)(?:\n\nResult cap reached\.|$)/u.exec(block)?.[1];
        if (name === 'session_search') {
            const match = /^\d+\. Session (\S+) — (.*)/u.exec(block);
            if (match === null || match[1] === undefined || match[2] === undefined)
                return null;
            items.push({ title: match[2], subtitle: match[1], ...(snippet === undefined ? {} : { description: snippet.trimEnd() }), fields: textFields(block, t) });
        }
        else {
            const match = /^\d+\. seq (\d+) \| ([^|]+) \| ([^|]+) \| ([^\n]+)/u.exec(block);
            if (match === null || match[1] === undefined || match[2] === undefined || match[3] === undefined || match[4] === undefined)
                return null;
            items.push({
                title: snippet?.trimEnd() ?? match[2],
                subtitle: `${match[2].trim()} · #${match[1]}`,
                fields: [
                    { label: dt('detail.field.time', t), value: dateText(match[4]) },
                    { label: dt('detail.field.surface', t), value: match[3].trim() },
                ],
            });
        }
    }
    return {
        ...detailList(items, dt('detail.matches.count', t, { count: items.length }), t),
        ...(text.includes('Result cap reached.') ? { caption: dt('detail.matches.capped', t) } : {}),
    };
}
function eventReadDetails(text, t) {
    const match = /^Session (\S+) — ([^\n]*)\nTarget event seq (\d+):\n```json\n([\s\S]*?)\n```([\s\S]*)$/u.exec(text);
    if (match === null || match[1] === undefined || match[2] === undefined || match[3] === undefined || match[4] === undefined)
        return null;
    const event = detailJson(match[4]);
    if (!isRecord(event) || typeof event.type !== 'string' || !isRecord(event.data))
        return null;
    const fields = [{ label: dt('detail.field.seq', t), value: match[3] }];
    if (typeof event.time === 'number')
        fields.push({ label: dt('detail.field.time', t), value: dateText(event.time) });
    const adjacent = match[5]?.trim();
    const groups = adjacent ? [{ label: dt('detail.event.neighbors', t), items: [{ fields: [], description: adjacent }] }] : [];
    return detailList([
        { title: event.type, subtitle: `${match[2]} · ${match[1]}`, fields },
        ...inspectionItems(event.data, t),
        ...(groups.length === 0 ? [] : [{ fields: [], groups }]),
    ], `${event.type} · #${match[3]}`, t);
}
function traceDetails(name, text, t) {
    const match = /^Session (\S+) — ([^\n]*)\n([\s\S]*)$/u.exec(text);
    if (match === null || match[1] === undefined || match[2] === undefined || match[3] === undefined)
        return null;
    if (name === 'session_event_trace')
        return detailList([{ title: match[2], subtitle: match[1], fields: textFields(match[3], t) }], match[2], t);
    const sections = match[3].split('\n\n');
    const items = [{ title: match[2], subtitle: match[1], fields: textFields(sections[0] ?? '', t) }];
    for (const section of sections.slice(1)) {
        const firstBreak = section.indexOf('\n');
        const label = section.startsWith('Ancestors (nearest first):') ? dt('detail.trace.ancestors', t)
            : section.startsWith('Descendants:') ? dt('detail.trace.descendants', t) : undefined;
        if (label === undefined || firstBreak < 0)
            return null;
        const body = section.slice(firstBreak + 1);
        items.push({
            title: label,
            fields: [],
            ...(body === '- none' || body === '- none (target is a root session)'
                ? { description: dt('detail.none', t) }
                : { lines: body.split('\n').map(line => line.replace(/^(\s*)- /u, '$1')) }),
        });
    }
    return detailList(items, match[2], t);
}
/** 官方 inspectionDetails（3787-3802）。 */
export function inspectionDetails(name, args, text, json, t) {
    switch (name) {
        case 'cordis_inspect_list':
        case 'cordis_inspect_query':
        case 'cordis_inspect_self': return cordisDetails(name, args, json, t);
        case 'workflow':
        case 'ralph': return workflowDetails(name, args, text, t);
        case 'session_search':
        case 'session_event_search': return searchDetails(name, text, t);
        case 'session_event_read': return eventReadDetails(text, t);
        case 'session_trace':
        case 'session_event_trace': return traceDetails(name, text, t);
        default: return null;
    }
}
/** 官方 controlDetails（3372-3547）。 */
export function controlDetails(name, args, text, json, t) {
    const target = arg(args, 'target') || arg(args, 'agent_id') || arg(args, 'sessionId') || arg(args, 'job_id');
    switch (name) {
        case 'list_agents': return agentList(text, json, t);
        case 'job_list': return jobList(text, t);
        case 'terminal_list': return terminalList(text, t);
        case 'lsp': return lspDetails(args, text, t);
        case 'spawn_teammate':
            if (!isRecord(json) || !isRecord(json.member))
                return null;
            return detailList(inspectionItems(json.member, t), arg(args, 'name'), t);
        case 'team_task_create':
        case 'team_task_get':
        case 'team_task_update':
            if (!isRecord(json) || typeof json.subject !== 'string')
                return null;
            return detailList(inspectionItems(json, t), json.subject, t);
        case 'team_task_list':
            if (!isRecord(json) || !Array.isArray(json.tasks))
                return null;
            if (json.nextCursor !== undefined && typeof json.nextCursor !== 'number')
                return null;
            return {
                ...detailList(inspectionItems(json.tasks, t), dt('detail.tasks.count', t, { count: json.tasks.length }), t),
                ...(json.nextCursor === undefined ? {} : { caption: dt('detail.tasks.nextPage', t, { cursor: String(json.nextCursor) }) }),
            };
        case 'send_message': {
            const status = isRecord(json) ? json.status : undefined;
            if (status === 'accepted' || status === 'queued') {
                return receipt(target, { label: dt(status === 'queued' ? 'detail.status.queued' : 'detail.receipt.delivered', t), tone: status === 'queued' ? 'warning' : 'success' }, t, [], arg(args, 'message'));
            }
            return text === `message delivered to agent ${target}`
                ? receipt(target, { label: dt('detail.receipt.delivered', t), tone: 'success' }, t, [], arg(args, 'message')) : null;
        }
        case 'interrupt_agent':
            if (isRecord(json) && typeof json.previousStatus === 'string') {
                return receipt(target, { label: dt('detail.receipt.interrupt', t), tone: 'warning' }, t, [{ label: dt('detail.field.previousStatus', t), value: detailBadge(json.previousStatus, t).label }]);
            }
            return text === `interrupt requested for agent ${target}`
                ? receipt(target, { label: dt('detail.receipt.interrupt', t), tone: 'warning' }, t) : null;
        case 'wait_agent': {
            if (!isRecord(json) || typeof json.timedOut !== 'boolean')
                return null;
            if (isRecord(json.noProgress) && typeof json.noProgress.message === 'string') {
                return detailList([{ title: dt('detail.wait.noProgress', t), description: json.noProgress.message, fields: [] }], dt('detail.wait.noProgress', t), t);
            }
            return receipt(dt('detail.wait.title', t), { label: dt(json.timedOut ? 'detail.wait.timeout' : 'detail.wait.changed', t), tone: 'neutral' }, t);
        }
        case 'subagent': {
            const started = /^started (background subagent job|subagent) (\S+)$/u.exec(text);
            if (started !== null) {
                return receipt(arg(args, 'prompt'), { label: dt('detail.receipt.started', t), tone: 'info' }, t, [{ label: dt(started[1] === 'subagent' ? 'detail.field.agent' : 'detail.field.job', t), value: started[2] ?? '' }]);
            }
            return detailList([{
                    title: dt('detail.agent.reply', t), markdown: text, fields: [],
                    groups: [{ label: dt('detail.field.task', t), items: [{ description: arg(args, 'prompt'), fields: [] }] }],
                }], dt('detail.agent.reply', t), t);
        }
        case 'list_subagent_models':
            return detailList(text.split('\n').map(line => {
                const split = line.indexOf(' — ');
                return split < 0 ? { description: line, fields: [] }
                    : { title: line.slice(0, split), description: line.slice(split + 3), fields: [] };
            }), arg(args, 'model') || arg(args, 'provider') || dt('detail.models.title', t), t);
        case 'job_output': {
            const match = /\n\[status: ([^,\]\n]+)(?:, ([^\]\n]+))?\]$/u.exec(text);
            if (match === null || match[1] === undefined)
                return null;
            const output = text.slice(0, match.index);
            const truncated = output.endsWith(OUTPUT_TRUNCATED);
            const code = truncated ? output.slice(0, -19) : output;
            const description = [match[2], truncated ? dt('detail.output.truncated', t) : undefined].filter(value => value !== undefined).join(' · ');
            return detailList([{
                    title: target, badge: detailBadge(match[1], t), fields: [],
                    ...(description === '' ? {} : { description }), code: { text: code },
                }], `${target} · ${detailBadge(match[1], t).label}`, t);
        }
        case 'job_kill':
            if (text === `requested cancellation of job ${target}`)
                return receipt(target, { label: dt('detail.receipt.cancel', t), tone: 'warning' }, t, [], arg(args, 'reason'));
            if (text.startsWith(`job ${target} had already finished `))
                return receipt(target, { label: dt('detail.receipt.alreadyFinished', t), tone: 'neutral' }, t);
            return null;
        case 'terminal_open': {
            const match = /^started terminal session (\S+)(?: \((.*?)\))? \[type: ([^\]]+)\]\n([\s\S]*)$/u.exec(text);
            if (match === null || match[1] === undefined || match[3] === undefined || match[4] === undefined)
                return null;
            return detailList([{
                    title: match[2] ?? match[1],
                    ...(match[2] === undefined ? {} : { subtitle: match[1] }),
                    badge: { label: dt('detail.receipt.started', t), tone: 'info' },
                    fields: [{ label: dt('detail.field.type', t), value: match[3] }],
                    code: { text: match[4] },
                }], match[2] ?? match[1], t);
        }
        case 'terminal_read': {
            const match = /\n\[lines: (\d+)-(\d+) of (\d+)\](\n\[output truncated\])?$/u.exec(text);
            if (match === null)
                return null;
            return detailList([{
                    title: target,
                    subtitle: dt('detail.output.lines', t, { begin: match[1] ?? '', end: match[2] ?? '', total: match[3] ?? '' }),
                    fields: [], code: { text: text.slice(0, match.index) },
                    ...(match[4] === undefined ? {} : { description: dt('detail.output.truncated', t) }),
                }], target, t);
        }
        case 'terminal_signal': {
            const match = /^delivered (\S+) to foreground process group (\d+)$/u.exec(text);
            if (match === null || match[1] === undefined || match[2] === undefined)
                return null;
            return receipt(target, { label: dt('detail.receipt.signal', t), tone: 'success' }, t, [
                { label: dt('detail.field.signal', t), value: match[1] },
                { label: dt('detail.field.processGroup', t), value: match[2] },
            ]);
        }
        case 'terminal_close':
            if (text === `closed terminal session ${target}`)
                return receipt(target, { label: dt('detail.receipt.closed', t), tone: 'neutral' }, t);
            if (text === `terminal session ${target} was already closing`)
                return receipt(target, { label: dt('detail.receipt.closing', t), tone: 'neutral' }, t);
            return null;
        default: return null;
    }
}
//# sourceMappingURL=control-details.js.map