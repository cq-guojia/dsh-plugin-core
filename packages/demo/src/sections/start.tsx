import { createElement as h } from 'react'
import { Placeholder } from './index.js'

/** 概览：包是什么、能力地图。素材在 README.md 与 docs/design/features.md，尚未搬进页面。 */
export function OverviewPage(): ReturnType<typeof h> {
  return h(Placeholder, { descKey: 'overviewDesc' })
}

/** 安装与初始化：怎么写真实插件才能跑起来。 */
export function InstallPage(): ReturnType<typeof h> {
  return h(Placeholder, { descKey: 'installDesc' })
}

/** 写一个插件：最小骨架。 */
export function QuickstartPage(): ReturnType<typeof h> {
  return h(Placeholder, { descKey: 'quickstartDesc' })
}
