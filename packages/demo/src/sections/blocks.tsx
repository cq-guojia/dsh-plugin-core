import { createElement as h, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import {
  openFilePreview,
  pickWorkspaceAnchor,
  pickWorkspaceFile,
  type OfficeToPdfFace,
  type WorkspaceFilesFace,
} from '../../../../dist/explorer/index.js'
import { workspaceList } from '../../../../dist/ui/index.js'
import { SessionPreview } from '../../../../dist/session/index.js'
import { Button } from '../../../../dist/ui/index.js'
import { Example, CodeOnly, DocProse, DocApi } from '../doc.js'
import { pageRow } from '../layout-mount.js'
import { fileServices } from '../host-files.js'
import { findSamples, type SampleSet } from '../samples.js'
import { t } from '../i18n.js'

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

const CODE_SESSION = `import { SessionPreview } from 'dsh-plugin-core/session'

h(SessionPreview, {
  sessionId,
  source: { listMessages, download }, // 从 ctx 取出后注入（host 能力）
  variant: 'modal',
  onClose: () => setOpen(false),
})`

const CODE_BLOCKS_USAGE = `pnpm add dsh-plugin-core

import { openFilePreview, pickWorkspaceFile } from 'dsh-plugin-core/explorer'
import { SessionPreview } from 'dsh-plugin-core/session'`

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
  const sampleLabel = (normal: string): string => (phase === 'missing' ? t('samplesNotFound') : t(normal))
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
  const source = {
    listMessages: async () =>
      [{ id: '1', role: 'user' as const, text: '帮我把这个任务设个提醒' },
       { id: '2', role: 'assistant' as const, text: '已为你创建每日 09:30 的提醒。' }],
    download: async () => new TextEncoder().encode('（示例附件内容）'),
  }
  return h(
    'div',
    { style: { display: 'flex', gap: '12px', alignItems: 'center' } },
    h(Button, { variant: 'primary', onClick: () => setOpen(true) }, t('sessionOpenModal')),
    h(Button, { variant: 'ghost', onClick: () => setOpen(false) }, t('sessionClose')),
    open ? h(SessionPreview, {
      sessionId: 'demo-session',
      source,
      variant: 'modal',
      onClose: () => setOpen(false),
    }) : null,
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
      { title: 'SessionPreview', hint: t('sessionHint'), code: CODE_SESSION },
      h(SessionPreviewDemo, null),
    ),
    h(DocApi, { id: 'session' }),
  )
}
