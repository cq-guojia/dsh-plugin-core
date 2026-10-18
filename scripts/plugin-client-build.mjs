// demo 插件的 client bundle：打成 `window.__ModuleLoader__.load({ id, factory })` 的 CJS 闭包单文件。
//
// 为什么是 CJS 闭包：宿主 client 用 __ModuleLoader__ 装载插件（见 dsh-task-dispatch-table 的
// tsdown banner/footer 同款做法）；插件产物不能是 ESM，也不能有 css 文件（内核不会加载）。
// 平台模块（react / cordis / @deepseek-ai/*）一律保持 require，由宿主提供。
import { build } from 'esbuild'

const ID = 'dsh-plugin-core'

await build({
  entryPoints: ['src/plugin/client/index.tsx'],
  bundle: true,
  format: 'cjs',
  platform: 'browser',
  target: 'es2020',
  jsx: 'automatic',
  outfile: 'dist/client.js',
  // 宿主提供的平台模块：不进包
  external: ['react', 'react-dom', 'react/jsx-runtime', 'cordis', '@deepseek-ai/*'],
  define: { 'process.env.NODE_ENV': '"production"' },
  loader: { '.tsx': 'tsx', '.ts': 'ts' },
  banner: {
    js: `window.__ModuleLoader__.load({ id: ${JSON.stringify(ID)}, factory: (require) => {\n` +
      'var module = { exports: {} }; var exports = module.exports;\n',
  },
  footer: { js: '\nreturn module.exports; } });\n' },
  logLevel: 'info',
})

console.log('✓ 插件 client bundle：dist/client.js')
