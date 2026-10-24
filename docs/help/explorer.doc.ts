// explorer 子包的使用帮助 —— 真源（TS 数据模块）。内容全在此一处，demo 与 md 都从这份派生。
import type { DocTopic } from '../design/doc-format.js'

const explorerUsage = `import { openFilePreview, pickWorkspaceFile } from 'dsh-plugin-core/explorer'

// 右侧分栏预览（占宽度、挤窄主区）
openFilePreview({ mount, workspaceFiles, officeToPdf, sessionId, path, rootName })

// path 传绝对路径时：按最长前缀匹配所属工作区，面包屑 / 目录树与 ▾「切工作区」自动可用
openFilePreview({ mount, workspaceFiles, sessionId, path: '/abs/path.md' })
// 要覆盖宿主快照才显式传 workspaceAnchors（带 path + sessionIds）
openFilePreview({ mount, workspaceFiles, sessionId, path: '/abs/path.md', workspaceAnchors })

// 锚定弹窗选文件（Promise 返回路径，不自己挂 dock）
const r = await pickWorkspaceFile({ workspaceFiles, sessionId, anchor, rootName })`

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
          zh: '浏览态停靠是布局成员（占宽度、挤窄主区），不要挂 `document.body` 再自己套 fixed。',
          en: 'The browse dock is a layout member (takes width, narrows the main area); never mount it on `document.body` with your own fixed positioning.',
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
          zh: '从 ctx 取出工作区快照再传给能力接口，不要传整个 ctx。',
          en: 'Pull the workspace snapshot out of ctx and hand it to the capability APIs; do not pass the whole ctx.',
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
              desc: { zh: '页面里的 flex 行；预览靠它占宽而不是浮在页面上方', en: 'The page’s flex row; the preview takes width there instead of floating' },
            },
            {
              name: 'opts.workspaceFiles',
              type: 'WorkspaceFilesFace',
              def: '—',
              desc: { zh: '从 ctx 取出的工作区文件服务；传 `content` 时可省', en: 'Workspace file service taken from ctx; optional when passing `content`' },
            },
            {
              name: 'opts.sessionId',
              type: 'string',
              def: '—',
              desc: { zh: '该工作区的真实会话 id（服务是会话作用域的）；传 `content` 时可省', en: 'A real session id of that workspace (the service is session-scoped); optional when passing `content`' },
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
