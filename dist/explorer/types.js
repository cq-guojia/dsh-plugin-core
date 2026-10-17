// 与宿主「工作区文件」能力对接的**最小接口面**。
//
// 为什么不直接用 `ctx`：ctx 是宿主给的整个大对象，传进来就把本包和宿主版本焊死了。
// 插件从 ctx 里取出这一小块传给我们，宿主 breaking 时改的是插件「取出」的一行（需求文档 §5.5）。
const IMAGE_EXT = {
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    webp: 'image/webp',
    bmp: 'image/bmp',
    svg: 'image/svg+xml',
    ico: 'image/x-icon',
};
export function mimeOf(path) {
    const ext = extOf(path);
    return ext === '' ? undefined : IMAGE_EXT[ext];
}
export function extOf(path) {
    const name = path.slice(path.lastIndexOf('/') + 1);
    const dot = name.lastIndexOf('.');
    return dot <= 0 ? '' : name.slice(dot + 1).toLowerCase();
}
/** 按扩展名猜预览类型；猜不出就 `unsupported`（不硬撑，交给调用方决定兜底）。 */
export function previewKindOf(path) {
    if (mimeOf(path) !== undefined)
        return 'image';
    const ext = extOf(path);
    if (ext === '')
        return 'text';
    const textLike = new Set([
        'txt', 'md', 'markdown', 'json', 'yaml', 'yml', 'toml', 'ini', 'csv', 'log',
        'ts', 'tsx', 'js', 'jsx', 'mjs', 'cjs', 'py', 'go', 'rs', 'java', 'c', 'h', 'cpp',
        'sh', 'bash', 'sql', 'html', 'css', 'xml',
    ]);
    return textLike.has(ext) ? 'text' : 'unsupported';
}
/** 路径分段（面包屑用）：`a/b/c` ⇒ `['a','b','c']`；空串 = 工作区根。 */
export function crumbsOf(path) {
    return path.split('/').filter((s) => s !== '');
}
/** 父目录（无父 = 空串，list('') = 工作区根）。 */
export function parentOf(path) {
    const cut = path.lastIndexOf('/');
    return cut < 0 ? '' : path.slice(0, cut);
}
/** 拼接子路径，避免多余斜杠。 */
export function joinPath(dir, name) {
    return dir === '' ? name : `${dir}/${name}`;
}
//# sourceMappingURL=types.js.map