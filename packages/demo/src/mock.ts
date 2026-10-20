// 预览站用的假宿主数据——真实插件里这些由插件从 ctx 取出后注入。
import type { WorkspaceFilesFace, OfficeToPdfFace } from '../../../dist/explorer/index.js'
import type { SessionSource } from '../../../dist/session/index.js'

/** 假工作区根（宿主绝对路径形态，演示 stat 反推）。 */
const ROOT = '/home/demo-workspace'

const TREE: Record<string, string[]> = {
  '.': ['src', 'docs', 'assets', 'README.md', 'package.json', 'logo.png', 'notes.txt', 'big.log'],
  src: ['index.ts', 'ui', 'explorer'],
  'src/ui': ['Button.ts', 'Picker.ts'],
  'src/explorer': ['FileBrowser.ts', 'types.ts'],
  docs: ['requirements.md', 'guide.html', 'report.pdf', 'spec.docx', 'diagram.svg'],
  assets: ['logo.png', 'photo.jpg'],
}

const TEXT: Record<string, string> = {
  'README.md': '# dsh-plugin-core\n\nDSH 插件共享底座。\n',
  'package.json': '{\n  "name": "dsh-plugin-core"\n}\n',
  'notes.txt': '预览站假数据。\n',
  'src/index.ts': "export * from './ui/index.js'\n",
  'src/ui/Button.ts': 'export function Button() { /* ... */ }\n',
  'src/ui/Picker.ts': 'export function Picker() { /* ... */ }\n',
  'src/explorer/FileBrowser.ts': 'export function FileBrowser() { /* ... */ }\n',
  'src/explorer/types.ts': 'export interface WorkspaceFilesFace {}\n',
  'docs/requirements.md': '# 需求文档\n\n（预览用假数据）\n',
  'docs/guide.html':
    '<!DOCTYPE html><html><head><title>指南</title></head><body><h1>指南</h1><p>假 HTML。</p></body></html>\n',
}

/** 大文本文件：12000 行，演示 read 分页与「加载更多」。 */
const BIG_LINES = 12000
function bigLine(i: number): string {
  return `[${String(i).padStart(5, '0')}] dsh-plugin-core demo log line — 分页读取演示`
}

/** 1×1 透明 PNG。 */
const PNG_1X1 = new Uint8Array([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
  0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4,
  0x89, 0x00, 0x00, 0x00, 0x0a, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9c, 0x63, 0x00, 0x01, 0x00, 0x00,
  0x05, 0x00, 0x01, 0x0d, 0x0a, 0x2d, 0xb4, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae,
  0x42, 0x60, 0x82,
])

function bytesOfText(text: string): Uint8Array {
  return new TextEncoder().encode(text)
}

/** 假 PDF（头合法即可，浏览器 iframe 会按内置查看器渲染）。 */
function fakePdf(): Uint8Array {
  return bytesOfText('%PDF-1.4\n% 假 PDF（demo 数据）\n1 0 obj<</Type/Catalog>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF\n')
}

/** 假 workspaceFiles：树写死、文本按行分页、stat 反推绝对路径、错误码走信封。 */
export const mockWorkspaceFiles: WorkspaceFilesFace = {
  async read(_sessionId, path, range) {
    await delay(120)
    if (path === 'big.log') {
      const offset = range.offset ?? 0
      const limit = range.limit ?? 5000
      const end = Math.min(offset + limit, BIG_LINES)
      const lines: string[] = []
      for (let i = offset; i < end; i++) lines.push(bigLine(i))
      return { offset, text: lines.length === 0 ? '' : `${lines.join('\n')}\n`, lines: lines.length, eof: end >= BIG_LINES }
    }
    const text = TEXT[path]
    if (text === undefined) throw { code: 'workspace-file/not-text' }
    return { offset: 0, text, lines: text.split('\n').length, eof: true }
  },
  async readBytes(_sessionId, path) {
    await delay(120)
    if (path === 'docs/report.pdf') return { offset: 0, data: fakePdf(), eof: true }
    if (path === 'logo.png' || path === 'assets/logo.png') return { offset: 0, data: PNG_1X1, eof: true }
    if (path === 'docs/guide.html') return { offset: 0, data: bytesOfText(TEXT['docs/guide.html']), eof: true }
    if (path === 'docs/diagram.svg') {
      return { offset: 0, data: bytesOfText('<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect width="64" height="64" fill="#3b82f6"/></svg>'), eof: true }
    }
    throw { code: 'workspace-file/not-found' }
  },
  async list(_sessionId, path) {
    await delay(120)
    if (path === 'outside') {
      // 官方失败是 resolve 信封（不是 reject）——演示错误码分支
      return { ok: false, error: { code: 'workspace-file/outside-workspace' } } as never
    }
    const key = path === '.' || path === '' ? '.' : path
    const names = TREE[key]
    if (names === undefined) throw { code: 'workspace-file/not-directory' }
    return {
      path: key === '.' ? '' : key,
      truncated: false,
      entries: names.map((name) => ({
        name,
        type: name.includes('.') ? ('file' as const) : ('directory' as const),
        size: name.includes('.') ? 1024 : undefined,
      })),
    }
  },
  async stat(_sessionId, path) {
    await delay(80)
    return { absolutePath: `${ROOT}/${path}` }
  },
}

/** 假 officeToPdf：docx ⇒ PDF 字节信封（同 readBytes 的 data 字段）。 */
export const mockOfficeToPdf: OfficeToPdfFace = {
  async render(_sessionId, _path) {
    await delay(200)
    return { ok: true, value: { offset: 0, data: fakePdf(), eof: true } }
  },
}

/** 假会话源：几条固定消息，带一个附件。 */
export const mockSessionSource: SessionSource = {
  async listMessages(_sessionId) {
    await delay(150)
    return [
      { id: '1', role: 'user', text: '帮我把这个包构建一下' },
      {
        id: '2',
        role: 'assistant',
        text: '好的，我先跑类型检查，再出 dist。',
        attachments: [{ name: 'build.log', path: 'build.log', bytes: 2_048 }],
      },
      { id: '3', role: 'tool', text: 'tsc -p tsconfig.json → 0 error' },
      { id: '4', role: 'assistant', text: '构建完成，自检全过。' },
    ]
  },
  async download(_sessionId, path) {
    return bytesOfText(`预览假文件：${path}`)
  },
}

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}
