/**
 * 纯路径方法 —— 只做字符串切分 / 拼接，不碰宿主、不依赖 React / DOM。
 *
 * 约定（与工作区文件 API 一致）：POSIX `/` 分隔；空串 `''` 表示根。
 * 与宿主无关：这里不调任何宿主 API，路径字符串由调用方传入。
 */

const IMAGE_EXT: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
  bmp: 'image/bmp',
  svg: 'image/svg+xml',
  ico: 'image/x-icon',
  avif: 'image/avif',
}

/** 扩展名 → 图片 MIME；不是已知图片扩展名返回 `undefined`。 */
export function mimeOf(path: string): string | undefined {
  const ext = extOf(path)
  return ext === '' ? undefined : IMAGE_EXT[ext]
}

/** 取扩展名（小写、不含点）；无扩展名返回 `''`。 */
export function extOf(path: string): string {
  const name = path.slice(path.lastIndexOf('/') + 1)
  const dot = name.lastIndexOf('.')
  return dot <= 0 ? '' : name.slice(dot + 1).toLowerCase()
}

/** 路径分段（面包屑用）：`a/b/c` ⇒ `['a','b','c']`；空串 = 根。 */
export function crumbsOf(path: string): string[] {
  return path.split('/').filter((s) => s !== '')
}

/** 父目录（无父 = 空串，表示根）。 */
export function parentOf(path: string): string {
  const cut = path.lastIndexOf('/')
  return cut < 0 ? '' : path.slice(0, cut)
}

/** 拼接子路径，避免多余斜杠。 */
export function joinPath(dir: string, name: string): string {
  return dir === '' ? name : `${dir}/${name}`
}
