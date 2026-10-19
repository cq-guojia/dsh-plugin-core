import { createElement as h, useState } from 'react'
import { ExplorerPanel } from '../../../../dist/explorer/index.js'
import { mockWorkspaceFiles } from '../mock.js'
import { Demo } from './index.js'
import { t } from '../i18n.js'

export function ExplorerSection(): ReturnType<typeof h> {
  const [selected, setSelected] = useState<string | null>(null)

  return h(
    Demo,
    {
      title: 'ExplorerPanel',
      hint: t('explorerHint'),
    },
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
  )
}
