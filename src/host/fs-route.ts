/**
 * 宿主侧只读文件路由（`node:fs` 直读，**不限工作区**）。
 *
 * 为什么需要：官方 `remote.workspaceFiles` 的 `list` 被 `contains(workspaceRoot, target)` 卡死
 * （`docs/design/external/dsh-host.md` §12），工作区外目录列不出来；`directoryPicker.list` 虽不限
 * 工作区，但**只回目录、不回文件**。要一套「单根文件树」，只能自建一条只读路由。
 *
 * 只读：只提供 list / read / readBytes / roots 四个 op，**没有任何写、删、改**入口。
 * 鉴权：不加 token —— 宿主自己的 HTTP 面已经能调 `remote.workspaceFiles.read`（允许工作区外绝对路径），
 * 本路由不引入新的暴露面；再加一个静态 token（同一份 bundle 里写着）只是装饰。
 *
 * ⚠️ 本文件是 Node 侧入口：不得 import React / DOM。
 */
import { access, lstat, open, readdir, stat } from 'node:fs/promises'
import { isAbsolute, join, normalize, sep } from 'node:path'
import type { NodeStats } from 'node:fs/promises'
import type { HostContextLike, HostWebServerLike } from './index.js'

/** 单层目录最多回多少条（用户 2026-11-03 定：官方 2000 太粗，取四分之一）。 */
export const FS_PAGE_LIMIT = 500
/** 文本分页默认一次回多少**行**（对齐官方 `maxLines` 默认 5e3；offset 也是行号，1 起）。 */
const READ_LINES = 5000
/** 整个文件的读取上限（对齐官方 `maxFileBytes` 32MB，超出回 too-large）。 */
const BYTES_MAX = 32 * 1024 * 1024
/** 列目录的等待上限：网络挂载盘上 `readdir` 可以卡很久。 */
const LIST_TIMEOUT = 8000

export interface FsRouteEntry {
  name: string
  type: 'file' | 'directory' | 'other'
  size?: number
}

export interface FsRouteListing {
  path: string
  entries: FsRouteEntry[]
  truncated: boolean
}

/** 一条列表/读取结果：成功是值本身，失败是 `{ ok:false, error }`（与官方 remote 信封同款）。 */
type Reply = { ok: false; error: { code: string; message: string } } | { ok: true; value: unknown }

function fail(code: string, message: string): Reply {
  return { ok: false, error: { code, message } }
}

function errCode(error: unknown): string {
  const code = (error as { code?: unknown } | null)?.code
  if (code === 'ENOENT') return 'not-found'
  if (code === 'ENOTDIR') return 'not-directory'
  if (code === 'EACCES' || code === 'EPERM') return 'service-unavailable'
  if (code === 'EISDIR') return 'not-regular-file'
  return 'service-unavailable'
}

/** 归一绝对路径（Windows 反斜杠 → `/`，盘符大写），拒绝相对路径 —— 路由永不按 cwd 解析。 */
export function normalizeAbsPath(raw: string): string | null {
  if (raw === '') return null
  const slashed = raw.replace(/\\/g, '/')
  if (!isAbsolute(slashed)) return null
  const normalized = normalize(slashed.replace(/\//g, sep)).replace(/\\/g, '/')
  const drive = /^([a-zA-Z]):/.exec(normalized)
  if (drive !== null) return `${drive[1]!.toUpperCase()}${normalized.slice(1)}`
  return normalized.length > 1 ? normalized.replace(/\/+$/, '') : normalized
}

async function listDir(target: string, offset: number, limit: number): Promise<Reply> {
  let info: NodeStats
  try {
    info = await lstat(target)
  } catch (error) {
    return fail(errCode(error), `no entry at ${target}`)
  }
  if (!info.isDirectory()) return fail('not-directory', `${target} is not a directory`)
  let names: string[]
  try {
    names = await Promise.race([
      readdir(target),
      new Promise<string[]>((_resolve, reject) => {
        setTimeout(() => reject(Object.assign(new Error('list timeout'), { code: 'ETIMEDOUT' })), LIST_TIMEOUT)
      }),
    ])
  } catch (error) {
    const code = (error as { code?: unknown } | null)?.code
    return fail(code === 'ETIMEDOUT' ? 'timeout' : errCode(error), `cannot list ${target}`)
  }
  // 服务端先排序再切片：翻页才不会重复/漏项（客户端另有「目录在前」的展示排序）。
  names.sort((left, right) => left.toLowerCase().localeCompare(right.toLowerCase()))
  const page = names.slice(offset, offset + limit)
  const entries: FsRouteEntry[] = []
  for (const name of page) {
    const child = join(target, name)
    try {
      const childInfo = await lstat(child)
      entries.push({
        name,
        type: childInfo.isDirectory() ? 'directory' : childInfo.isFile() ? 'file' : 'other',
        ...(childInfo.isFile() ? { size: childInfo.size } : {}),
      })
    } catch {
      entries.push({ name, type: 'other' })
    }
  }
  const listing: FsRouteListing = {
    path: target,
    entries,
    truncated: names.length > offset + limit,
  }
  return { ok: true, value: listing }
}

/**
 * 文本分页读。**按行分页**（offset 是 1 起的行号，limit 是行数）——与官方 `read` 同口径，
 * 客户端 `TextPreview` 的下一页偏移是 `offset + lines`，按字节分页会整页错位。
 */
async function readText(target: string, offset: number, limit: number): Promise<Reply> {
  let info: NodeStats
  try {
    info = await stat(target)
  } catch (error) {
    return fail(errCode(error), `no file at ${target}`)
  }
  if (!info.isFile()) return fail('not-regular-file', `${target} is not a regular file`)
  if (info.size > BYTES_MAX) return fail('too-large', `${target} exceeds the ${BYTES_MAX} byte cap`)
  const buffer = Buffer.alloc(info.size)
  const handle = await open(target, 'r')
  try {
    if (info.size > 0) await handle.read(buffer, 0, info.size, 0)
  } finally {
    await handle.close()
  }
  if (buffer.includes(0)) return fail('not-text', `${target} contains NUL bytes`)
  const all = buffer.toString('utf8').split('\n')
  const start = Math.max(0, offset - 1)
  const page = all.slice(start, start + limit)
  const text = page.join('\n')
  return {
    ok: true,
    value: {
      text,
      offset,
      lines: page.length,
      eof: start + page.length >= all.length,
      absolutePath: target,
      bytes: info.size,
    },
  }
}

async function readBinary(target: string, offset: number, length: number): Promise<Reply> {
  let info: NodeStats
  try {
    info = await stat(target)
  } catch (error) {
    return fail(errCode(error), `no file at ${target}`)
  }
  if (!info.isFile()) return fail('not-regular-file', `${target} is not a regular file`)
  const want = length > 0 ? length : info.size - offset
  if (want > BYTES_MAX) return fail('too-large', `${target} exceeds the ${BYTES_MAX} byte cap`)
  const size = Math.max(0, Math.min(want, info.size - offset))
  const buffer = Buffer.alloc(size)
  if (size > 0) {
    const handle = await open(target, 'r')
    try {
      await handle.read(buffer, 0, size, offset)
    } finally {
      await handle.close()
    }
  }
  return {
    ok: true,
    value: {
      offset,
      data: buffer.toString('base64'),
      eof: offset + size >= info.size,
      bytes: info.size,
    },
  }
}

/** 根节点：POSIX 只有 `/`；Windows 逐个盘符探一下（Node 没有枚举盘符的 API）。 */
async function roots(): Promise<string[]> {
  if (process.platform !== 'win32') return ['/']
  const found: string[] = []
  await Promise.all(
    Array.from({ length: 26 }, (_, index) => String.fromCharCode(65 + index)).map(async (letter) => {
      const drive = `${letter}:\\`
      try {
        await access(drive)
        found.push(`${letter}:/`)
      } catch {
        /* 不存在的盘符跳过 */
      }
    }),
  )
  return found.sort()
}

/**
 * 注册只读文件路由（插件宿主 `apply` 里调一次）。
 *
 * @param ctx 插件宿主 ctx（`webServer` 缺失 ⇒ 不注册，能力自然缺席）
 * @param options.path 路由前缀，客户端要用**同一个常量**去 fetch（如 `/api/x/fs`）
 */
export function serveFsRoute(ctx: HostContextLike, options: { path: string }): void {
  ctx.inject(['webServer'], (services) => {
    const webServer = services.webServer as HostWebServerLike | undefined
    if (webServer === undefined) return
    webServer.register({
      kind: 'prefix',
      path: options.path,
      handler: async (req, res) => {
        const url = new URL(req.url ?? '', 'http://host')
        const target = normalizeAbsPath(url.searchParams.get('path') ?? '')
        const op = url.searchParams.get('op') ?? 'list'
        const offset = Number(url.searchParams.get('offset') ?? '0') || 0
        const limitParam = Number(url.searchParams.get('limit') ?? '0') || 0
        let reply: Reply
        if (op === 'roots') {
          reply = { ok: true, value: { roots: await roots() } }
        } else if (target === null) {
          reply = fail('bad-request', 'path must be absolute')
        } else if (op === 'list') {
          reply = await listDir(target, offset, limitParam > 0 ? Math.min(limitParam, FS_PAGE_LIMIT) : FS_PAGE_LIMIT)
        } else if (op === 'read') {
          reply = await readText(target, offset > 0 ? offset : 1, limitParam > 0 ? limitParam : READ_LINES)
        } else if (op === 'readBytes') {
          reply = await readBinary(target, offset, limitParam)
        } else {
          reply = fail('bad-request', `unknown op ${op}`)
        }
        res.writeHead(200, { 'content-type': 'application/json; charset=utf-8' })
        res.end(JSON.stringify(reply))
      },
    })
  })
}
