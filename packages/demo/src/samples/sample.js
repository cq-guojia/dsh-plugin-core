/**
 * 真实样例源码：走 TextPreview 的代码分支（只读取、分页、256K 截断）。
 * 「源码」视图就是这个文件本身；语法高亮由官方 CodeBlock 负责。
 */
export function previewScope(path, root) {
  return path.startsWith(`${root}/`) ? 'inside' : 'outside'
}

export const MAX_SOURCE_BYTES = 256 * 1024
