/**
 * 任务 UI 接线出口（`dsh-plugin-core/ui/task-ui`）。
 *
 * 消费方从这个路径 import `mountTaskUI`。这里只做转发，实现在 `adv/tasks/api.ts`：
 * 这样 `ui` 入口零官方依赖、零 DOM 副作用，import 不会崩。
 */
export { mountTaskUI } from '../../adv/tasks/api.js';
//# sourceMappingURL=task-ui.js.map