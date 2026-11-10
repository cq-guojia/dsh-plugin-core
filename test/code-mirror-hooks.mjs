// 测试用解析钩子：CodeMirror 与宿主平台包都指向本地替身。
// 用法：`register(new URL('./code-mirror-hooks.mjs', import.meta.url))` 后再动态 import 产物。
export async function resolve(specifier, context, nextResolve) {
  if (specifier === '@uiw/react-codemirror') {
    return { url: new URL('./code-mirror-stub.mjs', import.meta.url).href, shortCircuit: true }
  }
  if (specifier === '@deepseek-ai/dsh-client-ui-primitives') {
    return { url: new URL('./primitives-stub.mjs', import.meta.url).href, shortCircuit: true }
  }
  return nextResolve(specifier, context)
}
