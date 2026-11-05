import type { ToolDetailsModel } from './ToolDetails.js';
import type { Translate } from '../../../utils/i18n.js';
type Rec = Record<string, unknown>;
/** 官方 inspectionDetails（3787-3802）。 */
export declare function inspectionDetails(name: string, args: Rec, text: string, json: unknown, t: Translate): ToolDetailsModel | null;
/** 官方 controlDetails（3372-3547）。 */
export declare function controlDetails(name: string, args: Rec, text: string, json: unknown, t: Translate): ToolDetailsModel | null;
export {};
//# sourceMappingURL=control-details.d.ts.map