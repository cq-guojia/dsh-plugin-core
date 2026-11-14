import test from 'node:test'
import assert from 'node:assert/strict'
import { createElement as h } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { WorkspacePicker, workspaceList } from '../dist/ui/index.js'
import { workspaceOptionsOf } from '../dist/ui/inputs/WorkspacePicker.js'

const ROWS = [
  { workspaceId: 'w1', title: 'NAS', path: '/mnt/nas' },
  { workspaceId: 'w2', title: 'Repo' }, // 宿主没给 path
  { workspaceId: 'w3', title: '镜像', path: '/mnt/nas' }, // 与 w1 撞 path
]
workspaceList.setSource({ getSnapshot: () => ({ items: ROWS }), subscribe: () => () => {} })

test('workspaceOptionsOf：path 口径下缺字段 / 撞值的行置灰保留，不静默丢', () => {
  assert.deepEqual(workspaceOptionsOf(ROWS, 'path'), [
    { value: '/mnt/nas', label: 'NAS', disabled: false },
    { value: 'w2', label: 'Repo', disabled: true },
    { value: '/mnt/nas', label: '镜像', disabled: true },
  ])
  assert.deepEqual(workspaceOptionsOf(ROWS, 'id'), [
    { value: 'w1', label: 'NAS', disabled: false },
    { value: 'w2', label: 'Repo', disabled: false },
    { value: 'w3', label: '镜像', disabled: false },
  ])
})

test('WorkspacePicker：valueKey=path 时受控值按路径匹配并显示标题', () => {
  const html = renderToStaticMarkup(h(WorkspacePicker, { valueKey: 'path', value: '/mnt/nas' }))
  assert.match(html, /NAS/)
})
