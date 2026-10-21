/**
 * 源码态语法高亮：扩展名 → CodeMirror 语言映射。
 *
 * 移植自兄弟项目 dsh-task-dispatch-table（src/client/ui/lang.ts），仅保留本仓已引入的语言包：
 * javascript/json/markdown/python/html/css/yaml + legacy-modes 长尾，避免引入新品类依赖。
 * 纯函数、可单测。
 */
import { Language, LanguageSupport } from '@codemirror/language';
/** 取路径的扩展名（小写，无点）。 */
export declare function extOf(path: string): string;
/** 扩展名对应的语言键；无匹配返回 null（纯文本）。 */
export declare function languageKeyForExt(ext: string): string | null;
/** 路径对应的 CodeMirror 语法扩展；未知扩展回落 null（纯文本）。 */
export declare function languageForPath(path: string): Language | LanguageSupport | null;
//# sourceMappingURL=code-viewer-lang.d.ts.map