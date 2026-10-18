// 预览站构建：esbuild 打成**单文件 IIFE**，不产生 ES module。
//
// 为什么不用 Vite 出产物：Vite 的 HTML 插件把入口脚本固定成 <script type="module">，
// 而浏览器在 file:// 协议下会拒绝加载 module 脚本（直接白屏）。
// IIFE 是普通 <script>，双击 index.html 就能跑，不需要任何本地服务。
import { build } from 'esbuild'
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs'

const OUT_DIR = 'demo-dist'

mkdirSync(`${OUT_DIR}/assets`, { recursive: true })

await build({
  entryPoints: ['demo/main.tsx'],
  bundle: true,
  format: 'iife',
  globalName: 'DshCoreDemo',
  platform: 'browser',
  target: 'es2020',
  jsx: 'automatic',
  minify: true,
  sourcemap: false,
  loader: { '.tsx': 'tsx', '.ts': 'ts' },
  define: { 'process.env.NODE_ENV': '"production"' },
  outdir: `${OUT_DIR}/assets`,
  // 内容 hash 文件名：每次构建产物名都不同，杜绝浏览器/Page CDN 缓存旧版导致白屏
  entryNames: '[name].[hash]',
  logLevel: 'info',
})

// 读取实际生成的（带 hash 的）JS 文件名，注入到 HTML
const jsFile = (await import('node:fs')).readdirSync(`${OUT_DIR}/assets`)
  .find((f) => f.endsWith('.js'))
if (!jsFile) throw new Error('未找到构建产物 JS')

// 宿主主题基础层：从已安装的 @deepseek-ai/dsh-client-ui-theme 抽取其内置 CSS 文本。
// 只抽 CSS、不执行其运行时（inject 绑死宿主 ctx，且会拖一整条依赖树）；脱离宿主的预览站
// 借此拿到 --dsw-* 真值，亮/暗都与真实插件一致，且随该包版本升级自动跟上游。
// 装不到（如 CI 未配内部 registry）时优雅退回兜底值，不影响构建。
function extractHostThemeCss() {
  const themePkg = 'node_modules/@deepseek-ai/dsh-client-ui-theme/lib/client.js'
  if (!existsSync(themePkg)) {
    console.warn('[demo] 未找到宿主主题包，预览站退回兜底值（不影响构建）。')
    return null
  }
  const src = readFileSync(themePkg, 'utf8')
  const re = /var (\w+_css_default) = "((?:[^"\\]|\\.)*)";/g
  const chunks = []
  let m
  while ((m = re.exec(src))) chunks.push(m[2].replace(/\\"/g, '"').replace(/\\\\/g, '\\'))
  return chunks.length ? chunks.join('\n') : null
}
const hostCss = extractHostThemeCss()

// HTML 里把 module 入口换成本地打包产物（去掉 type="module" 与 crossorigin）
let html = readFileSync('demo/index.html', 'utf8')
  .replace(
    /<script[^>]*src="\.\/main\.tsx"[^>]*><\/script>/,
    `<script defer src="./assets/${jsFile}"></script>`,
  )
if (hostCss) {
  html = html.replace('</head>', `<style id="dsh-host-theme">\n${hostCss}\n</style>\n</head>`)
}
writeFileSync(`${OUT_DIR}/index.html`, html)

console.log(
  `\n✓ 完成：${OUT_DIR}/index.html（双击即可打开，无需本地服务；产物 ${jsFile}` +
    `${hostCss ? '；已注入宿主主题' : '；未注入宿主主题（退回兜底）'}）`,
)
