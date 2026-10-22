// 面板内只读会话弹窗（移植自兄弟项目 session-view.ts：决策 28 数据链 + 决策 34 渲染）。
// 「官方零件 + 自绘容器」，组件按官方文件名一一对应放在 ./mirror/。
//
// 与兄弟项目版本的差异（定制剥离，见 worklog 20261022-1148）：
//   · 不搬：顶部「接收/随附」输入区、outputs/processOutputs、ProcessFiles、标题任务名入口、
//     冷读探测、/api/present.host 桌面可用性、U11 页面级预览 dock（core 用 onOpenFile 出口）。
//   · 交付卡数据源只取快照 turn 级 deliverables.presented 同源推导（不接任务 DB）。
//   · 新增：底部**暂存输入框**（期4 用户流程）——打字 → 确定 → onContinue(message)，
//     由调用方完成 fork + host 侧 agent.send 起轮次 + 跳官方视图（官方能力，无歪门邪道）。
//   · retain source 参数化在 open-session-view.ts。
import { Fragment, createElement as h, useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import { Button, IconArchiveOutlineRegular, IconBranchOutlineRegular, IconCloseOutlineRegular, IconNewChatOutlineRegular, Modal } from '../ui/official.js'
import { ensureControls } from '../ui/css.js'
import type { Translate } from '../utils/i18n.js'
import type {
  AssistantBlockLike,
  ChatNodeFace,
  ChatNodeStoreFace,
  ChatViewFace,
  ContentBlockLike,
  ConversationNodeLike,
  SessionSnapshotFace,
} from './faces.js'
import type { SessionViewTarget } from './open-session-view.js'
import { ChatHint, ChatNodeListMirror, ChatOlderButton, ChatViewFrame } from './mirror/ChatView.js'
import { type NodeRenderer, type TurnProcessHandle, type TurnLocationFace } from './mirror/ChatNodeSeat.js'
import { GenericCommandCard } from './mirror/GenericCommandCard.js'
import { MessageIconActionsMirror } from './mirror/MessageIconActions.js'
import { AssistantMarkdown, ModelRetryItemMirror, TurnErrorItemMirror, TurnMaxTokensItemMirror, UserMessage, type RetryAttemptFace, type TurnErrorFace } from './mirror/MessageItem.js'
import { ReasoningRowMirror } from './mirror/ReasoningRow.js'
import { TurnProcessNodeViewMirror } from './mirror/TurnProcessNodeView.js'
import { TurnTailNodeViewMirror, type TurnTailDataFace } from './mirror/TurnTailNodeView.js'
import { TurnTriggerNodeViewMirror } from './mirror/TurnTriggerNodeView.js'
import { DeliverablesGridMirror, PresentRowMirror, type DeliveredFileFace } from './mirror/Deliverables.js'
import { buildProcessGroups } from './mirror/process-groups.js'
import { officialClass, officialModuleCount, ocOr } from './official-classes.js'
import { t as defaultT } from '../utils/i18n.js'

/** 稳定的空序列（避免默认值每次新建数组）。 */
const EMPTY_ORDER: readonly string[] = []

/** 官方样式缺失告警只打一次（避免每次渲染刷屏）。 */
let officialWarned = false

// ─────────────────────────── 纯函数：内容块 → 可读文本 / 文件 ───────────────────────────

/** JSON 安全序列化（循环引用 / 特殊值不抛）。 */
function safeJson(value: unknown): string {
  try {
    return JSON.stringify(value, null, 2) ?? String(value)
  } catch {
    return String(value)
  }
}

/** 提取内容块的可读文本：text 拼接、图片占位（官方 ContentBlock 是 merge-extensible map）。 */
function contentText(blocks: readonly ContentBlockLike[] | undefined): string {
  if (blocks === undefined) return ''
  const parts = blocks.map((block) => {
    if (block !== null && typeof block === 'object' && block.type === 'text' && typeof block.text === 'string') return block.text
    if (block !== null && typeof block === 'object' && block.type === 'image') return '[图片]'
    return ''
  }).filter(part => part !== '')
  return parts.join('\n')
}

/**
 * 提取内容块里的**官方 file 块**（2026-10-03 核实）：随附文件以官方附件形式发进会话后，
 * 会话快照的 user 节点 content 里就是它 ⇒ 弹窗里照样渲染成附件卡（与官方页一致）。
 * 拿不到（宿主投影未透传）⇒ 空数组：附件卡不渲染，**绝不造一个假卡**。
 *
 * @returns `files` = 去重后要画的附件；`hadFiles` = 该轮**原本**有没有 file 块
 * （去重让位后可能为空 —— 调用方据此判断该轮要不要渲染，不能因为让位把整条消息吞掉）。
 */
function contentFiles(
  blocks: readonly ContentBlockLike[] | undefined,
  /** 已解析出路径的文件名 ⇒ 这里让位，避免同一个文件同屏出现两次。 */
  exclude?: ReadonlySet<string>,
): { files: readonly { name: string; bytes: number }[]; hadFiles: boolean } {
  if (blocks === undefined) return { files: [], hadFiles: false }
  const out: { name: string; bytes: number }[] = []
  let hadFiles = false
  for (const block of blocks) {
    if (block === null || typeof block !== 'object' || block.type !== 'file') continue
    const attachment = block.attachment
    if (typeof attachment !== 'object' || attachment === null) continue
    hadFiles = true
    const name = typeof attachment.name === 'string' && attachment.name !== '' ? attachment.name : 'file'
    if (exclude !== undefined && exclude.has(name)) continue
    out.push({ name, bytes: typeof attachment.bytes === 'number' ? attachment.bytes : 0 })
  }
  return { files: out, hadFiles }
}

/** legacy assistant 节点的纯文本（复制按钮用）。 */
function assistantText(node: ConversationNodeLike): string {
  return (node.blocks ?? []).map(block => block.kind === 'text' ? block.text : '').join('')
}

// ─────────────────────────── keyed 节点流的数据读取助手 ───────────────────────────

/** keyed 节点的 data（官方 ChatNodeDataMap[kind]）。 */
function dataOf(node: ChatNodeFace): Record<string, unknown> {
  return node.data ?? {}
}

/** 节点位置 → turn 位置（官方 node.location 收窄，ChatNodeSeat.tsx:1660 的反向）。 */
function turnLocationOf(node: ChatNodeFace): TurnLocationFace | undefined {
  const location = node.location
  return location?.kind === 'turn' || location?.kind === 'step' ? location.turn : undefined
}

/** 官方 AssistantChatData.blocks（ui-chat contract/chat-nodes.d.ts:22）。 */
function blocksOf(value: unknown): readonly AssistantBlockLike[] | undefined {
  return Array.isArray(value) ? value as readonly AssistantBlockLike[] : undefined
}

/**
 * 官方 ToolCallBlock（uic contract/records.d.ts:140）→ 工具卡 props。
 * running 半截（phase: preparing/start）只有 name/argsRaw；settled（kind: tool-result）带输出与错误。
 */
function toolCallCard(node: ChatNodeFace, t: Translate, onOpenFile?: (path: string) => void): Parameters<typeof GenericCommandCard>[0] | null {
  const root = dataOf(node).root as Record<string, unknown> | undefined
  if (root === undefined || root === null) return null
  const settled = root.kind === 'tool-result'
  const call = settled ? root.call as Record<string, unknown> | undefined : root
  const error = root.error as { name?: string; code?: string } | undefined
  return {
    name: typeof call?.name === 'string' ? call.name : 'tool',
    argsRaw: typeof call?.argsRaw === 'string' ? call.argsRaw : '',
    output: settled ? contentText(root.content as readonly ContentBlockLike[] | undefined) : '',
    isError: root.isError === true,
    errorName: error?.name,
    meta: root.meta,
    settled,
    phase: settled ? undefined : root.phase === 'preparing' ? 'preparing' : 'start',
    interrupted: error?.code === 'interrupted',
    onOpenFile,
    t,
  }
}

/** 官方 Tool / ToolResult block 是否为 present 调用（交付文件行专属渲染；running 名在顶层，结算名在 call 里）。 */
function isPresentRoot(root: unknown): boolean {
  if (typeof root !== 'object' || root === null) return false
  const r = root as { name?: unknown; kind?: unknown; call?: { name?: unknown } | null }
  if (r.name === 'present') return true
  return r.kind === 'tool-result' && r.call !== null && typeof r.call === 'object' && r.call.name === 'present'
}

/** 官方 present 调用参数里的 files（deliverables/presented 事件同源数据）。 */
function presentFiles(root: unknown): DeliveredFileFace[] {
  if (typeof root !== 'object' || root === null) return []
  const r = root as { kind?: unknown; call?: { argsRaw?: unknown } | null; argsRaw?: unknown; isError?: unknown }
  const settled = r.kind === 'tool-result'
  if (r.isError === true) return []
  const raw = settled ? r.call?.argsRaw : r.argsRaw
  if (typeof raw !== 'string') return []
  try {
    const parsed = JSON.parse(raw) as unknown
    const files = (parsed as { files?: unknown } | null)?.files
    if (!Array.isArray(files)) return []
    const out: DeliveredFileFace[] = []
    for (const file of files) {
      if (typeof file !== 'object' || file === null) continue
      const path = (file as { path?: unknown }).path
      if (typeof path !== 'string' || path.trim() === '') continue
      const description = (file as { description?: unknown }).description
      out.push(typeof description === 'string' && description.trim() !== '' ? { path, description } : { path })
    }
    return out
  } catch {
    return []
  }
}

/**
 * keyed 节点 → 视图（等价于官方 slot "conversation.chat.node" 的按 kind 分发）。
 * @param node - keyed ChatNode。
 * @param turnProcess - seat 下发的过程席位（turn-process / 折叠答案节点要用）。
 * @param t - 翻译席位。
 * @param onBranchAt - 消息行分支按钮（以该轮 tail seq 开分支；undefined = 不渲染按钮）。
 * @param fileOpen - 文件打开上下文（undefined = 链接全部降级为纯文本）。
 * @param groupPart - 过程分组侧（'response' | 'reasoning'）。
 * @returns 节点视图；null = 决策 28 过滤的噪音 kind。
 */
function renderKeyedNode(
  node: ChatNodeFace,
  turnProcess: TurnProcessHandle | undefined,
  t: Translate,
  onBranchAt: ((seq: number) => void) | undefined,
  fileOpen: FileOpenFace | undefined,
  groupPart?: 'response' | 'reasoning',
  /** 交付文件（快照 turn 级 deliverables.presented 同源推导）；undefined/空 = 不渲染网格。 */
  deliverFiles?: readonly DeliveredFileFace[],
  /** 最后一轮 turn-tail 的 turn 号：交付卡只挂在这里（官方 DeliverablesTail 位置 = 每轮收尾之后）。 */
  lastTailTurn?: number,
): ReturnType<typeof h> | null {
  switch (node.kind) {
    case 'turn-trigger':
      return h(TurnTriggerNodeViewMirror, { data: node.data, t })
    case 'turn-process':
      return turnProcess === undefined ? null : h(TurnProcessNodeViewMirror, {
        turn: turnLocationOf(node),
        turnProcess,
        t,
      })
    case 'turn-tail': {
      // 官方 turnTail 插槽（DeliverablesTail 同位）：交付卡网格渲染在 TurnTailNodeView 的
      // tailSlot 里，即在 MessageIconActions（复制/分支/用量/时钟行）之前。
      // 数据 = 快照 turn 级 deliverables.presented 同源推导，只挂最后一轮 tail。
      const data = node.data as unknown as TurnTailDataFace | undefined
      const turn = data?.turn ?? turnLocationOf(node)?.turn
      const atLastTail = turn !== undefined && lastTailTurn !== undefined && turn === lastTailTurn
      const showGrid = deliverFiles !== undefined && deliverFiles.length > 0 && atLastTail
      const tailSlot = showGrid
        ? h(DeliverablesGridMirror, { files: deliverFiles, onOpen: fileOpen?.open, t })
        : null
      const tail = data === undefined || data.closing === null || data.closing === undefined
        ? null
        : h(TurnTailNodeViewMirror, { data, onBranchAt, tailSlot, t })
      return tail
    }
    case 'assistant-step': {
      // 官方块渲染器（lib/client.js:5818-5871）：
      //   · 整步只有 tool-call 块 ⇒ 整步不渲染（工具调用由独立的 tool-call 节点画）；
      //   · tool-call 块一律跳过（case "tool-call": break）——重复渲染卡片即真机踩过的「编辑/写入×2」；
      //   · groupPart 'reasoning' 只画思考块、'response' 跳过思考块；未分组全画（除工具块）。
      const blocks = blocksOf(dataOf(node).blocks) ?? []
      const contentBlocks = blocks.filter(block => block.kind !== 'tool-call')
      if (blocks.length > 0 && contentBlocks.length === 0) return null
      const visible = groupPart === 'reasoning'
        ? contentBlocks.filter(block => block.kind === 'reasoning')
        : groupPart === 'response'
          ? contentBlocks.filter(block => block.kind !== 'reasoning')
          : contentBlocks
      const parts = assistantBlocks(visible, t, fileOpen?.mentions)
      return parts.length === 0 ? null : h('div', { className: 'dshpc-sv-assistant' }, parts)
    }
    case 'tool-call': {
      // present（交付文件）走官方 tool.call.toolview 槽位 key='present' 的专属 PresentRow
      // （标题「交付文件」+ 状态词 + 路径列表；不经通用工具卡）。
      const root = dataOf(node).root
      if (isPresentRoot(root)) return h(PresentRowMirror, { block: root, t })
      const card = toolCallCard(node, t, fileOpen?.open)
      return card === null ? null : h(GenericCommandCard, card)
    }
    case 'user':
    case 'steering': {
      const blocks = dataOf(node).content as readonly ContentBlockLike[] | undefined
      const text = contentText(blocks)
      // 随附文件（官方 file 块）：没有文本但有附件时**照样渲染**（不能整条消失）。
      const { files, hadFiles } = contentFiles(blocks)
      if (text === '' && !hadFiles) return null
      return h(UserMessage, { text, files })
    }
    case 'turn-error':
      return h(TurnErrorItemMirror, { node: dataOf(node) as TurnErrorFace, t })
    case 'turn-max-tokens':
      return h(TurnMaxTokensItemMirror, { t })
    case 'model-retry': {
      // 官方 RetryNodeView（lib/client.js:1493）：只画 data.current（链上最近一次尝试），
      // active = retryState === 'scheduled'。keyed 节点 data = { attempts, current }；
      // 数据薄时兜底取 attempts 末项（与官方 buildViewNode 的 current 取法同构）。
      const data = dataOf(node)
      const attempts = Array.isArray(data.attempts) ? data.attempts as RetryAttemptFace[] : []
      const current = (typeof data.current === 'object' && data.current !== null
        ? data.current
        : attempts[attempts.length - 1]) as RetryAttemptFace | undefined
      if (current === undefined) return null
      return h(ModelRetryItemMirror, { node: current, active: current.retryState === 'scheduled', t })
    }
    // 决策 28：context（系统注入）/ compaction / unknown 仍默认过滤；
    // ⚠ ui-map §十一-B：官方 ContextInjectionRow / SystemPromptRow 待实施——届时从这里放行。
    case 'context':
    case 'compaction':
    case 'manual-compaction':
    case 'unknown':
      return null
    default:
      // 决策 28：不认识的 kind 一律 fallback（折叠原文），升级不白屏。
      return h('details', { className: 'dshpc-sv-tool' },
        h('summary', { className: 'dshpc-sv-notice' }, `${t('sessionUnknownKind')} ${node.kind}`),
        h('pre', null, safeJson(node.data)),
      )
  }
}

/**
 * assistant 内容块 → 子元素数组（官方块渲染器 lib/client.js:5826-5870 的同构）：
 * text → 官方 MarkdownText、reasoning → 官方 ReasoningRow（标题「思考」）、image 占位；
 * tool-call 块一律跳过（官方 case "tool-call": break——由独立工具节点渲染，重复画 = ×2）；
 * 未知块折叠原文。
 */
function assistantBlocks(
  blocks: readonly AssistantBlockLike[] | undefined,
  t: Translate,
  fileMentions?: FileOpenFace['mentions'],
): ReturnType<typeof h>[] {
  if (blocks === undefined) return []
  const parts: ReturnType<typeof h>[] = []
  blocks.forEach((block, index) => {
    switch (block.kind) {
      case 'text':
        if (block.text.trim() !== '') parts.push(h(AssistantMarkdown, { key: `t${index}`, text: block.text, fileMentions }))
        break
      case 'reasoning':
        if (block.text.trim() !== '') parts.push(h(ReasoningRowMirror, { key: `r${index}`, text: block.text, t }))
        break
      case 'image':
        parts.push(h('div', { key: `i${index}`, className: 'dshpc-sv-image' }, '[图片]'))
        break
      case 'tool-call':
        break
      default:
        // 未知 block：折叠原文，升级不白屏。
        parts.push(h('details', { key: `o${index}`, className: 'dshpc-sv-tool' },
          h('summary', null, t('sessionUnknownKind')),
          h('pre', null, safeJson(block.block)),
        ))
    }
  })
  return parts
}

// ─────────────────────────── legacy 兜底渲染（order 缺失时） ───────────────────────────

/**
 * legacy 兜底渲染：官方兼容投影（老 kind 名）的单个节点；返回 null = 按决策 28 过滤的噪音 kind。
 * 仅在 keyed `order` 缺失时使用（正常路径见 renderKeyedNode）。
 */
function renderLegacyNode(
  node: ConversationNodeLike,
  t: Translate,
  fileOpen?: FileOpenFace,
): ReturnType<typeof h> | null {
  switch (node.kind) {
    case 'user':
    case 'steering': {
      const text = contentText(node.content)
      const { files, hadFiles } = contentFiles(node.content)
      if (text === '' && !hadFiles) return null
      return h(UserMessage, { key: node.seq, text, files })
    }
    case 'assistant': {
      const parts = assistantBlocks(node.blocks, t, fileOpen?.mentions)
      return parts.length === 0 ? null : h('div', { key: node.seq, className: 'dshpc-sv-assistant' }, parts)
    }
    case 'tool-result': {
      if (node.call?.name === 'present') return h(PresentRowMirror, { key: node.seq, block: node, t })
      return h(GenericCommandCard, {
        key: node.seq,
        name: node.call?.name ?? 'tool',
        argsRaw: node.call?.argsRaw ?? '',
        output: contentText(node.content),
        isError: node.isError === true,
        errorName: node.error?.name,
        meta: node.meta,
        settled: true,
        interrupted: (node.error as { code?: string } | undefined)?.code === 'interrupted',
        onOpenFile: fileOpen?.open,
        t,
      })
    }
    case 'command': {
      return h(GenericCommandCard, {
        key: node.seq,
        name: `/${node.name ?? '?'}`,
        argsRaw: node.args ?? '',
        output: node.outcome?.text ?? '',
        isError: node.outcome?.kind === 'error',
        t,
      })
    }
    case 'turn-error':
      return h(TurnErrorItemMirror, { key: node.seq, node, t })
    case 'turn-max-tokens':
      return h(TurnMaxTokensItemMirror, { key: node.seq, t })
    case 'model-retry':
      // legacy 兼容投影的 model-retry = 单次尝试（ModelRetryNode 扁平节点）。
      return h(ModelRetryItemMirror, { key: node.seq, node, active: node.retryState === 'scheduled', t })
    // 决策 28：默认过滤的噪音 kind —— context（系统注入）、compaction（压缩标记）、
    // unknown（未知事件面）。assistant 里的 reasoning 由 mirror/ReasoningRow 折叠渲染。
    // ⚠ ui-map §十一-B：系统提示/上下文注入行（官方 ContextInjectionRow）待实施——届时从这里放行。
    case 'context':
    case 'compaction':
    case 'unknown':
      return null
    default:
      // 决策 28：不认识的 kind 一律 fallback（折叠原文），升级不白屏。
      return h('details', { key: node.seq, className: 'dshpc-sv-tool' },
        h('summary', { className: 'dshpc-sv-notice' }, `${t('sessionUnknownKind')} ${node.kind}`),
        h('pre', null, safeJson(node)),
      )
  }
}

/** 渲染项：单节点，或一组被折叠的「过程」（连续工具调用）。 */
type RenderItem = { kind: 'node'; node: ConversationNodeLike } | { kind: 'process'; nodes: ConversationNodeLike[] }

/**
 * 把连续的 tool-result / command 收成一个「过程」组——官方就是把工具调用折进
 * turn 的过程块（默认收起），页面才不会变成一列流水账。单个工具不再包组，避免多一层。
 */
function groupNodes(list: readonly ConversationNodeLike[]): RenderItem[] {
  const out: RenderItem[] = []
  let run: ConversationNodeLike[] = []
  const flush = (): void => {
    if (run.length === 0) return
    const only = run[0]
    if (only === undefined) { run = []; return }
    if (run.length >= 2) out.push({ kind: 'process', nodes: run })
    else out.push({ kind: 'node', node: only })
    run = []
  }
  for (const node of list) {
    if (node.kind === 'tool-result' || node.kind === 'command') { run.push(node); continue }
    flush()
    out.push({ kind: 'node', node })
  }
  flush()
  return out
}

/** legacy 兜底整流的渲染（keyed order 缺失时才会走到）。 */
function renderLegacyRows(
  nodes: readonly ConversationNodeLike[],
  t: Translate,
  fileOpen?: FileOpenFace,
): ReturnType<typeof h>[] {
  const items = groupNodes(nodes)
  const rows: ReturnType<typeof h>[] = []
  items.forEach((entry, index) => {
    const parts: ReturnType<typeof h>[] = []
    if (entry.kind === 'process') {
      // legacy 兜底没有 turn 位置 ⇒ 拿不到官方「用时 N 秒」行，退回计数行。
      parts.push(h('div', { key: 'lead', className: 'dshpc-sv-notice' }, `${t('sessionProcess')} · ${entry.nodes.length}`))
      entry.nodes.forEach((node, i) => {
        const rendered = renderLegacyNode(node, t, fileOpen)
        if (rendered !== null) parts.push(h('div', { key: `p${i}` }, rendered))
      })
    } else {
      const inner = renderLegacyNode(entry.node, t, fileOpen)
      if (inner !== null) parts.push(inner)
      if (entry.node.kind === 'assistant') {
        const next = items[index + 1]
        const isTurnEnd = next === undefined || !(next.kind === 'node' && next.node.kind === 'assistant')
        if (isTurnEnd) parts.push(h(MessageIconActionsMirror, { key: 'act', text: assistantText(entry.node), clock: 'end', t }))
      }
    }
    if (parts.length === 0) return
    rows.push(h('div', { key: `lg${index}`, className: ocOr('ChatView', 'flowItem', 'dshpc-sv-flowitem') }, parts))
  })
  return rows
}

// ─────────────────────────── 文件词表与交付文件（U11 文件显示逻辑） ───────────────────────────

/** 官方 MarkdownText.fileMentions 的消费面（resolve 命中渲成链接，解析不出保持惰性 code）。 */
interface FileMentionsFace {
  resolve(value: string): { open(): void; label: string; title: string } | undefined
}

/** 文件打开上下文：openFile 单一入口（工具卡路径 + md 行内引用共用）+ 词表。 */
interface FileOpenFace {
  open(path: string): void
  mentions: FileMentionsFace
}

/** 路径归一：去 './' 前缀（词表键与 resolve 两侧同规则）。 */
function normalizeFilePath(p: string): string {
  let s = p.trim()
  while (s.startsWith('./')) s = s.slice(2)
  return s
}

/**
 * 取某 turn 的交付文件清单（官方 `DeliverablesTail` 同源数据）。
 * ⚠️ 官方 `turn.data` 是 **Map**（见 @deepseek-ai/dsh-client-ui-deliverables
 * `owner.turn.data.get('deliverables')`），不是普通对象——对象式 `data.deliverables`
 * 访问对 Map 必为 undefined。这里兼容 Map 与纯对象两种形态。
 */
function turnDeliverablesPresented(face: unknown): ReadonlyArray<{ path?: unknown; description?: unknown }> {
  const data = (face as { data?: unknown } | undefined)?.data
  const delivered = data instanceof Map
    ? (data as ReadonlyMap<unknown, unknown>).get('deliverables')
    : (data as { deliverables?: unknown } | undefined)?.deliverables
  const presented = (delivered as { presented?: unknown } | undefined)?.presented
  return Array.isArray(presented) ? (presented as ReadonlyArray<{ path?: unknown; description?: unknown }>) : []
}

/**
 * 从 keyed 节点流收集真实文件词表（禁模拟：全部来自工具调用参数 / meta.diffs）：
 * tool-call 节点 argsRaw 的 file_path/path 字段（read/grep/glob/write/edit…）与
 * tool-fs 写入 meta.diffs[].path。会话级词表 = 官方 per-turn chatFileMentions 的简化偏差
 * （决策 39：resolve 命中才渲链接，解析不出保持惰性 code，永不猜）。
 */
function collectFilePaths(order: readonly string[], store: ChatNodeStoreFace | undefined, turns: unknown): string[] {
  if (store === undefined) return []
  const out = new Set<string>()
  // 交付文件（presented）：会话 turn 级 deliverables.presented，同源覆盖 present 工具与插件代写。
  if (turns !== null && turns !== undefined) {
    const map = turns as ReadonlyMap<unknown, unknown>
    for (const [, face] of map) {
      const presented = turnDeliverablesPresented(face)
      for (const file of presented) {
        const path = typeof file?.path === 'string' ? file.path : undefined
        if (path !== undefined && path.trim() !== '') out.add(normalizeFilePath(path))
      }
    }
  }
  for (const key of order) {
    const node = store.get(key)
    if (node === undefined || node.kind !== 'tool-call') continue
    const root = (node.data as { root?: Record<string, unknown> } | undefined)?.root
    if (root === undefined || root === null || typeof root !== 'object') continue
    if (isPresentRoot(root)) {
      // present（交付文件）：files[].path 全进词表（官方 chatFileMentions 同源：produced + presented）。
      for (const file of presentFiles(root)) out.add(normalizeFilePath(file.path))
      continue
    }
    const call = (root.kind === 'tool-result' ? root.call : root) as Record<string, unknown> | undefined
    if (call === null || typeof call !== 'object') continue
    const raw = typeof call.argsRaw === 'string' ? call.argsRaw.trim() : ''
    if (raw.startsWith('{')) {
      try {
        const parsed = JSON.parse(raw) as Record<string, unknown>
        for (const field of ['file_path', 'path']) {
          const value = parsed[field]
          if (typeof value === 'string' && value.trim() !== '') out.add(normalizeFilePath(value))
        }
      } catch { /* 非法 JSON 不进词表 */ }
    }
    const meta = root.meta
    if (typeof meta === 'object' && meta !== null) {
      const diffs = (meta as { diffs?: unknown }).diffs
      if (Array.isArray(diffs)) {
        for (const diff of diffs) {
          const p = (diff as { path?: unknown } | null)?.path
          if (typeof p === 'string' && p.trim() !== '') out.add(normalizeFilePath(p))
        }
      }
    }
  }
  return [...out]
}

/**
 * 每轮交付文件（官方 DeliverablesTail 同源数据）：读会话 turn 级 `deliverables.presented`。
 * 按 turn 归组、按路径去重（后者覆盖前者，与官方 presentedForClosing 的 map 语义一致）。
 * 纯客户端推导，零额外请求。
 */
function collectPresentedByTurn(turns: unknown): ReadonlyMap<number, readonly DeliveredFileFace[]> {
  const out = new Map<number, readonly DeliveredFileFace[]>()
  if (turns === null || turns === undefined) return out
  const map = turns as ReadonlyMap<unknown, unknown>
  for (const [key, face] of map) {
    const turn = typeof key === 'number' ? key : Number(key)
    if (!Number.isInteger(turn) || turn < 1) continue
    const presented = turnDeliverablesPresented(face)
    if (presented.length === 0) continue
    const files: DeliveredFileFace[] = []
    for (const file of presented) {
      const path = typeof file?.path === 'string' ? file.path : undefined
      if (path === undefined || path.trim() === '') continue
      const description = typeof file?.description === 'string' && file.description.trim() !== '' ? file.description : undefined
      files.push(description === undefined ? { path } : { path, description })
    }
    if (files.length > 0) out.set(turn, files)
  }
  return out
}

/**
 * 构建 fileMentions：归一化精确匹配优先、唯一 basename 兜底（官方 fileMentions 语义：
 * 词表外一律 undefined ⇒ MarkdownText 保持惰性 code，renderer never guesses）。
 */
function makeFileMentions(paths: readonly string[], open: (path: string) => void): FileMentionsFace {
  const exact = new Map<string, string>()
  const byBase = new Map<string, string[]>()
  for (const p of paths) {
    exact.set(p, p)
    const base = p.includes('/') ? p.slice(p.lastIndexOf('/') + 1) : p
    const bucket = byBase.get(base)
    if (bucket === undefined) byBase.set(base, [p])
    else bucket.push(p)
  }
  return {
    resolve(value: string): { open(): void; label: string; title: string } | undefined {
      const norm = normalizeFilePath(value)
      const hit = exact.get(norm) ?? (() => {
        const base = norm.includes('/') ? norm.slice(norm.lastIndexOf('/') + 1) : norm
        const bucket = byBase.get(base)
        return bucket !== undefined && bucket.length === 1 ? bucket[0] : undefined
      })()
      if (hit === undefined) return undefined
      return { label: value, title: hit, open: () => { open(hit) } }
    },
  }
}

// ─────────────────────────── 弹窗 ───────────────────────────

export interface SessionViewModalProps {
  t?: Translate
  /** 弹窗标题：**会话自己的标题**（宿主 sessions.list 的 displayTitle）；缺省退 sessionId。 */
  heading?: string
  sessionId: string
  view: SessionViewTarget
  onClose: () => void
  /**
   * 会话是否已归档（宿主 workspaceRegistry.archivedSessionIds，client 读不到，由调用方注入）。
   * 分化「继续对话」行为：已归档 = 开分支图标 + 确认框（fork 后跳官方区）；
   * 未归档 / 未提供 = 会话图标，点击直跳官方会话页。undefined = 调用方不知道，按未归档处理。
   */
  archived?: boolean
  /** fork 源会话：`sessions.fork({ sessionId, increaseTitle: true })`，解析为子会话 id。 */
  forkSession?: (sessionId: string, atSeq?: number) => Promise<string>
  /** 官方导航跳转：`uiWorkspace.openSession(id)`（会话区打开目标会话）。 */
  openHostSession?: (sessionId: string) => void
  /**
   * 暂存输入框的「确定」：调用方完成 fork + host 侧 agent.send 起轮次 + 跳官方视图。
   * 缺省 = 不渲染暂存输入框（插件未接线续聊能力时功能降级，不影响预览）。
   */
  onContinue?: (message: string) => Promise<void>
  /** 文件打开出口（工具卡 fileLink / md 行内 mention / 交付卡共用）；缺省 = 链接降级纯文本。 */
  onOpenFile?: (path: string) => void
}

/**
 * 面板内只读会话弹窗：只读、不可在框内续聊（底层 keyed 数组是只读快照，官方无写面）。
 * 续聊正道 = 头部「继续对话（开分支）」/ 消息行分支 icon（fork → openSession），
 * 以及底部暂存输入框（打字 → 确定 → onContinue 带话开分支并起轮次）。
 */
export function SessionViewModal(props: SessionViewModalProps): ReturnType<typeof h> {
  ensureControls()
  const tt = props.t ?? defaultT
  const { heading, sessionId, view, onClose, archived, forkSession, openHostSession, onContinue, onOpenFile } = props
  const subscribe = useMemo(() => (onChange: () => void): (() => void) => view.target.subscribe(onChange), [view])
  const getSnapshot = useMemo(() => (): ChatViewFace | undefined => view.target.getSnapshot(), [view])
  const chat = useSyncExternalStore(subscribe, getSnapshot)

  // 会话生命周期（加载态 / 向前翻页按钮），同样只读订阅。
  const sessionSub = useMemo(() => (onChange: () => void): (() => void) => view.session.subscribe(onChange), [view])
  const sessionGet = useMemo(() => (): SessionSnapshotFace => view.session.getSnapshot(), [view])
  const sessionSnap = useSyncExternalStore(sessionSub, sessionGet)

  // 折叠状态：turn → 已展开的 answerStep（官方 store 的 storedTurnProcessEntry，同语义）。
  const [openTurns, setOpenTurns] = useState<ReadonlyMap<number, number>>(() => new Map<number, number>())
  const onSetOpen = useCallback((turn: number, answerStep: number, open: boolean): void => {
    setOpenTurns((prev) => {
      const next = new Map(prev)
      if (open) next.set(turn, answerStep)
      else next.delete(turn)
      return next
    })
  }, [])

  // 开分支：确认框显隐 + fork 进行中 + 失败原因。aliveRef 防「fork 在途时用户关弹窗」
  // 后仍跳转（await 回来时弹窗已卸载 ⇒ 放弃跳转，不 setState）。
  // 「继续对话」按归档状态分化（用户 2026-10-22 拍板）：
  //   已归档   ⇒ 开分支图标 + 确认框（fork 出子会话再跳官方区；官方策略归档会话不进主视图）
  //   未归档   ⇒ 会话图标，点击直跳官方会话页（uiWorkspace.openSession，无确认）
  const isArchived = archived === true
  const canFork = forkSession !== undefined && openHostSession !== undefined
  const canDirectOpen = openHostSession !== undefined
  const showContinue = isArchived ? canFork : canDirectOpen
  const [forkTarget, setForkTarget] = useState<{ atSeq?: number } | null>(null)
  const [forking, setForking] = useState(false)
  const [forkErr, setForkErr] = useState<string | null>(null)
  const aliveRef = useRef(true)
  useEffect(() => () => { aliveRef.current = false }, [])
  const onForkAccept = useCallback((): void => {
    if (forking || forkSession === undefined || openHostSession === undefined) return
    setForking(true)
    setForkErr(null)
    void (async () => {
      try {
        const child = await forkSession(sessionId, forkTarget?.atSeq)
        if (!aliveRef.current) return
        // 先关弹窗（dispose ⇒ release 源会话 scope），再跳宿主会话区（官方导航服务）。
        onClose()
        openHostSession(child)
      } catch (error) {
        if (!aliveRef.current) return
        setForkErr(error instanceof Error ? error.message : String(error))
      } finally {
        if (aliveRef.current) setForking(false)
      }
    })()
  }, [forking, forkSession, openHostSession, sessionId, forkTarget, onClose])
  // 消息行分支按钮（官方分支 icon 位置）：从该轮 tail 消息截断开分支（同样先出确认框）。
  const onBranchAt = useCallback((seq: number): void => {
    setForkErr(null)
    setForkTarget({ atSeq: seq })
  }, [])

  // 暂存输入框（期4）：打字 → 确定 → onContinue（调用方 fork + host send + 跳转）。
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [sendErr, setSendErr] = useState<string | null>(null)
  const onSend = useCallback((): void => {
    const message = draft.trim()
    if (sending || message === '' || onContinue === undefined) return
    setSending(true)
    setSendErr(null)
    void (async () => {
      try {
        await onContinue(message)
        if (!aliveRef.current) return
        setDraft('')
      } catch (error) {
        if (!aliveRef.current) return
        setSendErr(error instanceof Error ? error.message : String(error))
      } finally {
        if (aliveRef.current) setSending(false)
      }
    })()
  }, [draft, sending, onContinue])

  // 文件打开上下文：onOpenFile 就位即启用（工具卡 fileLink + md 行内 mention 共用单一入口）。
  const openFile = useCallback((path: string): void => { onOpenFile?.(path) }, [onOpenFile])

  const order = chat?.order ?? EMPTY_ORDER
  const store = chat?.nodes
  const keyed = order.length > 0 && store !== undefined
  const turns = chat?.timeline?.turns
  // markdown 行内文件词表（来自 keyed 工具流；onOpenFile 未就位 = 整个上下文不启用）。
  const fileOpen = useMemo<FileOpenFace | undefined>(() => {
    if (onOpenFile === undefined) return undefined
    return {
      open: openFile,
      mentions: makeFileMentions(collectFilePaths(order, store, turns), openFile),
    }
  }, [onOpenFile, openFile, order, store, turns])
  // 每轮交付文件（会话 turn 级 deliverables.presented 同源推导）。
  const deliveredByTurn = useMemo(() => collectPresentedByTurn(turns), [turns])
  const deliverFiles = useMemo<readonly DeliveredFileFace[]>(() => {
    const byPath = new Map<string, DeliveredFileFace>()
    const add = (file: DeliveredFileFace): void => {
      const key = file.path.trim()
      if (key === '' || byPath.has(key)) return
      byPath.set(key, file)
    }
    for (const files of deliveredByTurn.values()) for (const file of files) add(file)
    return [...byPath.values()]
  }, [deliveredByTurn])
  // 最后一轮 turn-tail 的 turn 号：交付卡只挂这里（官方 DeliverablesTail 位置 = 会话底部收尾之后）。
  const lastTailTurn = useMemo(() => {
    if (!keyed || store === undefined) return undefined
    for (let i = order.length - 1; i >= 0; i--) {
      const key = order[i]
      if (key === undefined) continue
      const node = store.get(key)
      if (node?.kind !== 'turn-tail') continue
      const data = node.data as unknown as TurnTailDataFace | undefined
      const turn = data?.turn ?? turnLocationOf(node)?.turn
      if (typeof turn === 'number') return turn
    }
    return undefined
  }, [keyed, order, store])
  const renderNode = useCallback<NodeRenderer>(
    (node, turnProcess, groupPart) => renderKeyedNode(
      node, turnProcess, tt, onBranchAt, fileOpen, groupPart, deliverFiles, lastTailTurn,
    ),
    [tt, onBranchAt, fileOpen, deliverFiles, lastTailTurn],
  )
  // 官方 grouped('chat')：把 keyed 流切成「独立条目 + 过程分组」（二级收折）。
  const isTurnClosed = useCallback((turn: number): boolean =>
    (turns?.get(turn) ?? turns?.get(String(turn)))?.status !== 'open', [turns])
  const groupedView = useMemo(
    () => keyed ? buildProcessGroups(order, key => store?.get(key), isTurnClosed) : undefined,
    [keyed, order, store, isTurnClosed],
  )

  // ChatNodeList 直接调用（无 hook 的纯函数）：它产出的是「flowItem 数组」，不是单个元素。
  const rows: Array<ReturnType<typeof h> | null> = keyed
    ? ChatNodeListMirror({
        order,
        store,
        entries: groupedView?.entries,
        groups: groupedView?.groups,
        turns,
        openState: openTurns,
        onSetOpen,
        // 官方 usePresentation(policy => policy.foldCompletedTurns)：只读历史视图按「折叠已完成轮次」处理。
        foldCompleted: true,
        renderNode,
        t: tt,
      })
    : renderLegacyRows(chat?.legacy?.nodes ?? [], tt, fileOpen)
  const rendered = rows.filter((row): row is NonNullable<ReturnType<typeof h>> => row !== null && row !== undefined)

  const officialCount = officialModuleCount()
  if (!officialWarned) {
    officialWarned = true
    console.info(`[dsh-plugin-core:session] 官方 ui-chat 模块数=${officialCount}；类名样例 frame=${officialClass('ChatView', 'frame')} flowItem=${officialClass('ChatView', 'flowItem')} trigger=${officialClass('TurnTriggerNodeView', 'root')} turnProcess=${officialClass('TurnProcessNodeView', 'root')} tail=${officialClass('TurnTailNodeView', 'root')}`)
    if (officialCount === 0) {
      console.warn('[dsh-plugin-core:session] 未发现官方 ui-chat 样式模块 ⇒ 弹窗观感退回自绘样式（功能不受影响）')
    }
  }
  const openState = sessionSnap?.openState
  const showLoadOlder = sessionSnap?.hasMore !== false
  const body = rendered.length === 0
    ? h(ChatHint, {
        text: openState === 'error' ? tt('sessionFailed')
          : openState === 'loading' || openState === 'cold' ? tt('sessionLoading')
            : tt('sessionEmpty'),
      })
    : [
        showLoadOlder
          ? h(ChatOlderButton, { key: 'older', label: tt('sessionLoadOlder'), onClick: () => { view.loadOlder() } })
          : null,
        ...rendered,
      ]

  // 关闭途径：右上角关闭按钮 / 点遮罩（主面板同款，不监听 document）。
  return h(Fragment, null,
    h('div', { className: 'dshpc-sv-overlay', onClick: onClose },
      h('div', { className: 'dshpc-sv-panel', onClick: (event: { stopPropagation(): void }) => { event.stopPropagation() } },
        h('div', { className: 'dshpc-sv-header' },
          h('div', { className: 'dshpc-sv-heading' },
            h('div', { className: 'dshpc-sv-title' },
              heading ?? sessionId,
              // 归档标识（官方归档图标 + 「已归档」）。
              isArchived
                ? h('span', {
                    style: {
                      display: 'inline-flex', alignItems: 'center', gap: '4px',
                      marginLeft: '8px', fontSize: 'var(--dshpc-font-xs)',
                      color: 'var(--dshpc-fg-3)', fontWeight: 400,
                    },
                    title: tt('sessionArchived'),
                  },
                    h(IconArchiveOutlineRegular, { size: 12 }),
                    tt('sessionArchived'),
                  )
                : null,
            ),
            h('div', { className: 'dshpc-sv-sid' }, sessionId),
            // 可见探针：官方样式未命中时直接显示（省得翻控制台）。命中则不显示。
            officialCount === 0
              ? h('div', {
                  className: 'dshpc-sv-sid',
                  style: { color: 'var(--dshpc-warning, #b7791f)' },
                }, '⚠ 官方样式未命中（当前为自绘回退）')
              : null,
          ),
          h('div', { className: 'dshpc-sv-headerbtns' },
            showContinue
              ? h(Button, {
                  variant: 'outline',
                  size: 'sm',
                  disabled: forking,
                  title: tt('continueBranch'),
                  icon: isArchived
                    ? h(IconBranchOutlineRegular, { size: 14 })
                    : h(IconNewChatOutlineRegular, { size: 14 }),
                  onClick: () => {
                    if (isArchived) { setForkErr(null); setForkTarget({}) }
                    else if (openHostSession !== undefined) { onClose(); openHostSession(sessionId) }
                  },
                }, tt('continueBranch'))
              : null,
            h('button', {
              type: 'button',
              className: 'dshpc-sv-action',
              'aria-label': tt('modalClose'),
              title: tt('modalClose'),
              onClick: onClose,
            }, h(IconCloseOutlineRegular, { size: 14 })),
          ),
        ),
        // 会话区 = mirror/ChatView（frame > root > scroll > column > flowItem*，官方类优先）。
        h(ChatViewFrame, {
          children: [
            ...(Array.isArray(body) ? body : [body]),
          ],
        }),
        // 底部暂存输入框（期4）：flex:none 不随会话区滚动；确定后带话开分支跳官方视图。
        onContinue === undefined
          ? null
          : h('div', { className: 'dshpc-sv-composer' },
              h('textarea', {
                value: draft,
                placeholder: tt('composerPlaceholder'),
                disabled: sending,
                onChange: (event: { target: { value: string } }) => { setDraft(event.target.value) },
                onKeyDown: (event: { key: string; ctrlKey: boolean; metaKey: boolean; preventDefault(): void }) => {
                  if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) { event.preventDefault(); onSend() }
                },
              }),
              h(Button, {
                variant: 'primary',
                size: 'sm',
                disabled: sending || draft.trim() === '',
                onClick: onSend,
              }, sending ? tt('forkWorking') : tt('confirm')),
              h('span', { className: 'dshpc-sv-composer-hint', title: tt('composerHint') }, '⌘/Ctrl + ↵'),
            ),
        sendErr !== null
          ? h('div', { className: 'dshpc-sv-forkerr', style: { padding: '0 34px 10px' } }, sendErr)
          : null,
      ),
    ),
    // 开分支确认框（用户拍板：必须先确认再 fork，防误点）——官方 Modal + Button
    // （portal 到 body，与本弹窗同 z-index 层、后挂载居上；Escape / 遮罩点击 / 头部叉均触发 onClose）。
    h(Modal, {
      open: forkTarget !== null,
      onClose: () => { if (!forking) setForkTarget(null) },
      title: tt('forkConfirmTitle'),
      closeLabel: tt('modalClose'),
      description: tt('forkConfirmText'),
      className: 'dshpc-sv-forkmodal',
      footer: [
        h(Button, { key: 'cancel', variant: 'outline', disabled: forking, onClick: () => { setForkTarget(null) } }, tt('cancel')),
        h(Button, { key: 'accept', variant: 'primary', disabled: forking, onClick: onForkAccept }, forking ? tt('forkWorking') : tt('forkConfirmAccept')),
      ],
    }, forkErr !== null ? h('p', { className: 'dshpc-sv-forkerr' }, tt('forkFailed', { error: forkErr })) : null),
  )
}
