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
  options: priorities,             // [{ value, label }]：通用 Picker 的选项由调用方给
  value: current,
  onChange: (v) => setCurrent(v as string),
  searchable: true,
  clearable: true,
})
showToast('已保存', { variant: 'success' })`
const useModelCatalog = `// paths.ts —— 宿主与 client 共用同一个常量
export const MODELS_PATH = '/api/dsh-task-reminder/models'

// 宿主 apply：注册只读模型目录路由
import { serveModelCatalog } from 'dsh-plugin-core/host'
serveModelCatalog(ctx, { path: MODELS_PATH })

// client apply：接同一个 path
import { connectHost, refreshModelCatalog, ModelPicker } from 'dsh-plugin-core/ui'
connectHost(ctx, { modelsPath: MODELS_PATH })

// 三种形态共用同一份目录，onChange 一律发 provider/id
h(ModelPicker, { variant: 'cascade', value: current, onChange: setCurrent })
await refreshModelCatalog()   // 供应商 / 模型有增减时重拉（Promise）`
const useUtils = `import { formatDateTime, relativeFuture, formatBytes } from 'dsh-plugin-core/utils'

formatDateTime(task.runAt, { seconds: true })   // 2026-10-18 09:30:05
relativeFuture(task.runAt, Date.now())          // 3 分钟后（未来时间用这个）
formatBytes(file.size)                          // 12 KB`
const useExplorer = `import { connectFs, openFilePreview, pickWorkspaceFile } from 'dsh-plugin-core/adv/explorer'
import { serveFsRoute } from 'dsh-plugin-core/host'
import { FS_PATH } from './paths'   // 自己的常量，宿主与 client 共用

// 宿主 apply：挂只读文件路由（列目录 / 读文件都在它上面，不限工作区）
serveFsRoute(ctx, { path: FS_PATH })
// client apply：接同一个常量（connectHost(ctx) 照旧负责工作区快照）
connectFs({ path: FS_PATH })

// 预览某文件：右侧分栏（挤窄 row 左边的主区，不是浮在上面）；绝对 / 相对都收
// 落点给元素或选择器都行（openFilePreview({ mount: '#page-row' })），不必存 ref
openFilePreview({ mount: pageRowEl, path: '/abs/ws/docs/requirements.md' })

// 让用户选：锚定按钮旁弹模态，Promise 返回 { path: 绝对路径, isDir, workspaceRel?, workspace? }
const picked = await pickWorkspaceFile({ anchor: btn, filter: { exts: ['ts'] } })
const folder = await pickWorkspaceFile({ anchor: btn, filter: { dirs: true } })   // 只选文件夹`
const useSession = `import { openSessionView, SessionViewModal } from 'dsh-plugin-core/adv/session'

// sessions / uiConversation 同样从 ctx 取出（懒得取就用官方 client 服务）
const view = openSessionView(sessions, uiConversation, sessionId, 'dsh-task-reminder')
if (view !== null) {
  h(SessionViewModal, {
    sessionId, view,
    // 关闭必须释放 retain 引用
    onClose: () => { view.dispose(); setOpen(false) },
    // 文件出口：已经点开的那条会话 id 会作为第二参传进来（相对路径 / Office 都按它定位）
    onOpenFile: (path, sid, opts) => openFilePreview({ mount: pageRowEl, path, sessionId: sid, line: opts?.line }),
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
        { zh: '§2 用一个控件：通用 `Picker` 的选项由调用方给（示例里是 `priorities`，不是模型目录）。', en: '§2 Use a control: a generic `Picker` takes its options from the caller (`priorities` in the example, not a model catalog).' },
        {
          zh: '§2 附：选模型不要手搓数组 —— 宿主 `serveModelCatalog(ctx, { path })` 注册只读目录路由，client `connectHost(ctx, { modelsPath: path })` 用同一个 path 常量接上，再渲染 `ModelPicker`；首拉失败核心会退避重试 3 次，供应商 / 模型有增减时打开选择器或切回页面会自动补拉（30s 节流），要立刻刷新再调 `await refreshModelCatalog()`。漏了 `modelsPath` 就是空目录，且不会有报错。',
          en: '§2a Model selection: never hand-roll a models array. Register `serveModelCatalog(ctx, { path })` on the host, call `connectHost(ctx, { modelsPath: path })` on the client with the same path constant, then render `ModelPicker`. The first load retries 3 times with backoff; opening the picker or returning to the page re-pulls when providers change (throttled to once per 30s), and `await refreshModelCatalog()` forces an immediate refresh. Omitting `modelsPath` leaves the catalog empty, silently.',
        },
        { zh: '§3 用通用方法', en: '§3 Use helpers' },
        {
          zh: '§4 接文件浏览：`mount` 必填（预览面板是布局成员，占宽挤窄主区），传页面那层 flex 行——元素或选择器都行，解析不到就放弃、不回落 body；数据面要在宿主 `serveFsRoute` + client `connectFs` 用同一个 path 常量接上，浏览本身不需要会话。',
          en: '§4 Wire file browsing: `mount` is required (the preview panel is a layout member that takes width); pass the page’s flex row — an element or a selector, and an unresolvable selector abandons the open instead of falling back to `body`. Wire the data face with the same path constant on both sides (`serveFsRoute` / `connectFs`) — browsing itself needs no session.',
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
        { id: 'integration-use-model-catalog', lang: 'tsx', src: useModelCatalog },
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
            { name: '给通用 Picker 手搓 models 数组', type: '现象：候选写死 / 空目录', def: '—', desc: { zh: '选模型走 ModelPicker + 宿主 serveModelCatalog / client connectHost(ctx, { modelsPath }) 两段式接线', en: 'Use ModelPicker with the two-sided serveModelCatalog / connectHost(ctx, { modelsPath }) wiring' } },
            { name: 'connectHost(ctx) 不带 modelsPath', type: '现象：模型目录永远停在 loading，不报错', def: '—', desc: { zh: '模型目录不是快照，必须传宿主注册的同一个 path', en: 'The model catalog is an HTTP route, not a snapshot: pass the same path registered on the host' } },
            { name: '暗色不跟随宿主', type: '现象：插件固守一种明暗', def: '—', desc: { zh: '判据是 body[data-ds-dark-theme]，别用 prefers-color-scheme', en: 'Predicate is body[data-ds-dark-theme], not prefers-color-scheme' } },
          ],
        },
      ],
    },
  ],
}

export default doc
