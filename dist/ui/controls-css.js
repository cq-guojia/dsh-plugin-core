// 控件样式。类名与变量统一使用 dshpc 前缀。
// ⚠️ 曾有过的错误结论（2026-10-19 已查清，勿回潮）：
// 「宿主会吃掉 token 块之后的第一条 CSS 规则」是**误判**，因此加的 `.dshpc-css-guard`
// 牺牲规则也已删除。真因见 `docs/design/external/dsh-host.md` §9：tokens 模板字符串
// 结尾多了一个反斜杠，在注入文本里留下字面反引号，把**紧随其后的那条规则的选择器**污染成
// 匹配不到任何元素的怪选择器（规则仍在 CSSOM 里，只是永不生效）——守卫当年只是替它挨刀。
// 现在由 `test/css-contract.test.mjs` 盯「CSS 文本里不得出现反引号 / 反斜杠」。
export { SEGMENTED_CSS } from './controls/segmented-css.generated.js';
export { BUTTON_CSS } from './controls/button-css.generated.js';
export { FIELD_CSS } from './controls/field-css.generated.js';
export { LOADING_CSS } from './controls/loading-css.generated.js';
export { LOADER_CSS } from './controls/loader-css.generated.js';
export { LOADER_BAR_CSS } from './controls/loader-bar-css.generated.js';
export { QUICK_TOOLBAR_CSS } from './controls/quick-toolbar-css.generated.js';
export { HINT_CSS } from './controls/hint-css.generated.js';
export { DATETIME_CSS } from './controls/datetime-css.generated.js';
export { SPLIT_GROUP_CSS } from './controls/split-group-css.generated.js';
// 表格：基础层与各外观皮肤分开导出 —— 组件只 import 自己那一份（外观按需分包）。
export { TABLE_BASE_CSS } from './controls/table-css.generated.js';
export { TABLE_PLAIN_CSS } from './controls/table-plain-css.generated.js';
// 分页：独立控件，Table 内建分页时也复用这一份。
export { PAGINATION_CSS } from './controls/pagination-css.generated.js';
// 分区标题：SectionHead 自注入；Table 的通栏标题也走它。
export { SECTION_HEAD_CSS } from './controls/section-head-css.generated.js';
//# sourceMappingURL=controls-css.js.map