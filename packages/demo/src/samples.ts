/**
 * 在**真实工作区**里定位 demo 的样例目录（`packages/demo/src/samples`）。
 *
 * 为什么不写死路径：这是 demo 插件，工作区根是宿主的（可能就是本仓库、也可能是外层的
 * `dsh-plugins`），相对路径会随根变。⇒ 用 `workspaceFiles.list` 做**有界**层序探索找人：
 * 命中标准 = 一个同时含 `README.md` + `demo.html` + `sample.js` + `sample.css` 的目录。
 *
 * 全部找不到 ⇒ null，界面如实说「没找到」，不退回任何假数据。
 */
import {
  isFailed,
  joinPath,
  listPathOf,
  listingOf,
  type DirEntry,
  type WorkspaceFilesFace,
} from '../../../dist/explorer/index.js'

/** 四个样例文件；缺一即不算命中。 */
export const SAMPLE_NAMES = ['README.md', 'demo.html', 'sample.js', 'sample.css'] as const

export interface SampleSet {
  /** 样例目录（工作区相对路径）。 */
  dir: string
  /** 各样例文件（工作区相对路径）。 */
  md: string
  html: string
  js: string
  css: string
}

/** 探索宽度：每层最多看 6 个目录、最多 4 层（够覆盖本仓库，不会把宿主拖死）。 */
const MAX_DIRS_PER_LEVEL = 6
const MAX_DEPTH = 4
/** 噪声目录：列了也没意义。 */
const SKIP = new Set(['node_modules', 'dist', '.git', 'coverage', 'build'])

async function readDir(
  files: WorkspaceFilesFace,
  sessionId: string,
  dir: string,
): Promise<readonly DirEntry[] | null> {
  try {
    const parsed = listingOf(await files.list(sessionId, listPathOf(dir)))
    if (parsed === null || isFailed(parsed)) return null
    return parsed.entries
  } catch {
    return null
  }
}

function hitOf(dir: string, entries: readonly DirEntry[]): SampleSet | null {
  const names = new Set(entries.filter((entry) => entry.type === 'file').map((entry) => entry.name))
  if (!SAMPLE_NAMES.every((name) => names.has(name))) return null
  return {
    dir,
    md: joinPath(dir, 'README.md'),
    html: joinPath(dir, 'demo.html'),
    js: joinPath(dir, 'sample.js'),
    css: joinPath(dir, 'sample.css'),
  }
}

/** 找样例目录（广度优先、有界）；找不到返回 null。 */
export async function findSamples(files: WorkspaceFilesFace, sessionId: string): Promise<SampleSet | null> {
  const root = await readDir(files, sessionId, '')
  if (root === null) return null
  let frontier: string[] = ['']
  const hit = hitOf('', root)
  if (hit !== null) return hit
  for (let depth = 0; depth < MAX_DEPTH; depth++) {
    const next: string[] = []
    for (const dir of frontier) {
      const listed = dir === '' ? root : await readDir(files, sessionId, dir)
      if (listed === null) continue
      const subdirs = listed.filter((entry) => entry.type === 'directory' && !SKIP.has(entry.name))
      for (const sub of subdirs.slice(0, MAX_DIRS_PER_LEVEL)) {
        const childPath = joinPath(dir, sub.name)
        const childEntries = await readDir(files, sessionId, childPath)
        if (childEntries === null) continue
        const found = hitOf(childPath, childEntries)
        if (found !== null) return found
        next.push(childPath)
      }
    }
    if (next.length === 0) return null
    frontier = next
  }
  return null
}
