import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 预览站（demo/）专用构建配置。
// 注意：它与包的正式构建（tsc → dist/）完全分离——demo 只消费 dist/ 产物，
// 用 Vite 是为了在浏览器里跑 JSX 与热更新，产物不进 npm 发布物。
export default defineConfig({
  plugins: [react()],
  root: 'demo',
  // 相对路径 ⇒ 构建产物可以**直接双击 index.html 用 file:// 打开**，不需要起任何服务
  base: './',
  build: {
    outDir: '../demo-dist',
    emptyOutDir: true,
  },
  server: {
    port: 5180,
  },
})
