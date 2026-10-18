// 预览站入口。
// 关键：这里做的事与真实插件**完全一样**——setStyleKit + ensureControls，
// 之后所有控件走的是同一条渲染路径、同一份 CSS 字符串，所以预览效果即真实效果。
import { createRoot } from 'react-dom/client'
import { App } from './App.js'
import { createStyleKit } from '../dist/design/index.js'
import { ensureControls, setStyleKit } from '../dist/ui/index.js'

const params = new URLSearchParams(location.search)
const dark = params.get('theme') === 'dark'
if (dark) document.body.setAttribute('data-ds-dark-theme', '')

// demo 自己领一套 kit（id / prefix 与真实插件同机制）
setStyleKit(createStyleKit({ id: 'dsh-plugin-core-demo', prefix: 'dsh' }))
ensureControls()

createRoot(document.getElementById('root')!).render(<App />)
