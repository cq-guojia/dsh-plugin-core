// 预览站构建：esbuild 打成**单文件 IIFE**，不产生 ES module。
//
// 为什么不用 Vite 出产物：Vite 的 HTML 插件把入口脚本固定成 <script type="module">，
// 而浏览器在 file:// 协议下会拒绝加载 module 脚本（直接白屏）。
// IIFE 是普通 <script>，双击 index.html 就能跑，不需要任何本地服务。
import { build } from 'esbuild'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'

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
  outfile: `${OUT_DIR}/assets/index.js`,
  logLevel: 'info',
})

// HTML 里把 module 入口换成本地打包产物（去掉 type="module" 与 crossorigin）
const html = readFileSync('demo/index.html', 'utf8')
  .replace(
    /<script[^>]*src="\.\/main\.tsx"[^>]*><\/script>/,
    '<script defer src="./assets/index.js"></script>',
  )
writeFileSync(`${OUT_DIR}/index.html`, html)

console.log(`\n✓ 完成：${OUT_DIR}/index.html（双击即可打开，无需本地服务）`)
