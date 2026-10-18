// 预览站构建：esbuild 打成**单文件 IIFE**，不产生 ES module。
//
// 为什么不用 Vite 出产物：Vite 的 HTML 插件把入口脚本固定成 <script type="module">，
// 而浏览器在 file:// 协议下会拒绝加载 module 脚本（直接白屏）。
// IIFE 是普通 <script>，双击 index.html 就能跑，不需要任何本地服务。
import { build } from 'esbuild'
import { execSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'

const OUT_DIR = 'demo-dist'

// 版本标签：取自 package.json 版本 + 入口产物内容哈希。内容哈希每次改代码都会变，
// 注入到预览站左上角，方便核对「看到的是不是最新」（GitHub Pages / 浏览器易缓存旧 index.html）。
const pkgVersion = JSON.parse(readFileSync('package.json', 'utf8')).version || '0.0.0'
let buildHash = 'unknown'
try {
  buildHash = execSync('git rev-parse --short HEAD', { cwd: process.cwd() })
    .toString().trim()
} catch { /* 非 git 环境退回 unknown */ }
// 但旧 hash 文件会一直躺在 assets 里，而下方「取第一个 .js」会抓到旧文件（真踩过）⇒ 每次先清场。
if (existsSync(OUT_DIR)) rmSync(OUT_DIR, { recursive: true, force: true })
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

// HTML 里把 module 入口换成本地打包产物（去掉 type="module" 与 crossorigin）
let html = readFileSync('demo/index.html', 'utf8')
  .replace(
    /<script[^>]*src="\.\/main\.tsx"[^>]*><\/script>/,
    `<script defer src="./assets/${jsFile}"></script>`,
  )
// 版本标签写入 window，供顶栏展示（用户据此确认看到的是最新构建）。
html = html.replace(
  '</head>',
  `<script>window.__DEMO_VERSION__=${JSON.stringify(`${pkgVersion} · ${buildHash}`)};</script>\n</head>`,
)
writeFileSync(`${OUT_DIR}/index.html`, html)

console.log(`\n✓ 完成：${OUT_DIR}/index.html（双击即可打开，无需本地服务；产物 ${jsFile}）`)
