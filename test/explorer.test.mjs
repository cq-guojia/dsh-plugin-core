import test from 'node:test'
import assert from 'node:assert/strict'
import { crumbsOf, extOf, joinPath, mimeOf, parentOf } from '../dist/utils/index.js'
// 只引纯逻辑层：面板/预览体静态 import 官方 primitives（Node 下不可解析，那是宿主平台模块）
import {
  anchorSessionForTitle,
  bareCode,
  baseNameOfPath,
  createRequestGate,
  crumbsOfDir,
  dirnameOf,
  errView,
  isAborted,
  listPathOf,
  matchesFilter,
  normalizePath,
  relativizeToDir,
  pickWorkspaceAnchor,
  previewInfoOf,
  previewKindOf,
  sortEntries,
  workspaceAnchorForPath,
  workspaceOfPath,
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
  // not-regular-file（read 到目录/设备）与 not-directory（list 到文件）是两个码、两句文案；
  // 曾共用「不是文件夹」——/bin 符号链接事故里用户看到的就是这句反话（2026-11-03）。
  assert.equal(errView({ code: 'not-regular-file' }).key, 'previewNotFile')
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
  assert.ok(src.includes('activePreview.draw(opts'), '复用分支没有重画内容')
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

// 2026-11-03：单根树（工作区节点 + 真实根）。归属与相对化都是纯函数 —— 组件文件
// 静态 import 官方 primitives，Node 下引不了，逻辑只能长在这里。
test('normalizePath：斜杠归一 / 盘符大写 / 裸盘符补斜杠', () => {
  assert.equal(normalizePath('D:\\proj\\a.ts'), 'D:/proj/a.ts')
  assert.equal(normalizePath('d:/proj/'), 'D:/proj')
  assert.equal(normalizePath('D:'), 'D:/')
  assert.equal(normalizePath('/home/ws/'), '/home/ws')
  assert.equal(normalizePath('docs'), 'docs')
})

test('workspaceOfPath：最长前缀归属，不看会话', () => {
  const items = [
    { title: 'outer', path: '/home/ws', sessionIds: [] },
    { title: 'inner', path: '/home/ws/sub', sessionIds: [] },
    { title: 'other', path: 'D:/proj', sessionIds: [] },
  ]
  assert.equal(workspaceOfPath('/home/ws/sub/a.ts', items)?.title, 'inner')
  assert.equal(workspaceOfPath('/home/ws/docs/a.ts', items)?.title, 'outer')
  // 只是名字前缀、不是真前缀 ⇒ 不算
  assert.equal(workspaceOfPath('/home/wsx/a.ts', items), null)
  assert.equal(workspaceOfPath('/etc/passwd', items), null)
  // 相对路径不猜
  assert.equal(workspaceOfPath('src/a.ts', items), null)
  // 工作区根本身也算「在里面」
  assert.equal(workspaceOfPath('/home/ws', items)?.title, 'outer')
})

test('relativizeToDir：根下剥回相对，根外原样', () => {
  assert.equal(relativizeToDir('/home/ws/docs/a.md', '/home/ws'), 'docs/a.md')
  assert.equal(relativizeToDir('/home/ws', '/home/ws'), '')
  assert.equal(relativizeToDir('/home/wsx/a', '/home/ws'), '/home/wsx/a')
  assert.equal(relativizeToDir('/etc/x', null), '/etc/x')
})

test('crumbsOfDir：绝对路径保留前导 /，Windows 盘符单独成段', () => {
  assert.deepEqual(
    crumbsOfDir('/home/ws'),
    [{ label: 'home', path: '/home' }, { label: 'ws', path: '/home/ws' }],
  )
  assert.deepEqual(
    crumbsOfDir('D:/proj/src'),
    [{ label: 'D:', path: 'D:/' }, { label: 'proj', path: 'D:/proj' }, { label: 'src', path: 'D:/proj/src' }],
  )
  assert.deepEqual(crumbsOfDir('docs'), [{ label: 'docs', path: 'docs' }])
})

// 用户 2026-11-03：**UI 一律不动**，唯一变化是 ▾ 里根目录常驻第一行。
test('FileBrowser：▾ 有根目录条目；没有「反推工作区根」那套', async () => {
  const { readFile } = await import('node:fs/promises')
  const src = await readFile(new URL('../dist/explorer/FileBrowser.js', import.meta.url), 'utf8')
  assert.ok(src.includes('explorerRootDir'), '▾ 里没有根目录条目')
  assert.ok(src.includes('workspaceOfPath'), '没有工作区归属判定（面包屑根会错）')
  assert.ok(!src.includes('rootPending'), '又回到「反推工作区根」那套')
  assert.ok(!src.includes('rootCache'), '根缓存没删干净')
})

// 2026-11-03 真机两问：① 目录状态必须是绝对路径（存相对 ⇒ 子项拼出相对 ⇒ read 报 bad-request）；
// ② 面包屑只有落在基准工作区内才以工作区名作根，在工作区外才从真实根展开。
test('FileBrowser：目录状态存绝对路径，面包屑按基准判定', async () => {
  const { readFile } = await import('node:fs/promises')
  const src = await readFile(new URL('../dist/explorer/FileBrowser.js', import.meta.url), 'utf8')
  assert.ok(src.includes('setDir(absTarget)'), 'fetchDir 又把原始入参当目录状态（相对路径会让子项读不到）')
  assert.ok(src.includes('workspaceOfPath(dir'), '面包屑没按**当前目录**去匹配工作区（会一直用打开时的路径）')
})

// 2026-11-03：picker 什么都不传 ⇒ 主窗体先列「根目录 + 各工作区」，面包屑留空（只留 ▾ 箭头）。
test('FileBrowser 落地页：根目录 + 工作区清单，选完才进目录', async () => {
  const { readFile } = await import('node:fs/promises')
  const src = await readFile(new URL('../dist/explorer/FileBrowser.js', import.meta.url), 'utf8')
  assert.ok(src.includes('landing'), '没有落地页状态')
  // 落地页上点行 / 点 ▾ 选层都走 loadDir：它必须顺手退出落地页，否则主体还是落地页那张表（点了没反应）。
  const loadDirAt = src.indexOf('loadDir = ')
  assert.ok(loadDirAt > 0, '没有 loadDir（进入目录的唯一入口）')
  assert.ok(src.slice(loadDirAt, loadDirAt + 600).includes('setLanding(false)'), 'loadDir 没退出落地页（从落地页点选会没反应）')
  assert.ok(src.includes('explorerRootDir'), '落地页没有「根目录」那一行')
  assert.ok(src.includes('landingRef'), '落地页切换仍会重跑初始 effect（会被拉回第一个工作区）')
})

// 2026-11-03：根层不能写死成「根目录」—— Windows 没有根目录，根就是盘符清单（C:/、D:/…），
// 盘符可以当选择目标；POSIX 的 `/` 不是目标（选了等于没选）。
test('FileBrowser 根层：盘符由宿主给，POSIX 的根不给选', async () => {
  const { readFile } = await import('node:fs/promises')
  const src = await readFile(new URL('../dist/explorer/FileBrowser.js', import.meta.url), 'utf8')
  assert.ok(src.includes('props.files.roots'), '没向宿主要根清单（Windows 上就只剩一个假「根目录」）')
  // 根层条目（根目录 / 盘符）都是可选目标，不再有「这个根不可选」的分叉。
  assert.ok(!src.includes('pickable: false'), '根层还留着「不可选」的分叉')
  const face = await readFile(new URL('../dist/explorer/fs-face.js', import.meta.url), 'utf8')
  assert.ok(face.includes("op: 'roots'"), 'client 文件面没接宿主的 roots op')
})

// 2026-11-03：选择器里「当前看到的这一层」必须能选出去 —— ✕ 左边那枚按钮（预览文件 = 选文件，
// 否则选当前目录）；没有它，进了目录 / 打开文件之后就没有选中入口。
test('FileBrowser 选择器：头部有「选当前」按钮', async () => {
  const { readFile } = await import('node:fs/promises')
  const src = await readFile(new URL('../dist/explorer/FileBrowser.js', import.meta.url), 'utf8')
  assert.ok(src.includes('dshpc-fb__pick'), '头部没有「选当前」按钮（进入目录后选不了当前层）')
  const pickAt = src.indexOf('dshpc-fb__pick')
  const body = src.slice(pickAt, pickAt + 900)
  assert.ok(body.includes('toPicked'), '「选当前」没有回传绝对路径')
})

// 2026-11-03：选择结果展示只补一次尾斜杠（`/` + `/` 曾显示成 `//`，盘符会成 `C://`）。
test('demo 选择结果不重复补尾斜杠', async () => {
  const { readFile } = await import('node:fs/promises')
  const src = await readFile(new URL('../packages/demo/src/sections/blocks.tsx', import.meta.url), 'utf8')
  assert.ok(src.includes("!r.path.endsWith('/')"), '选择结果又无条件补斜杠（根 / 盘符会显示成两条斜杠）')
})
