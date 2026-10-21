/**
 * 工作区浏览（真实数据）—— 三块演示：
 *  ① 数据来源：`remote.workspaceFiles` + 宿主工作区清单 ⇒ 最近会话的锚点；
 *  ② 方法 A `openFilePreview`：右侧 core PanelDock 停靠预览（拖宽 / 关闭都由 PanelDock 负责）；
 *  ③ 方法 B `pickWorkspaceFile`：锚定弹窗选文件，Promise 返回工作区相对路径。
 *
 * ⚠️ 本页面**不用任何 mock**：样例文件是仓库里 `packages/demo/src/samples/` 的真文件，
 * 取数一律走宿主的 `remote.workspaceFiles`；探不到样例目录就如实说「没找到」。
 */
import { createElement as h, useEffect, useState, useSyncExternalStore, type ReactNode } from 'react'
import {
  openFilePreview,
  pickWorkspaceAnchor,
  pickWorkspaceFile,
  type OfficeToPdfFace,
  type PickFilter,
  type WorkspaceFilesFace,
} from '../../../../dist/explorer/index.js'
import { Button, workspaceList } from '../../../../dist/ui/index.js'
import { SessionPreview } from '../../../../dist/session/index.js'
import { fileServices } from '../host-files.js'
import { pageRow } from '../layout-mount.js'
import { findSamples, type SampleSet } from '../samples.js'
import { mockSessionSource } from '../mock.js'
import { Demo } from './index.js'
import { t } from '../i18n.js'

/** 一排紧凑的核心按钮。 */
function Row(props: { children: ReactNode[] }): ReturnType<typeof h> {
  return h('div', { style: { display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' } }, ...props.children)
}

function Hint(props: { text: string }): ReturnType<typeof h> {
  return h('span', { style: { fontSize: '12px', color: 'var(--dshpc-fg-3)' } }, props.text)
}

export function ExplorerPage(): ReturnType<typeof h> {
  const services = useSyncExternalStore(fileServices.subscribe, fileServices.getSnapshot)
  const workspaces = useSyncExternalStore(workspaceList.subscribe, workspaceList.getSnapshot)
  // 「打开文件夹」的落点 = 最近更新、且有会话的那个工作区（workspaceFiles 是会话作用域服务，
  // 必须先落到一个真会话上）。期望值全来自宿主快照，拿不到就是 null，不猜。
  const anchor = pickWorkspaceAnchor(workspaces)
  const [samples, setSamples] = useState<SampleSet | null>(null)
  const [probing, setProbing] = useState(false)
  const [picked, setPicked] = useState<string | null>(null)

  const files: WorkspaceFilesFace | null = services.workspaceFiles
  const officeToPdf: OfficeToPdfFace | null = services.officeToPdf
  const sessionId = anchor?.sessionId ?? ''
  const ready = files !== null && anchor !== null

  // 样例目录：有真锚点就探一次（有界层序探索，见 samples.ts）。
  useEffect(() => {
    if (files === null || sessionId === '') return
    let alive = true
    setProbing(true)
    void findSamples(files, sessionId).then((found) => {
      if (!alive) return
      setSamples(found)
      setProbing(false)
    })
    return () => {
      alive = false
    }
  }, [files, sessionId])

  const openPreview = (sessionId: string, rootName: string, path: string): void => {
    if (files === null) return
    const mount = pageRow.element
    if (mount === null) return
    openFilePreview({
      // 分栏挂载点 = 整页 flex 行（核心 dock 成为它的最后一个子项 ⇒ 主区被真正挤窄）。
      mount,
      workspaceFiles: files,
      officeToPdf,
      sessionId,
      path,
      rootName,
      // ▾ 选层下拉要列全部工作区（当前工作区展开 + 其余罗列，与兄弟项目一致）。
      workspaces: workspaces.map((item) => item.title),
      // ▾ 里点其他工作区 = 换会话重开预览（dock 是命令式挂载 ⇒ 再 open 一次，旧的自动回收）。
      onSelectWorkspace: (name) => {
        const sid = workspaces.find((item) => item.title === name)?.sessionIds?.[0]
        if (sid !== undefined) openPreview(sid, name, '')
      },
    })
  }

  const open = (path: string): void => {
    if (files === null || anchor === null) return
    openPreview(anchor.sessionId, anchor.title, path)
  }

  const pick = (event: { currentTarget: HTMLElement }, filter?: PickFilter): void => {
    if (files === null || anchor === null) return
    void pickWorkspaceFile({
      workspaceFiles: files,
      officeToPdf,
      sessionId: anchor.sessionId,
      anchor: event.currentTarget,
      rootName: anchor.title,
      workspaces: workspaces.map((item) => item.title),
      filter,
    }).then((result) => {
      setPicked(result === null ? null : `${result.path}${result.isDir ? `（${t('pickFolder')}）` : ''}`)
    })
  }

  return h(
    'div',
    null,
    h(
      Demo,
      { title: t('explorerDataTitle'), hint: t('explorerDataHint') },
      files === null
        ? h(Hint, { text: t('explorerFilesNone') })
        : anchor === null
          ? h(Hint, { text: t('explorerAnchorNone') })
          : h(Hint, {
              text: `${t('explorerAnchorLabel')}${anchor.title}｜${t('explorerSessionLabel')}${anchor.sessionId}｜${t('explorerWorkspaces')}${workspaces.length}`,
            }),
    ),
    h(
      Demo,
      { title: t('methodATitle'), hint: t('methodAHint') },
      ready
        ? h(
            Row,
            null,
            h(Button, { variant: 'primary', onClick: () => { open('') } }, t('openRootPreview')),
            samples !== null
              ? h(
                  Row,
                  null,
                  h(Button, { onClick: () => { open(samples.dir) } }, t('openSamplesDir')),
                  h(Button, { onClick: () => { open(samples.md) } }, t('sampleMd')),
                  h(Button, { onClick: () => { open(samples.html) } }, t('sampleHtml')),
                  h(Button, { onClick: () => { open(samples.js) } }, t('sampleJs')),
                  h(Button, { onClick: () => { open(samples.css) } }, t('sampleCss')),
                )
              : h(Hint, { text: probing ? t('samplesProbing') : t('samplesNotFound') }),
          )
        : h(Hint, { text: t('explorerFilesNone') }),
    ),
    h(
      Demo,
      { title: t('methodBTitle'), hint: t('methodBHint') },
      ready
        ? h(
            Row,
            null,
            h(Button, { onClick: (event: { currentTarget: HTMLElement }) => { pick(event) } }, t('pickAny')),
            h(Button, { onClick: (event: { currentTarget: HTMLElement }) => { pick(event, { exts: ['ts'] }) } }, t('pickTs')),
            h(Button, { onClick: (event: { currentTarget: HTMLElement }) => { pick(event, { dirs: true }) } }, t('pickDir')),
            h(Hint, { text: picked === null ? t('pickNone') : `${t('pickResult')}：${picked}` }),
          )
        : h(Hint, { text: t('explorerFilesNone') }),
    ),
    h(Demo, { title: t('previewBodyTitle'), hint: t('previewBodyHint') }, null),
  )
}

export function SessionPage(): ReturnType<typeof h> {
  const [open, setOpen] = useState(false)

  return h(
    Demo,
    { title: 'SessionPreview', hint: t('sessionHint') },
    h(
      Row,
      null,
      h(Button, { variant: 'primary', onClick: () => { setOpen(true) } }, t('sessionOpenModal')),
      h(Button, { onClick: () => { setOpen(false) } }, t('sessionClose')),
    ),
    open
      ? h(SessionPreview, {
          sessionId: 'demo-session',
          source: mockSessionSource,
          variant: 'modal',
          title: t('sessionPreviewTitle'),
          onClose: () => { setOpen(false) },
          onOpenFile: () => { setOpen(false) },
        })
      : null,
  )
}
