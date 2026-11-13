import test from 'node:test'
import assert from 'node:assert/strict'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import {
  claimLoadingHost,
  createLoadingSlot,
  LoadingBlock,
  LoadingToast,
  loadingOverlayClass,
  showLoading,
  showToast,
  notify,
  mountToasts,
  connectToasts,
} from '../dist/ui/index.js'
import { LOADING_CSS } from '../dist/ui/feedback/loading-css.generated.js'
import { TOAST_QUEUE_KEY, subscribeToasts } from '../dist/ui/feedback/toast-queue.js'
import { disconnectNotifyBridge } from '../dist/ui/feedback/notify-bridge.js'
import { setLocale, t } from '../dist/utils/index.js'

test('showToast 在无 DOM 环境只投递，不抛', () => {
  assert.equal(typeof document, 'undefined')
  assert.doesNotThrow(() => showToast('hello'))
  assert.doesNotThrow(() => showToast('hello', { variant: 'error', durationMs: 10 }))
})

test('notify 是纯投递：无 DOM 也能拿到载荷（不建界面）；广播的 actions 例外', () => {
  assert.equal(typeof document, 'undefined')
  delete globalThis[TOAST_QUEUE_KEY]
  const seen = []
  const off = subscribeToasts((payload) => seen.push(payload))

  notify('hello', { variant: 'success', description: '附注', position: 'top-center' })
  assert.equal(seen.length, 1)
  assert.equal(seen[0].message, 'hello')
  assert.equal(seen[0].style, 'card')
  assert.equal(seen[0].variant, 'success')
  assert.equal(seen[0].description, '附注')
  assert.equal(seen[0].position, 'top-center', '定位随载荷交给界面，投递侧不自己设')

  assert.doesNotThrow(() => notify('hello', { broadcast: true }))
  assert.equal(seen.length, 2, '无 DOM / 没设默认项目时广播降级成本页提示，消息不丢')
  assert.equal(seen[1].style, 'card')
  // 广播带 actions：函数跨不了页，绕过类型的 JS 调用方当场抛错，不静默丢按钮
  assert.throws(
    () => notify('hello', { broadcast: true, actions: [{ text: '看看', onClick: () => {} }] }),
    /cannot carry actions/,
  )

  // 两个初始化入口在无 DOM 环境都只是跳过，不炸
  assert.doesNotThrow(() => mountToasts())
  assert.doesNotThrow(() => connectToasts())
  // 桥是全局单例：真正退订事件订阅，别把 listener 残留给同文件后续用例
  disconnectNotifyBridge()

  off()
  delete globalThis[TOAST_QUEUE_KEY]
})

test('showLoading 在无 DOM 环境返回空句柄，不抛', () => {
  assert.equal(typeof document, 'undefined')
  const handle = showLoading({ text: '加载中', variant: 'block', mask: true, maskOpacity: 0.4 })
  assert.doesNotThrow(() => handle.close())
  assert.doesNotThrow(() => handle.close()) // 重复关闭无副作用
})

test('loading 宿主跨副本是同一个单例（两处调用不会各冒一个）', () => {
  const a = claimLoadingHost(() => ({ id: 1 }))
  const b = claimLoadingHost(() => ({ id: 2 }))
  assert.equal(b, a)
})

test('加载提示只有一张：后一次顶掉前一次，旧句柄关不掉新卡，且不自动消失', () => {
  const slot = createLoadingSlot()
  const req = (text) => ({
    text,
    variant: 'toast',
    position: 'bottom-center',
    mask: false,
    maskOpacity: 0,
  })

  assert.equal(slot.current(), null, '没调用时不应有任何加载卡')
  const first = slot.show(req('第一次'))
  assert.equal(slot.current().request.text, '第一次')

  const second = slot.show(req('第二次'))
  assert.equal(slot.current().request.text, '第二次', '同时只允许一张卡')
  first.close()
  assert.equal(slot.current().request.text, '第二次', '被顶掉的旧句柄 close 不能误关新卡')

  second.close()
  assert.equal(slot.current(), null)
  second.close() // 重复关闭无副作用
})

test('加载提示七向定位：定位类名与 CSS 六向修饰类一一对得上', () => {
  assert.equal(
    loadingOverlayClass('bottom-center'),
    'dshpc-loading-overlay dshpc-loading-overlay--bottom-center',
  )
  // center 是基础规则的默认对齐，不需要修饰类
  assert.equal(loadingOverlayClass('center'), 'dshpc-loading-overlay dshpc-loading-overlay--center')
  for (const position of ['top-left', 'top-center', 'top-right', 'bottom-left', 'bottom-center', 'bottom-right']) {
    assert.ok(
      LOADING_CSS.includes(`.dshpc-loading-overlay--${position}`),
      `${position} 少了 CSS 修饰类 —— 选了屏位也还是居中`,
    )
  }
})

test('两种加载样式：类名正确、文案可自定义、默认走内置字典', () => {
  setLocale('zh')
  const toast = renderToStaticMarkup(createElement(LoadingToast, null))
  assert.match(toast, /class="dshpc-loading-toast"/)
  // 卡里的转圈不自绘：必须复用 Loader（sm 档 = 16px），环只有 controls/loader.css 一份
  assert.match(toast, /class="dshpc-loader dshpc-loader--ring dshpc-loader--sm"/)
  assert.match(toast, /数据加载中/)
  assert.match(renderToStaticMarkup(createElement(LoadingToast, { text: '正在保存…' })), /正在保存…/)

  const block = renderToStaticMarkup(createElement(LoadingBlock, { text: '处理中' }))
  assert.match(block, /class="dshpc-loading-block"/)
  assert.match(block, /class="dshpc-loader dshpc-loader--ring dshpc-loader--md"/)
  assert.match(block, /处理中/)
  assert.doesNotMatch(block, /数据加载中/)

  setLocale('en')
  assert.match(renderToStaticMarkup(createElement(LoadingToast, null)), /Loading/)
  setLocale('zh')
})

test('反馈件文案自带中英', () => {
  setLocale('zh')
  assert.equal(t('modalClose'), '关闭')
  assert.equal(t('errorRetry'), '重试')
  setLocale('en')
  assert.equal(t('modalClose'), 'Close')
  assert.equal(t('errorRetry'), 'Retry')
  setLocale('zh')
})
