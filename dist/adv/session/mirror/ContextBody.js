// 官方对照：@deepseek-ai/dsh-client-ui-chat@0.2.2-rc.1 lib/client.js:5190-5713（ContextBody 全部 form 体）。
//
// 六种 form 各自一块正文（官方 contextBody 的分派逐条照抄）：
//   instructions = 文件清单（路径 + 动作词）→ 模型面向文本
//   catalog      = 目录条目（name + description），可带「替换目录」与「…还有 N 条」
//   snapshot     = 「取代先前的快照」+ 具名分段（name + text）
//   notice       = 只有模型面向文本（摘要走折叠行）
//   relay        = 「来自会话 {session}」+ 文本
//   recall       = 来源会话（保留 / 省略条数、是否截断）+ 文本
// 每种 form 的 source 读不出 → 一律回落 opaque（文本 + source 其余字段键值表），
// 官方同规则：判据全有或全无，宁可退回原样也不画半张卡。
import { createElement as h } from 'react';
import { officialClass } from '../official-classes.js';
/** 官方 ContextBody 模块类（宿主必注入；缺席 = 空串，裸结构不白屏）。 */
const C = (semantic) => officialClass('ContextBody', semantic) ?? '';
/** 官方 MAX_CHARS / MAX_ENTRIES（lib/client.js:5196/5198）。 */
const MAX_CHARS = 20000;
const MAX_ENTRIES = 200;
function asRecord(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value) ? value : null;
}
/** 官方 boundedText：超上限截断并附「共 N 字符」。 */
function boundedText(text, t) {
    return text.length > MAX_CHARS
        ? `${text.slice(0, MAX_CHARS)}\n${t('jsonTruncated', { total: text.length })}`
        : text;
}
/**
 * 官方 ModelFacingContent：连续 text 块合并为一个 run，一段一个 pre。
 * 非 text 块官方走 JsonBlock，本仓无该原语 ⇒ 保持既有行为（不进正文，不伪造）。
 */
export function modelFacingContent(content, t) {
    const blocks = Array.isArray(content) ? content : [];
    const runs = [];
    let inText = false;
    for (const block of blocks) {
        const b = block;
        const isText = b !== null && typeof b === 'object' && b.type === 'text' && typeof b.text === 'string';
        if (!isText) {
            inText = false;
            continue;
        }
        const text = b.text;
        if (inText)
            runs[runs.length - 1] += text;
        else
            runs.push(text);
        inText = true;
    }
    return h('span', null, runs
        .filter(text => text !== '')
        .map((text, index) => h('pre', {
        key: index,
        className: C('text'),
        'data-context-text': true,
    }, boundedText(text, t))));
}
/** 官方 fieldValue：字符串 / 数字 / 布尔原样，其余紧凑 JSON；同样受字符上限约束。 */
function fieldValue(value, t) {
    const text = typeof value === 'string'
        ? value
        : typeof value === 'number' || typeof value === 'boolean'
            ? String(value)
            : JSON.stringify(value) ?? '';
    return boundedText(text, t);
}
/**
 * 官方 SourceFields：source 里除 kind（已由行标题表达）之外的字段列成键值表；
 * form 已由专属正文展示时也省掉（读者看到的就是那个值）。
 */
function SourceFields(props) {
    const record = asRecord(props.source);
    if (record === null)
        return null;
    const hidden = props.formRendered ? ['kind', 'form'] : ['kind'];
    const rows = Object.entries(record).filter(([key]) => !hidden.includes(key));
    if (rows.length === 0)
        return null;
    return h('dl', { className: C('fields'), 'data-context-fields': true }, rows.map(([key, value]) => h('div', { key, className: C('field') }, h('dt', { className: C('fieldKey') }, key), h('dd', { className: C('fieldValue') }, fieldValue(value, props.t)))));
}
/** 官方 OpaqueBody：模型面向文本 + source 其余字段。 */
function OpaqueBody(props) {
    return h('span', null, modelFacingContent(props.content, props.t), h(SourceFields, { source: props.source, formRendered: false, t: props.t }));
}
/** 官方 instructionChanges：{changes:[{path, action:set|replace|remove, digest?}]}，按 path 去重。 */
function instructionChanges(source) {
    const list = asRecord(source)?.changes;
    if (!Array.isArray(list))
        return null;
    const seen = new Set();
    const changes = [];
    for (const entry of list) {
        const change = asRecord(entry);
        if (change === null)
            return null;
        const path = change.path;
        if (typeof path !== 'string' || path === '')
            return null;
        const action = change.action;
        if (action !== 'set' && action !== 'replace' && action !== 'remove')
            return null;
        if (seen.has(path))
            continue;
        seen.add(path);
        const digest = change.digest;
        changes.push(typeof digest === 'string' ? { action, path, digest } : { action, path });
    }
    return changes.length === 0 ? null : changes;
}
/** 官方 instructionAction：baseline 一律「已载入」，其后 set = 新增、replace = 更新。 */
function instructionAction(action, baseline) {
    if (action === 'remove')
        return 'contextInstrRemoved';
    if (baseline)
        return 'contextInstrLoaded';
    return action === 'set' ? 'contextInstrAdded' : 'contextInstrUpdated';
}
function InstructionsBody(props) {
    const changes = instructionChanges(props.source);
    if (changes === null)
        return h(OpaqueBody, { content: props.content, source: props.source, t: props.t });
    const baseline = asRecord(props.source)?.baseline === true;
    return h('span', null, h('ul', { className: C('files'), 'data-context-files': true }, changes.map((change) => h('li', { key: change.path, className: C('file') }, h('span', { className: C('filePath') }, change.path), h('span', { className: C('fileAction') }, props.t(instructionAction(change.action, baseline)))))), modelFacingContent(props.content, props.t));
}
/** 官方 catalogEntries：{entries:[{name, description}]}，全有或全无。 */
function catalogEntries(source) {
    const list = asRecord(source)?.entries;
    if (!Array.isArray(list))
        return null;
    const entries = [];
    for (const item of list) {
        const entry = asRecord(item);
        if (entry === null)
            return null;
        const name = entry.name;
        const description = entry.description;
        if (typeof name !== 'string' || name === '' || typeof description !== 'string')
            return null;
        entries.push({ name, description });
    }
    return entries;
}
function CatalogBody(props) {
    const entries = catalogEntries(props.source);
    if (entries === null)
        return h(OpaqueBody, { content: props.content, source: props.source, t: props.t });
    const update = asRecord(props.source)?.update === true;
    const shown = entries.slice(0, MAX_ENTRIES);
    return h('span', null, update
        ? h('p', { className: C('catalogNotice'), 'data-context-catalog-update': true }, props.t('contextCatalogReplaced'))
        : null, h('ul', { className: C('entries'), 'data-context-entries': true }, shown.map((entry, index) => h('li', { key: index, className: C('entry') }, h('code', { className: C('entryName') }, entry.name), h('span', { className: C('entryDescription') }, entry.description)))), shown.length < entries.length
        ? h('p', { className: C('catalogNotice'), 'data-context-entries-truncated': true }, props.t('contextCatalogMore', { count: entries.length - shown.length }))
        : null);
}
/** 官方 snapshotSections：{sections:[{name, text}]}，空表同样算不可用。 */
function snapshotSections(source) {
    const list = asRecord(source)?.sections;
    if (!Array.isArray(list))
        return null;
    const sections = [];
    for (const item of list) {
        const section = asRecord(item);
        if (section === null)
            return null;
        const name = section.name;
        const text = section.text;
        if (typeof name !== 'string' || name === '' || typeof text !== 'string')
            return null;
        sections.push({ name, text });
    }
    return sections.length === 0 ? null : sections;
}
function SnapshotBody(props) {
    const sections = snapshotSections(props.source);
    if (sections === null)
        return h(OpaqueBody, { content: props.content, source: props.source, t: props.t });
    return h('span', null, h('p', { className: C('catalogNotice'), 'data-context-snapshot-supersedes': true }, props.t('contextSnapshotSupersedes')), h('dl', { className: C('sections'), 'data-context-sections': true }, sections.map((section, index) => h('div', { key: index, className: C('section') }, h('dt', { className: C('sectionName') }, section.name), h('dd', { className: C('sectionText') }, boundedText(section.text, props.t))))));
}
/** 官方 relaySender：source.senderSessionId（不透明会话 id，只展示不解析）。 */
function relaySender(source) {
    const sender = asRecord(source)?.senderSessionId;
    return typeof sender === 'string' && sender !== '' ? sender : null;
}
function RelayBody(props) {
    const sender = relaySender(props.source);
    if (sender === null)
        return h(OpaqueBody, { content: props.content, source: props.source, t: props.t });
    return h('span', null, h('p', { className: C('relaySender'), 'data-context-relay-sender': true }, props.t('contextRelayFrom', { session: sender })), modelFacingContent(props.content, props.t));
}
/** 官方 recalledSessions：{references:[{label, retainedMessages, omittedMessages, truncated}]}。 */
function recalledSessions(source) {
    const list = asRecord(source)?.references;
    if (!Array.isArray(list))
        return null;
    const sessions = [];
    for (const item of list) {
        const reference = asRecord(item);
        if (reference === null)
            return null;
        const label = reference.label;
        const retained = reference.retainedMessages;
        const omitted = reference.omittedMessages;
        const truncated = reference.truncated;
        if (typeof label !== 'string' || label === '')
            return null;
        if (typeof retained !== 'number' || typeof omitted !== 'number' || typeof truncated !== 'boolean')
            return null;
        sessions.push({ label, retained, omitted, truncated });
    }
    return sessions.length === 0 ? null : sessions;
}
function RecallBody(props) {
    const sessions = recalledSessions(props.source);
    if (sessions === null)
        return h(OpaqueBody, { content: props.content, source: props.source, t: props.t });
    return h('span', null, h('ul', { className: C('recalls'), 'data-context-recalls': true }, sessions.map((session, index) => h('li', { key: index, className: C('recall') }, h('span', { className: C('recallLabel') }, session.label), h('span', { className: C('recallCounts') }, props.t('contextRecallCounts', { retained: session.retained, omitted: session.omitted })), session.truncated
        ? h('span', { className: C('recallCounts') }, props.t('contextRecallTruncated'))
        : null))), modelFacingContent(props.content, props.t));
}
/** 官方 noticeSummary：notice 折叠行的一行话（只有 notice 记录它）。 */
function noticeSummary(source) {
    const summary = asRecord(source)?.summary;
    return typeof summary === 'string' && summary !== '' ? summary : null;
}
export function contextBodyView(props) {
    const { form, content, source, t } = props;
    const opaque = { rendered: null, summary: null, body: h(OpaqueBody, { content, source, t }) };
    switch (form) {
        case 'instructions':
            return instructionChanges(source) === null ? opaque : { rendered: 'instructions', summary: null, body: h(InstructionsBody, { content, source, t }) };
        case 'catalog':
            return catalogEntries(source) === null ? opaque : { rendered: 'catalog', summary: null, body: h(CatalogBody, { content, source, t }) };
        case 'snapshot':
            return snapshotSections(source) === null ? opaque : { rendered: 'snapshot', summary: null, body: h(SnapshotBody, { content, source, t }) };
        case 'notice': {
            const summary = noticeSummary(source);
            return summary === null
                ? opaque
                : { rendered: 'notice', summary, body: modelFacingContent(content, t) };
        }
        case 'relay':
            return relaySender(source) === null ? opaque : { rendered: 'relay', summary: null, body: h(RelayBody, { content, source, t }) };
        case 'recall':
            return recalledSessions(source) === null ? opaque : { rendered: 'recall', summary: null, body: h(RecallBody, { content, source, t }) };
        default:
            return opaque;
    }
}
//# sourceMappingURL=ContextBody.js.map