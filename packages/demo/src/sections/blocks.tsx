import { createElement as h, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import { IconArchiveOutlineRegular } from '@deepseek-ai/dsh-client-ui-primitives'
import {
  openFilePreview,
  pickWorkspaceAnchor,
  pickWorkspaceFile,
  type OfficeToPdfFace,
  type WorkspaceFilesFace,
} from '../../../../dist/explorer/index.js'
import { workspaceList } from '../../../../dist/ui/index.js'
import { Chip } from '../../../../dist/ui/index.js'
import { SessionViewModal } from '../../../../dist/session/index.js'
import { formatDateTime } from '../../../../dist/utils/index.js'
import { Button } from '../../../../dist/ui/index.js'
import { mockSessionView } from '../mock-session.js'
import { openRealSessionView, realForkSession, realOpenHostSession, realSessions } from '../real-sessions.js'
import { Example, CodeOnly, DocProse, DocApi } from '../doc.js'
import { pageRow } from '../layout-mount.js'
import { fileServices } from '../host-files.js'
import { findSamples, type SampleSet } from '../samples.js'
import { t, type DemoMessageKey } from '../i18n.js'

const CODE_OPEN = `// 右侧分栏预览（占宽度、挤窄主区；不是浮层）
import { openFilePreview } from 'dsh-plugin-core/explorer'

openFilePreview({
  mount,                 // 你页面里那一层 flex 行，不要传 document.body 再自己套 fixed
  workspaceFiles,        // 从 ctx 取出后注入（host 能力）
  sessionId,             // 会话作用域
  path: p,
  rootName: '我的项目',
})`

const CODE_PICK = `// 锚定按钮旁弹模态选文件（Promise 返回工作区相对路径，不自己挂 dock）
import { pickWorkspaceFile } from 'dsh-plugin-core/explorer'

const r = await pickWorkspaceFile({ workspaceFiles, sessionId, anchor: btn, filter: { exts: ['js', 'md'] } })
// r = { path, isDir }`

const CODE_SESSION_REAL = `// 真实宿主：sessions.list 快照（冷安全，不激活 Agent）→ 点开真预览
// 服务来自 package.json dsh.client.inject 的三个官方包：
//   dsh-api-session-controller（sessions）/ dsh-client-ui-conversation（uiConversation）
//   / dsh-client-ui-workspace（uiWorkspace）
import { useSyncExternalStore } from 'react'
import { openSessionView, SessionViewModal } from 'dsh-plugin-core/session'

const state = useSyncExternalStore(realSessions.subscribe, realSessions.getSnapshot)
// state.rows：宿主 sessions.list 的 displayTitle / updatedAt / running（按活动降序前 20）

const view = openRealSessionView(row.sessionId)   // retain → binding → target('chat')
h(SessionViewModal, {
  sessionId: row.sessionId,
  view,
  onClose: () => { view.dispose(); setOpenId(null) },
  forkSession: (id, atSeq) => sessions.fork({ sessionId: id, increaseTitle: true, atSeq }),
  openHostSession: (id) => uiWorkspace.openSession(id),
  onOpenFile: (path) => openFilePreview(path),
})`

const CODE_SESSION = `import { openSessionView, SessionViewModal } from 'dsh-plugin-core/session'

// 数据链：retain 物化 → binding → open 拉尾页 → target('chat')（归档会话同样可读）
const view = openSessionView(sessions, uiConversation, sessionId, 'my-plugin')
if (view !== null) {
  h(SessionViewModal, {
    sessionId,
    view,
    heading: '镜像升级日报',
    onClose: () => { view.dispose(); setOpen(false) },
    // 续聊正道：fork 开分支 → 跳官方会话区（底层 keyed 数组只读，框内不能打字）
    forkSession: (id, atSeq) => sessions.fork({ sessionId: id, increaseTitle: true, atSeq }),
    openHostSession: (id) => uiWorkspace.openSession(id),
    // 暂存输入框：确定后由调用方 fork + host 侧 agent.send 起轮次 + 跳转
    onContinue: async (message) => { /* fork → host send → openSession */ },
    onOpenFile: (path) => openFilePreview(path),
  })
}`

const CODE_BLOCKS_USAGE = `pnpm add dsh-plugin-core

import { openFilePreview, pickWorkspaceFile } from 'dsh-plugin-core/explorer'
import { openSessionView, SessionViewModal } from 'dsh-plugin-core/session'`

/** 真实数据面：remote.workspaceFiles + 官方 workspaces 快照 + 真会话锚点。
 *  服务/会话缺席即如实说「未就位」，绝不造假数据顶替（与原页口径一致）。 */
function useExplorerHost(): {
  workspaceFiles: WorkspaceFilesFace | null
  officeToPdf: OfficeToPdfFace | null
  anchor: { title: string; sessionId: string } | null
  workspaceNames: readonly string[]
} {
  const { workspaceFiles, officeToPdf } = useSyncExternalStore(fileServices.subscribe, fileServices.getSnapshot)
  const wsItems = useSyncExternalStore(workspaceList.subscribe, workspaceList.getSnapshot)
  const anchor = pickWorkspaceAnchor(wsItems)
  return { workspaceFiles, officeToPdf, anchor, workspaceNames: wsItems.map((w) => w.title) }
}

/** 未就位提示（真实缺席，不造假）。 */
function NotReady(props: { which: 'files' | 'anchor' }): ReturnType<typeof h> {
  return h('div', { style: { fontSize: '13px', color: 'var(--dshpc-fg-3)' } },
    t(props.which === 'files' ? 'explorerFilesNone' : 'explorerAnchorNone'))
}

/** 第一组：打开即预览（停靠右侧、挤窄主区）。打开工作区 / 打开文件夹 / 打开文件。 */
function OpenPreviewDemo(): ReturnType<typeof h> {
  const { workspaceFiles, anchor, workspaceNames } = useExplorerHost()
  const [samples, setSamples] = useState<SampleSet | null>(null)
  // idle → probing → found / missing。**「正在找」绝不能显示成「没找到」**：
  // 旧实现点一下就把按钮文案切成「没找到样例目录」，BFS 完了才切回来，
  // 用户看到的就是每次点预览都先闪一句假的失败（真机 2026-10-22）。
  const [phase, setPhase] = useState<'idle' | 'probing' | 'found' | 'missing'>('idle')
  const [last, setLast] = useState<string | null>(null)
  const pending = useRef<Promise<SampleSet | null> | null>(null)
  const sessionId = anchor === null ? null : anchor.sessionId

  // 进页面就开始有界探索，不等用户点按钮（待点时早就好了 ⇒ 不会再有文案跳变）。
  useEffect(() => {
    if (workspaceFiles === null || sessionId === null) return
    if (pending.current !== null) return
    setPhase('probing')
    pending.current = findSamples(workspaceFiles, sessionId).then((s) => {
      setSamples(s)
      setPhase(s === null ? 'missing' : 'found')
      return s
    })
  }, [workspaceFiles, sessionId])

  if (workspaceFiles === null) return h(NotReady, { which: 'files' })
  if (anchor === null) return h(NotReady, { which: 'anchor' })

  const open = (path: string, rootName: string, workspaces?: readonly string[]): void => {
    const mount = pageRow.element
    if (mount === null) {
      console.warn('[demo] pageRow 未就绪，无法停靠预览')
      return
    }
    openFilePreview({ mount, workspaceFiles, sessionId: anchor.sessionId, path, rootName, workspaces })
    setLast(path === '' ? `${rootName}（根）` : path)
  }
  // 只在**确认没有**时才改文案；还在找就保持正常按钮文案（点了会等同一个 Promise）。
  const sampleLabel = (normal: DemoMessageKey): string => (phase === 'missing' ? t('samplesNotFound') : t(normal))
  const openSamples = (pick: (s: SampleSet) => string): void => {
    void (pending.current ?? Promise.resolve(samples)).then((s) => {
      if (s !== null) open(pick(s), anchor.title)
    })
  }

  return h(
    'div',
    { style: { display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' } },
    h(Button, { variant: 'primary', onClick: () => open('', anchor.title, workspaceNames) }, t('openRootPreview')),
    h(Button, { variant: 'secondary', onClick: () => openSamples((s) => s.dir) }, sampleLabel('openSamplesDir')),
    h(Button, { variant: 'ghost', onClick: () => openSamples((s) => s.js) }, sampleLabel('sampleJs')),
    last === null ? null : h('code', { style: { fontSize: '12px' } }, `已打开：${last}`),
    h('div', { style: { fontSize: '12px', color: 'var(--dshpc-fg-3)', width: '100%' } },
      `${t('explorerAnchorLabel')}${anchor.title} · ${t('explorerSessionLabel')}${anchor.sessionId} · ${t('explorerWorkspaces')}${String(workspaceNames.length)}`),
  )
}

/** 第二组：选择文件。不限类型 / 仅 js+md。
 *
 *  ⚠️ 锚点**必须取点击事件的 currentTarget**：核心 `Button` 是普通函数组件，不吃 `ref`
 *  （早先这里写 `ref={setBtnAny}`，拿到的是 null ⇒ 回落到 `document.body` ⇒ 弹窗飞到整页右下角）。
 *  在同一个事件回调里同步取，才拿得到真正被点中的那个 DOM 节点。 */
function PickFileDemo(): ReturnType<typeof h> {
  const { workspaceFiles, anchor } = useExplorerHost()
  const [picked, setPicked] = useState<string | null>(null)

  if (workspaceFiles === null) return h(NotReady, { which: 'files' })
  if (anchor === null) return h(NotReady, { which: 'anchor' })

  const pick = (anchorBtn: HTMLElement, filter?: { exts: string[] }): void => {
    void pickWorkspaceFile({
      workspaceFiles,
      sessionId: anchor.sessionId,
      anchor: anchorBtn,
      rootName: anchor.title,
      filter,
    }).then((r) => setPicked(r === null ? null : r.path + (r.isDir ? '/' : '')))
  }
  return h(
    'div',
    { style: { display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' } },
    h(
      Button,
      {
        variant: 'primary',
        onClick: (event: { currentTarget: EventTarget | null }) => pick(event.currentTarget as HTMLElement),
      },
      t('pickAny'),
    ),
    h(
      Button,
      {
        variant: 'secondary',
        onClick: (event: { currentTarget: EventTarget | null }) => pick(event.currentTarget as HTMLElement, { exts: ['js', 'md'] }),
      },
      '仅 JS/MD',
    ),
    h('code', { style: { fontSize: '12px' } }, picked === null ? t('pickNone') : `${t('pickResult')}${picked}`),
  )
}

function SessionPreviewDemo(): ReturnType<typeof h> {
  const [open, setOpen] = useState(false)
  const [note, setNote] = useState<string | null>(null)
  // 预览站离线演示：假 ChatSnapshot 驱动镜像渲染（真数据链只在宿主里活着）。
  const view = useMemo(() => mockSessionView(), [])
  return h(
    'div',
    { style: { display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' } },
    h(Button, { variant: 'primary', onClick: () => setOpen(true) }, t('sessionOpenModal')),
    h(Button, { variant: 'ghost', onClick: () => setOpen(false) }, t('sessionClose')),
    note === null ? null : h('code', { style: { fontSize: '12px' } }, note),
    open ? h(SessionViewModal, {
      sessionId: 'demo-session',
      view,
      heading: '镜像升级日报',
      onClose: () => setOpen(false),
      // 宿主服务在预览站里缺席 ⇒ 三个续聊 / 文件出口都是本地回声（演示交互，不真跳转）。
      forkSession: async () => { setNote(`${t('sessionForked')} demo-session(1)`); return 'demo-session(1)' },
      openHostSession: (id) => { setNote(`${t('sessionOpenedHost')} ${id}`) },
      onContinue: async (message) => { setNote(`${t('sessionContinued')} ${message}`) },
      onOpenFile: (path) => { setNote(`${t('sessionOpenedFile')} ${path}`) },
    }) : null,
  )
}

/** 真实会话列表演示：宿主 `sessions.list` 快照（冷安全，不激活 Agent）→ 点开真预览。 */
function RealSessionListDemo(): ReturnType<typeof h> {
  const state = useSyncExternalStore(realSessions.subscribe, realSessions.getSnapshot)
  const [openId, setOpenId] = useState<string | null>(null)
  const [note, setNote] = useState<string | null>(null)
  const view = useMemo(() => (openId === null ? null : openRealSessionView(openId)), [openId])
  if (state.status !== 'ready') {
    return h('p', { style: { fontSize: '13px', opacity: .8 } }, t('sessionListUnavailable'))
  }
  if (state.rows.length === 0) {
    return h('p', { style: { fontSize: '13px', opacity: .8 } }, t('sessionListEmpty'))
  }
  return h(
    'div',
    { style: { display: 'flex', flexDirection: 'column', gap: '6px', maxWidth: '720px' } },
    ...state.rows.map((row) =>
      h('button', {
        key: row.sessionId,
        type: 'button',
        onClick: () => { setOpenId(row.sessionId) },
        style: {
          display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 10px',
          border: '1px solid var(--dshpc-border-faint)', borderRadius: '8px',
          background: 'var(--dshpc-surface-2)', color: 'var(--dshpc-fg)',
          font: 'inherit', fontSize: '13px', textAlign: 'left', cursor: 'pointer',
        },
      },
        h('span', { style: { flex: '1', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } }, row.displayTitle),
        row.running ? h(Chip, { size: 'xs', tone: 'warning' }, t('sessionListRunning')) : null,
        row.archived
          ? h(Chip, { size: 'xs' },
              h('span', { style: { display: 'inline-flex', alignItems: 'center', gap: '4px' } },
                h(IconArchiveOutlineRegular, { size: 12 }),
                t('sessionListArchived'),
              ),
            )
          : null,
        h('span', { style: { flex: 'none', fontSize: '12px', color: 'var(--dshpc-fg-3)' } }, formatDateTime(new Date(row.updatedAt).toISOString())),
      ),
    ),
    openId !== null && view !== null
      ? h(SessionViewModal, {
          sessionId: openId,
          view,
          // 标题 = 会话自己的标题；归档态分化「继续对话」行为（开分支确认 vs 直跳官方）。
          heading: state.rows.find((row) => row.sessionId === openId)?.displayTitle,
          archived: state.rows.find((row) => row.sessionId === openId)?.archived,
          onClose: () => { view.dispose(); setOpenId(null) },
          // 真宿主服务：fork 与跳转都是官方口子（预览弹窗里不可打字续聊，走开分支）。
          forkSession: (id, atSeq) => {
            const p = realForkSession(id, atSeq)
            return p ?? Promise.reject(new Error('sessions.fork 未就位'))
          },
          openHostSession: (id) => { realOpenHostSession(id) },
          onOpenFile: (path) => { setNote(`${t('sessionOpenedFile')} ${path}`) },
        })
      : null,
  )
}

export function ExplorerPage(): ReturnType<typeof h> {
  return h(
    'div',
    null,
    h(DocProse, { id: 'explorer' }),
    h(
      Example,
      { title: t('methodATitle'), hint: t('methodAHint'), code: CODE_OPEN },
      h(OpenPreviewDemo, null),
    ),
    h(
      Example,
      { title: t('methodBTitle'), hint: t('methodBHint'), code: CODE_PICK },
      h(PickFileDemo, null),
    ),
    h(CodeOnly, { labelKey: 'docUsage', code: CODE_BLOCKS_USAGE }),
    h(DocApi, { id: 'explorer' }),
  )
}

export function SessionPage(): ReturnType<typeof h> {
  return h(
    'div',
    null,
    h(DocProse, { id: 'session' }),
    h(
      Example,
      { title: '真实会话列表', hint: t('sessionRealHint'), code: CODE_SESSION_REAL },
      h(RealSessionListDemo, null),
    ),
    h(
      Example,
      { title: 'SessionViewModal（离线假数据）', hint: t('sessionHint'), code: CODE_SESSION },
      h(SessionPreviewDemo, null),
    ),
    h(DocApi, { id: 'session' }),
  )
}
