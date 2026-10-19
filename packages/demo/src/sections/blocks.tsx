import { createElement as h, useState } from 'react'
import { ExplorerPanel } from '../../../../dist/explorer/index.js'
import { SessionPreview } from '../../../../dist/session/index.js'
import { Button } from '../../../../dist/ui/index.js'
import { mockSessionSource, mockWorkspaceFiles } from '../mock.js'
import { Demo } from './index.js'
import { t } from '../i18n.js'

/**
 * 工作区浏览。
 * ⚠️ 二级按「一个可看页」划：FilePreview 是 ExplorerPanel 的组成部分（ExplorerPanel.ts 里 import 并渲染它），
 * 在面板里点文件看到的就是它 —— 所以不另起一页，只在本页用一段说明交代它还能单独 import。
 */
export function ExplorerPage(): ReturnType<typeof h> {
  const [selected, setSelected] = useState<string | null>(null)

  return h(
    'div',
    null,
    h(
      Demo,
      { title: 'ExplorerPanel', hint: t('explorerHint') },
      h(
        'div',
        { style: { display: 'flex', gap: '16px', flexWrap: 'wrap' } },
        h(
          'div',
          {
            style: {
              width: '520px', height: '380px', overflow: 'hidden',
              border: '1px solid var(--dshpc-border)', borderRadius: '8px',
            },
          },
          h(ExplorerPanel, {
            workspaceFiles: mockWorkspaceFiles,
            sessionId: 'demo-session',
            path: '',
            onSelect: setSelected,
          }),
        ),
        h(
          'div',
          { style: { fontSize: '12px', color: 'var(--dshpc-fg-3)', alignSelf: 'center' } },
          selected === null ? '点左侧文件试试' : `已选中：${selected}`,
        ),
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
