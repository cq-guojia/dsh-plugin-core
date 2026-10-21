// session 子包的使用帮助 —— 真源（TS 数据模块）。内容全在此一处，demo 与 md 都从这份派生。
import type { DocTopic } from '../doc-format.js'

const sourceShape = `interface SessionMessage {
  id: string
  role: 'user' | 'assistant' | 'tool' | 'system'
  text: string                 // 纯文本正文
  createdAt?: string
  attachments?: { name: string; path: string; bytes?: number }[]
}`

const usage = `import { SessionPreview } from 'dsh-plugin-core/session'

h(SessionPreview, {
  sessionId,
  source,                    // 从 ctx 取出后注入
  variant: 'modal',
  onClose: () => setOpen(false),
  renderMessage: (m) => h(RichMessage, { message: m }),  // 可选
})`

const doc: DocTopic = {
  title: { zh: 'session —— 会话预览', en: 'session — session preview' },
  exports: ['SessionPreview'],
  sections: [
    {
      id: 'session',
      heading: { zh: '会话预览', en: 'Session preview' },
      prose: [
        {
          zh: '依赖 ui。把「看一眼某个会话、看完即关」这件事封装起来：自动执行的任务想回看这次会话，不想开新窗口（回来还得找）。',
          en: 'Depends on ui. Wraps the "peek at a session and close when done" flow: for auto-run tasks you want to review this run without opening a new window.',
        },
        {
          zh: '弹窗只是当前的呈现方式，不是这个包的定义。将来也可能是侧边栏或整页 ⇒ 用 variant 切换。「纯 Modal 控件」在 ui 里，这里装的是「会话预览」这个功能。',
          en: 'A modal is only the current presentation; the package is defined by the feature, not the chrome. Future forms (sidebar, full page) switch via `variant`. The bare Modal lives in ui; this package owns the "session preview" feature.',
        },
        {
          zh: '数据形状（SessionMessage）；为什么注入能力而不是传静态数据：会话预览内部有交互（附件下载 / 打开文件），光有消息流不够用，它必须能回调宿主。',
          en: 'Data shape (SessionMessage); why inject capability instead of passing static data: the preview has interactions (attachment download / open file), so the message stream alone is insufficient — it must be able to call back into the host.',
        },
        {
          zh: '三态齐备：加载中 / 失败（带重试）/ 空。',
          en: 'All three states covered: loading / failure (with retry) / empty.',
        },
        {
          zh: '已知限制（重要）：默认渲染只有「角色 + 纯文本 + 附件」——官方会话 UI 的完整镜像（工具卡 / 代码块 / 推理行等）还没搬进本包。要长得像官方会话，请用 renderMessage 自己渲染，或等后续版本。无消息分页 / 增量加载，长会话一次全渲染。',
          en: 'Known limits (important): the default renderer only does "role + plain text + attachments" — the full mirror of the official session UI (tool cards / code blocks / reasoning rows) is not yet ported. To look like the official session, render via renderMessage yourself, or wait for a later version. No message pagination / incremental loading; long sessions render all at once.',
        },
        {
          zh: '定制边界：renderMessage 就是为「特殊定制」留的口子，换渲染器不用 fork 面板；换承载方式用 variant，不用改调用方结构；SessionSource 的方法签名若与宿主对不上，在插件侧做适配层——不要改本包接口去贴某个宿主导出版本。',
          en: 'Customization: renderMessage is the slot for special rendering — swap the renderer without forking the panel; switch presentation with variant without changing caller structure; if SessionSource’s signatures don’t match the host, build an adapter on the plugin side — do not bend this package’s interface to a specific host version.',
        },
      ],
      api: [
        {
          id: 'session-source',
          rows: [
            {
              name: 'listMessages',
              type: '(sessionId, signal?) => Promise<SessionMessage[]>',
              def: '—',
              required: '是',
              desc: { zh: '按会话取消息列表', en: 'Fetch the message list for a session' },
            },
            {
              name: 'download?',
              type: '(sessionId, path, signal?) => Promise<Uint8Array>',
              def: '—',
              desc: { zh: '下载附件；宿主没这能力就不显示下载钮', en: 'Download an attachment; if the host lacks it, no download button shows' },
            },
          ],
        },
        {
          id: 'session-preview',
          rows: [
            { name: 'sessionId', type: 'string', def: '—', required: '是', desc: { zh: '必填', en: 'Required' } },
            { name: 'source', type: 'SessionSource', def: '—', required: '是', desc: { zh: '必填，注入的取数能力', en: 'Required; the injected data capability' } },
            { name: 'variant', type: "'modal' | 'sidebar' | 'page'", def: "'modal'", desc: { zh: '承载方式', en: 'Presentation' } },
            { name: 'title', type: 'ReactNode', def: 'sessionId', desc: { zh: 'modal 形态的标题', en: 'Title of the modal form' } },
            { name: 'onClose', type: '() => void', def: '—', desc: { zh: '关闭回调', en: 'Close callback' } },
            { name: 'renderMessage', type: '(m: SessionMessage) => ReactNode', def: '内置最简渲染', desc: { zh: '★ 定制扩展点：富内容（工具卡 / 代码块 / 推理行）走这里', en: '★ Extension point: rich content (tool cards / code blocks / reasoning rows) goes here' } },
            { name: 'onOpenFile', type: '(path: string) => void', def: '—', desc: { zh: '点附件「打开」（通常交给 explorer）', en: 'Attachment "open" handler (usually delegated to explorer)' } },
            { name: 'translate', type: 'Translate', def: '内置', desc: { zh: '覆盖文案', en: 'Override copy' } },
          ],
        },
      ],
      code: [
        { id: 'session-source-shape', lang: 'ts', src: sourceShape },
        { id: 'session-usage', lang: 'tsx', src: usage },
      ],
    },
  ],
}

export default doc
