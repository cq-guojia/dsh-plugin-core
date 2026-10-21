// 样例：从零接入一个插件 —— 真源（TS 数据模块）。内容全在此一处，demo 与 md 都从这份派生。
import type { DocTopic } from '../design/doc-format.js'

const install = `pnpm add dsh-plugin-core`
const initStyle = `// 插件 client 入口
import { createStyleKit } from 'dsh-plugin-core/design'
import { ensureControls, setStyleKit } from 'dsh-plugin-core/ui'

const kit = createStyleKit({ id: 'dsh-task-reminder-ui' })
setStyleKit(kit)
ensureControls()`
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

// 预览某文件/文件夹：右侧分栏（挤窄 row 左边的主区，不是浮在上面）
openFilePreview({ mount: pageRowEl, workspaceFiles, sessionId, path: 'docs/requirements.md' })

// 让用户选文件：锚定按钮旁弹模态，Promise 返回 { path, isDir }（工作区相对路径）
const picked = await pickWorkspaceFile({ workspaceFiles, sessionId, anchor: btn, filter: { exts: ['ts'] } })`
const useSession = `import { SessionPreview } from 'dsh-plugin-core/session'

const source = {
  listMessages: async (id) => (await api.get(\`/sessions/\${id}/messages\`)).data,
  download: async (id, path) => api.getBytes(\`/sessions/\${id}/file?path=\${path}\`),
}

h(SessionPreview, { sessionId, source, variant: 'modal', onClose: close })`
const cleanup = `kit.dispose()   // 撤掉 <style> 标签并清空登记域（插件卸载 / HMR）`

const doc: DocTopic = {
  title: { zh: '样例：从零接入一个插件', en: 'Example: integrate a plugin from scratch' },
  sections: [
    {
      id: 'quickstart',
      heading: { zh: '从零接入', en: 'Integrate from scratch' },
      prose: [
        {
          zh: '一个插件从装包到用上各子包的完整路径。复制粘贴级别的最小可用示例。',
          en: 'The full path from installing the package to using each subpackage. Copy-paste-level minimal example.',
        },
        {
          zh: '§0 装包：react 是 optional peer——只用 utils / design 的插件不必装。包里带预编译 dist（宿主以 git/npm 装插件不跑构建脚本，产物必须随包发布）。',
          en: '§0 Install: `react` is an optional peer — plugins using only utils/design need not install it. The package ships prebuilt dist (hosts install plugins without running build scripts, so artifacts must be published).',
        },
        {
          zh: '§1 初始化样式（一次）：id 必须插件内唯一（多插件同页靠它互不覆盖）；变量与类名统一使用 dshpc 前缀，不需要传参。',
          en: '§1 Initialize styles (once): `id` must be unique within the plugin (multiple plugins on one page rely on it to avoid clobbering); variables and class names uniformly use the `dshpc` prefix, no param needed.',
        },
        { zh: '§2 用一个控件', en: '§2 Use a control' },
        { zh: '§3 用通用方法', en: '§3 Use helpers' },
        {
          zh: '§4 接工作区浏览（要宿主能力）：mount 是必填——PanelDock 是布局成员（占宽度、把主区挤窄），没有布局位置就只能遮盖，所以要传你页面里那一层 flex 行，不要传 document.body 再自己套 fixed。浏览态停靠就是 FileBrowser 套在核心 PanelDock 里（openFilePreview 已经这么做了，面板用 header={null}：没有头部那条线，✕ 浮在右上角）。',
          en: '§4 Wire workspace browsing (needs host capability): `mount` is required — PanelDock is a layout member (takes width, narrows the main area), so without a layout slot it can only overlay; pass your page’s flex row, not `document.body` with your own fixed positioning. Browse-dock is FileBrowser inside the core PanelDock (openFilePreview already does this, with header={null}: no header line, ✕ floats top-right).',
        },
        {
          zh: 'sessionId 不是随便填的：workspaceFiles 是会话作用域服务，必须给属于该工作区的真实会话 id。从宿主工作区快照挑锚点用 pickWorkspaceAnchor(items)（ui 的 workspaceList 快照可直接喂进去）。',
          en: '`sessionId` is not arbitrary: workspaceFiles is a session-scoped service, so you must pass a real session id belonging to that workspace. Pick an anchor from the host workspace snapshot via pickWorkspaceAnchor(items) (ui’s workspaceList snapshot feeds in directly).',
        },
        { zh: '§5 接会话预览', en: '§5 Wire session preview' },
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
            { name: '直接 import 官方 @deepseek-ai/* 并指望本包帮你引', type: '现象：Node 下 ERR_MODULE_NOT_FOUND', def: '—', desc: { zh: '本包 ui 已零官方依赖；要用官方件就在插件侧自己处理平台模块', en: 'Our ui has zero official deps; handle platform modules on the plugin side' } },
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
