// 官方对照：packages/client/ui-chat/src/client/chat/ChatView.tsx（0.1.7-rc.2 lib/client.js:5004-5260）
// 骨架四层：frame（> TurnNavigator）> root[data-chat-following-tail] > scroll > column[data-chat-flow]
//   column 子项：hint（loading）/ openError / older（hasMore）/ 各 flowItem（ChatNodeList）
// root 内另有 toBottomSlot（官方按「是否贴尾」显隐，弹窗恒贴尾 ⇒ 不渲染）。
// ChatNodeList：entries → seat；官方 entries 优先取 grouped('chat')，取不到时 = order.map(key)。
import { createElement as h } from 'react'
import type { ReactNode } from 'react'
import { officialClass } from '../official-classes.js'
import type { Translate } from '../../../utils/i18n.js'
import type { ChatNodeStoreFace } from '../faces.js'
import type { NodeRenderer } from './ChatNodeSeat.js'
import { ChatGroupSeatMirror } from './ChatGroupSeat.js'
import { ChatNodeSeatMirror } from './ChatNodeSeat.js'
import type { ChatEntry, ProcessGroupSnapshot } from './process-groups.js'
import { ensureComponentStyles } from '../../../ui/infra/css.js'
import { SESSION_CSS } from '../session-css.js'

/** 会话区骨架：frame > root > scroll > column（类名一律取官方 ChatView.module.css，取不到 = 空类）。
 *
 *  `dshpc-sv-frame` / `dshpc-sv-scroll` = 本包**稳定钩子类**（不走 officialClass 发现，官方类命中时也照样挂）：
 * 会话区**纵向间距的唯一真源**。官方 scroll 自带纵向 16px、官方 frame 的纵向值又不确定，
 * 归一方案（移植自兄弟项目 2026-10-03 定尺）：**scroll 钩子把官方纵向 16px 归零，
 * frame 钩子独自定 17/17**，两条钩子都用双类名提高特异性压过官方 CSS module（0,2,0 > 0,1,0），
 * 不依赖注入顺序 ⇒ 命中 / 未命中两条路径纵向完全一致。
 */
export function ChatViewFrame(props: { children?: ReactNode }): ReturnType<typeof h> {
  ensureComponentStyles('session', SESSION_CSS)
  return h('div', { className: `${officialClass('ChatView', 'frame') ?? ''} dshpc-sv-frame dshpc-sv-chat` },
    // 弹窗恒贴尾 ⇒ root 带 data-chat-following-tail（官方只在贴尾时写，作用 = overflow-anchor:none）。
    h('div', { className: officialClass('ChatView', 'root') ?? '', 'data-chat-following-tail': '' },
      h('div', { className: `${officialClass('ChatView', 'scroll') ?? ''} dshpc-sv-scroll` },
        h('div', { className: officialClass('ChatView', 'column') ?? '', 'data-chat-flow': '' }, props.children),
        // 官方 scroll 末尾的滚动占位（高度 0，只做锚点）。
        h('div', {
          className: officialClass('ChatView', 'turnSpacer') ?? '',
          'data-chat-turn-spacer': true,
          'aria-hidden': 'true',
        }),
      ),
    ),
  )
}

/** 官方 ChatNodeList：order → seat 列表（grouped 视图 = entries + groups 路径）。 */
export function ChatNodeListMirror(props: {
  order: readonly string[]
  store?: ChatNodeStoreFace
  /** 官方 grouped('chat') 的 entries + 组快照（buildProcessGroups 产出）；缺省走 order 兜底。 */
  entries?: ReadonlyArray<ChatEntry>
  groups?: ReadonlyMap<string, ProcessGroupSnapshot>
  openState: ReadonlyMap<number, number>
  onSetOpen(turn: number, answerStep: number, open: boolean): void
  foldCompleted: boolean
  renderNode: NodeRenderer
  t: Translate
}): Array<ReturnType<typeof h> | null> {
  const { order, store, entries, groups, openState, onSetOpen, foldCompleted, renderNode, t } = props
  const rows: Array<ReturnType<typeof h> | null> = []
  const read = store === undefined ? undefined : (store as Partial<ChatNodeStoreFace>).get
  if (typeof read !== 'function' || store === undefined) return rows
  const readSafe = (key: string): ReturnType<ChatNodeStoreFace['get']> => {
    try {
      return read.call(store, key)
    } catch {
      return undefined
    }
  }
  if (entries !== undefined && groups !== undefined) {
    // 官方 0.2.2-rc.1 `grouped`（ui-chat lib/client.js:4935）：
    //   stepGrouping === "collapsed" 时短路为 true，不看 turn 状态，也不看 deferCollapse。
    //   默认 compact / standard 两种策略都是 "collapsed"（:14839 / :14846），
    //   默认 collapseTiming = "completion"（:14788）⇒ deferCollapse 恒 false（:3590）。
    // 只读历史视图没有 live turn ⇒ 所有过程组一律带「执行了命令」这类汇总行收起，
    // 点开才展开组内条目。旧实现把「每轮最后一组」平铺（误读 useChatNodeBottom 的
    // 「视口底部节点」语义），导致工具调用 + 思考直接铺开、连汇总行都不画
    // （真机 2026-11-05 第五轮反馈：「官方收起来的，我们两个都展开」）。
    // 官方 ChatNodeList 的 entries 路径：group 条目 → ChatGroupSeat（二级收折）。
    for (const entry of entries) {
      if (entry.kind === 'group') {
        const group = groups.get(entry.key)
        if (group === undefined) continue
        rows.push(h(ChatGroupSeatMirror, {
          key: entry.key,
          group,
          grouped: true,
          store,
          openState,
          onSetOpen,
          foldCompleted,
          renderNode,
          t,
        }))
      } else {
        const node = readSafe(entry.key)
        if (node === undefined) continue
        rows.push(h(ChatNodeSeatMirror, {
          key: JSON.stringify([entry.key, entry.groupPart ?? null]),
          node,
          groupPart: entry.groupPart,
          store,
          openState,
          onSetOpen,
          foldCompleted,
          renderNode,
        }))
      }
    }
    return rows
  }
  for (const key of order) {
    const node = readSafe(key)
    if (node === undefined) continue
    rows.push(h(ChatNodeSeatMirror, { key, node, store, openState, onSetOpen, foldCompleted, renderNode }))
  }
  return rows
}

/** 加载 / 空态提示行（13px tertiary）。 */
export function ChatHint(props: { text: string }): ReturnType<typeof h> {
  return h('div', { className: officialClass('ChatView', 'hint') ?? '' }, props.text)
}

/** 「加载更早记录」按钮（官方 older：按钮 4px 12px / 12px 字号 / radius-sm / 底色 interactive-bg-hover-solid）。 */
export function ChatOlderButton(props: { label: string; onClick: () => void }): ReturnType<typeof h> {
  return h('div', { className: officialClass('ChatView', 'older') ?? '' },
    h('button', { type: 'button', onClick: props.onClick }, props.label),
  )
}

/** 「到底部」悬浮钮（官方 toBottom：34×34 圆形悬浮，仅在有更多历史时显示）。 */
export function ChatToBottom(props: { label: string; onClick: () => void }): ReturnType<typeof h> {
  return h('div', { className: officialClass('ChatView', 'toBottomSlot') ?? '' },
    h('button', { type: 'button', className: officialClass('ChatView', 'toBottom') ?? '', onClick: props.onClick, 'aria-label': props.label }, '↓'),
  )
}
