/**
 * 官方 primitives 的**薄 adapter**：只把命名空间与具名导出转出来，不写逻辑、不引本仓任何控件。
 *
 * 为什么和 `ui/official.ts` 分开：那个文件为了宿主皮肤的命令式弹窗引了 Button / i18n，
 * 只想按名取官方图标的组件（`Icon`）从它取命名空间会连带 token CSS、按钮 CSS 与整本字典（实测 124 KB）。
 * 从这里取只有平台模块的 require；宿主外依旧解析不到，故它仍是「只许两个 adapter 碰平台模块」的例外之一
 * （见 `test/dependency-guards.test.mjs`）。
 */
import * as PrimitiveNamespace from '@deepseek-ai/dsh-client-ui-primitives'

export * from '@deepseek-ai/dsh-client-ui-primitives'

/** 官方命名空间：给按名取组件（图标）与运行时审计用。 */
export const Official = PrimitiveNamespace
