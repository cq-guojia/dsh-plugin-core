// 复用官方真实 CSS-module 类名（会话预览弹窗外观对齐官方，方案 ①）。
//
// 事实（读 @deepseek-ai/dsh-client-ui-chat@0.2.2-rc.1 源码 lib/client.js，与 0.2.1-rc.5 逐模块比对）：
// 两版注入形态一致：
// 官方 CSS module 由宿主在运行时注入 document.head，形如
//   <style data-plugin="@deepseek-ai/dsh-client-ui-chat"
//          data-plugin-css="@deepseek-ai/dsh-client-ui-chat/ChatView.module.css">
//     .EvIC1a_frame{...} .EvIC1a_root{...} .EvIC1a_scroll{...} ...
// 类名 = <构建哈希>_<语义名>（语义名是 camelCase，来自源码里的 *_module_css_default 映射表）。
//
// 为什么要「运行时发现」而不是把类名写死：哈希每次构建都可能变，写死就会在某次宿主升级后
// 集体失效；运行时解析则**自动跟随**。语义名若被改名，取不到 ⇒ 回退到自绘样式（不崩、
// 不空白），并在控制台告警一次。
//
// 已知官方模块（0.2.2-rc.1 解包核实；语义名一律运行时从 CSS 文本解析，不在此穷举）：
//   ui-chat: ChatView / AssistantMarkdown / MessageItem / ChatGroupSeat / ContextBody /
//            ContextInjectionRow / GenericCommandCard / MessageIconActions / ReasoningRow /
//            TurnUsagePanel / TurnTriggerNodeView / TurnProcessNodeView / TurnTailNodeView /
//            TurnNavigator / StatsPills / stat-dialog / accessibility
//   ui-tool: ToolRow / ToolDetails / AskQuestionCard / ExitCodeBadge / bash-sample
//   ui-skill: SkillRow（keyed toolview key='skill' 的专属卡，0.2.1-rc.5 起就有）
//   ui-deliverables: Deliverables / ChangedFiles / FileDiff / PresentRow
//   ui-sidebar-documentpreview: CodeBody / TextPreview（0.2.2-rc.1 用 content / lineMark
//            取代 lineTarget；本仓未取用）
//   ⚠ 0.2.2-rc.1 删了 MessageItem.bubble：用户气泡改由官方原语 UserMessageBubble 渲染
//     （primitives lib/UserMessageBubble.module.css），该包 CSS 不走 data-plugin-css 注入 ⇒
//     本表查不到也不该查，mirror/MessageItem.ts 直接用官方组件。
//   0.2.x 已删 ToolRow.chevron / imageLabel（箭头样式并入 primitives DisclosureRow）。
/** 本仓会话预览当前对齐的宿主版本（单一真源；升级核对工具读这里，散落的版本注释不作真源）。 */
export const ALIGNED_HOST_VERSION = '0.2.2-rc.1';
/** 官方注入 style 标签的 data-plugin-css 包前缀（chat 主视图 + ui-tool / ui-skill 工具卡 + ui-deliverables）。 */
const CSS_PKG_PREFIXES = [
    '@deepseek-ai/dsh-client-ui-chat/',
    '@deepseek-ai/dsh-client-ui-tool/',
    '@deepseek-ai/dsh-client-ui-skill/',
    '@deepseek-ai/dsh-client-ui-deliverables/',
    '@deepseek-ai/dsh-client-ui-sidebar-documentpreview/',
];
/**
 * 解析一段官方 CSS module 文本，抽出 {语义名 → 真实类名}。
 * 纯函数、无 DOM 依赖（冒烟可直接对夹具断言）。
 * @param css - style 标签的 textContent。
 * @returns 语义名到真实类名的映射；解析不出哈希前缀时为空表。
 */
export function parseOfficialCss(css) {
    const out = new Map();
    const tokens = [];
    const tokenRe = /\.([A-Za-z0-9_-]+)/g;
    let m = tokenRe.exec(css);
    while (m !== null) {
        const token = m[1];
        if (token !== undefined)
            tokens.push(token);
        m = tokenRe.exec(css);
    }
    // 类名形如 <hash>_<semantic>，而 **hash 本身可能以 `_` 开头**（实测：GenericCommandCard 的
    // `._5OnbHa_root`），所以必须按「最后一个下划线」切分，不能按第一个——按第一个会把
    // `_5OnbHa_root` 的第一个下划线当分隔位置（下标 0）而整类跳过，导致该模块解析成空表。
    // 官方语义名是 camelCase、不含下划线（源码 *_module_css_default 实测），故末位切分安全。
    const counts = new Map();
    for (const token of tokens) {
        const at = token.lastIndexOf('_');
        if (at <= 0 || at === token.length - 1)
            continue;
        const prefix = token.slice(0, at);
        counts.set(prefix, (counts.get(prefix) ?? 0) + 1);
    }
    let prefix = '';
    let best = 0;
    counts.forEach((count, key) => { if (count > best) {
        best = count;
        prefix = key;
    } });
    if (prefix === '')
        return out;
    for (const token of tokens) {
        if (!token.startsWith(`${prefix}_`))
            continue;
        const semantic = token.slice(prefix.length + 1);
        // 语义名是 camelCase，不含下划线；跳过复合类名（如 foo_bar_baz 的剩余部分）
        if (semantic === '' || semantic.includes('_'))
            continue;
        if (!out.has(semantic))
            out.set(semantic, token);
    }
    return out;
}
/** 已发现的官方模块表与缓存时的官方 style 标签数。 */
let discovered = null;
let discoveredTagCount = 0;
/**
 * 扫描 document 里官方包注入的 style 标签，按模块缓存解析结果。
 * 官方 CSS module 分属多个独立包、可能分批注入，只缓存「第一批」会让后注入的模块
 * 永远取不到类名 ⇒ 标签数一变就重扫。
 * 无 document（SSR / 冒烟）时返回空表。
 */
export function discoverOfficialClasses() {
    // shortcut: 只按标签数判变化，同数量替换内容（宿主内不会重建 style 标签）不触发重扫；
    // 若将来宿主支持热替换 CSS，需改为比对每个 tag 的 textContent。
    const tags = typeof document !== 'undefined' ? document.querySelectorAll('style[data-plugin-css]') : null;
    const count = tags?.length ?? 0;
    if (discovered !== null && count === discoveredTagCount)
        return discovered;
    const result = new Map();
    if (tags !== null) {
        for (let i = 0; i < tags.length; i++) {
            const tag = tags[i];
            const id = tag.dataset.pluginCss ?? '';
            const prefix = CSS_PKG_PREFIXES.find(candidate => id.startsWith(candidate));
            if (prefix === undefined)
                continue;
            const module = id.slice(prefix.length).replace(/\.module\.css$/, '');
            const parsed = parseOfficialCss(tag.textContent ?? '');
            // 解析成空表 = 解析器没认出该模块的类名格式（曾在 GenericCommandCard 上踩过：
            // 哈希以 `_` 开头被首下划线切分跳过）⇒ 显式告警，别再静默退回自绘。
            if (parsed.size === 0 && (tag.textContent ?? '').includes('.')) {
                console.warn(`[dsh-plugin-core:session] 官方模块 ${module} 类名解析为空（格式可能变了）`);
            }
            result.set(module, parsed);
        }
    }
    // 只在真的发现到模块时才缓存：本插件 client 可能先于官方包加载，
    // 此时扫到空表若缓存住，后面官方样式注入了也取不到。
    if (result.size > 0) {
        discovered = result;
        discoveredTagCount = count;
    }
    return result;
}
/** 已发现的官方模块数（0 = 官方样式未注入，调用方应走自绘兜底）。 */
export function officialModuleCount() {
    return discoverOfficialClasses().size;
}
/**
 * 取一个官方类名；取不到返回 null（调用方回退自绘样式）。
 * @param module - 模块名（如 `ChatView`）。
 * @param semantic - 语义名（如 `frame`）。
 */
export function officialClass(module, semantic) {
    return discoverOfficialClasses().get(module)?.get(semantic) ?? null;
}
/**
 * 取多个官方类名并拼成 className；取不到的项自动跳过。
 * @param pairs - [模块名, 语义名] 列表。
 */
export function officialClasses(...pairs) {
    const out = [];
    for (const [module, semantic] of pairs) {
        const found = officialClass(module, semantic);
        if (found !== null)
            out.push(found);
    }
    return out.join(' ');
}
//# sourceMappingURL=official-classes.js.map