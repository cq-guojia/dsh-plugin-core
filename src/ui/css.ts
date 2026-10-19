import { createStyleKit, type StyleKit } from '../design/index.js'
import {
  BACK_TO_TOP_CSS,
  BUTTON_CSS,
  DATETIME_CSS,
  FIELD_CSS,
  HINT_CSS,
  LOADING_CSS,
  SEGMENTED_CSS,
  SELECT_CSS,
} from './controls-css.js'
import { PICKER_CSS } from './picker-css.js'
import { FEEDBACK_CSS } from './feedback-css.js'
import { CARD_CSS } from './card-css.js'
import { CHIP_CSS } from './chip-css.js'
import { EXPLORER_CSS } from '../explorer/explorer-css.js'
import { SESSION_CSS } from '../session/session-css.js'

export const CONTROLS_DOMAIN = 'controls'

/**
 * 把 CSS 模板里的 **变量前缀** `--tdt-` 换成当前插件的。
 *
 * ⚠️ 类名 `dsh-tdt-` **故意不换**：搬来的控件里 className 是硬编码的 `dsh-tdt-btn` 这类字面量
 * （模板字符串里也拼接了），只换 CSS 侧会让选择器与 className 对不上、样式整片失效。
 * 要连类名一起隔离，必须同步改造每个控件的 className —— 那是另一个任务。
 *
 * 已知限制：两个插件若引的 core 版本不同，`.dsh-tdt-*` 规则会互相覆盖（内容相同时无害）。
 * 主防线是 style 标签 id（`createStyleKit({ id })`）与变量前缀隔离。
 */
export function buildCss(template: string, prefix: string): string {
  return template.split('--tdt-').join(`--${prefix}-`)
}

const CONTROLS_CSS = [
  SEGMENTED_CSS,
  BUTTON_CSS,
  FIELD_CSS,
  DATETIME_CSS,
  SELECT_CSS,
  LOADING_CSS,
  BACK_TO_TOP_CSS,
  HINT_CSS,
  PICKER_CSS,
  FEEDBACK_CSS,
  EXPLORER_CSS,
  SESSION_CSS,
  CARD_CSS,
  CHIP_CSS,
].join('\n')

/**
 * 当前插件的样式设施。
 *
 * 为什么是模块级而不是 React Context：core 会被**内联进每个插件各自的 bundle**，
 * 模块级变量天然按插件隔离（不像共享运行时那样会互相踩）。
 * 插件启动时 `setStyleKit(createStyleKit({ id, prefix }))` 一次即可；不设就走默认 kit。
 */
let current: StyleKit = createStyleKit({ id: 'dsh-plugin-core-ui', prefix: 'dsh' })

export function setStyleKit(kit: StyleKit): void {
  current = kit
}

export function getStyleKit(): StyleKit {
  return current
}

/** 登记 token + 控件样式并确保挂载（幂等）。 */
export function ensureControls(kit: StyleKit = current): void {
  kit.registerStyle('tokens', kit.tokensCss)
  kit.applyStyle(CONTROLS_DOMAIN, buildCss(CONTROLS_CSS, kit.prefix))
}
