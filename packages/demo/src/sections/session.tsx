import { createElement as h, useState } from 'react'
import { SessionPreview } from '../../../../dist/session/index.js'
import { mockSessionSource } from '../mock.js'
import { Button } from '../../../../dist/ui/index.js'
import { Demo } from './index.js'
import { t } from '../i18n.js'

export function SessionSection(): ReturnType<typeof h> {
  const [open, setOpen] = useState(false)

  return h(
    Demo,
    {
      title: 'SessionPreview',
      hint: t('sessionHint'),
    },
    h(
      'div',
      { style: { display: 'flex', gap: '12px', flexWrap: 'wrap' } },
      h(Button, { variant: 'primary', onClick: () => setOpen(true) }, '打开会话预览（modal）'),
      h(Button, { onClick: () => setOpen(false) }, '关闭'),
    ),
    open
      ? h(Modalish, null)
      : null,
  )

  function Modalish(): ReturnType<typeof h> {
    return h(SessionPreview, {
      sessionId: 'demo-session',
      source: mockSessionSource,
      variant: 'modal',
      title: '会话预览（假数据）',
      onClose: () => setOpen(false),
      onOpenFile: (path) => setOpen(false),
    })
  }
}
