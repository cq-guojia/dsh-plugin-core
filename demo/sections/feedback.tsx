import { createElement as h, useState } from 'react'
import {
  Button,
  EmptyState,
  ErrorBoundary,
  Loading,
  Modal,
  showToast,
} from '../../dist/ui/index.js'
import { Demo } from './index.js'

function Boom(): ReturnType<typeof h> {
  throw new Error('演示：子组件抛错被边界接住')
}

export function FeedbackSection(): ReturnType<typeof h> {
  const [open, setOpen] = useState(false)
  const [boom, setBoom] = useState(false)

  return h(
    'div',
    null,
    h(
      Demo,
      { title: 'Modal', hint: '自绘 overlay（不用 portal）；点遮罩 / Esc / ✕ 都能关' },
      h(
        'div',
        null,
        h(Button, { onClick: () => setOpen(true) }, '打开弹窗'),
        open
          ? h(Modal, {
              title: '任务详情',
              onClose: () => setOpen(false),
              footer: h(Button, { variant: 'primary', onClick: () => setOpen(false) }, '知道了'),
            }, h('div', null, '弹窗主体内容——会话预览这类功能就用它来承载。'))
          : null,
      ),
    ),
    h(
      Demo,
      { title: 'toast', hint: '命令式 showToast，不要求挂组件' },
      h(
        'div',
        { style: { display: 'flex', gap: '8px' } },
        h(Button, { onClick: () => showToast('已保存') }, '普通'),
        h(Button, { onClick: () => showToast('保存成功', { variant: 'success' }) }, '成功'),
        h(Button, { onClick: () => showToast('保存失败', { variant: 'error' }) }, '失败'),
      ),
    ),
    h(
      Demo,
      { title: 'Loading / EmptyState / ErrorBoundary' },
      h(
        'div',
        { style: { display: 'flex', flexDirection: 'column', gap: '12px' } },
        h(EmptyState, { text: '暂无数据' }),
        h(
          'div',
          { style: { border: '1px solid var(--tdt-border-faint)', borderRadius: '8px', padding: '10px' } },
          boom
            ? h(ErrorBoundary, null, h(Boom, null))
            : h(Button, { variant: 'danger', onClick: () => setBoom(true) }, '点我抛错（看边界兜底）'),
        ),
        h('div', { style: { color: 'var(--tdt-fg-3)', fontSize: '12px' } },
          'Loading 是贴到主容器右下角的指示器（anchorId 默认 dsh-tdt-main），此处不渲染以免遮挡。'),
      ),
    ),
  )
}
