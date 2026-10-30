import { createStyleKit, type StyleKit } from '../design/index.js'

/**
 * 旧版「控件样式全量域」名。
 *
 * ⚠️ 2026-10-30 起这里**不再**聚合注入全部控件样式：当初是把 17 组 CSS 拼成
 * `CONTROLS_CSS` 一把 `applyStyle(CONTROLS_DOMAIN, …)`，结果 `css.ts` 静态依赖了
 * 每一份 CSS —— 打包器无法摇树，插件只用 Button 也会背上全部 71.7 KB 样式文本。
 * 现在改成每个控件自注入自己那份（见 {@link ensureComponentStyles}）。
 *
 * 保留导出只为向后兼容消费方可能引用过它这个常量，值不再参与注入。
 */
export const CONTROLS_DOMAIN = 'controls'

/**
 * 当前插件的样式设施。
 *
 * 为什么是模块级而不是 React Context：core 会被**内联进每个插件各自的 bundle**，
 * 模块级变量天然按插件隔离（不像共享运行时那样会互相踩）。
 * 插件启动时 `setStyleKit(createStyleKit({ id }))` 一次即可；不设就走默认 kit。
 */
let current: StyleKit = createStyleKit({ id: 'dsh-plugin-core-ui' })

export function setStyleKit(kit: StyleKit): void {
  current = kit
}

export function getStyleKit(): StyleKit {
  return current
}

/**
 * 只登记 token 变量（幂等；不挂载 `<style>`）。
 *
 * 插件启动时调一次做预热是安全的，但**不是必需的** —— 任何控件首次渲染时
 * 也会自行登记 token（见 {@link ensureComponentStyles}）。token 域始终排在所有控件域之前
 * （`style-kit.ts` 的 composeCss 强制），所以颜色 / 变量引用链不受拆分影响。
 */
export function ensureControls(kit: StyleKit = current): void {
  kit.registerStyle('tokens', kit.tokensCss)
}

/**
 * 确保某个控件自己的样式已登记、且 `<style>` 已挂载（幂等，可直接在 render 里调）。
 *
 * 每个控件**只传自己那份 CSS**：把它依赖的那 1~2 份传进来即可，绝不能顺手把别人的拼上去
 * （一拼就又退化成全量，包体省不下来）。同理，若是某份 CSS 里带上下文限定的修饰
 * （如 `.dshpc-split .dshpc-seg`），那份由提供上下文的控件自己负责，消费者不用管。
 *
 * @param domain 本控件的样式域，repo 内唯一。
 * @param css 该控件自己的 CSS 文本。
 * @param kit 样式设施（默认取当前插件的 kit）。
 */
export function ensureComponentStyles(domain: string, css: string, kit: StyleKit = current): void {
  kit.registerStyle('tokens', kit.tokensCss)
  kit.applyStyle(domain, css)
}
