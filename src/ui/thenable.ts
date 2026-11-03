/** 返回值是不是 thenable。Button 的自动 loading 与命令式弹窗的收尾共用这一份判定。 */
export function isThenable(value: unknown): value is PromiseLike<unknown> {
  if (value === null || value === undefined) return false
  return typeof (value as { then?: unknown }).then === 'function'
}
