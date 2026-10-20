// 预览站用的假数据 —— **只剩会话预览一处**（SessionPreview 自己还没有真数据源）。
//
// ⚠️ 工作区浏览（explorer）已不再有任何假数据：文件服务取宿主的
// `remote.workspaceFiles`（见 host-files.ts），样例文件是 `src/samples/` 下的真文件。
// 这里每删一处就少一处误解，别再往回加。
import type { SessionSource } from '../../../dist/session/index.js'

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

function bytesOfText(text: string): Uint8Array {
  return new TextEncoder().encode(text)
}

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}
