import test from 'node:test'
import assert from 'node:assert/strict'
import { crumbsOf, extOf, joinPath, mimeOf, parentOf } from '../dist/utils/index.js'
// 只引纯逻辑层：面板/预览体静态 import 官方 primitives（Node 下不可解析，那是宿主平台模块）
import {
  absolutizeDir,
  anchorSessionForTitle,
  bareCode,
  baseNameOfPath,
  createRequestGate,
  createRootCache,
  crumbsOfDir,
  dirnameOf,
  errView,
  findAnyFileAbs,
  isAborted,
  learnRoot,
  listPathOf,
  matchesFilter,
  pickWorkspaceAnchor,
  previewInfoOf,
  previewKindOf,
  relativizeToRoot,
  sortEntries,
  workspaceAnchorForPath,
} from '../dist/explorer/types.js'

test('createRequestGate：latest-wins（旧 token 作废且 signal 中止）', () => {
  const gate = createRequestGate()
  const first = gate.begin()
  assert.equal(first.current(), true)
  const second = gate.begin()
  assert.equal(first.current(), false)
  assert.equal(first.signal.aborted, true)
  assert.equal(second.current(), true)
  gate.abort()
  assert.equal(second.current(), false)
  assert.equal(second.signal.aborted, true)
})

test('isAborted：主动取消静默，真错误不吞', () => {
  const gate = createRequestGate()
  const token = gate.begin()
  gate.abort()
  assert.equal(isAborted(token.signal), true)
  assert.equal(isAborted(undefined, { name: 'AbortError' }), true)
  assert.equal(isAborted(undefined, new Error('boom')), false)
})

test('findAnyFileAbs：signal 已取消 ⇒ 一个请求都不发', async () => {
  const gate = createRequestGate()
  const token = gate.begin()
  gate.abort()
  let calls = 0
  const files = {
    list: async () => {
      calls += 1
      return { path: '', entries: [{ name: 'a.txt', type: 'file' }], truncated: false }
    },
    stat: async () => ({ absolutePath: '/root/a.txt' }),
  }
  assert.equal(await findAnyFileAbs(files, 's', '', token.signal), null)
  assert.equal(calls, 0)
})

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
  assert.equal(errView({ code: 'not-directory' }).key, 'previewNotDirectory')
  assert.equal(errView({ code: 'too-large' }).key, 'previewTooLarge')
  assert.equal(errView({ code: 'not-text' }).key, 'previewNotText')
  assert.equal(errView({ code: 'service-unavailable' }).key, 'previewOfficeUnavailable')
  // 未映射的 code ⇒ 通用失败 + **把机器码带出来**（写死「加载失败」会让消费方永远查不出是谁的锅）
  assert.equal(errView({ code: 'workspace-file/whatever' }).key, 'previewFailedCode')
  assert.equal(errView({ code: 'workspace-file/whatever' }).params.code, 'whatever')
  assert.equal(errView(new Error('boom')).key, 'previewFailedCode')
  assert.equal(errView(undefined).key, 'previewFailedCode')
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

test('workspaceAnchorForPath 最长前缀匹配 + 最近会话', () => {
  const items = [
    { title: 'root', path: '/workspace', sessionIds: ['s-root-1', 's-root-2'] },
    { title: 'A', path: '/workspace/A/', sessionIds: ['s-a-1', 's-a-2'] },
    { title: 'B', path: '/workspace/B', sessionIds: [] },
  ]
  // 最长前缀赢（尾斜杠归一）
  assert.deepEqual(workspaceAnchorForPath('/workspace/A/x/y.md', items), { title: 'A', sessionId: 's-a-2' })
  // 落到根工作区
  assert.deepEqual(workspaceAnchorForPath('/workspace/Temp/2026Q4/f.md', items), { title: 'root', sessionId: 's-root-2' })
  // 等于工作区根本身
  assert.deepEqual(workspaceAnchorForPath('/workspace', items), { title: 'root', sessionId: 's-root-2' })
  // 前缀相似但不等于目录边界（/workspace-other 不是 /workspace 的子孙）
  assert.equal(workspaceAnchorForPath('/workspace-other/f.md', items), null)
  // 相对路径不匹配（调用方传相对路径时按 props.sessionId 语义解析，不抢）
  assert.equal(workspaceAnchorForPath('Temp/f.md', items), null)
  // 命中工作区没有会话 ⇒ null
  assert.equal(workspaceAnchorForPath('/workspace/B/x', items), null)
  // 无 path 字段 ⇒ 不参与匹配
  assert.equal(workspaceAnchorForPath('/workspace/A/x', [{ title: 'A', sessionIds: ['s'] }]), null)
  // 空清单
  assert.equal(workspaceAnchorForPath('/workspace/A/x', []), null)
})

test('anchorSessionForTitle 按 title 取最近会话', () => {
  const items = [
    { title: 'A', path: '/workspace/A', sessionIds: ['s-a-1', 's-a-2'] },
    { title: 'B', path: '/workspace/B' },
    { title: 'C', path: '/workspace/C', sessionIds: [] },
  ]
  // 追加序末位 = 最近
  assert.equal(anchorSessionForTitle(items, 'A'), 's-a-2')
  // 没有 sessionIds 字段 / 空数组 ⇒ null
  assert.equal(anchorSessionForTitle(items, 'B'), null)
  assert.equal(anchorSessionForTitle(items, 'C'), null)
  // 空 title / 查无此 title ⇒ null
  assert.equal(anchorSessionForTitle(items, ''), null)
  assert.equal(anchorSessionForTitle(items, 'Z'), null)
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

test('pickWorkspaceAnchor 取「最近更新且有会话」的工作区', () => {
  assert.equal(pickWorkspaceAnchor([]), null)
  // 没有会话 / 没 sessionIds ⇒ 不能做浏览锚点（list/read 都要 sessionId）
  assert.equal(pickWorkspaceAnchor([{ title: 'ws', updatedAt: 9 }]), null)
  assert.equal(pickWorkspaceAnchor([{ title: 'ws', sessionIds: [] }]), null)
  // 取最后一个 sessionId（追加序 == 最近一个会话）
  assert.deepEqual(pickWorkspaceAnchor([{ title: 'ws', sessionIds: ['a', 'b'] }]), { title: 'ws', sessionId: 'b' })
  // updatedAt 大者胜；时间戳相同时保留靠前的那个（不抖动）
  assert.deepEqual(
    pickWorkspaceAnchor([
      { title: 'old', sessionIds: ['a'], updatedAt: 100 },
      { title: 'new', sessionIds: ['z'], updatedAt: 200 },
    ]),
    { title: 'new', sessionId: 'z' },
  )
  assert.deepEqual(
    pickWorkspaceAnchor([
      { title: 'first', sessionIds: ['a'] },
      { title: 'second', sessionIds: ['b'] },
    ]),
    { title: 'first', sessionId: 'a' },
  )
  // 缺 timestamps 的工作区不会赢过有 timestamps 的
  assert.deepEqual(
    pickWorkspaceAnchor([
      { title: 'no-time', sessionIds: ['a'] },
      { title: 'has-time', sessionIds: ['b'], updatedAt: 1 },
    ]),
    { title: 'has-time', sessionId: 'b' },
  )
})
// 2026-10-22 真机：重复打开预览时直接 `remove()` 挂载体，会连 React 根的卸载清理一起跳过 ——
// PanelDock 回收不了它发布的占宽，遮罩从此永久停在让位状态。关掉只走 close（卸载根再摘容器）。
test('关预览走 close（卸载 React 根），不直接移除挂载体', async () => {
  const { readFile } = await import('node:fs/promises')
  const src = await readFile(new URL('../dist/explorer/open.js', import.meta.url), 'utf8')
  assert.ok(src.includes('root.unmount()'), 'close 没有卸载 React 根')
  assert.ok(!/previous\.remove\(\)/.test(src), '又回到直接 remove 挂载体的老路（卸载清理会被跳过）')
})

// 2026-10-28 用户两条硬要求：① 侧栏已展开时点别的文件只是换内容，不许重播展开动效；
// ② 用户自己拖好的宽度不许被重置。机制 = 再打开时复用同一份 DOM/React 根，只重画内容。
test('再打开预览复用旧根：只重画内容、宽度先钉住', async () => {
  const { readFile } = await import('node:fs/promises')
  const src = await readFile(new URL('../dist/explorer/open.js', import.meta.url), 'utf8')
  assert.ok(src.includes('activePreview.draw(opts)'), '复用分支没有重画内容')
  assert.ok(src.includes('activePreview.keepWidth()'), '换内容前没钉住用户拖好的宽度')
  assert.ok(!src.includes('activePreview?.close()'), '又变回「重开就先关旧的」（动效会重播、宽度会重置）')
  // 收起来过就得自动弹回来，否则换文件「看不见任何变化」（2026-10-28 真机）。
  assert.ok(src.includes('dock.expand('), '收起的预览换内容时没自动展开')
  // 2026-10-31：序号改走 revision prop —— 同路径再点一次仍要回到该文件，但**不许整棵重挂**
  // （重挂会丢目录树/滚动位置、多打一次 list；连点时中间点击会落在空树上）。
  assert.ok(src.includes('++openSeq'), '没有每次打开递增的重开令牌')
  assert.ok(src.includes('revision'), '重开令牌没传进内层（同路径再点不会重读）')
  assert.ok(!/#\$\{\+\+openSeq\}/.test(src), '内层又按序号整棵重挂（目录树/滚动位置会丢）')
  const fb = await readFile(new URL('../dist/explorer/FileBrowser.js', import.meta.url), 'utf8')
  assert.ok(fb.includes('revision'), 'FileBrowser 初始 effect 没接 revision')
})

// 2026-10-28 真机：消费方传工作区内的绝对路径打开时，根还没反推出来的那一帧会按段铺出
// `root/.local/share/…` 十几段工作区之外的层级（点不动也没信息量），根一学成又缩回 ⇒ 闪一下。
test('根未反推时不铺绝对路径层级，且溢出测量跟着根学成重算', async () => {
  const { readFile } = await import('node:fs/promises')
  const src = await readFile(new URL('../dist/explorer/FileBrowser.js', import.meta.url), 'utf8')
  assert.ok(src.includes('rootPending'), '缺「根未学成」占位分支 —— 绝对路径会被逐段铺开')
  // 测量依赖缺 rootNonce/outside ⇒ 面包屑变短后不重算，折叠态卡在首帧只显示末段。
  assert.ok(src.includes('rootNonce, outside'), '溢出测量没跟着根反推 / 越界态重算')
})
