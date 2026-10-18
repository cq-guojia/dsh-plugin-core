// 预览站入口。
// 关键：这里做的事与真实插件**完全一样**——setStyleKit + ensureControls，
// 之后所有控件走的是同一条渲染路径、同一份 CSS 字符串，所以预览效果即真实效果。
import { createRoot } from 'react-dom/client'
import { App } from './App.js'
import { createStyleKit } from '../dist/design/index.js'
import { ensureControls, setStyleKit } from '../dist/ui/index.js'
import { applyTheme, initialThemeMode } from './theme.js'

// 首帧前先落主题（跟随系统 / URL 参数 / localStorage 记忆），避免闪白；之后 App 接管切档。
applyTheme(initialThemeMode())

// demo 自己领一套 kit（id / prefix 与真实插件同机制）
setStyleKit(createStyleKit({ id: 'dsh-plugin-core-demo', prefix: 'dsh' }))
ensureControls()

createRoot(document.getElementById('root')!).render(<App />)
