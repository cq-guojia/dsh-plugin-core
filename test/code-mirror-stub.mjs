import { createElement } from 'react'

// `@uiw/react-codemirror` 的测试替身：Node 里没有 DOM，真 CodeMirror 无法挂载。
// 它把收到的 props 原样记下来，让自检断言「控件实际传下去的开关」，而不是只核对
// 产物里有没有某段字符串。
export default function CodeMirror(props) {
  globalThis.__CM_LAST_PROPS__ = props
  return createElement('div', {
    'data-cm-probe': '1',
    'data-readonly': String(props.readOnly),
    'data-value': props.value,
  })
}
