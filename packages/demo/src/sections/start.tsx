import { createElement as h } from 'react'
import { DocContent } from '../doc.js'

/**
 * 快速开始。
 * 原「开始」组的三条（概览 / 安装与初始化 / 写一个插件）并成一页 —— 侧栏条目一多就糊，
 * 并页后每块仍是独立的 Demo 卡片，视觉上照样分得清。文档体（prose + 用法代码）直接吃 docData['quickstart']。
 */
export function QuickstartPage(): ReturnType<typeof h> {
  return h(DocContent, { id: 'quickstart' })
}
