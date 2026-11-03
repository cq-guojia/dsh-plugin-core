// useLocale —— 当前语言 + 宿主切语言时重渲（ui 基础层）。
//
// 核心文案默认就跟随宿主（`<html lang>`，见 utils/i18n.ts 的 getLocale），本 hook 只补「切换后重渲」：
// 宿主语言变了但组件没重渲时，文案会停在上一种语言。组件顶层调一次即可。
import { useEffect, useState } from 'react'
import { getLocale, type Locale } from '../utils/i18n.js'

/** 返回当前语言，并在宿主语言切换（`<html lang>` 变化）时触发重渲。 */
export function useLocale(): Locale {
  const [locale, setLocaleState] = useState<Locale>(getLocale)
  useEffect(() => {
    const observer = new MutationObserver(() => { setLocaleState(getLocale()) })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] })
    return () => { observer.disconnect() }
  }, [])
  return locale
}
