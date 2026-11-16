import {
  createElement as h, useEffect, useState, useSyncExternalStore,
} from 'react'
import { Button, ListRow } from '../../../../dist/ui/index.js'
import {
  createEventBus,
  createStore,
  getDefaultTaskProject,
  notifyMessage,
  subscribeNotifications,
} from '../../../../dist/runtime/index.js'
import { DocApi, DocCode, DocProse, Example, Note } from '../doc.js'
import { t } from '../i18n.js'

/**
 * 运行时底座（`src/runtime/`）的演示：跨页通知、状态容器、事件总线。
 *
 * 三块都是**真能力，不是模拟**：通知真的走 BroadcastChannel 发出去（开两个标签页就能看到对端
 * `remote=true`），计数器的值真的来自 `createStore` 的快照，总线收到几条就是几条（不留存）。
 * 代码块与 API 表直接读 `docs/api/runtime.doc.ts` 的投影（docData），不在页面里抄第二份。
 */
const panel = { display: 'flex', flexDirection: 'column' as const, gap: '8px' }
const row = { display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' as const }
const mono = { fontFamily: 'var(--dshpc-font-mono, ui-monospace, monospace)', fontSize: '12px' }

interface NoticeRow {
  readonly key: string
  readonly title: string
  readonly level: string
  readonly project: string
  readonly group: string
  readonly remote: boolean
}

interface BusRow {
  readonly key: string
  readonly seq: number
  readonly at: string
}

export function RuntimePage(): ReturnType<typeof h> {
  // 通知：订阅默认逻辑端，本页自己发的会带 remote=false。
  const [notices, setNotices] = useState<readonly NoticeRow[]>([])
  useEffect(
    () =>
      subscribeNotifications((message, remote) => {
        setNotices((prev) =>
          [
            {
              key: message.id,
              title: message.title,
              level: message.level,
              project: message.project,
              group: message.group,
              remote,
            },
            ...prev,
          ].slice(0, 6),
        )
      }),
    [],
  )

  // 状态容器：值只存在 store 里，组件不另存一份 state。
  const [store] = useState(() => createStore({ count: 0 }))
  const state = useSyncExternalStore(store.subscribe, store.getState, store.getState)

  // 事件总线：一次性事实，没有历史。
  const [bus] = useState(() => createEventBus<BusRow>())
  const [events, setEvents] = useState<readonly BusRow[]>([])
  useEffect(() => bus.subscribe((event) => setEvents((prev) => [event, ...prev].slice(0, 6))), [bus])
  const emitted = useState(() => ({ seq: 0 }))[0]

  function send(level: 'info' | 'success' | 'warning'): void {
    // 标题是第一个参数：它永远必填，其余进可选项。
    notifyMessage(`${t('rtSendTitle')} · ${level}`, { group: 'demo', level })
  }

  function emit(): void {
    emitted.seq += 1
    bus.emit({ key: `${String(emitted.seq)}`, seq: emitted.seq, at: new Date().toLocaleTimeString() })
  }

  return h(
    'div',
    null,
    h(DocProse, { id: 'runtime' }),
    h(
      Example,
      { title: t('rtNotifyTitle'), hint: t('rtNotifyHint') },
      h(
        'div',
        { style: panel },
        h(
          'div',
          { style: row },
          h(Button, { size: 'sm', variant: 'primary', onClick: () => send('info') }, t('rtSendInfo')),
          h(Button, { size: 'sm', variant: 'success', onClick: () => send('success') }, t('rtSendSuccess')),
          h(Button, { size: 'sm', variant: 'warning', onClick: () => send('warning') }, t('rtSendWarning')),
          h('span', { style: { ...mono, color: 'var(--dshpc-fg-4)' } },
            `${t('rtProjectLabel')}=${getDefaultTaskProject() ?? '—'}`),
        ),
        notices.length === 0
          ? h(Note, { text: t('rtEmptyLog') })
          : notices.map((notice) =>
              h(
                ListRow,
                { key: notice.key },
                h(
                  'div',
                  { style: row },
                  h('span', { style: { ...mono, color: 'var(--dshpc-business)' } }, notice.level),
                  h('span', null, notice.title),
                  h('span', { style: { ...mono, color: 'var(--dshpc-fg-3)' } },
                    `project=${notice.project} · group=${notice.group} · remote=${String(notice.remote)}`),
                ),
              ),
            ),
      ),
    ),
    h(DocCode, { id: 'runtime-notify' }),
    h(DocApi, { id: 'runtime-notify' }),
    h(
      Example,
      { title: t('rtStoreTitle'), hint: t('rtStoreHint') },
      h(
        'div',
        { style: row },
        h(Button, { size: 'sm', onClick: () => { store.setState({ count: store.getState().count - 1 }) } }, t('rtDec')),
        h(Button, { size: 'sm', variant: 'primary', onClick: () => { store.setState({ count: store.getState().count + 1 }) } }, t('rtInc')),
        h(Button, { size: 'sm', onClick: () => { store.setState({ count: 0 }) } }, t('rtReset')),
        h('span', { style: { ...mono, color: 'var(--dshpc-fg-2)' } },
          `${t('rtStoreValue')}=${String(state.count)}`),
      ),
    ),
    h(DocCode, { id: 'runtime-store' }),
    h(DocApi, { id: 'runtime-store' }),
    h(
      Example,
      { title: t('rtBusTitle'), hint: t('rtBusHint') },
      h(
        'div',
        { style: panel },
        h(
          'div',
          { style: row },
          h(Button, { size: 'sm', variant: 'primary', onClick: emit }, t('rtEmit')),
          h('span', { style: { ...mono, color: 'var(--dshpc-fg-4)' } },
            `${t('rtBusCount')}=${String(events.length)}`),
        ),
        events.length === 0
          ? h(Note, { text: t('rtBusEmpty') })
          : events.map((event) =>
              h(
                ListRow,
                { key: event.key },
                h(
                  'div',
                  { style: row },
                  h('span', { style: { ...mono, color: 'var(--dshpc-business)' } }, `seq=${String(event.seq)}`),
                  h('span', { style: { ...mono, color: 'var(--dshpc-fg-3)' } }, event.at),
                ),
              ),
            ),
      ),
    ),
    h(DocApi, { id: 'runtime-bus' }),
  )
}
