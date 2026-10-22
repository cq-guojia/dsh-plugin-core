// 预览站会话页的假数据：一份静态 ChatSnapshot 驱动的 SessionViewTarget。
//
// 为什么是假快照而不是接宿主：预览站要能离线看「长得像官方」的镜像渲染，
// 而真数据链（sessions.retain → uiConversation.target）只在宿主里活着
// （数据链本身另有 Node 单测全覆盖，见 test/session.test.mjs）。
// 覆盖的节点 kind 尽量全：触发行 / 用户消息（带官方 file 块附件）/ 过程行 /
// assistant-step（思考 + 文本 + 工具块）/ read（ReadBlock 分发链）/ write（DiffBlock + diffStat）/
// bash（TerminalBlock 分发链）/ running 半截 / present（交付文件行）/ 轮次失败 / 重试 /
// 尾部行（复制 / 分支 / 用量 pill / 时钟）/ turn 级交付文件卡。
import type { SessionViewTarget } from '../../../dist/session/index.js'

const now = Date.now()
const minute = 60_000

/** keyed 节点（官方 ChatNode 消费面）。 */
interface FakeNode {
  key: string
  kind: string
  anchorSeq: number
  data?: Record<string, unknown>
  location: { kind: 'turn' | 'step'; turn: { turn: number; status: 'open' | 'closed'; start?: { time: number }; end?: { time: number; data?: { reason?: { kind?: string } } } } }
}

/** 官方 TurnProcessChatData 消费面（turn-process 自身 data 兜底 + presentation.spec 同款）。 */
const TURN1_SPEC = {
  turn: 1,
  controlAnchorSeq: 3,
  processStartSeq: 4,
  answerAnchorSeq: 8,
  answerStep: 1,
  inlineReasoning: true,
  messageCount: 2,
  toolCallCount: 4,
  subagentCount: 0,
}

const NODES: readonly FakeNode[] = [
  {
    key: 'trig1', kind: 'turn-trigger', anchorSeq: 1,
    data: {
      source: { kind: 'schedule' },
      time: now - 42 * minute,
      content: [{ type: 'text', text: '定时触发：每日 09:30 构建镜像升级日报' }],
    },
    location: { kind: 'turn', turn: { turn: 1, status: 'closed', start: { time: now - 42 * minute } } },
  },
  {
    key: 'u1', kind: 'user', anchorSeq: 2,
    data: {
      content: [
        { type: 'text', text: '把这个包的构建跑一下，顺便看看有没有警告' },
        { type: 'file', attachment: { attachmentId: 'att-1', name: 'AGENTS.md', bytes: 2048 } },
      ],
    },
    location: { kind: 'turn', turn: { turn: 1, status: 'closed' } },
  },
  {
    key: 'tp1', kind: 'turn-process', anchorSeq: 3,
    data: TURN1_SPEC,
    location: { kind: 'turn', turn: { turn: 1, status: 'closed' } },
  },
  {
    key: 'a1', kind: 'assistant-step', anchorSeq: 4,
    data: {
      step: 1,
      blocks: [
        { kind: 'reasoning', text: '先跑类型检查，再看构建产物。\n**注意**：自检不过就停。' },
        { kind: 'text', text: '好的，我先看一眼依赖清单，再跑类型检查和自检。' },
        { kind: 'tool-call', callId: 'c1', name: 'read', argsRaw: '{}' },
      ],
    },
    location: { kind: 'step', turn: { turn: 1, status: 'closed' } },
  },
  {
    key: 'tc-read', kind: 'tool-call', anchorSeq: 5,
    data: {
      root: {
        kind: 'tool-result',
        call: { name: 'read', argsRaw: '{"file_path":"package.json"}' },
        content: [{ type: 'text', text: '<path>package.json</path>\n<type>file</type>\n<content>\n{\n  "name": "dsh-plugin-core"\n}\n</content>' }],
        meta: {
          path: 'package.json',
          offset: 1,
          lines: [
            { number: 1, text: '{' },
            { number: 2, text: '  "name": "dsh-plugin-core"' },
            { number: 3, text: '}' },
          ],
          totalLines: 3,
        },
      },
    },
    location: { kind: 'turn', turn: { turn: 1, status: 'closed' } },
  },
  {
    key: 'tc-write', kind: 'tool-call', anchorSeq: 6,
    data: {
      root: {
        kind: 'tool-result',
        call: { name: 'write', argsRaw: '{"file_path":"docs/日报.md","content":"# 镜像升级日报\\n"}' },
        content: [{ type: 'text', text: 'written 24 bytes' }],
        meta: { diffs: [{ path: 'docs/日报.md', oldText: null, newText: '# 镜像升级日报\n' }] },
      },
    },
    location: { kind: 'turn', turn: { turn: 1, status: 'closed' } },
  },
  {
    key: 'tc-bash', kind: 'tool-call', anchorSeq: 7,
    data: {
      root: {
        kind: 'tool-result',
        call: { name: 'bash', argsRaw: '{"command":"pnpm test","description":"跑自检"}' },
        content: [{ type: 'text', text: 'ℹ tests 90\nℹ pass 90\nℹ fail 0\n[exit code: 0]' }],
      },
    },
    location: { kind: 'turn', turn: { turn: 1, status: 'closed' } },
  },
  {
    key: 'tc-run', kind: 'tool-call', anchorSeq: 8,
    data: {
      root: { name: 'bash', argsRaw: '{"command":"pnpm build","description":"构建"}', phase: 'start' },
    },
    location: { kind: 'turn', turn: { turn: 1, status: 'closed' } },
  },
  {
    key: 'tc-present', kind: 'tool-call', anchorSeq: 9,
    data: {
      root: {
        kind: 'tool-result',
        call: {
          name: 'present',
          argsRaw: '{"files":[{"path":"docs/镜像升级日报.md","description":"本次交付的日报（含截图）"},{"path":"dist/bundle.js"}]}',
        },
        content: [{ type: 'text', text: 'presented 2 files' }],
      },
    },
    location: { kind: 'turn', turn: { turn: 1, status: 'closed' } },
  },
  {
    key: 'tail1', kind: 'turn-tail', anchorSeq: 10,
    data: {
      turn: 1,
      seq: 10,
      closing: { time: now - 8 * minute, blocks: [{ kind: 'text', text: '构建完成，90 条自检全过，交付文件已列出。' }] },
      tokenUsage: {
        totalTokens: 91_500,
        uncachedInputTokens: 12_000,
        cacheReadTokens: 70_000,
        cacheWriteTokens: 5_000,
        outputTokens: 4_500,
        reasoningTokens: 1_200,
        routes: [{ provider: 'deepseek', model: 'deepseek-chat' }],
      },
    },
    location: { kind: 'turn', turn: { turn: 1, status: 'closed', end: { time: now - 8 * minute } } },
  },
  {
    key: 'u2', kind: 'user', anchorSeq: 11,
    data: { content: [{ type: 'text', text: '继续：把这份日报也归档掉' }] },
    location: { kind: 'turn', turn: { turn: 2, status: 'closed', start: { time: now - 7 * minute } } },
  },
  {
    key: 'a2', kind: 'assistant-step', anchorSeq: 12,
    data: { step: 1, blocks: [{ kind: 'text', text: '好的，我来归档。' }] },
    location: { kind: 'step', turn: { turn: 2, status: 'closed' } },
  },
  {
    key: 'retry1', kind: 'model-retry', anchorSeq: 13,
    data: { retryState: 'started', retry: 2, maxRetries: 5, delayMs: 1868, mode: 'normal', failure: { message: '503 upstream', code: 'SERVER' } },
    location: { kind: 'turn', turn: { turn: 2, status: 'closed' } },
  },
  {
    key: 'err1', kind: 'turn-error', anchorSeq: 14,
    data: { message: '模型服务暂时不可用', code: 'SERVER', turn: 2 },
    location: { kind: 'turn', turn: { turn: 2, status: 'closed', end: { time: now - 1 * minute, data: { reason: { kind: 'error' } } } } },
  },
  {
    key: 'tail2', kind: 'turn-tail', anchorSeq: 15,
    data: { turn: 2, seq: 15, closing: null },
    location: { kind: 'turn', turn: { turn: 2, status: 'closed', end: { time: now - 1 * minute } } },
  },
]

const ORDER = NODES.map((n) => n.key)

/** turn 级交付文件（官方 owner.turn.data 是 Map；弹窗兼容 Map 与对象，这里用真 Map）。 */
function buildTurns(): Map<number, { status: 'open' | 'closed'; data: Map<string, unknown> }> {
  const deliverables = new Map<string, unknown>([
    ['deliverables', {
      presented: [
        { path: 'docs/镜像升级日报.md', description: '本次交付的日报（含截图）' },
        { path: 'dist/bundle.js' },
      ],
    }],
  ])
  const turns = new Map<number, { status: 'open' | 'closed'; data: Map<string, unknown> }>()
  turns.set(1, { status: 'closed', data: deliverables })
  turns.set(2, { status: 'closed', data: new Map() })
  return turns
}

/** 假 store：get + processSource（turn-process 节点给一份 presentation，供折叠判定）。 */
function buildStore(nodes: readonly FakeNode[]) {
  const byKey = new Map(nodes.map((n) => [n.key, n]))
  return {
    get(key: string) { return byKey.get(key) },
    processSource(key: string) {
      return {
        getSnapshot() {
          if (key !== 'tp1') return undefined
          return {
            turn: 1,
            spec: TURN1_SPEC,
            turnStarted: true,
            turnClosed: true,
            hasExternalProcess: true,
          }
        },
      }
    },
  }
}

/** 假弹窗数据源：快照恒定（无 retain / 无翻页），dispose 为空转。 */
export function mockSessionView(): SessionViewTarget {
  const chatSnap = { order: ORDER, nodes: buildStore(NODES), timeline: { turnOrder: [1, 2], turns: buildTurns() } }
  const sessionSnap = { openState: 'open' as const, hasMore: false }
  return {
    target: { getSnapshot: () => chatSnap, subscribe: () => () => {} },
    session: { getSnapshot: () => sessionSnap, subscribe: () => () => {} },
    loadOlder: () => {},
    dispose: () => {},
  }
}
