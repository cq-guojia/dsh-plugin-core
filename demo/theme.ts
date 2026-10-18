// 预览站主题档位：跟随系统（默认）/ 亮色 / 暗色。
// main.tsx 在 React 挂载**之前**先 applyTheme 一次（避免首帧闪白），
// App.tsx 的 effect 负责切档与持久化；两处共用这里的一套判定，不许各写一份。
export type ThemeMode = 'system' | 'light' | 'dark'

const THEME_KEY = 'tdt-demo-theme'

/** 初始档位：URL ?theme= 显式指定 > localStorage 记忆 > 跟随系统。 */
export function initialThemeMode(): ThemeMode {
  const param = new URLSearchParams(location.search).get('theme')
  if (param === 'light' || param === 'dark') return param
  try {
    const saved = localStorage.getItem(THEME_KEY)
    if (saved === 'light' || saved === 'dark' || saved === 'system') return saved
  } catch { /* 隐私模式等存不了就算了 */ }
  return 'system'
}

/** 系统当前是否暗色。 */
export function systemPrefersDark(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

/** 档位 → 实际明暗（system 档实时跟系统走）。 */
export function effectiveDark(mode: ThemeMode): boolean {
  return mode === 'dark' || (mode === 'system' && systemPrefersDark())
}

/** 把档位落到 <body data-ds-dark-theme>（宿主主题 CSS 的暗色钩子）。 */
export function applyTheme(mode: ThemeMode): void {
  if (effectiveDark(mode)) document.body.setAttribute('data-ds-dark-theme', '')
  else document.body.removeAttribute('data-ds-dark-theme')
}

/** 持久化用户手选的档位。 */
export function saveThemeMode(mode: ThemeMode): void {
  try { localStorage.setItem(THEME_KEY, mode) } catch { /* 同上 */ }
}
