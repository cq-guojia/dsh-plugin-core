// 只读会话视图的数据链（移植自兄弟项目 session-view.ts，决策 28 数据链）。
//
// 数据链（全部经源码核实，出处见 ./faces.ts 顶部注释）：
// 1. `sessions.retain(id, { source })` —— binding(id) 只查已物化 scope、从不创建
//    （0.1.7-rc.2 lib/client.js:3406）⇒ 归档 / 久未打开的会话返回 undefined。
//    正解 = retain → retainScope → materializeScope（3410/3472）物化 scope 并在内部触发
//    manager.get(id).open() 拉历史尾页；引用用完 release()（否则 scope 永不回收）。
//    **归档会话就在这条路上可读**（archiveSession 只藏显示面、不动存储，capabilities.md:26/32）。
// 2. `sessions.binding(id)` 取绑定；`uiConversation.binding(binding)` 校验归属
//    （非活跃会话抛 inactive session，ui-conversation lib/client.js:3083）⇒ retain 之后即通过。
// 3. `.target('chat')`：快照 = ChatSnapshot，**同时**带两份数据：
//      · `order` + `nodes`（keyed ChatNodeStore）= 官方 ChatView 真正渲染的那条流，
//        turn-trigger / turn-process / assistant-step / tool-call / turn-tail 都在这里；
//      · `legacy.nodes` = 官方兼容投影（老 kind 名，缺 turn-trigger / turn-process）。
//    渲染主路走 keyed 流；`legacy.nodes` 只作 order 为空时的兜底。
//
// ⛔ 已证伪、勿再尝试（兄弟项目真机实测）：
//    - 弹窗内渲染官方 ChatView：`ctx.slots.renderSlot` 只接受 key='root'（运行时强制）；
//    - `retain(source:'mainView')` 切官方视图：会锁死宿主会话导航（真机事故，已回退）；
//    - 冷读 RPC `$stream('session/follow')`：宿主 remote 只有 $stream/invoke，invoke 报
//      「无活动通道」⇒ 归档会话一律走上面的 retain 主路，不搞冷读。

import type {
  ChatViewFace,
  SessionBindingFace,
  SessionSnapshotFace,
  SessionsFace,
  SnapshotFace,
  UiConversationFace,
} from './faces.js'

/** 弹窗数据源：已解析的 target 与向前翻页句柄；解析失败给 null。 */
export interface SessionViewTarget {
  readonly target: SnapshotFace<ChatViewFace | undefined>
  /** 向前翻一页更早的历史（官方 loadOlder；未 open / 翻尽时官方自行空转）。 */
  loadOlder(): void
  readonly session: SnapshotFace<SessionSnapshotFace>
  /** 释放 sessions.retain 引用（弹窗关闭时必调；否则会话 scope 永不回收）。 */
  dispose(): void
}

/** 默认 retain source（写进宿主 retainedBy；调用方可覆盖成自己的插件名）。 */
export const DEFAULT_RETAIN_SOURCE = 'dsh-plugin-core'

/** 打开只读视图：物化 binding → 探测拉尾页 → 建 chat target。会话不可解析时返回 null。 */
export function openSessionView(
  sessions: SessionsFace,
  uiConversation: UiConversationFace,
  id: string,
  /** retain 引用记进宿主 retainedBy 的键；默认 'dsh-plugin-core'。 */
  retainSource: string = DEFAULT_RETAIN_SOURCE,
): SessionViewTarget | null {
  const log = (level: 'warn' | 'info', msg: string, extra?: unknown): void => {
    if (level === 'warn') console.warn(`[dsh-plugin-core:session] ${msg}`, extra ?? '')
    else console.info(`[dsh-plugin-core:session] ${msg}`)
  }
  // retain 引用：用完必须 release（否则会话 scope 不会被回收）。
  let retainedRef: { release(): void } | null = null
  const releaseRef = (): void => {
    try { retainedRef?.release() } catch (err) { log('warn', `sessions.retain 引用释放失败（${id}）`, err) }
    retainedRef = null
  }
  let binding: SessionBindingFace
  try {
    const S0 = sessions as unknown as Record<string, unknown>
    const retainFn = S0.retain
    if (typeof retainFn === 'function') {
      try {
        retainedRef = (retainFn as (t: string, o: { source: string }) => { release(): void })
          .call(S0, id, { source: retainSource })
        log('info', `sessions.retain(${id}, { source: '${retainSource}' }) 成功：scope 已物化`)
      } catch (err) { log('warn', `sessions.retain(${id}) 抛错（未知会话？）`, err) }
    } else {
      log('warn', `sessions 无 retain 方法；归档 / 久未打开的会话将不可读。自身键=[${Object.keys(S0).join(',')}]`)
    }
    const found: SessionBindingFace | undefined = sessions.binding(id)
    if (found === undefined || found === null) {
      // 取证优先：把 sessions 服务真实方法面全打出来，下次不再猜。
      const S0d = sessions as unknown as Record<string, unknown>
      const allFn = ((): string[] => {
        const out = new Set<string>()
        let cur: unknown = S0d
        while (cur && (typeof cur === 'object' || typeof cur === 'function')) {
          for (const k of Object.getOwnPropertyNames(cur as object)) {
            const v = (cur as Record<string, unknown>)[k]
            if (typeof v === 'function' && k !== 'constructor') out.add(k)
          }
          cur = Object.getPrototypeOf(cur)
        }
        return [...out]
      })()
      log('warn', `sessions.binding(${id}) 为空（会话未就位，retain 也未物化）。sessions 方法全清单=[${allFn.join(',')}]；自身键=[${Object.keys(S0d).join(',')}]`)
      releaseRef()
      return null
    }
    binding = found
  } catch (err) {
    log('warn', `openSessionView 返回 null：sessions.binding(${id}) 抛错`, err)
    releaseRef()
    return null
  }
  const session = binding.session
  // 数据闸门：官方 Session.open() 幂等拉历史尾页。类型未公开 ⇒ 探测调用；
  // 失败软着陆（界面显示空态与重试提示，不崩面板）。
  try {
    const opened = (session as { open?: () => Promise<void> }).open?.()
    if (opened !== undefined && typeof opened.catch === 'function') {
      opened.catch((err) => log('warn', `session.open(${id}) 失败（仅影响历史加载，不阻断弹窗）`, err))
    }
  } catch (err) { log('warn', `session.open(${id}) 抛错`, err) }
  let conversation: ReturnType<UiConversationFace['binding']>
  try {
    conversation = uiConversation.binding(binding)
  } catch (err) {
    log('warn', 'openSessionView 返回 null：uiConversation.binding 抛错（binding 已取得，断点在 uiConversation 装配）', err)
    return null
  }
  let target: SnapshotFace<ChatViewFace | undefined>
  try {
    target = conversation.target('chat')
  } catch (err) {
    log('warn', "openSessionView 返回 null：conversation.target('chat') 抛错", err)
    return null
  }
  log('info', `openSessionView 成功建立 target（${id}）；首屏 nodes 待订阅回填`)
  return {
    target,
    session,
    dispose: releaseRef,
    loadOlder(): void {
      try {
        const page = (session as { loadOlder?: () => Promise<void> }).loadOlder?.()
        if (page !== undefined && typeof page.catch === 'function') {
          page.catch((err) => log('warn', `session.loadOlder(${id}) 失败`, err))
        }
      } catch (err) { log('warn', `session.loadOlder(${id}) 抛错`, err) }
    },
  }
}
