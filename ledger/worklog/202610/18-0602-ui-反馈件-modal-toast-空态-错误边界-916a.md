# 20261018-0602-ui-反馈件-modal-toast-空态-错误边界-916a: ui 反馈件：Modal + toast + 空态 + 错误边界

- **Tags**: 建设, ui, 反馈, 弹窗
- **Status**: done · 2026-10-18 06:05:12 · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6
- **Created**: 2026-10-18 06:02:37 · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6
- **Sealed**: 2026-10-18 06:05:12 · @GuoJia-Agent · 8d557c6d-7c93-43ac-8c73-5d623e82e1c6

<!-- Header lines are maintained by the script, fixed order: Tags → Status → Created → Sealed.
     The `- **Tags**: …` line is inserted at the top by new --tags; omitted when there are no tags
     (category goes to the ledger and history only, never into this document).
     The `- **Sealed**: …` line is appended on close. -->

## Background

需求文档 §2.2：ui 要装反馈件（`Modal` / `Loading` / `toast` / 空态 / 错误边界），
用户拍板「log / toast 这些最基础的 UI 都在 UI 里面」。
另：Modal 只是**呈现方式**不是内容 —— 会话预览要用弹窗承载时用它（需求文档 §4、§6）。

## To Do

无。

## Next

`explorer` 子包：ExplorerPanel（工作区浏览 + 文件预览）+ WorkspacePicker + FilePicker。

## Process

- **Modal**：自绘 overlay + 面板，**不用 react-dom 的 `createPortal`** —— 多一个必需依赖不划算，
  `position:fixed` 足够。标题 / 主体 / 底栏三段，点遮罩关闭、点面板不关闭（阻止冒泡）。
- **toast**：做成**命令式** `showToast(message, { variant, durationMs })`，
  不要求调用方挂组件 —— toast 常在数据回调里触发，拿不到组件树。
  细节：无 `document` 时静默跳过（SSR / 单测不炸）；容器空了自动 `remove()`，不在页面留空壳；
  toast 被提前移除时 `clearTimeout`，不泄漏。
- **EmptyState**：列表没数据 / 取数为空统一用这一个（文案走内置字典，可覆盖）。
- **ErrorBoundary**：class 组件（必须），`getDerivedStateFromError` + `componentDidCatch`，
  兜底渲染可自定义，默认给「出错了 + 重试」。
- 内置字典再扩 4 个 key：`modalClose` / `emptyText` / `errorTitle` / `errorRetry`（中英）。

## Conclusion

反馈件齐了，23 条自检全过，`dist/ui/index.js` 35 个导出可直接 import。

留坑：
- **仍全部未在浏览器渲染验证**（本包目前一条渲染测试都没有，这是系统性缺口）。
- Modal 没有焦点陷阱 / Esc 关闭 / 滚动锁定 —— 真碰到再加，别提前做。
- toast 同一时刻多条会竖排堆叠，没做上限（超过 N 条会顶出屏幕）。

## Execution Log

<!-- Maintained by the script: appended by new / claim / set / release / log / close. Do not edit.
     Backfill with: progress log --id <id> --note "...". -->
