/** 返回值是不是 thenable。Button 的自动 loading 与命令式弹窗的收尾共用这一份判定。 */
export function isThenable(value) {
    if (value === null || value === undefined)
        return false;
    return typeof value.then === 'function';
}
/**
 * 回调的返回值算不算「成功」（命令式弹窗据此决定关不关）：
 * 只有明确的 `false` 表示这次没成 —— `true` / `undefined` / 别的都照常关。
 * 用返回值表达业务失败，消费方就不必在调用点包 try/catch（错误自己处理、自己提示）。
 */
export function isSuccess(value) {
    return value !== false;
}
//# sourceMappingURL=thenable.js.map