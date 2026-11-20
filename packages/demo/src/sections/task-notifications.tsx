import { createElement as h, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { Button } from '../../../../dist/ui/index.js'
import {
  mountTaskUI,
  startTask,
  taskCenterStore,
  type TaskRecord,
} from '../../../../dist/adv/tasks/index.js'
import { TaskBar } from '../../../../dist/adv/tasks/ui.js'
import { DocContent, Example, Note } from '../doc.js'
import { t } from '../i18n.js'

/**
 * 后台任务中心演示：展示栏沿用核心原生 TaskBar（形态 / 尺寸 / 宽度 / 跑马灯都原样），
 * 只把内核换成开放执行器 + 共享池 + SSE 投影。按钮发起服务端真实任务：
 * 无披露的等 10 秒才结算；渐进披露的每 2 秒 report 一段文字，在行内第二行显示。
 */
const PROJECT = 'dsh-plugin-core-demo'
const GROUP = 'demo-jobs'

const CODE_SUBSCRIBE = `import {
  executors, startTask, mountTaskUI,
} from 'dsh-plugin-core/adv/tasks'
import { TaskBar } from 'dsh-plugin-core/adv/tasks/ui'

// ① 开放执行器：kind 任意字符串，核心不枚举、不为某类写死分支
executors.register('demo:job', async (args, ctx) => {
  for (let i = 1; i <= args.steps; i++) {
    await sleep(500)
    ctx.report({ message: \`执行到 \${i}/\${args.steps}\`, current: i, total: args.steps })
  }
  if (args.fail) return { outcome: 'failed', reason: '演示失败' }
  return { outcome: 'done' }
})

// ② 本页接线一次：列表与 Toast 共用 handlers，终态只刷自己的数据
mountTaskUI({
  project: 'dsh-plugin-core-demo',
  groups: ['demo-jobs'],
  handlers: { 'open-log': (task) => openLog(task.detail) },
  onSettled: () => refreshBoard(),
})

// ③ 发起：10 秒、渐进披露；配置全是纯数据，跟着记录走
await startTask({
  project: 'dsh-plugin-core-demo', group: 'demo-jobs', title: '结案',
  kind: 'demo:job', args: { seconds: 10, steps: 20 },
  toast: { success: { title: '完成', button: { id: 'open-log', text: '看日志' }, scope: 'all' } },
  rowButtons: [
        { id: 'open-log', text: '看日志', when: 'done' },
        { id: 'open-log', text: '看日志', when: 'failed' },
      ],
})

// ④ 展示栏：核心原 UI，两形态 / 三尺寸 / 固定宽 / 最大宽（跑马灯）
h(TaskBar, { groups: ['demo-jobs'] })
h(TaskBar, { form: 'icon', size: 'lg', groups: ['demo-jobs'] })
h(TaskBar, { maxWidth: 110, groups: ['demo-jobs'] })`

const mono: Record<string, string | number> = { fontFamily: 'var(--dshpc-font-mono)', fontSize: '12px' }
const row: Record<string, string | number> = { display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }
const panel: Record<string, string | number> = { display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }
const barRow: Record<string, string | number> = { display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }

interface JobArgs {
  readonly seconds: number
  readonly steps: number
  readonly fail: boolean
}

export function TaskNotificationsPage(): ReturnType<typeof h> {
  const snapshot = useSyncExternalStore(
    taskCenterStore.subscribe,
    taskCenterStore.getSnapshot,
    taskCenterStore.getSnapshot,
  )
  const [events, setEvents] = useState<readonly string[]>([])
  const serial = useRef(0)
  const handlers = useRef({ 'open-log': (task: TaskRecord) => {
    window.alert(`查看日志：${task.title}`)
    setEvents((prev) => [`按钮 看日志: ${task.title}`, ...prev].slice(0, 8))
  } })

  useEffect(() => {
    const offUi = mountTaskUI({
      project: PROJECT,
      handlers: handlers.current,
      onSettled: (task, outcome) => {
        setEvents((prev) => [`终态 ${outcome}: ${task.title}${task.reason ? ` · ${task.reason}` : ''}`, ...prev].slice(0, 8))
      },
    })
    return () => { offUi() }
  }, [])

  function run(label: string, args: JobArgs): void {
    serial.current += 1
    const index = serial.current
    void startTask({
      project: PROJECT,
      group: GROUP,
      title: `${label} #${index}`,
      key: `${label}:${index}`,
      kind: 'demo:job',
      args: { ...args, label, index },
      detail: { label, index },
      toast: {
        success: { title: `${label} #${index} 成功`, button: { id: 'open-log', text: '看日志' }, scope: 'all' },
        failure: { title: `${label} #${index} 失败`, button: { id: 'open-log', text: '看日志' }, scope: 'origin' },
      },
      rowButtons: [
        { id: 'open-log', text: '看日志', when: 'done' },
        { id: 'open-log', text: '看日志', when: 'failed' },
      ],
    })
  }

  return h(
    'div',
    null,
    h(Note, { text: t('tnNote') }),
    h(Example, { title: t('tnBarTitle'), hint: t('tnBarHint') },
      // 只演示中号这一组：纯 icon → icon+文字 → 定宽 220 → 最大宽 110（放不下省略号、hover 跑马灯）。
      // 其他尺寸由消费方自己按 TaskBar 的 size / form / width / maxWidth 配。
      h('div', { style: barRow },
        h(TaskBar, { form: 'icon', groups: [GROUP] }),
        h(TaskBar, { groups: [GROUP] }),
        h(TaskBar, { width: 220, groups: [GROUP] }),
        h(TaskBar, { maxWidth: 110, groups: [GROUP] }),
      ),
    ),
    h(Example, { title: t('tnOpsTitle'), hint: t('tnRunHint'), code: CODE_SUBSCRIBE },
      h('div', { style: panel },
        h('div', { style: row },
          h(Button, { size: 'sm', variant: 'primary', onClick: () => run('无披露成功', { seconds: 10, steps: 0, fail: false }) }, t('tnRunPlainSuccess')),
          h(Button, { size: 'sm', onClick: () => run('无披露失败', { seconds: 10, steps: 0, fail: true }) }, t('tnRunPlainFail')),
        ),
        h('div', { style: row },
          h(Button, { size: 'sm', variant: 'primary', onClick: () => run('渐进披露成功·30秒', { seconds: 30, steps: 15, fail: false }) }, t('tnRunStepped30')),
          h(Button, { size: 'sm', onClick: () => run('渐进披露成功·1分钟', { seconds: 60, steps: 30, fail: false }) }, t('tnRunStepped60')),
          h(Button, { size: 'sm', onClick: () => run('渐进披露失败', { seconds: 10, steps: 5, fail: true }) }, t('tnRunSteppedFail')),
        ),
      ),
    ),
    h(Example, { title: t('tnSnapshotTitle'), hint: t('tnSnapshotHint') },
      h('div', { style: panel },
        h('div', { style: mono }, `${t('tnCountLabel')}: ${snapshot.tasks.length} · revision=${snapshot.revision}`),
        snapshot.tasks.length === 0
          ? h(Note, { text: t('tnEmptyTasks') })
          : snapshot.tasks.map((task) => h('div', { key: task.id, style: mono },
            `${task.title} · ${task.state}${task.progress ? ` · ${task.progress.message}` : ''}`)),
      ),
    ),
    h(Example, { title: t('tnEventsTitle'), hint: t('tnEventsHint') },
      h('div', { style: panel },
        events.length === 0 ? h(Note, { text: t('tnEmptyEvents') }) : events.map((e, i) => h('div', { key: `${i}-${e}`, style: mono }, e)),
      ),
    ),
    h(DocContent, { id: 'task-notifications' }),
  )
}
