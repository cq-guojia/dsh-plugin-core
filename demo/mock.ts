// 预览站用的假宿主数据——真实插件里这些由插件从 ctx 取出后注入。
import type { WorkspaceFilesFace } from '../dist/explorer/index.js'
import type { SessionSource } from '../dist/session/index.js'

const TREE: Record<string, { name: string; type: 'file' | 'directory'; size?: number }[]> = {
  '.': [
    { name: 'src', type: 'directory' },
    { name: 'docs', type: 'directory' },
    { name: 'README.md', type: 'file', size: 731 },
    { name: 'package.json', type: 'file', size: 605 },
    { name: 'logo.png', type: 'file', size: 24_576 },
  ],
  src: [
    { name: 'index.ts', type: 'file', size: 1_204 },
    { name: 'ui', type: 'directory' },
  ],
  'src/ui': [{ name: 'Picker.ts', type: 'file', size: 4_180 }],
  docs: [{ name: 'requirements.md', type: 'file', size: 8_960 }],
}

const TEXT: Record<string, string> = {
  'README.md': '# dsh-plugin-core\n\nDSH 插件共享底座。\n',
  'package.json': '{\n  "name": "dsh-plugin-core"\n}\n',
  'src/index.ts': "export * from './ui/index.js'\n",
  'src/ui/Picker.ts': 'export function Picker() { /* ... */ }\n',
  'docs/requirements.md': '# 需求文档\n\n（预览用假数据）\n',
}

/** 假 workspaceFiles：目录树是写死的，文件内容是假文本，图片给一张 1×1 PNG。 */
export const mockWorkspaceFiles: WorkspaceFilesFace = {
  async read(sessionId, path) {
    await delay(120)
    return { offset: 0, text: TEXT[path] ?? '（预览：该文件无假数据）', lines: 1, eof: true }
  },
  async readBytes(sessionId, path) {
    await delay(120)
    // 1×1 透明 PNG
    return {
      offset: 0,
      eof: true,
      data: new Uint8Array([
        0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
        0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4,
        0x89, 0x00, 0x00, 0x00, 0x0a, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9c, 0x63, 0x00, 0x01, 0x00, 0x00,
        0x05, 0x00, 0x01, 0x0d, 0x0a, 0x2d, 0xb4, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae,
        0x42, 0x60, 0x82,
      ]),
    }
  },
  async list(sessionId, path) {
    await delay(120)
    const key = path === '.' || path === '' ? '.' : path
    const entries = TREE[key]
    if (entries === undefined) throw new Error('not-directory')
    return { path, entries: entries.map((e) => ({ ...e })), truncated: false }
  },
}

/** 假会话源：几条固定消息，带一个附件。 */
export const mockSessionSource: SessionSource = {
  async listMessages(sessionId) {
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
      { id: '4', role: 'assistant', text: '构建完成，33 条自检全过。' },
    ]
  },
  async download(sessionId, path) {
    return new TextEncoder().encode(`预览假文件：${path}`)
  },
}

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}
