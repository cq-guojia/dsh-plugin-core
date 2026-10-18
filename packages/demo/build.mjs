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

const PKG = 'dsh-plugin-core-demo'
const EXTERNAL = ['react', 'react-dom', 'react/jsx-runtime', 'cordis', '@deepseek-ai/*']

await build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  format: 'esm',
  platform: 'node',
  target: 'node22',
  outfile: 'dist/index.js',
  logLevel: 'info',
})

await build({
  entryPoints: ['src/client/index.tsx'],
  bundle: true,
  format: 'cjs',
  platform: 'browser',
  target: 'es2020',
  jsx: 'automatic',
  outfile: 'dist/client.js',
  external: EXTERNAL,
  define: { 'process.env.NODE_ENV': '"production"' },
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
