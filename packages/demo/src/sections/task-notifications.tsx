import { createElement as h, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import {
  Button,
  ListRow,
  taskNotifications,
  selectTaskNotifications,
  subscribeTaskNotificationEvents,
  type TaskNotificationEvent,
  type TaskNotificationHandle,
  type TaskNotificationRecord,
} from '../../../../dist/ui/index.js'
import { DocContent, Example, Note } from '../doc.js'
import { t } from '../i18n.js'

/**
 * 通知任务中心的数据面演示。
 *
 * 这一页只演示阶段 0 / 1 的 API：状态池、订阅、事件总线、过滤三态、结束句柄与还原判据。
 * 不是事件查看控件 —— 没有计数控件、下拉、还原弹窗，也不往 src/ui/ 加任何东西。
 * 面板里的每一条都来自真实 register / 真实事件与真实时钟；无模拟数据、无定时器、无占位行。
 * 列表行一律用基础库的 ListRow（一行一条、右侧操作槽挡冒泡），不手搓行容器。
 */
const GROUP_REMINDER = 'dsh-task-reminder'
const GROUP_LEDGER = 'dsh-task-ledger'

const CODE_SUBSCRIBE = `import { useSyncExternalStore } from 'react'
import { taskNotifications, selectTaskNotifications } from 'dsh-plugin-core/ui'

const snapshot = useSyncExternalStore(
  taskNotifications.subscribe,
  taskNotifications.getSnapshot,
  taskNotifications.getServerSnapshot,
)
const rows = selectTaskNotifications(snapshot, ['dsh-task-reminder'])

const handle = taskNotifications.register({
  group: 'dsh-task-reminder',
  title: 'workspace-scan',
})
handle.background()   // collapse is an event, not a settlement
handle.done()         // the caller owns the ending`

const mono: Record<string, string | number> = { fontFamily: 'var(--dshpc-font-mono)', fontSize: '12px' }
const row: Record<string, string | number> = { display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }
const panel: Record<string, string | number> = { display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }
const main: Record<string, string | number> = { display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0, wordBreak: 'break-all' }

export function TaskNotificationsPage(): ReturnType<typeof h> {
  const snapshot = useSyncExternalStore(
    taskNotifications.subscribe,
    taskNotifications.getSnapshot,
    taskNotifications.getServerSnapshot,
  )
  const [events, setEvents] = useState<readonly TaskNotificationEvent[]>([])
  const [filter, setFilter] = useState<'all' | 'one' | 'two'>('all')
  const handles = useRef(new Map<string, TaskNotificationHandle>())
  const serial = useRef(0)

  useEffect(() => {
    taskNotifications.connect()
    return subscribeTaskNotificationEvents((event) => {
      setEvents((prev) => [event, ...prev].slice(0, 8))
    })
  }, [])

  const groups =
    filter === 'all' ? undefined : filter === 'one' ? [GROUP_REMINDER] : [GROUP_REMINDER, GROUP_LEDGER]
  const visible = selectTaskNotifications(snapshot, groups)
  const localPending = [...handles.current.values()].filter((handle) => !handle.isSettled).length

  function register(group: string, label: string): void {
    serial.current += 1
    const handle = taskNotifications.register({ group, title: `${label} #${serial.current}` })
    handles.current.set(handle.id, handle)
  }

  /** 每条任务按自己的 id 找句柄，互不覆盖；跨页条目没有本页句柄，不给按钮。 */
  function withHandle(task: TaskNotificationRecord, fn: (handle: TaskNotificationHandle) => void): void {
    const handle = handles.current.get(task.id)
    if (handle !== undefined && !handle.isSettled) fn(handle)
  }

  function finishAll(): void {
    for (const handle of handles.current.values()) {
      if (!handle.isSettled) handle.done('finished in demo')
    }
  }

  function renderTask(task: TaskNotificationRecord): ReturnType<typeof h> {
    const local = taskNotifications.canRestore(task)
    const handle = handles.current.get(task.id)
    const owned = handle !== undefined && !handle.isSettled
    return h(
      ListRow,
      {
        key: task.id,
        actions: owned
          ? h(
              'div',
              { style: { ...row, justifyContent: 'flex-end' } },
              h(Button, { size: 'sm', onClick: () => withHandle(task, (x) => x.update({ detail: `updated ${new Date().toLocaleTimeString()}` })) }, t('tnUpdate')),
              h(Button, { size: 'sm', onClick: () => withHandle(task, (x) => x.background()) }, t('tnBackground')),
              h(Button, { size: 'sm', variant: 'primary', onClick: () => withHandle(task, (x) => x.done()) }, t('tnDone')),
              h(Button, { size: 'sm', variant: 'danger', onClick: () => withHandle(task, (x) => x.fail('cancelled in demo')) }, t('tnFail')),
              h(Button, { size: 'sm', onClick: () => taskNotifications.requestRestore(task.id) }, t('tnRestore')),
            )
          : undefined,
      },
      h(
        'div',
        { style: main },
        h('div', { style: { fontWeight: 600 } }, task.title),
        h(
          'div',
          { style: { ...mono, color: 'var(--dshpc-fg-3)' } },
          `group=${task.group} · status=${task.status} · backgrounded=${task.backgrounded} · origin=${task.origin}`,
        ),
        h(
          'div',
          { style: { ...mono, color: local ? 'var(--dshpc-fg-2)' : 'var(--dshpc-fg-4)' } },
          local ? t('tnBadgeLocal') : t('tnBadgeRemote'),
        ),
        task.detail === undefined ? null : h('div', { style: mono }, task.detail),
      ),
    )
  }

  function renderEvent(event: TaskNotificationEvent, index: number): ReturnType<typeof h> {
    const label = 'task' in event ? event.task.title : 'taskId' in event ? event.taskId : event.origin
    return h(
      ListRow,
      { key: `${index}-${event.type}-${label}` },
      h(
        'div',
        { style: row },
        h('span', { style: { ...mono, color: 'var(--dshpc-business)' } }, event.type),
        h('span', { style: { ...mono, color: 'var(--dshpc-fg-3)' } }, ` · remote=${event.remote} · ${label}`),
      ),
    )
  }

  return h(
    'div',
    null,
    h(Note, { text: t('tnNote') }),
    h('div', { style: { ...mono, margin: '10px 0 16px', color: 'var(--dshpc-fg-3)' } }, t('tnCrossPage')),
    h(
      Example,
      { title: t('tnOpsTitle'), hint: t('tnOpsHint'), code: CODE_SUBSCRIBE },
      h(
        'div',
        { style: panel },
        h(
          'div',
          { style: row },
          h(Button, { size: 'sm', variant: 'primary', onClick: () => register(GROUP_REMINDER, 'workspace-scan') }, t('tnRegisterReminder')),
          h(Button, { size: 'sm', onClick: () => register(GROUP_LEDGER, 'session-index') }, t('tnRegisterLedger')),
        ),
        h(
          'div',
          { style: row },
          h(Button, { size: 'sm', variant: filter === 'all' ? 'primary' : 'outline', onClick: () => setFilter('all') }, t('tnFilterAll')),
          h(Button, { size: 'sm', variant: filter === 'one' ? 'primary' : 'outline', onClick: () => setFilter('one') }, t('tnFilterOne')),
          h(Button, { size: 'sm', variant: filter === 'two' ? 'primary' : 'outline', onClick: () => setFilter('two') }, t('tnFilterTwo')),
        ),
        h(
          'div',
          { style: row },
          h(Button, { size: 'sm', onClick: () => taskNotifications.refresh() }, t('tnRefresh')),
          h(Button, { size: 'sm', variant: 'danger', disabled: localPending === 0, onClick: finishAll }, t('tnFinishAll')),
          h('span', { style: { ...mono, color: 'var(--dshpc-fg-4)' } }, t('tnRefreshHint')),
        ),
        h(
          'div',
          { style: { ...mono, color: 'var(--dshpc-fg-4)' } },
          `${t('tnOpsNote')} · localPending=${localPending}`,
        ),
      ),
    ),
    h(
      Example,
      { title: t('tnSnapshotTitle'), hint: t('tnSnapshotHint') },
      h(
        'div',
        { style: panel },
        h('div', { style: mono }, `${t('tnCountLabel')}: ${visible.length} / ${snapshot.tasks.length} · revision=${snapshot.revision}`),
        visible.length === 0
          ? h(Note, { text: t('tnEmptyTasks') })
          : visible.map(renderTask),
      ),
    ),
    h(
      Example,
      { title: t('tnEventsTitle'), hint: t('tnEventsHint') },
      h(
        'div',
        { style: panel },
        events.length === 0
          ? h(Note, { text: t('tnEmptyEvents') })
          : events.map(renderEvent),
      ),
    ),
    h(DocContent, { id: 'task-notifications' }),
  )
}
