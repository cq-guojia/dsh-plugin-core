// 官方 primitives 是平台模块（运行时由内核模块表解析），既不在本包依赖里，也拿不到它的 .d.ts。
// 这里只做「能编译」的最小声明：全部按 any 放行；用到它的控件由插件侧的真实类型兜底。
// 本包不强制依赖它 —— 它是 optional peer，只用 utils / design 的插件不必装。
declare module '@deepseek-ai/dsh-client-ui-primitives' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export type MenuEntry = any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const Menu: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const IconChevronDownOutlineRegular: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const IconChevronUpOutlineRegular: any
export const IconArrowUpOutlineRegular: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const Tooltip: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const writeClipboard: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const IconButton: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const Segmented: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export const MarqueeText: any
}
