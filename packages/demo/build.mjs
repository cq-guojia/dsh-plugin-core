// demo 插件构建：出两个产物。
//
//  1) dist/index.js  —— server 侧入口（ESM，宿主 Node 加载），只含插件契约。
//  2) dist/client.js —— client bundle：`window.__ModuleLoader__.load({ id, factory })` 的 CJS 闭包单文件。
//     为什么是 CJS 闭包：宿主 client 用 __ModuleLoader__ 装载插件（同 dsh-task-dispatch-table 的
//     tsdown banner/footer 做法）；产物不能是 ESM，也不能带 css 文件（内核不会加载）。
//     平台模块（react / cordis / @deepseek-ai/*）保持 require，由宿主提供。
//
// ⚠️ 展示内容与控件代码从**仓库内的 dsh-plugin-core 产物**引入（../../dist/…）并打进包里，
//    所以本包自包含、发布时不需要 dsh-plugin-core 先发 npm；预览的也永远是当前这份代码。
import { build } from 'esbuild'
import { mkdirSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

// ⚠️ 一律按**本脚本所在目录**解析，不依赖 cwd：
// 根脚本 `pnpm run build:demo` 的 cwd 是仓库根，写相对路径会指到根上去（真踩过）。
const HERE = dirname(fileURLToPath(import.meta.url))
const at = (p) => resolve(HERE, p)

// 预览页侧栏要显示「core / demo 各自的版本号」：构建时从两份 package.json 注入，
// 运行时不再 fetch —— 装进宿主看到的就是这份 bundle 的真实版本（防「以为更新了」）。
const CORE_VERSION = JSON.parse(readFileSync(at('../../package.json'), 'utf8')).version
const DEMO_VERSION = JSON.parse(readFileSync(at('package.json'), 'utf8')).version

// 构建唯一编码：编译时刻的**时间戳**（两位年 + 月日 + 时分秒 + 毫秒），不用随机数——
// 侧栏底部看这一串就知道「宿主里跑的是不是刚 build 的、什么时候编的」，不用记上次是哪串。
const BUILD_STAMP = (() => {
  const d = new Date()
  const p = (n, w = 2) => String(n).padStart(w, '0')
  return `${p(d.getFullYear() % 100)}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}-${p(d.getMilliseconds(), 3)}`
})()

const PKG = 'dsh-plugin-core-demo'
// server 入口：本地路径安装时插件自己的 node_modules 不被 Node 解析（realpath），
// 故把 `@deepseek-ai/schemastery` **打进产物**（server 入口只引它一个 @deepseek-ai 包），
// 运行时不再依赖宿主/profile 解析 —— 自包含，本地安装也稳。其余平台包仍 external。
const EXTERNAL_SERVER = ['react', 'react-dom', 'react/jsx-runtime', 'cordis']
// client bundle：宿主提供 `@deepseek-ai/dsh-client-ui-*` 等平台模块，保持 require 不变。
const EXTERNAL_CLIENT = ['react', 'react-dom', 'react/jsx-runtime', 'cordis', '@deepseek-ai/*']
const DEFINE = {
  'process.env.NODE_ENV': '"production"',
  __CORE_VERSION__: JSON.stringify(CORE_VERSION),
  __DEMO_VERSION__: JSON.stringify(DEMO_VERSION),
  __BUILD_STAMP__: JSON.stringify(BUILD_STAMP),
}

mkdirSync(at('dist'), { recursive: true })

await build({
  entryPoints: [at('src/index.ts')],
  bundle: true,
  format: 'esm',
  platform: 'node',
  target: 'node22',
  outfile: at('dist/index.js'),
  // `Config` schema 引官方 schemastery，但**打进产物**（见 EXTERNAL_SERVER 注释）。
  external: EXTERNAL_SERVER,
  logLevel: 'info',
})

await build({
  entryPoints: [at('src/client/index.tsx')],
  bundle: true,
  format: 'cjs',
  platform: 'browser',
  target: 'es2020',
  jsx: 'automatic',
  outfile: at('dist/client.js'),
  external: EXTERNAL_CLIENT,
  define: DEFINE,
  loader: { '.tsx': 'tsx', '.ts': 'ts' },
  banner: {
    js:
      `window.__ModuleLoader__.load({ id: ${JSON.stringify(PKG)}, factory: (require) => {\n` +
      'var module = { exports: {} }; var exports = module.exports;\n',
  },
  footer: { js: '\nreturn module.exports; } });\n' },
  logLevel: 'info',
})

console.log('✓ demo 插件产物：dist/index.js + dist/client.js')
