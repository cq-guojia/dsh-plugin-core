// `@deepseek-ai/schemastery` 的本地最小类型声明（server 侧声明 Config schema 用）。
//
// 官方 schema 库：运行时由宿主（profile 的 node_modules）解析，故声明为 dependency 而不是
// 本地安装；typecheck 需要类型，又没有包本体 ⇒ 与 primitives.d.ts 同款做法：本地声明子集。
// 只声明本仓实际用到的成员（object / boolean / string / number + default / volatile 等修饰符）。
declare module '@deepseek-ai/schemastery' {
  /** 一个已解析出来的 schema 节点。 */
  interface Schema<T> {
    /** 缺省值：宿主解析缺失配置时补它。 */
    default(value: T): Schema<T>
    /** 标记字段热更新（宿主原位刷新，改完不用重载 entry）；同时决定它进不进设置表单。 */
    volatile(): Schema<T>
    optional(): Schema<T | undefined>
    min(value: number): Schema<T>
    max(value: number): Schema<T>
    step(value: number): Schema<T>
    role(name: string): Schema<T>
    /** 序列化给表单面的 wire schema（dsh-settings 的 `volatileForm()` 消费）。 */
    toJSON(): unknown
  }

  /** 取出一个 schema 节点的推导类型。 */
  type Infer<S> = S extends Schema<infer T> ? T : never

  interface SchemaFactory {
    object<D extends Record<string, unknown>>(dict: D): Schema<{ [K in keyof D]: Infer<D[K]> }>
    boolean(): Schema<boolean>
    string(): Schema<string>
    number(): Schema<number>
  }

  const z: SchemaFactory
  export default z
}
