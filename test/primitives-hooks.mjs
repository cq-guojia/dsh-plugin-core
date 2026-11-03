// 测试用解析钩子：把宿主平台包指向本地替身（见 `primitives-stub.mjs`）。
//
// 用法（只在需要的测试文件里，不动 `node --test` 的跑法）：
//   import { register } from 'node:module'
//   register(new URL('./primitives-hooks.mjs', import.meta.url))
//   const { X } = await import('../dist/...')   // 必须在 register 之后动态导入
export async function resolve(specifier, context, nextResolve) {
  if (specifier === '@deepseek-ai/dsh-client-ui-primitives') {
    return { url: new URL('./primitives-stub.mjs', import.meta.url).href, shortCircuit: true }
  }
  return nextResolve(specifier, context)
}
