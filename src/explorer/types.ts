// 与宿主「工作区文件」能力对接的**最小接口面**。
//
// 为什么不直接用 `ctx`：ctx 是宿主给的整个大对象，传进来就把本包和宿主版本焊死了。
// 插件从 ctx 里取出这一小块传给我们，宿主 breaking 时改的是插件「取出」的一行（需求文档 §5.5）。

export interface WorkspaceFilesFace {
  /** 文本分页读。⚠️ `range` **必传**（官方按位置参数个数校验，省了会被远端拒）。 */
  read(
    sessionId: string,
    path: string,
    range: { offset?: number; limit?: number },
    signal?: AbortSignal,
  ): Promise<{
    offset: number
    text: string
    lines: number
    eof: boolean
    absolutePath?: string
    version?: number | string
    bytes?: number
  }>
  /** 二进制读（`options` 同样必传，不传 range 即读全量）。 */
  readBytes(
    sessionId: string,
    path: string,
    options: { range?: { offset?: number; length?: number } },
    signal?: AbortSignal,
  ): Promise<{ offset: number; data: Uint8Array; eof: boolean; bytes?: number }>
  /** 列举直接子项；list 一个文件会报 not-directory。 */
  list(
    sessionId: string,
    path: string,
    signal?: AbortSignal,
  ): Promise<{
    path: string
    entries: ReadonlyArray<{ name: string; type: 'file' | 'directory' | 'other'; size?: number }>
    truncated: boolean
  }>
  /** 单文件 stat（可选：宿主过旧没有此方法时降级）。只认普通文件，目录会抛。 */
  stat?(
    sessionId: string,
    path: string,
    signal?: AbortSignal,
  ): Promise<{ absolutePath: string; version?: number | string; bytes?: number }>
}

export interface DirEntry {
  name: string
  type: 'file' | 'directory' | 'other'
  size?: number
}

export interface Listing {
  path: string
  entries: DirEntry[]
  truncated: boolean
}

/** 预览类型（决定用哪个预览体）。 */
export type PreviewKind = 'text' | 'image' | 'unsupported'

const IMAGE_EXT: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
  bmp: 'image/bmp',
  svg: 'image/svg+xml',
  ico: 'image/x-icon',
}

export function mimeOf(path: string): string | undefined {
  const ext = extOf(path)
  return ext === '' ? undefined : IMAGE_EXT[ext]
}

export function extOf(path: string): string {
  const name = path.slice(path.lastIndexOf('/') + 1)
  const dot = name.lastIndexOf('.')
  return dot <= 0 ? '' : name.slice(dot + 1).toLowerCase()
}

/** 按扩展名猜预览类型；猜不出就 `unsupported`（不硬撑，交给调用方决定兜底）。 */
export function previewKindOf(path: string): PreviewKind {
  if (mimeOf(path) !== undefined) return 'image'
  const ext = extOf(path)
  if (ext === '') return 'text'
  const textLike = new Set([
    'txt', 'md', 'markdown', 'json', 'yaml', 'yml', 'toml', 'ini', 'csv', 'log',
    'ts', 'tsx', 'js', 'jsx', 'mjs', 'cjs', 'py', 'go', 'rs', 'java', 'c', 'h', 'cpp',
    'sh', 'bash', 'sql', 'html', 'css', 'xml',
  ])
  return textLike.has(ext) ? 'text' : 'unsupported'
}

/** 路径分段（面包屑用）：`a/b/c` ⇒ `['a','b','c']`；空串 = 工作区根。 */
export function crumbsOf(path: string): string[] {
  return path.split('/').filter((s) => s !== '')
}

/** 父目录（无父 = 空串，list('') = 工作区根）。 */
export function parentOf(path: string): string {
  const cut = path.lastIndexOf('/')
  return cut < 0 ? '' : path.slice(0, cut)
}

/** 拼接子路径，避免多余斜杠。 */
export function joinPath(dir: string, name: string): string {
  return dir === '' ? name : `${dir}/${name}`
}
