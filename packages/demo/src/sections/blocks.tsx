import { createElement as h, useRef, useState } from 'react'
import { FileBrowser, openFilePreview, pickWorkspaceFile } from '../../../../dist/explorer/index.js'
import { SessionPreview } from '../../../../dist/session/index.js'
import { Button } from '../../../../dist/ui/index.js'
import { mockOfficeToPdf, mockSessionSource, mockWorkspaceFiles } from '../mock.js'
import { Demo } from './index.js'
import { t } from '../i18n.js'

const SESSION = 'demo-session'

/**
 * 工作区浏览。三个区块对应三种用法：
 *  ① FileBrowser 面板本体（嵌入调用方布局）；
 *  ② 方法 A openFilePreview：命令式打开右侧停靠预览；
 *  ③ 方法 B pickWorkspaceFile：锚定弹窗选文件，Promise 返回工作区相对路径。
 */
export function ExplorerPage(): ReturnType<typeof h> {
  const [picked, setPicked] = useState<string | null>(null)
  const pickAllRef = useRef<HTMLButtonElement>(null)
  const pickTsRef = useRef<HTMLButtonElement>(null)
  const pickDirRef = useRef<HTMLButtonElement>(null)

  const preview = (path: string): void => {
    openFilePreview({
      workspaceFiles: mockWorkspaceFiles,
      officeToPdf: mockOfficeToPdf,
      sessionId: SESSION,
      path,
      rootName: 'demo-workspace',
    })
  }

  return h(
    'div',
    null,
    h(
      Demo,
      { title: 'FileBrowser（面板本体）', hint: t('explorerHint') },
      h(
        'div',
        {
          style: {
            width: '720px', height: '420px', overflow: 'hidden',
            border: '1px solid var(--dshpc-border)', borderRadius: '8px',
          },
        },
        h(FileBrowser, {
          workspaceFiles: mockWorkspaceFiles,
          officeToPdf: mockOfficeToPdf,
          sessionId: SESSION,
          path: '',
          rootName: 'demo-workspace',
          workspaces: ['demo-workspace'],
        }),
      ),
    ),
    h(
      Demo,
      { title: t('methodATitle'), hint: t('methodAHint') },
      h(
        'div',
        { style: { display: 'flex', gap: '8px', flexWrap: 'wrap' } },
        h(Button, { variant: 'primary', onClick: () => preview('README.md') }, t('openFilePreview')),
        h(Button, { onClick: () => preview('docs') }, t('openDirPreview')),
        h(Button, { onClick: () => preview('docs/report.pdf') }, t('openPdfPreview')),
      ),
    ),
    h(
      Demo,
      { title: t('methodBTitle'), hint: t('methodBHint') },
      h(
        'div',
        { style: { display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' } },
        h(
          'button',
          {
            ref: pickAllRef,
            type: 'button',
            className: 'dshpc-btn dshpc-btn--outline dshpc-btn--lg',
            onClick: () => {
              void pickWorkspaceFile({
                workspaceFiles: mockWorkspaceFiles,
                officeToPdf: mockOfficeToPdf,
                sessionId: SESSION,
                anchor: pickAllRef.current,
                rootName: 'demo-workspace',
              }).then((r) => setPicked(r === null ? null : `${r.path}${r.isDir ? '（文件夹）' : ''}`))
            },
          },
          t('pickAny'),
        ),
        h(
          'button',
          {
            ref: pickTsRef,
            type: 'button',
            className: 'dshpc-btn dshpc-btn--outline dshpc-btn--lg',
            onClick: () => {
              void pickWorkspaceFile({
                workspaceFiles: mockWorkspaceFiles,
                officeToPdf: mockOfficeToPdf,
                sessionId: SESSION,
                anchor: pickTsRef.current,
                rootName: 'demo-workspace',
                filter: { exts: ['ts'] },
              }).then((r) => setPicked(r === null ? null : `${r.path}${r.isDir ? '（文件夹）' : ''}`))
            },
          },
          t('pickTs'),
        ),
        h(
          'button',
          {
            ref: pickDirRef,
            type: 'button',
            className: 'dshpc-btn dshpc-btn--outline dshpc-btn--lg',
            onClick: () => {
              void pickWorkspaceFile({
                workspaceFiles: mockWorkspaceFiles,
                officeToPdf: mockOfficeToPdf,
                sessionId: SESSION,
                anchor: pickDirRef.current,
                rootName: 'demo-workspace',
                filter: { dirs: true },
              }).then((r) => setPicked(r === null ? null : `${r.path}${r.isDir ? '（文件夹）' : ''}`))
            },
          },
          t('pickDir'),
        ),
        h('span', { style: { fontSize: '12px', color: 'var(--dshpc-fg-3)' } }, picked === null ? t('pickNone') : `${t('pickResult')}：${picked}`),
      ),
    ),
    h(
      Demo,
      { title: t('previewBodyTitle'), hint: t('previewBodyHint') },
      null,
    ),
  )
}

export function SessionPage(): ReturnType<typeof h> {
  const [open, setOpen] = useState(false)

  return h(
    Demo,
    { title: 'SessionPreview', hint: t('sessionHint') },
    h(
      'div',
      { style: { display: 'flex', gap: '12px', flexWrap: 'wrap' } },
      h(Button, { variant: 'primary', onClick: () => setOpen(true) }, '打开会话预览（modal）'),
      h(Button, { onClick: () => setOpen(false) }, '关闭'),
    ),
    open
      ? h(SessionPreview, {
          sessionId: 'demo-session',
          source: mockSessionSource,
          variant: 'modal',
          title: '会话预览（假数据）',
          onClose: () => setOpen(false),
          onOpenFile: () => setOpen(false),
        })
      : null,
  )
}
