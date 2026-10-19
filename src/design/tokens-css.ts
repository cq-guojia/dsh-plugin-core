// token 变量表。变量前缀全生态统一 --dshpc-。
// 明暗判据必须是 body[data-ds-dark-theme]（宿主启动脚本写入，是用户在客户端里的选择）；
// 禁止 prefers-color-scheme —— 它跟系统，不跟用户在宿主里的选择。
export { TOKENS_CSS_TEMPLATE } from './tokens-css.generated.js'
