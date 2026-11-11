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
import { Fragment, createElement as h, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { IconArchiveOutlineRegular, IconBranchOutlineRegular, IconNewChatOutlineRegular, MarkdownDelegateProvider } from '../../ui/official.js';
import { Modal } from '../../ui/feedback/Modal.js';
import { Button } from '../../ui/actions/Button.js';
import { t as coreT } from '../../utils/i18n.js';
import { ChatCallRow, ChatHint, ChatNodeListMirror, ChatOlderButton, ChatOpenError, ChatViewFrame } from './mirror/ChatView.js';
import { GenericCommandCard, imageCardFace } from './mirror/GenericCommandCard.js';
import { CommandCard } from './mirror/CommandCard.js';
import { MessageIconActionsMirror } from './mirror/MessageIconActions.js';
import { AssistantMarkdown, AssistantStoppedBadge, CompactionItemMirror, ModelRetryItemMirror, TurnErrorItemMirror, TurnMaxTokensItemMirror, UserMessage } from './mirror/MessageItem.js';
import { ImageGalleryMirror } from './mirror/MessageImage.js';
import { BashRowMirror } from './mirror/BashRow.js';
import { ApprovalPanelMirror, approvalCommand } from './mirror/ApprovalPanel.js';
import { pendingQuestionsFromNodes, questionPanelWiring, } from './pending-questions.js';
import { QuestionPanel } from './mirror/QuestionPanel.js';
import { SkillRowMirror } from './mirror/SkillRow.js';
import { ContextInjectionRowMirror } from './mirror/ContextInjectionRow.js';
import { ReasoningRowMirror } from './mirror/ReasoningRow.js';
import { RunningStatusMirror } from './mirror/RunningStatus.js';
import { TurnProcessNodeViewMirror } from './mirror/TurnProcessNodeView.js';
import { buildTurnTailFacts, TurnTailNodeViewMirror } from './mirror/TurnTailNodeView.js';
import { TurnTriggerNodeViewMirror } from './mirror/TurnTriggerNodeView.js';
import { DeliverablesGridMirror, PresentRowMirror } from './mirror/Deliverables.js';
import { ChangedFilesCard } from './mirror/ChangedFilesCard.js';
import { turnDeliverablesChangesSeq, turnDeliverablesValue } from './changes.js';
import { buildProcessGroups } from './mirror/process-groups.js';
import { observedRpcIds, waitingUserRows } from './pending-inputs.js';
import { officialClass, officialModuleCount } from './official-classes.js';
import { t as defaultT } from '../../utils/i18n.js';
import { ensureComponentStyles } from '../../ui/infra/css.js';
import { SESSION_CSS } from './session-css.js';
import { createTailFollower } from './tail-follow.js';
import { workspaceList } from '../../ui/infra/host-data.js';
/** 稳定的空序列（避免默认值每次新建数组）。 */
const EMPTY_ORDER = [];
/** SSR / 数据面未接线时的归档态：如实按未归档，不编造。 */
const NOT_ARCHIVED = () => false;
/** SSR / 宿主未注册 inbox 投影时按能力缺席，不编造等待期消息。 */
const NO_INBOX = () => undefined;
/** 两处「等用户表态」卡缺席时的稳定空值：不编造待审批 / 待回答。 */
const NO_APPROVAL = () => undefined;
const NO_QUESTIONS = () => null;
const NO_LIVE_QUESTION = () => undefined;
const NO_CARD_SUBSCRIBE = () => () => { };
/** 官方样式缺失告警只打一次（避免每次渲染刷屏）。 */
let officialWarned = false;
/** 题面板「只能看不能点」的原因只报一次（否则每次渲染刷屏）。 */
let questionReadOnlyWarned = false;
// ─────────────────────────── 纯函数：内容块 → 可读文本 / 文件 ───────────────────────────
/** JSON 安全序列化（循环引用 / 特殊值不抛）。 */
function safeJson(value) {
    try {
        return JSON.stringify(value, null, 2) ?? String(value);
    }
    catch {
        return String(value);
    }
}
/**
 * 提取内容块的可读文本：text 拼接、图片占位（官方 ContentBlock 是 merge-extensible map）。
 * @param imagePlaceholder 图片块是否退化成「[图片]」文本：图片能真渲染时传 false（官方文本里没有图片）。
 */
function contentText(blocks, imagePlaceholder = true) {
    if (blocks === undefined)
        return '';
    const parts = blocks.map((block) => {
        if (block !== null && typeof block === 'object' && block.type === 'text' && typeof block.text === 'string')
            return block.text;
        if (imagePlaceholder && block !== null && typeof block === 'object' && block.type === 'image')
            return coreT('sessionImage');
        return '';
    }).filter(part => part !== '');
    return parts.join('\n');
}
/** 内容块里的官方 image 块（`{ type:'image', attachment: ImageAttachmentRef }`）→ 图片组。 */
function contentImages(blocks) {
    if (blocks === undefined)
        return [];
    const out = [];
    for (const block of blocks) {
        if (block === null || typeof block !== 'object' || block.type !== 'image')
            continue;
        const attachment = block.attachment;
        if (typeof attachment !== 'object' || attachment === null)
            continue;
        if (typeof attachment.attachmentId !== 'string' || attachment.attachmentId === '')
            continue;
        out.push({ attachment });
    }
    return out;
}
/**
 * 提取内容块里的**官方 file 块**（2026-10-03 核实）：随附文件以官方附件形式发进会话后，
 * 会话快照的 user 节点 content 里就是它 ⇒ 弹窗里照样渲染成附件卡（与官方页一致）。
 * 拿不到（宿主投影未透传）⇒ 空数组：附件卡不渲染，**绝不造一个假卡**。
 *
 * @returns `files` = 去重后要画的附件；`hadFiles` = 该轮**原本**有没有 file 块
 * （去重让位后可能为空 —— 调用方据此判断该轮要不要渲染，不能因为让位把整条消息吞掉）。
 */
function contentFiles(blocks, 
/** 已解析出路径的文件名 ⇒ 这里让位，避免同一个文件同屏出现两次。 */
exclude) {
    if (blocks === undefined)
        return { files: [], hadFiles: false };
    const out = [];
    let hadFiles = false;
    for (const block of blocks) {
        if (block === null || typeof block !== 'object' || block.type !== 'file')
            continue;
        const attachment = block.attachment;
        if (typeof attachment !== 'object' || attachment === null)
            continue;
        hadFiles = true;
        const name = typeof attachment.name === 'string' && attachment.name !== '' ? attachment.name : 'file';
        if (exclude?.has(name) === true)
            continue;
        out.push({ name, bytes: typeof attachment.bytes === 'number' ? attachment.bytes : 0 });
    }
    return { files: out, hadFiles };
}
/** legacy assistant 节点的纯文本（复制按钮用）。 */
function assistantText(node) {
    return (node.blocks ?? []).map(block => block.kind === 'text' ? block.text : '').join('');
}
// ─────────────────────────── keyed 节点流的数据读取助手 ───────────────────────────
/** keyed 节点的 data（官方 ChatNodeDataMap[kind]）。 */
function dataOf(node) {
    return node.data ?? {};
}
/** 节点位置 → turn 位置（官方 node.location 收窄，ChatNodeSeat.tsx:1660 的反向）。 */
function turnLocationOf(node) {
    const location = node.location;
    return location?.kind === 'turn' || location?.kind === 'step' ? location.turn : undefined;
}
/** 官方 AssistantChatData.blocks（ui-chat contract/chat-nodes.d.ts:22）。 */
function blocksOf(value) {
    return Array.isArray(value) ? value : undefined;
}
/**
 * 官方 ToolCallBlock（uic contract/records.d.ts:140）→ 工具卡 props。
 * running 半截（phase: preparing/start）只有 name/argsRaw；settled（kind: tool-result）带输出与错误。
 */
function toolCallCard(node, t, onOpenFile, loadImage) {
    const root = dataOf(node).root;
    if (root === undefined || root === null)
        return null;
    const settled = root.kind === 'tool-result';
    const call = settled ? root.call : root;
    const error = root.error;
    const name = typeof call?.name === 'string' ? call.name : 'tool';
    const argsRaw = typeof call?.argsRaw === 'string' ? call.argsRaw : '';
    const isError = root.isError === true;
    const content = settled ? root.content : undefined;
    return {
        name,
        argsRaw,
        output: settled ? contentText(content, false) : '',
        isError,
        errorName: error?.name,
        meta: root.meta,
        settled,
        phase: settled ? undefined : root.phase === 'preparing' ? 'preparing' : 'start',
        interrupted: error?.code === 'interrupted',
        errorCode: error?.code,
        // 官方 read_image 专属卡：图片来自结果内容块的附件引用，不是文本。
        image: imageCardFace(name, argsRaw, content, root.meta, isError, settled) ?? undefined,
        loadImage,
        onOpenFile,
        t,
    };
}
/** 官方 Tool / ToolResult block 是否为 present 调用（交付文件行专属渲染；running 名在顶层，结算名在 call 里）。 */
function isPresentRoot(root) {
    if (typeof root !== 'object' || root === null)
        return false;
    const r = root;
    if (r.name === 'present')
        return true;
    return r.kind === 'tool-result' && r.call !== null && typeof r.call === 'object' && r.call.name === 'present';
}
/** 官方 present 调用参数里的 files（deliverables/presented 事件同源数据）。 */
function presentFiles(root) {
    if (typeof root !== 'object' || root === null)
        return [];
    const r = root;
    const settled = r.kind === 'tool-result';
    if (r.isError === true)
        return [];
    const raw = settled ? r.call?.argsRaw : r.argsRaw;
    if (typeof raw !== 'string')
        return [];
    try {
        const parsed = JSON.parse(raw);
        const files = parsed?.files;
        if (!Array.isArray(files))
            return [];
        const out = [];
        for (const file of files) {
            if (typeof file !== 'object' || file === null)
                continue;
            const path = file.path;
            if (typeof path !== 'string' || path.trim() === '')
                continue;
            const description = file.description;
            out.push(typeof description === 'string' && description.trim() !== '' ? { path, description } : { path });
        }
        return out;
    }
    catch {
        return [];
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
function renderKeyedNode(node, turnProcess, t, onBranchAt, fileOpen, groupPart, 
/** 交付文件（快照 turn 级 deliverables.presented 同源推导）；undefined/空 = 不渲染网格。 */
deliverFiles, 
/** 最后一轮 turn-tail 的 turn 号：交付卡只挂在这里（官方 DeliverablesTail 位置 = 每轮收尾之后）。 */
lastTailTurn, 
/** 最后一轮 `workspace/changes` 公告 seq：官方 ChangedFiles 卡挂这里；undefined = 本轮没改文件。 */
changesSeq, 
/** 会话 id（ChangedFiles 卡拉宿主 changes.summary 路由要用）。 */
sessionId, 
/** 变更文件点击出口（官方 openReview 等价）：带改动身份；undefined = 变更卡不可点。 */
onOpenReview, 
/** 官方 endsWithResponse / hasLaterChatNode（尾部操作行常显与分支可用性）。 */
tailFacts, 
/** 图片 loader（view.loadImage）；缺席 = 图片块退回「[图片]」文本。 */
loadImage, 
/** 底端插槽：挂在最后一条 tail 之前（复制 / 分支 / 用量操作行之上）。 */
footerSlot, 
/** 该挂到哪个节点的 key 上（最后一条带回复的 turn-tail；undefined = 不挂）。 */
footerKey) {
    switch (node.kind) {
        case 'turn-trigger':
            return h(TurnTriggerNodeViewMirror, { data: node.data, t });
        case 'turn-process':
            return turnProcess === undefined ? null : h(TurnProcessNodeViewMirror, {
                turn: turnLocationOf(node),
                turnProcess,
                t,
            });
        case 'turn-tail': {
            // 官方 turnTail 插槽（DeliverablesTail 同位）：变更卡 + 交付卡网格都渲染在
            // TurnTailNodeView 的 tailSlot 里（操作行之前）——**顺序与官方 Deliverables 一致：
            // ChangedFiles 卡在前、presented 网格在后**（官方 lib/client.js：Fragment >
            // [ChangedFiles, Deliverables.root(网格)]）。曾把变更卡挂到 tail 之后（操作行下方），
            // 与官方结构漂移且触发展示异常（真机 2026-10-23：卡内标题被切、计数拆行）。
            // 数据 = 快照 turn 级 deliverables.presented 同源推导，只挂最后一轮 tail。
            const data = node.data;
            const turn = data?.turn ?? turnLocationOf(node)?.turn;
            const atLastTail = turn !== undefined && lastTailTurn !== undefined && turn === lastTailTurn;
            const showGrid = deliverFiles !== undefined && deliverFiles.length > 0 && atLastTail;
            // 官方 ChangedFiles 卡（ui-deliverables）：`workspace/changes` 公告 + 宿主
            // api/changes.summary ⇒ 「已编辑 x.md / +N -M」。数据不在快照里，单独拉（见 changes.ts）。
            const changesCard = atLastTail && changesSeq !== undefined && sessionId !== undefined
                ? h(ChangedFilesCard, { sessionId, seq: changesSeq, onOpenReview, t })
                : null;
            // 底端插槽 = tailSlot 的最后一项 ⇒ 在交付文件 / 变更卡**下面**、复制/分支/用量操作行**上面**。
            const atFooter = footerKey !== undefined && node.key === footerKey;
            const tailSlot = changesCard === null && !showGrid && !atFooter
                ? null
                : h(Fragment, null, changesCard, showGrid ? h(DeliverablesGridMirror, { files: deliverFiles, onOpen: fileOpen?.open, t }) : null, atFooter ? footerSlot : null);
            return data === undefined || data.closing === null || data.closing === undefined
                ? null
                : h(TurnTailNodeViewMirror, { data, onBranchAt, tailSlot, facts: tailFacts, t });
        }
        case 'assistant-step': {
            // 官方块渲染器（lib/client.js:5818-5871）：
            //   · 整步只有 tool-call 块 ⇒ 整步不渲染（工具调用由独立的 tool-call 节点画）；
            //   · tool-call 块一律跳过（case "tool-call": break）——重复渲染卡片即真机踩过的「编辑/写入×2」；
            //   · groupPart 'reasoning' 只画思考块、'response' 跳过思考块；未分组全画（除工具块）。
            const nodeData = dataOf(node);
            const blocks = blocksOf(nodeData.blocks) ?? [];
            const streaming = nodeData.status === 'running';
            const interrupted = nodeData.status === 'interrupted';
            const contentBlocks = blocks.filter(block => block.kind !== 'tool-call');
            // 官方 AssistantMarkdown 提前返回：整步只有 tool-call（且非流式 / 非中断）⇒ 不渲染。
            if (!(streaming || interrupted || blocks.some(block => block.kind !== 'tool-call')))
                return null;
            const visible = groupPart === 'reasoning'
                ? contentBlocks.filter(block => block.kind === 'reasoning')
                : groupPart === 'response'
                    ? contentBlocks.filter(block => block.kind !== 'reasoning')
                    : contentBlocks;
            const parts = assistantBlocks(visible, t, fileOpen?.mentions, streaming, loadImage);
            // 官方 AssistantMarkdown.stopped：被中断的整步末尾一枚「已停止」；只画思考块的组内不重复画。
            const stopped = interrupted
                && (groupPart !== 'reasoning' || !blocks.some(block => block.kind !== 'reasoning' && block.kind !== 'tool-call'));
            if (stopped)
                parts.push(h(AssistantStoppedBadge, { key: 'stopped', t }));
            return parts.length === 0 ? null : h('div', { className: 'dshpc-sv-assistant' }, parts);
        }
        case 'tool-call': {
            // present（交付文件）走官方 tool.call.toolview 槽位 key='present' 的专属 PresentRow
            // （标题「交付文件」+ 状态词 + 路径列表；不经通用工具卡）。
            const root = dataOf(node).root;
            if (isPresentRoot(root))
                return h(PresentRowMirror, { block: root, t });
            const card = toolCallCard(node, t, fileOpen?.open, loadImage);
            if (card === null)
                return null;
            // 官方 tool.call.toolview 槽位按工具名分派：bash / pwsh 走专属 BashRow（独立卡片，无 DisclosureRow）；
            // skill 走 ui-skill 包注册的专属 SkillRow（标题「加载技能」+ 技能图标 + Instructions 展开卡）。
            return card.name === 'bash' || card.name === 'pwsh'
                ? h(BashRowMirror, card)
                : card.name === 'skill'
                    ? h(SkillRowMirror, card)
                    : h(GenericCommandCard, card);
        }
        case 'command': {
            // 官方 CommandNodeView → GenericCommandCard（ui-chat/chat/GenericCommandCard.tsx 原样复刻）。
            // 斜杠命令生命周期节点（records.d.ts：name/args/outcome）；走 CommandCard：标题=裸命令名、
            // 摘要=outcome 落定 text、仅多行才展开。之前漏接 ⇒ 落 default 显示「未支持的节点类型： command」。
            return h(ChatCallRow, null, h(CommandCard, { node: dataOf(node), t }));
        }
        case 'user':
        case 'steering': {
            const blocks = dataOf(node).content;
            const images = loadImage === undefined ? [] : contentImages(blocks);
            // 官方文本里没有图片：能真出图时不再塞「[图片]」。
            const text = contentText(blocks, loadImage === undefined || images.length === 0);
            // 随附文件（官方 file 块）：没有文本但有附件时**照样渲染**（不能整条消失）。
            const { files, hadFiles } = contentFiles(blocks);
            if (text === '' && !hadFiles && images.length === 0)
                return null;
            return h(UserMessage, {
                text,
                files,
                images,
                loadImage,
                referenceLabels: dataOf(node).referenceLabels,
                skillNames: dataOf(node).skillNames,
                t,
            });
        }
        case 'turn-error':
            return h(TurnErrorItemMirror, { node: dataOf(node), t });
        case 'turn-max-tokens':
            return h(TurnMaxTokensItemMirror, { t });
        case 'model-retry': {
            // 官方 RetryNodeView（lib/client.js:1493）：只画 data.current（链上最近一次尝试），
            // active = retryState === 'scheduled'。keyed 节点 data = { attempts, current }；
            // 数据薄时兜底取 attempts 末项（与官方 buildViewNode 的 current 取法同构）。
            const data = dataOf(node);
            const attempts = Array.isArray(data.attempts) ? data.attempts : [];
            const current = (typeof data.current === 'object' && data.current !== null
                ? data.current
                : attempts[attempts.length - 1]);
            if (current === undefined)
                return null;
            return h(ModelRetryItemMirror, { node: current, active: current.retryState === 'scheduled', t });
        }
        // 决策 28：context（系统注入）/ unknown 仍默认过滤；
        // 0.2.x compaction 节点走官方 CompactionItem（此前漏渲染 ⇒ 压缩段整段消失）。
        case 'compaction':
            return h(CompactionItemMirror, { node: dataOf(node), t });
        case 'manual-compaction':
            // 官方 ManualCompactionNodeView 同样套 callRow 外壳。
            return h(ChatCallRow, null, h(CompactionItemMirror, { node: dataOf(node), t }));
        case 'context':
            return h(ContextInjectionRowMirror, { node: dataOf(node), t });
        case 'unknown':
            return null;
        default:
            // 决策 28：不认识的 kind 一律 fallback（折叠原文），升级不白屏。
            // 外壳 = 官方 MessageItem.contextRow（官方 UnknownNodeView 的同一个容器类）。
            return h('div', { className: officialClass('MessageItem', 'contextRow') ?? '' }, h('details', { className: 'dshpc-sv-tool' }, h('summary', { className: 'dshpc-sv-notice' }, `${t('sessionUnknownKind')} ${node.kind}`), h('pre', null, safeJson(node.data))));
    }
}
/**
 * assistant 内容块 → 子元素数组（官方块渲染器 lib/client.js:5826-5870 的同构）：
 * text → 官方 MarkdownText、reasoning → 官方 ReasoningRow（标题「思考」）、image 占位；
 * tool-call 块一律跳过（官方 case "tool-call": break——由独立工具节点渲染，重复画 = ×2）；
 * 未知块折叠原文。
 */
function assistantBlocks(blocks, t, fileMentions, 
/** 官方 streaming（节点 data.status === 'running'）：正文按流式尾渲染、末块思考行走 shimmer。 */
streaming = false, 
/** 图片 loader；缺席 = 图片块退回「[图片]」文本占位。 */
loadImage) {
    if (blocks === undefined)
        return [];
    const parts = [];
    const last = blocks.length - 1;
    blocks.forEach((block, index) => {
        switch (block.kind) {
            case 'text':
                if (block.text.trim() !== '') {
                    parts.push(h(AssistantMarkdown, { key: `t${index}`, text: block.text, streaming, fileMentions }));
                }
                break;
            case 'reasoning':
                if (block.text.trim() !== '') {
                    // 官方 running = streaming && i === last（原始块下标，不是过滤后的）。
                    parts.push(h(ReasoningRowMirror, { key: `r${index}`, text: block.text, running: streaming && index === last, t }));
                }
                break;
            case 'image': {
                // 官方：连续 image 块并成一组推一次（conversation.chat.message.images，align='start'）。
                const previous = blocks[index - 1];
                if (previous !== undefined && previous.kind === 'image')
                    break;
                const images = [];
                for (const candidate of blocks.slice(index)) {
                    if (candidate.kind !== 'image')
                        break;
                    const attachment = candidate.attachment;
                    if (attachment !== null && typeof attachment === 'object' && typeof attachment.attachmentId === 'string') {
                        images.push({ attachment });
                    }
                }
                if (loadImage !== undefined && images.length > 0) {
                    parts.push(h(ImageGalleryMirror, { key: `i${index}`, images, load: loadImage, align: 'start', t }));
                }
                else {
                    parts.push(h('div', { key: `i${index}`, className: 'dshpc-sv-image' }, t('sessionImage')));
                }
                break;
            }
            case 'tool-call':
                break;
            default:
                // 未知 block：折叠原文，升级不白屏。
                parts.push(h('details', { key: `o${index}`, className: 'dshpc-sv-tool' }, h('summary', null, t('sessionUnknownKind')), h('pre', null, safeJson(block.block))));
        }
    });
    return parts;
}
// ─────────────────────────── legacy 兜底渲染（order 缺失时） ───────────────────────────
/**
 * legacy 兜底渲染：官方兼容投影（老 kind 名）的单个节点；返回 null = 按决策 28 过滤的噪音 kind。
 * 仅在 keyed `order` 缺失时使用（正常路径见 renderKeyedNode）。
 */
function renderLegacyNode(node, t, fileOpen) {
    switch (node.kind) {
        case 'user':
        case 'steering': {
            // shortcut: legacy 兜底路径不带图片 loader（图片仍是「[图片]」占位）；keyed 主路已出真图。
            const text = contentText(node.content);
            const { files, hadFiles } = contentFiles(node.content);
            if (text === '' && !hadFiles)
                return null;
            return h(UserMessage, { key: node.seq, text, files, t });
        }
        case 'assistant': {
            const parts = assistantBlocks(node.blocks, t, fileOpen?.mentions);
            return parts.length === 0 ? null : h('div', { key: node.seq, className: 'dshpc-sv-assistant' }, parts);
        }
        case 'tool-result': {
            if (node.call?.name === 'present')
                return h(PresentRowMirror, { key: node.seq, block: node, t });
            return h(GenericCommandCard, {
                key: node.seq,
                name: node.call?.name ?? 'tool',
                argsRaw: node.call?.argsRaw ?? '',
                output: contentText(node.content),
                isError: node.isError === true,
                errorName: node.error?.name,
                meta: node.meta,
                settled: true,
                interrupted: node.error?.code === 'interrupted',
                onOpenFile: fileOpen?.open,
                t,
            });
        }
        case 'command': {
            return h(GenericCommandCard, {
                key: node.seq,
                name: `/${node.name ?? '?'}`,
                argsRaw: node.args ?? '',
                output: node.outcome?.text ?? '',
                isError: node.outcome?.kind === 'error',
                t,
            });
        }
        case 'turn-error':
            return h(TurnErrorItemMirror, { key: node.seq, node, t });
        case 'turn-max-tokens':
            return h(TurnMaxTokensItemMirror, { key: node.seq, t });
        case 'model-retry':
            // legacy 兼容投影的 model-retry = 单次尝试（ModelRetryNode 扁平节点）。
            return h(ModelRetryItemMirror, { key: node.seq, node, active: node.retryState === 'scheduled', t });
        // 决策 28：默认过滤的噪音 kind —— context（系统注入）、compaction（压缩标记）、
        // unknown（未知事件面）。assistant 里的 reasoning 由 mirror/ReasoningRow 折叠渲染。
        // ⚠ ui-map §十一-B：系统提示/上下文注入行（官方 ContextInjectionRow）待实施——届时从这里放行。
        case 'context':
        case 'compaction':
        case 'unknown':
            return null;
        default:
            // 决策 28：不认识的 kind 一律 fallback（折叠原文），升级不白屏。
            return h('details', { key: node.seq, className: 'dshpc-sv-tool' }, h('summary', { className: 'dshpc-sv-notice' }, `${t('sessionUnknownKind')} ${node.kind}`), h('pre', null, safeJson(node)));
    }
}
/**
 * 把连续的 tool-result / command 收成一个「过程」组——官方就是把工具调用折进
 * turn 的过程块（默认收起），页面才不会变成一列流水账。单个工具不再包组，避免多一层。
 */
function groupNodes(list) {
    const out = [];
    let run = [];
    const flush = () => {
        if (run.length === 0)
            return;
        const only = run[0];
        if (only === undefined) {
            run = [];
            return;
        }
        if (run.length >= 2)
            out.push({ kind: 'process', nodes: run });
        else
            out.push({ kind: 'node', node: only });
        run = [];
    };
    for (const node of list) {
        if (node.kind === 'tool-result' || node.kind === 'command') {
            run.push(node);
            continue;
        }
        flush();
        out.push({ kind: 'node', node });
    }
    flush();
    return out;
}
/** legacy 兜底整流的渲染（keyed order 缺失时才会走到）。 */
function renderLegacyRows(nodes, t, fileOpen) {
    const items = groupNodes(nodes);
    const rows = [];
    items.forEach((entry, index) => {
        const parts = [];
        if (entry.kind === 'process') {
            // legacy 兜底没有 turn 位置 ⇒ 拿不到官方「用时 N 秒」行，退回计数行。
            parts.push(h('div', { key: 'lead', className: 'dshpc-sv-notice' }, `${t('sessionProcess')} · ${entry.nodes.length}`));
            entry.nodes.forEach((node, i) => {
                const rendered = renderLegacyNode(node, t, fileOpen);
                if (rendered !== null)
                    parts.push(h('div', { key: `p${i}` }, rendered));
            });
        }
        else {
            const inner = renderLegacyNode(entry.node, t, fileOpen);
            if (inner !== null)
                parts.push(inner);
            if (entry.node.kind === 'assistant') {
                const next = items[index + 1];
                const isTurnEnd = next === undefined || !(next.kind === 'node' && next.node.kind === 'assistant');
                if (isTurnEnd)
                    parts.push(h(MessageIconActionsMirror, { key: 'act', text: assistantText(entry.node), clock: 'end', t }));
            }
        }
        if (parts.length === 0)
            return;
        rows.push(h('div', { key: `lg${index}`, className: officialClass('ChatView', 'flowItem') ?? '' }, parts));
    });
    return rows;
}
/** 路径归一：去 './' 前缀（词表键与 resolve 两侧同规则）。 */
function normalizeFilePath(p) {
    let s = p.trim();
    while (s.startsWith('./'))
        s = s.slice(2);
    return s;
}
/** 交付文件词表 / 每轮交付卡的数据读取（真源 = 官方 TurnLocation.data，见 changes.ts）。 */
function turnDeliverablesPresented(face) {
    const presented = turnDeliverablesValue(face, 'deliverables')?.presented;
    return Array.isArray(presented) ? presented : [];
}
/** 与 turnDeliverablesPresented 对称：读 turn 级 deliverables.produced（工具产出的文件）。
 * 官方 chatFileMentions = produced + presented；我们原先只收 presented，导致「只有 produced
 * 没有 present/get 参数」的会话里行内文件链接词表为空 —— 这里补齐（字段容错 path/name）。 */
function turnDeliverablesProducedPaths(face) {
    const produced = turnDeliverablesValue(face, 'deliverables')?.produced;
    if (!Array.isArray(produced))
        return [];
    const out = [];
    for (const item of produced) {
        const p = typeof item === 'string' ? item
            : (item !== null && typeof item === 'object' ? (item.path ?? item.name) : undefined);
        if (typeof p === 'string' && p.trim() !== '')
            out.push(p);
    }
    return out;
}
/**
 * 从 keyed 节点流收集真实文件词表（禁模拟：全部来自工具调用参数 / meta.diffs）：
 * tool-call 节点 argsRaw 的 file_path/path 字段（read/grep/glob/write/edit…）与
 * tool-fs 写入 meta.diffs[].path。会话级词表 = 官方 per-turn chatFileMentions 的简化偏差
 * （决策 39：resolve 命中才渲链接，解析不出保持惰性 code，永不猜）。
 */
function collectFilePaths(order, store, turns) {
    if (store === undefined)
        return [];
    const out = new Set();
    // 交付文件（presented）：会话 turn 级 deliverables.presented，同源覆盖 present 工具与插件代写。
    if (turns !== null && turns !== undefined) {
        const map = turns;
        for (const [, face] of map) {
            const presented = turnDeliverablesPresented(face);
            for (const file of presented) {
                const path = typeof file?.path === 'string' ? file.path : undefined;
                if (path !== undefined && path.trim() !== '')
                    out.add(normalizeFilePath(path));
            }
            // 工具产出的文件（deliverables.produced）也进词表：官方 chatFileMentions = produced + presented。
            for (const p of turnDeliverablesProducedPaths(face))
                out.add(normalizeFilePath(p));
        }
    }
    for (const key of order) {
        const node = store.get(key);
        if (node === undefined || node.kind !== 'tool-call')
            continue;
        const root = node.data?.root;
        if (root === undefined || root === null || typeof root !== 'object')
            continue;
        if (isPresentRoot(root)) {
            // present（交付文件）：files[].path 全进词表（官方 chatFileMentions 同源：produced + presented）。
            for (const file of presentFiles(root))
                out.add(normalizeFilePath(file.path));
            continue;
        }
        const call = (root.kind === 'tool-result' ? root.call : root);
        if (call === null || typeof call !== 'object')
            continue;
        const raw = typeof call.argsRaw === 'string' ? call.argsRaw.trim() : '';
        if (raw.startsWith('{')) {
            try {
                const parsed = JSON.parse(raw);
                for (const field of ['file_path', 'path']) {
                    const value = parsed[field];
                    if (typeof value === 'string' && value.trim() !== '')
                        out.add(normalizeFilePath(value));
                }
            }
            catch { /* 非法 JSON 不进词表 */ }
        }
        const meta = root.meta;
        if (typeof meta === 'object' && meta !== null) {
            const diffs = meta.diffs;
            if (Array.isArray(diffs)) {
                for (const diff of diffs) {
                    const p = diff?.path;
                    if (typeof p === 'string' && p.trim() !== '')
                        out.add(normalizeFilePath(p));
                }
            }
        }
    }
    return [...out];
}
/**
 * 每轮交付文件（官方 DeliverablesTail 同源数据）：读会话 turn 级 `deliverables.presented`。
 * 按 turn 归组、按路径去重（后者覆盖前者，与官方 presentedForClosing 的 map 语义一致）。
 * 纯客户端推导，零额外请求。
 */
function collectPresentedByTurn(turns) {
    const out = new Map();
    if (turns === null || turns === undefined)
        return out;
    const map = turns;
    for (const [key, face] of map) {
        const turn = typeof key === 'number' ? key : Number(key);
        if (!Number.isInteger(turn) || turn < 1)
            continue;
        const presented = turnDeliverablesPresented(face);
        if (presented.length === 0)
            continue;
        const files = [];
        for (const file of presented) {
            const path = typeof file?.path === 'string' ? file.path : undefined;
            if (path === undefined || path.trim() === '')
                continue;
            const description = typeof file?.description === 'string' && file.description.trim() !== '' ? file.description : undefined;
            files.push(description === undefined ? { path } : { path, description });
        }
        if (files.length > 0)
            out.set(turn, files);
    }
    return out;
}
/** 诊断：行内 code 命中真文件时记一行（去重 + 上限），确认 fileMentions 链路活着。 */
const mentionLog = new Set();
function logMentionHit(value, hit) {
    const key = `${value}\u0000${hit}`;
    if (mentionLog.has(key) || mentionLog.size >= 40)
        return;
    mentionLog.add(key);
    console.log('[preview] mention hit:', value, `→ ${hit}`);
}
/**
 * 从候选里挑一条真路径：同一个文件在词表里常有**多种写法**（工具参数是相对式
 * `2026Q4/1023/x.txt`，fs 改动事件是绝对式 `/workspace/Temp/2026Q4/1023/x.txt`）。
 * 判定 = 候选之间是否互为「尾段」（`longest.endsWith('/' + other)`）⇒ 是同一文件的两种写法，
 * 取**最长那条**（工作区根在 Temp，拿相对式去解析会落错根 ⇒ 必须给最完整的，否则预览报「文件不存在」）；
 * 不是同一文件且不止一条 ⇒ 不可判定，返回 undefined（永不猜）。
 */
function pickPath(candidates) {
    if (candidates === undefined || candidates.length === 0)
        return undefined;
    let longest = candidates[0];
    for (const p of candidates)
        if (p.length > longest.length)
            longest = p;
    const sameFile = candidates.every((p) => p === longest || longest.endsWith(`/${p}`));
    return sameFile ? longest : (candidates.length === 1 ? longest : undefined);
}
/**
 * 构建 fileMentions：按「路径尾段」匹配（词表里是绝对路径、markdown 里写的是工作区相对路径时，
 * 靠尾段对齐）；同一文件的多种写法取最长那条（见 pickPath）；不可判定 ⇒ undefined
 * ⇒ MarkdownText 保持惰性 code，永不猜。
 */
function makeFileMentions(paths, open) {
    // 尾段索引："a/b/c.txt" 同时登记 "a/b/c.txt" / "b/c.txt" / "c.txt"
    const bySuffix = new Map();
    for (const p of paths) {
        const norm = p.replace(/\\/g, '/');
        const parts = norm.split('/');
        for (let at = 0; at < parts.length; at++) {
            const key = parts.slice(at).join('/');
            const bucket = bySuffix.get(key);
            if (bucket === undefined)
                bySuffix.set(key, [norm]);
            else if (!bucket.includes(norm))
                bucket.push(norm);
        }
    }
    return {
        resolve(value) {
            const norm = normalizeFilePath(value).replace(/\\/g, '/');
            // 全路径本身也登记在尾段索引里（at=0），故只查一张表即可。
            const hit = pickPath(bySuffix.get(norm));
            // 未命中不打日志：官方对每个行内 code 都会问一次 resolve（含 `2026-10` 这类非文件值），全是噪音。
            if (hit === undefined)
                return undefined;
            logMentionHit(value, hit);
            return { label: value, title: hit, open: () => { open(hit); } };
        },
    };
}
/**
 * 面板内只读会话弹窗：只读、不可在框内续聊（底层 keyed 数组是只读快照，官方无写面）。
 * 续聊正道 = 头部「继续对话（开分支）」/ 消息行分支 icon（fork → openSession），
 * 以及底部暂存输入框（打字 → 确定 → onContinue 带话开分支并起轮次）。
 */
export function SessionViewModal(props) {
    ensureComponentStyles('session', SESSION_CSS);
    const tt = props.t ?? defaultT;
    const { heading, sessionId, view, onClose, forkSession, openHostSession, onContinue, onOpenFile } = props;
    // 归档态唯一真源 = 官方 `workspaces.list` 快照的 archivedSessionIds（core 的 connectHost 已订阅
    // 同一条 follow 流）。弹窗开着期间归档 / 取消归档，徽标与「继续对话」即时跟随，调用方零接线。
    const archivedNow = useCallback(() => workspaceList.isSessionArchived(sessionId), [sessionId]);
    const isArchived = useSyncExternalStore(workspaceList.subscribe, archivedNow, NOT_ARCHIVED);
    const subscribe = useMemo(() => (onChange) => view.target.subscribe(onChange), [view]);
    const getSnapshot = useMemo(() => () => view.target.getSnapshot(), [view]);
    // 第三参 = 同一个快照函数：React 要求 SSR 必给，缺了直接抛错。这里的数据挂在 props 的 view 上
    // （不是全局 store），服务端读同一个快照不会串数据；纯全局 store 才需要单独的空快照。
    const chat = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
    // 会话生命周期（加载态 / 向前翻页按钮），同样只读订阅。
    const sessionSub = useMemo(() => (onChange) => view.session.subscribe(onChange), [view]);
    const sessionGet = useMemo(() => () => view.session.getSnapshot(), [view]);
    const sessionSnap = useSyncExternalStore(sessionSub, sessionGet, sessionGet);
    // host `inbox` 投影（faceOf('inbox')）：首轮 durable 事件落盘前用户消息的权威来源，
    // 冷读 / 新打开预览时也拿得到；本地回显被 retire 后靠它继续画气泡。
    const inboxSub = useMemo(() => (onChange) => view.inbox.subscribe(onChange), [view]);
    const inboxGet = useMemo(() => () => view.inbox.getSnapshot(), [view]);
    const inboxSnap = useSyncExternalStore(inboxSub, inboxGet, NO_INBOX);
    // 「等待审批」+「选择题卡」：官方两处都在输入框位（composer takeover / 面板），弹窗等价位置 = 底栏栈顶部。
    // 数据面见 pending-approval.ts / pending-questions.ts（都是宿主公开只读面，缺席即不画）。
    const approvalFace = view.pendingApproval;
    const approvalSub = useMemo(() => approvalFace === null
        ? NO_CARD_SUBSCRIBE
        : (onChange) => approvalFace.subscribe(onChange), [approvalFace]);
    const approvalGet = useMemo(() => approvalFace === null ? NO_APPROVAL : () => approvalFace.getSnapshot(), [approvalFace]);
    const pendingApproval = useSyncExternalStore(approvalSub, approvalGet, NO_APPROVAL);
    const questionFace = view.pendingQuestions;
    const questionSub = useMemo(() => questionFace === null
        ? NO_CARD_SUBSCRIBE
        : (onChange) => questionFace.subscribe(onChange), [questionFace]);
    const questionGet = useMemo(() => questionFace === null ? NO_QUESTIONS : () => questionFace.getSnapshot(), [questionFace]);
    const pendingQuestions = useSyncExternalStore(questionSub, questionGet, NO_QUESTIONS);
    // 题卡的**活体**（官方 PendingQuestion）：有它才有作答通道与倒计时；缺席时下面退回只读投影。
    const liveQuestionFace = view.pendingQuestion;
    const liveSub = useMemo(() => liveQuestionFace === null
        ? NO_CARD_SUBSCRIBE
        : (onChange) => liveQuestionFace.subscribe(onChange), [liveQuestionFace]);
    const liveGet = useMemo(() => liveQuestionFace === null
        ? NO_LIVE_QUESTION
        : () => liveQuestionFace.getSnapshot(), [liveQuestionFace]);
    const liveQuestion = useSyncExternalStore(liveSub, liveGet, NO_LIVE_QUESTION);
    // 折叠状态：turn → 已展开的 answerStep（官方 store 的 storedTurnProcessEntry，同语义）。
    const [openTurns, setOpenTurns] = useState(() => new Map());
    const onSetOpen = useCallback((turn, answerStep, open) => {
        setOpenTurns((prev) => {
            const next = new Map(prev);
            if (open)
                next.set(turn, answerStep);
            else
                next.delete(turn);
            return next;
        });
    }, []);
    // 开分支：确认框显隐 + fork 进行中 + 失败原因。aliveRef 防「fork 在途时用户关弹窗」
    // 后仍跳转（await 回来时弹窗已卸载 ⇒ 放弃跳转，不 setState）。
    // 「继续对话」按归档状态分化（用户 2026-10-22 拍板）：
    //   已归档   ⇒ 开分支图标 + 确认框（fork 出子会话再跳官方区；官方策略归档会话不进主视图）
    //   未归档   ⇒ 会话图标，点击直跳官方会话页（uiWorkspace.openSession，无确认）
    const canFork = forkSession !== undefined && openHostSession !== undefined;
    // 「继续对话」只在缺跳转出口时缺席；已归档同样保留按钮（图标变分支 + 开分支确认框），
    // 不能因为调用方没接 fork 能力就把按钮抹掉。能力缺席在确认框里如实呈现。
    const showContinue = openHostSession !== undefined;
    const [forkTarget, setForkTarget] = useState(null);
    const [forking, setForking] = useState(false);
    const [forkErr, setForkErr] = useState(null);
    /** 官方 ChatView.modalAction（弹窗脚按钮 min-width 72px）；官方样式未注入时为 undefined。 */
    const modalActionClass = officialClass('ChatView', 'modalAction') ?? undefined;
    const aliveRef = useRef(true);
    useEffect(() => () => { aliveRef.current = false; }, []);
    // 取消归档时收掉「因为归档才弹的」fork 确认框（atSeq 缺省 = 头部按钮触发）；
    // 消息行分支确认框带 atSeq，fork 在途都不打断。
    useEffect(() => {
        if (!isArchived && !forking && forkTarget !== null && forkTarget.atSeq === undefined)
            setForkTarget(null);
    }, [isArchived, forking, forkTarget]);
    // 会话区自动贴底（用户 2026-11-04 二次拍板）：只有「首次打开」和「有新内容且当时在底部」
    // 两种情况允许贴底。状态机是纯逻辑（tail-follow.ts）：贴底只由**宿主快照内容版本变化**触发，
    // 不再由 ResizeObserver 的「高度变了」反推原因——展开 / 折叠思考行、历史分组是组件本地 state，
    // 只改 DOM 高度，不改 chat / sessionSnap，因此永远不会进这条链，视图不会被拽走。
    // scroll 事件只记录用户意图（往上滚 = 不跟），程序自己往下滚不会再触发追尾自激。
    const flowRef = useRef(null);
    const tailRef = useRef(null);
    const firstSnapRef = useRef(true);
    useLayoutEffect(() => {
        const flow = flowRef.current;
        const scroller = flow === null ? null : flow.closest('.dshpc-modal__body');
        if (scroller === null)
            return;
        const tail = createTailFollower({
            metrics: () => ({
                scrollTop: scroller.scrollTop,
                scrollHeight: scroller.scrollHeight,
                clientHeight: scroller.clientHeight,
            }),
            setScrollTop: (top) => { scroller.scrollTop = top; },
            frame: (fn) => requestAnimationFrame(fn),
            cancelFrame: (id) => cancelAnimationFrame(id),
        });
        tailRef.current = tail;
        const onScroll = () => { tail.scrolled(); };
        scroller.addEventListener('scroll', onScroll, { passive: true });
        tail.open(); // 首屏一把到底（instant）
        return () => {
            tail.dispose();
            tailRef.current = null;
            scroller.removeEventListener('scroll', onScroll);
        };
    }, []);
    // 唯一「有新内容」信号 = 宿主快照版本变化（chat / sessionSnap / inboxSnap 引用变了）。
    // pending 回显与 inbox 投影出现 / 消失也算（不来自 chat 快照）。首次挂载由 open() 负责。
    useLayoutEffect(() => {
        if (firstSnapRef.current) {
            firstSnapRef.current = false;
            return;
        }
        tailRef.current?.content();
    }, [chat, sessionSnap, inboxSnap]);
    const onForkAccept = useCallback(() => {
        if (forking || forkSession === undefined || openHostSession === undefined)
            return;
        setForking(true);
        setForkErr(null);
        void (async () => {
            try {
                const child = await forkSession(sessionId, forkTarget?.atSeq);
                if (!aliveRef.current)
                    return;
                // 先关弹窗（dispose ⇒ release 源会话 scope），再跳宿主会话区（官方导航服务）。
                onClose();
                openHostSession(child);
            }
            catch (error) {
                if (!aliveRef.current)
                    return;
                setForkErr(error instanceof Error ? error.message : String(error));
            }
            finally {
                if (aliveRef.current)
                    setForking(false);
            }
        })();
    }, [forking, forkSession, openHostSession, sessionId, forkTarget, onClose]);
    // 消息行分支按钮（官方分支 icon 位置）：从该轮 tail 消息截断开分支（同样先出确认框）。
    const onBranchAt = useCallback((seq) => {
        setForkErr(null);
        setForkTarget({ atSeq: seq });
    }, []);
    // 暂存输入框（期4）：打字 → 确定 → onContinue（调用方 fork + host send + 跳转）。
    const [draft, setDraft] = useState('');
    const [sending, setSending] = useState(false);
    const [sendErr, setSendErr] = useState(null);
    const onSend = useCallback(() => {
        const message = draft.trim();
        if (sending || message === '' || onContinue === undefined)
            return;
        setSending(true);
        setSendErr(null);
        void (async () => {
            try {
                await onContinue(message);
                if (!aliveRef.current)
                    return;
                setDraft('');
            }
            catch (error) {
                if (!aliveRef.current)
                    return;
                setSendErr(error instanceof Error ? error.message : String(error));
            }
            finally {
                if (aliveRef.current)
                    setSending(false);
            }
        })();
    }, [draft, sending, onContinue]);
    // 文件打开上下文：onOpenFile 就位即启用（工具卡 fileLink + md 行内 mention 共用单一入口）。
    // 透传本视图的 sessionId，使消费方在「文件所属会话」的正确作用域里打开，而非默认/全局锚点。
    const openFile = useCallback((path, options) => { onOpenFile?.(path, sessionId, options); }, [onOpenFile, sessionId]);
    const order = chat?.order ?? EMPTY_ORDER;
    const store = chat?.nodes;
    const keyed = order.length > 0 && store !== undefined;
    const turns = chat?.timeline?.turns;
    // 官方 ChatFlow 的 pendingRows（ui-chat 0.2.1-rc.5 lib/client.js:2815-2839 / 5686-5706）：
    // 首轮 durable 事件落盘前，用户消息在 host `inbox` 投影与 session.pendingSubmissions
    // 本地回显里，order 里没有 user 节点 ⇒ 两路不补，新会话就只剩「深度求索中」看不到自己发的话。
    const observedRpc = useMemo(() => keyed && store !== undefined ? observedRpcIds(order, key => store.get(key)) : new Set(), [keyed, order, store]);
    const waitingRows = useMemo(() => waitingUserRows(inboxSnap, sessionSnap?.pendingSubmissions, observedRpc), [inboxSnap, sessionSnap, observedRpc]);
    const pendingRows = waitingRows.map(row => h(UserMessage, {
        key: row.key,
        text: row.text,
        files: row.files,
        pending: row.pending,
        echo: row.echo,
        t: tt,
    }));
    // markdown 行内文件词表（来自 keyed 工具流；onOpenFile 未就位 = 整个上下文不启用）。
    const fileOpen = useMemo(() => {
        if (onOpenFile === undefined)
            return undefined;
        return {
            open: openFile,
            mentions: makeFileMentions(collectFilePaths(order, store, turns), openFile),
        };
    }, [onOpenFile, openFile, order, store, turns]);
    /**
     * 官方 markdown **链接**的打开出口（`[名](<路径>)` ⇒ 官方 MarkdownFileLink）。
     * 与 `fileMentions`（管行内 code）是两条独立的路：官方只有 `openFile` 就位才把链接渲成
     * `fileMention fileLink` 按钮（lib/index.js:11819），否则退回纯文本。
     * markdown 里常写工作区相对路径（如 `2026Q4/1023/x.txt`），词表里是 `/workspace/…` 前缀的真路径，
     * 故先用同一个词表归一到真路径再交给调用方；词表里没有就原样给（不猜）。
     */
    const openDelegatedFile = useMemo(() => {
        if (fileOpen === undefined)
            return () => { };
        return (path) => {
            const hit = fileOpen.mentions.resolve(path);
            if (hit === undefined) {
                fileOpen.open(path);
                return;
            }
            hit.open();
        };
    }, [fileOpen]);
    // 每轮交付文件（会话 turn 级 deliverables.presented 同源推导）。
    const deliveredByTurn = useMemo(() => collectPresentedByTurn(turns), [turns]);
    const deliverFiles = useMemo(() => {
        const byPath = new Map();
        const add = (file) => {
            const key = file.path.trim();
            if (key === '' || byPath.has(key))
                return;
            byPath.set(key, file);
        };
        for (const files of deliveredByTurn.values())
            for (const file of files)
                add(file);
        return [...byPath.values()];
    }, [deliveredByTurn]);
    // 最后一轮 turn-tail 的 turn 号：交付卡只挂这里（官方 DeliverablesTail 位置 = 会话底部收尾之后）。
    const lastTailTurn = useMemo(() => {
        if (!keyed || store === undefined)
            return undefined;
        for (let i = order.length - 1; i >= 0; i--) {
            const key = order[i];
            if (key === undefined)
                continue;
            const node = store.get(key);
            if (node?.kind !== 'turn-tail')
                continue;
            const data = node.data;
            const turn = data?.turn ?? turnLocationOf(node)?.turn;
            if (typeof turn === 'number')
                return turn;
        }
        return undefined;
    }, [keyed, order, store]);
    // 全 turn 扫描 `workspace/changes` 公告 seq（取最高 turn 的，官方 changesForClosing 同源）⇒ 挂 ChangedFiles 卡。
    // 不再只看最后一轮 turn-tail：changes 事件往往写在"编辑那轮"，而 turn-tail 落在更后面的收尾轮，
    // 只盯 lastTailTurn 会漏掉（真机「又没了」）。卡仍渲染在最后 turn-tail 位置（见 renderKeyedNode）。
    const lastTailChangesSeq = useMemo(() => {
        if (turns === null || turns === undefined)
            return undefined;
        const map = turns;
        let best = null;
        let bestTurn = -Infinity;
        for (const [key, face] of map) {
            const seq = turnDeliverablesChangesSeq(face);
            if (seq === null)
                continue;
            const t = typeof key === 'number' ? key : Number(key);
            if (!Number.isFinite(t) || t <= bestTurn)
                continue;
            bestTurn = t;
            best = seq;
        }
        return best ?? undefined;
    }, [turns]);
    // debug（临时）：诊断变化卡 / 交付卡 / 行内链接 / 两张待办卡的数据链到底缺在哪一环
    const diagChatRef = useRef(undefined);
    const diagCardRef = useRef(undefined);
    useEffect(() => {
        // 待办卡也参与判定：卡出现 / 消失时再打一行（否则刷新后卡不在时看不到任何读数）。
        if (diagChatRef.current === chat && diagCardRef.current === pendingApproval)
            return;
        diagChatRef.current = chat;
        diagCardRef.current = pendingApproval;
        const turnsMap = turns;
        const face = turnsMap === undefined ? undefined : (turnsMap.get(lastTailTurn) ?? turnsMap.get(String(lastTailTurn)));
        const deliverables = face === undefined ? undefined : turnDeliverablesValue(face, 'deliverables');
        const mentionPaths = fileOpen === undefined ? undefined : collectFilePaths(order, store, turns);
        // 逐 turn 安全展开（不触碰 data.keys/get 内部：宿主 data 可能是带 get 方法的普通对象，
        // 调 .keys() 会崩；这里只走 turnDeliverablesValue 读 deliverables，逐条 try/catch 兜底）。
        const turnsDetail = turnsMap === undefined ? [] : [...turnsMap.entries()].map(([k, f]) => {
            try {
                const dv = f === undefined ? undefined : turnDeliverablesValue(f, 'deliverables');
                const changes = dv === undefined ? undefined : dv.changes;
                const produced = dv === undefined ? undefined : dv.produced;
                const presented = dv === undefined ? undefined : dv.presented;
                return {
                    turn: k,
                    deliverKeys: dv === undefined ? 'none' : (typeof dv === 'object' && !Array.isArray(dv) ? Object.keys(dv) : Array.isArray(dv) ? 'array' : 'non-object'),
                    changesSeq: changes && typeof changes === 'object' && 'seq' in changes ? changes.seq : undefined,
                    producedLen: Array.isArray(produced) ? produced.length : undefined,
                    presentedLen: Array.isArray(presented) ? presented.length : undefined,
                };
            }
            catch {
                return { turn: k, error: true };
            }
        });
        console.log('[preview] diag', {
            hasChat: chat !== undefined,
            orderLen: order.length,
            turns: turnsMap === undefined ? 'undefined' : `Map(${turnsMap.size})`,
            turnKeySample: turnsMap === undefined ? [] : [...turnsMap.keys()].slice(0, 6),
            lastTailTurn,
            lastTailChangesSeq,
            deliverablesKeys: deliverables === undefined ? 'none' : Object.keys(deliverables),
            deliverFiles: deliverFiles.length,
            onOpenFile: onOpenFile !== undefined,
            mentionCount: mentionPaths === undefined ? 'no-fileOpen' : mentionPaths.length,
            mentionSample: mentionPaths === undefined ? [] : mentionPaths.slice(0, 6),
            // 两张待办卡的接线与当前值：刷新后卡不在时，用它一眼分清「没拿到服务」还是「快照确实空」。
            approvalWired: view.pendingApproval !== null,
            approvalNow: pendingApproval === undefined ? 'none' : pendingApproval.key,
            questionsWired: view.pendingQuestions !== null,
            questionsNow: pendingQuestions === null ? 'none' : pendingQuestions.callId,
        });
        console.log('[preview] turnsDetail', turnsDetail);
    }, [chat, order, turns, lastTailTurn, lastTailChangesSeq, deliverFiles, onOpenFile, fileOpen, store, view, pendingApproval, pendingQuestions]);
    // 官方 TurnTailNodeView 的两个判定（操作行常显 / 分支可用）——按 order + 节点仓预计算。
    const tailFacts = useMemo(() => (keyed && store !== undefined
        ? buildTurnTailFacts({ order, store, lastTurn: lastTailTurn })
        : undefined), [keyed, order, store, lastTailTurn]);
    // 底端插槽挂点：末尾是**带回复的 turn-tail** 时挂在它之前（最后那条回复之后、复制 / 分支 /
    // 用量操作行之上）；没有回复（closing 为空）或末尾不是 tail ⇒ 退回流的末尾。
    const footerAnchorKey = useMemo(() => {
        if (!keyed || store === undefined)
            return undefined;
        const lastKey = order[order.length - 1];
        const last = lastKey === undefined ? undefined : store.get(lastKey);
        if (last?.kind !== 'turn-tail')
            return undefined;
        const closing = last.data?.closing;
        return closing === null || closing === undefined ? undefined : lastKey;
    }, [keyed, order, store]);
    // 内容两端插槽（调用方自绘）：不传 = 不渲染元素（少一层空容器多吃一个 gap）；四态都渲染。
    // 顶端槽的**下边距由自己的类固定**（见 session.css）：不依赖相邻项自己的 margin，
    // 否则相邻项换一种（turn-trigger / 用户气泡 / 提示条）间距就跟着变。
    const bodyHeaderRow = props.bodyHeader === undefined
        ? null
        : h('div', { key: 'bodyHeader', className: 'dshpc-sv-body-header' }, props.bodyHeader);
    const bodyFooterRow = props.bodyFooter === undefined
        ? null
        : h('div', { key: 'bodyFooter', className: 'dshpc-sv-body-footer' }, props.bodyFooter);
    const renderNode = useCallback((node, turnProcess, groupPart) => renderKeyedNode(node, turnProcess, tt, onBranchAt, fileOpen, groupPart, deliverFiles, lastTailTurn, lastTailChangesSeq, sessionId, props.onOpenReview, tailFacts, props.view.loadImage, bodyFooterRow, footerAnchorKey), [tt, onBranchAt, fileOpen, deliverFiles, lastTailTurn, lastTailChangesSeq, sessionId, props.onOpenReview, tailFacts, props.view.loadImage, bodyFooterRow, footerAnchorKey]);
    // 官方 grouped('chat')：把 keyed 流切成「独立条目 + 过程分组」（二级收折）。
    const isTurnClosed = useCallback((turn) => (turns?.get(turn) ?? turns?.get(String(turn)))?.status !== 'open', [turns]);
    const groupedView = useMemo(() => keyed ? buildProcessGroups(order, key => store?.get(key), isTurnClosed) : undefined, [keyed, order, store, isTurnClosed]);
    // 官方 RunningStatus（0.2.x）的 startTime：流末尾那个节点所属 turn 处于 open 时的开始时间
    // （ChatFlow lib/client.js:5645-5649）。没有 open turn ⇒ 不渲染这一行。
    const runningStartTime = useMemo(() => {
        if (!keyed || store === undefined)
            return undefined;
        const last = order[order.length - 1];
        const location = last === undefined ? undefined : store.get(last)?.location;
        if (location?.kind !== 'turn' && location?.kind !== 'step')
            return undefined;
        return location.turn?.status === 'open' ? location.turn.start?.time : undefined;
    }, [keyed, order, store]);
    // ChatNodeList 直接调用（无 hook 的纯函数）：它产出的是「flowItem 数组」，不是单个元素。
    const rows = keyed
        ? ChatNodeListMirror({
            order,
            store,
            entries: groupedView?.entries,
            groups: groupedView?.groups,
            openState: openTurns,
            onSetOpen,
            // 官方 usePresentation(policy => policy.foldCompletedTurns)：只读历史视图按「折叠已完成轮次」处理。
            foldCompleted: true,
            renderNode,
            t: tt,
        })
        : renderLegacyRows(chat?.legacy?.nodes ?? [], tt, fileOpen);
    const rendered = rows.filter((row) => row !== null && row !== undefined);
    const officialCount = officialModuleCount();
    if (!officialWarned) {
        officialWarned = true;
        console.info(`[dsh-plugin-core:session] 官方 ui-chat 模块数=${officialCount}；类名样例 frame=${officialClass('ChatView', 'frame')} flowItem=${officialClass('ChatView', 'flowItem')} trigger=${officialClass('TurnTriggerNodeView', 'root')} turnProcess=${officialClass('TurnProcessNodeView', 'root')} tail=${officialClass('TurnTailNodeView', 'root')}`);
        if (officialCount === 0) {
            console.warn('[dsh-plugin-core:session] 未发现官方 ui-chat 样式模块 ⇒ 弹窗观感退回自绘样式（功能不受影响）');
        }
    }
    const openState = sessionSnap?.openState;
    const showLoadOlder = sessionSnap?.hasMore !== false;
    // 官方 ChatFlow 的流末尾顺序 = rows → pendingRows → RunningStatus（lib/client.js:5703-5706）；
    // 运行态由 SessionSnapshot.running 决定（:5645/:5704），不是从 order 末尾节点反推。
    const runningRow = sessionSnap?.running !== true
        ? null
        : h(RunningStatusMirror, { key: 'running', startTime: runningStartTime, t: tt });
    const body = rendered.length === 0 && pendingRows.length === 0
        ? [
            bodyHeaderRow,
            // 官方三态各走各的类：error = openError（错误色），loading / 空 = hint。
            openState === 'error'
                ? h(ChatOpenError, { key: 'hint', text: tt('sessionFailed') })
                : h(ChatHint, {
                    key: 'hint',
                    text: openState === 'loading' || openState === 'cold' ? tt('sessionLoading') : tt('sessionEmpty'),
                }),
            runningRow,
            // 已挂在最后一条 tail 上的话这里不再画（否则同一个槽出现两次）。
            footerAnchorKey === undefined ? bodyFooterRow : null,
        ]
        : [
            bodyHeaderRow,
            showLoadOlder
                ? h(ChatOlderButton, { key: 'older', label: tt('sessionLoadOlder'), onClick: () => { view.loadOlder(); } })
                : null,
            ...rendered,
            ...pendingRows,
            runningRow,
            footerAnchorKey === undefined ? bodyFooterRow : null,
        ];
    const flowChildren = Array.isArray(body) ? body : [body];
    // 头部两槽：标题区整块替换（`header`）与右侧动作追加（`headerActions`）。
    // 自定义标题区时归档徽标挪到动作区最前 —— 归档是数据事实，不能因为自定义标题就消失。
    const customHeader = props.header !== undefined;
    const archivedBadge = isArchived
        ? h('span', { className: 'dshpc-sv-archived' }, h(IconArchiveOutlineRegular, { size: 12 }), tt('sessionArchived'))
        : undefined;
    // 「继续对话」：已归档 = 开分支图标 + 确认框；未归档 = 会话图标直跳官方会话页。
    const continueAction = showContinue
        ? h(Button, {
            variant: 'outline',
            size: 'sm',
            disabled: forking,
            icon: isArchived
                ? h(IconBranchOutlineRegular, { size: 14 })
                : h(IconNewChatOutlineRegular, { size: 14 }),
            onClick: () => {
                // 官方 openForkSource 判据：动作前读权威快照（client 内存，零远端 IO），
                // 避免渲染与快照之间的竞态把已归档会话直开。
                if (archivedNow()) {
                    setForkErr(null);
                    setForkTarget({});
                }
                else if (openHostSession !== undefined) {
                    onClose();
                    openHostSession(sessionId);
                }
            },
        }, tt('continueBranch'))
        : undefined;
    // 动作区顺序（都靠右，「继续对话」与 ✕ 恒在最右）：归档徽标 → 调用方动作 → 继续对话 → ✕。
    const headActions = continueAction === undefined && props.headerActions === undefined && !(customHeader && archivedBadge !== undefined)
        ? undefined
        : h(Fragment, null, customHeader ? archivedBadge : null, props.headerActions, continueAction);
    // 外壳 = **核心 Modal**（size lg：min(1120px,100vw-32px) × calc(100%-80px)，兄弟项目大弹窗同值）；
    // 「继续对话」与确认框按钮一律**核心 Button**，不就地自绘（用户 2026-10-22 拍板）。
    // 会话中间部分 = mirror/ 官方 1:1 复刻（ChatViewFrame：官方类优先，缺失回退自绘）。
    // 待答题目面板（官方 `conversation.composer` 上的 QuestionComposer）：读**活体**载体
    // （`uiSession.sessionStatus.pendingInteraction`，kind='question'）⇒ 与官方同一份题、同一条作答路径。
    // 活体缺席（宿主没装题面板外壳包 / 载体已撤）时退回只读来源（投影 → chat 快照里未结算的 ask 调用），
    // 仍按官方面板形态画（题 + 选项照出），只是不可点、没有底栏动作。
    const pendingQuestionsView = useMemo(() => pendingQuestions ?? pendingQuestionsFromNodes(order, key => store?.get(key)), [pendingQuestions, order, store]);
    const questionItems = liveQuestion !== undefined ? liveQuestion.questions : pendingQuestionsView === null ? null : pendingQuestionsView.questions;
    // 有题但没有活体载体 ⇒ 让官方把那张卡放回 composer 座位（官方给的唯一回去的路，收起只是离座、
    // waterfall 没断）。放回成功后 `pendingInteraction` 会推上来，面板自己就变成可作答。
    // 每个 callId 只放回一次：用户自己点关闭后再放回来 = 那个钮等于没用。
    const revealPendingQuestion = view.revealPendingQuestion;
    const questionCallId = pendingQuestionsView?.callId;
    const questionState = pendingQuestionsView?.state;
    const revealedQuestionRef = useRef(null);
    const dismissedQuestionRef = useRef(null);
    useEffect(() => {
        if (liveQuestion !== undefined || questionCallId === undefined)
            return;
        if (dismissedQuestionRef.current === questionCallId || revealedQuestionRef.current === questionCallId)
            return;
        revealedQuestionRef.current = questionCallId;
        if (revealPendingQuestion?.(questionCallId) === true || questionReadOnlyWarned)
            return;
        questionReadOnlyWarned = true;
        console.info(`[dsh-plugin-core:session] 题面板只读（无活体载体）：`
            + `preview=${pendingQuestions === null ? 'chat 快照' : 'userQuestions 投影'}，state=${questionState ?? '—'}；`
            + '官方那边这张卡已经不在（refresh / 后台委托 / 宿主动过），任何客户端都没有可作答通道');
    }, [liveQuestion, revealPendingQuestion, questionCallId, pendingQuestions, questionState]);
    const questionWiring = liveQuestion === undefined ? null : questionPanelWiring(liveQuestion);
    // 用户在弹窗里关掉面板 ⇒ 面板整块消失（官方那边也是从 composer 上撤走），不退回只读、也不自动再放回来。
    const questionDismissed = liveQuestion === undefined
        && questionCallId !== undefined
        && dismissedQuestionRef.current === questionCallId;
    const questionRow = questionItems === null || questionDismissed
        ? null
        : h('div', { className: 'dshpc-sv-question' }, h(QuestionPanel, {
            panelKey: liveQuestion !== undefined ? liveQuestion.key : questionCallId,
            questions: questionItems,
            // 活体：态现读（倒计时会自己跳）；只读兜底：静态快照。
            ...(questionWiring ?? { card: { state: questionState ?? 'open' } }),
            ...(questionWiring?.dismiss === undefined || questionCallId === undefined
                ? {}
                : {
                    // 关之前先记账：关掉之后 effect 不能再 reveal 回来。
                    dismiss: () => {
                        dismissedQuestionRef.current = questionCallId;
                        return questionWiring.dismiss?.();
                    },
                }),
            t: tt,
        }));
    // 审批卡位置 = 官方「输入框接管」（`conversation.composer` 槽）的等价物：底栏栈顶、暂存输入框上方。
    const approvalRow = pendingApproval === undefined
        ? null
        : h('div', { className: 'dshpc-sv-approval' }, h(ApprovalPanelMirror, {
            approval: pendingApproval,
            command: approvalCommand(order, key => store?.get(key), pendingApproval.callId),
            t: tt,
        }));
    const hasCard = questionRow !== null || approvalRow !== null;
    return h(Fragment, null, h(Modal, {
        size: 'lg',
        // 二级：整块标题区交给调用方（含 sessionId 行）；一级：只换标题行，副标题仍由核心画。
        // 会话 id 是**标识**，放标题下方副标题行，不占正文（用户 2026-10-22：一串 MD5 不该出现在正文里）。
        header: props.header,
        title: customHeader ? undefined : (props.title ?? heading ?? tt('sessionHeading')),
        subtitle: customHeader
            ? undefined
            : h(Fragment, null, h('span', null, sessionId), 
            // 可见探针：官方样式未命中时直接显示（省得翻控制台）。命中则不显示。
            officialCount === 0
                ? h('span', { className: 'dshpc-sv-probe' }, ' ⚠ ', tt('sessionProbeStyle'))
                : null),
        // 归档标识（官方归档图标 + 「已归档」）走头部右侧小块；自定义标题区时改挂动作区最前。
        headerExtra: customHeader ? undefined : archivedBadge,
        headerActions: headActions,
        onClose,
        translate: tt,
        // 官方那两处卡片周围没有分隔线 ⇒ 有卡时关掉弹窗底栏的顶线（否则卡上方多一条）。
        footerDivider: !hasCard,
        // 底栏纵向栈：题卡 / 审批卡（官方输入框接管位）+ 暂存输入框，都不随会话区滚动。
        footer: onContinue === undefined && !hasCard ? undefined : h('div', { className: 'dshpc-sv-foot' }, questionRow, approvalRow, 
        // 暂存输入框：打字 → 确定 → onContinue 带话开分支跳官方视图。
        // 有待审批时**让位**给审批卡：官方是 composer 接管（ui-approval lib/client.js:470-477 注册到
        // `conversation.composer` 且不链到默认输入框）⇒ 卡下方不该再垫一个输入框。
        onContinue === undefined || pendingApproval !== undefined ? null : h('div', { className: 'dshpc-sv-composer' }, h('textarea', {
            value: draft,
            placeholder: tt('composerPlaceholder'),
            disabled: sending,
            onChange: (event) => { setDraft(event.target.value); },
            onKeyDown: (event) => {
                if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
                    event.preventDefault();
                    onSend();
                }
            },
        }), h(Button, {
            variant: 'primary',
            size: 'sm',
            disabled: sending || draft.trim() === '',
            onClick: onSend,
        }, sending ? tt('forkWorking') : tt('confirm')), h('span', { className: 'dshpc-sv-composer-hint' }, '⌘/Ctrl + ↵'), sendErr !== null ? h('div', { className: 'dshpc-sv-forkerr' }, sendErr) : null)),
    }, h('div', { className: 'dshpc-sv', ref: flowRef }, 
    // markdown 导航委托：挂上 openFile 后，正文里的本地文件链接才渲成官方
    // `fileMention fileLink` 按钮（不挂 ⇒ 官方自己退回纯文本）。
    fileOpen === undefined
        ? h(ChatViewFrame, { children: flowChildren })
        : h(MarkdownDelegateProvider, { openFile: openDelegatedFile }, h(ChatViewFrame, { children: flowChildren })))), 
    // 开分支确认框（用户拍板：必须先确认再 fork，防误点）——核心 Modal + Button。
    forkTarget === null ? null : h(Modal, {
        size: 'sm',
        onClose: () => { if (!forking)
            setForkTarget(null); },
        title: tt('forkConfirmTitle'),
        translate: tt,
        // 弹窗脚按钮宽度与官方对话框对齐（官方 ChatView.modalAction：min-width 72px）。
        footer: [
            h(Button, { key: 'cancel', variant: 'outline', className: modalActionClass, disabled: forking, onClick: () => { setForkTarget(null); } }, tt('cancel')),
            h(Button, { key: 'accept', variant: 'primary', className: modalActionClass, disabled: forking || !canFork, onClick: onForkAccept }, forking ? tt('forkWorking') : tt('forkConfirmAccept')),
        ],
    }, h('p', { className: 'dshpc-sv-forktext' }, tt('forkConfirmText')), canFork ? null : h('p', { className: 'dshpc-sv-forkerr' }, tt('forkUnavailable')), forkErr !== null ? h('p', { className: 'dshpc-sv-forkerr' }, tt('forkFailed', { error: forkErr })) : null));
}
//# sourceMappingURL=SessionViewModal.js.map