// Surface（纯框容器）样式 —— **圆角契约的唯一真源**：容器档 = --dshpc-radius-md(12)。
//
// 四根轴（底 / 边 / 圆角 / 内距）全用变量表达，修饰类只改变量，任何消费方规则与它
// 同时命中时都不依赖注入顺序。要加新档：在 surface.css 里加一条只改变量的修饰类。
// 生成物 surface-css.generated.ts 由 scripts/gen-css.mjs 产出，勿手改。
export { SURFACE_CSS } from './surface-css.generated.js'
