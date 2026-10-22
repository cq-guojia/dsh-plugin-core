// 工作区文件浏览器（U11）：面包屑 + ▾ 选层 + 内联展开目录树 + 文件预览。
//
// 源实现 = 兄弟项目 dsh-task-dispatch-table/src/client/file-browser.tsx（868 行）——本文件是它的
// core 重实现（"抄"不是"复制"）：组件全部换 core 自己的体系，官方件只经 ui/official 消费；
// 修掉源实现的已知问题：根缓存改可注入（原模块级 Map 永不清除）、复制路径补 catch、
// 复制/选中路径口径统一为工作区相对、去掉死代码。
//
// 两个消费场景共用本组件（用户 2026-10-20 拍板：同一套内容，两种展现形式）：
//  · 浏览（dock）：由 **核心 PanelDock** 承载（openFilePreview），拖宽与关闭都由它负责，
//    本组件不再自绘拖拽条 / 侧边栏外壳；
//  · 选择（picker）：`picker` + `onPick(path, isDir)`（path 为**工作区相对**路径），点文件即回调。
//
// 控件纪律：能用核心控件的一律核心（ghost 面包屑 / IconButton / Segmented / MarqueeText）；
// 核心没有的那一项 = ▾ 选层浮层，按兄弟项目 dsh-task-dispatch-table 的 `.dsh-tdt-sv-crumbs-*`
// 逐像素照抄（间距 / 圆角 / 最大高度 / 空态），不自创度量。
import { createElement as h, Fragment, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore, } from 'react';
import { IconCheckOutlineRegular, IconChevronDownOutlineRegular, IconChevronRightOutlineRegular, IconCloseOutlineRegular, IconCopyOutlineRegular, IconFolderCloseRegular, IconFolderOpenOutlineRegular, IconRefreshOutlineRegular, writeClipboard, FileTypeIcon, } from '../ui/official.js';
import { ensureControls } from '../ui/css.js';
import { Button, IconButton } from '../ui/Button.js';
import { MarqueeText } from '../ui/MarqueeText.js';
import { Segmented } from '../ui/Segmented.js';
import { workspaceList } from '../ui/host-data.js';
import { t } from '../utils/i18n.js';
import { FilePreview } from './preview/index.js';
import { absolutizeDir, bareCode, baseNameOfPath, crumbsOfDir, createRootCache, dirnameOf, errView, findAnyFileAbs, isAbsoluteish, isFailed, joinPath, learnRoot, listingOf, listPathOf, matchesFilter, relativizeToRoot, sortEntries, workspaceAnchorForPath, } from './types.js';
/**
 * ▾ 下拉条目构造（**picker 与 dock 共用同一段代码**，差别只在入参——源实现用户 2026-09-29
 * 点名提炼，严禁两处各写一份）：
 *  - 当前工作区排第一（打开文件夹图标 + 加粗），**其下路径紧跟**（每层一个右箭头位缩进），
 *   再列其他工作区（关合图标 + 灰）——「打开哪个就跟在哪个下面」；点当前工作区 = 回到其根目录。
 *  - 当前工作区未知（rootName 空或不在清单）时路径段置顶、全部工作区按「其他」罗列；
 *  - workspaces 不传 = 不显示工作区段（根无箭头、其下逐层缩进）。
 *
 * 条目是**自写浮层**（核心没有「带缩进的选择层菜单」这类控件 ⇒ 按兄弟项目
 * `dsh-task-dispatch-table` 的 `.dsh-tdt-sv-crumbs-menu*` 逐条照抄间距）：
 * backdrop + 菜单本体 + `-item`（4px 8px / 最大宽 280 / 超出滚动 / 空态）。
 */
function crumbsMenuEntries(params) {
    const { workspaces, rootName, rootFallbackLabel, crumbs, onPickWorkspace, onLoadDir } = params;
    const out = [];
    // 内联样式照抄兄弟项目（wsEntry 的 gap 6px 覆盖类的 2px：图标与文字的间距以它为准）。
    const wsEntry = (ws, current) => h('button', {
        key: `ws:${ws}`,
        type: 'button',
        role: 'menuitem',
        className: 'dshpc-fb__menu-item',
        style: { paddingLeft: 8, display: 'flex', alignItems: 'center', gap: '6px' },
        title: ws,
        // 点当前工作区 = 回到该工作区根目录（浏览深处时唯一的「回根」入口，兄弟 2026-10-10）；
        // 点其他工作区才走 onPickWorkspace（换会话）。
        onClick: () => {
            if (current)
                onLoadDir?.('');
            else
                onPickWorkspace?.(ws);
        },
    }, h('span', { className: 'dshpc-fb__menu-icon', style: { color: current ? 'var(--dshpc-fg)' : 'var(--dshpc-fg-2)' } }, h(current ? IconFolderOpenOutlineRegular : IconFolderCloseRegular, { size: 13 })), h('span', { className: 'dshpc-fb__menu-label', style: { fontWeight: current ? 600 : 400 } }, ws));
    const pathEntry = (crumb, depth, withArrow = true) => h('button', {
        key: `dir:${crumb.path}`,
        type: 'button',
        role: 'menuitem',
        className: 'dshpc-fb__menu-item',
        style: { paddingLeft: 8 },
        title: crumb.path,
        onClick: () => {
            onLoadDir?.(crumb.path);
        },
    }, withArrow
        ? h(Fragment, null, Array.from({ length: depth }, (_, s) => h('span', { key: `s${s}`, className: 'dshpc-fb__menu-chev-slot', 'aria-hidden': true })), h('span', { className: 'dshpc-fb__menu-chev' }, h(IconChevronRightOutlineRegular, { size: 11 })))
        : null, h('span', { className: 'dshpc-fb__menu-label' }, crumb.label));
    if (workspaces === undefined) {
        if (crumbs.length === 0)
            return [h('div', { key: 'empty', className: 'dshpc-fb__menu-empty' }, rootFallbackLabel)];
        return crumbs.map((crumb, index) => pathEntry(crumb, index === 0 ? 0 : index - 1, index !== 0));
    }
    // 路径段：根 crumb（path=''）已由工作区段表达时剔除，深度从根下一层起算。
    const segments = rootName !== '' && crumbs.length > 0 && crumbs[0]?.path === '' ? crumbs.slice(1) : crumbs;
    if (rootName !== '' && workspaces.includes(rootName)) {
        // 当前工作区排第一，其下路径紧跟，然后是其他工作区（保持原相对顺序）。
        out.push(wsEntry(rootName, true));
        segments.forEach((crumb, i) => {
            out.push(pathEntry(crumb, i));
        });
        for (const ws of workspaces) {
            if (ws !== rootName)
                out.push(wsEntry(ws, false));
        }
    }
    else {
        segments.forEach((crumb, i) => {
            out.push(pathEntry(crumb, i));
        });
        for (const ws of workspaces)
            out.push(wsEntry(ws, false));
    }
    return out;
}
/** 目录浏览器面板。详见 {@link FileBrowserProps}。 */
export function FileBrowser(props) {
    ensureControls();
    const tt = props.translate ?? t;
    const picker = props.picker === true;
    // 根缓存：调用方可注入（多实例/清理策略归调用方）；不传则内部自建、随组件废弃。
    const cacheRef = useRef(null);
    if (cacheRef.current === null)
        cacheRef.current = props.rootCache ?? createRootCache();
    const rootCache = props.rootCache ?? cacheRef.current;
    // mode：加载/目录树/文件预览/列举错误。viewing 非空 ⇒ 在 dir 树内预览文件。
    const [mode, setMode] = useState('loading');
    const [dir, setDir] = useState('');
    const [listing, setListing] = useState(null);
    const [truncated, setTruncated] = useState(false);
    const [viewing, setViewing] = useState(null);
    const [listErr, setListErr] = useState(null);
    // 面包屑折叠（超宽时只显示当前层名；行首 ▾ 选层常驻）。
    const [crumbsOverflow, setCrumbsOverflow] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const regionRef = useRef(null);
    const measureRef = useRef(null);
    // 预览态：md/html 渲染⇄源码 + 刷新自增（触发预览体重读）。
    const [sourceView, setSourceView] = useState(false);
    const [reloadNonce, setReloadNonce] = useState(0);
    const [copied, setCopied] = useState(false);
    // 内联展开：openDirs = 已展开目录路径集合；childCache = 各展开目录拉到的子项。
    const [openDirs, setOpenDirs] = useState(new Set());
    const [childCache, setChildCache] = useState({});
    // 工作区根补学完成信号（缓存非响应式，学成后 bump 触发面包屑重算）。
    const [, setRootNonce] = useState(0);
    // 当前目录在会话工作区之外（官方 list 限工作区内，越界即报 outside-workspace）。
    // 依据 = list 的**真实错误码**，不靠缓存猜（根学不出时会误判成"在区内"）。
    const [outside, setOutside] = useState(false);
    // 路径 → 工作区匹配：props.path 是绝对路径时，找出它所属的工作区（最长前缀），
    // list / 学根 / 相对化**全部**换用该工作区的会话与根——官方 list 按 sessionId 解析工作区根，
    // 只换 list 的 sessionId 不换学根的键，面包屑会露出工作区之外的层级（2026-10-22 真机：
    // 匹配生效但 rootCache 仍按 props.sessionId 学根 ⇒ 相对化失败 ⇒ 显示 `C.x > workspace > …`）。
    // 匹配不到 ⇒ 整体回落 props.sessionId（旧行为）。
    // 工作区清单来源（优先级从高到低）：① props.workspaceAnchors（调用方显式给，可覆盖）；
    // ② 宿主 workspaces 快照（connectHost 注入的 workspaceList，官方 WorkspaceView 镜像）。
    // 快照异步到达时会重算 + 重跑初始 effect（listSessionId 在其依赖里）⇒ 自愈，无感。
    const hostWorkspaces = useSyncExternalStore(workspaceList.subscribe, workspaceList.getSnapshot);
    const anchors = props.workspaceAnchors ?? hostWorkspaces;
    const anchorMatch = useMemo(() => workspaceAnchorForPath(props.path, anchors), [props.path, anchors]);
    const listSessionId = anchorMatch?.sessionId ?? props.sessionId;
    /** 记一次 list 结果的"是否越界"（outside-workspace / not-found 均视为不可浏览）。 */
    const noteOutside = (parsed) => {
        if (parsed === null || parsed === undefined)
            return;
        if (!isFailed(parsed)) {
            setOutside(false);
            return;
        }
        const code = bareCode(parsed.failed);
        if (code === 'outside-workspace' || code === 'not-found')
            setOutside(true);
    };
    /** 列举某目录并展示（清空 viewing；收起下拉）。 */
    const fetchDir = useCallback((targetDir) => {
        setDir(targetDir);
        setViewing(null);
        setListErr(null);
        setMenuOpen(false);
        setMode('loading');
        // 切换顶层目录：清空内联展开态（展开树只属于当前这一层）。
        setOpenDirs(new Set());
        setChildCache({});
        props.workspaceFiles
            .list(listSessionId, listPathOf(targetDir))
            .then((result) => {
            const parsed = listingOf(result);
            noteOutside(parsed);
            if (isFailed(parsed)) {
                setListErr(errView(parsed.failed));
                setMode('error');
                return;
            }
            if (parsed === null) {
                setListErr({ key: 'previewBadPayload' });
                setMode('error');
                return;
            }
            setListing(parsed.entries);
            setTruncated(parsed.truncated);
            setMode('dir');
        })
            .catch((error) => {
            setListErr(errView(error));
            setMode('error');
        });
    }, [listSessionId, props.workspaceFiles]);
    /** 进入某目录；点到当前目录本身 = 重列本层（刷新）。 */
    const loadDir = useCallback((targetDir) => {
        if (targetDir === dir) {
            fetchDir(targetDir);
            return;
        }
        fetchDir(targetDir);
    }, [dir, fetchDir]);
    // 初次进入（path 可能是文件或目录）：
    // list(path) 成功 ⇒ 目录树（dir 尽量取宿主绝对路径 ⇒ 面包屑从工作区根往下列）；
    // 报错 ⇒ 文件预览态（dir = 父目录，面包屑保留可返回）。
    // ⚠️ 切勿改用服务端 list 返回的 path 当面包屑：那是 workspacePathOf 的工作区**相对**形式，
    //    会丢掉根以下的前导段，面包屑只剩最近一层（源实现 2026-09-29 踩过 ⇒ 已回退为入参路径）。
    useEffect(() => {
        let alive = true;
        setMode('loading');
        setListErr(null);
        setViewing(null);
        setSourceView(false);
        setReloadNonce(0);
        setMenuOpen(false);
        setOpenDirs(new Set());
        setChildCache({});
        /** 补学工作区根（面包屑根名显示 + picker 相对化要用）：列目录 → 有文件就 stat 反推，没有就走有界 BFS。 */
        const ensureRootLearned = (currentDir) => {
            if (rootCache.get(listSessionId) !== undefined)
                return;
            void (async () => {
                try {
                    const parsed = listingOf(await props.workspaceFiles.list(listSessionId, listPathOf(currentDir)));
                    if (!alive || parsed === null || isFailed(parsed))
                        return;
                    const stat = props.workspaceFiles.stat;
                    if (stat === undefined)
                        return;
                    const rel = parsed.path;
                    const file = parsed.entries.find((entry) => entry.type === 'file');
                    if (file !== undefined) {
                        const sub = rel === '' ? file.name : `${rel}/${file.name}`;
                        const abs = (await stat(listSessionId, sub).catch(() => null));
                        const absPath = typeof abs?.absolutePath === 'string' ? abs.absolutePath : null;
                        if (absPath !== null && learnRoot(rootCache, listSessionId, sub, absPath) !== null) {
                            setRootNonce((n) => n + 1);
                            return;
                        }
                    }
                    const found = await findAnyFileAbs(props.workspaceFiles, listSessionId, rel);
                    if (found !== null && learnRoot(rootCache, listSessionId, found.relativePath, found.absolutePath) !== null) {
                        setRootNonce((n) => n + 1);
                    }
                }
                catch {
                    /* 学不出就维持退化显示 */
                }
            })();
        };
        props.workspaceFiles
            .list(listSessionId, listPathOf(props.path))
            .then(async (result) => {
            if (!alive)
                return;
            const parsed = listingOf(result);
            if (!isFailed(parsed) && parsed !== null) {
                setOutside(false);
                // 入口可能是工作区相对名 ⇒ 用目录里任一文件子项的 stat 反推绝对路径；
                // 解析不出（空目录/只有子目录/stat 缺失）就退回入参，不阻塞浏览。
                const absDir = await absolutizeDir(rootCache, props.workspaceFiles, listSessionId, props.path, parsed.path, parsed.entries);
                if (!alive)
                    return;
                setDir(absDir);
                setListing(parsed.entries);
                setTruncated(parsed.truncated);
                setMode('dir');
                ensureRootLearned(absDir);
                return;
            }
            // 不是目录 ⇒ 当作文件预览，dir 取父目录，尽量把父树也列出来。
            let parent = dirnameOf(props.path);
            if (!isAbsoluteish(props.path)) {
                const stat = props.workspaceFiles.stat;
                if (stat !== undefined) {
                    try {
                        const res = await stat(listSessionId, props.path);
                        const abs = typeof res.absolutePath === 'string'
                            ? res.absolutePath
                            : null;
                        if (abs !== null) {
                            parent = dirnameOf(abs);
                            // 记住工作区根 ⇒ 之后同会话里相对名也能解析
                            learnRoot(rootCache, listSessionId, props.path, abs);
                        }
                    }
                    catch {
                        /* 解析不出就用入参父目录 */
                    }
                }
            }
            if (!alive)
                return;
            setDir(parent);
            setViewing(props.path);
            setMode('file');
            ensureRootLearned(parent);
            props.workspaceFiles
                .list(listSessionId, listPathOf(parent))
                .then((pres) => {
                if (!alive)
                    return;
                const pl = listingOf(pres);
                noteOutside(pl);
                if (!isFailed(pl) && pl !== null) {
                    setListing(pl.entries);
                    setTruncated(pl.truncated);
                }
            })
                .catch(() => {
                /* 父树列不出不影响文件预览 */
            });
        })
            .catch(() => {
            if (!alive)
                return;
            // 传输层失败：仍尝试按文件预览（预览体内部会给出错误态）。
            const parent = dirnameOf(props.path);
            setDir(parent);
            setViewing(props.path);
            setMode('file');
            ensureRootLearned(parent);
        });
        return () => {
            alive = false;
        };
    }, [props.workspaceFiles, props.path, rootCache, listSessionId]);
    // 面包屑溢出测量：隐藏测量条渲染与可见态完全相同的 crumb 按钮（含 padding/max-width），
    // 使溢出判定与真实排版一致——不超长时必定还原完整路径。ResizeObserver 同时覆盖
    // dock 宽度变化 / 初次布局。
    useLayoutEffect(() => {
        const region = regionRef.current;
        const measure = measureRef.current;
        if (region === null || measure === null)
            return;
        const recompute = () => {
            setCrumbsOverflow(measure.scrollWidth > region.clientWidth + 1);
        };
        recompute();
        const ro = new ResizeObserver(recompute);
        ro.observe(region);
        return () => ro.disconnect();
    }, [dir, viewing, mode, listing]);
    const reload = useCallback(() => {
        if (viewing !== null) {
            setReloadNonce((n) => n + 1);
            return;
        }
        loadDir(dir);
    }, [viewing, dir, loadDir]);
    const copyPath = useCallback(() => {
        // 口径统一：复制**工作区相对**路径（与 picker onPick 一致；绝对形态对用户无意义）。
        const target = viewing ?? dir;
        if (target === '')
            return;
        const rel = relativizeToRoot(rootCache, listSessionId, target);
        writeClipboard(rel)
            .then((ok) => {
            if (ok) {
                setCopied(true);
                window.setTimeout(() => setCopied(false), 1500);
            }
        })
            .catch(() => {
            /* 剪贴板不可用（非安全上下文等）：静默，不弹错 */
        });
    }, [viewing, dir, rootCache, listSessionId]);
    /** 内联展开/收起某目录（点 ▸）：只切展开态，不导航；首次展开才拉子项。 */
    const toggleDir = useCallback((path) => {
        setOpenDirs((prev) => {
            const next = new Set(prev);
            if (next.has(path))
                next.delete(path);
            else
                next.add(path);
            return next;
        });
        if (!(path in childCache)) {
            setChildCache((prev) => ({ ...prev, [path]: { status: 'loading' } }));
            props.workspaceFiles
                .list(listSessionId, listPathOf(path))
                .then((result) => {
                const parsed = listingOf(result);
                setChildCache((prev) => ({
                    ...prev,
                    [path]: isFailed(parsed) || parsed === null
                        ? { status: 'error', error: errView(isFailed(parsed) ? parsed.failed : undefined) }
                        : { status: 'ready', entries: parsed.entries, truncated: parsed.truncated },
                }));
            })
                .catch((error) => {
                setChildCache((prev) => ({ ...prev, [path]: { status: 'error', error: errView(error) } }));
            });
        }
    }, [childCache, props.workspaceFiles, listSessionId]);
    // 过滤点名了扩展名 ⇒ 要的是**文件**：目录只作导航（点行就地展开），不给「选择」、也回传不了 isDir。
    // （旧实现「目录永远保留且永远带选择钮」，于是「仅 JS/MD」下出现「文件夹旁边有选择、
    //   MD 文件旁边反而没有」，选中还回传一个文件夹——与过滤语义直接打架。）
    const extsOnly = picker && props.filter !== undefined && props.filter.dirs !== true && (props.filter.exts?.length ?? 0) > 0;
    /** 选择器里目录是否可选：不限 或 明说 dirs:true 才可选；扩展名过滤下不可选。 */
    const dirPickable = picker && props.onPick !== undefined && !extsOnly;
    /** 递归渲染目录树（内联展开）。file = 点开预览（picker = 选中）；dir = ▸ 切展开、行尾钮分派。 */
    const renderTree = useCallback((entries, baseDir) => sortEntries(entries).map((entry) => {
        const childPath = joinPath(baseDir, entry.name);
        const isDir = entry.type === 'directory';
        // 选择器过滤：不匹配的文件不渲染（目录永远保留——里面可能有匹配的）。
        if (!isDir && picker && !matchesFilter(childPath, false, props.filter))
            return null;
        if (!isDir) {
            const pick = () => {
                if (picker && props.onPick !== undefined) {
                    // 回传**工作区相对**路径（源实现真机 bug：绝对路径被宿主 zod 拒）。
                    props.onPick(relativizeToRoot(rootCache, listSessionId, childPath), false);
                    return;
                }
                // 逐层展开后选中文件：面包屑要跟随到该文件所在目录。
                const parent = dirnameOf(childPath);
                if (parent !== dir)
                    loadDir(parent);
                setViewing(childPath);
                setReloadNonce(0);
                setSourceView(false);
            };
            return h('div', {
                key: childPath,
                className: `dshpc-fb__row${picker ? ' dshpc-fb__row--pick' : ''}`,
                role: 'button',
                tabIndex: 0,
                title: picker ? tt('explorerPickFile') : childPath,
                onClick: pick,
                onKeyDown: (event) => {
                    if (event.key === 'Enter' || event.key === ' ')
                        pick();
                },
            }, h('span', { className: 'dshpc-fb__row-icon' }, h(FileTypeIcon, { path: childPath, size: 18 })), h('span', { className: 'dshpc-fb__row-name' }, entry.name), 
            // 选择器里文件行也给一枚「选择」钮，与目录行的操作位对齐（目录没有时它仍在，
            // 「点行 = 选中」的旧默契保持不变，外显入口不再缺）。
            picker && props.onPick !== undefined
                ? h(Button, {
                    variant: 'outline',
                    size: 'sm',
                    className: 'dshpc-fb__row-act',
                    'aria-label': tt('explorerPickFile'),
                    onClick: (event) => {
                        event.stopPropagation();
                        pick();
                    },
                }, tt('explorerPickDir'))
                : null);
        }
        const cached = childCache[childPath];
        const isOpen = openDirs.has(childPath);
        // 目录行点击 = 就地展开/收起（两种形态统一，源实现用户 2026-10-10 拍板）；
        // 主动作挪到行尾小按钮：选择器 = 选择此文件夹，浏览 = 进入该目录。
        // 目录行不渲染文件夹图标——行首已有展开小尖号，再摆一个是重复。
        const rowAction = () => {
            toggleDir(childPath);
        };
        const actThisDir = (event) => {
            event.stopPropagation();
            if (picker) {
                // 扩展名过滤下这里不该被触发（目录行根本不渲染这枚钮）；兜住是为了语义不被绕过。
                if (!extsOnly && props.onPick !== undefined)
                    props.onPick(relativizeToRoot(rootCache, listSessionId, childPath), true);
                return;
            }
            loadDir(childPath);
        };
        return h(Fragment, { key: childPath }, h('div', {
            className: 'dshpc-fb__row',
            role: 'button',
            tabIndex: 0,
            title: childPath,
            onClick: rowAction,
            onKeyDown: (event) => {
                if (event.key === 'Enter' || event.key === ' ')
                    rowAction();
            },
        }, 
        // 展开 / 收起：核心 IconButton，20×20 命中位 + 展开时转 90°（与兄弟 .dsh-tdt-sv-tree-toggle 同款）。
        h(IconButton, {
            variant: 'plain',
            size: 'sm',
            className: `dshpc-fb__row-toggle${isOpen ? ' dshpc-fb__row-toggle--open' : ''}`,
            icon: h(IconChevronRightOutlineRegular, { size: 16 }),
            label: isOpen ? tt('explorerCollapse') : tt('explorerExpand'),
            'aria-expanded': isOpen,
            onClick: (event) => {
                event.stopPropagation();
                toggleDir(childPath);
            },
        }), h('span', { className: 'dshpc-fb__row-name' }, entry.name), 
        // picker：仅目录可选时才出「选择」（扩展名过滤下没有，目录只作导航）；
        // 浏览态：出「进入」。
        picker
            ? dirPickable
                ? h(Button, {
                    variant: 'outline',
                    size: 'sm',
                    className: 'dshpc-fb__row-act',
                    'aria-label': tt('explorerPickDirAria'),
                    onClick: actThisDir,
                }, tt('explorerPickDir'))
                : null
            : h(Button, {
                variant: 'outline',
                size: 'sm',
                className: 'dshpc-fb__row-act',
                'aria-label': tt('explorerEnter'),
                onClick: actThisDir,
            }, tt('explorerEnter'))), isOpen
            ? h('div', { className: 'dshpc-fb__row-children' }, 
            // 硬性规定：不新建 Loading、不写加载文案 ⇒ 还在拉就空着（源实现用户 2026-10-05）。
            cached === undefined || cached.status === 'loading'
                ? null
                : cached.status === 'error'
                    ? h('div', { className: 'dshpc-fb__row-err' }, tt(cached.error.key, cached.error.params))
                    : h(Fragment, null, renderTree(cached.entries, childPath), cached.truncated ? h('div', { className: 'dshpc-fb__row-note' }, tt('explorerTruncated')) : null))
            : null);
    }), [childCache, openDirs, picker, dirPickable, extsOnly, props.filter, props.onPick, listSessionId, rootCache, dir, loadDir, tt]);
    // 面包屑 = 工作区根 + 其下相对层级。根名优先级：**匹配出的工作区名**（当前路径所属，
    // 不写死）> 调用方 rootName > 缓存根末段。学根/相对化一律按 listSessionId——
    // 用调用方原始 sessionId 学根会学出别的根 ⇒ 相对化失败 ⇒ 露出工作区外层级（真机 2026-10-22）。
    const rootAbs = rootCache.get(listSessionId);
    const rootLabel = anchorMatch?.title ?? props.rootName ?? (rootAbs !== undefined ? baseNameOfPath(rootAbs.replace(/\/+$/, '')) : '');
    const crumbs = rootLabel !== '' ? [{ label: rootLabel, path: '' }, ...crumbsOfDir(relativizeToRoot(rootCache, listSessionId, dir))] : crumbsOfDir(dir);
    // md / html 都出「渲染 ⇄ 源码」切换（默认渲染）。
    const viewingIsMd = viewing !== null && /\.(md|markdown)$/i.test(viewing);
    const viewingIsHtml = viewing !== null && /\.(html|htm)$/i.test(viewing);
    const switchable = viewingIsMd || viewingIsHtml;
    const menuItems = crumbsMenuEntries({
        workspaces: props.workspaces,
        rootName: rootLabel,
        rootFallbackLabel: tt('explorerRootName'),
        crumbs,
        onPickWorkspace: props.onSelectWorkspace,
        onLoadDir: loadDir,
    });
    /** 一段面包屑（核心 ghost 钮：无底无边；度量条与可见态必须逐字同构）。 */
    const crumbButton = (label, onClick, current = false) => h(Button, {
        variant: 'ghost',
        size: 'sm',
        className: `dshpc-fb__crumb${current ? ' dshpc-fb__crumb--current' : ''}`,
        disabled: onClick === undefined,
        tabIndex: onClick === undefined ? -1 : 0,
        onClick,
    }, h(MarqueeText, { text: label, className: 'dshpc-fb__crumb-mq' }));
    const crumbBar = h('nav', { className: 'dshpc-fb__bar', 'aria-label': tt('explorerCrumbsAria') }, h('div', { className: 'dshpc-fb__menu-wrap' }, h(IconButton, {
        variant: 'plain',
        size: 'md',
        icon: h(IconChevronDownOutlineRegular, { size: 14 }),
        label: tt('explorerLevels'),
        'aria-expanded': menuOpen,
        onClick: () => setMenuOpen((v) => !v),
    }), 
    // 选层下拉 = 自写浮层（抄兄弟 .dsh-tdt-sv-crumbs-*）：透明遮罩点一下即收，
    // 遮罩层序高于 picker 面板（1100）⇒ 菜单开着时点面板也算「点外部」。
    menuOpen
        ? h(Fragment, null, h('div', {
            className: 'dshpc-fb__crumbs-backdrop',
            onClick: () => setMenuOpen(false),
        }), h('div', { className: 'dshpc-fb__crumbs-menu', role: 'menu' }, menuItems))
        : null), h('div', { ref: regionRef, className: 'dshpc-fb__crumbs' }, 
    // 隐藏测量条：与可见态完全同构的 crumb 按钮，确保溢出判定精确。
    h('span', { ref: measureRef, className: 'dshpc-fb__crumbs-measure', 'aria-hidden': true }, crumbs.length === 0
        ? crumbButton(tt('explorerRootName'))
        : crumbs.map((crumb, index) => h(Fragment, { key: crumb.path }, index > 0 ? h(IconChevronRightOutlineRegular, { className: 'dshpc-fb__crumb-sep', size: 12 }) : null, crumbButton(crumb.label)))), 
    // 工作区根目录（crumbs 空）也要有可见的面包屑占位。
    crumbsOverflow
        ? crumbButton(crumbs.length > 0 ? crumbs[crumbs.length - 1]?.label ?? tt('explorerRootName') : tt('explorerRootName'), undefined, true)
        : crumbs.length === 0
            ? crumbButton(tt('explorerRootName'), undefined, true)
            : crumbs.map((crumb, index) => h(Fragment, { key: crumb.path }, index > 0 ? h(IconChevronRightOutlineRegular, { className: 'dshpc-fb__crumb-sep', size: 12 }) : null, crumbButton(crumb.label, () => loadDir(crumb.path))))), h('div', { className: 'dshpc-fb__actions' }, props.onClose === undefined
        ? null
        : h(IconButton, {
            variant: 'plain',
            size: 'md',
            icon: h(IconCloseOutlineRegular, { size: 14 }),
            label: tt('previewClose'),
            onClick: props.onClose,
        })));
    // 越界（outside-workspace）：第一排整条换成只读完整路径，不给任何会失败的入口。
    const crumbBarPlain = h('nav', { className: 'dshpc-fb__bar', 'aria-label': tt('explorerCrumbsAria') }, h(MarqueeText, {
        text: dir,
        title: dir,
        className: 'dshpc-fb__bar-plain',
        style: { flex: '1 1 auto', minWidth: 0 },
    }), h('div', { className: 'dshpc-fb__actions' }, props.onClose === undefined
        ? null
        : h(IconButton, {
            variant: 'plain',
            size: 'md',
            icon: h(IconCloseOutlineRegular, { size: 14 }),
            label: tt('previewClose'),
            onClick: props.onClose,
        })));
    // 第二排（仅预览态显示）：文件名 + 渲染⇄源码切换 / 复制路径 / 刷新。
    // 档位照兄弟项目调用点：Segmented `sm` + 图标钮 `md`（核心 Segmented 高度由 CSS 定，不随档变）。
    const titleBar = viewing === null
        ? null
        : h('div', { className: 'dshpc-fb__title' }, h(MarqueeText, {
            text: baseNameOfPath(viewing),
            title: viewing,
            className: 'dshpc-fb__title-inner',
            style: { flex: '1 1 auto', minWidth: 0 },
        }), h('div', { className: 'dshpc-fb__actions' }, switchable
            ? h(Segmented, {
                size: 'sm',
                variant: 'default',
                label: viewingIsMd ? tt('previewMdSwitchAria') : tt('previewHtmlSwitchAria'),
                value: sourceView ? 'source' : 'render',
                items: [
                    { value: 'render', label: tt('previewRender') },
                    { value: 'source', label: tt('previewSource') },
                ],
                onChange: (next) => setSourceView(next === 'source'),
            })
            : null, h(IconButton, {
            variant: 'plain',
            size: 'md',
            icon: copied ? h(IconCheckOutlineRegular, { size: 14 }) : h(IconCopyOutlineRegular, { size: 14 }),
            label: tt('previewCopyPath'),
            onClick: copyPath,
        }), h(IconButton, {
            variant: 'plain',
            size: 'md',
            icon: h(IconRefreshOutlineRegular, { size: 14 }),
            label: tt('previewRefresh'),
            onClick: reload,
        })));
    // ── 主体 ──
    let body;
    if (viewing !== null) {
        body = h(FilePreview, {
            key: `${viewing}:${reloadNonce}`,
            workspaceFiles: props.workspaceFiles,
            officeToPdf: props.officeToPdf ?? null,
            sessionId: listSessionId,
            path: viewing,
            sourceView,
            translate: tt,
        });
    }
    else if (mode === 'error' && listErr !== null) {
        // 列举失败（如 outside-workspace）：只给错误文案；关闭（✕）即退出。
        body = h('div', { className: 'dshpc-fb__body' }, h('div', { className: 'dshpc-fb__err' }, tt(listErr.key, listErr.params)));
    }
    else if (listing !== null) {
        const visible = listing.filter((entry) => entry.type === 'directory' || matchesFilter(joinPath(dir, entry.name), false, picker ? props.filter : undefined));
        body =
            visible.length === 0
                ? h('div', { className: 'dshpc-fb__body' }, h('div', { className: 'dshpc-fb__note' }, tt('explorerEmptyDir')))
                : h('div', { className: 'dshpc-fb__tree' }, renderTree(visible, dir), truncated ? h('div', { className: 'dshpc-fb__row-note' }, tt('explorerTruncated')) : null);
    }
    else {
        // 不动 Loading、不写加载文案 ⇒ 空着（源实现硬性规定）。
        body = h('div', { className: 'dshpc-fb__body' });
    }
    return h('div', {
        className: 'dshpc-fb',
        style: props.style ?? undefined,
    }, outside ? crumbBarPlain : crumbBar, titleBar, body);
}
//# sourceMappingURL=FileBrowser.js.map