/**
 * CodeMirror 6 的「表面层」——DSH 共享底座只负责编辑器怎么贴合宿主面板，
 * 语法高亮与明暗主题一律交给 @uiw/react-codemirror 的官方实现。
 *
 * 分工（规范做法）：
 *  - src/ui/infra/code-mirror-surface.ts 按 body[data-ds-dark-theme] 给 <CodeMirror>
 *    传 theme='dark' | 'light'；
 *  - 暗色由官方挂 oneDark（oneDarkTheme + syntaxHighlighting(oneDarkHighlightStyle)），
 *    亮色由 basicSetup 挂官方 defaultHighlightStyle 兜底。官方 highlighter 覆盖含
 *    tags.processingInstruction 在内的语言全集；
 *  - 本文件只覆盖表面：透明底、字体、行号槽、选区、自绘光标，颜色吃 --dshpc-* token。
 *    用户扩展在 useCodeMirror.ts:98 被 concat 在官方扩展之后，故这里的同特异性规则
 *    能盖过官方主题的面板背景。
 *
 * 曾经手抄过明暗两张 tag 配色表并注册成正式 highlighter，那会整份顶掉官方兜底
 * （@codemirror/language 的 getHighlighters：有正式的就不看 fallback），漏一条 tag
 * 就少一种颜色，是「发现一个补一个」的根因，已删除。
 *
 * 明暗判据（唯一）：body[data-ds-dark-theme]，禁用 prefers-color-scheme。
 */
import { type Extension } from '@codemirror/state';
export declare const cmSurfaceTheme: Extension;
/** 只返回表面层；语法高亮由官方主题负责，核心不再注册 highlighter。 */
export declare function codeMirrorTheme(dark: boolean): Extension[];
//# sourceMappingURL=code-viewer-theme.d.ts.map