// explorer 子包的使用帮助 —— 真源（TS 数据模块）。内容全在此一处，demo 与 md 都从这份派生。
import type { DocTopic } from '../design/doc-format.js'

const explorerUsage = `import { openFilePreview, pickWorkspaceFile } from 'dsh-plugin-core/explorer'

// 只在 client apply 里接线一次（接工作区快照 + 读文件服务），之后不用再碰服务
connectHost(ctx)

// 右侧分栏预览（占宽度、挤窄主区）：一个容器 + 一个路径就够
openFilePreview({ mount, path: '/abs/ledger' })   // 文件夹 ⇒ 目录树；文件 ⇒ 直接预览
openFilePreview({ mount, path: 'docs/README.md' }) // 工作区相对路径也行

// 覆盖项：指定工作区快照 / 指定会话 / Office 转 PDF / 与别处共用的根缓存
openFilePreview({ mount, path, workspaceAnchors, sessionId, officeToPdf, rootCache })

// 锚定弹窗选文件（Promise 返回路径，不自己挂 dock）
const r = await pickWorkspaceFile({ anchor, filter: { exts: ['md'] } })`

const doc: DocTopic = {
  title: { zh: 'explorer —— 工作区浏览', en: 'explorer — Workspace browsing' },
  exports: ['openFilePreview', 'pickWorkspaceFile', 'FileBrowser', 'FilePreview'],
  sections: [
    {
      id: 'explorer',
      heading: { zh: '概览', en: 'Overview' },
      prose: [
        {
          zh: '提供工作区文件浏览与选择，数据来自宿主提供的工作区文件快照。',
          en: 'Workspace file browsing and picking, driven by the host-provided workspace file snapshot.',
        },
        {
          zh: '**接线归核心**：client `apply` 里调一次 `connectHost(ctx)`，读文件服务、会话 id、工作区快照都由核心自己解，调用时只给容器和路径。',
          en: '**Wiring belongs to core**: call `connectHost(ctx)` once in the client apply; the file service, session id and workspace snapshot are resolved by core — you only pass a container and a path.',
        },
        {
          zh: '落点只给一个元素：页面里**包住主区**的那个（核心会补成 flex 行、让主区伸展，关闭时还原），不要传 `document.body` 再自己套 fixed——那是浮层，不是分栏。',
          en: 'Pass one element: the one wrapping the main area. Core makes it a flex row and lets the main area stretch, restoring it on close. Never pass `document.body` with your own fixed positioning — that is an overlay, not a split.',
        },
        {
          zh: '绝对路径按最长前缀匹配所属工作区；落在任何工作区外时，文件照样能预览（官方 read 允许工作区外文件），只有目录树退化成只读路径栏。',
          en: 'Absolute paths are matched to their workspace by longest prefix. Outside every workspace the file still previews (official read allows it); only the directory tree degrades to a read-only path bar.',
        },
      ],
    },
    {
      id: 'explorer-install',
      heading: { zh: '0. 装包', en: '0. Install' },
      code: [{ id: 'explorer-install-code', lang: 'bash', src: 'pnpm add dsh-plugin-core' }],
    },
    {
      id: 'explorer-usage',
      heading: { zh: '1. 接入示例', en: '1. Usage' },
      prose: [
        {
          zh: '`connectHost(ctx)` 只收这一小块，不把整个 ctx 传进核心。',
          en: '`connectHost(ctx)` takes just that one slice; the whole ctx never enters core.',
        },
      ],
      code: [{ id: 'explorer-usage-code', lang: 'tsx', src: explorerUsage }],
    },
    {
      id: 'explorer-api',
      heading: { zh: 'API', en: 'API' },
      api: [
        {
          id: 'explorer-api-table',
          rows: [
            {
              name: 'openFilePreview(opts)',
              type: 'OpenFilePreviewOptions => FilePreviewHandle',
              def: '—',
              desc: {
                zh: '在右侧分栏打开文件 / 文件夹预览，返回可关闭它的句柄。预览内容二选一：`path`（核心解析并渲染）或 `content`（由调用方给内容）',
                en: 'Opens a file/folder preview in the right-side dock and returns a handle to close it. Body is one of two: `path` (resolved and rendered by core) or `content` (rendered from your own node)',
              },
            },
            {
              name: 'opts.mount',
              type: 'HTMLElement',
              def: '—',
              required: '是',
              desc: {
                zh: '页面里**包住主区**的那个元素；不必自己写 flex（核心补成 flex 行并让主区伸展，关闭时还原）。不要传 `document.body`',
                en: 'The element wrapping the main area; no flex needed (core turns it into a flex row, stretches the main area, and restores it on close). Never `document.body`',
              },
            },
            {
              name: 'opts.workspaceFiles',
              type: 'WorkspaceFilesFace',
              def: '—',
              desc: {
                zh: '读文件服务。**一般不用传**：`connectHost(ctx)` 接线后核心自己持有；传了以传入为准。传 `content` 时可省',
                en: 'File service. **Usually unnecessary**: core holds it after `connectHost(ctx)`; when passed it wins. Optional when passing `content`',
              },
            },
            {
              name: 'opts.sessionId',
              type: 'string',
              def: '—',
              desc: {
                zh: '该工作区的真实会话 id。**一般不用传**：按路径匹配所属工作区，匹配不出就取最近有会话的工作区；传 `content` 时可省',
                en: 'A real session id. **Usually unnecessary**: resolved from the path’s workspace, else the most recently updated workspace with a session; optional when passing `content`',
              },
            },
            {
              name: 'opts.path',
              type: 'string',
              def: '—',
              desc: { zh: '工作区相对路径；绝对路径会自动按最长前缀匹配所属工作区。与 `content` 二选一', en: 'Workspace-relative path; absolute paths are matched to their workspace by longest prefix. Mutually exclusive with `content`' },
            },
            {
              name: 'opts.content',
              type: '() => ReactNode',
              def: '—',
              desc: { zh: '自定义预览内容，塞进同一个右侧 dock；传它时不需要 `path`', en: 'Custom preview body rendered in the same dock; no `path` needed when set' },
            },
            {
              name: 'opts.officeToPdf',
              type: 'OfficeToPdfFace',
              def: '—',
              desc: { zh: 'Office 转 PDF 能力；缺失则该格式走「不支持」而不是报错', en: 'Office→PDF capability; without it that format shows "unsupported" instead of erroring' },
            },
            {
              name: 'opts.rootName',
              type: 'string',
              def: '—',
              desc: { zh: '兜底显示名（路径匹配不出工作区时用）', en: 'Fallback display name, used when no workspace matches the path' },
            },
            {
              name: 'pickWorkspaceFile(opts)',
              type: 'PickWorkspaceFileOptions => Promise<PickedFile>',
              def: '—',
              desc: { zh: '锚定按钮弹出模态选文件，解析出 `{ path, isDir }`', en: 'Anchored modal picker that resolves `{ path, isDir }`' },
            },
            {
              name: 'opts.anchor',
              type: 'HTMLElement',
              def: '—',
              required: '是',
              desc: { zh: '模态贴着它弹', en: 'The modal anchors next to it' },
            },
            {
              name: 'opts.filter',
              type: 'PickFilter',
              def: '—',
              desc: { zh: '按扩展名过滤 `{ exts: [\'md\'] }`；`dirs: true` 则只允许选文件夹', en: 'Filter by extension `{ exts: [\'md\'] }`; `dirs: true` restricts picking to folders' },
            },
          ],
        },
      ],
    },
  ],
}

export default doc
