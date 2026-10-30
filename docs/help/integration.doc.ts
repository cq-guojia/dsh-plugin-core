// 样例：从零接入一个插件 —— 真源（TS 数据模块）。内容全在此一处，demo 与 md 都从这份派生。
import type { DocTopic } from '../design/doc-format.js'

const install = `pnpm add dsh-plugin-core`
const initStyle = `// 插件 client 入口
import { createStyleKit } from 'dsh-plugin-core/design'
import { setStyleKit } from 'dsh-plugin-core/ui'

const kit = createStyleKit({ id: 'dsh-task-reminder-ui' })
setStyleKit(kit)
// 只需这一行：控件首次渲染时自注入自己那份 CSS，token 也一并登记。`
const useControl = `import { Button, Input, Picker, showToast } from 'dsh-plugin-core/ui'

h(Input, { value: name, onChange: setName, placeholder: '任务名', error: nameError })
h(Button, { variant: 'primary', onClick: save }, '保存')
h(Picker, {
  options: models,                 // [{ value, label }]
  value: current,
  onChange: (v) => setCurrent(v as string),
  searchable: true,
  clearable: true,
})
showToast('已保存', { variant: 'success' })`
const useUtils = `import { formatDateTime, relativeFuture, formatBytes } from 'dsh-plugin-core/utils'

formatDateTime(task.runAt, { seconds: true })   // 2026-10-18 09:30:05
relativeFuture(task.runAt, Date.now())          // 3 分钟后（未来时间用这个）
formatBytes(file.size)                          // 12 KB`
const useExplorer = `import { openFilePreview, pickWorkspaceFile } from 'dsh-plugin-core/explorer'

// 从 ctx 取出这一小块（不要传整个 ctx）
const workspaceFiles = ctx.remote.workspaceFiles

// 预览某文件：右侧分栏（挤窄 row 左边的主区，不是浮在上面）
openFilePreview({ mount: pageRowEl, workspaceFiles, sessionId, path: 'docs/requirements.md' })

// 让用户选文件：锚定按钮旁弹模态，Promise 返回 { path, isDir }（工作区相对路径）
const picked = await pickWorkspaceFile({ workspaceFiles, sessionId, anchor: btn, filter: { exts: ['ts'] } })`
const useSession = `import { openSessionView, SessionViewModal } from 'dsh-plugin-core/session'

// sessions / uiConversation 同样从 ctx 取出（懒得取就用官方 client 服务）
const view = openSessionView(sessions, uiConversation, sessionId, 'dsh-task-reminder')
if (view !== null) {
  h(SessionViewModal, {
    sessionId, view,
    // 关闭必须释放 retain 引用
    onClose: () => { view.dispose(); setOpen(false) },
    onOpenFile: (path) => openFilePreview({ mount: pageRowEl, workspaceFiles, sessionId, path }),
  })
}`
const cleanup = `kit.dispose()   // 撤掉 <style> 标签并清空登记域（插件卸载 / HMR）`

const doc: DocTopic = {
  title: { zh: '样例：从零接入一个插件', en: 'Example: integrate a plugin from scratch' },
  sections: [
    {
      id: 'quickstart',
      heading: { zh: '从零接入', en: 'Integrate from scratch' },
      prose: [
        {
          zh: '从装包到用上各子包的完整路径，示例都是可直接粘贴的最小可用版。',
          en: 'The full path from install to every subpackage, with copy-paste-ready minimal examples.',
        },
        { zh: '§0 装包：`react` 是 optional peer，只用 `utils` / `design` 的插件不必装。', en: '§0 Install: `react` is an optional peer — plugins using only `utils`/`design` need not install it.' },
        {
          zh: '§1 初始化样式（入口一次）：`id` 必须插件内唯一，多插件同页靠它互不覆盖；变量与类名固定 `dshpc` 前缀，不需传参。',
          en: '§1 Initialize styles (once at entry): `id` must be unique within the plugin so co-mounted plugins don’t clobber; vars and classes use the fixed `dshpc` prefix, no parameter.',
        },
        { zh: '§2 用一个控件', en: '§2 Use a control' },
        { zh: '§3 用通用方法', en: '§3 Use helpers' },
        {
          zh: '§4 接工作区浏览：`mount` 必填（预览面板是布局成员，占宽挤窄主区），传页面那层 flex 行。`sessionId` 必须属于该工作区。',
          en: '§4 Wire workspace browsing: `mount` is required (the preview panel is a layout member that takes width); pass the page’s flex row. `sessionId` must belong to that workspace.',
        },
        {
          zh: '§5 接会话预览：`openSessionView` 返回 `null` 表示该会话不可解析；拿到 view 后交给 `SessionViewModal`，关闭时记得 `dispose()`。',
          en: '§5 Wire session preview: `openSessionView` returns `null` when the session cannot be resolved; hand the view to `SessionViewModal` and remember `dispose()` on close.',
        },
        { zh: '§6 卸载清理（可选）', en: '§6 Teardown (optional)' },
      ],
      code: [
        { id: 'integration-install', lang: 'bash', src: install },
        { id: 'integration-init-style', lang: 'ts', src: initStyle },
        { id: 'integration-use-control', lang: 'tsx', src: useControl },
        { id: 'integration-use-utils', lang: 'ts', src: useUtils },
        { id: 'integration-use-explorer', lang: 'tsx', src: useExplorer },
        { id: 'integration-use-session', lang: 'tsx', src: useSession },
        { id: 'integration-cleanup', lang: 'ts', src: cleanup },
      ],
    },
    {
      id: 'reference',
      heading: { zh: '接入坑', en: 'Pitfalls' },
      prose: [
        { zh: '按踩频排序的常犯错误：', en: 'Common mistakes, ranked by frequency:' },
      ],
      api: [
        {
          id: 'integration-pitfalls',
          rows: [
            { name: '忘了 setStyleKit 就渲染控件', type: '现象：样式晚一帧或落到默认 style id', def: '—', desc: { zh: '入口处先调，再渲染', en: 'Call it at entry, then render' } },
            { name: '指望本包帮你引官方 @deepseek-ai/*', type: '现象：Node 下 ERR_MODULE_NOT_FOUND', def: '—', desc: { zh: '本包 ui 零官方依赖；要用官方件请自行处理平台模块', en: 'Our ui has zero official deps; handle platform modules yourself' } },
            { name: '给 read 少传第三参 range', type: "现象：远端拒：expected 3 business argument(s) … got 2", def: '—', desc: { zh: '一律显式传 {}', en: 'Always pass {} explicitly' } },
            { name: '用 relativePast 显示未来时间', type: '现象：「3 分钟后」显示成「刚刚」', def: '—', desc: { zh: '用 relativeFuture', en: 'Use relativeFuture' } },
            { name: '想让组件自己取工作区 / 模型列表', type: '现象：取不到（通道是插件私有的）', def: '—', desc: { zh: '数据经 props 给，宿主能力经接口注入', en: 'Data via props, host capability via injected interface' } },
            { name: '暗色不跟随宿主', type: '现象：插件固守一种明暗', def: '—', desc: { zh: '判据是 body[data-ds-dark-theme]，别用 prefers-color-scheme', en: 'Predicate is body[data-ds-dark-theme], not prefers-color-scheme' } },
          ],
        },
      ],
    },
  ],
}

export default doc
