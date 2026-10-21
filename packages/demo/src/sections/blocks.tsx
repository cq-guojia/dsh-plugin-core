import { createElement as h, useState } from 'react'
import {
  openFilePreview,
  pickWorkspaceFile,
  type WorkspaceFilesFace,
} from '../../../../dist/explorer/index.js'
import { SessionPreview } from '../../../../dist/session/index.js'
import { Button } from '../../../../dist/ui/index.js'
import { Example, CodeOnly, DocProse, DocApi } from '../doc.js'
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

const r = await pickWorkspaceFile({ workspaceFiles, sessionId, anchor: btn, filter: { exts: ['ts'] } })
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

const SAMPLES = ['docs/sample.md', 'docs/sample.html', 'docs/sample.js', 'docs/sample.css']

/** demo 数据：把 SAMPLES 包成一个假的 WorkspaceFilesFace，让示例不依赖真实宿主。 */
class ExplorerDataHarness implements WorkspaceFilesFace {
  constructor(private readonly prefix: string) {}
  async read(_sessionId: string, path: string): Promise<{
    offset: number; text: string; lines: number; eof: boolean; absolutePath?: string; version?: number | string; bytes?: number
  }> {
    return { offset: 0, text: `# ${path}\n\n这是示例文件内容，不是真实宿主数据。`, lines: 3, eof: true }
  }
  async readBytes(_sessionId: string, path: string): Promise<{
    offset: number; data: Uint8Array; eof: boolean; bytes?: number
  }> {
    const text = await this.read(_sessionId, path).then((r) => r.text)
    return { offset: 0, data: new TextEncoder().encode(text), eof: true }
  }
  async list(_sessionId: string, _path: string): Promise<{
    path: string; entries: ReadonlyArray<{ name: string; type: 'file' | 'directory' | 'other'; size?: number }>; truncated: boolean
  }> {
    return {
      path: this.prefix + SAMPLES[0],
      entries: SAMPLES.map((name) => ({ name, type: 'file' as const })),
      truncated: false,
    }
  }
}

function MethodADemo(): ReturnType<typeof h> {
  const [dock, setDock] = useState<HTMLElement | null>(null)
  const [path, setPath] = useState<string | null>(null)
  return h(
    'div',
    null,
    h('div', { ref: setDock, style: { display: 'flex', minWidth: 0 } },
      h('div', { style: { flex: '1 1 auto', minWidth: 0 } },
        h(Button, {
          variant: 'primary',
          onClick: () => {
            const root = '我的项目'
            openFilePreview({
              mount: dock!,
              workspaceFiles: new ExplorerDataHarness(root + '/'),
              sessionId: 'demo-session',
              path: SAMPLES[0],
              rootName: root,
            })
            setPath(SAMPLES[0])
          },
        }, t('openRootPreview')),
      ),
    ),
    h('div', { style: { fontSize: '12px', color: 'var(--dshpc-fg-4)', marginTop: '8px' } },
      path === null ? t('explorerFilesNone') : t('explorerSessionLabel') + path),
  )
}

function MethodBDemo(): ReturnType<typeof h> {
  const [btn, setBtn] = useState<HTMLButtonElement | null>(null)
  const [picked, setPicked] = useState<string | null>(null)
  return h(
    'div',
    { style: { display: 'flex', gap: '12px', alignItems: 'center' } },
    h(Button, {
      variant: 'secondary', ref: setBtn,
      onClick: async () => {
        const r = await pickWorkspaceFile({
          workspaceFiles: new ExplorerDataHarness('我的项目/'),
          sessionId: 'demo-session',
          anchor: btn ?? document.body,
          filter: { exts: ['ts'] },
        })
        setPicked(r!.path + (r!.isDir ? '/' : ''))
      },
    }, t('pickFolder')),
    h('code', { style: { fontFamily: 'var(--dshpc-font-mono)', fontSize: '12px' } },
      picked === null ? t('pickNone') : t('pickResult') + picked),
  )
}

function PreviewBodyDemo(): ReturnType<typeof h> {
  const [dock, setDock] = useState<HTMLElement | null>(null)
  return h(
    'div',
    null,
    h('div', { ref: setDock, style: { display: 'flex', minWidth: 0 } },
      h('div', { style: { flex: '1 1 auto', minWidth: 0 } },
        h(Button, {
          variant: 'primary',
          onClick: () => openFilePreview({
            mount: dock!,
            workspaceFiles: new ExplorerDataHarness('我的项目/'),
            sessionId: 'demo-session',
            path: SAMPLES[0],
            rootName: '我的项目',
          }),
        }, t('openSamplesDir')),
      ),
    ),
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
      { title: t('explorerDataTitle'), hint: t('explorerDataHint') },
      h(MethodADemo, null),
    ),
    h(
      Example,
      { title: t('methodATitle'), hint: t('methodAHint'), code: CODE_OPEN },
      h(MethodADemo, null),
    ),
    h(
      Example,
      { title: t('methodBTitle'), hint: t('methodBHint'), code: CODE_PICK },
      h(MethodBDemo, null),
    ),
    h(
      Example,
      { title: t('previewBodyTitle'), hint: t('previewBodyHint') },
      h(PreviewBodyDemo, null),
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
