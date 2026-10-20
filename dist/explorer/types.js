// 与宿主「工作区文件」能力对接的**最小接口面** + 文件浏览的纯逻辑。
//
// 本文件是 explorer 的纯逻辑层：**零 React、零官方件**——node 单测直接引它
// （面板/预览体在别的文件，静态 import 官方 primitives，Node 下会
// ERR_MODULE_NOT_FOUND，那是宿主才有的平台模块）。
//
// 为什么不直接用 `ctx`：ctx 是宿主给的整个大对象，传进来就把本包和宿主版本焊死了。
// 插件从 ctx 里取出这一小块传给我们，宿主 breaking 时改的是插件「取出」的一行（需求文档 §5.5）。
import { extOf, mimeOf, parentOf } from '../utils/path.js';
/** HTML 静态预览的扩展名（与官方 htmlBodyDefinition 同款）。 */
export const HTML_KINDS = ['html', 'htm'];
/**
 * Office 预览扩展名（官方 remote.officeToPdf 转 PDF 后再渲染）。
 * ⚠️ 官方 OfficeExtension 还含 xls / xlsx，按兄弟项目 2026-10-05 拍板「Excel 向后讨论」不纳入。
 */
export const OFFICE_KINDS = ['doc', 'docx', 'ppt', 'pptx'];
/** 源码态读取上限（256K，UTF-8 边界安全由截断处处理）。 */
export const SOURCE_MAX_BYTES = 256 * 1024;
/**
 * 按扩展名分发预览类型。**没有 unsupported 档**：认不出的扩展名一律按 text 走，
 * 由 read 抛 not-text 落「不是文本文件」空态——官方 read 才是真源，不本地猜二进制清单。
 */
export function previewInfoOf(path) {
    const ext = extOf(path);
    const mime = mimeOf(path);
    if (mime !== undefined)
        return { kind: 'image', ext, mime };
    if (ext === 'pdf')
        return { kind: 'pdf', ext, mime: 'application/pdf' };
    if (ext === 'md' || ext === 'markdown')
        return { kind: 'md', ext };
    if (HTML_KINDS.includes(ext))
        return { kind: 'html', ext };
    if (OFFICE_KINDS.includes(ext))
        return { kind: 'office', ext, mime: 'application/pdf' };
    return { kind: 'text', ext };
}
/** 只要 kind（兼容旧用法）；要 ext/mime 用 previewInfoOf。 */
export function previewKindOf(path) {
    return previewInfoOf(path).kind;
}
export function unwrapEnvelope(result) {
    if (typeof result === 'object' && result !== null) {
        const r = result;
        if (r.ok === false)
            return { kind: 'error', error: r.error };
        if (r.ok === true && 'value' in r)
            return { kind: 'ok', payload: r.value };
    }
    return { kind: 'ok', payload: result };
}
/** 失败分支判空（TS 收窄用）。 */
export function isFailed(value) {
    return typeof value === 'object' && value !== null && 'failed' in value;
}
/** `list` 结果防御解析：返回 Listing 或失败/非法信封。 */
export function listingOf(result) {
    const envelope = unwrapEnvelope(result);
    if (envelope.kind === 'error')
        return { failed: envelope.error };
    const raw = envelope.payload;
    if (typeof raw !== 'object' || raw === null) {
        console.warn('[dsh-plugin-core:explorer] list 返回非对象');
        return null;
    }
    const r = raw;
    if (typeof r.path !== 'string' || !Array.isArray(r.entries) || typeof r.truncated !== 'boolean') {
        console.warn('[dsh-plugin-core:explorer] list 返回形状不符契约');
        return null;
    }
    return { path: r.path, entries: r.entries, truncated: r.truncated };
}
/** `read` 结果防御解析：page.text 必须是字符串，否则错误态（防渲染器内部抛错整页黑屏）。 */
export function textPageOf(result) {
    const envelope = unwrapEnvelope(result);
    if (envelope.kind === 'error')
        return { failed: envelope.error };
    const raw = envelope.payload;
    if (typeof raw !== 'object' || raw === null) {
        console.warn('[dsh-plugin-core:explorer] read 返回非对象');
        return null;
    }
    const r = raw;
    if (typeof r.text !== 'string') {
        console.warn('[dsh-plugin-core:explorer] read 返回形状不符契约（无 text 字段）');
        return null;
    }
    const offset = typeof r.offset === 'number' ? r.offset : 0;
    const lines = typeof r.lines === 'number' ? r.lines : r.text === '' ? 0 : r.text.split('\n').length;
    return { text: r.text, offset, lines, eof: r.eof !== false };
}
/** `readBytes` 结果防御解析：data 必须是 Uint8Array，否则错误态。 */
export function bytesOf(result) {
    const envelope = unwrapEnvelope(result);
    if (envelope.kind === 'error')
        return { failed: envelope.error };
    const data = envelope.payload?.data;
    if (data instanceof Uint8Array)
        return data;
    console.warn('[dsh-plugin-core:explorer] readBytes 返回形状不符契约');
    return null;
}
/** `stat` 结果防御解析：只取 absolutePath（信封剥壳同款；stat 仅认 regular file）。 */
export function absolutePathOf(result) {
    const envelope = unwrapEnvelope(result);
    if (envelope.kind === 'error')
        return null;
    const raw = envelope.payload;
    if (typeof raw !== 'object' || raw === null)
        return null;
    const abs = raw.absolutePath;
    return typeof abs === 'string' && abs !== '' ? abs : null;
}
// ── 错误码 → 文案（官方 RemoteError 按 code 分支，不按消息文本） ──
/** 剥 wire 命名空间前缀（如 `workspace-file/not-found` ⇒ `not-found`）。 */
export function bareCode(raw) {
    if (typeof raw === 'string') {
        const slash = raw.lastIndexOf('/');
        return slash >= 0 ? raw.slice(slash + 1) : raw;
    }
    if (typeof raw === 'object' && raw !== null) {
        const code = raw.code;
        if (typeof code === 'string')
            return bareCode(code);
    }
    return '';
}
/** 任意抛错/reject ⇒ 文案键。官方 code 分支 + 未知回落，绝不按消息文本猜。 */
export function errView(error) {
    const code = bareCode(error);
    switch (code) {
        case 'outside-workspace':
            return { key: 'previewOutside' };
        case 'not-found':
        case 'lookup-not-found':
            return { key: 'previewNotFound' };
        case 'not-directory':
            return { key: 'previewNotDirectory' };
        case 'not-regular-file':
            return { key: 'previewNotDirectory' };
        case 'too-large':
            return { key: 'previewTooLarge' };
        case 'not-text':
            return { key: 'previewNotText' };
        case 'invocation-unavailable':
        case 'service-unavailable':
            return { key: 'previewOfficeUnavailable' };
        default:
            return { key: 'explorerFailed' };
    }
}
// ── 目录条目 ──
/** 子项排序：目录在前，文件在后，各自按名称（不区分大小写）升序。 */
export function sortEntries(entries) {
    return [...entries].sort((a, b) => {
        const ad = a.type === 'directory' ? 0 : 1;
        const bd = b.type === 'directory' ? 0 : 1;
        if (ad !== bd)
            return ad - bd;
        return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
    });
}
/**
 * 0.2.0-rc.1 起官方 list **拒绝空路径** ⇒ 空串（= 工作区根）一律以 `'.'` 上线
 * （`'.'` 按 cwd = 工作区根归一解析为根本身；响应里根的 path 仍是 `''`）。
 */
export function listPathOf(dir) {
    return dir === '' ? '.' : dir;
}
export function createRootCache() {
    const map = new Map();
    return {
        get: (sessionId) => map.get(sessionId),
        set: (sessionId, root) => {
            map.set(sessionId, root);
        },
    };
}
/** 宿主绝对路径形态（/ 开头或 Windows 盘符）。 */
export function isAbsoluteish(p) {
    return p.startsWith('/') || p.startsWith('\\') || /^[a-zA-Z]:[\\/]/.test(p);
}
/** 工作区相对拼接（根下直接 name，不补前导 /）。 */
export function relJoin(dir, name) {
    return dir.replace(/\/+$/, '') === '' ? name : `${dir.replace(/\/+$/, '')}/${name}`;
}
/** 由「相对路径 + 该文件宿主绝对路径」反推工作区根并写入缓存；学不出返回 null。 */
export function learnRoot(cache, sessionId, relativePath, absolutePath) {
    const rel = relativePath.replace(/^\/+/, '').replace(/\/+$/, '');
    if (rel === '' || !absolutePath.endsWith(`/${rel}`))
        return null;
    const root = absolutePath.slice(0, absolutePath.length - rel.length - 1);
    cache.set(sessionId, root);
    return root;
}
/** 把宿主绝对路径剥回工作区相对（根未知或不在根下 ⇒ 原样返回，退化）。 */
export function relativizeToRoot(cache, sessionId, dir) {
    if (!isAbsoluteish(dir))
        return dir;
    const root = cache.get(sessionId);
    if (root === undefined)
        return dir;
    const norm = root.replace(/\/+$/, '');
    if (dir === norm)
        return '';
    if (dir.startsWith(`${norm}/`))
        return dir.slice(norm.length + 1);
    return dir;
}
/**
 * 在相对目录树里找**任意一个文件**并 stat（广度优先、有界：每层最多 5 个目录、最多 3 层）。
 * 用于目标目录本身没有文件子项（空目录 / 只有子目录）时反推工作区根。
 */
export async function findAnyFileAbs(workspaceFiles, sessionId, startDir) {
    const stat = workspaceFiles.stat;
    if (stat === undefined)
        return null;
    let frontier = [startDir];
    for (let depth = 0; depth < 3 && frontier.length > 0; depth++) {
        const nextDirs = [];
        for (const dir of frontier.slice(0, 5)) {
            let entries;
            try {
                const parsed = listingOf(await workspaceFiles.list(sessionId, listPathOf(dir)));
                if (parsed === null || isFailed(parsed))
                    continue;
                entries = parsed.entries;
            }
            catch {
                continue;
            }
            const file = entries.find((entry) => entry.type === 'file');
            if (file !== undefined) {
                const rel = relJoin(dir, file.name);
                try {
                    const abs = absolutePathOf(await stat(sessionId, rel));
                    if (abs !== null)
                        return { absolutePath: abs, relativePath: rel };
                }
                catch {
                    /* 换下一个候选 */
                }
            }
            for (const entry of entries) {
                if (entry.type === 'directory' && nextDirs.length < 5)
                    nextDirs.push(relJoin(dir, entry.name));
            }
        }
        frontier = nextDirs;
    }
    return null;
}
/**
 * 把「工作区相对名」的目录解析成宿主绝对路径（面包屑才能从工作区根往下列）。
 * 优先级：① 根已缓存 ⇒ 根 + '/' + 规范相对路径（覆盖空目录 / 只有子目录）；
 * ② 目录里有文件子项 ⇒ stat 它反推根；③ 有界 BFS 找任一文件反推根。
 * 全部失败 ⇒ 退回入参，浏览不受影响。
 */
export async function absolutizeDir(cache, workspaceFiles, sessionId, dir, canonical, entries) {
    if (isAbsoluteish(dir))
        return dir;
    const rel = canonical !== '' ? canonical : dir;
    const cached = cache.get(sessionId);
    if (cached !== undefined)
        return `${cached}/${rel}`;
    const stat = workspaceFiles.stat;
    if (stat === undefined)
        return dir;
    // ② 本目录里的文件子项
    const file = entries.find((entry) => entry.type === 'file');
    if (file !== undefined) {
        try {
            const sub = relJoin(rel, file.name);
            const abs = absolutePathOf(await stat(sessionId, sub));
            if (abs?.endsWith(`/${file.name}`) === true && learnRoot(cache, sessionId, sub, abs) !== null) {
                return abs.slice(0, abs.length - file.name.length - 1);
            }
        }
        catch {
            /* 落到 ③ */
        }
    }
    // ③ 有界 BFS 找一个文件反推根
    const found = await findAnyFileAbs(workspaceFiles, sessionId, rel);
    if (found === null)
        return dir;
    const root = learnRoot(cache, sessionId, found.relativePath, found.absolutePath);
    return root === null ? dir : `${root}/${rel}`;
}
export function matchesFilter(path, isDir, filter) {
    if (filter === undefined)
        return true;
    if (filter.dirs === true)
        return isDir;
    if (filter.exts === undefined || filter.exts.length === 0)
        return true;
    if (isDir)
        return true;
    return filter.exts.includes(extOf(path));
}
// ── 面包屑 ──
/** 面包屑段：把目录路径拆成可点层级（绝对路径保留前导 /）。 */
export function crumbsOfDir(dir) {
    const isAbs = isAbsoluteish(dir);
    const segs = dir.split('/').filter((s) => s.length > 0);
    const out = [];
    let acc = '';
    for (const seg of segs) {
        acc = acc === '' ? (isAbs ? `/${seg}` : seg) : `${acc}/${seg}`;
        out.push({ label: seg, path: acc });
    }
    return out;
}
/** 文件/目录的显示名（末段）。 */
export function baseNameOfPath(p) {
    const i = Math.max(p.lastIndexOf('/'), p.lastIndexOf('\\'));
    return i < 0 ? p : p.slice(i + 1);
}
/** 父目录（无父 = 空串）。 */
export function dirnameOf(p) {
    return parentOf(p);
}
/** 路径拼接（处理根与绝对/相对；沿用 utils/path 的 joinPath 语义）。 */
export { joinPath } from '../utils/path.js';
/** mimeOf 再导出（预览体要用，避免各自 import utils）。 */
export { extOf, mimeOf };
//# sourceMappingURL=types.js.map