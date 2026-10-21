import { createElement as h } from 'react'
import { Placeholder } from './index.js'
import { Example, CodeOnly, Note } from '../doc.js'
import { t } from '../i18n.js'

const CODE_START_USAGE = `pnpm add dsh-plugin-core

// 引入样式工具与控件
import { createStyleKit } from 'dsh-plugin-core/design'
import { Button, Modal, notify } from 'dsh-plugin-core/ui'

// 一次性注入样式（每个插件用自己的固定 id）
import { setStyleKit, ensureControls } from 'dsh-plugin-core/ui'
setStyleKit(createStyleKit({ id: 'your-plugin-id' }))
ensureControls()`

/**
 * 快速开始。
 * 原「开始」组的三条（概览 / 安装与初始化 / 写一个插件）并成一页 —— 侧栏条目一多就糊，
 * 并页后每块仍是独立的 Demo 卡片，视觉上照样分得清。
 */
export function QuickstartPage(): ReturnType<typeof h> {
  return h(
    'div',
    null,
    h(Note, { text: t('startNote') }),
    h(Example, { title: t('secOverview') }, h(Placeholder, { descKey: 'overviewDesc' })),
    h(Example, { title: t('secInstall') }, h(Placeholder, { descKey: 'installDesc' })),
    h(Example, { title: t('secWritePlugin') }, h(Placeholder, { descKey: 'quickstartDesc' })),
    h(CodeOnly, { labelKey: 'docUsage', code: CODE_START_USAGE }),
  )
}
