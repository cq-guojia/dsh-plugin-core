import { createElement as h } from 'react'
import { Demo, Placeholder } from './index.js'
import { t } from '../i18n.js'

/**
 * 快速开始。
 * 原「开始」组的三条（概览 / 安装与初始化 / 写一个插件）并成一页 —— 侧栏条目一多就糊，
 * 并页后每块仍是独立的 Demo 卡片，视觉上照样分得清。
 */
export function QuickstartPage(): ReturnType<typeof h> {
  return h(
    'div',
    null,
    h(Demo, { title: t('secOverview') }, h(Placeholder, { descKey: 'overviewDesc' })),
    h(Demo, { title: t('secInstall') }, h(Placeholder, { descKey: 'installDesc' })),
    h(Demo, { title: t('secWritePlugin') }, h(Placeholder, { descKey: 'quickstartDesc' })),
  )
}
