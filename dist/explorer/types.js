// 与宿主「工作区文件」能力对接的**最小接口面**。
//
// 为什么不直接用 `ctx`：ctx 是宿主给的整个大对象，传进来就把本包和宿主版本焊死了。
// 插件从 ctx 里取出这一小块传给我们，宿主 breaking 时改的是插件「取出」的一行（需求文档 §5.5）。
import { extOf, mimeOf } from '../utils/path.js';
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
//# sourceMappingURL=types.js.map