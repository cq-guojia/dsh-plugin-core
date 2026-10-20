import test from 'node:test'
import assert from 'node:assert/strict'
import { crumbsOf, extOf, joinPath, mimeOf, parentOf } from '../dist/utils/index.js'
// 只引纯逻辑层：面板/预览体静态 import 官方 primitives（Node 下不可解析，那是宿主平台模块）
import {
  absolutizeDir,
  bareCode,
  baseNameOfPath,
  createRootCache,
  crumbsOfDir,
  dirnameOf,
  errView,
  findAnyFileAbs,
  learnRoot,
  listPathOf,
  matchesFilter,
  previewInfoOf,
  previewKindOf,
  relativizeToRoot,
  sortEntries,
} from '../dist/explorer/types.js'

test('crumbsOf / parentOf / joinPath', () => {
  assert.deepEqual(crumbsOf(''), [])
  assert.deepEqual(crumbsOf('a/b/c'), ['a', 'b', 'c'])
  assert.equal(parentOf('a/b/c'), 'a/b')
  assert.equal(parentOf('a'), '')
  assert.equal(joinPath('', 'a'), 'a')
  assert.equal(joinPath('a/b', 'c'), 'a/b/c')
})

test('extOf / mimeOf', () => {
  assert.equal(extOf('a/b/c.md'), 'md')
  assert.equal(extOf('Makefile'), '')
  assert.equal(mimeOf('x/photo.PNG'), 'image/png')
  assert.equal(mimeOf('x/a.md'), undefined)
  assert.equal(mimeOf('x/a.avif'), 'image/avif')
})

test('previewInfoOf 六档分发', () => {
  assert.equal(previewKindOf('a.png'), 'image')
  assert.equal(previewInfoOf('a.PNG').mime, 'image/png')
  assert.equal(previewKindOf('a.pdf'), 'pdf')
  assert.equal(previewKindOf('a.md'), 'md')
  assert.equal(previewKindOf('a.markdown'), 'md')
  assert.equal(previewKindOf('a.html'), 'html')
  assert.equal(previewKindOf('a.htm'), 'html')
  assert.equal(previewKindOf('a.docx'), 'office')
  assert.equal(previewKindOf('a.ppt'), 'office')
  assert.equal(previewKindOf('a.ts'), 'text')
  // 认不出的扩展名按 text 走（由 read 抛 not-text 落空态，不本地猜二进制清单）
  assert.equal(previewKindOf('a.zip'), 'text')
  // 无扩展名按文本处理（源码类文件常无后缀，如 Dockerfile）
  assert.equal(previewKindOf('Dockerfile'), 'text')
  assert.equal(previewInfoOf('Dockerfile').ext, '')
})

test('bareCode 剥命名空间 / errView 按 code 分支', () => {
  assert.equal(bareCode('workspace-file/not-found'), 'not-found')
  assert.equal(bareCode({ code: 'workspace-file/outside-workspace' }), 'outside-workspace')
  assert.equal(bareCode(undefined), '')
  assert.equal(errView({ code: 'workspace-file/outside-workspace' }).key, 'previewOutside')
  assert.equal(errView('workspace-file/not-found').key, 'previewNotFound')
  assert.equal(errView({ code: 'lookup-not-found' }).key, 'previewNotFound')
  assert.equal(errView({ code: 'not-directory' }).key, 'previewNotDirectory')
  assert.equal(errView({ code: 'too-large' }).key, 'previewTooLarge')
  assert.equal(errView({ code: 'not-text' }).key, 'previewNotText')
  assert.equal(errView({ code: 'service-unavailable' }).key, 'previewOfficeUnavailable')
  // 未知/无 code ⇒ 通用失败，绝不按消息文本猜
  assert.equal(errView(new Error('boom')).key, 'explorerFailed')
  assert.equal(errView(undefined).key, 'explorerFailed')
})

test('sortEntries 目录在前 + 名称不区分大小写', () => {
  const sorted = sortEntries([
    { name: 'b.ts', type: 'file' },
    { name: 'A', type: 'directory' },
    { name: 'a.ts', type: 'file' },
    { name: 'b', type: 'directory' },
  ])
  assert.deepEqual(sorted.map((e) => e.name), ['A', 'b', 'a.ts', 'b.ts'])
})

test('matchesFilter 过滤口径', () => {
  assert.equal(matchesFilter('a.ts', false, undefined), true)
  assert.equal(matchesFilter('a.ts', false, {}), true)
  assert.equal(matchesFilter('a.ts', false, { exts: ['ts'] }), true)
  assert.equal(matchesFilter('a.md', false, { exts: ['ts'] }), false)
  // 目录永远保留（里面可能有匹配的）
  assert.equal(matchesFilter('src', true, { exts: ['ts'] }), true)
  // dirs = 只要文件夹
  assert.equal(matchesFilter('a.ts', false, { dirs: true }), false)
  assert.equal(matchesFilter('src', true, { dirs: true }), true)
})

test('listPathOf 根路径上线形态', () => {
  assert.equal(listPathOf(''), '.')
  assert.equal(listPathOf('.'), '.')
  assert.equal(listPathOf('src'), 'src')
})

test('crumbsOfDir / dirnameOf / baseNameOfPath', () => {
  assert.deepEqual(crumbsOfDir(''), [])
  assert.deepEqual(crumbsOfDir('a/b/c'), [
    { label: 'a', path: 'a' },
    { label: 'b', path: 'a/b' },
    { label: 'c', path: 'a/b/c' },
  ])
  // 绝对路径保留前导 /
  assert.deepEqual(crumbsOfDir('/ws/a'), [
    { label: 'ws', path: '/ws' },
    { label: 'a', path: '/ws/a' },
  ])
  assert.equal(dirnameOf('a/b/c.ts'), 'a/b')
  assert.equal(dirnameOf('a.ts'), '')
  assert.equal(baseNameOfPath('a/b/c.ts'), 'c.ts')
})

// ── 工作区根反推 ──

const mockWf = {
  async list(_sessionId, path) {
    const key = path === '.' ? '' : path
    const tree = {
      '': ['src', 'docs', 'README.md', 'logo.png'],
      src: ['index.ts', 'ui'],
      'src/ui': ['Picker.ts'],
      docs: ['requirements.md'],
    }
    const names = tree[key]
    if (names === undefined) throw { code: 'workspace-file/not-directory' }
    return {
      path: key,
      truncated: false,
      entries: names.map((name) => ({ name, type: guess(name), size: 10 })),
    }
  },
  async read(_sessionId, path) {
    return { offset: 0, text: `text of ${path}`, lines: 1, eof: true }
  },
  async readBytes() {
    return { offset: 0, data: new Uint8Array(), eof: true }
  },
  async stat(_sessionId, path) {
    return { absolutePath: `/home/ws/${path}` }
  },
}
function guess(name) {
  return name === 'src' || name === 'docs' || name === 'ui' ? 'directory' : 'file'
}

test('learnRoot 反推 + relativizeToRoot 剥根', () => {
  const cache = createRootCache()
  assert.equal(learnRoot(cache, 's1', 'src/index.ts', '/home/ws/src/index.ts'), '/home/ws')
  assert.equal(cache.get('s1'), '/home/ws')
  // 后缀不匹配 ⇒ 学不出
  assert.equal(learnRoot(cache, 's2', 'a.ts', '/other/b.ts'), null)
  assert.equal(cache.get('s2'), undefined)
  // 相对路径原样返回
  assert.equal(relativizeToRoot(cache, 's1', 'docs'), 'docs')
  // 绝对路径剥回相对
  assert.equal(relativizeToRoot(cache, 's1', '/home/ws/docs'), 'docs')
  // 根本身 ⇒ 空串
  assert.equal(relativizeToRoot(cache, 's1', '/home/ws'), '')
  // 不在根下 ⇒ 原样（退化）
  assert.equal(relativizeToRoot(cache, 's1', '/other/x'), '/other/x')
  // 会话隔离
  assert.equal(relativizeToRoot(cache, 's9', '/home/ws/docs'), '/home/ws/docs')
})

test('absolutizeDir 三级解析', async () => {
  // ① 根已缓存 ⇒ 直接拼（覆盖空目录/只有子目录）
  const cache1 = createRootCache()
  cache1.set('s', '/home/ws')
  assert.equal(await absolutizeDir(cache1, mockWf, 's', 'docs', 'docs', []), '/home/ws/docs')
  // ② 目录里有文件子项 ⇒ stat 反推
  const cache2 = createRootCache()
  assert.equal(
    await absolutizeDir(cache2, mockWf, 's', 'docs', 'docs', [{ name: 'requirements.md', type: 'file' }]),
    '/home/ws/docs',
  )
  assert.equal(cache2.get('s'), '/home/ws')
  // 绝对路径入参原样返回
  assert.equal(await absolutizeDir(createRootCache(), mockWf, 's', '/abs/dir', '/abs/dir', []), '/abs/dir')
})

test('findAnyFileAbs 有界 BFS 找任一文件', async () => {
  const found = await findAnyFileAbs(mockWf, 's', '')
  assert.deepEqual(found, { absolutePath: '/home/ws/README.md', relativePath: 'README.md' })
  // list 一个文件报 not-directory ⇒ 找不到（返回 null 而不是抛）
  assert.equal(await findAnyFileAbs(mockWf, 's', 'README.md'), null)
})
